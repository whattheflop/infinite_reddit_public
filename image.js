//makes images from posts
const canvas = require('canvas');
var fs = require("fs");
const {registerFont} = require('canvas')
var draw = require('./drawTool');

//
//Returns a file path to a .png
module.exports.makeFakeCommentPost = function(post){

}


class iimage{
    constructor(x, y, theme='dark'){
        this.resolution = [x, y];
        this.x = x;
        this.y = y;
        this.theme = theme;
        this.scale = 1920 / x; //the defualt scale for the reddit images is 1920 of the x axis
    }
    //makes an image and writes it to disk 
    makeImage(){
            this.canvas = canvas.createCanvas(this.x, this.y);
            this.ctx = this.canvas.getContext('2d');
            registerFont('Verdana.ttf', { family: 'Verdana' })
            //registerFont('Verdana.ttf', {'family': 'normal'});
            this.drawtool = new draw.dt(this.ctx, this.scale);
            if(this.theme == 'dark'){
                this.drawtool.drawRect("#09041c", 0, 0, this.x, this.y);
            }
    }

    setPath(path){
        this.path = path;
    }

    //Saves the canvas as png
    save(name, path=this.path){
        var buf = this.canvas.toBuffer();
        //TODO change as needed
        fs.writeFileSync(`${path}${name}.png`, buf);
    }
}


class CommentImage extends iimage{
    constructor(x, y, theme, post = undefined){
        super(x, y, theme);
        this.commentPost = post;
    }    
    
    //returns the file names for the images created
    makeImage(fileName, idfolder,post = this.commentPost){
        //array of file names
        let files = [];
        let imageFiles = [];

        var r = this.resolution; //just used as shorthand for this.resolution
        var s = this.scale; //used as shorthand for this.scale

        super.makeImage(); //runs the code in the base iimage class
        

        
        this.ctx.font = `${50 * s}px Verdana` //sets the font

        //draws the op box
        var margin = 100; //margin for the box
        var shadow_depth = 50;//depth of the shadow

        //draws shadow;
        //04020d
        var pos1 = [(margin + shadow_depth) * s, (margin + shadow_depth) * s] //Multiplies each element by 0.1 adding the shadow
        var pos2 = [r[0] - (margin - shadow_depth) * s, r[1] - (margin - shadow_depth) * s] //same but diffrent minusing the shadow
        this.drawtool.drawRect("#1a1824", pos1, pos2);

        //draws box;
        var pos1 = [margin * s, margin * s] //Multiplies each element by 0.1
        var pos2 = [r[0] - margin * s, r[1] - margin * s] //same but diffrent
        this.drawtool.drawRect("#23202e", pos1, pos2); // draws the main box


        //Draws content text
        var text_width = r[0] * 0.75;
        var text_height = r[1] - margin * s - (margin * s) - 100 * s ;
        var text_margin = 200;
        var text_position = [pos1[0] + (text_margin * s), pos1[1]];

        this.ctx.fillStyle = 'white';
        //var postObject = this.drawtool.drawTextAtCenter(post.content, text_width, text_height, text_position);
        var postObject = this.drawtool.drawPar(post.content, text_width, text_height, text_position)
        let postTextFont = this.ctx.font;

        var arrowMargin = 80;

        //draw the updoot arrows
        var shadow_depth = 14;

        var updootPos = [r[0] * 0.1 + shadow_depth * s, r[1] / 2 - arrowMargin * s + shadow_depth * s];
        this.drawtool.drawArrows(updootPos, true, "#17151f")

        var updootPos = [r[0] * 0.1, r[1] / 2 - arrowMargin * s];
        this.drawtool.drawArrows(updootPos, true, "white");

        //draw downdoot
        var downdootPos = [r[0] * 0.1 + shadow_depth * s, r[1] / 2 + arrowMargin * s + shadow_depth * s];
        this.drawtool.drawArrows(downdootPos, false, "#17151f")

        var downdootPos = [r[0] * 0.1, r[1] / 2 + arrowMargin * s];
        this.drawtool.drawArrows(downdootPos, false, "white")

        
        //draws updoot text between arrows
        this.ctx.font = `${36 * s}px Verdana` //sets the font
        var upvotePos = [margin * s, r[1] / 2 ];
        this.drawtool.drawTextAtCenter(post.updoots, 300 * s, 2 *  arrowMargin * s, [margin * s, r[1] / 2 - arrowMargin * s - 20 * s], true)
        

        //draws submitted by user text
        this.ctx.font = `${30 * s}px Verdana` //sets the font

        var submitPos = [postObject.x, postObject.y + postObject.h + 50 * s];
        var hours = 8
        var submitText = `submitted ${hours} hours ago by `;
        this.ctx.fillText(submitText, submitPos[0], submitPos[1]);

        var submitTextObject = this.ctx.measureText(submitText);
   

        this.ctx.fillStyle = "cyan";
        this.ctx.fillText(post.op, submitPos[0] + submitTextObject.width, submitPos[1])

        //Draws the links
        var linksText = `permalink  source  embed  save  save-RES report  give  reward  reply  hide  child  comments`;
        var a = this.ctx.measureText("M");
        var textHeight = a.actualBoundingBoxAscent + a.actualBoundingBoxDescent;
        var linksPos = [submitPos[0], submitPos[1] + textHeight * 2];
        this.ctx.fillStyle = "white";
        this.ctx.fillText(linksText, linksPos[0], linksPos[1]);

        
        //make file directory
        //all images are to be saved in the temp folder inside of a folder with their name
        //dir = ./temp/{filename}/01.png
        if(fs.existsSync(`./temp/${idfolder}`) || fs.mkdirSync(`./temp/${idfolder}`)) {

        }
        //console.log("memes");

        if(fs.existsSync(`./temp/${idfolder}/${fileName}`) || fs.mkdirSync(`./temp/${idfolder}/${fileName}`)){
            //console.log("made it ")
        }
                

        //this is where the fun begins
        //this is the black out for paragraphing
        var pars = postObject.t.split("\n\n");
        let p = pars.length;
        let img = 0;
        for(let a = 0; a < p; a++){
            //creates a new image canvas
            let cav = require('canvas'); 
            let new_image = cav.createCanvas(this.x, this.y);
            let new_image_ctx = new_image.getContext('2d');
            new_image_ctx.drawImage(this.canvas, 0, 0);
            new_image_ctx.font = postTextFont;

            //makes it so that it does not black out all paragraphs on the first loop
            if(img != 0){
                //define a draw tool for new_image_ctx 
                let dt = new draw.dt(new_image_ctx, s); 

                //loops through and creates segments of the post with the last few
                //paragraphs exempt from the rT (running text).
                let rT = "";
                for(let c = 0; c < pars.length - img; c++){
                    rT += pars[c] + '\n\n';
                }
                
                //finds the size of the rT minus the size of a new line 
                //honestly i have no idea why i needed to minus new line height
                //maybe my maths is just shit, but i'm pretty sure the MestureText()
                //function is cooked.
                let rH = dt.properSize(rT).h - dt.properSize("\n").h;
                //console.log(rH, rT)

                //draws a rect with poses 
                let rectPos = [
                    postObject.x - 10 * s,
                    postObject.y + rH
                ]

                //the rectangle dimensions
                let rectDim = [
                    postObject.w + 20 * s,
                    dt.properSize(pars[p - img]).h + dt.properSize("\n").h + 20 * s
                ];

                //draws the rectangle with the below color
                new_image_ctx.fillStyle = "#080624";
                new_image_ctx.fillRect(
                    rectPos[0],
                    rectPos[1],
                    rectDim[0],
                    rectDim[1]
                    )
            }
            
            //save image
            let buf = new_image.toBuffer();
            //TODO change as needed
            
            //reverse ordering
            let num = p - img - 1;
            //console.log(`saving image ${num}`);

            //saves the file to temp folder
            files.push(`${(num < 10 ? '0' : '') + num}`);
            imageFiles.push(`./temp/${idfolder}/${fileName}/${(num < 10 ? '0' : '') + num}.png`);
            fs.writeFileSync(`./temp/${idfolder}/${fileName}/${(num < 10 ? '0' : '') + num}.png`, buf);
            this.canvas = new_image

            img += 1;
        }

        return [files, imageFiles];
    }
}

module.exports.iimage = iimage;
module.exports.CommentImage = CommentImage;