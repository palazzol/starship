
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

    // Initialize
    var clock = Date.now();
    var u = SR.GetUniverse();
    var objects = [];

    //for (i=-14; i<15; i++) {
    //    for (j=-14; j<14; j++) {
    for (i=-10; i<3; i++) {
        for (j=-3; j<6; j++) {
    //for (i=-2; i<3; i++) {
    //    for (j=-2; j<3; j++) {
            //if (i===0 && j==0) {}
            //else {
                var beacon = new Starship.Object2D(u, "beacon", [i*50,j*50,0], [0,0,0], 0, 1);
                beacon.SetColor('#808080');
                beacon.SetRadius(1);
                objects[objects.length] = beacon;
            //}
        }
    }

    var ship2   = new Starship.Object2D(u, "ship2",   [-200,50,0], [0,0,0], 0, 10);
    ship2.SetColor('#00ffff');
    ship2.SetRadius(5);
    objects[objects.length] = ship2;

    var ship3   = new Starship.Object2D(u, "ship3",   [-200,150,0], [0,0,0], 0, 10);
    ship3.SetColor('#ff0000');
    ship3.SetRadius(5);
    objects[objects.length] = ship3;

    var station = new Starship.Object2D(u, "station",[0,0,0], [0,0,0], 0, 100);
    station.SetColor('#ffff00');
    station.SetRadius(8);
    objects[objects.length] = station;

    // should be a ship!
    var ship = new Starship.Ship2D(u, "ship",   [-200,50,0], [0,0,0], 0, 10);
    console.log(ship);

    ship.SetColor('#008000');
    ship.SetRadius(20);
    objects[objects.length] = ship;

    u.SetObserver(ship);
    var speed = 50;

    var tau = 0;
    //var delta_tau = 1/24;

    var delta_turn = 15.0; //degrees

    var turn = 0.0;
    var thrust = 200.0;

    var keystate = [];

    this.doKeyDown = function(e) {
        //console.log("down "+e.keyCode);
        keystate[e.keyCode] = true;
    };

    this.doKeyUp = function(e) {
        //console.log("  up "+e.keyCode);
        keystate[e.keyCode] = false;
    };

    window.addEventListener("keydown", this.doKeyDown, false);
    window.addEventListener("keyup", this.doKeyUp, false);
    window.addEventListener('resize', this.resizeGame, false);
    window.addEventListener('orientationchange', this.resizeGame, false);

    var count = 1;

    var KEY = { SHIFT:16, CTRL:17, ESC:27, RIGHT:39, UP:38, LEFT:37, DOWN:40, SPACE:32,
            A:65, E:69, G:71, L:76, P:80, R:82, S:83, X:88, Z:90, DIGIT:48, BACKTICK:192 };

    this.lastRender = Date.now();

    // Main loop is here
    this.loop = function() {

        var now = Date.now();
        var elapsedTime = now-this.lastRender;
        this.lastRender = now;
        var delta_tau = elapsedTime/1000.0;

        if (keystate[KEY.Z] || keystate[KEY.LEFT]) {
            turn = +delta_turn;
            ship.Turn(turn);
        }
        if (keystate[KEY.X] || keystate[KEY.RIGHT]) {
            turn = -delta_turn;
            ship.Turn(turn);
        }
        if (keystate[KEY.SPACE] || keystate[KEY.UP]) {
            ship.Thrust(thrust);
            //if (delta_tau === 0.0)
            //    delta_tau = 1.0;
        } else {
            ship.Thrust(0.0);
        }

        for (var i=0; i<10; i++) {
            if (keystate[KEY.DIGIT+i]) {
                GoToPercentC(ship, 10.0*i);
            }
        }

        if (keystate[KEY.BACKTICK])
            GoToPercentC(ship, 99);

        // Run the engine
        if (delta_tau !== 0.0) {
            u.MoveToObserverClock(tau);
            tau += delta_tau;
        }

        // Draw Everything

        // Draw the background
        //ctx.fillStyle = "#000000";
        ///////ctx.clearRect(0,0,size[0],size[1]);

        for (var i=0; i<objects.length; i++) {
            var obj = objects[i];
            obj.Draw(stage, [300, 540]);
        }

        renderer.render(stage);

        // Schedule the loop to run again
        //window.setTimeout(this.loop, 1000/24.0);
        //window.setTimeout(this.loop, 0.0);
        requestAnimFrame(this.loop);
    }

    // Run the main loop for the first time
    requestAnimFrame(this.loop);

    //////////////////////////////////////////////
/*
	// create a texture from an image path
	var texture = PIXI.Texture.fromImage("pixi.js-master/examples/example 1 - Basics/bunny.png");

	// create a new Sprite using the texture
	var bunny = new PIXI.Sprite(texture);
	// create a reference frame
	var refframe = new PIXI.DisplayObjectContainer();

	// This will be the position of the bunny
	refframe.position.x = 300;
	refframe.position.y = 540;

	// This is the composite rotation for the whole object,
	// it is made of the desired rotation + the skew angle, clockwise from axis we are skewing
	refframe.rotation = 60*PIXI.DEG_TO_RAD;

	// Can apply a skew here - example is 60 degrees clockwise from y, (2 o'clock)
	refframe.scale.y = 10;
	refframe.scale.x = 1;

	// center the sprites anchor point
	bunny.anchor.x = 0.5;
	bunny.anchor.y = 0.5;

	// must be zero or we will get "orbit" rotation
	bunny.position.x = 0;
	bunny.position.y = 0;

	// this is the negative rotation of the skew
	bunny.rotation = -60*PIXI.DEG_TO_RAD;

	// you can still do a scale here wrt the sprite frame
	bunny.scale.x=1;
	bunny.scale.y=1;

	stage.addChild(refframe);
	refframe.addChild(bunny);

	function animate() {
		requestAnimFrame(animate);

		// just for fun, let's rotate mr rabbit a little
		refframe.rotation += 0.02;

		// render the stage
		renderer.render(stage);
	}
*/
}
