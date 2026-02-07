import dotenv from 'dotenv';
dotenv.config();

const API_VERSION = 'v1beta';
const TEXT_MODEL = 'gemini-2.5-flash';
const EMBEDDING_MODEL = 'text-embedding-004';

/**
 * Direct fetch implementation for Gemini API with simple retry + exponential backoff.
 * This helps gracefully handle rate limits (429) and transient server errors (5xx).
 */
function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function callGemini(endpoint, data, retries = 3, attempt = 0) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${endpoint}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));

        if (response.ok) return body;

        // Read retry-after header if present
        const retryAfterHeader = response.headers.get('retry-after');
        let retryAfterSec = null;
        if (retryAfterHeader) {
            const parsed = parseInt(retryAfterHeader, 10);
            if (!Number.isNaN(parsed)) retryAfterSec = parsed;
        }

        const message = body.error?.message || `API error: ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        if (retryAfterSec !== null) err.retryAfter = retryAfterSec;

        const shouldRetry = response.status === 429 || response.status >= 500 || /quota|Please retry/i.test(message);
        if (shouldRetry && retries > 0) {
            const waitMs = retryAfterSec ? retryAfterSec * 1000 : Math.min(1000 * Math.pow(2, attempt), 30000);
            console.warn(`⚠️ Gemini request returned ${response.status}. Retrying in ${waitMs}ms (attempt ${attempt + 1})`);
            await sleep(waitMs);
            return callGemini(endpoint, data, retries - 1, attempt + 1);
        }

        throw err;
    } catch (err) {
        // Retry on network/transient errors
        if (retries > 0 && /fetch|network|ECONN|timeout/i.test(err.message || '')) {
            const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000);
            console.warn(`⚠️ Network error when calling Gemini. Retrying in ${waitMs}ms (attempt ${attempt + 1})`);
            await sleep(waitMs);
            return callGemini(endpoint, data, retries - 1, attempt + 1);
        }
        throw err;
    }
}

/**
 * Generate embeddings for text using Gemini
 */
export async function generateEmbedding(text, retries = 3) {
    try {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

        let attempt = 0;
        while (attempt <= retries) {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: { parts: [{ text }] }
                })
            });

            let body;
            try { body = await response.json(); } catch { body = {}; }

            if (response.ok && body.embedding && body.embedding.values) {
                return body.embedding.values;
            }

            const retryAfterHeader = response.headers.get('retry-after');
            let retryAfterSec = null;
            if (retryAfterHeader) {
                const parsed = parseInt(retryAfterHeader, 10);
                if (!Number.isNaN(parsed)) retryAfterSec = parsed;
            }

            const message = body.error?.message || `Embedding error: ${response.status}`;
            const isRetryable = response.status === 429 || response.status >= 500 || /quota|Please retry/i.test(message);

            if (isRetryable && attempt < retries) {
                const waitMs = retryAfterSec ? retryAfterSec * 1000 : Math.min(500 * Math.pow(2, attempt), 30000);
                console.warn(`⚠️ Embedding call got ${response.status}. Retrying in ${waitMs}ms (attempt ${attempt + 1})`);
                await sleep(waitMs);
                attempt++;
                continue;
            }

            const err = new Error(message);
            err.status = response.status;
            if (retryAfterSec !== null) err.retryAfter = retryAfterSec;
            throw err;
        }
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}



/**
 * Generate text response from Gemini
 */
export async function generateText(prompt) {
    try {
        const data = await callGemini(TEXT_MODEL, {
            contents: [{ parts: [{ text: prompt }] }]
        }, 3);

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error generating text:', error);
        throw error;
    }
}

/**
 * Analyze contract for risky clauses
 */
export async function analyzeContract(contractText) {
    const prompt = `You are a legal contract analyzer. Analyze the following contract and identify any risky, unfair, or non-standard clauses. Focus on:
- Cancellation policies
- Hidden fees or overtime charges
- Refund policies
- Liability clauses
- Payment terms

Contract:
${contractText}

Provide a JSON response with the following structure:
{
  "riskLevel": "low|medium|high",
  "warnings": [
    {
      "clause": "Clause reference",
      "issue": "Description of the issue",
      "severity": "low|medium|high"
    }
  ],
  "summary": "Overall assessment"
}

IMPORTANT: Return ONLY the JSON object. No other text.`;

    try {
        const response = await generateText(prompt);
        try {
            let cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            // Handle if there are multiple JSON objects (take the first valid one)
            return JSON.parse(jsonMatch ? jsonMatch[0] : cleanResponse);
        } catch {
            return {
                riskLevel: 'medium',
                warnings: [],
                summary: response
            };
        }
    } catch (error) {
        console.error('Error analyzing contract:', error);
        throw error;
    }
}

/**
 * Generate event schedule/itinerary
 */
export async function generateSchedule(eventType, duration, activities) {
    const prompt = `Create a detailed "Run of Show" schedule for a ${eventType} event.

Duration: ${duration} hours
Key Activities: ${activities.join(', ')}

Generate a time-stamped schedule ensuring:
- Logical flow of activities
- Appropriate buffer times
- Meal times at reasonable hours
- Setup and breakdown time
- Breaks between intensive activities

Return a JSON array with this structure:
[
  {
    "time": "HH:MM AM/PM",
    "activity": "Activity name",
    "duration": "X minutes",
    "notes": "Any special notes"
  }
]

IMPORTANT: Return ONLY the JSON array. No other text.`;

    try {
        const response = await generateText(prompt);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error('Error generating schedule (using fallback):', error.message);
        // Fallback schedule
        return [
            { "time": "09:00 AM", "activity": "Arrival & Registration", "duration": "60 min", "notes": "Welcome guests" },
            { "time": "10:00 AM", "activity": "Opening Ceremony", "duration": "30 min", "notes": "Kickoff" },
            { "time": "10:30 AM", "activity": "Main Activity Block 1", "duration": "120 min", "notes": "Core event activities" },
            { "time": "12:30 PM", "activity": "Lunch Break", "duration": "60 min", "notes": "Buffet service" },
            { "time": "01:30 PM", "activity": "Main Activity Block 2", "duration": "90 min", "notes": "Continued activities" },
            { "time": "03:00 PM", "activity": "Networking / Tea Break", "duration": "45 min", "notes": "Casual interaction" },
            { "time": "03:45 PM", "activity": "Closing Remarks", "duration": "30 min", "notes": "Thank you note" }
        ];
    }
}

/**
 * Generate theme and moodboard
 */
export async function generateTheme(themeDescription) {
    const prompt = `Create a detailed visual theme and moodboard for an event with the following description:
"${themeDescription}"

Provide a JSON response with:
{
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "visualDescription": "Detailed description of the visual aesthetic",
  "decorElements": ["element1", "element2", ...],
  "lightingStyle": "Description of lighting",
  "atmosphere": "Overall mood and feeling"
}

IMPORTANT: Return ONLY the JSON object. No other text.`;

    try {
        const response = await generateText(prompt);
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : response);
        } catch {
            throw new Error('Failed to parse JSON');
        }
    } catch (error) {
        console.error('Error generating theme (using fallback):', error.message);
        return {
            colorPalette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#fcdab7'],
            visualDescription: `(AI Service Unavailable) A reliable fallback theme based on: "${themeDescription}". High contrast and professional.`,
            decorElements: ["Geometric centerpieces", "Metallic accents", "Smart lighting fixtures"],
            lightingStyle: "Ambient warm paired with focused spotlights",
            atmosphere: "Professional, energetic, and polished"
        };
    }
}

/**
 * Generate budget allocation
 */
export async function generateBudgetAllocation(totalBudget, priorities, eventType, guestCount) {
    const prompt = `Create a smart budget allocation for a ${eventType} event with ${guestCount} attendees.

Total Budget: ₹${totalBudget}
Guest Count: ${guestCount} people
Priorities: ${JSON.stringify(priorities)}

Based on industry standards and the scale of ${guestCount} people, allocate the budget across these categories:
- Venue
- Catering/Food (Consider per-head cost for ${guestCount} people)
- Entertainment (DJ/Music)
- Decoration
- Photography/Videography
- Sound & Lighting
- Miscellaneous/Contingency

Return a JSON array:
[
  {
    "category": "Category name",
    "amount": number,
    "percentage": number,
    "justification": "Why this allocation based on ${guestCount} people and priorities",
    "items": ["Specific item 1", "Specific item 2", "Specific item 3"]
  }
]

Ensure the total adds up to the budget and respects the stated priorities.

IMPORTANT: Return ONLY the JSON array. No other text.`;

    try {
        const response = await generateText(prompt);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error('Error generating budget (using fallback):', error.message);

        // Simple fallback allocation
        const budget = Number(totalBudget) || 100000;
        return [
            { "category": "Venue & Facilities", "amount": budget * 0.35, "percentage": 35, "justification": "Standard allocation (Fallback)", "items": ["Rentals", "Basic Setup"] },
            { "category": "Catering & Food", "amount": budget * 0.30, "percentage": 30, "justification": "Standard allocation (Fallback)", "items": ["Buffet", "Beverages"] },
            { "category": "Decoration & Vibe", "amount": budget * 0.15, "percentage": 15, "justification": "Standard allocation (Fallback)", "items": ["Layout", "Props"] },
            { "category": "Entertainment & AV", "amount": budget * 0.15, "percentage": 15, "justification": "Standard allocation (Fallback)", "items": ["Music", "Sound System"] },
            { "category": "Contingency", "amount": budget * 0.05, "percentage": 5, "justification": "Emergency fund", "items": ["Miscellaneous"] }
        ];
    }
}

export async function generateVendorRecommendations(vibeDescription) {
    const prompt = `Based on the following event "vibe" or description, generate 3 sample vendors that would perfect for this event.
Description: "${vibeDescription}"

Return a JSON array of 3 vendor objects with this structure:
[
  {
    "name": "Creative Vendor Name",
    "category": "Catering|DJ/Music|Photography|Decoration|Sound & Lighting",
    "description": "Short catchy description matching the vibe",
    "specialties": ["Specialty 1", "Specialty 2"],
    "style": "Brief style description",
    "priceRange": "$|$|$|$",
    "rating": number (4.0-5.0),
    "phoneNumber": "+91 9xxx-xxxxx",
    "highlights": ["Highlight 1", "Highlight 2"],
    "teamInfo": "Brief background about the team or owner",
    "personalDetails": { "yearsExp": number, "location": "City, Service Area", "teamSize": number },
    "isAIGenerated": true
  }
]

IMPORTANT: Return ONLY the JSON array. No other text.`;

    try {
        console.log(`🤖 Generating vendor recommendations for: "${vibeDescription}"...`);
        const response = await generateText(prompt);
        // console.log('🤖 Raw AI response:', response.substring(0, 100) + '...'); 

        let cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
        const vendors = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        console.log(`✅ Generated ${vendors.length} vendors`);
        return vendors;
    } catch (error) {
        console.error('Error generating vendor recommendations (using fallback):', error.message);
        // Fallback mock vendors
        return [
            {
                "name": "Lumina Events (AI Fallback)",
                "category": "Decoration",
                "description": `Creative decor matching: ${vibeDescription}`,
                "specialties": ["Custom Themes", "Lighting"],
                "style": "Modern & Adaptive",
                "priceRange": "$$$",
                "rating": 4.5,
                "isAIGenerated": true
            },
            {
                "name": "Sonic Waves (AI Fallback)",
                "category": "DJ/Music",
                "description": "High energy entertainment for any vibe",
                "specialties": ["Live Mixing", "Genre Blending"],
                "style": "Energetic",
                "priceRange": "$$",
                "rating": 4.7,
                "isAIGenerated": true
            },
            {
                "name": "Taste Fusion (AI Fallback)",
                "category": "Catering",
                "description": "Exquisite flavors to complement your event",
                "specialties": ["fusion Cuisine", "Live Stations"],
                "style": "Elegant",
                "priceRange": "$$$",
                "rating": 4.8,
                "isAIGenerated": true
            }
        ];
    }
}

export default {
    generateEmbedding,
    generateText,
    analyzeContract,
    generateSchedule,
    generateTheme,
    generateBudgetAllocation,
    generateVendorRecommendations
};
