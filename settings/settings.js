import { clearSessions, readFromLocalFile } from "../logic/sessionStorage.js";
import { setShouldTabsLoad, setShouldRestoreWindow, shouldTabsLoad,
         shouldRestoreWindow } from "../logic/settingsStorage.js";


var shouldLoad, shouldRestore;

function populateToggleSettings() {
    let toggleWindowRestore = document.getElementById("window-settings");
    let toggleLazyTabs = document.getElementById("lazy-tabs");

    shouldTabsLoad().then((val) => {shouldLoad = val;}).then(() => {
        shouldRestoreWindow().then((val) => {shouldRestore = val;}).then(() => {
            console.log(shouldLoad);
            console.log(shouldRestore);
            if (!shouldLoad) {
                toggleLazyTabs.checked = true;
            } else if (shouldRestore) {
                toggleWindowRestore.checked = true;
            }
        });
    });
}

let restoreSessionInput = document.getElementById('json-button');
restoreSessionInput.addEventListener("change", handleFiles, false);
function handleFiles() {
    const fileList = this.files; /* now you can work with the file list */
    console.log(fileList);
}


document.addEventListener("DOMContentLoaded", populateToggleSettings);
document.addEventListener("click", async (e) => {
    if (e.target.id == "clear-all-button") {
        clearSessions();
    }
    else if (e.target.id == "window-settings") {
        setShouldRestoreWindow(!shouldRestore);
    }
    else if (e.target.id == "lazy-tabs") {
        setShouldTabsLoad(!shouldLazy);
    }
});