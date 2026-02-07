import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { connectMongoDB, connectPinecone, getDB } from './db.js';
import { generateSchedule, generateTheme, generateBudgetAllocation, generateVendorRecommendations } from './services/ai.js';
import { storeVendorEmbedding, searchVendorsByVibe, analyzeContractWithRAG, getPineconeStats } from './services/rag.js';

const app = express();
const PORT = 5002;

// Log API Key status
if (process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY.trim();
    const key = process.env.GEMINI_API_KEY;
    console.log(`📡 Gemini API Key found: ${key.substring(0, 6)}...${key.substring(key.length - 4)}`);
} else {
    console.warn('⚠️ Gemini API Key NOT found in .env');
}

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// Initialize databases
let dbInitialized = false;

async function initializeDatabases() {
    try {
        await connectMongoDB();
        await connectPinecone();
        dbInitialized = true;
    } catch (error) {
        console.error('Failed to initialize databases:', error);
    }
}

// DB Debug
app.get('/api/db-debug', async (req, res) => {
    try {
        const db = getDB();
        const collections = await db.listCollections().toArray();
        const counts = {};
        for (const col of collections) {
            counts[col.name] = await db.collection(col.name).countDocuments();
        }
        res.json({
            database: db.databaseName,
            collections: collections.map(c => c.name),
            counts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pinecone-debug', async (req, res) => {
    try {
        const stats = await getPineconeStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== VENDOR ROUTES ====================

// Get all vendors
app.get('/api/vendors', async (req, res) => {
    try {
        const db = getDB();
        const vendors = await db.collection('vendors').find({}).toArray();
        console.log(`🔍 Fetched ${vendors.length} vendors from DB`);
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create vendor
app.post('/api/vendors', async (req, res) => {
    try {
        const db = getDB();
        const vendor = req.body;
        const result = await db.collection('vendors').insertOne(vendor);
        const vendorId = result.insertedId.toString();
        await storeVendorEmbedding(vendorId, vendor);
        res.json({ id: vendorId, ...vendor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Semantic vendor search
app.post('/api/vendors/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        const db = getDB();
        let vendors = [];

        try {
            // Try semantic search first via Pinecone
            const matches = await searchVendorsByVibe(query);

            if (matches && matches.length > 0) {
                const vendorIds = matches.map(m => m.id);
                const scoreMap = {};
                matches.forEach(m => { scoreMap[m.id] = m.score; });

                const { ObjectId } = await import('mongodb');
                const mongoIds = vendorIds.map(id => {
                    try { return new ObjectId(id); } catch (e) { return null; }
                }).filter(id => id !== null);

                vendors = await db.collection('vendors')
                    .find({ _id: { $in: mongoIds } })
                    .toArray();

                vendors = vendors.map(v => ({
                    ...v,
                    similarityScore: scoreMap[v._id.toString()] || 0
                }));
            }
        } catch (pineconeError) {
            console.warn('⚠️ Semantic search failed, falling back to basic search:', pineconeError.message);
        }

        if (vendors.length === 0) {
            console.log('🔍 Keyword searching MongoDB...');
            const keywords = query.split(' ').filter(w => w.length >= 2); // Allow 'DJ', 'MC'

            const regexQuery = keywords.map(kw => ({
                $or: [
                    { name: { $regex: kw, $options: 'i' } },
                    { category: { $regex: kw, $options: 'i' } },
                    { description: { $regex: kw, $options: 'i' } },
                    { style: { $regex: kw, $options: 'i' } },
                    { specialties: { $in: [new RegExp(kw, 'i')] } }
                ]
            }));

            if (regexQuery.length > 0) {
                vendors = await db.collection('vendors').find({
                    $or: [
                        // Exact phrase matches
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        // Or match ANY of the keywords in ANY of the fields
                        ...keywords.map(kw => ({ name: { $regex: kw, $options: 'i' } })),
                        ...keywords.map(kw => ({ category: { $regex: kw, $options: 'i' } })),
                        ...keywords.map(kw => ({ description: { $regex: kw, $options: 'i' } })),
                        ...keywords.map(kw => ({ specialties: { $regex: kw, $options: 'i' } }))
                    ]
                }).limit(10).toArray();
            }

            vendors = vendors.map(v => ({ ...v, similarityScore: 0.5 }));
            console.log(`✅ Keyword search found ${vendors.length} matches`);
        }

        // Level 3: AI-Generated Suggestions (The "Magic" part)
        if (vendors.length === 0) {
            console.log('✨ Using AI to MAGICALLY generate suggestions...');
            vendors = await generateVendorRecommendations(query);
            vendors = vendors.map(v => ({ ...v, similarityScore: 0.99, isAIGenerated: true }));
        }

        res.json(vendors);
    } catch (error) {
        console.error('❌ Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Seed dummy vendors
app.post('/api/vendors/seed', async (req, res) => {
    try {
        const db = getDB();

        const dummyVendors = [
            {
                name: "DJ Snake Beats",
                category: "DJ/Music",
                description: "High-energy DJ specializing in EDM and Bollywood fusion. Perfect for college fests and youth events.",
                specialties: ["EDM", "Bollywood", "Remixes"],
                style: "Energetic, Modern, Party Vibe",
                priceRange: "$$$",
                rating: 4.8,
                contact: "djsnake@example.com"
            },
            {
                name: "Royal Catering Co.",
                category: "Catering",
                description: "Specializes in spicy street food with rustic stall setups. Authentic Indian flavors.",
                specialties: ["Street Food", "Indian Cuisine", "Spicy"],
                style: "Rustic, Authentic, Casual",
                priceRange: "$$",
                rating: 4.6,
                contact: "royal@example.com"
            },
            {
                name: "Candid Moments Photography",
                category: "Photography",
                description: "Captures candid, moody shots with artistic flair. Specializes in emotional storytelling.",
                specialties: ["Candid", "Moody", "Artistic"],
                style: "Dark, Emotional, Cinematic",
                priceRange: "$$$",
                rating: 4.9,
                phoneNumber: "+91 98234-56789",
                highlights: ["Award-winning wedding photographer", "Featured in Vogue India", "Expert in low-light conditions"],
                teamInfo: "Led by Rohan, a cinematic visionary with 12 years of experience in capturing raw emotions.",
                personalDetails: { yearsExp: 12, location: "Mumbai, Pan-India", teamSize: 5 }
            },
            {
                name: "Neon Dreams Decor",
                category: "Decoration",
                description: "Cyberpunk and futuristic themes with neon lights and LED installations.",
                specialties: ["Neon", "Cyberpunk", "LED"],
                style: "Futuristic, Bold, Vibrant",
                priceRange: "$$$$",
                rating: 4.7,
                phoneNumber: "+91 98765-43210",
                highlights: ["Pioneers of LED-driven decor", "Custom 3D-mapped stage designs", "Eco-friendly lighting solutions"],
                teamInfo: "A collective of light engineers and digital artists pushing the boundaries of event aesthetics.",
                personalDetails: { yearsExp: 8, location: "Bangalore, NCR", teamSize: 15 }
            },
            {
                name: "Classic Strings Orchestra",
                category: "Music",
                description: "Elegant classical music ensemble for weddings and formal events.",
                specialties: ["Classical", "Live Music", "Elegant"],
                style: "Sophisticated, Traditional, Elegant",
                priceRange: "$$$",
                rating: 4.8,
                phoneNumber: "+91 91234-56789",
                highlights: ["Graduates from Royal Academy of Music", "Performed for 500+ premium weddings", "Custom arrangements of modern pop hits"],
                teamInfo: "Directed by Sarah, a world-class violinist with a passion for acoustic excellence.",
                personalDetails: { yearsExp: 20, location: "Delhi, Rajasthan", teamSize: 12 }
            },
            {
                name: "Spice Route Catering",
                category: "Catering",
                description: "Pan-Asian fusion cuisine with modern presentation. Perfect for corporate events.",
                specialties: ["Asian Fusion", "Modern", "Corporate"],
                style: "Contemporary, Sophisticated, Clean",
                priceRange: "$$$",
                rating: 4.5,
                phoneNumber: "+91 93456-78901",
                highlights: ["Michelin-starred background chefs", "Organic, locally sourced ingredients", "Interactive live counters"],
                teamInfo: "Chef Vikram brings 15 years of culinary expertise from across South-East Asia.",
                personalDetails: { yearsExp: 15, location: "Pan-India", teamSize: 40 }
            },
            {
                name: "Vintage Vibes Decor",
                category: "Decoration",
                description: "Rustic vintage decorations with wooden elements and warm lighting.",
                specialties: ["Vintage", "Rustic", "Warm"],
                style: "Nostalgic, Cozy, Earthy",
                priceRange: "$$",
                rating: 4.6,
                phoneNumber: "+91 94567-89012",
                highlights: ["Antique prop sourcing", "Custom hand-crafted wooden furniture", "Sustainable decor practices"],
                teamInfo: "Anjali and her team are dedicated to bringing old-world charm to modern settings.",
                personalDetails: { yearsExp: 6, location: "Pune, Goa", teamSize: 10 }
            },
            {
                name: "TechSound Pro",
                category: "Sound & Lighting",
                description: "Professional sound systems and dynamic lighting for large-scale events.",
                specialties: ["Sound Systems", "Stage Lighting", "Technical"],
                style: "Professional, High-Tech, Reliable",
                priceRange: "$$$",
                rating: 4.9,
                phoneNumber: "+91 95678-90123",
                highlights: ["Dolby Atmos certified setups", "Tour-grade lighting equipment", "Zero-failure track record"],
                teamInfo: "Run by tech enthusiasts certified in architectural acoustics and stage engineering.",
                personalDetails: { yearsExp: 10, location: "NCR, Hyderabad", teamSize: 25 }
            },
            {
                name: "Bollywood Beats DJ",
                category: "DJ/Music",
                description: "Specializes in Bollywood hits and retro classics. Great for weddings.",
                specialties: ["Bollywood", "Retro", "Wedding"],
                style: "Traditional, Festive, Energetic",
                priceRange: "$$",
                rating: 4.4,
                phoneNumber: "+91 96789-01234",
                highlights: ["Resident DJ at top Mumbai clubs", "Interactive crowd-engagement style", "Extensive retro vinyl collection"],
                teamInfo: "DJ Amit has been the life of the party for over a decade in the Indian wedding circuit.",
                personalDetails: { yearsExp: 11, location: "Mumbai, Gujarat", teamSize: 3 }
            },
            {
                name: "Green Plate Catering",
                category: "Catering",
                description: "Organic, vegan, and health-conscious menu options with beautiful presentation.",
                specialties: ["Vegan", "Organic", "Healthy"],
                style: "Clean, Modern, Sustainable",
                priceRange: "$$$",
                rating: 4.7,
                contact: "greenplate@example.com"
            }
        ];

        // Clear existing vendors
        await db.collection('vendors').deleteMany({});

        // Insert vendors (validate and handle errors per-vendor)
        const results = [];
        for (const vendor of dummyVendors) {
            // Normalize and validate fields to prevent runtime errors
            try {
                if (!vendor.name || typeof vendor.name !== 'string') {
                    console.warn(`⚠️ Skipping vendor with invalid name: ${JSON.stringify(vendor)}`);
                    results.push({ name: vendor.name || '<missing name>', pinned: false, error: 'Invalid name' });
                    continue;
                }

                vendor.specialties = Array.isArray(vendor.specialties) ? vendor.specialties : (vendor.specialties ? [String(vendor.specialties)] : []);
                vendor.priceRange = vendor.priceRange || '';
                vendor.rating = typeof vendor.rating === 'number' ? vendor.rating : (vendor.rating ? Number(vendor.rating) : 0);

                const result = await db.collection('vendors').insertOne(vendor);
                const vendorId = result.insertedId.toString();
                console.log(`📡 Seeding embedding for: ${vendor.name}`);
                const pinned = await storeVendorEmbedding(vendorId, vendor);
                results.push({ name: vendor.name, pinned });
            } catch (innerErr) {
                console.error(`⚠️ Failed to insert/seed vendor ${vendor.name || '<unknown>'}:`, innerErr.message);
                results.push({ name: vendor.name || '<unknown>', pinned: false, error: innerErr.message });
                // continue with next vendor
            }
        }

        res.json({
            message: 'Seeded vendors and generated embeddings',
            count: dummyVendors.length,
            details: results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CONTRACT ROUTES ====================

app.post('/api/contracts/analyze', upload.single('contract'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        console.log(`📄 Analyzing contract: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

        let contractText = '';
        if (req.file.mimetype === 'application/pdf') {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                contractText = pdfData.text;
                console.log(`✅ PDF parsed successfully. Text length: ${contractText.length}`);
            } catch (pdfError) {
                console.error('❌ PDF parsing failed:', pdfError.message);
                return res.status(400).json({ error: 'Failed to parse PDF file. Please ensure it is a valid document.' });
            }
        } else if (req.file.mimetype === 'text/plain') {
            contractText = req.file.buffer.toString('utf-8');
            console.log(`✅ Text file read successfully. Text length: ${contractText.length}`);
        } else {
            console.warn(`⚠️ Unsupported file type: ${req.file.mimetype}`);
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' });
        }

        if (!contractText.trim()) {
            console.warn('⚠️ Extracted text is empty');
            return res.status(400).json({ error: 'The uploaded file appears to be empty or unreadable.' });
        }

        const analysis = await analyzeContractWithRAG(contractText);
        console.log('✨ Analysis complete');
        res.json(analysis);
    } catch (error) {
        console.error('❌ Contract analysis error:', error);
        // If Gemini rate limits us, return 429 with possible retry info so the frontend can show a helpful message
        if (error && (error.status === 429 || /quota|Please retry/i.test(error.message))) {
            const retryFromError = error.retryAfter || (error.message && (error.message.match(/retry in\s*([0-9.]+)s/i)?.[1]) ? Number(error.message.match(/retry in\s*([0-9.]+)s/i)[1]) : null);
            const body = { error: error.message };
            if (retryFromError) body.retryAfter = retryFromError;
            return res.status(429).json(body);
        }

        res.status(500).json({ error: error.message });
    }
});

// ==================== GENERATIVE ROUTES ====================

app.post('/api/schedule/generate', async (req, res) => {
    try {
        const { eventType, duration, activities } = req.body;
        res.json(await generateSchedule(eventType, duration, activities));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/theme/generate', async (req, res) => {
    try {
        const { description } = req.body;
        res.json(await generateTheme(description));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/budget/allocate', async (req, res) => {
    try {
        const { totalBudget, priorities, eventType, guestCount } = req.body;
        res.json(await generateBudgetAllocation(totalBudget, priorities, eventType, guestCount));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const server = app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔢 PID: ${process.pid}`);
    await initializeDatabases();
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please free the port or set a different PORT environment variable and restart the server.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});
