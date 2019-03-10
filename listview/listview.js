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
        console.log("link: "+urls[url]["url"]);
        let tabLink = document.createElement('li');
        tabLink.textContent = urls[url]["title"];
        tabLink.setAttribute('href', "#");
        tabLink.addEventListener("click", openLink.bind(null, urls[url]["url"]));
        listElems.appendChild(tabLink);
      }
    });
}

document.addEventListener("DOMContentLoaded", listSessions);