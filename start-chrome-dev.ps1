# PowerShell 脚本启动 Chrome（禁用安全策略）
Write-Host "正在启动 Chrome（禁用安全策略）..." -ForegroundColor Green

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# 如果 Chrome 不在默认路径，请修改上面的路径
# 或者使用以下命令查找 Chrome：
# Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" | Select-Object -ExpandProperty "(default)"

if (Test-Path $chromePath) {
    Start-Process $chromePath -ArgumentList "--disable-web-security", "--user-data-dir=C:\temp\chrome_dev", "--disable-features=VizDisplayCompositor"
    Write-Host "Chrome 已启动！" -ForegroundColor Green
} else {
    Write-Host "错误：找不到 Chrome，请检查路径是否正确" -ForegroundColor Red
    Write-Host "Chrome 可能在这些位置：" -ForegroundColor Yellow
    Write-Host "  - C:\Program Files\Google\Chrome\Application\chrome.exe" -ForegroundColor Yellow
    Write-Host "  - C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" -ForegroundColor Yellow
}

