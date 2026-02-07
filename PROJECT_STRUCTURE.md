# EventMinds - Project Structure

## 📁 Complete File Structure

```
EventMind/
│
├── README.md                    # Main documentation
├── SETUP.md                     # Setup guide
├── .gitignore                   # Git ignore rules
│
├── client/                      # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── VendorSearch.jsx       # Semantic vendor search
│   │   │   ├── ContractAnalyzer.jsx   # Contract risk analysis
│   │   │   ├── ScheduleBuilder.jsx    # Event schedule generator
│   │   │   ├── ThemeCreator.jsx       # Theme & moodboard
│   │   │   └── BudgetPlanner.jsx      # Budget allocation
│   │   ├── App.jsx              # Main app with routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Design system & styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                      # Backend (Node.js + Express)
    ├── services/
    │   ├── ai.js                # Gemini AI integration
    │   └── rag.js               # RAG & vector search
    ├── index.js                 # Main server & API routes
    ├── db.js                    # MongoDB & Pinecone connections
    ├── package.json
    ├── .env                     # Environment variables (create this)
    ├── .env.example             # Environment template
    └── sample_contract.txt      # Test contract file
```

## 🎯 Key Components

### Frontend Pages (5 AI Features)

1. **VendorSearch.jsx** - Vibe-Match Vendor Discovery
   - Semantic search using Pinecone
   - Vendor cards with similarity scores
   - Sample data seeding

2. **ContractAnalyzer.jsx** - Contract Gotcha Detector
   - File upload (PDF/TXT)
   - RAG-based risk analysis
   - Warning highlights

3. **ScheduleBuilder.jsx** - Run of Show Generator
   - Dynamic activity inputs
   - Timeline visualization
   - AI-generated schedules

4. **ThemeCreator.jsx** - Theme & Moodboard Creator
   - Color palette generation
   - Decoration suggestions
   - Atmosphere descriptions

5. **BudgetPlanner.jsx** - Smart Budget Allocator
   - Priority-based allocation
   - Pie chart visualization
   - Justification for each category

### Backend Services

1. **ai.js** - AI Service Layer
   - `generateEmbedding()` - Create vectors for semantic search
   - `analyzeContract()` - Detect risky clauses
   - `generateSchedule()` - Create event timelines
   - `generateTheme()` - Design visual themes
   - `generateBudgetAllocation()` - Smart budget distribution

2. **rag.js** - RAG & Vector Operations
   - `storeVendorEmbedding()` - Index vendors in Pinecone
   - `searchVendorsByVibe()` - Semantic search
   - `analyzeContractWithRAG()` - Contract analysis

3. **db.js** - Database Connections
   - MongoDB connection management
   - Pinecone client initialization

4. **index.js** - API Routes
   - `/api/vendors/*` - Vendor CRUD & search
   - `/api/contracts/analyze` - Contract analysis
   - `/api/schedule/generate` - Schedule generation
   - `/api/theme/generate` - Theme creation
   - `/api/budget/allocate` - Budget allocation

## 🎨 Design System (index.css)

- **Color Palette**: Vibrant purples, pinks, and cyans
- **Typography**: Inter font family
- **Components**: Buttons, cards, inputs, badges
- **Effects**: Glassmorphism, gradients, animations
- **Responsive**: Mobile-first grid system

## 🔄 Data Flow

### Vendor Search Flow
```
User Query → Frontend → Backend API → Gemini (Embedding) 
→ Pinecone (Search) → MongoDB (Details) → Frontend (Display)
```

### Contract Analysis Flow
```
PDF Upload → Backend → Text Extraction → Gemini (Analysis) 
→ Risk Detection → Frontend (Warnings Display)
```

### Schedule Generation Flow
```
Event Details → Backend → Gemini (Generation) 
→ Structured Schedule → Frontend (Timeline)
```

## 🚀 Getting Started

1. Read `SETUP.md` for detailed setup instructions
2. Configure `.env` with your API keys
3. Install dependencies: `npm install` in both folders
4. Start backend: `cd server && npm run dev`
5. Start frontend: `cd client && npm run dev`
6. Open `http://localhost:5173`

## 📊 Technology Stack

**Frontend:**
- React 18 + Vite
- React Router (navigation)
- Recharts (data visualization)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- MongoDB (document storage)
- Pinecone (vector database)
- Google Gemini AI (embeddings & generation)
- Multer (file uploads)
- pdf-parse (PDF text extraction)

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Semantic search with vector databases
- ✅ RAG (Retrieval-Augmented Generation)
- ✅ AI-powered content generation
- ✅ Full-stack JavaScript development
- ✅ Modern UI/UX design principles
- ✅ API design and integration
- ✅ File processing and analysis

---

For detailed setup instructions, see `SETUP.md`
For usage guide, see `README.md`
