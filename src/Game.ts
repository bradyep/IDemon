/// <reference path="Boot.ts" />
/// <reference path="Preloader.ts" />
/// <reference path="MainMenu.ts" />
/// <reference path="Level1.ts" />

module IDemon {
 
    export class Game extends Phaser.Game {
        
        // Game-wide Constants. Not sure this is the best way to do them -bep 2015 9 1
        public static get DEBUG_MODE():boolean { return true; }
        public static get MUSIC_ON():boolean { return false; }
        public static get SFX_ON():boolean { return true; }
 
        constructor() {
 
            super(800, 600, Phaser.AUTO, 'content', null);
 
            this.state.add('Boot', Boot, false);
            this.state.add('Preloader', Preloader, false);
            this.state.add('MainMenu', MainMenu, false);
            this.state.add('Level1', Level1, false);
 
            // this.state.start('Boot');
            this.state.start('Preloader');
        }
    }
}

// when the page has finished loading, create our game
window.onload = () => {
	// game = new IDemon();
	var game = new IDemon.Game();
}
