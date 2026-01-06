# Pipedream Documentation Generator UI

A modern, clean single-page application that allows non-developers to generate documentation for their Pipedream projects.

## Features

- **Simple Authentication**: Enter your Pipedream API key and optional organization ID
- **Project Selection**: View and select multiple projects with a clean card-based interface
- **Flexible Documentation**: Choose between AI-enhanced or raw documentation
- **Batch Processing**: Generate documentation for multiple projects at once
- **Easy Downloads**: Download individual files or all at once
- **Modern Design**: Clean, responsive interface that works on desktop and mobile

## Quick Start

### 1. Configure API Endpoint

Open `script.js` and update the API base URL on line 9:

```javascript
const API_BASE_URL = 'https://your-api-endpoint.com'; // Replace with your actual endpoint
```

### 2. Open the Application

Simply open `index.html` in your web browser. No build process or server required!

```bash
# Option 1: Open directly in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Use a simple HTTP server (recommended)
python -m http.server 8000
# Then visit http://localhost:8000
```

### 3. Use the Application

1. **Connect**: Enter your Pipedream API key and optional organization ID
2. **Select**: Choose one or more projects from your workspace
3. **Configure**: Select documentation type (AI-enhanced or raw)
4. **Generate**: Click to generate documentation
5. **Download**: Download individual files or all at once

## File Structure

```
pipedream_doc_tool_ui/
├── index.html    # Main HTML structure
├── styles.css    # Modern, responsive styles
├── script.js     # Application logic and API integration
└── README.md     # This file
```

## API Integration

The application integrates with the following API endpoints:

### Authentication Headers
- `X-Pipedream-API-Key`: Your Pipedream API key (required)
- `X-Org-Id`: Your organization ID (optional)

### Endpoints Used

1. **List Projects**
   - `GET /projects?limit=100`
   - Fetches all projects from your workspace

2. **Generate AI-Enhanced Documentation**
   - `GET /projects/{project_id}/documentation?project_description={description}`
   - Generates structured documentation with AI analysis

3. **Generate Raw Documentation**
   - `GET /projects/{project_id}/raw-documentation`
   - Generates code and configuration documentation

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with flexbox/grid
- **HTMX**: Dynamic interactions (included via CDN)
- **Vanilla JavaScript**: Minimal client-side logic

### Design Principles
- **Mobile-first**: Responsive design that works on all screen sizes
- **Accessible**: Semantic HTML and proper ARIA labels
- **Clean**: Minimal UI with clear visual hierarchy
- **Modern**: Contemporary color scheme and smooth transitions

## Customization

### Colors
Edit CSS variables in `styles.css` (lines 10-20):

```css
:root {
    --primary-color: #3b82f6;  /* Main brand color */
    --primary-hover: #2563eb;  /* Hover state */
    --success-color: #10b981;  /* Success messages */
    --error-color: #ef4444;    /* Error messages */
    /* ... */
}
```

### API Timeout
The application uses browser default fetch timeouts. To add custom timeout:

```javascript
// Add to script.js
const fetchWithTimeout = (url, options, timeout = 30000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};
```

## Security Notes

- API keys are never stored (session only)
- No external dependencies except HTMX (loaded from CDN)
- Input sanitization prevents XSS attacks
- HTTPS recommended for production use

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your API server includes:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: X-Pipedream-API-Key, X-Org-Id
```

### Downloads Not Working
Some browsers block multiple simultaneous downloads. Try:
1. Enable multiple downloads in browser settings
2. Download files individually
3. Use "Download All" with a slight delay between files

### Projects Not Loading
Check:
1. API key is correct
2. Organization ID is valid (if using)
3. API endpoint URL is correct
4. Browser console for error messages

## License

MIT License - Feel free to modify and use as needed!

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoint is accessible
3. Ensure credentials are valid
4. Check network tab in browser dev tools

### Monitoring

UptimeRobot page for monitoring: https://dashboard.uptimerobot.com/monitors/802029016