@echo off
setlocal
echo ========================================================
echo   RESQ-GRID — Push to GitHub for Render Deployment
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/username/resqgrid.git): "

if "%REPO_URL%"=="" (
    echo Error: No repository URL provided.
    pause
    exit /b 1
)

set GIT_PATH="C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"

echo.
echo [1/3] Setting remote origin to %REPO_URL%...
%GIT_PATH% remote remove origin 2>nul
%GIT_PATH% remote add origin %REPO_URL%

echo [2/3] Setting branch to main...
%GIT_PATH% branch -M main

echo [3/3] Pushing code to GitHub...
%GIT_PATH% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Your project is now on GitHub!
    echo ========================================================
    echo   Next steps on Render:
    echo   1. Go to https://dashboard.render.com
    echo   2. Click "New +" -^> "Web Service"
    echo   3. Select your repository
    echo   4. Build Command: npm run render-build
    echo   5. Start Command: npm run start
    echo   6. Click "Create Web Service"
    echo ========================================================
) else (
    echo.
    echo Error pushing to GitHub. Please check your credentials or repo URL.
)

pause
