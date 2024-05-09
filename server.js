const server = require('http').createServer();
const io = require('socket.io')(server);
var video = require('./video');
const session = require('./session');

//TODO create a session id system that allows for the main server to loose connection and reconnect and not loose progress on the video
let Session = new session.SessionManager([], 0, io);


function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}


io.on('connection', client => {
    console.log("Connection Made");
    console.log(client.id);

    //when a new client connects the client should call the start
    //message which will create a new session
    client.on("start", (bacc) => {
        client.emit("made session")
        var a = Session.createSession(client);
        //bacc();
    });

    //if a client already had an existing session it can resume it
    //by sending the message resume 
    client.on("resume", (id, bacc) => {
        let a = Session.mergeSession(id, client);
        if (a) {
            bacc('Y') //calls back yes
            console.log("Session was merged");
        } else {
            bacc('N') //calls back no
            console.log("Unable to merge session");
        }
    });


    //when the server recieves the message makeVideo it takes the video type
    //and it's paramiters in a object
    client.on('makeVideo', (id, videoType, videoOb, bacc) => {
        console.log("Making Video")
        Session.makeVideo(id, videoType, videoOb, bacc);

        /*if(videoType == "comments"){
            callbacc("yes");
            console.log(`Making type: ${videoType}`)
            var vid = new video.VideoMaker(videoType, callBacc)
            vid.scrapeReddit(subreddit, 10, 10);
            vid.makeImages();            
        }
        */
    });

    client.on('disconnect', () => {
        console.log("Manager Disconnected");
        //sets the session to be not active when socket is disconnected 
        Session.deactivateSession(client.id);
    });

    let callBacc = (c) => {
        io.emit("serverUpdate", c);
    }

});
server.listen(5001);

