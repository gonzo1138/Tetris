window.onload = function(){
    var board = document.getElementById('board');
    if (!board.getContext) window.alert("A browser supporting the canvas-element is needed for this game...");
    var ctx = board.getContext('2d');

    // setup:
    var lineColor = '#fff'
    var minoBorder = 1;
    var minosMaxSize = 4;
    var minosH    = 16;
    var minosW    = 10;
    var boardH = 800;   // 800 bei 16 Reihen: 50px
    var boardW = 500;   // 500 bei 10 Spalten: 50px
    // Randbreite = canvasbreite(steht in html) - boardW

    // other Variables:
    const tetrominoForms = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];  // forms: https://tetris.fandom.com/wiki/Tetromino
    const scoreForRows = [40, 100, 300, 400];                    // score for 1,2,3 or 4 rows at once  https://tetris.fandom.com/wiki/Scoring
    var minoSizeH = boardH / minosH;
    var minoSizeW = boardW / minosW;
    var startingColum = Math.floor(minosW/2)-1;

    // sideline:
    ctx.beginPath();
    ctx.moveTo(boardW, 0);
    ctx.lineTo(boardW, boardH);
    ctx.fillStyle = lineColor;
    ctx.lineWidth = 5;
    ctx.stroke();

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function rotate(r){      // maybe rotate in both directions? (1=right, -1=left)
        if(r<3) r++;
        else r=0;
        return r;
    }


    class Tetromino{
        color;
        posX;
        posY;
        rotation = 1;   // rotations: https://tetris.fandom.com/wiki/SRS
        minos;

        //image;
        //imagepositions;

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
        /*
        setrandomdimg = function(){
            this.image = document.getElementById('b' + getRandomInt(6).toString() + '.png');
            console.log(this.image);
        }
        */
    }

    function drawMino(x,y,color){
        let startX = minoSizeW*x;
        let startY = minoSizeH*y;

        ctx.fillStyle = color;
        ctx.fillRect(startX, startY, minoSizeW, minoSizeH);
        ctx.fillStyle = lineColor;
        ctx.lineWidth = minoBorder;
        ctx.strokeRect(startX, startY, minoSizeW, minoSizeH);
    }

    function drawTetromino(tetromino){
        //console.log('draw tetromino of color: ' + tetromino.color + ' at x:' + tetromino.posX + ' and y: ' + tetromino.posY);
        for (let x in tetromino.minos[tetromino.rotation]) {
            let y = tetromino.minos[tetromino.rotation][x];
            if (Array.isArray(y)){
                for (let i of y) {
                    drawMino((tetromino.posX + parseInt(x)), tetromino.posY + i, tetromino.color);
                    //console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+i));
                }
            } else {
                if (y > -1){
                    drawMino(tetromino.posX + parseInt(x), tetromino.posY + y, tetromino.color);
                    //console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+y));
                }
            }
        }
    }


    class Game{
        level = 0;
        score = 0;
        currentTetromino;
        nextTetromino;
        map = [];


        constructor(){
            this.drawUI();
            this.currentTetromino = new Tetromino(tetrominoForms[getRandomInt(tetrominoForms.length-1)]);
            this.nextTetromino = new Tetromino(tetrominoForms[getRandomInt(tetrominoForms.length-1)]);
            this.previewTetromino(this.nextTetromino);
            this.createMap();
            this.dropTetromino(this.currentTetromino);

            //test:
            this.mapTetromino(this.currentTetromino);
            this.drawMap();
        }

        drawUI(){
            ctx.font = '32px Calibri';
            ctx.fillStyle  = '#002ba2';
            ctx.textBaseline = "hanging";
            ctx.fillText('Score:', boardW+10, 10);
            ctx.fillText('Level:', boardW+10, 50);
            ctx.fillText('Next:', boardW+10, 130);
            ctx.textAlign = 'end';
            ctx.fillText(this.score, boardW+190, 10);
            ctx.fillText(this.level, boardW+190, 50);
        }

        previewTetromino(tetromino){
            tetromino.rotation = 1;
            tetromino.posX = minosW;
            tetromino.posY = Math.floor(minosH/4);
            //console.log(tetromino);
            drawTetromino(tetromino);
        }

        dropTetromino(tetromino){
            tetromino.rotation = 0;
            tetromino.posX = startingColum;
            tetromino.posY = 8; // -3 on actual start
            //drawTetromino(tetromino);
        }

        createMap() {            // create empty map of the board
            for (let i = 0; i < minosW; i++) {
                this.map[i] = [];
                for (let j = 0; j < minosH; j++) {
                    this.map[i].push(false);
                }
            }
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

        mapTetromino(tetromino){
            console.log('mapping tetromino of color: ' + tetromino.color);
            for (let x in tetromino.minos[tetromino.rotation]) {
                let y = tetromino.minos[tetromino.rotation][x];
                if (Array.isArray(y)){
                    for (let i of y) {
                        this.map[tetromino.posX + parseInt(x)][tetromino.posY + i] = tetromino.color;
                    }
                } else {
                    if (y > -1){
                        this.map[tetromino.posX + parseInt(x)][tetromino.posY + y] = tetromino.color;
                    }
                }
            }
        //    console.log(this.map);
        }

        drawMap(){
            for(let col in this.map){
                for(let row in this.map[col]){
                    if(this.map[col][row]) drawMino(col, row, this.map[col][row]);
                }
            }
        }

        removeRow(row){
            // todo: some fancy effect here...
            for (let i = row; i > 0; i--) {             // start at intended row
                for (let j = 0; j < minosW; j++) {
                    this.map[j][i] = this.map[j][i-1];  // copy row from above
                    if(i===1) this.map[j][0] = false;   // fill fist row with nothingness again
                    // todo: extend with break if game is over
                }
            }
        }

        scanForRows(){
            let lines = [];
            for(let i=0; i<=minosH; i++){
                let counter = minosW;
                for(let j=0; j<=minosW; j++){
                    if (this.map[j][i]) counter--;
                }
                if(counter===0) lines.push(i);
            }
            if(lines.length > 0){
                for(let row of lines) this.removeRow(row);                    // remove Rows
                this.score += scoreForRows[lines.length-1] * (this.level+1);    // update score
            }
        }

        landTetromino(tetromino){
            this.mapTetromino(tetromino);
            this.currentTetromino = this.nextTetromino;
            this.nextTetromino = new Tetromino(tetrominoForms[getRandomInt(tetrominoForms.length-1)]);
            // clear first?
            this.previewTetromino(this.nextTetromino);
            this.scanForRows();
        }

        testCollision(tetromino, testXoffset, testYoffset){
            for (let x in tetromino.minos[tetromino.rotation]) {
                let y = tetromino.minos[tetromino.rotation][x];
                if (Array.isArray(y)){
                    for (let i of y) {
                        if ((tetromino.posX + parseInt(x) + testXoffset) > minosW || (tetromino.posX + parseInt(x) + testXoffset) < 0){
                            console.log('wall-collision!');
                            return false;
                        }
                        else if(this.map[tetromino.posX + parseInt(x) + testXoffset][tetromino.posY + i + testYoffset]){
                            console.log('mino-collision!');
                            return false;
                        }
                    }
                } else {
                    if (y > -1){
                        if ((tetromino.posX + parseInt(x) + testXoffset) > minosW || (tetromino.posX + parseInt(x) + testXoffset) < 0){
                            console.log('wall-collision!');
                            return false;
                        }
                        else if(this.map[tetromino.posX + parseInt(x) + testXoffset][tetromino.posY + i + testYoffset]){
                            console.log('mino-collision!');
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        run(){
            window.requestAnimationFrame(function loop(){
                // ???
                if(this.testCollision(this.currentTetromino, this.currentTetromino.posX, this.currentTetromino.posY+1)){    // test for next row
                    // ...
                } else {
                    this.landTetromino(this.currentTetromino);

                }
                if(this.testCollision(this.currentTetromino, this.currentTetromino.posX+1, this.currentTetromino.posY)){    // test for movement right
                    // ...
                }
                if(this.testCollision(this.currentTetromino, this.currentTetromino.posX-1, this.currentTetromino.posY)){    // test for movement left
                    // ...
                }

            });
        }
    }

    let g = new Game();
}