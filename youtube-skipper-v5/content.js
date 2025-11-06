// A global variable to hold the user's preference (default is true)
let isSkippingEnabled = true;

// --- Utility Functions (Keep these the same) ---
function loadSkippingSetting() {
    chrome.storage.local.get(['isSkippingEnabled'], (result) => {
        isSkippingEnabled = result.isSkippingEnabled !== false;
        console.log("Ad Skipper: Initial setting loaded. Enabled:", isSkippingEnabled);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "update_status") {
        isSkippingEnabled = request.isEnabled;
        console.log("Ad Skipper: Status updated via popup message. Enabled:", isSkippingEnabled);
    }
});


// --- Core Ad Skipping Logic ---
function handleAdActions() {
    // 1. Check if the feature is disabled (exit if so)
    if (!isSkippingEnabled) {
        const videoElement = document.querySelector('video');
        if (videoElement && videoElement.muted) videoElement.muted = false; 
        return;
    }
    
    // 2. Define key elements
    const videoElement = document.querySelector('video');
    // Check if the player is in an ad state (the class 'ad-showing' is the primary indicator)
    const isAdPlaying = document.querySelector('.ad-showing'); 

    // --- A. Handle Banners/Overlays (Always safe to remove) ---
    const bannerCloseButton = document.querySelector('.ytp-ad-overlay-close-button');
    if (bannerCloseButton) {
        bannerCloseButton.click();
        console.log("Auto Skip: Closed banner ad overlay.");
    }
    
    // --- B. The Main Logic: Ad is Playing ---
    if (videoElement && isAdPlaying) {
        
        // --- B1. Try Clicking the Skip Button (The Preferred Method) ---
        const skipButtonSelectors = [
            '.ytp-ad-skip-button-modern',   
            '.ytp-ad-skip-button-text',     
            'button[aria-label^="Skip ad"]' 
        ];

        for (const selector of skipButtonSelectors) {
            const button = document.querySelector(selector);
            if (button) {
                button.click();
                console.log("Auto Skip: Clicked skip button.");
                return; // Ad is successfully skipped
            }
        }
        
        // --- B2. Fallback: Mute and Seek for Stubborn/Unskippable Ads ---
        // Only use the aggressive seek method if the video is detected as an ad
        if (isFinite(videoElement.duration)) {
             // Mute the video
             if (videoElement.muted === false) {
                 videoElement.muted = true;
             }
             
             // Seek to the end of the ad
             videoElement.currentTime = videoElement.duration - 0.1;
             console.log("Auto Skip: Fallback: Seeking past Ad (Muted and Fast-Forwarded).");
        }

    } else {
        // --- C. Clean Up (Ad is over) ---
        
        // If the ad is over (no ad class) and the video is still muted by our script, unmute it.
        if (videoElement && videoElement.muted) {
            videoElement.muted = false;
        }
    }
}

// Start the settings load and the continuous checking loop
loadSkippingSetting();
setInterval(handleAdActions, 300);

console.log("YouTube Ad Skipper v4.0 Initialized and Monitoring.");