// This runs when the user clicks the extension icon.

// Get the toggle switch element from the HTML
const toggleSwitch = document.getElementById('toggle');
const statusText = document.getElementById('status');

// 1. Load the current setting when the popup opens
function loadSettings() {
    // Check local storage for the saved preference (defaults to true if not found)
    chrome.storage.local.get(['isSkippingEnabled'], (result) => {
        const isEnabled = result.isSkippingEnabled !== false; // Default to true
        toggleSwitch.checked = isEnabled;
        updateStatusText(isEnabled);
    });
}

// Helper function to update the visible status text
function updateStatusText(isEnabled) {
    statusText.textContent = isEnabled ? 'Active' : 'Disabled';
    statusText.style.color = isEnabled ? 'green' : 'red';
}

// 2. Save the setting when the toggle switch changes
function saveSettings() {
    const isEnabled = toggleSwitch.checked;
    
    // Save the new state to local storage
    chrome.storage.local.set({ isSkippingEnabled: isEnabled }, () => {
        console.log("Setting saved. Ad Skipping is now:", isEnabled);
        updateStatusText(isEnabled);
        
        // **IMPORTANT:** Reload the YouTube tab to apply the new setting immediately
        // The content.js script needs to read this new setting.
        chrome.tabs.query({url: "*://www.youtube.com/*", active: true}, function(tabs) {
            if (tabs.length > 0) {
                 // The message can tell the content script to enable/disable its loop
                 chrome.tabs.sendMessage(tabs[0].id, {
                    command: "update_status",
                    isEnabled: isEnabled
                });
            }
        });
    });
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
toggleSwitch.addEventListener('change', saveSettings);

console.log("Popup script loaded.");