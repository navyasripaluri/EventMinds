# EventMinds Setup Guide

## Quick Start Checklist

Follow these steps to get EventMinds running:

### ✅ Step 1: Get API Keys

#### 1.1 MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

#### 1.2 Pinecone (Free)
1. Go to [Pinecone](https://app.pinecone.io/)
2. Sign up for a free account
3. Create a new index:
   - Name: `eventminds-vendors`
   - Dimensions: `768`
   - Metric: `cosine`
4. Copy your API key from the dashboard
5. Note your environment (e.g., `us-east-1-aws`)

#### 1.3 Google Gemini API (Free)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### ✅ Step 2: Configure Environment

1. Navigate to `server/` folder
2. Open `.env` file
3. Replace all placeholder values with your actual API keys:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventminds
PINECONE_API_KEY=pc-xxxxxxxxxxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=eventminds-vendors
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
PORT=5000
```

### ✅ Step 3: Install Dependencies

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

### ✅ Step 4: Start the Application

Open **TWO** terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Wait for: `✅ Connected to MongoDB` and `✅ Connected to Pinecone`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### ✅ Step 5: Open the App

1. Open your browser
2. Go to `http://localhost:5173`
3. You should see the EventMinds dashboard!

### ✅ Step 6: Test the Features

1. **Vendor Search:**
   - Click "Seed Sample Vendors" button
   - Try searching: "Spicy street food with rustic vibes"

2. **Contract Analyzer:**
   - Upload `server/sample_contract.txt`
   - Click "Analyze Contract"

3. **Schedule Builder:**
   - Event Type: Hackathon
   - Duration: 24 hours
   - Activities: Opening Ceremony, Lunch, Coding, Judging

4. **Theme Creator:**
   - Try: "Cyberpunk theme with neon lights"

5. **Budget Planner:**
   - Budget: 500000
   - Event Type: College Fest

## 🐛 Troubleshooting

### Backend won't start
- Check if `.env` file exists in `server/` folder
- Verify all API keys are correct
- Make sure MongoDB cluster is running
- Check Pinecone index name matches exactly

### Frontend shows errors
- Make sure backend is running first
- Check console for CORS errors
- Verify backend is on port 5000

### "Failed to connect to MongoDB"
- Check your IP is whitelisted in MongoDB Atlas
- Verify connection string has correct password
- Try adding `?retryWrites=true&w=majority` to connection string

### "Pinecone connection error"
- Verify index name is exactly `eventminds-vendors`
- Check dimensions are set to `768`
- Ensure API key is correct

### "Gemini API error"
- Check API key is valid
- Verify you have quota remaining
- Try regenerating the API key

## 📚 Additional Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Pinecone Docs](https://docs.pinecone.io/)
- [Google AI Studio](https://ai.google.dev/)

## 🎉 Success!

If everything is working, you should see:
- Beautiful dark-themed UI
- Vendor search with AI matching
- Contract analysis with risk detection
- Schedule generation
- Theme creation with color palettes
- Budget allocation with charts

Enjoy using EventMinds! 🚀
