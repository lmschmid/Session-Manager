import { clearSessions, readFromLocalFile } from "../logic/sessionStorage.js";
import { setShouldTabsLoad, setShouldRestoreWindow, shouldTabsLoad,
         shouldRestoreWindow } from "../logic/settingsStorage.js";


function populateToggleSettings() {
    let toggleWindowRestore = document.getElementById("window-settings");
    let toggleLazyTabs = document.getElementById("lazy-tabs");

    shouldTabsLoad().then((shouldLoad) => {
        if (!shouldLoad) {
            toggleLazyTabs.checked = true;
        }
    });

    shouldRestoreWindow().then((shouldRestore) => {
        if (shouldRestore) {
            toggleWindowRestore.checked = true;
        }
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
        shouldRestoreWindow().then((shouldRestore) => {
            setShouldRestoreWindow(!shouldRestore);
        });
    }
    else if (e.target.id == "lazy-tabs") {
        shouldTabsLoad().then((shouldLoad) => {
            setShouldTabsLoad(!shouldLoad);
        });
    }
});