import React from 'react';

export default function Square(props) {
    var squareStyle = {
        left: props.x * props.blockSize,
        top: props.y * props.blockSize,
        width: props.blockSize,
        height: props.blockSize
    };
    return (
        <div className={props.class} style={squareStyle}></div>
    );
}