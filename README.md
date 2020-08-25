# Tidy Twitter

A node script for tidy up your Twitter timeline. All Tweets that are older than 3 months will be deleted every night.

## Requirements

- nodejs > 12

## Installation

1. Clone the repo `git clone https://github.com/lukasleitsch/tidy-twitter`
2. Jump into the folder `cd tidy-twitter`
3. Run `npm install`
4. Create a new [Twitter app](https://apps.twitter.com)
5. Copy `config.example.js` into `config.js`
6. Add the application settings and the access token of your new twitter app into the `config.js`

## Cronjob
(This example works on [Uberspace](http://uberspace.de))

```
30 0 * * * node ~/tidy-twitter/index.js > /dev/null 2>&1
```

Every night at 00:30 the cronjob runs the script and tidy up your Twitter timeline.

## Delete the really old tweets

The Twitter API is really special. Tidy Twitter cannot delete all old tweets because the API has some limits. For deleting really old tweets you can use [Twitter Archive Eraser](http://martani.github.io/Twitter-Archive-Eraser/).
