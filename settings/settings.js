import { clearSessions, restoreStorageFromFile, writeToLocalFile }
         from "../logic/sessionStorage.js";
import { setShouldTabsLoad, setShouldRestoreWindow, shouldTabsLoad,
         shouldRestoreWindow } from "../logic/settingsStorage.js";
import { extDB } from "../storage/extDB.js";


function populateToggleSettings() {
    let toggleWindowRestore = document.getElementById("window-settings");
    let toggleLazyTabs = document.getElementById("lazy-tabs");

    extDB.open(function () {
        extDB.getSetting('shouldLoad', function (shouldLoad) {
            console.log(shouldLoad.state);
            if (!shouldLoad.state) {
                toggleLazyTabs.checked = true;
            }
        });
        extDB.getSetting('shouldRestore', function (shouldRestore) {
            if (shouldRestore.state) {
                toggleWindowRestore.checked = true;
            }
        });
    });
}


let restoreSessionInput = document.getElementById('json-button');
restoreSessionInput.addEventListener("change", handleFiles, false);
function handleFiles() {
    const fileList = this.files; /* now you can work with the file list */
    const jsonFile = fileList[0];

    if (jsonFile.type != 'application/json') {
        // TODO tell user to input valid file
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        var text = reader.result;
        var results = JSON.parse(text);

        let resultsKeys = Object.keys(results);
        console.log(resultsKeys);

        if (resultsKeys.length != 3 || resultsKeys[0] != "listview" ||
            resultsKeys[1] != "sessions" || resultsKeys[2] != "settings") {
            // TODO tell user to input valid file
        } else {
            restoreStorageFromFile(results);
            alert("Sessions restored successfully!");
        }
    }

    reader.readAsText(jsonFile);
}

const saveInput = document.getElementById('save-name-input');
document.addEventListener("DOMContentLoaded", populateToggleSettings);
document.addEventListener("click", async (e) => {
    if (e.target.id == "clear-all-button") {
        clearSessions();
    }
    else if (e.target.id == "window-settings") {
        extDB.getSetting('shouldRestore', function (shouldLoad) {
            extDB.setSetting('shouldRestore', !shouldLoad.state, function () {
                console.log("Set shouldRestore")
            });
        });
    }
    else if (e.target.id == "lazy-tabs") {
        extDB.getSetting('shouldLoad', function (shouldLoad) {
            extDB.setSetting('shouldLoad', !shouldLoad.state, function () {
                console.log("Set shouldLoad")
            });
        });
    }
    else if (e.target.id == "save-button") {
        writeToLocalFile(saveInput.value);
    }
});