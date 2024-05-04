import React, {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';
import {GUESS_URL, START_URL} from "./urls";

function App() {
    const [gameData, setGameData] = useState({
        quote: '',
        answered_quote: '',
        numerical_hints: [],
        author: '',
        category: ''
    });
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchGameData();
    }, []);

    const fetchGameData = async () => {
        try {
            const response = await axios.get(START_URL);
            setGameData({
                ...response.data,
                numerical_hints: response.data.numerical_hints
            });
        } catch (error) {
            console.error('Error fetching data: ', error);
            setMessage('Failed to load game data.');
        }
    };

    const handleCharacterSelect = (index) => {
        setSelectedIdx(index);
    };

    const handleLetterClick = async (letter) => {
        if (selectedIdx === null) {
            setMessage('Please select a position first.');
            return;
        }
        try {
            const response = await axios.post(GUESS_URL, {
                quote: gameData.quote,
                answered_quote: gameData.answered_quote,
                numerical_hints: gameData.numerical_hints,
                author: gameData.author,
                category: gameData.category,
                guess_index: selectedIdx,
                guess_letter: letter
            });
            setGameData({
                ...response.data,
                numerical_hints: gameData.numerical_hints // Maintain original numerical hints unchanged
            });
            setSelectedIdx(null);
            setMessage(response.data.correct ? 'Correct guess!' : 'Incorrect guess, try again!');
            if (!response.data.answered_quote.includes('_')) {
                setMessage('Congratulations, you have guessed the entire quote!');
            }
        } catch (error) {
            console.error('Error making a guess: ', error);
            setMessage('Error processing your guess.');
        }
    };

    const renderKeyboard = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        return (
            <div className="keyboard-container">
                {letters.map((letter, idx) => (
                    <button key={idx} className="keyboard-button" onClick={() => handleLetterClick(letter)}>
                        {letter}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="game-container">
            <h1>Quote Guessing Game</h1>
            {gameData.category && <h2>Category: {gameData.category}</h2>}
            {gameData.author && <h4>Author: {gameData.author}</h4>}
            <div className="quote-display">
                {gameData.answered_quote.split('').map((char, index) => (
                    <span key={index} className="character-box" onClick={() => handleCharacterSelect(index)}>
            <div className="quote-row">{char}</div>
            <div
                className="hint-row">{typeof gameData.numerical_hints[index] === 'number' ? gameData.numerical_hints[index] : ' '}</div>
          </span>
                ))}
            </div>
            {renderKeyboard()}
            <p className="message">{message}</p>
        </div>
    );
}

export default App;
