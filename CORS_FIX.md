# Fixing CORS Issue

## The Problem

Your frontend (running in the browser) is trying to access your API at `https://pipedream-doc-tool.onrender.com`, but the browser is blocking the request due to CORS (Cross-Origin Resource Sharing) policy.

## Solution: Configure CORS on Your Backend

You need to add CORS headers to your FastAPI application. Here's how:

### Option 1: Allow All Origins (Development/Testing)

Add this to your FastAPI application (usually in `main.py`):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Your existing routes...
```

### Option 2: Allow Specific Origins (Production - Recommended)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "https://yourdomain.com",  # Add your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["X-Pipedream-API-Key", "X-Org-Id", "Content-Type"],
)

# Your existing routes...
```

### Where to Add This Code

1. **Find your main FastAPI file** (likely `main.py` or `app.py`)
2. **Add the import** at the top:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   ```
3. **Add the middleware** right after creating the `app = FastAPI()` instance
4. **Deploy the changes** to Render

## After Deploying

1. Wait for Render to rebuild and deploy (usually 2-5 minutes)
2. Test your frontend again
3. The CORS error should be resolved

## Verification

You can verify CORS is working by checking the browser console. The request should now succeed, and you should see these headers in the response:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: X-Pipedream-API-Key, X-Org-Id, Content-Type
```

## Alternative: Temporary Local Testing

If you want to test locally while waiting for the backend fix, you can:

### Option A: Use a CORS Proxy (Quick Test Only)

Update `script.js` line 9 temporarily:

```javascript
const API_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://pipedream-doc-tool.onrender.com';
```

**Warning**: This is ONLY for testing! Never use in production.

### Option B: Run Chrome with CORS Disabled (Development Only)

**macOS:**
```bash
open -na Google\ Chrome --args --user-data-dir=/tmp/temporary-chrome-profile-dir --disable-web-security --disable-features=IsolateOrigins,site-per-process
```

**Windows:**
```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
```

**Linux:**
```bash
google-chrome --user-data-dir=/tmp/chrome-dev --disable-web-security
```

**Warning**: Only use for development! Close this browser when done.

## Recommended Approach

**Best practice for production:**

1. Fix CORS on your backend (Option 2 above)
2. Host your frontend on a proper domain (GitHub Pages, Netlify, Vercel, etc.)
3. Add that domain to your `allow_origins` list
4. Keep localhost origins for development

---

## Still Having Issues?

Check these:

1. **Backend logs**: Look for OPTIONS requests being blocked
2. **Browser console**: Check the exact CORS error message
3. **Network tab**: Look at the preflight OPTIONS request
4. **Headers**: Ensure custom headers (X-Pipedream-API-Key) are allowed

Need help? Share:
- Exact error message from browser console
- Your backend framework/code structure
- Where your frontend is hosted
