import axios from 'axios';
import { cropCalendarData } from '../data/cropCalendar';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

// Diagnostic log (Internal only - confirms key presence)
if (!OPENROUTER_API_KEY) console.warn("WARNING: OpenRouter API Key missing from biosphere environment.");

export const mockApi = {
  uploadToImgBB: async (base64Image) => {
    if (!IMGBB_API_KEY) {
      throw new Error('VITE_IMGBB_API_KEY is missing from .env file');
    }
    const formData = new FormData();
    formData.append('image', base64Image);
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );
    if (!response?.data?.data?.url) {
      throw new Error('ImgBB returned no URL — upload failed');
    }
    return response.data.data.url;
  },

  fetchWeather: async (lat, lon) => {
    const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!key) return null;
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&cnt=24`)
      ]);
      const current = await currentRes.json();
      const forecast = await forecastRes.json();

      if (!current || !current.main || Number(current.cod) !== 200) {
        console.error("Weather API returned error:", current?.message || current);
        return null;
      }

      if (!forecast || !forecast.list || (forecast.cod != 200 && forecast.cod != "200")) {
        console.error("Forecast API returned error:", forecast?.message || forecast);
        return { current, forecast: null };
      }

      return { current, forecast };
    } catch (error) {
      return null;
    }
  },
  predictDisease: async (base64Image, targetLanguage = 'en') => {
    try {
      if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
        throw new Error("KEY_MISSING: OpenRouter API Key is missing or not set in .env file. Please check your environment variables.");
      }

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: `You are KrishiAI, a friendly village farm expert. 
              
              GOAL: Rapid Clinical Analysis for Farmers.
              - Tone: Friendly, helpful, like an elder offering advice.
              - Language: Use EXTREMELY SIMPLE, village-style talk. NO SCIENTIFIC JARGON.
              - Summary: Precisely 1-2 VERY SHORT sentences. Focus on what is wrong and if it's serious.
              
              VALIDATION RULE:
              - IF the image is NOT related to agriculture, plants, leaves, or crops (e.g. person, bike, car, room, random object):
                Set "is_agri": false and "diag": "Wrong image type".
              - IF it IS a crop/plant: Set "is_agri": true.

              SCORING RULES:
              1. IF HEALTHY: 'diag' must be "Healthy", 'score' 95-100.
              2. IF DISEASED: accurately identify the issue and 'score' reflecting affected area:
              - Minor: 85-94 | Moderate: 60-84 | High: 40-59 | Critical: 0-39.
              
              JSON Structure:
              {
                "is_agri": true,
                "crop": "English Name",
                "diag": "Common Disease Name",
                "sev": "Low"|"Moderate"|"High"|"Critical",
                "conf": 98,
                "score": 45,
                "status": "Healthy"|"At Risk"|"Critical",
                "trans": {
                  "en": { "sum": "Actionable Insight", "sol": ["Simple Step 1", "Simple Step 2"], "prev": ["Easy Prev 1"], "fert": "Common Name", "pest": "Common Name" },
                  "hi": { ... }, "ta": { ... }, "te": { ... }, "mr": { ... }, "bn": { ... }
                }
              }
              Return ONLY valid JSON.`
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Target Language: ${targetLanguage}. Perform DEEP clinical analysis in ${targetLanguage}. Provide medicine and treatment names. Ensure all 6 languages (en, hi, ta, te, mr, bn) are present in the 'trans' object.` },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 2048
        },
        {
          headers: { 
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`, 
            "Content-Type": "application/json", 
            "X-Title": "KrishiAI Diagnostic" 
          },
          timeout: 90000 // Increased for slower connections
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("PARSE_ERROR: No valid JSON returned from model");
      
      const rawJson = JSON.parse(jsonMatch[0]);
      
      // Safety Catch for scores
      const scoreKeys = { 'conf': 'confidence', 'score': 'healthScore' };
      Object.entries(scoreKeys).forEach(([raw, final]) => {
        if (rawJson[raw] !== undefined) {
          let val = parseFloat(rawJson[raw]);
          if (val > 0 && val <= 1) val = val * 100;
          rawJson[final] = Math.round(val);
        }
      });

      // Flatten and map to expected structure
      const finalResult = {
        isAgri: rawJson.is_agri === undefined ? true : rawJson.is_agri,
        cropName: rawJson.crop || rawJson.cropName || "Unknown",
        diagnosis: rawJson.diag || rawJson.diagnosis || "Healthy",
        severity: rawJson.sev || rawJson.severity || "Low",
        confidence: rawJson.confidence || 100,
        healthScore: rawJson.healthScore || 100,
        status: rawJson.status || "Healthy",
      };

      const titles = {
        en: { step: "Action", care: "Care" },
        hi: { step: "कदम", care: "सावधानी" },
        te: { step: "చర్య", care: "జాగ్రత్త" },
        ta: { step: "நடவடிக்கை", care: "கவனிப்பு" },
        bn: { step: "পদক্ষেপ", care: "সতর্কতা" },
        mr: { step: "उपाय", care: "काळजी" }
      };

      ['en', 'hi', 'ta', 'te', 'mr', 'bn'].forEach(lang => {
        const source = rawJson.trans?.[lang] || rawJson.translations?.[lang] || rawJson[lang];
        if (source) {
          const tSet = titles[lang] || titles.en;
          finalResult[lang] = {
            summary: source.sum || source.summary || "No info.",
            fertilizer: source.fert || source.fertilizer || "N/A",
            pesticide: source.pest || source.pesticide || "N/A",
            solution: Array.isArray(source.sol || source.solution) ? (source.sol || source.solution).map((text, i) => ({
              step: i + 1,
              title: tSet.step,
              detail: text,
              urgency: "Immediate"
            })) : [],
            prevention: Array.isArray(source.prev || source.prevention) ? (source.prev || source.prevention).map((text, i) => ({
              step: i + 1,
              title: tSet.care,
              detail: text
            })) : []
          };
        } else {
          finalResult[lang] = { summary: "Unavailable", solution: [], prevention: [] };
        }
      });

      return finalResult;
    } catch (error) {
      console.error("Diagnostic AI Error:", error.message);
      
      let friendlyError = "Connection issue. Please check your internet.";
      if (error.message.includes("KEY_MISSING")) {
        friendlyError = "VITE_OPENROUTER_API_KEY is missing. Check your .env file and restart the server.";
      } else if (error.response?.status === 401) {
        friendlyError = "Invalid API Key. Please check your OpenRouter key.";
      } else if (error.response?.status === 402) {
        friendlyError = "OpenRouter credits exhausted. Please top up your account.";
      } else if (error.code === 'ECONNABORTED') {
        friendlyError = "Scan took too long. Checking server status...";
      }

      const fallbackData = { summary: friendlyError, solution: [], prevention: [] };
      return {
        "cropName": "Error", "diagnosis": "Offline", "severity": "Low", "confidence": 0, "healthScore": 0, "status": "At Risk",
        "en": fallbackData, "hi": fallbackData, "ta": fallbackData, "te": fallbackData, "mr": fallbackData, "bn": fallbackData
      };
    }
  },

  chatWithAI: async (userMessage, cropsContext, targetLanguage = 'en') => {
    try {
      const cropsData = cropsContext.map(c => ({
        name: c.name,
        health: c.healthScore + "%",
        status: c.status,
        diagnosis: c.diagnosis || c.problem
      }));

      const marketData = {
        "Tomato": "₹28 - ₹42 / kg",
        "Wheat": "₹21 - ₹25 / kg",
        "Rice": "₹38 - ₹55 / kg",
        "Corn": "₹18 - ₹22 / kg",
        "Soybean": "₹45 - ₹52 / kg",
        "Potato": "₹15 - ₹20 / kg"
      };

      const systemPrompt = `You are KrishiAI, a friendly neighborhood farm expert. 
      Talk to the farmer like a fellow friend from the village. 
      Use simple talk in ${targetLanguage} and English.
      
      FORMATTING RULES (CRITICAL):
      1. Use DOUBLE LINE BREAKS between paragraphs for clear spacing.
      2. Use **BOLD HEADERS** for each section.
      3. Use Bullet points (•) for lists to make it easy to read.
      4. NO SCIENTIFIC JARGON. NO COMPLEX BIOLOGICAL TERMS.
      5. Speak simply and directly.
      
      STATION CONTEXT (Internal Archive):
      DATE: ${new Date().toLocaleDateString()}
      FARM INVENTORY: ${JSON.stringify(cropsData)}
      MARKET PRICES: ${JSON.stringify(marketData)}
      CROP CALENDAR: ${JSON.stringify(cropCalendarData)}
      
      Response Structure Example:
      **SALAAH (Advice)**
      Is bimari ko theek karne ke liye...
      
      **ZAROORI KADAM (Steps)**
      • Step 1...
      • Step 2...`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            { role: "user", content: userMessage }
          ]
        },
        {
          headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json", "X-Title": "KrishiAI Chat" },
          timeout: 10000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Chat Error:", error.message);
      return "नमस्ते! मैं KrishiAI हूँ, आपकी कृषि सहायक। आप मुझे पूछ सकते हैं कि कैसे बीमारी का पता लगाएँ, बाजार भाव जानें, या मौसम की जानकारी लें। क्या आप कुछ पूछना चाहते हैं?";
    }
  }
};
