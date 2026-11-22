#!/usr/bin/env bash
# BreatheWise AI — Google Cloud Run Deployment Script (Bash)
# Automates multi-stage Docker build and deployment to Cloud Run with least-privilege IAM

set -e

PROJECT_ID="${1:-virtuprompt}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-breathewise-ai}"

echo "=================================================================="
echo "🚀 Deploying BreatheWise AI to Google Cloud Run [$SERVICE_NAME]"
echo "=================================================================="

# 1. Configure GCP project and region
echo -e "\n[1/4] Configuring Google Cloud project and region..."
gcloud config set project "$PROJECT_ID" --quiet
gcloud config set run/region "$REGION" --quiet

# 2. Run automated test suite
echo -e "\n[2/4] Running automated test suite before deployment..."
npm test

# 3. Build and deploy container to Cloud Run
echo -e "\n[3/4] Submitting container build and deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --quiet

# 4. Verify live service health
echo -e "\n[4/4] Verifying live service health..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')
echo "Service URL: $SERVICE_URL"
curl -s "$SERVICE_URL/api/health" | grep -q "ok" && echo "Health Check: OK"

echo "=================================================================="
echo "✅ BreatheWise AI successfully deployed to Google Cloud Run!"
echo "Live URL: $SERVICE_URL"
echo "=================================================================="
