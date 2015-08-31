/// <reference path="Boot.ts" />
/// <reference path="Preloader.ts" />
/// <reference path="MainMenu.ts" />
/// <reference path="Level1.ts" />

module IDemon {
 
    export class Game extends Phaser.Game {
 
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
