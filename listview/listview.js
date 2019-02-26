function listSessions() {
    console.log("in listSessions");
    let listElems = document.getElementById('list-elems');

    let session = document.createElement('li');
    session.textContent = "Sessions";

    listElems.appendChild(session);
}

function handleMessage(request, sender, sendResponse) {
    console.log("Message from the content script: " +
      request.greeting);
    sendResponse({response: "Response from background script"});
  }

browser.runtime.onMessage.addListener(handleMessage);
document.addEventListener("DOMContentLoaded", listSessions);