import { extDB } from "../storage/extDB.js";


// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;

// Macros for sorting mode
const ALPHA_INC = 0;
const ALPHA_DEC = 1;
const TIME_INC = 2;
const TIME_DEC = 3;

// Store settings so dont have to load from mem every time
var shouldLoad, shouldRestore, sortMode;


/** 
 * opens html page in browser of list of tabs in session
 */
function openListView(sessionName, session) {
    var openListTab = function () {browser.tabs.create({
            url:"/listview/listview.html"
        });
    }
    extDB.setActiveListView(sessionName, session.tabs, openListTab);
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

function logResult(r) {
    console.log(r);
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

function createOptionsMenu(sessionName, session) {
    let options = document.createElement('div');
    let optionsContent = document.createElement('div');
    let openInCurrentLink = document.createElement('a');
    let replaceCurrentLink = document.createElement('a');
    let replaceWithCurrentLink = document.createElement('a');
    let addCurrentLink = document.createElement('a');

    openInCurrentLink.textContent = "Add to current window";
    openInCurrentLink.setAttribute('href', "#");
    openInCurrentLink.addEventListener("click", openSessionInCurrent.bind(null, session.tabs));

    replaceCurrentLink.textContent = "Close current window, open new";
    replaceCurrentLink.setAttribute('href', "#");
    replaceCurrentLink.addEventListener("click", replaceCurrentWindow.bind(null, session)); 

    replaceWithCurrentLink.textContent = "Replace session with current window";
    replaceWithCurrentLink.setAttribute('href', "#");
    replaceWithCurrentLink.addEventListener("click", replaceSession.bind(null, sessionName));

    addCurrentLink.textContent = "Add current window to session";
    addCurrentLink.setAttribute('href', "#");
    addCurrentLink.addEventListener("click", addWindowToSession.bind(null, sessionName));

    options.className = "options-menu";
    optionsContent.className = "options-content";
    optionsContent.appendChild(openInCurrentLink);
    optionsContent.appendChild(replaceCurrentLink);
    optionsContent.appendChild(replaceWithCurrentLink);
    optionsContent.appendChild(addCurrentLink);
    options.appendChild(optionsContent)

    return options;
}
  

function createInfoSection (sessionName, session) {
    var infoSection = document.createElement('div');
    infoSection.classList.add("info-section", "split-left");

    let nameContainer = document.createElement('div');
    let nameField = document.createElement('h2');
    let dateContainer = document.createElement('div');
    let dateField = document.createElement('small');
    let deleteButton = document.createElement('button');
    let openButton = document.createElement('button');
    let options = createOptionsMenu(sessionName, session);

    nameContainer.className = "name-container";
    nameField.className = "session-link";
    nameField.textContent = sessionName;
    nameContainer.appendChild(nameField);

    // Add listener for each card to open the detail view
    nameField.addEventListener('click', function() {
        showCardDetail(sessionName, session);
    });

    dateContainer.className = "date-container";
    dateField.className = "date-field";
    dateField.textContent = session["createDate"];
    dateContainer.appendChild(dateField);

    nameContainer.appendChild(dateContainer);

    openButton.className = "open-button mat-button";
    openButton.textContent = "Open";
    openButton.setAttribute('href', "#");
    openButton.addEventListener("click", openSession.bind(null, session));

    deleteButton.className = "delete-button mat-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute('href', "#");
    deleteButton.addEventListener("click", deleteSession.bind(null, sessionName));

    infoSection.appendChild(nameContainer);
    infoSection.appendChild(options);
    infoSection.appendChild(openButton);
    infoSection.appendChild(deleteButton);

    return infoSection;
}

function createListSection(sessionName, session) {
    var listSection = document.createElement('div');
    listSection.className = "list-section split-right";

    let linkList = document.createElement('div');
    linkList.className = 'link-list';

    for (let tabIndex in session.tabs) {
        let tab = session.tabs[tabIndex];
        let url = tab.url;
        let title = tab.title;
        let listElem = document.createElement('li');
        let urlField = document.createElement('span');
        let icon = document.createElement('img');
        let deleteWrapper = document.createElement('div');
        let deleteButton = document.createElement('button');

        listElem.className = 'link-elem';

        urlField.className = "link-title";
        urlField.textContent = title;
        urlField.addEventListener("click", openTab.bind(null, url));

        if (tab.icon) {
            let iconUrl = tab.icon;
            listElem.style.listStyleType = 'none';

            urlField.style.left = '-4px';

            icon.className = "link-icon";
            icon.src = iconUrl;
            listElem.appendChild(icon);
        } else {
            listElem.style.left = '26px';
            urlField.style.left = '5px';
            urlField.style.top = '2px';
        }

        deleteWrapper.className = "delete-tab-wrapper";

        deleteButton.className = "delete-tab-button mat-button";
        deleteButton.textContent = "-";
        deleteButton.addEventListener("click", deleteTab.bind(null, sessionName, tabIndex));

        deleteWrapper.appendChild(deleteButton);
        
        listElem.appendChild(urlField);
        listElem.appendChild(deleteWrapper);
        linkList.appendChild(listElem);
    }

    let bottomDiv = document.createElement('div');

    let listButton = document.createElement('button');
    listButton.className = 'list-button mat-button';
    listButton.textContent = "Open list in new tab";
    listButton.setAttribute('href', "#");
    listButton.addEventListener("click", openListView.bind(null, sessionName, session));

    let addTabButton = document.createElement('button');
    addTabButton.className = "add-tab-button mat-button";
    addTabButton.textContent = "+";

    bottomDiv.appendChild(listButton);
    bottomDiv.appendChild(addTabButton);
    addTabButton.addEventListener("click", addTab.bind(null, sessionName));
    
    listSection.appendChild(linkList);
    listSection.appendChild(bottomDiv);

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
    extDB.fetchSessions(function(sessions) {
        console.log("populateSessions: ", sessions);
        sessions.sort(compareSessions.bind(null, sortMode));
        let sessionsList = document.getElementById('sessions-list');
        let savedSessions = document.createDocumentFragment();

        sessionsList.textContent = '';

        let sessionNames = Object.getOwnPropertyNames(sessions);

        for (var session of sessions) {
            let newCard = createSessionCard(session.title, session.data);
        
            savedSessions.appendChild(newCard);
        }

        sessionsList.appendChild(savedSessions);
    });
}

// Need to fix time comparisons
function compareSessions(sortMode, leftSess, rightSess) {
    function compareDates(leftDate, rightDate) {
        var leftParts = leftDate.split(" ");
        var rightParts = rightDate.split(" ");

        var leftDay = leftParts[0].split("/");
        var rightDay = rightParts[0].split("/");

        // First check year, month, day
        if (parseInt(leftDay[2]) > parseInt(rightDay[2])) {
            return 1;
        } else if (parseInt(leftDay[2]) < parseInt(rightDay[2])) {
            return -1;
        } else if (parseInt(leftDay[0]) > parseInt(rightDay[0])) {
            return 1;
        } else if (parseInt(leftDay[0]) < parseInt(rightDay[0])) {
            return -1;
        } else if (parseInt(leftDay[1]) > parseInt(rightDay[1])) {
            return 1;
        } else if (parseInt(leftDay[1]) < parseInt(rightDay[1])) {
            return -1;
        }

        // then check AM vs PM
        if (leftParts[2] === "AM" && rightParts[2] === "PM") {
            return -1;
        } else if (leftParts[2] === "PM" && rightParts[2] === "AM") {
            return 1;
        }

        var leftTime = leftParts[1].split(":");
        var rightTime = rightParts[1].split(":");

        // then check time of day
        for (var timeIndex in leftTime) {
            if (parseInt(leftTime[timeIndex]) > parseInt(rightTime[timeIndex])) {
                return 1;
            } else if (parseInt(leftTime[timeIndex]) < parseInt(rightTime[timeIndex])) {
                return -1;
            }
        }
        
        return 0;
    }


    if (sortMode === ALPHA_INC) {
        return leftSess.title.toLowerCase().localeCompare(
               rightSess.title.toLowerCase());
    } else if (sortMode === ALPHA_DEC) {
        return rightSess.title.toLowerCase().localeCompare(
               leftSess.title.toLowerCase());
    } else if (sortMode === TIME_INC) {
        return compareDates(leftSess.data.createDate, rightSess.data.createDate);
    } else if (sortMode === TIME_DEC) {
        return compareDates(rightSess.data.createDate, leftSess.data.createDate);
    }
}

function replaceSession(sessionName) {
    getCurrentSession().then((sessionData) => {
        extDB.createSession(sessionName, sessionData, populateSessions);
    });
}

function addWindowToSession(sessionName) {
    getCurrentSession().then((sessionData) => {
        var tabData = sessionData.tabs;
        extDB.addTabToSession(sessionName, tabData, populateSessions);
    });
}

function addTab(sessionName) {
    getCurrentWindowTabs().then((tabs) => {
        for (var tab of tabs) {
            if (!(tab.url.includes("about:", 0)) && tab.active) {
                let tabData = [{url:tab.url, title:tab.title, icon:tab.favIconUrl}];
                extDB.addTabToSession(sessionName, tabData, populateSessions);
                break;
            }
        }
    });
}

function deleteTab(sessionName, tab) {
    extDB.deleteTabFromSession(sessionName, tab, populateSessions);
}

function deleteSession(sessionName) {
    extDB.deleteSession(sessionName, populateSessions);
}

function openSession(session) {
    let rawURLs = [];
    var createData;


    for (var tab of session.tabs) {
        rawURLs.push(tab.url);
    }

    if (shouldRestore) {
        createData = session["windowSettings"];
        createData["url"] = rawURLs;
        // bizzare error where any width >= 1270 loads as previous valid width
        // createData["width"] = (createData["width"] >= 1270 ? 1269 : createData["width"]);
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

function openSessionInCurrent(tabs) {
    let rawURLs = [];
    for (var tab of tabs) {
        rawURLs.push(tab.url);
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

function replaceCurrentWindow(session) {
    browser.windows.getCurrent().then((window) => {
        openSession(session);
        browser.windows.remove(window.id);
    });
}

function getCurrentWindowTabs() {
    return browser.tabs.query({currentWindow: true});
}
function getCurrentTabs() {
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

function filterSessionDetail(filterString) {
    let cardDetail = document.getElementById('card-details');
    let tabs = cardDetail.childNodes;

    for (var tab of tabs) {
        if (!tab.innerText.toLowerCase().includes(
            filterString.toLowerCase())) {
            tab.style.display = 'none';
        } else {
            tab.style.display = 'block';
        }
    }
}

function filterSessions(filterString) {
    console.log("Filtering by: "+filterString);
    let sessionsList = document.getElementById('sessions-list');
    let sessionCards = sessionsList.childNodes;
    
    for (var sessionCard of sessionCards) {
        if (!sessionCard.innerText.toLowerCase().includes(
            filterString.toLowerCase())) {
            sessionCard.style.display = 'none';
        } else {
            sessionCard.style.display = 'block';
        }
    }
}

function getCurrentSession() {
    return getCurrentTabs().then((sessionTabs) => {
        return browser.windows.getCurrent().then((currWindow) => {
            var windowSettings = {
                height: currWindow.height,
                incognito: currWindow.incognito,
                left: currWindow.left,
                width: currWindow.width
            };
            var sessionData = { tabs: sessionTabs,
                                createDate: new Date().toLocaleString("en-US"),
                                windowSettings: windowSettings };

            return sessionData;
        });
    });
}

let searchBar = document.getElementById('search-bar');
searchBar.addEventListener('input', async (e) => {
    const sessionsList = document.getElementById('sessions-list');
    
    let filterString = searchBar.value;
    if (sessionsList.getAttribute('pageStyle') === 'detail') {
        console.log(document.getElementById('card-details').style.display)
        filterSessionDetail(filterString);
    } else {
        filterSessions(filterString);
    }
});

function openDatabaseAndPopulate() {
    const sessionsList = document.getElementById('sessions-list');
    sessionsList.setAttribute('pageStyle', 'list');

    extDB.open(function () {
        extDB.getSetting('sortMode', function (sortSetting) {
            sortMode = sortSetting.state;
            populateSessions();
        });
        extDB.getSetting('shouldLoad', function (loadSetting) {
            shouldLoad = loadSetting.state;
        });
        extDB.getSetting('shouldRestore', function (restoreSetting) {
            shouldRestore = restoreSetting.state;
        });
    });
}

function constructTabLink(tab) {
    let tabLink = document.createElement('li');
    let urlField = document.createElement('span');
    let icon = document.createElement('img');
    let deleteWrapper = document.createElement('div');
    let deleteButton = document.createElement('button');

    tabLink.className = 'detail-link-elem';

    urlField.className = "detail-link-title";
    urlField.textContent = tab.title;
    urlField.addEventListener("click", openTab.bind(null, tab.url));

    if (tab.icon) {
        let iconUrl = tab.icon;
        tabLink.style.listStyleType = 'none';

        urlField.style.left = '-4px';

        icon.className = "detail-link-icon";
        icon.src = iconUrl;
        tabLink.appendChild(icon);
    }

    tabLink.appendChild(urlField);

    return tabLink;
}

function showCardDetail(sessionName, session) {
    const saveSection = document.getElementById('save-session');
    const sessionsList = document.getElementById('sessions-list');
    const sortButton = document.getElementById('sort-button');
    const popupHeader = document.getElementById('popup-header');
    var cardDetail;

    sessionsList.setAttribute('pageStyle', 'detail')

    // Create cardDetail html elements, or delete children
    if (document.getElementById('card-details')) {
        cardDetail = document.getElementById('card-details');
        cardDetail.replaceChildren();
    } else {
        cardDetail = document.createElement('div');
        cardDetail.className = 'card-details';
        cardDetail.id = 'card-details';    
    }
    cardDetail.setAttribute('scroll-value', sessionsList.scrollTop);

    // TODO add sessionName title div
    for (var tab of session.tabs) {
        let tabLink = constructTabLink(tab);
        cardDetail.appendChild(tabLink);
    }
    sessionsList.appendChild(cardDetail);


    // Hide the list of cards
    saveSection.style.display = 'none';
    document.querySelectorAll('.card').forEach(card => {
        card.style.display = 'none';
    })

    // Enable the display of the cardDetail created earlier
    cardDetail.style.display = 'block';
    // Reverse the icon to make it look like "back button"
    sortButton.classList.toggle('rotate-back');
    popupHeader.innerHTML = sessionName;
    sessionsList.scrollTop = 0;
}

function hideCardDetail() {
    const sessionsList = document.getElementById('sessions-list');
    const saveSection = document.getElementById('save-session');
    const sortButton = document.getElementById('sort-button');
    const popupHeader = document.getElementById('popup-header');

    const cardDetail = document.getElementById('card-details');

    sessionsList.setAttribute('pageStyle', 'list');

    cardDetail.style.display = 'none';

    document.querySelectorAll('.card').forEach(card => {
        card.style.display = 'block';
    })
    sessionsList.style.display = 'block';
    saveSection.style.display = 'inline-block';
    sortButton.classList.toggle('rotate-back');
    popupHeader.innerHTML = "ProTabs";
    sessionsList.scrollTo(0, cardDetail.getAttribute('scroll-value'));
}


document.addEventListener("DOMContentLoaded", function() {
    openDatabaseAndPopulate();
});

document.addEventListener('keyup', function (event) {
    if (event.defaultPrevented) {
        return;
    }

    var key = event.key || event.keyCode; // Graceful degradation

    if (key == 'Enter') {
        let nameInput = document.getElementById('name-input');
        let sessionName = nameInput.value;
        if (document.activeElement != nameInput || sessionName === "") {
            console.log("Input not focused or empty name, not saving");
        }
        else {
            document.getElementById('name-input').value = '';
                getCurrentSession().then((sessionData) => {
                    console.log("Saving session "+sessionName);
                    console.log(sessionData);
                    extDB.createSession(sessionName, sessionData, populateSessions);
                });
        }
    }

});

document.addEventListener("click", async (e) => {
    if (e.target.id === "save-button") {
        let sessionName = document.getElementById('name-input').value;
        if (sessionName === "") {
            console.log("empty name, not saving");
        }
        else {
            document.getElementById('name-input').value = '';
                getCurrentSession().then((sessionData) => {
                    console.log("Saving session "+sessionName);
                    console.log(sessionData);
                    extDB.createSession(sessionName, sessionData, populateSessions);
                });
        }
    } 
    else if (e.target.id === 'search-button') {
        console.log(`Clicked on search bar ${e.target.id}`);

        const searchBar = document.getElementById('search-bar');
        if (searchBar.style.width === '210px') {
            searchBar.style.width = '0px';
            setTimeout(function() {searchBar.style.backgroundColor = 'rgb(202, 202, 202)';searchBar.style.display = 'none';}, 390);
        } else {
            searchBar.style.display = 'block';
            searchBar.style.width = '210px';
            searchBar.style.backgroundColor = 'rgb(235, 235, 235)';
            searchBar.focus();
            searchBar.select();
        }
    } 
    else if (e.target.id === "settings-button") {
        openSettings();
    } 
    else if (e.target.id === "sort-button") {
        const sortButton = document.getElementById('sort-button');
        const sortSection = document.getElementById('sort-section');
        const sessionsList = document.getElementById('sessions-list');

        if (sessionsList.getAttribute('pageStyle') === 'detail') {
            hideCardDetail();
        } else {
            sortButton.classList.toggle('rotate-sort');
            sortSection.classList.toggle('show-sort-section');    
        }
    }
    else if (e.target.id == "time-recent") {
        extDB.setSetting('sortMode', TIME_DEC, function () {
            sortMode = TIME_DEC;
            populateSessions();
        });
    }
    else if (e.target.id == "time-old") {
        extDB.setSetting('sortMode', TIME_INC, function () {
            sortMode = TIME_INC;
            populateSessions();
        });
    }
    else if (e.target.id == "alpha-a") {
        extDB.setSetting('sortMode', ALPHA_INC, function () {
            sortMode = ALPHA_INC;
            populateSessions();
        });
    }
    else if (e.target.id == "alpha-z") {
        extDB.setSetting('sortMode', ALPHA_DEC, function () {
            sortMode = ALPHA_DEC;
            populateSessions();
        });
    }
    else {
        console.log(`Clicked on unsupported element ${e.target.id}`);
    }

    e.preventDefault();
});