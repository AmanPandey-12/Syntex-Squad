import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const aiTranslateScheme = async (schemeData) => {
  const prompt = `
    You are an expert translator specializing in Indian agricultural schemes.
    Translate the following scheme details into 5 Indian languages: Hindi (hi), Telugu (te), Tamil (ta), Bengali (bn), and Marathi (mr).
    Scheme Data:
    Name: ${schemeData.name}
    Category: ${schemeData.category}
    Description: ${schemeData.description}
    Budget: ${schemeData.budget}
    Beneficiaries: ${schemeData.beneficiaries}

    Return the result ONLY as a JSON object with keys: en, hi, te, ta, bn, mr.
    Each language key must contain: name, category, description, budget, beneficiaries.
    Keep the "en" version as the original input. Ensure simple, farmer-friendly language.
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://krishiai.com',
          'X-Title': 'KrishiAI AdminPortal',
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Translation AI Error:', error);
    throw error;
  }
};

export const aiSearchSchemes = async (query) => {
  const prompt = `
    Find all available government agricultural schemes in India related to: "${query}".
    Include well-known schemes like PM-KISAN if relevant, or newer specific State schemes.
    Return the result ONLY as a JSON array of up to 5 objects.
    Each object must have: name, category, description, budget, beneficiaries, link (official gov URL).
    For each scheme, provide details in English.
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://krishiai.com',
          'X-Title': 'KrishiAI AdminPortal',
          'Content-Type': 'application/json'
        }
      }
    );

    const content = JSON.parse(response.data.choices[0].message.content);
    // Usually Gemini puts the array inside a key if we ask for json_object
    return content.schemes || content.results || Object.values(content)[0] || [];
  } catch (error) {
    console.error('Search AI Error:', error);
    throw error;
  }
};
