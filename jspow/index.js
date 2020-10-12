/*
Copyright 2020 Kevin Froman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// version = 0.0.0

class Block {
    constructor(meta, sig, signer, time, pow=0, c=0) {
      this.meta = meta
      this.sig = sig
      this.signer = signer
      this.time = time
      this.c = c
    }
  }


let doHash = function(data){
    const shaObj = new jsSHA("SHA3-256", "UINT8ARRAY", { encoding: "UTF8" });
    shaObj.update(data)
    return shaObj.getHash("UINT8ARRAY");
}
let doHashHex = function(data){
    const shaObj = new jsSHA("SHA3-256", "UINT8ARRAY", { encoding: "UTF8" });
    shaObj.update(data)
    return shaObj.getHash("HEX");
}

function doPow(metadata, data, difficulty){
    // Inefficient single threaded proof of work. Accepting better implementations!
    var encoder = new TextEncoder("utf-8")
    if (typeof data == 'string'){
        data = encoder.encode(data)
    }


    metadata['c'] = -9999999
    metadata['n'] = Math.floor(Math.random() * Math.floor(10000)) + Math.floor(Math.random() * Math.floor(10000))
    var difficultyCounter = 0
    while (true){
        difficultyCounter = 0
        let metadataString = encoder.encode(JSON.stringify(metadata) + "\n")
        let arr = new Uint8Array(metadataString.length + data.length)
        arr.set(metadataString)
        arr.set(data, metadataString.length)
        hash = doHashHex(arr)

        for (var i = 0; i < difficulty; i++){
            if (hash[i] == '0'){
                difficultyCounter += 1
                if (difficultyCounter === difficulty){
                    return arr
                }
            }
            else{
                break
            }
        }
        metadata['c'] += 1
        if (metadata['c'] % 10000 == 0){
            console.debug(metadata['c'])
        }
    }

}

function unserialize(str, theClass) {
    var instance = new theClass() // NOTE: if your constructor checks for unpassed arguments, then just pass dummy ones to prevent throwing an error
    var serializedObject = JSON.parse(str)
    Object.assign(instance, serializedObject)
    return instance
}


