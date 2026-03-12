# Download portable Node.js and run the dev server (no install required)
$ErrorActionPreference = "Stop"
$projectDir = $PSScriptRoot
$nodeUrl = "https://nodejs.org/dist/v20.20.1/node-v20.20.1-win-x64.zip"
$nodeDir = Join-Path $projectDir ".node-portable"
$nodeExe = Join-Path $nodeDir "node-v20.20.1-win-x64\node.exe"
$npmCmd = Join-Path $nodeDir "node-v20.20.1-win-x64\npm.cmd"

Set-Location $projectDir

# Download and extract Node if needed
if (-not (Test-Path $nodeExe)) {
    Write-Host "Downloading portable Node.js (~30 MB)..."
    $zipPath = Join-Path $projectDir "node-portable.zip"
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath -UseBasicParsing
    } catch {
        Write-Host "Download failed: $_"
        Write-Host "Try opening https://nodejs.org/dist/v20.20.1/node-v20.20.1-win-x64.zip in a browser and save to this folder as node-portable.zip"
        exit 1
    }
    Write-Host "Extracting..."
    Expand-Archive -Path $zipPath -DestinationPath $nodeDir -Force
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    Write-Host "Node.js ready."
} else {
    Write-Host "Using existing portable Node.js"
}

# Run npm install then npm run dev
$env:PATH = (Join-Path $nodeDir "node-v20.20.1-win-x64") + ";" + $env:PATH
Write-Host "Installing dependencies..."
& $npmCmd install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Starting frontend + backend... (Chrome will open in ~8 seconds)"
$job = Start-Job { Start-Sleep 8; Start-Process chrome "http://localhost:3000" -ErrorAction SilentlyContinue }
& $npmCmd run dev:all
