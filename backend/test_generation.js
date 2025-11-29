const axios = require('axios');

async function testGeneration() {
    try {
        console.log('Testing /api/generate with language: "chatagent"...');

        const response = await axios.post('http://localhost:3000/api/generate', {
            prompt: 'Write a hello world message',
            language: 'chatagent'
        });

        console.log('Success! The backend accepted "chatagent".');
        console.log('Generated Output:');
        console.log('----------------------------------------');
        console.log(response.data.code);
        console.log('----------------------------------------');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('Error: Connection refused. Backend server might not be running.');
        } else {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }
}

testGeneration();
