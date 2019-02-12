import {addSessionToStorage, getSavedSessions, clearSessions} from "../logic/sessionStorage.js"; 

// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;


async function addSessionToPopup(sessionName, sessionURLs) {
    console.log("in addToPopup, urls: "+sessionURLs);

    let sessionsList = document.getElementById('sessions-list');
    let newSession = document.createDocumentFragment();
    var newCard = document.createElement('div');
    let sessionLink = document.createElement('a');

    sessionLink.textContent = sessionName;
    sessionLink.setAttribute('href', "#");
    sessionLink.addEventListener("click", openSession.bind(null, sessionURLs));

    sessionLink.classList.add('open-session');

    newCard.className = "card";
    newCard.innerHTML = 
      '<div class="container">\
       </div>';

    newCard.appendChild(sessionLink);
    newSession.appendChild(newCard);
    sessionsList.appendChild(newSession);
}

/** 
 * retrieve past session and add links to them
 */
async function openSessions() {
  console.log("in open sessions");
  getSavedSessions().then((sessions) => {
    let sessionsList = document.getElementById('sessions-list');
    let savedSessions = document.createDocumentFragment();

    sessionsList.textContent = '';

    let sessionNames = Object.getOwnPropertyNames(sessions);

    for (let sessionName of sessionNames) {
      var newCard = document.createElement('div');
      let sessionLink = document.createElement('a');

      sessionLink.textContent = sessionName;
      sessionLink.setAttribute('href', "#");
      sessionLink.addEventListener("click", openSession.bind(null, sessions[sessionName]));

      newCard.className = "card";
      newCard.innerHTML = 
        '<div class="container">\
          </div>';

      newCard.appendChild(sessionLink);
      
      sessionLink.classList.add('open-session');
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