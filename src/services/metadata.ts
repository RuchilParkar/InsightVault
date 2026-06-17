export interface ExtractedMetadata {
  title?: string;
  domain?: string;
  thumbnail?: string;
}

export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    
    // Lightweight timeout-based fetch to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InsightVaultBot/1.0)',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return { domain };
    }
    
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;
    
    // Extract og:image
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/i) || 
                         html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"[^>]*>/i);
    const thumbnail = ogImageMatch ? ogImageMatch[1].trim() : undefined;
    
    return {
      title: title && title.length > 0 ? title : undefined,
      domain,
      thumbnail: thumbnail && thumbnail.startsWith('http') ? thumbnail : undefined,
    };
  } catch (error) {
    console.log('Metadata extraction failed, falling back to basic extraction:', error);
    try {
      // Fallback domain extraction
      const urlObj = new URL(url);
      return { domain: urlObj.hostname.replace(/^www\./, '') };
    } catch {
      return {};
    }
  }
}
