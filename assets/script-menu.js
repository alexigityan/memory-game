
document.getElementById("1p").addEventListener("click", ()=>window.location.href="/1p" );

document.getElementById("2pStart").addEventListener("click", ()=>window.location.href="/2p/start");
let joinButton = document.getElementById("2pJoin");
let room = document.getElementById("gameRoom");

room.addEventListener("change", toggleButton);

function toggleButton() {
    if (room.value) {
        joinButton.disabled = false;
        joinButton.classList.add("clickable");
        joinButton.addEventListener("click", joinTwoPlayer);
    } else {
        joinButton.disabled = true;
        joinButton.classList.remove("clickable");
        joinButton.removeEventListener("click", joinTwoPlayer);       
    }
}

function joinTwoPlayer() {
    let xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if(xhr.status === 200) {
            window.location.href="/2p/join/"+room.value;
        } else {
            room.value = "";
            room.placeholder = "Room "+room.value+" Not Found";
        }
    };
    xhr.open("get", "/2p/check/"+room.value);
    xhr.send();
}



