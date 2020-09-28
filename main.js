var worker = new Worker("./powworker.js")

var startTime = 0;

function getEpoch(){
    return Math.floor((new Date).getTime()/1000)
}

document.getElementById('generate').onclick = function(){
    document.getElementById('generate').setAttribute("disabled", true)
    document.getElementById('output').value = "computing..."
    document.getElementById('timeResult').value = ""
    document.getElementById('hashResult').value = ""
    var metadata = {
        "meta": JSON.stringify({
            "type": document.getElementById("type").value
        }),
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
    document.getElementById('hashResult').value = doHashHex(e.data)
    document.getElementById('timeResult').value = finishTime + "s"
    document.getElementById('output').value = new TextDecoder("utf-8").decode(e.data)

    let a = document.getElementById('download')
    var file = new Blob([e.data], {type: type})
    a.href = URL.createObjectURL(file)
    a.download = document.getElementById('hashResult').value + ".onionr"
})

