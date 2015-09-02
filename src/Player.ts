/// <reference path="../tsDefinitions/phaser.comments.d.ts" />

module IDemon {
 
    export enum PlayerState { Standing, Crouching, Airborne, Dead };
 
    export class Player extends Phaser.Sprite {
 
        // game: Phaser.Game;  // Da Game
        playerState: PlayerState;
        playerFist: Phaser.Sprite;
        playerBoot: Phaser.Sprite;
        playerAttackSprites: Phaser.Group;
        // cursorKeys:Phaser.CursorKeys;
        keySpace:Phaser.Key; keyC:Phaser.Key; keyV:Phaser.Key;
        playerHasControl:boolean = true;
        // Constants
        PLAYER_WALK_SPEED:number = 200;
        PLAYER_CROUCH_WALK_SPEED:number = 70;
 
        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y, "playerIdle", 0);
            // Enable Player's Physics Body
            this.game.physics.arcade.enableBody(this);
            this.anchor.setTo(.5,.5);
            this.body.gravity.y = 350;
            this.playerState = PlayerState.Airborne;
            this.checkWorldBounds = true;
            this.events.onOutOfBounds.add(this.killPlayer, this);
            // this.game.camera.follow(this.player);
            game.add.existing(this);
            // this.game = game;
            
            // old create() code
            this.playerAttackSprites = this.game.add.group(this, "playerAttackSprites");
            this.playerAttackSprites.enableBody = true;
            
            // this.cursorKeys = this.game.input.keyboard.createCursorKeys();
            //  Create 3 hotkeys, C=Punch, V=Kick, Space=Jump
            this.keySpace = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.keySpace.onDown.add(this.jump, this);
            
            this.keyC = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
            this.keyC.onDown.add(this.playerPunch, this);
        
            this.keyV = this.game.input.keyboard.addKey(Phaser.Keyboard.V);
            this.keyV.onDown.add(this.playerKick, this);
            
            // Player limbs
            // this.playerFist = this.playerAttackSprites.create(-1000, -1000, "fist");
            this.playerFist = this.playerAttackSprites.create(this.width / 1.6, -(this.height / 4 + 5), "fist");
            this.playerFist.anchor.setTo(.5,.5);
            this.playerFist.kill();
            // this.playerBoot = this.playerAttackSprites.create(-1000, -1000, "boot");
            this.playerBoot = this.playerAttackSprites.create(this.width / 1.6, this.height / 4, "boot");
            this.playerBoot.anchor.setTo(.5,.5);
            this.playerBoot.kill();
        }
        
        create() {

        }
 
        update() {
            this.body.velocity.x = 0;
            
            if (this.playerState != PlayerState.Dead) {
                
                // Handle Inputs
                // if (this.cursorKeys.left.isDown && this.playerHasControl)
                if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && this.playerHasControl)
                {
                    this.body.velocity.x = this.playerState == PlayerState.Crouching ? -this.PLAYER_CROUCH_WALK_SPEED : -this.PLAYER_WALK_SPEED;
            
                    // this.player.animations.play('left');
                    if (this.scale.x == 1) {
                        this.scale.x = -1;
                    }
                    
                    // this.playerAttackSprites.setAll('scale.x', -1);
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && this.playerHasControl && !this.body.blocked.right)
                {
                    this.body.velocity.x = this.playerState == PlayerState.Crouching ? this.PLAYER_CROUCH_WALK_SPEED : this.PLAYER_WALK_SPEED;
            
                    if (this.scale.x == -1) {
                        this.scale.x = 1;
                        this.playerFist.scale.x = 1;
                    }
                    
                    // this.playerAttackSprites.setAll('scale.x', 1);
                }
                else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && this.playerHasControl) {
                    if (this.playerState == PlayerState.Standing) {
                        this.playerState = PlayerState.Crouching;
                        this.body.setSize(55, 80, 0, 30);
                        this.loadTexture("playerCrouching", 0, false);
                    }
                }
                else {
                    // No Keys Pressed
                    // If the player is crouching we can now stand them up
                    if (this.playerState == PlayerState.Crouching) {
                        this.goBackToIdle();
                    }
                }
                
                // If Airborne, check to see if they've reached the ground
                if (this.playerState == PlayerState.Airborne) {
                    if (this.body.blocked.down) {
                        this.goBackToIdle();
                    }
                }
                else {
                    if (!this.body.blocked.down) {
                        this.playerState = PlayerState.Airborne; 
                    }
                }
            } // /if (this.playerState != PlayerState.Dead)
        } // /update()
        
        // Public Player Methods
        
        public killPlayer():void {
			this.playerState = PlayerState.Dead;
			this.playerHasControl = false;
			this.scale.y = -1;
			this.body.velocity.y = -540;
			this.checkWorldBounds = false;
			this.game.time.events.add(Phaser.Timer.SECOND * 5, (() => { this.destroy() }), this);
        }
        
        public jump():void {
			if (this.playerState == PlayerState.Standing && this.playerHasControl) {
				this.body.velocity.y = -340;
				this.playerState = PlayerState.Airborne;
            }
          }
          
          public playerPunch():void {
			if (this.playerState == PlayerState.Standing && this.playerHasControl) {
				this.body.velocity.x = 0;
				this.playerHasControl = false;
                // TODO: Replace this with a spritesheet frame
				this.loadTexture("playerPunching", 0, false);
				this.game.time.events.add(400, this.goBackToIdle, this);
				// this.playerFist.x = this.x + (this.width / 1.6);
				// this.playerFist.y = this.y - this.height / 4 - 5;
				this.playerFist.revive();
			}
          }
          
          public playerKick() {
			if (this.playerState == PlayerState.Standing && this.playerHasControl) {
				this.body.velocity.x = 0;
				this.playerHasControl = false;
                // TODO: Replace this with a spritesheet frame
				this.loadTexture("playerKicking", 0, false);
				this.game.time.events.add(400, this.goBackToIdle, this);
				// this.playerBoot.x = this.x + (this.width / 1.6);
                // this.playerBoot.y = this.y + this.height / 4;
                this.playerBoot.revive();
			}
          }
          
          // Private Player Methods
          
          private goBackToIdle() {
            this.body.setSize(55, 140, 0, 0);
            this.loadTexture("playerIdle", 0, false);
            this.playerState = PlayerState.Standing;
			this.playerFist.kill();
			this.playerBoot.kill();
			this.playerHasControl = true;
          }
          
    } // /class Player
} // /module IDemon
