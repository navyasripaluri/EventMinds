import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

async function debugKey() {
    console.log('--- Debugging Pinecone Connection ---');
    const apiKey = process.env.PINECONE_API_KEY ? process.env.PINECONE_API_KEY.trim() : '';

    if (!apiKey) {
        console.error('❌ Error: PINECONE_API_KEY is missing in .env file');
        return;
    }

    console.log(`🔑 Using API Key (first 5 chars): ${apiKey.substring(0, 5)}...`);
    console.log(`LENGTH: ${apiKey.length}`);

    const pc = new Pinecone({ apiKey });

    try {
        console.log('📡 Attempting to list indexes...');
        const indexes = await pc.listIndexes();
        console.log('✅ Connection Sucessful! Found indexes:', indexes);

        const targetIndex = process.env.PINECONE_INDEX_NAME || 'eventminds-vendors';
        const exists = indexes.indexes?.find(i => i.name === targetIndex);

        if (exists) {
            console.log(`✅ Index '${targetIndex}' found in this project.`);
            console.log(`   Host: ${exists.host}`);
            console.log(`   Status: ${exists.status.state}`);
        } else {
            console.warn(`⚠️ Index '${targetIndex}' NOT found in this project.`);
            console.warn('   Available indexes:', indexes.indexes?.map(i => i.name).join(', '));
            console.warn('   Please check if you are in the correct Project in Pinecone Console.');
        }

    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        console.log('\nTroubleshooting Tips:');
        console.log('1. Check if the API Key matches the Project selected in Pinecone Console.');
        console.log('2. Ensure no extra spaces in .env (e.g. PINECONE_API_KEY= pcsk_... )');
        console.log('3. If you just created the key, wait 10-20 seconds.');
    }
}

debugKey();
