using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net.Http;
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
        private FileSystemWatcher strategyWatcher;
        private ContextMenuStrip contextMenu;
        
        private string lastAccountFile = "";
        private string lastStrategyFile = "";
        private DateTime lastUploadAttempt = DateTime.MinValue;
        
        private List<string> uploadHistory = new List<string>();
        private string userEmail = "";
        
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
            // Create context menu
            contextMenu = new ContextMenuStrip();
            contextMenu.Items.Add("RiskLo Watcher", null, null).Enabled = false;
            contextMenu.Items.Add(new ToolStripSeparator());
            contextMenu.Items.Add("Status: Active", null, null).Enabled = false;
            contextMenu.Items.Add($"Watching: {WATCH_DIRECTORY}", null, null).Enabled = false;
            contextMenu.Items.Add(new ToolStripSeparator());
            contextMenu.Items.Add("Upload Latest CSVs Now", null, OnManualUpload);
            contextMenu.Items.Add("View Upload History", null, OnViewHistory);
            contextMenu.Items.Add("Open Watch Folder", null, OnOpenFolder);
            contextMenu.Items.Add(new ToolStripSeparator());
            contextMenu.Items.Add("Set Email Address", null, OnSetEmail);
            contextMenu.Items.Add(new ToolStripSeparator());
            contextMenu.Items.Add("Exit", null, OnExit);
            
            // Create tray icon
            trayIcon = new NotifyIcon()
            {
                Icon = SystemIcons.Application, // You can replace with custom icon
                ContextMenuStrip = contextMenu,
                Visible = true,
                Text = "RiskLo Watcher - Active"
            };
            
            trayIcon.DoubleClick += OnTrayIconDoubleClick;
        }
        
        private void SetupFileWatchers()
        {
            // Watch for account CSV files
            accountWatcher = new FileSystemWatcher(WATCH_DIRECTORY)
            {
                Filter = "*account*.csv",
                NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite | NotifyFilters.CreationTime,
                EnableRaisingEvents = true
            };
            accountWatcher.Created += OnAccountFileCreated;
            accountWatcher.Changed += OnAccountFileCreated;
            
            // Watch for strategy CSV files
            strategyWatcher = new FileSystemWatcher(WATCH_DIRECTORY)
            {
                Filter = "*strat*.csv",
                NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite | NotifyFilters.CreationTime,
                EnableRaisingEvents = true
            };
            strategyWatcher.Created += OnStrategyFileCreated;
            strategyWatcher.Changed += OnStrategyFileCreated;
        }
        
        private void OnAccountFileCreated(object sender, FileSystemEventArgs e)
        {
            lastAccountFile = e.FullPath;
            UpdateTrayText($"Account file detected: {Path.GetFileName(e.FullPath)}");
            CheckAndUpload();
        }
        
        private void OnStrategyFileCreated(object sender, FileSystemEventArgs e)
        {
            lastStrategyFile = e.FullPath;
            UpdateTrayText($"Strategy file detected: {Path.GetFileName(e.FullPath)}");
            CheckAndUpload();
        }
        
        private async void CheckAndUpload()
        {
            // Wait a bit to ensure both files are ready
            await Task.Delay(2000);
            
            // Check if we have both files
            if (!string.IsNullOrEmpty(lastAccountFile) && !string.IsNullOrEmpty(lastStrategyFile))
            {
                // Prevent duplicate uploads within 5 seconds
                if ((DateTime.Now - lastUploadAttempt).TotalSeconds < 5)
                {
                    return;
                }
                
                lastUploadAttempt = DateTime.Now;
                
                // Check if files exist and are not empty
                if (File.Exists(lastAccountFile) && File.Exists(lastStrategyFile))
                {
                    var accountInfo = new FileInfo(lastAccountFile);
                    var strategyInfo = new FileInfo(lastStrategyFile);
                    
                    if (accountInfo.Length > 0 && strategyInfo.Length > 0)
                    {
                        await UploadToRiskLo(lastAccountFile, lastStrategyFile);
                    }
                }
            }
        }
        
        private async void OnManualUpload(object sender, EventArgs e)
        {
            try
            {
                // Find the most recent account and strategy files
                var accountFiles = Directory.GetFiles(WATCH_DIRECTORY, "*account*.csv")
                    .OrderByDescending(f => new FileInfo(f).LastWriteTime)
                    .ToList();
                    
                var strategyFiles = Directory.GetFiles(WATCH_DIRECTORY, "*strat*.csv")
                    .OrderByDescending(f => new FileInfo(f).LastWriteTime)
                    .ToList();
                
                if (accountFiles.Count == 0 || strategyFiles.Count == 0)
                {
                    ShowNotification("No Files Found", "Could not find both account and strategy CSV files.", ToolTipIcon.Error);
                    return;
                }
                
                await UploadToRiskLo(accountFiles[0], strategyFiles[0]);
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
                    
                    // Create JSON payload
                    var payload = new
                    {
                        accountCsv = accountContent,
                        strategyCsv = strategyContent,
                        userEmail = string.IsNullOrEmpty(userEmail) ? null : userEmail
                    };
                    
                    var json = System.Text.Json.JsonSerializer.Serialize(payload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    // Send request
                    var response = await httpClient.PostAsync(RISKLO_API_URL, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();
                        ShowNotification("Upload Successful!", "RiskLo is processing your data. Check your email for results.", ToolTipIcon.Info);
                        AddToHistory($"✓ {DateTime.Now:HH:mm:ss} - Upload successful");
                        UpdateTrayText("RiskLo Watcher - Active");
                        
                        // Clear the files to prevent re-upload
                        lastAccountFile = "";
                        lastStrategyFile = "";
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
            strategyWatcher?.Dispose();
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

