import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log('Fetching models from:', url.replace(API_KEY, 'HIDDEN_KEY'));

fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log('Available models:');
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('No models found or error structure:', JSON.stringify(data, null, 2));
        }
    })
    .catch(err => console.error(err));
