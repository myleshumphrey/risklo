using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RiskLoWatcher
{
    /// <summary>
    /// RiskLo Watcher - Standalone desktop app that watches for CSV exports and auto-uploads to RiskLo
    /// </summary>
    public class RiskLoWatcherApp : ApplicationContext
    {
        private const string WATCH_DIRECTORY = @"C:\RiskLoExports\";
        private const string RISKLO_API_URL = "https://risklo-production.up.railway.app/api/upload-csv-auto";
        private const string SETTINGS_FILE = @"C:\RiskLoExports\settings.json";
        
        private NotifyIcon trayIcon;
        private FileSystemWatcher accountWatcher;
        private FileSystemWatcher strategyWatcher; // Kept for compatibility but not used
        private ContextMenuStrip contextMenu;
        
        private List<(string filePath, DateTime timestamp)> recentAccountFiles = new List<(string, DateTime)>();
        private List<(string filePath, DateTime timestamp)> recentStrategyFiles = new List<(string, DateTime)>();
        private DateTime lastUploadAttempt = DateTime.MinValue;
        private HashSet<string> uploadedFiles = new HashSet<string>(); // Track uploaded files to prevent duplicates
        
        private List<string> uploadHistory = new List<string>();
        private string userEmail = "";
        
        private const int FILE_MATCH_WINDOW_SECONDS = 30; // Match files created within 30 seconds
        private const int FILE_READY_DELAY_MS = 5000; // Wait 5 seconds after second file is detected
        
        public RiskLoWatcherApp()
        {
            // Ensure watch directory exists
            if (!Directory.Exists(WATCH_DIRECTORY))
            {
                Directory.CreateDirectory(WATCH_DIRECTORY);
            }
            
            // Load settings (email)
            LoadSettings();
            
            // Create system tray icon
            InitializeTrayIcon();
            
            // Setup file watchers
            SetupFileWatchers();
            
            ShowNotification("RiskLo Watcher Started", "Watching for CSV exports...", ToolTipIcon.Info);
        }
        
        private void LoadSettings()
        {
            try
            {
                if (File.Exists(SETTINGS_FILE))
                {
                    var json = File.ReadAllText(SETTINGS_FILE);
                    var settings = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json);
                    if (settings != null && settings.ContainsKey("email"))
                    {
                        userEmail = settings["email"];
                        Console.WriteLine($"Loaded email: {userEmail}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading settings: {ex.Message}");
            }
        }
        
        private void SaveSettings()
        {
            try
            {
                var settings = new Dictionary<string, string>
                {
                    { "email", userEmail }
                };
                var json = System.Text.Json.JsonSerializer.Serialize(settings);
                File.WriteAllText(SETTINGS_FILE, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving settings: {ex.Message}");
            }
        }
        
        private void InitializeTrayIcon()
        {
            // Create custom icon with "R" in purple gradient
            Icon customIcon = CreateCustomIcon();
            
            // Create context menu with dark theme styling
            contextMenu = new ContextMenuStrip();
            contextMenu.BackColor = Color.FromArgb(10, 14, 39); // #0a0e27
            contextMenu.ForeColor = Color.White;
            contextMenu.Renderer = new DarkMenuRenderer();
            
            // Title
            var titleItem = new ToolStripLabel("RiskLo Watcher")
            {
                Font = new Font("Segoe UI", 9, FontStyle.Bold),
                ForeColor = Color.FromArgb(102, 126, 234) // #667eea
            };
            contextMenu.Items.Add(titleItem);
            contextMenu.Items.Add(new ToolStripSeparator());
            
            // Status items
            var statusItem = new ToolStripLabel("Status: Active")
            {
                Font = new Font("Segoe UI", 8),
                ForeColor = Color.FromArgb(16, 185, 129) // Green for active
            };
            contextMenu.Items.Add(statusItem);
            
            var watchItem = new ToolStripLabel($"Watching: {WATCH_DIRECTORY}")
            {
                Font = new Font("Segoe UI", 8),
                ForeColor = Color.FromArgb(255, 255, 255, 180) // Semi-transparent white
            };
            contextMenu.Items.Add(watchItem);
            contextMenu.Items.Add(new ToolStripSeparator());
            
            // Action items
            AddMenuItem("Upload Latest CSVs Now", OnManualUpload);
            AddMenuItem("View Upload History", OnViewHistory);
            AddMenuItem("Open Watch Folder", OnOpenFolder);
            contextMenu.Items.Add(new ToolStripSeparator());
            AddMenuItem("Set Email Address", OnSetEmail);
            contextMenu.Items.Add(new ToolStripSeparator());
            AddMenuItem("Exit", OnExit);
            
            // Create tray icon
            trayIcon = new NotifyIcon()
            {
                Icon = customIcon,
                ContextMenuStrip = contextMenu,
                Visible = true,
                Text = "RiskLo Watcher - Active"
            };
            
            trayIcon.DoubleClick += OnTrayIconDoubleClick;
        }
        
        private void AddMenuItem(string text, EventHandler clickHandler)
        {
            var item = new ToolStripMenuItem(text)
            {
                Font = new Font("Segoe UI", 9),
                ForeColor = Color.White,
                BackColor = Color.FromArgb(10, 14, 39)
            };
            item.Click += clickHandler;
            contextMenu.Items.Add(item);
        }
        
        private Icon CreateCustomIcon()
        {
            // Create a 16x16 icon (standard system tray size)
            int size = 16;
            Bitmap bitmap = new Bitmap(size, size);
            Graphics g = Graphics.FromImage(bitmap);
            
            try
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.TextRenderingHint = TextRenderingHint.AntiAlias;
                
                // Dark background matching website
                g.Clear(Color.FromArgb(10, 14, 39)); // #0a0e27
                
                // Draw "R" with purple color matching website
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(102, 126, 234))) // #667eea
                {
                    // Use a bold font
                    using (Font font = new Font("Segoe UI", 11, FontStyle.Bold, GraphicsUnit.Pixel))
                    {
                        StringFormat format = new StringFormat
                        {
                            Alignment = StringAlignment.Center,
                            LineAlignment = StringAlignment.Center
                        };
                        
                        // Draw "R" centered
                        RectangleF rect = new RectangleF(0, 0, size, size);
                        g.DrawString("R", font, brush, rect, format);
                    }
                }
                
                // Convert bitmap to icon
                IntPtr hIcon = bitmap.GetHicon();
                Icon icon = Icon.FromHandle(hIcon);
                
                // Create a copy so we can dispose the original
                Icon iconCopy = (Icon)icon.Clone();
                DestroyIcon(hIcon); // Clean up the handle
                
                return iconCopy;
            }
            finally
            {
                g.Dispose();
                bitmap.Dispose();
            }
        }
        
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern bool DestroyIcon(IntPtr handle);
        
        // Custom renderer for dark theme menu
        private class DarkMenuRenderer : ToolStripProfessionalRenderer
        {
            public DarkMenuRenderer() : base(new DarkColorTable()) { }
        }
        
        private class DarkColorTable : ProfessionalColorTable
        {
            public override Color MenuItemSelected => Color.FromArgb(102, 126, 234); // #667eea
            public override Color MenuItemSelectedGradientBegin => Color.FromArgb(102, 126, 234);
            public override Color MenuItemSelectedGradientEnd => Color.FromArgb(118, 75, 162); // #764ba2
            public override Color MenuItemBorder => Color.FromArgb(102, 126, 234);
            public override Color MenuItemPressedGradientBegin => Color.FromArgb(118, 75, 162);
            public override Color MenuItemPressedGradientEnd => Color.FromArgb(102, 126, 234);
            public override Color SeparatorDark => Color.FromArgb(255, 255, 255, 25); // rgba(255,255,255,0.1)
            public override Color SeparatorLight => Color.FromArgb(255, 255, 255, 25);
            public override Color ToolStripDropDownBackground => Color.FromArgb(10, 14, 39); // #0a0e27
            public override Color ImageMarginGradientBegin => Color.FromArgb(10, 14, 39);
            public override Color ImageMarginGradientMiddle => Color.FromArgb(10, 14, 39);
            public override Color ImageMarginGradientEnd => Color.FromArgb(10, 14, 39);
        }
        
        private void SetupFileWatchers()
        {
            // Watch for ALL CSV files (we'll detect type by content)
            accountWatcher = new FileSystemWatcher(WATCH_DIRECTORY)
            {
                Filter = "*.csv",
                NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite | NotifyFilters.CreationTime,
                EnableRaisingEvents = true
            };
            accountWatcher.Created += OnCsvFileCreated;
            accountWatcher.Changed += OnCsvFileCreated;
            
            // Use the same watcher for both (we detect by content)
            strategyWatcher = null; // Not needed anymore
        }
        
        private void OnCsvFileCreated(object sender, FileSystemEventArgs e)
        {
            var filePath = e.FullPath;
            var timestamp = DateTime.Now;
            
            // Skip if already uploaded
            if (uploadedFiles.Contains(filePath))
            {
                return;
            }
            
            // Detect CSV type by reading the file contents
            Task.Run(async () => await ProcessCsvFile(filePath, timestamp));
        }
        
        private async Task ProcessCsvFile(string filePath, DateTime timestamp)
        {
            try
            {
                // Wait a bit for file to be fully written
                await Task.Delay(1000);
                
                // Check if file exists and is readable
                if (!File.Exists(filePath))
                {
                    return;
                }
                
                // Read first line to detect type
                string firstLine;
                using (var reader = new StreamReader(filePath))
                {
                    firstLine = await reader.ReadLineAsync();
                }
                
                if (string.IsNullOrEmpty(firstLine))
                {
                    return; // Empty file, skip
                }
                
                // Detect CSV type based on headers (same logic as website)
                var csvType = DetectCsvType(firstLine);
                
                if (csvType == "accounts")
                {
                    // Add to account files list
                    recentAccountFiles.Add((filePath, timestamp));
                    recentAccountFiles.RemoveAll(f => (DateTime.Now - f.timestamp).TotalMinutes > 2);
                    UpdateTrayText($"Account CSV detected: {Path.GetFileName(filePath)}");
                    
                    // Check for matching strategy file
                    await CheckForMatchingPair();
                }
                else if (csvType == "strategies")
                {
                    // Add to strategy files list
                    recentStrategyFiles.Add((filePath, timestamp));
                    recentStrategyFiles.RemoveAll(f => (DateTime.Now - f.timestamp).TotalMinutes > 2);
                    UpdateTrayText($"Strategy CSV detected: {Path.GetFileName(filePath)}");
                    
                    // Check for matching account file
                    await CheckForMatchingPair();
                }
                else
                {
                    // Unknown type - try to guess from filename as fallback
                    var fileName = Path.GetFileName(filePath).ToLower();
                    if (fileName.Contains("account") || fileName.Contains("accont") || fileName.Contains("acct"))
                    {
                        recentAccountFiles.Add((filePath, timestamp));
                        recentAccountFiles.RemoveAll(f => (DateTime.Now - f.timestamp).TotalMinutes > 2);
                        UpdateTrayText($"Account CSV detected (by filename): {Path.GetFileName(filePath)}");
                        await CheckForMatchingPair();
                    }
                    else if (fileName.Contains("strateg") || fileName.Contains("strategy") || fileName.Contains("strat"))
                    {
                        recentStrategyFiles.Add((filePath, timestamp));
                        recentStrategyFiles.RemoveAll(f => (DateTime.Now - f.timestamp).TotalMinutes > 2);
                        UpdateTrayText($"Strategy CSV detected (by filename): {Path.GetFileName(filePath)}");
                        await CheckForMatchingPair();
                    }
                    else
                    {
                        UpdateTrayText($"Unknown CSV type: {Path.GetFileName(filePath)}");
                    }
                }
            }
            catch (Exception ex)
            {
                // File might be locked, try again later
                Console.WriteLine($"Error processing CSV file {filePath}: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Detects CSV file type based on headers (same logic as website)
        /// </summary>
        private string DetectCsvType(string firstLine)
        {
            if (string.IsNullOrEmpty(firstLine))
            {
                return "unknown";
            }
            
            var headers = firstLine.ToLower();
            
            // Account CSV: must have "display name" AND "net liquidation"
            if (headers.Contains("display name") && headers.Contains("net liquidation"))
            {
                return "accounts";
            }
            
            // Strategy CSV: must have "strategy" AND "instrument"
            if (headers.Contains("strategy") && headers.Contains("instrument"))
            {
                return "strategies";
            }
            
            return "unknown";
        }
        
        private async Task CheckForMatchingPair()
        {
            // Wait a bit to ensure the file is fully written
            await Task.Delay(FILE_READY_DELAY_MS);
            
            // Prevent duplicate uploads within 10 seconds
            if ((DateTime.Now - lastUploadAttempt).TotalSeconds < 10)
            {
                return;
            }
            
            // Find matching pairs (files created within the time window)
            foreach (var accountFile in recentAccountFiles)
            {
                // Skip if already uploaded
                if (uploadedFiles.Contains(accountFile.filePath))
                {
                    continue;
                }
                
                // Check if file exists and is not empty
                if (!File.Exists(accountFile.filePath))
                {
                    continue;
                }
                
                var accountInfo = new FileInfo(accountFile.filePath);
                if (accountInfo.Length == 0)
                {
                    continue;
                }
                
                // Find matching strategy file (created within time window)
                var matchingStrategy = recentStrategyFiles
                    .Where(s => !uploadedFiles.Contains(s.filePath))
                    .Where(s => File.Exists(s.filePath))
                    .Where(s => new FileInfo(s.filePath).Length > 0)
                    .Where(s => Math.Abs((s.timestamp - accountFile.timestamp).TotalSeconds) <= FILE_MATCH_WINDOW_SECONDS)
                    .OrderBy(s => Math.Abs((s.timestamp - accountFile.timestamp).TotalSeconds))
                    .FirstOrDefault();
                
                if (matchingStrategy.filePath != null)
                {
                    // Found a matching pair!
                    lastUploadAttempt = DateTime.Now;
                    
                    // Mark both files as uploaded
                    uploadedFiles.Add(accountFile.filePath);
                    uploadedFiles.Add(matchingStrategy.filePath);
                    
                    // Remove from recent lists
                    recentAccountFiles.RemoveAll(f => f.filePath == accountFile.filePath);
                    recentStrategyFiles.RemoveAll(f => f.filePath == matchingStrategy.filePath);
                    
                    UpdateTrayText("Uploading matched CSV pair...");
                    await UploadToRiskLo(accountFile.filePath, matchingStrategy.filePath);
                    return; // Only upload one pair at a time
                }
            }
            
            // If no match found, update status
            if (recentAccountFiles.Count > 0 && recentStrategyFiles.Count > 0)
            {
                UpdateTrayText("Waiting for matching CSV pair...");
            }
        }
        
        private async void OnManualUpload(object sender, EventArgs e)
        {
            try
            {
                // Find all CSV files and detect their types
                var allCsvFiles = Directory.GetFiles(WATCH_DIRECTORY, "*.csv")
                    .Where(f => !uploadedFiles.Contains(f))
                    .Where(f => new FileInfo(f).Length > 0)
                    .OrderByDescending(f => new FileInfo(f).LastWriteTime)
                    .ToList();
                
                if (allCsvFiles.Count == 0)
                {
                    ShowNotification("No Files Found", "Could not find any CSV files that haven't been uploaded.", ToolTipIcon.Error);
                    return;
                }
                
                // Detect types for all files
                var accountFiles = new List<string>();
                var strategyFiles = new List<string>();
                
                foreach (var file in allCsvFiles)
                {
                    try
                    {
                        using (var reader = new StreamReader(file))
                        {
                            var firstLine = await reader.ReadLineAsync();
                            if (!string.IsNullOrEmpty(firstLine))
                            {
                                var csvType = DetectCsvType(firstLine);
                                if (csvType == "accounts")
                                {
                                    accountFiles.Add(file);
                                }
                                else if (csvType == "strategies")
                                {
                                    strategyFiles.Add(file);
                                }
                            }
                        }
                    }
                    catch
                    {
                        // Skip files we can't read
                        continue;
                    }
                }
                
                if (accountFiles.Count == 0 || strategyFiles.Count == 0)
                {
                    ShowNotification("No Matching Files", "Could not find both account and strategy CSV files. Please ensure you have exported both files.", ToolTipIcon.Warning);
                    return;
                }
                
                // Match files by timestamp (within 30 seconds)
                var accountFile = accountFiles[0];
                var accountTime = new FileInfo(accountFile).LastWriteTime;
                
                var matchingStrategy = strategyFiles
                    .Where(s => Math.Abs((new FileInfo(s).LastWriteTime - accountTime).TotalSeconds) <= FILE_MATCH_WINDOW_SECONDS)
                    .OrderBy(s => Math.Abs((new FileInfo(s).LastWriteTime - accountTime).TotalSeconds))
                    .FirstOrDefault();
                
                if (matchingStrategy == null)
                {
                    ShowNotification("No Matching Pair", $"Found account file but no strategy file created within {FILE_MATCH_WINDOW_SECONDS} seconds. Please export both files together.", ToolTipIcon.Warning);
                    return;
                }
                
                // Mark as uploaded
                uploadedFiles.Add(accountFile);
                uploadedFiles.Add(matchingStrategy);
                
                await UploadToRiskLo(accountFile, matchingStrategy);
            }
            catch (Exception ex)
            {
                ShowNotification("Upload Error", ex.Message, ToolTipIcon.Error);
            }
        }
        
        private async Task UploadToRiskLo(string accountFilePath, string strategyFilePath)
        {
            UpdateTrayText("Uploading to RiskLo...");
            
            try
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    
                    // Read file contents
                    var accountContent = File.ReadAllText(accountFilePath);
                    var strategyContent = File.ReadAllText(strategyFilePath);
                    
                    // Create JSON payload with file names
                    var payload = new
                    {
                        accountCsv = accountContent,
                        strategyCsv = strategyContent,
                        userEmail = string.IsNullOrEmpty(userEmail) ? null : userEmail,
                        accountCsvFileName = Path.GetFileName(accountFilePath),
                        strategyCsvFileName = Path.GetFileName(strategyFilePath)
                    };
                    
                    var json = System.Text.Json.JsonSerializer.Serialize(payload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    // Send request
                    var response = await httpClient.PostAsync(RISKLO_API_URL, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();
                        ShowNotification("Upload Successful!", "RiskLo is processing your data. Check your email for results.", ToolTipIcon.Info);
                        AddToHistory($"✓ {DateTime.Now:HH:mm:ss} - Upload successful (both CSVs)");
                        UpdateTrayText("RiskLo Watcher - Active");
                    }
                    else
                    {
                        var errorBody = await response.Content.ReadAsStringAsync();
                        ShowNotification("Upload Failed", $"Status: {response.StatusCode}\n{errorBody}", ToolTipIcon.Error);
                        AddToHistory($"✗ {DateTime.Now:HH:mm:ss} - Upload failed: {response.StatusCode}");
                        UpdateTrayText("RiskLo Watcher - Active");
                    }
                }
            }
            catch (Exception ex)
            {
                ShowNotification("Upload Error", ex.Message, ToolTipIcon.Error);
                AddToHistory($"✗ {DateTime.Now:HH:mm:ss} - Error: {ex.Message}");
                UpdateTrayText("RiskLo Watcher - Active");
            }
        }
        
        private void OnViewHistory(object sender, EventArgs e)
        {
            var history = uploadHistory.Count > 0 
                ? string.Join("\n", uploadHistory.Take(10))
                : "No uploads yet.";
            
            MessageBox.Show(
                history,
                "Upload History",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
        }
        
        private void OnOpenFolder(object sender, EventArgs e)
        {
            try
            {
                System.Diagnostics.Process.Start("explorer.exe", WATCH_DIRECTORY);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Could not open folder: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        
        private void OnSetEmail(object sender, EventArgs e)
        {
            var currentEmail = string.IsNullOrEmpty(userEmail) ? "" : userEmail;
            var input = Microsoft.VisualBasic.Interaction.InputBox(
                "Enter your RiskLo email address to receive risk analysis results:",
                "Set Email Address",
                currentEmail
            );
            
            if (!string.IsNullOrEmpty(input))
            {
                userEmail = input.Trim();
                SaveSettings();
                MessageBox.Show(
                    $"Email address saved: {userEmail}\n\nYou will now receive risk analysis results via email.",
                    "Email Set",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
        }
        
        private void OnTrayIconDoubleClick(object sender, EventArgs e)
        {
            var emailStatus = string.IsNullOrEmpty(userEmail) 
                ? "No email set (right-click → Set Email Address)" 
                : $"Email: {userEmail}";
            
            MessageBox.Show(
                $"RiskLo Watcher is running.\n\n" +
                $"Watching: {WATCH_DIRECTORY}\n" +
                $"{emailStatus}\n\n" +
                $"Export your CSVs to this folder and they will be automatically uploaded to RiskLo.\n\n" +
                $"Right-click the tray icon for more options.",
                "RiskLo Watcher",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
        }
        
        private void OnExit(object sender, EventArgs e)
        {
            // Cleanup
            accountWatcher?.Dispose();
            strategyWatcher?.Dispose(); // Safe even if null
            trayIcon.Visible = false;
            Application.Exit();
        }
        
        private void ShowNotification(string title, string message, ToolTipIcon icon)
        {
            trayIcon.ShowBalloonTip(3000, title, message, icon);
        }
        
        private void UpdateTrayText(string text)
        {
            if (text.Length > 63)
            {
                text = text.Substring(0, 60) + "...";
            }
            trayIcon.Text = text;
        }
        
        private void AddToHistory(string message)
        {
            uploadHistory.Insert(0, message);
            if (uploadHistory.Count > 20)
            {
                uploadHistory.RemoveAt(20);
            }
        }
    }
    
    /// <summary>
    /// Main entry point
    /// </summary>
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new RiskLoWatcherApp());
        }
    }
}

