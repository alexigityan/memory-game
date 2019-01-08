Array.from(document.getElementsByClassName("block")).forEach(elem=>elem.addEventListener("click",openBlock));

const session = document.getElementById("session").getAttribute("session");
console.log(session);
let openBlocks = [];
let contents = [];
let pairedBlocks = [];

function progressGame() {
    if(openBlocks.length > 1) {
        if(contents[0]===contents[1]) {
            pairedBlocks.concat(openBlocks);
            openBlocks=[];
            contents=[];
        } else
            closeOpenBlocks(1500);
    }
}


function openBlock(evt) {
    if(openBlocks.length<2 && !openBlocks.includes(evt.target.id)) {
        let block = evt.target;   
        openBlocks.push(block.id);
        fetch("/"+session+"/"+block.id)
            .then((res)=>res.text())
            .then((text)=>{
                block.style = `background-image:url(/icons/${text}.png)`;
                contents.push(text);
                progressGame();
            });
    }
}

function closeOpenBlocks(timeout) {
    setTimeout( ()=>{
        openBlocks.forEach(id=>document.getElementById(id).style="");
        openBlocks=[];
        contents=[];
    },timeout);
}