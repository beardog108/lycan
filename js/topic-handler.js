document.getElementById('boardID').onchange = function(e){
    postTopic = e.target.value.toLowerCase()
    messageHashes = []
    blocks = []
    document.getElementsByClassName("messageFeed")[0].innerText = ""
}