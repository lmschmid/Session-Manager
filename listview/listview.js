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
    let urlField = document.createElement('span');
    let icon = document.createElement('img');
    let deleteWrapper = document.createElement('div');
    let deleteButton = document.createElement('button');

    tabLink.className = 'link-elem';

    urlField.className = "link-title";
    urlField.textContent = title;
    urlField.addEventListener("click", openLink.bind(null, url));

    if (url.icon) {
        let iconUrl = urll.icon;
        tabLink.style.listStyleType = 'none';

        urlField.style.left = '-4px';

        icon.className = "link-icon";
        icon.src = iconUrl;
        tabLink.appendChild(icon);
    }

    deleteWrapper.className = "delete-tab-wrapper";

    deleteButton.className = "delete-tab-button mat-button";
    deleteButton.textContent = "-";
    // deleteButton.addEventListener("click", deleteTab.bind(null, sessionName, tabInfo));

    deleteWrapper.appendChild(deleteButton);
    
    tabLink.appendChild(urlField);
    tabLink.appendChild(deleteWrapper);

    return tabLink;
}

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