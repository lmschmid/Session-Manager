import { fetchSessions, clearSessions, createSession, deleteSession,
         deleteTabFromSession, addTabToSession }
         from "./sessionsDB.js";
import { setSetting, getSetting, fetchSettings } from "./settingsDB.js";
import { setActiveListView, getActiveListView } from "./listviewDB.js";

export { extDB };

// Macros for sorting mode
const ALPHA_INC = 0;
const ALPHA_DEC = 1;
const TIME_INC = 2;
const TIME_DEC = 3;

// Need a better way to get to session when there are a lot
// ex: i always delete when i get to three sessions, havent done more
//      -keyboard shortcuts?

var extDB = (function() {
    var eDB = {};
    var datastore = null;
  
    /**
     * Open a connection to the datastore.
     */
    eDB.open = function(callback) {
        
        console.log("opening extDB");
        // Database version.
        var version = 1;
    
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
            var settingStore = db.createObjectStore('listview', {
                keyPath: 'title'
            });

            // restore default settings when upgrading
            setTimeout(function () {
                eDB.setSetting('shouldLoad', false, function () {
                    console.log("set shouldLoad");
                });
                eDB.setSetting('shouldRestore', true, function () {
                    console.log("set shouldLoad");
                });
                eDB.setSetting('sortMode', TIME_DEC, function () {
                    console.log("set sortMode");
                });
            }, 300);
        };
    
        request.onsuccess = function(e) {
            // Get a reference to the DB.
            datastore = e.target.result;
            eDB.datastore = datastore;
        
            callback();
        };
    
        // Handle errors when opening the datastore.
        request.onerror = function(err) {
            console.log(err);
        }
    };
    
    /*************************************************************************
     * Misc/All section
     *************************************************************************/
    eDB.restoreFromJSON = function(jsonData, callback) {
        var db = datastore;

        console.log(jsonData);
        for (const key of Object.keys(jsonData)) {
            var trx = db.transaction([key], 'readwrite');
            var objStore = trx.objectStore(key);

            if (key === 'sessions') {
                eDB.clearSessions(function() {
                    for (var session of jsonData[key]) {
                        eDB.createSession(session.title, session.data, function () {});
                    }
                });
            } else if (key === 'settings') {
                for (var setting of jsonData[key]) {
                    eDB.setSetting(setting.setting, setting.state, function () {});
                }
            }
        }
    }

    eDB.fetchAllStorage = function(callback) {
        eDB.fetchSettings(function (settings) {
            eDB.fetchSessions(function (sessions) {
                var results = {
                    sessions: sessions,
                    settings: settings
                };
                callback(results);
            });
        });
    }

    /*************************************************************************
     * Sessions section
     *************************************************************************/
    /**
     * Clears all sessions.
     */
    eDB.clearSessions = clearSessions.bind(eDB);

    /**
     * Create a new session. Also can be used to alter existing session.
     */
    eDB.createSession = createSession.bind(eDB);

    /**
     * Fetch all of the sessions in the datastore.
     */
    eDB.fetchSessions = fetchSessions.bind(eDB);
    
    /**
     * Delete a session.
     */
    eDB.deleteSession = deleteSession.bind(eDB);

    /**
     * Delete a single tab from session.
     */
    eDB.deleteTabFromSession = deleteTabFromSession.bind(eDB);

    /**
     * Add a single tab to session.
     */
    eDB.addTabToSession = addTabToSession.bind(eDB);


    /*************************************************************************
     * Settings section
     *************************************************************************/
    /**
     * Set state of setting in the datastore.
     */
    eDB.setSetting = setSetting.bind(eDB);
    /**
     * Get state of setting in the datastore.
     */
    eDB.getSetting = getSetting.bind(eDB);
    /**
     * Fetch all of the settings in the datastore.
     */
    eDB.fetchSettings = fetchSettings.bind(eDB);
  
    /*************************************************************************
     * Listview section
     *************************************************************************/
    eDB.setActiveListView = setActiveListView.bind(eDB);

    eDB.getActiveListView = getActiveListView.bind(eDB);

    // Export the eDB object.
    return eDB;
}());
