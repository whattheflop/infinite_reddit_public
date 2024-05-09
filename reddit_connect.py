import praw
import yaml
import json

conf = yaml.full_load(open('conf/application.yml'))

userid = conf['user']['userid']
secret = conf['user']['secret']
username = conf['user']['username']
password = conf['user']['password']
name = conf['user']['name']


def getRedditSession():
    reddit = praw.Reddit(client_id=userid,
                         client_secret=secret,
                         user_agent=name,
                         username=username,
                         password=password)
    return reddit
