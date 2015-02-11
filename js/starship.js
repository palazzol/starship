if (typeof Starship == "undefined" || !Starship) {
    Starship = {};
}

(function() {
    Starship.Object2D = function(u, n, pos3, vel3, clk, mass) {
        SR.Object.call(this, u, n, pos3, vel3, clk, mass);
        this.color = '#ffffff';
        this.radius = 10;
    };
    Starship.Object2D.prototype = Object.create(SR.Object.prototype);
    Starship.Object2D.prototype.SetColor = function(clr) {
        this.color = clr;
    };
    Starship.Object2D.prototype.SetRadius = function(r) {
        this.radius = r;
    };
    Starship.Object2D.prototype.Draw = function(ctx, center) {
        var pos = this.universe.GetPos3Local(this);
        pos[0] += center[0];
        pos[1] += center[1];
        if (this.radius === 1) {
            var l = 3;
            ctx.strokeStyle = this.color;
            ctx.moveTo(pos[0]-l,pos[1]);
            ctx.lineTo(pos[0]+l,pos[1]);
            ctx.moveTo(pos[0],pos[1]-l);
            ctx.lineTo(pos[0],pos[1]+l);
            ctx.stroke();
        } else {
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], this.radius, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        if (this.GetName() != 'beacon') {
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            var t = this.GetClock();
            ctx.font="14px Georgia";
            var t_rounded = Math.floor(t*10)/10;
            var txt = "clock="+t_rounded;
            ctx.fillText(txt,pos[0]+this.radius, pos[1]+this.radius);
        }
    };

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
    Starship.Ship2D.prototype.Draw = function(ctx, center) {
        var pos = this.universe.GetPos3Local(this);
        //pos = (int(pos[0]+0.5)+center[0], int(pos[1]+0.5)+center[1]);
        pos[0]+=center[0];
        pos[1]+=center[1];
        var vel4 = this.GetGlobalVel4();
        var c = this.c;
        var g = vel4[0]/c;
        var gv = Math.sqrt(vel4[1]*vel4[1]+vel4[2]*vel4[2]+vel4[3]*vel4[3]);
        var v = gv/g;
        var t = this.GetClock();
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
        if (this.radius === 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.arc(pos[0], pos[1], this.radius, 0, 2*Math.PI);
            ctx.stroke();
            /////pygame.draw.circle(surf, self.__color, pos, self.__radius, 1);
        } else {
            var temp = this.GetOrientation();
            var xaxis = [temp[0],temp[1]];
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
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            var p1 = p_rots[0];
            ctx.moveTo(p1[0], p1[1]);
            for (var i = 0; i < p_rots.length - 1; i++) {
                p1 = p_rots[i+1];
                ctx.lineTo(p1[0], p1[1]);
            }
            p1 = p_rots[0];
            ctx.closePath();
            ctx.stroke();
            if (this.toggle) {
                this.toggle = false;
            } else {
                this.toggle = true;
            }
            if (this.thruster && this.toggle) {
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
                //ctx.beginPath();
                ctx.strokeStyle = this.color;
                var p1 = p_rots[0];
                ctx.moveTo(p1[0], p1[1]);
                for (var i = 0; i < p_rots.length - 1; i++) {
                    p1 = p_rots[i+1];
                    ctx.lineTo(p1[0], p1[1]);
                }
                ctx.stroke();
            }
        }
        ctx.font="14px Georgia";
        var t_rounded = Math.floor(t*10)/10;
        var txt = "v/c=" + Math.floor(v/c*100) + "%, Clock="+t_rounded;
        ctx.fillText(txt,pos[0]+this.radius, pos[1]+this.radius);
    };
}());
