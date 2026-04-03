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

      if (!current || !current.main || current.cod !== 200) {
        console.error("Weather API returned error:", current?.message || current);
        return null;
      }

      if (!forecast || !forecast.list || forecast.cod !== "200") {
        console.error("Forecast API returned error:", forecast?.message || forecast);
        return { current, forecast: null };
      }

      return { current, forecast };
    } catch (error) {
      console.error("Weather API Error:", error);
      return null;
    }
  },  predictDisease: async (base64Image, targetLanguage = 'en') => {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-001", 
          messages: [
            {
              role: "system",
              content: `You are KrishiAI, a world-class plant pathologist. 
              
              GOAL: Perform a DEEP clinical analysis.
              - PROVIDE a very DETAILED analysis (3-4 sentences) for the TARGET language.
              - PROVIDE concise translations for the other 5 languages.
              
              SCORING RULES (STRICT COMPLIANCE):
              1. IF HEALTHY: If no disease/pest/starvation is detected, 'diag' must be "Healthy" and 'score' MUST be between 95 and 100.
              2. IF DISEASED: If ANY spots or discoloration are seen, accurately identify the issue and 'score' MUST reflect the area affected:
                 - Minor (1-5% area): Score 85-94.
                 - Moderate (5-15% area): Score 60-84.
                 - High (15-40% area): Score 40-59.
                 - Critical (>40% area): Score 0-39.
              
              DETECTION PARAMS: 
              - Identify even small spots or pest marks. Priority: SENSITIVITY.
              
              JSON Structure:
              {
                "crop": "English Name",
                "diag": "Specific Disease Name",
                "sev": "Low"|"Moderate"|"High"|"Critical",
                "conf": 98,
                "score": 45,
                "status": "Healthy"|"At Risk"|"Critical",
                "trans": {
                  "en": { "sum": "Analysis", "sol": ["Step 1", "Step 2"], "prev": ["Step 1"], "fert": "Name", "pest": "Name" },
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
          headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json", "X-Title": "KrishiAI" },
          timeout: 60000
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("PARSE_ERROR: No JSON found");
      
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
      console.error("AI Error:", error.message);
      const fallbackData = { summary: "Connection issue. Please check internet.", solution: [], prevention: [] };
      return {
        "cropName": "Unknown", "diagnosis": "Offline", "severity": "Low", "confidence": 100, "healthScore": 100, "status": "Healthy",
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
