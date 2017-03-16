//noinspection JSUnresolvedVariable
import React, {Component} from 'react';
//noinspection JSUnresolvedVariable
import Immutable from 'immutable';
//noinspection JSUnresolvedVariable
import logo from './logo.svg';
import './App.css';

const drawMessage = <span>Hold <code>ctrl</code> to draw blue. Hold <code>shift</code> to draw red. <code>Both</code> for purple.<br /><code>Alt</code> erases.</span>;

function OptionItem(props) {
    return <option className={props.value} id={props.value} value={props.value}/>;
}

class SnakeInstructions extends Component {
    shouldComponentUpdate(nextProps) {
        return this.props.text !== nextProps.text;
    }

    render() {
        return (
            <tr id="topRowID">
                <th id="topText" className={this.props.topTextClassName}
                                 colSpan={this.props.side * this.props.widthMulti}>
                    {this.props.text}
                </th>
            </tr>
        )
    }
}

class ColorChanger extends Component {
    shouldComponentUpdate(nextProps) {
        return this.props.value !== nextProps.value;
    }

    render() {
        //noinspection JSUnresolvedVariable
        const colors = this.props.colors;
        const listItems = colors.map((color) =>
            <OptionItem key={this.props.id + color}
                        value={color}/>
        );

        return (
            <select className={this.props.value} value={this.props.value}
                    onChange={this.props.onChange} id={this.props.id}>
                {listItems}
            </select>
        )
    }
}

class SnakeBody extends Component {
    shouldComponentUpdate(nextProps) {
        return this.props.colors !== nextProps.colors ||
            this.props.currentMessage !== nextProps.currentMessage;
    }

    render() {
        return (
            <tbody id="tableBody">
            <SnakeInstructions text={this.props.currentMessage}
                               side={this.props.side}
                               widthMulti={this.props.widthMulti}
                               topTextClassName={this.props.topTextClassName}/>
            {this.props.colors.map((row, i) => {
                row = row.map((color, j) => {
                    return <Cell processMouseMove={this.props.processMouseMove} key={"key" + i + "" + j} x={j} y={i}
                                 className={color}/>
                });
                return <tr key={"key" + i}>{row}</tr>
            })}
            </tbody>
        )
    }
}

class Cell extends Component {
    constructor(props) {
        super(props);
        this.processMouseMove = this.processMouseMove.bind(this);
    }

    processMouseMove(event) {
        this.props.processMouseMove(this.props.x, this.props.y, event);
    }

    shouldComponentUpdate(nextProps) {
        return this.props.className !== nextProps.className;
    }

    render() {
        return (
            <td onMouseMove={this.processMouseMove} className={this.props.className}/>
        )
    }
}

class SnakeGame extends Component {
    constructor(props) {
        super(props);
        const side = 30, widthMulti = 1.8;
        //I was really hoping using Immutable.withMutations would improve performance.
        //So far as I could tell, it didn't ¯\_(ツ)_/¯
        let colors = Immutable.List([]);
        for (let i = 0; i < side; i++) {
            let cells = Immutable.List([]);
            for (let j = 0; j < side * widthMulti; j++) {
                cells = cells.push("pixel white");
            }
            colors = colors.push(cells);
        }
        //This needs to be broken up into different values. Trying to update one part of snake
        //shouldn't update all of it.
        const snake = {
            direction: 3,
            active: false,
            x: 19,
            y: 19,
            exists: false,
            paused: false,
            body: [[19, 17], [19, 18], [19, 19]],
            food: []
        };
        //...I'm considering of using a loop to add a bunch of different, individual
        //color values. So we don't have to update an array every time.
        this.state = {
            colors: colors,
            snake: snake,
            fillValue: "white",
            headValue: "red",
            bodyValue: "purple",
            foodValue: "green",
            currentMessage: drawMessage,
            side: side,
            widthMulti: widthMulti,
            canDraw: true,
            hasTurned: false,
            highScore: 0,
            score: 0,
            infinitySnake: false,
            topTextClassName: "key white"
        };
        this.colorFill = this.colorFill.bind(this);
        this.getSnakeText = this.getSnakeText.bind(this);
        this.moveFood = this.moveFood.bind(this);
        this.findPointMatch = this.findPointMatch.bind(this);
        this.youLost = this.youLost.bind(this);
        this.makeFood = this.makeFood.bind(this);
        this.foodOnSnake = this.foodOnSnake.bind(this);
        this.moveLeft = this.moveLeft.bind(this);
        this.moveRight = this.moveRight.bind(this);
        this.moveDown = this.moveDown.bind(this);
        this.moveUp = this.moveUp.bind(this);
        this.canTurn = this.canTurn.bind(this);
        this.resetSnake = this.resetSnake.bind(this);
        this.snakeIt = this.snakeIt.bind(this);
        this.playSnake = this.playSnake.bind(this);
        this.headColorChange = this.headColorChange.bind(this);
        this.foodColorChange = this.foodColorChange.bind(this);
        this.bodyColorChange = this.bodyColorChange.bind(this);
        this.stopSnake = this.stopSnake.bind(this);
        this.checkCookie = this.checkCookie.bind(this);
        this.snakeMode = this.snakeMode.bind(this);
        this.controlSnake = this.controlSnake.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.processMouseMove = this.processMouseMove.bind(this);
    }

    render() {
        return (
            <div tabIndex="0" className="App" onKeyDown={this.controlSnake}>
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>Welcome to Snake-React</h2>
                </div>
                <br />
                <div id="drawSnake" className='centered'>
                    <table id="canvas" className="canvas">
                        <SnakeBody currentMessage={this.state.currentMessage}
                                   colors={this.state.colors}
                                   processMouseMove={this.processMouseMove}
                                   side={this.state.side}
                                   widthMulti={this.state.widthMulti}
                                   topTextClassName={this.state.topTextClassName}/>
                    </table>
                    <br />
                    <ControlRow
                        playSnake={this.playSnake}
                        stopSnake={this.stopSnake}
                        snakeMode={this.snakeMode}
                        colorFill={this.colorFill}
                        headColorChange={this.headColorChange}
                        bodyColorChange={this.bodyColorChange}
                        foodColorChange={this.foodColorChange}
                        fillValue={this.state.fillValue}
                        headValue={this.state.headValue}
                        bodyValue={this.state.bodyValue}
                        foodValue={this.state.foodValue}/>
                </div>
            </div>
        )
    }

    /**
     * This method went through way too many iterations too fast.
     * Right now I think it just makes sure to erase food when the div leaves it
     * behind (and then the div replaces it with a div pixel).
     */
    moveFood() {
        const snake = this.state.snake;
        let foodBodyIndex;
        for (let l = 0; l < snake.food.length; l++) {
            foodBodyIndex = this.findPointMatch(snake.food[l], snake.body);

            if (foodBodyIndex === -1) { //if Food is off div, forget it
                snake.food.splice(l, 1); //Removes one item from food array??
                this.moveFood();
                break;
            }
        }
        this.setState({
            snake: snake
        });
    }

    /**
     * Returns the index of any value in the pairList which matches pair.
     * @param pair
     * @param pairList
     * @returns {number}
     */
    findPointMatch(pair, pairList) {
        //pair is [0, 0] 1x2 array
        //pairList is [[0, 0], [0, 0]] an array of many pairs
        for (let i = 0; i < pairList.length; i++) {
            if (pair[0] === pairList[i][0] &&
                pair[1] === pairList[i][1]) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Modify the message at the top and flash it red.
     * If they get 10 or higher on Infinity snake, I express my amazement =p
     */
    youLost(why) {
        const snake = this.state.snake;
        const score = this.state.score;
        let highScore = this.state.highScore;
        let currentMessage = this.state.currentMessage;
        let hasTurned = false;
        snake.active = false;
        this.setState({
            topTextClassName: "key red"
        });
        if (this.state.infinitySnake) {
            if (score > highScore) {
                this.setCookie("infinitySnakeScore", score, 36500);
                highScore = score;
            }
            currentMessage = <span>{why + "\nScore: " + score + ". Infinity Score: " + highScore}</span>;
        } else {
            if (score > highScore) {
                this.setCookie("highScore", score, 36500);

                highScore = score;
            }
            currentMessage = <span>{why + "\nScore: " + score + ". High Score: " + highScore}</span>;
        }

        if (this.state.infinitySnake && score >= 10) {
            window.alert("You scored 10 or higher. I'm impressed.\n-Mitch");
        }
        this.setState({
            snake: snake,
            currentMessage: currentMessage,
            hasTurned: hasTurned,
            highScore: highScore
        });
    }

//These cookie functions are from w3schools
    getCookie(c_name) {
        let c_value = document.cookie;
        let c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start === -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start === -1) {
            c_value = null;
        }
        else {
            c_start = c_value.indexOf("=", c_start) + 1;
            let c_end = c_value.indexOf(";", c_start);
            if (c_end === -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start, c_end));
        }
        return c_value;
    }

    setCookie(c_name, value, exDays) {
        const exDate = new Date();
        exDate.setDate(exDate.getDate() + exDays);
        const c_value = escape(value) + ((exDays === null) ? "" : ";expires=" + exDate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    //Realized that I don't want to re-edit this everywhere.
    getSnakeText() {
        return <span> {"Arrow keys to move, space to pause, esc to stop.\nScore: " + this.state.score + ". " +
        (this.state.infinitySnake ? "Infinity Score: " : "High Score: ") + this.state.highScore}</span>;
    }

    //mm I need the food to not appear in the same position as the snake.
    //I can either random regen until I get a valid spot (which could take forever
    //if unlucky)
    //Or I can push it until it's valid. Pushing seems better practice.
    //I'm not pushing though, as it hasn't been an issue.
    makeFood() {
        let foodY, foodX;
        do {
            foodY = Math.floor(Math.random() * this.state.side);
            foodX = Math.floor(Math.random() * (this.state.side * this.state.widthMulti));
        } while (this.foodOnSnake());
        this.setState({
            foodY: foodY,
            foodX: foodX
        });
    }

    foodOnSnake() {
        const snakeBody = this.state.snake.body;
        for (let i = 0; i < snakeBody.length; i++) {
            if (this.state.foodY === snakeBody[i][0] &&
                this.state.foodX === snakeBody[i][1]) {
                return true;
            }
        }
        return false;
    }

    moveLeft() {
        const snake = this.state.snake;
        if (snake.direction !== 3
            && this.canTurn(9)) {
            snake.direction = 9;
        }
        this.setState({
            snake: snake,
            hasTurned: true
        });
    }

    moveRight() {
        const snake = this.state.snake;
        if (snake.direction !== 9
            && this.canTurn(3)) {
            snake.direction = 3;
        }
        this.setState({
            snake: snake,
            hasTurned: true
        });
    }

    moveDown() {
        const snake = this.state.snake;
        if (snake.direction !== 12
            && this.canTurn(6)) {
            snake.direction = 6;
        }
        this.setState({
            snake: snake,
            hasTurned: true
        });
    }

    moveUp() {
        const snake = this.state.snake;
        if (snake.direction !== 6
            && this.canTurn(12)) {
            snake.direction = 12;
        }
        this.setState({
            snake: snake,
            hasTurned: true
        });
    }

//Just to get this out of the if statement
    canTurn(num) {
        const length = this.state.snake.body.length;
        const body = this.state.snake.body;
        if (this.state.snake.active) {
            switch (num) {
                case 9:
                    if (body[length - 1][1] -
                        body[length - 2][1] !== 1 &&
                        body[length - 1][0] !==
                        body[length - 2][0]) {
                        return true;
                    }
                    break;
                case 12:
                    if (body[length - 1][1] !==
                        body[length - 2][1] &&
                        body[length - 2][0] -
                        body[length - 1][0] !== 1) {
                        return true;
                    }
                    break;
                case 3:
                    if (body[length - 2][1] -
                        body[length - 1][1] !== 1 &&
                        body[length - 1][0] !==
                        body[length - 2][0]) {
                        return true;
                    }
                    break;
                case 6:
                    if (body[length - 1][1] !==
                        body[length - 2][1] &&
                        body[length - 1][0] -
                        body[length - 2][0] !== 1) {
                        return true;
                    }
                    break;
                default:
                    return false;
            }
        } else {
            return false;
        }
    }

    resetSnake() {
        const snake = this.state.snake;
        snake.x = 19;
        snake.y = 19;
        snake.direction = 3;
        snake.exists = false;
        snake.active = false;
        snake.paused = false;
        snake.body = [[19, 17], [19, 18], [19, 19]];
        snake.food = [];
        this.setState({
            snake: snake,
            score: 0
        });
    }

    snakeIt() {
        const snake = this.state.snake;
        if (snake.active && !snake.paused) {

            //move the snake
            if (snake.direction === 3
                && snake.x < (this.state.side * this.state.widthMulti) - 1) {
                snake.x++;
            } else if (snake.direction === 6
                && snake.y < this.state.side - 1) {
                snake.y++;
            } else if (snake.direction === 9
                && snake.x > 0) {
                snake.x--;
            } else if (snake.direction === 12
                && snake.y > 0) {
                snake.y--;
            } else {
                this.youLost("You crashed into a wall!");
            }

            //check for self-collision
            let didLose = false;
            if (snake.exists && snake.active) {
                for (let i = 0; i < snake.body.length; i++) {
                    if (snake.y === snake.body[i][0] &&
                        snake.x === snake.body[i][1]) {
                        let shouldLose = true;
                        if (this.state.infinitySnake) {
                            const food = snake.food;
                            for (let j = 0; j < food.length; j++) {
                                if (food[j][0] === snake.y && food[j][1] === snake.x) {
                                    shouldLose = false;
                                    break;
                                }
                            }
                        }
                        if (shouldLose) {
                            this.youLost("You crashed into yourself!");
                            didLose = true;
                        }
                    }
                }
            }

            if (!didLose && snake.exists && snake.active) {
                if (snake.y === this.state.foodY && snake.x === this.state.foodX) {
                    this.setState(prevState => {
                        return {
                            score: prevState.score + 1,
                            currentMessage: this.getSnakeText()
                        }
                    });
                    snake.food.push([snake.y, snake.x]); //add to list of food
                    this.makeFood(); //make more food
                }

                snake.body.push([snake.y, snake.x]); //add to the head

                this.colorFill(""); //TODO: STOP DOING THIS. Should only update component as we need to

                this.moveFood(); //food "moving" through snake body animation

                let isFood;
                let colors = this.state.colors;

                //Draw the snake
                for (let j = 0; j < snake.body.length; j++) {
                    //snake.body[j] = a cell of the snake body
                    isFood = this.findPointMatch(snake.body[j], snake.food) !== -1;

                    let newColor;
                    if (isFood) {
                        newColor = "food pixel " + this.state.foodValue;
                    } else if (j === snake.body.length - 1) {
                        newColor = "head pixel " + this.state.headValue;
                    } else {
                        newColor = "div pixel " + this.state.bodyValue;
                    }
                    colors = colors.withMutations(colors => {
                        let colorRow = colors.get(snake.body[j][0]);
                        colorRow = colorRow.withMutations(colorRow => {
                            //noinspection JSUnresolvedFunction
                            colorRow.set(snake.body[j][1], newColor);
                        });
                        //noinspection JSUnresolvedFunction
                        colors.set(snake.body[j][0], colorRow);
                    });
                }

                //Infinity snake is supposed to allow moving through foodPoints in the div.
                //Bugged. Haven't tried to fix yet.
                if (colors.get(snake.body[0][0]).get(snake.body[0][1]) !== "food pixel " + this.state.foodValue && !(this.state.infinitySnake && this.state.score > 1)) {
                    snake.body = snake.body.slice(1); //I think this cuts off the back of the body while the snake moves?
                } else if (!this.state.infinitySnake) {
                    //This also seems to do something about cutting something off of the body.
                    const foodIndex = this.findPointMatch([snake.body[0][0], snake.body[0][1]], snake.food);
                    snake.food.splice(foodIndex, 1);
                }

                //Draw food
                colors = colors.withMutations(colors => {
                    let colorRow = colors.get(this.state.foodY);
                    colorRow = colorRow.withMutations(colorRow => {
                        //noinspection JSUnresolvedFunction
                        colorRow.set(this.state.foodX, "food pixel " + this.state.foodValue);
                    });
                    //noinspection JSUnresolvedFunction
                    colors.set(this.state.foodY, colorRow);
                });
                this.setState({
                    colors: colors,
                    hasTurned: false
                });
            }
            this.setState({
                snake: snake
            });
        }
    }

    playSnake() {
        const snake = this.state.snake;
        let currentMessage = this.state.currentMessage;
        if (!snake.active) { //If not already playing
            this.colorFill("white");
            this.resetSnake();
            snake.exists = true;
            snake.active = true;

            //generate first food
            this.makeFood();

            currentMessage = this.getSnakeText();

            this.state.snakeInterval && clearInterval(this.state.snakeInterval);
            this.setState({
                snake: snake,
                currentMessage: currentMessage,
                canDraw: false,
                snakeInterval: setInterval(this.snakeIt, 55),
                topTextClassName: "key white"
            });
        }
    }

    //No matter what I do, I cannot seem to get this to be as fast as plain javascript.
    //DRIVES ME CRAZY.
    //REACT SPEED, YES? JAVASCRIPT SLOW, YES? HOW DID ME USE REACT SO WRONG
    processMouseMove(x, y, ev) {
        if (this.state.canDraw) {
            let newColor;
            if (ev.altKey) {
                newColor = "pixel white";
            } else if (ev.ctrlKey) {
                if (!ev.shiftKey) {
                    newColor = "pixel blue";
                } else {
                    newColor = "pixel purple";
                }
            } else if (ev.shiftKey) {
                newColor = "pixel red";
            }

            if (newColor) {
                const colors = this.state.colors.withMutations(colors => {
                    let colorRow = colors.get(y);
                    colorRow = colorRow.withMutations(colorRow => {
                        //noinspection JSUnresolvedFunction
                        colorRow.set(x, newColor);
                    });
                    //noinspection JSUnresolvedFunction
                    colors.set(y, colorRow);
                });
                this.setState({
                    colors: colors
                });
            }
        }
    }

    colorFill(eventOrColor) {
        //oops. I have two types of variables coming into this :| I miss type safety.
        let color;
        if (eventOrColor.target) {
            color = eventOrColor.target.value;
        } else {
            color = eventOrColor;
        }
        let colors = this.state.colors;

        for (let i = 0; i < colors.size; i++) {
            let cells = colors.get(i);
            for (let j = 0; j < cells.size; j++) {
                cells = cells.withMutations(cells => {
                    //noinspection JSUnresolvedFunction
                    cells.set(j, "pixel " + color);
                });
            }
            colors = colors.withMutations(colors => {
                //noinspection JSUnresolvedFunction
                colors.set(i, cells);
            });
        }

        this.setState({
            fillValue: color,
            colors: colors
        });
    }

    headColorChange(event) {
        this.setState({
            headValue: event.target.value
        });
    }

    foodColorChange(event) {
        this.setState({
            foodValue: event.target.value
        });
    }

    bodyColorChange(event) {
        this.setState({
            bodyValue: event.target.value
        });
    }

    stopSnake() {
        if (this.state.snake.exists) {
            this.resetSnake();
            this.colorFill("white");
            clearInterval(this.state.snakeInterval);
            this.setState({
                currentMessage: drawMessage,
                canDraw: true,
                score: 0,
                topTextClassName: "key white"
            });
        }
    }

    checkCookie() {
        let tempHighScore;
        if (this.state.infinitySnake) {
            tempHighScore = this.getCookie("infinitySnakeScore");
        } else {
            tempHighScore = this.getCookie("highScore");
        }
        if (tempHighScore !== null && tempHighScore !== "") {
            this.setState({
                highScore: tempHighScore
            });
        }
    }

    snakeMode(event) {
        this.setState({
            infinitySnake: event.target.value === "infinitySnake"
        });
        this.checkCookie();
    }

    controlSnake(evt) {
        if (!evt) {
            return;
        }
        const snake = this.state.snake;
        const thisKey = (evt.which) ? evt.which : evt.keyCode;
        if (snake.exists && !this.state.hasTurned) {
            switch (thisKey) {
                case 13: //start [again?] with enter
                    if (snake.exists) this.playSnake();
                    break;
                case 27: //quit with esc
                    this.stopSnake();
                    break;
                case 32: //pause with space
                    snake.paused = !snake.paused;
                    break;
                case 37: //left
                    this.moveLeft();
                    break;
                case 38: //up
                    this.moveUp();
                    break;
                case 39: //right
                    this.moveRight();
                    break;
                case 40: //down
                    this.moveDown();
                    break;
                default:
                    break;
            }
            this.setState({
                snake: snake
            });
        }
    }

    componentDidMount() {
        this.checkCookie();
    }
}

class ControlRow extends Component {
    shouldComponentUpdate(nextProps) {
        return this.props.fillValue !== nextProps.fillValue ||
            this.props.headValue !== nextProps.headValue ||
            this.props.foodValue !== nextProps.foodValue ||
            this.props.bodyValue !== nextProps.bodyValue;
    }

    render() {
        const fillColors = ["white", "purple", "blue", "red"];
        const allColors = ["red", "blue", "purple", "green", "yellow", "black", "pink"];

        return (
            <div id="controlRow">
                <span id="drawColors">
                    {"Fill with: "}
                    <ColorChanger
                        onChange={this.props.colorFill}
                        id="fillColors"
                        colors={fillColors}
                        value={this.props.fillValue}/>
                </span>
                <span id="snakeColors">
                    {" Snake Head: "}
                    <ColorChanger
                        onChange={this.props.headColorChange}
                        id="headColors"
                        colors={allColors}
                        value={this.props.headValue}/>
                    {" Snake Body: "}
                    <ColorChanger
                        onChange={this.props.bodyColorChange}
                        id="bodyColors"
                        colors={allColors}
                        value={this.props.bodyValue}/>
                    {" Food Color: "}
                    <ColorChanger
                        onChange={this.props.foodColorChange}
                        id="foodColors"
                        colors={allColors}
                        value={this.props.foodValue}/>
                </span>
                <br /><br />
                <SnakeButtons
                    stopSnake={this.props.stopSnake}
                    playSnake={this.props.playSnake}/>
                <br />
                <br />
                <SnakeMode snakeMode={this.props.snakeMode}/>
            </div>
        )
    }
}

class SnakeButtons extends Component {
    render() {
        return (
            <span id="snakeButtons">
                <button id='snakeButton' onClick={this.props.playSnake}>Play Snake!</button>
                <button id='drawButton' onClick={this.props.stopSnake}>Draw stuff!</button>
            </span>
        )
    }
}

class SnakeMode extends Component {

    render() {
        return (
            <span id="snakeMode">
                Snake Mode: <select onChange={this.props.snakeMode} id="snakeModes">
                    <option id="regSnake" value="regSnake">Regular Snake</option>
                    <option id="infinitySnake" value="infinitySnake">Infinity Snake</option>
                </select>
            </span>
        )
    }
}

export default SnakeGame;
