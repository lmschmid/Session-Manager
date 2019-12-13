export { fetchSessions, clearSessions, createSession, fetchSessions,
         deleteSession, deleteTabFromSession, addTabToSession };

var fetchSessions = function(callback) {
    var db = this.datastore;
    var transaction = db.transaction(['sessions'], 'readonly');
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

    cursorRequest.onerror = this.onerror;
};

var clearSessions = function(callback) {
    var db = this.datastore;

    var transaction = db.transaction(['sessions'], 'readwrite');

    var objStore = transaction.objectStore('sessions');
    var clear = objStore.clear();

    // Handle a successful datastore put.
    clear.onsuccess = function(e) {
        console.log("Sessions cleared from db.");
        callback();
    };

    // Handle errors.
    clear.onerror = this.onerror;
};

/**
 * Create a new session. Also can be used to alter existing session.
 */
var createSession = function(title, sessionData, callback) {
    var db = this.datastore;

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
    request.onerror = this.onerror;
};

/**
 * Fetch all of the sessions in the datastore.
 */
var fetchSessions = function(callback) {
    var db = this.datastore;
    var transaction = db.transaction(['sessions'], 'readonly');
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

    cursorRequest.onerror = this.onerror;
};

/**
 * Delete a session.
 */
var deleteSession = function(title, callback) {
    var db = this.datastore;
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
var deleteTabFromSession = function(title, deleteTabIndex, callback) {
    var db = this.datastore;
    var transaction = db.transaction(['sessions'], 'readwrite');
    var objStore = transaction.objectStore('sessions');
    var getRequest = objStore.get(title);

    var extDB = this;
    
    getRequest.onsuccess = function(e) {
        var session = getRequest.result;
        var data = session.data;

        data.tabs.splice(deleteTabIndex, 1);

        extDB.createSession(title, data, callback);
    }

    getRequest.onerror = function(e) {
        console.log(e);
    }
};

/**
 * Add a single tab to session.
 */
var addTabToSession = function(title, addTab, callback) {
    var db = this.datastore;
    var transaction = db.transaction(['sessions'], 'readwrite');
    var objStore = transaction.objectStore('sessions');
    var getRequest = objStore.get(title);

    var extDB = this;
    
    getRequest.onsuccess = function(e) {
        var session = getRequest.result;

        session.data.tabs = session.data.tabs.concat(addTab);

        extDB.createSession(title, session.data, callback);
    }

    getRequest.onerror = function(e) {
        console.log(e);
    }
};
