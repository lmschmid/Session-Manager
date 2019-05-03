export { extDB };

// ONLY CREATES NEW OBJECTSTORES WHEN VERSION IS NEWER!!!!

// Testing indexedDB
var extDB = (function() {
    var eDB = {};
    var datastore = null;
  
    /**
     * Open a connection to the datastore.
     */
    eDB.open = function(callback) {
        // Database version.
        var version = 2;
    
        // Open a connection to the datastore.
        var request = indexedDB.open('ext', version);
    
        // Handle datastore upgrades.
        request.onupgradeneeded = function(e) {
            var db = e.target.result;
        
            e.target.transaction.onerror = eDB.onerror;
        
            // Delete the old datastore.
            if (db.objectStoreNames.contains('sessions')) {
                db.deleteObjectStore('sessions');
            }
        
            // Create a new datastore.
            var store = db.createObjectStore('sessions', {
                keyPath: 'title'
            });
        };
    
        // Handle successful datastore access.
        request.onsuccess = function(e) {
            // Get a reference to the DB.
            datastore = e.target.result;
        
            // Execute the callback.
            callback();
        };
    
        // Handle errors when opening the datastore.
        request.onerror = eDB.onerror;
    };
    /**
     * Create a new todo item.
     */
    eDB.createSession = function(text, callback) {
        // Get a reference to the db.
        var db = datastore;
    
        // Initiate a new transaction.
        var transaction = db.transaction(['sessions'], 'readwrite');
    
        // Get the datastore.
        var objStore = transaction.objectStore('sessions');
    
        // Create an object for the todo item.
        var todo = {
            title: 'Pls work',
            text: text,
        };
    
        // Create the datastore request.
        var request = objStore.put(todo);
    
        // Handle a successful datastore put.
        request.onsuccess = function(e) {
            // Execute the callback function.
            callback(todo);
        };
    
        // Handle errors.
        request.onerror = eDB.onerror;
    };
    // /**
    //  * Fetch all of the todo items in the datastore.
    //  */
    // eDB.fetchTodos = function(callback) {
    //     var db = datastore;
    //     var transaction = db.transaction(['todo'], 'readwrite');
    //     var objStore = transaction.objectStore('todo');
    
    //     var keyRange = IDBKeyRange.lowerBound(0);
    //     var cursorRequest = objStore.openCursor(keyRange);
    
    //     var todos = [];
    
    //     transaction.oncomplete = function(e) {
    //         // Execute the callback function.
    //         callback(todos);
    //     };
    
    //     cursorRequest.onsuccess = function(e) {
    //         var result = e.target.result;
        
    //         if (!!result == false) {
    //             return;
    //         }
        
    //         todos.push(result.value);
        
    //         result.continue();
    //     };
    
    //     cursorRequest.onerror = eDB.onerror;
    // };
    // /**
    //  * Delete a todo item.
    //  */
    // eDB.deleteTodo = function(id, callback) {
    //     var db = datastore;
    //     var transaction = db.transaction(['todo'], 'readwrite');
    //     var objStore = transaction.objectStore('todo');
    
    //     var request = objStore.delete(id);
    
    //     request.onsuccess = function(e) {
    //         callback();
    //     }
    
    //     request.onerror = function(e) {
    //         console.log(e);
    //     }
    // };
  
    // Export the eDB object.
    return eDB;
}());