export {shouldTabsLoad};
export {setShouldTabsLoad};
export {setShouldRestoreWindow};
export {shouldRestoreWindow};


var gettingStoredStatsLocal = browser.storage.local.get();

function setShouldTabsLoad(shouldLoad) {
    return gettingStoredStatsLocal.then(results => {
        return results["settings"]["shouldLoad"];
    });
}

function shouldTabsLoad() {
    return gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
        } 

        if(!("shouldLoad" in results["settings"])) {
            results["settings"]["shouldLoad"] = false;
            browser.storage.local.set(results);

            return false;
        } else {
            return results["settings"]["shouldLoad"];
        }
    });
}

function setShouldRestoreWindow(shouldLoad) {
    return gettingStoredStatsLocal.then(results => {
        return results["settings"]["shouldRestore"];
    });
}

function shouldRestoreWindow() {
    return gettingStoredStatsLocal.then(results => {
        if(!("settings" in results)) {
            results["settings"] = {}
        } 

        if (!("shouldRestore" in results["settings"])) {
            results["settings"]["shouldRestore"] = true;
            browser.storage.local.set(results);

            return true;
        } else {
            return results["settings"]["shouldRestore"];
        }
    });
}