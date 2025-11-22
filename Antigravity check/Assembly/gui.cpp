#include <windows.h>
#include <string>
#include <thread>
#include <cstdio>

// Import from logic.c
extern "C" {
    typedef struct {
        double cpu_flops;
        double ram_speed;
        double gpu_score;
    } BenchResults;
    
    BenchResults run_full_suite();
}

// Global handles
HWND hOutputLabel;
HWND hButton;

// Colors
HBRUSH hBlackBrush;
HFONT hFont;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_CREATE:
            hBlackBrush = CreateSolidBrush(RGB(0, 0, 0));
            hFont = CreateFont(24, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET, 
                             OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, DEFAULT_QUALITY, 
                             DEFAULT_PITCH | FF_SWISS, "Segoe UI");
            
            // Center button: Window width is 800, Button width is 200.
            // (800 - 200) / 2 = 300.
            hButton = CreateWindow("BUTTON", "START BENCHMARK",
                WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_DEFPUSHBUTTON | BS_OWNERDRAW,
                300, 250, 200, 50,
                hwnd, (HMENU)1, (HINSTANCE)GetWindowLongPtr(hwnd, GWLP_HINSTANCE), NULL);
                
            // Center label below button
            hOutputLabel = CreateWindow("STATIC", "Ready to Benchmark...",
                WS_VISIBLE | WS_CHILD | SS_CENTER,
                50, 320, 700, 400,
                hwnd, NULL, (HINSTANCE)GetWindowLongPtr(hwnd, GWLP_HINSTANCE), NULL);
            
            // Set text color for static control
            // Note: standard static controls don't easily support custom text color without subclassing or WM_CTLCOLORSTATIC
            break;

        case WM_CTLCOLORSTATIC:
        {
            HDC hdcStatic = (HDC)wParam;
            SetTextColor(hdcStatic, RGB(255, 255, 255));
            SetBkColor(hdcStatic, RGB(0, 0, 0));
            return (INT_PTR)hBlackBrush;
        }

        case WM_DRAWITEM:
        {
            LPDRAWITEMSTRUCT lpDrawItem = (LPDRAWITEMSTRUCT)lParam;
            if (lpDrawItem->CtlID == 1) {
                FillRect(lpDrawItem->hDC, &lpDrawItem->rcItem, CreateSolidBrush(RGB(0, 120, 215))); // Blue button
                SetTextColor(lpDrawItem->hDC, RGB(255, 255, 255));
                SetBkMode(lpDrawItem->hDC, TRANSPARENT);
                DrawText(lpDrawItem->hDC, "START BENCHMARK", -1, &lpDrawItem->rcItem, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
                return TRUE;
            }
            break;
        }

        case WM_COMMAND:
            if (LOWORD(wParam) == 1) {
                EnableWindow(hButton, FALSE);
                SetWindowText(hOutputLabel, "Running Tests... Please Wait (60s)...");
                
                std::thread t([]() {
                    BenchResults res = run_full_suite();
                    
                    char buffer[512];
                    sprintf(buffer, 
                        "=== BENCHMARK RESULTS ===\n\n"
                        "CPU FLOPS:   %.2f GFLOPS\n"
                        "RAM SPEED:   %.2f GB/s\n"
                        "GPU SCORE:   %.2f\n",
                        res.cpu_flops, res.ram_speed, res.gpu_score);
                        
                    // Update UI on main thread (simple way via PostMessage or SetWindowText if thread-safe enough for this simple app)
                    // Windows SetWindowText is generally thread-safe for calling from other threads, but let's be careful.
                    // Ideally we use PostMessage, but for this simple task:
                    SetWindowText(hOutputLabel, buffer);
                    EnableWindow(hButton, TRUE);
                });
                t.detach();
            }
            break;

        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;

        case WM_PAINT:
        {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);
            FillRect(hdc, &ps.rcPaint, hBlackBrush);
            EndPaint(hwnd, &ps);
            return 0;
        }
    }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    const char CLASS_NAME[] = "BenchmarkWindow";

    WNDCLASS wc = { };
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;
    wc.hbrBackground = CreateSolidBrush(RGB(0, 0, 0)); // Black background
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);

    RegisterClass(&wc);

    // Center the window
    int screenWidth = GetSystemMetrics(SM_CXSCREEN);
    int screenHeight = GetSystemMetrics(SM_CYSCREEN);
    int winWidth = 800;
    int winHeight = 600;
    int xPos = (screenWidth - winWidth) / 2;
    int yPos = (screenHeight - winHeight) / 2;

    HWND hwnd = CreateWindowEx(
        0, CLASS_NAME, "Ultimate Benchmark Suite",
        WS_OVERLAPPEDWINDOW,
        xPos, yPos, winWidth, winHeight,
        NULL, NULL, hInstance, NULL
    );

    if (hwnd == NULL) return 0;

    // Center button (done in WM_CREATE, but we can't easily pass params there without structs.
    // Let's just rely on the fixed size in WM_CREATE for now, or move button creation here?
    // No, must be in WM_CREATE or after.
    // Let's update WM_CREATE to center the button.
    
    ShowWindow(hwnd, nCmdShow);

    MSG msg = { };
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}
