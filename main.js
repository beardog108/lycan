var worker = new Worker("./powworker.js")

var startTime = 0;

function getEpoch(){
    return Math.floor((new Date).getTime()/1000)
}

document.getElementById('generate').onclick = function(){
    document.getElementById('generate').setAttribute("disabled", true)
    document.getElementById('output').value = "computing..."
    var metadata = {
        "meta": {
            "type": document.getElementById("type").value
        },
        "time": getEpoch()
    }
    // todo web workers
    var data = document.getElementById('message').value
    var postData = {
        "data": data,
        "metadata": metadata,
        "difficulty": parseInt(document.getElementById("difficulty").value)
    }

    startTime = getEpoch()
    worker.postMessage(JSON.stringify(postData))
}


worker.addEventListener('message', function(e) {
    var finishTime = getEpoch() - startTime
    document.getElementById('generate').removeAttribute("disabled")
    document.getElementById('timeResult').value = finishTime + "s"
    document.getElementById('output').value = doHashHex(e.data) + "\n"
    document.getElementById('output').value += new TextDecoder("utf-8").decode(e.data)
})
