
function main() {

	var width =  900;
	var height = 1300;

	// create an new instance of a pixi stage
    var stage = new PIXI.Stage(0x000000);

	// create a renderer instance
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
    // center of the main display screen
    observerFrame.position.x = 450;
    observerFrame.position.y = 540;
    stage.addChild(observerFrame);

    // Initialize
    var clock = Date.now();
    var u = SR.GetUniverse();

    for (i=-10; i<3; i++) {
        for (j=-5; j<8; j++) {
            var beacon = new Starship.Object2D(u, "beacon", [i*50,j*50,0], [0,0,0], 0, 1);
            beacon.SetColor('#808080');
            beacon.SetRadius(1);
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
	headingControl.position.x = 450;
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

    headingControl.updateHeading = function(c,s) {
        // Rotate the sprite
        this.rotation = Math.atan2(s,c);

        var r = 450;

        /*
        // Move it to extents on a square
        if (Math.abs(c) >= Math.sqrt(2)/2) { // extends to xmin/xmax
            if (c > 0) { //xmax
                this.position.x = r;
                this.position.y = s*r/c;
            } else {
                this.position.x = -r;
                this.position.y = -s*r/c;
            }
        } else { // ymin/ymax
            if (s > 0) {
                this.position.y = r;
                this.position.x = c*r/s;
            } else {
                this.position.y = -r;
                this.position.x = -c*r/s;
            }
        }
        */

        // if we wanted a circle instead
        this.position.x = c*450;
        this.position.y = s*450;
    }

	// set the callbacks for when the mouse or a touch moves
	headingControl.mousemove = headingControl.touchmove = function(data)
	{
		if(this.dragging)
		{
			var newPosition = this.data.getLocalPosition(this.parent);
			var angle = Math.atan2(newPosition.y,newPosition.x);
            angle = Math.floor(angle/(delta_turn*Math.PI/180)+0.5)*(delta_turn*Math.PI/180);
			var c = Math.cos(angle);
			var s = Math.sin(angle);

            this.updateHeading(c,s);

			u.GetObserver().SetOrientation(Math.cos(angle), Math.sin(angle));
		}
	}

	var thrustButton = Starship.generateButton("button", 60, '#ffff00', "Thrust");

	thrustButton.position.x = 50;
	thrustButton.position.y = 1300-50;

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

    this.shiptime = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "right" });
    this.shiptime.position.x = 450
    this.shiptime.position.y = 0;
    stage.addChild(this.shiptime);

    this.targettimeTitle = new PIXI.Text("TARGET TIME:", { font: "24px Inconsolata", fill: "#ffff00", align: "left" });
    this.targettimeTitle.position.x = 0
    this.targettimeTitle.position.y = 25;
    stage.addChild(this.targettimeTitle);

    this.targettime = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "right" });
    this.targettime.position.x = 450
    this.targettime.position.y = 25;
    stage.addChild(this.targettime);

    this.deltatimeTitle = new PIXI.Text("DELTA TIME:", { font: "24px Inconsolata", fill: "#ffff00", align: "left" });
    this.deltatimeTitle.position.x = 0
    this.deltatimeTitle.position.y = 50;
    stage.addChild(this.deltatimeTitle);

    this.deltatime = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "right" });
	this.deltatime.position.x = 450;
	this.deltatime.position.y = 50;
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
            var orient3 = u.GetObserver().GetOrientation();
            headingControl.updateHeading(orient3[0],orient3[1]);
        }
        if (keystate[KEY.X] || keystate[KEY.RIGHT]) {
            turn = -delta_turn;
            ship.Turn(turn);
            var orient3 = u.GetObserver().GetOrientation();
            headingControl.updateHeading(orient3[0],orient3[1]);
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

        // Update Everything

		var shiptime = 0;
        var targettime = 0;

		var objects = u.GetObjects();
        for (var i=0; i<objects.length; i++) {
            var obj = objects[i];
            obj.Update(observerFrame);
            if (obj.name === "ship") {
            	shiptime = obj.GetClock();
            }
            else if (obj.name === "target")
                targettime = obj.GetClock();
        }

        var deltatime = targettime - shiptime;

        this.formatTime = function(t) {
            var temp = ""+Math.round(t*10);
            var temp2 = temp.slice(0,-1);
            if (temp2 === "") temp2 = "0";
            else if (temp2 === "-") temp2 = "-0";
            return temp2+"."+temp.slice(-1)+"s";
        }

        this.shiptime.setText(this.formatTime(shiptime));
        this.shiptime.position.x = 450 - this.shiptime.width;

        this.targettime.setText(this.formatTime(targettime));
        this.targettime.position.x = 450 - this.targettime.width;

        this.deltatime.setText(this.formatTime(deltatime));
        this.deltatime.position.x = 450 - this.deltatime.width;

        renderer.render(stage);

        // Schedule the loop to run again
        //window.setTimeout(this.loop, 1000/24.0);
        //window.setTimeout(this.loop, 0.0);
        requestAnimFrame(this.loop);
    }

    // Run the main loop for the first time
    requestAnimFrame(this.loop);
}
