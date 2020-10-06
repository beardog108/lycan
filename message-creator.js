document.getElementById("createMessageBtn").onclick = async function(){

    let field = document.getElementById("postMessageField")

    let payload = {
        "metadata": {
            'time': Math.floor((Date.now() / 1000)),
            'meta': JSON.stringify({'type': 'brd', 'ch': 'global'})
        },
        "data": field.value,
        "difficulty": difficulty.length / 2
    }
    powWorker.postMessage(JSON.stringify(payload))
}

powWorker.addEventListener('message', function(e) {
    let decoder = new TextDecoder("utf-8")
     let message = decoder.decode(e.data)

     fetch('http://' + getCurrentNode() + '.onion/upload', {
        method: 'POST',
        headers: {
            "content-type": "application/octet-stream"
        },
        body: decoder.decode(e.data)
    })

     console.debug("Generated block: " + doHashHex(e.data))
  }, false)
