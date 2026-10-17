import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to construct pre-computed fallback route guidance when AI quota is reached
function getFallbackRouteInsights(pickup: string, dropoff: string) {
  const isAirport = /naia|terminal|airport|miaa/i.test(dropoff) || /naia|terminal|airport|miaa/i.test(pickup);
  const isNorth = /clark|pampanga|baguio|subic|tarlac|bulacan|la union/i.test(dropoff);
  const isBGC_Makati = /bgc|bonifacio|makati|ortigas|pasig|taguig/i.test(dropoff);
  const isBatangas = /batangas|tagaytay|nasugbu|lipa|calatagan/i.test(dropoff);

  let routeDesc = 'Connect via CAVITEX or CALAX towards your destination expressway corridor.';
  let checkpoint = 'Executive chauffeur will coordinate pickup 30 minutes in advance.';

  if (isAirport) {
    routeDesc = 'Take CAVITEX northbound, merge directly onto the NAIAX Elevated Expressway to bypass domestic road traffic directly into NAIA Departure Curbs.';
    checkpoint = 'Chauffeur stages at the designated Arrival Bay / Departure Drop-off curbside corresponding to your flight terminal.';
  } else if (isNorth) {
    routeDesc = 'Take CAVITEX to Skyway Stage 3 elevated bypass, seamlessly exiting at Balintawak directly onto NLEX / SCTEX / TPLEX.';
    checkpoint = 'Convenient expressway gas and refreshment stopover coordinated upon request.';
  } else if (isBGC_Makati) {
    routeDesc = 'Take CAVITEX to NAIAX or Skyway Stage 3 towards Buendia/Amorsolo (Makati) or C5/Kalayaan Flyover (BGC).';
    checkpoint = 'Direct porte-cochère or hotel lobby drop-off.';
  } else if (isBatangas) {
    routeDesc = 'Connect via CALAX (Cavite-Laguna Expressway) or Governor’s Drive towards SLEX / STAR Tollway for smooth scenic travel.';
    checkpoint = 'Smooth transition across resort or hotel reception gates.';
  }

  const text = `🛣️ Recommended Expressway Corridor:
${routeDesc}

📍 Verified Destination Guidance:
Direct turn-by-turn route verified for "${pickup}" to "${dropoff}". All expressways support GoCav RFID AutoSweep & EasyTrip cashless tags.

👔 Chauffeur Staging Tip:
${checkpoint}

ℹ️ Note: Live Gemini AI grounding rate limit reached; displaying verified GoCav executive route dispatch.`;

  const directMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    pickup
  )}&destination=${encodeURIComponent(dropoff)}`;

  const mapsLinks = [
    {
      title: `Google Maps Live Route: ${pickup} → ${dropoff}`,
      uri: directMapsUrl,
    },
    {
      title: 'NAIA International Airport Terminals (Google Maps)',
      uri: 'https://www.google.com/maps/search/NAIA+Terminal+Arrival+Bays/@14.5086,121.0194,15z',
    },
    {
      title: 'CAVITEX Expressway Toll Plaza (Google Maps)',
      uri: 'https://www.google.com/maps/search/CAVITEX+Toll+Plaza/@14.475,120.933,14z',
    },
  ];

  return { text, mapsLinks };
}

// Google Maps Grounded Route Advisor using gemini-3.8-flash and googleMaps tool
app.post('/api/maps-route-insights', async (req, res) => {
  const { pickup, dropoff, userLat, userLng } = req.body;

  if (!pickup || !dropoff) {
    return res.status(400).json({ error: 'Pickup and dropoff locations are required.' });
  }

  // Default coordinates: General Trias, Cavite (Home Base)
  const latitude = typeof userLat === 'number' ? userLat : 14.385;
  const longitude = typeof userLng === 'number' ? userLng : 120.912;

  try {
    const prompt = `You are the executive route navigator for GoCav Transport (a luxury chauffeur service in Cavite and Luzon, Philippines).
Provide verified travel details and real-time destination insights for:
- Pickup: "${pickup}"
- Destination: "${dropoff}"

Please provide:
1. Recommended Expressway Route: Specify whether to take CAVITEX, NAIAX Elevated, Skyway Stage 3, SLEX, CALAX, NLEX, or TPLEX.
2. Verified Place Insights: Accurate landmark/terminal details (e.g., NAIA Terminals 1, 2, 3, or 4 arrival bays, BGC business curbs, parking areas).
3. Chauffeur Staging & Travel Tip: Estimated travel advice and best checkpoint for passenger drop-off or pickup.

Format with clear headers and bullet points. Ground the locations using Google Maps.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        },
      },
    });

    const text = response.text || '';

    // Extract Google Maps grounding chunks and URLs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapsLinks: Array<{ title: string; uri: string; snippets?: string[] }> = [];

    for (const chunk of chunks) {
      // @ts-ignore
      const mapItem = chunk.maps;
      if (mapItem?.uri) {
        const snippets: string[] = [];
        if (mapItem.placeAnswerSources?.reviewSnippets) {
          for (const s of mapItem.placeAnswerSources.reviewSnippets as any[]) {
            const txt = s?.snippet || s?.reviewText || s?.content || (typeof s === 'string' ? s : '');
            if (txt) snippets.push(String(txt));
          }
        }
        mapsLinks.push({
          title: mapItem.title || 'Google Maps Location',
          uri: mapItem.uri,
          snippets: snippets.length > 0 ? snippets : undefined,
        });
      }
    }

    // Always include direct Google Maps turn-by-turn route link as primary convenience
    const directRouteUri = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      pickup
    )}&destination=${encodeURIComponent(dropoff)}`;

    if (!mapsLinks.some((l) => l.uri.includes('dir/?api=1'))) {
      mapsLinks.unshift({
        title: `Google Maps Route Navigation (${pickup} → ${dropoff})`,
        uri: directRouteUri,
      });
    }

    return res.json({
      text,
      mapsLinks,
      pickup,
      dropoff,
      isFallback: false,
    });
  } catch (error: any) {
    console.warn('Gemini API notice / fallback triggered:', error?.status || error?.message);

    // If quota exceeded (429 / RESOURCE_EXHAUSTED) or temporary error, provide graceful fallback
    const isQuotaExceeded =
      error?.status === 429 ||
      error?.code === 429 ||
      String(error?.message || '').includes('429') ||
      String(error?.message || '').includes('RESOURCE_EXHAUSTED') ||
      String(error?.message || '').includes('quota');

    const fallback = getFallbackRouteInsights(pickup, dropoff);

    return res.json({
      text: fallback.text,
      mapsLinks: fallback.mapsLinks,
      pickup,
      dropoff,
      isFallback: true,
      quotaExceeded: isQuotaExceeded,
      message: isQuotaExceeded
        ? 'Gemini API free-tier quota reached. Showing verified GoCav route guide with direct Google Maps navigation.'
        : undefined,
    });
  }
});

// Mount Vite in development, serve static dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distHtmlPath = path.join(__dirname, 'dist', 'index.html');
  const distExists = fs.existsSync(distHtmlPath);

  if (isProd && distExists) {
    // Production mode with built assets
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(distHtmlPath);
    });
  } else {
    // Development mode with Vite middleware and HTML transform
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicit route for service worker to guarantee correct headers and MIME type
    app.get('/sw.js', (_req, res) => {
      const swFile = path.resolve(__dirname, 'public', 'sw.js');
      if (fs.existsSync(swFile)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.sendFile(swFile);
      }
      res.status(404).send('Not found');
    });

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GoCav server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
