// var game;	// This is only here for debugging. Change back for production
enum PlayerState { Standing, Crouching, Airborn, Dead };

class IDemon {
	// Game Objects
	game:Phaser.Game;
	stageOneMap: Phaser.Tilemap;
	player: Phaser.Sprite;
	// playerHalo: Phaser.Sprite;
	playerFist: Phaser.Sprite;
	playerBoot: Phaser.Sprite;
	brickLayer: Phaser.TilemapLayer;
	playerState: PlayerState;
	cameraBarrier: Phaser.Sprite;
	// Groups
	playerAttackSprites: Phaser.Group;
	enemies: Phaser.Group;
	cameraBarriers: Phaser.Group;
	// Controls
	cursorKeys:Phaser.CursorKeys;
	keySpace:Phaser.Key; keyC:Phaser.Key; keyV:Phaser.Key;
	// Game Methods
	playerJump:Function;
	playerPunch:Function;
	playerKick:Function;
	goBackToIdle:Function;
	checkCameraBarrierCollision:Function;
	killPlayer:Function;
	checkTilemapCollision:Function;
	// Static
	static playerHasControl = true;
	static gameScrollSpeed: number = 2;
	// Constants
	static PLAYER_WALK_SPEED:number = 200;
	static PLAYER_CROUCH_WALK_SPEED:number = 70;
	// Debugging
	collBetweenBrickAndPlayer: boolean;
	collBetweenBrickAndPlayerHalo: boolean;
	floor:Phaser.Rectangle;
	floorYmax: number = 0;
	
	constructor() {
		this.game = new Phaser.Game( 800, 600, Phaser.AUTO, 'content', { preload:this.preload, create:this.create, update:this.update, render:this.render} );
	}
	
	preload() {
		// Tilemap
        this.game.load.tilemap("stageOneMap", "assets/iDemonStage1.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("brickTiles", "assets/brickTile80.png");
		this.game.load.image("stairTiles", "assets/steps.png");
		// Player character
		this.game.load.image("playerIdle", "assets/playerIdle.png");
		this.game.load.image("playerPunching", "assets/playerPunching.png");
		this.game.load.image("playerKicking", "assets/playerKick.png");
		this.game.load.image("playerCrouching", "assets/playerCrouching.png");
		this.game.load.image("fist", "assets/fist.png");
		this.game.load.image("boot", "assets/boot.png");
		// Misc
		this.game.load.image("cameraBarrier", "assets/cameraBarrier.png");
	}
	
	create() {
		// DEBUGGING
		this.floor = new Phaser.Rectangle(0, 550, 800, 50);
		// Create the functions that will be used throughout the game
		// I wish this could be done with class methods
		this.killPlayer = ():void => {
			this.playerState = PlayerState.Dead;
			IDemon.playerHasControl = false;
			this.player.scale.y = -1;
			this.player.body.velocity.y = -540;
			this.player.checkWorldBounds = false;
			this.game.time.events.add(Phaser.Timer.SECOND * 5, (() => { this.player.destroy() }), this);
		}
		this.playerJump = ():void => {
			if (this.playerState == PlayerState.Standing && IDemon.playerHasControl) {
				this.player.body.velocity.y = -340;
				this.playerState = PlayerState.Airborn; 
			}
		}
		this.playerPunch = ():void => {
			if (this.playerState == PlayerState.Standing && IDemon.playerHasControl) {
				this.player.body.velocity.x = 0;
				IDemon.playerHasControl = false;
				this.player.loadTexture("playerPunching", 0, false);
				this.game.time.events.add(400, this.goBackToIdle, this);
				this.playerFist.x = this.player.x + (this.player.width / 1.6);
				this.playerFist.y = this.player.y - this.player.height / 4 - 5;
				this.playerFist.revive();
			}
		}
		this.playerKick = ():void => {
			if (this.playerState == PlayerState.Standing && IDemon.playerHasControl) {
				this.player.body.velocity.x = 0;
				IDemon.playerHasControl = false;
				this.player.loadTexture("playerKicking", 0, false);
				this.game.time.events.add(400, this.goBackToIdle, this);
				this.playerBoot.x = this.player.x + (this.player.width / 1.6);
				this.playerBoot.y = this.player.y + this.player.height / 4;
				this.playerBoot.revive();
			}	
		}
		this.goBackToIdle = ():void => { 
			this.player.loadTexture("playerIdle", 0, false);
			this.playerFist.kill();
			this.playerBoot.kill();
			IDemon.playerHasControl = true;
			}
		
		/*
		this.checkTilemapCollision = (player:Phaser.Sprite, tileMapLayer:Phaser.TilemapLayer):void => {
			
		}
		*/
		
		this.checkCameraBarrierCollision = ():void => {
			/*
			if (this.player.body.blocked.right) {
				// Played got squished and died
				this.killPlayer();
			}
			*/
			
			var tilesTouching:Phaser.Tile[] = this.brickLayer.getTiles(this.player.x + Math.abs(this.player.width / 2), this.player.y, 3, 3, true); 
			
			// if (this.game.physics.arcade.overlap(this.playerHalo, this.brickLayer))
			if (tilesTouching.length > 0)
			{
				this.killPlayer();
			}
			else {
				// Give the player a chance to get off the left barrier
				if (this.cursorKeys.right.isDown && IDemon.playerHasControl) {
					this.player.body.velocity.x = this.playerState == PlayerState.Crouching ? IDemon.PLAYER_CROUCH_WALK_SPEED : IDemon.PLAYER_WALK_SPEED;
				}
			}
		}
		
		//  enable the Arcade Physics system
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.stage.backgroundColor = 0x000000;
		
        this.stageOneMap = this.game.add.tilemap("stageOneMap", 80, 80, 70, 8);
        this.stageOneMap.addTilesetImage("bricks", "brickTiles");
		this.stageOneMap.addTilesetImage("stairs", "stairTiles");

        this.brickLayer = this.stageOneMap.createLayer("bricks");
		this.brickLayer.resizeWorld();
		
		//  Setup Controls
		this.cursorKeys = this.game.input.keyboard.createCursorKeys();
		
		//  Create 3 hotkeys, C=Punch, V=Kick, Space=Jump
		this.keySpace = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.keySpace.onDown.add(this.playerJump, this);
	
		this.keyC = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
		this.keyC.onDown.add(this.playerPunch, this);
	
		this.keyV = this.game.input.keyboard.addKey(Phaser.Keyboard.V);
		this.keyV.onDown.add(this.playerKick, this);
		
		// Setup Camera
        // this.game.camera.x = this.stageOneMap.layers[0].widthInPixels / 2;
		this.game.camera.x = 0;
        this.game.camera.y = 0;
		
		// Setup the bricks for collisions
		this.stageOneMap.setCollision(1, true, this.brickLayer.index, true);
		
		// Add Camera Barriers
		this.cameraBarriers = this.game.add.group();
		this.cameraBarriers.enableBody = true;
		// this.cameraBarriers.create(0, 0, "cameraBarrier").fixedToCamera = true;
		this.cameraBarriers.create(0, 0, "cameraBarrier");
		// this.cameraBarriers.create(790, 0, "cameraBarrier").fixedToCamera = true;
		this.cameraBarriers.create(790, 0, "cameraBarrier");
		this.cameraBarriers.setAll("body.immovable", true);
		
		// Add Player to Game
		this.player = this.game.add.sprite(200, 300, "playerIdle");
		this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		this.player.body.gravity.y = 350;
		this.player.anchor.setTo(.5,.5);
		this.playerState = PlayerState.Airborn;
		this.player.checkWorldBounds = true;
		this.player.events.onOutOfBounds.add(this.killPlayer, this);
		// this.game.camera.follow(this.player);
		// this.player.body.collideWorldBounds = true;
		// Create player halo for squish checks
		
		/*
        this.playerHalo = this.game.add.sprite(0, 0);
        this.playerHalo.anchor.setTo(0.5, 0.5);
        this.player.addChild(this.playerHalo);
        this.game.physics.enable(this.playerHalo, Phaser.Physics.ARCADE);
        this.playerHalo.body.setSize(5, this.player.height, this.player.width, 0);
		*/
		
		// Set up Groups
		this.playerAttackSprites = this.game.add.group();
		this.playerAttackSprites.enableBody = true;
		this.enemies = this.game.add.group();
		this.enemies.enableBody = true;
		
		// Player limbs
		this.playerFist = this.playerAttackSprites.create(-1000, -1000, "fist");
		this.playerFist.anchor.setTo(.5,.5);
		this.playerFist.kill();
		this.playerBoot = this.playerAttackSprites.create(-1000, -1000, "boot");
		this.playerBoot.anchor.setTo(.5,.5);
		this.playerBoot.kill();

/*
        this.game.add.tween(this.game.camera).to({ x: 0 }, 3000).
to({ x: this.stageOneMap.layers[0].widthInPixels }, 3000).loop().start();
*/
    } // /create()
	
	update() {		
		//  Reset the players velocity (movement)
		if (this.playerState != PlayerState.Dead) {
			// DEBUGGING
			this.floor.x = this.player.x + Math.abs(this.player.width / 2)
			this.floor.y =  this.player.y;
			this.floor.height = 3;
			this.floor.width = 3;
			this.player.body.velocity.x = 0;
			
			// Moving the camera barriers
			this.cameraBarriers.forEach((bar) => {bar.body.x += IDemon.gameScrollSpeed;}, this)
			// this.player.body.moves = true; // Nope 
			
			// Handle Inputs
			if (this.cursorKeys.left.isDown && IDemon.playerHasControl)
			{
				//  Move to the left
				// this.player.body.velocity.x = -IDemon.PLAYER_WALK_SPEED;
				this.player.body.velocity.x = this.playerState == PlayerState.Crouching ? -IDemon.PLAYER_CROUCH_WALK_SPEED : -IDemon.PLAYER_WALK_SPEED;
		
				// this.player.animations.play('left');
                if (this.player.scale.x == 1) {
                    this.player.scale.x = -1;
                }
				
				this.playerAttackSprites.setAll('scale.x', -1);
			}
			else if (this.cursorKeys.right.isDown && IDemon.playerHasControl && !this.player.body.blocked.right)
			{
				//  Move to the right
				// this.player.body.velocity.x = IDemon.PLAYER_WALK_SPEED;
				this.player.body.velocity.x = this.playerState == PlayerState.Crouching ? IDemon.PLAYER_CROUCH_WALK_SPEED : IDemon.PLAYER_WALK_SPEED;
		
				// this.player.animations.play('right');
				
                if (this.player.scale.x == -1) {
                    this.player.scale.x = 1;
					this.playerFist.scale.x = 1;
                }
				
				this.playerAttackSprites.setAll('scale.x', 1);
			}
			else if (this.cursorKeys.down.isDown && IDemon.playerHasControl) {
				if (this.playerState == PlayerState.Standing) {
					this.playerState = PlayerState.Crouching;
					this.player.body.setSize(55, 80, 0, 30);
					this.player.loadTexture("playerCrouching", 0, false);
				}
			}
			else {
				// No Keys Pressed
				// If the player is crouching we can now stand them up
				if (this.playerState == PlayerState.Crouching) {
					this.player.body.setSize(55, 140, 0, 0);
					this.player.loadTexture("playerIdle", 0, false);
					this.playerState = PlayerState.Standing;
				}
			}
			// This is the autoscrolling behavior
			this.game.camera.x += IDemon.gameScrollSpeed;
			this.collBetweenBrickAndPlayer = this.game.physics.arcade.collide(this.player, this.brickLayer);
			this.game.physics.arcade.collide(this.player, this.cameraBarriers, this.checkCameraBarrierCollision, null, this);
			
			/*this.collBetweenBrickAndPlayerHalo = this.game.physics.arcade.overlap(this.playerHalo, this.brickLayer);*/
			
			// If airborn, check to see if they've reached the ground
			if (this.playerState == PlayerState.Airborn) {
				if (this.player.body.blocked.down) {
					this.playerState = PlayerState.Standing; 
				}
			}
		}
	} // /update
	
	render() {
		// this.game.debug.cameraInfo(this.game.camera, 500, 32);
		this.game.debug.spriteInfo(this.player, 32, 32);
		// this.game.debug.body(this.player);
		// this.game.debug.body(this.playerHalo);
		// this.game.debug.body(this.brickLayer);
		// this.game.debug.body(this.playerFist);
		// this.game.debug.text('Fist X: ' + this.playerFist.x + ', Fist Y: ' + this.playerFist.y, 10, 120);
		this.game.debug.text('playerState: ' + PlayerState[this.playerState], 10, 120);
		// this.game.debug.text('Blocked Right: ' + this.player.body.blocked.right, 290, 120);
		this.game.debug.text('PlayerBrickColl: ' + this.collBetweenBrickAndPlayer, 240, 120);
		// this.game.debug.text('Blocked Bottom: ' + this.player.body.blocked.down, 490, 120);
		// this.game.debug.text('Halo Overlaps BrickLayer: ' + this.game.physics.arcade.overlap(this.playerHalo, this.brickLayer), 490, 120);
		this.game.debug.text('PlayerX / Player.width/2: ' + this.player.x + '/' + this.player.width / 2, 350, 120);
		// this.game.debug.text('Touching Right: ' + this.player.body.touching.right, 10, 170);
		/*this.game.debug.text('Halo Blocked Right: ' + this.playerHalo.body.blocked.right, 10, 170);*/
		this.game.debug.geom(this.floor,'#0fffff');
	}
} // /class IDemon

// when the page has finished loading, create our game
window.onload = () => {
	// game = new IDemon();
	var game = new IDemon();
}
