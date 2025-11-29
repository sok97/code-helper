const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const API_URL = 'http://localhost:3000/api/generate';

console.log('--- Code Helper Interactive Generator ---');
console.log('Backend must be running on port 3000');
console.log('Type "exit" to quit');
console.log('-----------------------------------------');

function askPrompt() {
    rl.question('\nWhat code do you want to generate? ', async (prompt) => {
        if (prompt.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        if (!prompt.trim()) {
            askPrompt();
            return;
        }

        try {
            console.log('\nGenerating code...');
            const startTime = Date.now();

            const response = await axios.post(API_URL, {
                prompt: prompt,
                language: 'javascript' // Defaulting to JS for this CLI
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log(`\n--- Generated Code (${duration}s) ---`);
            console.log(response.data.code);
            console.log('-----------------------------------');

        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.error('\nError: Could not connect to backend. Is it running on port 3000?');
            } else {
                console.error('\nError:', error.response?.data?.error || error.message);
            }
        }

        askPrompt();
    });
}

askPrompt();
