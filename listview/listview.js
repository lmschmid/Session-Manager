import {getActiveListView} from "../logic/sessionStorage.js"; 

function openLink(url) {
    browser.tabs.create({url:url});
}

function filterSessions(filterString) {
    console.log("in filterSessions");
    let listElems = document.getElementById('list-elems');
    listElems.textContent = "";
    console.log("filterString: "+filterString);

    getActiveListView().then((urls) => {
        for (var url in urls) {
            let title = urls[url]["title"];
            if (title.toUpperCase().includes(filterString.toUpperCase())) {
                console.log("title: "+title);

                let tabLink = constructSessionLink(urls[url]["title"], urls[url]["url"]);
                listElems.appendChild(tabLink);
            }
        }
    });
}

function constructSessionLink(title, url) {
    let tabLink = document.createElement('li');
    tabLink.className = 'session-link';
    tabLink.textContent = title;

    let tabA = document.createElement('a');
    tabA.className = 'session-a';
    tabA.setAttribute('href', "#");
    tabA.addEventListener("click", openLink.bind(null, url));

    tabLink.appendChild(tabA);

    return tabLink;
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

            let tabLink = constructSessionLink(urls[url]["title"], urls[url]["url"])
            listElems.appendChild(tabLink);
        }
    });
}

document.addEventListener("DOMContentLoaded", listSessions);
let searchInput = document.getElementById('search-input');
searchInput.addEventListener("change", async (e) => {
    let filterString = searchInput.value;
    filterSessions(filterString);
});