function reconstructHash(hash){
    return hash.padStart(64, 0)
}


function verifyBlock(raw, hash){
    var encoder = new TextEncoder("utf-8")
    hash = reconstructHash(hash)
    if (doHashHex(encoder.encode(raw)) != hash){
        throw new Error("Hash does not match")
    }
}


