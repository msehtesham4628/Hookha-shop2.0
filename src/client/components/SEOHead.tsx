import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.js';
import { SITE_DOMAIN, SITE_NAME } from '../../shared/seoConstants.js';
import { applyDocumentMetadata, DocumentMetadata, buildAbsoluteUrl } from '../services/documentMetadataService.js';

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
  const lang = (currentLanguage === 'ru' ? 'ru' : 'en') as 'en' | 'ru';

  useEffect(() => {
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = buildAbsoluteUrl(cleanPath);

    const metadata: DocumentMetadata = {
      title: title || `${SITE_NAME} - Premier Hookahs, Shisha Tobacco, Bowls & Accessories | USA & Russia`,
      ruTitle,
      description: description || 'Official master distributor for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear & premium shisha tobacco with fast USA & worldwide shipping.',
      ruDescription,
      canonicalUrl,
      canonicalPath: cleanPath,
      ogImage,
      ogType,
      keywords,
      jsonLd
    };

    applyDocumentMetadata(metadata, lang);
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
    lang
  ]);

  return null;
};

