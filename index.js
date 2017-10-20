const config = require('./config');
const Twitter = require('twitter');
const months = 2; // The last months that should untouched
const client = new Twitter(config);
let allTweets = [];
let parameters = {count: 200, include_rts: true, exclude_replies: false};

function getTweets(max_id) {
  console.log('Fetching the last tweets...');
  if (max_id !== 0) {
    parameters.max_id = max_id
  }

  client.get('statuses/user_timeline', parameters, function (error, tweets, response) {
    if (error) console.log(error);
    allTweets = allTweets.concat(tweets)

    if (tweets.length > 0) {
      const lastId = tweets[tweets.length - 1].id_str;
      const secondLastId = decStrNum(lastId);
      getTweets(secondLastId)
    } else {
      cleanupTweets();
    }
  });
}

function cleanupTweets() {
  const now = new Date();
  now.setMonth(now.getMonth() - months);
  const dateAgo = now;

  allTweets.forEach(function (tweet) {
    const tweetDate = new Date(tweet.created_at)

    if (tweetDate < dateAgo) {
      client.post('statuses/destroy/' + tweet.id_str, {}, function (error, tweet, response) {
        if (error) console.log(error);

        if (tweet !== undefined) {
          console.log('Deleted: ' + tweet.created_at + ' ' + tweet.text)
        }
      });
    }
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
    }
    else {
      result = result.substring(0, i) + (parseInt(n[i], 10) - 1).toString() + result.substring(i + 1);
      return result;
    }
  }
  return result;
}

// Start tidy up twitter timeline
getTweets(0);

