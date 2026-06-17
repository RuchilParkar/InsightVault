import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from '../utils/secureStore';

export interface AIProcessingResult {
  shortSummary: string;
  detailedSummary: string;
  learnings: string; // Bullet points
  tags: string[]; // Max 10
  suggestedCollection: string;
}

const DEFAULT_COLLECTIONS = ['Development', 'Design', 'AI', 'Productivity', 'Startup', 'Other'];

export async function processKnowledgeWithAI(
  title: string,
  url?: string,
  notes?: string,
  reasonSaved?: string
): Promise<AIProcessingResult> {
  const apiKey = await getApiKey();
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-1.5-flash for fast text processing, enforce JSON output
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
You are an expert knowledge extractor for InsightVault, a personal knowledge management app.
Analyze the following saved content and extract structured insights.

CONTENT TO ANALYZE:
Title: ${title}
${url ? `URL: ${url}` : ''}
${notes ? `User Notes: ${notes}` : ''}
${reasonSaved ? `Reason User Saved This: ${reasonSaved}` : ''}

REQUIRED OUTPUT FORMAT (Return ONLY valid JSON):
{
  "shortSummary": "A maximum 2-3 sentence concise summary of the core concept.",
  "detailedSummary": "A structured paragraph explaining the topic in more depth.",
  "learnings": "• Bullet point 1\\n• Bullet point 2",
  "tags": ["tag1", "tag2"], // Max 10 tags
  "suggestedCollection": "Must be exactly one of: ${DEFAULT_COLLECTIONS.join(', ')}"
}

Analyze the content considering why the user saved it, and generate the JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Direct parse since MimeType enforces raw JSON
    const parsed = JSON.parse(responseText.trim());
    
    return {
      shortSummary: parsed.shortSummary || '',
      detailedSummary: parsed.detailedSummary || '',
      learnings: parsed.learnings || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [],
      suggestedCollection: DEFAULT_COLLECTIONS.includes(parsed.suggestedCollection) 
        ? parsed.suggestedCollection 
        : 'Other',
    };
  } catch (error) {
    console.error('AI Processing Error:', error);
    throw new Error('Failed to process content with AI');
  }
}
