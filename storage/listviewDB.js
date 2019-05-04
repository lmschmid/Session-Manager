export { listviewDB };


var listviewDB = (function() {
    var eDB = {};
    var datastore = null;
  
    /**
     * Open a connection to the datastore.
     */
    eDB.open = function(callback) {
        console.log("opening listviewDB");
        // Database version.
        var version = 4;
    
        var request = indexedDB.open('ext', version);
    
        request.onupgradeneeded = function(e) {
            console.log("Upgrading");

            var db = e.target.result;
        
            e.target.transaction.onerror = eDB.onerror;
        
            // Delete old datastores when upgrading
            if (db.objectStoreNames.contains('sessions')) {
                db.deleteObjectStore('sessions');
            }
            if (db.objectStoreNames.contains('settings')) {
                db.deleteObjectStore('settings');
            }
            if (db.objectStoreNames.contains('listview')) {
                db.deleteObjectStore('listview');
            }
        
            // Create the datastores
            var sessionsStore = db.createObjectStore('sessions', {
                keyPath: 'title'
            });
            var settingsStore = db.createObjectStore('settings', {
                keyPath: 'setting'
            });
            var listviewStore = db.createObjectStore('listview', {
                keyPath: 'title'
            });
        };
    
        request.onsuccess = function(e) {
            // Get a reference to the DB.
            datastore = e.target.result;
        
            callback();
        };
    
        // Handle errors when opening the datastore.
        request.onerror = eDB.onerror;
    };

    eDB.setActiveListView = function(sessionName, tabs, callback) {
        var db = datastore;
        var transaction = db.transaction(['listview'], 'readwrite');
        var objStore = transaction.objectStore('listview');

        // Create an object for the todo item.
        var session = {
            title: 'active',
            sessionName: sessionName,
            tabs: tabs
        };

        console.log(objStore);
        console.log(session);
    
        // Create the datastore request.
        var request = objStore.put(session);
    
        // Handle a successful datastore put.
        request.onsuccess = function(e) {
            console.log("Added listview "+sessionName);
            callback();
        };
    
        // Handle errors.
        request.onerror = eDB.onerror;
    };

    eDB.getActiveListView = function(callback) {
        var db = datastore;
        var transaction = db.transaction(['listview'], 'readwrite');
        var objStore = transaction.objectStore('listview');
    
        // Create the datastore request.
        var request = objStore.get('active');
    
        // Handle a successful datastore put.
        request.onsuccess = function(e) {
            callback(request.result);
        };
    
        // Handle errors.
        request.onerror = eDB.onerror;
    };
  
    // Export the eDB object.
    return eDB;
}());