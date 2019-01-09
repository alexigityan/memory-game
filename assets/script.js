Array.from(document.getElementsByClassName("block")).forEach(elem=>makeClickable(elem));

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
        pairedBlocks.concat(openBlocks);
        openBlocks=[];
        contents=[];
    }
}

function openBlock(evt) {
    if(openBlocks.length===2)
        closeOpenBlocks();
    if(openBlocks.length<2 && !openBlocks.includes(evt.target)) {
        let block = evt.target;
        removeClickable(block);   
        openBlocks.push(block);
        fetch("/"+session+"/"+block.id)
            .then((res)=>res.text())
            .then((text)=>{
                block.style = `background-image:url(/icons/${text}.png)`;
                contents.push(text);
                progressGame();
            });
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