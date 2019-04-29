function onDiscarded() {
    console.log(`Discarded`);
}
function onError(error) {
    console.log(`Error: ${error}`);
}

function discardTabs(window, shouldLoad) {
    console.log("in discard tabs");
    console.log(window);
    if (!shouldLoad) {
        for (var tab of window.tabs) {
            browser.tabs.discard(tab.id).then(onDiscarded, onError);
        }
    }
}


function handleMessage(request, sender, sendResponse) {
    if (request.openSession) {
        let creating = browser.windows.create(request.openSession.createData)
        .then((window) => {
            discardTabs(window, request.openSession.shouldLoad);
        });
    } else if (request.setResults) {
        browser.storage.local.set(request.setResults.results);
    }
}

browser.runtime.onMessage.addListener(handleMessage);