@echo off
chcp 65001 >nul 2>&1
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║         Antigravity Conversation Fix                     ║
echo  ║         Fixes missing/unordered conversation history     ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  [IMPORTANT] Antigravity must be FULLY CLOSED before proceeding!
echo.
pause
echo.
where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    python "%~dp0rebuild_conversations.py"
) else (
    where py >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        py "%~dp0rebuild_conversations.py"
    ) else (
        echo [ERROR] Python was not found in PATH. Please install Python 3.7+ to run this recovery script.
        pause
        exit /b 1
    )
)
echo.
pause
