import { extDB } from "../storage/extDB.js"; 

function openLink(url) {
    browser.tabs.create({url:url});
}

function filterSessions(filterString) {
    let listElems = document.getElementById('list-elems');
    listElems.textContent = "";

    extDB.getActiveListView(function (session) {
        for (var tab of session.tabs) {
            let title = tab.title;
            if (title.toUpperCase().includes(filterString.toUpperCase())) {

                let tabLink = constructSessionLink(tab);
                listElems.appendChild(tabLink);
            }
        }
    });
}

function constructSessionLink(tab) {
    let tabLink = document.createElement('li');
    let urlField = document.createElement('span');
    let icon = document.createElement('img');
    let deleteWrapper = document.createElement('div');
    let deleteButton = document.createElement('button');

    tabLink.className = 'link-elem';

    urlField.className = "link-title";
    urlField.textContent = tab.title;
    urlField.addEventListener("click", openLink.bind(null, tab.url));

    if (tab.icon) {
        let iconUrl = tab.icon;
        tabLink.style.listStyleType = 'none';

        urlField.style.left = '-4px';

        icon.className = "link-icon";
        icon.src = iconUrl;
        tabLink.appendChild(icon);
    }

    tabLink.appendChild(urlField);

    return tabLink;
}

function listSessions() {
    let listElems = document.getElementById('list-elems');

    extDB.open(function () {
        extDB.getActiveListView(function (session) {
            document.title = session.sessionName;

            for (var tab of session.tabs) {
                let tabLink = constructSessionLink(tab)
                listElems.appendChild(tabLink);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", listSessions);
let searchInput = document.getElementById('search-input');
searchInput.addEventListener("input", async (e) => {
    let filterString = searchInput.value;
    filterSessions(filterString);
});