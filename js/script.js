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
            form: ['I', 'O', 'T', 'S', 'Z', 'J', 'L'],       // forms: https://tetris.fandom.com/wiki/Tetromino
            //maxSize: 4,
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
        frames: 60,     // number of frames per row
        ui:{
            lineWidth: 5,
            lineColor: '#fff',
            font: '32px Calibri',
            fontColor: '#002ba2',
        }
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function drawMino(x, y, color, offsetY=0){
        let startX = config.mino.minoSizeW * x;
        let startY = config.mino.minoSizeH * y;

        ctx.fillStyle = color;
        ctx.fillRect(startX, startY + offsetY, config.mino.minoSizeW, config.mino.minoSizeH);
        ctx.fillStyle = config.mino.lineColor;
        ctx.lineWidth = config.mino.minoBorder;
        ctx.strokeRect(startX, startY + offsetY, config.mino.minoSizeW, config.mino.minoSizeH);
    }


    class Game{
        level = 0;
        score = 0;
        currentTetromino;
        nextTetromino;
        map;
        frameDuration;
        //cyclecounter = 0;


        constructor(){
            this.map = new Map();
            this.currentTetromino = new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);
            this.nextTetromino = new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);

            config.mino.minoSizeH = config.boardH / config.minosH;
            config.mino.minoSizeW = config.boardW / config.minosW;
            config.startingColum = Math.floor(config.minosW/2)-1;
            this.frameDuration = config.speed / config.frames;
            if(config.startingColum < 3) window.alert("Check your board-size-settings...");
        }

        levelUp(){
            this.level++;
            config.speed -= this.level * 20;
            this.frameDuration = config.speed / config.frames;
        }

        run(){
            //test:
            this.currentTetromino.drop();
            //this.currentTetromino.map();
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

            // the following must happen after starting the game and in every Tetromino-cycle:
            this.step();
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


        clearCanvas(){
            ctx.clearRect(0, 0, board.width, board.height);
        }

        clearBoard(){
            ctx.clearRect(0, 0, config.boardW, config.boardH);
        }


        step(){
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
            this.drawUI();
            // calc and write offsetY...

            game.loop = setInterval(function () {
                game.clearBoard();
                game.map.draw();
                game.currentTetromino.draw();
            }, );
            // only every step:
            this.testCollision();
            map.scanForOccupiedRows();

            // test for collision at next row
            if(this.testCollision(this.currentTetromino, this.currentTetromino.posX, this.currentTetromino.posY+1)){
                // ...
            } else {
                this.landTetromino(this.currentTetromino);

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

        }

        testCollision(xOffset, yOffset){
            for (let x in this.currentTetromino.minos[this.currentTetromino.rotation]) {
                let y = this.currentTetromino.minos[this.currentTetromino.rotation][x];
                if (Array.isArray(y)){
                    for (let i of y) {
                        if ((this.currentTetromino.posX + parseInt(x) + xOffset) > config.minosW || (this.currentTetromino.posX + parseInt(x) + xOffset) < 0){
                            console.log('wall-collision!');
                            return false;
                        }
                        else if(this.map[this.currentTetromino.posX + parseInt(x) + xOffset][this.currentTetromino.posY + i + yOffset]){
                            console.log('mino-collision!');
                            return false;
                        }
                    }
                } else {
                    if (y > -1){
                        if ((this.currentTetromino.posX + parseInt(x) + xOffset) > config.minosW || (this.currentTetromino.posX + parseInt(x) + xOffset) < 0){
                            console.log('wall-collision!');
                            return false;
                        }
                        else if(this.map[this.currentTetromino.posX + parseInt(x) + xOffset][this.currentTetromino.posY + yOffset]){
                            console.log('mino-collision!');
                            return false;
                        }
                    }
                }
            }
            return true;
        }
    }

    class Tetromino{
        color;
        posX;
        posY;
        rotation;   // rotations: https://tetris.fandom.com/wiki/SRS
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

        draw(){
            //console.log('draw tetromino of color: ' + tetromino.color + ' at x:' + tetromino.posX + ' and y: ' + tetromino.posY);
            for (let x in this.minos[this.rotation]) {
                let y = this.minos[this.rotation][x];
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
            //console.log(tetromino);
            this.draw();
        }

        rotate() {
            if (this.rotation < 3) this.rotation++;
            else this.rotation = 0;
        }

        drop(){
            this.rotation = 0;
            this.posX = config.startingColum;
            this.posY = -3;
            this.draw();
        }

        land(){
            this.mapTetromino(tetromino);
            this.currentTetromino = this.nextTetromino;
            this.nextTetromino = new Tetromino(config.tetromino.form[getRandomInt(config.tetromino.form.length-1)]);
            this.nextTetromino.preview();
            this.currentTetromino.drop();
        }

        /*
        setrandomdimg = function(){
            this.image = document.getElementById('b' + getRandomInt(6).toString() + '.png');
            console.log(this.image);
        }
        */
    }

    class Map{
        board = [];

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
                    this.map[j][i] = this.map[j][i-1];  // copy row from above
                    if(i===1) this.board[j][0] = false;   // fill fist row with nothingness again
                    // todo: extend with break if game is over
                }
            }
        }

        scanForOccupiedRows(){
            let rows = [];
            for(let i=0; i<=minosH; i++){
                let counter = minosW;
                for(let j=0; j<=minosW; j++){
                    if (this.board[j][i]) counter--;
                }
                if(counter===0) rows.push(i);
            }
            if(rows.length > 0) for(let row of rows) this.removeRow(row);      // Remove those Rows!
            this.score += scoreForRows[rows.length-1] * (this.level+1);        // update score
        }

        mapTetromino(){
            console.log('mapping this of color: ' + this.color);
            for (let x in this.minos[this.rotation]) {
                let y = this.minos[this.rotation][x];
                if (Array.isArray(y)){
                    for (let i of y) {
                        this.board[this.posX + parseInt(x)][this.posY + i] = this.color;
                    }
                } else {
                    if (y > -1){
                        this.board[this.posX + parseInt(x)][this.posY + y] = this.color;
                    }
                }
            }
            //    console.log(this.map);
        }
    }

    // button mit onclick erzeugt:
    let game = new Game();
    game.run();

}