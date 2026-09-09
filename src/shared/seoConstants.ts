/**
 * SEO Architecture Constants & Schema Generators for USA & Russia Search Domination
 * Targets:
 * - USA: Google.com, Bing, Yahoo (English)
 * - Russia: Yandex, Google.ru (Russian & English / Transliteration)
 */

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  jsonLd?: Record<string, any> | Record<string, any>[];
  ruTitle?: string;
  ruDescription?: string;
}

export const SITE_DOMAIN = 'https://fumarehookah.com';
export const SITE_NAME = 'Fumare Hookah';

// High-value keyword clusters for USA & Russian hookah / shisha markets
export const MARKET_KEYWORDS = {
  global: [
    'Fumare Hookah',
    'buy hookah online',
    'Russian hookahs',
    'shisha tobacco online',
    'hookah shop USA',
    'купить кальян',
    'табак для кальяна',
    'hookah lounge wholesale',
    'dark leaf tobacco'
  ],
  categories: {
    hookahs: {
      en: [
        'Russian hookahs USA',
        'buy Alpha Hookah online',
        'MattPear hookah',
        'El Bomber hookah',
        'Maklaud hookah dragon',
        'Wookah crystal hookah',
        'stainless steel hookah AISI 304',
        'modern hookahs USA',
        'best Russian hookahs 2026'
      ],
      ru: [
        'кальяны купить',
        'Alpha Hookah Model X купить',
        'кальян Альфа Хука',
        'кальян MattPear',
        'кальян El Bomber',
        'кальян Maklaud',
        'русские кальяны с доставкой',
        'кальяны из нержавеющей стали'
      ]
    },
    tobacco: {
      en: [
        'Russian dark leaf tobacco USA',
        'MustHave shisha tobacco',
        'DarkSide tobacco flavors',
        'BlackBurn hookah tobacco',
        'Tangiers tobacco online',
        'Bonche cigar leaf shisha',
        'Element hookah tobacco',
        'buy shisha tobacco online USA',
        'best hookah tobacco 2026'
      ],
      ru: [
        'табак для кальяна купить',
        'табак MustHave Мастхэв',
        'табак DarkSide Дарксайд',
        'табак BlackBurn Блэкберн',
        'крепкий табак для кальяна',
        'оригинальный табак для кальяна с доставкой',
        'вкусы мастхэв',
        'вкусы дарксайд'
      ]
    },
    bowls: {
      en: [
        'Oblako bowls USA',
        'Kong hookah bowl',
        'Alpaca bowls',
        'Cosmo bowl',
        'phunnel bowl for shisha',
        'Turkish clay hookah bowl',
        'best hookah bowls for dark leaf'
      ],
      ru: [
        'чаши для кальяна',
        'чаша Облако Oblako купить',
        'чаша Kong Конг',
        'чаша фанел phunnel',
        'глиняная чаша для кальяна',
        'лучшие чаши для табака'
      ]
    },
    bases: {
      en: [
        'Russian drop hookah vase',
        'Bohemian crystal hookah base',
        'craft glass shisha base',
        'Caesar crystal base USA',
        'Big Maks bases'
      ],
      ru: [
        'колбы для кальяна',
        'колба капля',
        'хрустальная колба для кальяна',
        'крафтовая колба',
        'купить колбу для кальяна'
      ]
    },
    coal: {
      en: [
        'natural coconut charcoal for hookah',
        'Coco Loco coal 26mm',
        '28mm jumbo coconut coal',
        'Oasis charcoal',
        'low ash hookah coal USA'
      ],
      ru: [
        'уголь для кальяна',
        'кокосовый уголь Coco Loco',
        'уголь 26мм для кальяна',
        'натуральный уголь без запаха'
      ]
    },
    accessories: {
      en: [
        'Kaloud Lotus HMD',
        'Na Grani stainless steel HMD',
        'heat management device for hookah',
        'medical silicone hookah hose',
        'Blade hookah tongs'
      ],
      ru: [
        'калауд для кальяна',
        'калауд На Грани',
        'контроллер жара',
        'щипцы для кальяна',
        'аксессуары для кальяна'
      ]
    },
    'e-hookah': {
      en: [
        'electronic hookah head',
        'e-head shisha vaporizer',
        'Ooka portable hookah',
        'smoke-free electronic hookah'
      ],
      ru: [
        'электронный кальян',
        'электронная чаша для кальяна e-head',
        'портативный электронный кальян'
      ]
    },
    vapes: {
      en: [
        'disposable vapes USA',
        'Al Fakher Crown Bar disposable',
        'Geek Bar Pulse 15000',
        'Lost Mary vape',
        'nicotine salt vape pods'
      ],
      ru: [
        'одноразовые вейпы',
        'Al Fakher Crown Bar',
        'купить вейп онлайн'
      ]
    },
    'wholesale-supplies': {
      en: [
        'hookah lounge wholesale supplier USA',
        '1kg shisha tobacco bulk',
        '20kg hookah charcoal master case',
        'wholesale Alpha Hookah distributor',
        'commercial hookah lounge supplies'
      ],
      ru: [
        'оптовые поставки кальянов и табака',
        'табак для кальяна оптом 1кг',
        'уголь для кальяна оптом',
        'кальяны для заведений опт'
      ]
    }
  }
};

/**
 * Generates the Organization Schema.org payload (USA & Russia multi-location support)
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_DOMAIN}/#organization`,
    name: SITE_NAME,
    alternateName: ['Fumare Hookah Co.', 'Sultan Hookah Co.', 'Фумаре Кальяны'],
    url: SITE_DOMAIN,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_DOMAIN}/logo.png`,
      caption: 'Fumare Hookah - Premier Hookahs & Shisha Tobacco Master Distributor'
    },
    description: 'Official master distributor and premier online retailer for Alpha Hookah, MustHave, DarkSide, Oblako, Kong, MattPear, and luxury shisha tobacco in the USA, Russia, and worldwide.',
    email: 'support@fumarehookah.com',
    telephone: '+1-800-785-8260',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '100 Hookah Boulevard, Suite 500',
      addressLocality: 'Miami',
      addressRegion: 'FL',
      postalCode: '33101',
      addressCountry: 'US'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+1-800-785-8260',
        contactType: 'customer service',
        areaServed: ['US', 'CA', 'GB', 'EU'],
        availableLanguage: ['English', 'Spanish']
      },
      {
        '@type': 'ContactPoint',
        email: 'russia@fumarehookah.com',
        contactType: 'Russian customer support & wholesale',
        areaServed: ['RU', 'KZ', 'BY', 'AM', 'GE'],
        availableLanguage: ['Russian', 'English']
      }
    ],
    sameAs: [
      'https://www.instagram.com/fumarehookah',
      'https://t.me/fumarehookah',
      'https://vk.com/fumarehookah'
    ]
  };
}

/**
 * Generates the WebSite Schema.org with Google / Yandex Sitelinks SearchBox
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_DOMAIN}/#website`,
    url: SITE_DOMAIN,
    name: SITE_NAME,
    alternateName: 'Fumare Hookah Online Store',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_DOMAIN}/shop?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: ['en-US', 'ru-RU']
  };
}

/**
 * Generates Dual-Region FAQPage Schema (Boosts Google & Yandex Rich Snippets / PAA)
 */
export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you ship authentic Russian hookahs and shisha tobacco across the USA and worldwide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Fumare Hookah provides lightning-fast express shipping across all 50 US states, Russia, Canada, and Europe. All orders are carefully packed in shockproof discrete packaging with certified 21+ adult age verification.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are your MustHave, DarkSide, and Alpha Hookah products 100% genuine and factory-sealed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every single product sold on Fumare Hookah is 100% authentic, brand-new, and sourced directly from official manufacturers in Saint Petersburg, Moscow, and international facilities. We guarantee factory seals, serial numbers, and authentic QR codes.'
        }
      },
      {
        '@type': 'Question',
        name: 'Как заказать оригинальный российский кальян и табак с быстрой доставкой?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Fumare Hookah является официальным мастер-дистрибьютором брендов Alpha Hookah, MustHave, DarkSide, Oblako, Kong и MattPear. Мы осуществляем оперативную экспресс-доставку по США, России и странам СНГ с гарантией 100% оригинальности продукции.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do you offer wholesale pricing for hookah lounges and smoke shops?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we supply licensed hookah lounges, bars, and retailers with volume wholesale tiers for 1kg shisha tins, master coal cases, and hookahs at master distributor prices. Apply via our Wholesale page.'
        }
      }
    ]
  };
}

/**
 * Generates Product Schema.org with Offer, Brand, InStock, and AggregateRating
 */
export function getProductSchema(product: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  brand: string;
  category: string;
  categorySlug: string;
  images: Array<{ url: string }>;
  stock: number;
  rating?: number;
  reviewCount?: number;
}) {
  const currentPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const productUrl = `${SITE_DOMAIN}/product/${product.slug}`;
  const imageUrls = (product.images || []).map(img => img.url).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    url: productUrl,
    image: imageUrls.length > 0 ? imageUrls : [`${SITE_DOMAIN}/logo.png`],
    description: product.description ? product.description.slice(0, 300) : `${product.name} - official distributor item available at Fumare Hookah.`,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Fumare Hookah'
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: currentPrice.toFixed(2),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: 'USD'
        },
        shippingDestination: [
          {
            '@type': 'DefinedRegion',
            addressCountry: 'US'
          },
          {
            '@type': 'DefinedRegion',
            addressCountry: 'RU'
          }
        ],
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY'
          }
        }
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: ['US', 'RU'],
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (product.rating || 4.9).toFixed(1),
      reviewCount: Math.max(product.reviewCount || 1, 1),
      bestRating: '5',
      worstRating: '1'
    }
  };
}

/**
 * Generates BreadcrumbList Schema.org
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_DOMAIN}${item.url}`
    }))
  };
}

/**
 * Generates ItemList Schema.org for Collections / Categories
 */
export function getItemListSchema(title: string, items: Array<{ name: string; url: string; image?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: items.slice(0, 24).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE_DOMAIN}${item.url}`,
      image: item.image
    }))
  };
}

// Re-export dynamic Product SEO helpers
export {
  generateProductMeta,
  generateProductMetaTitle,
  generateProductMetaDescription,
  generateProductMetaTitleRu,
  generateProductMetaDescriptionRu,
  generateProductKeywords,
  extractProductAttributes,
  truncateCleanly,
  type ProductMetaInput,
  type ProductMetaOptions,
  type ProductMetaData
} from './productSeoHelper.js';

