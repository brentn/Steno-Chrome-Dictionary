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
    var numDicts = 0;
    var numDictsLoaded=0;
    try {
    chrome.storage.sync.get({ DICTIONARIES: []}, function(items) {
      numDicts=items.DICTIONARIES.length;
      for (var i in items.DICTIONARIES) {
        console.debug("Loading dictionary: "+items.DICTIONARIES[i].name);
        loadDictionary(i, items.DICTIONARIES[i]);
      }
    });
    } catch(ex) {
      console.warn("CATCH & FAIL");
      sendResponse({"status":"FAIL"});
    }
    return true;
  }
  
  function loadDictionary(i, dictionary) {
    chrome.fileSystem.restoreEntry(dictionary.id, function(fileEntry) {
      if (fileEntry!==undefined) {
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onerror = function(e) {
            console.warn("FAIL");
            sendResponse({"status":"FAIL"});
          };
          reader.onloadend = function(e) {
            dictionaries[i] = {"name":fileEntry.name, "json":e.target.result};
            numDictsLoaded++;
            console.log("Custom dictionary loaded: "+fileEntry.name + "("+numDictsLoaded+")");
            if (numDictsLoaded==numDicts) {
              console.debug("sending response");
              sendResponse({"status":"OK", "dictionaries":dictionaries});
            }
          };
          reader.readAsText(file);
        });
      } else {
        console.warn('no FileEntry found for '+dictionary.name);
        sendResponse({"status":"FAIL - no FileEntry"});
      }
    });
  }
  
});


