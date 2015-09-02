/// <reference path="../tsDefinitions/phaser.comments.d.ts" />

module IDemon {
 
    export class Preloader extends Phaser.State {
 
        preloadBar: Phaser.Sprite;
 
        preload() {
            //  Set-up our preloader sprite
            this.preloadBar = this.add.sprite(200, 250, 'preloadBar');
            this.load.setPreloadSprite(this.preloadBar);
 
            //  Load our actual games assets
            this.load.image('titleScreen', 'assets/titleScreen.png');
            this.load.image('logo', 'assets/logo.png');
            this.load.audio('music', 'assets/IDemonSong2.ogg', true);
			
			this.load.tilemap("stageOneMap", "assets/iDemonStage1.json", null, Phaser.Tilemap.TILED_JSON);
			this.load.image("brickTiles", "assets/brickTile80.png");
			this.load.image("stairTiles", "assets/steps.png");
			// Player character
			this.load.image("playerIdle", "assets/playerIdle.png");
			this.load.image("playerPunching", "assets/playerPunching.png");
			this.load.image("playerKicking", "assets/playerKick.png");
			this.load.image("playerCrouching", "assets/playerCrouching.png");
			this.load.image("fist", "assets/fist.png");
			this.load.image("boot", "assets/boot.png");
			// Misc
			this.load.image("cameraBarrier", "assets/cameraBarrier.png");
        }
 
        create() {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            if (IDemon.Game.DEBUG_MODE)
                this.game.state.start('Level1', true, false); 
            else {
                var tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
                tween.onComplete.add(this.startMainMenu, this);    
            }

        }
 
        startMainMenu() {
            this.game.state.start('MainMenu', true, false);
        }
 
    }
 
}
