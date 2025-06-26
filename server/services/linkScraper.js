const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class LinkScrapingService {
  constructor() {
    this.urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    this.maxLinksPerTweet = 3; // Limit to avoid overwhelming the system
    this.timeoutMs = 10000; // 10 second timeout for scraping
    this.maxContentLength = 5000; // Limit content length to avoid token limits
  }

  /**
   * Extract all URLs from tweet content
   * @param {string} tweetContent - The tweet text
   * @returns {string[]} - Array of URLs found
   */
  extractUrls(tweetContent) {
    const urls = tweetContent.match(this.urlRegex) || [];
    return urls.slice(0, this.maxLinksPerTweet); // Limit number of links
  }

  /**
   * Expand shortened URLs (like t.co) to their final destination
   * @param {string} url - The URL to expand
   * @returns {Promise<string>} - The final expanded URL
   */
  async expandUrl(url) {
    try {
      console.log(`🔗 Expanding URL: ${url}`);
      
      // For t.co and other shorteners, do a HEAD request to follow redirects
      const response = await axios.head(url, {
        timeout: this.timeoutMs,
        maxRedirects: 10,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Get the final URL after all redirects
      const finalUrl = response.request.res.responseUrl || url;
      console.log(`📍 Final URL: ${finalUrl}`);
      return finalUrl;
      
    } catch (error) {
      console.warn(`⚠️ Failed to expand ${url}, using original:`, error.message);
      return url; // Fallback to original URL if expansion fails
    }
  }

  /**
   * Scrape content from a single URL
   * @param {string} url - The URL to scrape
   * @returns {Promise<Object>} - Scraped content with title and text
   */
  async scrapeUrl(url) {
    try {
      console.log(`🔍 Scraping URL: ${url}`);
      
      // First, expand the URL if it's a shortened link
      const expandedUrl = await this.expandUrl(url);
      
      const response = await axios.get(expandedUrl, {
        timeout: this.timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script, style, nav, header, footer, aside').remove();
      
      // Extract title
      const title = $('title').text().trim() || 
                   $('h1').first().text().trim() || 
                   $('meta[property="og:title"]').attr('content') || 
                   'Untitled';

      // Extract main content - prioritize article content
      let content = '';
      
      // Try common article selectors first
      const articleSelectors = [
        'article',
        '[role="main"]',
        '.content',
        '.article-content',
        '.post-content',
        '#content',
        'main'
      ];

      for (const selector of articleSelectors) {
        const articleContent = $(selector).text().trim();
        if (articleContent && articleContent.length > content.length) {
          content = articleContent;
        }
      }

      // Fallback to paragraph content
      if (!content || content.length < 100) {
        $('p').each((i, el) => {
          content += $(el).text().trim() + '\n';
        });
      }

      // Clean up content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim()
        .substring(0, this.maxContentLength);

      return {
        url,
        expandedUrl: expandedUrl !== url ? expandedUrl : undefined,
        title: title.substring(0, 200),
        content,
        success: true,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      console.warn(`⚠️ Failed to scrape ${url}:`, error.message);
      return {
        url,
        expandedUrl: undefined,
        title: 'Unable to access',
        content: `Failed to scrape content: ${error.message}`,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Summarize scraped content using OpenAI
   * @param {Object} scrapedData - The scraped content data
   * @returns {Promise<string>} - The summary
   */
  async summarizeContent(scrapedData) {
    try {
      if (!scrapedData.success || !scrapedData.content || scrapedData.content.length < 50) {
        return `Link (${scrapedData.url}): Content unavailable or too short to summarize.`;
      }

      const prompt = `Please provide a concise, factual summary of the following webpage content. Focus on the main points and key information. Keep it under 150 words.

Title: ${scrapedData.title}
URL: ${scrapedData.url}
Content: ${scrapedData.content}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that creates concise, factual summaries of webpage content. Focus on key facts and main points.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const summary = response.choices[0].message.content.trim();
      return `📄 ${scrapedData.title}\n🔗 ${scrapedData.url}\n📝 ${summary}`;

    } catch (error) {
      console.warn(`⚠️ Failed to summarize content for ${scrapedData.url}:`, error.message);
      return `Link (${scrapedData.url}): ${scrapedData.title} - Summary unavailable due to processing error.`;
    }
  }

  /**
   * Process all links in a tweet: extract, scrape, and summarize
   * @param {string} tweetContent - The tweet text
   * @returns {Promise<Object>} - Processing results with summaries
   */
  async processLinks(tweetContent) {
    try {
      const urls = this.extractUrls(tweetContent);
      
      if (urls.length === 0) {
        return {
          hasLinks: false,
          linkCount: 0,
          summaries: [],
          combinedSummary: ''
        };
      }

      console.log(`🔗 Found ${urls.length} URLs in tweet, processing...`);

      // Scrape all URLs in parallel
      const scrapingPromises = urls.map(url => this.scrapeUrl(url));
      const scrapedResults = await Promise.all(scrapingPromises);

      // Summarize all scraped content in parallel
      const summaryPromises = scrapedResults.map(result => this.summarizeContent(result));
      const summaries = await Promise.all(summaryPromises);

      // Combine summaries for context
      const combinedSummary = summaries.length > 0 
        ? `\n\n📋 LINKED CONTENT SUMMARIES:\n${summaries.join('\n\n')}`
        : '';

      return {
        hasLinks: true,
        linkCount: urls.length,
        urls,
        scrapedResults,
        summaries,
        combinedSummary
      };

    } catch (error) {
      console.error('❌ Error processing links:', error);
      return {
        hasLinks: false,
        linkCount: 0,
        summaries: [],
        combinedSummary: '',
        error: error.message
      };
    }
  }

  /**
   * Enhanced content for AI agents with link context
   * @param {string} originalContent - Original tweet content
   * @param {string} combinedSummary - Combined link summaries
   * @returns {string} - Enhanced content for AI analysis
   */
  enhanceContentForAI(originalContent, combinedSummary) {
    if (!combinedSummary) {
      return originalContent;
    }

    return `${originalContent}${combinedSummary}

⚡ ANALYSIS INSTRUCTIONS: The tweet above contains links to external content. The summaries above provide context about what those links contain. Please consider both the tweet content AND the linked content in your analysis.`;
  }
}

module.exports = LinkScrapingService; 