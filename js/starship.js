// Starship is a namespace
if (typeof Starship == "undefined" || !Starship) {
    Starship = {};
}

// Starship.Object2D is derived from SR.Object
(function() {
    Starship.Object2D = function(u, n, pos3, vel3, clk, mass) {
        SR.Object.call(this, u, n, pos3, vel3, clk, mass);
        this.color = '#ffffff';
        this.radius = 10;
        this.rendered = false;
    };
    Starship.Object2D.prototype = Object.create(SR.Object.prototype);
    Starship.Object2D.prototype.SetColor = function(clr) {
        this.color = clr;
    };
    Starship.Object2D.prototype.SetRadius = function(r) {
        this.radius = r;
    };
    Starship.Object2D.prototype.Draw = function(parent, center) {
        if (this.rendered === false) {

            if (this.radius === 1) {
				this.sprite = Starship.generateSprite("beacon",3,this.color);
			} else {
				this.sprite = Starship.generateSprite("object",this.radius,this.color);
			}
            parent.addChild(this.sprite);

			// faux target for now
			if (this.name === "target") {
				this.timetext = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "left" });
				this.timetext.position.x = 0
				this.timetext.position.y = 60;
				parent.addChild(this.timetext);
			}

            this.rendered = true;
        }
        if (this.rendered === true)
        {
            // render image
            var pos = this.universe.GetPos3Local(this);
            pos[0] += center[0];
            pos[1] += center[1];
            this.sprite.position.x = pos[0];
            this.sprite.position.y = pos[1];
        }

        if (this.name === "target") {
        	var t = this.GetClock();
			var t_int = Math.floor(t);
			var t_frac = Math.floor(Math.abs(t*10))%10;
			var txt = t_int+"."+t_frac+"s";
			this.timetext.setText(txt);
            this.timetext.position.x = 300 - this.timetext.width;
		}
    };
}());

// Starship.Ship2D is derived from Starship.Object2D
(function() {
    Starship.Ship2D = function(u, n, pos3, vel3, clk, mass) {
        Starship.Object2D.call(this, u, n, pos3, vel3, clk, mass);
        this.thruster = false;
    }
    Starship.Ship2D.prototype = Object.create(Starship.Object2D.prototype);

    Starship.Ship2D.prototype.Thrust = function(amount) {
        if (amount > 0) {
            this.thruster = true;
        } else {
            this.thruster = false;
        }
        var orient3 = this.GetOrientation();
        var amount_vec3 = [orient3[0], orient3[1], orient3[2]];
        for (var i=0;i<3;i++)
            amount_vec3[i] *= amount;
        this.ApplyForce(amount_vec3);
    };
    Starship.Ship2D.prototype.Draw = function(parent, center) {
        var pos = this.universe.GetPos3Local(this);

        var vel4 = this.GetGlobalVel4();
        var c = this.c;
        var g = vel4[0]/c;
        var gv = Math.sqrt(vel4[1]*vel4[1]+vel4[2]*vel4[2]+vel4[3]*vel4[3]);
        var v = gv/g;
        var t = this.GetClock();

		/*
        // Put the circle on hold for a bit
        for (r=50; r<600; r+=50) {
            var center_offset = r;
            var center_pos = [pos[0]+vel4[1]/c*center_offset,pos[1]+vel4[2]/c*center_offset];
            var radius = r*g;
            //#center_pos = (int(pos[0]+xaxis[0]),int(pos[1]+xaxis[1]))
            ctx.beginPath();
            ctx.strokeStyle = '#404040';
            ctx.arc(center_pos[0], center_pos[1], radius, 0, 2*Math.PI);
            ctx.stroke();
        }
		*/

        if (this.rendered === false) {

			this.sprite = Starship.generateSprite("ship",this.radius,this.color);
			this.sprite2 = Starship.generateSprite("flame",this.radius,"#ffff00");
			parent.addChild(this.sprite);
			parent.addChild(this.sprite2);

			//this.timetext = new PIXI.Text("", { font: "bold italic 60px Arvo", fill: "#3e1707", align: "left", stroke: "#a4410e", strokeThickness: 7 });
			this.timetext = new PIXI.Text("", { font: "24px Inconsolata", fill: "#ffffff", align: "left" });
			this.timetext.position.x = 0
			this.timetext.position.y = 0;
			parent.addChild(this.timetext);

            this.rendered = true;
        }

		this.sprite.position.x = pos[0]+center[0];
		this.sprite.position.y = pos[1]+center[1];
		var temp = this.GetOrientation();
		var angle = Math.atan2(temp[1],temp[0]);
		this.sprite.rotation = angle;

		this.sprite2.position.x = pos[0]+center[0];
		this.sprite2.position.y = pos[1]+center[1];
		this.sprite2.rotation = angle;

		if (this.thruster) {
			this.sprite2.visible = true;
		} else {
			this.sprite2.visible = false;
		}

		var t = this.GetClock();
        var t_int = Math.floor(t);
        var t_frac = Math.floor(Math.abs(t*10))%10;
        var txt = t_int+"."+t_frac+"s";
        this.timetext.setText(txt);
        this.timetext.position.x = 300 - this.timetext.width;
    };
}());
