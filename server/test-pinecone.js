import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing Pinecone connection...');
    console.log('Index Name:', process.env.PINECONE_INDEX_NAME);
    try {
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const index = pc.index(process.env.PINECONE_INDEX_NAME);
        const stats = await index.describeIndexStats();
        console.log('Stats:', JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
