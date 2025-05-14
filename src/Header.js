import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <h1>York Region Fun Facts</h1>
            <div className="nav-links">
                <Link to="/submit">Share Fun Facts</Link>
                <Link to="/play">Play Game</Link>
            </div>
        </header>
    );
}

export default Header;
