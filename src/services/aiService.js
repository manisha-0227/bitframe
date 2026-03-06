import axios from 'axios';

/**
 * AI Service for code generation and modification
 * Uses OpenRouter API – set REACT_APP_OPENROUTER_API_KEY in .env (get key at openrouter.ai/keys)
 */

const AI_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';
const AI_API_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

if (process.env.NODE_ENV === 'development') {
  console.log('OpenRouter API Key:', AI_API_KEY ? 'Configured ✅' : 'Missing ❌ (set REACT_APP_OPENROUTER_API_KEY in .env)');
}

/**
 * Detects the programming language
 */
const detectLanguage = (code, currentLanguage) => {
  // If already selected manually
  if (currentLanguage) return currentLanguage;

  const src = code.toLowerCase();
  if (src.includes('#include')) return 'cpp';
  if (src.includes('public class')) return 'java';
  if (src.includes('def ') || src.includes('import ')) return 'python';
  if (
    src.includes('function') ||
    src.includes('const ') ||
    src.includes('console.log')
  ) return 'javascript';

  return 'javascript';
};

/**
 * Extract clean code from AI response
 */
const extractCodeFromResponse = (responseText) => {
  if (!responseText) return '';

  const codeBlock = responseText.match(/```[\s\S]*?```/);
  if (codeBlock) {
    return codeBlock[0].replace(/```[\w]*/g, '').replace(/```/g, '').trim();
  }

  return responseText.trim();
};

/**
 * Build prompt for OpenRouter code generation
 */
const formatPrompt = (userPrompt, currentCode, language) => `
You are an expert ${language} programmer.

RULES:
1️⃣ Return ONLY full updated code — no markdown, no comments
2️⃣ Maintain all working functionality
3️⃣ Integrate new requested features cleanly
4️⃣ Best practices required

Current code:
${currentCode}

User request:
${userPrompt}

Output updated complete code only:
`;

/**
 * ✅ OpenRouter only: Code Generation
 */
export const generateCodeWithAI = async (userPrompt, currentCode, currentLanguage) => {
  try {
    if (!AI_API_KEY) {
      return { success: false, error: "❌ OpenRouter API key missing. Set REACT_APP_OPENROUTER_API_KEY in .env (get one at openrouter.ai/keys)." };
    }

    if (!userPrompt) {
      return { success: false, error: "⚠️ Please enter a request!" };
    }

    const language = detectLanguage(currentCode, currentLanguage);
    const formattedPrompt = formatPrompt(userPrompt, currentCode, language);

    const response = await axios.post(
      AI_API_BASE_URL,
      {
        model: "openrouter/auto", // Can be changed to specific models
        messages: [
          { role: "user", content: formattedPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AI_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000", // ✅ must match your frontend origin
          "X-Title": "Code Editor AI"
        }
      }
    );

    const aiText = response.data.choices[0].message.content;
    const finalCode = extractCodeFromResponse(aiText);

    if (!finalCode) {
      return {
        success: false,
        error: "⚠️ AI did not return valid code. Try again."
      };
    }

    return { success: true, code: finalCode };

  } catch (error) {
    console.error("OpenRouter Error:", error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.message;

      if (status === 401) return { success: false, error: "❌ Invalid API Key. Get a valid key at openrouter.ai/keys and set REACT_APP_OPENROUTER_API_KEY in .env, then restart the app." };
      if (status === 429) return { success: false, error: "⏳ Rate limit exceeded" };

      return { success: false, error: `API Error: ${message}` };
    }

    return { success: false, error: "Network error. Check connection." };
  }
};

/**
 * ✅ Mock AI for testing (offline mode)
 */
export const generateCodeWithMockAI = async (userPrompt, currentCode) => {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    success: true,
    code: `${currentCode}\n\n// TODO: ${userPrompt}`
  };
};
