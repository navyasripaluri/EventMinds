# 🚀 EventMinds - Quick Reference

## ⚡ Quick Start Commands

### First Time Setup
```bash
# 1. Install backend dependencies
cd server
npm install

# 2. Install frontend dependencies
cd ../client
npm install

# 3. Configure environment (edit server/.env with your API keys)
# See SETUP.md for detailed instructions
```

### Running the Application
```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm run dev
```

### Access the App
Open browser: `http://localhost:5173`

---

## 🔑 Required API Keys

| Service | Get From | Purpose |
|---------|----------|---------|
| MongoDB Atlas | [cloud.mongodb.com](https://cloud.mongodb.com/) | Data storage |
| Pinecone | [app.pinecone.io](https://app.pinecone.io/) | Vector search |
| Google Gemini | [makersuite.google.com](https://makersuite.google.com/app/apikey) | AI generation |

---

## 📋 Feature Checklist

### ✅ Vendor Search
1. Click "Seed Sample Vendors"
2. Enter query: "Spicy street food with rustic vibes"
3. View matched vendors with scores

### ✅ Contract Analyzer
1. Upload `server/sample_contract.txt`
2. Click "Analyze Contract"
3. Review risk warnings

### ✅ Schedule Builder
1. Select event type: "Hackathon"
2. Duration: 24 hours
3. Add activities: Opening, Lunch, Coding, Judging
4. Generate schedule

### ✅ Theme Creator
1. Enter: "Cyberpunk theme with neon lights"
2. Generate theme
3. View color palette and decorations

### ✅ Budget Planner
1. Budget: 500000
2. Event: College Fest
3. Set priorities
4. View allocation chart

---

## 🎯 API Endpoints Reference

### Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create vendor
- `POST /api/vendors/search` - Semantic search
  ```json
  { "query": "High energy DJ for college fest" }
  ```
- `POST /api/vendors/seed` - Seed sample data

### Contracts
- `POST /api/contracts/analyze` - Analyze contract
  - Form data with file upload

### Schedule
- `POST /api/schedule/generate` - Generate schedule
  ```json
  {
    "eventType": "Hackathon",
    "duration": 24,
    "activities": ["Opening", "Coding", "Judging"]
  }
  ```

### Theme
- `POST /api/theme/generate` - Generate theme
  ```json
  { "description": "Cyberpunk with neon lights" }
  ```

### Budget
- `POST /api/budget/allocate` - Allocate budget
  ```json
  {
    "totalBudget": 500000,
    "eventType": "College Fest",
    "priorities": { "food": "high", "decoration": "low" }
  }
  ```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `.env` file exists and has valid API keys |
| "MongoDB connection error" | Whitelist your IP in MongoDB Atlas |
| "Pinecone not found" | Verify index name is `eventminds-vendors` with 768 dimensions |
| Frontend shows errors | Ensure backend is running on port 5000 |
| "CORS error" | Backend and frontend must run on different ports |
| Gemini API error | Check API key and quota limits |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `server/.env` | API keys and configuration |
| `server/sample_contract.txt` | Test contract for analyzer |
| `README.md` | Main documentation |
| `SETUP.md` | Detailed setup guide |
| `AI_FEATURES.md` | AI features explanation |
| `PROJECT_STRUCTURE.md` | Code organization |

---

## 🎨 Design System Quick Reference

### Colors
- Primary: `hsl(260, 85%, 60%)` - Purple
- Secondary: `hsl(320, 85%, 60%)` - Pink
- Accent: `hsl(180, 85%, 55%)` - Cyan
- Background: `hsl(240, 15%, 8%)` - Dark

### Components
- `.btn-primary` - Main action button
- `.btn-secondary` - Secondary button
- `.card` - Content card with glassmorphism
- `.badge` - Status badge
- `.input` - Form input field

---

## 📊 Project Stats

- **Total Files**: ~25 source files
- **Frontend Pages**: 5 AI-powered features
- **Backend Routes**: 10+ API endpoints
- **AI Models Used**: 2 (Gemini Pro, Embedding-001)
- **Databases**: 2 (MongoDB, Pinecone)
- **Lines of Code**: ~2,500+

---

## 🎓 Technologies Used

**Frontend**: React, Vite, React Router, Recharts, Lucide Icons  
**Backend**: Node.js, Express, MongoDB, Pinecone  
**AI**: Google Gemini (Pro & Embeddings)  
**Styling**: Custom CSS with design system  

---

## 📚 Documentation Files

1. **README.md** - Overview and features
2. **SETUP.md** - Step-by-step setup guide
3. **AI_FEATURES.md** - Detailed AI feature explanations
4. **PROJECT_STRUCTURE.md** - Code organization
5. **QUICK_REFERENCE.md** - This file!

---

## 🎉 Next Steps

1. ✅ Set up API keys
2. ✅ Install dependencies
3. ✅ Start both servers
4. ✅ Test all 5 AI features
5. 🚀 Customize and extend!

---

**Need Help?** Check `SETUP.md` for troubleshooting or review `AI_FEATURES.md` for feature details.

**Ready to Deploy?** Consider using Vercel (frontend) and Railway/Render (backend).

---

Made with ❤️ using AI-powered technologies
