import React, { Component } from 'react';
import Square from './Square';

export default class Apple extends Component {
    render() {
        return (
            <Square class="apple" x={this.props.x} y={this.props.y} blockSize={this.props.blockSize} />
        );
    }
}