const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { createObjectCsvWriter } = require('csv-writer');
const stringSimilarity = require('string-similarity');

const app = express();
const PORT = process.env.PORT || 5000;

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

    // Check similarity
    const threshold = 0.65;
    const matchResult = stringSimilarity.findBestMatch(newFact.question, existingQuestions);

    if (matchResult.bestMatch.rating > threshold) {
        return res.status(409).send(`"${matchResult.bestMatch.target}" is too similar to your question.`);
    }

    // Append new fact
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

// ✅ New: DELETE endpoint to remove a fact by question
app.delete('/delete', (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).send('Missing question to delete.');
    }

    try {
        const fileData = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
        const headers = fileData[0];
        const filtered = fileData.filter((line, i) => {
            if (i === 0) return true; // keep header
            return !line.startsWith(question + ',');
        });

        if (filtered.length === fileData.length) {
            return res.status(404).send('Question not found.');
        }

        fs.writeFileSync(csvPath, filtered.join('\n') + '\n');
        res.send('Fact deleted.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete.');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
