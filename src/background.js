// Fixed background.js for Manifest V3
console.log('Word Counter Plus service worker starting...');

const title = chrome.runtime.getManifest().name;

// Create context menu when service worker starts
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  console.log('Creating context menu...');
  
  // Remove existing menu items first
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'word-counter-plus',
      title: title,
      contexts: ['selection']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error creating context menu:', chrome.runtime.lastError);
      } else {
        console.log('Context menu created successfully');
      }
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info);
  
  if (info.menuItemId === 'word-counter-plus') {
    const text = info.selectionText;
    console.log('Selected text:', text);

    if (!text) {
      console.error('No text selected');
      return;
    }

    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = text.length;

    let totalLength = 0;
    let maxLength = 0;
    
    for (let i = 0; i < wordCount; i++) {
      const curLength = words[i]
        .replace(/[.,?!()<>{}[\]/\\+=~'`|:;]/g, '').length;
      totalLength += curLength;
      if (curLength > maxLength) {
        maxLength = curLength;
      }
    }
    
    const avgLength = wordCount === 0 ? 0 : totalLength / wordCount;
    const numAverageDigits = 2;

    const message = `Word Count: ${wordCount}
Character Count: ${charCount}
Average Word Length: ${avgLength.toFixed(numAverageDigits)}
Longest Word Length: ${maxLength}`;

    console.log('Showing alert:', message);

    // In Manifest V3, we need to inject a script to show the alert
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showAlert,
      args: [message]
    }).catch(error => {
      console.error('Error executing script:', error);
    });
  }
});

// Function to be injected into the page
function showAlert(message) {
  alert(message);
}
