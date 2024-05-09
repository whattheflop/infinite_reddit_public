from __future__ import unicode_literals
from reddit_connect import getRedditSession
import urllib
import requests
import youtube_dl
import os
import shutil
import re
import datetime
import random
import sys

reddit = getRedditSession()
hwAcell = True


class contentVideo:
    def __init__(self, op, updoots, url, ID, title, videoTitle, FileLocation, FileName, VideoURL, subreddit):
        self.url = url  # Video Url
        self.op = op  # Op Name
        self.updoots = updoots  # Upvote count
        self.id = ID  # Post
        self.title = title  # post title
        self.videoTitle = videoTitle  # video title
        self.fileLocation = FileLocation  # saved too location
        self.filename = FileName  # filename
        self.subreddit = subreddit  # subreddit
        self.createdtime = str(random.randrange(0, 10)) + " Hours"


class contentImage:
    def __init__(self, op, updoots, url, ID, title, FileLocation, FileName, subreddit, createdtime):
        self.createdtime = str(random.randrange(0, 10)) + " Hours"
        self.url = url  # Video Url
        self.op = op  # Op Name
        self.updoots = updoots  # Upvote count
        self.id = ID  # Post
        self.title = title  # post title
        self.fileLocation = FileLocation  # saved too location
        self.filename = FileName  # filename
        self.subreddit = subreddit  # subreddit

def threadFromID(ID):
    data = []
    submission = reddit.submission(id=ID)
    data.append(submission)
    return data


def subredditHotPosts2(subreddit, amount, filter):
    print("starting to scrape with", subreddit, filter, amount)
    data = []
    stickied_post = []
    filteredpost = []
    regexImage = re.compile(r"^https:\/\/i.(?:.*)(jpg|png|jpeg)$")
    regexVideo = re.compile(r"https:\/\/([mv]|youtu|www\.youtube|www\.youtu)")
    regexText = re.compile(r"https://www\.reddit")

    dic = {"image": regexImage,
           "video": regexVideo,
           "text": regexText
           }

    # Liams code is better
    # works and good

    # while(len(data) < amount):
    #    for submission in reddit.subreddit(subreddit).hot(limit = 69 + amount):
    #        if not submission.stickied and not submission.is_self and dic[filter].search(submission.url) and len(data) < amount:
    #                print("Downloading " + submission.url)
    #                data.append(submission)

    # works but shit
    print("running with " + filter)
    for submission in reddit.subreddit(subreddit).hot(limit=100 + amount):
        boo = submission.is_self
        if filter != "text":
            boo = not boo
        if (not submission.stickied and boo and dic[filter].search(submission.url)):
            print(submission.url)
            data.append(submission)
        if (len(data) == amount):
            break

    return data


def subredditTopPosts2(subreddit, amount, time, filter):
    data = []
    stickied_post = []

    for sticky in reddit.subreddit(subreddit).top(time, limit=amount):
        if sticky.stickied or sticky.is_self:
            stickied_post.append(sticky.id)

    for submission in reddit.subreddit(subreddit).top(time, limit=amount + len(stickied_post)):
        if submission.id not in stickied_post:
            data.append(submission)
    return data


def downloadVideos(data):
    print("Downloading Videos; Amount " + str(len(data)))
    post_information = []

    try:
        os.mkdir('./res/' + data[0].subreddit.name)
        os.mkdir('./res/' + data[0].subreddit.name + '/pre')
    except:
        print("Couldn't make directory, probably already made")

    for i, submission in enumerate(data):
        itBroke = False
        video = None
        OP = submission.author.name
        URL = submission.url
        UP = submission.score
        TITLE = submission.title
        ID = submission.id
        SUBREDDIT = submission.subreddit.name
        CREATEDTIME = submission.created_utc

        FILE_LOCATION = './res/' + SUBREDDIT + '/'
        FILE_NAME = str(i) + submission.id
        print(URL)
        print(SUBREDDIT)
        if SUBREDDIT == 't5_2tqlz':  # youtube
            ydl = youtube_dl.YoutubeDL({'ignoreerrors': True, 'outtmpl': FILE_LOCATION + 'pre/' + FILE_NAME,
                                        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
                                        'merge-output-format': 'mp4'})
        elif SUBREDDIT == 't5_mvcq5':
            ydl = youtube_dl.YoutubeDL({'outtmpl': FILE_LOCATION + 'pre/' + FILE_NAME, 'merge-output-format': 'mp4'})
        else:
            print("Other detected, guessing but pl0x add statement in reddit_content_scraper")
            ydl = youtube_dl.YoutubeDL({'outtmpl': FILE_LOCATION + 'pre/' + FILE_NAME,
                                        'format': 'bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
                                        'merge-output-format': 'mp4'})

        with ydl:
            result = ydl.extract_info(
                submission.url,
                download=True
            )
        try:
            if 'entries' in result:
                video = result['entries'][0]
            else:
                # Just a video
                video = result
        except:
            itBroke = True
        if not itBroke:
            VIDEO_URL = video['webpage_url']
            VIDEO_TITLE = video['title']
            post_information.append(
                contentVideo(OP, UP, URL, ID, TITLE, VIDEO_TITLE, FILE_LOCATION, FILE_NAME, VIDEO_URL, SUBREDDIT,
                             CREATEDTIME))
            print("Video Downloaded")
        else:
            print("Video Failed To Download")
            # TODO add an error log lmao
    print("Changing Video")
    for i, x in enumerate(post_information):
        print("Currently video {0} of {1}".format(i, str(len(post_information))))
        if hwAcell:
            os.system(
                'ffmpeg -v warning -i {0}.mp4 -vf "scale=(iw*sar)*min(1920/(iw*sar)\,1080/ih):ih*min(1920/(iw*sar)\,1080/ih), pad=1920:1080:(1920-iw*min(1920/iw\,1080/ih))/2:(720-ih*min(1920/iw\,720/ih))/2" -r 29.97 -vsync cfr -pix_fmt yuv444p -c:v h264_nvenc -ar 22050 -ac 1 -c:a aac -y {1}.mp4'.format(
                    x.fileLocation + 'pre/' + x.filename, x.fileLocation + x.filename))
        else:
            os.system(
                'ffmpeg -v warning -i {0}.mp4 -vf "scale=(iw*sar)*min(1920/(iw*sar)\,1080/ih):ih*min(1920/(iw*sar)\,1080/ih), pad=1920:1080:(1920-iw*min(1920/iw\,1080/ih))/2:(720-ih*min(1920/iw\,720/ih))/2" -r 29.97 -vsync cfr -pix_fmt yuv444p -c:v libx264 -ar 22050 -ac 1 -c:a aac -y {1}.mp4'.format(
                    x.fileLocation + 'pre/' + x.filename, x.fileLocation + x.filename))

        # os.system('ffmpeg -v warning -i {0}.mp4 -vf "scale=1920:1080, pad=1920:1080:0:0:violet" -r 29.97 -vsync cfr -pix_fmt yuv444p -c:v libx264 -ar 22050 -ac 1 -c:a aac -y {1}.mp4'.format(x.fileLocation + 'pre/' + x.filename, x.fileLocation + x.filename))
    try:
        shutil.rmtree('./res/' + data[0].subreddit.name + '/pre')
    except:
        print("could not delete pre owo")
    print("donezo")
    content_combine(post_information)
    return post_information


def content_combine(posts):
    print('content_combine(posts):')
    with open('video.txt', 'w') as f:
        f.write("file './static/intro-final.mp4'\n")
        for i, x in enumerate(posts):
            f.write("file './static/static-final.mp4'\n")
            f.write("file '%s.mp4'\n" % (x.fileLocation + x.filename))
        f.write("file './static/intro-final.mp4'\n")

    os.system(
        'ffmpeg -v warning -f concat -safe 0 -i "video.txt" -c:v copy -c:a aac -y "./output/FINAL_OUTPUT_{0}.mp4"'.format(
            "dab"))


def downloadImages(data):
    print("Downloading Images; Amount " + str(len(data)))
    post_information = []
    for i, submission in enumerate(data):
        OP = submission.author.name
        URL = submission.url
        UP = submission.score
        TITLE = submission.title
        ID = submission.id
        SUBREDDIT = submission.subreddit.name
        FILE_LOCATION = './res/'
        FILE_NAME = str(i) + submission.id + '.jpg'
        CREATEDTIME = submission.created_utc

        overflowcount = 0
        while True and overflowcount < 10:
            try:
                urllib.request.urlretrieve(URL, FILE_LOCATION + FILE_NAME)
                post_information.append(
                    contentImage(OP, UP, URL, ID, TITLE, FILE_LOCATION, FILE_NAME, SUBREDDIT, CREATEDTIME))
                break
            except:
                print("It didnt work " + str(overflowcount))
                pass
            overflowcount += 1
        print("Image Downloaded " + ID)
    return post_information




if len(sys.argv) == 4:
    print("running")
    d = subredditHotPosts2(sys.argv[1], sys.argv[2], sys.argv[3])
    print(d)
else:
    print("Not enough args")
