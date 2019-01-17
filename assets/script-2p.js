const session = document.getElementById("session").getAttribute("session");
const player = document.getElementById("player").getAttribute("player");
const team = document.getElementById("player").getAttribute("team");
const ready = document.getElementById("ready");

if(team === "red")
    ready.addEventListener("click", clickReady);


function clickReady() {
    ready.removeEventListener("click",clickReady);
    ready.disabled = true;
    ready.classList.remove("clickable");
    let xhr = new XMLHttpRequest();
    xhr.onload = () => ready.innerText = "Waiting...";
    xhr.open("get", "/2p/ready/"+session);
    xhr.send();   
}

let blocks;



let events = new EventSource("/2p/live/"+session);
events.onmessage = (evt) => {
    if(evt.data === "j") {
        document.getElementById("joinText").innerText = "Your friend has joined!";
        ready.innerText = "Ready";
        ready.disabled = false;
        ready.classList.add("clickable");
        ready.addEventListener("click", clickReady);
    } else if(evt.data === "s") {
        document.getElementsByClassName("container")[0]
            .removeChild(document.getElementsByClassName("modal-background")[0]);
        blocks = Array.from(document.getElementsByClassName("block"));
        blocks.forEach(elem=>makeClickable(elem));
    } else if(evt.data[0]==="o") {
        let blockId = parseInt(evt.data[1]+evt.data[2]);
        let iconId = parseInt(evt.data[3]+evt.data[4]);
        let color = (evt.data[5]==="b") ? "#B0E0E6" : "#FFC0CB";
        openBlock(blockId,color,iconId);
    } else if(evt.data[0]==="c") {
        let blockId = parseInt(evt.data[1]+evt.data[2]);
        closeBlock(blockId);       
    } else if (evt.data[0]==="w") {
        endGame("win");
    }

};

function makeClickable(block) {
    block.addEventListener("click",handleClick);
    block.classList.add("clickable");
}

function removeClickable(block) {
    block.removeEventListener("click",handleClick);
    block.classList.remove("clickable");
}

function handleClick(evt) {
    requestOpenBlock(session, player, evt.target.id);
}

function requestOpenBlock(ses, pl, id) {
  
    let xhr = new XMLHttpRequest();
    xhr.open("get", "/2p/openblock/"+ses+"/"+pl+"/"+id);
    xhr.send();
}

function openBlock(id, color, iconId) {
    removeClickable(blocks[id]); 
    let block = blocks[id];
    block.style = `border-color:${color};background-color:${color};background-image:url(/icons/${iconId}.png)`;
}

function closeBlock(id) {
    let block = blocks[id];
    block.style="";
    makeClickable(block);
}

function startNewGame() {
    let xhr = new XMLHttpRequest;
    xhr.onload=()=>location.reload();
    xhr.open("GET","/remove/"+session);
    xhr.send();
}

function endGame(result) {
    let modalBckg = document.createElement("div");
    modalBckg.classList.add("modal-background");
    let modalGray = document.createElement("div");
    modalGray.classList.add("modal-gray");    
    let modal = document.createElement("div");
    modal.id ="info";
    if (team==="red")
        modal.style = "background-color:#B22222";
    let blue = document.createElement("p");
    blue.id = "blueStats";
    let red = document.createElement("p");
    red.id = "redStats";
    let winner = document.createElement("p");
    winner.id = "winner";
    let button = document.createElement("button");
    let buttonText = document.createTextNode("Main Menu");
    button.appendChild(buttonText);
    button.classList.add("clickable");
    button.addEventListener("click",()=>window.location.href="/");
    modal.appendChild(blue);
    modal.appendChild(red);
    modal.appendChild(winner);

    if(result==="win"){
        let xhr = new XMLHttpRequest;
        xhr.open("GET","/2p/getstats/"+session);
        xhr.send();
        xhr.onload=()=>{
            if(xhr.status === 200) {
                let stats = JSON.parse(xhr.response);
                let blueText = document.createTextNode(`Blue - ${stats.blue.score} points and ${stats.blue.clicks} clicks`);
                let redText = document.createTextNode(`Red - ${stats.red.score} points and ${stats.red.clicks} clicks`); 
                document.getElementById("blueStats").appendChild(blueText);
                document.getElementById("redStats").appendChild(redText);
                let winnerText = "";
                if (stats.blue.score>stats.red.score)
                    winnerText = document.createTextNode(`Blue is the winner!`);
                else if(stats.blue.score===stats.red.score)
                    winnerText = document.createTextNode(`We have a draw!`);
                else
                    winnerText = document.createTextNode(`Red is the winner!`);
                document.getElementById("winner").appendChild(winnerText);
            }
        };
    }
    modal.appendChild(button);
    modalBckg.appendChild(modal);
    modalBckg.appendChild(modalGray);

    document.body.appendChild(modalBckg);
    
}