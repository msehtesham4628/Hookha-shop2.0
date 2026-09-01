import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext.js';
import { BookOpen, X, ChevronRight, Sparkles, CheckCircle2, Flame } from 'lucide-react';

interface StoryItem {
  id: string;
  titleKey: string;
  defaultTitle: string;
  category: 'tobacco' | 'hookahs' | 'bowls' | 'all';
  icon: string;
  readTime: string;
  content: {
    subtitle: string;
    paragraphs: string[];
    tips: string[];
  };
}

const STORIES: StoryItem[] = [
  {
    id: 'story-flavor-diversity',
    titleKey: 'story.flavor_diversity',
    defaultTitle: 'Diversity of Hookah Tobacco Flavors',
    category: 'tobacco',
    icon: '🍇',
    readTime: '3 min read',
    content: {
      subtitle: 'From Mono-Flavors to Gastronomic Compositions',
      paragraphs: [
        'Modern shisha tobacco is split between mono-flavors (single fruit, berry, or dessert notes) and complex multi-layered gastronomic blends. Brands like MustHave and DarkSide use natural aromatic distillates that withstand high heat without scorching.',
        'When selecting flavors, identify the base note (e.g. DarkSide Ice Granny), the body note (e.g. MustHave Pinkman), and the accent note (e.g. Tangiers Cane Mint or BlackBurn Lemon Sweets).',
        'Cigar leaf blends (such as Bonche) use whole-leaf Cuban and Caribbean fillers, offering earthy, oaky, and dark cocoa undertones that evolve throughout a 90-minute session.'
      ],
      tips: [
        'Do not overmix more than 3-4 aromas in one bowl to prevent muddy tasting profiles.',
        'Pair sweet dessert bases with a 15-20% sour or cooling citrus accent.',
        'Dark leaf tobacco requires 4-5 minutes of initial warm-up under 3 coconut charcoal cubes.'
      ]
    }
  },
  {
    id: 'story-tobacco-raw',
    titleKey: 'story.tobacco_raw',
    defaultTitle: 'Tobacco Raw Materials: Burley vs Virginia',
    category: 'tobacco',
    icon: '🍂',
    readTime: '4 min read',
    content: {
      subtitle: 'Understanding Leaf Varieties and Heat Resistance',
      paragraphs: [
        'Virginia Golden Leaf is light, blonde, and naturally sweet due to higher glucose levels. It produces voluminous white clouds with mild nicotine impact (ideal for social and beginner sessions).',
        'Burley Leaf is unwashed and boiled to absorb heavy molasses and high nicotine strength. It delivers a robust throat feel and deep tobacco flavor that thrives under intense thermal energy.',
        'Oriental and Cigar Leaves add rich earthy, leather, and spicy accents, making them popular in boutique artisanal lines like Bonche and Tangiers Noir.'
      ],
      tips: [
        'Virginia leaf is best packed fluffy in classic Turkish/Killer clay bowls.',
        'Burley leaf performs exceptionally well in glazed Phunnel bowls with Kaloud Lotus HMDs.'
      ]
    }
  },
  {
    id: 'story-phunnel-vs-killer',
    titleKey: 'story.phunnel_vs_killer',
    defaultTitle: 'Phunnel vs Killer / Turkish Bowls',
    category: 'bowls',
    icon: '🏺',
    readTime: '3 min read',
    content: {
      subtitle: 'Choosing the Optimal Geometry for Thermal Efficiency',
      paragraphs: [
        'Phunnel Bowls feature a single elevated central spire. The juice and syrup remain inside the bowl moat, guaranteeing that your hookah base water remains crystal clean while keeping tobacco moist throughout the session.',
        'Killer & Turkish Bowls have 5 to 7 open bottom holes. Air passes directly through all tobacco layers, extracting maximum nicotine strength and an intense flavor burst.',
        'Glazed semi-porcelain bowls (like Oblako Flow and Kong Godzilla) heat up quickly and resist syrup absorption, whereas unglazed terracotta clay distributes heat gently.'
      ],
      tips: [
        'Use Phunnel bowls for juicy, syrupy dark leaf like MustHave, DarkSide, and Fumari.',
        'Use Killer / Turkish bowls for traditional blonde leaf or dense, dry packs like Tangiers.'
      ]
    }
  },
  {
    id: 'story-mixology-rules',
    titleKey: 'story.mixology_rules',
    defaultTitle: 'Basic Rules of Hookah Mixology',
    category: 'tobacco',
    icon: '🧪',
    readTime: '3 min read',
    content: {
      subtitle: 'The 50/30/20 Golden Ratio for Professional Lounges',
      paragraphs: [
        'Professional hookah mixologists rely on the 50/30/20 formula to craft balanced bowls: 50% Primary Dominant Flavor (e.g., Peach or Mango), 30% Secondary Body Note (e.g., Raspberry or Spiced Tea), and 20% Accent Modifier (e.g., Cane Mint or Lemongrass).',
        'You can either layer the tobacco in sections (sector packing) or blend all leaves homogeneously on a wooden cutting board before placing into the bowl.',
        'Sector packing allows different notes to reveal themselves at different temperatures during the session.'
      ],
      tips: [
        'Always place high-heat resistant dark leaf closer to the bowl rim.',
        'Never press wet tobacco down so hard that you seal the airflow.'
      ]
    }
  },
  {
    id: 'story-packing-techniques',
    titleKey: 'story.packing_techniques',
    defaultTitle: 'Ways of Packing a Hookah Bowl',
    category: 'bowls',
    icon: '💨',
    readTime: '4 min read',
    content: {
      subtitle: 'Fluffy vs Semi-Dense vs Overpack',
      paragraphs: [
        'Fluffy Pack: Lightly drop tobacco into the bowl without pressing down, leaving a 2mm gap beneath the foil or HMD. Provides smooth airflow and medium strength.',
        'Semi-Dense Pack: Gently pat down the tobacco with a hookah fork until level. Perfect for dark leaf like MustHave and DarkSide in Phunnel bowls.',
        'Overpack: Tobacco touches the HMD metal base directly to create a protective charred crust that yields intense nicotine hits.'
      ],
      tips: [
        'Maintain a 2mm rim clearance to prevent direct scorching when using aluminum HMDs.',
        'Poke a clean central airflow tunnel when using Turkish or Egyptian multi-hole bowls.'
      ]
    }
  },
  {
    id: 'story-maintenance-care',
    titleKey: 'story.maintenance_care',
    defaultTitle: 'How often should a hookah be cleaned?',
    category: 'hookahs',
    icon: '🧼',
    readTime: '2 min read',
    content: {
      subtitle: 'Preserving Aerospace-Grade Stainless Steel & Crystal Glass',
      paragraphs: [
        'Clean your hookah stem, base, and silicone hose after every 2-3 sessions to prevent flavor ghosting and mineral scale buildup.',
        'Use warm water with baking soda and a specialized shaft brush. Avoid boiling water on glass bases to prevent thermal shock cracks.',
        'Medical-grade silicone hoses can be rinsed with warm lemon water and hung vertically to dry completely.'
      ],
      tips: [
        'Always purge condensation from the purge valve ball bearings after washing.',
        'Apply food-grade silicone grease to magnetic connectors and O-rings once a month.'
      ]
    }
  }
];

export const CategoryStories: React.FC<{ categorySlug?: string }> = ({ categorySlug }) => {
  const { t } = useTranslation();
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);

  const filteredStories = categorySlug
    ? STORIES.filter(s => s.category === categorySlug || s.category === 'all' || (categorySlug === 'tobacco' && s.category === 'tobacco') || (categorySlug === 'bowls' && (s.category === 'bowls' || s.category === 'tobacco')) || (categorySlug === 'hookahs' && s.category === 'hookahs'))
    : STORIES;

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-800" />
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900">
            {t('category.educational_guides', 'Knowledge & Shisha Guides')}
          </h3>
        </div>
        <span className="text-[11px] text-stone-400 font-medium">Click to read guides</span>
      </div>

      {/* Horizontal Scroll Story Chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {filteredStories.map((story) => (
          <button
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="group flex-shrink-0 flex items-center gap-3 bg-white hover:bg-amber-50/70 border border-stone-200/90 hover:border-amber-700/60 rounded-full py-2 px-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center text-base border border-stone-200/80 transition-colors">
              {story.icon}
            </div>
            <div className="pr-1">
              <span className="block text-xs font-bold text-stone-800 group-hover:text-amber-950 line-clamp-1 max-w-[200px]">
                {t(story.titleKey, story.defaultTitle)}
              </span>
              <span className="block text-[10px] text-stone-400 font-medium">
                {story.readTime}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>

      {/* Story Reader Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-sm border border-stone-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-2xl flex items-center justify-center">
                {activeStory.icon}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Master Shisha Guide • {activeStory.readTime}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                  {t(activeStory.titleKey, activeStory.defaultTitle)}
                </h3>
              </div>
            </div>

            <div className="text-xs font-semibold text-amber-900 mb-3 bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xs">
              {activeStory.content.subtitle}
            </div>

            {/* Paragraphs */}
            <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
              {activeStory.content.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Pro Tips Box */}
            <div className="mt-5 p-4 bg-stone-50 border border-stone-200 rounded-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                <span>Lounge Master Pro Tips</span>
              </div>
              <ul className="space-y-2 text-[11px] text-stone-600">
                {activeStory.content.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setActiveStory(null)}
                className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors cursor-pointer"
              >
                {t('common.close', 'Close Guide')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
