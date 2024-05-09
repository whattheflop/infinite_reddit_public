//var ffmpeg = require('fluent-ffmpeg');


const fs = require('fs');


class RenderScheduler{
    constructor(){
        this.ff = new FF();
        this.queue = [];
        this.running = false;
    }

    requestVideo(vType, videoObject){
        console.log(`video requested`)
        let prom = new Promise((res, rej) => {
            let videoRequest = {};
            switch(vType){
                case 'audioPlusImage':
                    videoRequest = {
                        vType: vType,
                        fileName: videoObject.fileName,
                        path: videoObject.path,
                        audio: videoObject.audio,
                        image: videoObject.image,
                        prom: res //saves the resolve of the promise to an object
                    }
                    this.queue.push(videoRequest);
                    break;
                case 'combine':
                    videoRequest = {
                        vType: vType,
                        fileName: videoObject.fileName,
                        path: videoObject.path,
                        videos: videoObject.videos,
                        prom: res
                    }
                    this.queue.push(videoRequest);
                    break;

            }
            //makes it so that if there is no video being rendered the render starts
            if(this.running == false){
                this.takeOrder();
            }
        });
        return prom;
    }

    //ayy recurrsion
    takeOrder(){ //dab
        if(this.queue.length == 0) {
            this.running = false;
            return null;
        }
        this.running = true;
        let a = this.queue[0];
        
        console.log('Rendering ' + a.vType + ' video');
        let vid;
        switch(a.vType){
            case 'audioPlusImage':
                //calls an ffmpeg process
                vid = this.ff.audioPlusImage(a.fileName, a.path, a.audio, a.image);
                //when the video finishes rendering
                vid.then(() => {
                    a.prom(a.path + a.fileName + '.mp4');
                    this.queue.shift(); //removes the first element of the queue
                    this.takeOrder();
                });
                break;
            case 'combine':
                vid = this.ff.combineVideos(a.fileName, a.path, a.videos);

                vid.then(() => {
                    a.prom(a.path + a.fileName + '.mp4');
                    this.queue.shift();
                    this.takeOrder();
                })
                break;
        }
        
    }

}

class FF{
    construstor(){
        
    }
    


    audioPlusImage(fileName, path, audio, image){

        //let codec = 'libx264'
        let codec = 'h264_nvenc'
        //console.log(`making a video with image: ${image} and audio: ${audio}`);
        let file = path+fileName+'.mp4';
        fs.writeFileSync(file);
        //Bro wtf is this command
        let args = [
            '-loop',
            '1',
            '-r',
            "29.97",
            '-i',
            `${image}`,
            '-i',
            `${audio}`,
            '-pix_fmt',
            'yuv420p',
            '-c:v',
            `${codec}`,
            '-c:a',
            'copy',
            '-shortest',
            '-y',
            file
        ];
        var s = "ffmpeg ";
        for(let i = 0; i < args.length; i++){
            s += args[i] + " ";
        }
        //console.log(s);
        
        let prom = new Promise((res, rej) =>{
            let process = spawn('ffmpeg', args);
            let err = '';
            //process.stderr.on('data', function(c) { err += c; }).on('end', function() { console.log('stderr:', err); });

            process.on('exit', (data) => {
                //Sconsole.log('finished');
                res('finished');
            });
        });
        
        return prom;

        
    }

    convertAudio(fileName, path, audio){
        let file = path+fileName+'.m4a';
        fs.writeFileSync(file);
        let process = spawn('ffmpeg', [
            '-v',
            'warning',
            '-i',
            `${audio}`,
            '-c:a',
            'aac',
            '-y',
            `${file}`
        ])
    }

    combineVideos(fileName, path, videos){

        let videoFile = "./temp/video.txt";
        let videoList = '';
        for(let i = 0; i < videos.length; i++){
            let v = videos[i].replace('./temp/', '');
            
            videoList += `file '${v}'\n`
        }
        fs.writeFileSync(videoFile, videoList);


        let file = path+fileName+'.mp4';
        fs.writeFileSync(file);

        var args = [
            '-y',
            '-v',
            'warning',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            `${videoFile}`,
            '-c:v',
            'copy',
            `${file}`
        ];
        var s = "ffmpeg ";
        for(let i = 0; i < args.length; i++){
            s += args[i] + " ";
        }
        console.log(s);

        //makes a new promise that the video will render
        let prom = new Promise((res) => {

            let process = spawn('ffmpeg', args);
            var err = '';
            process.stderr.on('data', function(c) { err += c; }).on('end', function() { console.log('stderr:', err); });

            process.on('exit', (data) => {
                //TODO log and reject if error
                res('finished');
            });

        })

        //returns a promise that the video will finish
        return prom;         
    }
}   

exports.RenderScheduler = RenderScheduler;
exports.FF = FF;
