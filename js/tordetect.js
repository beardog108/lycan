let torDetect = function(){
    if (document.location.origin.endsWith('.onion')){
        return
    }
    let el = document.createElement('img')
    el.onerror = function(){
        document.getElementsByClassName('noTor')[0].classList.remove('is-hidden')
    }
    el.src = "https://3g2upl4pq6kufc4m.onion/favicon.ico"
}
setTimeout(torDetect, 1000)