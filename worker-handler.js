var lookupWorker = new Worker('peer-lookup.js');


lookupWorker.addEventListener('message', function(e) {
    console.log('Worker said: ', e.data);
  }, false);
lookupWorker.postMessage(JSON.stringify({"nodeList": publicNodes}))
