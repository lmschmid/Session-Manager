import {addSessionToStorage, getSavedSessions, clearSessions} from "../logic/sessionStorage.js"; 

// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;

function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

/** 
 * opens html page in browser of session
 */
function openListView(sessionName, sessionURLs) {
  browser.tabs.create({
    url:"/listview/listview.html"
  });
  
  var sending = browser.runtime.sendMessage({
    greeting: "Greeting from the content script"
  });
  sending.then(handleResponse, handleError);  
}

/** 
 * creates session card given session name and associated urls
 */
function createSessionCard(sessionName, sessionURLs) {
  var newCard = document.createElement('div');
  let sessionLink = document.createElement('a');
  let options = document.createElement('div');
  let optionsContent = document.createElement('div');
  let openInCurrentLink = document.createElement('a');
  let listButton = document.createElement('input');
  let optionButton = document.createElement('button');

  listButton.className = 'list-button';
  listButton.type = "image";
  listButton.src = "/icons/list-20.png";
  listButton.addEventListener("click", openListView.bind(null, sessionName, sessionURLs));

  sessionLink.className = "session-link";
  sessionLink.textContent = sessionName;
  sessionLink.setAttribute('href', "#");
  sessionLink.addEventListener("click", openSession.bind(null, sessionURLs));

  openInCurrentLink.textContent = "Add to current window";
  openInCurrentLink.setAttribute('href', "#");
  openInCurrentLink.addEventListener("click", openSessionInCurrent.bind(null, sessionURLs));

  options.className = "options-menu";
  optionsContent.className = "options-content";
  optionButton.className = "options-button";
  optionButton.textContent = "options";
  optionsContent.appendChild(openInCurrentLink);
  options.appendChild(optionButton);
  options.appendChild(optionsContent);

  newCard.className = "card";
  newCard.appendChild(sessionLink);
  newCard.appendChild(options);
  // newCard.appendChild(openInCurrentLink);
  newCard.insertAdjacentElement('beforeend', listButton);
  console.log("newCard html: "+newCard.innerHTML);  

  return newCard;
}

/** 
 * adds new session card to existing popup
 */
function addSessionToPopup(sessionName, sessionURLs) {
    console.log("in addToPopup, urls: "+sessionURLs);

    let sessionsList = document.getElementById('sessions-list');
    let newSession = document.createDocumentFragment();
    
    let newCard = createSessionCard(sessionName, sessionURLs);

    newSession.appendChild(newCard);
    sessionsList.appendChild(newSession);
}

/** 
 * retrieve past sessions and add cards to popup
 */
function openSessions() {
  console.log("in open sessions");
  getSavedSessions().then((sessions) => {
    console.log("Opensessions: ", sessions);
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

function openSession(urls) {
  let createData = {
    url: urls
  };
  let creating = browser.windows.create(createData);
}

function openSessionInCurrent(urls) {
  for (var url of urls) {
    let createData = {
      url: url
    };
    browser.tabs.create(createData);
  }
}

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

document.addEventListener("DOMContentLoaded", openSessions);
document.addEventListener("click", async (e) => {

  function getCurrentURLs() {
    return getCurrentWindowTabs().then((tabs) => {
      var urls = [];
      for (var tab of tabs) {
        if (!(tab.url.includes("about:", 0))) {
          urls.push(tab.url);
        }
      }
      return urls;
    });
  }

  if (e.target.id === "clear-sessions") {
    console.log("clearing sessions");
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
        addSessionToStorage(sessionURLs, sessionName).then((sessionURLs) => {
          addSessionToPopup(sessionName, sessionURLs)
        });
      });
    }
  }

  e.preventDefault();
});