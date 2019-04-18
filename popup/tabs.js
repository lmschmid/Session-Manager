import {addSessionToStorage, getSavedSessions, clearSessions,
        setActiveListView, deleteSessionFromStorage, shouldTabsLoad}
        from "../logic/sessionStorage.js"; 

// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;

var shouldLoad;
shouldTabsLoad().then((val) => {shouldLoad = val;});

/** 
 * opens html page in browser of session
 */
function openListView(sessionName, sessionURLs) {
    browser.tabs.create({
        url:"/listview/listview.html"
    });

    setActiveListView(sessionURLs);
}

function onDiscarded() {
    console.log(`Discarded`);
}
function onError(error) {
    console.log(`Error: ${error}`);
}

/** 
 * creates session card given session name and associated urls
 */
function createSessionCard(sessionName, session) {
    var newCard = document.createElement('div');
    let sessionLink = document.createElement('a');
    let options = document.createElement('div');
    let optionsContent = document.createElement('div');
    let openInCurrentLink = document.createElement('a');
    let openInNewLink = document.createElement('a');
    let replaceCurrentLink = document.createElement('a');
    let listButton = document.createElement('input');
    let optionButton = document.createElement('button');
    let deleteButton = document.createElement('button');

    listButton.className = 'list-button';
    listButton.type = "image";
    listButton.src = "/icons/list-20.png";
    listButton.addEventListener("click", openListView.bind(null, sessionName, session["urls"]));

    deleteButton.className = 'delete-button';
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", deleteSession.bind(null, sessionName));

    sessionLink.className = "session-link";
    sessionLink.textContent = sessionName;
    sessionLink.setAttribute('href', "#");
    sessionLink.addEventListener("click", openSession.bind(null, session["urls"]));

    openInCurrentLink.textContent = "Add to current window";
    openInCurrentLink.setAttribute('href', "#");
    openInCurrentLink.addEventListener("click", openSessionInCurrent.bind(null, session["urls"]));

    openInNewLink.textContent = "Open in new window";
    openInNewLink.setAttribute('href', "#");
    openInNewLink.addEventListener("click", openSession.bind(null, session["urls"])); 

    replaceCurrentLink.textContent = "Replace current window";
    replaceCurrentLink.setAttribute('href', "#");
    replaceCurrentLink.addEventListener("click", replaceCurrentWindow.bind(null, session["urls"])); 

    options.className = "options-menu";
    optionsContent.className = "options-content";
    optionButton.className = "options-button";
    optionButton.textContent = "options";
    optionsContent.appendChild(openInCurrentLink);
    optionsContent.appendChild(openInNewLink);
    optionsContent.appendChild(replaceCurrentLink);
    options.appendChild(optionButton);
    options.appendChild(optionsContent);

    newCard.className = "card";
    newCard.appendChild(sessionLink);
    newCard.appendChild(options);
    newCard.appendChild(deleteButton);
    newCard.insertAdjacentElement('beforeend', listButton);

    return newCard;
}

/** 
 * adds new session card to existing popup
 */
function addSessionToPopup(sessionName, session) {
    console.log("in addToPopup, session: "+session);

    let sessionsList = document.getElementById('sessions-list');
    let newSession = document.createDocumentFragment();
    
    let newCard = createSessionCard(sessionName, session);

    newSession.appendChild(newCard);
    sessionsList.appendChild(newSession);
}

/** 
 * retrieve past sessions and add cards to popup
 */
function populateSessions() {
    console.log("in open sessions");
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

function openSession(urls) {
    let rawURLs = [];
    for (var tab in urls) {
        console.log(urls[tab]["url"]);
        rawURLs.push(urls[tab]["url"]);
    }
    let createData = {
        url: rawURLs
    };
    let creating = browser.windows.create(createData).then((window) => {
        discardTabs(window)
    });
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
            browser.tabs.discard(tab.id).then(onDiscarded, onError);
        });
    }
}

function replaceCurrentWindow(urls) {
    browser.windows.getCurrent().then((window) => {
        console.log(typeof window,window);
        browser.windows.remove(window.id);
        openSession(urls);
    });
}

function getCurrentWindowTabs() {
    return browser.tabs.query({currentWindow: true});
}

function discardTabs(window) {
    if (!shouldLoad) {
        for (var tab of window.tabs) {
            browser.tabs.discard(tab.id).then(onDiscarded, onError);
        }
    }
}

document.addEventListener("DOMContentLoaded", populateSessions);
document.addEventListener("click", async (e) => {

    function getCurrentURLs() {
        return getCurrentWindowTabs().then((tabs) => {
        var urls = [];
        for (var tab of tabs) {
            if (!(tab.url.includes("about:", 0))) {
            urls.push({url:tab.url, title:tab.title});
            }
        }
        return urls;
        });
    }

    if (e.target.id === "clear-sessions") {
        console.log("clearing sessions");
        let sessionsList = document.getElementById('sessions-list');
        clearSessions();
    }

    else if (e.target.id == "save-button") {
        let sessionName = document.getElementById('name-input').value;
        console.log(sessionName);
        if (sessionName === "") {
        console.log("empty name, not saving");
        }
        else {
        document.getElementById('name-input').value = '';
        getCurrentURLs().then((sessionURLs) => {
            addSessionToStorage(sessionURLs, sessionName).then((session) => {
                addSessionToPopup(sessionName, session)
            });
        });
        }
    }

    e.preventDefault();
});