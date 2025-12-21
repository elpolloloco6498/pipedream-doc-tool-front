# Deploy to GitHub Pages

## Step-by-Step Guide

### 1. Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `pipedream-doc-ui` (or any name you prefer)
   - **Description**: "Pipedream Documentation Generator - A simple UI to generate documentation for Pipedream projects"
   - **Visibility**: Public (required for free GitHub Pages)
   - **DON'T** initialize with README (we already have files)
4. Click **"Create repository"**

### 2. Initialize Git and Push Your Code

Open your terminal and run these commands:

```bash
# Navigate to your project directory
cd /home/isham/projects/pipedream_doc_tool_ui

# Initialize Git repository
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Pipedream Documentation Generator UI"

# Rename branch to main (if needed)
git branch -M main

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/pipedream-doc-ui.git

# Push to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top menu)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**:
   - Select **"Deploy from a branch"**
   - Choose **"main"** branch
   - Select **"/ (root)"** folder
5. Click **"Save"**

### 4. Wait for Deployment

- GitHub will automatically build and deploy your site
- This takes about 1-2 minutes
- You'll see a green checkmark when it's done
- Your site will be live at: `https://YOUR_USERNAME.github.io/pipedream-doc-ui/`

### 5. Update Backend CORS Settings

Once deployed, update your FastAPI backend CORS to include your new URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://YOUR_USERNAME.github.io",  # Add your GitHub Pages URL
        "http://localhost:8000",             # Keep for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Important:** Replace `YOUR_USERNAME` with your actual GitHub username!

Then commit and push the backend changes to Render.

---

## 🎉 You're Done!

Your app is now live at: `https://YOUR_USERNAME.github.io/pipedream-doc-ui/`

---

## Future Updates

Whenever you make changes to your frontend:

```bash
git add .
git commit -m "Description of your changes"
git push
```

GitHub Pages will automatically redeploy in 1-2 minutes!

---

## Custom Domain (Optional)

Want to use your own domain like `docs.yourdomain.com`?

1. In your repository, go to **Settings → Pages**
2. Under **"Custom domain"**, enter your domain
3. Add a CNAME record in your DNS settings pointing to `YOUR_USERNAME.github.io`
4. GitHub will automatically provision a free SSL certificate

---

## Troubleshooting

### Site not loading?
- Wait 2-3 minutes after enabling GitHub Pages
- Check the **Actions** tab to see deployment status
- Make sure the repository is **Public**

### 404 Error?
- Verify the branch is set to `main` in Pages settings
- Check that `index.html` is in the root directory

### Still having CORS errors?
- Make sure you updated the backend CORS settings
- Clear your browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check that your GitHub Pages URL is correct in the CORS settings

---

## Need Help?

Check the deployment status:
- Repository → **Actions** tab (shows deployment progress)
- Settings → **Pages** (shows your live URL)

GitHub Pages is free forever for public repositories!
