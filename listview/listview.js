import {getActiveListView} from "../logic/sessionStorage.js"; 

function openLink(url) {
  browser.tabs.create({url:url});
}

// pass a title with the urls to display session name on web page
// add favIconUrl to bullets
function listSessions() {
    console.log("in listSessions");
    let listElems = document.getElementById('list-elems');
    getActiveListView().then((urls) => {
      console.log("listSessions urls: "+urls);
      for (var url in urls) {
        console.log("link: "+urls[url]["url"]);
        let tabLink = document.createElement('li');
        tabLink.className = 'session-link';
        tabLink.textContent = urls[url]["title"];

        let tabA = document.createElement('a');
        tabA.className = 'session-a';
        tabA.setAttribute('href', "#");
        tabA.addEventListener("click", openLink.bind(null, urls[url]["url"]));

        tabLink.appendChild(tabA);

        listElems.appendChild(tabLink);
      }
    });
}

document.addEventListener("DOMContentLoaded", listSessions);