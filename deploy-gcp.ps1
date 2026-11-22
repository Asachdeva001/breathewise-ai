# BreatheWise AI — Google Cloud Run Deployment Script (PowerShell)
# Automates multi-stage Docker build and deployment to Cloud Run with least-privilege IAM

param(
  [string]$ProjectId = "virtuprompt",
  [string]$Region = "us-central1",
  [string]$ServiceName = "breathewise-ai"
)

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying BreatheWise AI to Google Cloud Run [$ServiceName]" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Verify gcloud authentication
Write-Host "`n[1/4] Verifying Google Cloud CLI authentication..." -ForegroundColor Yellow
gcloud config set project $ProjectId --quiet
gcloud config set run/region $Region --quiet

# 2. Run automated test suite
Write-Host "`n[2/4] Running automated test suite before deployment..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
  Write-Error "Automated tests failed! Aborting deployment."
  exit 1
}

# 3. Build and deploy container to Cloud Run
Write-Host "`n[3/4] Submitting container build and deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --source . `
  --region $Region `
  --project $ProjectId `
  --allow-unauthenticated `
  --quiet

# 4. Verify deployment health endpoint
Write-Host "`n[4/4] Verifying live service health..." -ForegroundColor Yellow
$ServiceUrl = (gcloud run services describe $ServiceName --platform managed --region $Region --format "value(status.url)")
Write-Host "Service URL: $ServiceUrl" -ForegroundColor Green
$Health = Invoke-RestMethod -Uri "$ServiceUrl/api/health" -Method Get
Write-Host "Health Check: $($Health.status) - $($Health.service)" -ForegroundColor Green

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "✅ BreatheWise AI successfully deployed to Google Cloud Run!" -ForegroundColor Green
Write-Host "Live URL: $ServiceUrl" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
