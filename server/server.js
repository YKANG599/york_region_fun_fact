const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { createObjectCsvWriter } = require('csv-writer');
const stringSimilarity = require('string-similarity');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const csvPath = path.join(__dirname, 'facts.csv');

// Initialize CSV writer
const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
        { id: 'question', title: 'Question' },
        { id: 'answer', title: 'Answer' },
        { id: 'location', title: 'Location' },
        { id: 'category', title: 'Category' }
    ],
    append: true
});

// Endpoint to add a new fact
app.post('/submit', async (req, res) => {
    const newFact = req.body;

    // Check for missing fields
    if (!newFact.question || !newFact.answer || !newFact.location || !newFact.category) {
        return res.status(400).send('Missing required fields');
    }

    // Read existing questions from CSV
    let existingQuestions = [];
    try {
        const fileData = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
        if (fileData.length > 1) {
            existingQuestions = fileData.slice(1).map(line => line.split(',')[0]); // get only questions
        }
    } catch (err) {
        // File might not exist yet; ignore
    }

    // Check similarity against existing questions
    const threshold = 0.50;
    const matchResult = stringSimilarity.findBestMatch(newFact.question, existingQuestions);
    console.log(`\nChecking similarity for: "${newFact.question}"`);
    console.log(`Best match: "${matchResult.bestMatch.target}"`);
    console.log(`Similarity score: ${matchResult.bestMatch.rating}`);


    if (matchResult.bestMatch.rating > threshold) {
        return res.status(409).send(`"${matchResult.bestMatch.target}" is too similar to your question.`);
    }

    // Append new fact to CSV
    try {
        await csvWriter.writeRecords([newFact]);
        res.send('Fact saved');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to save fact');
    }
});

// Endpoint to get all facts
app.get('/facts', (req, res) => {
    fs.readFile(csvPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Failed to read file');
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
