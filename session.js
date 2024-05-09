
const {VideoMaker} = require("./video");
const ff = require('./ff');

class VideoSession {
    //init
    constructor(id, client, io, RS){
        this.id = id;
        this.socket = client; //is just the clients socket
        this.iwant = "client";
        this.clientId = client.id;
        this.io = io; //io is the actual socket
        this.active = true;
        this.RS = RS;
        
        //creates a new id depending on the time 
        let videoID = new Date().getTime().toString(36).substring(0);
        
        this.videoID = videoID;
    }

    //returns the client socket
    get client(){
        return this.socket;
    }

    //sets the client socket
    set client(client){
        this.socket = client;
        this.clientId = client.id;
    }


    //sends a message to this socket's client
    //supports up to 3 args
    sendMessage(message, a, b ,c) {
        this.io.emit(message, a, b, c);
    }
    
    //method that creates a video in this session
    makeVideo(videoType = "comment", dataOb, bacc) {
        //Sorts videoTypes
        switch(videoType){
            case "comment":
                //Check that dataOb has all nessesary pieces 
                if(!this.isVaild(dataOb, videoType)){
                    console.log("object was no vaild");
                    return false;
                }
                //logs when we pass all checks
                //logs to requesting server
                this.sendMessage("serverUpdate", "Making Vids");
                //logs to this server
                console.log("Making Video");

                //creates a new videoMaker from video
                let vid = new VideoMaker(videoType,this, this.videoID);

                //scrapes reddit for comments
                //postComments is an array of scraped posts 
                let scrape = vid.scrapeReddit(dataOb.subreddit, dataOb.harshness, dataOb.numberOfPosts);
                let postComments = scrape.comments;
                let id = scrape.comments;
                
                //creates images
                let images = vid.makeImages(dataOb.resolution[0], dataOb.resolution[1]);   
                
                //creates audio
                let audio = vid.makeAudio();



                let RS = this.RS;
                
                let vids = []
                
                let orderedVideoList = Array(audio.length);

                for(let x = 0; x < audio.length; x++){
                    audio[x].then((res, rej) => {
                        let f = res.match(/\/[0-9_]*\./)[0].split('_');
                        f[0] = f[0].substring(1);
                        f[1] = f[1].slice(0, -1);

                        //the propitiesisi for the video
                        let videoObject = {
                            fileName: `${f[0]}_${f[1]}`,
                            path: `./temp/${this.videoID}/`,
                            audio: res,
                            image: `./temp/${this.videoID}/${f[0]}/${f[1]}.png`
                        }

                        //to make a request to the RS you need a video type and a videoObject with all the needed video props
                        let a = RS.requestVideo('audioPlusImage', videoObject);
                        a.then(() => {
                            console.log('video finished');
                        })

                        //adds promise to list of video promises
                        vids.push(a);

                        orderedVideoList[x] = `./temp/${this.videoID}/${f[0]}_${f[1]}.mp4`
                    });
                }

                Promise.all(audio).then(() => {
                    console.log("ALL AUDIO IS COMPLETE");
                    
                    Promise.all(vids).then(() => {
                        console.log("ALL VIDEOS ARE DONE");

                        let videos = [];

                        let videoObject = {
                            fileName: 'combinedVideo',
                            path: `./temp/${this.videoID}/`,
                            videos: orderedVideoList
                        }

                        let a = RS.requestVideo('combine', videoObject);

                    });
                });
                    
                
                

                /* this is the old way the created all ffmpeg processes at once which causes the server to hang
                let inst = new ff.FF();

                let vids = [];
                let ffmpegProcesses = [];
                for(let x = 0; x < audio.length; x++){
                    audio[x].then((res, rej) => {
                        let f = res.match(/\/[0-9_]*\./)[0].split('_');
                        f[0] = f[0].substring(1);
                        f[1] = f[1].slice(0, -1);
                        let audio = inst.audioPlusImage(`${f[0]}_${f[1]}`, `./temp/${this.videoID}/`, res, `./temp/${this.videoID}/${f[0]}/${f[1]}.png`);
                        ffmpegProcesses.push(audio);
                    });
                }

                Promise.all(audio).then(() => {
                    console.log('got all audio');
                });

                Promise.all(ffmpegProcesses).then(() => {
                    console.log('all ffmpeg processes are done');
                });

               */

                
                




                break;

            case "image":
                //code
                break;

            case "video":
                //code
                break;

            default:
                console.log(`${videoType} is not a vaild video type`);
                this.videoType = "null";
                return false;
        }
    }

    isVaild(ob, type){
        switch(type){
            case "comment":
                if(
                    this.has(ob, "subreddit") &&
                    this.has(ob, "harshness") &&
                    this.has(ob, "numberOfPosts") &&
                    //has(ob, "maxLength") &&
                    //has(ob, "length") &&
                    this.has(ob, "resolution")
                ){
                    return true;
                }else{
                    return false;
                }
        }
    }

    //check for if object has key
    has(ob, key){
        return ob ? hasOwnProperty.call(ob, key) : false;
    }
};


//This is a manager for all socker sessions
//it stores and manages all sockets and has 
//the ability to remove and merge socket sessions
//it also stores the RenderScheduler
class SessionManager{

    //init
    constructor(sessionArray = [], startingId = 0, io){
        this.io = io;
        this.sessionArray = sessionArray;
        this.startingId = startingId;
        this.RS = new ff.RenderScheduler(); //creates a new RenderScheduler
    }
    
    //gets and returns a session by id
    //returns null if session was not found
    getSession(id){
        console.log(`finding session ${id} of ${this.sessionArray.length}`);
        for(let i = 0; i < this.sessionArray.length; i++){      
            let a = this.sessionArray[i];
            if(a.id == id){
                return a;
            }
        }
        return null;
    }

    //returns id of session given client id
    //returns null if there is no session with client id
    getSessionByClient(clientId){
        for(let i = 0; i < this.sessionArray; i++){
            let a = this.sessionArray[i];
            if(a.clientId = clientId){
                return a.id;
            }
        }
        return null;
    }
    
    //creates a new session
    createSession(client){
        //creates a new videoSession class object
        let s = new VideoSession(this.startingId, client, this.io, this.RS);
        //adds object to list of sessions
        this.sessionArray.push(s);
        //increments the starting id by one for the next session that created
        this.startingId++;
        //returns the id of the session created
        return s.id;
    }

    //merges a new session
    mergeSession(id, client){
        //finds the session by id
        let session = this.getSession(id);
        if(session != null){
            //sets the sessions client to be the new client
            session.client = client;
            session.active = true;
            //returns true if merge was succesful
            return true;    
        }else{
            //returns false if merge failed
            return false;
        }
    }

    //set session active state from clientId
    deactivateSession(clientId){
        for(let i = 0; i < this.sessionArray; i++){
            let a = this.sessionArray[i];
            if(a.clientId = clientId){
                a.active = false;
            }
        }
    }

    //runnings the make video method in the session with a certain id
    makeVideo(id, videoType, videoOb, bacc){
        let a = this.getSession(id);
        a.makeVideo(videoType, videoOb, bacc);
    }
}


//exports the SessionManager class
module.exports.SessionManager = SessionManager;