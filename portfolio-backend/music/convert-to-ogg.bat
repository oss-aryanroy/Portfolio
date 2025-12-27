@echo off
REM ============================================
REM FLAC to OGG Converter + Auto tracks.json
REM Converts FLAC to OGG, extracts covers, updates tracks.json
REM Filename format: "Artist - Title.flac"
REM Requires FFmpeg and PowerShell
REM ============================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set FLAC_DIR=%SCRIPT_DIR%flac
set OGG_DIR=%SCRIPT_DIR%ogg
set COVER_DIR=%SCRIPT_DIR%covers
set TRACKS_JSON=%SCRIPT_DIR%tracks.json
set QUALITY=10

echo.
echo ========================================
echo   FLAC Processor + Auto Track Registry
echo   Quality: VBR q%QUALITY% (~320kbps avg)
echo ========================================
echo.

REM Check if FFmpeg is available
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: FFmpeg not found in PATH!
    pause
    exit /b 1
)

REM Create folders if they don't exist
if not exist "%OGG_DIR%" mkdir "%OGG_DIR%"
if not exist "%COVER_DIR%" mkdir "%COVER_DIR%"

REM Run PowerShell script for the heavy lifting
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%process-music.ps1" -FlacDir "%FLAC_DIR%" -OggDir "%OGG_DIR%" -CoverDir "%COVER_DIR%" -TracksJson "%TRACKS_JSON%" -Quality %QUALITY%

pause
