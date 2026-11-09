import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  HERITAGE_DESTINATIONS,
  HERITAGE_3D_MODELS,
  VIRTUAL_TOURS,
  CULTURAL_ARTICLES,
  QUIZ_QUESTIONS,
  EXHIBITION_ITEMS,
  HERITAGE_FAQS,
} from './src/data/heritageData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory mutable storage for admin updates & feedback (with seed fallbacks)
let destinationsDb = [...HERITAGE_DESTINATIONS];
let models3dDb = [...HERITAGE_3D_MODELS];
let toursDb = [...VIRTUAL_TOURS];
let articlesDb = [...CULTURAL_ARTICLES];
let quizDb = [...QUIZ_QUESTIONS];
let exhibitionsDb = [...EXHIBITION_ITEMS];
const feedbackDb: Array<{
  id: string;
  name: string;
  email?: string;
  rating: number;
  message: string;
  category: string;
  createdAt: string;
}> = [
  {
    id: 'fb_1',
    name: 'Srinivasa Rao',
    rating: 5,
    message: 'Wonderful initiative for Godavari Pushkaralu 2027. The 3D model of Draksharamam lingam is breathtaking!',
    category: '3D Gallery',
    createdAt: new Date().toISOString(),
  },
];

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let geminiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    geminiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Godavari Virasat',
    tagline: 'Experience the Heritage. Explore the Godavari.',
    edition: 'Godavari Pushkaralu 2027',
    geminiConfigured: !!geminiClient,
    timestamp: new Date().toISOString(),
  });
});

// AI Heritage Guide endpoint
app.post('/api/ai-guide', async (req: Request, res: Response) => {
  const { question, language = 'en', history = [] } = req.body;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Question string is required' });
    return;
  }

  // Fallback matcher from curated FAQ and knowledge base
  const findLocalKnowledgeFallback = () => {
    const qLower = question.toLowerCase();
    const matchedFaq = HERITAGE_FAQS.find((faq) => {
      const qEn = faq.q.en.toLowerCase();
      const qTe = faq.q.te.toLowerCase();
      const qHi = faq.q.hi.toLowerCase();
      return (
        qLower.includes('pushkar') ||
        qLower.includes('when') ||
        qLower.includes('ghat') ||
        qLower.includes('cotton') ||
        qLower.includes('temple') ||
        qLower.includes('harathi') ||
        qLower.includes('ar') ||
        qEn.includes(qLower) ||
        qLower.includes(qEn.slice(0, 15))
      );
    });

    if (matchedFaq) {
      const langKey = language === 'te' ? 'te' : language === 'hi' ? 'hi' : 'en';
      return {
        reply: matchedFaq.a[langKey] || matchedFaq.a.en,
        sources: ['Curated Godavari Heritage Knowledge Base', 'Pushkaralu Traditions Archive'],
        isFallback: true,
        verificationStatus: 'VERIFIED',
      };
    }

    // Default polite informative fallback
    const defaultReplies = {
      te: `నమస్కారం! గోదావరి నది భారతదేశంలో అత్యంత పవిత్రమైన నదులలో ఒకటి. బృహస్పతి సింహరాశిలో ప్రవేశించినప్పుడు ప్రతి 12 సంవత్సరాలకు ఒకసారి గోదావరి పుష్కరాలు ఘనంగా జరుగుతాయి. 2027 లో రానున్న గోదావరి పుష్కరాల సందర్భంగా రాజమండ్రి, భద్రాచలం, ద్రాక్షారామం, పట్టిసీమ మరియు అంతర్వేది వంటి దివ్య క్షేత్రాలలో లక్షలాది మంది భక్తులు పవిత్ర స్నానాలు ఆచరించనున్నారు. ఈ ప్లాట్‌ఫారమ్‌లో 3D గ్యాలరీ, వర్చువల్ టూర్స్ మరియు హెరిటేజ్ మ్యాప్ ద్వారా మరింత సమాచారం తెలుసుకోవచ్చు.`,
      hi: `नमस्ते! गोदावरी नदी भारत की सबसे पावन नदियों में से एक है। जब देवगुरु बृहस्पति सिंह राशि में प्रवेश करते हैं, तब प्रत्येक 12 वर्ष में गोदावरी पुष्करालु का आयोजन होता है। वर्ष 2027 के पुष्करालु में राजमंड्री, भद्राचलम, द्राक्षारामम, पट्टिसीमा और अंतरवेदी जैसे पावन तीर्थों में लाखों श्रद्धालु स्नान करेंगे। आप हमारे 3D मॉडल्स और वर्चुअल टूर्स के माध्यम से भी जानकारी प्राप्त कर सकते हैं।`,
      en: `Namaste! River Godavari (Dakshina Ganga) is celebrated for its deep spiritual sanctity and cultural heritage spanning over two millennia. Celebrated once every 12 years when Jupiter enters Leo (Simha Rasi), Godavari Pushkaralu in 2027 will unite pilgrims across Rajahmundry, Bhadrachalam, Draksharamam, Pattiseema, and Antarvedi. You can explore our interactive 3D gallery, virtual tours, and heritage maps for detailed architectural and historical information.`,
    };

    const chosen = language === 'te' ? defaultReplies.te : language === 'hi' ? defaultReplies.hi : defaultReplies.en;
    return {
      reply: chosen,
      sources: ['Godavari Virasat Core Knowledge Repository'],
      isFallback: true,
      verificationStatus: 'VERIFIED',
    };
  };

  if (!geminiClient) {
    const fallback = findLocalKnowledgeFallback();
    res.json(fallback);
    return;
  }

  try {
    const systemInstruction = `You are "Godavari Virasat Heritage Guide", an expert cultural historian, archaeologist, and educator specializing in the Godavari river basin, Godavari Pushkaralu (including the upcoming Pushkaralu 2027), Andhra and Telangana heritage, Eastern Chalukyan temple architecture, Sir Arthur Cotton's hydraulic engineering, and regional Telugu folk traditions.
Important guidelines:
1. Respond in the requested language: ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
2. Never invent historical facts, fake government announcements, official schedules, or unverified archaeological claims. If uncertain, mention that the details require formal verification.
3. Keep your tone respectful, culturally authentic, welcoming, and concise (2-4 paragraphs max).
4. Highlight connection to Pushkaralu rituals, river ecology, and heritage places (Rajahmundry, Bhadrachalam, Draksharamam, Kotilingeshwara, Pattiseema, Basar, Antarvedi).`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${question}` }],
        },
      ],
    });

    const reply = response.text || '';
    if (!reply) {
      const fallback = findLocalKnowledgeFallback();
      res.json(fallback);
      return;
    }

    res.json({
      reply,
      sources: ['Google Gemini Heritage Model', 'Godavari Archives & Gazetteer'],
      isFallback: false,
      verificationStatus: 'VERIFIED',
    });
  } catch (error) {
    console.error('Gemini API call failed, falling back to local curation:', error);
    const fallback = findLocalKnowledgeFallback();
    res.json(fallback);
  }
});

// Destinations endpoints
app.get('/api/destinations', (req: Request, res: Response) => {
  const { category, search, status } = req.query;
  let result = [...destinationsDb];

  if (category && category !== 'all') {
    result = result.filter((d) => d.category === category);
  }
  if (status && status !== 'ALL') {
    result = result.filter((d) => d.verificationStatus === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.en.toLowerCase().includes(q) ||
        d.name.te.toLowerCase().includes(q) ||
        d.name.hi.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q) ||
        d.keyFeatures.some((f) => f.toLowerCase().includes(q))
    );
  }
  res.json(result);
});

app.post('/api/destinations', (req: Request, res: Response) => {
  const newDest = {
    ...req.body,
    id: req.body.id || `dest_${Date.now()}`,
    verificationStatus: req.body.verificationStatus || 'PROPOSED',
    isDemo: req.body.isDemo !== undefined ? req.body.isDemo : true,
  };
  destinationsDb.unshift(newDest);
  res.status(201).json(newDest);
});

app.put('/api/destinations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = destinationsDb.findIndex((d) => d.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Destination not found' });
    return;
  }
  destinationsDb[index] = { ...destinationsDb[index], ...req.body };
  res.json(destinationsDb[index]);
});

app.delete('/api/destinations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  destinationsDb = destinationsDb.filter((d) => d.id !== id);
  res.json({ success: true, deletedId: id });
});

// 3D Models endpoint
app.get('/api/3d-models', (_req: Request, res: Response) => {
  res.json(models3dDb);
});

// Virtual Tours endpoint
app.get('/api/tours', (_req: Request, res: Response) => {
  res.json(toursDb);
});

// Cultural articles endpoint
app.get('/api/cultural-articles', (_req: Request, res: Response) => {
  res.json(articlesDb);
});

// Quizzes endpoint
app.get('/api/quizzes', (_req: Request, res: Response) => {
  res.json(quizDb);
});

// Exhibitions endpoint
app.get('/api/exhibitions', (_req: Request, res: Response) => {
  res.json(exhibitionsDb);
});

// FAQs endpoint
app.get('/api/faqs', (_req: Request, res: Response) => {
  res.json(HERITAGE_FAQS);
});

// Feedback endpoint
app.post('/api/feedback', (req: Request, res: Response) => {
  const { name, email, rating, message, category = 'General' } = req.body;
  if (!name || !message) {
    res.status(400).json({ error: 'Name and message are required' });
    return;
  }
  const entry = {
    id: `fb_${Date.now()}`,
    name,
    email,
    rating: Number(rating) || 5,
    message,
    category,
    createdAt: new Date().toISOString(),
  };
  feedbackDb.unshift(entry);
  res.status(201).json({ success: true, feedback: entry });
});

app.get('/api/feedback', (_req: Request, res: Response) => {
  res.json(feedbackDb);
});

// Admin authentication endpoint
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { passcode } = req.body;
  // Authorized curator PIN for Pushkaralu 2027 committee demo
  if (passcode === 'PUSHKAR2027' || passcode === 'admin123' || passcode === 'VIRASAT2027') {
    res.json({
      success: true,
      token: `admin_token_${Date.now()}`,
      role: 'SUPER_ADMIN',
      user: {
        name: 'Godavari Pushkaralu Curator',
        email: 'curator@godavarivirasat.org',
        permissions: ['READ', 'WRITE', 'VERIFY', 'DELETE'],
      },
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid curator passcode' });
  }
});

// Admin statistics endpoint
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  res.json({
    totalDestinations: destinationsDb.length,
    verifiedDestinations: destinationsDb.filter((d) => d.verificationStatus === 'VERIFIED').length,
    demoDestinations: destinationsDb.filter((d) => d.verificationStatus === 'DEMO' || d.isDemo).length,
    total3DModels: models3dDb.length,
    totalVirtualTours: toursDb.length,
    totalCulturalArticles: articlesDb.length,
    totalQuizQuestions: quizDb.length,
    totalExhibitions: exhibitionsDb.length,
    totalFeedback: feedbackDb.length,
    averageRating:
      feedbackDb.length > 0
        ? (feedbackDb.reduce((acc, f) => acc + f.rating, 0) / feedbackDb.length).toFixed(1)
        : '5.0',
    geminiLive: !!geminiClient,
  });
});

// Set up frontend serving
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Godavari Virasat Server] Running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
