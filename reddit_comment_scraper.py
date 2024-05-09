import praw
import json
from praw.models import MoreComments
from praw.models import Comment
import sys
from reddit_connect import getRedditSession

reddit = getRedditSession()


class content:
    def __init__(self, op, updoots, content, id, parent, zIndex):
        self.content = content.encode('utf-8')  # Text in comment
        self.op = op  # Op Name
        self.updoots = updoots  # Upvote count
        self.id = id  # Post ID
        self.parent = parent # Parent Post Number
        self.zIndex = zIndex # Depth in comments


def threadFromID(ID):
    data = []
    submission = reddit.submission(id=ID)
    data.append(submission)
    return data


def subredditHotPosts(subreddit, amount):
    subs = []
    for submission in reddit.subreddit(subreddit).hot(limit=amount):
        subs.append(submission)
    return subs


def subredditTopPosts(subreddit, amount):
    ids = []
    for submission in reddit.subreddit(subreddit).top(limit=amount):
        ids.append(submission)
    return ids


ID = "cxa77e"
HARSHNESS = 10
DEBUG = False


def retrieveCommentData(ID, HARSHNESS, DEBUG):
    submission = reddit.submission(id=ID)
    if DEBUG:
        print("TITLE: " + submission.title.encode('utf-8'))
        print("URL: " + submission.url)
    submission.comment_sort = 'top'
    submission.comment_limit = 100

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
            if top_level_comment.ups > MAX_UPVOTES / HARSHNESS and hasattr(top_level_comment.author, 'name'):
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
                        if second_level_comment.ups > CURRENT_TOP_UPS / (HARSHNESS / 4) and hasattr(
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
                                    if third_level_comment.ups > CURRENT_MID_UPS / (HARSHNESS / 5) and hasattr(
                                            third_level_comment.author, 'name'):
                                        data.append(
                                            content(third_level_comment.author.name, str(third_level_comment.ups),
                                                    third_level_comment.body, contentID, parentIDMID, 2))
    if DEBUG:
        print(len(data))
        for x in data:
            print('ID {0}, PARENT {1}, OP {2}, UPS {3}'.format(x.id, x.parent, x.op, x.updoots))
    return data



#console inputs
if len(sys.argv) == 4:
    print("running")
    d = subredditHotPosts(sys.argv[1], sys.argv[2])

    print(d)
else:
    print("Not enough args")




