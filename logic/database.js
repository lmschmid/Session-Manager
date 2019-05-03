export { sessionDB };

// Testing indexedDB
var sessionDB = (function() {
    var sDB = {};
    var datastore = null;
  
    /**
     * Open a connection to the datastore.
     */
    sDB.open = function(callback) {
        // Database version.
        var version = 1;
    
        // Open a connection to the datastore.
        var request = indexedDB.open('todos', version);
    
        // Handle datastore upgrades.
        request.onupgradeneeded = function(e) {
            var db = e.target.result;
        
            e.target.transaction.onerror = sDB.onerror;
        
            // Delete the old datastore.
            if (db.objectStoreNames.contains('todo')) {
                db.deleteObjectStore('todo');
            }
        
            // Create a new datastore.
            var store = db.createObjectStore('todo', {
                keyPath: 'timestamp'
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
        request.onerror = sDB.onerror;
    };
    /**
     * Fetch all of the todo items in the datastore.
     */
    sDB.fetchTodos = function(callback) {
        var db = datastore;
        var transaction = db.transaction(['todo'], 'readwrite');
        var objStore = transaction.objectStore('todo');
    
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = objStore.openCursor(keyRange);
    
        var todos = [];
    
        transaction.oncomplete = function(e) {
            // Execute the callback function.
            callback(todos);
        };
    
        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
        
            if (!!result == false) {
                return;
            }
        
            todos.push(result.value);
        
            result.continue();
        };
    
        cursorRequest.onerror = sDB.onerror;
    };
    /**
     * Create a new todo item.
     */
    sDB.createTodo = function(text, callback) {
        // Get a reference to the db.
        var db = datastore;
    
        // Initiate a new transaction.
        var transaction = db.transaction(['todo'], 'readwrite');
    
        // Get the datastore.
        var objStore = transaction.objectStore('todo');
    
        // Create a timestamp for the todo item.
        var timestamp = new Date().getTime();

        // Liams test obj
        var testObj = {
            'nice': true
        }
    
        // Create an object for the todo item.
        var todo = {
            'text': text,
            'testObj': testObj,
            'timestamp': timestamp
        };
    
        // Create the datastore request.
        var request = objStore.put(todo);
    
        // Handle a successful datastore put.
        request.onsuccess = function(e) {
            // Execute the callback function.
            callback(todo);
        };
    
        // Handle errors.
        request.onerror = sDB.onerror;
    };
    /**
     * Delete a todo item.
     */
    sDB.deleteTodo = function(id, callback) {
        var db = datastore;
        var transaction = db.transaction(['todo'], 'readwrite');
        var objStore = transaction.objectStore('todo');
    
        var request = objStore.delete(id);
    
        request.onsuccess = function(e) {
            callback();
        }
    
        request.onerror = function(e) {
            console.log(e);
        }
    };
  
    // Export the sDB object.
    return sDB;
}());

// sessionDB.open(function() {
//     console.log("Db opened");
// });
// setTimeout(function(){sessionDB.createTodo("Test", function(todo) {
//     console.log(todo);
// });}, 300);