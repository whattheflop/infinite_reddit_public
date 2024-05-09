//Make videos from reddit
var image = require('./image');
var reddit = require('./reddit');
var { Audio } = require('./audio');
var ff = require('./ff');

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

//This is going to be a dynamic class that is able to create videos from scratch
class VideoMaker {
    constructor(videoType, callback, videoId, logg = true) {
        if (logg) { console.log(`making video of type: ${videoType}`) }
        this.videoType = videoType;
        this.messager = callback.sendMessage.bind(callback);
        this.commentPosts = {};
        this.videoId = videoId;
        this.audio = new Audio('mlg', videoId);
    }


    imageAudioVideo(image, audio) {

    }


    makeAudio() {
        var audioFiles = [];

        for (let i = 0; i < this.commentPosts.length; i++) {
            //gets easy refrence to audio class
            let a = this.audio;

            //splits text by new paragraphs
            let t = this.commentPosts[i].content.split('\n\n');

            //defines the path to save audio files
            let path = `./temp/${this.videoId}/`

            //let postName = (i < 10 ? '0' : '') + i;
            let postName = pad(i, 3);

            for (let x = 0; x < t.length; x++) {

                //let para = (x < 10 ? '0' : '') + x;
                let para = pad(x, 2);

                let fileName = `${postName}_${para}.mp3`;

                let url = a.getAudioUrl(t[x]);

                //console.log('url: ' + url);
                let b = a.downloadAudio(url, fileName, path);
                audioFiles.push(b);

            }

        }
        return (audioFiles);

    }

    //to be refactored when other video types are implemented
    scrapeReddit(subreddit = "askreddit", harshness = 10, amount = 10) {
        console.log('scraping reddit')

        //Sends a server update that this server is currently getting posts and comments
        this.messager("serverUpdate", `Getting posts and comments`);


        if (this.videoType == "comment") {
            this.scraper = new reddit.Scraper("text");
            let a = this.scraper.CommentScraper(subreddit, amount, harshness, "text");
            this.commentPosts = a.comments;
            this.id = a.id;
            this.messager("serverUpdate", `Got ${this.commentPosts.length}`);
            return { id: this.id, comments: this.commentPosts };
        }
    }

    //make images
    makeImages(x, y) {

        //this.io("Making images");
        //make images for all posts
        //each array of images is stored in it's own folder.
        //it's important to maintain the order of the posts
        //the folders are named by the order of the poster
        let imageFiles = [];

        let numPost = this.commentPosts.length;
        let commentImages = [];
        let postId = 0;


        this.messager("serverUpdate", `Making ${numPost} images`)

        //loops through all posts scraped
        for (let i = 0; i < numPost; i++) {
            //makes a new image object with dimensions and theme
            let im = new image.CommentImage(x, y, 'dark', this.commentPosts[i]);
            //creates the output file folder name
            let postIdString = pad(postId, 3);
            //creates and saves images to disk while returning array of file names
            let ii = im.makeImage(postIdString, this.videoId);
            let images = ii[0];
            //pushes object to commentImages array
            commentImages.push(
                {
                    i: images,
                    id: postIdString,
                    text: this.commentPosts[i]
                }
            );
            postId++;

            //getting and storing absolute file paths
            let ifiles = ii[1];
            for (let x = 0; x < ifiles.length; x++) {
                imageFiles.push(ifiles[x]);
            }

        }
        //logs the compleation of the images
        this.messager("serverUpdate", `Finished making all images`);

        return imageFiles;


    }
}


module.exports.VideoMaker = VideoMaker;




