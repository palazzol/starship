
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

    var observerFrame = new PIXI.DisplayObjectContainer();
    observerFrame.position.x = 300;
    observerFrame.position.y = 540;
    stage.addChild(observerFrame);

    // Initialize
    var clock = Date.now();
    var u = SR.GetUniverse();

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
            //}
        }
    }

    var ship2   = new Starship.Object2D(u, "target",   [-200,50,0], [0,0,0], 0, 10);
    ship2.SetColor('#00ffff');
    ship2.SetRadius(5);

    var ship3   = new Starship.Object2D(u, "ship3",   [-200,150,0], [0,0,0], 0, 10);
    ship3.SetColor('#ff0000');
    ship3.SetRadius(5);

    var station = new Starship.Object2D(u, "station",[0,0,0], [0,0,0], 0, 100);
    station.SetColor('#ffff00');
    station.SetRadius(8);

    var ship = new Starship.Ship2D(u, "ship",   [-200,50,0], [0,0,0], 0, 10);
    ship.SetColor('#008000');
    ship.SetRadius(20);

    u.SetObserver(ship);
    var speed = 50;

    var tau = 0;
    //var delta_tau = 1/24;

    var delta_turn = 15.0; //degrees

    var turn = 0.0;
    var thrust = 200.0;

	var headingControl = Starship.generateSprite("heading", 20, '#ff00ff');
	headingControl.position.x = 300;
	headingControl.position.y = 0;
	headingControl.anchor.x = 1.0;
	headingControl.anchor.y = 0.5;
	headingControl.rotation = 0;
	headingControl.buttonMode = true;
	headingControl.interactive = true;
    observerFrame.addChild(headingControl);

	var headingDown = false;

	headingControl.mousedown = headingControl.touchstart = function(data) {
		// stop the default event...
		data.originalEvent.preventDefault();

		// store a reference to the data
		// The reason for this is because of multitouch
		// we want to track the movement of this particular touch
		this.data = data;
		this.alpha = 0.9;
		this.dragging = true;
    };

	headingControl.mouseup = headingControl.touchend = headingControl.mouseupoutside = headingControl.touchendoutside = function(data) {
		this.alpha = 1
		this.dragging = false;
		// set the interaction data to null
		this.data = null;
	};

	// set the callbacks for when the mouse or a touch moves
	headingControl.mousemove = headingControl.touchmove = function(data)
	{
		if(this.dragging)
		{
			var newPosition = this.data.getLocalPosition(this.parent);
			var angle = Math.atan2(newPosition.y,newPosition.x);
            angle = Math.floor(angle/(delta_turn*Math.PI/180)+0.5)*(delta_turn*Math.PI/180);
			this.rotation = angle;
			var c = Math.cos(angle);
			var s = Math.sin(angle);
			if (Math.abs(c) >= Math.sqrt(2)/2) { // extends to xmin/xmax
				if (c > 0) { //xmax
					this.position.x = 300;
					this.position.y = s*300/c;
				} else {
					this.position.x = -300;
					this.position.y = -s*300/c;
				}
			} else {
				if (s > 0) {
					this.position.y = 300;
					this.position.x = c*300/s;
				} else {
					this.position.y = -300;
					this.position.x = -c*300/s;
				}
			}

			//this.position.x = Math.cos(angle)*300;
			//this.position.y = Math.sin(angle)*300;
			u.GetObserver().SetOrientation(Math.cos(angle), Math.sin(angle));
		}
	}

	var thrustButton = Starship.generateButton("button", 60, '#ffff00', "Thrust");

	thrustButton.position.x = 60;
	thrustButton.position.y = 1200-60;

	var thrustDown = false;

	thrustButton.mousedown = thrustButton.touchstart = function(data) {
		thrustDown = true;
    };

	thrustButton.mouseup = thrustButton.touchend = thrustButton.mouseupoutside = thrustButton.touchendoutside = function(data) {
		thrustDown = false;
	};

    stage.addChild(thrustButton);

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

    this.shiptimeTitle = new PIXI.Text("SHIP TIME:", { font: "24px Inconsolata", fill: "#ffff00", align: "left" });
    this.shiptimeTitle.position.x = 0
    this.shiptimeTitle.position.y = 0;
    stage.addChild(this.shiptimeTitle);

    //this.shiptime = new PIXI.Text("", { font: "bold italic 60px Arvo", fill: "#3e1707", align: "left", stroke: "#a4410e", strokeThickness: 7 });
    this.shiptime = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "right" });
    this.shiptime.position.x = 300
    this.shiptime.position.y = 0;
    stage.addChild(this.shiptime);

    this.targettimeTitle = new PIXI.Text("TARGET TIME:", { font: "24px Inconsolata", fill: "#ffff00", align: "left" });
    this.targettimeTitle.position.x = 0
    this.targettimeTitle.position.y = 60;
    stage.addChild(this.targettimeTitle);

    this.targettime = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "right" });
    this.targettime.position.x = 300
    this.targettime.position.y = 60;
    stage.addChild(this.targettime);

    this.deltatimeTitle = new PIXI.Text("DELTA TIME:", { font: "24px Inconsolata", fill: "#ffff00", align: "left" });
    this.deltatimeTitle.position.x = 0
    this.deltatimeTitle.position.y = 120;
    stage.addChild(this.deltatimeTitle);

    this.deltatime = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "right" });
	this.deltatime.position.x = 300;
	this.deltatime.position.y = 120;
	stage.addChild(this.deltatime);

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
        if (keystate[KEY.SPACE] || keystate[KEY.UP] || thrustDown) {
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

		var shiptime = 0;
        var targettime = 0;

		var objects = u.GetObjects();
        for (var i=0; i<objects.length; i++) {
            var obj = objects[i];
            obj.Draw(observerFrame);
            if (obj.name === "ship") {
            	shiptime = obj.GetClock();
            }
            else if (obj.name === "target")
                targettime = obj.GetClock();
        }

        var deltatime = targettime - shiptime;

        var t_int = Math.floor(shiptime);
        var t_frac = Math.floor(Math.abs(shiptime*10))%10;
        this.shiptime.setText(t_int+"."+t_frac+"s");
        this.shiptime.position.x = 300 - this.shiptime.width;

        var t_int = Math.floor(targettime);
        var t_frac = Math.floor(Math.abs(targettime*10))%10;
        this.targettime.setText(t_int+"."+t_frac+"s");
        this.targettime.position.x = 300 - this.targettime.width;

        var t_int = Math.floor(deltatime);
        var t_frac = Math.floor(Math.abs(deltatime*10))%10;
        this.deltatime.setText(t_int+"."+t_frac+"s");
        this.deltatime.position.x = 300 - this.deltatime.width;

        renderer.render(stage);

        // Schedule the loop to run again
        //window.setTimeout(this.loop, 1000/24.0);
        //window.setTimeout(this.loop, 0.0);
        requestAnimFrame(this.loop);
    }

    // Run the main loop for the first time
    requestAnimFrame(this.loop);
}
