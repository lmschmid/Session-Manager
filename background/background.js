var gettingStoredStatsLocal = browser.storage.local.get();

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
    console.log(request);
    if (request.openSession) {
        let creating = browser.windows.create(request.openSession.createData)
        .then((window) => {
            discardTabs(window, request.openSession.shouldLoad);
        });
    }
}

browser.runtime.onMessage.addListener(handleMessage);