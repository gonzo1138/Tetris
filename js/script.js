window.onload = function(){
    var board = document.getElementById('board');   // canvas-element
    if (!board.getContext) window.alert("A browser supporting the canvas-element is needed for this game...");
    var ctx = board.getContext('2d');

    config = {
        mino:{
            lineColor: '#fff',
            minoBorder: 1,
            minoSizeH: 0,
            minoSizeW: 0
        },
        tetromino:{
            form: {       // forms: https://tetris.wiki/Tetromino
                'I': {
                    minoPositions: [[1, 1, 1, 1], [-1, -1, [0, 1, 2, 3], -1], [2, 2, 2, 2], [-1, [0, 1, 2, 3], -1, -1]], // [[Alignment0][Alignment1][Alignment2][Alignment3]]
                    color: '#03EFF1',
                    wallkickoffsetMax:2,
                    alignment: {
                        0: {
                            minos: {
                                0: 0,
                                1: 0,
                                2: 0,
                                3: 0
                            },
                            offsetX: 0,
                            offsetY: 1,
                            /*wallkick:{
                                0:{
                                    1:{
                                        left:1,
                                        right:-2,
                                        bottom:0
                                    },
                                    2:{
                                        left:,
                                        right:,
                                        bottom:
                                    }
                                },
                                1:{
                                    1:{
                                        left:,
                                        right:,
                                        bottom:
                                    },
                                    2:{
                                        left:,
                                        right:,
                                        bottom:
                                    }
                                },
                                2:{
                                    1:{
                                        left:,
                                        right:,
                                        bottom:
                                    },
                                    2:{
                                        left:,
                                        right:,
                                        bottom:
                                    }
                                },
                                3:{
                                    1:{
                                        left:,
                                        right:,
                                        bottom:
                                    },
                                    2:{
                                        left:,
                                        right:,
                                        bottom:
                                    }
                                }
                                */
                        },
                        1: {
                            minos: {
                                0: [0, 1, 2, 3]
                            },
                            offsetX: 2,
                            offsetY: 0
                        },
                        2: {
                            minos: {
                                0: 0,
                                1: 0,
                                2: 0,
                                3: 0
                            },
                            offsetX: 0,
                            offsetY: 2
                        },
                        3: {
                            minos: {
                                0: [0, 1, 2, 3]
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                    },
                },
                'O': {
                    minoPositions: [[-1, [0, 1], [0, 1]], [-1, [0, 1], [0, 1]], [-1, [0, 1], [0, 1]], [-1, [0, 1], [0, 1]]],
                    color: '#EFF200',
                    wallkickoffsetMax:0,
                    alignment: {
                        0: {
                            minos: {
                                0: [0, 1],
                                1: [0, 1],
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        1: {
                            minos: {
                                0: [0, 1],
                                1: [0, 1],
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        2: {
                            minos: {
                                0: [0, 1],
                                1: [0, 1],
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        3: {
                            minos: {
                                0: [0, 1],
                                1: [0, 1],
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                    }
                },
                'T': {
                    minoPositions: [[1, [0, 1], 1], [-1, [0, 1, 2], 1], [1, [1, 2], 1], [1, [0, 1, 2], -1]],
                    color: '#A000F5',
                    wallkickoffsetMax:1,
                    alignment: {
                        0: {
                            minos: {
                                0: 1,
                                1: [0, 1],
                                2: 1,
                            },
                            offsetX: 0,
                            offsetY: 0
                        },
                        1: {
                            minos: {
                                0: [0, 1, 2],
                                1: 1,
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        2: {
                            minos: {
                                0: 0,
                                1: [0, 1],
                                2: 0,
                            },
                            offsetX: 0,
                            offsetY: 1
                        },
                        3: {
                            minos: {
                                0: 1,
                                1: [0, 1, 2],
                            },
                            offsetX: 0,
                            offsetY: 0
                        }
                    }
                },
                'S': {
                    minoPositions: [[1, [0, 1], 0], [-1, [0, 1], [1, 2]], [2, [1, 2], 1], [[0, 1], [1, 2], -1]],
                    color: '#00F100',
                    wallkickoffsetMax:1,
                    alignment: {
                        0: {
                            minos: {
                                0: 1,
                                1: [0, 1],
                                2: 0,
                            },
                            offsetX: 0,
                            offsetY: 0
                        },
                        1: {
                            minos: {
                                0: [0, 1],
                                1: [1, 2],
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        2: {
                            minos: {
                                0: 1,
                                1: [0, 1],
                                2: 0,
                            },
                            offsetX: 0,
                            offsetY: 1
                        },
                        3: {
                            minos: {
                                0: [0, 1],
                                1: [1, 2],
                            },
                            offsetX: 0,
                            offsetY: 0
                        }
                    }
                },
                'Z': {
                    minoPositions: [[0, [0, 1], 1], [-1, [1, 2], [0, 1]], [1, [1, 2], 2], [[1, 2], 0, 1], -1],
                    color: '#F00100',
                    wallkickoffsetMax:1,
                    alignment: {
                        0: {
                            minos: {
                                0: 0,
                                1: [0, 1],
                                2: 1,
                            },
                            offsetX: 0,
                            offsetY: 0
                        },
                        1: {
                            minos: {
                                0: [1, 2],
                                1: [0, 1],
                            },
                            offsetX: 0,
                            offsetY: 1
                        },
                        2: {
                            minos: {
                                0: 0,
                                1: [0, 1],
                                2: 1,
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        3: {
                            minos: {
                                0: [1, 2],
                                1: [0, 1],
                            },
                            offsetX: 0,
                            offsetY: 0
                        }
                    }
                },
                'J': {
                    minoPositions: [[[0, 1], 1, 1], [-1, [0, 1, 2], 0], [1, 1, [1, 2]], [2, [0, 1, 2], -1]],
                    color: '#0101EE',
                    wallkickoffsetMax:1,
                    alignment: {
                        0: {
                            minos: {
                                0: [0, 1],
                                1: 1,
                                2: 1,
                            },
                            offsetX: 0,
                            offsetY: 0
                        },
                        1: {
                            minos: {
                                0: [0, 1, 2],
                                1: 0,
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        2: {
                            minos: {
                                0: 0,
                                1: 0,
                                2: [0, 1],
                            },
                            offsetX: 0,
                            offsetY: 1
                        },
                        3: {
                            minos: {
                                0: 2,
                                1: [0, 1, 2],
                            },
                            offsetX: 0,
                            offsetY: 0
                        }
                    }
                },
                'L': {
                    minoPositions: [[1, 1, [0, 1]], [-1, [0, 1, 2], 2], [[1, 2], 1, 1], [0, [0, 1, 2], -1]],
                    color: '#EFA000',
                    wallkickoffsetMax:1,
                    alignment: {
                        0: {
                            minos: {
                                0: 1,
                                1: 1,
                                2: [0, 1],
                            },
                            offsetX: 0,
                            offsetY: 0
                        },
                        1: {
                            minos: {
                                0: [0, 1, 2],
                                1: 2,
                            },
                            offsetX: 1,
                            offsetY: 0
                        },
                        2: {
                            minos: {
                                0: [0, 1],
                                1: 0,
                                2: 0,
                            },
                            offsetX: 0,
                            offsetY: 1
                        },
                        3: {
                            minos: {
                                0: 0,
                                1: [0, 1, 2],
                            },
                            offsetX: 0,
                            offsetY: 0
                        }
                    },
                },
                maxSize: 4,
            },
        },
        scoring:{                                           // score for 1,2,3 or 4 rows at once  https://tetris.wiki/Scoring
            rows:{
                1: 40,
                2: 100,
                3: 300,
                4: 400
            },
            skip: 10
        },
        minosH: 16,
        minosW: 10,
        boardH: 800,        // 800 bei 16 Reihen: 50px
        boardW: 500,        // 500 bei 10 Spalten: 50px
        startingcolumn: 0,   // gets calculated...
        speed: 600,         // ms to pass one row (smaller = faster) at level 0
        ui:{
            lineWidth: 5,
            lineColor: '#fff',
            font: '32px Calibri',
            fontColor: '#002ba2',
        }
    }

    class Game{
        level = 1;
        score = 0;
        skipRowCounter = 0;

        currentTetromino;
        nextTetromino;
        tetrominosWaiting = [];
        map;
        draw;
        input;

        loop;
        frameDuration;
        isFirstStepOfNewCycle = true;
        pause = false;


        constructor(){
            this.map = new Map();
            this.draw = new Draw();
            this.input = new Control();

            //this.currentTetromino = new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);   // gets created at drop()
            this.nextTetromino = this.getTetromino();   //new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);

            config.mino.minoSizeH = config.boardH / config.minosH;
            config.mino.minoSizeW = config.boardW / config.minosW;
            config.startingcolumn = Math.floor(config.minosW/2)-1;
            this.frameDuration = config.speed / config.minoSizeH;
            console.log(config.speed);
            if(config.startingcolumn < 3) window.alert("Check your board-size-settings...");
        }

        start(){
            // todo: reset everything to start a new game after another without reloading the page?  alternative: new Game-Object...
            this.drop();
        }

        drop(){
            // prepare new nextTetromino:
            this.currentTetromino = this.nextTetromino;
            this.nextTetromino = this.getTetromino();
            // redraw ui with new nextTetromino:
            this.draw.clearCanvas();
            this.draw.ui(this.score, this.level, this.nextTetromino);
            // place new currentTetromino:
            this.currentTetromino.rotation = 0;
            this.currentTetromino.posX = config.startingcolumn;
            this.currentTetromino.posY = 2//-2;
            this.transit();
        }

        transit(tetromino = this.currentTetromino){
            console.log('tetromino in transit from ' + (this.currentTetromino.posY-1) + ' to ' + this.currentTetromino.posY);
            tetromino.offsetY = -1 * (config.mino.minoSizeH - 1);
            this.loop = setInterval(function () {
                if(!game.pause) {
                    if(tetromino.offsetY < 0){
                        game.draw.clearBoard();//game.draw.clearTetromino();
                        game.draw.map();
                        tetromino.offsetY++;
                        game.draw.tetromino(tetromino);
                    } else {
                        game.step();
                    }
                }
            }, this.frameDuration);
        }

        step() {
            this.map.calculatePossiblePositions(this.currentTetromino);
            if(this.map.checkPossiblePosition(this.currentTetromino.posX, this.currentTetromino.alignment)){
                this.isFirstStepOfNewCycle = false;
                this.currentTetromino.moveDown();
                this.draw.clearBoard();
                this.draw.map();
                this.transit();
            } else {
                //if(this.isFirstStepOfNewCycle) this.gameOver();
                //else
                this.process();
            }
        }

        process(){
            this.map.mapTetromino();
            // update ui...
            if (this.skipRowCounter>0){
                this.updateScore(this.skipRowCounter * config.scoring.skip * this.level);
                this.skipRowCounter = 0;
            }
            this.isFirstStepOfNewCycle = true;
            this.map.scanForLines();
        }

        checkCollision(columnOffset=0, rowOffset=0, rotation=false){     // checks in map of precalculated possible positions, works only in current row!
            let xPosition = this.currentTetromino.posX + columnOffset;
            let testRotation = this.currentTetromino.getAlignment();
            if(rotation) testRotation = this.currentTetromino.getNextAlignment();
            console.log(this.map.possibleTetrominoPositions);
            return this.map.checkPossiblePosition(xPosition, testRotation);
        }

        testCollision(columnOffset=0, rowOffset=0, rotation=false){
            let xPosition = this.currentTetromino.posX + columnOffset;
            let yPosition = this.currentTetromino.posY + rowOffset;
            let testRotation = this.currentTetromino.getAlignment();
            if(rotation) testRotation = this.currentTetromino.getNextAlignment();

            // test 1: with new rotation and offsets - are there walls?
            if(this.map.wallCollisionTest(xPosition, testRotation)) {
                // if so, can a wallkick be performed? -> are *there* minos?      https://tetris.wiki/Wall_kick
                return !this.map.wallkickTest(this.currentTetromino, columnOffset);
            }

            // test 2: xOffset with new rotation and offsets - are there minos?
            if (this.map.minoCollisionTest(xPosition, yPosition, testRotation)) return true;

            // test 3: with new rotation - has the bottom been reached?
            if (this.map.bottomCollisionTest(yPosition, testRotation)) return true;

            return false;   // no collision for intended step/move detected
        }

        updateScore(score){
            this.score += score;
            if(this.score > this.level * 1000) this.levelUp();
        }

        levelUp(){
            this.level++;
            config.speed -= this.level * 20;
            this.frameDuration = config.speed / config.minoSizeH;
        }
        
        getTetromino(){
            // see https://tetris.wiki/Random_Generator
            if(this.tetrominosWaiting.length === 0){
                // create new set of all possible tetrominos:
                let forms = Object.keys(config.tetromino.form);
                forms.forEach(form => {
                    this.tetrominosWaiting.push(new Tetromino(form));
                });
                // shuffle that set:
                for(let i=0; i<this.tetrominosWaiting.length;i++){
                    let rnd = Math.floor(Math.random() * this.tetrominosWaiting.length);
                    let tmp = this.tetrominosWaiting[i];
                    this.tetrominosWaiting[i] = this.tetrominosWaiting[rnd];
                    this.tetrominosWaiting[rnd] = tmp;
                }
            }
            //console.log(this.tetrominosWaiting);
            return this.tetrominosWaiting.pop();
        }

        gameOver(){
            //window.alert('Game Over!')
            if(confirm('Start a new Game?')) location.reload();
            else game.draw.clearTetromino();
            //else window.location.href = "https://tetris.wiki/";
        }
    }

    class Tetromino{
        form;
        posX = 0;
        posY = 0;
        offsetY = 0;
        alignment = 0;   // alignments: https://tetris.wiki/Super_Rotation_System

        // deprecated:
        color;
        minos;

        constructor(form){
            this.form = form;
            
            // deprecated:
            this.color = config.tetromino.form[form].color;
            this.minos = config.tetromino.form[form].minoPositions;
        }

        moveRight(){
            // check collision here...
            this.posX++;
        }

        moveLeft(){
            // check collision here...
            this.posX--;
        }

        moveDown(){
            // check collision here...
            this.posY++;
        }

        getAlignment(){
            return this.alignment;
        }

        getNextAlignment(currentAlignment = this.alignment) {
            if (currentAlignment < 3) return currentAlignment+1;
            else return 0;
        }

        rotate() {
            // check collision here...
            if (this.alignment < 3) this.alignment++;
            else this.alignment = 0;
        }
    }

    class Map{
        board = [];
        possibleTetrominoPositions;         // array can only be run through by: for(col in/of posPos), because index starts at -2, not 0!

        constructor() {            // create empty map at the size of the board
            for (let i = 0; i < config.minosW; i++) {
                this.board[i] = [];
                for (let j = 0; j < config.minosH; j++) {
                    this.board[i].push(false);
                }
            }
        }

        removeRow(row){
            // todo: some fancy effect here...
            for (let i = row; i >= 0; i--) {                // start at intended row
                for (let j = 0; j < config.minosW; j++) {
                    this.board[j][i] = this.board[j][i-1];  // copy row from above
                    if(i===0) this.board[j][0] = false;     // fill fist row with nothingness again
                }
            }
        }

        scanForLines(){
            let lines = [];          // storage for row numbers that are lines
            for(let row = 0; row < config.minosH; row++){
                let counter = config.minosW;
                for(let column = 0; column < config.minosW; column++){
                    if (this.board[column][row]) counter--;
                }
                if(counter===0) lines.push(row);
            }
            if(lines.length > 0){
                for(let row of lines) this.removeRow(row);      // Remove those Rows!
                game.updateScore(config.scoring.rows[lines.length-1] * (game.level+1));   // update score
            }

        }

        mapTetromino(tetrominoToMap = game.currentTetromino){
            console.log('mapping this of color: ' + tetrominoToMap.color);
            for (let x in tetrominoToMap.minos[tetrominoToMap.rotation]) {
                let y = tetrominoToMap.minos[tetrominoToMap.rotation][x];
                if (Array.isArray(y)){
                    for (let i of y) {
                        this.board[tetrominoToMap.posX + parseInt(x)][tetrominoToMap.posY + i] = tetrominoToMap.color;
                    }
                } else {
                    if (y > -1){
                        this.board[tetrominoToMap.posX + parseInt(x)][tetrominoToMap.posY + y] = tetrominoToMap.color;
                    }
                }
            }
        }

        minoCollisionTest(xPos = game.currentTetromino.posX, yPos = game.currentTetromino.posY, rotation = game.currentTetromino.rotation, tetromino = game.currentTetromino){
            for (let x=0; x<tetromino.minos[rotation]; x++) {
                let y = tetromino.minos[rotation][x];
                if (Array.isArray(y)){
                    for (let i of y) {
                        if(this.map[xPos + x][yPos + y[i]]) return true;
                    }
                } else {
                    if (y > -1){
                        if(this.map[xPos + x][yPos + y]) return true;
                    }
                }
            }
            return false;
        }

        wallCollisionTest(xPos = game.currentTetromino.posX, rotation = game.currentTetromino.rotation, tetromino = game.currentTetromino){
            for (let x in tetromino.minos[rotation]){
                let y = tetromino.minos[rotation][x];
                if (Array.isArray(y) || y > -1){
                    return (xPos < 0 || xPos > config.minosW);
                }
            }
            return false;
        }

        bottomCollisionTest(yPos = game.currentTetromino.posY, rotation = game.currentTetromino.rotation){
            // determine bottom of Tetromino:
            let minoBottom = 0;
            for (let x in game.currentTetromino.minos[rotation]){
                let y = game.currentTetromino.minos[rotation][x];
                if (Array.isArray(y)) if (y[y.length-1] > minoBottom) minoBottom = y[y.length-1];
                else if (y > minoBottom) minoBottom = y;
            }
            // check if Tetromino has reached bottom of the board:
            return (yPos+minoBottom > this.board[0].length-1);
        }

        wallkickTest(tetromino = game.currentTetromino, columnOffset = 0){
            let testoffset;
            for(let i = 1; i <= 2; i++)
                if(columnOffset > 0) testoffset = i * -1;  // if intended movement of the tetromino is right, the testoffset has to be to the left (negative)
                else testoffset = i;
            if(!this.wallCollisionTest(tetromino.posX-testoffset, tetromino.alignment)) {
                if (!this.minoCollisionTest(tetromino.posX, tetromino.posY, tetromino.alignment)){

                    return false;
                }
            }
        }

        calculatePossiblePositionsInRow(form, row){
            for(let column = Math.round(config.tetromino.maxSize / 2) * -1; column < config.minosW+Math.round(config.tetromino.maxSize / 2); column++){
                this.possibleTetrominoPositions[column][row] = [];
                for(let alignment = 0; alignment < 4; alignment++){
                    //this.possibleTetrominoPositions[column][alignment] = true;
                    // are there minos?
                    this.possibleTetrominoPositions[column][alignment] = !this.minoCollisionTest(column, row, alignment);  // when collision is detected (true): position occupied => false
                    // are there walls?
                    if(this.possibleTetrominoPositions[column][alignment]) this.possibleTetrominoPositions[column][alignment] = !this.wallCollisionTest(column, alignment);
                    // has the bottom been reached? (just testing when in close distance to the bottom)
                    if(this.possibleTetrominoPositions[column][alignment] && row > config.minosW-config.tetromino.maxSize) this.possibleTetrominoPositions[column][alignment] = this.bottomCollisionTest(row, alignment);
                }
            }
            //console.log('possible positions for currentTetromino:');
            //console.log(this.possibleMinoPositions);
        }

        calculatePossiblePositions(tetromino = game.currentTetromino){
            this.possibleTetrominoPositions = [];
            for(let row in config.minosH){
                this.calculatePossiblePositionsInRow(tetromino.form, row);
            }

        }

        checkPossiblePosition(column, row, alignment){
            return this.possibleTetrominoPositions[column][row][alignment];
        }
    }

    class Draw{

        mino(x, y, color, offsetY=0){
            let startX = config.mino.minoSizeW * x;
            let startY = config.mino.minoSizeH * y;

            ctx.fillStyle = color;
            ctx.fillRect(startX, startY + offsetY, config.mino.minoSizeW, config.mino.minoSizeH);
            ctx.fillStyle = config.mino.lineColor;
            ctx.lineWidth = config.mino.minoBorder;
            ctx.strokeRect(startX, startY + offsetY, config.mino.minoSizeW, config.mino.minoSizeH);
        }

        tetromino_new(tetromino = game.currentTetromino){
            //console.log('drawing tetromino of color: ' + tetromino.color + '  at x: ' + tetromino.posX + '  and y: ' + tetromino.posY + '  with y-Offset: ' + tetromino.offsetY);
            for (let x in config.tetromino.form[tetromino.form].alignment[tetromino.alignment].minos.length) {
                let y = config.tetromino.form[tetromino.form].alignment[tetromino.alignment].minos[x];
                if (Array.isArray(y)){
                    // draw all minos of that column
                    for (let i of y) {
                        this.mino((tetromino.posX + parseInt(x)), tetromino.posY + i, config.tetromino.form[tetromino.form].alignment[tetromino.alignment].color, tetromino.offsetY);
                        //console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+i));
                    }
                } else {
                    // draw the mino in that column
                    if (y > -1){
                        this.mino(tetromino.posX + parseInt(x), tetromino.posY + y, config.tetromino.form[tetromino.form].alignment[tetromino.alignment].color, tetromino.offsetY);
                        //console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+y));
                    }
                }
            }
        }
        
        tetromino(tetromino = game.currentTetromino){
            //console.log('drawing tetromino of color: ' + tetromino.color + '  at x: ' + tetromino.posX + '  and y: ' + tetromino.posY + '  with y-Offset: ' + tetromino.offsetY);
            for (let x in tetromino.minos[tetromino.alignment]) {
                let y = tetromino.minos[tetromino.alignment][x];
                if (Array.isArray(y)){
                    for (let i of y) {
                        this.mino((tetromino.posX + parseInt(x)), tetromino.posY + i, tetromino.color, tetromino.offsetY);
                        //console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+i));
                    }
                } else {
                    if (y > -1){
                        this.mino(tetromino.posX + parseInt(x), tetromino.posY + y, tetromino.color, tetromino.offsetY);
                        //console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+y));
                    }
                }
            }
        }

        previewTetromino(tetrominoToPreview = game.nextTetromino){
            tetrominoToPreview.alignment = 1;
            tetrominoToPreview.posX = config.minosW;
            tetrominoToPreview.posY = Math.floor(config.minosH/4);
            //console.log('previewing tetromino:');
            this.tetromino(tetrominoToPreview);
        }

        map(map = game.map){
            for(let column in map){
                for(let row in map[column]){
                    if(map[column][row]) game.draw.mino(column, row, map[column][row]);
                }
            }
        }

        ui(score, level, tetrominoToPreview){
            // line:
            ctx.beginPath();
            ctx.moveTo(config.boardW+config.ui.lineWidth, 0);
            ctx.lineTo(config.boardW+config.ui.lineWidth, config.boardH);
            ctx.lineWidth = config.ui.lineWidth;
            ctx.fillStyle = config.ui.lineColor;
            ctx.stroke();
            // info:
            ctx.font = config.ui.font;
            ctx.fillStyle  = config.ui.fontColor;
            ctx.textBaseline = "hanging";
            ctx.fillText('Score:', config.boardW + config.ui.lineWidth + 10, 10);
            ctx.fillText('Level:', config.boardW +config.ui.lineWidth + 10, 50);
            ctx.fillText('Next:', config.boardW + config.ui.lineWidth + 10, 130);
            ctx.textAlign = 'end';
            ctx.fillText(score, config.boardW+190, 10);
            ctx.fillText(level, config.boardW+190, 50);
            // next Tetromino:
            this.previewTetromino(tetrominoToPreview);
        }

        clearCanvas(){
            ctx.clearRect(0, 0, board.width, board.height);
            console.log("canvas cleared");
        }

        clearBoard(){
            ctx.clearRect(0, 0, config.boardW, config.boardH);
            console.log("board cleared");
        }

        clearTetromino(tetromino = game.currentTetromino){
            console.log('tetromino cleared');
            for (let x in tetromino.minos[tetromino.alignment]) {
                let y = tetromino.minos[tetromino.alignment][x];
                if (Array.isArray(y)) ctx.clearRect(tetromino.posX + parseInt(x), tetromino.posY + tetromino.offsetY + y[0] * config.mino.minoSizeH, config.mino.minoSizeW, config.mino.minoSizeH * x.length-1);
                else if (y > -1) ctx.clearRect(tetromino.posX + parseInt(x), tetromino.posY + tetromino.offsetY, config.mino.minoSizeW, config.mino.minoSizeW * x);
            }
        }
    }

    class Control{

        constructor() {
            document.addEventListener('keydown', this.keyhandler);
        }

        keyhandler(key) {
            switch (key.keyCode) {

                case 38:        // /\
                case 87:        // W - rotate
                    if (!game.map.checkPossiblePosition()) game.currentTetromino.rotate();
                    break;

                case 37:        // <
                case 65:        // A - move left
                    if (!game.testCollision(-1)) game.currentTetromino.moveLeft();
                    break;

                case 39:        // >
                case 68:        // D - move right
                    if (!game.testCollision(1)) game.currentTetromino.moveRight();
                    break;

                case 40:        // \/
                case 83:        // S - jump down a row
                    if (!game.testCollision(0, 1)){
                        game.skipRowCounter++;
                        game.step();
                    }
                    break;

                case 80:        // Pause
                    game.pause = true;
                    if(confirm('Continue?')) game.pause = false;
                    else game.gameOver();

            }
        }
    }

    // todo: z.B. button mit onclick erzeugt:
    let game = new Game();
//    if(confirm('Start a new Game?')) {
        game.start();
//    }
}