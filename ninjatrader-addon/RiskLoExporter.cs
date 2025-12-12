#region Using declarations
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;
using System.Globalization;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Chart;
using NinjaTrader.Gui.SuperDom;
using NinjaTrader.Gui.Tools;
using NinjaTrader.Data;
using NinjaTrader.NinjaScript;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.NinjaScript.Indicators;
using NinjaTrader.NinjaScript.DrawingTools;
#endregion

//This namespace holds AddOns in this folder and is required. Do not change it.
namespace NinjaTrader.NinjaScript.AddOns
{
    /// <summary>
    /// RiskLoExporter - Exports account and strategy data to CSV files for RiskLo risk analysis
    /// </summary>
    public class RiskLoExporter : Window
    {
        #region Private Fields
        private const string EXPORT_DIRECTORY = @"C:\RiskLoExports\";
        private const string SETTINGS_FILE = @"C:\RiskLoExports\risklo_exporter_settings.json";
        
        private ComboBox accountComboBox;
        private TextBox trailingDrawdownTextBox;
        private DataGrid strategyDataGrid;
        private Button addRowButton;
        private Button removeRowButton;
        private Button exportButton;
        private CheckBox autoExportCheckBox;
        private TextBox autoExportTimeTextBox;
        private TextBlock statusTextBlock;
        private TextBlock lastExportTextBlock;
        
        private Dictionary<string, double> accountTrailingDrawdowns = new Dictionary<string, double>();
        private List<StrategyRow> strategyRows = new List<StrategyRow>();
        private DispatcherTimer autoExportTimer;
        private DateTime? lastExportTime = null;
        private string lastExportPath = "";
        #endregion

        #region Constructor
        public RiskLoExporter()
        {
            InitializeComponent();
            LoadSettings();
            SetupAutoExport();
        }
        #endregion

        #region UI Initialization
        private void InitializeComponent()
        {
            this.Title = "RiskLo Exporter";
            this.Width = 800;
            this.Height = 700;
            this.WindowStartupLocation = WindowStartupLocation.CenterScreen;
            this.Background = new SolidColorBrush(Color.FromRgb(30, 30, 30));
            this.Foreground = new SolidColorBrush(Colors.White);

            var mainPanel = new StackPanel { Margin = new Thickness(15) };

            // Account Selection Section
            var accountSection = new GroupBox
            {
                Header = "Account Selection",
                Margin = new Thickness(0, 0, 0, 10),
                Foreground = new SolidColorBrush(Colors.White),
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 40))
            };
            var accountPanel = new StackPanel { Margin = new Thickness(10) };
            
            accountPanel.Children.Add(new TextBlock 
            { 
                Text = "Select Account:", 
                Margin = new Thickness(0, 0, 0, 5),
                Foreground = new SolidColorBrush(Colors.White)
            });
            
            accountComboBox = new ComboBox 
            { 
                Margin = new Thickness(0, 0, 0, 10),
                Background = new SolidColorBrush(Color.FromRgb(50, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            accountComboBox.SelectionChanged += AccountComboBox_SelectionChanged;
            accountPanel.Children.Add(accountComboBox);
            
            accountPanel.Children.Add(new TextBlock 
            { 
                Text = "Trailing Max Drawdown ($):", 
                Margin = new Thickness(0, 0, 0, 5),
                Foreground = new SolidColorBrush(Colors.White)
            });
            
            trailingDrawdownTextBox = new TextBox 
            { 
                Margin = new Thickness(0, 0, 0, 10),
                Background = new SolidColorBrush(Color.FromRgb(50, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            trailingDrawdownTextBox.TextChanged += TrailingDrawdownTextBox_TextChanged;
            accountPanel.Children.Add(trailingDrawdownTextBox);
            
            accountSection.Content = accountPanel;
            mainPanel.Children.Add(accountSection);

            // Strategy Configuration Section
            var strategySection = new GroupBox
            {
                Header = "Strategy Configuration",
                Margin = new Thickness(0, 0, 0, 10),
                Foreground = new SolidColorBrush(Colors.White),
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 40))
            };
            var strategyPanel = new StackPanel { Margin = new Thickness(10) };
            
            strategyDataGrid = new DataGrid
            {
                AutoGenerateColumns = false,
                CanUserAddRows = false,
                Margin = new Thickness(0, 0, 0, 10),
                Background = new SolidColorBrush(Color.FromRgb(50, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White),
                HeadersVisibility = DataGridHeadersVisibility.Column,
                Height = 200
            };
            
            strategyDataGrid.Columns.Add(new DataGridTextColumn 
            { 
                Header = "Strategy", 
                Binding = new System.Windows.Data.Binding("Strategy"),
                Width = new DataGridLength(1, DataGridLengthUnitType.Star)
            });
            strategyDataGrid.Columns.Add(new DataGridComboBoxColumn 
            { 
                Header = "Instrument",
                SelectedItemBinding = new System.Windows.Data.Binding("Instrument"),
                ItemsSource = new List<string> { "NQ", "MNQ" }
            });
            strategyDataGrid.Columns.Add(new DataGridTextColumn 
            { 
                Header = "Account Display Name", 
                Binding = new System.Windows.Data.Binding("AccountDisplayName"),
                IsReadOnly = true,
                Width = new DataGridLength(1, DataGridLengthUnitType.Star)
            });
            
            strategyDataGrid.ItemsSource = strategyRows;
            strategyPanel.Children.Add(strategyDataGrid);
            
            var buttonPanel = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 0, 0, 10) };
            
            addRowButton = new Button 
            { 
                Content = "Add Row", 
                Margin = new Thickness(0, 0, 10, 0),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Color.FromRgb(0, 120, 215)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            addRowButton.Click += AddRowButton_Click;
            buttonPanel.Children.Add(addRowButton);
            
            removeRowButton = new Button 
            { 
                Content = "Remove Selected Row", 
                Margin = new Thickness(0, 0, 10, 0),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Color.FromRgb(200, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            removeRowButton.Click += RemoveRowButton_Click;
            buttonPanel.Children.Add(removeRowButton);
            
            strategyPanel.Children.Add(buttonPanel);
            strategySection.Content = strategyPanel;
            mainPanel.Children.Add(strategySection);

            // Export Controls Section
            var exportSection = new GroupBox
            {
                Header = "Export Controls",
                Margin = new Thickness(0, 0, 0, 10),
                Foreground = new SolidColorBrush(Colors.White),
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 40))
            };
            var exportPanel = new StackPanel { Margin = new Thickness(10) };
            
            exportButton = new Button 
            { 
                Content = "Export CSVs Now", 
                Margin = new Thickness(0, 0, 0, 10),
                Padding = new Thickness(15, 8, 15, 8),
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Background = new SolidColorBrush(Color.FromRgb(0, 150, 0)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            exportButton.Click += ExportButton_Click;
            exportPanel.Children.Add(exportButton);
            
            var autoExportPanel = new StackPanel { Orientation = Orientation.Horizontal };
            autoExportCheckBox = new CheckBox 
            { 
                Content = "Auto export daily at:", 
                Margin = new Thickness(0, 0, 10, 0),
                Foreground = new SolidColorBrush(Colors.White),
                VerticalContentAlignment = VerticalAlignment.Center
            };
            autoExportPanel.Children.Add(autoExportCheckBox);
            
            autoExportTimeTextBox = new TextBox 
            { 
                Text = "17:05", 
                Width = 60,
                Background = new SolidColorBrush(Color.FromRgb(50, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            autoExportPanel.Children.Add(autoExportTimeTextBox);
            
            exportPanel.Children.Add(autoExportPanel);
            exportSection.Content = exportPanel;
            mainPanel.Children.Add(exportSection);

            // Status Section
            var statusSection = new GroupBox
            {
                Header = "Status",
                Margin = new Thickness(0, 0, 0, 10),
                Foreground = new SolidColorBrush(Colors.White),
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 40))
            };
            var statusPanel = new StackPanel { Margin = new Thickness(10) };
            
            statusTextBlock = new TextBlock 
            { 
                Text = "Ready", 
                Foreground = new SolidColorBrush(Colors.LightGreen),
                Margin = new Thickness(0, 0, 0, 5)
            };
            statusPanel.Children.Add(statusTextBlock);
            
            lastExportTextBlock = new TextBlock 
            { 
                Text = "Last export: Never", 
                Foreground = new SolidColorBrush(Colors.LightGray),
                TextWrapping = TextWrapping.Wrap
            };
            statusPanel.Children.Add(lastExportTextBlock);
            
            statusSection.Content = statusPanel;
            mainPanel.Children.Add(statusSection);

            this.Content = new ScrollViewer 
            { 
                Content = mainPanel,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto
            };

            LoadAccounts();
        }
        #endregion

        #region Account Management
        private void LoadAccounts()
        {
            accountComboBox.Items.Clear();
            
            try
            {
                var accounts = Account.All.Where(a => a != null).ToList();
                foreach (var account in accounts)
                {
                    accountComboBox.Items.Add(account.DisplayName);
                }
                
                if (accountComboBox.Items.Count > 0)
                {
                    accountComboBox.SelectedIndex = 0;
                }
            }
            catch (Exception ex)
            {
                UpdateStatus($"Error loading accounts: {ex.Message}", isError: true);
            }
        }

        private void AccountComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (accountComboBox.SelectedItem != null)
            {
                string accountName = accountComboBox.SelectedItem.ToString();
                
                // Load saved trailing drawdown for this account
                if (accountTrailingDrawdowns.ContainsKey(accountName))
                {
                    trailingDrawdownTextBox.Text = accountTrailingDrawdowns[accountName].ToString("F2");
                }
                else
                {
                    trailingDrawdownTextBox.Text = "";
                }
                
                // Update account display name in strategy rows
                UpdateStrategyAccountNames(accountName);
            }
        }

        private void TrailingDrawdownTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (accountComboBox.SelectedItem != null)
            {
                string accountName = accountComboBox.SelectedItem.ToString();
                if (double.TryParse(trailingDrawdownTextBox.Text, out double value))
                {
                    accountTrailingDrawdowns[accountName] = value;
                    SaveSettings();
                }
            }
        }

        private void UpdateStrategyAccountNames(string accountName)
        {
            foreach (var row in strategyRows)
            {
                row.AccountDisplayName = accountName;
            }
            strategyDataGrid.Items.Refresh();
        }
        #endregion

        #region Strategy Management
        private void AddRowButton_Click(object sender, RoutedEventArgs e)
        {
            string accountName = accountComboBox.SelectedItem?.ToString() ?? "";
            strategyRows.Add(new StrategyRow 
            { 
                Strategy = "", 
                Instrument = "NQ", 
                AccountDisplayName = accountName 
            });
            strategyDataGrid.Items.Refresh();
            SaveSettings();
        }

        private void RemoveRowButton_Click(object sender, RoutedEventArgs e)
        {
            if (strategyDataGrid.SelectedItem != null)
            {
                strategyRows.Remove(strategyDataGrid.SelectedItem as StrategyRow);
                strategyDataGrid.Items.Refresh();
                SaveSettings();
            }
        }
        #endregion

        #region Export Functions
        private async void ExportButton_Click(object sender, RoutedEventArgs e)
        {
            await Task.Run(() => ExportCsvs());
        }

        private void ExportCsvs()
        {
            try
            {
                Dispatcher.Invoke(() => UpdateStatus("Exporting...", isError: false));
                
                // Ensure export directory exists
                if (!Directory.Exists(EXPORT_DIRECTORY))
                {
                    Directory.CreateDirectory(EXPORT_DIRECTORY);
                }

                string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                
                // Export Accounts CSV
                string accountsFilePath = Path.Combine(EXPORT_DIRECTORY, $"RiskLo_Accounts_{timestamp}.csv");
                ExportAccountsCsv(accountsFilePath);
                
                // Export Strategies CSV
                string strategiesFilePath = Path.Combine(EXPORT_DIRECTORY, $"RiskLo_Strategies_{timestamp}.csv");
                ExportStrategiesCsv(strategiesFilePath);
                
                lastExportTime = DateTime.Now;
                lastExportPath = EXPORT_DIRECTORY;
                
                Dispatcher.Invoke(() =>
                {
                    UpdateStatus("Export completed successfully!", isError: false);
                    lastExportTextBlock.Text = $"Last export: {lastExportTime.Value:yyyy-MM-dd HH:mm:ss}\nPath: {lastExportPath}";
                    SaveSettings();
                });
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() => UpdateStatus($"Export error: {ex.Message}", isError: true));
            }
        }

        private void ExportAccountsCsv(string filePath)
        {
            var csv = new StringBuilder();
            
            // Header
            csv.AppendLine("Display name,Net liquidation,Trailing max drawdown");
            
            // Get all accounts
            var accounts = Account.All.Where(a => a != null).ToList();
            
            foreach (var account in accounts)
            {
                string displayName = account.DisplayName ?? "";
                
                // Get net liquidation value
                double netLiquidation = 0;
                try
                {
                    // Try to get AccountItem.NetLiquidation (returns double directly)
                    netLiquidation = account.Get(AccountItem.NetLiquidation, Currency.UsDollar);
                    
                    // If NetLiquidation is 0 or invalid, fallback to CashValue
                    if (netLiquidation == 0)
                    {
                        netLiquidation = account.Get(AccountItem.CashValue, Currency.UsDollar);
                    }
                }
                catch (Exception ex)
                {
                    // Log warning but continue
                    Dispatcher.Invoke(() => 
                        UpdateStatus($"Warning: Could not get Net Liquidation for {displayName}: {ex.Message}", isError: false));
                }
                
                // Get trailing max drawdown (from saved settings)
                double trailingDrawdown = 0;
                if (accountTrailingDrawdowns.ContainsKey(displayName))
                {
                    trailingDrawdown = accountTrailingDrawdowns[displayName];
                }
                
                // Round down to 2 decimal places
                netLiquidation = Math.Floor(netLiquidation * 100) / 100;
                trailingDrawdown = Math.Floor(trailingDrawdown * 100) / 100;
                
                csv.AppendLine($"{EscapeCsvValue(displayName)},{netLiquidation:F2},{trailingDrawdown:F2}");
            }
            
            File.WriteAllText(filePath, csv.ToString());
        }

        private void ExportStrategiesCsv(string filePath)
        {
            var csv = new StringBuilder();
            
            // Header
            csv.AppendLine("Strategy,Instrument,Account display name");
            
            // Export strategy rows
            foreach (var row in strategyRows)
            {
                if (!string.IsNullOrWhiteSpace(row.Strategy))
                {
                    // Normalize instrument to NQ or MNQ
                    string instrument = "NQ";
                    if (row.Instrument != null && row.Instrument.ToUpper().Contains("MNQ"))
                    {
                        instrument = "MNQ";
                    }
                    else if (row.Instrument != null && row.Instrument.ToUpper().Contains("NQ"))
                    {
                        instrument = "NQ";
                    }
                    
                    csv.AppendLine($"{EscapeCsvValue(row.Strategy)},{instrument},{EscapeCsvValue(row.AccountDisplayName)}");
                }
            }
            
            File.WriteAllText(filePath, csv.ToString());
        }

        private string EscapeCsvValue(string value)
        {
            if (string.IsNullOrEmpty(value))
                return "";
            
            // If value contains comma, quote, or newline, wrap in quotes and escape quotes
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
            {
                return "\"" + value.Replace("\"", "\"\"") + "\"";
            }
            
            return value;
        }
        #endregion

        #region Auto Export
        private void SetupAutoExport()
        {
            autoExportTimer = new DispatcherTimer();
            autoExportTimer.Interval = TimeSpan.FromMinutes(1); // Check every minute
            autoExportTimer.Tick += AutoExportTimer_Tick;
            autoExportTimer.Start();
        }

        private void AutoExportTimer_Tick(object sender, EventArgs e)
        {
            if (autoExportCheckBox.IsChecked == true)
            {
                try
                {
                    if (TimeSpan.TryParse(autoExportTimeTextBox.Text, out TimeSpan exportTime))
                    {
                        DateTime now = DateTime.Now;
                        DateTime targetTime = now.Date.Add(exportTime);
                        
                        // If target time has passed today, schedule for tomorrow
                        if (targetTime < now)
                        {
                            targetTime = targetTime.AddDays(1);
                        }
                        
                        // Check if we should export now (within 1 minute window)
                        if (Math.Abs((now - targetTime).TotalMinutes) < 1)
                        {
                            // Only export once per day
                            if (lastExportTime == null || lastExportTime.Value.Date < now.Date)
                            {
                                Task.Run(() => ExportCsvs());
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Dispatcher.Invoke(() => UpdateStatus($"Auto-export error: {ex.Message}", isError: true));
                }
            }
        }
        #endregion

        #region Settings Persistence
        private void LoadSettings()
        {
            try
            {
                if (File.Exists(SETTINGS_FILE))
                {
                    string json = File.ReadAllText(SETTINGS_FILE);
                    var settings = DeserializeSettings(json);
                    
                    if (settings != null)
                    {
                        accountTrailingDrawdowns = settings.AccountTrailingDrawdowns ?? new Dictionary<string, double>();
                        strategyRows = settings.StrategyRows ?? new List<StrategyRow>();
                        lastExportTime = settings.LastExportTime;
                        lastExportPath = settings.LastExportPath ?? "";
                        
                        if (settings.AutoExportTime != null)
                        {
                            autoExportTimeTextBox.Text = settings.AutoExportTime;
                        }
                        
                        if (lastExportTime.HasValue)
                        {
                            Dispatcher.Invoke(() =>
                            {
                                lastExportTextBlock.Text = $"Last export: {lastExportTime.Value:yyyy-MM-dd HH:mm:ss}\nPath: {lastExportPath}";
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                UpdateStatus($"Error loading settings: {ex.Message}", isError: true);
            }
        }

        private void SaveSettings()
        {
            try
            {
                if (!Directory.Exists(EXPORT_DIRECTORY))
                {
                    Directory.CreateDirectory(EXPORT_DIRECTORY);
                }
                
                var settings = new ExporterSettings
                {
                    AccountTrailingDrawdowns = accountTrailingDrawdowns,
                    StrategyRows = strategyRows,
                    LastExportTime = lastExportTime,
                    LastExportPath = lastExportPath,
                    AutoExportTime = autoExportTimeTextBox.Text
                };
                
                string json = SerializeSettings(settings);
                File.WriteAllText(SETTINGS_FILE, json);
            }
            catch (Exception ex)
            {
                UpdateStatus($"Error saving settings: {ex.Message}", isError: true);
            }
        }

        // Simple JSON serialization without external dependencies
        private string SerializeSettings(ExporterSettings settings)
        {
            var sb = new StringBuilder();
            sb.AppendLine("{");
            sb.AppendLine("  \"AccountTrailingDrawdowns\": {");
            
            bool first = true;
            foreach (var kvp in settings.AccountTrailingDrawdowns)
            {
                if (!first) sb.AppendLine(",");
                sb.Append($"    \"{EscapeJson(kvp.Key)}\": {kvp.Value.ToString("F2", CultureInfo.InvariantCulture)}");
                first = false;
            }
            sb.AppendLine();
            sb.AppendLine("  },");
            sb.AppendLine("  \"StrategyRows\": [");
            
            first = true;
            foreach (var row in settings.StrategyRows)
            {
                if (!first) sb.AppendLine(",");
                sb.AppendLine("    {");
                sb.AppendLine($"      \"Strategy\": \"{EscapeJson(row.Strategy)}\",");
                sb.AppendLine($"      \"Instrument\": \"{EscapeJson(row.Instrument)}\",");
                sb.AppendLine($"      \"AccountDisplayName\": \"{EscapeJson(row.AccountDisplayName)}\"");
                sb.Append("    }");
                first = false;
            }
            sb.AppendLine();
            sb.AppendLine("  ],");
            
            if (settings.LastExportTime.HasValue)
            {
                sb.AppendLine($"  \"LastExportTime\": \"{settings.LastExportTime.Value:yyyy-MM-ddTHH:mm:ss}\",");
            }
            else
            {
                sb.AppendLine("  \"LastExportTime\": null,");
            }
            
            sb.AppendLine($"  \"LastExportPath\": \"{EscapeJson(settings.LastExportPath ?? "")}\",");
            sb.AppendLine($"  \"AutoExportTime\": \"{EscapeJson(settings.AutoExportTime ?? "17:05")}\"");
            sb.AppendLine("}");
            
            return sb.ToString();
        }

        private ExporterSettings DeserializeSettings(string json)
        {
            try
            {
                var settings = new ExporterSettings();
                
                // Simple JSON parsing (basic implementation)
                // Parse AccountTrailingDrawdowns
                int drawdownsStart = json.IndexOf("\"AccountTrailingDrawdowns\":");
                if (drawdownsStart >= 0)
                {
                    int braceStart = json.IndexOf('{', drawdownsStart);
                    int braceEnd = json.IndexOf('}', braceStart);
                    if (braceStart >= 0 && braceEnd > braceStart)
                    {
                        string drawdownsJson = json.Substring(braceStart + 1, braceEnd - braceStart - 1);
                        var parts = drawdownsJson.Split(',');
                        foreach (var part in parts)
                        {
                            if (string.IsNullOrWhiteSpace(part)) continue;
                            var kvp = part.Split(':');
                            if (kvp.Length == 2)
                            {
                                string key = UnescapeJson(kvp[0].Trim().Trim('"'));
                                if (double.TryParse(kvp[1].Trim(), NumberStyles.Float, CultureInfo.InvariantCulture, out double value))
                                {
                                    settings.AccountTrailingDrawdowns[key] = value;
                                }
                            }
                        }
                    }
                }
                
                // Parse StrategyRows
                int rowsStart = json.IndexOf("\"StrategyRows\":");
                if (rowsStart >= 0)
                {
                    int bracketStart = json.IndexOf('[', rowsStart);
                    int bracketEnd = json.LastIndexOf(']');
                    if (bracketStart >= 0 && bracketEnd > bracketStart)
                    {
                        string rowsJson = json.Substring(bracketStart + 1, bracketEnd - bracketStart - 1);
                        int pos = 0;
                        while (pos < rowsJson.Length)
                        {
                            int objStart = rowsJson.IndexOf('{', pos);
                            if (objStart < 0) break;
                            int objEnd = rowsJson.IndexOf('}', objStart);
                            if (objEnd < 0) break;
                            
                            string rowJson = rowsJson.Substring(objStart, objEnd - objStart + 1);
                            var row = new StrategyRow();
                            
                            int stratStart = rowJson.IndexOf("\"Strategy\":");
                            if (stratStart >= 0)
                            {
                                int quoteStart = rowJson.IndexOf('"', stratStart + 11) + 1;
                                int quoteEnd = rowJson.IndexOf('"', quoteStart);
                                if (quoteEnd > quoteStart)
                                {
                                    row.Strategy = UnescapeJson(rowJson.Substring(quoteStart, quoteEnd - quoteStart));
                                }
                            }
                            
                            int instStart = rowJson.IndexOf("\"Instrument\":");
                            if (instStart >= 0)
                            {
                                int quoteStart = rowJson.IndexOf('"', instStart + 14) + 1;
                                int quoteEnd = rowJson.IndexOf('"', quoteStart);
                                if (quoteEnd > quoteStart)
                                {
                                    row.Instrument = UnescapeJson(rowJson.Substring(quoteStart, quoteEnd - quoteStart));
                                }
                            }
                            
                            int accStart = rowJson.IndexOf("\"AccountDisplayName\":");
                            if (accStart >= 0)
                            {
                                int quoteStart = rowJson.IndexOf('"', accStart + 22) + 1;
                                int quoteEnd = rowJson.IndexOf('"', quoteStart);
                                if (quoteEnd > quoteStart)
                                {
                                    row.AccountDisplayName = UnescapeJson(rowJson.Substring(quoteStart, quoteEnd - quoteStart));
                                }
                            }
                            
                            settings.StrategyRows.Add(row);
                            pos = objEnd + 1;
                        }
                    }
                }
                
                // Parse LastExportTime
                int timeStart = json.IndexOf("\"LastExportTime\":");
                if (timeStart >= 0)
                {
                    int nullStart = json.IndexOf("null", timeStart);
                    if (nullStart >= 0 && nullStart < timeStart + 50)
                    {
                        settings.LastExportTime = null;
                    }
                    else
                    {
                        int quoteStart = json.IndexOf('"', timeStart) + 1;
                        int quoteEnd = json.IndexOf('"', quoteStart);
                        if (quoteEnd > quoteStart)
                        {
                            string timeStr = json.Substring(quoteStart, quoteEnd - quoteStart);
                            if (DateTime.TryParse(timeStr, out DateTime time))
                            {
                                settings.LastExportTime = time;
                            }
                        }
                    }
                }
                
                // Parse LastExportPath
                int pathStart = json.IndexOf("\"LastExportPath\":");
                if (pathStart >= 0)
                {
                    int quoteStart = json.IndexOf('"', pathStart) + 1;
                    int quoteEnd = json.IndexOf('"', quoteStart);
                    if (quoteEnd > quoteStart)
                    {
                        settings.LastExportPath = UnescapeJson(json.Substring(quoteStart, quoteEnd - quoteStart));
                    }
                }
                
                // Parse AutoExportTime
                int autoTimeStart = json.IndexOf("\"AutoExportTime\":");
                if (autoTimeStart >= 0)
                {
                    int quoteStart = json.IndexOf('"', autoTimeStart) + 1;
                    int quoteEnd = json.IndexOf('"', quoteStart);
                    if (quoteEnd > quoteStart)
                    {
                        settings.AutoExportTime = UnescapeJson(json.Substring(quoteStart, quoteEnd - quoteStart));
                    }
                }
                
                return settings;
            }
            catch
            {
                return new ExporterSettings();
            }
        }

        private string EscapeJson(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
        }

        private string UnescapeJson(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            return value.Replace("\\\"", "\"").Replace("\\\\", "\\").Replace("\\n", "\n").Replace("\\r", "\r").Replace("\\t", "\t");
        }
        #endregion

        #region UI Helpers
        private void UpdateStatus(string message, bool isError)
        {
            statusTextBlock.Text = message;
            statusTextBlock.Foreground = new SolidColorBrush(isError ? Colors.Red : Colors.LightGreen);
        }
        #endregion

        #region Helper Classes
        public class StrategyRow
        {
            public string Strategy { get; set; } = "";
            public string Instrument { get; set; } = "NQ";
            public string AccountDisplayName { get; set; } = "";
        }

        public class ExporterSettings
        {
            public Dictionary<string, double> AccountTrailingDrawdowns { get; set; } = new Dictionary<string, double>();
            public List<StrategyRow> StrategyRows { get; set; } = new List<StrategyRow>();
            public DateTime? LastExportTime { get; set; }
            public string LastExportPath { get; set; } = "";
            public string AutoExportTime { get; set; } = "17:05";
        }
        #endregion
        
        /// <summary>
        /// Static method to show the RiskLo Exporter window
        /// Call this from NinjaScript Editor or any script
        /// </summary>
        public static void ShowWindow()
        {
            var window = new RiskLoExporter();
            window.Show();
        }
    }
    
    /// <summary>
    /// Helper AddOn class to launch RiskLo Exporter automatically
    /// </summary>
    public class RiskLoExporterLauncher : AddOnBase
    {
        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Name = "RiskLo Exporter Launcher";
                Description = "Launches the RiskLo Exporter window automatically when NinjaTrader starts";
            }
            else if (State == State.Active)
            {
                // Auto-launch the window when AddOn loads
                RiskLoExporter.ShowWindow();
            }
        }
    }

}

