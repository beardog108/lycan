document.getElementById('boardID').onchange = function(e){
    postTopic = e.target.value.toLowerCase()
    messageHashes = []
    blocks = []
    document.getElementsByClassName("messageFeed")[0].innerText = ""
    document.getElementById('memUsage').innerText = "0kB"
}