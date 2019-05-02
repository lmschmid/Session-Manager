export {shouldTabsLoad};
export {setShouldTabsLoad};
export {setShouldRestoreWindow};
export {shouldRestoreWindow};


var gettingStoredStatsLocal = browser.storage.local.get();


function setResults(results) {
    var sending = browser.runtime.sendMessage({
        setResults: {
            results: results
        }
    });
    sending.then(handleResponse, handleError);
}

function setShouldTabsLoad(shouldLoad) {
    gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
        }

        results["settings"]["shouldLoad"] = shouldLoad;

        delete results.sessions;
        delete results.listview;
        setResults(results);
    });
}

function shouldTabsLoad() {
    return gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
        } 

        if(!("shouldLoad" in results["settings"])) {
            results["settings"]["shouldLoad"] = false;

            delete results.sessions;
            delete results.listview;
            setResults(resuts);

            return false;
        } else {
            return results["settings"]["shouldLoad"];
        }
    });
}

function setShouldRestoreWindow(shouldLoad) {
    gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
        }

        results["settings"]["shouldRestore"] = shouldLoad;

        delete results.sessions;
        delete results.listview;
        setResults(resuts);
    });
}

function shouldRestoreWindow() {
    return gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
        } 

        if (!("shouldRestore" in results["settings"])) {
            results["settings"]["shouldRestore"] = true;

            delete results.sessions;
            delete results.listview;
            setResults(resuts);

            return true;
        } else {
            return results["settings"]["shouldRestore"];
        }
    });
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