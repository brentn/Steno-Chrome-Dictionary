var DICTIONARIES = [];
var IMEPluginID = '	immagadhjngfopbgndmnpcmbjcohicpp';

function save_options() {
  chrome.storage.sync.set({ DICTIONARIES: DICTIONARIES }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Dictionaries saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
  chrome.runtime.sendMessage(IMEPluginID, {action: "reload"});
  window.close();
}

function restore_options() {
  clear_dictionaries();
  chrome.storage.sync.get({ DICTIONARIES: []}, function(items) {
    items.DICTIONARIES.forEach(function(dictionary) {
      add_dictionary(dictionary);
    });
  });
}

function clear_dictionaries() {
  DICTIONARIES = [];
  var dictionaryList = document.getElementById('dictionaryList');
  while (dictionaryList.hasChildNodes())
    dictionaryList.removeChild(dictionaryList.lastChild);
}

function add_dictionary(dictionary) {
  if (dictionary===undefined) return;
  DICTIONARIES.push(dictionary);
  var index = DICTIONARIES.length-1;
  var dictList = document.getElementById('dictionaryList');
  var label = document.createElement("label");
  label.appendChild(document.createTextNode(dictionary.name));  
  label.setAttribute("style", "height:15px;width:250px;vertical-aligh:middle;display:inline-block");
  label.className = 'dictionary';
  var btnDel = document.createElement("button");
  btnDel.appendChild(document.createTextNode("X"));
  btnDel.setAttribute("style", "vertical-align:middle");
  btnDel.onclick = function() {
    DICTIONARIES.splice(index, 1);
    dictList.removeChild(label);
    dictList.removeChild(btnDel);
  };
  dictList.appendChild(label);
  dictList.appendChild(btnDel);
  dictList.appendChild(document.createElement("br"));
}

document.getElementById('btnAdd').addEventListener('click', function(e) {
  chrome.fileSystem.chooseEntry({type: 'openFile'}, function(readOnlyEntry) {
    add_dictionary({"id":chrome.fileSystem.retainEntry(readOnlyEntry), "name":readOnlyEntry.name});
	});
});


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);


