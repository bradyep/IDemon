/// <reference path="../tsDefinitions/phaser.comments.d.ts" />
/// <reference path="Player.ts" />

module IDemon {
    export class Level1 extends Phaser.State {
 
        music: Phaser.Sound;
        
        player: IDemon.Player;
        stageOneMap: Phaser.Tilemap;
        brickLayer: Phaser.TilemapLayer;
        cameraBarriers: Phaser.Group;
        cameraBarrier: Phaser.Sprite;
        enemies: Phaser.Group;
        // checkCameraBarrierCollision:Function;
        checkTilemapCollision:Function;
        gameScrollSpeed: number = 2;
        collBetweenBrickAndPlayer: boolean;
        floor:Phaser.Rectangle;
        floorYmax: number = 0;
 
        create() {
            if (IDemon.Game.MUSIC_ON) {
                this.music = this.add.audio('music', 1, false);
                this.music.play();
            }
 
            // DEBUGGING
            this.floor = new Phaser.Rectangle(0, 550, 800, 50);
            
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
            
            // Add Camera Barriers
            this.cameraBarriers = this.game.add.group();
            this.cameraBarriers.enableBody = true;
            // this.cameraBarriers.create(0, 0, "cameraBarrier").fixedToCamera = true;
            this.cameraBarriers.create(0, 0, "cameraBarrier");
            // this.cameraBarriers.create(790, 0, "cameraBarrier").fixedToCamera = true;
            this.cameraBarriers.create(790, 0, "cameraBarrier");
            this.cameraBarriers.setAll("body.immovable", true);
            
            // Add Player to Game
            this.player = new Player(this.game, 200, 300);
            
            // TO DO: Enable Later!
            // this.enemies = this.game.add.group();
            // this.enemies.enableBody = true;
        }
        
        update () {
			// DEBUGGING
			this.floor.x = this.player.x + Math.abs(this.player.width / 2)
			this.floor.y =  this.player.y;
			this.floor.height = 3;
			this.floor.width = 3;
            
            if (this.player.playerState != PlayerState.Dead) {
                // Moving the camera barriers
                if (this.game.camera.view.x < this.game.world.width - this.stage.width) {
                    this.cameraBarriers.forEach((bar) => {bar.body.x += this.gameScrollSpeed;}, this)
                }
                // this.player.body.moves = true; // Nope
                // This is the autoscrolling behavior
                this.game.camera.x += this.gameScrollSpeed;
                this.collBetweenBrickAndPlayer = this.game.physics.arcade.collide(this.player, this.brickLayer);
                this.game.physics.arcade.collide(this.player, this.cameraBarriers, this.checkCameraBarrierCollision, null, this);
            }
            
        }
        
        checkCameraBarrierCollision() {
			/*
			if (this.player.body.blocked.right) {
				// Played got squished and died
				this.killPlayer();
			}
			*/
			
			var tilesTouching:Phaser.Tile[] = this.brickLayer.getTiles(this.player.x + Math.abs(this.player.width / 2), this.player.y, 3, 3, true); 
			
			if (tilesTouching.length > 0)
			{
				this.player.killPlayer();
			}
			else {
				// Give the player a chance to get off the left barrier
				if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && this.player.playerHasControl) {
					this.player.body.velocity.x = this.player.playerState == PlayerState.Crouching ? this.player.PLAYER_CROUCH_WALK_SPEED : this.player.PLAYER_WALK_SPEED;
				}
			}
        } // /checkCameraBarrierCollision()
        
        render() {
            this.game.debug.cameraInfo(this.game.camera, 500, 32);
            if (this.player.playerState != PlayerState.Dead) {
                this.game.debug.spriteInfo(this.player, 32, 32);
            }
            // this.game.debug.spriteInfo(this.player.playerFist, 500, 32);
            // this.game.debug.spriteInfo(this.player.playerBoot, 500, 132);
            // this.game.debug.body(this.player);
            // this.game.debug.body(this.playerHalo);
            // this.game.debug.body(this.brickLayer);
            // this.game.debug.body(this.playerFist);
            // this.game.debug.text('Fist X: ' + this.playerFist.x + ', Fist Y: ' + this.playerFist.y, 10, 120);
            this.game.debug.text('playerState: ' + PlayerState[this.player.playerState], 10, 120);
            // this.game.debug.text('Blocked Right: ' + this.player.body.blocked.right, 290, 120);
            this.game.debug.text('PlayerBrickColl: ' + this.collBetweenBrickAndPlayer, 240, 120);
            // this.game.debug.text('Blocked Bottom: ' + this.player.body.blocked.down, 490, 120);
            // this.game.debug.text('Halo Overlaps BrickLayer: ' + this.game.physics.arcade.overlap(this.playerHalo, this.brickLayer), 490, 120);
            // this.game.debug.text('PlayerX / Player.width/2: ' + this.player.x + '/' + this.player.width / 2, 350, 120);
            // this.game.debug.text('Touching Right: ' + this.player.body.touching.right, 10, 170);
            /*this.game.debug.text('Halo Blocked Right: ' + this.playerHalo.body.blocked.right, 10, 170);*/
            this.game.debug.geom(this.floor,'#0fffff');
        }
        
    } // /class Level1
} // /module IDemon 
