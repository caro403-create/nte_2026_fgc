/**
 * Auto-translation utility using MyMemory API (free, no key required)
 * Limits: ~5000 chars/day without key, 50000/day with free email key
 * Endpoint: https://api.mymemory.translated.net/get
 */

// In-memory cache to avoid repeated API calls for the same text
const translationCache = new Map();

/**
 * Translate a text string from Spanish to English using MyMemory.
 * Returns the original text if translation fails or is unavailable.
 */
export async function translateText(text, from = 'es', to = 'en') {
  if (!text || text.trim().length === 0) return text;

  // Check cache first
  const cacheKey = `${from}|${to}|${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // MyMemory has a 500 char limit per request, so split long texts
    const chunks = splitText(text, 450);
    const translatedChunks = [];

    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        // If API fails, return original
        console.warn('Translation API returned non-OK status:', response.status);
        return text;
      }

      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        let translated = data.responseData.translatedText;
        // MyMemory sometimes returns ALL-CAPS for short texts, fix that
        if (translated === translated.toUpperCase() && chunk !== chunk.toUpperCase()) {
          translated = translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase();
        }
        translatedChunks.push(translated);
      } else {
        // Quota exceeded or error — return original
        console.warn('Translation quota or error:', data.responseStatus, data.responseData?.translatedText);
        translationCache.set(cacheKey, text); // Cache the failure to avoid retrying
        return text;
      }
    }

    const result = translatedChunks.join(' ');
    translationCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Translation error:', err);
    translationCache.set(cacheKey, text);
    return text;
  }
}

/**
 * Split text into chunks of maxLen characters, breaking at sentence boundaries.
 */
function splitText(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find last sentence break within maxLen
    let breakPoint = -1;
    const searchArea = remaining.substring(0, maxLen);
    
    // Prefer breaking at period, then newline, then comma, then space
    for (const sep of ['. ', '.\n', '\n', ', ', ' ']) {
      const idx = searchArea.lastIndexOf(sep);
      if (idx > maxLen * 0.3) { // Don't break too early
        breakPoint = idx + (sep === ' ' ? 0 : sep.length);
        break;
      }
    }

    if (breakPoint <= 0) {
      // Force break at maxLen
      breakPoint = maxLen;
    }

    chunks.push(remaining.substring(0, breakPoint).trim());
    remaining = remaining.substring(breakPoint).trim();
  }

  return chunks;
}

/**
 * Batch translate title + content for a post (or comment).
 * Returns { title, content } translated.
 */
export async function translatePost(title, content) {
  const [translatedTitle, translatedContent] = await Promise.all([
    translateText(title),
    translateText(content)
  ]);
  return { title: translatedTitle, content: translatedContent };
}

/**
 * Clear the translation cache (useful if needed for testing).
 */
export function clearTranslationCache() {
  translationCache.clear();
}
