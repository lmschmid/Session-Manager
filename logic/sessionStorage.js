export {gettingStoredStatsLocal};
export {addSessionToStorage};
export {getSavedSessions};
export {setActiveListView};
export {getActiveListView};
export {clearSessions};

var gettingStoredStatsLocal = browser.storage.local.get();
var gettingStoredStatsSync = browser.storage.sync.get();

function setActiveListView(urls) {
  gettingStoredStatsLocal.then(results => {
    results["listview"] = {};
    results["listview"] = Array.from(urls);
    browser.storage.local.set(results);
  });
}

function getActiveListView() {
  return gettingStoredStatsLocal.then(results => {
    return results["listview"];
  });
}

function addSessionToStorage(urls, sessionName) {
  // Load existent stats with the storage API.
  console.log("in addToStorage, urls: "+urls)
  return gettingStoredStatsLocal.then(results => {
      // Initialize the saved stats if not yet initialized.
      if (!("sessions" in results)) {
        results = {
          sessions : {}
        };
      }
      
      results["sessions"][sessionName] = urls;
      console.log(results);

      // Persist the updated stats.
      browser.storage.local.set(results) 
  }).then(() => {return urls;});
}

function getSavedSessions() {
  return gettingStoredStatsLocal.then(results => {
      if (!("sessions" in results)) {
        console.log("no sessions stored")
        return {};
      }
      return results["sessions"];
    });
}

function clearSessions() {
  let removeSessionsLocal =  browser.storage.local.remove("sessions");
  let removeSessionsSync =  browser.storage.sync.remove("sessions");

  removeSessionsLocal.then(onSessionsCleared, onSessionsClearedFail);
  removeSessionsSync.then(onSessionsCleared, onSessionsClearedFail);
}

function onSessionsCleared() {
  console.log("sessions cleared");
  let sessionsList = document.getElementById('sessions-list');
  sessionsList.textContent = '';
}

function onSessionsClearedFail(e) {
  console.log(e);
}
