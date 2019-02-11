// import {addSessionToStorage} from "../logic/storeTabs"; //**Ask about this */
// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;

var gettingStoredStats = browser.storage.local.get();

async function addSessionToStorage(urls, sessionName) {
  // Load existent stats with the storage API.
  console.log("in addToStorage, urls: "+urls)
  return gettingStoredStats.then(results => {
      // Initialize the saved stats if not yet initialized.
      if (!("sessions" in results)) {
        results = {
          sessions : {}
        };
      }
      
      results["sessions"][sessionName] = urls;
      console.log(results);
      // Persist the updated stats.
      browser.storage.local.set(results);
  }).then(() => {return urls;});
}

async function getSavedSessions() {
  return gettingStoredStats.then(results => {
    if (!("sessions" in results)) {
      console.log("no sessions stored")
      return {};
    }
    return results["sessions"];
  });
}

function firstUnpinnedTab(tabs) {
  for (var tab of tabs) {
    if (!tab.pinned) {
      return tab.index;
    }
  }
}

async function addSessionToPopup(sessionName, sessionURLs) {
  getSavedSessions().then((sessions) => {
    console.log("in addToPopup, urls: "+sessionURLs);
    let sessionsList = document.getElementById('sessions-list');

    let newSession = document.createDocumentFragment();

    let sessionLink = document.createElement('a');
    sessionLink.textContent = sessionName;
    sessionLink.setAttribute('href', "#");
    sessionLink.addEventListener("click", openSession.bind(null, sessions[sessionName]));

    sessionLink.classList.add('open-session');
    newSession.appendChild(sessionLink);

    sessionsList.appendChild(newSession);
  });
}

/** 
 * retrieve past session and add links to them
 */
async function openSessions() {
  console.log("in open sessions");
  getSavedSessions().then((sessions) => {
    let sessionsList = document.getElementById('sessions-list');
    let savedSessions = document.createDocumentFragment();

    sessionsList.textContent = '';

    let sessionNames = Object.getOwnPropertyNames(sessions);

    for (let sessionName of sessionNames) {
      let sessionLink = document.createElement('a');
      sessionLink.textContent = sessionName;
      sessionLink.setAttribute('href', "#");
      sessionLink.addEventListener("click", openSession.bind(null, sessions[sessionName]));
      
      sessionLink.classList.add('open-session');
      savedSessions.appendChild(sessionLink);
    }

    sessionsList.appendChild(savedSessions);
  });
}

function openSession(urls) {
  let createData = {
    url: urls
  };
  let creating = browser.windows.create(createData);
}

function onSessionsCleared() {
  console.log("sessions cleared");
  let sessionsList = document.getElementById('sessions-list');
  sessionsList.textContent = '';
}

function onSessionsClearedFail(e) {
  console.log(e);
}

function clearSessions() {
  let removeSessions =  browser.storage.local.remove("sessions");
  removeSessions.then(onSessionsCleared, onSessionsClearedFail)
}

document.addEventListener("DOMContentLoaded", openSessions);

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

document.addEventListener("click", async (e) => {
  function callOnActiveTab(callback) {
    getCurrentWindowTabs().then((tabs) => {
      for (var tab of tabs) {
        if (tab.active) {
          callback(tab, tabs);
        }
      }
    });
  }

  function getCurrentWindow() {
    return browser.windows.getCurrent();
  }

  function getCurrentURLs() {
    return getCurrentWindowTabs().then((tabs) => {
      var urls = [];
      for (var tab of tabs) {
        if (!(tab.url.includes("about:", 0))) {
          urls.push(tab.url);
        }
      }
      return urls;
    });
  }

  if (e.target.id === "clear-sessions") {
    console.log("clearing sessions");
    clearSessions();
  }

  else if (e.target.id == "save-button") {
    let sessionName = document.getElementById('name-input').value;
    console.log(sessionName);
    if (sessionName === "") {
      console.log("empty name, not saving");
    }
    else {
      document.getElementById('name-input').value = '';
      getCurrentURLs().then((sessionURLs) => {
        addSessionToStorage(sessionURLs, sessionName).then((sessionURLs) => {
          addSessionToPopup(sessionName, sessionURLs)
        });
      });
    }
  }

  e.preventDefault();
});

//onRemoved listener. fired when tab is removed
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log(`The tab with id: ${tabId}, is closing`);

  if(removeInfo.isWindowClosing) {
    console.log(`Its window is also closing.`);
  } else {
    console.log(`Its window is not closing`);
  }
});

//onMoved listener. fired when tab is moved into the same window
browser.tabs.onMoved.addListener((tabId, moveInfo) => {
  var startIndex = moveInfo.fromIndex;
  var endIndex = moveInfo.toIndex;
  console.log(`Tab with id: ${tabId} moved from index: ${startIndex} to index: ${endIndex}`);
});

/**
//  * listTabs to switch to
//  */
// function listTabs() {
//   getCurrentWindowTabs().then((tabs) => {
//     let tabsList = document.getElementById('tabs-list');
//     let currentTabs = document.createDocumentFragment();
//     let limit = 5;
//     let counter = 0;

//     tabsList.textContent = '';

//     for (let tab of tabs) {
//       if (!tab.active && counter <= limit) {
//         let tabLink = document.createElement('a');

//         tabLink.textContent = tab.title || tab.id;
//         tabLink.setAttribute('href', tab.id);
//         tabLink.classList.add('switch-tabs');
//         currentTabs.appendChild(tabLink);
//       }

//       counter += 1;
//     }

//     tabsList.appendChild(currentTabs);
//   });
// }

// document.addEventListener("DOMContentLoaded", listTabs);