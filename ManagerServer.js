//Creates a socket on localhost with port of 5001
//var socket = require('socket.io-client')('http://3.83.222.75:5001');
var socket = require('socket.io-client')('http://localhost:5001');


//Allows for server to take user input 
//this is for testing
//TODO make the manager server cool and good
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})


//global vars for this server
var sessionId = "";

/*

//takes user console inputs

*/

//creates a new session
function createSession(){
    socket.emit("start", (a) =>{
        console.log("Created session with id of " + a);
        sessionId = a;
    });
}

//merges to an old session
function mergeSession(){
    socket.emit("resume", sessionId, (a) => {
        if(a == "Y"){
            console.log("Merged with session: " + a);
        }else{
            console.log("Failed to merge with session: " + a);
        }
    });
}

function makeVideo(){
    let videoObject = {
        subreddit: "askreddit",
        harshness: 3,
        numberOfPosts: 5,
        resolution: [1920, 1080]
    }

    socket.emit("makeVideo", sessionId, "comment", videoObject, (a) => {
        console.log(a);
    });
}

//when a user/server connects to the server through sockets
socket.on('connect', function(){
    console.log("Connected with server");
    if(sessionId == ""){
        createSession();
    }else{
        mergeSession(); 
    }
});

//when a user/server disconects
socket.on('disconnect', function(){
    console.log("Disconnected from server");
});

//when the server gets a video update
socket.on('serverUpdate', (a, c) => {
    console.log(a);
});



var recursiveAsyncMenu = () => {
    readline.question(`\nWhat do you want to do?\nC: create new session\nM: merge with session\nV: make a video\nS: get status\n\n`, (a) => {
        if(a == "C"){
            createSession();
        }
        if(a == "M"){
    
        }
        if(a == "V"){
            console.log("making video   ")
            makeVideo();
        }
        if(a == "S"){

        }
        readline.close()
        recursiveAsyncMenu();
    });
}

recursiveAsyncMenu();


/*
//
//
//Used for getting the status of the video server
//
//when the server recieves the 'getStatus' message

function bar(timeout = 10000) {
    return new Promise((resolve, reject) => {
        socket.emit('status', 'test', function(response) {
            console.log("client got ack response", response);
            resolve(response);
        });
    });
}
var status = ""
let getStatus = bar().then(value => {
    var c = "";
    status = String(value);
});

function GetStatus(){
    getStatus;
    return status;
}






function MakeVideo(videoType, subreddit, harshness, max_length){
    socket.emit("makeVideo", videoType, subreddit, harshness, max_length, function(response){
        if(response == "yes"){
            console.log("making video with type: " + videoType);
        }else{
            console.log("sever said no :(");
        }
        
    });
}

var sserver = () => {
        
    
    console.log("yeet " + GetStatus());
    
    MakeVideo("comments", "askreddit", 1000, 10);
    
}





*/




