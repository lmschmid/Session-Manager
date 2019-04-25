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