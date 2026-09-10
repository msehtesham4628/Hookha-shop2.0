/**
 * React Hook: useDocumentMetadata
 * Automatically generates, localizes, and updates document head metadata
 * (title, canonical link, og:image, meta description, and Schema.org JSON-LD)
 * for the currently viewed product, brand, brand-category, or category page.
 */

import { useEffect, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext.js';
import { Product } from '../../types/index.js';
import { BrandAvatar } from '../data/brandsData.js';
import {
  DocumentMetadata,
  ProductMetadataInput,
  BrandMetadataInput,
  CategoryMetadataInput,
  generateProductMetadata,
  generateBrandMetadata,
  generateCategoryMetadata,
  applyDocumentMetadata
} from '../services/documentMetadataService.js';

export type UseDocumentMetadataOptions =
  | ({ type: 'product' } & ProductMetadataInput)
  | ({ type: 'brand' } & BrandMetadataInput)
  | ({ type: 'category' } & CategoryMetadataInput)
  | { type: 'custom'; metadata: DocumentMetadata };

export interface UseDocumentMetadataResult {
  metadata: DocumentMetadata | null;
  activeTitle: string;
  canonicalUrl: string;
  ogImage?: string;
}

/**
 * Unified hook that automatically computes and sets document head metadata
 */
export function useDocumentMetadata(
  options: UseDocumentMetadataOptions | null | undefined
): UseDocumentMetadataResult {
  const { currentLanguage } = useLanguage();
  const lang = (currentLanguage === 'ru' ? 'ru' : 'en') as 'en' | 'ru';

  const metadata: DocumentMetadata | null = useMemo(() => {
    if (!options) return null;

    switch (options.type) {
      case 'product': {
        if (!options.product) return null;
        return generateProductMetadata({
          product: options.product,
          categorySlug: options.categorySlug,
          page: options.page,
          lang
        });
      }
      case 'brand': {
        if (!options.brandSlug) return null;
        return generateBrandMetadata({
          brandSlug: options.brandSlug,
          brandName: options.brandName,
          brandAvatar: options.brandAvatar,
          categorySlug: options.categorySlug,
          categoryName: options.categoryName,
          page: options.page || 1,
          products: options.products || [],
          lang
        });
      }
      case 'category': {
        if (!options.categorySlug) return null;
        return generateCategoryMetadata({
          categorySlug: options.categorySlug,
          categoryName: options.categoryName,
          brandSlug: options.brandSlug,
          subcategory: options.subcategory,
          page: options.page || 1,
          products: options.products || [],
          searchQuery: options.searchQuery,
          bannerImage: options.bannerImage,
          lang
        });
      }
      case 'custom': {
        return options.metadata;
      }
      default:
        return null;
    }
  }, [options, lang]);

  useEffect(() => {
    if (metadata) {
      applyDocumentMetadata(metadata, lang);
    }
  }, [metadata, lang]);

  const activeTitle = useMemo(() => {
    if (!metadata) return '';
    return lang === 'ru' && metadata.ruTitle ? metadata.ruTitle : metadata.title;
  }, [metadata, lang]);

  return {
    metadata,
    activeTitle,
    canonicalUrl: metadata?.canonicalUrl || '',
    ogImage: metadata?.ogImage
  };
}

/**
 * Dedicated hook for Product Detail pages
 */
export function useProductHeadMetadata(
  product: Product | null | undefined,
  categorySlug?: string
): UseDocumentMetadataResult {
  return useDocumentMetadata(
    product ? { type: 'product', product, categorySlug } : null
  );
}

/**
 * Dedicated hook for Brand and Brand Category pages
 */
export function useBrandHeadMetadata(
  options: BrandMetadataInput | null | undefined
): UseDocumentMetadataResult {
  return useDocumentMetadata(
    options && options.brandSlug ? { type: 'brand', ...options } : null
  );
}

/**
 * Dedicated hook for Category & Sub-Category pages
 */
export function useCategoryHeadMetadata(
  options: CategoryMetadataInput | null | undefined
): UseDocumentMetadataResult {
  return useDocumentMetadata(
    options && options.categorySlug ? { type: 'category', ...options } : null
  );
}
