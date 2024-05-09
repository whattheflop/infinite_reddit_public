//Scrapes posts from reddit
var spawn = require("child_process").spawn;


var amount = 20;




class RedditScraper{
    constructor(contentType, subreddit){
        this.contentType;
        this.subreddit;
    }

    //method for scraping comments.
    //the first post will always be op
    CommentScraper(subreddit,amount=10, harshenss=10, filter){
        console.log("----starting python script----")
        console.log(`---- sub = ${subreddit}, amount = ${amount}, filter = ${filter}, harshness = ${harshenss} ----`)

        //starts the python file
        console.log("spawning python")
        var pythonProcess = spawn('py' , ["./reddit.py", subreddit, amount, filter, harshenss]);
        
        //dab is a variable that is null until the python script finishes
        var dab = "null"

        //When the python script this event listner catches all stdout (console output)
        pythonProcess.stdout.on('data', (data) => {
            var out = data.toString();
            if(out.includes("----====CONTENT====----")){
                console.log("found content")
                dab = out;
            }else{
                console.log("out");
                console.log(out);
            }
        });


        //forces node to wait until the python script finishes
        while(dab == "null"){
            require('deasync').sleep(100);
        }

        //dab contains the entire console log of the python script
        //so we only take whats after ----====content====----
        //each post is separted by a [[END]]
        //TODO make python script remove any posts that contain [[END]]
        
        //gets the id of the reddit post being used
        let postid = dab.match(/\[\[DAB\]\].*?\[\[DAB\]\]/);

        var posts = dab.split('----====CONTENT====----')[1].split('[[END]]');
        console.log(`There are ${posts.length} posts`);

        //convert the returned strings to objects we can use
        var poseObs = []
        for (var i = 0; i < posts.length; i++){
            try{
                poseObs.push(JSON.parse(posts[i]));
            }catch(e){
                console.log("not an object");
            }
        }
        console.log("collected comments");

        return {id: postid, comments: poseObs};
    }
}


module.exports.Scraper = RedditScraper;