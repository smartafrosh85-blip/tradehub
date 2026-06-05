# Deploy TradeHub Firebase Cloud Functions
# Usage: .\deploy-functions.ps1 -ProjectId "your-project-id" -SendGridKey "your_sendgrid_key" -AdminEmail "you@example.com" -FromEmail "noreply@yourdomain.com"
param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,

    [Parameter(Mandatory=$true)]
    [string]$SendGridKey,

    [Parameter(Mandatory=$true)]
    [string]$AdminEmail,

    [Parameter(Mandatory=$false)]
    [string]$FromEmail = $AdminEmail
)

Write-Host "Deploying Firebase Functions for project: $ProjectId"

Set-Location "$PSScriptRoot\functions"
if (-Not (Test-Path package-lock.json)) {
    npm install
}

firebase use "$ProjectId"
firebase functions:config:set sendgrid.key="$SendGridKey" admin.email="$AdminEmail" admin.from="$FromEmail"
firebase deploy --only functions
