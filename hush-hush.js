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
    "4wbarqtxh6zasoxxftakrellcjzztcib7bqth4u3igof5fskrrvrk4yd",
    "zl67stwxpjkntaxcfdhj3dvayculoojju6eek2jhsrdz6uwf224o6oqd"
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
publicNodes.forEach(node => {
    let doPing = async function(){
        let res = await(await fetch("http://" + node + ".onion/ping")).text()
        if (res !== "pong!"){
            console.debug(node)
        }
    }
    doPing()
})

function getCurrentNode(){
    // Very basic round-robin use of nodes
    let current = publicNodes.shift()

    publicNodes.push(current)
    return current
}

function addMessage(message, timestamp){
    function sortEntries() {
        var entries = document.getElementsByClassName('entry')

        if (entries.length > 1) {
            const sortBy = 'data-epoch'
            const parent = entries[0].parentNode

            const sorted = Array.from(entries).sort((a, b) => b.getAttribute(sortBy) - a.getAttribute(sortBy))
            sorted.forEach(element => parent.appendChild(element))
        }
    }


    message =  DOMPurify.sanitize(marked(message),
                                 {FORBID_ATTR: ['style'],
                                 ALLOWED_TAGS: ['b', 'p', 'em', 'i', 'a', 'strong', 'sub', 'small', 'ul', 'li', 'ol', 'strike',
                                                'tr', 'td', 'th', 'table', 'thead', 'tfoot', 'colgroup', 'col', 'caption', 'marquee',
                                                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'center', 'br', 'hr']})

    let childEl = document.createElement('div')
    childEl.classList.add('content')
    childEl.innerHTML = message
    var tmpl = document.getElementById("cMsgTemplate")
    timestamp = timestamp.toString()

    let newEl = tmpl.content.cloneNode(true)
    newEl.children[0].setAttribute('data-epoch', timestamp)
    newEl.children[0].classList.add("entry")
    newEl.children[0].children[0].children[0].innerText = ""
    newEl.children[0].children[0].children[0].append(childEl)
    newEl.children[0].children[0].children[2].innerText = new Date(timestamp * 1000).toString().split('GMT')[0]
    document.getElementsByClassName("messageFeed")[0].prepend(newEl)
    sortEntries()
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
    let messages = (await apiGET("getblocklist", "?type=kic")).split('\n')
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
            try{
                var metadata = JSON.parse(d.split("\n")[0])
                // Make sure the block is an actual post so nodes can't send us stuff unrelated to dapp
                if (JSON.parse(metadata['meta'])['type'] !== 'kic'){
                    throw new Error("Not correct block type: " + block)
                }
            }
            catch(e){
                console.debug(e)
                return
            }

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
            addMessage(data, metadata['time'])
            updateMemoryUsage(data, block)
        })
    })
    setTimeout(function(){findMessages()}, findMessageIntervalTime)
}

setTimeout(function(){findMessages()}, findMessageIntervalTime)