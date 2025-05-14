import React, { useState, useEffect } from 'react';
import './SubmitPage.css';
import axios from 'axios';

function SubmitPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [facts, setFacts] = useState([]);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    const fetchFacts = async () => {
        try {
            const res = await axios.get(`${API_URL}/facts`);
            const lines = res.data.trim().split('\n');
            const rows = lines.slice(1).map(line => {
                const [question, answer, location, category] = line.split(',');
                return { question, answer, location, category };
            });
            setFacts(rows);
        } catch (error) {
            console.error("Failed to load facts:", error);
        }
    };

    useEffect(() => {
        fetchFacts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim() || !answer.trim() || !location || !category) {
            alert("Please fill in all fields before submitting.");
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/submit`, {
                question,
                answer,
                location,
                category
            });

            alert("✅ Submitted!");
            setQuestion('');
            setAnswer('');
            setLocation('');
            setCategory('');
            fetchFacts(); // refresh list after submit
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert("⚠️ Your question is too similar to an existing one:\n" + error.response.data);
            } else {
                alert("❌ Failed to submit. Please try again.");
                console.error(error);
            }
        }
    };

    return (
        <div className="submit-page">
            <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>
                Share a Fun Fact About York Region
            </h1>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <label>Enter your question:</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />

                    <label>Enter the answer:</label>
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />

                    <label>Select the location (city or town):</label>
                    <select value={location} onChange={(e) => setLocation(e.target.value)}>
                        <option value="">{"<please select a location>"}</option>
                        <option value="Markham">Markham</option>
                        <option value="Vaughan">Vaughan</option>
                        <option value="Richmond Hill">Richmond Hill</option>
                        <option value="Aurora">Aurora</option>
                        <option value="Newmarket">Newmarket</option>
                        <option value="East Gwillimbury">East Gwillimbury</option>
                        <option value="Georgina">Georgina</option>
                        <option value="Whitchurch-Stouffville">Whitchurch-Stouffville</option>
                        <option value="King">King</option>
                    </select>

                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">{"<please select a category>"}</option>
                        <option value="Historic">Historic</option>
                        <option value="Physiographic">Physiographic</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Demographic">Demographic</option>
                        <option value="Economic">Economic</option>
                        <option value="Other">Other</option>
                    </select>

                    <button type="submit">Submit</button>
                </form>

                <img
                    src={process.env.PUBLIC_URL + '/yr.jpeg'}
                    alt="York Region Map"
                    className="form-image"
                />
            </div>

            <div className="example-section" style={{ marginTop: '40px', backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px' }}>
                <h3>📝 Example Fun Fact Submission</h3>
                <p><strong>Question:</strong> What is Ontario’s “vegetable patch”?</p>
                <p><strong>Answer:</strong> Holland Marsh.</p>
                <p><strong>Location:</strong> King</p>
                <p><strong>Category:</strong> Physiographic</p>
            </div>

            <div className="fact-list" style={{ marginTop: '40px' }}>
                <h3>📚 Submitted Facts</h3>
                {facts.length === 0 ? (
                    <p>No facts submitted yet.</p>
                ) : (
                    <ul>
                        {facts.map((fact, index) => (
                            <li key={index} style={{ marginBottom: '15px' }}>
                                <strong>Q:</strong> {fact.question} <br />
                                <strong>A:</strong> {fact.answer} <br />
                                <strong>Location:</strong> {fact.location} <br />
                                <strong>Category:</strong> {fact.category}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SubmitPage;

