import { extDB } from "../storage/extDB.js";
import { saveAs } from "../dependencies/FileSaver.js";


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

function writeToLocalFile(fileName) {
    extDB.fetchAllStorage(function(results) {
        console.log(results);
        if (Object.keys(results).length === 0 &&
             results.constructor === Object) {
            // TODO: display some message of nothing to save
            return;
        }

        var jsonString = JSON.stringify(results, null, 2);
        console.log(jsonString);

        var blob = new Blob([jsonString], {type: "text/plain;charset=utf-8"});
        saveAs(blob, fileName+".json");
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

        if (resultsKeys.length != 2 || resultsKeys[0] != "sessions" ||
            resultsKeys[1] != "settings") {
            // TODO tell user to input valid file
            console.log("invalid file");
        } else {
            // restoreStorageFromFile(results);
            // alert("Sessions restored successfully!");
            extDB.restoreFromJSON(results);
        }
    }

    reader.readAsText(jsonFile);
}

const saveInput = document.getElementById('save-name-input');
document.addEventListener("DOMContentLoaded", populateToggleSettings);
document.addEventListener("click", async (e) => {
    if (e.target.id == "clear-all-button") {
        extDB.clearSessions(function () {
            alert("Sessions cleared successfully");
        });
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