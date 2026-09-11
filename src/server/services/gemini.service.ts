import { GoogleGenAI } from '@google/genai';

export interface GenerateDescriptionParams {
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  flavor?: string;
  material?: string;
  price?: number;
  currentDescription?: string;
  tone?: 'luxury-editorial' | 'connoisseur-sommelier' | 'concise-luxury';
}

export interface GeneratedDescriptionResult {
  description: string;
  shortDescription: string;
  highlights: string[];
  source: 'gemini' | 'fallback';
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export async function generateLuxuryProductDescription(
  params: GenerateDescriptionParams
): Promise<GeneratedDescriptionResult> {
  const {
    name,
    brand = 'Fumare Private Reserve',
    category = 'Hookahs',
    subcategory = '',
    flavor = '',
    material = '',
    price,
    currentDescription = '',
    tone = 'luxury-editorial'
  } = params;

  const toneInstructions = {
    'luxury-editorial':
      'Tone: Haute luxury, architectural precision, sensory elegance, and opulent storytelling. Frame as a bespoke collector piece for discerning connoisseurs.',
    'connoisseur-sommelier':
      'Tone: Master sommelier and hookah lounge artisan. Focus on flavor alchemy, heat retention, draw calibration, cloud density, and thermal dynamics.',
    'concise-luxury':
      'Tone: Crisp, minimalist European luxury. High-impact copy, refined specifications, and sophisticated brevity.'
  }[tone] || 'Haute luxury with sensory and engineering precision.';

  const prompt = `
Product Details:
- Title: ${name}
- Brand / Maison: ${brand}
- Primary Category: ${category}
${subcategory ? `- Subcategory / Collection: ${subcategory}` : ''}
${flavor ? `- Flavor Profile / Aroma Notes: ${flavor}` : ''}
${material ? `- Materials & Finish: ${material}` : ''}
${price ? `- Retail Price Tier: $${price}` : ''}
${currentDescription ? `- Existing Raw Notes / Context: ${currentDescription}` : ''}

Style & Directives:
${toneInstructions}

Please output your response as valid JSON with the following structure:
{
  "shortDescription": "A single evocative, high-impact 1-sentence tagline (under 140 characters) suitable for luxury collection preview cards.",
  "description": "The complete luxury product description. It must contain: 1) An evocative lead paragraph setting the mood and pedigree; 2) A detailed body paragraph detailing craftsmanship, engineering tolerances, flavor release or thermal dynamics; 3) A formatted bulleted section of 'Highlights & Specifications' (using markdown '- ' bullet points) covering materials, engineering/pack style, and sensory performance.",
  "highlights": ["3 to 5 succinct luxury bullet points summarizing key specifications or craft details"]
}
`;

  const client = getAiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are the Executive Brand Director & Master Sommelier for Fumare Hookah (World Hookah Market), the premier worldwide boutique purveyor of authentic Russian and European luxury hookahs (Alpha Hookah, MattPear, Wookah, Steamulation), artisan stoneware & glazed phunnel bowls (Oblako, Kong, Werkbund), and world-class dark leaf & blonde tobacco blends (MustHave, DarkSide, BlackBurn, Tangiers).

You write captivating, highly polished, luxury-focused, professional product descriptions for affluent collectors and premier lounge proprietors.
- Avoid tacky marketing jargon, generic buzzwords ("revolutionary", "game-changer", "supercharge"), or robotic repetition.
- Emphasize authentic craftsmanship: medical-grade AISI 304 stainless steel, anodized aeronautical alloys, hand-turned exotic hardwoods, hand-cast stoneware clay, cold-pressed Virginia & Burley tobaccos, and micro-calibrated purge valves.
- Return strictly valid JSON containing "shortDescription", "description", and "highlights".`,
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text?.trim() || '';
      if (rawText) {
        try {
          // Parse JSON directly or strip any surrounding markdown fences
          const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && typeof parsed.description === 'string' && parsed.description.length > 20) {
            return {
              description: parsed.description,
              shortDescription: parsed.shortDescription || `${brand} ${name} — Mastercrafted for extraordinary smoking excellence.`,
              highlights: Array.isArray(parsed.highlights) && parsed.highlights.length > 0 ? parsed.highlights : [
                `Authentic ${brand} precision craftsmanship`,
                category === 'Shisha Tobacco' ? 'Rich, dense aroma release with long-lasting heat stability' : 'Engineered draw ergonomics and whisper-quiet airflow',
                material ? `Crafted from premium ${material}` : 'Medical-grade AISI 304 stainless steel & durable finishes'
              ],
              source: 'gemini'
            };
          }
        } catch (jsonErr) {
          console.warn('[GeminiService] JSON parse failed, utilizing raw text:', jsonErr);
          // If the model returned plain text instead of JSON
          return {
            description: rawText,
            shortDescription: `${brand} ${name} — Bespoke craftsmanship and connoisseur performance.`,
            highlights: [
              `Signature ${brand} design`,
              'Engineered for premium session longevity',
              'High-tolerance acoustic and thermal balance'
            ],
            source: 'gemini'
          };
        }
      }
    } catch (apiErr: any) {
      console.error('[GeminiService] Gemini API generation encountered an issue:', apiErr?.message || apiErr);
      // Fall through to luxury fallback generator
    }
  } else {
    console.info('[GeminiService] GEMINI_API_KEY not configured or empty; using luxury connoisseur template generator.');
  }

  // High-caliber luxury fallback generator
  return generateCuratedLuxuryFallback(params);
}

function generateCuratedLuxuryFallback(params: GenerateDescriptionParams): GeneratedDescriptionResult {
  const {
    name,
    brand = 'Fumare Private Reserve',
    category = 'Hookahs',
    subcategory = '',
    flavor = '',
    material = '',
    price
  } = params;

  const isTobacco = category.toLowerCase().includes('tobacco') || category.toLowerCase().includes('shisha') || !!flavor;
  const isBowl = category.toLowerCase().includes('bowl');
  const isHookah = category.toLowerCase().includes('hookah') && !isBowl && !isTobacco;
  const isAccessory = category.toLowerCase().includes('access') || category.toLowerCase().includes('heat') || category.toLowerCase().includes('hmd') || category.toLowerCase().includes('charcoal');

  if (isTobacco) {
    const flavorDescriptor = flavor || 'exquisite dark leaf blend';
    return {
      shortDescription: `An opulent symphony of ${flavorDescriptor}, masterfully cured for velvety cloud density and prolonged heat endurance.`,
      description: `Crafted for the discerning aficionado, the ${name} by ${brand} represents the pinnacle of contemporary shisha alchemy. Specially sourced Virginia and toasted Burley leaves are slow-cured with European culinary essence oils to deliver an impeccably smooth, nuanced bouquet centered around notes of ${flavorDescriptor}.

Every session reveals layered aromatic depth, striking a harmonious equilibrium between natural tobacco undertones and luscious, saturated notes. Engineered to thrive across both traditional glazed bowls and phunnels, it offers remarkable heat resilience and thick, velvety vapor plumes that endure through multi-stage heat cycles without degradation.

Highlights & Specifications:
- **Flavor Profile**: ${flavorDescriptor}
- **Leaf Composition**: Selected toasted Burley & Virginia leaf blend with natural molasses
- **Heat Management**: Outstanding thermal ceiling; pairs ideally with 3x26mm coconut coals
- **Recommended Pack**: Fluff to semi-dense pack in glazed clay or phunnel bowl
- **Origin & Pedigree**: Authentic ${brand} small-batch manufacturing`,
      highlights: [
        `Rich notes of ${flavorDescriptor}`,
        'High thermal threshold for uninterrupted 90+ minute sessions',
        'Balanced nicotine hit with ultra-dense cloud production',
        'Compatible with foil or premium aluminum HMD devices'
      ],
      source: 'fallback'
    };
  }

  if (isBowl) {
    const mat = material || 'High-fired German stoneware clay with artisan crystalline glaze';
    return {
      shortDescription: `Artisan handcrafted hookah bowl engineered from high-density clay for uniform thermal distribution and optimal juice retention.`,
      description: `The ${name} by ${brand} elevates session mechanics through uncompromising ceramic artistry. Formed from ${mat}, this bowl achieves an exceptional thermal density that distributes heat evenly across your tobacco pack, eliminating localized overheating while coaxing out the full spectrum of subtle flavor notes.

Its precisely calibrated central spire and shallow trench geometry prevent molasses leakage into your stem, preserving your hookah's cleanliness while maintaining peak moisture around the leaves. Whether paired with dark leaf blends or vibrant blonde cuts, each session yields intense, unadulterated flavor clarity.

Highlights & Specifications:
- **Craftsmanship**: Hand-thrown and kiln-fired by ${brand} artisans
- **Material & Glaze**: ${mat} with food-grade non-porous glaze
- **Capacity**: 15g – 22g (optimized for 80-100 minute sessions)
- **Device Compatibility**: Universally calibrated for Kaloud Lotus, Na Grani, and classic foil setups
- **Thermal Retention**: Superior thermal inertia prevents flavor burn and harshness`,
      highlights: [
        `High-density thermal ceramics by ${brand}`,
        'Molasses-saving design for purer airflow and clean stems',
        'Universal HMD rim diameter for secure heat placement',
        'Flawless thermal equilibrium from first pull to final coal'
      ],
      source: 'fallback'
    };
  }

  if (isHookah) {
    const mat = material || 'Surgical-grade AISI 304 stainless steel and anodized aerospace alloy';
    return {
      shortDescription: `An icon of European precision engineering, pairing whisper-quiet draw acoustics with breathtaking architectural presence.`,
      description: `Sculpted with uncompromising architectural rigor, the ${name} from ${brand} represents a crowning achievement in luxury hookah design. Fabricated from ${mat}, every contour and internal thread is machined to micron-level tolerances, delivering an effortless, glass-smooth draw that redefines session ergonomics.

Featuring ${brand}'s proprietary multi-directional purge system, stale smoke is cleared instantly in a dramatic radial cascade across the stem collar. The integrated adjustable diffuser allows seamless transitions between a traditional tactile rumble and an ultra-quiet whisper draw, making it the centerpiece of high-end private residences and distinguished VIP lounges alike.

Highlights & Specifications:
- **Core Chassis**: ${mat} with rustproof anti-corrosive guarantee
- **Purge Dynamics**: Integrated 360° vertical purge mechanism for instantaneous chamber clearing
- **Draw Calibration**: Removable multi-stage acoustic diffuser for whisper-quiet sessions
- **Connection System**: Magnetic hose port coupling and precision silicone gasket hermetic seal
- **Pedigree**: Authentic ${brand} engineering, serial-numbered and quality verified`,
      highlights: [
        `Engineered in Europe by ${brand} master craftsmen`,
        `Fabricated from ${mat}`,
        'Zero-resistance purge system with mesmerizing exhaust kinematics',
        'Modular stem architecture with magnetic quick-lock fittings'
      ],
      source: 'fallback'
    };
  }

  // Accessories / General
  const mat = material || 'Aeronautical-grade aluminum and heat-treated stainless alloy';
  return {
    shortDescription: `Engineered luxury accessory mastercrafted by ${brand} to maximize session consistency, safety, and aesthetic sophistication.`,
    description: `The ${name} from ${brand} is engineered for connoisseurs who demand perfection in every facet of their hookah ritual. Constructed from ${mat}, it merges cutting-edge thermal dynamics with minimalist luxury styling.

Designed to optimize heat transfer while protecting natural tobacco flavors from direct charcoal impurities, this essential piece ensures prolonged, velvety sessions with zero charcoal taste. A testament to functional beauty that integrates seamlessly into any high-end smoking setup.

Highlights & Specifications:
- **Materials**: ${mat}
- **Thermal Performance**: Balanced convection and conduction channels for uniform coal burning
- **Ergonomics**: Tactile heat-resistant silicone grips and calibrated airflow vents
- **Compatibility**: Standardized diameter engineered for all premier hookah bowls
- **Origin**: Designed and verified by ${brand}`,
    highlights: [
      `Signature ${brand} luxury build quality`,
      `Constructed from durable, food-safe ${mat}`,
      'Uniform heat distribution prevents tobacco scorching',
      'Effortless maintenance with corrosion-resistant finish'
    ],
    source: 'fallback'
  };
}
