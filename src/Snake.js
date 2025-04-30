import React, { Component } from 'react';
import Square from './Square';

export default class Snake extends Component {
    render() {
        var blockSize = this.props.blockSize;
        var squares = this.props.parts.map(function(part, i) {
            return <Square key={i} class="snake-part" x={part.x} y={part.y} blockSize={blockSize} />;
        });
        return (
            <div>
                {squares}
            </div>
        );
    }
}