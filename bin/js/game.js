var IDemon = (function () {
    function IDemon() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    IDemon.prototype.preload = function () {
        // Tilemap
        this.game.load.tilemap("stageOneMap", "assets/iDemonStage1.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("brickTiles", "assets/brickTile80.png");
        this.game.load.image("stairTiles", "assets/steps.png");
        // Player character
        this.game.load.image("playerIdle", "assets/playerIdle.png");
    };
    IDemon.prototype.create = function () {
        //  enable the Arcade Physics system
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = 0x000000;
        this.stageOneMap = this.game.add.tilemap("stageOneMap", 80, 80, 70, 8);
        this.stageOneMap.addTilesetImage("bricks", "brickTiles");
        this.stageOneMap.addTilesetImage("stairs", "stairTiles");
        this.brickLayer = this.stageOneMap.createLayer("bricks");
        this.brickLayer.resizeWorld();
        // Setup Camera
        // this.game.camera.x = this.stageOneMap.layers[0].widthInPixels / 2;
        this.game.camera.x = 0;
        this.game.camera.y = 0;
        // Setup the bricks for collisions
        this.stageOneMap.setCollision(1, true, this.brickLayer.index, true);
        // Add Player to Game
        this.player = this.game.add.sprite(200, 300, "playerIdle");
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.gravity.y = 50;
        // this.player.body.collideWorldBounds = true;
        /*
                this.game.add.tween(this.game.camera).to({ x: 0 }, 3000).
        to({ x: this.stageOneMap.layers[0].widthInPixels }, 3000).loop().start();
        */
    }; // /create()
    IDemon.prototype.update = function () {
        // This is the autoscrolling behavior
        // this.game.camera.x += 1;
        this.game.physics.arcade.collide(this.player, this.brickLayer);
    };
    IDemon.prototype.render = function () {
        this.game.debug.cameraInfo(this.game.camera, 500, 32);
        this.game.debug.spriteInfo(this.player, 32, 32);
        this.game.debug.body(this.player);
    };
    return IDemon;
})(); // /class IDemon
// when the page has finished loading, create our game
window.onload = function () {
    var game = new IDemon();
};
//# sourceMappingURL=game.js.map