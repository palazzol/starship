
function main() {

	var width =  600;
	var height = 1200;

	// create an new instance of a pixi stage
    //var stage = new PIXI.Stage(0x66FF99);
    var stage = new PIXI.Stage(0x000000);

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
		  newWidth = Math.floor(newHeight * widthToHeight);
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
	var frame = new PIXI.Sprite();

	// This will be the position of the bunny
	frame.position.x = 300;
	frame.position.y = 540;

	// This is the composite rotation for the whole object,
	// it is made of the desired rotation + the skew angle, clockwise from axis we are skewing
	frame.rotation = 60*3.14159/180;

	// Can apply a skew here - example is 60 degrees clockwise from y, (2 o'clock)
	frame.scale.y = 10;
	frame.scale.x = 1;

	// center the sprites anchor point
	bunny.anchor.x = 0.5;
	bunny.anchor.y = 0.5;

	// must be zero or we will get "orbit" rotation
	bunny.position.x = 0;
	bunny.position.y = 0;

	// this is the negative rotation of the skew
	bunny.rotation = -60*3.14159/180;

	// you can still do a scale here wrt the sprite frame
	bunny.scale.x=1;
	bunny.scale.y=1;

	stage.addChild(frame);
	frame.addChild(bunny);

	function animate() {
		requestAnimFrame(animate);

		// just for fun, let's rotate mr rabbit a little
		//frame.rotation += 0.02;

		// render the stage
		renderer.render(stage);
	}
}
