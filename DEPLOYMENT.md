# Azure Deployment Setup Guide

This guide will walk you through deploying your UI to Azure Static Web Apps using GitHub Actions.

## Prerequisites

- An Azure account (create one at [https://azure.microsoft.com/free/](https://azure.microsoft.com/free/))
- Azure CLI installed (optional but recommended)
- GitHub repository with admin access

---

## Step 1: Create Azure Static Web App

### Option A: Using Azure Portal (Recommended for beginners)

1. **Log in to Azure Portal**
   - Go to [https://portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create a Static Web App**
   - Click "Create a resource" (+ icon in top left)
   - Search for "Static Web App"
   - Click "Create"

3. **Configure Basic Settings**
   - **Subscription**: Select your Azure subscription (`cfe8894e-9d2d-43d8-88fb-c345678cf905`)
   - **Resource Group**: Create new or select existing (e.g., `rg-bh`)
   - **Name**: `therapy-connect` (must match the name in your workflow file)
   - **Plan type**: Select "Free" for testing or "Standard" for production
   - **Region**: Choose closest to your users (e.g., "East US 2", "West Europe")
   - **Deployment source**: Select "Other" (we'll use GitHub Actions manually)

4. **Review and Create**
   - Click "Review + create"
   - Click "Create"
   - Wait for deployment to complete (usually 1-2 minutes)

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create a resource group (if you don't have one)
az group create --name rg-bh --location eastus2

# Create the Static Web App
az staticwebapp create \
  --name therapy-connect \
  --resource-group rg-bh \
  --location eastus2 \
  --sku Free
```

---

## Step 2: Get Azure Credentials for GitHub

You need to create a Service Principal to allow GitHub Actions to authenticate with Azure.

### Using Azure CLI:

```bash
# Create a service principal and capture the output
az ad sp create-for-rbac \
  --name "github-actions-tc" \
  --role contributor \
  --scopes /subscriptions/cfe8894e-9d2d-43d8-88fb-c345678cf905/resourceGroups/rg-bh
```

This command will output credentials like this:
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "displayName": "github-actions-tc",
  "password": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Important**: You need to reformat this output for GitHub Actions. Create a JSON object with this structure:

```json
{
  "clientId": "<appId from above>",
  "clientSecret": "<password from above>",
  "subscriptionId": "cfe8894e-9d2d-43d8-88fb-c345678cf905",
  "tenantId": "<tenant from above>"
}
```

**Example**: If the command returned:
```json
{
  "appId": "12345678-1234-1234-1234-123456789012",
  "displayName": "github-actions-tc",
  "password": "abcdefg123456789",
  "tenant": "87654321-4321-4321-4321-210987654321"
}
```

You would create this JSON for the GitHub secret:
```json
{
  "clientId": "12345678-1234-1234-1234-123456789012",
  "clientSecret": "abcdefg123456789",
  "subscriptionId": "cfe8894e-9d2d-43d8-88fb-c345678cf905",
  "tenantId": "87654321-4321-4321-4321-210987654321"
}
```

**Save this reformatted JSON** - you'll need it for the GitHub secret in Step 3.

---

## Step 3: Configure GitHub Secrets

1. **Go to your GitHub repository**
   - Navigate to your repository on GitHub
   - Click on "Settings" tab

2. **Add Repository Secrets**
   - In the left sidebar, click "Secrets and variables" → "Actions"
   - Click "New repository secret"

3. **Add AZURE_CREDENTIALS**
   - Name: `AZURE_CREDENTIALS`
   - Value: Paste the entire JSON output from Step 2
   - Click "Add secret"

### Optional: Add Environment Variables

If your app needs environment variables (like API URLs), add them as secrets:

Example:
- Name: `VITE_API_BASE_URL`
- Value: `https://your-api-url.com`

Then update the workflow to create a .env file (uncomment and modify the 'Create .env file' step in the workflow).

---

## Step 4: Update Workflow Configuration

The workflow file has been updated at [.github/workflows/deploy-ui.yml](.github/workflows/deploy-ui.yml).

**Important**: Verify the `AZURE_STATIC_WEB_APP_NAME` matches your Azure resource:
- Current value: `therapy-connect`
- This matches your Azure Static Web App name

---

## Step 5: Deploy

### Automatic Deployment (on push to main)

Any push to the `main` branch that changes the following will trigger deployment:
- `src/**` (any files in src folder)
- `index.html`
- `package.json`
- `vite.config.ts`
- `.github/workflows/deploy-ui.yml`

### Manual Deployment

You can also trigger deployment manually:
1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy UI to Azure Static Web Apps" workflow
4. Click "Run workflow"
5. Select the branch and click "Run workflow"

---

## Step 6: Verify Deployment

1. **Check GitHub Actions**
   - Go to the "Actions" tab in your GitHub repository
   - Watch the workflow run
   - It should show green checkmarks when complete

2. **Get your Azure Static Web App URL**
   
   Using Azure Portal:
   - Go to your Static Web App in Azure Portal
   - The URL is shown in the "Overview" page
   - It will look like: `https://therapy-connect.azurestaticapps.net`
   
   Using Azure CLI:
   ```bash
   az staticwebapp show --name therapy-connect --resource-group rg-bh --query "defaultHostname" -o tsv
   ```

3. **Visit your deployed app**
   - Open the URL in your browser
   - Your app should be live!

---

## Troubleshooting

### Workflow fails at "Login to Azure"
- Check that `AZURE_CREDENTIALS` secret is correctly formatted JSON
- Verify the service principal has contributor access to the resource group

### Workflow fails at "Get Static Web App Deployment Token"
- Ensure the `AZURE_STATIC_WEB_APP_NAME` in the workflow matches your Azure resource name exactly
- Verify the resource is in the correct resource group

### App deploys but shows 404 errors on routes
- The `staticwebapp.config.json` should handle this
- Verify the file is being copied to the `dist` folder during build

### Build fails
- Test the build locally: `npm ci && npm run build`
- Check that all dependencies are in `package.json`
- Review build logs in GitHub Actions for specific errors

---

## Cost Information

Azure Static Web Apps pricing:
- **Free tier**: Includes 100 GB bandwidth/month, suitable for testing and small projects
- **Standard tier**: $9/month per app, includes 100 GB bandwidth (additional bandwidth costs apply)

See: [Azure Static Web Apps Pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/static/)

---

## Custom Domain (Optional)

To add a custom domain:

1. In Azure Portal, go to your Static Web App
2. Click "Custom domains" in the left menu
3. Click "Add"
4. Enter your domain and follow the DNS configuration steps

---

## Next Steps

- Set up staging environments using branches
- Configure custom domains
- Add authentication if needed
- Set up monitoring and logging
- Configure CI/CD for automated testing before deployment
