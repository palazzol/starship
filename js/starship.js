"use strict";

// Starship is a namespace
if (typeof Starship == "undefined" || !Starship) {
    var Starship = {};
}

// Starship.Object2D is derived from SR.Object
Starship.Object2D = class extends SR.Object {
    constructor(u, n, pos3, vel3, clk, mass) {
        super(u, n, pos3, vel3, clk, mass);
        this.color = '#ffffff';
        this.radius = 10;
        this.rendered = false;
    }
    SetColor(clr) {
        this.color = clr;
    }
    SetRadius(r) {
        this.radius = r;
    }
    Update(parent) {
        if (this.rendered === false) {
            if (this.name === "beacon") { // beacons are not selectable
                this.sprite = Starship.generateSprite("plus",this.radius,this.color);
            } else {
                this.sprite = Starship.generateSprite("circle",this.radius,this.color);
                this.sprite.buttonMode = true;
                this.sprite.interactive = true;
                this.sprite.objref = this;
                this.sprite.mousedown = this.sprite.touchstart = function(data) {
                    data.target.parent.currentTarget = data.target.objref;
                }
            }
            parent.addChild(this.sprite);

            this.rendered = true;
        }
        // render image
        var pos = this.universe.GetPos3Local(this);
        this.sprite.position.x = pos[0];
        this.sprite.position.y = pos[1];
    }
};

// Starship.Ship2D is derived from Starship.Object2D
Starship.Ship2D = class extends Starship.Object2D {
    constructor(u, n, pos3, vel3, clk, mass) {
        super(u, n, pos3, vel3, clk, mass);
        this.thruster = false;
    }
    Thrust(amount) {
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
    }
    Update(parent) {
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

            this.rendered = true;
        }

        this.sprite.position.x = pos[0];
        this.sprite.position.y = pos[1];
        var temp = this.GetOrientation();
        var angle = Math.atan2(temp[1],temp[0]);
        this.sprite.rotation = angle;

        this.sprite2.position.x = pos[0];
        this.sprite2.position.y = pos[1];
        this.sprite2.rotation = angle;

        if (this.thruster) {
            this.sprite2.visible = true;
        } else {
            this.sprite2.visible = false;
        }
    }
};
