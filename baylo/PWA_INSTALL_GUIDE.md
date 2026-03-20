# PWA Installation Guide for Baylo

Your Baylo application is now a Progressive Web App (PWA)! This guide will help you install it on different devices and browsers.

## ✅ What's Been Implemented

- ✅ `manifest.json` - App metadata and icons
- ✅ Service Worker (`sw.js`) - Offline support and caching
- ✅ PWA meta tags in `index.html`
- ✅ Service worker registration in `main.jsx`

## 📱 How to Install Baylo PWA

### **On Desktop (Chrome, Edge, Brave)**

1. **Open Baylo** in your browser (make sure you're using HTTPS or localhost)
2. **Look for the install icon** in the address bar (usually a "+" or install icon)
3. **Click the install icon** or go to the browser menu → "Install Baylo"
4. **Confirm installation** when prompted
5. The app will appear as a standalone window on your desktop!

**Alternative Method:**
- Click the **three-dot menu** (⋮) in the top-right corner
- Select **"Install Baylo"** or **"Install app"**
- Click **"Install"** in the popup

### **On Android (Chrome)**

1. **Open Baylo** in Chrome browser
2. **Tap the menu** (three dots) in the top-right corner
3. Select **"Add to Home screen"** or **"Install app"**
4. **Tap "Add"** or **"Install"** when prompted
5. The app icon will appear on your home screen!

**Alternative Method:**
- When visiting the site, Chrome may show a **banner at the bottom** saying "Install Baylo"
- Simply tap **"Install"** on the banner

### **On iOS (Safari)**

1. **Open Baylo** in Safari browser
2. **Tap the Share button** (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. **Edit the name** if desired (default: "Baylo")
5. **Tap "Add"** in the top-right corner
6. The app icon will appear on your home screen!

**Note:** iOS doesn't fully support service workers, so offline features may be limited.

### **On Desktop (Firefox)**

1. **Open Baylo** in Firefox
2. Click the **menu** (three horizontal lines) in the top-right
3. Look for **"Install Site as App"** or similar option
4. Click **"Allow"** when prompted
5. The app will open in a separate window!

### **On Desktop (Safari - macOS)**

1. **Open Baylo** in Safari
2. Click **"File"** → **"Add to Dock"** or **"Add to Home Screen"**
3. The app will be available from your Dock or Launchpad!

## 🔍 Verifying PWA Installation

### Check if Service Worker is Active:

1. Open **Developer Tools** (F12 or Right-click → Inspect)
2. Go to **"Application"** tab (Chrome) or **"Storage"** tab (Firefox)
3. Click **"Service Workers"** in the left sidebar
4. You should see your service worker registered and running

### Check Manifest:

1. In Developer Tools, go to **"Application"** tab
2. Click **"Manifest"** in the left sidebar
3. You should see all your app details displayed

## 🚀 Testing the PWA

### Test Offline Mode:

1. Install the PWA
2. Open Developer Tools → **"Network"** tab
3. Check **"Offline"** checkbox
4. Refresh the page - it should still work!

### Test Installation Prompt:

1. Clear site data (Application tab → Clear storage)
2. Visit the site again
3. You should see an install prompt (if browser supports it)

## 📝 Building for Production

Before deploying, make sure to build the project:

```bash
npm run build
```

This will create an optimized production build in the `dist` folder with all PWA files included.

## 🐛 Troubleshooting

### Service Worker Not Registering:

- Make sure you're using **HTTPS** or **localhost**
- Check browser console for errors
- Clear browser cache and try again

### Install Button Not Appearing:

- Make sure the site meets PWA requirements:
  - ✅ Has a valid manifest.json
  - ✅ Has a registered service worker
  - ✅ Served over HTTPS (or localhost)
  - ✅ Has at least one icon

### Icons Not Showing:

- Verify icons exist in `/public` folder
- Check `manifest.json` has correct icon paths
- Ensure icons are at least 192x192px

## 🎨 Customizing the PWA

### Update App Name/Description:

Edit `baylo/public/manifest.json`:
```json
{
  "name": "Your Custom Name",
  "short_name": "Short Name",
  "description": "Your description"
}
```

### Change Theme Color:

Edit both `manifest.json` and `index.html`:
- `manifest.json`: `"theme_color": "#YOUR_COLOR"`
- `index.html`: `<meta name="theme-color" content="#YOUR_COLOR" />`

### Add More Icons:

Add icon files to `/public` folder and update `manifest.json` with different sizes:
```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 📚 Additional Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Enjoy your new PWA! 🎉**

