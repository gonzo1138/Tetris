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
                'I':{
                    minoPositions: [[1,1,1,1],[-1,-1,[0,1,2,3],-1],[2,2,2,2],[-1,[0,1,2,3],-1,-1]], // [[Alignment0][Alignment1][Alignment2][Alignment3]]
                    color:'#03EFF1',
                },
                'O':{
                    minoPositions: [[-1,[0,1],[0,1]],[-1,[0,1],[0,1]],[-1,[0,1],[0,1]],[-1,[0,1],[0,1]]],
                    color:'#EFF200',
                },
                'T':{
                    minoPositions: [[1,[0,1],1],[-1,[0,1,2],1],[1,[1,2],1],[1,[0,1,2],-1]],
                    color:'#A000F5',
                },
                'S':{
                    minoPositions: [[1,[0,1],0],[-1,[0,1],[1,2]],[2,[1,2],1],[[0,1],[1,2],-1]],
                    color:'#00F100',
                },
                'Z':{
                    minoPositions: [[0,[0,1],1],[-1,[1,2],[0,1]],[1,[1,2],2],[[1,2],0,1],-1],
                    color:'#F00100',
                },
                'J':{
                    minoPositions: [[[0,1],1,1],[-1,[0,1,2],0],[1,1,[1,2]],[2,[0,1,2],-1]],
                    color:'#0101EE',
                },
                'L':{
                    minoPositions: [[1,1,[0,1]],[-1,[0,1,2],2],[[1,2],1,1],[0,[0,1,2],-1]],
                    color:'#EFA000',
                },
            },
            maxSize: 4,
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
        boardH: 800,   // 800 bei 16 Reihen: 50px
        boardW: 500,   // 500 bei 10 Spalten: 50px
        startingColum: 0,   // gets calculated...
        speed: 600,    // ms to pass one row (smaller = faster) at level 0
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
        gameOver = false;


        constructor(){
            this.map = new Map();
            this.draw = new Draw();
            this.input = new Control();

            //this.currentTetromino = new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);   // gets created at drop()
            this.nextTetromino = this.getTetromino();   //new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);

            config.mino.minoSizeH = config.boardH / config.minosH;
            config.mino.minoSizeW = config.boardW / config.minosW;
            config.startingColum = Math.floor(config.minosW/2)-1;
            this.frameDuration = config.speed / config.minoSizeH;
            if(config.startingColum < 3) window.alert("Check your board-size-settings...");
        }

        run(){
            // todo: reset everything to start a new game after another without reloading the page?  alternative: new Game-Object...
            this.drop();

        }

        drop(){
            // prepare new nextTetromino:
            this.currentTetromino = this.nextTetromino;
            this.nextTetromino = this.getTetromino();
            // redraw ui with new nextTetromino:
            this.draw.clearCanvas();
            this.draw.ui();
            // place new currentTetromino:
            this.currentTetromino.rotation = 0;
            this.currentTetromino.posX = config.startingColum;
            this.currentTetromino.posY = 0;//-2;
            this.transit();
        }

        transit(tetromino = this.currentTetromino){
            console.log('Transit from ' + this.currentTetromino.posY-1 + ' to ' + this.currentTetromino.posY);

            this.loop = setInterval(function () {
                if(!game.pause) {
                    game.draw.clearTetromino(tetromino);
                    tetromino.offsetY++;
                    game.draw.tetromino(tetromino);
                    if (tetromino.offsetY === config.mino.minoSizeH - 1) {
                        tetromino.offsetY = 0;
                        game.step();
                    }
                }
            }, this.frameDuration);
        }

        step() {
            if(!this.testCollision(0, 1)){
                this.isFirstStepOfNewCycle = false;
                this.currentTetromino.moveDown();
                this.map.calculatePossiblePositions(this.currentTetromino);
                this.draw.clearBoard();
                this.transit();
            } else {
                if(this.isFirstStepOfNewCycle) this.gameOver();
                else this.process();
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
        }

        testCollision(columOffset=0, rowOffset=0, rotation=false){
            let xPosition = this.currentTetromino.posX + columOffset;
            let yPosition = this.currentTetromino.posY + rowOffset;
            let testRotation = this.currentTetromino.rotation;
            if(rotation) testRotation = this.rotate(this.currentTetromino.rotation);
            //todo: rework for absolute position and rotation from here on...

            // test 1: with new rotation and offsets - are there walls?
            if(this.wallCollisionTest(columOffset, rowOffset, testRotation)) {
                // if so, can a wallkick be performed? -> are *there* minos?      https://tetris.wiki/Wall_kick
                if (columOffset > 0) {
                    if(this.wallCollisionTest(columOffset, rowOffset, testRotation)) {}
                } else if (columOffset < 0) return true;
            }

            // test 2: xOffset with new rotation and offsets - are there minos?
            if (this.minoCollisionTest(columOffset, rowOffset, testRotation)) return true;

            // test 3: with new rotation - has the bottom been reached?
            if (this.bottomCollisionTest(testRotation)) return true;

        /*
            if (columOffset !== 0) {
                // calculate current tetromino-form-offsets for left and right (for test1)
                let tetrominoLeft;
                let tetrominoRight;
                for (let x in this.currentTetromino.minos[this.currentTetromino.rotation]) {
                    //let y = this.currentTetromino.minos[this.currentTetromino.rotation][x];
                    //if (Array.isArray(y)) if (y[y.length-1] > minoBottom) minoBottom = y[y.length-1];
                    //else if (y > minoBottom) minoBottom = y;


                }
                if (this.currentTetromino.posY + minoBottom > this.map[0].length - 1) {
                    console.log('bottom-collision!');
                    return true;
                } else return false;

                // xOffset test 1: are there walls? [true, go on]
                // xOffset test 2: are there minos? [true, go on]
                return false;

                if (rowOffset > 0) {
                    // calculate current tetromino-form-offset for bottom at every colum
                    // yOffset test 1: is the boarder ahead? [true, process]
                    // yOffset test 2: are there minos? [true, process]
                    return false;
                }
            }
        */

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
                for(let i=0; i<config.tetromino.form.length; i++){
                    this.tetrominosWaiting.push(new Tetromino(config.tetromino.form[i]));
                }
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

    }

    class Tetromino{
        minos;
        color;
        posX = 0;
        posY = 0;
        offsetY = 0;
        alignment = 0;   // alignments: https://tetris.wiki/Super_Rotation_System

        constructor(form){
            this.color = config.tetromino.form[form].color;
            this.minos = config.tetromino.form[form].minoPositions;
        }

        rotate() {
            if (this.alignment < 3) this.alignment++;
            else this.alignment = 0;
        }

        getAlignment(){
            return this.alignment;
        }
        
        moveRight(){
            this.posX++;
        }

        moveLeft(){
            this.posX--;
        }
        
        moveDown(){
            this.posY++;
        }
        
        getNextAlignment(currentAlignment = this.alignment) {        // cold rotation,
            if (currentAlignment < 3) return ++currentAlignment;
            else return 0;
        }
    }

    class Map{
        board = [];
        topology;
        possibleMinoPositions;         // array can only be run through by: for(col in/of posPos), because index starts at -2, not 0!

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
                for(let colum = 0; colum < config.minosW; colum++){
                    if (this.board[colum][row]) counter--;
                }
                if(counter===0) lines.push(row);
            }
            if(lines.length > 0){
                for(let row of lines) this.removeRow(row);                            // Remove those Rows!
                super.updateScore(config.scoring.rows[lines.length-1] * (super.level+1)); // update score
            }

        }

        mapTetromino(tetrominoToMap = super.currentTetromino){
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
            // store new topology
            this.topology = [];
            for (let colum of this.board) {
                this.topology.push(this.scanTopo(colum));
            }

            // check:
            console.log('Board:');
            console.log(this.board);
            console.log('Topology:');
            console.log(this.topology);
            //
        }

        minoCollisionTest(xPos=this.currentTetromino.posX, yPos=this.currentTetromino.posY, rotation=this.currentTetromino.rotation){
            for (let x=0; x<this.currentTetromino.minos[rotation]; x++) {
                let y = this.currentTetromino.minos[rotation][x];
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

        wallCollisionTest(xPos=this.currentTetromino.posX, rotation=this.currentTetromino.rotation){
            for (let x in this.currentTetromino.minos[rotation]){
                let y = this.currentTetromino.minos[rotation][x];
                if (Array.isArray(y) || y > -1){
                    if (xPos < 0 || xPos > config.minosW) return true;
                }
            }
            return false;
        }

        bottomCollisionTest(yPos=this.currentTetromino.posY, rotation=this.currentTetromino.rotation){
            // determine bottom of Tetromino:
            let minoBottom = 0;
            for (let x in this.currentTetromino.minos[rotation]){
                let y = this.currentTetromino.minos[rotation][x];
                if (Array.isArray(y)) if (y[y.length-1] > minoBottom) minoBottom = y[y.length-1];
                else if (y > minoBottom) minoBottom = y;
            }
            // check if Tetromino has reached bottom of the board:

            if (yPos+minoBottom > this.map.board[0].length-1){
                console.log('bottom-collision!');
                return true;
            } else return false;
        }
        
        scanTopo(colum){
            //console.dir(colum);
            for (let row in colum) {
                if(colum[row]) return row-1;
            }
            return config.minosH-1;
        }

        // todo: transfered game -> map
        calculatePossiblePositions(tetromino, rowOffset=0){
            let rowNum = tetromino.posY + rowOffset;
            this.possibleMinoPositions = [];
            for(let colum = Math.round(config.tetromino.maxSize / 2) * -1; colum < config.minosW+Math.round(config.tetromino.maxSize / 2); colum++){
                this.possibleMinoPositions[colum] = [];
                for(let rotation = 0; rotation < 4; rotation++){
                    this.possibleMinoPositions[colum][rotation] = true;
                    // are there minos?
                    this.possibleMinoPositions[colum][rotation] = !this.minoCollisionTest(colum, rowNum, rotation);  // when collision detected (true), position occupied => false
                    // are there walls?
                    if(this.possibleMinoPositions[colum][rotation]) this.possibleMinoPositions[colum][rotation] = !this.wallCollisionTest(colum, rotation);
                    // has the bottom been reached? (just testing when in close distance to the bottom)
                    if(this.possibleMinoPositions[colum][rotation] && rowNum > config.minosW-config.tetromino.maxSize) this.possibleMinoPositions[colum][rotation] = this.bottomCollisionTest(rowNum, rotation);
                }
            }
            console.log('possible positions for currentTetromino:');
            console.log(this.possibleMinoPositions);
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

        tetromino(tetromino = super.currentTetromino){
            console.log('drawing tetromino of color: ' + tetromino.color + '  at x: ' + tetromino.posX + '  and y: ' + tetromino.posY + '  with y-Offset: ' + tetromino.offsetY);
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

        previewTetromino(tetromino = super.nextTetromino){
            tetromino.alignment = 1;
            tetromino.posX = config.minosW;
            tetromino.posY = Math.floor(config.minosH/4);
            console.log('previewing tetromino:');
            this.tetromino(tetromino);
        }

        map(map = super.map){
            for(let colum in map){
                for(let row in map[colum]){
                    if(map[colum][row]) this.drawMino(colum, row, map[colum][row]);
                }
            }
        }

        ui(){
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
            ctx.fillText(this.score, config.boardW+190, 10);
            ctx.fillText(this.level, config.boardW+190, 50);
            // next Tetromino:
            this.previewTetromino(super.nextTetromino);
        }

        clearCanvas(){
            ctx.clearRect(0, 0, board.width, board.height);
            console.log("canvas cleared");
        }

        clearBoard(){
            ctx.clearRect(0, 0, config.boardW, config.boardH);
            console.log("board cleared");
        }

        clearTetromino(tetromino = super.currentTetromino){
            console.log('undrawing tetromino');
            for (let x in tetromino.minos[this.rotation]) {
                let y = tetromino.minos[this.rotation][x];
                if (Array.isArray(y)) ctx.clearRect(this.posX + parseInt(x), this.posY + this.offsetY + y[0] * config.mino.minoSizeH, config.mino.minoSizeW, config.mino.minoSizeH * x.length-1);
                else if (y > -1) ctx.clearRect(this.posX + parseInt(x), this.posY + this.offsetY, config.mino.minoSizeW, config.mino.minoSizeW * x);
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
                    if (!game.testCollision(0, 0, true)) game.currentTetromino.rotation = game.rotate(game.currentTetromino.rotation);
                    break;

                case 37:        // <
                case 65:        // A - move left
                    if (!game.testCollision(-1)) game.currentTetromino.posX--;
                    break;

                case 39:        // >
                case 68:        // D - move right
                    if (!game.testCollision(1)) game.currentTetromino.posX++;
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
        game.run();
//    }


}