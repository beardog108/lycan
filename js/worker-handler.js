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
var lookupWorker = new Worker('/js/peer-lookup.js')
var powWorker = new Worker("/js/powworker.js")

lookupWorker.addEventListener('message', function(e) {
    let addPeer = async function(p){
      if (await (await fetch("http://" + p + ".onion/plaintext")).text() != "true")
      {
        console.debug("cannot add " + p)
        return
      }
      if (publicNodes.includes(p) || initialNodes.includes(p)){
        return
      }
      document.getElementById("lastReached").classList.replace("has-text-warning", "has-text-success")
      document.getElementById("lastReached").innerText = "Onionr network reached"
      publicNodes.push(p)
      document.getElementById("usableNodes").innerText = publicNodes.length
    }
    addPeer(e.data)
  }, false);



setInterval(function(){
  let n = getCurrentNode()
  if (typeof n == "undefined"){
    n = initialNodes[0]
  }
  lookupWorker.postMessage(JSON.stringify({"node": n}))
}, 60000)

initialNodes.forEach(n => {
  lookupWorker.postMessage(JSON.stringify({"node": n}))

});
