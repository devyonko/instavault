'use client';

import React from 'react';

export default function PillNav() {
    return (
        <div className="pill-radio-container">
            <input defaultChecked name="plan" id="pill-1" type="radio" />
            <label htmlFor="pill-1">Home</label>

            <input name="plan" id="pill-2" type="radio" />
            <label htmlFor="pill-2">Search</label>

            <input name="plan" id="pill-3" type="radio" />
            <label htmlFor="pill-3">Gallery</label>

            <input name="plan" id="pill-4" type="radio" />
            <label htmlFor="pill-4">Saved</label>

            <input name="plan" id="pill-5" type="radio" />
            <label htmlFor="pill-5">Settings</label>

            <div className="pill-indicator"></div>
        </div>
    );
}
