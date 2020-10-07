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
document.getElementById("createMessageBtn").onclick = async function(){
    document.getElementById("createMessageBtn").setAttribute("disabled", true)

    let field = document.getElementById("postMessageField")

    let payload = {
        "metadata": {
            'time': Math.floor((Date.now() / 1000)),
            'meta': JSON.stringify({'type': 'kic', 'ch': 'global'})
        },
        "data": field.value,
        "difficulty": difficulty.length / 2
    }
    powWorker.postMessage(JSON.stringify(payload))

    setTimeout(function(){
        document.getElementById("createMessageBtn").removeAttribute("disabled")
    }, 3000)
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