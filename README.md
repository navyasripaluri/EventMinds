# EventMinds: AI-Powered Event Planner & Vendor Concierge

An intelligent event management workspace that helps organizers find vendors, analyze contracts, generate schedules, create themes, and allocate budgets using AI.

## 🌟 Features

### 1. **Vibe-Match Vendor Search** (Semantic Search)
- Find vendors based on abstract descriptions like "A photographer who captures candid, moody shots"
- Uses Pinecone vector database for semantic similarity matching
- AI-powered embeddings via Google Gemini

### 2. **Contract "Gotcha" Detector** (RAG)
- Upload vendor contracts (PDF/TXT)
- AI analyzes for risky clauses, hidden fees, and unfair terms
- Highlights cancellation policies, overtime charges, and liability issues

### 3. **Run of Show Generator** (Itinerary)
- Generate detailed, time-stamped event schedules
- AI ensures logical flow with appropriate buffer times
- Customizable for different event types (Hackathons, Weddings, etc.)

### 4. **Theme & Moodboard Creator**
- Describe your vision and get complete visual themes
- AI-generated color palettes with hex codes
- Decoration elements and lighting recommendations

### 5. **Smart Budget Allocator**
- Get AI-powered budget recommendations
- Based on industry standards and your priorities
- Visual breakdown with pie charts and justifications

## 🏗️ Architecture

```
EventMinds/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/   # Feature pages
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── server/          # Node.js + Express backend
│   ├── services/
│   │   ├── ai.js    # Gemini AI integration
│   │   └── rag.js   # RAG & vector search
│   ├── db.js        # Database connections
│   ├── index.js     # Main server
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Pinecone account
- Google AI Studio API key (Gemini)

### 1. Setup Environment Variables

Create `server/.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=eventminds-vendors
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 2. Setup Pinecone Index

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index named `eventminds-vendors`
3. Set dimensions to `768` (for Gemini embeddings)
4. Choose your preferred region

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

## 📖 Usage Guide

### Vendor Search

1. Navigate to "Vendor Search"
2. Click "Seed Sample Vendors" to populate the database with 10 dummy vendors
3. Enter a description like "Spicy street food with rustic vibes"
4. View semantically matched vendors with similarity scores

### Contract Analyzer

1. Navigate to "Contract Analyzer"
2. Upload a vendor contract (PDF or TXT)
3. Click "Analyze Contract"
4. Review risk level and warnings about problematic clauses

**Test File:** Use `server/sample_contract.txt` for testing

### Schedule Builder

1. Navigate to "Schedule Builder"
2. Select event type and duration
3. Add key activities
4. Generate a detailed timeline with timestamps

### Theme Creator

1. Navigate to "Theme Creator"
2. Describe your theme (e.g., "Cyberpunk with neon lights")
3. Get color palettes, decoration ideas, and atmosphere descriptions

### Budget Planner

1. Navigate to "Budget Planner"
2. Enter total budget and event type
3. Set priorities for different categories
4. View AI-recommended allocation with pie chart

## 🔧 API Endpoints

### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create vendor
- `POST /api/vendors/search` - Semantic search
- `POST /api/vendors/seed` - Seed dummy data

### Contracts
- `POST /api/contracts/analyze` - Analyze contract (multipart/form-data)

### Schedule
- `POST /api/schedule/generate` - Generate event schedule

### Theme
- `POST /api/theme/generate` - Generate theme and moodboard

### Budget
- `POST /api/budget/allocate` - Generate budget allocation

## 🎨 Design Features

- **Modern UI**: Vibrant gradients, glassmorphism effects
- **Dark Theme**: Eye-friendly dark mode with neon accents
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Works on desktop and mobile devices
- **Accessibility**: Semantic HTML and ARIA labels

## 🧪 Testing

1. **Vendor Search**: Seed vendors and try various search queries
2. **Contract Analysis**: Upload `server/sample_contract.txt`
3. **Schedule**: Generate a 24-hour hackathon schedule
4. **Theme**: Try "Cyberpunk theme with neon lights"
5. **Budget**: Allocate ₹500,000 for a college fest

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router
- Recharts (for visualizations)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- MongoDB (data storage)
- Pinecone (vector database)
- Google Gemini AI (embeddings & generation)
- Multer (file uploads)
- pdf-parse (PDF extraction)

## 📝 Notes

- The AI responses may vary based on Gemini's generation
- Ensure your API keys have sufficient quota
- Pinecone free tier supports up to 100K vectors
- MongoDB Atlas free tier (M0) is sufficient for development

## 🚧 Future Enhancements

- User authentication and event management
- Real vendor portal for registration
- Image generation for moodboards (DALL-E integration)
- Email notifications and calendar integration
- Multi-language support
- Mobile app (React Native)

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🤝 Contributing

This is a student project. Feel free to fork and enhance!

---

Built with ❤️ using AI-powered technologies
