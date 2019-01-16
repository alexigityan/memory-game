
document.getElementById("1p").addEventListener("click", ()=>window.location.href="/1p");

document.getElementById("2pStart").addEventListener("click", startTwoPlayer);
document.getElementById("2pJoin").addEventListener("click", joinTwoPlayer);

function startTwoPlayer() {
    window.location.href="/2p/start/"
}

function joinTwoPlayer() {
    let room = document.getElementById("gameRoom").value;
    window.location.href="/2p/join/"+room;
}
