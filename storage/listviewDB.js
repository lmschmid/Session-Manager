export { setActiveListView, getActiveListView };

var setActiveListView = function(sessionName, tabs, callback) {
    var db = this.datastore;
    var transaction = db.transaction(['listview'], 'readwrite');
    var objStore = transaction.objectStore('listview');

    // Create an object for the todo item.
    var session = {
        title: 'active',
        sessionName: sessionName,
        tabs: tabs
    };

    // Create the datastore request.
    var request = objStore.put(session);

    // Handle a successful datastore put.
    request.onsuccess = function(e) {
        console.log("Added listview "+sessionName);
        callback();
    };

    // Handle errors.
    request.onerror = this.onerror;
};

var getActiveListView = function(callback) {
    var db = this.datastore;
    var transaction = db.transaction(['listview'], 'readonly');
    var objStore = transaction.objectStore('listview');

    // Create the datastore request.
    var request = objStore.get('active');

    // Handle a successful datastore put.
    request.onsuccess = function(e) {
        callback(request.result);
    };

    // Handle errors.
    request.onerror = this.onerror;
};