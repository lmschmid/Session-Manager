export { setSetting, getSetting, fetchSettings };

var setSetting = function(setting, state, callback) {
    var db = this.datastore;
    var transaction = db.transaction(['settings'], 'readwrite');
    var objStore = transaction.objectStore('settings');

    // Create an object for the todo item.
    var setting = {
        setting: setting,
        state: state
    };

    // Create the datastore request.
    var request = objStore.put(setting);

    // Handle a successful datastore put.
    request.onsuccess = function(e) {
        console.log("Added setting "+setting.setting);
        callback();
    };

    // Handle errors.
    request.onerror = this.onerror;
};

var getSetting = function(setting, callback) {
    var db = this.datastore;
    var transaction = db.transaction(['settings'], 'readonly');
    var objStore = transaction.objectStore('settings');

    // Create the datastore request.
    var request = objStore.get(setting);

    // Handle a successful datastore put.
    request.onsuccess = function(e) {
        callback(request.result);
    };

    // Handle errors.
    request.onerror = this.onerror;
};

/**
 * Fetch all of the settings in the datastore.
 */
var fetchSettings = function(callback) {
    var db = this.datastore;
    var transaction = db.transaction(['settings'], 'readonly');
    var objStore = transaction.objectStore('settings');

    var keyRange = IDBKeyRange.lowerBound(0);
    // Iterates through an object store by primary key
    var cursorRequest = objStore.openCursor(keyRange);

    var settings = [];

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
    
        if (!!result == false) {
            return;
        }
    
        settings.push(result.value);
    
        result.continue();
    };

    transaction.oncomplete = function(e) {
        callback(settings);
    };

    cursorRequest.onerror = this.onerror;
};