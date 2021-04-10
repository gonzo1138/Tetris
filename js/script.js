window.onload = function(){
    var board = document.getElementById('board');
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
            form: ['I', 'O', 'T', 'S', 'Z', 'J', 'L'],       // forms: https://tetris.wiki/Tetromino
            maxSize: 4,
        },
        scoring:{                                           // score for 1,2,3 or 4 rows at once  https://tetris.fandom.com/wiki/Scoring
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

/*
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
*/
    function drawMino(x, y, color, offsetY=0){
        let startX = config.mino.minoSizeW * x;
        let startY = config.mino.minoSizeH * y;

        ctx.fillStyle = color;
        ctx.fillRect(startX, startY + offsetY, config.mino.minoSizeW, config.mino.minoSizeH);
        ctx.fillStyle = config.mino.lineColor;
        ctx.lineWidth = config.mino.minoBorder;
        ctx.strokeRect(startX, startY + offsetY, config.mino.minoSizeW, config.mino.minoSizeH);
    }

    function rotate(currentAlignment) {
        if (currentAlignment < 3) return ++currentAlignment;
        else return 0;
    }


    class Game{
        level = 0;
        score = 0;
        skipRowCounter = 0;

        currentTetromino;
        nextTetromino;
        tetrominosWaiting = [];
        map;
        posPos;         // array can only be run through by: for(col in/of posPos), because index starts at -2, not 0!

        //loop;
        frameDuration;
        firstStep = true;
        pause = false;
        gameOver = false;


        constructor(){
            this.map = new Map();
            //this.currentTetromino = new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);   // gets created at drop()
            this.nextTetromino = this.getTetromino();   //new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);

            config.mino.minoSizeH = config.boardH / config.minosH;
            config.mino.minoSizeW = config.boardW / config.minosW;
            config.startingColum = Math.floor(config.minosW/2)-1;
            this.frameDuration = config.speed / config.minoSizeH;
            if(config.startingColum < 3) window.alert("Check your board-size-settings...");
        }

        run(){
            // todo: reset everything to start a new game after another without reloading the page?
            this.drop();
            this.drawUI();

            this.calculatePossiblePositions(1);

            //this.currentTetromino.draw();
            this.map.mapTetromino(this.currentTetromino);


            /*
                        while(!this.gameOver){
                            this.drawUI();
                            while(!this.pause){
                                // see doc/states.png for structure
                                //this.drop();
                                //this.testCollision();
                                //this.transit();
                                //this.step();
                                //this.process();
                            }
                            window.alert("Continue...")
                            this.pause = false;
                        }
                        window.alert("Game Over!");
            */

            /*
                console.log("test:");
                let testomino = new Tetromino('L');
                testomino.posX=12;
                testomino.posY=1;
                console.log(testomino);
                testomino.draw();
            */

        /*
            // row elimination test:
            let row = 1;                                // row intended to be removed
            // map[col][row]
            this.map[3][0] = '#123456';
            this.map[4][1] = '#123456';
            this.map[5][2] = '#123456';
            for (let i = row; i > 0; i--) {             // start at intended row
                for (let j = 0; j < minosW; j++) {
                    this.map[j][i] = this.map[j][i-1];  // let row sink
                    if(i===1) this.map[j][0] = false;   // fill fist row with nothingness again  todo: extend with break if game is over
                }
            }
            console.log(this.map);
        */
        }

        drop(){
            // prepare new nextTetromino:
            this.currentTetromino = this.nextTetromino;
            this.nextTetromino = this.getTetromino();   // new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);
            // place new currentTetromino:
            this.currentTetromino.rotation = 0;
            this.currentTetromino.posX = config.startingColum;
            this.currentTetromino.posY = 5;//-3;
            //this.step();
        }

        transit(){
            for(this.currentTetromino.offsetY; this.currentTetromino.offsetY < config.minoSizeH; this.currentTetromino.offsetY++){
                this.currentTetromino.draw();
                setTimeout(function(){
                    console.log("wait a frameDuration...");
                }, this.frameDuration);
                this.currentTetromino.unDraw();
            }
            this.currentTetromino.offsetY = 0;

        /*
            this.loop = setInterval(function () {
                game.currentTetromino.unDraw();
                console.log(game.currentTetromino.offsetY);
                game.currentTetromino.offsetY = game.transitionCounter * Math.floor(config.minoSizeH / config.frames);
                game.currentTetromino.draw();
                game.frame++;
            }, this.frameDuration);
        */
        /*
                window.requestAnimationFrame(function loop(){
                    if (g.cyclecounter < config.speed){
                        g.cyclecounter++;
                        let offsetY =
                            g.map.draw();
                        g.drawUI();
                    } else {
                        g.cyclecounter=0;
                    }

                });
            */
        /*
                            this.testCollision();
                            map.scanForOccupiedRows();

                            // test for collision at next row
                            if(this.testCollision(this.currentTetromino.posX, this.currentTetromino.posY+1)){
                                // ...
                            } else {
                                this.process();

                            }

                            // check at key-pressing:

                            // test for movement right
                            if(this.testCollision(this.currentTetromino, this.currentTetromino.posX+1, this.currentTetromino.posY)){
                                // ...
                            }

                            // test for movement left
                            if(this.testCollision(this.currentTetromino, this.currentTetromino.posX-1, this.currentTetromino.posY)){
                                // ...
                            }
                        */
        }

        step() {
            if(this.testCollision(0, 1)){
                if(this.firstStep) this.gameOver();

            }

            this.firstStep = false;
        }

        process(){
            this.map.mapTetromino(this.currentTetromino);
            // update ui...
            if (this.skipRowCounter>0){
                this.score += this.skipRowCounter * 10 * this.level;
                this.skipRowCounter = 0;
            }
            if(this.firstStep) this.gameOver();
        }

        // ? obsolete:
        testCollision(columOffset=0, rowOffset=0, rotation=false){
            // clear board in case rotation or movement succeeds
            //this.clearBoard();
            //this.map.draw();

            let xPosition = this.currentTetromino.posX + columOffset;
            let yPosition = this.currentTetromino.posY + rowOffset;
            let testRotation = this.currentTetromino.rotation;
            if(rotation) testRotation = rotate(this.currentTetromino.rotation);
            //todo: rework for absolute position and rotation from here on...

            // test 1: with new rotation and offsets - are there walls?
            if(this.wallCollisionTest(columOffset, rowOffset, testRotation)) {
                // if so, can a wallkick be performed? -> are *there* minos?
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
        //

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

        calculatePossiblePositions(rowOffset=0){
            let rowNum = this.currentTetromino.posY + rowOffset;
            this.posPos = [];
            for(let col = Math.round(config.tetromino.maxSize / 2) * -1; col < config.minosW+Math.round(config.tetromino.maxSize / 2); col++){
                this.posPos[col] = [];
                for(let rot = 0; rot < 4; rot++){
                    this.posPos[col][rot] = true;
                    // are there minos?
                    this.posPos[col][rot] = !this.minoCollisionTest(col, rowNum, rot);  // when collision detected (true), position occupied => false
                    // are there walls?
                    if(this.posPos[col][rot]) this.posPos[col][rot] = !this.wallCollisionTest(col, rot);
                    // has the bottom been reached? (just testing when in close distance to the bottom)
                    if(this.posPos[col][rot] && rowNum > config.minosW-config.tetromino.maxSize) this.posPos[col][rot] = this.bottomCollisionTest(rowNum, rot);
                }
            }
            console.log('possible positions for currentTetromino:');
            console.log(this.posPos);
        }

        drawUI(){
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
            this.nextTetromino.preview();
        }

        levelUp(){
            this.level++;
            config.speed -= this.level * 20;
            this.frameDuration = config.speed / config.frames;
        }

        clearCanvas(){
            ctx.clearRect(0, 0, board.width, board.height);
            console.log("canvas cleared");
        }

        clearBoard(){
            ctx.clearRect(0, 0, config.boardW, config.boardH);
            console.log("board cleared");
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

        keyhandler(key) {
            switch (key.keyCode) {

                case 38:        // /\
                case 87:        // W - rotate
                    if (!this.testCollision(0, 0, true)) this.currentTetromino.rotation = rotate(this.currentTetromino.rotation);
                    break;

                case 37:        // <
                case 65:        // A - move left
                    if (!this.testCollision(-1)) this.currentTetromino.posX--;
                    break;

                case 39:        // >
                case 68:        // D - move right
                    if (!this.testCollision(1)) this.currentTetromino.posX++;
                    break;

                case 40:        // \/
                case 83:        // S - jump down a row
                    if (!this.testCollision(0, 1)) this.currentTetromino.posX++;
                    break;

            }
        }
    }

    class Tetromino{
        color;
        posX;
        posY;
        offsetY = 0;
        rotation = 0;   // rotations: https://tetris.fandom.com/wiki/SRS
        minos;

        constructor(form){
            switch (form){
                case 'I':
                    this.color = '#03EFF1';
                    this.minos = [[1,1,1,1],[-1,-1,[0,1,2,3],-1],[2,2,2,2],[-1,[0,1,2,3],-1,-1]];
                    break;
                case 'O':
                    this.color = '#EFF200';
                    this.minos = [[-1,[0,1],[0,1]],[-1,[0,1],[0,1]],[-1,[0,1],[0,1]],[-1,[0,1],[0,1]]];
                    break;
                case 'T':
                    this.color = '#A000F5';
                    this.minos = [[1,[0,1],1],[-1,[0,1,2],1],[1,[1,2],1],[1,[0,1,2],-1]];
                    break;
                case 'S':
                    this.color = '#00F100';
                    this.minos = [[1,[0,1],0],[-1,[0,1],[1,2]],[2,[1,2],1],[[0,1],[1,2],-1]];
                    break;
                case 'Z':
                    this.color = '#F00100';
                    this.minos = [[0,[0,1],1],[-1,[1,2],[0,1]],[1,[1,2],2],[[1,2],0,1],-1];
                    break;
                case 'J':
                    this.color = '#0101EE';
                    this.minos = [[[0,1],1,1],[-1,[0,1,2],0],[1,1,[1,2]],[2,[0,1,2],-1]];
                    break;
                case 'L':
                    this.color = '#EFA000';
                    this.minos = [[1,1,[0,1]],[-1,[0,1,2],2],[[1,2],1,1],[0,[0,1,2],-1]];
                    break;
                default:
                    console.log('Bad form... can be I, O, T, S, Z, J, and L');
                    break;
            }
        }

        draw(from=0, to = this.minos[this.rotation].length){
            console.log('drawing tetromino of color: ' + this.color + '  at x: ' + this.posX + '  and y: ' + this.posY + '  with y-Offset: ' + this.offsetY);
            for (let x in this.minos[this.rotation]) {
                let y = this.minos[this.rotation][x];
                //if(y===-1)
                if (Array.isArray(y)){
                    for (let i of y) {
                        drawMino((this.posX + parseInt(x)), this.posY + i, this.color, this.offsetY);
                        //console.log('mino drawn at x: ' + (this.posX+x) + ' and y: ' + (this.posX+i));
                    }
                } else {
                    if (y > -1){
                        drawMino(this.posX + parseInt(x), this.posY + y, this.color, this.offsetY);
                        //console.log('mino drawn at x: ' + (this.posX+x) + ' and y: ' + (this.posX+y));
                    }
                }
            }
        }

        unDraw(){
            console.log('undrawing tetromino');
            for (let x in this.minos[this.rotation]) {
                let y = this.minos[this.rotation][x];
                if (Array.isArray(y)) ctx.clearRect(this.posX + parseInt(x), this.posY + this.offsetY + y[0] * config.mino.minoSizeH, config.mino.minoSizeW, config.mino.minoSizeH * x.length-1);
                else if (y > -1) ctx.clearRect(this.posX + parseInt(x), this.posY + this.offsetY, config.mino.minoSizeW, config.mino.minoSizeW * x);
            }
        }

        preview(){
            this.rotation = 1;
            this.posX = config.minosW;
            this.posY = Math.floor(config.minosH/4);
            //console.log(this);
            this.draw();
        }
    }

    class Map{
        board = [];
        topo;

        constructor() {            // create empty map at the size of the board
            for (let i = 0; i < config.minosW; i++) {
                this.board[i] = [];
                for (let j = 0; j < config.minosH; j++) {
                    this.board[i].push(false);
                }
            }
        }

        draw(){
            for(let col in this.board){
                for(let row in this.board[col]){
                    if(this.board[col][row]) drawMino(col, row, this.board[col][row]);
                }
            }
        }

        removeRow(row){
            // todo: some fancy effect here...
            for (let i = row; i > 0; i--) {             // start at intended row
                for (let j = 0; j < config.minosW; j++) {
                    this.board[j][i] = this.board[j][i-1];  // copy row from above
                    if(i===1) this.board[j][0] = false;   // fill fist row with nothingness again
                    // todo: extend with break if game is over
                }
            }
        }

        scanForOccupiedRows(){
            let rows = [];
            for(let col = 0; col < config.minosH; col++){
                let counter = config.minosW;
                for(let row = 0; row < config.minosW; row++){
                    if (this.board[row][col]) counter--;
                }
                if(counter===0) rows.push(col);
            }
            if(rows.length > 0) for(let row of rows) this.removeRow(row);      // Remove those Rows!
            this.score += scoreForRows[rows.length-1] * (this.level+1);        // update score
        }

        mapTetromino(tetrominoToMap){
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
            this.topo = [];
            for (let colum of this.board) {
                this.topo.push(this.scanTopo(colum));
            }

            // check:
            console.log('Board:');
            console.log(this.board);
            console.log('Topology:');
            console.log(this.topo);
            //
        }

        scanTopo(colum){
            //console.dir(colum);
            for (let row in colum) {
                if(colum[row]) return row-1;
            }
            return config.minosH-1;
        }
    }

    // todo: button mit onclick erzeugt:
    let game = new Game();
//    if(confirm('Start a new Game?')) {
        game.run();
//    }
    document.addEventListener('keydown', game.keyhandler);

}