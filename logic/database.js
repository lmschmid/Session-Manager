export { extDB };


var extDB = (function() {
    var eDB = {};
    var datastore = null;
  
    /**
     * Open a connection to the datastore.
     */
    eDB.open = function(callback) {
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
    /**
     * Clears all sessions.
     */
    eDB.clearSessions = function() {
        var db = datastore;
    
        var transaction = db.transaction(['sessions'], 'readwrite');
    
        var objStore = transaction.objectStore('sessions');
        var clear = objStore.clear();
    
        // Handle a successful datastore put.
        clear.onsuccess = function(e) {
            console.log("Sessions cleared from db.");
        };
    
        // Handle errors.
        clear.onerror = eDB.onerror;
    };
    /**
     * Create a new session. Also can be used to alter existing session.
     */
    eDB.createSession = function(title, sessionData, callback) {
        var db = datastore;
    
        var transaction = db.transaction(['sessions'], 'readwrite');
    
        var objStore = transaction.objectStore('sessions');
    
        // Create an object for the todo item.
        var session = {
            title: title,
            data: sessionData,
        };
    
        // Create the datastore request.
        var request = objStore.put(session);
    
        // Handle a successful datastore put.
        request.onsuccess = function(e) {
            console.log("Added "+title+" successfully");
            callback();
        };
    
        // Handle errors.
        request.onerror = eDB.onerror;
    };
    /**
     * Fetch all of the sessions in the datastore.
     */
    eDB.fetchSessions = function(callback) {
        var db = datastore;
        var transaction = db.transaction(['sessions'], 'readwrite');
        var objStore = transaction.objectStore('sessions');
    
        var keyRange = IDBKeyRange.lowerBound(0);
        // Iterates through an object store by primary key
        var cursorRequest = objStore.openCursor(keyRange);
    
        var sessions = [];
    
        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
        
            if (!!result == false) {
                return;
            }
        
            sessions.push(result.value);
        
            result.continue();
        };

        transaction.oncomplete = function(e) {
            callback(sessions);
        };
    
        cursorRequest.onerror = eDB.onerror;
    };
    /**
     * Delete a session.
     */
    eDB.deleteSession = function(title, callback) {
        var db = datastore;
        var transaction = db.transaction(['sessions'], 'readwrite');
        var objStore = transaction.objectStore('sessions');
    
        var request = objStore.delete(title);
    
        request.onsuccess = function(e) {
            console.log("Deleted session "+title);
            callback();
        }
    
        request.onerror = function(e) {
            console.log(e);
        }
    };
    /**
     * Delete a single tab from session.
     */
    eDB.deleteTabFromSession = function(title, deleteTabIndex, callback) {
        var db = datastore;
        var transaction = db.transaction(['sessions'], 'readwrite');
        var objStore = transaction.objectStore('sessions');
        var getRequest = objStore.get(title);
        
        getRequest.onsuccess = function(e) {
            var session = getRequest.result;
            var data = session.data;

            data.tabs.splice(deleteTabIndex, 1);

            eDB.createSession(title, data, callback);
        }
    
        getRequest.onerror = function(e) {
            console.log(e);
        }
    };
    /**
     * Add a single tab to session.
     */
    eDB.addTabToSession = function(title, addTab, callback) {
        var db = datastore;
        var transaction = db.transaction(['sessions'], 'readwrite');
        var objStore = transaction.objectStore('sessions');
        var getRequest = objStore.get(title);
        
        getRequest.onsuccess = function(e) {
            var session = getRequest.result;

            session.data.tabs.push(addTab);

            eDB.createSession(title, session.data, callback);
        }
    
        getRequest.onerror = function(e) {
            console.log(e);
        }
    };
  
    // Export the eDB object.
    return eDB;
}());

// extDB.open(function() {
//     console.log("Db opened");
// });
// setTimeout(function() {
//     extDB.clearSessions();
// },
// 300);
// setTimeout(function() {
//         extDB.createSession("TestSession", {tabs:["www.google.com", "www.facebook.com"], createDate: "2019-05-01"},);
//     },
// 500);
// setTimeout(function() {
//     extDB.deleteTabFromSession("TestSession", "testTab");
// },
// 650);
// setTimeout(function() {
//     extDB.addTabToSession("TestSession", "www.github.com");
// },
// 800);
// setTimeout(function() {
//     extDB.createSession("TestSession", {urls:["www.facebook.com"], createDate: "1999-02-01"}, function(session) {
//         console.log(session);
//     });
// },
// 1000);
// setTimeout(function() {
//     extDB.fetchSessions(function(session) {
//         console.log(session);
//     });
// },
// 1300);
