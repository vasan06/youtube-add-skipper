// This script runs in the background and listens for events.
// We use a listener to detect when the active tab finishes navigating.

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the update is complete (status: 'complete')
    // AND if the URL is a YouTube video page.
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
        
        // When a new video loads (even without a full page refresh),
        // we can optionally send a message to the content script to re-check for ads.
        // For our current content.js using setInterval, this isn't strictly necessary,
        // but it's a good pattern for more complex logic.
        
        console.log("Service Worker: YouTube video navigation complete. Re-checking for ads.");
        
        // The following line is needed in the manifest.json to include this file:
        // "background": { "service_worker": "service_worker.js" }
        // (This line is not required if the service worker is empty, so we won't add it yet.)
    }
});

console.log("YouTube Ad Skipper Background Service Worker Loaded.");