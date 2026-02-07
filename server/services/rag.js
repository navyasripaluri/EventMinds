import { getPineconeIndex } from '../db.js';
import { generateEmbedding, analyzeContract } from './ai.js';

/**
 * Store vendor embedding in Pinecone
 */
export async function storeVendorEmbedding(vendorId, vendorData) {
    try {
        const index = getPineconeIndex();

        // Create a safe, rich text representation for embedding (handle missing fields)
        const specialtiesText = Array.isArray(vendorData.specialties) ? vendorData.specialties.join(', ') : (vendorData.specialties ? String(vendorData.specialties) : '');
        const textForEmbedding = `${vendorData.name || ''}. ${vendorData.category || ''}. ${vendorData.description || ''}. Specialties: ${specialtiesText}. Style: ${vendorData.style || ''}. Price Range: ${vendorData.priceRange || ''}`;

        const embedding = await generateEmbedding(textForEmbedding);

        await index.upsert([{
            id: vendorId,
            values: embedding,
            metadata: {
                name: vendorData.name || '',
                category: vendorData.category || '',
                priceRange: vendorData.priceRange || '',
                rating: vendorData.rating || 0
            }
        }]);

        return true;
    } catch (error) {
        console.error('⚠️ Pinecone storage failed (skipping):', error.message);
        return false; // Don't throw, just allow the main process to continue
    }
}

/**
 * Semantic search for vendors based on vibe/description
 */
export async function searchVendorsByVibe(query, topK = 5) {
    try {
        const index = getPineconeIndex();

        // Generate embedding for the search query
        const queryEmbedding = await generateEmbedding(query);

        // Search Pinecone
        const results = await index.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true
        });

        return results.matches.map(match => ({
            id: match.id,
            score: match.score,
            ...match.metadata
        }));
    } catch (error) {
        console.error('Error searching vendors:', error);
        throw error;
    }
}

/**
 * Analyze contract using RAG approach
 */
export async function analyzeContractWithRAG(contractText) {
    // In a full RAG implementation, we would:
    // 1. Store standard contract clauses in Pinecone
    // 2. Query for similar clauses
    // 3. Use retrieved context to augment the analysis

    // For this implementation, we'll use the AI service directly
    // but the architecture supports RAG expansion

    return await analyzeContract(contractText);
}

/**
 * Get internal Pinecone stats and samples
 */
export async function getPineconeStats() {
    try {
        const index = getPineconeIndex();
        const stats = await index.describeIndexStats();

        // Try to fetch a few samples if namespaces/vectors exist
        let samples = [];
        if (stats.totalRecordCount > 0) {
            // We can't "list" all vectors easily without pagination or knowing IDs,
            // but we can query with a dummy vector to get the most "representative" ones
            const dummyVector = new Array(768).fill(0.1); // Assuming 768 dims (Gemini default)
            const queryResponse = await index.query({
                vector: dummyVector,
                topK: 10,
                includeMetadata: true,
                includeValues: false // Values are huge, let's keep it metadata for now
            });
            samples = queryResponse.matches;
        }

        return {
            stats,
            samples
        };
    } catch (error) {
        console.error('Error getting Pinecone stats:', error);
        throw error;
    }
}

export default {
    storeVendorEmbedding,
    searchVendorsByVibe,
    analyzeContractWithRAG,
    getPineconeStats
};
