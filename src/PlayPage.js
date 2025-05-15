import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function GamePage() {
    const [geoData, setGeoData] = useState(null);
    const [facts, setFacts] = useState([]);
    const [currentFact, setCurrentFact] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userGuess, setUserGuess] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // Load GeoJSON map
    useEffect(() => {
        fetch(process.env.PUBLIC_URL + '/Municipal_Boundary.geojson')
            .then((res) => res.json())
            .then((data) => {
                const yorkCities = [
                    "Markham",
                    "Vaughan",
                    "Richmond Hill",
                    "Aurora",
                    "Newmarket",
                    "East Gwillimbury",
                    "Georgina",
                    "Whitchurch-Stouffville",
                    "King"
                ];

                const filteredFeatures = data.features.filter(f => {
                    const name = f.properties?.name || f.properties?.NAME;
                    return yorkCities.includes(name);
                });

                setGeoData({
                    type: "FeatureCollection",
                    features: filteredFeatures
                });
            });
    }, []);

    // Load facts from backend
    useEffect(() => {
        fetch(`${API_URL}/facts`)
            .then((res) => res.text())
            .then((csv) => {
                const lines = csv.trim().split('\n');
                const headers = lines[0].split(',');

                const data = lines
                    .slice(1)
                    .map(line => line.split(','))
                    .filter(values => values[0]?.trim()) //
                    .map(values => Object.fromEntries(headers.map((h, i) => [h, values[i]])));

                setFacts(data);
                setCurrentFact(data[Math.floor(Math.random() * data.length)]);
            });
    }, []);

    // Handle map click
    const onEachMunicipality = (feature, layer) => {
        const name = feature.properties?.name || feature.properties?.NAME || 'Unknown';
        layer.on({
            click: () => {
                setUserGuess(name);
            }
        });
        layer.bindTooltip(name, { sticky: true });
    };

    // Move to next fact in sequence
    const handleNext = () => {
        setUserGuess(null);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % facts.length); // loop back to start
    };

    return (
        <div style={{ padding: '20px' }}>
            <style>
                {`.leaflet-interactive:focus { outline: none; }`}
            </style>

            <h2 style={{ textAlign: 'center' }}>🗺️ Guess the Municipality</h2>

            {/* Question + Feedback ABOVE the map */}
            {facts.length > 0 && (
                <div style={{ marginBottom: '20px', fontSize: '1.1em' }}>
                    <h3>❓ Question</h3>
                    <p>{facts[currentIndex].Question}</p>

                    {userGuess && (
                        <div>
                            <p>
                                You guessed: <strong>{userGuess}</strong><br />
                                {userGuess === facts[currentIndex].Location ? (
                                    <span style={{ color: 'green' }}>✅ Correct!</span>
                                ) : (
                                    <span style={{ color: 'red' }}>
                                        ❌ Incorrect. The correct answer is <strong>{facts[currentIndex].Location}</strong>
                                    </span>
                                )}
                            </p>
                            <p><strong>Explanation:</strong> {facts[currentIndex].Answer}</p>
                            <button onClick={handleNext} style={{ marginTop: '10px' }}>
                                Next Question
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Map below */}
            <MapContainer
                center={[44.0, -79.5]}
                zoom={9}
                style={{ height: '600px', width: '100%', backgroundColor: 'white' }}
                scrollWheelZoom={false}
            >
                {geoData && (
                    <GeoJSON
                        data={geoData}
                        onEachFeature={onEachMunicipality}
                        style={{
                            fillColor: '#3388ff',
                            weight: 2,
                            opacity: 1,
                            color: 'black',
                            dashArray: '3',
                            fillOpacity: 0.5
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}

export default GamePage;
