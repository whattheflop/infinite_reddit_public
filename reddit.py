from __future__ import unicode_literals
from reddit_connect import getRedditSession
import urllib
import requests
import youtube_dl
import os
import shutil
import re
import json
import datetime
import random
import sys
from praw.models import MoreComments
from praw.models import Comment

reddit = getRedditSession()

debug = True

#the command to run this file is:
# py reddit.py <subreddit> <amount of posts> <type> <harshness> 

def main():
    args = sys.argv
    blacklist = [""]

    if len(args) == 5:
        postIds = getPosts(args[1], args[2], args[3], blacklist)
        print("POSTS:", postIds)
        data = getComments(postIds[0], int(args[4]), debug)
        
        print('[[DAB]]' + postIds[0] + '[[DAB]]')

        commentString = "----====CONTENT====----\n"
        for x in data:
            commentString += json.dumps(x.__dict__) + '[[END]]\n'
            #commentString += '|ID {0}|PARENT {1}|OP {2}|UPS {3}|CONTENT +&+{4}+&+|\n'.format(x.id, x.parent, x.op, x.updoots, x.content.encode('utf-8'))

        print(commentString)

    else:
        print("Not enough args")


def getHotPosts(sub, amount, filter):
    subs = []
    data = []
    regexImage = re.compile(r"^https:\/\/i.(?:.*)(jpg|png|jpeg)$")
    regexVideo = re.compile(r"https:\/\/([mv]|youtu|www\.youtube|www\.youtu)")
    regexText = re.compile(r"https://www\.reddit")

    dic = {"image": regexImage,
           "video": regexVideo,
           "text": regexText
           }

    for submission in reddit.subreddit(sub).hot(limit=100 + amount):
        boo = submission.is_self
        if filter != "text":
            boo = not boo
        if (not submission.stickied and boo and dic[filter].search(submission.url)):
            #print(submission.url)
            data.append(submission.id)
        if (len(data) == amount):
            break
        

    return data

# subreddit is a string of the subreddit url. EG: "askreddit"
#
# amount is the number of posts to use.
#
# filter is the type of posts we are looking for. EG "text"
#
# black list is a list of ids that the server has already 
# included in videos

def getPosts(subreddit, amount, filter, blackList):
    print("Getting Posts From: r/" + subreddit )
    #going to be an list of posts (first is a better post)
    posts = []

    #if filter is for text
    #ie if we are making a comment video
    #for a comment video we only need one post
    if(filter == "text"):
        #gets amount of the hottest posts
        #returns an array of post ids
        ps = getHotPosts(subreddit, int(amount), filter)

        #removes all blacklisted ids
        for x in ps:
            for y in blackList:
                if x != y:
                    posts.append(x)
    return posts

def getComments(postId, harshness, debug):
    #gets the submission
    submission = reddit.submission(id=postId)

    print('POST TITLE:', submission.title.encode('utf-8'))
    # Variables for Harshness Checking
    MAX_UPVOTES = 0
    CURRENT_TOP_UPS = 0
    CURRENT_MID_UPS = 0

    data = []  # returned array of content objects {content, content, content}
    contentID = 1  # Id of the current comment
    parentIDTOP = 0  # Id of the current top level parent
    parentIDMID = 0  # Id of the current second level parent

    # Title of post
    data.append(content(submission.author.name, str(submission.ups), submission.title, 0, -1, -1))

    # submission.comments.replace_more(limit=10)

    ### GENERAL IDEA
    # This structure takes the submissions comments and does a few checks
    # Does a depth first search across all comments
    # The harshness works on a denominator level of upvote counts
    for top_level_comment in submission.comments:

        if type(top_level_comment) == Comment:
            CURRENT_TOP_UPS = top_level_comment.ups

            if top_level_comment.ups > MAX_UPVOTES:
                MAX_UPVOTES = top_level_comment.ups
            # checks to make sure its a comment ,,, meets harshness ,,, and makes sure its not removed
            if top_level_comment.ups > MAX_UPVOTES / harshness and hasattr(top_level_comment.author, 'name'):
                # Appends the returned array with the content necessary for production
                data.append(content(top_level_comment.author.name, str(top_level_comment.ups), top_level_comment.body,
                                    contentID, 0, 0))
                # Updates ids and upvotes
                contentID += 1
                parentIDTOP = contentID - 1
                CURRENT_MID_UPS = 0

                for second_level_comment in top_level_comment.replies:
                    # checks to make sure its a comment ,,, meets harshness ,,, and makes sure its not removed
                    if isinstance(second_level_comment, Comment):
                        if second_level_comment.ups > CURRENT_TOP_UPS / (harshness / 4) and hasattr(
                                second_level_comment.author, 'name'):
                            # Updates ids and upvotes
                            CURRENT_MID_UPS = second_level_comment.ups
                            data.append(content(second_level_comment.author.name, str(second_level_comment.ups),
                                                second_level_comment.body, contentID, parentIDTOP, 1))
                            contentID += 1
                            parentIDMID = contentID - 1

                            for third_level_comment in second_level_comment.replies:
                                # checks to make sure its a comment ,,, meets harshness ,,, and makes sure its not removed
                                if isinstance(third_level_comment, Comment):
                                    if third_level_comment.ups > CURRENT_MID_UPS / (harshness / 5) and hasattr(
                                            third_level_comment.author, 'name'):
                                        data.append(
                                            content(third_level_comment.author.name, str(third_level_comment.ups),
                                                    third_level_comment.body, contentID, parentIDMID, 2))
    
    return data

class content:
    def __init__(self, op, updoots, content, id, parent, zIndex):
        self.content = content  # Text in comment
        self.op = op  # Op Name
        self.updoots = updoots  # Upvote count
        self.id = id  # Post ID
        self.parent = parent # Parent Post Number
        self.zIndex = zIndex # Depth in comments
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, 
            sort_keys=True, indent=4)

main()