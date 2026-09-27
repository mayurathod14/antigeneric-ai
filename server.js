// AntiGeneric AI - Backend Server
// Yeh server 4 stages mein idea ko process karta hai using Claude API

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'openai/gpt-oss-120b'; // free model via Groq, current production model

// Simple cliche wordlist - inhe generic maana jayega
const CLICHE_WORDS = [
  'empowering', 'empower', 'seamless', 'seamlessly', 'revolutionize', 'revolutionary',
  'game-changer', 'game changer', 'disrupt', 'disruptive', 'innovative', 'innovation',
  'cutting-edge', 'next-level', 'unlock your potential', 'unleash', 'synergy',
  'journey', 'ecosystem', 'holistic', 'transform your', 'elevate your', 'streamline',
  'best-in-class', 'world-class', 'passionate about', 'solutions'
];

// Helper: Groq API ko call karne ka function (free, no billing needed)
async function callClaude(systemPrompt, userMessage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  return text;
}

// Helper: JSON nikalne ke liye (Claude kabhi kabhi extra text bhej deta hai)
function extractJSON(text) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // agar direct parse fail ho to pehla { se last } tak nikal lo
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    const arrStart = cleaned.indexOf('[');
    const arrEnd = cleaned.lastIndexOf(']');
    if (arrStart !== -1 && (arrStart < start || start === -1)) {
      return JSON.parse(cleaned.slice(arrStart, arrEnd + 1));
    }
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

// Helper: keyword-based cliche check (deterministic, LLM ke bina)
function keywordClicheCheck(text) {
  const lower = text.toLowerCase();
  const found = CLICHE_WORDS.filter(word => lower.includes(word));
  return found;
}

// STAGE 1: Understand - idea ko structured data mein todna
async function stageUnderstand(idea) {
  const system = `You are a brand strategist. Extract structured information from a rough product idea.
Respond ONLY with valid JSON, no other text, no markdown formatting. Format:
{"target_user": "...", "problem": "...", "constraints": "...", "category": "...", "value": "..."}`;
  const result = await callClaude(system, idea);
  return extractJSON(result);
}

// STAGE 2: Generate - 3 candidates banana
async function stageGenerate(structured, feedback = null) {
  const system = `You are a naming and brand positioning expert. Given structured brand info, generate 3 DISTINCT naming and positioning candidates.
Respond ONLY with valid JSON array, no other text. Format:
[{"name": "...", "tagline": "...", "positioning": "..."}, ...]
${feedback ? 'IMPORTANT: Avoid this specific weakness from a previous attempt: ' + feedback : ''}`;
  const result = await callClaude(system, JSON.stringify(structured));
  return extractJSON(result);
}

// STAGE 3: Audit - clichés dhundhna aur score dena
async function stageAudit(candidates) {
  const system = `You are a harsh brand critic whose job is to catch generic, cliche brand naming and positioning.
For each candidate, give a distinctiveness score from 1-10 (10 = highly original, 1 = extremely generic/cliche) and a specific one-sentence complaint explaining the weakness.
Respond ONLY with valid JSON array matching input order. Format:
[{"score": 0, "complaint": "..."}, ...]`;
  const result = await callClaude(system, JSON.stringify(candidates));
  const llmAudit = extractJSON(result);

  // Combine with keyword check for each candidate
  return candidates.map((c, i) => {
    const textToCheck = `${c.name} ${c.tagline} ${c.positioning}`;
    const keywordHits = keywordClicheCheck(textToCheck);
    return {
      ...c,
      score: llmAudit[i]?.score ?? 5,
      complaint: llmAudit[i]?.complaint ?? 'No specific complaint generated.',
      keyword_flags: keywordHits
    };
  });
}

// MAIN PIPELINE ENDPOINT
app.post('/api/pipeline', async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || idea.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a real idea description.' });
    }

    // Stage 1
    const structured = await stageUnderstand(idea);

    // Stage 2
    let candidates = await stageGenerate(structured);

    // Stage 3
    let audited = await stageAudit(candidates);

    // Find the weakest candidate
    const weakest = audited.reduce((min, c) => (c.score < min.score ? c : min), audited[0]);

    let revised = null;
    if (weakest.score < 7) {
      // Stage 4: Revise only the weakest one
      const revisedCandidates = await stageGenerate(structured, weakest.complaint);
      const revisedAudited = await stageAudit(revisedCandidates);
      // take the best of the revised batch as the "improved" version
      revised = revisedAudited.reduce((max, c) => (c.score > max.score ? c : max), revisedAudited[0]);
    }

    res.json({
      structured,
      candidates: audited,
      weakest_original: weakest,
      revised,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('AntiGeneric AI backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
