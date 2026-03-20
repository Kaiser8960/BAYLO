import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Handle unhandled promise rejections to prevent console errors
window.addEventListener('unhandledrejection', (event) => {
  // Suppress known browser extension errors
  // Check if error is a string or Error object with the message
  const errorMessage = typeof event.reason === 'string' 
    ? event.reason 
    : event.reason?.message || event.reason?.toString() || '';
  
  // Suppress browser extension errors (these are not from our code)
  if (errorMessage.includes('message channel closed') || 
      errorMessage.includes('asynchronous response') ||
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('Receiving end does not exist') ||
      errorMessage.includes('message channel closed before a response was received') ||
      errorMessage.includes('A listener indicated an asynchronous response')) {
    // This is a browser extension error, not our code - suppress it
    event.preventDefault();
    return;
  }
  
  // Log other unhandled rejections - don't suppress critical errors
  console.error('Unhandled promise rejection:', event.reason);
  // Don't prevent default - let errors show so we can debug
});

// Handle errors - only suppress known browser extension errors
window.addEventListener('error', (event) => {
  const errorMessage = event.message || event.error?.message || '';
  // Only suppress browser extension errors, not real app errors
  if (errorMessage.includes('message channel closed') || 
      errorMessage.includes('asynchronous response') ||
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('A listener indicated an asynchronous response')) {
    // This is a browser extension error, suppress it
    event.preventDefault();
    return false;
  }
  // Log all other errors for debugging
  console.error('JavaScript error:', event.error || event.message, event.filename, event.lineno);
});

// Ensure root element exists before rendering
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: Root element not found</h1><p>Please refresh the page.</p></div>';
} else {
  // Hide fallback content
  const fallback = document.getElementById('fallback');
  if (fallback) {
    fallback.style.display = 'none';
  }
  
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error('Failed to render React app:', error);
    // Show fallback content
    if (fallback) {
      fallback.style.display = 'block';
      fallback.innerHTML = `
        <h1>Error Loading App</h1>
        <p>${error.message || 'Unknown error occurred'}</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #112250; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Reload Page
        </button>
      `;
    } else {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: system-ui;">
          <h1>Error Loading App</h1>
          <p>${error.message || 'Unknown error occurred'}</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #112250; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    }
  }
}

// Register service worker for PWA - with iOS Safari compatibility
if ('serviceWorker' in navigator) {
  // Delay service worker registration to ensure page loads first (iOS Safari fix)
  window.addEventListener('load', async () => {
    // Add a small delay for iOS Safari to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Detect iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      // Check if we're in a PWA context (standalone mode)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone || 
                          document.referrer.includes('android-app://');
      
      // On iOS Safari, be more cautious with service workers
      if (isIOS && isSafari) {
        // For iOS Safari, only register if not in standalone mode (to avoid issues)
        if (!isStandalone) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
              updateViaCache: 'none'
            });
            console.log('Service Worker registered on iOS Safari:', registration.scope);
          } catch (swError) {
            console.warn('Service Worker registration failed on iOS Safari (this is normal):', swError);
            // iOS Safari has limited service worker support - this is expected
          }
        }
      } else {
        // For other browsers, use full service worker support
        // Only unregister on first load, not on every load (prevents reload loops)
        const hasUnregistered = sessionStorage.getItem('sw_unregistered');
        if (!hasUnregistered) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            // Only unregister if it's an old version
            if (registration.scope.includes('/') && !registration.active?.scriptURL?.includes('baylo-v7')) {
              await registration.unregister();
              console.log('Unregistered old service worker:', registration.scope);
            }
          }
          sessionStorage.setItem('sw_unregistered', 'true');
        }
        
        // Register new service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none' // Always fetch fresh service worker
        });
        
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Only listen for controller change once, and only reload if not in standalone mode
        // This prevents infinite reload loops in PWA
        let hasReloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!hasReloaded && !isStandalone) {
            hasReloaded = true;
            console.log('New service worker activated, reloading page...');
            // Small delay to prevent immediate reload loop
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
        
        // Check for updates periodically (but don't force reload in PWA)
        registration.update();
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      }
      
    } catch (error) {
      console.error('Service Worker registration error:', error);
      // Don't block app loading if service worker fails
    }
  });
}
