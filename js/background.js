chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.action == "loadDictionaries") {
    var response = {status:"FAIL"};
    var dictionaries = [];
    try {
    chrome.storage.sync.get({ DICTIONARIES: []}, function(items) {
      items.DICTIONARIES.forEach(function(dictionary) {
        chrome.fileSystem.restoreEntry(dictionary.id, function(fileEntry) {
          if (fileEntry!==undefined) {
            fileEntry.file(function(file) {
              var reader = new FileReader();
              reader.onerror = function(e) {
                console.warn("FAIL");
                sendResponse({"status":"FAIL"});
              };
              reader.onloadend = function(e) {
                dictionaries.push({"name":fileEntry.name, "json":e.target.result});
                console.log("Custom dictionary loaded: "+fileEntry.name);
                if (dictionaries.length==items.DICTIONARIES.length) {
                  console.debug("sending response");
                  sendResponse({"status":"OK", "dictionaries":dictionaries});
                }
              };
              reader.readAsText(file);
            });
            return true;
          } else {
            console.warn('no FileEntry found for '+dictionary.name);
            sendResponse({"status":"FAIL - no FileEntry"});
          }
        });
      });
    });
    } catch(ex) {
      console.warn("CATCH & FAIL");
      sendResponse({"status":"FAIL"});
    }
  }
});

