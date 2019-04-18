export {gettingStoredStatsLocal};
export {addSessionToStorage};
export {deleteSessionFromStorage};
export {getSavedSessions};
export {shouldTabsLoad};
export {setShouldTabsLoad};
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

function deleteSessionFromStorage(sessionName) {
    gettingStoredStatsLocal.then(results => {
        delete results.sessions[sessionName];
        console.log("deleting storage");
        console.log(results);
        browser.storage.local.set(results);
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
        
        results["sessions"][sessionName] = {};
        results["sessions"][sessionName]["urls"] = urls;
        results["sessions"][sessionName]["createDate"] = new Date().toJSON().slice(0,10);

        // Persist the updated stats.
        browser.storage.local.set(results) 
        return results["sessions"][sessionName];
    }).then((session) => {return session;console.log("addSession returing: ", session)});
}

function getSavedSessions() {
    return gettingStoredStatsLocal.then(results => {
        console.log(results)
        if (!("sessions" in results)) {
            console.log("no sessions stored")
            return {};
        }
        return results["sessions"];
    });
}

function setShouldTabsLoad(shouldLoad) {
    return gettingStoredStatsLocal.then(results => {
        return results["settings"]["shouldLoad"];
    });
}

function shouldTabsLoad() {
    return gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
            results["settings"]["shouldLoad"] = false;

            // Persist the updated stats.
            browser.storage.local.set(results)
            return false;
        } else {
            return results["settings"]["shouldLoad"];
        }
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
