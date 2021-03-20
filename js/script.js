window.onload = function(){
    var board = document.getElementById('board');
    if (!board.getContext) window.alert("Ein Browser der das Canvas-Element unterstützt ist für dieses Spiel voraussetzung...");
    var context = board.getContext('2d');

    var blocksh    = 16;
    var blocksw    = 10;
    var spielfeldh = 800;   // 800 bei 50bs: 16 Reihen
    var spielfeldw = 500;   // 500 bei 50bs: 10 Spalten
    var blocksizeh = spielfeldh / blocksh;
    var blocksizew = spielfeldw / blocksw;

    // Spielfeldbegrenzungslinie:
    context.beginPath();
    context.moveTo(spielfeldw, 0);
    context.lineTo(spielfeldw, spielfeldh);
    context.lineWidth = 5;
    context.stroke();

    class Block{
        name;
        tiles;
        image;
        margin;
        imagepositions;

        setrandomdimg = function(){
            let rndnr = getRandomInt(6);
            this.image = document.getElementById('b' + rndnr.toString());
            console.log(this.image);
        }
    }


}