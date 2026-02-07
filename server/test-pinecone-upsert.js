import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('--- Pinecone Debug Script ---');
    console.log('Index:', process.env.PINECONE_INDEX_NAME);
    console.log('API Key length:', process.env.PINECONE_API_KEY?.length);

    try {
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY.trim(),
        });

        const index = pc.index(process.env.PINECONE_INDEX_NAME.trim());

        console.log('Fetching stats...');
        const stats = await index.describeIndexStats();
        console.log('Stats:', stats);

        console.log('Testing Upsert...');
        await index.upsert([{
            id: 'test-id-1',
            values: new Array(768).fill(0.1),
            metadata: { name: 'Test Vendor' }
        }]);
        console.log('✅ Upsert successful');

        const queryRes = await index.query({
            vector: new Array(768).fill(0.1),
            topK: 1,
            includeMetadata: true
        });
        console.log('Vector Details (Sample):', JSON.stringify(queryRes.matches[0], null, 2));

    } catch (e) {
        console.error('❌ Error:', e.message);
        if (e.response) {
            console.error('Response details:', await e.response.text());
        }
    }
}

test();
