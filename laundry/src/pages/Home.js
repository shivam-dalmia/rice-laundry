import React, { useState } from 'react';
import './home.css';

export default function Home() {
    const [selectedCollege, setSelectedCollege] = useState('baker');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCollege) {
            window.location.href = `/${selectedCollege}`;
        }
    };

    const handleCollegeChange = (e) => {
        setSelectedCollege(e.target.value);
    };

    return (
        <div className="home-container">
            <div className="glass-card">
                <img className="home-logo" src="../../logo.jpg" alt="Rice Laundry Logo" />
                <h1 className="title-large">Rice Laundry</h1>
                <p className="subtitle">Check machine availability in real-time</p>

                <form onSubmit={handleSubmit} className="college-form">
                    <div className="select-wrapper">
                        <select
                            className="styled-select"
                            value={selectedCollege}
                            onChange={handleCollegeChange}
                        >
                            <option value="baker">Baker</option>
                            <option value="willrice">Will Rice</option>
                            <option value="hanszen">Hanszen</option>
                            <option value="wiess">Wiess</option>
                            <option value="jones">Jones</option>
                            <option value="brown">Brown</option>
                            <option value="lovett">Lovett</option>
                            <option value="sidrichardson">Sid Richardson</option>
                            <option value="martel">Martel</option>
                            <option value="mcmurtry">McMurtry</option>
                            <option value="duncan">Duncan</option>
                        </select>
                        <span className="select-arrow">▼</span>
                    </div>

                    <button className="start-button" type="submit">
                        Find Machines
                    </button>
                </form>
            </div>
        </div>
    );
}