export {shouldTabsLoad};
export {setShouldTabsLoad};
export {setShouldRestoreWindow};
export {shouldRestoreWindow};


var gettingStoredStatsLocal = browser.storage.local.get();

function setShouldTabsLoad(shouldLoad) {
    gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
        }

        results["settings"]["shouldLoad"] = shouldLoad;

        delete results.sessions;
        delete results.listview;
        browser.storage.local.set(results);
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
            browser.storage.local.set(results);

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
        browser.storage.local.set(results);
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
            browser.storage.local.set(results);

            return true;
        } else {
            return results["settings"]["shouldRestore"];
        }
    });
}