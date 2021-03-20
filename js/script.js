window.onload = function(){
    var board = document.getElementById('board');
    if (!board.getContext) window.alert("Ein Browser der das Canvas-Element unterstützt ist für dieses Spiel voraussetzung...");
    var ctx = board.getContext('2d');

    // setup:
    var lineColor = '#fff'
    var minoBorder = 1;
    var minosMaxSize = 4;
    var minosH    = 16;
    var minosW    = 10;
    var boardH = 800;   // 800 bei 16 Reihen: 50px
    var boardW = 500;   // 500 bei 10 Spalten: 50px
    // Randbreite = canvasbreite(html) - boardW

    // other Variables:
    const tetrominoForms = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
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
        minos;          // forms: https://tetris.fandom.com/wiki/Tetromino

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

    //drawMino(3,3,'#EFF200');

    function drawTetromino(tetromino){
        console.log('color: ' + tetromino.color);
        for (let x in tetromino.minos[tetromino.rotation]) {
            let y = tetromino.minos[tetromino.rotation][x];
            if (Array.isArray(y)){
                for (let i of y) {
                    drawMino((tetromino.posX + parseInt(x)), tetromino.posY + i, tetromino.color);
                    console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+i));
                }
            } else {
                if (y > -1){
                    drawMino(tetromino.posX + parseInt(x), tetromino.posY + y, tetromino.color);
                    console.log('mino drawn at x: ' + (tetromino.posX+x) + ' and y: ' + (tetromino.posX+y));
                }
            }
        }
    }


    class Game{
        level = 0;
        score = 0;
        currentTetromino;
        nextTetromino;

        constructor(){
            this.drawUI();
            this.currentTetromino = new Tetromino(tetrominoForms[getRandomInt(tetrominoForms.length-1)]);
            this.nextTetromino = new Tetromino(tetrominoForms[getRandomInt(tetrominoForms.length-1)]);
            this.previewTetromino(this.nextTetromino);
            this.dropTetromino(this.currentTetromino);
        }

        drawUI(){
            ctx.font = '32px Calibri';
            ctx.fillStyle  = '#002ba2';
            ctx.textBaseline = "hanging";
            ctx.fillText('Score:', boardW+10, 10);
            ctx.fillText('Level:', boardW+10, 50);
            ctx.fillText('Next:', boardW+10, 90);
            ctx.textAlign = "end";
            ctx.fillText(this.score, boardW+190, 10);
            ctx.fillText(this.level, boardW+190, 50);
        }

        previewTetromino(tetromino){
            tetromino.rotation = 1;
            tetromino.posX = minosW;
            tetromino.posY = 3;
            //console.log(tetromino);
            drawTetromino(tetromino);
        }

        dropTetromino(tetromino){
            tetromino.rotation = 0;
            tetromino.posX = startingColum;
            tetromino.posY = 0; // -3 on actual start
            drawTetromino(tetromino);
        }
    }

    let g = new Game();
}