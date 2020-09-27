var worker = new Worker("./powworker.js")

document.getElementById('generate').onclick = function(){
    document.getElementById('output').value = "computing..."
    var metadata = {
        "meta": {
            "type": document.getElementById("type")
        },
        "time": 0
    }
    // todo web workers
    var data = document.getElementById('message').value
    var postData = {
        "data": data,
        "metadata": metadata,
    }

    worker.postMessage(JSON.stringify(postData))
}


worker.addEventListener('message', function(e) {
    document.getElementById('output').value = doHashHex(e.data) + "\n"
    document.getElementById('output').value += new TextDecoder("utf-8").decode(e.data)
})
