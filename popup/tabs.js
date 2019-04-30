import { addSessionToStorage, getSavedSessions, clearSessions,
        setActiveListView, deleteSessionFromStorage, writeToLocalFile,
        readFromLocalFile } from "../logic/sessionStorage.js"; 
import { shouldTabsLoad, shouldRestoreWindow } from "../logic/settingsStorage.js";

// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;

var shouldLoad, shouldRestore;
shouldTabsLoad().then((val) => {shouldLoad = val;});
shouldRestoreWindow().then((val) => {shouldRestore = val;});

/** 
 * opens html page in browser of list of tabs in session
 */
function openListView(sessionName, session) {
    browser.tabs.create({
        url:"/listview/listview.html"
    });

    setActiveListView(session["urls"]);
}

/** 
 * opens html settings page
 */
function openSettings() {
    browser.tabs.create({
        url:"/settings/settings.html"
    });
}

function openTab(url) {
    browser.tabs.create({
        url:url
    });
}

/** 
 * For use with browser.tabs.discard
 */
function onDiscarded() {
    console.log(`Discarded`);
}
function onError(error) {
    console.log(`Error: ${error}`);
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

function createOptionsMenu(session) {
    let options = document.createElement('div');
    let optionsContent = document.createElement('div');
    let openInCurrentLink = document.createElement('a');
    let replaceCurrentLink = document.createElement('a');

    openInCurrentLink.textContent = "Add to current window";
    openInCurrentLink.setAttribute('href', "#");
    openInCurrentLink.addEventListener("click", openSessionInCurrent.bind(null, session["urls"]));

    replaceCurrentLink.textContent = "Replace current window";
    replaceCurrentLink.setAttribute('href', "#");
    replaceCurrentLink.addEventListener("click", replaceCurrentWindow.bind(null, session)); 

    options.className = "options-menu";
    optionsContent.className = "options-content";
    optionsContent.appendChild(openInCurrentLink);
    optionsContent.appendChild(replaceCurrentLink);
    options.appendChild(optionsContent)

    return options;
}
  

function createInfoSection (sessionName, session) {
    var infoSection = document.createElement('div');
    infoSection.classList.add("info-section", "split-left");

    let nameField = document.createElement('h2');
    let dateField = document.createElement('small');
    let deleteButton = document.createElement('button');
    let openButton = document.createElement('button');
    let options = createOptionsMenu(session);

    nameField.className = "session-link";
    nameField.textContent = sessionName;

    dateField.className = "date-field";
    dateField.textContent = session["createDate"];

    openButton.className = "open-button mat-button";
    openButton.textContent = "Open";
    openButton.setAttribute('href', "#");
    openButton.addEventListener("click", openSession.bind(null, session));

    deleteButton.className = "delete-button mat-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute('href', "#");
    deleteButton.addEventListener("click", deleteSession.bind(null, sessionName));

    infoSection.appendChild(nameField);
    infoSection.appendChild(dateField);
    infoSection.appendChild(openButton);
    infoSection.appendChild(deleteButton);
    infoSection.appendChild(options);

    return infoSection;
}

function createListSection(sessionName, session) {
    var listSection = document.createElement('div');
    listSection.className = "list-section split-right";

    let linkList = document.createElement('div');
    linkList.className = 'link-list';

    let listButton = document.createElement('button');
    listButton.className = 'list-button mat-button';
    listButton.textContent = "Open list in new tab";
    listButton.setAttribute('href', "#");
    listButton.addEventListener("click", openListView.bind(null, sessionName, session));

    for (let tabInfo in session["urls"]) {
        let url = session["urls"][tabInfo]["url"];
        let title = session["urls"][tabInfo]["title"];
        let listElem = document.createElement('li');
        let urlField = document.createElement('span');
        let icon = document.createElement('img');

        listElem.className = 'link-elem';

        urlField.className = "link-title";
        urlField.textContent = title;
        urlField.addEventListener("click", openTab.bind(null, url));

        if (session["urls"][tabInfo].icon) {
            let iconUrl = session["urls"][tabInfo]["icon"];
            listElem.style.listStyleType = 'none';

            urlField.style.left = '-4px';
            urlField.style.top = '-3px';

            icon.className = "link-icon";
            icon.src = iconUrl;
            icon.alt = ".";
            listElem.appendChild(icon);
        }

        listElem.appendChild(urlField);
        linkList.appendChild(listElem);
    }
    
    listSection.appendChild(linkList);
    listSection.appendChild(listButton);

    return listSection;
}

/** 
 * creates session card given session name and associated urls
 */
function createSessionCard(sessionName, session) {
    var newCard = document.createElement('div');

    let infoSection = createInfoSection(sessionName, session);
    let listSection = createListSection(sessionName, session);

    newCard.className = "card";
    newCard.appendChild(infoSection);
    newCard.appendChild(listSection);

    console.log(newCard.innerHTML);

    return newCard;
}

/** 
 * adds new session card to existing popup
 */
function addSessionToPopup(sessionName, session) {
    console.log("in addToPopup, session: "+session);

    let sessionsList = document.getElementById('sessions-list');
    let newCard = createSessionCard(sessionName, session);

    sessionsList.appendChild(newCard);
}

/** 
 * retrieve past sessions and add cards to popup
 */
function populateSessions() {
    getSavedSessions().then((sessions) => {
        console.log("populateSessions: ", sessions);
        let sessionsList = document.getElementById('sessions-list');
        let savedSessions = document.createDocumentFragment();

        sessionsList.textContent = '';

        let sessionNames = Object.getOwnPropertyNames(sessions);

        for (let sessionName of sessionNames) {
        let newCard = createSessionCard(sessionName, sessions[sessionName]);
        
        savedSessions.appendChild(newCard);
        }

        sessionsList.appendChild(savedSessions);
    });
}

function deleteSession(sessionName) {
    deleteSessionFromStorage(sessionName);
    populateSessions();
}

function openSession(session) {
    let rawURLs = [];
    var createData;

    for (var tab in session["urls"]) {
        rawURLs.push(session["urls"][tab]["url"]);
    }

    if (shouldRestore) {
        createData = session["windowSettings"];
        createData["url"] = rawURLs;
        // bizzare error where any width >= 1270 loads as previous valid width
        createData["width"] = (createData["width"] >= 1270 ? 1269 : createData["width"]);
    } else {
        createData = {
            url: rawURLs
        };
    }

    var sending = browser.runtime.sendMessage({
        openSession: {
            createData: createData,
            shouldLoad: shouldLoad
        }
    });
    sending.then(handleResponse, handleError);
}

function openSessionInCurrent(urls) {
    let rawURLs = [];
    for (var tab in urls) {
        rawURLs.push(urls[tab]["url"]);
    }
    for (var url of rawURLs) {
        let createData = {
        url: url
        };

        browser.tabs.create(createData).then((tab) => {
            if (!shouldLoad) {
                browser.tabs.discard(tab.id).then(onDiscarded, onError);
            }
        });        
    }
}

function replaceCurrentWindow(urls) {
    browser.windows.getCurrent().then((window) => {
        browser.windows.remove(window.id);
        openSession(urls);
    });
}

function getCurrentWindowTabs() {
    return browser.tabs.query({currentWindow: true});
}

const settingsButton = document.getElementById("settings-button");
settingsButton.addEventListener("click", openSettings, false);

document.addEventListener("DOMContentLoaded", populateSessions);
document.addEventListener("click", async (e) => {

    function getCurrentURLs() {
        return getCurrentWindowTabs().then((tabs) => {
        var urls = [];
        for (var tab of tabs) {
            if (!(tab.url.includes("about:", 0))) {
            urls.push({url:tab.url, title:tab.title, icon:tab.favIconUrl});
            }
        }
        return urls;
        });
    }


    if (e.target.id == "save-button") {
        let sessionName = document.getElementById('name-input').value;
        console.log(sessionName);
        if (sessionName === "") {
        console.log("empty name, not saving");
        }
        else {
        document.getElementById('name-input').value = '';
        getCurrentURLs().then((sessionURLs) => {
            browser.windows.getCurrent().then((currWindow) => {
                addSessionToStorage(sessionURLs, sessionName, currWindow).then((session) => {
                    addSessionToPopup(sessionName, session)
                });
            });
        });
        }
    }

    e.preventDefault();
});