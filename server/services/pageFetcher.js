const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

/**
 * Fetches a URL and extracts the main article content using Mozilla Readability
 * @param {string} url - The URL to fetch and parse
 * @returns {Object} - Object containing title, content, and metadata
 */
async function fetchPageContent(url) {
  try {
    console.log(`🔍 Fetching content from: ${url}`);
    
    // Fetch the HTML with a reasonable timeout and user agent
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
      }
    });

    const html = response.data;
    
    // Create a virtual DOM from the HTML
    const dom = new JSDOM(html, { 
      url: url,
      pretendToBeVisual: true,
      features: {
        FetchExternalResources: false,
        ProcessExternalResources: false
      }
    });

    // Use Readability to extract the main content
    const reader = new Readability(dom.window.document, {
      debug: false,
      maxElemsToParse: 6000,
      nbTopCandidates: 5,
      charThreshold: 500,
      classesToPreserve: ['caption', 'credit']
    });

    const article = reader.parse();

    if (article) {
      console.log(`✅ Successfully extracted article: "${article.title}" (${article.textContent.length} chars)`);
      
      return {
        success: true,
        title: article.title || 'Untitled',
        content: article.textContent || '',
        excerpt: article.excerpt || '',
        length: article.length || 0,
        url: url,
        siteName: article.siteName || '',
        publishedTime: article.publishedTime || null
      };
    } else {
      // Fallback: extract text from body if Readability fails
      console.log(`⚠️ Readability failed, using fallback text extraction for ${url}`);
      
      const bodyText = dom.window.document.body?.textContent || '';
      const title = dom.window.document.title || 'Untitled';
      
      return {
        success: true,
        title: title,
        content: bodyText.substring(0, 5000), // Limit to 5000 chars
        excerpt: bodyText.substring(0, 200) + '...',
        length: bodyText.length,
        url: url,
        siteName: '',
        publishedTime: null,
        fallback: true
      };
    }

  } catch (error) {
    console.error(`❌ Error fetching content from ${url}:`, error.message);
    
    return {
      success: false,
      error: error.message,
      url: url,
      title: 'Failed to fetch',
      content: '',
      excerpt: '',
      length: 0
    };
  }
}

/**
 * Fetch content from multiple URLs in parallel
 * @param {string[]} urls - Array of URLs to fetch
 * @returns {Promise<Object[]>} - Array of content objects
 */
async function fetchMultiplePages(urls) {
  if (!urls || urls.length === 0) {
    return [];
  }

  console.log(`🔗 Fetching content from ${urls.length} URLs in parallel...`);
  
  // Fetch all URLs in parallel with error handling
  const promises = urls.map(url => 
    fetchPageContent(url).catch(error => ({
      success: false,
      error: error.message,
      url: url,
      title: 'Failed to fetch',
      content: '',
      excerpt: '',
      length: 0
    }))
  );

  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`📊 Fetch results: ${successful.length} successful, ${failed.length} failed`);
  
  return results;
}

/**
 * Get a clean text summary of the page content
 * @param {Object} pageContent - Page content object from fetchPageContent
 * @returns {string} - Clean text suitable for AI processing
 */
function getCleanText(pageContent) {
  if (!pageContent.success || !pageContent.content) {
    return '';
  }

  // Clean up the text content
  let text = pageContent.content
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')  // Limit consecutive newlines
    .trim();

  // Add title if available
  if (pageContent.title && pageContent.title !== 'Untitled') {
    text = `${pageContent.title}\n\n${text}`;
  }

  return text;
}

module.exports = {
  fetchPageContent,
  fetchMultiplePages,
  getCleanText
}; 