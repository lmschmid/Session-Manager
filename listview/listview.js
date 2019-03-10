import {getActiveListView} from "../logic/sessionStorage.js"; 

function openLink(url) {
  browser.tabs.create({url:url});
}

function listSessions() {
    console.log("in listSessions");
    let listElems = document.getElementById('list-elems');
    getActiveListView().then((urls) => {
      console.log("listSessions urls: "+urls);
      for (var url in urls) {
        console.log("link: "+urls[url]);
        let tabLink = document.createElement('a');
        tabLink.textContent = urls[url];
        tabLink.setAttribute('href', "#");
        tabLink.addEventListener("click", openLink.bind(null, urls[url]));
        listElems.appendChild(tabLink);
      }
    });
}

document.addEventListener("DOMContentLoaded", listSessions);