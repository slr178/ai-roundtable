const OpenAI = require('openai');

class ContentSummarizer {
  constructor() {
    // Initialize OpenAI client only if API key is available
    this.openai = null;
    this.setupOpenAI();
  }

  setupOpenAI() {
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    if (openaiKey && openaiKey.length > 10) {
      this.openai = new OpenAI({
        apiKey: openaiKey
      });
      console.log('✅ ContentSummarizer OpenAI client initialized');
    } else {
      console.log('⚠️ OpenAI API key not found or invalid, content summarization will be skipped');
      this.openai = null;
    }
  }

  /**
   * Summarize a long article into a concise, politically-neutral summary
   * @param {string} text - The article text to summarize
   * @param {string} url - The source URL for context
   * @param {string} title - The article title
   * @returns {Promise<Object>} - Summary object with content and metadata
   */
  async summarizeArticle(text, url = '', title = '') {
    if (!this.openai) {
      console.log('⚠️ OpenAI client not available, skipping article summarization');
      return {
        success: false,
        error: 'OpenAI client not available',
        summary: `Content from ${url}: [Summarization unavailable - no API key]`,
        originalLength: text.length,
        summaryLength: 0,
        compressionRatio: 0,
        url: url,
        title: title
      };
    }

    try {
      console.log(`📝 Summarizing article: "${title}" (${text.length} chars)`);

      // Truncate text if it's too long for the API
      const maxLength = 8000; // Leave room for system prompt and response
      const truncatedText = text.length > maxLength 
        ? text.substring(0, maxLength) + '...[truncated]'
        : text;

      const systemPrompt = `You are a factual, neutral news summarizer. Your job is to extract the key facts and main points from articles without adding political bias or opinion.

Guidelines:
- Summarize in exactly 3 clear, factual sentences
- Focus on who, what, when, where, why
- Avoid loaded language or political framing
- Stay objective and neutral
- Include key numbers, dates, and facts when relevant`;

      const userPrompt = `Please summarize this article objectively in exactly 3 sentences:

Title: ${title}
Source: ${url}

Article:
${truncatedText}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using mini for cost efficiency on summaries
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Low temperature for consistent, factual summaries
        max_tokens: 200,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      const summary = response.choices[0].message.content.trim();
      
      console.log(`✅ Generated summary: "${summary.substring(0, 100)}..."`);

      return {
        success: true,
        summary: summary,
        originalLength: text.length,
        summaryLength: summary.length,
        compressionRatio: (summary.length / text.length * 100).toFixed(1),
        model: 'gpt-4o-mini',
        tokens: response.usage?.total_tokens || 0,
        url: url,
        title: title
      };

    } catch (error) {
      console.error(`❌ Error summarizing article from ${url}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        summary: `Failed to summarize content from ${url}`,
        originalLength: text.length,
        summaryLength: 0,
        compressionRatio: 0,
        url: url,
        title: title
      };
    }
  }

  /**
   * Summarize multiple articles in parallel
   * @param {Array} contentArray - Array of content objects from pageFetcher
   * @returns {Promise<Array>} - Array of summary objects
   */
  async summarizeMultiple(contentArray) {
    if (!contentArray || contentArray.length === 0) {
      return [];
    }

    console.log(`📚 Summarizing ${contentArray.length} articles in parallel...`);

    const promises = contentArray.map(async (content) => {
      if (!content.success || !content.content) {
        return {
          success: false,
          error: 'No content to summarize',
          summary: `No content available from ${content.url}`,
          url: content.url,
          title: content.title || 'Unknown'
        };
      }

      return await this.summarizeArticle(content.content, content.url, content.title);
    });

    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`📊 Summary results: ${successful.length} successful, ${failed.length} failed`);
    
    return results;
  }

  /**
   * Create a combined summary for AI context
   * @param {Array} summaries - Array of summary objects
   * @param {string} originalTweet - The original tweet text
   * @returns {string} - Combined context for AI agents
   */
  buildEnhancedContext(summaries, originalTweet = '') {
    if (!summaries || summaries.length === 0) {
      return originalTweet;
    }

    const successfulSummaries = summaries.filter(s => s.success && s.summary);
    
    if (successfulSummaries.length === 0) {
      return originalTweet + '\n\n[No link content could be processed]';
    }

    let context = originalTweet;
    
    context += '\n\n📰 LINKED ARTICLE SUMMARIES:\n';
    
    successfulSummaries.forEach((summary, index) => {
      context += `\n${index + 1}. "${summary.title}" (${summary.url}):\n${summary.summary}\n`;
    });

    return context;
  }

  /**
   * Create a short summary for bias analysis
   * @param {Array} summaries - Array of summary objects
   * @returns {string} - Short combined summary for political analysis
   */
  createBiasAnalysisContext(summaries) {
    const successfulSummaries = summaries.filter(s => s.success && s.summary);
    
    if (successfulSummaries.length === 0) {
      return '';
    }

    if (successfulSummaries.length === 1) {
      return successfulSummaries[0].summary;
    }

    // Combine multiple summaries
    const combined = successfulSummaries
      .map(s => s.summary)
      .join(' ');

    return combined;
  }
}

module.exports = ContentSummarizer; 