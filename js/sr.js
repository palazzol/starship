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

// SR is a namespace
var SR = {};

SR.Metric = function(a,b) {
    // Minkowski Metric
    // +,-,-,- convention, timelike distances are positive
    return a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3];
};

SR.GoToPercentC = function(ship, speed) {
    // Set speed wrt to global ref frame
    var o = ship.GetOrientation();
    var rv = []
    rv[0] = o[0]*speed;
    rv[1] = o[1]*speed;
    rv[2] = o[2]*speed;
    ship.SetGlobalVel3(rv);
};

SR.ProjectTimeObserved = function(pos, vel) {
    // Solve the equation (pos+x*vel) dot (pos+x*vel) == 0.0 for x>=0
    // Intersection of object trajectory with observer's past light cone
    var A = SR.Metric(vel,vel);
    var B = SR.Metric(pos,vel) * 2;
    var C = SR.Metric(pos,pos);
    // scale it
    B = B/A;
    C = C/A;
    var D = B*B-4*C
    if (Math.abs(D)<1e-6)
        D = 0.0;
    if (D < 0.0) {
        console.log("***",B,C,D)
        D = 0.0;
    }
    var S = Math.sqrt(D);
    var x = 0.0;
    //if (A>0.0)
        x = (-B-S)/2;
    //else
    //    x = (-B+S)/2;
    if (Math.abs(x)<1e-6)
        x = 0.0;
    return x;
};

SR.ProjectTimeMeasured = function(posobj, velobj, velobs) {
    // Solve the equation (posobj+x*velobj) dot (velobs) == 0.0
    // Intersection of object trajectory with observer's "now" (t_obs=now plane)
    var A = SR.Metric(velobj,velobs);
    var B = SR.Metric(posobj,velobs);
    return -B/A;
};

SR.Universe = class {
    constructor() {
        // public variables
        this.measured = false;

        // private variables
        this.c = 100.0;
        this.observer = null;
        this.objects = [];
    }
    AddObject(obj) {
        this.objects[this.objects.length] = obj;
    }
    GetObjects() {
        return this.objects;
    }
    GetPos3Local(obj) {
        return this.observer.GetObservedRelativePos3(obj);
    }
    GetSpeedOfLight() {
        return this.c;
    }
    SetSpeedOfLight(c) {
        this.c = c;
    }
    SetObserver(obj) {
        this.observer = obj;
    }
    GetObserver() {
        return this.observer;
    }
    MoveToObserverClock(tau) {
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
                if (this.measured)
                    delta_tau = SR.ProjectTimeMeasured(pos3observer, obj.GetGlobalVel4(), this.observer.GetGlobalVel4());
                else
                    delta_tau = SR.ProjectTimeObserved(pos3observer, obj.GetGlobalVel4());
                obj.IncrementTime(delta_tau);
            }
        }
    }
};

SR.Object = class {
    constructor(universe, name, pos3, vel3, clock, restmass) {
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
    }
    GetUniverse() {
        return this.universe;
    }
    GetName() {
        return this.name;
    }
    GetClock() {
        return this.clock;
    }
    SetClock(clock) {
        this.clock = clock;
    }
    MoveToClock(clock) {
        var delta_tau = clock-this.clock;
        IncrementTime(delta_tau);
    }
    GetOrientation() {
        return this.orient3;
    }
    SetOrientation(x, y) {
        this.orient3 = [x,y,this.orient3[2]];
    }
    Turn(degrees) {
        var radians = degrees*Math.PI/180.0;
        var o_old = this.GetOrientation();
        var o_new = [0.0,0.0];
        o_new[0] = o_old[0]*Math.cos(radians)+o_old[1]*Math.sin(radians);
        o_new[1] = -o_old[0]*Math.sin(radians)+o_old[1]*Math.cos(radians);
        this.orient3 = [o_new[0],o_new[1],this.orient3[2]];
    }
    GetGlobalPos3() {
        return [this.pos4[1], this.pos4[2], this.pos4[3]];
    }
    GetGlobalPos4() {
        return this.pos4;
    }
    GetGlobalVel4() {
        return this.vel4;
    }
    SetGlobalVel4(v4) {
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
    }
    SetGlobalVel3(vel3) {
        //v_squared = vel3[0]*vel3[0]+vel3[1]*vel3[1]+vel3[2]*vel3[2]
        var bx = vel3[0]/this.c;
        var by = vel3[1]/this.c;
        var bz = vel3[2]/this.c;
        var b_squared = bx*bx+by*by+bz*bz;
        var gamma = 1.0/Math.sqrt(1-b_squared);
        this.SetGlobalVel4([this.c*gamma,vel3[0]*gamma,vel3[1]*gamma,vel3[2]*gamma]);
    }
    GetObservedRelativePos3(obj) {
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
    GetObservedRelativeVel3(obj) {
        // global delta is the object's position in global coordinates,
        // but with the origin moved to the the observer
        var global_vel = obj.GetGlobalVel4();
        ///global_delta[0] = obj.GetGlobalPos4()[0]-this.GetGlobalPos4()[0];
        ///global_delta[1] = obj.GetGlobalPos4()[1]-this.GetGlobalPos4()[1];
        ///global_delta[2] = obj.GetGlobalPos4()[2]-this.GetGlobalPos4()[2];
        ///global_delta[3] = obj.GetGlobalPos4()[3]-this.GetGlobalPos4()[3];
        // Now, we can convert to the observer's coordinate system, but with
        // the origin still at the observer.
        var local_delta = [0.0,0.0,0.0,0.0];
        local_delta[0] = global_vel[0]*this.lorentz[0][0]+
                         global_vel[1]*this.lorentz[0][1]+
                         global_vel[2]*this.lorentz[0][2]+
                         global_vel[3]*this.lorentz[0][3];
        local_delta[1] = global_vel[0]*this.lorentz[0][1]+
                         global_vel[1]*this.lorentz[1][1]+
                         global_vel[2]*this.lorentz[1][2]+
                         global_vel[3]*this.lorentz[1][3];
        local_delta[2] = global_vel[0]*this.lorentz[0][2]+
                         global_vel[1]*this.lorentz[1][2]+
                         global_vel[2]*this.lorentz[2][2]+
                         global_vel[3]*this.lorentz[2][3];
        local_delta[3] = global_vel[0]*this.lorentz[0][3]+
                         global_vel[1]*this.lorentz[1][3]+
                         global_vel[2]*this.lorentz[2][3]+
                         global_vel[3]*this.lorentz[3][3];
        // We would use this if we wanted the answer in Observer coordinates
        //new_pos = self.__observer.GetGlobalPos4()+local_delta
        var new_pos = local_delta
        return [ new_pos[1]/new_pos[0], new_pos[2]/new_pos[0], new_pos[3]/new_pos[0] ];
    }
    GetLorentz() {
        return this.lorentz;
    }
    GetGlobalTime() {
        return this.pos4[0]/this.c;
    }
    ApplyForce(force3) {
        this.force = [0,force3[0],force3[1],force3[2]];
    }
    IncrementTime(delta_tau) {
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
};
