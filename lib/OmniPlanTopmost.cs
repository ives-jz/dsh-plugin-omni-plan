using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Script.Serialization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Effects;
using Ellipse = System.Windows.Shapes.Ellipse;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using Microsoft.Win32;
using System.Text.RegularExpressions;

namespace OmniPlanTopmost
{
    public enum ThemeMode
    {
        Dark,
        Light
    }

    public class ThemePalette
    {
        public bool IsDark { get; set; }
        public string WindowBgStart { get; set; }
        public string WindowBgEnd { get; set; }
        public string WindowBorder { get; set; }
        public string CardBg { get; set; }
        public string CardBorder { get; set; }
        public string CardNextBg { get; set; }
        public string CardNextBorder { get; set; }
        public string TextPrimary { get; set; }
        public string TextSecondary { get; set; }
        public string TextMuted { get; set; }
        public string ButtonBg { get; set; }
        public string ButtonHoverBg { get; set; }
        public string ButtonHoverBorder { get; set; }
        public string ButtonPressedBg { get; set; }
        public string ButtonBorder { get; set; }
        public string ButtonFg { get; set; }
        public string ButtonActiveBg { get; set; }
        public string ButtonActiveFg { get; set; }
        public string ButtonActiveBorder { get; set; }
        public string InputBg { get; set; }
        public string InputBorder { get; set; }
        public string InputFocusBorder { get; set; }
        public string TabContainerBg { get; set; }
        public string TabContainerBorder { get; set; }
        public string TabActiveBg { get; set; }
        public string TabActiveBorder { get; set; }
        public string TabActiveFg { get; set; }
        public string TabInactiveFg { get; set; }
        public string BadgeActiveBg { get; set; }
        public string BadgeActiveFg { get; set; }
        public string BadgeInactiveBg { get; set; }
        public string BadgeInactiveFg { get; set; }

        public string CopyBtnBg { get; set; }
        public string CopyBtnBorder { get; set; }
        public string CopyBtnFg { get; set; }
        public string DeleteBtnBg { get; set; }
        public string DeleteBtnBorder { get; set; }
        public string DeleteBtnFg { get; set; }

        public string ModalOverlayBg { get; set; }
        public string ModalPanelBg { get; set; }
        public string ModalPanelBorder { get; set; }

        public string MenuBg { get; set; }
        public string MenuBorder { get; set; }
        public string MenuItemHoverBg { get; set; }
        public string MenuItemDangerHoverBg { get; set; }
        public string MenuItemDangerFg { get; set; }

        public static ThemePalette CreateDark()
        {
            return new ThemePalette
            {
                IsDark = true,
                WindowBgStart = "#17171C",
                WindowBgEnd = "#101014",
                WindowBorder = "#2E2E36",
                CardBg = "#1C1C22",
                CardBorder = "#2A2A33",
                CardNextBg = "#22222A",
                CardNextBorder = "#3A3A46",
                TextPrimary = "#F5F5F5",
                TextSecondary = "#A3A3A3",
                TextMuted = "#666666",
                ButtonBg = "#222228",
                ButtonHoverBg = "#2E2E36",
                ButtonHoverBorder = "#454552",
                ButtonPressedBg = "#383844",
                ButtonBorder = "#383842",
                ButtonFg = "#D4D4D4",
                ButtonActiveBg = "#FFFFFF",
                ButtonActiveFg = "#0A0A0A",
                ButtonActiveBorder = "#FFFFFF",
                InputBg = "#16161B",
                InputBorder = "#2A2A34",
                InputFocusBorder = "#6366F1",
                TabContainerBg = "#121216",
                TabContainerBorder = "#25252D",
                TabActiveBg = "#FFFFFF",
                TabActiveBorder = "#FFFFFF",
                TabActiveFg = "#0A0A0A",
                TabInactiveFg = "#888888",
                BadgeActiveBg = "#18181D",
                BadgeActiveFg = "#FFFFFF",
                BadgeInactiveBg = "#25252D",
                BadgeInactiveFg = "#A3A3A3",

                CopyBtnBg = "#13251A",
                CopyBtnBorder = "#1B432A",
                CopyBtnFg = "#22C55E",
                DeleteBtnBg = "#261416",
                DeleteBtnBorder = "#4A1E24",
                DeleteBtnFg = "#EF4444",

                ModalOverlayBg = "#B3000000",
                ModalPanelBg = "#1C1C22",
                ModalPanelBorder = "#383844",

                MenuBg = "#1E1E24",
                MenuBorder = "#343440",
                MenuItemHoverBg = "#2C2C36",
                MenuItemDangerHoverBg = "#3D171C",
                MenuItemDangerFg = "#F87171"
            };
        }

        public static ThemePalette CreateLight()
        {
            return new ThemePalette
            {
                IsDark = false,
                WindowBgStart = "#FAFAFB",
                WindowBgEnd = "#F3F3F6",
                WindowBorder = "#D4D4DC",
                CardBg = "#FFFFFF",
                CardBorder = "#E4E4EB",
                CardNextBg = "#F8FAFC",
                CardNextBorder = "#CBD5E1",
                TextPrimary = "#18181B",
                TextSecondary = "#52525B",
                TextMuted = "#71717A",
                ButtonBg = "#F4F4F6",
                ButtonHoverBg = "#E4E4EC",
                ButtonHoverBorder = "#CBD5E1",
                ButtonPressedBg = "#D8D8E2",
                ButtonBorder = "#D4D4DC",
                ButtonFg = "#27272A",
                ButtonActiveBg = "#18181B",
                ButtonActiveFg = "#FAFAFA",
                ButtonActiveBorder = "#18181B",
                InputBg = "#FFFFFF",
                InputBorder = "#D4D4DC",
                InputFocusBorder = "#6366F1",
                TabContainerBg = "#E5E5EA",
                TabContainerBorder = "#D5D5DC",
                TabActiveBg = "#18181B",
                TabActiveBorder = "#18181B",
                TabActiveFg = "#FAFAFA",
                TabInactiveFg = "#71717A",
                BadgeActiveBg = "#27272A",
                BadgeActiveFg = "#FAFAFA",
                BadgeInactiveBg = "#D4D4DC",
                BadgeInactiveFg = "#52525B",

                CopyBtnBg = "#F0FDF4",
                CopyBtnBorder = "#BBF7D0",
                CopyBtnFg = "#16A34A",
                DeleteBtnBg = "#FEF2F2",
                DeleteBtnBorder = "#FECACA",
                DeleteBtnFg = "#DC2626",

                ModalOverlayBg = "#88000000",
                ModalPanelBg = "#FFFFFF",
                ModalPanelBorder = "#D4D4DC",

                MenuBg = "#FFFFFF",
                MenuBorder = "#E2E2E8",
                MenuItemHoverBg = "#F2F2F6",
                MenuItemDangerHoverBg = "#FEE2E2",
                MenuItemDangerFg = "#EF4444"
            };
        }
    }

    public class Options
    {
        public string BaseUrl { get; set; }
        public string ReadyFile { get; set; }
        public string LogFile { get; set; }
        public double Width { get; set; }
        public double Height { get; set; }

        public Options()
        {
            BaseUrl = "http://127.0.0.1:2685/omni-plan";
            Width = 420;
            Height = 700;
        }

        public static Options Parse(string[] args)
        {
            Options options = new Options();
            for (int i = 0; i < args.Length; i++)
            {
                string arg = args[i];
                if (arg == "--base-url" && i + 1 < args.Length)
                {
                    options.BaseUrl = args[++i];
                }
                else if (arg == "--ready-file" && i + 1 < args.Length)
                {
                    options.ReadyFile = args[++i];
                }
                else if (arg == "--log-file" && i + 1 < args.Length)
                {
                    options.LogFile = args[++i];
                }
                else if (arg == "--width" && i + 1 < args.Length)
                {
                    double w;
                    if (double.TryParse(args[++i], NumberStyles.Any, CultureInfo.InvariantCulture, out w))
                    {
                        options.Width = Math.Max(340, Math.Min(1600, w));
                    }
                }
                else if (arg == "--height" && i + 1 < args.Length)
                {
                    double h;
                    if (double.TryParse(args[++i], NumberStyles.Any, CultureInfo.InvariantCulture, out h))
                    {
                        options.Height = Math.Max(440, Math.Min(2000, h));
                    }
                }
            }
            return options;
        }
    }

    public class PlanApi
    {
        private readonly string _baseUrl;
        private readonly JavaScriptSerializer _serializer;

        public PlanApi(string baseUrl)
        {
            _baseUrl = (baseUrl ?? "http://127.0.0.1:2685/omni-plan").TrimEnd('/');
            _serializer = new JavaScriptSerializer();
        }

        public string Get(string path)
        {
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(_baseUrl + path);
            req.Method = "GET";
            req.Timeout = 4000;
            using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
            using (Stream stream = res.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
            {
                return reader.ReadToEnd();
            }
        }

        public string Post(string path, object body)
        {
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(_baseUrl + path);
            req.Method = "POST";
            req.ContentType = "application/json; charset=utf-8";
            req.Timeout = 5000;
            string json = _serializer.Serialize(body);
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            req.ContentLength = bytes.Length;
            using (Stream stream = req.GetRequestStream())
            {
                stream.Write(bytes, 0, bytes.Length);
            }
            using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
            using (Stream stream = res.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
            {
                return reader.ReadToEnd();
            }
        }

        public string Patch(string path, object body)
        {
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(_baseUrl + path);
            req.Method = "PATCH";
            req.ContentType = "application/json; charset=utf-8";
            req.Timeout = 5000;
            string json = _serializer.Serialize(body);
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            req.ContentLength = bytes.Length;
            using (Stream stream = req.GetRequestStream())
            {
                stream.Write(bytes, 0, bytes.Length);
            }
            using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
            using (Stream stream = res.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
            {
                return reader.ReadToEnd();
            }
        }

        public string Delete(string path)
        {
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(_baseUrl + path);
            req.Method = "DELETE";
            req.Timeout = 5000;
            using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
            using (Stream stream = res.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
            {
                return reader.ReadToEnd();
            }
        }
    }

    public class TaskItem
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public string RemindAt { get; set; }
        public string DueAt { get; set; }
        public string Notes { get; set; }
        public string CreatedAt { get; set; }
        public string UpdatedAt { get; set; }
    }

    public class ContextItem
    {
        public string Id { get; set; }
        public string Workspace { get; set; }
        public string AgentStatus { get; set; }
        public string CurrentDoing { get; set; }
        public string NextActionForHuman { get; set; }
        public string UpdatedAt { get; set; }
    }

    public class IdeaItem
    {
        public string Id { get; set; }
        public string Content { get; set; }
        public string CreatedAt { get; set; }
    }

    public class PlanState
    {
        public int Revision { get; set; }
        public List<ContextItem> ActiveContexts { get; set; }
        public List<TaskItem> Tasks { get; set; }
        public List<IdeaItem> Inbox { get; set; }

        public PlanState()
        {
            ActiveContexts = new List<ContextItem>();
            Tasks = new List<TaskItem>();
            Inbox = new List<IdeaItem>();
        }
    }

    public class MainWindow : Window
    {
        [DllImport("user32.dll")]
        private static extern IntPtr DefWindowProc(IntPtr hWnd, int uMsg, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

        [DllImport("user32.dll")]
        private static extern bool OpenClipboard(IntPtr hWndNewOwner);

        [DllImport("user32.dll")]
        private static extern bool CloseClipboard();

        [DllImport("user32.dll")]
        private static extern bool EmptyClipboard();

        [DllImport("user32.dll")]
        private static extern IntPtr SetClipboardData(uint uFormat, IntPtr hMem);

        [DllImport("kernel32.dll")]
        private static extern IntPtr GlobalAlloc(uint uFlags, UIntPtr dwBytes);

        [DllImport("kernel32.dll")]
        private static extern IntPtr GlobalLock(IntPtr hMem);

        [DllImport("kernel32.dll")]
        private static extern bool GlobalUnlock(IntPtr hMem);

        private const int GWL_STYLE = -16;
        private const int GWL_EXSTYLE = -20;
        private const int WS_EX_TOOLWINDOW = 0x00000080;
        private const int WS_MAXIMIZEBOX = 0x00010000;

        private const int WM_NCHITTEST = 0x0084;
        private const int WM_SYSCOMMAND = 0x0112;
        private const int WM_SETTINGCHANGE = 0x001A;
        private const int SC_MAXIMIZE = 0xF030;

        private const int HTCLIENT = 1;
        private const int HTLEFT = 10;
        private const int HTRIGHT = 11;
        private const int HTTOP = 12;
        private const int HTTOPLEFT = 13;
        private const int HTTOPRIGHT = 14;
        private const int HTBOTTOM = 15;
        private const int HTBOTTOMLEFT = 16;
        private const int HTBOTTOMRIGHT = 17;

        private const uint GMEM_MOVEABLE = 0x0002;
        private const uint CF_UNICODETEXT = 13;

        private readonly Options _options;
        private readonly PlanApi _api;
        private PlanState _state = new PlanState();
        private DispatcherTimer _pollTimer;
        private bool _isClosing = false;
        private bool _isRefreshing = false;

        private ThemeMode _themeMode = ThemeMode.Dark;
        private ThemePalette _palette;

        private string _activeTab = ""; // "focus", "tasks", "inbox"

        // 顶层主容器与全局引用
        private Grid _windowContainer;
        private Border _themeTransitionOverlay;
        private Border _rootBorder;
        private Grid _rootGrid;
        private Grid _mainContentGrid;

        private TextBlock _brandTitle;
        private Border _brandLogoHost;
        private Button _themeToggleButton;
        private Button _closeButton;

        // Tabs
        private Border _tabsContainer;
        private Border _tabIndicator;
        private TranslateTransform _tabIndicatorTransform;

        private Button _tabFocusBtn;
        private Button _tabTasksBtn;
        private Button _tabInboxBtn;
        private Border _tabFocusBadge;
        private Border _tabTasksBadge;
        private Border _tabInboxBadge;
        private TextBlock _tabFocusBadgeText;
        private TextBlock _tabTasksBadgeText;
        private TextBlock _tabInboxBadgeText;
        private TextBlock _tabFocusText;
        private TextBlock _tabTasksText;
        private TextBlock _tabInboxText;

        // 面板区域
        private Grid _contentGrid;
        private Grid _focusPanel;
        private Grid _taskPanel;
        private Grid _inboxPanel;

        private ScrollViewer _focusScroll;
        private ScrollViewer _taskScroll;
        private ScrollViewer _ideaScroll;

        private StackPanel _focusList;
        private StackPanel _taskList;
        private StackPanel _ideaList;

        // 任务与闪念自适应长文本输入卡片
        private Border _taskInputContainer;
        private TextBox _taskInput;
        private Button _priDropdownBtn;
        private Border _priDropdownBadgeBorder;
        private TextBlock _priDropdownBadgeText;
        private TextBlock _priDropdownLabelText;
        private TextBlock _priDropdownArrowText;
        private Popup _priDropdownPopup;
        private Border _priDropdownMenuBorder;
        private Button[] _priDropdownMenuItems = new Button[6];
        private TextBlock[] _priDropdownMenuLabels = new TextBlock[6];
        private TextBlock[] _priDropdownMenuChecks = new TextBlock[6];
        private string _selectedTaskPriority = "p3";
        private Button _addTaskButton;
        private TextBlock _taskInputHint;

        private enum TaskSortMode
        {
            Auto,   // 智能自动排序: 未完成在前，按 P0~P5 紧急程度，同级按创建时间先后
            Manual  // 手动排序: 允许拖拽上下换位或点击箭头微调
        }
        private TaskSortMode _taskSortMode = TaskSortMode.Auto;
        private Point _dragStartPoint;
        private TaskItem _draggedTask;

        private Border _ideaInputContainer;
        private TextBox _ideaInput;
        private Button _addIdeaButton;
        private TextBlock _ideaInputHint;

        // 底栏
        private Border _versionBadge;
        private TextBlock _versionText;
        private Button _dshTaskButton;
        private Button _summaryButton;
        private Button _importButton;
        private TextBlock _copyStatus;
        private OrganizeWindow _organizeWindow;

        // 删除确认弹窗 (全窗口 100% 覆盖)
        private Border _confirmOverlay;
        private Border _confirmPanel;
        private TextBlock _confirmTitle;
        private TextBlock _confirmText;
        private Button _confirmCancelBtn;
        private Button _confirmYesBtn;
        private string _pendingKind = "";
        private string _pendingId = "";

        // 沉浸式大编辑模态弹窗 (全窗口 100% 覆盖)
        private Border _editModalOverlay;
        private Border _editModalPanel;
        private TextBlock _editModalTitle;
        private Button _editModalHeaderCloseBtn;

        // 任务编辑专用部分 (支持 P0 ~ P5 6级常用优先级体系)
        private StackPanel _editTaskSection;
        private TextBox _editModalTextBox;
        private WrapPanel _editPriorityRow;
        private Button[] _priBtns = new Button[6];
        private static readonly string[] PriKeys = new string[] { "p0", "p1", "p2", "p3", "p4", "p5" };
        private static readonly string[] PriNames = new string[] { "P0 紧急", "P1 高", "P2 较高", "P3 普通", "P4 较低", "P5 低" };

        // 焦点锚点编辑专用部分 (支持标题、AI当前执行、你回来后的下一步完整编辑)
        private StackPanel _editContextSection;
        private TextBlock _editContextWsLabel;
        private TextBox _editContextWsInput;
        private TextBlock _editContextDoingLabel;
        private TextBox _editContextDoingInput;
        private TextBlock _editContextNextLabel;
        private TextBox _editContextNextInput;

        private Button _editModalCancelBtn;
        private Button _editModalSaveBtn;
        private string _editingMode = ""; // "task" 或 "context"
        private TaskItem _editingTaskObj;
        private ContextItem _editingContextObj;
        private string _selectedEditPriority = "medium";

        // 新建焦点
        private bool _addingFocus = false;
        private string _addFocusWorkspace = "";
        private string _addFocusDoing = "";
        private string _addFocusNext = "";

        public MainWindow(Options options)
        {
            _options = options;
            _api = new PlanApi(options.BaseUrl);
            Title = "Omni Plan";
            Width = options.Width;
            Height = options.Height;
            MinWidth = 340;
            MinHeight = 440;
            MaxWidth = 1600;
            MaxHeight = 2000;
            WindowStyle = WindowStyle.None;
            AllowsTransparency = true;
            Background = Brushes.Transparent;
            Topmost = true;
            ShowInTaskbar = false;
            UseLayoutRounding = true;
            SnapsToDevicePixels = true;
            TextOptions.SetTextFormattingMode(this, TextFormattingMode.Display);
            TextOptions.SetTextRenderingMode(this, TextRenderingMode.ClearType);
            RenderOptions.SetClearTypeHint(this, ClearTypeHint.Enabled);

            LoadThemePreference();
            ResolvePalette();

            InjectGlobalStyles();
            BuildUi();
            ApplyThemeToVisuals();

            Loaded += OnLoaded;
            StateChanged += OnStateChanged;

            _pollTimer = new DispatcherTimer();
            _pollTimer.Interval = TimeSpan.FromSeconds(1.2);
            _pollTimer.Tick += delegate { RefreshState(false); };
            _pollTimer.Start();
        }

        private void LoadThemePreference()
        {
            try
            {
                string home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                string themeFile = Path.Combine(home, ".dsh", "omni-plan", "theme.txt");
                if (File.Exists(themeFile))
                {
                    string text = File.ReadAllText(themeFile).Trim().ToLowerInvariant();
                    if (text == "light") _themeMode = ThemeMode.Light;
                    else _themeMode = ThemeMode.Dark;
                }
            }
            catch { }
        }

        private void SaveThemePreference()
        {
            try
            {
                string home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                string dir = Path.Combine(home, ".dsh", "omni-plan");
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                string themeFile = Path.Combine(dir, "theme.txt");
                string modeStr = _themeMode == ThemeMode.Light ? "light" : "dark";
                File.WriteAllText(themeFile, modeStr);
            }
            catch { }
        }

        private void ResolvePalette()
        {
            bool isDark = _themeMode == ThemeMode.Dark;
            _palette = isDark ? ThemePalette.CreateDark() : ThemePalette.CreateLight();
        }

        public static UIElement CreateSvgIcon(string iconName, string strokeHex, double size = 14, double offsetX = -0.6, double offsetY = -0.6)
        {
            if (iconName == "brand-logo")
            {
                return CreateBrandLogoElement(size);
            }

            string pathData = "";
            double strokeWidth = 2.0;

            if (iconName == "circle-plus")
            {
                pathData = "M 12,2 A 10,10 0 1 1 11.999,2 Z M 8,12 H 16 M 12,8 V 16";
            }
            else if (iconName == "check-icon" || iconName == "check")
            {
                pathData = "M 20,6 L 9,17 L 4,12";
            }
            else if (iconName == "close")
            {
                pathData = "M 18,6 L 6,18 M 6,6 L 18,18";
            }
            else if (iconName == "dark" || iconName == "moon")
            {
                pathData = "M 20.985,12.486 A 9,9 0 1 1 11.512,3.014 C 11.917,2.992 12.129,3.474 11.914,3.817 A 6,6 0 0 0 20.182,12.085 C 20.526,11.87 21.007,12.081 20.985,12.486 Z";
            }
            else if (iconName == "light" || iconName == "sun")
            {
                pathData = "M 12,8 A 4,4 0 1 1 11.999,8 Z M 12,2 V 4 M 12,20 V 22 M 4.93,4.93 L 6.34,6.34 M 17.66,17.66 L 19.07,19.07 M 2,12 H 4 M 20,12 H 22 M 6.34,17.66 L 4.93,19.07 M 19.07,4.93 L 17.66,6.34";
            }
            else if (iconName == "change")
            {
                pathData = "M 12,3 H 5 A 2,2 0 0 0 3,5 V 19 A 2,2 0 0 0 5,21 H 19 A 2,2 0 0 0 21,19 V 12 M 18.375,2.625 A 1,1 0 0 1 21.375,5.625 L 12.362,14.639 A 2,2 0 0 1 11.509,15.144 L 8.636,15.984 A 0.5,0.5 0 0 1 8.016,15.364 L 8.856,12.491 A 2,2 0 0 1 9.362,11.639 Z";
            }
            else if (iconName == "copy")
            {
                pathData = "M 10,8 H 20 A 2,2 0 0 1 22,10 V 20 A 2,2 0 0 1 20,22 H 10 A 2,2 0 0 1 8,20 V 10 A 2,2 0 0 1 10,8 Z M 4,16 C 2.9,16 2,15.1 2,14 V 4 C 2,2.9 2.9,2 4,2 H 14 C 15.1,2 16,2.9 16,4";
            }
            else if (iconName == "delete")
            {
                pathData = "M 3,6 H 21 M 19,6 V 20 A 2,2 0 0 1 17,22 H 7 A 2,2 0 0 1 5,20 V 6 M 8,6 V 4 A 2,2 0 0 1 10,2 H 14 A 2,2 0 0 1 16,4 V 6 M 10,11 V 17 M 14,11 V 17";
            }
            else if (iconName == "dots" || iconName == "more" || iconName == "more-horizontal")
            {
                pathData = "M 6,12 A 1.5,1.5 0 1 1 5.999,12 Z M 12,12 A 1.5,1.5 0 1 1 11.999,12 Z M 18,12 A 1.5,1.5 0 1 1 17.999,12 Z";
            }
            else if (iconName == "inject" || iconName == "send")
            {
                pathData = "M 21,11.5 A 8.5,8.5 0 0 1 12.5,20 C 10.7,20 9,19.4 7.6,18.4 L 3,19.5 L 4.4,15.2 A 8.5,8.5 0 1 1 21,11.5 Z M 9,11.5 H 15 M 12.5,8.5 L 15.5,11.5 L 12.5,14.5";
            }
            else
            {
                pathData = "M 12,2 A 10,10 0 1 1 11.999,2 Z";
            }

            try
            {
                DrawingGroup dg = new DrawingGroup();
                // 核心：注入严格的 24x24 透明底板，锁定绝对视口中心为 (12.0, 12.0)，杜绝 Viewbox 测量偏移
                dg.Children.Add(new GeometryDrawing(Brushes.Transparent, null, new RectangleGeometry(new Rect(0, 0, 24, 24))));

                Brush brush = Brush(strokeHex);
                Pen pen = new Pen(brush, strokeWidth)
                {
                    StartLineCap = PenLineCap.Round,
                    EndLineCap = PenLineCap.Round,
                    LineJoin = PenLineJoin.Round
                };
                dg.Children.Add(new GeometryDrawing(null, pen, Geometry.Parse(pathData)));

                DrawingImage di = new DrawingImage(dg);
                di.Freeze(); // 冻结提升渲染性能与稳定性

                Image img = new Image();
                img.Source = di;
                img.Width = size;
                img.Height = size;
                img.HorizontalAlignment = HorizontalAlignment.Center;
                img.VerticalAlignment = VerticalAlignment.Center;
                img.SnapsToDevicePixels = true;
                // 光学居中微调补偿：人眼视错觉下向右上微移 0.6 像素，达到极致视觉居中
                if (offsetX != 0 || offsetY != 0)
                {
                    img.RenderTransform = new TranslateTransform(offsetX, offsetY);
                }
                return img;
            }
            catch
            {
                return new TextBlock { Text = iconName, FontSize = 10 };
            }
        }

        public static UIElement CreateBrandLogoElement(double size = 24)
        {
            try
            {
                DrawingGroup dg = new DrawingGroup();
                // 1. 24x24 视口底板
                dg.Children.Add(new GeometryDrawing(Brushes.Transparent, null, new RectangleGeometry(new Rect(0, 0, 24, 24))));

                // 2. 外层连续曲率圆角矩形 (Squircle) 与钛夜深色渐变
                LinearGradientBrush bgBrush = new LinearGradientBrush();
                bgBrush.StartPoint = new Point(0, 0);
                bgBrush.EndPoint = new Point(1, 1);
                bgBrush.GradientStops.Add(new GradientStop((Color)ColorConverter.ConvertFromString("#1c1c22"), 0.0));
                bgBrush.GradientStops.Add(new GradientStop((Color)ColorConverter.ConvertFromString("#08080a"), 1.0));
                bgBrush.Freeze();

                Pen borderPen = new Pen(new SolidColorBrush((Color)ColorConverter.ConvertFromString("#383842")), 0.8);
                borderPen.Freeze();

                RectangleGeometry squircle = new RectangleGeometry(new Rect(1.5, 1.5, 21, 21), 5.5, 5.5);
                dg.Children.Add(new GeometryDrawing(bgBrush, borderPen, squircle));

                // 3. 内部星轨同心圆虚线环 (Omni Orbit)
                Pen orbitPen = new Pen(new SolidColorBrush((Color)ColorConverter.ConvertFromString("#4a4a55")), 0.8);
                orbitPen.DashStyle = new DashStyle(new double[] { 2, 2.5 }, 0);
                orbitPen.Freeze();
                dg.Children.Add(new GeometryDrawing(null, orbitPen, new EllipseGeometry(new Point(12, 12), 7.2, 7.2)));

                // 4. 内部柔光星轨实线环
                LinearGradientBrush ringBrush = new LinearGradientBrush();
                ringBrush.StartPoint = new Point(0, 0);
                ringBrush.EndPoint = new Point(1, 1);
                ringBrush.GradientStops.Add(new GradientStop((Color)ColorConverter.ConvertFromString("#ffffff"), 0.5));
                ringBrush.GradientStops.Add(new GradientStop((Color)ColorConverter.ConvertFromString("#818cf8"), 1.0));
                ringBrush.Freeze();
                Pen ringPen = new Pen(ringBrush, 1.0);
                ringPen.Freeze();
                dg.Children.Add(new GeometryDrawing(null, ringPen, new EllipseGeometry(new Point(12, 12), 5.2, 5.2)));

                // 5. 核心焦点四芒星徽 (Focus Sparkle)
                PathGeometry starGeo = Geometry.Parse("M 12,7 C 12,9.8 13.5,12 16.5,12 C 13.5,12 12,14.2 12,17 C 12,14.2 10.5,12 7.5,12 C 10.5,12 12,9.8 12,7 Z") as PathGeometry;
                Brush starBrush = Brushes.White;
                dg.Children.Add(new GeometryDrawing(starBrush, null, starGeo));

                // 6. 轨道四个微交互焦点锚点 (Focus Pins)
                Brush dotBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#a1a1aa"));
                dotBrush.Freeze();
                dg.Children.Add(new GeometryDrawing(Brushes.White, null, new EllipseGeometry(new Point(12, 4.8), 0.8, 0.8)));
                dg.Children.Add(new GeometryDrawing(dotBrush, null, new EllipseGeometry(new Point(19.2, 12), 0.7, 0.7)));
                dg.Children.Add(new GeometryDrawing(dotBrush, null, new EllipseGeometry(new Point(12, 19.2), 0.7, 0.7)));
                dg.Children.Add(new GeometryDrawing(dotBrush, null, new EllipseGeometry(new Point(4.8, 12), 0.7, 0.7)));

                DrawingImage di = new DrawingImage(dg);
                di.Freeze();

                Image img = new Image();
                img.Source = di;
                img.Width = size;
                img.Height = size;
                img.HorizontalAlignment = HorizontalAlignment.Center;
                img.VerticalAlignment = VerticalAlignment.Center;
                img.SnapsToDevicePixels = true;
                return img;
            }
            catch
            {
                return new Border { Width = size, Height = size, Background = Brushes.Indigo, CornerRadius = new CornerRadius(4) };
            }
        }

        private void InjectGlobalStyles()
        {
            try
            {
                string hiddenScrollBarStyle = @"
<ResourceDictionary xmlns='http://schemas.microsoft.com/winfx/2006/xaml/presentation'
                    xmlns:x='http://schemas.microsoft.com/winfx/2006/xaml'>
  <Style TargetType='{x:Type ScrollBar}'>
    <Setter Property='Visibility' Value='Collapsed'/>
    <Setter Property='Width' Value='0'/>
    <Setter Property='Height' Value='0'/>
    <Setter Property='MinWidth' Value='0'/>
    <Setter Property='MinHeight' Value='0'/>
    <Setter Property='Template'>
      <Setter.Value>
        <ControlTemplate TargetType='{x:Type ScrollBar}'>
          <Grid Width='0' Height='0' Visibility='Collapsed'/>
        </ControlTemplate>
      </Setter.Value>
    </Setter>
  </Style>
</ResourceDictionary>";
                using (MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(hiddenScrollBarStyle)))
                {
                    ResourceDictionary dict = (ResourceDictionary)XamlReader.Load(ms);
                    Resources.MergedDictionaries.Add(dict);
                }
            }
            catch { }
        }

        private Style CreateButtonStyle()
        {
            Style style = new Style(typeof(Button));
            Setter templateSetter = new Setter();
            templateSetter.Property = Button.TemplateProperty;

            ControlTemplate template = new ControlTemplate(typeof(Button));
            FrameworkElementFactory borderFactory = new FrameworkElementFactory(typeof(Border));
            borderFactory.Name = "bd";
            borderFactory.SetValue(Border.CornerRadiusProperty, new CornerRadius(5));
            borderFactory.SetBinding(Border.BackgroundProperty, new System.Windows.Data.Binding("Background") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.SetBinding(Border.BorderBrushProperty, new System.Windows.Data.Binding("BorderBrush") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.SetBinding(Border.PaddingProperty, new System.Windows.Data.Binding("Padding") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.SetValue(Border.BorderThicknessProperty, new Thickness(1));

            FrameworkElementFactory presenter = new FrameworkElementFactory(typeof(ContentPresenter));
            presenter.SetValue(ContentPresenter.HorizontalAlignmentProperty, HorizontalAlignment.Center);
            presenter.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
            presenter.SetBinding(ContentPresenter.MarginProperty, new System.Windows.Data.Binding("Padding") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.AppendChild(presenter);

            template.VisualTree = borderFactory;

            Trigger mouseOverTrigger = new Trigger { Property = Button.IsMouseOverProperty, Value = true };
            mouseOverTrigger.Setters.Add(new Setter(Button.OpacityProperty, 0.85));
            template.Triggers.Add(mouseOverTrigger);

            Trigger pressedTrigger = new Trigger { Property = Button.IsPressedProperty, Value = true };
            pressedTrigger.Setters.Add(new Setter(Button.OpacityProperty, 0.65));
            template.Triggers.Add(pressedTrigger);

            templateSetter.Value = template;
            style.Setters.Add(templateSetter);
            style.Setters.Add(new Setter(Button.CursorProperty, Cursors.Hand));
            style.Setters.Add(new Setter(Button.FontFamilyProperty, new FontFamily("Segoe UI, Microsoft YaHei UI")));
            return style;
        }

        
        private Style CreateRoundButtonStyle()
        {
            Style style = new Style(typeof(Button));
            Setter templateSetter = new Setter();
            templateSetter.Property = Button.TemplateProperty;

            ControlTemplate template = new ControlTemplate(typeof(Button));
            FrameworkElementFactory borderFactory = new FrameworkElementFactory(typeof(Border));
            borderFactory.Name = "bd";
            borderFactory.SetValue(Border.CornerRadiusProperty, new CornerRadius(50));
            borderFactory.SetBinding(Border.BackgroundProperty, new System.Windows.Data.Binding("Background") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.SetBinding(Border.BorderBrushProperty, new System.Windows.Data.Binding("BorderBrush") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.SetValue(Border.BorderThicknessProperty, new Thickness(1));

            FrameworkElementFactory presenter = new FrameworkElementFactory(typeof(ContentPresenter));
            presenter.SetValue(ContentPresenter.HorizontalAlignmentProperty, HorizontalAlignment.Center);
            presenter.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
            borderFactory.AppendChild(presenter);

            template.VisualTree = borderFactory;

            string hoverBg = _palette.IsDark ? "#2C2C34" : "#E4E4EC";
            string hoverBorder = _palette.IsDark ? "#454552" : "#CBD5E1";
            string pressBg = _palette.IsDark ? "#383844" : "#D8D8E2";

            Trigger mouseOverTrigger = new Trigger { Property = Button.IsMouseOverProperty, Value = true };
            mouseOverTrigger.Setters.Add(new Setter(Border.BackgroundProperty, Brush(hoverBg), "bd"));
            mouseOverTrigger.Setters.Add(new Setter(Border.BorderBrushProperty, Brush(hoverBorder), "bd"));
            mouseOverTrigger.Setters.Add(new Setter(Button.OpacityProperty, 0.98));
            template.Triggers.Add(mouseOverTrigger);

            Trigger pressedTrigger = new Trigger { Property = Button.IsPressedProperty, Value = true };
            pressedTrigger.Setters.Add(new Setter(Border.BackgroundProperty, Brush(pressBg), "bd"));
            pressedTrigger.Setters.Add(new Setter(Button.OpacityProperty, 0.85));
            template.Triggers.Add(pressedTrigger);

            templateSetter.Value = template;
            style.Setters.Add(templateSetter);
            style.Setters.Add(new Setter(Button.CursorProperty, Cursors.Hand));
            return style;
        }

        private Button NewRoundIconButton(string iconName, string strokeColor, double size = 26, double iconSize = 15, double offsetX = -0.6, double offsetY = -0.6)
        {
            Button button = new Button();
            button.Style = CreateRoundButtonStyle();
            button.Content = CreateSvgIcon(iconName, strokeColor, iconSize, offsetX, offsetY);
            button.Width = size;
            button.Height = size;
            button.Padding = new Thickness(0);
            button.Background = Brushes.Transparent;
            button.BorderBrush = Brushes.Transparent;
            return button;
        }

        private Style CreateTextBoxStyle()
        {
            Style style = new Style(typeof(TextBox));
            Setter templateSetter = new Setter();
            templateSetter.Property = TextBox.TemplateProperty;

            ControlTemplate template = new ControlTemplate(typeof(TextBox));
            FrameworkElementFactory borderFactory = new FrameworkElementFactory(typeof(Border));
            borderFactory.Name = "bd";
            borderFactory.SetValue(Border.CornerRadiusProperty, new CornerRadius(4));
            borderFactory.SetBinding(Border.BackgroundProperty, new System.Windows.Data.Binding("Background") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.SetBinding(Border.BorderBrushProperty, new System.Windows.Data.Binding("BorderBrush") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            borderFactory.SetValue(Border.BorderThicknessProperty, new Thickness(1));

            FrameworkElementFactory scrollViewer = new FrameworkElementFactory(typeof(ScrollViewer));
            scrollViewer.Name = "PART_ContentHost";
            scrollViewer.SetValue(ScrollViewer.MarginProperty, new Thickness(0));
            scrollViewer.SetValue(ScrollViewer.PaddingProperty, new Thickness(0));
            borderFactory.AppendChild(scrollViewer);

            template.VisualTree = borderFactory;

            Trigger focusTrigger = new Trigger { Property = TextBox.IsFocusedProperty, Value = true };
            focusTrigger.Setters.Add(new Setter(Border.BorderBrushProperty, Brush(_palette.InputFocusBorder), "bd"));
            template.Triggers.Add(focusTrigger);

            templateSetter.Value = template;
            style.Setters.Add(templateSetter);
            style.Setters.Add(new Setter(TextBox.FontFamilyProperty, new FontFamily("Segoe UI, Microsoft YaHei UI")));
            style.Setters.Add(new Setter(TextBox.FontSizeProperty, 12.5));
            style.Setters.Add(new Setter(TextBox.PaddingProperty, new Thickness(10, 8, 10, 8)));
            style.Setters.Add(new Setter(TextBox.ForegroundProperty, Brush(_palette.TextPrimary)));
            style.Setters.Add(new Setter(TextBox.CaretBrushProperty, Brush(_palette.TextPrimary)));
            style.Setters.Add(new Setter(TextBox.BackgroundProperty, Brush(_palette.InputBg)));
            style.Setters.Add(new Setter(TextBox.BorderBrushProperty, Brush(_palette.InputBorder)));
            return style;
        }

        private TextBlock Text(string text, double size = 12, string color = null, FontWeight? weight = null, string fontFamily = "Segoe UI, Microsoft YaHei UI")
        {
            TextBlock tb = new TextBlock();
            tb.Text = text ?? "";
            tb.FontSize = size;
            tb.Foreground = Brush(color ?? _palette.TextPrimary);
            tb.FontFamily = new FontFamily(fontFamily);
            if (weight.HasValue) tb.FontWeight = weight.Value;
            return tb;
        }

        private TextBox NewTextBox(string hint)
        {
            TextBox box = new TextBox();
            box.Style = CreateTextBoxStyle();
            box.ToolTip = hint;
            box.Padding = new Thickness(8, 6, 8, 6);
            return box;
        }

        private TextBox NewMultilineTextBox(string hint, double minHeight = 40, double maxHeight = 120)
        {
            TextBox box = new TextBox();
            box.Style = CreateTextBoxStyle();
            box.ToolTip = hint;
            box.AcceptsReturn = true;
            box.TextWrapping = TextWrapping.Wrap;
            box.MinHeight = minHeight;
            box.MaxHeight = maxHeight;
            box.Padding = new Thickness(12, 8, 12, 8);
            box.FontSize = 12.5;
            return box;
        }

        private Button NewButton(string text, string background, string foreground, string border, double size = 11.5)
        {
            Button button = new Button();
            button.Style = CreateButtonStyle();
            button.Content = text;
            button.Background = Brush(background);
            button.Foreground = Brush(foreground);
            button.BorderBrush = Brush(border);
            button.FontSize = size;
            button.FontWeight = FontWeights.SemiBold;
            button.Padding = new Thickness(10, 4, 10, 4);
            button.Margin = new Thickness(0);
            return button;
        }

        private Button NewIconButton(string iconName, string strokeColor, string background, string border, double btnWidth = 28, double btnHeight = 26, double iconSize = 14, double offsetX = -0.6, double offsetY = -0.6)
        {
            Button button = new Button();
            button.Style = CreateButtonStyle();
            button.Content = CreateSvgIcon(iconName, strokeColor, iconSize, offsetX, offsetY);
            button.Background = Brush(background);
            button.BorderBrush = Brush(border);
            button.Width = btnWidth;
            button.Height = btnHeight;
            button.Padding = new Thickness(0);
            return button;
        }

        private Button NewMoreButton()
        {
            Button btn_more = new Button();
            btn_more.Style = CreateButtonStyle();
            btn_more.Content = CreateSvgIcon("more", _palette.TextSecondary, 14, 0, 0);
            btn_more.Width = 28;
            btn_more.Height = 24;
            btn_more.Padding = new Thickness(0);
            btn_more.Background = Brush(_palette.ButtonBg);
            btn_more.Foreground = Brush(_palette.TextSecondary);
            btn_more.BorderBrush = Brush(_palette.ButtonBorder);
            btn_more.ToolTip = "更多操作";
            return btn_more;
        }

        private ContextMenu CreateModernContextMenu()
        {
            ContextMenu ctx_menu = new ContextMenu();
            ctx_menu.HasDropShadow = false;
            ctx_menu.Background = Brush(_palette.MenuBg);
            ctx_menu.BorderBrush = Brush(_palette.MenuBorder);
            ctx_menu.BorderThickness = new Thickness(1);
            ctx_menu.Padding = new Thickness(4);
            ctx_menu.SnapsToDevicePixels = true;
            ctx_menu.UseLayoutRounding = true;

            ControlTemplate menu_template = new ControlTemplate(typeof(ContextMenu));
            FrameworkElementFactory menu_border = new FrameworkElementFactory(typeof(Border));
            menu_border.Name = "MenuBd";
            menu_border.SetValue(Border.CornerRadiusProperty, new CornerRadius(8));
            menu_border.SetValue(Border.BorderThicknessProperty, new Thickness(1));
            menu_border.SetValue(Border.PaddingProperty, new Thickness(4));
            menu_border.SetBinding(Border.BackgroundProperty, new System.Windows.Data.Binding("Background") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });
            menu_border.SetBinding(Border.BorderBrushProperty, new System.Windows.Data.Binding("BorderBrush") { RelativeSource = new System.Windows.Data.RelativeSource(System.Windows.Data.RelativeSourceMode.TemplatedParent) });

            DropShadowEffect shadow_eff = new DropShadowEffect
            {
                BlurRadius = 16,
                ShadowDepth = 3,
                Direction = 270,
                Color = Colors.Black,
                Opacity = _palette.IsDark ? 0.45 : 0.12
            };
            menu_border.SetValue(Border.EffectProperty, shadow_eff);

            FrameworkElementFactory items_presenter = new FrameworkElementFactory(typeof(ItemsPresenter));
            menu_border.AppendChild(items_presenter);

            menu_template.VisualTree = menu_border;
            ctx_menu.Template = menu_template;
            return ctx_menu;
        }

        public ToolTip CreateModernToolTip(string text)
        {
            if (string.IsNullOrEmpty(text)) return null;
            ToolTip tt = new ToolTip();
            tt.Content = text;
            tt.Background = Brush(_palette.IsDark ? "#1E1E24" : "#FFFFFF");
            tt.Foreground = Brush(_palette.IsDark ? "#F4F4F5" : "#18181B");
            tt.BorderBrush = Brush(_palette.IsDark ? "#383844" : "#CBD5E1");
            tt.BorderThickness = new Thickness(1);
            tt.FontSize = 11.5;
            tt.FontFamily = new FontFamily("Segoe UI, Microsoft YaHei UI");
            tt.HasDropShadow = false;

            ControlTemplate ttTemplate = new ControlTemplate(typeof(ToolTip));
            FrameworkElementFactory ttBorder = new FrameworkElementFactory(typeof(Border));
            ttBorder.SetValue(Border.CornerRadiusProperty, new CornerRadius(6));
            ttBorder.SetValue(Border.BackgroundProperty, tt.Background);
            ttBorder.SetValue(Border.BorderBrushProperty, tt.BorderBrush);
            ttBorder.SetValue(Border.BorderThicknessProperty, new Thickness(1));
            ttBorder.SetValue(Border.PaddingProperty, new Thickness(8, 5, 8, 5));
            ttBorder.SetValue(Border.EffectProperty, new DropShadowEffect
            {
                BlurRadius = 12,
                ShadowDepth = 2,
                Direction = 270,
                Color = Colors.Black,
                Opacity = _palette.IsDark ? 0.35 : 0.12
            });
            FrameworkElementFactory ttPresenter = new FrameworkElementFactory(typeof(ContentPresenter));
            ttPresenter.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
            ttBorder.AppendChild(ttPresenter);
            ttTemplate.VisualTree = ttBorder;
            tt.Template = ttTemplate;
            return tt;
        }

        private MenuItem CreateModernMenuItem(string text, string icon_name, Action action, bool is_danger = false, string tooltip = null)
        {
            MenuItem item = new MenuItem();
            item.OverridesDefaultStyle = true;
            item.Cursor = Cursors.Hand;
            item.Height = 29;

            if (!string.IsNullOrEmpty(tooltip))
            {
                item.ToolTip = CreateModernToolTip(tooltip);
                ToolTipService.SetInitialShowDelay(item, 60);
                ToolTipService.SetShowDuration(item, 12000);
            }

            ControlTemplate item_template = new ControlTemplate(typeof(MenuItem));
            FrameworkElementFactory item_border = new FrameworkElementFactory(typeof(Border));
            item_border.Name = "ItemBd";
            item_border.SetValue(Border.CornerRadiusProperty, new CornerRadius(5));
            item_border.SetValue(Border.PaddingProperty, new Thickness(8, 0, 10, 0));
            item_border.SetValue(Border.BackgroundProperty, Brushes.Transparent);

            FrameworkElementFactory presenter = new FrameworkElementFactory(typeof(ContentPresenter));
            presenter.SetValue(ContentPresenter.ContentSourceProperty, "Header");
            presenter.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
            item_border.AppendChild(presenter);

            item_template.VisualTree = item_border;

            Trigger hl_trigger = new Trigger { Property = MenuItem.IsHighlightedProperty, Value = true };
            string hover_bg = is_danger ? _palette.MenuItemDangerHoverBg : _palette.MenuItemHoverBg;
            hl_trigger.Setters.Add(new Setter(Border.BackgroundProperty, Brush(hover_bg), "ItemBd"));
            item_template.Triggers.Add(hl_trigger);

            item.Template = item_template;

            StackPanel sp_row = new StackPanel();
            sp_row.Orientation = Orientation.Horizontal;
            sp_row.VerticalAlignment = VerticalAlignment.Center;

            string fg_color = is_danger ? _palette.MenuItemDangerFg : _palette.TextPrimary;
            string icon_color = is_danger ? _palette.MenuItemDangerFg : _palette.TextSecondary;

            if (!string.IsNullOrEmpty(icon_name))
            {
                UIElement icon_elem = CreateSvgIcon(icon_name, icon_color, 12.5, 0, 0);
                FrameworkElement fe_icon = icon_elem as FrameworkElement;
                if (fe_icon != null) fe_icon.Margin = new Thickness(0, 0, 7, 0);
                sp_row.Children.Add(icon_elem);
            }

            TextBlock tb_text = Text(text, 12.0, fg_color, is_danger ? FontWeights.SemiBold : FontWeights.Normal, "Segoe UI, Microsoft YaHei UI");
            tb_text.VerticalAlignment = VerticalAlignment.Center;
            sp_row.Children.Add(tb_text);

            item.Header = sp_row;
            item.Click += delegate { action(); };
            return item;
        }

        private MenuItem CreateMenuItem(string text, Action action)
        {
            return CreateModernMenuItem(text, null, action);
        }

        private void OpenActionMenu(Button anchor, ContextMenu menu)
        {
            menu.PlacementTarget = anchor;
            menu.Placement = PlacementMode.Bottom;
            menu.VerticalOffset = 3;
            menu.IsOpen = true;
        }

        // 统一带有 SVG 图标与说明文字的现代操作按钮
        private Button NewActionBtn(string iconName, string text, string background, string foreground, string border, double iconSize = 13, double fontSize = 11)
        {
            Button btn = new Button();
            btn.Style = CreateButtonStyle();
            StackPanel sp = new StackPanel();
            sp.Orientation = Orientation.Horizontal;
            sp.VerticalAlignment = VerticalAlignment.Center;

            UIElement icon = CreateSvgIcon(iconName, foreground, iconSize);
            sp.Children.Add(icon);

            if (!string.IsNullOrEmpty(text))
            {
                TextBlock tb = Text(text, fontSize, foreground, FontWeights.SemiBold);
                tb.Margin = new Thickness(6, 0, 0, 0);
                tb.VerticalAlignment = VerticalAlignment.Center;
                sp.Children.Add(tb);
            }

            btn.Content = sp;
            btn.Background = Brush(background);
            btn.Foreground = Brush(foreground);
            btn.BorderBrush = Brush(border);
            btn.Padding = new Thickness(11, 4, 11, 4);
            return btn;
        }

        private Border PillBadge(string text, string background, string foreground, string border = null)
        {
            Border pill = new Border();
            pill.Background = Brush(background);
            if (!string.IsNullOrEmpty(border))
            {
                pill.BorderBrush = Brush(border);
                pill.BorderThickness = new Thickness(1);
            }
            pill.CornerRadius = new CornerRadius(4);
            pill.Padding = new Thickness(7, 2, 7, 2);
            pill.VerticalAlignment = VerticalAlignment.Center;
            TextBlock tb = Text(text, 10, foreground, FontWeights.SemiBold, "Segoe UI");
            tb.VerticalAlignment = VerticalAlignment.Center;
            pill.Child = tb;
            return pill;
        }

        private void BuildUi()
        {
            _windowContainer = new Grid();
            _windowContainer.UseLayoutRounding = true;
            _windowContainer.SnapsToDevicePixels = true;

            // 核心外框：Padding 设为 0，让全屏模态遮罩能够 100% 覆盖贴合边框
            _rootBorder = new Border();
            _rootBorder.CornerRadius = new CornerRadius(12);
            _rootBorder.BorderThickness = new Thickness(1.2);
            _rootBorder.Padding = new Thickness(0);
            _rootBorder.UseLayoutRounding = true;
            _rootBorder.SnapsToDevicePixels = true;

            // 彻底移除直角裁切的 DropShadowEffect，消除外层直角 box-shadow 阴影层，纯粹呈现 12px 圆角与高级微高光描边
            _rootBorder.Effect = null;

            _windowContainer.Children.Add(_rootBorder);
            Content = _windowContainer;

            // rootGrid 包含主内容网格与浮层模态遮罩
            _rootGrid = new Grid();
            _rootBorder.Child = _rootGrid;

            // 主内容网格 (具有统一边距 Margin 14, 12, 14, 12)
            _mainContentGrid = new Grid();
            _mainContentGrid.Margin = new Thickness(14, 12, 14, 12);
            for (int i = 0; i < 4; i++)
            {
                _mainContentGrid.RowDefinitions.Add(new RowDefinition { Height = i == 2 ? new GridLength(1, GridUnitType.Star) : GridLength.Auto });
            }
            _rootGrid.Children.Add(_mainContentGrid);

            // Row 0: Header (支持全区域非按钮处拖拽)
            Grid header = new Grid();
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            header.Margin = new Thickness(0, 0, 0, 10);
            header.Background = Brushes.Transparent;
            header.MouseLeftButtonDown += HeaderMouseDown;
            Grid.SetRow(header, 0);
            _mainContentGrid.Children.Add(header);

            Border dragArea = new Border();
            dragArea.Background = Brushes.Transparent;
            dragArea.Padding = new Thickness(2);
            Grid.SetColumn(dragArea, 0);
            header.Children.Add(dragArea);

            StackPanel brand = new StackPanel();
            brand.Orientation = Orientation.Horizontal;
            brand.HorizontalAlignment = HorizontalAlignment.Left;
            brand.VerticalAlignment = VerticalAlignment.Center;

            // Brand mark: 采用全新高审美 Omni Plan 矢量 Logo (与 icon.svg 保持统一美学)
            _brandLogoHost = new Border();
            _brandLogoHost.Margin = new Thickness(0, 0, 9, 0);
            _brandLogoHost.VerticalAlignment = VerticalAlignment.Center;
            _brandLogoHost.Child = CreateBrandLogoElement(24);
            brand.Children.Add(_brandLogoHost);

            _brandTitle = Text("Omni Plan", 13.5, _palette.TextPrimary, FontWeights.Bold, "Segoe UI");
            _brandTitle.VerticalAlignment = VerticalAlignment.Center;
            brand.Children.Add(_brandTitle);
            dragArea.Child = brand;

            // Header 右侧控制区 (去掉已同步文字，纯净呈现主题与关闭图标按钮)
            StackPanel headerRight = new StackPanel();
            headerRight.Orientation = Orientation.Horizontal;
            headerRight.VerticalAlignment = VerticalAlignment.Center;

            // 主题切换按钮：精巧 28x26 SVG 图标按钮 (依据主题显示 light/dark 矢量图标，二元切换)
            // 主题切换按钮：向右下微调 (0.6, 0.6)，消除偏左上，达到极致视觉居中
            _themeToggleButton = NewIconButton(GetThemeIconName(), _palette.TextSecondary, _palette.ButtonBg, _palette.ButtonBorder, 28, 26, 13, 0.6, 0.6);
            _themeToggleButton.Margin = new Thickness(0, 0, 8, 0);
            _themeToggleButton.ToolTip = GetThemeTooltip();
            _themeToggleButton.Click += delegate { ToggleTheme(); };
            headerRight.Children.Add(_themeToggleButton);

            // 右上角主关闭按钮：向右下微调 (0.6, 0.6)，消除偏左上，达到极致视觉居中
            _closeButton = NewIconButton("close", _palette.TextSecondary, _palette.ButtonBg, _palette.ButtonBorder, 28, 26, 13, 0.6, 0.6);
            _closeButton.ToolTip = "关闭置顶看板 (可在 DSH 界面随时重新呼起)";
            _closeButton.Click += delegate { CloseWindow(); };
            headerRight.Children.Add(_closeButton);

            Grid.SetColumn(headerRight, 1);
            header.Children.Add(headerRight);

            // Row 1: Segmented Control Tabs (双层结构：底层滑动指示器胶囊 + 上层透明按钮)
            _tabsContainer = new Border();
            _tabsContainer.CornerRadius = new CornerRadius(6);
            _tabsContainer.BorderThickness = new Thickness(1);
            _tabsContainer.Padding = new Thickness(3);
            _tabsContainer.Margin = new Thickness(0, 0, 0, 10);
            Grid.SetRow(_tabsContainer, 1);
            _mainContentGrid.Children.Add(_tabsContainer);

            Grid tabsLayout = new Grid();
            _tabsContainer.Child = tabsLayout;

            // 底层滑动胶囊指示器
            _tabIndicator = new Border();
            _tabIndicator.CornerRadius = new CornerRadius(4);
            _tabIndicator.BorderThickness = new Thickness(1);
            _tabIndicator.HorizontalAlignment = HorizontalAlignment.Left;
            _tabIndicator.VerticalAlignment = VerticalAlignment.Stretch;
            _tabIndicatorTransform = new TranslateTransform(0, 0);
            _tabIndicator.RenderTransform = _tabIndicatorTransform;
            tabsLayout.Children.Add(_tabIndicator);

            _tabsContainer.SizeChanged += delegate
            {
                UpdateTabIndicatorPosition(false);
            };

            // 上层分段按钮网格 (纯透明，负责点击事件与文字展示)
            Grid tabsGrid = new Grid();
            tabsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            tabsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            tabsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            _tabFocusBtn = BuildTabItem("焦点", 0, out _tabFocusBadge, out _tabFocusBadgeText, out _tabFocusText);
            _tabFocusBtn.Click += delegate { SwitchTab("focus"); };
            Grid.SetColumn(_tabFocusBtn, 0);
            tabsGrid.Children.Add(_tabFocusBtn);

            _tabTasksBtn = BuildTabItem("任务", 1, out _tabTasksBadge, out _tabTasksBadgeText, out _tabTasksText);
            _tabTasksBtn.Click += delegate { SwitchTab("tasks"); };
            Grid.SetColumn(_tabTasksBtn, 1);
            tabsGrid.Children.Add(_tabTasksBtn);

            _tabInboxBtn = BuildTabItem("灵感", 2, out _tabInboxBadge, out _tabInboxBadgeText, out _tabInboxText);
            _tabInboxBtn.Click += delegate { SwitchTab("inbox"); };
            Grid.SetColumn(_tabInboxBtn, 2);
            tabsGrid.Children.Add(_tabInboxBtn);

            tabsLayout.Children.Add(tabsGrid);

            // Row 2: Content
            Grid content = new Grid();
            Grid.SetRow(content, 2);
            _mainContentGrid.Children.Add(content);
            _contentGrid = content;

            // Focus Panel
            _focusPanel = new Grid();
            _focusScroll = new ScrollViewer();
            _focusScroll.VerticalScrollBarVisibility = ScrollBarVisibility.Hidden;
            _focusScroll.HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled;
            _focusScroll.HorizontalContentAlignment = HorizontalAlignment.Stretch;
            _focusScroll.Background = Brushes.Transparent;
            _focusList = new StackPanel();
            _focusList.HorizontalAlignment = HorizontalAlignment.Stretch;
            _focusScroll.Content = _focusList;
            _focusPanel.Children.Add(_focusScroll);
            content.Children.Add(_focusPanel);

            // Task Panel (带自适应长文本输入卡片)
            _taskPanel = new Grid();
            _taskScroll = new ScrollViewer();
            _taskScroll.VerticalScrollBarVisibility = ScrollBarVisibility.Hidden;
            _taskScroll.HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled;
            _taskScroll.HorizontalContentAlignment = HorizontalAlignment.Stretch;
            _taskScroll.Background = Brushes.Transparent;
            StackPanel taskStack = new StackPanel();
            taskStack.HorizontalAlignment = HorizontalAlignment.Stretch;
            _taskList = new StackPanel();
            _taskList.HorizontalAlignment = HorizontalAlignment.Stretch;

            _taskInputContainer = new Border();
            _taskInputContainer.BorderThickness = new Thickness(1.2);
            _taskInputContainer.CornerRadius = new CornerRadius(6);
            _taskInputContainer.Padding = new Thickness(12, 10, 12, 10);
            _taskInputContainer.Margin = new Thickness(0, 0, 0, 10);

            StackPanel taskInputLayout = new StackPanel();
            _taskInput = new TextBox();
            _taskInput.Style = CreateTextBoxStyle();
            _taskInput.AcceptsReturn = true;
            _taskInput.TextWrapping = TextWrapping.Wrap;
            _taskInput.MinHeight = 56;
            _taskInput.MaxHeight = 130;
            _taskInput.VerticalScrollBarVisibility = ScrollBarVisibility.Hidden;
            _taskInput.Padding = new Thickness(2, 4, 2, 4);
            _taskInput.BorderThickness = new Thickness(0);
            _taskInput.FontSize = 12.5;
            _taskInput.CaretBrush = Brush(_palette.TextPrimary);
            _taskInput.ToolTip = "添加待办任务 (Shift+Enter 换行，Ctrl+Enter 添加)";
            _taskInput.KeyDown += delegate(object s, KeyEventArgs e)
            {
                if (e.Key == Key.Enter && (Keyboard.Modifiers & ModifierKeys.Control) == ModifierKeys.Control)
                {
                    e.Handled = true;
                    AddTask();
                }
            };
            taskInputLayout.Children.Add(_taskInput);

            // 构建符合主题的高级紧凑型紧急程度自定义下拉选择框 (Dropdown Trigger)
            _priDropdownBtn = new Button();
            _priDropdownBtn.Style = CreateButtonStyle();
            _priDropdownBtn.Height = 24;
            _priDropdownBtn.Padding = new Thickness(7, 2, 7, 2);
            _priDropdownBtn.ToolTip = "点击选择任务紧急程度 (P0~P5)";

            StackPanel triggerStack = new StackPanel();
            triggerStack.Orientation = Orientation.Horizontal;
            triggerStack.VerticalAlignment = VerticalAlignment.Center;

            _priDropdownBadgeBorder = new Border();
            _priDropdownBadgeBorder.CornerRadius = new CornerRadius(3);
            _priDropdownBadgeBorder.Padding = new Thickness(4, 1, 4, 1);
            _priDropdownBadgeBorder.Margin = new Thickness(0, 0, 5, 0);
            _priDropdownBadgeText = Text("P3", 9, "#FFFFFF", FontWeights.Bold, "Consolas");
            _priDropdownBadgeBorder.Child = _priDropdownBadgeText;
            triggerStack.Children.Add(_priDropdownBadgeBorder);

            _priDropdownLabelText = Text("普通", 10.5, _palette.TextPrimary, FontWeights.Normal);
            _priDropdownLabelText.VerticalAlignment = VerticalAlignment.Center;
            triggerStack.Children.Add(_priDropdownLabelText);

            _priDropdownArrowText = Text(" ▾", 9, _palette.TextMuted, FontWeights.Normal);
            _priDropdownArrowText.VerticalAlignment = VerticalAlignment.Center;
            _priDropdownArrowText.Margin = new Thickness(2, 0, 0, 0);
            triggerStack.Children.Add(_priDropdownArrowText);

            _priDropdownBtn.Content = triggerStack;
            _priDropdownBtn.Click += delegate
            {
                if (_priDropdownPopup != null)
                {
                    _priDropdownPopup.IsOpen = !_priDropdownPopup.IsOpen;
                }
            };

            // 下拉菜单弹出层 (Popup)
            _priDropdownPopup = new Popup();
            _priDropdownPopup.PlacementTarget = _priDropdownBtn;
            _priDropdownPopup.Placement = PlacementMode.Bottom;
            _priDropdownPopup.VerticalOffset = 4;
            _priDropdownPopup.StaysOpen = false;
            _priDropdownPopup.AllowsTransparency = true;
            _priDropdownPopup.PopupAnimation = PopupAnimation.Fade;

            _priDropdownMenuBorder = new Border();
            _priDropdownMenuBorder.CornerRadius = new CornerRadius(6);
            _priDropdownMenuBorder.BorderThickness = new Thickness(1.2);
            _priDropdownMenuBorder.Padding = new Thickness(4);
            _priDropdownMenuBorder.MinWidth = 142;
            _priDropdownMenuBorder.Background = Brush(_palette.ModalPanelBg);
            _priDropdownMenuBorder.BorderBrush = Brush(_palette.ModalPanelBorder);
            _priDropdownMenuBorder.Effect = new DropShadowEffect
            {
                BlurRadius = 16,
                ShadowDepth = 4,
                Opacity = 0.35,
                Color = Colors.Black
            };

            StackPanel menuItemsStack = new StackPanel();
            for (int i = 0; i < PriKeys.Length; i++)
            {
                int idx = i;
                string key = PriKeys[i];
                string name = PriNames[i];

                Button itemBtn = new Button();
                itemBtn.Style = CreateButtonStyle();
                itemBtn.Height = 26;
                itemBtn.Padding = new Thickness(6, 3, 6, 3);
                itemBtn.Margin = new Thickness(0, 1, 0, 1);
                itemBtn.HorizontalContentAlignment = HorizontalAlignment.Stretch;

                Grid itemGrid = new Grid();
                itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

                Border badge = new Border();
                badge.CornerRadius = new CornerRadius(3);
                badge.Padding = new Thickness(4, 1, 4, 1);
                badge.Margin = new Thickness(0, 0, 7, 0);
                badge.Background = Brush(PriorityBgColor(key));
                TextBlock bText = Text("P" + i, 9, PriorityTextColor(key), FontWeights.Bold, "Consolas");
                badge.Child = bText;
                Grid.SetColumn(badge, 0);
                itemGrid.Children.Add(badge);

                TextBlock nameText = Text(name, 11, _palette.TextPrimary, FontWeights.Normal);
                nameText.VerticalAlignment = VerticalAlignment.Center;
                _priDropdownMenuLabels[i] = nameText;
                Grid.SetColumn(nameText, 1);
                itemGrid.Children.Add(nameText);

                TextBlock checkText = Text("✓", 10.5, _palette.TextPrimary, FontWeights.Bold);
                checkText.VerticalAlignment = VerticalAlignment.Center;
                checkText.Visibility = key == _selectedTaskPriority ? Visibility.Visible : Visibility.Collapsed;
                _priDropdownMenuChecks[i] = checkText;
                Grid.SetColumn(checkText, 2);
                itemGrid.Children.Add(checkText);

                itemBtn.Content = itemGrid;
                itemBtn.Click += delegate
                {
                    SelectTaskInputPriority(key);
                    _priDropdownPopup.IsOpen = false;
                    _taskInput.Focus();
                };

                _priDropdownMenuItems[i] = itemBtn;
                menuItemsStack.Children.Add(itemBtn);
            }

            _priDropdownMenuBorder.Child = menuItemsStack;
            _priDropdownPopup.Child = _priDropdownMenuBorder;

            // 底部操作栏: 左侧放置自定义下拉选择框与快捷提示，右侧放置圆圈加号按钮
            Grid taskInputBar = new Grid();
            taskInputBar.Margin = new Thickness(0, 8, 0, 0);
            taskInputBar.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            taskInputBar.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            StackPanel barLeft = new StackPanel();
            barLeft.Orientation = Orientation.Horizontal;
            barLeft.VerticalAlignment = VerticalAlignment.Center;
            barLeft.Children.Add(_priDropdownBtn);

            _taskInputHint = Text("Shift+Enter 换行 · Ctrl+Enter 添加", 9.5, _palette.TextMuted, FontWeights.Normal);
            _taskInputHint.VerticalAlignment = VerticalAlignment.Center;
            _taskInputHint.Margin = new Thickness(8, 0, 0, 0);
            barLeft.Children.Add(_taskInputHint);

            Grid.SetColumn(barLeft, 0);
            taskInputBar.Children.Add(barLeft);

            _addTaskButton = NewRoundIconButton("circle-plus", _palette.TextPrimary, 28, 16);
            _addTaskButton.ToolTip = "添加任务 (Ctrl+Enter)";
            _addTaskButton.Click += delegate { AddTask(); };
            Grid.SetColumn(_addTaskButton, 1);
            taskInputBar.Children.Add(_addTaskButton);

            taskInputLayout.Children.Add(taskInputBar);
            taskInputLayout.Children.Add(_priDropdownPopup);
            SelectTaskInputPriority("p3");
            _taskInputContainer.Child = taskInputLayout;

            taskStack.Children.Add(_taskInputContainer);
            taskStack.Children.Add(_taskList);
            _taskScroll.Content = taskStack;
            _taskPanel.Children.Add(_taskScroll);
            content.Children.Add(_taskPanel);

            // Inbox Panel (多行闪念大输入区)
            _inboxPanel = new Grid();
            _ideaScroll = new ScrollViewer();
            _ideaScroll.VerticalScrollBarVisibility = ScrollBarVisibility.Hidden;
            _ideaScroll.HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled;
            _ideaScroll.HorizontalContentAlignment = HorizontalAlignment.Stretch;
            _ideaScroll.Background = Brushes.Transparent;
            StackPanel inboxStack = new StackPanel();
            inboxStack.HorizontalAlignment = HorizontalAlignment.Stretch;
            _ideaList = new StackPanel();
            _ideaList.HorizontalAlignment = HorizontalAlignment.Stretch;

            _ideaInputContainer = new Border();
            _ideaInputContainer.BorderThickness = new Thickness(1.2);
            _ideaInputContainer.CornerRadius = new CornerRadius(6);
            _ideaInputContainer.Padding = new Thickness(12, 10, 12, 10);
            _ideaInputContainer.Margin = new Thickness(0, 0, 0, 10);

            StackPanel ideaInputLayout = new StackPanel();
            _ideaInput = new TextBox();
            _ideaInput.Style = CreateTextBoxStyle();
            _ideaInput.AcceptsReturn = true;
            _ideaInput.TextWrapping = TextWrapping.Wrap;
            _ideaInput.MinHeight = 56;
            _ideaInput.MaxHeight = 130;
            _ideaInput.VerticalScrollBarVisibility = ScrollBarVisibility.Hidden;
            _ideaInput.Padding = new Thickness(2, 4, 2, 4);
            _ideaInput.BorderThickness = new Thickness(0);
            _ideaInput.FontSize = 12.5;
            _ideaInput.CaretBrush = Brush(_palette.TextPrimary);
            _ideaInput.ToolTip = "捕捉灵感想法 (Shift+Enter 换行，Ctrl+Enter 存入收纳柜)";
            _ideaInput.KeyDown += delegate(object s, KeyEventArgs e)
            {
                if (e.Key == Key.Enter && (Keyboard.Modifiers & ModifierKeys.Control) == ModifierKeys.Control)
                {
                    e.Handled = true;
                    AddIdea();
                }
            };
            ideaInputLayout.Children.Add(_ideaInput);

            Grid ideaInputBar = new Grid();
            ideaInputBar.Margin = new Thickness(0, 6, 0, 0);
            ideaInputBar.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            ideaInputBar.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            _ideaInputHint = Text("Shift+Enter 换行 · Ctrl+Enter 存入灵感收纳柜", 9.5, _palette.TextMuted, FontWeights.Normal);
            _ideaInputHint.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(_ideaInputHint, 0);
            ideaInputBar.Children.Add(_ideaInputHint);

            _addIdeaButton = NewRoundIconButton("circle-plus", _palette.TextPrimary, 28, 16);
            _addIdeaButton.ToolTip = "存入灵感收纳柜 (Ctrl+Enter)";
            _addIdeaButton.Click += delegate { AddIdea(); };
            Grid.SetColumn(_addIdeaButton, 1);
            ideaInputBar.Children.Add(_addIdeaButton);

            ideaInputLayout.Children.Add(ideaInputBar);
            _ideaInputContainer.Child = ideaInputLayout;

            inboxStack.Children.Add(_ideaInputContainer);
            inboxStack.Children.Add(_ideaList);
            _ideaScroll.Content = inboxStack;
            _inboxPanel.Children.Add(_ideaScroll);
            content.Children.Add(_inboxPanel);

            // 显式初始化面板可见性：首帧仅焦点面板可见，任务与灵感收纳柜必须折叠，杜绝多面板融叠
            _focusPanel.Visibility = Visibility.Visible;
            _taskPanel.Visibility = Visibility.Collapsed;
            _inboxPanel.Visibility = Visibility.Collapsed;

            // Row 3: Footer
            Grid footer = new Grid();
            footer.Margin = new Thickness(0, 10, 0, 0);
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            Grid.SetRow(footer, 3);
            _mainContentGrid.Children.Add(footer);

            // 底栏左侧: 规范版本号 0.0.1 β
            StackPanel footerLeft = new StackPanel();
            footerLeft.Orientation = Orientation.Horizontal;
            footerLeft.VerticalAlignment = VerticalAlignment.Center;

            _versionBadge = new Border();
            _versionBadge.CornerRadius = new CornerRadius(3.5);
            _versionBadge.Padding = new Thickness(6, 2, 6, 2);
            _versionBadge.Background = Brush(_palette.CardBg);
            _versionBadge.BorderBrush = Brush(_palette.CardBorder);
            _versionBadge.BorderThickness = new Thickness(1);
            _versionBadge.ToolTip = "Omni Plan 当前版本";

            _versionText = Text("0.0.1 β", 10, _palette.TextMuted, FontWeights.SemiBold, "Segoe UI, Consolas");
            _versionBadge.Child = _versionText;
            footerLeft.Children.Add(_versionBadge);

            _copyStatus = Text("", 10.5, _palette.TextSecondary, FontWeights.SemiBold);
            _copyStatus.Margin = new Thickness(8, 0, 0, 0);
            _copyStatus.VerticalAlignment = VerticalAlignment.Center;
            footerLeft.Children.Add(_copyStatus);

            Grid.SetColumn(footerLeft, 0);
            footer.Children.Add(footerLeft);

            // 底栏右侧: 总结与导入按钮
            StackPanel footerRight = new StackPanel();
            footerRight.Orientation = Orientation.Horizontal;
            footerRight.VerticalAlignment = VerticalAlignment.Center;

            _dshTaskButton = NewButton("整理 Omni Plan", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.5);
            _dshTaskButton.Padding = new Thickness(8, 3.5, 8, 3.5);
            _dshTaskButton.Margin = new Thickness(0, 0, 5, 0);
            _dshTaskButton.ToolTip = CreateModernToolTip("打开任务整理独立窗口：在此整理全部内容（灵感转任务、任务转焦点、创立新任务），并一键直接注入到当前对话待办列表中（静默写入，不发送任何提示词）");
            ToolTipService.SetInitialShowDelay(_dshTaskButton, 60);
            ToolTipService.SetShowDuration(_dshTaskButton, 12000);
            _dshTaskButton.Click += delegate
            {
                OpenOrganizeWindow();
            };

            _summaryButton = NewButton("AI总结", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.5);
            _summaryButton.Padding = new Thickness(8, 3.5, 8, 3.5);
            _summaryButton.Margin = new Thickness(0, 0, 5, 0);
            _summaryButton.ToolTip = CreateModernToolTip("点击后即可复制提示词发送给任意 AI，AI 就会用指定格式回复你；复制后点击导入，即可整理为我们的任务待办或者灵感。");
            _summaryButton.Click += delegate
            {
                CopySummaryPromptToClipboard();
            };

            _importButton = NewButton("导入", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.5);
            _importButton.Padding = new Thickness(8, 3.5, 8, 3.5);
            _importButton.ToolTip = "从剪贴板解析 AI 生成的代码块并批量导入任务与灵感";
            _importButton.Click += delegate
            {
                ImportFromClipboard();
            };

            footerRight.Children.Add(_dshTaskButton);
            footerRight.Children.Add(_summaryButton);
            footerRight.Children.Add(_importButton);

            Grid.SetColumn(footerRight, 1);
            footer.Children.Add(footerRight);

            // -------------------------------------------------------------
            // 全屏模态遮罩层 (Delete Confirm Dialog Overlay)
            // 直接置于 _rootGrid 顶层，100% 紧密贴合外框边角，消除任何 padding 泄漏
            // -------------------------------------------------------------
            _confirmOverlay = new Border();
            _confirmOverlay.Visibility = Visibility.Collapsed;
            _confirmOverlay.CornerRadius = new CornerRadius(11);
            _confirmOverlay.Padding = new Thickness(20);
            Panel.SetZIndex(_confirmOverlay, 50);
            _rootGrid.Children.Add(_confirmOverlay);

            _confirmPanel = new Border();
            _confirmPanel.BorderThickness = new Thickness(1.2);
            _confirmPanel.CornerRadius = new CornerRadius(8);
            _confirmPanel.Padding = new Thickness(18);
            _confirmPanel.VerticalAlignment = VerticalAlignment.Center;
            _confirmPanel.HorizontalAlignment = HorizontalAlignment.Center;
            _confirmPanel.MaxWidth = 340;
            _confirmOverlay.Child = _confirmPanel;

            StackPanel confirmStack = new StackPanel();
            _confirmTitle = Text("确认删除", 13.5, _palette.TextPrimary, FontWeights.Bold);
            confirmStack.Children.Add(_confirmTitle);
            _confirmText = Text("", 12, _palette.TextSecondary, FontWeights.Normal);
            _confirmText.Margin = new Thickness(0, 8, 0, 14);
            confirmStack.Children.Add(_confirmText);

            StackPanel confirmActions = new StackPanel();
            confirmActions.Orientation = Orientation.Horizontal;
            confirmActions.HorizontalAlignment = HorizontalAlignment.Right;

            // 取消按钮使用 close 图标
            _confirmCancelBtn = NewActionBtn("close", "取消", _palette.ButtonBg, _palette.ButtonFg, _palette.ButtonBorder, 12, 11);
            _confirmCancelBtn.Click += delegate { HideConfirm(); };
            confirmActions.Children.Add(_confirmCancelBtn);

            // 确认删除按钮使用 check-icon 图标
            _confirmYesBtn = NewActionBtn("check-icon", "确认删除", _palette.DeleteBtnBg, _palette.DeleteBtnFg, _palette.DeleteBtnBorder, 13, 11);
            _confirmYesBtn.Margin = new Thickness(8, 0, 0, 0);
            _confirmYesBtn.Click += delegate { ConfirmDelete(); };
            confirmActions.Children.Add(_confirmYesBtn);

            confirmStack.Children.Add(confirmActions);
            _confirmPanel.Child = confirmStack;

            // -------------------------------------------------------------
            // 全屏模态大编辑弹窗 (Modal Editor Overlay)
            // 直接置于 _rootGrid 顶层，100% 紧密贴合外框边角，消除任何 padding 泄漏
            // -------------------------------------------------------------
            _editModalOverlay = new Border();
            _editModalOverlay.Visibility = Visibility.Collapsed;
            _editModalOverlay.CornerRadius = new CornerRadius(11);
            _editModalOverlay.Padding = new Thickness(16);
            Panel.SetZIndex(_editModalOverlay, 60);
            _rootGrid.Children.Add(_editModalOverlay);

            _editModalPanel = new Border();
            _editModalPanel.BorderThickness = new Thickness(1.2);
            _editModalPanel.CornerRadius = new CornerRadius(10);
            _editModalPanel.Padding = new Thickness(20, 18, 20, 18);
            _editModalPanel.VerticalAlignment = VerticalAlignment.Center;
            _editModalPanel.HorizontalAlignment = HorizontalAlignment.Stretch;
            _editModalOverlay.Child = _editModalPanel;

            StackPanel editStack = new StackPanel();
            Grid editHeader = new Grid();
            editHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            editHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            _editModalTitle = Text("编辑内容", 13.5, _palette.TextPrimary, FontWeights.Bold);
            Grid.SetColumn(_editModalTitle, 0);
            editHeader.Children.Add(_editModalTitle);

            // 模态弹窗右上角关闭按钮：全面替换为 close.svg 矢量图标
            _editModalHeaderCloseBtn = NewIconButton("close", _palette.TextSecondary, _palette.ButtonBg, _palette.ButtonBorder, 24, 24, 12, 0.5, 0.5);
            _editModalHeaderCloseBtn.ToolTip = "关闭 (Esc)";
            _editModalHeaderCloseBtn.Click += delegate { HideEditModal(); };
            Grid.SetColumn(_editModalHeaderCloseBtn, 1);
            editHeader.Children.Add(_editModalHeaderCloseBtn);
            editStack.Children.Add(editHeader);

            // ================= 任务编辑模式组件 =================
            _editTaskSection = new StackPanel();
            _editTaskSection.Margin = new Thickness(0, 10, 0, 0);

            _editModalTextBox = new TextBox();
            _editModalTextBox.Style = CreateTextBoxStyle();
            _editModalTextBox.AcceptsReturn = true;
            _editModalTextBox.TextWrapping = TextWrapping.Wrap;
            _editModalTextBox.MinHeight = 140;
            _editModalTextBox.MaxHeight = 260;
            _editModalTextBox.Margin = new Thickness(0, 0, 0, 10);
            _editModalTextBox.Padding = new Thickness(10);
            _editModalTextBox.FontSize = 13;
            _editModalTextBox.KeyDown += delegate(object s, KeyEventArgs e)
            {
                if (e.Key == Key.Enter && (Keyboard.Modifiers & ModifierKeys.Control) == ModifierKeys.Control)
                {
                    e.Handled = true;
                    SaveEditModal();
                }
            };
            _editTaskSection.Children.Add(_editModalTextBox);

            _editPriorityRow = new WrapPanel();
            _editPriorityRow.Orientation = Orientation.Horizontal;
            _editPriorityRow.Margin = new Thickness(0, 0, 0, 14);
            TextBlock priLabel = Text("优先级：", 11.5, _palette.TextSecondary, FontWeights.Normal);
            priLabel.VerticalAlignment = VerticalAlignment.Center;
            priLabel.Margin = new Thickness(0, 0, 6, 0);
            _editPriorityRow.Children.Add(priLabel);

            for (int i = 0; i < PriKeys.Length; i++)
            {
                string key = PriKeys[i];
                string name = PriNames[i];
                Button btn = NewButton("P" + i, _palette.ButtonBg, _palette.ButtonFg, _palette.ButtonBorder, 11);
                btn.Padding = new Thickness(8, 3, 8, 3);
                btn.Margin = new Thickness(0, 0, 5, 4);
                btn.ToolTip = name;
                btn.Click += delegate { SelectPriority(key); };
                _priBtns[i] = btn;
                _editPriorityRow.Children.Add(btn);
            }
            _editTaskSection.Children.Add(_editPriorityRow);
            editStack.Children.Add(_editTaskSection);

            // ================= 焦点锚点编辑模式组件 (三大字段完整编辑) =================
            _editContextSection = new StackPanel();
            _editContextSection.Margin = new Thickness(0, 12, 0, 12);

            _editContextWsLabel = Text("标题 / 项目名称", 11.5, _palette.TextPrimary, FontWeights.SemiBold);
            _editContextWsLabel.Margin = new Thickness(0, 0, 0, 5);
            _editContextSection.Children.Add(_editContextWsLabel);

            _editContextWsInput = NewMultilineTextBox("项目或工作区名称", 34, 65);
            _editContextWsInput.Margin = new Thickness(0, 0, 0, 12);
            _editContextSection.Children.Add(_editContextWsInput);

            _editContextDoingLabel = Text("AI 正在执行的内容", 11.5, _palette.TextPrimary, FontWeights.SemiBold);
            _editContextDoingLabel.Margin = new Thickness(0, 0, 0, 5);
            _editContextSection.Children.Add(_editContextDoingLabel);

            _editContextDoingInput = NewMultilineTextBox("当前任务与执行细节", 50, 95);
            _editContextDoingInput.Margin = new Thickness(0, 0, 0, 12);
            _editContextSection.Children.Add(_editContextDoingInput);

            _editContextNextLabel = Text("你回来后的下一步 (接手行动)", 11.5, _palette.TextPrimary, FontWeights.SemiBold);
            _editContextNextLabel.Margin = new Thickness(0, 0, 0, 5);
            _editContextSection.Children.Add(_editContextNextLabel);

            _editContextNextInput = NewMultilineTextBox("人类稍后回来需要接手的行动与后续安排", 60, 115);
            _editContextNextInput.Margin = new Thickness(0, 0, 0, 4);
            _editContextSection.Children.Add(_editContextNextInput);

            editStack.Children.Add(_editContextSection);

            // 模态弹窗底部操作工具栏
            Grid editFooter = new Grid();
            editFooter.Margin = new Thickness(0, 6, 0, 0);
            editFooter.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            editFooter.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            TextBlock editHint = Text("Ctrl+Enter 保存 · Esc 取消", 10, _palette.TextMuted, FontWeights.Normal);
            editHint.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(editHint, 0);
            editFooter.Children.Add(editHint);

            StackPanel editBtns = new StackPanel();
            editBtns.Orientation = Orientation.Horizontal;

            // 取消按钮使用 close 图标
            _editModalCancelBtn = NewActionBtn("close", "取消", _palette.ButtonBg, _palette.ButtonFg, _palette.ButtonBorder, 12, 11);
            _editModalCancelBtn.Click += delegate { HideEditModal(); };
            editBtns.Children.Add(_editModalCancelBtn);

            // 确认保存按钮使用 check-icon 图标
            _editModalSaveBtn = NewActionBtn("check-icon", "保存修改", _palette.ButtonActiveBg, _palette.ButtonActiveFg, _palette.ButtonActiveBorder, 13, 11);
            _editModalSaveBtn.Margin = new Thickness(8, 0, 0, 0);
            _editModalSaveBtn.Click += delegate { SaveEditModal(); };
            editBtns.Children.Add(_editModalSaveBtn);

            Grid.SetColumn(editBtns, 1);
            editFooter.Children.Add(editBtns);
            editStack.Children.Add(editFooter);

            // 核心修复：将完整的输入表单与按钮堆叠面板挂载到模态框
            _editModalPanel.Child = editStack;

            // 快捷键支持：在焦点编辑的三大输入框内按 Ctrl+Enter 同样可快速保存
            KeyEventHandler handle_context_ctrl_enter = delegate(object s, KeyEventArgs e)
            {
                if (e.Key == Key.Enter && (Keyboard.Modifiers & ModifierKeys.Control) == ModifierKeys.Control)
                {
                    e.Handled = true;
                    SaveEditModal();
                }
            };
            _editContextWsInput.KeyDown += handle_context_ctrl_enter;
            _editContextDoingInput.KeyDown += handle_context_ctrl_enter;
            _editContextNextInput.KeyDown += handle_context_ctrl_enter;

            // 点击半透明遮罩背景空白处快速关闭弹窗
            _editModalOverlay.MouseDown += delegate(object s, MouseButtonEventArgs e)
            {
                if (e.OriginalSource == _editModalOverlay)
                {
                    HideEditModal();
                }
            };
        }

        private Button BuildTabItem(string label, int index, out Border badge, out TextBlock badgeText, out TextBlock labelBlock)
        {
            Button btn = new Button();
            btn.Style = CreateButtonStyle();
            btn.Padding = new Thickness(0);
            btn.Height = 28;

            StackPanel sp = new StackPanel();
            sp.Orientation = Orientation.Horizontal;
            sp.HorizontalAlignment = HorizontalAlignment.Center;
            sp.VerticalAlignment = VerticalAlignment.Center;

            labelBlock = Text(label, 11.5, _palette.TabInactiveFg, FontWeights.SemiBold);
            labelBlock.VerticalAlignment = VerticalAlignment.Center;
            sp.Children.Add(labelBlock);

            badge = new Border();
            badge.CornerRadius = new CornerRadius(3);
            badge.Padding = new Thickness(5, 1, 5, 1);
            badge.Margin = new Thickness(6, 0, 0, 0); // 紧贴汉字右边，绝对不重叠覆盖
            badge.VerticalAlignment = VerticalAlignment.Center;

            badgeText = Text("0", 9.5, _palette.BadgeInactiveFg, FontWeights.Bold, "Consolas");
            badgeText.VerticalAlignment = VerticalAlignment.Center;
            badge.Child = badgeText;
            sp.Children.Add(badge);

            btn.Content = sp;
            return btn;
        }

        public void ApplyThemeToVisuals()
        {
            // 窗口背景与外发光
            LinearGradientBrush brush = new LinearGradientBrush();
            brush.StartPoint = new Point(0, 0);
            brush.EndPoint = new Point(1, 1);
            brush.GradientStops.Add(new GradientStop((Color)ColorConverter.ConvertFromString(_palette.WindowBgStart), 0));
            brush.GradientStops.Add(new GradientStop((Color)ColorConverter.ConvertFromString(_palette.WindowBgEnd), 1));
            _rootBorder.Background = brush;
            _rootBorder.BorderBrush = Brush(_palette.WindowBorder);

            // Brand Header 控件
            _brandTitle.Foreground = Brush(_palette.TextPrimary);
            if (_brandLogoHost != null) _brandLogoHost.Child = CreateBrandLogoElement(24);

            _themeToggleButton.Content = CreateSvgIcon(GetThemeIconName(), _palette.TextSecondary, 13, 0.6, 0.6);
            _themeToggleButton.ToolTip = GetThemeTooltip();
            _themeToggleButton.Background = Brush(_palette.ButtonBg);
            _themeToggleButton.BorderBrush = Brush(_palette.ButtonBorder);

            _closeButton.Content = CreateSvgIcon("close", _palette.TextSecondary, 13, 0.6, 0.6);
            _closeButton.Background = Brush(_palette.ButtonBg);
            _closeButton.BorderBrush = Brush(_palette.ButtonBorder);

            // Tab 容器与滑动指示器刷新
            _tabsContainer.Background = Brush(_palette.TabContainerBg);
            _tabsContainer.BorderBrush = Brush(_palette.TabContainerBorder);
            if (_tabIndicator != null)
            {
                _tabIndicator.Background = Brush(_palette.TabActiveBg);
                _tabIndicator.BorderBrush = Brush(_palette.TabActiveBorder);
            }

            // 自适应输入卡片与自定义优先级下拉框
            _taskInputContainer.Background = Brush(_palette.InputBg);
            _taskInputContainer.BorderBrush = Brush(_palette.InputBorder);
            _taskInput.Background = Brushes.Transparent;
            _taskInput.Foreground = Brush(_palette.TextPrimary);
            Brush caretBrush = Brush(_palette.TextPrimary);
            _taskInput.CaretBrush = caretBrush;
            if (_ideaInput != null) _ideaInput.CaretBrush = caretBrush;
            if (_editModalTextBox != null) _editModalTextBox.CaretBrush = caretBrush;
            if (_editContextWsInput != null) _editContextWsInput.CaretBrush = caretBrush;
            if (_editContextDoingInput != null) _editContextDoingInput.CaretBrush = caretBrush;
            if (_editContextNextInput != null) _editContextNextInput.CaretBrush = caretBrush;
            _taskInputHint.Foreground = Brush(_palette.TextMuted);

            if (_priDropdownBtn != null)
            {
                _priDropdownBtn.Background = Brush(_palette.ButtonBg);
                _priDropdownBtn.BorderBrush = Brush(_palette.ButtonBorder);
                if (_priDropdownLabelText != null) _priDropdownLabelText.Foreground = Brush(_palette.TextPrimary);
                if (_priDropdownArrowText != null) _priDropdownArrowText.Foreground = Brush(_palette.TextMuted);
            }
            if (_priDropdownMenuBorder != null)
            {
                _priDropdownMenuBorder.Background = Brush(_palette.ModalPanelBg);
                _priDropdownMenuBorder.BorderBrush = Brush(_palette.ModalPanelBorder);
            }
            SelectTaskInputPriority(_selectedTaskPriority);

            if (_addTaskButton != null)
            {
                _addTaskButton.Style = CreateRoundButtonStyle();
                _addTaskButton.Content = CreateSvgIcon("circle-plus", _palette.TextPrimary, 16);
                _addTaskButton.Background = Brushes.Transparent;
                _addTaskButton.BorderBrush = Brushes.Transparent;
            }

            _ideaInputContainer.Background = Brush(_palette.InputBg);
            _ideaInputContainer.BorderBrush = Brush(_palette.InputBorder);
            _ideaInput.Background = Brushes.Transparent;
            _ideaInput.Foreground = Brush(_palette.TextPrimary);
            _ideaInputHint.Foreground = Brush(_palette.TextMuted);

            if (_addIdeaButton != null)
            {
                _addIdeaButton.Style = CreateRoundButtonStyle();
                _addIdeaButton.Content = CreateSvgIcon("circle-plus", _palette.TextPrimary, 16);
                _addIdeaButton.Background = Brushes.Transparent;
                _addIdeaButton.BorderBrush = Brushes.Transparent;
            }

            // 底栏
            if (_versionText != null) _versionText.Foreground = Brush(_palette.TextMuted);
            if (_versionBadge != null)
            {
                _versionBadge.Background = Brush(_palette.CardBg);
                _versionBadge.BorderBrush = Brush(_palette.CardBorder);
            }
            if (_dshTaskButton != null)
            {
                _dshTaskButton.Background = Brush(_palette.ButtonBg);
                _dshTaskButton.Foreground = Brush(_palette.TextSecondary);
                _dshTaskButton.BorderBrush = Brush(_palette.ButtonBorder);
            }
            if (_summaryButton != null)
            {
                _summaryButton.Background = Brush(_palette.ButtonBg);
                _summaryButton.Foreground = Brush(_palette.TextSecondary);
                _summaryButton.BorderBrush = Brush(_palette.ButtonBorder);
            }
            if (_importButton != null)
            {
                _importButton.Background = Brush(_palette.ButtonBg);
                _importButton.Foreground = Brush(_palette.TextSecondary);
                _importButton.BorderBrush = Brush(_palette.ButtonBorder);
            }
            _copyStatus.Foreground = Brush(_palette.TextSecondary);

            // 模态弹窗与遮罩层刷新
            if (_confirmOverlay != null) _confirmOverlay.Background = Brush(_palette.ModalOverlayBg);
            if (_confirmPanel != null)
            {
                _confirmPanel.Background = Brush(_palette.ModalPanelBg);
                _confirmPanel.BorderBrush = Brush(_palette.ModalPanelBorder);
            }
            if (_confirmTitle != null) _confirmTitle.Foreground = Brush(_palette.TextPrimary);
            if (_confirmText != null) _confirmText.Foreground = Brush(_palette.TextSecondary);
            if (_confirmCancelBtn != null)
            {
                _confirmCancelBtn.Content = CreateActionBtnContent("close", "取消", _palette.ButtonFg, 12, 11);
                _confirmCancelBtn.Background = Brush(_palette.ButtonBg);
                _confirmCancelBtn.BorderBrush = Brush(_palette.ButtonBorder);
            }
            if (_confirmYesBtn != null)
            {
                _confirmYesBtn.Content = CreateActionBtnContent("check-icon", "确认删除", _palette.DeleteBtnFg, 13, 11);
                _confirmYesBtn.Background = Brush(_palette.DeleteBtnBg);
                _confirmYesBtn.BorderBrush = Brush(_palette.DeleteBtnBorder);
            }

            if (_editModalOverlay != null) _editModalOverlay.Background = Brush(_palette.ModalOverlayBg);
            if (_editModalPanel != null)
            {
                _editModalPanel.Background = Brush(_palette.ModalPanelBg);
                _editModalPanel.BorderBrush = Brush(_palette.ModalPanelBorder);
            }
            if (_editModalTitle != null) _editModalTitle.Foreground = Brush(_palette.TextPrimary);
            if (_editModalHeaderCloseBtn != null)
            {
                _editModalHeaderCloseBtn.Content = CreateSvgIcon("close", _palette.TextSecondary, 12, 0.5, 0.5);
                _editModalHeaderCloseBtn.Background = Brush(_palette.ButtonBg);
                _editModalHeaderCloseBtn.BorderBrush = Brush(_palette.ButtonBorder);
            }
            if (_editModalTextBox != null)
            {
                _editModalTextBox.Background = Brush(_palette.InputBg);
                _editModalTextBox.Foreground = Brush(_palette.TextPrimary);
                _editModalTextBox.BorderBrush = Brush(_palette.InputBorder);
            }

            if (_editContextWsLabel != null) _editContextWsLabel.Foreground = Brush(_palette.TextPrimary);
            if (_editContextWsInput != null)
            {
                _editContextWsInput.Background = Brush(_palette.InputBg);
                _editContextWsInput.Foreground = Brush(_palette.TextPrimary);
                _editContextWsInput.BorderBrush = Brush(_palette.InputBorder);
            }
            if (_editContextDoingLabel != null) _editContextDoingLabel.Foreground = Brush(_palette.TextPrimary);
            if (_editContextDoingInput != null)
            {
                _editContextDoingInput.Background = Brush(_palette.InputBg);
                _editContextDoingInput.Foreground = Brush(_palette.TextPrimary);
                _editContextDoingInput.BorderBrush = Brush(_palette.InputBorder);
            }
            if (_editContextNextLabel != null) _editContextNextLabel.Foreground = Brush(_palette.TextPrimary);
            if (_editContextNextInput != null)
            {
                _editContextNextInput.Background = Brush(_palette.InputBg);
                _editContextNextInput.Foreground = Brush(_palette.TextPrimary);
                _editContextNextInput.BorderBrush = Brush(_palette.InputBorder);
            }

            if (_editModalCancelBtn != null)
            {
                _editModalCancelBtn.Content = CreateActionBtnContent("close", "取消", _palette.ButtonFg, 12, 11);
                _editModalCancelBtn.Background = Brush(_palette.ButtonBg);
                _editModalCancelBtn.BorderBrush = Brush(_palette.ButtonBorder);
            }
            if (_editModalSaveBtn != null)
            {
                _editModalSaveBtn.Content = CreateActionBtnContent("check-icon", "保存修改", _palette.ButtonActiveFg, 13, 11);
                _editModalSaveBtn.Background = Brush(_palette.ButtonActiveBg);
                _editModalSaveBtn.BorderBrush = Brush(_palette.ButtonActiveBorder);
            }

            UpdateTabStyles();
            RenderState();
        }

        private UIElement CreateActionBtnContent(string iconName, string text, string fg, double iconSize = 13, double fontSize = 11)
        {
            StackPanel sp = new StackPanel();
            sp.Orientation = Orientation.Horizontal;
            sp.VerticalAlignment = VerticalAlignment.Center;
            UIElement icon = CreateSvgIcon(iconName, fg, iconSize);
            sp.Children.Add(icon);
            if (!string.IsNullOrEmpty(text))
            {
                TextBlock tb = Text(text, fontSize, fg, FontWeights.SemiBold);
                tb.Margin = new Thickness(6, 0, 0, 0);
                tb.VerticalAlignment = VerticalAlignment.Center;
                sp.Children.Add(tb);
            }
            return sp;
        }

        private void ToggleTheme()
        {
            _themeMode = _themeMode == ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark;
            SaveThemePreference();
            AnimateThemeTransition();
            ShowCopyStatus(_themeMode == ThemeMode.Dark ? "深色主题" : "浅色主题", false);
        }

        
        
        private void AnimatePanelSlide(Grid panel, bool fromRight)
        {
            if (panel == null) return;
            panel.Opacity = 1.0; // 彻底去掉淡入淡出，保持 100% 不透明，纯粹展示从这里切到那里的滑动效果
            double startX = fromRight ? 45.0 : -45.0;
            TranslateTransform tt = new TranslateTransform(startX, 0);
            panel.RenderTransform = tt;

            DoubleAnimation transAnim = new DoubleAnimation(startX, 0.0, TimeSpan.FromMilliseconds(200));
            transAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };

            tt.BeginAnimation(TranslateTransform.XProperty, transAnim);
        }

        private void UpdateTabIndicatorPosition(bool animate)
        {
            if (_tabIndicator == null || _tabsContainer == null) return;
            double totalWidth = _tabsContainer.ActualWidth - 6; // 减去 padding 3*2
            if (totalWidth <= 0) return;

            double tabWidth = totalWidth / 3.0;
            _tabIndicator.Width = tabWidth;

            int activeIndex = _activeTab == "focus" ? 0 : (_activeTab == "tasks" ? 1 : 2);
            double targetX = activeIndex * tabWidth;

            if (animate)
            {
                DoubleAnimation anim = new DoubleAnimation(targetX, TimeSpan.FromMilliseconds(220));
                anim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
                _tabIndicatorTransform.BeginAnimation(TranslateTransform.XProperty, anim);
            }
            else
            {
                _tabIndicatorTransform.BeginAnimation(TranslateTransform.XProperty, null);
                _tabIndicatorTransform.X = targetX;
            }
        }

        private void AnimateThemeTransition()
        {
            try
            {
                // 1. 若已有进行中的旧遮罩，先移除清理，防止连续点击时重叠堆积
                if (_themeTransitionOverlay != null)
                {
                    _windowContainer.Children.Remove(_themeTransitionOverlay);
                    _themeTransitionOverlay = null;
                }

                // 2. 动态获取当前屏幕物理 DPI 缩放比 (如 125% 缩放对应 120 DPI)，消灭分辨率拉伸插值模糊与字体重排抖动
                PresentationSource source = PresentationSource.FromVisual(this);
                double dpiX = 96.0;
                double dpiY = 96.0;
                if (source != null && source.CompositionTarget != null)
                {
                    Matrix m = source.CompositionTarget.TransformToDevice;
                    dpiX = 96.0 * m.M11;
                    dpiY = 96.0 * m.M22;
                }

                int pixelW = (int)Math.Max(1, Math.Round(ActualWidth * (dpiX / 96.0)));
                int pixelH = (int)Math.Max(1, Math.Round(ActualHeight * (dpiY / 96.0)));

                // 3. 以真实物理像素精准渲染 _rootBorder 零位移静态位图
                RenderTargetBitmap rtb = new RenderTargetBitmap(pixelW, pixelH, dpiX, dpiY, PixelFormats.Pbgra32);
                rtb.Render(_rootBorder);
                rtb.Freeze();

                Image snapshot = new Image();
                snapshot.Source = rtb;
                snapshot.Width = ActualWidth;
                snapshot.Height = ActualHeight;
                snapshot.HorizontalAlignment = HorizontalAlignment.Left;
                snapshot.VerticalAlignment = VerticalAlignment.Top;
                snapshot.IsHitTestVisible = false;
                RenderOptions.SetBitmapScalingMode(snapshot, BitmapScalingMode.NearestNeighbor);
                RenderOptions.SetEdgeMode(snapshot, EdgeMode.Aliased);

                // 4. 遮罩直接挂载至 _windowContainer (与 _rootBorder 同级并严格覆盖在 (0,0)，彻底消除边框 1.2px 位移跳变)
                Border overlay = new Border();
                overlay.CornerRadius = _rootBorder.CornerRadius;
                overlay.Child = snapshot;
                overlay.HorizontalAlignment = HorizontalAlignment.Stretch;
                overlay.VerticalAlignment = VerticalAlignment.Stretch;
                overlay.IsHitTestVisible = false;
                Panel.SetZIndex(overlay, 9999);

                _themeTransitionOverlay = overlay;
                _windowContainer.Children.Add(overlay);

                // 5. 底层换肤为新主题颜色与动态元素
                ResolvePalette();
                ApplyThemeToVisuals();

                // 6. 顶层静态画面在 280ms 内丝滑淡出，0 抖动透出底层新主题
                DoubleAnimation fadeAnim = new DoubleAnimation(1.0, 0.0, TimeSpan.FromMilliseconds(280));
                fadeAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseInOut };
                fadeAnim.Completed += delegate
                {
                    if (_themeTransitionOverlay == overlay)
                    {
                        _windowContainer.Children.Remove(overlay);
                        _themeTransitionOverlay = null;
                    }
                };
                overlay.BeginAnimation(UIElement.OpacityProperty, fadeAnim);
            }
            catch (Exception ex)
            {
                Log("theme transition error: " + ex.Message);
                ResolvePalette();
                ApplyThemeToVisuals();
            }
        }

        private void AnimatePanelTransition(Grid panel)
        {
            if (panel == null) return;
            panel.Opacity = 0.0;
            TranslateTransform tt = new TranslateTransform(0, 8);
            panel.RenderTransform = tt;

            DoubleAnimation opacityAnim = new DoubleAnimation(0.0, 1.0, TimeSpan.FromMilliseconds(200));
            opacityAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };

            DoubleAnimation transAnim = new DoubleAnimation(8.0, 0.0, TimeSpan.FromMilliseconds(200));
            transAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };

            panel.BeginAnimation(UIElement.OpacityProperty, opacityAnim);
            tt.BeginAnimation(TranslateTransform.YProperty, transAnim);
        }

        private void AnimateShowOverlay(Border overlay, FrameworkElement panel)
        {
            if (overlay == null) return;
            overlay.Visibility = Visibility.Visible;
            overlay.Opacity = 0.0;
            DoubleAnimation fadeAnim = new DoubleAnimation(0.0, 1.0, TimeSpan.FromMilliseconds(200));
            fadeAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
            overlay.BeginAnimation(UIElement.OpacityProperty, fadeAnim);

            if (panel != null)
            {
                TransformGroup tg = new TransformGroup();
                ScaleTransform st = new ScaleTransform(0.95, 0.95);
                TranslateTransform tt = new TranslateTransform(0, 8);
                tg.Children.Add(st);
                tg.Children.Add(tt);

                panel.RenderTransformOrigin = new Point(0.5, 0.5);
                panel.RenderTransform = tg;
                panel.Opacity = 0.0;

                DoubleAnimation panelFade = new DoubleAnimation(0.0, 1.0, TimeSpan.FromMilliseconds(200));
                panelFade.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
                panel.BeginAnimation(UIElement.OpacityProperty, panelFade);

                DoubleAnimation scaleAnim = new DoubleAnimation(0.95, 1.0, TimeSpan.FromMilliseconds(220));
                scaleAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
                st.BeginAnimation(ScaleTransform.ScaleXProperty, scaleAnim);
                st.BeginAnimation(ScaleTransform.ScaleYProperty, scaleAnim);

                DoubleAnimation transAnim = new DoubleAnimation(8.0, 0.0, TimeSpan.FromMilliseconds(220));
                transAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
                tt.BeginAnimation(TranslateTransform.YProperty, transAnim);
            }
        }

        private void AnimateHideOverlay(Border overlay, FrameworkElement panel = null, Action onFinished = null)
        {
            if (overlay == null || overlay.Visibility != Visibility.Visible)
            {
                if (onFinished != null) onFinished();
                return;
            }

            DoubleAnimation fadeAnim = new DoubleAnimation(overlay.Opacity, 0.0, TimeSpan.FromMilliseconds(180));
            fadeAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };

            if (panel != null)
            {
                TransformGroup tg = new TransformGroup();
                ScaleTransform st = new ScaleTransform(1.0, 1.0);
                TranslateTransform tt = new TranslateTransform(0, 0);
                tg.Children.Add(st);
                tg.Children.Add(tt);

                panel.RenderTransformOrigin = new Point(0.5, 0.5);
                panel.RenderTransform = tg;

                DoubleAnimation panelFade = new DoubleAnimation(panel.Opacity, 0.0, TimeSpan.FromMilliseconds(160));
                panelFade.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
                panel.BeginAnimation(UIElement.OpacityProperty, panelFade);

                DoubleAnimation scaleAnim = new DoubleAnimation(1.0, 0.95, TimeSpan.FromMilliseconds(180));
                scaleAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
                st.BeginAnimation(ScaleTransform.ScaleXProperty, scaleAnim);
                st.BeginAnimation(ScaleTransform.ScaleYProperty, scaleAnim);

                DoubleAnimation transAnim = new DoubleAnimation(0.0, 8.0, TimeSpan.FromMilliseconds(180));
                transAnim.EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut };
                tt.BeginAnimation(TranslateTransform.YProperty, transAnim);
            }

            fadeAnim.Completed += delegate
            {
                overlay.Visibility = Visibility.Collapsed;
                overlay.Opacity = 1.0;
                if (panel != null)
                {
                    panel.Opacity = 1.0;
                    panel.RenderTransform = null;
                }
                if (onFinished != null) onFinished();
            };
            overlay.BeginAnimation(UIElement.OpacityProperty, fadeAnim);
        }

        private void SwitchTab(string tab, bool animate = true)
        {
            if (_activeTab == tab) return;
            int oldIndex = string.IsNullOrEmpty(_activeTab) ? 0 : (_activeTab == "focus" ? 0 : (_activeTab == "tasks" ? 1 : 2));
            int newIndex = tab == "focus" ? 0 : (tab == "tasks" ? 1 : 2);
            bool slideFromRight = newIndex > oldIndex;
            bool shouldAnimate = animate && !string.IsNullOrEmpty(_activeTab);
            _activeTab = tab;

            _focusPanel.Visibility = tab == "focus" ? Visibility.Visible : Visibility.Collapsed;
            _taskPanel.Visibility = tab == "tasks" ? Visibility.Visible : Visibility.Collapsed;
            _inboxPanel.Visibility = tab == "inbox" ? Visibility.Visible : Visibility.Collapsed;

            Grid activePanel = tab == "focus" ? _focusPanel : (tab == "tasks" ? _taskPanel : _inboxPanel);
            if (shouldAnimate)
            {
                AnimatePanelSlide(activePanel, slideFromRight);
            }
            else
            {
                activePanel.Opacity = 1.0;
                activePanel.RenderTransform = new TranslateTransform(0, 0);
            }

            UpdateTabIndicatorPosition(shouldAnimate);
            UpdateTabStyles();
        }

        private void UpdateTabStyles()
        {
            ApplySingleTabStyle(_tabFocusBtn, _tabFocusText, _tabFocusBadge, _tabFocusBadgeText, _activeTab == "focus");
            ApplySingleTabStyle(_tabTasksBtn, _tabTasksText, _tabTasksBadge, _tabTasksBadgeText, _activeTab == "tasks");
            ApplySingleTabStyle(_tabInboxBtn, _tabInboxText, _tabInboxBadge, _tabInboxBadgeText, _activeTab == "inbox");
        }

        private void ApplySingleTabStyle(Button btn, TextBlock label, Border badge, TextBlock badgeText, bool isActive)
        {
            btn.Background = Brushes.Transparent;
            btn.BorderBrush = Brushes.Transparent;

            if (isActive)
            {
                label.Foreground = Brush(_palette.TabActiveFg);
                badge.Background = Brush(_palette.BadgeActiveBg);
                badgeText.Foreground = Brush(_palette.BadgeActiveFg);
            }
            else
            {
                label.Foreground = Brush(_palette.TabInactiveFg);
                badge.Background = Brush(_palette.BadgeInactiveBg);
                badgeText.Foreground = Brush(_palette.BadgeInactiveFg);
            }
        }

        private void OpenTaskEditModal(TaskItem task)
        {
            _editingMode = "task";
            _editingTaskObj = task;
            _editingContextObj = null;

            _editModalTitle.Text = "编辑任务内容";
            _editTaskSection.Visibility = Visibility.Visible;
            _editContextSection.Visibility = Visibility.Collapsed;

            _editModalTextBox.Text = task.Title ?? "";
            SelectPriority(task.Priority ?? "medium");

            AnimateShowOverlay(_editModalOverlay, _editModalPanel);
            Dispatcher.BeginInvoke(new Action(delegate
            {
                _editModalTextBox.Focus();
                _editModalTextBox.SelectAll();
            }), System.Windows.Threading.DispatcherPriority.Input);
        }

        private void OpenContextEditModal(ContextItem context)
        {
            _editingMode = "context";
            _editingContextObj = context;
            _editingTaskObj = null;

            _editModalTitle.Text = "编辑焦点锚点";
            _editTaskSection.Visibility = Visibility.Collapsed;
            _editContextSection.Visibility = Visibility.Visible;

            _editContextWsInput.Text = context.Workspace ?? "";
            _editContextDoingInput.Text = context.CurrentDoing ?? "";
            _editContextNextInput.Text = context.NextActionForHuman ?? "";

            AnimateShowOverlay(_editModalOverlay, _editModalPanel);
            Dispatcher.BeginInvoke(new Action(delegate
            {
                _editContextWsInput.Focus();
                _editContextWsInput.SelectAll();
            }), System.Windows.Threading.DispatcherPriority.Input);
        }

        private void HideEditModal()
        {
            _editingMode = "";
            _editingTaskObj = null;
            _editingContextObj = null;
            AnimateHideOverlay(_editModalOverlay, _editModalPanel, null);
        }

        private void SaveEditModal()
        {
            if (_editingMode == "task" && _editingTaskObj != null)
            {
                string content = (_editModalTextBox.Text ?? "").Trim();
                if (string.IsNullOrEmpty(content)) return;

                try
                {
                    Dictionary<string, object> body = new Dictionary<string, object>();
                    body["title"] = content;
                    body["priority"] = _selectedEditPriority;
                    _api.Patch("/tasks/" + Uri.EscapeDataString(_editingTaskObj.Id), body);
                    HideEditModal();
                    RefreshState(true);
                    ShowCopyStatus("任务已更新", false);
                }
                catch (Exception error)
                {
                    ShowCopyStatus("更新失败", true);
                    Log("update task modal error: " + error.Message);
                }
            }
            else if (_editingMode == "context" && _editingContextObj != null)
            {
                string ws = (_editContextWsInput.Text ?? "").Trim();
                string doing = (_editContextDoingInput.Text ?? "").Trim();
                string next = (_editContextNextInput.Text ?? "").Trim();

                if (string.IsNullOrEmpty(ws))
                {
                    ws = _editingContextObj.Workspace ?? "默认工作区";
                }

                try
                {
                    Dictionary<string, object> body = new Dictionary<string, object>();
                    body["id"] = _editingContextObj.Id;
                    body["workspace"] = ws;
                    body["agentStatus"] = _editingContextObj.AgentStatus;
                    body["currentDoing"] = doing;
                    body["nextActionForHuman"] = next;
                    _api.Post("/contexts", body);
                    HideEditModal();
                    RefreshState(true);
                    ShowCopyStatus("焦点锚点已更新", false);
                }
                catch (Exception error)
                {
                    ShowCopyStatus("保存失败", true);
                    Log("save context modal error: " + error.Message);
                }
            }
        }

        private string GetThemeIconName()
        {
            return _themeMode == ThemeMode.Dark ? "light" : "dark";
        }

        private string GetThemeTooltip()
        {
            return _themeMode == ThemeMode.Dark ? "切换为浅色主题" : "切换为深色主题";
        }

        private void CopySummaryPromptToClipboard()
        {
            try
            {
                StringBuilder sb = new StringBuilder();
                sb.AppendLine("请整理我们原先的对话，把我的想法转换成需要立即执行的「焦点」或者「任务」，或者它其实只是一个「灵感」。");
                sb.AppendLine();
                sb.AppendLine("判断标准：");
                sb.AppendLine("1. 希望实现的灵感焦点是：如果这段对话产生了一个需要持续跟踪的目标/方向，提炼成一条「焦点」；");
                sb.AppendLine("2. 我当下会立马动身去做的任务是：拆成可以直接执行的「任务」，并按 P0~P7 标注优先级（P0 最高）；");
                sb.AppendLine("3. 摆在看板里、未来有机会再点进去看、再讨论可行性的想法，放进「灵感」。");
                sb.AppendLine();
                sb.AppendLine("下面附上我当前看板的快照，供你参考、避免重复：");
                sb.AppendLine();
                sb.AppendLine("---");
                sb.AppendLine("【当前看板数据】");
                sb.AppendLine("## 1. 焦点锚点");
                lock (_state)
                {
                    if (_state.ActiveContexts != null && _state.ActiveContexts.Count > 0)
                    {
                        foreach (ContextItem ctx in _state.ActiveContexts)
                        {
                            if (ctx == null) continue;
                            sb.AppendLine(string.Format("- 工作区: {0} | 正在做: {1} | 下一步: {2}", ctx.Workspace, ctx.CurrentDoing, ctx.NextActionForHuman));
                        }
                    }
                    else
                    {
                        sb.AppendLine("(暂无焦点锚点)");
                    }

                    sb.AppendLine();
                    sb.AppendLine("## 2. 现有待办任务");
                    if (_state.Tasks != null && _state.Tasks.Count > 0)
                    {
                        foreach (TaskItem t in _state.Tasks)
                        {
                            if (t == null) continue;
                            string pri = string.IsNullOrEmpty(t.Priority) ? "P3" : t.Priority.ToUpperInvariant();
                            string notes = "";
                            if (!string.IsNullOrEmpty(t.Notes))
                            {
                                string cleanNotes = t.Notes.Replace("\r", "").Replace("\n", " ").Trim();
                                if (!string.IsNullOrEmpty(cleanNotes))
                                {
                                    notes = " (备注: " + cleanNotes + ")";
                                }
                            }
                            sb.AppendLine(string.Format("- [{0}] [{1}] {2}{3}", t.Status == "done" ? "x" : " ", pri, t.Title, notes));
                        }
                    }
                    else
                    {
                        sb.AppendLine("(暂无待办任务)");
                    }

                    sb.AppendLine();
                    sb.AppendLine("## 3. 灵感收纳柜");
                    if (_state.Inbox != null && _state.Inbox.Count > 0)
                    {
                        foreach (IdeaItem idea in _state.Inbox)
                        {
                            if (idea == null) continue;
                            sb.AppendLine("- " + idea.Content);
                        }
                    }
                    else
                    {
                        sb.AppendLine("(暂无未整理灵感)");
                    }
                }

                sb.AppendLine("---");
                sb.AppendLine();
                sb.AppendLine("【输出要求】");
                sb.AppendLine("请严格在回复的最后输出一个独立的 Markdown 代码块（语言标注为 ```omni-plan ），我会一键导入回看板。");
                sb.AppendLine("格式：每行一条，字段之间用 | 分隔；代码块之外可以照常写分析，但导入只读取代码块。请把下面的示例替换成真实内容，不要原样输出示例行。");
                sb.AppendLine();
                sb.AppendLine("```omni-plan");
                sb.AppendLine("[焦点] 工作区 | 正在执行 | 下一步行动");
                sb.AppendLine("[任务] P1 | 动宾结构的任务标题 | 验收标准或备注");
                sb.AppendLine("[任务] P3 | 第二个任务标题 | 备注");
                sb.AppendLine("[灵感] 一个以后再看、暂不执行的想法");
                sb.AppendLine("```");
                sb.AppendLine("补充：焦点最多一条，没有明确变化可省略；任务标题必须动宾结构、可直接执行、不要重复已有任务；灵感只放暂不执行的。");

                string promptText = sb.ToString();
                bool copied = SetClipboardTextNative(promptText);
                if (copied)
                {
                    ShowCopyStatus("已复制总结提示词，可直接发给任意 AI", false);
                }
                else
                {
                    ShowCopyStatus("复制提示词失败", true);
                }
            }
            catch (Exception ex)
            {
                ShowCopyStatus("生成提示词失败: " + ex.Message, true);
            }
        }

        private static int ReadIntValue(object value)
        {
            if (value == null) return 0;
            int parsed;
            if (int.TryParse(Convert.ToString(value, CultureInfo.InvariantCulture), out parsed)) return parsed;
            return 0;
        }

        private void OpenOrganizeWindow()
        {
            try
            {
                if (_organizeWindow != null && _organizeWindow.IsLoaded)
                {
                    _organizeWindow.Activate();
                    _organizeWindow.RefreshData();
                    return;
                }

                _organizeWindow = new OrganizeWindow(this, _api, _palette);
                _organizeWindow.Closed += delegate
                {
                    _organizeWindow = null;
                };
                _organizeWindow.Show();
            }
            catch (Exception ex)
            {
                ShowCopyStatus("打开整理窗口失败: " + ex.Message, true);
            }
        }

        private void PushSingleItemToDsh(string kind, string itemId, string contentTitle)
        {
            ShowCopyStatus("正在直接注入当前对话待办…", false);
            System.Threading.ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    Dictionary<string, object> body = new Dictionary<string, object>();
                    body["itemId"] = itemId;
                    body["kind"] = kind;
                    body["mode"] = "append";

                    string json = _api.Post("/integrations/dsh-todos/push", body);
                    Dictionary<string, object> payload = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(json);
                    int pushed = payload != null ? ReadIntValue(payload.ContainsKey("pushed") ? payload["pushed"] : null) : 0;
                    int skipped = payload != null ? ReadIntValue(payload.ContainsKey("skipped") ? payload["skipped"] : null) : 0;

                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        if (pushed > 0)
                        {
                            ShowCopyStatus("已注入当前对话待办", false);
                        }
                        else if (skipped > 0)
                        {
                            ShowCopyStatus("该条目已在当前对话待办中", false);
                        }
                        else
                        {
                            ShowCopyStatus("未注入条目", false);
                        }
                    }));
                }
                catch (Exception ex)
                {
                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        ShowCopyStatus("注入失败: " + ex.Message, true);
                    }));
                }
            });
        }

        private void PushToDshTasks()
        {
            ShowCopyStatus("正在推送到 DSH 任务…", false);
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["mode"] = "append";
                body["includeFocus"] = true;
                string json = _api.Post("/integrations/dsh-todos/push", body);
                Dictionary<string, object> payload = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(json);
                int pushed = payload != null ? ReadIntValue(payload.ContainsKey("pushed") ? payload["pushed"] : null) : 0;
                int skipped = payload != null ? ReadIntValue(payload.ContainsKey("skipped") ? payload["skipped"] : null) : 0;
                if (pushed > 0)
                {
                    ShowCopyStatus("已推送 " + pushed + " 条到 DSH 任务" + (skipped > 0 ? "，跳过 " + skipped + " 条" : ""), false);
                }
                else
                {
                    ShowCopyStatus(skipped > 0 ? "已在 DSH 任务中，未重复推送" : "没有可推送的任务", false);
                }
            }
            catch (Exception ex)
            {
                ShowCopyStatus("DSH 任务推送失败: " + ex.Message, true);
            }
        }

        private void RunAiOrganize()
        {
            ShowCopyStatus("正在提交 AI 整理…", false);
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["scope"] = "inbox";
                body["mode"] = "apply_and_push";
                string json = _api.Post("/integrations/organize", body);
                Dictionary<string, object> payload = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(json);
                int count = payload != null ? ReadIntValue(payload.ContainsKey("item_count") ? payload["item_count"] : null) : 0;
                ShowCopyStatus(count > 0 ? "已提交 AI 整理（" + count + " 条）" : "已提交 AI 整理", false);
            }
            catch (Exception ex)
            {
                ShowCopyStatus("AI 整理提交失败: " + ex.Message, true);
            }
        }

        private static string NormalizePriority(string p)
        {
            if (string.IsNullOrEmpty(p)) return "p3";
            string s = p.ToLowerInvariant();
            if (s == "高" || s == "high") return "p0";
            if (s == "中" || s == "medium") return "p3";
            if (s == "低" || s == "low") return "p5";
            if (Regex.IsMatch(s, @"^p[0-5]$")) return s;
            if (s == "p6" || s == "p7") return "p5"; // 兼容历史数据
            return "p3";
        }

        private void ImportFromClipboard()
        {
            string rawClipboard = null;
            try
            {
                if (Clipboard.ContainsText())
                {
                    rawClipboard = Clipboard.GetText();
                }
            }
            catch (Exception ex)
            {
                ShowCopyStatus("读取剪贴板失败: " + ex.Message, true);
                return;
            }

            if (string.IsNullOrEmpty(rawClipboard) || string.IsNullOrEmpty(rawClipboard.Trim()))
            {
                ShowCopyStatus("剪贴板为空，请先复制 AI 生成的代码块", true);
                return;
            }

            ShowCopyStatus("正在解析并导入...", false);

            System.Threading.ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string text = rawClipboard.Trim();

                    // 优先提取 ```omni-plan ... ``` 代码块，如无则提取任意代码块
                    Match blockMatch = Regex.Match(text, @"```(?:omni-plan|markdown|yaml|text|json)?\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
                    if (blockMatch.Success)
                    {
                        text = blockMatch.Groups[1].Value.Trim();
                    }

                    List<Dictionary<string, string>> tasksToImport = new List<Dictionary<string, string>>();
                    List<string> ideasToImport = new List<string>();
                    Dictionary<string, string> focusToImport = null;

                    string[] lines = text.Split(new string[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (string rawLine in lines)
                    {
                        string line = rawLine.Trim();
                        if (string.IsNullOrEmpty(line) || line.StartsWith("#") || line.StartsWith("//")) continue;

                        // 1. [焦点] 工作区 | 正在做 | 下一步
                        Match focusMatch = Regex.Match(line, @"^\[?(?:焦点|focus)\]?\s*[:：]?\s*(.+)", RegexOptions.IgnoreCase);
                        if (focusMatch.Success)
                        {
                            string[] parts = focusMatch.Groups[1].Value.Split(new char[] { '|', '｜' });
                            focusToImport = new Dictionary<string, string>();
                            focusToImport["workspace"] = parts.Length > 0 ? parts[0].Trim() : "默认工作区";
                            focusToImport["currentDoing"] = parts.Length > 1 ? parts[1].Trim() : "进行中";
                            focusToImport["nextActionForHuman"] = parts.Length > 2 ? parts[2].Trim() : (parts.Length > 1 ? parts[1].Trim() : "查看看板");
                            continue;
                        }

                        // 2. [灵感] 灵感内容 或 - 灵感: ...
                        Match ideaMatch = Regex.Match(line, @"^[-*•]?\s*\[?(?:灵感|idea|闪念)\]?\s*[:：]?\s*(.+)", RegexOptions.IgnoreCase);
                        if (ideaMatch.Success)
                        {
                            string contentPart = ideaMatch.Groups[1].Value.Trim();
                            if (!string.IsNullOrEmpty(contentPart))
                            {
                                ideasToImport.Add(contentPart);
                            }
                            continue;
                        }

                        // 3. [任务] 优先级 | 标题 | 备注
                        Match taskMatchA = Regex.Match(line, @"^\[?(?:任务|task)\]?\s*[:：]?\s*(.+)", RegexOptions.IgnoreCase);
                        if (taskMatchA.Success)
                        {
                            string[] parts = taskMatchA.Groups[1].Value.Split(new char[] { '|', '｜' });
                            string pri = "p3";
                            string title = parts[0].Trim();
                            string notes = "";
                            if (parts.Length >= 2)
                            {
                                string pCandidate = parts[0].Trim().ToLowerInvariant();
                                if (Regex.IsMatch(pCandidate, @"^(?:p[0-5]|p6|p7|高|中|低|high|medium|low)$"))
                                {
                                    pri = pCandidate;
                                    title = parts[1].Trim();
                                    if (parts.Length > 2)
                                    {
                                        List<string> noteParts = new List<string>();
                                        for (int i = 2; i < parts.Length; i++) noteParts.Add(parts[i].Trim());
                                        notes = string.Join(" | ", noteParts.ToArray());
                                    }
                                }
                                else
                                {
                                    title = parts[0].Trim();
                                    List<string> noteParts = new List<string>();
                                    for (int i = 1; i < parts.Length; i++) noteParts.Add(parts[i].Trim());
                                    notes = string.Join(" | ", noteParts.ToArray());
                                }
                            }
                            if (!string.IsNullOrEmpty(title))
                            {
                                Dictionary<string, string> t = new Dictionary<string, string>();
                                t["title"] = title;
                                t["priority"] = NormalizePriority(pri);
                                t["notes"] = notes;
                                tasksToImport.Add(t);
                            }
                            continue;
                        }

                        // 4. - [ ] [P1] 标题 或 1. [P0] 标题
                        Match taskMatchB = Regex.Match(line, @"^[-*•\d.]+\s*(?:\[[ xX]?\])?\s*(.+)");
                        if (taskMatchB.Success)
                        {
                            string tLine = taskMatchB.Groups[1].Value.Trim();
                            string pri = "p3";
                            Match priMatch = Regex.Match(tLine, @"\[(p[0-5]|p6|p7|高|中|低|high|medium|low)\]", RegexOptions.IgnoreCase);
                            if (!priMatch.Success) priMatch = Regex.Match(tLine, @"#(p[0-5]|p6|p7|高|中|低)", RegexOptions.IgnoreCase);
                            if (priMatch.Success)
                            {
                                pri = priMatch.Groups[1].Value.ToLowerInvariant();
                                tLine = tLine.Remove(priMatch.Index, priMatch.Length).Trim();
                            }

                            string notes = "";
                            Match notesMatch = Regex.Match(tLine, @"\((?:备注|notes?)[:：]?\s*(.+?)\)$", RegexOptions.IgnoreCase);
                            if (notesMatch.Success)
                            {
                                notes = notesMatch.Groups[1].Value.Trim();
                                tLine = tLine.Substring(0, notesMatch.Index).Trim();
                            }

                            if (!string.IsNullOrEmpty(tLine))
                            {
                                Dictionary<string, string> t = new Dictionary<string, string>();
                                t["title"] = tLine;
                                t["priority"] = NormalizePriority(pri);
                                t["notes"] = notes;
                                tasksToImport.Add(t);
                            }
                        }
                    }

                    int totalImported = tasksToImport.Count + ideasToImport.Count + (focusToImport != null ? 1 : 0);
                    if (totalImported == 0)
                    {
                        Dispatcher.BeginInvoke(new Action(delegate
                        {
                            ShowCopyStatus("未识别到有效条目，请复制AI生成的代码块", true);
                        }));
                        return;
                    }

                    // 写入任务
                    foreach (Dictionary<string, string> t in tasksToImport)
                    {
                        Dictionary<string, object> body = new Dictionary<string, object>();
                        body["action"] = "add";
                        body["title"] = t["title"];
                        body["priority"] = t["priority"];
                        body["notes"] = t["notes"];
                        _api.Post("/tasks", body);
                    }

                    // 写入灵感
                    foreach (string content in ideasToImport)
                    {
                        Dictionary<string, object> body = new Dictionary<string, object>();
                        body["content"] = content;
                        _api.Post("/inbox", body);
                    }

                    // 写入焦点
                    if (focusToImport != null)
                    {
                        Dictionary<string, object> body = new Dictionary<string, object>();
                        body["workspace"] = focusToImport["workspace"];
                        body["currentDoing"] = focusToImport["currentDoing"];
                        body["nextActionForHuman"] = focusToImport["nextActionForHuman"];
                        body["agentStatus"] = "waiting_user";
                        _api.Post("/contexts", body);
                    }

                    // 刷新看板
                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        RefreshState(true);
                        List<string> parts = new List<string>();
                        if (tasksToImport.Count > 0) parts.Add(string.Format("{0}条任务", tasksToImport.Count));
                        if (ideasToImport.Count > 0) parts.Add(string.Format("{0}条灵感", ideasToImport.Count));
                        if (focusToImport != null) parts.Add("1个焦点");
                        string msg = "成功导入: " + string.Join("、", parts.ToArray());
                        ShowCopyStatus(msg, false);
                    }));
                }
                catch (Exception ex)
                {
                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        ShowCopyStatus("导入失败: " + ex.Message, true);
                    }));
                }
            });
        }


        private void SelectTaskInputPriority(string pri)
        {
            if (string.IsNullOrEmpty(pri)) pri = "p3";
            string p = pri.ToLowerInvariant();
            if (p == "high") p = "p0";
            else if (p == "medium") p = "p3";
            else if (p == "low") p = "p5";
            _selectedTaskPriority = p;

            int idx = 3;
            for (int i = 0; i < PriKeys.Length; i++)
            {
                if (PriKeys[i] == p) { idx = i; break; }
            }

            if (_priDropdownBadgeBorder != null)
            {
                _priDropdownBadgeBorder.Background = Brush(PriorityBgColor(p));
                _priDropdownBadgeBorder.BorderBrush = Brush(PriorityBorderColor(p));
            }
            if (_priDropdownBadgeText != null)
            {
                _priDropdownBadgeText.Text = "P" + idx;
                _priDropdownBadgeText.Foreground = Brush(PriorityTextColor(p));
            }
            if (_priDropdownLabelText != null)
            {
                _priDropdownLabelText.Text = PriNames[idx];
            }

            for (int i = 0; i < PriKeys.Length; i++)
            {
                bool is_selected = (i == idx);
                if (_palette.IsDark)
                {
                    // 深色模式 (Dark Theme): 面板为深黑底
                    string item_bg = is_selected ? "#2E2E3A" : "Transparent";
                    string item_border = is_selected ? "#4E4E62" : "Transparent";
                    string text_color = is_selected ? "#FFFFFF" : "#E4E4E7";
                    string check_color = "#FFFFFF";

                    if (_priDropdownMenuItems[i] != null)
                    {
                        _priDropdownMenuItems[i].Background = Brush(item_bg);
                        _priDropdownMenuItems[i].BorderBrush = Brush(item_border);
                    }
                    if (_priDropdownMenuLabels[i] != null)
                    {
                        _priDropdownMenuLabels[i].Foreground = Brush(text_color);
                        _priDropdownMenuLabels[i].FontWeight = is_selected ? FontWeights.SemiBold : FontWeights.Normal;
                    }
                    if (_priDropdownMenuChecks[i] != null)
                    {
                        _priDropdownMenuChecks[i].Visibility = is_selected ? Visibility.Visible : Visibility.Collapsed;
                        _priDropdownMenuChecks[i].Foreground = Brush(check_color);
                    }
                }
                else
                {
                    // 浅色模式 (Light Theme): 面板为纯白底
                    // 满足用户要求：active 与非 active 的文字颜色严格反向对比
                    // active: 深黑底 #18181B + 纯白字 #FFFFFF
                    // 非 active: 纯净透明底 + 深黑高清晰度文字 #18181B
                    string item_bg = is_selected ? "#18181B" : "Transparent";
                    string item_border = is_selected ? "#18181B" : "Transparent";
                    string text_color = is_selected ? "#FFFFFF" : "#18181B";
                    string check_color = "#FFFFFF";

                    if (_priDropdownMenuItems[i] != null)
                    {
                        _priDropdownMenuItems[i].Background = Brush(item_bg);
                        _priDropdownMenuItems[i].BorderBrush = Brush(item_border);
                    }
                    if (_priDropdownMenuLabels[i] != null)
                    {
                        _priDropdownMenuLabels[i].Foreground = Brush(text_color);
                        _priDropdownMenuLabels[i].FontWeight = is_selected ? FontWeights.SemiBold : FontWeights.Normal;
                    }
                    if (_priDropdownMenuChecks[i] != null)
                    {
                        _priDropdownMenuChecks[i].Visibility = is_selected ? Visibility.Visible : Visibility.Collapsed;
                        _priDropdownMenuChecks[i].Foreground = Brush(check_color);
                    }
                }
            }
        }

        private void SelectPriority(string pri)
        {
            if (string.IsNullOrEmpty(pri)) pri = "p3";
            string p = pri.ToLowerInvariant();
            if (p == "high") p = "p0";
            else if (p == "medium") p = "p3";
            else if (p == "low") p = "p5";
            _selectedEditPriority = p;

            for (int i = 0; i < PriKeys.Length; i++)
            {
                if (_priBtns[i] != null)
                {
                    ApplyPriorityBtnStyle(_priBtns[i], PriKeys[i], PriKeys[i] == p);
                }
            }
        }

        private void ApplyPriorityBtnStyle(Button btn, string priKey, bool selected)
        {
            if (selected)
            {
                btn.Background = Brush(PriorityBgColor(priKey));
                btn.Foreground = Brush(PriorityTextColor(priKey));
                btn.BorderBrush = Brush(PriorityBorderColor(priKey));
            }
            else
            {
                btn.Background = Brush(_palette.ButtonBg);
                btn.Foreground = Brush(_palette.TextSecondary);
                btn.BorderBrush = Brush(_palette.ButtonBorder);
            }
        }

        private void HeaderMouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
            {
                DependencyObject originalSource = e.OriginalSource as DependencyObject;
                while (originalSource != null && originalSource != sender)
                {
                    if (originalSource is Button || originalSource is TextBox || originalSource is ComboBox)
                    {
                        return;
                    }
                    originalSource = VisualTreeHelper.GetParent(originalSource);
                }
                DragMove();
            }
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            IntPtr handle = new WindowInteropHelper(this).Handle;
            HwndSource source = HwndSource.FromHwnd(handle);
            if (source != null)
            {
                source.AddHook(WndProc);
            }

            int exStyle = GetWindowLong(handle, GWL_EXSTYLE);
            SetWindowLong(handle, GWL_EXSTYLE, exStyle | WS_EX_TOOLWINDOW);

            int style = GetWindowLong(handle, GWL_STYLE);
            style &= ~WS_MAXIMIZEBOX;
            SetWindowLong(handle, GWL_STYLE, style);

            WriteReadyFile();
            SwitchTab("focus", false);
            RefreshState(true);
        }

        private void OnStateChanged(object sender, EventArgs e)
        {
            if (WindowState == WindowState.Maximized)
            {
                WindowState = WindowState.Normal;
            }
        }

        private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            if (msg == WM_SYSCOMMAND)
            {
                int sc = wParam.ToInt32() & 0xFFF0;
                if (sc == SC_MAXIMIZE)
                {
                    handled = true;
                    return IntPtr.Zero;
                }
            }

            else if (msg == WM_NCHITTEST)
            {
                int p = lParam.ToInt32();
                int x = p & 0xFFFF;
                int y = (p >> 16) & 0xFFFF;
                if (x > 32767) x -= 65536;
                if (y > 32767) y -= 65536;

                Point clientPoint = PointFromScreen(new Point(x, y));
                double w = ActualWidth;
                double h = ActualHeight;
                int border = 7;
                // int corner = 16;

                if (clientPoint.X >= w - 38 && clientPoint.Y <= 38)
                {
                    return IntPtr.Zero;
                }

                bool left = clientPoint.X <= border;
                bool right = clientPoint.X >= w - border;
                bool top = clientPoint.Y <= border;
                bool bottom = clientPoint.Y >= h - border;

                if (left && top) { handled = true; return new IntPtr(HTTOPLEFT); }
                if (right && top) { handled = true; return new IntPtr(HTTOPRIGHT); }
                if (left && bottom) { handled = true; return new IntPtr(HTBOTTOMLEFT); }
                if (right && bottom) { handled = true; return new IntPtr(HTBOTTOMRIGHT); }
                if (left) { handled = true; return new IntPtr(HTLEFT); }
                if (right) { handled = true; return new IntPtr(HTRIGHT); }
                if (top) { handled = true; return new IntPtr(HTTOP); }
                if (bottom) { handled = true; return new IntPtr(HTBOTTOM); }
            }
            return IntPtr.Zero;
        }

        protected override void OnKeyDown(KeyEventArgs e)
        {
            base.OnKeyDown(e);
            if (e.Key == Key.Escape)
            {
                if (_editModalOverlay.Visibility == Visibility.Visible)
                {
                    HideEditModal();
                    e.Handled = true;
                }
                else if (_confirmOverlay.Visibility == Visibility.Visible)
                {
                    HideConfirm();
                    e.Handled = true;
                }
            }
        }

        private void WriteReadyFile()
        {
            if (string.IsNullOrEmpty(_options.ReadyFile)) return;
            try
            {
                string dir = Path.GetDirectoryName(_options.ReadyFile);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }
                File.WriteAllText(_options.ReadyFile, Process.GetCurrentProcess().Id.ToString());
            }
            catch (Exception ex)
            {
                Log("write ready file failed: " + ex.Message);
            }
        }

        private void CloseWindow()
        {
            if (_isClosing) return;
            _isClosing = true;
            try
            {
                _pollTimer.Stop();
                _api.Post("/topmost/close", new Dictionary<string, object>());
            }
            catch { }
            Close();
        }

        public void RefreshState(bool force)
        {
            if (_isRefreshing || _isClosing) return;
            _isRefreshing = true;
            try
            {
                string json = _api.Get("/state");
                JavaScriptSerializer ser = new JavaScriptSerializer();
                Dictionary<string, object> root = ser.Deserialize<Dictionary<string, object>>(json);
                if (root == null) return;

                int rev = root.ContainsKey("revision") ? Convert.ToInt32(root["revision"]) : 0;
                if (!force && rev == _state.Revision)
                {
                    return;
                }

                _state.Revision = rev;
                Dictionary<string, object> stateObj = (root != null && root.ContainsKey("state") && root["state"] is Dictionary<string, object>)
                    ? (Dictionary<string, object>)root["state"]
                    : root;

                _state.ActiveContexts = ParseContexts(stateObj);
                _state.Tasks = ParseTasks(stateObj);
                _state.Inbox = ParseInbox(stateObj);

                // 版本信息已规范显示为 0.0.1 β
                _tabFocusBadgeText.Text = _state.ActiveContexts.Count.ToString();
                _tabTasksBadgeText.Text = _state.Tasks.Count.ToString();
                _tabInboxBadgeText.Text = _state.Inbox.Count.ToString();

                RenderState();
            }
            catch (Exception ex)
            {
                Log("refresh error: " + ex.Message);
            }
            finally
            {
                _isRefreshing = false;
            }
        }

        public static List<ContextItem> ParseContexts(Dictionary<string, object> root)
        {
            List<ContextItem> list = new List<ContextItem>();
            if (root == null) return list;
            Dictionary<string, object> target = (root.ContainsKey("state") && root["state"] is Dictionary<string, object>)
                ? (Dictionary<string, object>)root["state"]
                : root;
            if (!target.ContainsKey("activeContexts")) return list;
            object arr = target["activeContexts"];
            if (!(arr is System.Collections.ArrayList)) return list;
            foreach (object item in (System.Collections.ArrayList)arr)
            {
                Dictionary<string, object> dict = item as Dictionary<string, object>;
                if (dict == null) continue;
                list.Add(new ContextItem
                {
                    Id = ReadStr(dict, "id"),
                    Workspace = ReadStr(dict, "workspace"),
                    AgentStatus = ReadStr(dict, "agentStatus", "idle"),
                    CurrentDoing = ReadStr(dict, "currentDoing"),
                    NextActionForHuman = ReadStr(dict, "nextActionForHuman"),
                    UpdatedAt = ReadStr(dict, "updatedAt")
                });
            }
            return list;
        }

        public static List<TaskItem> ParseTasks(Dictionary<string, object> root)
        {
            List<TaskItem> list = new List<TaskItem>();
            if (root == null) return list;
            Dictionary<string, object> target = (root.ContainsKey("state") && root["state"] is Dictionary<string, object>)
                ? (Dictionary<string, object>)root["state"]
                : root;
            if (!target.ContainsKey("tasks")) return list;
            object arr = target["tasks"];
            if (!(arr is System.Collections.ArrayList)) return list;
            foreach (object item in (System.Collections.ArrayList)arr)
            {
                Dictionary<string, object> dict = item as Dictionary<string, object>;
                if (dict == null) continue;
                list.Add(new TaskItem
                {
                    Id = ReadStr(dict, "id"),
                    Title = ReadStr(dict, "title"),
                    Priority = ReadStr(dict, "priority", "medium"),
                    Status = ReadStr(dict, "status", "todo"),
                    RemindAt = ReadStr(dict, "remindAt"),
                    DueAt = ReadStr(dict, "dueAt"),
                    Notes = ReadStr(dict, "notes"),
                    CreatedAt = ReadStr(dict, "createdAt"),
                    UpdatedAt = ReadStr(dict, "updatedAt")
                });
            }
            return list;
        }

        public static List<IdeaItem> ParseInbox(Dictionary<string, object> root)
        {
            List<IdeaItem> list = new List<IdeaItem>();
            if (root == null) return list;
            Dictionary<string, object> target = (root.ContainsKey("state") && root["state"] is Dictionary<string, object>)
                ? (Dictionary<string, object>)root["state"]
                : root;
            if (!target.ContainsKey("inbox")) return list;
            object arr = target["inbox"];
            if (!(arr is System.Collections.ArrayList)) return list;
            foreach (object item in (System.Collections.ArrayList)arr)
            {
                Dictionary<string, object> dict = item as Dictionary<string, object>;
                if (dict == null) continue;
                list.Add(new IdeaItem
                {
                    Id = ReadStr(dict, "id"),
                    Content = ReadStr(dict, "content"),
                    CreatedAt = ReadStr(dict, "createdAt")
                });
            }
            return list;
        }

        public static string ReadStr(Dictionary<string, object> dict, string key, string fallback = "")
        {
            if (dict.ContainsKey(key) && dict[key] != null) return dict[key].ToString();
            return fallback;
        }

        private void RenderState()
        {
            RenderFocusTab();
            RenderTasksTab();
            RenderInboxTab();
        }

        private void RenderFocusTab()
        {
            _focusList.Children.Clear();
            _focusList.Children.Add(BuildSectionTitle("当前焦点", _state.ActiveContexts.Count, true));

            if (_addingFocus)
            {
                _focusList.Children.Add(BuildAddFocusCard());
            }

            if (_state.ActiveContexts.Count == 0 && !_addingFocus)
            {
                _focusList.Children.Add(BuildEmptyCard("暂无活动焦点，可在上方点击「+ 新建」或由 AI 自动同步"));
                return;
            }

            foreach (ContextItem ctx in _state.ActiveContexts)
            {
                _focusList.Children.Add(BuildFocusCard(ctx));
            }
        }

        private Grid BuildSectionTitle(string text, int count, bool allowAdd)
        {
            Grid grid = new Grid();
            grid.Margin = new Thickness(2, 4, 2, 8);
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            TextBlock label = Text(text, 12, _palette.TextPrimary, FontWeights.Bold);
            label.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(label, 0);
            grid.Children.Add(label);

            TextBlock countBlock = Text("(" + count + ")", 11, _palette.TextSecondary, FontWeights.SemiBold, "Consolas");
            countBlock.Margin = new Thickness(6, 0, 0, 0);
            countBlock.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(countBlock, 1);
            grid.Children.Add(countBlock);

            if (allowAdd)
            {
                // 焦点加号按钮向左下矫正 (-0.8, 0.0)，统一为 28x28 尺寸并设置垂直居中，彻底消除右上偏斜
                Button add = NewRoundIconButton("circle-plus", _palette.TextPrimary, 28, 16, -0.8, 0.0);
                add.ToolTip = "新建焦点锚点";
                add.HorizontalAlignment = HorizontalAlignment.Right;
                add.VerticalAlignment = VerticalAlignment.Center;
                add.Click += delegate
                {
                    _addingFocus = true;
                    RenderState();
                };
                Grid.SetColumn(add, 2);
                grid.Children.Add(add);
            }
            return grid;
        }

        // -------------------------------------------------------------
        // 新建焦点卡片：3 个输入框明确标注中文 Label，按钮使用 close 与 check-icon 图标
        // -------------------------------------------------------------
        private Border BuildAddFocusCard()
        {
            StackPanel stack = new StackPanel();
            stack.Margin = new Thickness(2);

            Grid headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            TextBlock title = Text("新建焦点锚点", 13.5, _palette.TextPrimary, FontWeights.Bold);
            Grid.SetColumn(title, 0);
            headerGrid.Children.Add(title);

            Button closeCardBtn = NewIconButton("close", _palette.TextMuted, _palette.ButtonBg, _palette.ButtonBorder, 22, 22, 11);
            closeCardBtn.ToolTip = "取消 (Esc)";
            closeCardBtn.Click += delegate { CancelAddFocus(); };
            Grid.SetColumn(closeCardBtn, 1);
            headerGrid.Children.Add(closeCardBtn);
            stack.Children.Add(headerGrid);

            // 字段 1: 标题 / 工作区名称
            TextBlock wsLabel = Text("标题 / 项目名称", 11, _palette.TextPrimary, FontWeights.SemiBold);
            wsLabel.Margin = new Thickness(0, 10, 0, 3);
            stack.Children.Add(wsLabel);

            TextBox ws = NewMultilineTextBox("例如: DSH 界面优化、重构核心算法", 32, 60);
            ws.Text = _addFocusWorkspace;
            ws.TextChanged += delegate { _addFocusWorkspace = ws.Text; };
            stack.Children.Add(ws);

            // 字段 2: AI 正在执行的内容
            TextBlock doingLabel = Text("AI 正在执行的内容", 11, _palette.TextPrimary, FontWeights.SemiBold);
            doingLabel.Margin = new Thickness(0, 10, 0, 3);
            stack.Children.Add(doingLabel);

            TextBox doing = NewMultilineTextBox("例如: 正在编写单元测试、分析系统日志", 48, 95);
            doing.Text = _addFocusDoing;
            doing.TextChanged += delegate { _addFocusDoing = doing.Text; };
            stack.Children.Add(doing);

            // 字段 3: 你回来后的下一步 (接手行动)
            TextBlock nextLabel = Text("你回来后的下一步 (接手行动)", 11, _palette.TextPrimary, FontWeights.SemiBold);
            nextLabel.Margin = new Thickness(0, 10, 0, 3);
            stack.Children.Add(nextLabel);

            TextBox next = NewMultilineTextBox("例如: 审核代码修改、运行部署命令", 52, 105);
            next.Text = _addFocusNext;
            next.TextChanged += delegate { _addFocusNext = next.Text; };
            stack.Children.Add(next);

            StackPanel actions = new StackPanel();
            actions.Orientation = Orientation.Horizontal;
            actions.HorizontalAlignment = HorizontalAlignment.Right;
            actions.Margin = new Thickness(0, 12, 0, 0);

            // 取消按钮使用 close 图标
            Button cancel = NewActionBtn("close", "取消", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 12, 11);
            cancel.Click += delegate { CancelAddFocus(); };
            actions.Children.Add(cancel);

            // 保存按钮使用 check-icon 图标
            Button save = NewActionBtn("check-icon", "保存锚点", _palette.ButtonActiveBg, _palette.ButtonActiveFg, _palette.ButtonActiveBorder, 13, 11);
            save.Margin = new Thickness(8, 0, 0, 0);
            save.Click += delegate { SaveAddFocus(); };
            actions.Children.Add(save);

            stack.Children.Add(actions);
            return NewCard(stack);
        }

        private Border BuildEmptyCard(string message)
        {
            Border border = new Border();
            border.Background = Brush(_palette.CardBg);
            border.BorderBrush = Brush(_palette.CardBorder);
            border.BorderThickness = new Thickness(1);
            border.CornerRadius = new CornerRadius(6);
            border.Padding = new Thickness(16, 22, 16, 22);
            border.Margin = new Thickness(0, 0, 0, 8);
            TextBlock tb = Text(message, 11.5, _palette.TextMuted, FontWeights.Normal);
            tb.TextAlignment = TextAlignment.Center;
            border.Child = tb;
            return border;
        }

        private Border BuildFocusCard(ContextItem context)
        {
            StackPanel stack = new StackPanel();
            stack.HorizontalAlignment = HorizontalAlignment.Stretch;

            Grid top = new Grid();
            top.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            top.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            TextBlock ws = Text(context.Workspace ?? "默认工作区", 13.5, _palette.TextPrimary, FontWeights.Bold);
            Grid.SetColumn(ws, 0);
            top.Children.Add(ws);

            Border status = PillBadge(StatusLabel(context.AgentStatus), StatusBgColor(context.AgentStatus), StatusTextColor(context.AgentStatus), StatusBorderColor(context.AgentStatus));
            Grid.SetColumn(status, 1);
            top.Children.Add(status);
            stack.Children.Add(top);

            if (!string.IsNullOrWhiteSpace(context.CurrentDoing))
            {
                StackPanel doingSp = new StackPanel();
                doingSp.Margin = new Thickness(0, 8, 0, 0);
                TextBlock doingTag = Text("AI 正在执行", 10, _palette.TextSecondary, FontWeights.SemiBold);
                doingSp.Children.Add(doingTag);
                TextBlock doingText = Text(context.CurrentDoing, 12, _palette.TextPrimary, FontWeights.Normal);
                doingText.Margin = new Thickness(0, 2, 0, 0);
                // AI 写入的内容可能很长，必须自动换行，避免横向溢出/被裁切
                doingText.TextWrapping = TextWrapping.Wrap;
                doingSp.Children.Add(doingText);
                stack.Children.Add(doingSp);
            }

            Border nextBox = new Border();
            nextBox.HorizontalAlignment = HorizontalAlignment.Stretch;
            nextBox.Background = Brush(_palette.CardNextBg);
            nextBox.BorderBrush = Brush(_palette.CardNextBorder);
            nextBox.BorderThickness = new Thickness(1.2);
            nextBox.CornerRadius = new CornerRadius(5);
            nextBox.Padding = new Thickness(10, 8, 10, 8);
            nextBox.Margin = new Thickness(0, 8, 0, 0);

            StackPanel nextSp = new StackPanel();
            // 汉化 "NEXT FOR HUMAN" 为 "你回来后的下一步"
            TextBlock nextTag = Text("你回来后的下一步", 10, _palette.TextSecondary, FontWeights.Bold);
            nextSp.Children.Add(nextTag);

            string nextContent = string.IsNullOrWhiteSpace(context.NextActionForHuman) ? "点击右侧修改按钮进行记录" : context.NextActionForHuman;
            TextBlock nextText = Text(nextContent, 12.5, _palette.TextPrimary, FontWeights.Normal);
            nextText.TextWrapping = TextWrapping.Wrap;
            nextText.Margin = new Thickness(0, 3, 0, 0);
            nextSp.Children.Add(nextText);
            nextBox.Child = nextSp;
            stack.Children.Add(nextBox);

            StackPanel actions = new StackPanel();
            actions.Orientation = Orientation.Horizontal;
            actions.HorizontalAlignment = HorizontalAlignment.Right;
            actions.Margin = new Thickness(0, 8, 0, 0);

            // 统一收进现代化三点菜单
            Button btn_more = NewMoreButton();
            ContextMenu more_menu = CreateModernContextMenu();
            more_menu.Items.Add(CreateModernMenuItem("编辑锚点", "change", delegate { OpenContextEditModal(context); }));
            more_menu.Items.Add(CreateModernMenuItem("复制内容", "copy", delegate { CopyText(GetContextText(context)); }));
            more_menu.Items.Add(CreateModernMenuItem("注入对话", "inject", delegate { PushSingleItemToDsh("context", context.Id, context.Workspace + " → " + context.NextActionForHuman); }, false, "将此焦点锚点（工作区与接手行动）直接作为待办任务注入到当前 DSH 对话中（静默写入任务清单，不发送任何提示词气泡）"));
            more_menu.Items.Add(CreateModernMenuItem("删除锚点", "delete", delegate { RequestDelete("context", context.Id, context.Workspace); }, true));
            btn_more.Click += delegate { OpenActionMenu(btn_more, more_menu); };
            actions.Children.Add(btn_more);

            stack.Children.Add(actions);
            return NewCard(stack);
        }


        private static long ParseTimestamp(string s)
        {
            if (string.IsNullOrEmpty(s)) return 0;
            long val;
            if (long.TryParse(s, out val)) return val;
            DateTime dt;
            if (DateTime.TryParse(s, out dt)) return dt.Ticks;
            return 0;
        }

        private void SortTasksAuto(List<TaskItem> list)
        {
            if (list == null || list.Count <= 1) return;
            list.Sort(delegate(TaskItem a, TaskItem b)
            {
                if (a == null && b == null) return 0;
                if (a == null) return 1;
                if (b == null) return -1;

                // 1. 未完成任务优先于已完成任务
                bool aDone = (a.Status == "done");
                bool bDone = (b.Status == "done");
                if (aDone != bDone)
                {
                    return aDone ? 1 : -1;
                }

                // 2. 根据紧急程度 (Priority: P0 ~ P5) 排序，P0 权重为 0 最优先
                int pA = PriorityWeight(a.Priority);
                int pB = PriorityWeight(b.Priority);
                if (pA != pB)
                {
                    return pA.CompareTo(pB);
                }

                // 3. 相同等级根据时间先后排序 (先创建的排前面，时间戳小的在前)
                long tA = ParseTimestamp(a.CreatedAt);
                long tB = ParseTimestamp(b.CreatedAt);
                if (tA != tB && tA > 0 && tB > 0)
                {
                    return tA.CompareTo(tB);
                }

                return 0;
            });
        }

        private Grid BuildTaskSectionTitle(int count)
        {
            Grid grid = new Grid();
            grid.Margin = new Thickness(2, 4, 2, 8);
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            TextBlock label = Text("任务待办", 12, _palette.TextPrimary, FontWeights.Bold);
            label.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(label, 0);
            grid.Children.Add(label);

            TextBlock countBlock = Text("(" + count + ")", 11, _palette.TextSecondary, FontWeights.SemiBold, "Consolas");
            countBlock.Margin = new Thickness(6, 0, 0, 0);
            countBlock.VerticalAlignment = VerticalAlignment.Center;
            Grid.SetColumn(countBlock, 1);
            grid.Children.Add(countBlock);

            // 排序模式切换胶囊
            string sortText = _taskSortMode == TaskSortMode.Auto ? "智能排序 (P0~P5)" : "手动排序 (可拖动)";
            string sortTooltip = _taskSortMode == TaskSortMode.Auto
                ? "当前: 智能自动排序 (优先未完成，按 P0~P5 紧急程度与时间先后排序)。点击切换为手动排序"
                : "当前: 手动排序 (支持鼠标上下拖拽换位或点击箭头微调)。点击切换为智能排序";

            Button sortBtn = NewButton(sortText, _palette.CardBg, _palette.TextSecondary, _palette.CardBorder, 10.5);
            sortBtn.Padding = new Thickness(8, 2.5, 8, 2.5);
            sortBtn.ToolTip = sortTooltip;
            sortBtn.VerticalAlignment = VerticalAlignment.Center;
            sortBtn.Click += delegate
            {
                if (_taskSortMode == TaskSortMode.Auto)
                {
                    _taskSortMode = TaskSortMode.Manual;
                    ShowCopyStatus("已切换为手动排序模式 (可上下拖拽)", false);
                }
                else
                {
                    _taskSortMode = TaskSortMode.Auto;
                    SortTasksAuto(_state.Tasks);
                    ShowCopyStatus("已切换为智能排序模式 (紧急度+时间)", false);
                }
                RenderTasksTab();
            };

            Grid.SetColumn(sortBtn, 2);
            grid.Children.Add(sortBtn);
            return grid;
        }

        private void RenderTasksTab()
        {
            _taskList.Children.Clear();
            _taskList.Children.Add(BuildTaskSectionTitle(_state.Tasks.Count));

            if (_state.Tasks.Count == 0)
            {
                _taskList.Children.Add(BuildEmptyCard("暂无任务，可在上方输入框中输入并按 Ctrl+Enter 快速添加"));
                return;
            }

            if (_taskSortMode == TaskSortMode.Auto)
            {
                SortTasksAuto(_state.Tasks);
            }

            int total = _state.Tasks.Count;
            for (int i = 0; i < total; i++)
            {
                _taskList.Children.Add(BuildTaskCard(_state.Tasks[i], i, total));
            }
        }

        private Border BuildTaskCard(TaskItem task, int index, int totalCount)
        {
            Grid cardGrid = new Grid();
            cardGrid.HorizontalAlignment = HorizontalAlignment.Stretch;
            cardGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            cardGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            // Row 0: CheckBox + Title
            Grid titleRow = new Grid();
            titleRow.HorizontalAlignment = HorizontalAlignment.Stretch;
            titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            titleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            CheckBox cb = new CheckBox();
            cb.IsChecked = task.Status == "done";
            cb.Margin = new Thickness(0, 2, 8, 0);
            cb.VerticalAlignment = VerticalAlignment.Top;
            cb.Click += delegate { ToggleTaskStatus(task); };
            Grid.SetColumn(cb, 0);
            titleRow.Children.Add(cb);

            TextBlock tb = Text(task.Title, 12.5, task.Status == "done" ? _palette.TextMuted : _palette.TextPrimary, FontWeights.Normal);
            tb.TextWrapping = TextWrapping.Wrap;
            tb.VerticalAlignment = VerticalAlignment.Center;
            if (task.Status == "done")
            {
                tb.TextDecorations = TextDecorations.Strikethrough;
            }
            Grid.SetColumn(tb, 1);
            titleRow.Children.Add(tb);

            Grid.SetRow(titleRow, 0);
            cardGrid.Children.Add(titleRow);

            // Row 1: 下层元信息与操作按钮组
            Grid bottomRow = new Grid();
            bottomRow.Margin = new Thickness(0, 10, 0, 2);
            bottomRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            bottomRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            StackPanel metaSp = new StackPanel();
            metaSp.Orientation = Orientation.Horizontal;
            metaSp.VerticalAlignment = VerticalAlignment.Center;

            Border priBadge = PillBadge(PriorityLabel(task.Priority), PriorityBgColor(task.Priority), PriorityTextColor(task.Priority), PriorityBorderColor(task.Priority));
            metaSp.Children.Add(priBadge);

            if (task.Status != "done")
            {
                Border statusBadge = PillBadge(TaskStatusLabel(task.Status), StatusBgColor(task.Status), StatusTextColor(task.Status), StatusBorderColor(task.Status));
                statusBadge.Margin = new Thickness(6, 0, 0, 0);
                metaSp.Children.Add(statusBadge);
            }

            if (!string.IsNullOrEmpty(task.RemindAt))
            {
                TextBlock remind = Text("提醒: " + FormatTime(task.RemindAt), 10, _palette.TextMuted, FontWeights.Normal, "Consolas");
                remind.Margin = new Thickness(6, 0, 0, 0);
                remind.VerticalAlignment = VerticalAlignment.Center;
                metaSp.Children.Add(remind);
            }

            Grid.SetColumn(metaSp, 0);
            bottomRow.Children.Add(metaSp);

            // 右侧操作按钮组 (上下移动、change、copy、delete)
            StackPanel actions = new StackPanel();
            actions.Orientation = Orientation.Horizontal;
            actions.HorizontalAlignment = HorizontalAlignment.Right;

            // 在手动排序模式下，显示上移与下移微调按钮
            if (_taskSortMode == TaskSortMode.Manual)
            {
                if (index > 0)
                {
                    Button upBtn = NewButton("↑", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.5);
                    upBtn.Padding = new Thickness(5, 1.5, 5, 1.5);
                    upBtn.Margin = new Thickness(0, 0, 4, 0);
                    upBtn.ToolTip = "上移一位";
                    upBtn.Click += delegate
                    {
                        int curIdx = _state.Tasks.IndexOf(task);
                        if (curIdx > 0)
                        {
                            _state.Tasks.RemoveAt(curIdx);
                            _state.Tasks.Insert(curIdx - 1, task);
                            RenderTasksTab();
                            ShowCopyStatus("任务已上移", false);
                        }
                    };
                    actions.Children.Add(upBtn);
                }

                if (index < totalCount - 1)
                {
                    Button downBtn = NewButton("↓", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.5);
                    downBtn.Padding = new Thickness(5, 1.5, 5, 1.5);
                    downBtn.Margin = new Thickness(0, 0, 6, 0);
                    downBtn.ToolTip = "下移一位";
                    downBtn.Click += delegate
                    {
                        int curIdx = _state.Tasks.IndexOf(task);
                        if (curIdx >= 0 && curIdx < _state.Tasks.Count - 1)
                        {
                            _state.Tasks.RemoveAt(curIdx);
                            _state.Tasks.Insert(curIdx + 1, task);
                            RenderTasksTab();
                            ShowCopyStatus("任务已下移", false);
                        }
                    };
                    actions.Children.Add(downBtn);
                }
            }

            // 统一收进现代化三点菜单
            Button btn_more = NewMoreButton();
            ContextMenu more_menu = CreateModernContextMenu();
            more_menu.Items.Add(CreateModernMenuItem("编辑任务", "change", delegate { OpenTaskEditModal(task); }));
            more_menu.Items.Add(CreateModernMenuItem("复制任务", "copy", delegate { CopyText(task.Title); }));
            more_menu.Items.Add(CreateModernMenuItem("注入对话", "inject", delegate { PushSingleItemToDsh("task", task.Id, task.Title); }, false, "将此待办任务直接注入到当前 DSH 对话的待办任务列表中（静默写入任务清单，不发送任何提示词气泡）"));
            more_menu.Items.Add(CreateModernMenuItem("删除任务", "delete", delegate { RequestDelete("task", task.Id, task.Title); }, true));
            btn_more.Click += delegate { OpenActionMenu(btn_more, more_menu); };
            actions.Children.Add(btn_more);

            Grid.SetColumn(actions, 1);
            bottomRow.Children.Add(actions);

            Grid.SetRow(bottomRow, 1);
            cardGrid.Children.Add(bottomRow);

            Border card = NewCard(cardGrid);

            // 在手动排序模式下支持拖拽换位 (Drag & Drop)
            if (_taskSortMode == TaskSortMode.Manual)
            {
                card.AllowDrop = true;
                card.PreviewMouseLeftButtonDown += delegate(object s, MouseButtonEventArgs e)
                {
                    DependencyObject orig = e.OriginalSource as DependencyObject;
                    while (orig != null && orig != card)
                    {
                        if (orig is ButtonBase || orig is TextBox) return;
                        orig = VisualTreeHelper.GetParent(orig);
                    }
                    _dragStartPoint = e.GetPosition(null);
                    _draggedTask = task;
                };

                card.PreviewMouseMove += delegate(object s, MouseEventArgs e)
                {
                    if (e.LeftButton == MouseButtonState.Pressed && _draggedTask == task)
                    {
                        Point currentPoint = e.GetPosition(null);
                        Vector diff = _dragStartPoint - currentPoint;
                        if (Math.Abs(diff.X) > SystemParameters.MinimumHorizontalDragDistance ||
                            Math.Abs(diff.Y) > SystemParameters.MinimumVerticalDragDistance)
                        {
                            try
                            {
                                DragDrop.DoDragDrop(card, task, DragDropEffects.Move);
                            }
                            catch { }
                            _draggedTask = null;
                        }
                    }
                };

                card.DragOver += delegate(object s, DragEventArgs e)
                {
                    if (e.Data.GetDataPresent(typeof(TaskItem)))
                    {
                        e.Effects = DragDropEffects.Move;
                        card.BorderBrush = Brush(_palette.InputFocusBorder);
                        e.Handled = true;
                    }
                };

                card.DragLeave += delegate(object s, DragEventArgs e)
                {
                    card.BorderBrush = Brush(_palette.CardBorder);
                };

                card.Drop += delegate(object s, DragEventArgs e)
                {
                    card.BorderBrush = Brush(_palette.CardBorder);
                    if (e.Data.GetDataPresent(typeof(TaskItem)))
                    {
                        TaskItem source = e.Data.GetData(typeof(TaskItem)) as TaskItem;
                        if (source != null && source != task)
                        {
                            int oldIdx = _state.Tasks.IndexOf(source);
                            int newIdx = _state.Tasks.IndexOf(task);
                            if (oldIdx >= 0 && newIdx >= 0 && oldIdx != newIdx)
                            {
                                _state.Tasks.RemoveAt(oldIdx);
                                _state.Tasks.Insert(newIdx, source);
                                RenderTasksTab();
                                ShowCopyStatus("已调整任务顺序", false);
                            }
                        }
                        e.Handled = true;
                    }
                };
            }

            return card;
        }

        private void RenderInboxTab()
        {
            _ideaList.Children.Clear();
            _ideaList.Children.Add(BuildSectionTitle("灵感收纳柜", _state.Inbox.Count, false));

            if (_state.Inbox.Count == 0)
            {
                _ideaList.Children.Add(BuildEmptyCard("灵感收纳柜为空，可在上方输入框中捕捉灵感闪念"));
                return;
            }

            foreach (IdeaItem idea in _state.Inbox)
            {
                _ideaList.Children.Add(BuildIdeaCard(idea));
            }
        }

        private Border BuildIdeaCard(IdeaItem idea)
        {
            Grid cardGrid = new Grid();
            cardGrid.HorizontalAlignment = HorizontalAlignment.Stretch;
            cardGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            cardGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            TextBlock tb = Text(idea.Content, 12.5, _palette.TextPrimary, FontWeights.Normal);
            tb.TextWrapping = TextWrapping.Wrap;
            Grid.SetRow(tb, 0);
            cardGrid.Children.Add(tb);

            Grid bottom = new Grid();
            bottom.Margin = new Thickness(0, 10, 0, 2);
            bottom.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            bottom.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            // 依据用户需求彻底移除时间戳数字与任务ID展示，保持灵感卡片纯净整洁

            StackPanel actions = new StackPanel();
            actions.Orientation = Orientation.Horizontal;
            actions.HorizontalAlignment = HorizontalAlignment.Right;

            Button btn_more = NewMoreButton();
            ContextMenu more_menu = CreateModernContextMenu();
            more_menu.Items.Add(CreateModernMenuItem("转为任务", "check", delegate { ConvertIdeaToTask(idea); }));
            more_menu.Items.Add(CreateModernMenuItem("复制内容", "copy", delegate { CopyText(idea.Content); }));
            more_menu.Items.Add(CreateModernMenuItem("注入对话", "inject", delegate { PushSingleItemToDsh("idea", idea.Id, idea.Content); }, false, "将此想法闪念直接作为待办任务注入到当前 DSH 对话中（静默写入任务清单，不发送任何提示词气泡）"));
            more_menu.Items.Add(CreateModernMenuItem("删除灵感", "delete", delegate { RequestDelete("idea", idea.Id, idea.Content); }, true));
            btn_more.Click += delegate { OpenActionMenu(btn_more, more_menu); };
            actions.Children.Add(btn_more);

            Grid.SetColumn(actions, 1);
            bottom.Children.Add(actions);

            Grid.SetRow(bottom, 1);
            cardGrid.Children.Add(bottom);

            return NewCard(cardGrid);
        }

        private Border NewCard(UIElement child)
        {
            Border card_border = new Border();
            card_border.Background = Brush(_palette.CardBg);
            card_border.BorderBrush = Brush(_palette.CardBorder);
            card_border.BorderThickness = new Thickness(1);
            card_border.CornerRadius = new CornerRadius(8);
            card_border.Padding = new Thickness(12, 10, 12, 11);
            card_border.Margin = new Thickness(0, 0, 0, 8);
            card_border.HorizontalAlignment = HorizontalAlignment.Stretch;
            card_border.MouseEnter += delegate { card_border.BorderBrush = Brush(_palette.IsDark ? "#3E3E4C" : "#D0D0D8"); };
            card_border.MouseLeave += delegate { card_border.BorderBrush = Brush(_palette.CardBorder); };
            card_border.Child = child;
            return card_border;
        }

        private void AddTask()
        {
            string raw = (_taskInput.Text ?? "").Trim();
            if (string.IsNullOrEmpty(raw)) return;

            string priority = _selectedTaskPriority;
            string title = raw;

            // 智能识别前缀或后缀优先级，例如 "p0 修复系统崩溃" 或 "修复系统崩溃 #p1"
            System.Text.RegularExpressions.Match mPrefix = System.Text.RegularExpressions.Regex.Match(raw, @"^(?:#)?(p[0-5]|p6|p7)\s+(.+)$", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            System.Text.RegularExpressions.Match mSuffix = System.Text.RegularExpressions.Regex.Match(raw, @"^(.+)\s+(?:#)?(p[0-5]|p6|p7)$", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (mPrefix.Success)
            {
                priority = mPrefix.Groups[1].Value.ToLowerInvariant();
                title = mPrefix.Groups[2].Value.Trim();
            }
            else if (mSuffix.Success)
            {
                priority = mSuffix.Groups[2].Value.ToLowerInvariant();
                title = mSuffix.Groups[1].Value.Trim();
            }

            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["title"] = title;
                body["priority"] = priority;
                _api.Post("/tasks", body);
                _taskInput.Text = "";
                RefreshState(true);
                ShowCopyStatus("任务已添加 (" + priority.ToUpper() + ")", false);
            }
            catch (Exception ex)
            {
                ShowCopyStatus("添加失败", true);
                Log("add task error: " + ex.Message);
            }
        }

        private void AddIdea()
        {
            string content = (_ideaInput.Text ?? "").Trim();
            if (string.IsNullOrEmpty(content)) return;
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["content"] = content;
                _api.Post("/inbox", body);
                _ideaInput.Text = "";
                RefreshState(true);
                ShowCopyStatus("已存入灵感收纳柜", false);
            }
            catch (Exception ex)
            {
                ShowCopyStatus("记录失败", true);
                Log("add idea error: " + ex.Message);
            }
        }

        private void SaveAddFocus()
        {
            string ws = (_addFocusWorkspace ?? "").Trim();
            if (string.IsNullOrEmpty(ws))
            {
                ShowCopyStatus("请输入工作区名称", true);
                return;
            }
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["workspace"] = ws;
                body["agentStatus"] = "working";
                body["currentDoing"] = (_addFocusDoing ?? "").Trim();
                body["nextActionForHuman"] = (_addFocusNext ?? "").Trim();
                _api.Post("/contexts", body);
                _addingFocus = false;
                _addFocusWorkspace = "";
                _addFocusDoing = "";
                _addFocusNext = "";
                RefreshState(true);
                ShowCopyStatus("已新建焦点锚点", false);
            }
            catch (Exception ex)
            {
                ShowCopyStatus("创建失败", true);
                Log("add context error: " + ex.Message);
            }
        }

        private void CancelAddFocus()
        {
            _addingFocus = false;
            _addFocusWorkspace = "";
            _addFocusDoing = "";
            _addFocusNext = "";
            RenderState();
        }

        private void ToggleTaskStatus(TaskItem task)
        {
            string newStatus = task.Status == "done" ? "todo" : "done";
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["status"] = newStatus;
                _api.Patch("/tasks/" + Uri.EscapeDataString(task.Id), body);
                task.Status = newStatus;
                RenderTasksTab();
            }
            catch (Exception ex)
            {
                Log("toggle task status error: " + ex.Message);
            }
        }

        private void ConvertIdeaToTask(IdeaItem idea)
        {
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["title"] = idea.Content;
                body["priority"] = "medium";
                _api.Post("/tasks", body);
                _api.Delete("/inbox/" + Uri.EscapeDataString(idea.Id));
                RefreshState(true);
                SwitchTab("tasks");
                ShowCopyStatus("已转为任务", false);
            }
            catch (Exception ex)
            {
                ShowCopyStatus("转换失败", true);
                Log("convert idea error: " + ex.Message);
            }
        }

        private void RequestDelete(string kind, string id, string label)
        {
            _pendingKind = kind;
            _pendingId = id;
            string prefix = kind == "task" ? "确认删除任务？" : (kind == "context" ? "确认删除焦点锚点？" : "确认删除灵感闪念？");
            _confirmText.Text = prefix + Environment.NewLine + Environment.NewLine + (label ?? "");
            AnimateShowOverlay(_confirmOverlay, _confirmPanel);
        }

        private void HideConfirm()
        {
            _pendingKind = "";
            _pendingId = "";
            AnimateHideOverlay(_confirmOverlay, _confirmPanel, null);
        }

        private void ConfirmDelete()
        {
            string kind = _pendingKind;
            string id = _pendingId;
            HideConfirm();
            if (string.IsNullOrEmpty(kind) || string.IsNullOrEmpty(id)) return;
            try
            {
                string path = kind == "task"
                    ? "/tasks/" + Uri.EscapeDataString(id)
                    : (kind == "context" ? "/contexts/" + Uri.EscapeDataString(id) : "/inbox/" + Uri.EscapeDataString(id));
                _api.Delete(path);
                RefreshState(true);
                ShowCopyStatus("已删除", false);
            }
            catch (Exception ex)
            {
                ShowCopyStatus("删除失败", true);
                Log("delete item error: " + ex.Message);
            }
        }

        private void CopyText(string text)
        {
            if (string.IsNullOrEmpty(text)) return;
            bool success = SetClipboardTextNative(text);
            if (success)
            {
                ShowCopyStatus("已复制到剪贴板", false);
            }
            else
            {
                ShowCopyStatus("复制失败", true);
            }
        }

        private bool SetClipboardTextNative(string text)
        {
            for (int i = 0; i < 10; i++)
            {
                if (OpenClipboard(IntPtr.Zero))
                {
                    try
                    {
                        EmptyClipboard();
                        byte[] bytes = Encoding.Unicode.GetBytes(text + "\0");
                        IntPtr hGlobal = GlobalAlloc(GMEM_MOVEABLE, new UIntPtr((uint)bytes.Length));
                        if (hGlobal != IntPtr.Zero)
                        {
                            IntPtr target = GlobalLock(hGlobal);
                            if (target != IntPtr.Zero)
                            {
                                Marshal.Copy(bytes, 0, target, bytes.Length);
                                GlobalUnlock(hGlobal);
                                if (SetClipboardData(CF_UNICODETEXT, hGlobal) != IntPtr.Zero)
                                {
                                    return true;
                                }
                            }
                        }
                    }
                    finally
                    {
                        CloseClipboard();
                    }
                }
                System.Threading.Thread.Sleep(35);
            }
            try
            {
                Clipboard.SetDataObject(text, true);
                return true;
            }
            catch { }
            return false;
        }

        private void CopyAllMarkdown()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("# Omni Plan 全盘计划汇总");
            sb.AppendLine("生成时间: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
            sb.AppendLine();

            sb.AppendLine("## 当前活动焦点");
            if (_state.ActiveContexts.Count == 0)
            {
                sb.AppendLine("- (暂无焦点)");
            }
            else
            {
                foreach (ContextItem c in _state.ActiveContexts)
                {
                    sb.AppendLine(string.Format("### {0} [{1}]", c.Workspace, StatusLabel(c.AgentStatus)));
                    if (!string.IsNullOrEmpty(c.CurrentDoing)) sb.AppendLine("- **AI 正在执行**: " + c.CurrentDoing);
                    if (!string.IsNullOrEmpty(c.NextActionForHuman)) sb.AppendLine("- **你回来后的下一步**: " + c.NextActionForHuman);
                    sb.AppendLine();
                }
            }

            sb.AppendLine("## 任务待办列表");
            if (_state.Tasks.Count == 0)
            {
                sb.AppendLine("- (暂无任务)");
            }
            else
            {
                foreach (TaskItem t in _state.Tasks)
                {
                    string mark = t.Status == "done" ? "[x]" : "[ ]";
                    string pri = PriorityLabel(t.Priority);
                    sb.AppendLine(string.Format("- {0} ({1}) {2}", mark, pri, t.Title));
                }
            }
            sb.AppendLine();

            sb.AppendLine("## 闪念收件箱");
            if (_state.Inbox.Count == 0)
            {
                sb.AppendLine("- (收件箱为空)");
            }
            else
            {
                foreach (IdeaItem idea in _state.Inbox)
                {
                    sb.AppendLine("- " + idea.Content);
                }
            }

            string allMd = sb.ToString();
            bool success = SetClipboardTextNative(allMd);
            if (success)
            {
                AnimateCopyButtonSuccess();
            }
            else
            {
                ShowCopyStatus("复制失败", true);
            }
        }

        private void AnimateCopyButtonSuccess()
        {
            ShowCopyStatus("已复制全部 Markdown", false);
        }

        private void ShowCopyStatus(string msg, bool isError)
        {
            _copyStatus.Text = msg;
            _copyStatus.Foreground = Brush(isError ? _palette.DeleteBtnFg : (_palette.IsDark ? "#22C55E" : "#16A34A"));
            DispatcherTimer timer = new DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(2.2);
            timer.Tick += delegate
            {
                timer.Stop();
                _copyStatus.Text = "";
            };
            timer.Start();
        }

        private string GetContextText(ContextItem c)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("【焦点】" + c.Workspace + " (" + StatusLabel(c.AgentStatus) + ")");
            if (!string.IsNullOrEmpty(c.CurrentDoing)) sb.AppendLine("AI 正在执行: " + c.CurrentDoing);
            if (!string.IsNullOrEmpty(c.NextActionForHuman)) sb.AppendLine("你回来后的下一步: " + c.NextActionForHuman);
            return sb.ToString();
        }

        private string StatusLabel(string s)
        {
            if (s == "idle") return "空闲";
            if (s == "working") return "执行中";
            if (s == "waiting_human") return "等你接手";
            if (s == "completed") return "已完成";
            return s ?? "未知";
        }

        private string TaskStatusLabel(string s)
        {
            if (s == "todo") return "待办";
            if (s == "in_progress") return "进行中";
            if (s == "done") return "已完成";
            return s ?? "待办";
        }

        private string PriorityLabel(string p)
        {
            if (string.IsNullOrEmpty(p)) return "P3";
            string low = p.ToLowerInvariant();
            if (low == "p0" || low == "high") return "P0 紧急";
            if (low == "p1") return "P1 高";
            if (low == "p2") return "P2 较高";
            if (low == "p3" || low == "medium") return "P3 普通";
            if (low == "p4") return "P4 较低";
            if (low == "p5" || low == "low" || low == "p6" || low == "p7") return "P5 低";
            return p.ToUpperInvariant();
        }

        private static int PriorityWeight(string p)
        {
            if (string.IsNullOrEmpty(p)) return 3;
            string low = p.ToLowerInvariant();
            if (low == "p0" || low == "high") return 0;
            if (low == "p1") return 1;
            if (low == "p2") return 2;
            if (low == "p3" || low == "medium") return 3;
            if (low == "p4") return 4;
            if (low == "p5" || low == "low" || low == "p6" || low == "p7") return 5;
            return 3;
        }

        private string StatusBgColor(string s)
        {
            if (_palette.IsDark)
            {
                if (s == "working") return "#262626";
                if (s == "waiting_human") return "#333333";
                if (s == "completed") return "#1F1F1F";
                return "#1F1F1F";
            }
            else
            {
                if (s == "working") return "#E4E4E7";
                if (s == "waiting_human") return "#D4D4D8";
                if (s == "completed") return "#F4F4F5";
                return "#F4F4F5";
            }
        }

        private string StatusTextColor(string s)
        {
            if (_palette.IsDark)
            {
                if (s == "working") return "#FFFFFF";
                if (s == "waiting_human") return "#FFFFFF";
                return "#A3A3A3";
            }
            else
            {
                if (s == "working") return "#18181B";
                if (s == "waiting_human") return "#09090B";
                return "#52525B";
            }
        }

        private string StatusBorderColor(string s)
        {
            if (_palette.IsDark)
            {
                if (s == "working") return "#404040";
                if (s == "waiting_human") return "#525252";
                return "#2E2E2E";
            }
            else
            {
                if (s == "working") return "#D4D4D8";
                if (s == "waiting_human") return "#A1A1AA";
                return "#E4E4E7";
            }
        }

        private string PriorityBgColor(string p)
        {
            string low = (p ?? "p3").ToLowerInvariant();
            if (low == "high") low = "p0";
            else if (low == "medium") low = "p3";
            else if (low == "low") low = "p5";

            if (_palette.IsDark)
            {
                if (low == "p0") return "#DC2626"; // P0 鲜红高危
                if (low == "p1") return "#C2410C"; // P1 暖红橙警戒
                if (low == "p2") return "#3F3F46"; // P2 高对比黑白灰（深石墨）
                if (low == "p3") return "#27272A"; // P3 中性平衡灰
                if (low == "p4") return "#1F1F23"; // P4 淡雅浅灰
                return "#18181B";                 // P5 极淡静音灰
            }
            else
            {
                if (low == "p0") return "#FEE2E2"; // P0 浅色鲜红柔和底
                if (low == "p1") return "#FFEDD5"; // P1 暖橙红底
                if (low == "p2") return "#18181B"; // P2 高对比深炭黑底
                if (low == "p3") return "#F4F4F5"; // P3 中性平衡灰底
                if (low == "p4") return "#F8FAFC"; // P4 淡雅浅灰底
                return "#FAFAFA";                 // P5 极淡静音底
            }
        }

        private string PriorityTextColor(string p)
        {
            string low = (p ?? "p3").ToLowerInvariant();
            if (low == "high") low = "p0";
            else if (low == "medium") low = "p3";
            else if (low == "low") low = "p5";

            if (_palette.IsDark)
            {
                if (low == "p0") return "#FFFFFF"; // P0 纯白文字
                if (low == "p1") return "#FFEDD5"; // P1 暖白文字
                if (low == "p2") return "#F4F4F5"; // P2 亮白灰文字
                if (low == "p3") return "#D4D4D8"; // P3 平衡灰字
                if (low == "p4") return "#A1A1AA"; // P4 弱化灰字
                return "#71717A";                 // P5 静音弱字
            }
            else
            {
                if (low == "p0") return "#DC2626"; // P0 醒目鲜红字
                if (low == "p1") return "#C2410C"; // P1 暖橙红字
                if (low == "p2") return "#FFFFFF"; // P2 反差纯白字
                if (low == "p3") return "#27272A"; // P3 平衡深灰字
                if (low == "p4") return "#52525B"; // P4 次级灰字
                return "#8A8A93";                 // P5 静音灰字
            }
        }

        private string PriorityBorderColor(string p)
        {
            string low = (p ?? "p3").ToLowerInvariant();
            if (low == "high") low = "p0";
            else if (low == "medium") low = "p3";
            else if (low == "low") low = "p5";

            if (_palette.IsDark)
            {
                if (low == "p0") return "#EF4444"; // P0 鲜红亮边
                if (low == "p1") return "#EA580C"; // P1 暖红橙边
                if (low == "p2") return "#52525B"; // P2 石墨灰边
                if (low == "p3") return "#3F3F46"; // P3 中性灰边
                if (low == "p4") return "#2E2E33"; // P4 浅淡微边
                return "#232328";                 // P5 静音极弱边
            }
            else
            {
                if (low == "p0") return "#FCA5A5"; // P0 鲜红柔和边
                if (low == "p1") return "#FDBA74"; // P1 橙红柔和边
                if (low == "p2") return "#18181B"; // P2 深炭边
                if (low == "p3") return "#E4E4E7"; // P3 平衡灰边
                if (low == "p4") return "#E2E8F0"; // P4 淡雅灰边
                return "#EAEAEF";                 // P5 极淡静音边
            }
        }

        private string FormatTime(string iso)
        {
            if (string.IsNullOrEmpty(iso)) return "";
            try
            {
                DateTime dt = DateTime.Parse(iso).ToLocalTime();
                return dt.ToString("MM-dd HH:mm");
            }
            catch
            {
                return iso;
            }
        }

        public static SolidColorBrush Brush(string hex)
        {
            if (string.IsNullOrEmpty(hex)) return Brushes.Transparent;
            try
            {
                Color color = (Color)ColorConverter.ConvertFromString(hex);
                SolidColorBrush b = new SolidColorBrush(color);
                b.Freeze();
                return b;
            }
            catch
            {
                return Brushes.White;
            }
        }

        private void Log(string msg)
        {
            if (string.IsNullOrEmpty(_options.LogFile)) return;
            try
            {
                string line = string.Format("[{0:yyyy-MM-dd HH:mm:ss}] {1}{2}", DateTime.Now, msg, Environment.NewLine);
                File.AppendAllText(_options.LogFile, line);
            }
            catch { }
        }
    }

    public class OrganizeWindow : Window
    {
        private readonly MainWindow _mainWin;
        private readonly PlanApi _api;
        private ThemePalette _palette;

        private Border _windowBorder;
        private Grid _rootGrid;

        private TextBlock _brandTitle;
        private Button _closeButton;

        private ScrollViewer _scroll;
        private StackPanel _mainStack;

        private StackPanel _tasksList;
        private TextBlock _tasksCountText;
        private List<TaskItem> _tasks = new List<TaskItem>();
        private Dictionary<string, bool> _selectedTaskMap = new Dictionary<string, bool>();

        private StackPanel _inboxList;
        private TextBlock _inboxCountText;
        private List<IdeaItem> _ideas = new List<IdeaItem>();

        private TextBox _newTaskInput;
        private string _newTaskPriority = "p3";
        private Border _priDropdownBadgeBorder;
        private TextBlock _priDropdownBadgeText;
        private TextBlock _priDropdownLabelText;
        private Popup _priDropdownPopup;
        private Border _priDropdownMenuBorder;
        private Button[] _priDropdownMenuItems = new Button[6];
        private TextBlock[] _priDropdownMenuLabels = new TextBlock[6];
        private TextBlock[] _priDropdownMenuChecks = new TextBlock[6];

        private TextBlock _footerStatusText;
        private Button _cancelBtn;
        private Button _injectBtn;
        private TextBlock _toastText;

        private static readonly string[] PriKeys = new string[] { "p0", "p1", "p2", "p3", "p4", "p5" };
        private static readonly string[] PriNames = new string[] { "P0 紧急", "P1 高", "P2 较高", "P3 普通", "P4 较低", "P5 低" };

        public OrganizeWindow(MainWindow mainWin, PlanApi api, ThemePalette palette)
        {
            _mainWin = mainWin;
            _api = api;
            _palette = palette;

            Title = "OmniPlan 任务整理与对话注入";
            Width = 540;
            Height = 680;
            MinWidth = 480;
            MinHeight = 520;
            WindowStyle = WindowStyle.None;
            AllowsTransparency = true;
            Background = Brushes.Transparent;
            ShowInTaskbar = false;
            Owner = mainWin;
            WindowStartupLocation = WindowStartupLocation.CenterOwner;

            TextOptions.SetTextFormattingMode(this, TextFormattingMode.Display);
            TextOptions.SetTextRenderingMode(this, TextRenderingMode.ClearType);
            RenderOptions.SetClearTypeHint(this, ClearTypeHint.Enabled);
            UseLayoutRounding = true;
            SnapsToDevicePixels = true;

            BuildUi();
            ApplyTheme();
            RefreshData();
        }

        private SolidColorBrush B(string hex)
        {
            return MainWindow.Brush(hex);
        }

        private TextBlock Text(string text, double size = 12, string color = null, FontWeight? weight = null)
        {
            TextBlock tb = new TextBlock();
            tb.Text = text ?? "";
            tb.FontSize = size;
            tb.Foreground = B(color ?? _palette.TextPrimary);
            tb.FontFamily = new FontFamily("Segoe UI, Microsoft YaHei UI");
            if (weight.HasValue) tb.FontWeight = weight.Value;
            return tb;
        }

        private Button NewBtn(string text, string background, string foreground, string border, double size = 11.5)
        {
            Button btn = new Button();
            btn.Content = text;
            btn.FontSize = size;
            btn.FontWeight = FontWeights.SemiBold;
            btn.Padding = new Thickness(8, 3.5, 8, 3.5);
            btn.Background = B(background);
            btn.Foreground = B(foreground);
            btn.BorderBrush = B(border);
            btn.BorderThickness = new Thickness(1);
            btn.Cursor = Cursors.Hand;
            return btn;
        }

        private Border Pill(string text, string bg, string fg, string border)
        {
            Border b = new Border();
            b.CornerRadius = new CornerRadius(3);
            b.Padding = new Thickness(5, 1.5, 5, 1.5);
            b.Background = B(bg);
            b.BorderBrush = B(border);
            b.BorderThickness = new Thickness(1);
            TextBlock t = Text(text, 9.5, fg, FontWeights.SemiBold, "Segoe UI, Consolas");
            b.Child = t;
            return b;
        }

        private TextBlock Text(string text, double size, string color, FontWeight weight, string font)
        {
            TextBlock tb = Text(text, size, color, weight);
            tb.FontFamily = new FontFamily(font);
            return tb;
        }

        private void BuildUi()
        {
            _windowBorder = new Border();
            _windowBorder.CornerRadius = new CornerRadius(10);
            _windowBorder.BorderThickness = new Thickness(1.2);
            _windowBorder.Background = B(_palette.ModalPanelBg);
            _windowBorder.BorderBrush = B(_palette.WindowBorder);
            _windowBorder.Effect = new DropShadowEffect
            {
                BlurRadius = 24,
                ShadowDepth = 6,
                Direction = 270,
                Opacity = _palette.IsDark ? 0.55 : 0.16,
                Color = Colors.Black
            };

            _rootGrid = new Grid();
            _rootGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            _rootGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            _rootGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            _windowBorder.Child = _rootGrid;
            Content = _windowBorder;

            // Row 0: 标题栏 (支持拖动)
            Grid header = new Grid();
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            header.Margin = new Thickness(14, 12, 14, 10);
            header.Background = Brushes.Transparent;
            header.MouseLeftButtonDown += delegate(object s, MouseButtonEventArgs e)
            {
                if (e.LeftButton == MouseButtonState.Pressed) DragMove();
            };
            Grid.SetRow(header, 0);
            _rootGrid.Children.Add(header);

            StackPanel titleSp = new StackPanel();
            titleSp.Orientation = Orientation.Horizontal;
            titleSp.VerticalAlignment = VerticalAlignment.Center;

            Border logoHost = new Border();
            logoHost.Margin = new Thickness(0, 0, 9, 0);
            logoHost.VerticalAlignment = VerticalAlignment.Center;
            logoHost.Child = MainWindow.CreateBrandLogoElement(22);
            titleSp.Children.Add(logoHost);

            _brandTitle = Text("OmniPlan 任务整理与对话注入", 13.5, _palette.TextPrimary, FontWeights.Bold);
            _brandTitle.VerticalAlignment = VerticalAlignment.Center;
            titleSp.Children.Add(_brandTitle);

            Border badge = Pill("直接注入 · 不发提示词", _palette.IsDark ? "#2E2E3A" : "#E4E4EC", _palette.TextSecondary, _palette.CardBorder);
            badge.Margin = new Thickness(8, 0, 0, 0);
            badge.VerticalAlignment = VerticalAlignment.Center;
            titleSp.Children.Add(badge);

            Grid.SetColumn(titleSp, 0);
            header.Children.Add(titleSp);

            _closeButton = new Button();
            _closeButton.Content = MainWindow.CreateSvgIcon("close", _palette.TextSecondary, 13, 0.5, 0.5);
            _closeButton.Width = 26;
            _closeButton.Height = 26;
            _closeButton.Padding = new Thickness(0);
            _closeButton.Background = B(_palette.ButtonBg);
            _closeButton.BorderBrush = B(_palette.ButtonBorder);
            _closeButton.BorderThickness = new Thickness(1);
            _closeButton.Cursor = Cursors.Hand;
            _closeButton.ToolTip = "关闭窗口";
            _closeButton.Click += delegate { Close(); };
            Grid.SetColumn(_closeButton, 1);
            header.Children.Add(_closeButton);

            // Row 1: 主滚动内容区
            _scroll = new ScrollViewer();
            _scroll.HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled;
            _scroll.VerticalScrollBarVisibility = ScrollBarVisibility.Auto;
            _scroll.CanContentScroll = false;
            _scroll.Padding = new Thickness(14, 4, 14, 12);
            Grid.SetRow(_scroll, 1);
            _rootGrid.Children.Add(_scroll);

            _mainStack = new StackPanel();
            _scroll.Content = _mainStack;

            // Section 1: 待办任务清单 (勾选以注入当前对话)
            _mainStack.Children.Add(BuildTasksSection());

            // Section 2: 灵感闪念整理 (一键转换为任务并勾选注入)
            _mainStack.Children.Add(BuildInboxSection());

            // Section 3: 创立新任务 (直接创立并加入待注入清单)
            _mainStack.Children.Add(BuildNewTaskSection());

            // Row 2: 底部操作栏
            Border footerWrapper = new Border();
            footerWrapper.Padding = new Thickness(14, 10, 14, 12);
            footerWrapper.Background = B(_palette.IsDark ? "#17171C" : "#F4F4F6");

            Grid footer = new Grid();
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            footerWrapper.Child = footer;

            Border topBorder = new Border();
            topBorder.BorderThickness = new Thickness(0, 1, 0, 0);
            topBorder.BorderBrush = B(_palette.CardBorder);

            Grid footerGrid = new Grid();
            footerGrid.Children.Add(topBorder);
            footerGrid.Children.Add(footerWrapper);
            Grid.SetRow(footerGrid, 2);
            _rootGrid.Children.Add(footerGrid);

            StackPanel footerLeft = new StackPanel();
            footerLeft.VerticalAlignment = VerticalAlignment.Center;

            _footerStatusText = Text("准备就绪", 11.5, _palette.TextSecondary, FontWeights.Normal);
            footerLeft.Children.Add(_footerStatusText);

            _toastText = Text("", 11.0, _palette.IsDark ? "#22C55E" : "#16A34A", FontWeights.SemiBold);
            _toastText.Margin = new Thickness(0, 2, 0, 0);
            _toastText.Visibility = Visibility.Collapsed;
            footerLeft.Children.Add(_toastText);

            Grid.SetColumn(footerLeft, 0);
            footer.Children.Add(footerLeft);

            StackPanel footerRight = new StackPanel();
            footerRight.Orientation = Orientation.Horizontal;
            footerRight.VerticalAlignment = VerticalAlignment.Center;

            _cancelBtn = NewBtn("取消", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 11.5);
            _cancelBtn.Padding = new Thickness(12, 5, 12, 5);
            _cancelBtn.Margin = new Thickness(0, 0, 8, 0);
            _cancelBtn.Click += delegate { Close(); };
            footerRight.Children.Add(_cancelBtn);

            _injectBtn = new Button();
            _injectBtn.Padding = new Thickness(14, 5, 14, 5);
            _injectBtn.Cursor = Cursors.Hand;
            _injectBtn.BorderThickness = new Thickness(1);
            _injectBtn.Click += delegate { ExecuteDirectPush(); };

            StackPanel injectSp = new StackPanel();
            injectSp.Orientation = Orientation.Horizontal;
            injectSp.VerticalAlignment = VerticalAlignment.Center;
            injectSp.Children.Add(MainWindow.CreateSvgIcon("inject", _palette.ButtonActiveFg, 13, 0, 0));
            TextBlock injectTxt = Text("确认直接注入", 11.5, _palette.ButtonActiveFg, FontWeights.Bold);
            injectTxt.Margin = new Thickness(6, 0, 0, 0);
            injectSp.Children.Add(injectTxt);
            _injectBtn.Content = injectSp;

            footerRight.Children.Add(_injectBtn);
            Grid.SetColumn(footerRight, 1);
            footer.Children.Add(footerRight);
        }

        private Border BuildSectionContainer(UIElement child)
        {
            Border b = new Border();
            b.Background = B(_palette.CardBg);
            b.BorderBrush = B(_palette.CardBorder);
            b.BorderThickness = new Thickness(1);
            b.CornerRadius = new CornerRadius(8);
            b.Padding = new Thickness(12, 10, 12, 10);
            b.Margin = new Thickness(0, 0, 0, 12);
            b.Child = child;
            return b;
        }

        private Border BuildTasksSection()
        {
            StackPanel sp = new StackPanel();

            Grid secHeader = new Grid();
            secHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            secHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            secHeader.Margin = new Thickness(0, 0, 0, 8);

            StackPanel titleSp = new StackPanel();
            titleSp.Orientation = Orientation.Horizontal;
            titleSp.VerticalAlignment = VerticalAlignment.Center;
            titleSp.Children.Add(Text("1. 待办任务清单", 12.5, _palette.TextPrimary, FontWeights.Bold));
            _tasksCountText = Text(" (0)", 11.5, _palette.TextMuted, FontWeights.Normal);
            titleSp.Children.Add(_tasksCountText);
            TextBlock subTip = Text(" — 勾选确认直接注入对话，可单项设为焦点", 10.5, _palette.TextMuted, FontWeights.Normal);
            subTip.Margin = new Thickness(6, 0, 0, 0);
            titleSp.Children.Add(subTip);

            Grid.SetColumn(titleSp, 0);
            secHeader.Children.Add(titleSp);

            Button toggleAllBtn = NewBtn("全选/反选", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.0);
            toggleAllBtn.Padding = new Thickness(6, 2, 6, 2);
            toggleAllBtn.Click += delegate
            {
                bool anyUnchecked = false;
                foreach (TaskItem t in _tasks)
                {
                    if (t.Status != "done")
                    {
                        bool isSel = _selectedTaskMap.ContainsKey(t.Id) ? _selectedTaskMap[t.Id] : false;
                        if (!isSel) { anyUnchecked = true; break; }
                    }
                }
                foreach (TaskItem t in _tasks)
                {
                    if (t.Status != "done")
                    {
                        _selectedTaskMap[t.Id] = anyUnchecked;
                    }
                }
                RenderTasks();
                UpdateSelectionCount();
            };
            Grid.SetColumn(toggleAllBtn, 1);
            secHeader.Children.Add(toggleAllBtn);

            sp.Children.Add(secHeader);

            _tasksList = new StackPanel();
            sp.Children.Add(_tasksList);

            return BuildSectionContainer(sp);
        }

        private Border BuildInboxSection()
        {
            StackPanel sp = new StackPanel();

            Grid secHeader = new Grid();
            secHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            secHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            secHeader.Margin = new Thickness(0, 0, 0, 8);

            StackPanel titleSp = new StackPanel();
            titleSp.Orientation = Orientation.Horizontal;
            titleSp.VerticalAlignment = VerticalAlignment.Center;
            titleSp.Children.Add(Text("2. 灵感闪念整理", 12.5, _palette.TextPrimary, FontWeights.Bold));
            _inboxCountText = Text(" (0)", 11.5, _palette.TextMuted, FontWeights.Normal);
            titleSp.Children.Add(_inboxCountText);
            TextBlock subTip = Text(" — 一键升级为任务，进入上方注入队列", 10.5, _palette.TextMuted, FontWeights.Normal);
            subTip.Margin = new Thickness(6, 0, 0, 0);
            titleSp.Children.Add(subTip);

            Grid.SetColumn(titleSp, 0);
            secHeader.Children.Add(titleSp);

            Button convertAllBtn = NewBtn("全部转为任务", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.0);
            convertAllBtn.Padding = new Thickness(6, 2, 6, 2);
            convertAllBtn.Click += delegate { ConvertAllIdeasToTasks(); };
            Grid.SetColumn(convertAllBtn, 1);
            secHeader.Children.Add(convertAllBtn);

            sp.Children.Add(secHeader);

            _inboxList = new StackPanel();
            sp.Children.Add(_inboxList);

            return BuildSectionContainer(sp);
        }

        private Border BuildNewTaskSection()
        {
            StackPanel sp = new StackPanel();

            TextBlock title = Text("3. 创立新任务并直接注入", 12.5, _palette.TextPrimary, FontWeights.Bold);
            title.Margin = new Thickness(0, 0, 0, 6);
            sp.Children.Add(title);

            _newTaskInput = new TextBox();
            _newTaskInput.AcceptsReturn = true;
            _newTaskInput.TextWrapping = TextWrapping.Wrap;
            _newTaskInput.MinHeight = 44;
            _newTaskInput.MaxHeight = 90;
            _newTaskInput.Padding = new Thickness(8, 6, 8, 6);
            _newTaskInput.FontSize = 12.0;
            _newTaskInput.FontFamily = new FontFamily("Segoe UI, Microsoft YaHei UI");
            _newTaskInput.ToolTip = "输入新任务内容，按 Ctrl+Enter 快速创立";
            _newTaskInput.KeyDown += delegate(object s, KeyEventArgs e)
            {
                if (e.Key == Key.Enter && (Keyboard.Modifiers & ModifierKeys.Control) == ModifierKeys.Control)
                {
                    CreateNewTaskInOrganize();
                    e.Handled = true;
                }
            };
            sp.Children.Add(_newTaskInput);

            // 操作行: 优先级下拉 + 创立按钮
            Grid opRow = new Grid();
            opRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            opRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            opRow.Margin = new Thickness(0, 6, 0, 0);

            StackPanel priSp = new StackPanel();
            priSp.Orientation = Orientation.Horizontal;
            priSp.VerticalAlignment = VerticalAlignment.Center;

            TextBlock priLabel = Text("紧急程度: ", 11.0, _palette.TextSecondary, FontWeights.Normal);
            priLabel.VerticalAlignment = VerticalAlignment.Center;
            priSp.Children.Add(priLabel);

            Button priBtn = new Button();
            priBtn.Height = 22;
            priBtn.Padding = new Thickness(5, 1, 5, 1);
            priBtn.Background = B(_palette.ButtonBg);
            priBtn.BorderBrush = B(_palette.ButtonBorder);
            priBtn.BorderThickness = new Thickness(1);
            priBtn.Cursor = Cursors.Hand;

            StackPanel triggerStack = new StackPanel();
            triggerStack.Orientation = Orientation.Horizontal;
            triggerStack.VerticalAlignment = VerticalAlignment.Center;

            _priDropdownBadgeBorder = new Border();
            _priDropdownBadgeBorder.CornerRadius = new CornerRadius(3);
            _priDropdownBadgeBorder.Padding = new Thickness(4, 1, 4, 1);
            _priDropdownBadgeBorder.Margin = new Thickness(0, 0, 4, 0);
            _priDropdownBadgeText = Text("P3", 9, "#FFFFFF", FontWeights.Bold, "Consolas");
            _priDropdownBadgeBorder.Child = _priDropdownBadgeText;
            triggerStack.Children.Add(_priDropdownBadgeBorder);

            _priDropdownLabelText = Text("普通 ▾", 10.0, _palette.TextPrimary, FontWeights.Normal);
            _priDropdownLabelText.VerticalAlignment = VerticalAlignment.Center;
            triggerStack.Children.Add(_priDropdownLabelText);

            priBtn.Content = triggerStack;
            priSp.Children.Add(priBtn);

            // 下拉 Popup
            _priDropdownPopup = new Popup();
            _priDropdownPopup.PlacementTarget = priBtn;
            _priDropdownPopup.Placement = PlacementMode.Bottom;
            _priDropdownPopup.VerticalOffset = 3;
            _priDropdownPopup.StaysOpen = false;
            _priDropdownPopup.AllowsTransparency = true;

            _priDropdownMenuBorder = new Border();
            _priDropdownMenuBorder.CornerRadius = new CornerRadius(6);
            _priDropdownMenuBorder.BorderThickness = new Thickness(1.2);
            _priDropdownMenuBorder.Padding = new Thickness(3);
            _priDropdownMenuBorder.MinWidth = 120;
            _priDropdownMenuBorder.Background = B(_palette.ModalPanelBg);
            _priDropdownMenuBorder.BorderBrush = B(_palette.ModalPanelBorder);
            _priDropdownMenuBorder.Effect = new DropShadowEffect { BlurRadius = 12, ShadowDepth = 3, Opacity = 0.35, Color = Colors.Black };

            StackPanel menuStack = new StackPanel();
            for (int i = 0; i < PriKeys.Length; i++)
            {
                int capturedIndex = i;
                Button itemBtn = new Button();
                itemBtn.Height = 24;
                itemBtn.HorizontalContentAlignment = HorizontalAlignment.Left;
                itemBtn.Padding = new Thickness(6, 2, 6, 2);
                itemBtn.Background = Brushes.Transparent;
                itemBtn.BorderBrush = Brushes.Transparent;
                itemBtn.BorderThickness = new Thickness(1);
                itemBtn.Cursor = Cursors.Hand;

                Grid itemGrid = new Grid();
                itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                itemGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

                TextBlock lbl = Text(PriNames[i], 10.5, _palette.TextPrimary, FontWeights.Normal);
                lbl.VerticalAlignment = VerticalAlignment.Center;
                Grid.SetColumn(lbl, 0);
                itemGrid.Children.Add(lbl);

                TextBlock chk = Text("✓", 10.5, _palette.TextPrimary, FontWeights.Bold);
                chk.VerticalAlignment = VerticalAlignment.Center;
                chk.Visibility = (i == 3) ? Visibility.Visible : Visibility.Collapsed;
                Grid.SetColumn(chk, 1);
                itemGrid.Children.Add(chk);

                itemBtn.Content = itemGrid;
                itemBtn.Click += delegate
                {
                    SelectPri(PriKeys[capturedIndex]);
                    _priDropdownPopup.IsOpen = false;
                };

                _priDropdownMenuItems[i] = itemBtn;
                _priDropdownMenuLabels[i] = lbl;
                _priDropdownMenuChecks[i] = chk;
                menuStack.Children.Add(itemBtn);
            }

            _priDropdownMenuBorder.Child = menuStack;
            _priDropdownPopup.Child = _priDropdownMenuBorder;
            priBtn.Click += delegate { _priDropdownPopup.IsOpen = !_priDropdownPopup.IsOpen; };

            Grid.SetColumn(priSp, 0);
            opRow.Children.Add(priSp);

            Button addBtn = NewBtn("+ 创立任务", _palette.ButtonBg, _palette.TextPrimary, _palette.ButtonBorder, 11.0);
            addBtn.Padding = new Thickness(10, 3, 10, 3);
            addBtn.Click += delegate { CreateNewTaskInOrganize(); };
            Grid.SetColumn(addBtn, 1);
            opRow.Children.Add(addBtn);

            sp.Children.Add(opRow);
            return BuildSectionContainer(sp);
        }

        private void SelectPri(string p)
        {
            if (string.IsNullOrEmpty(p)) p = "p3";
            _newTaskPriority = p.ToLowerInvariant();
            int idx = 3;
            for (int i = 0; i < PriKeys.Length; i++)
            {
                if (PriKeys[i] == _newTaskPriority) { idx = i; break; }
            }

            _priDropdownBadgeBorder.Background = B(PriorityBgColor(_newTaskPriority));
            _priDropdownBadgeBorder.BorderBrush = B(PriorityBorderColor(_newTaskPriority));
            _priDropdownBadgeText.Text = "P" + idx;
            _priDropdownBadgeText.Foreground = B(PriorityTextColor(_newTaskPriority));
            _priDropdownLabelText.Text = PriNames[idx] + " ▾";

            for (int i = 0; i < PriKeys.Length; i++)
            {
                if (_priDropdownMenuChecks[i] != null)
                {
                    _priDropdownMenuChecks[i].Visibility = (i == idx) ? Visibility.Visible : Visibility.Collapsed;
                }
            }
        }

        public void ApplyTheme()
        {
            if (_windowBorder != null)
            {
                _windowBorder.Background = B(_palette.ModalPanelBg);
                _windowBorder.BorderBrush = B(_palette.WindowBorder);
            }
            if (_brandTitle != null) _brandTitle.Foreground = B(_palette.TextPrimary);
            if (_closeButton != null)
            {
                _closeButton.Content = MainWindow.CreateSvgIcon("close", _palette.TextSecondary, 13, 0.5, 0.5);
                _closeButton.Background = B(_palette.ButtonBg);
                _closeButton.BorderBrush = B(_palette.ButtonBorder);
            }
            if (_cancelBtn != null)
            {
                _cancelBtn.Background = B(_palette.ButtonBg);
                _cancelBtn.Foreground = B(_palette.TextSecondary);
                _cancelBtn.BorderBrush = B(_palette.ButtonBorder);
            }
            if (_injectBtn != null)
            {
                _injectBtn.Background = B(_palette.ButtonActiveBg);
                _injectBtn.BorderBrush = B(_palette.ButtonActiveBorder);
            }
            if (_newTaskInput != null)
            {
                _newTaskInput.Background = B(_palette.InputBg);
                _newTaskInput.Foreground = B(_palette.TextPrimary);
                _newTaskInput.BorderBrush = B(_palette.InputBorder);
                _newTaskInput.CaretBrush = B(_palette.TextPrimary);
            }
            SelectPri(_newTaskPriority);
            RenderTasks();
            RenderInbox();
        }

        public void UpdatePalette(ThemePalette p)
        {
            _palette = p;
            ApplyTheme();
        }

        public void RefreshData()
        {
            System.Threading.ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string json = _api.Get("/state");
                    JavaScriptSerializer ser = new JavaScriptSerializer();
                    Dictionary<string, object> root = ser.Deserialize<Dictionary<string, object>>(json);
                    if (root == null) return;

                    Dictionary<string, object> stateObj = (root.ContainsKey("state") && root["state"] is Dictionary<string, object>)
                        ? (Dictionary<string, object>)root["state"]
                        : root;

                    List<TaskItem> tasks = MainWindow.ParseTasks(stateObj);
                    List<IdeaItem> ideas = MainWindow.ParseInbox(stateObj);

                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        _tasks = tasks ?? new List<TaskItem>();
                        _ideas = ideas ?? new List<IdeaItem>();

                        // 默认全部不勾选：避免"只想注入一条"却把全部任务注入
                        foreach (TaskItem t in _tasks)
                        {
                            if (!_selectedTaskMap.ContainsKey(t.Id))
                            {
                                _selectedTaskMap[t.Id] = false;
                            }
                        }

                        RenderTasks();
                        RenderInbox();
                        UpdateSelectionCount();
                    }));
                }
                catch (Exception ex)
                {
                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        ShowToast("读取看板数据失败: " + ex.Message, true);
                    }));
                }
            });
        }

        private void RenderTasks()
        {
            if (_tasksList == null) return;
            _tasksList.Children.Clear();

            List<TaskItem> activeTasks = new List<TaskItem>();
            foreach (TaskItem t in _tasks)
            {
                if (t.Status != "done") activeTasks.Add(t);
            }

            if (_tasksCountText != null)
            {
                _tasksCountText.Text = string.Format(" ({0}条)", activeTasks.Count);
            }

            if (activeTasks.Count == 0)
            {
                Border emptyBd = new Border();
                emptyBd.Padding = new Thickness(8, 12, 8, 12);
                TextBlock emptyTb = Text("暂无待办任务，可从下方灵感转换或创立新任务", 11.5, _palette.TextMuted, FontWeights.Normal);
                emptyTb.TextAlignment = TextAlignment.Center;
                emptyBd.Child = emptyTb;
                _tasksList.Children.Add(emptyBd);
                return;
            }

            for (int i = 0; i < activeTasks.Count; i++)
            {
                TaskItem t = activeTasks[i];
                Border itemCard = new Border();
                itemCard.Background = B(_palette.IsDark ? "#17171C" : "#F8FAFC");
                itemCard.BorderBrush = B(_palette.CardBorder);
                itemCard.BorderThickness = new Thickness(1);
                itemCard.CornerRadius = new CornerRadius(5);
                itemCard.Padding = new Thickness(8, 6, 8, 6);
                itemCard.Margin = new Thickness(0, 0, 0, 5);

                Grid grid = new Grid();
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

                CheckBox cb = new CheckBox();
                cb.IsChecked = _selectedTaskMap.ContainsKey(t.Id) ? _selectedTaskMap[t.Id] : false;
                cb.VerticalAlignment = VerticalAlignment.Center;
                cb.Margin = new Thickness(0, 0, 6, 0);
                cb.Click += delegate
                {
                    _selectedTaskMap[t.Id] = cb.IsChecked == true;
                    UpdateSelectionCount();
                };
                Grid.SetColumn(cb, 0);
                grid.Children.Add(cb);

                Border priBadge = Pill(PriorityLabel(t.Priority), PriorityBgColor(t.Priority), PriorityTextColor(t.Priority), PriorityBorderColor(t.Priority));
                priBadge.VerticalAlignment = VerticalAlignment.Center;
                priBadge.Margin = new Thickness(0, 0, 6, 0);
                Grid.SetColumn(priBadge, 1);
                grid.Children.Add(priBadge);

                TextBlock titleTb = Text(t.Title, 12.0, _palette.TextPrimary, FontWeights.Normal);
                titleTb.TextWrapping = TextWrapping.Wrap;
                titleTb.VerticalAlignment = VerticalAlignment.Center;
                Grid.SetColumn(titleTb, 2);
                grid.Children.Add(titleTb);

                Button focusBtn = NewBtn("转为焦点", _palette.ButtonBg, _palette.TextSecondary, _palette.ButtonBorder, 10.0);
                focusBtn.Padding = new Thickness(6, 2, 6, 2);
                focusBtn.Margin = new Thickness(6, 0, 0, 0);
                focusBtn.ToolTip = "将此任务设为 OmniPlan 当前焦点锚点";
                focusBtn.Click += delegate { SetTaskAsFocus(t); };
                Grid.SetColumn(focusBtn, 3);
                grid.Children.Add(focusBtn);

                itemCard.Child = grid;
                _tasksList.Children.Add(itemCard);
            }
        }

        private void RenderInbox()
        {
            if (_inboxList == null) return;
            _inboxList.Children.Clear();

            if (_inboxCountText != null)
            {
                _inboxCountText.Text = string.Format(" ({0}条)", _ideas.Count);
            }

            if (_ideas.Count == 0)
            {
                Border emptyBd = new Border();
                emptyBd.Padding = new Thickness(8, 10, 8, 10);
                TextBlock emptyTb = Text("灵感收纳柜为空，所有闪念均已整理完毕", 11.5, _palette.TextMuted, FontWeights.Normal);
                emptyTb.TextAlignment = TextAlignment.Center;
                emptyBd.Child = emptyTb;
                _inboxList.Children.Add(emptyBd);
                return;
            }

            for (int i = 0; i < _ideas.Count; i++)
            {
                IdeaItem idea = _ideas[i];
                Border itemCard = new Border();
                itemCard.Background = B(_palette.IsDark ? "#17171C" : "#F8FAFC");
                itemCard.BorderBrush = B(_palette.CardBorder);
                itemCard.BorderThickness = new Thickness(1);
                itemCard.CornerRadius = new CornerRadius(5);
                itemCard.Padding = new Thickness(8, 6, 8, 6);
                itemCard.Margin = new Thickness(0, 0, 0, 5);

                Grid grid = new Grid();
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

                TextBlock contentTb = Text(idea.Content, 12.0, _palette.TextPrimary, FontWeights.Normal);
                contentTb.TextWrapping = TextWrapping.Wrap;
                contentTb.VerticalAlignment = VerticalAlignment.Center;
                Grid.SetColumn(contentTb, 0);
                grid.Children.Add(contentTb);

                Button toTaskBtn = NewBtn("转为待办", _palette.ButtonBg, _palette.TextPrimary, _palette.ButtonBorder, 10.0);
                toTaskBtn.Padding = new Thickness(7, 2, 7, 2);
                toTaskBtn.Margin = new Thickness(8, 0, 0, 0);
                toTaskBtn.ToolTip = "将此灵感升级为待办任务并自动勾选注入";
                toTaskBtn.Click += delegate { ConvertIdeaToTaskInOrganize(idea); };
                Grid.SetColumn(toTaskBtn, 1);
                grid.Children.Add(toTaskBtn);

                itemCard.Child = grid;
                _inboxList.Children.Add(itemCard);
            }
        }

        private void UpdateSelectionCount()
        {
            int selectedCount = 0;
            foreach (TaskItem t in _tasks)
            {
                if (t.Status != "done")
                {
                    bool isSel = _selectedTaskMap.ContainsKey(t.Id) ? _selectedTaskMap[t.Id] : false;
                    if (isSel) selectedCount++;
                }
            }
            if (_footerStatusText != null)
            {
                _footerStatusText.Text = string.Format("已勾选 {0} 项任务即将直接注入当前对话", selectedCount);
            }
        }

        private void SetTaskAsFocus(TaskItem task)
        {
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["workspace"] = "工作区";
                body["nextActionForHuman"] = task.Title;
                body["currentDoing"] = "来自整理窗口设定";
                body["agentStatus"] = "waiting_human";

                _api.Post("/contexts", body);
                ShowToast(string.Format("已将「{0}」转为当前焦点锚点", task.Title), false);
                _mainWin.RefreshState(true);
            }
            catch (Exception ex)
            {
                ShowToast("设为焦点失败: " + ex.Message, true);
            }
        }

        private void ConvertIdeaToTaskInOrganize(IdeaItem idea)
        {
            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["action"] = "add";
                body["title"] = idea.Content;
                body["priority"] = "p3";
                _api.Post("/tasks", body);
                _api.Delete("/inbox/" + Uri.EscapeDataString(idea.Id));

                ShowToast(string.Format("灵感已转化为待办任务并已勾选", idea.Content), false);
                _mainWin.RefreshState(true);
                RefreshData();
            }
            catch (Exception ex)
            {
                ShowToast("转换失败: " + ex.Message, true);
            }
        }

        private void ConvertAllIdeasToTasks()
        {
            if (_ideas == null || _ideas.Count == 0)
            {
                ShowToast("收纳柜中没有可转换的灵感", false);
                return;
            }

            int count = 0;
            try
            {
                foreach (IdeaItem idea in _ideas)
                {
                    Dictionary<string, object> body = new Dictionary<string, object>();
                    body["action"] = "add";
                    body["title"] = idea.Content;
                    body["priority"] = "p3";
                    _api.Post("/tasks", body);
                    _api.Delete("/inbox/" + Uri.EscapeDataString(idea.Id));
                    count++;
                }
                ShowToast(string.Format("已成功将 {0} 条灵感全部转化为待办任务！", count), false);
                _mainWin.RefreshState(true);
                RefreshData();
            }
            catch (Exception ex)
            {
                ShowToast("批量转换中断: " + ex.Message, true);
                RefreshData();
            }
        }

        private void CreateNewTaskInOrganize()
        {
            string content = (_newTaskInput.Text ?? "").Trim();
            if (string.IsNullOrEmpty(content))
            {
                ShowToast("请输入任务内容后再创立", true);
                return;
            }

            try
            {
                Dictionary<string, object> body = new Dictionary<string, object>();
                body["action"] = "add";
                body["title"] = content;
                body["priority"] = _newTaskPriority;
                _api.Post("/tasks", body);

                _newTaskInput.Text = "";
                ShowToast(string.Format("新任务已创立并自动勾选注入队列", content), false);
                _mainWin.RefreshState(true);
                RefreshData();
            }
            catch (Exception ex)
            {
                ShowToast("创立新任务失败: " + ex.Message, true);
            }
        }

        private void ExecuteDirectPush()
        {
            List<string> selectedIds = new List<string>();
            foreach (TaskItem t in _tasks)
            {
                if (t.Status != "done")
                {
                    bool isSel = _selectedTaskMap.ContainsKey(t.Id) ? _selectedTaskMap[t.Id] : false;
                    if (isSel) selectedIds.Add(t.Id);
                }
            }

            if (selectedIds.Count == 0)
            {
                ShowToast("请至少勾选一项任务后再执行注入", true);
                return;
            }

            ShowToast(string.Format("正在直接注入 {0} 项任务到当前对话…", selectedIds.Count), false);

            System.Threading.ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    Dictionary<string, object> body = new Dictionary<string, object>();
                    body["itemIds"] = selectedIds.ToArray();
                    body["mode"] = "append";

                    string json = _api.Post("/integrations/dsh-todos/push", body);
                    JavaScriptSerializer ser = new JavaScriptSerializer();
                    Dictionary<string, object> payload = ser.Deserialize<Dictionary<string, object>>(json);
                    int pushed = payload != null && payload.ContainsKey("pushed") ? Convert.ToInt32(payload["pushed"]) : 0;
                    int skipped = payload != null && payload.ContainsKey("skipped") ? Convert.ToInt32(payload["skipped"]) : 0;

                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        string msg = string.Format("注入完成！新增 {0} 项" + (skipped > 0 ? "，跳过 {1} 项重复" : ""), pushed, skipped);
                        ShowToast(msg, false);
                        _mainWin.RefreshState(true);

                        DispatcherTimer timer = new DispatcherTimer();
                        timer.Interval = TimeSpan.FromMilliseconds(750);
                        timer.Tick += delegate
                        {
                            timer.Stop();
                            Close();
                        };
                        timer.Start();
                    }));
                }
                catch (Exception ex)
                {
                    Dispatcher.BeginInvoke(new Action(delegate
                    {
                        ShowToast("注入失败: " + ex.Message, true);
                    }));
                }
            });
        }

        private void ShowToast(string msg, bool isError)
        {
            if (_toastText == null) return;
            _toastText.Text = msg;
            _toastText.Foreground = B(isError ? _palette.DeleteBtnFg : (_palette.IsDark ? "#22C55E" : "#16A34A"));
            _toastText.Visibility = Visibility.Visible;

            DispatcherTimer timer = new DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(3.0);
            timer.Tick += delegate
            {
                timer.Stop();
                if (_toastText != null) _toastText.Visibility = Visibility.Collapsed;
            };
            timer.Start();
        }

        private string PriorityLabel(string p)
        {
            if (string.IsNullOrEmpty(p)) return "P3";
            string low = p.ToLowerInvariant();
            if (low == "p0" || low == "high") return "P0 紧急";
            if (low == "p1") return "P1 高";
            if (low == "p2") return "P2 较高";
            if (low == "p3" || low == "medium") return "P3 普通";
            if (low == "p4") return "P4 较低";
            if (low == "p5" || low == "low" || low == "p6" || low == "p7") return "P5 低";
            return p.ToUpperInvariant();
        }

        private string PriorityBgColor(string p)
        {
            string low = (p ?? "p3").ToLowerInvariant();
            if (low == "high") low = "p0";
            else if (low == "medium") low = "p3";
            else if (low == "low") low = "p5";

            if (_palette.IsDark)
            {
                if (low == "p0") return "#DC2626";
                if (low == "p1") return "#C2410C";
                if (low == "p2") return "#3F3F46";
                if (low == "p3") return "#27272A";
                if (low == "p4") return "#1F1F23";
                return "#18181B";
            }
            else
            {
                if (low == "p0") return "#FEE2E2";
                if (low == "p1") return "#FFEDD5";
                if (low == "p2") return "#18181B";
                if (low == "p3") return "#F4F4F5";
                if (low == "p4") return "#F8FAFC";
                return "#FAFAFA";
            }
        }

        private string PriorityTextColor(string p)
        {
            string low = (p ?? "p3").ToLowerInvariant();
            if (low == "high") low = "p0";
            else if (low == "medium") low = "p3";
            else if (low == "low") low = "p5";

            if (_palette.IsDark)
            {
                if (low == "p0") return "#FFFFFF";
                if (low == "p1") return "#FFEDD5";
                if (low == "p2") return "#F4F4F5";
                if (low == "p3") return "#D4D4D8";
                if (low == "p4") return "#A1A1AA";
                return "#71717A";
            }
            else
            {
                if (low == "p0") return "#DC2626";
                if (low == "p1") return "#C2410C";
                if (low == "p2") return "#FFFFFF";
                if (low == "p3") return "#27272A";
                if (low == "p4") return "#52525B";
                return "#8A8A93";
            }
        }

        private string PriorityBorderColor(string p)
        {
            string low = (p ?? "p3").ToLowerInvariant();
            if (low == "high") low = "p0";
            else if (low == "medium") low = "p3";
            else if (low == "low") low = "p5";

            if (_palette.IsDark)
            {
                if (low == "p0") return "#EF4444";
                if (low == "p1") return "#EA580C";
                if (low == "p2") return "#52525B";
                if (low == "p3") return "#3F3F46";
                if (low == "p4") return "#2E2E33";
                return "#232328";
            }
            else
            {
                if (low == "p0") return "#FCA5A5";
                if (low == "p1") return "#FDBA74";
                if (low == "p2") return "#18181B";
                if (low == "p3") return "#E4E4E7";
                if (low == "p4") return "#E2E8F0";
                return "#E4E4E7";
            }
        }
    }

    public static class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            string crashLog = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".dsh", "omni-plan", "crash.log");
            try
            {
                AppDomain.CurrentDomain.UnhandledException += delegate(object s, UnhandledExceptionEventArgs e)
                {
                    try { File.WriteAllText(crashLog, "AppDomain Unhandled: " + (e.ExceptionObject != null ? e.ExceptionObject.ToString() : "null")); } catch { }
                };

                Options options = Options.Parse(args);
                Application app = new Application();
                app.DispatcherUnhandledException += delegate(object s, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
                {
                    try { File.WriteAllText(crashLog, "Dispatcher Unhandled: " + e.Exception.ToString()); } catch { }
                };

                MainWindow win = new MainWindow(options);
                app.Run(win);
            }
            catch (Exception ex)
            {
                try { File.WriteAllText(crashLog, "Main Catch: " + ex.ToString()); } catch { }
            }
        }
    }
}
