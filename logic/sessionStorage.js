export {gettingStoredStats};
export {addSessionToStorage};
export {getSavedSessions};
export {clearSessions};

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

function clearSessions() {
  let removeSessions =  browser.storage.local.remove("sessions");
  removeSessions.then(onSessionsCleared, onSessionsClearedFail)
}

function onSessionsCleared() {
  console.log("sessions cleared");
  let sessionsList = document.getElementById('sessions-list');
  sessionsList.textContent = '';
}

function onSessionsClearedFail(e) {
  console.log(e);
}
