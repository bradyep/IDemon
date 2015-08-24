// var game;	// This is only here for debugging. Change back for production
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Standing"] = 0] = "Standing";
    PlayerState[PlayerState["Crouching"] = 1] = "Crouching";
    PlayerState[PlayerState["Airborn"] = 2] = "Airborn";
})(PlayerState || (PlayerState = {}));
;
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
        this.game.load.image("playerPunching", "assets/playerPunching.png");
        this.game.load.image("playerKicking", "assets/playerKick.png");
        this.game.load.image("playerCrouching", "assets/playerCrouching.png");
        this.game.load.image("fist", "assets/fist.png");
        this.game.load.image("boot", "assets/boot.png");
        // Misc
        this.game.load.image("cameraBarrier", "assets/cameraBarrier.png");
    };
    IDemon.prototype.create = function () {
        var _this = this;
        // Create the functions that will be used throughout the game
        // I wish this could be done with class methods
        this.playerJump = function () {
            if (_this.playerState == PlayerState.Standing && IDemon.playerHasControl) {
                _this.player.body.velocity.y = -340;
                _this.playerState = PlayerState.Airborn;
            }
        };
        this.playerPunch = function () {
            if (_this.playerState == PlayerState.Standing && IDemon.playerHasControl) {
                _this.player.body.velocity.x = 0;
                IDemon.playerHasControl = false;
                _this.player.loadTexture("playerPunching", 0, false);
                _this.game.time.events.add(400, _this.goBackToIdle, _this);
                _this.playerFist.x = _this.player.x + (_this.player.width / 1.6);
                _this.playerFist.y = _this.player.y - _this.player.height / 4 - 5;
                _this.playerFist.revive();
            }
        };
        this.playerKick = function () {
            if (_this.playerState == PlayerState.Standing && IDemon.playerHasControl) {
                _this.player.body.velocity.x = 0;
                IDemon.playerHasControl = false;
                _this.player.loadTexture("playerKicking", 0, false);
                _this.game.time.events.add(400, _this.goBackToIdle, _this);
                _this.playerBoot.x = _this.player.x + (_this.player.width / 1.6);
                _this.playerBoot.y = _this.player.y + _this.player.height / 4;
                _this.playerBoot.revive();
            }
        };
        this.goBackToIdle = function () {
            _this.player.loadTexture("playerIdle", 0, false);
            _this.playerFist.kill();
            _this.playerBoot.kill();
            IDemon.playerHasControl = true;
        };
        this.checkCameraBarrierCollision = function () {
            if (_this.player.body.blocked.right) {
                alert('YOU DIED');
            }
        };
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
        this.cameraBarriers.create(0, 0, "cameraBarrier").fixedToCamera = true;
        this.cameraBarriers.create(790, 0, "cameraBarrier").fixedToCamera = true;
        this.cameraBarriers.setAll("body.immovable", true);
        // Add Player to Game
        this.player = this.game.add.sprite(200, 300, "playerIdle");
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.gravity.y = 350;
        this.player.anchor.setTo(.5, .5);
        this.playerState = PlayerState.Airborn;
        // this.player.body.collideWorldBounds = true;
        // Set up Groups
        this.playerAttackSprites = this.game.add.group();
        this.playerAttackSprites.enableBody = true;
        this.enemies = this.game.add.group();
        this.enemies.enableBody = true;
        // Player limbs
        this.playerFist = this.playerAttackSprites.create(-1000, -1000, "fist");
        this.playerFist.anchor.setTo(.5, .5);
        this.playerFist.kill();
        this.playerBoot = this.playerAttackSprites.create(-1000, -1000, "boot");
        this.playerBoot.anchor.setTo(.5, .5);
        this.playerBoot.kill();
        /*
                this.game.add.tween(this.game.camera).to({ x: 0 }, 3000).
        to({ x: this.stageOneMap.layers[0].widthInPixels }, 3000).loop().start();
        */
    }; // /create()
    IDemon.prototype.update = function () {
        // This is the autoscrolling behavior
        this.game.camera.x += IDemon.gameScrollSpeed;
        this.game.physics.arcade.collide(this.player, this.brickLayer);
        this.game.physics.arcade.collide(this.player, this.cameraBarriers, this.checkCameraBarrierCollision, null, this);
        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;
        // DEBUG: Seeing if moving the camera barriers makes them block
        // this.cameraBarriers.forEach((bar) => {bar.body.x += 1;}, this) 
        // If airborn, check to see if they've reached the ground
        if (this.playerState == PlayerState.Airborn) {
            if (this.player.body.blocked.down) {
                this.playerState = PlayerState.Standing;
            }
        }
        // Handle Inputs
        if (this.cursorKeys.left.isDown && IDemon.playerHasControl) {
            //  Move to the left
            // this.player.body.velocity.x = -IDemon.PLAYER_WALK_SPEED;
            this.player.body.velocity.x = this.playerState == PlayerState.Crouching ? -IDemon.PLAYER_CROUCH_WALK_SPEED : -IDemon.PLAYER_WALK_SPEED;
            // this.player.animations.play('left');
            this.player.scale.x = -1;
            this.playerAttackSprites.setAll('scale.x', -1);
        }
        else if (this.cursorKeys.right.isDown && IDemon.playerHasControl) {
            //  Move to the right
            // this.player.body.velocity.x = IDemon.PLAYER_WALK_SPEED;
            this.player.body.velocity.x = this.playerState == PlayerState.Crouching ? IDemon.PLAYER_CROUCH_WALK_SPEED : IDemon.PLAYER_WALK_SPEED;
            // this.player.animations.play('right');
            this.player.scale.x = 1;
            this.playerFist.scale.x = 1;
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
    };
    IDemon.prototype.render = function () {
        this.game.debug.cameraInfo(this.game.camera, 500, 32);
        this.game.debug.spriteInfo(this.player, 32, 32);
        this.game.debug.body(this.player);
        // this.game.debug.body(this.playerFist);
        // this.game.debug.text('Fist X: ' + this.playerFist.x + ', Fist Y: ' + this.playerFist.y, 10, 120);
        this.game.debug.text('playerState: ' + PlayerState[this.playerState], 10, 120);
    };
    // Static
    IDemon.playerHasControl = true;
    IDemon.gameScrollSpeed = 2;
    // Constants
    IDemon.PLAYER_WALK_SPEED = 200;
    IDemon.PLAYER_CROUCH_WALK_SPEED = 70;
    return IDemon;
})(); // /class IDemon
// when the page has finished loading, create our game
window.onload = function () {
    // game = new IDemon();
    var game = new IDemon();
};
//# sourceMappingURL=game.js.map