/*
    hush-hush: anonymous message board using the onionr network
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
var findMessageIntervalTime = 5000
var publicNodes = [
    "yre3tmbu25lcogl42xlh73wfchgbx3unz2zz3ttyiylj6gaq5mzhevid",
    "ltqmmfww3tue6tibtyfc4kk7edh3owewxwcgrkvwqw4cwgd3w3zcj6id"
]
var messageHashes = []
var blocks = []
var basicTextEncoder = new TextEncoder()
var difficulty = "0000"
var maxBlockAge = 2678400


function shuffleArray(array) {
    if (document.hidden){return}
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffleArray(publicNodes)

//https://stackoverflow.com/q/10420352
function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
};

setInterval(function(){shuffleArray(publicNodes)}, 5000)


// Make Tor connect to each node to reduce future connection time
publicNodes.forEach(element => {
    fetch("http://" + element + ".onion/ping")
})

function getCurrentNode(){
    // Very basic round-robin use of nodes
    let current = publicNodes.shift()

    publicNodes.push(current)
    return current
}

function addMessage(message, timestamp){

    message =  DOMPurify.sanitize(marked(message),
                                 {FORBID_ATTR: ['style'],
                                 ALLOWED_TAGS: ['b', 'p', 'em', 'i', 'a',
                                                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'center', 'br', 'hr']})

    let childEl = document.createElement('div')
    childEl.classList.add('content')
    childEl.innerHTML = message
    var tmpl = document.getElementById("cMsgTemplate")

    let newEl = tmpl.content.cloneNode(true)
    newEl.children[0].children[0].children[0].innerText = ""
    newEl.children[0].children[0].children[0].append(childEl)
    newEl.children[0].children[0].children[2].innerText = timestamp
    document.getElementsByClassName("messageFeed")[0].prepend(newEl)
}

async function apiGET(path, queryString, raw=false){
    let response = await fetch("http://" + getCurrentNode() + ".onion/" + encodeURIComponent(path) + queryString)

    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      if (raw){
          return await response.blob()
      }
      return await response.text()
    } else {
      console.debug("HTTP-Error: " + response.status)
    }
}

async function findMessages(){
    if (document.hidden){
        setTimeout(function(){findMessages()}, 1000)
        return
    }
    let messages = (await apiGET("getblocklist", "?type=brd")).split('\n')
    messages.forEach(block => {
        if (!block) { return}
        block = reconstructHash(block)
        if (!block.startsWith(difficulty)){console.debug("not difficulty reached:" + block); return}

        if (blocks.includes(block)){return}
        apiGET("getdata", "/" + block, raw=false).then(function(d){
            let updateMemoryUsage = function(data, block){
                let current = parseInt(document.getElementById('memUsage').innerText)
                // Size is size of data (not metadata) and block hash
                document.getElementById('memUsage').innerText = getReadableFileSizeString(current + ((basicTextEncoder.encode(data)).length + block.length))
            }
            let metadata = JSON.parse(d.split("\n")[0])
            console.debug(metadata)
            //let data = d.split('\n')[1]
            let data = d.substring(d.indexOf('\n') + 1);
            try{
                verifyBlock(d, block)
                verifyTime(metadata['time'])
            }
            catch(e){
                console.debug(block + ":" + e)
                return
            }
            blocks.push(block)
            addMessage(data, new Date(metadata['time'] * 1000))
            updateMemoryUsage(data, block)
        })
    })
    setTimeout(function(){findMessages()}, findMessageIntervalTime)
}

setTimeout(function(){findMessages()}, findMessageIntervalTime)