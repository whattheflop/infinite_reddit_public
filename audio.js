//Generates audio from tts
const crypto = require('crypto')
const querystring = require("querystring");
const http = require('http');
const fs = require('fs');
const https = require('https');
const request = require('request');
const rp = require('request-promise');

const express = require('express');
const httpContext = require('express-http-context');



//Returns a file path to .mp3
class Audio {
    constructor(voice='mlg', videoId){
        this.videoId = videoId;

        switch (voice) {
            case 'mlg':
                this.voice = 5;
                break;
            case 'purplesheep':
                this.voice = "willfromafar_22k_ns.bvcu";
                break;
            default:
                break;
        }
    }


    getVoiceID()  {
        return this.voice;
    }

    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getAudioUrl(text)  {
        switch (this.voice) {
            case 5:
                return this.getMLGAudio(text);
                break;
            case "willfromafar_22k_ns.bvcu":
                this.getPurpleSheepAudio(text);
                break;
        }
    }

    getMLGAudio(text)   {

        var engine = 4;
        var lang = 1;
        var level1 = 0;
        var level2 = 0;
        var accid = 5883747;
        var secret = "uetivb9tb8108wfj";

        //let text = arguments[0]   //.Aggregate(" ", (current, argument) => current + " " + argument);
        let textURI = querystring.stringify({text})
        textURI = textURI.substring(textURI.indexOf("=")+ 1);

        let magic = ''.concat(engine, lang, this.voice, text, '1mp3', accid, secret);

        //var checksum = MD5.Create().ComputeHash(Encoding.ASCII.GetBytes(magic));
        let checksum = crypto.createHash('md5').update(magic).digest("hex")

        let stringchecksum = checksum //string.Concat(Array.ConvertAll(checksum, x => x.ToString("X2"))).ToLower();
        let url = "http://cache-a.oddcast.com/tts/gen.php?EID=".concat(engine, '&LID=', lang, '&VID=', this.voice, '&TXT=',
        textURI, '&IS_UTF8=1&EXT=mp3&FNAME=&ACC=', accid, '&API=&SESSION=&CS=', stringchecksum, '&cache_flag=3');
        return url;
    }

    getPurpleSheepAudio(text)   {
        var text = text;
        var str = "{\"googleid\":\"";               // magic for authentication
        var email = this.makeid(20) + "@gmail.com"; // magic for authentication
        var magicID = str+email;                    // magic for authenticaiton
        var nonce = "";
        var regex = '^\{\"nonce\"\:\"(.+)\"\}$';    // retrieves authentication from first post
        var voice = this.voice;
        var regex2 = "snd_url=(.+)&snd_size";       // retrieves audio url from 2nd POST
        let textURI = querystring.stringify({text})             // gets the URI ready version of texts ( space = %20)
        textURI = textURI.substring(textURI.indexOf("=")+ 1);   // gets the URI ready version of texts ( space = %20)
        rp.post({                                               //// THIS REQUEST GETS AN AUTHENTICATION KEY FOR THE NEXT ONE
            url:     'https://acapelavoices.acapela-group.com/index/getnonce/',
            json: {json: magicID}
          })
          .then(function (body) {
            nonce = JSON.stringify(body).match(regex)[1]        // gets the auth key
            var magic2 = "{\"nonce\":\"" + nonce + ",\"user\":\"" + email + "\"}"; // prepares next auth
            rp.post({                                           //// THIS REQUEST GETS AUDIO LINK
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                uri: "http://www.acapela-group.com:8080/webservices/1-34-01-Mobility/Synthesizer",
                ////                                            \/ DONT LOOK \/
                body: "req_voice=enu_" + voice + "&cl_pwd=&cl_vers=1-30&req_echo=ON&cl_login=AcapelaGroup&req_comment=%7B%22nonce%22%3A%22" + nonce + "%22%2C%22user%22%3A%22"+ email + "%22%7D&req_text=" + textURI + "&cl_env=ACAPELA_VOICES&prot_vers=2&cl_app=AcapelaGroup_WebDemo_Android"
            }).then(function (body) {
                //console.log(body);
                let regs = body.match(regex2);      // matches to regex
                //console.log(regs[1]);             // link to audio
                return regs[1];                     
            }).catch(function(err) {
                console.log(err);
            });
        }).catch(function(err) {
            console.log(err);
        });
    }
    //downloads a mp3 from url
    downloadAudio(url, filename, path=`./temp/${this.videoId}`)
    {
        
        //creates a new file write stream at path with filename
        const file = fs.createWriteStream(path+filename);
        //makes a request to the url

        let p = new Promise((resolve, reject) => {
            const request = http.get(url, (res) =>{
                res.pipe(file);
                resolve(path+filename);
            });
        });
        return p;
        
    }
}


//exports audio
module.exports.Audio = Audio;

