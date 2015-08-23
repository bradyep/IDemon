class IDemon
{
	game:Phaser.Game;
	stageOneMap: Phaser.Tilemap;
	
	constructor()
	{
		this.game = new Phaser.Game( 800, 600, Phaser.AUTO, 'content', { preload:this.preload, create:this.create, update:this.update} );
	}
	
	preload()
	{
        this.game.load.tilemap("stageOneMap", "assets/iDemonStage1.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("brickTiles", "assets/brickTile80.png");
		this.game.load.image("stairTiles", "assets/steps.png");
	}
	
	create()
	{
		this.game.stage.backgroundColor = 0x000000;
		
        this.stageOneMap = this.game.add.tilemap("stageOneMap", 80, 80, 70, 8);
        this.stageOneMap.addTilesetImage("bricks", "brickTiles");
		this.stageOneMap.addTilesetImage("stairs", "stairTiles");

        this.stageOneMap.createLayer("bricks").resizeWorld();
		
        this.game.camera.x = this.stageOneMap.layers[0].widthInPixels / 2;
        this.game.camera.y = 0;

        this.game.add.tween(this.game.camera).to({ x: 0 }, 3000).
to({ x: this.stageOneMap.layers[0].widthInPixels }, 3000).loop().start();
    }
	
	update()
	{
		
	}
}

// when the page has finished loading, create our game
window.onload = () => {
	var game = new IDemon();
}
