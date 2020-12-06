/*
    Lycan: anonymous message board using the onionr network
    Copyright (C) 2020 Kevin Froman

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
document.getElementById("createMessageBtn").onclick = async function(){
    document.getElementById("createMessageBtn").setAttribute("disabled", true)

    document.getElementById("creatingMessage").classList.remove("is-hidden")
    document.getElementById("creatingCount").innerText = parseInt(document.getElementById("creatingCount").innerText) + 1
    let field = document.getElementById("postMessageField")
    var postMessage = field.value
    if (document.getElementById('use-markdown').checked){
        postMessage = marked(postMessage)
    }

    let payload = {
        "metadata": {
            'time': Math.floor((Date.now() / 1000)),
            'meta': JSON.stringify({'type': postTopic})
        },
        "data": postMessage,
        "difficulty": 5
    }
    powWorker.postMessage(JSON.stringify(payload))

    setTimeout(function(){
        document.getElementById("createMessageBtn").removeAttribute("disabled")
    }, 3000)
}

async function doUpload(data){
    document.getElementById("uploadingCount").parentNode.classList.remove('is-hidden')
    if (! publicNodes.length){
        setTimeout(function(){
            doUpload(data)
        }, 1000)
        return
    }
    const curNode = getCurrentNode()
    if (typeof curNode == "undefined" || curNode === "undefined.onion"){
        setTimeout(function(){
            doUpload(data)
        }, 1000)
        return
    }

    let decoder = new TextDecoder("utf-8")
    let uploadTimeout = setTimeout(function(){
        console.debug("upload timed out")
        doUpload(data)
    }, 30000)
    let upload = await fetch('http://' + curNode + '.onion/upload', {
        method: 'POST',
        headers: {
            "content-type": "application/octet-stream"
        },
        body: decoder.decode(data)
    })
    clearTimeout(uploadTimeout)
    if (upload.ok){
        let cur = parseInt(document.getElementById("uploadingCount").innerText)
        document.getElementById("uploadingCount").innerText = parseInt(document.getElementById("uploadingCount").innerText) - 1
        if (cur - 1 <= 0){
            document.getElementById("uploadingCount").parentNode.classList.add('is-hidden')
        }

        return
    }
    doUpload(data)
}

powWorker.addEventListener('message', function(e) {
    document.getElementById("creatingCount").innerText = parseInt(document.getElementById("creatingCount").innerText) - 1
    if (parseInt(document.getElementById("creatingCount").innerText) <= 0){
        document.getElementById("creatingMessage").classList.add("is-hidden")
    }
     console.debug("Generated block: " + doHashHex(e.data))
     document.getElementById("uploadingCount").innerText = parseInt(document.getElementById("uploadingCount").innerText) + 1
     doUpload(e.data)
  }, false)
