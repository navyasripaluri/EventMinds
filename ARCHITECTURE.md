# EventMinds - Architecture & Code Organization

## 🏗️ Architecture Pattern

Your EventMinds project uses a **simplified MVC-like architecture** with a **service-oriented design**. Here's how it's organized:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages   │   │
│  │ (Views)  │  │ (Views)  │  │ (Views)  │  │ (Views)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js/Express)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              index.js (Routes + Controllers)         │   │
│  │  • Health Check Route                                │   │
│  │  • Vendor Routes (CRUD + Search)                     │   │
│  │  • Contract Routes (Upload + Analyze)                │   │
│  │  • Schedule Routes (Generate)                        │   │
│  │  • Theme Routes (Generate)                           │   │
│  │  • Budget Routes (Allocate)                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↕                                 │
│  ┌──────────────────────┐     ┌──────────────────────┐     │
│  │   services/ai.js     │     │  services/rag.js     │     │
│  │  (Business Logic)    │     │  (Business Logic)    │     │
│  │                      │     │                      │     │
│  │ • generateEmbedding  │     │ • storeVendorEmbed   │     │
│  │ • generateText       │     │ • searchVendorsByVibe│     │
│  │ • analyzeContract    │     │ • analyzeContractRAG │     │
│  │ • generateSchedule   │     │                      │     │
│  │ • generateTheme      │     │                      │     │
│  │ • generateBudget     │     │                      │     │
│  └──────────────────────┘     └──────────────────────┘     │
│                            ↕                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    db.js (Data Layer)                │   │
│  │  • connectMongoDB()                                  │   │
│  │  • connectPinecone()                                 │   │
│  │  • getDB()                                           │   │
│  │  • getPineconeIndex()                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ MongoDB  │  │ Pinecone │  │  Gemini  │                  │
│  │ Database │  │  Vector  │  │    AI    │                  │
│  │          │  │    DB    │  │          │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 Where Are Controllers and Routes?

### **Answer: They're Combined in `server/index.js`**

Unlike traditional MVC frameworks (like Laravel, Django, or Rails) that separate routes and controllers into different files, your EventMinds project uses **Express.js's inline route handlers** pattern.

### **Traditional MVC Pattern:**
```
routes/
  ├── vendorRoutes.js      → Defines URL paths
controllers/
  ├── vendorController.js  → Handles business logic
```

### **Your EventMinds Pattern:**
```
server/
  ├── index.js             → Routes + Controllers combined
  ├── services/
  │   ├── ai.js            → Business logic (AI operations)
  │   └── rag.js           → Business logic (Vector operations)
  └── db.js                → Data access layer
```

---

## 📂 File-by-File Breakdown

### **1. `server/index.js` (Routes + Controllers)**

This file contains **BOTH routes and controller logic**:

#### **Routes Defined:**
```javascript
// Health Check
GET  /api/health

// Vendor Management
GET  /api/vendors              → Get all vendors
POST /api/vendors              → Create vendor
POST /api/vendors/search       → Semantic search
POST /api/vendors/seed         → Seed dummy data

// Contract Analysis
POST /api/contracts/analyze    → Analyze contract

// Schedule Generation
POST /api/schedule/generate    → Generate schedule

// Theme Creation
POST /api/theme/generate       → Generate theme

// Budget Planning
POST /api/budget/allocate      → Generate budget
```

#### **Controller Logic (Example):**
```javascript
// This is BOTH the route definition AND controller logic
app.post('/api/vendors/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        // Validation (Controller logic)
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        // Call service layer (Controller logic)
        const matches = await searchVendorsByVibe(query);
        
        // Database operations (Controller logic)
        const db = getDB();
        const vendors = await db.collection('vendors')
            .find({ _id: { $in: vendorIds } })
            .toArray();
        
        // Response (Controller logic)
        res.json(vendorsWithScores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

**Lines of Code:**
- **Total:** 329 lines
- **Routes:** 15 endpoints
- **Middleware:** Lines 15-20
- **Health Check:** Lines 36-42
- **Vendor Routes:** Lines 44-235
- **Contract Routes:** Lines 237-264
- **Schedule Routes:** Lines 266-282
- **Theme Routes:** Lines 284-300
- **Budget Routes:** Lines 302-322

---

### **2. `server/services/ai.js` (AI Service Layer)**

This file contains **business logic for AI operations**:

#### **Functions (Like Controller Methods):**
```javascript
generateEmbedding(text)
  → Converts text to 768-dimensional vector
  → Used for semantic search

generateText(prompt)
  → General-purpose AI text generation
  → Used by all AI features

analyzeContract(contractText)
  → Analyzes contracts for risky clauses
  → Returns risk level and warnings

generateSchedule(eventType, duration, activities)
  → Creates event timelines
  → Returns structured schedule array

generateTheme(themeDescription)
  → Generates visual themes
  → Returns color palettes and decor ideas

generateBudgetAllocation(totalBudget, priorities, eventType)
  → Allocates budget across categories
  → Returns allocation with justifications
```

**Lines of Code:** 211 lines

**Key Responsibilities:**
- Gemini AI integration
- Prompt engineering
- JSON parsing and validation
- Error handling for AI operations

---

### **3. `server/services/rag.js` (RAG Service Layer)**

This file contains **business logic for vector operations**:

#### **Functions:**
```javascript
storeVendorEmbedding(vendorId, vendorData)
  → Creates embeddings for vendors
  → Stores in Pinecone vector database
  → Used when creating new vendors

searchVendorsByVibe(query, topK = 5)
  → Semantic search using embeddings
  → Queries Pinecone for similar vendors
  → Returns top matches with similarity scores

analyzeContractWithRAG(contractText)
  → RAG-based contract analysis
  → Currently delegates to AI service
  → Architecture supports future RAG expansion
```

**Lines of Code:** 83 lines

**Key Responsibilities:**
- Pinecone vector database operations
- Embedding generation and storage
- Semantic similarity search
- RAG pattern implementation

---

### **4. `server/db.js` (Data Access Layer)**

This file handles **database connections**:

```javascript
connectMongoDB()
  → Connects to MongoDB Atlas
  → Stores vendor data, contracts, etc.

connectPinecone()
  → Connects to Pinecone vector database
  → Stores embeddings for semantic search

getDB()
  → Returns MongoDB database instance
  → Used by routes to access collections

getPineconeIndex()
  → Returns Pinecone index instance
  → Used by RAG service for vector operations
```

---

## 🔄 Request Flow Example

Let's trace a **semantic vendor search** request:

```
1. USER ACTION (Frontend)
   ├─ User types: "Spicy street food with rustic vibes"
   └─ VendorSearch.jsx sends POST to /api/vendors/search

2. ROUTE HANDLER (index.js, line 76)
   ├─ app.post('/api/vendors/search', async (req, res) => {...})
   └─ Extracts query from request body

3. CONTROLLER LOGIC (index.js, lines 78-82)
   ├─ Validates query exists
   └─ If invalid, returns 400 error

4. SERVICE LAYER CALL (rag.js, line 37)
   ├─ const matches = await searchVendorsByVibe(query)
   └─ Calls RAG service

5. AI SERVICE (ai.js, line 15)
   ├─ generateEmbedding(query)
   └─ Converts query to vector using Gemini

6. VECTOR DATABASE (rag.js, lines 45-49)
   ├─ index.query({ vector: queryEmbedding, topK: 5 })
   └─ Pinecone returns similar vendors

7. DATA LAYER (index.js, lines 88-99)
   ├─ getDB().collection('vendors').find(...)
   └─ MongoDB fetches full vendor details

8. RESPONSE (index.js, lines 102-107)
   ├─ Combines vendor data with similarity scores
   └─ Returns JSON to frontend

9. FRONTEND DISPLAY (VendorSearch.jsx)
   └─ Renders vendor cards with match percentages
```

---

## 🎯 Why This Architecture?

### **Advantages:**

1. **Simplicity**
   - Small project, no need for complex folder structure
   - Easy to understand and navigate
   - All routes visible in one file

2. **Service-Oriented**
   - Business logic separated into services
   - Reusable AI and RAG functions
   - Clean separation of concerns

3. **Scalability**
   - Easy to extract routes into separate files later
   - Services can be moved to microservices
   - Database layer is already abstracted

### **When to Refactor:**

If the project grows, you could refactor to:

```
server/
├── routes/
│   ├── vendorRoutes.js
│   ├── contractRoutes.js
│   ├── scheduleRoutes.js
│   ├── themeRoutes.js
│   └── budgetRoutes.js
├── controllers/
│   ├── vendorController.js
│   ├── contractController.js
│   ├── scheduleController.js
│   ├── themeController.js
│   └── budgetController.js
├── services/
│   ├── ai.js
│   └── rag.js
├── models/
│   ├── Vendor.js
│   └── Contract.js
├── middleware/
│   ├── auth.js
│   └── validation.js
└── index.js
```

---

## 📊 Code Distribution

| File | Lines | Purpose | Equivalent to |
|------|-------|---------|---------------|
| `index.js` | 329 | Routes + Controllers | `routes/` + `controllers/` |
| `services/ai.js` | 211 | AI Business Logic | Service Layer |
| `services/rag.js` | 83 | Vector Operations | Service Layer |
| `db.js` | ~50 | Database Connections | Data Access Layer |

**Total Backend Code:** ~673 lines

---

## 🔍 Finding Specific Logic

### **"Where is the vendor search controller?"**
- **File:** `server/index.js`
- **Lines:** 76-111
- **Route:** `POST /api/vendors/search`

### **"Where is the contract analysis logic?"**
- **Route Handler:** `server/index.js`, lines 239-264
- **Business Logic:** `server/services/ai.js`, lines 42-82
- **RAG Wrapper:** `server/services/rag.js`, lines 65-76

### **"Where is the schedule generation?"**
- **Route Handler:** `server/index.js`, lines 268-282
- **Business Logic:** `server/services/ai.js`, lines 87-122

### **"Where is the theme creator?"**
- **Route Handler:** `server/index.js`, lines 286-300
- **Business Logic:** `server/services/ai.js`, lines 127-157

### **"Where is the budget allocator?"**
- **Route Handler:** `server/index.js`, lines 304-322
- **Business Logic:** `server/services/ai.js`, lines 162-201

---

## 🎨 Frontend Architecture

The frontend follows a **page-based component architecture**:

```
client/src/
├── App.jsx              → Main app + React Router
├── main.jsx             → React entry point
├── index.css            → Global styles + design system
└── pages/               → Feature pages (like controllers)
    ├── VendorSearch.jsx
    ├── ContractAnalyzer.jsx
    ├── ScheduleBuilder.jsx
    ├── ThemeCreator.jsx
    └── BudgetPlanner.jsx
```

Each page component:
- Manages its own state
- Makes API calls to backend
- Handles user interactions
- Renders UI

---

## 🚀 Summary

### **Your Architecture:**
```
Routes + Controllers → Combined in index.js
Business Logic       → Separated in services/
Data Access          → Abstracted in db.js
```

### **Traditional MVC:**
```
Routes       → Separate files
Controllers  → Separate files
Models       → Separate files
Views        → Frontend (React)
```

### **Your Pattern is:**
✅ **Valid** - Common in Express.js projects  
✅ **Clean** - Services are well-separated  
✅ **Scalable** - Easy to refactor if needed  
✅ **Maintainable** - Clear separation of concerns  

---

## 📝 Quick Reference

| What You're Looking For | Where It Is |
|-------------------------|-------------|
| **All Routes** | `server/index.js` (lines 36-322) |
| **Controller Logic** | `server/index.js` (inline with routes) |
| **AI Operations** | `server/services/ai.js` |
| **Vector Search** | `server/services/rag.js` |
| **Database Setup** | `server/db.js` |
| **Frontend Pages** | `client/src/pages/` |
| **API Calls** | Inside each page component |

---

**Your code is well-organized for a project of this size!** 🎉

The service-oriented approach keeps business logic clean and reusable, while the combined routes/controllers pattern keeps the codebase simple and easy to navigate.
