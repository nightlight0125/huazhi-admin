@echo off
echo 正在启动 Chrome（禁用安全策略）...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev" --disable-features=VizDisplayCompositor
pause

