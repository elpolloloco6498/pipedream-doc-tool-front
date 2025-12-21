# Quick Fix for CORS Error

## The Problem
Your frontend successfully connects to the API for the first project, but subsequent requests fail with CORS errors. This is because your backend API is not configured to accept cross-origin requests.

## The Solution (2 minutes)

### Step 1: Find your FastAPI main file
Look for `main.py` or `app.py` in your backend repository.

### Step 2: Add these lines
```python
# At the top of the file, add this import:
from fastapi.middleware.cors import CORSMiddleware

# After creating your app (after the line: app = FastAPI())
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
```

### Step 3: Complete example
Here's how your file should look:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ← Add this

app = FastAPI(
    title="Pipedream Documentation Generator API",
    # ... your other config
)

# ← Add this entire block
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your existing routes below...
@app.get("/projects")
async def list_projects(...):
    # ...
```

### Step 4: Deploy to Render
1. Commit the changes:
   ```bash
   git add .
   git commit -m "Add CORS middleware"
   git push
   ```

2. Render will automatically deploy (wait 2-5 minutes)

3. Test your frontend again - the CORS errors should be gone!

## Verification

After deploying, open your browser console and try generating documentation. You should see:
- ✅ All requests succeed
- ✅ No CORS errors
- ✅ Multiple projects can be processed

## Still Having Issues?

If you still get CORS errors after deploying:

1. **Check Render logs**: Make sure the new code deployed
2. **Hard refresh**: Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
3. **Verify code**: Make sure the middleware is added BEFORE your routes
4. **Check imports**: Ensure `CORSMiddleware` is imported at the top

## Production Note

For production, replace `allow_origins=["*"]` with specific domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "http://localhost:8000",  # for local development
    ],
    # ... rest stays the same
)
```

---

**Questions?** Check the detailed [CORS_FIX.md](CORS_FIX.md) guide.
