"use strict";

function main() {

	var width =  720;
	var height = 1080;

	// enable scrolling?
	PIXI.AUTO_PREVENT_DEFAULT = false;

	// create an new instance of a pixi stage
    var stage = new PIXI.Stage(0x000000);

	// create a renderer instance
	var renderer = PIXI.autoDetectRenderer(width,height);
	renderer.view.style.display = "block";
	renderer.view.style.height = "100%";
	renderer.view.style.width = "100%";

	var resize = function(e) {
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
		  gameArea.style.marginTop = 0 + 'px';
		  gameArea.style.marginLeft = Math.floor((window.innerWidth-newWidth)/2) + 'px';
		} else { // window height is too high relative to desired game height
		  newHeight = Math.floor(newWidth / widthToHeight);
		  gameArea.style.width = newWidth + 'px';
		  gameArea.style.height = newHeight + 'px';
		  gameArea.style.marginTop = Math.floor((window.innerHeight-newHeight)/2) + 'px';
		  gameArea.style.marginLeft = 0 + 'px';
		}
		//gameArea.style.marginTop = 0 + 'px';
		//gameArea.style.marginLeft = 0 + 'px';
		//renderer.view.style.height = "100%";
		//renderer.view.style.width = "100%";
		//renderer.resize(newWidth,newHeight);
	};

	resize();
	window.addEventListener('resize', resize, false);
    window.addEventListener('orientationchange', resize, false);

	// add the renderer view element to the DOM
	var gameArea = document.getElementById('gameArea');
	gameArea.appendChild(renderer.view);

    var backgroundTexture = new PIXI.Texture.fromImage("resources\\brushed_metal.png");
    var background = new PIXI.Sprite(backgroundTexture);
    background.position.x = 0;
    background.position.y = 0;
    stage.addChild(background);

    var observerFrame = new PIXI.DisplayObjectContainer();
    // center of the main display screen
    observerFrame.position.x = 360;
    observerFrame.position.y = 540;
    stage.addChild(observerFrame);

    // Initialize
    var clock = Date.now();
    var u = new SR.Universe();

    for (var i=-10; i<3; i++) {
        for (var j=-5; j<8; j++) {
            var beacon = new Starship.Object2D(u, "beacon", [i*50,j*50,0], [0,0,0], 0, 1);
            beacon.SetColor('#808080');
            beacon.SetRadius(1);
        }
    }

    var ship2   = new Starship.Object2D(u, "ship2",   [-200,50,0], [0,0,0], 0, 10);
    ship2.SetColor('#00ffff');
    ship2.SetRadius(5);

    var ship3   = new Starship.Object2D(u, "ship3",   [-200,150,0], [0,0,0], 0, 10);
    ship3.SetColor('#ff0000');
    ship3.SetRadius(5);

    var station = new Starship.Object2D(u, "station",[0,-150,0], [0,0,0], 0, 100);
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
	headingControl.position.x = 360;
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

        var r = 360;

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
        this.position.x = c*r;
        this.position.y = s*r;
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

	var thrustButtonStuff = Starship.generateButton("button", 60, '#ffff00', "Thrust");
    var thrustButton = thrustButtonStuff[0];
    var thrustButtonUp = thrustButtonStuff[1];
    var thrustButtonDown = thrustButtonStuff[2];

	thrustButton.position.x = 720-90;
	thrustButton.position.y = 1080-90;

	var thrustDown = false;

	thrustButton.mousedown = thrustButton.touchstart = function(data) {
		thrustDown = true;
        this.setTexture(thrustButtonDown);
    };

	thrustButton.mouseup = thrustButton.touchend = thrustButton.mouseupoutside = thrustButton.touchendoutside = function(data) {
		thrustDown = false;
        this.setTexture(thrustButtonUp);
	};

    stage.addChild(thrustButton);

    var keystate = [];

    var doKeyDown = function(e) {
        //console.log("down "+e.keyCode);
        keystate[e.keyCode] = true;
    };

    var doKeyUp = function(e) {
        //console.log("  up "+e.keyCode);
        keystate[e.keyCode] = false;
    };

    window.addEventListener("keydown", doKeyDown, false);
    window.addEventListener("keyup", doKeyUp, false);

    var KEY = { SHIFT:16, CTRL:17, ESC:27, RIGHT:39, UP:38, LEFT:37, DOWN:40, SPACE:32,
            A:65, E:69, G:71, L:76, P:80, R:82, S:83, X:88, Z:90, DIGIT:48, BACKTICK:192 };

    var yellow_font_left = { font: "40px Inconsolata", fill: "#ffff00", align: "left" };
    var white_font_right = { font: "40px Inconsolata", fill: "#ffffff", align: "right" };

    var shiptimeTitle = new PIXI.Text("", yellow_font_left);
    shiptimeTitle.position.x = 5
    shiptimeTitle.position.y = 0;
    stage.addChild(shiptimeTitle);

    var shiptime = new PIXI.Text("", white_font_right);
    shiptime.position.x = 360
    shiptime.position.y = 0;
    stage.addChild(shiptime);

    var targettimeTitle = new PIXI.Text("", yellow_font_left);
    targettimeTitle.position.x = 5
    targettimeTitle.position.y = 45;
    stage.addChild(targettimeTitle);

    var targettime = new PIXI.Text("", white_font_right);
    targettime.position.x = 360
    targettime.position.y = 45;
    stage.addChild(targettime);

    var deltatimeTitle = new PIXI.Text("", yellow_font_left);
    deltatimeTitle.position.x = 5
    deltatimeTitle.position.y = 90;
    stage.addChild(deltatimeTitle);

    var deltatime = new PIXI.Text("", white_font_right);
	deltatime.position.x = 360;
	deltatime.position.y = 90;
	stage.addChild(deltatime);

    var relvelTitle = new PIXI.Text("", yellow_font_left);
    relvelTitle.position.x = 5
    relvelTitle.position.y = 135;
    stage.addChild(relvelTitle);

    var relveltime = new PIXI.Text("", white_font_right);
	relveltime.position.x = 360;
	relveltime.position.y = 135;
	stage.addChild(relveltime);

	var targetSprite = Starship.generateSprite("target",16,"#ffffff");
	targetSprite.position.x = 0;
	targetSprite.position.y = 0;
	targetSprite.visible = false;
	observerFrame.addChild(targetSprite);

    var lastRender = Date.now();

    // Main loop is here
    var loop = function() {

        var now = Date.now();
        var elapsedTime = now-lastRender;
        lastRender = now;
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

        var targetPos = 0;
		var targetttext = "N/A";
		var deltattext = "N/A";
		var relveltext = "N/A";

		var objects = u.GetObjects();
        for (var i=0; i<objects.length; i++) {
            var obj = objects[i];
            obj.Update(observerFrame);
        }

        var formatTime = function(t) {
            var temp = ""+Math.round(t*10);
            var temp2 = temp.slice(0,-1);
            if (temp2 === "") temp2 = "0";
            else if (temp2 === "-") temp2 = "-0";
            return temp2+"."+temp.slice(-1)+"s";
        }

		var shipt = u.GetObserver().GetClock();
		if (observerFrame.currentTarget) {
			var targett = observerFrame.currentTarget.GetClock();
			targetPos = u.GetPos3Local(observerFrame.currentTarget);
			targetSprite.position.x = targetPos[0];
			targetSprite.position.y = targetPos[1];
			targetSprite.visible = true;
        	var deltat = targett - shipt;
        	targetttext = formatTime(targett);
        	deltattext = formatTime(deltat);
        	var targetvel = u.GetObserver().GetObservedRelativeVel3(observerFrame.currentTarget);
        	// TBD - calculate relvel
        	relveltext = Math.round(targetvel[0]*1000)/10+","+Math.round(targetvel[1]*1000)/10;
		}
		else {
			targetttext = "N/A";
			deltattext = "N/A";
			relveltext = "N/A";
			targetSprite.visible = false;
		}

		shiptimeTitle.setText("SHIP:");
        shiptime.setText(formatTime(shipt));
        shiptime.position.x = 360 - shiptime.width;

		targettimeTitle.setText("TARGET:");
		targettime.setText(targetttext);
        targettime.position.x = 360 - targettime.width;

		deltatimeTitle.setText("DELTA:");
		deltatime.setText(deltattext);
        deltatime.position.x = 360 - deltatime.width;

		relvelTitle.setText("REL VEL:");
		relveltime.setText(relveltext);
        relveltime.position.x = 360 - relveltime.width;

        renderer.render(stage);

        // Schedule the loop to run again
        //window.setTimeout(loop, 1000/24.0);
        //window.setTimeout(loop, 0.0);
        requestAnimFrame(loop);
    }

    // Run the main loop for the first time
    requestAnimFrame(loop);
}
