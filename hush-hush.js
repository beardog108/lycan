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
    "4gh2dwbmlrombeoyco55un7kbej7trsuebxfzvo53h6uj5adseceduyd"
]
var messageHashes = []
var blocks = {}

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
    var tmpl = document.getElementById("cMsgTemplate")

    let newEl = tmpl.content.cloneNode(true)
    newEl.children[0].children[0].children[0].innerText = message
    newEl.children[0].children[0].children[1].innerText = timestamp
    document.getElementsByClassName("messageFeed")[0].append(newEl)
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
    let messages = (await apiGET("getblocklist", "?type=brd")).split('\n')
    messages.forEach(block => {
        if (! block){return}
        if (block in blocks){return}
        apiGET("getdata", "/" + block, raw=false).then(function(d){
            let metadata = d.split("\n")[0]
            let data = d.split('\n')[1]
            blocks[block] = data
        })
    })
}

setInterval(function(){findMessages()}, findMessageIntervalTime)