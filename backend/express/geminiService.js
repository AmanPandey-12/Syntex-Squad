require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Enable CORS for React frontend connecting from a different port
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post('/api/expert-advice', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { disease_name } = req.body;
    
    console.log('\n' + '='.repeat(50));
    console.log(`--> [Gemini Layer] Request received for Gemini Advice. Pattern: ${disease_name}`);
    
    if (!disease_name) {
      return res.status(400).json({ error: 'disease_name is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in .env' });
    }

    // Initialize Gemini 1.5 Flash Model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a senior agricultural plant pathologist AI EXPERT dedicated to helping Indian farmers.
The following plant condition has been detected: "${disease_name}".

Your task is to generate a precise agricultural prescription as a raw JSON object.
KYU? - Kyuki Indian farmers ko technical terms kam samajh aate hain, isiliye advice SIMPLE, PRACTICAL, aur DEEP honi chahiye taaki unhe samajhne mein aasani ho.

CRITICAL RULES — follow exactly:
1. Return ONLY a valid JSON object. NO markdown, NO code fences, NO explanation text outside the JSON.
2. For "health_score" — this must reflect the PLANT'S CURRENT HEALTH STATE (not how treatable it is):
   - 1 to 3: Severe disease, plant is critically damaged (e.g. mosaic virus, bacterial blight, blast)
   - 4 to 5: Moderate disease, significant damage visible
   - 6 to 7: Mild disease, early stage, or minor deficiency
   - 8 to 10: Healthy plant with little or no disease
3. All arrays must have 3-5 practical, specific items. 
4. LANGUAGE: Use simple language that a farmer can understand. Instead of "foliar application", use "spray on leaves". Instead of "systemic fungicide", use "spray that goes inside the plant to kill disease".
5. Use terms and remedies common in Indian agriculture (e.g., Neem oil, Cow urine, common brand names like Amistar or Bavistin if applicable).
6. "prevention_tips" must be a single detailed paragraph string in very simple language.

Return this exact JSON structure (no extra keys, no missing keys):
{
  "health_score": <integer 1-10>,
  "organic_treatment": ["...", "...", "..."],
  "chemical_treatment": ["...", "...", "..."],
  "immediate_actions": ["...", "...", "..."],
  "prevention_tips": "..."
}
`;

    console.log("--> [Gemini Layer] Prompting Gemini 1.5 Flash Model...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let parsedResponse;
    try {
      // Primary: strip markdown fences
      let cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      // Fallback: extract JSON object via regex if stray text exists
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];
      
      parsedResponse = JSON.parse(cleaned);

      // Validate health_score is a number in range
      if (typeof parsedResponse.health_score !== 'number' || parsedResponse.health_score < 1 || parsedResponse.health_score > 10) {
        parsedResponse.health_score = 5; // safe fallback
      }

      console.log(`--> [Gemini Layer] Parsed OK. Health Score: ${parsedResponse.health_score}/10`);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON. Raw response:", responseText);
      return res.status(500).json({ error: 'Failed to parse AI response. Please retry.' });
    }

    const endTime = Date.now();
    const responseTimeSec = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`--> [Gemini Layer] Gemini Response Time: ${responseTimeSec}s`);
    console.log('--> [Gemini Layer] Sending Generative Prescription back to Frontend');
    console.log('='.repeat(50) + '\n');

    res.json(parsedResponse);

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    if (error.status === 429) {
      res.status(429).json({ error: 'Gemini Quota Exceeded. Please try again later or verify billing limits.' });
    } else {
      res.status(500).json({ error: 'An API error occurred while communicating with Gemini.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Layer 2 Gemini Expert Reasoner running on http://localhost:${PORT}`);
});
