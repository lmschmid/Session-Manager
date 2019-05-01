import { getActiveListView } from "../logic/sessionStorage.js"; 

function openLink(url) {
    browser.tabs.create({url:url});
}

function filterSessions(filterString) {
    console.log("in filterSessions");
    let listElems = document.getElementById('list-elems');
    listElems.textContent = "";
    console.log("filterString: "+filterString);

    getActiveListView().then((session) => {
        for (var tab of session.urls) {
            let title = tab.title;
            if (title.toUpperCase().includes(filterString.toUpperCase())) {
                console.log("title: "+title);

                let tabLink = constructSessionLink(tab.title, tab.url);
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

// add favIconUrl to bullets
function listSessions() {
    let listElems = document.getElementById('list-elems');
    getActiveListView().then((session) => {
        document.title = session.sessionName;

        console.log("listSessions");
        console.log(session);
        for (var tab of session.urls) {
            let tabLink = constructSessionLink(tab.title, tab.url)
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