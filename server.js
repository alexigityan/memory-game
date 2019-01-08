const express = require("express");
const app = express();

app.set("view engine", "pug");
app.use(express.static("assets"));

const content = ["apple", "penguin", "ship", "crystal", "cactus", "butterfly", "umbrella", "teapot",
                    "fish", "moon", "mushroom", "peace", "infinity", "paw"];

function makeBlocks(content) {
    let blocks = Array(content.length*2);
    let indexes = [...blocks.keys()];
    content.forEach( (elem)=>{
        for(let i=0; i<2; i++) {
            if(indexes.length<=2) {
                blocks[indexes[0]] = elem;
                indexes.splice(0,1);
            } else {
                let randomIndex = Math.round(Math.random()*(indexes.length-1));
                blocks[indexes[randomIndex]] = elem;
                indexes.splice(randomIndex,1);
            }
        }
    });
    return blocks;
}



function setDestroyTimer(session) {
    setTimeout(()=>{
        if(sessions[session]) {
            delete sessions[session];
            console.log(`destroying session ${session}`);
        }
    },300000)
}

let sessions = {};

function makeSession() {
    let session = Math.round(Math.random()*10000).toString();
    return (!sessions[session]) ? session : makeSession();
}

app.get("/", (req, res)=>{
    let session = makeSession();
    console.log(`creating session ${session}`);
    sessions[session] = {};
    sessions[session].blocks = makeBlocks(content);
    res.render("index", {session:session, blocks:sessions[session].blocks});
    setDestroyTimer(session);
});

app.get("/:session/:id", (req, res)=>{
    if (sessions[req.params.session]) {
        res.set("Content-Type","text/plain");
        res.status(200);
        res.send(sessions[req.params.session].blocks[req.params.id]);
    } else {
        res.status(404);
    }
});

app.get("/:session/remove", (req,res)=>{
    if(sessions[req.params.session]) {
        delete sessions[req.params.session];
    }
});

app.listen(3000, ()=>console.log("listening on 3000"));