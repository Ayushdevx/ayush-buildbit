/**
 * Utility functions for validating and enhancing generated HTML
 */

export interface HTMLValidationResult {
  isValid: boolean;
  hasDoctype: boolean;
  hasHtmlTag: boolean;
  hasHeadTag: boolean;
  hasBodyTag: boolean;
  hasTitleTag: boolean;
  hasViewportMeta: boolean;
  hasTailwindCSS: boolean;
  sectionCount: number;
  imageCount: number;
  formCount: number;
  errors: string[];
  warnings: string[];
}

/**
 * Validate the structure and content of generated HTML
 */
export function validateGeneratedHTML(html: string): HTMLValidationResult {
  const result: HTMLValidationResult = {
    isValid: true,
    hasDoctype: false,
    hasHtmlTag: false,
    hasHeadTag: false,
    hasBodyTag: false,
    hasTitleTag: false,
    hasViewportMeta: false,
    hasTailwindCSS: false,
    sectionCount: 0,
    imageCount: 0,
    formCount: 0,
    errors: [],
    warnings: []
  };

  // Basic structure validation
  result.hasDoctype = /<!DOCTYPE html>/i.test(html);
  result.hasHtmlTag = /<html[^>]*>/i.test(html);
  result.hasHeadTag = /<head[^>]*>/i.test(html);
  result.hasBodyTag = /<body[^>]*>/i.test(html);
  result.hasTitleTag = /<title[^>]*>.*<\/title>/i.test(html);
  result.hasViewportMeta = /viewport.*width=device-width/i.test(html);
  result.hasTailwindCSS = /tailwindcss\.com/i.test(html) || /tailwind/i.test(html);

  // Count elements
  result.sectionCount = (html.match(/<(section|header|footer|main|article|aside)[^>]*>/gi) || []).length;
  result.imageCount = (html.match(/<img[^>]*>/gi) || []).length;
  result.formCount = (html.match(/<form[^>]*>/gi) || []).length;

  // Error checking
  if (!result.hasDoctype) {
    result.errors.push('Missing DOCTYPE declaration');
    result.isValid = false;
  }

  if (!result.hasHtmlTag) {
    result.errors.push('Missing HTML tag');
    result.isValid = false;
  }

  if (!result.hasHeadTag) {
    result.errors.push('Missing HEAD section');
    result.isValid = false;
  }

  if (!result.hasBodyTag) {
    result.errors.push('Missing BODY tag');
    result.isValid = false;
  }

  if (!result.hasTitleTag) {
    result.warnings.push('Missing TITLE tag (impacts SEO)');
  }

  if (!result.hasViewportMeta) {
    result.warnings.push('Missing viewport meta tag (impacts mobile responsiveness)');
  }

  if (!result.hasTailwindCSS) {
    result.warnings.push('Tailwind CSS not detected');
  }

  if (result.sectionCount < 3) {
    result.warnings.push('Less than 3 major sections detected - website might be too simple');
  }

  return result;
}

/**
 * Enhance HTML with missing critical elements
 */
export function enhanceHTML(html: string): string {
  let enhanced = html;

  // Add DOCTYPE if missing
  if (!/<!DOCTYPE html>/i.test(enhanced)) {
    enhanced = `<!DOCTYPE html>\n${enhanced}`;
  }

  // Add viewport meta tag if missing in head section
  if (!/viewport.*width=device-width/i.test(enhanced) && /<head[^>]*>/i.test(enhanced)) {
    enhanced = enhanced.replace(
      /(<head[^>]*>)/i,
      '$1\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
  }

  // Add Tailwind CSS if missing
  if (!/tailwindcss\.com/i.test(enhanced) && /<head[^>]*>/i.test(enhanced)) {
    enhanced = enhanced.replace(
      /(<head[^>]*>[\s\S]*?)(<\/head>)/i,
      '$1    <script src="https://cdn.tailwindcss.com"></script>\n$2'
    );
  }

  return enhanced;
}

/**
 * Extract metadata from generated HTML
 */
export function extractHTMLMetadata(html: string) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : 'Untitled Website',
    description: descriptionMatch ? descriptionMatch[1].trim() : 'AI-generated website',
    length: html.length,
    wordCount: html.split(/\s+/).length,
    hasModernFeatures: {
      gradients: /gradient/i.test(html),
      animations: /(transition|transform|animate)/i.test(html),
      responsiveDesign: /(md:|lg:|xl:|sm:)/i.test(html),
      flexbox: /flex/i.test(html),
      grid: /grid/i.test(html)
    }
  };
}
