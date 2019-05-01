import { clearSessions, restoreStorageFromFile, writeToLocalFile }
         from "../logic/sessionStorage.js";
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
    const jsonFile = fileList[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        var text = reader.result;
        var results = JSON.parse(text);
        restoreStorageFromFile(results);
        alert("Sessions restored successfully!");
    }

    reader.readAsText(jsonFile);
}

let saveInput = document.getElementById("save-name-input");
const defaultInputText = saveInput.value;
saveInput.addEventListener("blur", resetInputText, false);
function resetInputText() {
    if (saveInput.value == "") {
        saveInput.value = defaultInputText;
    }
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
    else if (e.target.id == "save-button") {
        if (saveInput.value != defaultInputText) {
            writeToLocalFile(saveInput.value);
            saveInput.value = defaultInputText;
        }
    }
    else if (e.target.id == "save-name-input") { // clear input field on click
        if (saveInput.value == defaultInputText) {
            saveInput.value = "";
        }
    }
});