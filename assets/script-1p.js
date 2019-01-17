const blocks = Array.from(document.getElementsByClassName("block"));
blocks.forEach(elem=>makeClickable(elem));

const session = document.getElementById("session").getAttribute("session");
let openBlocks = [];
let contents = [];
let pairedBlocks = [];

function makeClickable(block) {
    block.addEventListener("click",openBlock);
    block.classList.add("clickable");
}

function removeClickable(block) {
    block.removeEventListener("click",openBlock);
    block.classList.remove("clickable");
}

function progressGame() {
    if(openBlocks.length > 1 && contents[0]===contents[1]) {
        pairedBlocks = pairedBlocks.concat(...openBlocks);
        openBlocks=[];
        contents=[];
    }
    if(pairedBlocks.length === blocks.length)
        endGame("win");
}

function openBlock(evt) {
    if(openBlocks.length===2)
        closeOpenBlocks();
    if(openBlocks.length<2 && !openBlocks.includes(evt.target)) {
        let block = evt.target;
        removeClickable(block);   
        openBlocks.push(block);
        let xhr = new XMLHttpRequest();
        xhr.onload=()=>{
            if(xhr.status===200) {
                block.style = `background-image:url(/icons/${xhr.response}.png)`;
                contents.push(xhr.response);
                progressGame();
            } else {
                endGame()
            }
        };
        xhr.open("get", "/1p/"+session+"/"+block.id);
        xhr.send();
    }
}

function closeOpenBlocks() {
    openBlocks.forEach(block=>{
        block.style="";
        makeClickable(block);
    });
    openBlocks=[];
    contents=[];
}

function startNewGame() {
    let xhr = new XMLHttpRequest;
    xhr.onload=()=>location.reload();
    xhr.open("GET","/1p/remove/"+session);
    xhr.send();
}

function endGame(result) {
    let modalBckg = document.createElement("div");
    modalBckg.classList.add("modal-background");
    let modalGray = document.createElement("div");
    modalGray.classList.add("modal-gray");    
    let modal = document.createElement("div");
    modal.id ="info";
    let p = document.createElement("p");
    let button = document.createElement("button");
    let text = (result==="win") ? document.createTextNode("You've won!") : document.createTextNode("Your time's up!") ;
    p.appendChild(text);
    let buttonText = document.createTextNode("Main Menu");
    button.appendChild(buttonText);
    button.classList.add("clickable");
    button.addEventListener("click",()=>window.location.href="/");
    modal.appendChild(p);
    if(result==="win"){
        let clicks = document.createElement("p");
        clicks.id="clicks";
        modal.appendChild(clicks);
        let xhr = new XMLHttpRequest;
        xhr.onload=()=>{
            if(xhr.status === 200) {
                let text = document.createTextNode(`Took you ${xhr.response} clicks`);
                document.getElementById("clicks").appendChild(text);
            }
        };
        xhr.open("GET","/1p/clicks/"+session);
        xhr.send();

    }
    modal.appendChild(button);
    modalBckg.appendChild(modal);
    modalBckg.appendChild(modalGray);

    document.body.appendChild(modalBckg);
    
}