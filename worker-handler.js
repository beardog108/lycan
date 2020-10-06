var lookupWorker = new Worker('peer-lookup.js');
var powWorker = new Worker("powworker.js")

lookupWorker.addEventListener('message', function(e) {
    publicNodes.push(e.data)
  }, false);



setInterval(function(){
  lookupWorker.postMessage(JSON.stringify({"node": getCurrentNode()}))
}, 60000)
lookupWorker.postMessage(JSON.stringify({"node": getCurrentNode()}))
