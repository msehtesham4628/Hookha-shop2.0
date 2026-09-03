import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.js';
import { SITE_DOMAIN, SITE_NAME } from '../../shared/seoConstants.js';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  jsonLd?: Record<string, any> | Record<string, any>[];
  ruTitle?: string;
  ruDescription?: string;
}

function updateOrCreateMeta(selector: string, attributeName: string, attributeValue: string, content: string) {
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateOrCreateLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang 
    ? `link[rel="${rel}"][hreflang="${hreflang}"]` 
    : `link[rel="${rel}"]:not([hreflang])`;
  
  let element = document.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    if (hreflang) {
      element.setAttribute('hreflang', hreflang);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  canonicalPath = '/',
  ogImage,
  ogType = 'website',
  jsonLd,
  ruTitle,
  ruDescription
}) => {
  const { currentLanguage } = useLanguage();
  const isRussian = currentLanguage === 'ru';

  useEffect(() => {
    // 1. Resolve localized Title
    let finalTitle = isRussian && ruTitle ? ruTitle : title;
    if (!finalTitle) {
      finalTitle = `${SITE_NAME} - Premier Hookahs, Shisha Tobacco, Bowls & Accessories | USA & Russia`;
    } else if (!finalTitle.includes(SITE_NAME) && !finalTitle.includes('Fumare')) {
      finalTitle = `${finalTitle} | ${SITE_NAME}`;
    }

    // 2. Resolve localized Description
    let finalDesc = isRussian && ruDescription ? ruDescription : description;
    if (!finalDesc) {
      finalDesc = 'Official master distributor for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear & premium shisha tobacco with fast USA & worldwide shipping.';
    }

    // 3. Keywords
    const defaultKeywords = [
      'Fumare Hookah',
      'buy hookah online',
      'Russian hookahs USA',
      'MustHave shisha tobacco',
      'DarkSide tobacco',
      'Alpha Hookah Model X',
      'купить кальян',
      'табак для кальяна',
      'кальян с доставкой',
      'Oblako bowls',
      'MattPear hookah'
    ];
    const finalKeywords = Array.from(new Set([...keywords, ...defaultKeywords])).join(', ');

    // 4. Absolute Canonical & Hreflang URLs
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${SITE_DOMAIN}${cleanPath}`;
    const enUrl = `${SITE_DOMAIN}${cleanPath}`;
    const ruUrl = cleanPath.includes('?') 
      ? `${SITE_DOMAIN}${cleanPath}&lang=ru` 
      : `${SITE_DOMAIN}${cleanPath}?lang=ru`;

    // Set Document Title
    document.title = finalTitle;

    // Standard Meta Tags
    updateOrCreateMeta('meta[name="description"]', 'name', 'description', finalDesc);
    updateOrCreateMeta('meta[name="keywords"]', 'name', 'keywords', finalKeywords);
    updateOrCreateMeta('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateOrCreateMeta('meta[name="googlebot"]', 'name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateOrCreateMeta('meta[name="yandex"]', 'name', 'yandex', 'index, follow');
    updateOrCreateMeta('meta[name="geo.region"]', 'name', 'geo.region', 'US;RU');
    updateOrCreateMeta('meta[name="geo.placename"]', 'name', 'geo.placename', 'United States; Russia');

    // Canonical & Hreflang Links
    updateOrCreateLink('canonical', canonicalUrl);
    updateOrCreateLink('alternate', enUrl, 'en-US');
    updateOrCreateLink('alternate', enUrl, 'en');
    updateOrCreateLink('alternate', ruUrl, 'ru-RU');
    updateOrCreateLink('alternate', ruUrl, 'ru');
    updateOrCreateLink('alternate', canonicalUrl, 'x-default');

    // OpenGraph Meta Tags
    updateOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    updateOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', finalDesc);
    updateOrCreateMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    updateOrCreateMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    updateOrCreateMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    updateOrCreateMeta('meta[property="og:locale"]', 'property', 'og:locale', isRussian ? 'ru_RU' : 'en_US');
    updateOrCreateMeta('meta[property="og:locale:alternate"]', 'property', 'og:locale:alternate', isRussian ? 'en_US' : 'ru_RU');
    if (ogImage) {
      updateOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
      updateOrCreateMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', finalTitle);
    }

    // Twitter Card Tags
    updateOrCreateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    updateOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    if (ogImage) {
      updateOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    }

    // Structured Data (JSON-LD)
    let jsonLdScript = document.getElementById('seo-dynamic-jsonld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'seo-dynamic-jsonld';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [
    title,
    description,
    keywords,
    canonicalPath,
    ogImage,
    ogType,
    jsonLd,
    ruTitle,
    ruDescription,
    currentLanguage,
    isRussian
  ]);

  return null;
};
