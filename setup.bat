@echo off
setlocal enabledelayedexpansion

:: Get the PAT from git credential
for /f "tokens=2 delims==" %%a in ('echo protocol^=https^&echo host^=github.com^&echo. ^| git credential fill ^| findstr password') do set PAT=%%a

:: Create repo
curl -s -H "Authorization: token %PAT%" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d "{\"name\":\"flowly-ai\",\"public\":true}"

:: Push
git remote add origin https://github.com/geeteshparelly/flowly-ai.git 2>nul
git branch -M main
git push -u origin main

echo Done!
