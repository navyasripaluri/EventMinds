import { MongoClient } from 'mongodb';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

let mongoClient;
let db;
let pineconeClient;
let pineconeIndex;

export async function connectMongoDB() {
    try {
        mongoClient = new MongoClient(process.env.MONGODB_URI);
        await mongoClient.connect();
        db = mongoClient.db('eventminds');
        console.log(`✅ Connected to MongoDB: ${process.env.MONGODB_URI.substring(0, 20)}...`);
        console.log(`📂 Using Database: ${db.databaseName}`);
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

export async function connectPinecone() {
    try {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME);
        console.log('✅ Connected to Pinecone');
        return pineconeIndex;
    } catch (error) {
        console.error('❌ Pinecone connection error:', error);
        throw error;
    }
}

export function getDB() {
    if (!db) throw new Error('Database not initialized');
    return db;
}

export function getPineconeIndex() {
    if (!pineconeIndex) throw new Error('Pinecone not initialized');
    return pineconeIndex;
}

export async function closeConnections() {
    if (mongoClient) {
        await mongoClient.close();
        console.log('MongoDB connection closed');
    }
}
