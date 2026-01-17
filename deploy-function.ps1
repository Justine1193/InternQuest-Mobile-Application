# PowerShell script to deploy signChecklistPDF Cloud Function
# Run this script from the project root directory

Write-Host "Deploying signChecklistPDF Cloud Function..." -ForegroundColor Cyan

# Navigate to functions directory
Set-Location functions

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Deploy the function
Write-Host "Deploying function..." -ForegroundColor Yellow
firebase deploy --only functions:signChecklistPDF

# Return to project root
Set-Location ..

Write-Host "`nDeployment complete! Check the output above for any errors." -ForegroundColor Green
Write-Host "If deployment was successful, try approving a requirement again." -ForegroundColor Green
