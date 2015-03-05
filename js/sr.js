// From file sr

/*
A note on Coordinate systems:
    There are difference coordinate systems for every object.
    'Global Coordinates' are coordinates a global reference frame.
        Initial positions and velocities are defined in this reference frame
        Ship speed is defined in this reference frame
        Objects store their state in Global Coordinates internally
    'Object Coordinates' are the local coordinates associated with each object
*/

"use strict";

function Metric(a,b) {
    // Minkowski Metric
    // +,-,-,- convention, timelike distances are positive
    return a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3];
}

function GoToPercentC(ship, speed) {
    // Set speed wrt to global ref frame
    var o = ship.GetOrientation();
    var rv = []
    rv[0] = o[0]*speed;
    rv[1] = o[1]*speed;
    rv[2] = o[2]*speed;
    ship.SetGlobalVel3(rv);
}

function ProjectTimeObserved(pos, vel) {
    // Solve the equation (pos+x*vel) dot (pos+x*vel) == 0.0 for x>=0
    // Intersection of object trajectory with observer's past light cone
    var A = Metric(vel,vel);
    var B = Metric(pos,vel) * 2;
    var C = Metric(pos,pos);
    var D = B*B-4*A*C;
    if (Math.abs(D)<1e-6)
        D = 0.0;
    if (D < 0.0) {
        console.log("***",A,B,C,D)
        D = 0.0;
	}
    var S = Math.sqrt(D);
    var x = 0.0;
    if (A>0.0)
        x = (-B-S)/(2*A);
    else
        x = (-B+S)/(2*A);
    if (Math.abs(x)<1e-6)
        x = 0.0;
    return x;
}

function ProjectTimeMeasured(posobj, velobj, velobs) {
    // Solve the equation (posobj+x*velobj) dot (velobs) == 0.0
    // Intersection of object trajectory with observer's "now" (t_obs=now plane)
    var A = Metric(velobj,velobs);
    var B = Metric(posobj,velobs);
    return -B/A;
}

// SR is a namespace
var SR = {};

// SR.Universe is a singleton class
(function() {
    var _universe = null;
    SR.GetUniverse = function() {
        if (!_universe)
            _universe = new SR.Universe();
        return _universe;
    }
    SR.Universe = function() {
        // private variables
        this.c = 100.0;
        this.observer = null;
        this.objects = [];
    }
    SR.Universe.prototype.AddObject = function(obj) {
        this.objects[this.objects.length] = obj;
    };
    SR.Universe.prototype.GetObjects = function() {
        return this.objects;
    };
    SR.Universe.prototype.GetPos3Local = function(obj) {
        return this.observer.GetObservedRelativePos3(obj);
    };
    SR.Universe.prototype.GetSpeedOfLight = function() {
        return this.c;
    };
    SR.Universe.prototype.SetSpeedOfLight = function(c) {
        this.c = c;
    };
    SR.Universe.prototype.SetObserver = function(obj) {
        this.observer = obj;
    };
    SR.Universe.prototype.GetObserver = function() {
        return this.observer;
    };
    SR.Universe.prototype.MoveToObserverClock = function(tau) {
        // Actually move the observer to the event where this proper time is measured
        var delta_tau = tau-this.observer.GetClock();
        this.observer.IncrementTime(delta_tau);
        // Now, move each object to the point where it intersects the observer's past light cone
        for (var i=0; i<this.objects.length; i++) {
            var obj = this.objects[i];
            if (obj != this.observer) {
                // Move the object to the event where observer will "see" it
                // Get the object position vector, with the origin at the observer
                var temp1 = this.observer.GetGlobalPos4();
                var temp2 = obj.GetGlobalPos4();
                var pos3observer = [temp2[0]-temp1[0],temp2[1]-temp1[1],temp2[2]-temp1[2],temp2[3]-temp1[3]];
                delta_tau = ProjectTimeObserved(pos3observer, obj.GetGlobalVel4());
                //delta_tau = ProjectTimeMeasured(pos3observer, obj.GetGlobalVel4(), this.observer.GetGlobalVel4());
                obj.IncrementTime(delta_tau);
            }
        }
    };
}());

// SR.Object is a class
(function() {
    SR.Object = function(universe, name, pos3, vel3, clock, restmass) {
        this.universe = universe
        this.c = universe.GetSpeedOfLight();
        // Initialize the name
        this.name = name;
        // Initialize the position 4-vector, global coordinates
        this.pos4 = [this.c*clock,pos3[0],pos3[1],pos3[2]];
        // Initialize the velocity 4-vector, global coordinates
        this.SetGlobalVel3(vel3);
        // Initialize the clock
        this.clock = clock;
        // Initialize the orientation, object coordinates
        this.orient3 = [1.0,0.0,0.0];
        // Initialize the rest mass
        this.restmass = restmass;
        //var accel4 = [0.0,0.0,0.0,0.0];
        this.force = [0.0,0.0,0.0,0.0];
        this.universe.AddObject(this);
    };
    SR.Object.prototype.GetUniverse = function() {
        return this.universe;
    };
    SR.Object.prototype.GetName = function() {
        return this.name;
    };
    SR.Object.prototype.GetClock = function() {
        return this.clock;
    };
    SR.Object.prototype.SetClock = function(clock) {
        this.clock = clock;
    };
    SR.Object.prototype.MoveToClock = function(clock) {
        var delta_tau = clock-this.clock;
        IncrementTime(delta_tau);
    };
    SR.Object.prototype.GetOrientation = function() {
        return this.orient3;
    };
    SR.Object.prototype.SetOrientation = function(x, y) {
        this.orient3 = [x,y,this.orient3[2]];
    };
    SR.Object.prototype.Turn = function(degrees) {
        var radians = degrees*Math.PI/180.0;
        var o_old = this.GetOrientation();
        var o_new = [0.0,0.0];
        o_new[0] = o_old[0]*Math.cos(radians)+o_old[1]*Math.sin(radians);
        o_new[1] = -o_old[0]*Math.sin(radians)+o_old[1]*Math.cos(radians);
        this.orient3 = [o_new[0],o_new[1],this.orient3[2]];
    };
    SR.Object.prototype.GetGlobalPos3 = function() {
        return [this.pos4[1], this.pos4[2], this.pos4[3]];
    };
    SR.Object.prototype.GetGlobalPos4 = function() {
        return this.pos4;
    };
    SR.Object.prototype.GetGlobalVel4 = function() {
        return this.vel4;
    };
    SR.Object.prototype.SetGlobalVel4 = function(v4) {
        this.vel4 = v4;
        var gamma = this.vel4[0]/this.c;
        var bx = this.vel4[1]/this.c/gamma;
        var by = this.vel4[2]/this.c/gamma;
        var bz = this.vel4[3]/this.c/gamma;
        var b_squared = bx*bx+by*by+bz*bz;
        this.lorentz = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
        if (b_squared >= 1e-6) {
            // Note 0,0,is not used right now
            this.lorentz[0][0] = gamma;
            this.lorentz[0][1] = -bx*gamma;
            this.lorentz[0][2] = -by*gamma;
            this.lorentz[0][3] = -bz*gamma;
            //this.lorentz[1][0] = this.lorentz[0][1];
            this.lorentz[1][1] = 1.0+(gamma-1)*bx*bx/b_squared;
            this.lorentz[1][2] = (gamma-1)*bx*by/b_squared;
            this.lorentz[1][3] = (gamma-1)*bx*bz/b_squared;
            //this.lorentz[2][0] = this.lorentz[0][2];
            //this.lorentz[2][1] = this.lorentz[1][2];
            this.lorentz[2][2] = 1.0+(gamma-1)*by*by/b_squared;
            this.lorentz[2][3] = (gamma-1)*by*bz/b_squared;
            //this.lorentz[3][0] = this.lorentz[0][3];
            //this.lorentz[3][1] = this.lorentz[1][3];
            //this.lorentz[3][2] = this.lorentz[2][3];
            this.lorentz[3][3] = 1.0+(gamma-1)*bz*bz/b_squared;
        }
    };
    SR.Object.prototype.SetGlobalVel3 = function(vel3) {
        //v_squared = vel3[0]*vel3[0]+vel3[1]*vel3[1]+vel3[2]*vel3[2]
        var bx = vel3[0]/this.c;
        var by = vel3[1]/this.c;
        var bz = vel3[2]/this.c;
        var b_squared = bx*bx+by*by+bz*bz;
        var gamma = 1.0/Math.sqrt(1-b_squared);
        this.SetGlobalVel4([this.c*gamma,vel3[0]*gamma,vel3[1]*gamma,vel3[2]*gamma]);
    };
    SR.Object.prototype.GetObservedRelativePos3 = function(obj) {
        // global delta is the object's position in global coordinates,
        // but with the origin moved to the the observer
        var global_delta = [0.0,0.0,0.0,0.0];
        global_delta[0] = obj.GetGlobalPos4()[0]-this.GetGlobalPos4()[0];
        global_delta[1] = obj.GetGlobalPos4()[1]-this.GetGlobalPos4()[1];
        global_delta[2] = obj.GetGlobalPos4()[2]-this.GetGlobalPos4()[2];
        global_delta[3] = obj.GetGlobalPos4()[3]-this.GetGlobalPos4()[3];
        // Now, we can convert to the observer's coordinate system, but with
        // the origin still at the observer.
        var local_delta = [0.0,0.0,0.0,0.0];
        //local_delta[0] = global_delta[0]*this.lorentz[0][0]+
        //                 global_delta[1]*this.lorentz[0][1]+
        //                 global_delta[2]*this.lorentz[0][2]+
        //                 global_delta[3]*this.lorentz[0][3];
        local_delta[1] = global_delta[0]*this.lorentz[0][1]+
                         global_delta[1]*this.lorentz[1][1]+
                         global_delta[2]*this.lorentz[1][2]+
                         global_delta[3]*this.lorentz[1][3];
        local_delta[2] = global_delta[0]*this.lorentz[0][2]+
                         global_delta[1]*this.lorentz[1][2]+
                         global_delta[2]*this.lorentz[2][2]+
                         global_delta[3]*this.lorentz[2][3];
        local_delta[3] = global_delta[0]*this.lorentz[0][3]+
                         global_delta[1]*this.lorentz[1][3]+
                         global_delta[2]*this.lorentz[2][3]+
                         global_delta[3]*this.lorentz[3][3];
        // We would use this if we wanted the answer in Observer coordinates
        //new_pos = self.__observer.GetGlobalPos4()+local_delta
        var new_pos = local_delta
        return [ new_pos[1], new_pos[2], new_pos[3] ];
    }
    SR.Object.prototype.GetLorentz = function() {
        return this.lorentz;
    };
    SR.Object.prototype.GetGlobalTime = function() {
        return this.pos4[0]/this.c;
    };
    SR.Object.prototype.ApplyForce = function(force3) {
        this.force = [0,force3[0],force3[1],force3[2]];
    };
    SR.Object.prototype.IncrementTime = function(delta_tau) {
        var new_vel = [];
        new_vel[1]= this.vel4[1] + this.force[1]*delta_tau/this.restmass;
        new_vel[2]= this.vel4[2] + this.force[2]*delta_tau/this.restmass;
        new_vel[3]= this.vel4[3] + this.force[3]*delta_tau/this.restmass;
        var D_squared = new_vel[1]*new_vel[1]+new_vel[2]*new_vel[2]+new_vel[3]*new_vel[3];
        var gamma = 1.0/Math.sqrt(1.0-D_squared/(this.c*this.c+D_squared));
        new_vel[0] = gamma*this.c;
        this.SetGlobalVel4(new_vel);
        //if self.__name == "ship":
            //print 'D_2=',D_squared
            //print 'b=',math.sqrt(D_squared/(self.__c*self.__c+D_squared))
            //print Metric(self.__vel4, self.__vel4), self.__vel4
            //print 'v_x =',self.__vel4[1]/gamma
            //print
        //self.__vel4 = p_after/self.__restmass
        //self.__gamma = self.__vel4[0]/self.__c
        //self.__vel4 = self.__vel4 + self.__accel4*delta_tau
        this.pos4[0] += this.vel4[0]*delta_tau;
        this.pos4[1] += this.vel4[1]*delta_tau;
        this.pos4[2] += this.vel4[2]*delta_tau;
        this.pos4[3] += this.vel4[3]*delta_tau;
		this.clock += delta_tau;
        //if self.GetName() != 'beacon':
        //    print self.__clock,delta_tau
    }
}());
