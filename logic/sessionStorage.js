import { saveAs } from "../dependencies/FileSaver.js";

export { gettingStoredStatsLocal, addSessionToStorage, deleteSessionFromStorage,
    getSavedSessions, setActiveListView, getActiveListView, clearSessions,
    writeToLocalFile, deleteTabFromStorage, addTabToStorage,
    restoreStorageFromFile, replaceSessionData };

var gettingStoredStatsLocal = browser.storage.local.get();
var gettingStoredStatsSync = browser.storage.sync.get();


function setResults(results) {
    var sending = browser.runtime.sendMessage({
        setResults: {
            results: results
        }
    });
    sending.then(handleResponse, handleError);
}

function setActiveListView(sessionName, urls) {
    gettingStoredStatsLocal.then(results => {
        results["listview"] = {};
        results["listview"] = {
            sessionName: sessionName,
            urls: Array.from(urls)
        }

        delete results.sessions;
        delete results.settings;
        setResults(results);
    });
}

function getActiveListView() {
    return gettingStoredStatsLocal.then(results => {
        return results["listview"];
    });
}

function replaceSessionData(sessionName, sessionURLs) {
    console.log(sessionURLs);
    gettingStoredStatsLocal.then(results => {
        results.sessions[sessionName]["urls"] = sessionURLs;
        console.log("replacing session "+sessionName);
        console.log(results);

        delete results.settings;
        delete results.listview;
        setResults(results);
    });
}

function deleteTabFromStorage(sessionName, tab) {
    gettingStoredStatsLocal.then(results => {
        results.sessions[sessionName]["urls"].splice(tab, 1);
        console.log("deleting tab");
        console.log(results);

        delete results.settings;
        delete results.listview;
        setResults(results);
    });
}

function addTabToStorage(sessionName, tab) {
    gettingStoredStatsLocal.then(results => {
        results.sessions[sessionName]["urls"].push(tab);
        console.log("adding tab");
        console.log(results);

        delete results.settings;
        delete results.listview;
        setResults(results);
    });
}

function deleteSessionFromStorage(sessionName) {
    gettingStoredStatsLocal.then(results => {
        delete results.sessions[sessionName];
        console.log("deleting storage");
        console.log(results);

        delete results.settings;
        delete results.listview;
        setResults(results);
    });
}

function addSessionToStorage(urls, sessionName, window) {
    console.log("in addToStorage, urls: ", urls);
    console.log("in addToStorage, window: ", window);
    return gettingStoredStatsLocal.then((results) => {
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
        delete results.settings;
        delete results.listview;
        setResults(results);
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
        return results.sessions;
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

function restoreStorageFromFile(data) {
    setResults(data);
}

/** 
 * For use with sending messages to background script
 */
function handleResponse(message) {
    if (message) {
        console.log(`Message from the background script:  ${message.response}`);
    } else {
        console.log("No response from background script");
    }
}
function handleError(error) {
    console.log(`Error: ${error}`);
}