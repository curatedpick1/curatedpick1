import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are the official AI Assistant for "The Curated Pick" (thecuratedpick.store@gmail.com).
You are an expert advisor specializing in:
1. "The Curated Pick" Website & Products:
   - What the website is: An independent curation platform providing expert reviews, price drop alerts, verified discounts, and side-by-side product comparisons.
   - Key features: Live Price Drop Alerts, QR Code product scanning, side-by-side comparisons, verified buyer reviews, and curated editorial recommendations.
   - Contact email: curatedpick.store@gmail.com.
2. Amazon Associates Program:
   - Rules, operating agreements, commission rates, and policies.
   - Required disclaimer: "As an Amazon Associate I earn from qualifying purchases."
   - Strict policies: Never include affiliate links in emails, newsletters, or PDFs; do not artificially cloak links; do not list static prices without API sync; respect the 24-hour cookie window (90-day if product is added to cart); first 3 qualified sales within 180 days for account approval.
   - Optimization: Creating buying guides, comparative reviews, and targeted recommendations.
3. Pinterest Affiliate Marketing:
   - Direct affiliate links on standard pins and Idea Pins.
   - FTC and Pinterest disclosure requirements: Must clearly include #ad, #affiliate, or clear sponsored text in pin titles and descriptions.
   - Best visual format: 2:3 vertical ratio (e.g. 1000x1500px), clean typography, clear benefit-driven calls-to-action.
   - Bridge pages: Best practice is sending Pinterest traffic to detailed blog reviews or curated collections on The Curated Pick rather than raw affiliate links to build authority and lower bounce rates.
4. Other Affiliate Programs & Strategy:
   - ShareASale, CJ Affiliate, Impact, Rakuten, Awin, Target, Best Buy.
   - High-converting strategies: In-depth comparison tables, honest pros & cons, seasonal holiday roundups, and mobile-friendly UX.

Provide structured, clear, friendly, and highly actionable answers with bold key points, bullet lists, and pro tips. If asked about the website, recommend checking current deals and using price alerts.`;

// Intelligent fallback response generator for offline or unconfigured API keys
function generateOfflineAnswer(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('amazon') || q.includes('associate') || q.includes('operating agreement')) {
    return `### 📦 Amazon Associates Master Guide

Amazon Associates is the world's largest e-commerce affiliate program. Here are the essential rules, guidelines, and strategies:

#### 1. Fundamental Rules & Compliance
- **Mandatory Disclosure**: You **must** include the exact disclaimer on every page containing Amazon affiliate links:
  > *"As an Amazon Associate I earn from qualifying purchases."*
- **No Offline or Email Links**: You are strictly forbidden from placing Amazon affiliate links in emails, newsletters, eBooks, PDFs, or private messages. Links must only appear on public websites or approved social channels.
- **No Cloaking**: Never hide that a link goes to Amazon. Use approved shortlinks (e.g., \`amzn.to\`) or standard full URLs with your Associates tag (\`tag=yourtag-20\`).
- **Do Not Display Static Prices**: Amazon prices fluctuate frequently. Unless you use the official Amazon Product Advertising API (PA-API) with timestamped updates, never hardcode static prices next to Amazon links.
- **Cookie Window**: Amazon gives a **24-hour cookie**. If the user adds the item to their cart within 24 hours, the window extends to **90 days**.

#### 2. Account Approval Rule
- After signing up, you have **180 days to generate at least 3 qualified sales** from unique visitors. Once you hit 3 sales, an Amazon compliance reviewer manually inspects your website or social accounts.

#### 3. Top Best Practices
- Build in-depth product comparisons and "Best [Category] of 2026" guides.
- Focus on products with high buyer intent rather than general browsing.`;
  }

  if (q.includes('pinterest') || q.includes('pin') || q.includes('board')) {
    return `### 📌 Pinterest Affiliate Marketing Strategy

Pinterest is an incredible visual search engine with massive purchase intent. Here is how to succeed with affiliate links on Pinterest:

#### 1. Posting Affiliate Links on Pinterest
- **Direct Linking**: Pinterest allows direct affiliate links on standard Pins in most regions. Paste your full or approved affiliate URL directly into the destination link field.
- **Bridge Page (Recommended)**: The most sustainable, highest-converting method is to link your Pins to a dedicated blog post or product review on **The Curated Pick**. This builds long-term domain authority and prevents link breakage if an affiliate program changes.

#### 2. Disclosure & Compliance
- **Clear & Conspicuous**: You must disclose your affiliate relationship right in the Pin title or description using clear tags such as \`#ad\`, \`#affiliate\`, or *"Eligible for commission"*.
- **No Misleading Claims**: The Pin image must accurately represent the product.

#### 3. Visual & SEO Optimization
- **Aspect Ratio**: Always use a **2:3 vertical ratio** (1000 x 1500 px) for maximum feed real-estate.
- **Keyword-Rich Text**: Include descriptive search keywords in your Board names, Pin title, and Pin description (e.g., *"Best Noise-Cancelling Headphones 2026"*).
- **Multiple Pins per Product**: Create 3–5 different visual variations for the same product to test different headlines and angles.`;
  }

  if (q.includes('disclosure') || q.includes('ftc') || q.includes('legal') || q.includes('rule')) {
    return `### ⚖️ FTC & Affiliate Disclosure Compliance

The Federal Trade Commission (FTC) enforces strict transparency rules for anyone sharing affiliate links:

1. **Clear and Conspicuous**: Disclosures must be placed *before* the consumer clicks the affiliate link or makes a purchase decision.
2. **Above the Fold**: Do not bury disclosures solely in the website footer or hidden behind a tiny link.
3. **Plain Language**: Use simple language such as:
   > *"We may earn a commission when you buy through our links at no extra cost to you."*
4. **Social Media Tagging**: On TikTok, Instagram, and Pinterest, always include visible tags like \`#ad\` or \`#affiliate\` in the caption before "read more".`;
  }

  if (q.includes('website') || q.includes('curated pick') || q.includes('features') || q.includes('about')) {
    return `### ✨ About The Curated Pick

**The Curated Pick** is your trusted shopping discovery and deal intelligence hub:

- **Independent Editorial Reviews**: Hand-tested recommendations across audio, computing, smart home, and wearable electronics.
- **Real-Time Price Alerts**: Click the **Track Price Drop** button on any product to set your desired target price and receive alerts.
- **QR Code Scanning**: Use the built-in scanner to instantly pull up product specs, verified customer reviews, and pricing trends.
- **Product Comparison**: Compare up to 4 items side-by-side on price, battery, warranty, and specs.
- **Direct Support**: Have questions or partnership inquiries? Contact our team at **curatedpick.store@gmail.com**.`;
  }

  if (q.includes('recommend') || q.includes('best') || q.includes('product') || q.includes('headphone') || q.includes('laptop')) {
    return `### 🎯 Curated Product Recommendations

Here are some of our top-rated editor selections currently on **The Curated Pick**:

1. **Sony WH-1000XM5 Noise Canceling Headphones** — Flagship ANC, 30-hour battery life, unmatched voice clarity.
2. **Apex Pro Mechanical Keyboard** — Ultra-responsive magnetic switches, aircraft-grade aluminum top plate.
3. **UltraClean Robotic Vacuum Pro** — LiDAR navigation, automatic carpet boost, self-emptying base.
4. **Horizon 4K OLED Smart TV (55")** — Perfect blacks, 120Hz gaming support, Dolby Vision HDR.

*Tip*: You can click any product on our homepage to view detailed specs, historical price trends, and community buyer reviews!`;
  }

  return `### 💡 Affiliate & Curation Assistant

I can assist you with everything related to **The Curated Pick**, e-commerce affiliate marketing, and audience monetization:

- **Amazon Associates**: Operating policies, 24-hr cookies, link rules, and compliance.
- **Pinterest Affiliate Marketing**: 2:3 vertical graphics, direct links vs. bridge pages, and #ad disclosures.
- **FTC Regulations**: Proper disclaimers and transparent affiliate marketing standards.
- **The Curated Pick Features**: Price alerts, side-by-side comparisons, and QR scanning.
- **Inquiries**: Reach our team anytime at **curatedpick.store@gmail.com**.

Feel free to ask a specific question like *"How do I avoid getting banned on Amazon Associates?"* or *"What is the best way to pin affiliate links on Pinterest?"*!`;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    email: 'curatedpick.store@gmail.com',
  });
});

// AI Chat endpoint - strictly private, in-memory stateless execution
app.post('/api/chat', async (req: Request, res: Response) => {
  // Enforce zero-caching and strict privacy headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const { messages, message } = req.body;
    const prompt = message || (Array.isArray(messages) && messages[messages.length - 1]?.text) || '';

    if (!prompt.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const ai = getGenAI();

    if (ai) {
      // List of supported models to try in sequence if high demand (503) or rate limits occur
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      
      // Construct conversation contents for @google/genai
      const contents = Array.isArray(messages) && messages.length > 0
        ? messages.map((m: { sender: string; text: string }) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          }))
        : [{ role: 'user', parts: [{ text: prompt }] }];

      let lastError: unknown = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

          const reply = response.text || generateOfflineAnswer(prompt);
          return res.json({ reply, source: model });
        } catch (modelError: unknown) {
          lastError = modelError;
          const errMsg = modelError instanceof Error ? modelError.message : String(modelError);
          console.log(`Model ${model} unavailable (${errMsg.slice(0, 120)}), trying fallback...`);
          // Continue loop to try next model in candidateModels
        }
      }

      // If all live models are temporarily busy or experiencing high demand, gracefully serve expert offline answer
      console.log('All live Gemini models experiencing high demand; gracefully serving built-in curated knowledge base.');
      const fallbackReply = generateOfflineAnswer(prompt);
      return res.json({ reply: fallbackReply, source: 'knowledge-base-fallback' });
    }

    // Fallback when GEMINI_API_KEY is not configured
    const fallbackReply = generateOfflineAnswer(prompt);
    return res.json({ reply: fallbackReply, source: 'knowledge-base' });
  } catch (err: unknown) {
    console.error('Error handling /api/chat:', err);
    res.status(500).json({
      error: 'Failed to process AI chat request',
      reply: 'An error occurred while answering. Please feel free to reach out to us directly at curatedpick.store@gmail.com.',
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
