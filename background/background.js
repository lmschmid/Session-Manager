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
    console.log("discard from background: "+request.discard.toSource());
    // sendResponse({response: "Response from background script"});
    if (request.discard) {
        discardTabs(request.discard.window, request.discard.shouldLoad);
    }
}

browser.runtime.onMessage.addListener(handleMessage);