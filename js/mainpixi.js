function main() {
	var width =  720;
	var height = 1280;

	// create an new instance of a pixi stage
	var stage = new PIXI.Stage(0x66FF99);

	// create a renderer instance
	//var gameCanvas = document.getElementById('gameCanvas');
	//var options.view = gameCanvas;
	var renderer = PIXI.autoDetectRenderer(width,height);
	renderer.view.style.display = "block";

	this.resize = function(e) {
		var gameArea = document.getElementById('gameArea');
		var widthToHeight = renderer.width/renderer.height;
		var newWidth = window.innerWidth;
    	var newHeight = window.innerHeight;
    	var newWidthToHeight = newWidth/newHeight;
    	if (newWidthToHeight > widthToHeight) {
		  // window width is too wide relative to desired game width
		  newWidth = newHeight * widthToHeight;
		  gameArea.style.height = newHeight + 'px';
		  gameArea.style.width = newWidth + 'px';
		} else { // window height is too high relative to desired game height
		  newHeight = newWidth / widthToHeight;
		  gameArea.style.width = newWidth + 'px';
		  gameArea.style.height = newHeight + 'px';
		}
		gameArea.style.marginTop = (-newHeight / 2) + 'px';
		gameArea.style.marginLeft = (-newWidth / 2) + 'px';
		renderer.view.style.height = "100%";
		renderer.view.style.width = "100%";
		//renderer.resize(newWidth,newHeight);
	};

	this.resize();
	window.addEventListener('resize', this.resize, false);

	// add the renderer view element to the DOM
	var gameArea = document.getElementById('gameArea');
	gameArea.appendChild(renderer.view);

	requestAnimFrame(animate);

	// create a texture from an image path
	var texture = PIXI.Texture.fromImage("pixi.js-master/examples/example 1 - Basics/bunny.png");

	// create a new Sprite using the texture
	var bunny = new PIXI.Sprite(texture);

	// center the sprites anchor point
	bunny.anchor.x = 0.5;
	bunny.anchor.y = 0.5;

	// move the sprite to the center of the screen
	bunny.position.x = width/2;
	bunny.position.y = height/2;

	stage.addChild(bunny);

	function animate() {
		requestAnimFrame(animate);

		// just for fun, let's rotate mr rabbit a little
		bunny.rotation += 0.1;

		// render the stage
		renderer.render(stage);
	}
}
