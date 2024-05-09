//Draws a rectangle on the canvas with positions
class DrawTool{
    constructor(ctx, s){
        this.ctx = ctx;
        this.s = s;
    }

    //draws a rectangle with positions
    //only works if x1 and y1 are in the top left corner
    //or if you input two [x,y] arrays
    drawRect(color, x1, y1, x2, y2){
        if(x1.length == 2){
            //console.log("type 2 rects")
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x1[0], x1[1], y1[0] - x1[0], y1[1] - x1[1]);
        }else{
            //console.log("type 1 rects")
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
        
    }

    //gets the text size
    textSize(text){
        let s = this.ctx.measureText(text);
        let a = this.ctx.measureText("y");
        let h = a.actualBoundingBoxAscent + a.actualBoundingBoxDescent;
        let x = text.split("\n").length;
        //console.log(x-1);
        //console.log(h);
        return {s:s.width, h: h * x};
    }

    properSize(text){
        let s = this.ctx.measureText(text);
        let h = s.actualBoundingBoxAscent + s.actualBoundingBoxDescent;
        return {w:s.width, h: h}
    }

    getFont(){
        let f = this.ctx.font;
        let font_split = f.split(' ');
        let size = Number(font_split[0].slice(0, -2));
        return [size, font_split[1]];
    }

    incrementFont(x){
        let f = this.getFont()
        f[0] += x;
        this.ctx.font = `${f[0]}px ${f[1]}`;
    }


    //returns text so that it would fit inside of a width
    newline_overflow(text, width){
        var ttext = text.split('\n');
        var running_text = '';
        for(var i = 0; i < ttext.length; i++){
            var t = ttext[i];
            var s = this.ctx.measureText(t);
            if(s.width > width){
                var words = t.split(' ');
                var running_text_2 = '';
                for(var y = 0; y < words.length; y++){
                    var lonk = this.ctx.measureText(running_text_2 + " " + words[y])
                    if(lonk.width > width){
                        running_text_2 = running_text_2 + "\n";
                    }
                    running_text_2 = running_text_2 + " " + words[y];
                }
                running_text = running_text + running_text_2 + "\n";

            }else{
                running_text = running_text + t + "\n"
            }
        }
        return running_text;
    }


    //draws text from the topleft
    drawPar(text, width, height, pos){
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = "top";

        let nText = this.newline_overflow(text, width); //wraps text around a given width
        let s = this.properSize(nText); //gets the size of the text
        while(s.h > height - 100){
            this.incrementFont(-5);
            nText = this.newline_overflow(text, width);
            s = this.properSize(nText);
        }

        let textPos = [
            pos[0],
            pos[1] + ( height - s.h ) / 2 //
        ];

        
        this.ctx.fillText(nText, textPos[0], textPos[1])

        return {x: textPos[0], y: textPos[1], w:s.w, h:s.h, t:nText};
    }    




    //takes text which is a string, a max width, a max height and a position which is the top left coner position of the rect created from width and height
    drawTextAtCenter(text, width, height, pos, hor = false){
        var t = this.newline_overflow(text, width);
        var s = this.ctx.measureText(t);
        s.height = s.actualBoundingBoxAscent + s.actualBoundingBoxDescent;

        //while the text is outside of the boundries
        while(s.width > width || s.height > height){
            var f = this.ctx.font;
            var font_split = f.split(' ');
            //console.log(font_split);
            var size = Number(font_split[0].slice(0, -2));
            size -= 5;
            this.ctx.font = `${size}px ${font_split[1]}`;
            t = this.newline_overflow(text, width);
            s = this.ctx.measureText(t);

        }
        
        //the extra s.height/2 is to draw from the center
        if(hor){
            var text_pos = [pos[0] + (width - s.width)/4, pos[1] + (height - s.height)/2 + s.height/2];  
        }else{
            var text_pos = [pos[0], pos[1] + (height - s.height)/2 ];  
        }
          


        //draws the text on the canvas
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = "top";
        this.ctx.fillText(t, text_pos[0], text_pos[1])

        return {x: text_pos[0], y: text_pos[1], w:s.width, h:s.height};
    }

    



    drawArrows(pos, up = true, color = "white"){
        //to draw an arrow we need to draw a stalk and then a triangle
        var scale = 0.8;

        var rectHeight = 40 * scale;
        var rectWidth = 20 * scale;

        var rectPos1 = [pos[0] - rectWidth * this.s, pos[1] - rectHeight * this.s];
        var rectPos2 = [pos[0] + rectWidth * this.s, pos[1] + rectHeight * this.s];
        this.drawRect(color, rectPos1, rectPos2);

        this.ctx.fillStyle = color;

        //Draw the arrow
        var arrow = [pos[0], pos[1]];

        if(up){ 
            //if its an updoot 
            arrow[1] -= rectHeight * this.s;
            this.ctx.beginPath();
            this.ctx.moveTo(arrow[0] - 50 * scale, arrow[1]);
            this.ctx.lineTo(arrow[0] + 50 * scale, arrow[1]);
            this.ctx.lineTo(arrow[0], arrow[1] - 50 * scale);
            this.ctx.fill();


        }else{
            //if its a downdoot
            arrow[1] += rectHeight * this.s;
            this.ctx.beginPath();
            this.ctx.moveTo(arrow[0] - 50, arrow[1]);
            this.ctx.lineTo(arrow[0] + 50, arrow[1]);
            this.ctx.lineTo(arrow[0], arrow[1] + 50);
            this.ctx.fill();


        }  
        
    }

}

module.exports.dt = DrawTool;