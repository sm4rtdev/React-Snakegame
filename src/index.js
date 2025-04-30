import React from 'react';
import ReactDOM from 'react-dom';
import Game from './Game';
import './index.css';

ReactDOM.render(
    (
        <div className="text-center">
            <h2>ReactSnake</h2>
            <Game />
        </div>
    ),
    document.getElementById('root')
);
