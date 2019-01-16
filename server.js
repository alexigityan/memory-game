const express = require("express");
const EventEmitter = require("events");
const app = express();

app.set("view engine", "pug");
app.use(express.static("assets"));


const emitter = new EventEmitter();
const content = ["0", "1", "2", "3", "4", "5", "6", "7",
                    "8", "9", "10", "11", "12", "13", "14"];

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

function setDestroyTimer(session, minutes) {
    setTimeout(()=>{
        if(sessions[session]) {
            delete sessions[session];
            console.log(`destroying session ${session} on time-out`);
        }
    },minutes*60000)
}

let sessions = {};

function makeSession() {
    let session = Math.round(Math.random()*1000).toString();
    return (!sessions[session]) ? session : makeSession();
}

app.get("/", (req, res)=>{
    res.render("menu");
});

app.get("/1p", (req, res)=>{
    let session = makeSession();
    console.log(`creating 1p session ${session}`);
    sessions[session] = {};
    sessions[session].clicks = 0;
    sessions[session].blocks = makeBlocks(content);
    res.render("game", {session:session, blocks:sessions[session].blocks});
    setDestroyTimer(session, 5);
});

app.get("/1p/remove/:session", (req,res)=>{
    if(sessions[req.params.session]) {
        setDestroyTimer(req.params.session, 0);
        res.end();
    } else {
        res.end();
    }
});

app.get("/1p/clicks/:session", (req,res)=>{
    if(sessions[req.params.session]) {
        res.set("Content-Type","text/plain");
        res.status(200);
        res.send(sessions[req.params.session].clicks.toString());
    } else {
        res.end();
    }   
});

app.get("/1p/:session/:id", (req, res)=>{
    if (sessions[req.params.session]) {
        sessions[req.params.session].clicks++;
        res.set("Content-Type","text/plain");
        res.status(200);
        res.send(sessions[req.params.session].blocks[req.params.id]);
    } else {
        res.status(404);
        res.end();
    }
});

function makePlayer(session) {
    let player = Math.round(Math.random()*1000).toString();
    return (!sessions[session][player]) ? player : makePlayer(session);   
}

class Player {
    constructor(team) {
        this.team = team;
        this.openBlocks = [];
        this.contents = [];
        this.clicks = 0;
        this.score = 0;

        this.progressGame = this.progressGame.bind(this);
        this.openBlock = this.openBlock.bind(this);
        this.closeBlocks = this.closeBlocks.bind(this);
    }

    progressGame(session) {
        if(this.openBlocks.length > 1 && this.contents[0]===this.contents[1]) {
            this.score++;
            sessions[session].pairedBlocks++;
            this.openBlocks=[];
            this.contents=[];
        }
        if(sessions[session].pairedBlocks===sessions[session].blocks.length/2)
            emitter.emit(session+"win");
    }

    openBlock(session, blockId, iconId) {
        this.clicks++;
        if(this.openBlocks.length===2) {
            this.closeBlocks(session);
        } 
        if(this.openBlocks.length<2) {
            this.openBlocks.push(blockId); 
            this.contents.push(iconId);
            if(blockId.toString().length<2)
                blockId="0"+blockId;
            if(iconId.toString().length<2)
                iconId="0"+iconId;
            let color = (this.team==="blue") ? "b" : "r";
            let eventText= "o"+blockId+iconId+color;
            emitter.emit(session+"openblock", eventText);
            this.progressGame(session);
        }
    }

    closeBlocks(session) {
        this.openBlocks.forEach((elem)=>{
            if (elem.toString().length<2)
                elem = "0"+elem;
            emitter.emit(session+"closeblock", "c"+elem);
        });
        this.openBlocks = [];
        this.contents = [];
    }
}


app.get("/2p/start", (req, res)=>{
    let session = makeSession();
    console.log(`creating 2p session ${session}`);
    sessions[session] = {};
    let player = makePlayer(session);
    sessions[session][player] = new Player("blue");
    sessions[session].blocks = makeBlocks(content);
    sessions[session].ready = 0;
    sessions[session].pairedBlocks = 0;
    res.render("game", {session:session, player:player, blocks:sessions[session].blocks, team:sessions[session][player].team});
    setDestroyTimer(session,10);
});

app.get("/2p/join/:session", (req, res)=>{
    let session = req.params.session;
    if(sessions[session]) {
        console.log(`joining 2p session ${session}`);
        let player = makePlayer(session);
        sessions[session][player] = new Player("red");
        res.render("game", {session:session, player:player, blocks:sessions[session].blocks, team:sessions[session][player].team});
        emitter.emit(session+"joined");    
    }
});

app.get("/2p/ready/:session", (req, res)=>{
    let session = req.params.session;
    if(sessions[session]) {
        sessions[session].ready++;
        if(sessions[session].ready===2)
            emitter.emit(session+"start");
        res.status(200);
        res.end();
    }
});

app.get("/2p/openblock/:session/:player/:blockId", (req, res)=>{
    let session = req.params.session;
    let player = req.params.player;
    let blockId = req.params.blockId;
    if(sessions[session]) {
        let iconId = sessions[session].blocks[blockId];
        sessions[session][player].openBlock(session,blockId,iconId);
        res.status(200);
        res.end();
    }
});      

app.get("/2p/getstats/:session/", (req, res)=>{
    let session = req.params.session;
    if(sessions[session]) {
        let stats = {};
        for (let player in sessions[session]) {
            if (sessions[session][player].team === "blue") {
                stats.blue = {};
                stats.blue.score = sessions[session][player].score;
                stats.blue.clicks = sessions[session][player].clicks;
            } else if (sessions[session][player].team === "red") {
                stats.red = {};
                stats.red.score = sessions[session][player].score;
                stats.red.clicks = sessions[session][player].clicks;                
            }
        }
        res.status(200);
        res.send(stats);
    }
});      

app.get("/2p/live/:session", (req,res)=>{
    let session = req.params.session;
    res.writeHead(200,{
        "Content-Type":"text/event-stream",
        "Connection":"keep-alive",
        "Cache-Control": "no-cache"
    });
    emitter.on(session+"joined",()=>res.write("data:j\n\n"));
    emitter.on(session+"start", () =>res.write("data:s\n\n"));
    emitter.on(session+"openblock", (eventText) =>{
        res.write("data:"+eventText+"\n\n");
    });
    emitter.on(session+"closeblock",(eventText) => {
        res.write("data:"+eventText+"\n\n");
    });
    emitter.on(session+"win",()=>{
        res.write("data:w\n\n");
    });
});

app.listen(3000, ()=>console.log("listening on 3000"));