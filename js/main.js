"use strict";

function main() {

    var width =  1080;
    var height = 720;

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

    var observerFrame = new PIXI.DisplayObjectContainer();
    // center of the main display screen
    observerFrame.position.x = 540;
    observerFrame.position.y = 360;
    stage.addChild(observerFrame);

    // Initialize
    var clock = Date.now();
    var u = new SR.Universe();

    for (var i=-10; i<3; i++) {
        for (var j=-5; j<8; j++) {
            var beacon = new Starship.Object2D(u, "beacon", [i*50,j*50,0], [0,0,0], 0, 1);
            beacon.SetColor('#808080');
            beacon.SetRadius(5);
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

    /*
    var backgroundTexture = new PIXI.Texture.fromImage("resources\\brushed_metal.png");
    var background = new PIXI.Sprite(backgroundTexture);
    background.position.x = 0;
    background.position.y = 0;
    stage.addChild(background);
    */

    var thrustButtonStuff = Starship.generateButton("button", 60, 'yellow', "Thrust");
    var thrustButton = thrustButtonStuff[0];
    var thrustButtonUp = thrustButtonStuff[1];
    var thrustButtonDown = thrustButtonStuff[2];

    thrustButton.position.x = width-90;
    thrustButton.position.y = height-90;

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

    var MOButtonStuff = Starship.generateButton("button", 60, 'red', "M/O");
    var MOButton = MOButtonStuff[0];
    var MOButtonUp = MOButtonStuff[1];
    var MOButtonDown = MOButtonStuff[2];

    MOButton.position.x = width-135-90;
    MOButton.position.y = height-90;

    var MOButtonToggle = false;

    MOButton.mousedown = MOButton.touchstart = function(data) {
        this.setTexture(MOButtonDown);
    };

    MOButton.mouseup = MOButton.touchend = MOButton.mouseupoutside = MOButton.touchendoutside = function(data) {
        this.setTexture(MOButtonUp);
        if (MOButtonToggle)
            MOButtonToggle = false;
        else
            MOButtonToggle = true;
    };

    stage.addChild(MOButton);

    var blueButtonStuff = Starship.generateButton("button", 60, 'blue', "blue");
    var blueButton = blueButtonStuff[0];
    var blueButtonUp = blueButtonStuff[1];
    var blueButtonDown = blueButtonStuff[2];

    blueButton.position.x = 135+90;
    blueButton.position.y = height-90;

    blueButton.mousedown = blueButton.touchstart = function(data) {
        this.setTexture(blueButtonDown);
    };

    blueButton.mouseup = blueButton.touchend = blueButton.mouseupoutside = blueButton.touchendoutside = function(data) {
        this.setTexture(blueButtonUp);
    };

    stage.addChild(blueButton);

    var greenButtonStuff = Starship.generateButton("button", 60, 'green', "green");
    var greenButton = greenButtonStuff[0];
    var greenButtonUp = greenButtonStuff[1];
    var greenButtonDown = greenButtonStuff[2];

    greenButton.position.x = 90;
    greenButton.position.y = height-90;

    greenButton.mousedown = greenButton.touchstart = function(data) {
        this.setTexture(greenButtonDown);
    };

    greenButton.mouseup = greenButton.touchend = greenButton.mouseupoutside = greenButton.touchendoutside = function(data) {
        this.setTexture(greenButtonUp);
    };

    stage.addChild(greenButton);

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

    var font_size = 20;
    var font_margin = 2;

    var yellow_font_left = { font: font_size+"px Inconsolata", fill: "#ffff00", align: "left" };
    var white_font_right = { font: font_size+"px Inconsolata", fill: "#ffffff", align: "right" };

    var shiptimeTitle = new PIXI.Text("", yellow_font_left);
    shiptimeTitle.position.x = font_margin
    shiptimeTitle.position.y = font_margin;
    stage.addChild(shiptimeTitle);

    var shiptime = new PIXI.Text("", white_font_right);
    shiptime.position.x = width/2;
    shiptime.position.y = font_margin;
    stage.addChild(shiptime);

    var targettimeTitle = new PIXI.Text("", yellow_font_left);
    targettimeTitle.position.x = font_margin
    targettimeTitle.position.y = font_size+font_margin;
    stage.addChild(targettimeTitle);

    var targettime = new PIXI.Text("", white_font_right);
    targettime.position.x = width/2;
    targettime.position.y = font_size+font_margin;
    stage.addChild(targettime);

    var deltatimeTitle = new PIXI.Text("", yellow_font_left);
    deltatimeTitle.position.x = font_margin
    deltatimeTitle.position.y = 2*font_size+font_margin;
    stage.addChild(deltatimeTitle);

    var deltatime = new PIXI.Text("", white_font_right);
    deltatime.position.x = width/2;
    deltatime.position.y = 2*font_size+font_margin;
    stage.addChild(deltatime);

    var rangeTitle = new PIXI.Text("", yellow_font_left);
    rangeTitle.position.x = font_margin
    rangeTitle.position.y = 3*font_size+font_margin;
    stage.addChild(rangeTitle);

    var rangeDist = new PIXI.Text("", white_font_right);
    rangeDist.position.x = width/2;
    rangeDist.position.y = 3*font_size+font_margin;
    stage.addChild(rangeDist);

    var bearingTitle = new PIXI.Text("", yellow_font_left);
    bearingTitle.position.x = font_margin
    bearingTitle.position.y = 4*font_size+font_margin;
    stage.addChild(bearingTitle);

    var bearingAngle = new PIXI.Text("", white_font_right);
    bearingAngle.position.x = width/2;
    bearingAngle.position.y = 4*font_size+font_margin;
    stage.addChild(bearingAngle);

    var headingTitle = new PIXI.Text("", yellow_font_left);
    headingTitle.position.x = font_margin
    headingTitle.position.y = 5*font_size+font_margin;
    stage.addChild(headingTitle);

    var headingAngle = new PIXI.Text("", white_font_right);
    headingAngle.position.x = width/2;
    headingAngle.position.y = 5*font_size+font_margin;
    stage.addChild(headingAngle);

    var trackTitle = new PIXI.Text("", yellow_font_left);
    trackTitle.position.x = font_margin
    trackTitle.position.y = 6*font_size+font_margin;
    stage.addChild(trackTitle);

    var trackAngle = new PIXI.Text("", white_font_right);
    trackAngle.position.x = width/2;
    trackAngle.position.y = 6*font_size+font_margin;
    stage.addChild(trackAngle);

    var relvelTitle = new PIXI.Text("", yellow_font_left);
    relvelTitle.position.x = font_margin
    relvelTitle.position.y = 7*font_size+font_margin;
    stage.addChild(relvelTitle);

    var relveltime = new PIXI.Text("", white_font_right);
    relveltime.position.x = width/2;
    relveltime.position.y = 7*font_size+font_margin;
    stage.addChild(relveltime);

    var targetSprite = Starship.generateSprite("target",16,"#ffffff");
    targetSprite.position.x = 0;
    targetSprite.position.y = 0;
    targetSprite.visible = false;
    observerFrame.addChild(targetSprite);

    var bearingSprite = Starship.generateSprite("bearing",16,"#ffffff");
    bearingSprite.position.x = 0;
    bearingSprite.position.y = 0;
    bearingSprite.visible = false;
    observerFrame.addChild(bearingSprite);

    var trackSprite = Starship.generateSprite("track",16,"#ffff00");
    trackSprite.position.x = 0;
    trackSprite.position.y = 0;
    trackSprite.visible = false;
    observerFrame.addChild(trackSprite);

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
        var rangetext = "N/A";
        var bearingtext = "N/A";
        var tracktext = "N/A";
        var relveltext = "N/A";

        if (MOButtonToggle)
            u.measured = true;
        else
            u.measured = false;

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
            return temp2+"."+temp.slice(-1)+" s";
        }

        var formatDist = function(t) {
            var temp = ""+Math.round(t/u.GetSpeedOfLight()*10);
            var temp2 = temp.slice(0,-1);
            if (temp2 === "") temp2 = "0";
            else if (temp2 === "-") temp2 = "-0";
            return temp2+"."+temp.slice(-1)+" ls";
        }

        var formatAngle = function(t) {
            var temp = t/Math.PI*180.0;
            temp = ""+Math.round(temp*10);
            var temp2 = temp.slice(0,-1);
            if (temp2 === "") temp2 = "0";
            else if (temp2 === "-") temp2 = "-0";
            return temp2+"."+temp.slice(-1)+" deg";
        }

        var formatVel = function(t) {
            var temp = t/Math.PI*180.0;
            temp = ""+Math.round(temp*10);
            var temp2 = temp.slice(0,-1);
            if (temp2 === "") temp2 = "0";
            else if (temp2 === "-") temp2 = "-0";
            return temp2+"."+temp.slice(-1)+"% c";
        }

        var shipt = u.GetObserver().GetClock();
        if (observerFrame.currentTarget) {
            var targett = observerFrame.currentTarget.GetClock();
            targetPos = u.GetPos3Local(observerFrame.currentTarget);
            targetSprite.position.x = targetPos[0];
            targetSprite.position.y = targetPos[1];
            var bearing = Math.atan2(targetPos[1],targetPos[0]);
            bearingtext = formatAngle(bearing);
            if ((Math.abs(targetSprite.position.x) > height/2+32) || (Math.abs(targetSprite.position.y) > height/2+32)) {
                targetSprite.visible = false;
                // draw bearing indicator here
                bearingSprite.rotation = bearing;
                bearingSprite.position.x = Math.cos(bearing)*(height/2-60);
                bearingSprite.position.y = Math.sin(bearing)*(height/2-60);
                bearingSprite.visible = true;
            } else {
                targetSprite.visible = true;
                bearingSprite.visible = false;
            }
            var deltat = targett - shipt;
            targetttext = formatTime(targett);
            deltattext = formatTime(deltat);
            var targetvel = u.GetObserver().GetObservedRelativeVel3(observerFrame.currentTarget);
            var velocityAngle = Math.atan2(targetvel[1],targetvel[0])-Math.PI;
            var speed = Math.sqrt(targetvel[0]*targetvel[0]+targetvel[1]*targetvel[1]+targetvel[2]*targetvel[2]);
            if (speed > 1e-6) {
                // draw velocity indicator here
                trackSprite.rotation = velocityAngle;
                trackSprite.position.x = -Math.cos(velocityAngle)*(height/2-30);
                trackSprite.position.y = -Math.sin(velocityAngle)*(height/2-30);
                trackSprite.visible = true;
            } else {
                trackSprite.visible = false;
            }
            tracktext = formatAngle(velocityAngle);
            rangetext = formatDist(Math.sqrt(targetPos[0]*targetPos[0] + targetPos[1]*targetPos[1]));
            // TBD - calculate relvel
            var relvel = targetvel[1]*Math.sin(bearing)+targetvel[0]*Math.cos(bearing);
            relveltext = formatVel(relvel);
        }
        else {
            targetttext = "N/A";
            deltattext = "N/A";
            rangetext = "N/A";
            bearingtext = "N/A";
            tracktext = "N/A";
            relveltext = "N/A";
            targetSprite.visible = false;
        }

        var headingVector = u.GetObserver().GetOrientation();
        var headingtext = formatAngle(Math.atan2(headingVector[1], headingVector[0]));

        var v = u.GetObserver().GetVel3
        shiptimeTitle.setText("SHIP TIME:");
        shiptime.setText(formatTime(shipt));
        shiptime.position.x = width/4 - shiptime.width;

        targettimeTitle.setText("TARGET TIME:");
        targettime.setText(targetttext);
        targettime.position.x = width/4 - targettime.width;

        deltatimeTitle.setText("DELTA TIME:");
        deltatime.setText(deltattext);
        deltatime.position.x = width/4 - deltatime.width;

        rangeTitle.setText("RANGE:");
        rangeDist.setText(rangetext);
        rangeDist.position.x = width/4 - rangeDist.width;

        bearingTitle.setText("BEARING:");
        bearingAngle.setText(bearingtext);
        bearingAngle.position.x = width/4 - bearingAngle.width;

        headingTitle.setText("HEADING:");
        headingAngle.setText(headingtext);
        headingAngle.position.x = width/4 - headingAngle.width;

        trackTitle.setText("TRACK:");
        trackAngle.setText(tracktext);
        trackAngle.position.x = width/4 - trackAngle.width;

        relvelTitle.setText("VELOCITY:");
        relveltime.setText(relveltext);
        relveltime.position.x = width/4 - relveltime.width;

        renderer.render(stage);

        // Schedule the loop to run again
        //window.setTimeout(loop, 1000/24.0);
        //window.setTimeout(loop, 0.0);
        requestAnimFrame(loop);
    }

    // Run the main loop for the first time
    requestAnimFrame(loop);
}
