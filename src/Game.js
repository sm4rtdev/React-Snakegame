import React, { Component } from 'react';
import Snake from './Snake';
import Apple from './Apple';
import { randomInt } from './helpers';

const KEY = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    SPACE: 32
};
const DIR = {
    UP:     {x: 0, y: -1},
    RIGHT:  {x: 1, y: 0},
    DOWN:   {x: 0, y: 1},
    LEFT:   {x: -1, y: 0}
};

export default class Game extends Component {
    constructor() {
        super();
        this.state = {
            inGame: false,
            paused: false,
            currentScore: 0,
            snake: [],
            snakeDir: DIR.RIGHT,
            snakeDirQueue: [],
            apple: { x: 0, y: 0 },
            score: 0,
            topScore: localStorage['topScore'] || 0,

            // game board size (in spaces, not in DOM)
            width: 20,
            height: 20,

            // scale
            blockSize: 0,
        };
    }

    // on mount / on unmount
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeys.bind(this));
        window.addEventListener('resize',  this.handleResize.bind(this));

        // init the board size
        this.handleResize();

        // start the timer
        this.setState({
            timer: setInterval(() => {
                this.update();
            }, 100)
        });
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeys);
        clearInterval(this.state.timer);
        this.setState({timer: false});
    }

    // handle resize
    handleResize(event) {
        // pause game (as needed)
        if(this.state.inGame && !this.state.paused) {
            this.setState({paused: true});
        }
        
        // resize
        this.setState({
            blockSize: Math.floor(Math.min(0.9 * window.innerWidth, 0.8 * window.innerHeight) / (this.state.width + 2))
        });
    }

    // handle keypresses
    handleKeys(event) {

        // direction update
        var newDir = false;
        if(event.keyCode === KEY.LEFT)  { newDir = DIR.LEFT; }
        if(event.keyCode === KEY.RIGHT) { newDir = DIR.RIGHT; }
        if(event.keyCode === KEY.UP)    { newDir = DIR.UP; }
        if(event.keyCode === KEY.DOWN)  { newDir = DIR.DOWN; }
        if(newDir) {
            const snakeDirQueue = this.state.snakeDirQueue.slice();
            snakeDirQueue.push(newDir);
            this.setState({snakeDirQueue: snakeDirQueue});
        }

        // pause / new game
        if(event.keyCode === KEY.SPACE) {
            if(this.state.inGame) {
                this.togglePauseGame();
            } else {
                this.newGame();
            }
        }
    }

    newGame() {
        const snake = [];
        const snakeDir = Object.assign({}, this.state.snakeDir);

        // reset snake parts and direction
        for(var i = 0; i < 5; i++) {
            snake.push({x: 0, y: 0});
        }
        snakeDir.x = DIR.RIGHT.x;
        snakeDir.y = DIR.RIGHT.y;

        // update game and snake state
        this.setState({
            inGame: true,
            paused: false,
            snake: snake,
            snakeDir: snakeDir,
            score: 0
        });

        // place the apple
        this.placeApple();
    }

    togglePauseGame() {
        if(this.state.inGame) {
            this.setState({ paused: !this.state.paused });
        }
    }

    placeApple() {
        const apple = Object.assign({}, this.state.apple);

        // get all eligible apple spaces
        // (i.e. on board, not inside snake already)
        var eligible = [], inSnake, test;
        var x, y, z;
        for(x = 0; x < this.state.width; x++) {
            for(y = 0; y < this.state.height; y++) {
                inSnake = false;
                test = {x: x, y: y};
                for(z = 0; z < this.state.snake.length; z++) {
                    if(this.state.snake[z].x === test.x && this.state.snake[z].y === test.y) {
                        inSnake = true;
                    }
                }
                if(!inSnake) {
                    eligible.push(test);
                }
            }
        }

        // if no room left for the apple, you won
        if(eligible.length === 0) {
            window.alert("You won!");
            window.location.href = "https://www.youtube.com/watch?v=ivxxip58VdU";
        } else {
            var sel = randomInt(0, eligible.length - 1);
            apple.x = eligible[sel].x;
            apple.y = eligible[sel].y;
    
            this.setState({
                apple: apple
            });
        }
    }

    changeDirection(newDir) {
        if(this.state.paused) {
            return;
        }

        // not allowed to turn directly around
        var nextHead = this.getNextHeadPosition(this.state.snake, newDir);
        var lastHead = this.state.snake[this.state.snake.length - 2];
        if(nextHead.x === lastHead.x && nextHead.y === lastHead.y) {
            return;
        }

        // update the direction
        const snakeDir = Object.assign({}, this.state.snakeDir);
        snakeDir.x = newDir.x;
        snakeDir.y = newDir.y;
        this.setState({snakeDir: snakeDir});
    }

    getNextHeadPosition(snake, dir) {
        return {x: snake[snake.length - 1].x + dir.x, y: snake[snake.length - 1].y + dir.y};
    }

    // update
    update() {
        if(!this.state.inGame || this.state.paused) {
            return;
        }

        // process any direction changes in queue
        if(this.state.snakeDirQueue.length) {
            const snakeDirQueue = this.state.snakeDirQueue.slice();
            this.changeDirection(snakeDirQueue.shift());
            this.setState({snakeDirQueue: snakeDirQueue});
        }

        // handle snake
        const snake = this.state.snake;
        
        // create a new head in the correct direction
        var newHeadPos = this.getNextHeadPosition(snake, this.state.snakeDir);
        
        // check for collisions...
        var collision = false;
        if(newHeadPos.x < 0 || newHeadPos.x >= this.state.width || newHeadPos.y < 0 || newHeadPos.y >= this.state.height) {
            collision = true;
        } else {
            for(var i in snake) {
                if(snake[i].x === newHeadPos.x && snake[i].y === newHeadPos.y) {
                    collision = true;
                }
            }
        }

        // if there was a collision, game over
        if(collision) {
            if(this.state.score > this.state.topScore) {
                this.setState({ topScore: this.state.score });
                localStorage['topScore'] = this.state.score;
            }
            this.setState({inGame: false}) ;

        // else, move that snake!
        } else {
            snake.push(newHeadPos);
        
            // check for apple... if ate it, move the apple and leave the tail so snake grows
            if(newHeadPos.x === this.state.apple.x && newHeadPos.y === this.state.apple.y) {
                this.setState({ score: this.state.score + 1 });
                this.placeApple();
    
            // else, remove the tail
            } else {
                snake.shift();
            }
    
            // update state
            this.setState({ snake: snake });
        }
    }

    // render
    render() {
        var gameStyle = {};
        if(this.state.blockSize > 0) {
            gameStyle.width = (this.state.width+2) * this.state.blockSize;
            gameStyle.height = (this.state.height+2) * this.state.blockSize;
            gameStyle.borderWidth = this.state.blockSize;
        };
        var gameContainerStyle = { width: gameStyle.width, margin: "0 auto" };
        return (
            <div className="game-board-container" style={gameContainerStyle}>
                <div className="dashboard">
                    <div className="float-right">Your Score: {this.state.score}</div>
                    <div className="text-left">Top Score {this.state.topScore}</div>
                </div>
                <div className="game-board" style={gameStyle}>
                {this.state.inGame ? (
                    <div>
                        <Snake parts={this.state.snake} blockSize={this.state.blockSize} />
                        <Apple x={this.state.apple.x} y={this.state.apple.y} blockSize={this.state.blockSize} />
                    </div>
                ) : (
                    <div style={{marginTop:'5em'}}>
                        <h4>Eat the apples to grow!</h4>
                        <div>Use arrow keys (&larr;&uarr;&darr;&rarr;) to change directions.</div>
                        <div>Use spacebar to pause or start a new game.</div>
                        <div style={{fontSize:'85%',marginTop:'3em'}}>An homage to Nokia.</div>
                    </div>
                )}
                </div>
            </div>
        );
    }
}