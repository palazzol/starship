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
            // create canvas
            this.pre = document.createElement("canvas");
            this.pre.width = 64;
            this.pre.height = 64;
            var prectx = this.pre.getContext("2d");
            if (this.radius === 1) {
                var L = 3;
                prectx.strokeStyle = this.color;
                prectx.moveTo(32-L,32);
                prectx.lineTo(32+L,32);
                prectx.moveTo(32,32-L);
                prectx.lineTo(32,32+L);
                prectx.stroke();
                //this.img = new Image()
                //this.img.src = this.pre.toDataURL();
            } else {
                prectx.strokeStyle = this.color;
                //prectx.fillStyle = this.color;
                prectx.lineWidth = 2;
                prectx.lineJoin = "miter";
                prectx.beginPath();
                prectx.arc(32, 32, this.radius, 0, 2*Math.PI);
                prectx.closePath();
                //prectx.fill();
                prectx.stroke();
                //this.img = new Image()
                //this.img.src = this.pre.toDataURL();
            }
            var texture = PIXI.Texture.fromCanvas(this.pre,PIXI.scaleModes.DEFAULT)
            this.sprite = new PIXI.Sprite(texture);
            this.sprite.anchor.x = 0.5;
            this.sprite.anchor.y = 0.5;
            parent.addChild(this.sprite);

            this.rendered = true;
        }
        if (this.rendered === true)
        {
            // render image
            var pos = this.universe.GetPos3Local(this);
            pos[0] += center[0];
            pos[1] += center[1];
            //ctx.drawImage(this.pre, pos[0]-10, pos[1]-10);
            this.sprite.position.x = pos[0];
            this.sprite.position.y = pos[1];
        }
        var pos = this.universe.GetPos3Local(this);
        pos[0] += center[0];
        pos[1] += center[1];
        /*
        if (this.GetName() != 'beacon') {
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            var t = this.GetClock();
            ctx.font="18px Courier";
            var t_rounded = Math.floor(t*10)/10;
            var t_int = Math.floor(t);
            var t_frac = Math.floor(Math.abs(t*10))%10;
            //var txt = "clock:"+t_rounded;
            var txt = " clock:"+t_int+"."+t_frac;
            ctx.fillText(txt,pos[0]+this.radius, pos[1]+this.radius);
        }
        */
    };
}());

// Starship.Ship2D is derived from Starship.Object2D
(function() {
    Starship.Ship2D = function(u, n, pos3, vel3, clk, mass) {
        Starship.Object2D.call(this, u, n, pos3, vel3, clk, mass);
        this.wire = [[1.0,0.0],[-1.0,-0.7],[-0.5,0.0],[-1.0,0.7]];
        //this.wire = [[-0.5,0.0],[0.5,-0.3],[-0.5,-0.6],
        //               [-0.9,-0.6],[-0.8,-0.5],[-0.3,-0.4],
        //               [-0.6,-0.3],[-0.3,-0.2],[-0.8,-0.1],
        //               [-0.8,0.1],[-0.3,0.2],[-0.6,0.3],
        //               [-0.3,0.4],[-0.8,0.5],[-0.9,0.6],
        //               [-0.5,0.6],[0.5,0.3]];
        this.flame = [[-0.75,-0.35],[-1.5,0.0],[-0.75,0.35]];
        this.toggle = false;
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
        //pos = (int(pos[0]+0.5)+center[0], int(pos[1]+0.5)+center[1]);
        //pos[0]+=center[0];
        //pos[1]+=center[1];
        pos[0] = 32;
        pos[1] = 32;
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
            this.pre = document.createElement("canvas");
            this.pre.width = 64;
            this.pre.height = 64;
            var prectx = this.pre.getContext("2d");
            if (this.radius === 1) {
                prectx.beginPath();
                prectx.strokeStyle = '#ffffff';
                prectx.arc(pos[0], pos[1], this.radius, 0, 2*Math.PI);
                prectx.stroke();
                /////pygame.draw.circle(surf, self.__color, pos, self.__radius, 1);
            } else {
                //var temp = this.GetOrientation();
                var xaxis = [0.0,1.0];
                var yaxis = [-xaxis[1],xaxis[0]];
                var p_rots = [];
                for (var i=0; i<this.wire.length; i++) {
                    var p = this.wire[i];
                    var p_rot = [];
                    p_rot[0] = (p[0]*xaxis[0] + p[1]*yaxis[0])*this.radius;
                    p_rot[1] = (p[0]*xaxis[1] + p[1]*yaxis[1])*this.radius;
                    p_rot[0] += pos[0];
                    p_rot[1] += pos[1];
                    p_rots[p_rots.length] = p_rot;
                }
                prectx.strokeStyle = this.color;
                prectx.lineWidth = 2;
                prectx.beginPath();
                var p1 = p_rots[0];
                prectx.moveTo(p1[0], p1[1]);
                for (var i = 0; i < p_rots.length - 1; i++) {
                    p1 = p_rots[i+1];
                    prectx.lineTo(p1[0], p1[1]);
                }
                p1 = p_rots[0];
                prectx.lineJoin = "miter";
                prectx.closePath();
                prectx.stroke();

                var texture = PIXI.Texture.fromCanvas(this.pre,PIXI.scaleModes.DEFAULT)
                this.sprite = new PIXI.Sprite(texture);
                this.sprite.anchor.x = 0.5;
                this.sprite.anchor.y = 0.5;
                parent.addChild(this.sprite);

                this.pre = document.createElement("canvas");
                this.pre.width = 64;
                this.pre.height = 64;
                prectx = this.pre.getContext("2d");

                /*
                if (this.toggle) {
                    this.toggle = false;
                } else {
                    this.toggle = true;
                }
                if (this.thruster && this.toggle) {
                */

                var p_rots = [];
                for (var i=0; i<this.flame.length; i++) {
                    var p = this.flame[i];
                    var p_rot = [];
                    p_rot[0] = (p[0]*xaxis[0] + p[1]*yaxis[0])*this.radius;
                    p_rot[1] = (p[0]*xaxis[1] + p[1]*yaxis[1])*this.radius;
                    p_rot[0] += pos[0];
                    p_rot[1] += pos[1];
                    p_rots[p_rots.length] = p_rot;
                }
                //prectx.beginPath();
                prectx.strokeStyle = this.color;
                var p1 = p_rots[0];
                prectx.moveTo(p1[0], p1[1]);
                for (var i = 0; i < p_rots.length - 1; i++) {
                    p1 = p_rots[i+1];
                    prectx.lineTo(p1[0], p1[1]);
                }
                prectx.stroke();

                var texture2 = PIXI.Texture.fromCanvas(this.pre,PIXI.scaleModes.DEFAULT)
                this.sprite2 = new PIXI.Sprite(texture2);
                this.sprite2.anchor.x = 0.5;
                this.sprite2.anchor.y = 0.5;
                parent.addChild(this.sprite2);
                //}
            }


            this.rendered = true;
        }
        if (this.rendered === true) {
            pos = this.universe.GetPos3Local(this);
            this.sprite.position.x = pos[0]+center[0];
            this.sprite.position.y = pos[1]+center[1];
            var temp = this.GetOrientation();
            var angle = Math.atan2(-temp[0],temp[1]);
            this.sprite.rotation = angle;

            this.sprite2.position.x = pos[0]+center[0];
            this.sprite2.position.y = pos[1]+center[1];
            this.sprite2.rotation = angle;

            if (this.thruster) {
                this.sprite2.visible = true;
            } else {
                this.sprite2.visible = false;
            }
        }

        /*
        ctx.fillStyle = this.color;
        ctx.font="18px Courier";
        //var t_rounded = Math.floor(t*10)/10;
        var t_int = Math.floor(t);
        var t_frac = Math.floor(Math.abs(t*10))%10;
        //var txt = "clock:"+t_rounded;
        var txt = "v/c:" + Math.floor(v/c*100) + "%, clock:"+t_int+"."+t_frac;
        ctx.fillText(txt,pos[0]+this.radius, pos[1]+this.radius);
        */
    };
}());
