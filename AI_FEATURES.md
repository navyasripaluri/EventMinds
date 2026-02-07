# EventMinds - AI Features Showcase

## 🎯 Core AI Features Explained

### 1. 🔍 Vibe-Match Vendor Search (Semantic Search)

**The Problem:**
Traditional keyword search fails when users describe what they want conceptually. Searching for "DJ" returns all DJs, not the one that matches your event's vibe.

**The Solution:**
Semantic search using vector embeddings. Users can describe their needs naturally, and AI finds vendors that match the *meaning* behind the description.

**How It Works:**
1. **Vendor Onboarding**: Each vendor's profile (name, description, specialties, style) is converted into a 768-dimensional vector using Gemini embeddings
2. **Storage**: Vectors are stored in Pinecone vector database with metadata
3. **Search**: User query is converted to a vector and compared against all vendor vectors
4. **Matching**: Pinecone returns the most similar vendors based on cosine similarity
5. **Display**: Results show with similarity scores (e.g., 87% match)

**Example Queries:**
- ❌ Old way: "DJ" → Returns all DJs
- ✅ New way: "High energy DJ who plays EDM and Bollywood for college crowds" → Returns DJ Snake Beats (95% match)

**Technical Stack:**
- Gemini `embedding-001` model
- Pinecone vector database
- Cosine similarity matching

---

### 2. ⚠️ Contract "Gotcha" Detector (RAG)

**The Problem:**
Event organizers sign vendor contracts without understanding legal jargon, leading to hidden fees, unfair cancellation policies, and liability issues.

**The Solution:**
AI-powered contract analysis that reads the fine print and flags risky clauses in plain English.

**How It Works:**
1. **Upload**: User uploads PDF or TXT contract
2. **Extraction**: Text is extracted from the document
3. **Analysis**: Gemini analyzes the contract with a specialized prompt focusing on:
   - Cancellation policies
   - Hidden fees and overtime charges
   - Refund terms
   - Liability clauses
   - Payment conditions
4. **Risk Assessment**: AI assigns risk level (Low/Medium/High)
5. **Warnings**: Specific problematic clauses are highlighted with explanations

**Example Output:**
```json
{
  "riskLevel": "high",
  "warnings": [
    {
      "clause": "Clause 3: Cancellation Policy",
      "issue": "Vendor can cancel within 24 hours without refund obligation",
      "severity": "high"
    },
    {
      "clause": "Clause 4: Overtime Charges",
      "issue": "Double rate ($1,000/hour) after 11 PM is non-standard",
      "severity": "medium"
    }
  ],
  "summary": "This contract contains several unfair terms..."
}
```

**RAG Enhancement:**
While the current implementation uses direct AI analysis, the architecture supports RAG expansion where standard contract clauses are stored in Pinecone and retrieved for comparison.

**Technical Stack:**
- Gemini `gemini-pro` model
- pdf-parse for text extraction
- Structured JSON output

---

### 3. 📅 Run of Show Generator (Itinerary)

**The Problem:**
Creating a minute-by-minute event schedule is tedious and error-prone. Organizers often forget buffer times, meal breaks, or logical activity flow.

**The Solution:**
AI generates a complete, time-stamped schedule ensuring logical flow and proper timing.

**How It Works:**
1. **Input**: Event type, duration (hours), key activities
2. **Generation**: Gemini creates a detailed schedule considering:
   - Logical activity sequencing
   - Appropriate buffer times
   - Meal times at reasonable hours
   - Setup and breakdown periods
   - Breaks between intensive activities
3. **Output**: Structured JSON with time, activity, duration, and notes

**Example Input:**
- Event Type: Hackathon
- Duration: 24 hours
- Activities: Opening Ceremony, Lunch, Coding, Judging

**Example Output:**
```json
[
  {
    "time": "9:00 AM",
    "activity": "Registration & Setup",
    "duration": "60 minutes",
    "notes": "Allow time for participants to settle in"
  },
  {
    "time": "10:00 AM",
    "activity": "Opening Ceremony",
    "duration": "30 minutes",
    "notes": "Welcome speech and rules explanation"
  },
  {
    "time": "10:30 AM",
    "activity": "Coding Session Begins",
    "duration": "150 minutes",
    "notes": "First intensive coding block"
  },
  {
    "time": "1:00 PM",
    "activity": "Lunch Break",
    "duration": "60 minutes",
    "notes": "Catering service"
  }
  // ... continues for 24 hours
]
```

**Technical Stack:**
- Gemini `gemini-pro` model
- Structured prompt engineering
- JSON parsing and validation

---

### 4. 🎨 Theme & Moodboard Creator

**The Problem:**
Event organizers struggle to translate abstract theme ideas into concrete visual elements, color schemes, and decoration plans.

**The Solution:**
AI generates a complete visual theme package from a simple description.

**How It Works:**
1. **Input**: Theme description (e.g., "Cyberpunk with neon lights")
2. **Generation**: Gemini creates:
   - **Color Palette**: 5 hex color codes that match the theme
   - **Visual Description**: Detailed aesthetic explanation
   - **Decoration Elements**: Specific items to use
   - **Lighting Style**: Lighting recommendations
   - **Atmosphere**: Overall mood and feeling
3. **Output**: Structured JSON with all theme components

**Example Input:**
"Cyberpunk theme with neon lights"

**Example Output:**
```json
{
  "colorPalette": [
    "#FF00FF",  // Neon Pink
    "#00FFFF",  // Cyan
    "#9D00FF",  // Purple
    "#FF3366",  // Hot Pink
    "#0D0D0D"   // Dark Background
  ],
  "visualDescription": "A futuristic cyberpunk aesthetic featuring bold neon colors against dark backgrounds. Think Blade Runner meets Tokyo nightlife...",
  "decorElements": [
    "LED strip lights in pink and cyan",
    "Geometric metal structures",
    "Holographic banners",
    "Digital screens with glitch effects",
    "Fog machines for atmosphere"
  ],
  "lightingStyle": "Dynamic RGB lighting with pulsing effects, blacklights, and laser projections",
  "atmosphere": "Edgy, futuristic, high-energy with a dystopian edge"
}
```

**Use Cases:**
- Event planners can share color codes with decorators
- Visual description can be used with image generation APIs
- Decoration list serves as a shopping checklist

**Technical Stack:**
- Gemini `gemini-pro` model
- Color theory integration
- Design principles prompting

---

### 5. 💰 Smart Budget Allocator

**The Problem:**
Event organizers don't know how to distribute their budget across different categories (venue, food, entertainment, etc.) and often overspend in one area.

**The Solution:**
AI recommends budget allocation based on industry standards, event type, and user priorities.

**How It Works:**
1. **Input**: 
   - Total budget (e.g., ₹500,000)
   - Event type (e.g., College Fest)
   - Priorities (Food: High, Decor: Low, etc.)
2. **Analysis**: Gemini considers:
   - Industry standard ratios for the event type
   - User-specified priorities
   - Essential vs. optional categories
   - Contingency buffer
3. **Output**: Detailed allocation with justifications

**Example Input:**
- Budget: ₹500,000
- Event: College Fest
- Priorities: Food (High), Entertainment (High), Decor (Low)

**Example Output:**
```json
[
  {
    "category": "Catering/Food",
    "amount": 150000,
    "percentage": 30,
    "justification": "High priority. College students expect good food. Allocated for 500 attendees."
  },
  {
    "category": "Entertainment (DJ/Music)",
    "amount": 100000,
    "percentage": 20,
    "justification": "High priority. Quality entertainment is crucial for fest success."
  },
  {
    "category": "Venue",
    "amount": 75000,
    "percentage": 15,
    "justification": "Standard allocation for college auditorium rental and setup."
  },
  {
    "category": "Decoration",
    "amount": 50000,
    "percentage": 10,
    "justification": "Low priority as specified. Basic decorations only."
  },
  {
    "category": "Sound & Lighting",
    "amount": 75000,
    "percentage": 15,
    "justification": "Essential for large venue. Professional equipment needed."
  },
  {
    "category": "Miscellaneous/Contingency",
    "amount": 50000,
    "percentage": 10,
    "justification": "Buffer for unexpected expenses and last-minute changes."
  }
]
```

**Technical Stack:**
- Gemini `gemini-pro` model
- Financial logic prompting
- Recharts for visualization

---

## 🔬 AI Technologies Used

### Google Gemini AI
- **Model**: `gemini-pro` for text generation
- **Model**: `embedding-001` for vector embeddings
- **Capabilities**: 
  - Natural language understanding
  - Structured output generation
  - Context-aware responses
  - Multi-turn conversations

### Pinecone Vector Database
- **Purpose**: Semantic search and similarity matching
- **Dimensions**: 768 (matching Gemini embeddings)
- **Metric**: Cosine similarity
- **Features**:
  - Fast vector search (milliseconds)
  - Metadata filtering
  - Scalable to millions of vectors

### RAG (Retrieval-Augmented Generation)
- **Pattern**: Retrieve relevant context → Augment prompt → Generate response
- **Benefits**:
  - More accurate responses
  - Grounded in specific data
  - Reduces hallucinations
  - Domain-specific knowledge

---

## 🎓 Learning Outcomes

By building EventMinds, you learn:

1. **Semantic Search**: How to implement vector-based search beyond keywords
2. **RAG Architecture**: Combining retrieval with generation for better AI responses
3. **Prompt Engineering**: Crafting prompts for structured, reliable outputs
4. **Vector Databases**: Working with embeddings and similarity search
5. **AI Integration**: Connecting multiple AI services in a full-stack app
6. **Document Processing**: Extracting and analyzing text from PDFs
7. **Data Visualization**: Presenting AI results in user-friendly formats

---

## 🚀 Real-World Applications

This architecture can be adapted for:
- **Legal Tech**: Contract analysis for any industry
- **E-commerce**: Product recommendations based on descriptions
- **HR**: Resume matching with job descriptions
- **Real Estate**: Property search by lifestyle preferences
- **Education**: Course recommendations based on learning goals

---

## 📊 Performance Metrics

- **Search Speed**: < 500ms for semantic vendor search
- **Contract Analysis**: ~5-10 seconds for typical contract
- **Schedule Generation**: ~3-5 seconds
- **Theme Creation**: ~4-6 seconds
- **Budget Allocation**: ~3-5 seconds

*Times may vary based on Gemini API response times*

---

Built with cutting-edge AI technologies to solve real-world event planning challenges! 🎉
