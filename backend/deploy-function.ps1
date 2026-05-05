# PowerShell script to deploy signChecklistPDF Cloud Function
# Can be run from any directory

Write-Host "Deploying signChecklistPDF Cloud Function..." -ForegroundColor Cyan

# Navigate to backend/functions directory
$scriptRoot = $PSScriptRoot
Set-Location (Join-Path $scriptRoot "functions")

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Deploy the function
Write-Host "Deploying function..." -ForegroundColor Yellow
firebase deploy --only functions:signChecklistPDF

# Return to backend directory
Set-Location $scriptRoot

Write-Host "`nDeployment complete! Check the output above for any errors." -ForegroundColor Green
Write-Host "If deployment was successful, try approving a requirement again." -ForegroundColor Green
