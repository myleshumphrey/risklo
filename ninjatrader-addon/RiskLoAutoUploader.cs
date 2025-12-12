#region Using declarations
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using NinjaTrader.Cbi;
using NinjaTrader.Gui.Tools;
using NinjaTrader.NinjaScript;
#endregion

//This namespace holds AddOns in this folder and is required. Do not change it.
namespace NinjaTrader.NinjaScript.AddOns
{
    /// <summary>
    /// RiskLo Auto Uploader - Watches for CSV exports and automatically uploads to RiskLo
    /// </summary>
    public class RiskLoAutoUploader : AddOnBase
    {
        private const string WATCH_DIRECTORY = @"C:\RiskLoExports\";
        private const string RISKLO_API_URL = "https://risklo-production.up.railway.app/api/upload-csv-auto";
        
        private FileSystemWatcher accountWatcher;
        private FileSystemWatcher strategyWatcher;
        private Window statusWindow;
        private TextBlock statusTextBlock;
        private ListBox uploadHistoryListBox;
        
        private string lastAccountFile = "";
        private string lastStrategyFile = "";
        private DateTime lastUploadAttempt = DateTime.MinValue;
        
        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Name = "RiskLo Auto Uploader";
                Description = "Automatically uploads exported CSVs to RiskLo for analysis";
            }
            else if (State == State.Active)
            {
                // Ensure watch directory exists
                if (!Directory.Exists(WATCH_DIRECTORY))
                {
                    Directory.CreateDirectory(WATCH_DIRECTORY);
                }
                
                // Create status window
                CreateStatusWindow();
                
                // Setup file watchers
                SetupFileWatchers();
                
                // Show status window
                statusWindow.Show();
                
                UpdateStatus("RiskLo Auto Uploader is active. Watching for CSV exports...", false);
            }
            else if (State == State.Terminated)
            {
                // Cleanup
                if (accountWatcher != null)
                {
                    accountWatcher.EnableRaisingEvents = false;
                    accountWatcher.Dispose();
                }
                
                if (strategyWatcher != null)
                {
                    strategyWatcher.EnableRaisingEvents = false;
                    strategyWatcher.Dispose();
                }
                
                if (statusWindow != null && statusWindow.IsLoaded)
                {
                    statusWindow.Close();
                }
            }
        }
        
        private void CreateStatusWindow()
        {
            statusWindow = new Window
            {
                Title = "RiskLo Auto Uploader",
                Width = 600,
                Height = 400,
                WindowStartupLocation = WindowStartupLocation.CenterScreen,
                Background = new SolidColorBrush(Color.FromRgb(30, 30, 30)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            
            var mainPanel = new StackPanel { Margin = new Thickness(15) };
            
            // Header
            var headerText = new TextBlock
            {
                Text = "RiskLo Auto Uploader",
                FontSize = 20,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.LightGreen),
                Margin = new Thickness(0, 0, 0, 10)
            };
            mainPanel.Children.Add(headerText);
            
            // Instructions
            var instructionsText = new TextBlock
            {
                Text = "Export your CSVs from NinjaTrader to:\n" + WATCH_DIRECTORY + "\n\n" +
                       "Files will be automatically uploaded to RiskLo for analysis.",
                FontSize = 12,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10),
                TextWrapping = TextWrapping.Wrap
            };
            mainPanel.Children.Add(instructionsText);
            
            // Status
            var statusLabel = new TextBlock
            {
                Text = "Status:",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 10, 0, 5)
            };
            mainPanel.Children.Add(statusLabel);
            
            statusTextBlock = new TextBlock
            {
                Text = "Initializing...",
                FontSize = 12,
                Foreground = new SolidColorBrush(Colors.Yellow),
                Margin = new Thickness(0, 0, 0, 10),
                TextWrapping = TextWrapping.Wrap
            };
            mainPanel.Children.Add(statusTextBlock);
            
            // Upload History
            var historyLabel = new TextBlock
            {
                Text = "Upload History:",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 10, 0, 5)
            };
            mainPanel.Children.Add(historyLabel);
            
            uploadHistoryListBox = new ListBox
            {
                Height = 150,
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 40)),
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };
            mainPanel.Children.Add(uploadHistoryListBox);
            
            // Manual upload button
            var uploadButton = new Button
            {
                Content = "Upload Latest CSVs Now",
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Color.FromRgb(0, 122, 255)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Cursor = System.Windows.Input.Cursors.Hand
            };
            uploadButton.Click += async (sender, args) => await ManualUpload();
            mainPanel.Children.Add(uploadButton);
            
            statusWindow.Content = mainPanel;
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
            UpdateStatus($"Detected account file: {Path.GetFileName(e.FullPath)}", false);
            CheckAndUpload();
        }
        
        private void OnStrategyFileCreated(object sender, FileSystemEventArgs e)
        {
            lastStrategyFile = e.FullPath;
            UpdateStatus($"Detected strategy file: {Path.GetFileName(e.FullPath)}", false);
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
        
        private async Task ManualUpload()
        {
            UpdateStatus("Searching for latest CSV files...", false);
            
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
                    UpdateStatus("Error: Could not find both account and strategy CSV files.", true);
                    return;
                }
                
                await UploadToRiskLo(accountFiles[0], strategyFiles[0]);
            }
            catch (Exception ex)
            {
                UpdateStatus($"Error during manual upload: {ex.Message}", true);
            }
        }
        
        private async Task UploadToRiskLo(string accountFilePath, string strategyFilePath)
        {
            UpdateStatus("Uploading to RiskLo...", false);
            
            try
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);
                    
                    // Read file contents
                    var accountContent = File.ReadAllText(accountFilePath);
                    var strategyContent = File.ReadAllText(strategyFilePath);
                    
                    // Create JSON payload
                    var jsonPayload = $@"{{
                        ""accountCsv"": {EscapeJsonString(accountContent)},
                        ""strategyCsv"": {EscapeJsonString(strategyContent)}
                    }}";
                    
                    var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                    
                    // Send request
                    var response = await httpClient.PostAsync(RISKLO_API_URL, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();
                        UpdateStatus("✓ Upload successful! RiskLo is processing your data and will email results.", false);
                        AddToHistory($"✓ {DateTime.Now:HH:mm:ss} - Upload successful");
                        
                        // Clear the files to prevent re-upload
                        lastAccountFile = "";
                        lastStrategyFile = "";
                    }
                    else
                    {
                        var errorBody = await response.Content.ReadAsStringAsync();
                        UpdateStatus($"Upload failed: {response.StatusCode} - {errorBody}", true);
                        AddToHistory($"✗ {DateTime.Now:HH:mm:ss} - Upload failed: {response.StatusCode}");
                    }
                }
            }
            catch (Exception ex)
            {
                UpdateStatus($"Upload error: {ex.Message}", true);
                AddToHistory($"✗ {DateTime.Now:HH:mm:ss} - Error: {ex.Message}");
            }
        }
        
        private string EscapeJsonString(string value)
        {
            if (string.IsNullOrEmpty(value))
                return "\"\"";
            
            // Escape special characters for JSON
            value = value.Replace("\\", "\\\\")
                         .Replace("\"", "\\\"")
                         .Replace("\n", "\\n")
                         .Replace("\r", "\\r")
                         .Replace("\t", "\\t");
            
            return "\"" + value + "\"";
        }
        
        private void UpdateStatus(string message, bool isError)
        {
            if (statusWindow != null && statusWindow.Dispatcher.CheckAccess())
            {
                statusTextBlock.Text = message;
                statusTextBlock.Foreground = new SolidColorBrush(isError ? Colors.Red : Colors.LightGreen);
            }
            else if (statusWindow != null)
            {
                statusWindow.Dispatcher.Invoke(() =>
                {
                    statusTextBlock.Text = message;
                    statusTextBlock.Foreground = new SolidColorBrush(isError ? Colors.Red : Colors.LightGreen);
                });
            }
        }
        
        private void AddToHistory(string message)
        {
            if (statusWindow != null && statusWindow.Dispatcher.CheckAccess())
            {
                uploadHistoryListBox.Items.Insert(0, message);
                if (uploadHistoryListBox.Items.Count > 10)
                {
                    uploadHistoryListBox.Items.RemoveAt(10);
                }
            }
            else if (statusWindow != null)
            {
                statusWindow.Dispatcher.Invoke(() =>
                {
                    uploadHistoryListBox.Items.Insert(0, message);
                    if (uploadHistoryListBox.Items.Count > 10)
                    {
                        uploadHistoryListBox.Items.RemoveAt(10);
                    }
                });
            }
        }
    }
}

