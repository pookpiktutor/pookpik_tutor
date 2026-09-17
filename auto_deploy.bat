@echo off
echo ===================================================
echo     Auto Deploy Google Apps Script (Backend)
echo ===================================================
echo.

set PATH=C:\Program Files\nodejs;%PATH%
set CLASP_CMD="C:\Users\Windows 11\AppData\Roaming\npm\clasp.cmd"

echo 1. Pushing code to Google Apps Script...
call %CLASP_CMD% push
if %errorlevel% neq 0 (
    echo [ERROR] Push failed!
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Code pushed.
echo.

echo 2. Deploying new version to the Production Web App...
call %CLASP_CMD% deploy -i AKfycby6AJihwQhNODIuy9aMm4I-W9ow1kygpF10GA945oB2J9BhGai_fehpUV2dKJdoNKhyZg -d "Auto Update from local"
if %errorlevel% neq 0 (
    echo [ERROR] Deploy failed!
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Web App deployed and updated!
echo.
echo ===================================================
echo   Update Complete! The frontend will now use the 
echo   latest backend automatically.
echo ===================================================
pause
