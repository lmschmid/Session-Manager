export var gettingStoredStats = browser.storage.local.get();
export function addSessionToStorage(urls) {
  // Load existent stats with the storage API.
  gettingStoredStats.then(results => {
      // Initialize the saved stats if not yet initialized.
      if (!results.stats) {
        results = {
          sessions : {}
        };
      }
      
      results["sessions"] = {
          test1 : urls
      }
      console.log(results);
      // Persist the updated stats.
      browser.storage.local.set(results);
  });
}
