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


self.addEventListener('message', async function(e) {
    let lookupPeer = async function(peer){
        let newList = await (await fetch('http://' + peer + '.onion/pex')).text()

        newList = newList.replaceAll('.onion', '')

        return newList.split(',')
    }
    var data = JSON.parse(e.data)

    let peer = data['node']
    console.debug(peer)
    let peerList = await lookupPeer(peer)
    peerList.forEach(node => {
        if (node){
            //if (await (await fetch('http://' + node + '.onion/ping')).text() !== 'pong'){
            //    return
            //}
            postMessage(node)
        }
    })

  }
)