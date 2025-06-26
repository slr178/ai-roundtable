/**
 * Extract URLs from tweet data using Twitter API entities or regex fallback
 */
function extractUrlsFromTweet(tweet) {
  const urls = [];

  // Method 1: Try official Twitter entities field first (most reliable)
  if (tweet.entities?.urls?.length) {
    tweet.entities.urls.forEach(urlEntity => {
      if (urlEntity.expanded_url) {
        urls.push(urlEntity.expanded_url);
      } else if (urlEntity.url) {
        urls.push(urlEntity.url);
      }
    });
  }

  // Method 2: Also check for URLs in the tweet text as fallback
  const text = tweet.full_text || tweet.text || '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  if (matches) {
    matches.forEach(url => {
      // Clean up URL (remove trailing punctuation)
      const cleanUrl = url.replace(/[.,;!?]+$/, '');
      if (!urls.includes(cleanUrl)) {
        urls.push(cleanUrl);
      }
    });
  }

  // Filter out Twitter's own URLs (they're usually t.co shortened links we already have)
  return urls.filter(url => {
    // Keep t.co links if we don't have expanded versions
    if (url.includes('t.co')) {
      return !urls.some(otherUrl => 
        !otherUrl.includes('t.co') && 
        otherUrl !== url
      );
    }
    return true;
  });
}

/**
 * Extract URLs from webhook data (supports different formats)
 */
function extractUrlsFromWebhook(webhookData) {
  if (!webhookData) return [];

  // Handle Twitter webhook format
  if (webhookData.data) {
    return extractUrlsFromTweet(webhookData.data);
  }

  // Handle direct tweet format
  if (webhookData.full_text || webhookData.text) {
    return extractUrlsFromTweet(webhookData);
  }

  return [];
}

module.exports = {
  extractUrlsFromTweet,
  extractUrlsFromWebhook
}; 