import { saveAs } from "../dependencies/FileSaver.js";

export { gettingStoredStatsLocal, addSessionToStorage, deleteSessionFromStorage,
    getSavedSessions, setActiveListView, getActiveListView, clearSessions,
    writeToLocalFile, readFromLocalFile };

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

function addSessionToStorage(urls, sessionName, window) {
    // Load existent stats with the storage API.
    console.log("in addToStorage, urls: ", urls);
    console.log("in addToStorage, window: ", window);
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

        results["sessions"][sessionName]["windowSettings"] = {
            height: window.height,
            incognito: window.incognito,
            left: window.left,
            width: window.width
        }

        // Persist the updated stats.
        browser.storage.local.set(results);
        return results["sessions"][sessionName];
    }).then((session) => {return session;});
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

function writeToLocalFile(sessionName) {
    gettingStoredStatsLocal.then(results => {
        if (Object.keys(results).length === 0 &&
             results.constructor === Object) {
            // TODO: display some message of nothing to save
            return;
        }
        var jsonString = JSON.stringify(results, null, 2);

        var blob = new Blob([jsonString], {type: "text/plain;charset=utf-8"});
        saveAs(blob, sessionName+".json");
    });
}

function readFromLocalFile() {
    // var results = readFile();
    // browser.storage.local.set(results);
    
}