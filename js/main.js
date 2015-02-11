function main() {
    var size = [640, 480];
    var center = [size[0]/2, size[1]/2];

    var clock = Date.now();
    var u = SR.GetUniverse();
    var objects = [];

    //for (i=-14; i<15; i++) {
    //    for (j=-14; j<14; j++) {
    for (i=-10; i<3; i++) {
        for (j=-3; j<6; j++) {
    //for (i=-2; i<3; i++) {
    //    for (j=-2; j<3; j++) {
            if (i===0 && j==0) {}
            else {
                var beacon = new Starship.Object2D(u, "beacon", [i*50,j*50,0], [0,0,0], 0, 1);
                beacon.SetColor('#808080');
                beacon.SetRadius(1);
                objects[objects.length] = beacon;
            }
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
    station.SetRadius(10);
    objects[objects.length] = station;

    var ship    = new Starship.Ship2D(u, "ship",   [-200,50,0], [0,0,0], 0, 10);
    console.log(ship);

    ship.SetColor('#00ff00');
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

	this.resizeGame = function(e) {
		var newWidth = window.innerWidth-8;
    	var newHeight = window.innerHeight-8;
    	var gameArea = document.getElementById('gameArea');
    	var gameCanvas = document.getElementById('gameCanvas');
		gameArea.style.height = newHeight+'px';
		gameArea.style.width = newWidth+'px';
		gameArea.style.marginTop = (-newHeight / 2) + 'px';
		gameArea.style.marginLeft = (-newWidth / 2) + 'px';
		gameCanvas.width = newWidth;
    	gameCanvas.height = newHeight;
    	size = [newWidth, newHeight];
    	center = [size[0]/2, size[1]/2];
	};

    window.addEventListener("keydown", this.doKeyDown, false);
    window.addEventListener("keyup", this.doKeyUp, false);
	window.addEventListener('resize', this.resizeGame, false);
	window.addEventListener('orientationchange', this.resizeGame, false);

    var count = 1;

    var KEY = { SHIFT:16, CTRL:17, ESC:27, RIGHT:39, UP:38, LEFT:37, DOWN:40, SPACE:32,
            A:65, E:69, G:71, L:76, P:80, R:82, S:83, X:88, Z:90, DIGIT:48, BACKTICK:192 };

    // Retrieve the graphic context
    var c = document.getElementById("gameCanvas");
    this.ctx = c.getContext("2d");

    this.lastRender = Date.now();

    this.resizeGame();

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
        ctx.clearRect(0,0,size[0],size[1]);

        for (var i=0; i<objects.length; i++) {
            var obj = objects[i];
            obj.Draw(ctx, center);
        }

        // Schedule the loop to run again
        //window.setTimeout(this.loop, 1000/24.0);
        //window.setTimeout(this.loop, 0.0);
        requestAnimationFrame(this.loop);
    }

    // Run the main loop for the first time
    this.loop();
}

main();




