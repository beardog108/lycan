importScripts("onionr-jspow/index.js")
importScripts("sha3.js")

self.addEventListener('message', function(e) {
  var data = JSON.parse(e.data)
  console.debug(data.metadata)
  self.postMessage(
    doPow(
    data.metadata,
    data.data,
    data.difficulty
  ));
}, false);