/* global process */

const config = require('./config');
const Twitter = require('twitter');
const months = config.common.months; // The last months that should be untouched
const client = new Twitter(config.twitterClient);
let allTweets = [];
let remaining = 0;
let parameters = {count: 200, include_rts: true, exclude_replies: false};

function getTweets(max_id) {
  console.log('Fetching the latest tweets...');
  if (max_id !== 0) {
    parameters.max_id = max_id
  }

  client.get('statuses/user_timeline', parameters, function (error, tweets, response) {
    if (error) {
      console.log(error);
    }

    allTweets = allTweets.concat(tweets)

    remaining = parseInt(response.headers['x-rate-limit-remaining'])

    if (tweets.length > 0 && !isNaN(remaining) && remaining > 0) {
      const lastId = tweets[tweets.length - 1].id_str;
      const secondLastId = decStrNum(lastId);
      getTweets(secondLastId)
      return;
    }

    // All available tweets are collected. We start with the cleanup.
    cleanupTweets();
  });
}

function cleanupTweets() {
  const now = new Date();
  now.setMonth(now.getMonth() - months);
  const dateAgo = now;

  allTweets.forEach(function (tweet) {
    const tweetDate = new Date(tweet.created_at)

    // Handle excludes in text
    if (new RegExp(config.common.excludes.join('|')).test(tweet.text)) {
      return;
    }

    // Handle excludes in urls
    const urls = tweet.entities.urls.map((url) => url.expanded_url);
    if (new RegExp(config.common.excludes.join('|')).test(urls.join(' '))) {
      return;
    }

    // Handle date
    if (tweetDate > dateAgo) {
      return;
    }

    client.post('statuses/destroy/' + tweet.id_str, {}, function (error, tweet, response) {
      if (error) {
        console.log(error);
      }

      remaining = parseInt(response.headers['x-rate-limit-remaining'])

      if (isNaN(remaining) && remaining === 0) {
        console.error('Rate limit reached');
        process.exit(1);
      }

      if (tweet !== undefined) {
        console.log('Deleted: ' + tweet.created_at + ' ' + tweet.text)
      }
    });
  });
}

/**
 * Decrement a number in a string
 *
 * @source https://stackoverflow.com/a/14328420
 * @param n
 * @returns {string|*}
 */

function decStrNum(n) {
  n = n.toString();
  let result = n;
  let i = n.length - 1;
  while (i > -1) {
    if (n[i] === "0") {
      result = result.substring(0, i) + "9" + result.substring(i + 1);
      i--;
    } else {
      result = result.substring(0, i) + (parseInt(n[i], 10) - 1).toString() + result.substring(i + 1);
      return result;
    }
  }
  return result;
}

// Start tidy up twitter timeline
getTweets(0);

