import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmitPage from './SubmitPage';
import PlayPage from './PlayPage';
import Header from './Header';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/submit" element={<SubmitPage />} />
                <Route path="/play" element={<PlayPage />} />
                <Route path="*" element={<SubmitPage />} />
            </Routes>
        </Router>
    );
}

export default App;
