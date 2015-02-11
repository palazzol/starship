# -*- coding: utf-8 -*-
"""
Created on Mon Oct 24 13:44:06 2011

@author: palazzol
"""

"""
A note on Coordinate systems:
    There are difference coordinate systems for every object.
    'Standard Coordinates' are coordinates a preferred object.
        All objects store their state in Standard Coordinates internally
    'Object Coordinates' are the local coordinates associated with each object
        
"""
    
    
from numpy import *
import pylab as plt

def Metric(a,b):
    'Minkowski Metric'
    return -(a[0]*b[0])+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]
            
def ProjectTime(pos, vel):
    'Solve the equation (pos-x*vel)^(pos-x*vel) == 0.0 for x>=0'
    A = Metric(vel,vel)
    B = Metric(pos,vel) * -2
    C = Metric(pos,pos)
    D=B*B-4*A*C
    if math.fabs(D)<1e-6:
        D = 0.0
    S = math.sqrt(D)
    if A>0.0:
        x = (-B-S)/(2*A)
    else:
        x = (-B+S)/(2*A)
    #print x
    if math.fabs(x)<1e-6:
        x = 0.0
    return x
    
class Universe():
    def __init__(self):
        self.__c = 100.0
        self.__observer = None
        self.__objects = []
    def AddObject(self, obj):
        self.__objects.append(obj)
    def GetObjects(self):
        return self.__objects
    def GetPos3Local(self, obj):
        "Get Object location in Observer Coordinates"
        return self.__observer.GetObservedRelativePos3(obj)
    def GetSpeedOfLight(self):
        return self.__c
    def SetSpeedOfLight(self, c):
        self.__c = c
    def SetObserver(self, obj):
        self.__observer = obj
    def GetObserver(self):
        return self.__observer
    def MoveToObserverClock(self, tau):
        'Actually move the observer to the event where this proper time is measured'
        delta_tau = tau-self.__observer.GetClock()
        self.__observer.IncrementTime(delta_tau)
        #print self.__observer.GetName(),delta_tau        
        for obj in self.__objects:
            if obj != self.__observer:
                'Move the object to the event where observer will "see" it'
                delta_tau = ProjectTime(self.__observer.GetGlobalPos4()-obj.GetGlobalPos4(), obj.GetGlobalVel4())
                #if obj.GetName() != 'beacon':
                #    print obj.GetName(),delta_tau        
                obj.IncrementTime(delta_tau)

class Object():
    'name, pos3, vel3, clock, restmass'
    def __init__(self, universe, name, pos3, vel3, clock, restmass):
        self.__universe = universe
        self.__c = self.__universe.GetSpeedOfLight()
        # Initialize the name
        self.__name = name
        # Initialize the position 4-vector in
        self.__pos4 = array([self.__c*clock,pos3[0],pos3[1],pos3[2]])
        # Initialize the velocity 4-vector
        self.SetGlobalVel3(vel3)
        # Initialize the clock
        self.__clock = clock 
        # Initialize the orientation
        self.__orient3 = array([1.0,0.0,0.0])
        # Initialize the rest mass
        self.__restmass = restmass
        #self.__accel4 = array([0.0,0.0,0.0,0.0])
        self.__force = array([0.0,0.0,0.0,0.0])
        self.__universe.AddObject(self)
    def GetName(self):
        return self.__name
    def GetClock(self):
        return self.__clock
    def SetClock(self,clock):
        self.__clock = clock
    def MoveToClock(self,clock):
        delta_tau = clock-self.__clock
        self.IncrementTime(delta_tau)
    def GetOrientation(self):
        return self.__orient3
    def Turn(self, degrees):
        radians = degrees*math.pi/180.0
        o_old = self.GetOrientation()
        o_new = array([0.0,0.0])
        o_new[0] = o_old[0]*math.cos(radians)+o_old[1]*math.sin(radians)
        o_new[1] = -o_old[0]*math.sin(radians)+o_old[1]*math.cos(radians)
        self.__orient3 = array([o_new[0],o_new[1],self.__orient3[2]])
    def GetGlobalPos3(self):
        return self.__pos4[1:4]  
    def GetGlobalPos4(self):
        return self.__pos4
    def GetGlobalVel4(self):
        return self.__vel4
    def SetGlobalVel3(self, vel3):
        #v_squared = vel3[0]*vel3[0]+vel3[1]*vel3[1]+vel3[2]*vel3[2]
        c = self.__c
        bx = vel3[0]/c
        by = vel3[1]/c
        bz = vel3[2]/c
        b_squared = bx*bx+by*by+bz*bz
        gamma = 1.0/math.sqrt(1-b_squared)
        self.SetGlobalVel4(array([c,vel3[0],vel3[1],vel3[2]])*gamma)
    def SetGlobalVel4(self, vel4):
        self.__vel4 = vel4
        gamma = self.__vel4[0]/self.__c
        bx = self.__vel4[1]/self.__c/gamma
        by = self.__vel4[2]/self.__c/gamma
        bz = self.__vel4[3]/self.__c/gamma
        b_squared = bx*bx+by*by+bz*bz
        self.__lorentz = zeros((4,4))
        if b_squared < 1e-6:
            self.__lorentz[0][0] = 1.0
            self.__lorentz[1][1] = 1.0
            self.__lorentz[2][2] = 1.0
            self.__lorentz[3][3] = 1.0
        else:    
            # Note 0,0 is not used right now either
            self.__lorentz[0][0] = gamma
            self.__lorentz[0][1] = -bx*gamma
            self.__lorentz[0][2] = -by*gamma
            self.__lorentz[0][3] = -bz*gamma
            #self.__lorentz[1][0] = self.__lorentz[0][1]             
            self.__lorentz[1][1] = 1.0+(gamma-1)*bx*bx/b_squared
            self.__lorentz[1][2] = (gamma-1)*bx*by/b_squared
            self.__lorentz[1][3] = (gamma-1)*bx*bz/b_squared
            #self.__lorentz[2][0] = self.__lorentz[0][2]             
            #self.__lorentz[2][1] = self.__lorentz[1][2]
            self.__lorentz[2][2] = 1.0+(gamma-1)*by*by/b_squared
            self.__lorentz[2][3] = (gamma-1)*by*bz/b_squared
            #self.__lorentz[3][0] = self.__lorentz[0][3]             
            #self.__lorentz[3][1] = self.__lorentz[1][3]
            #self.__lorentz[3][2] = self.__lorentz[2][3]
            self.__lorentz[3][3] = 1.0+(gamma-1)*bz*bz/b_squared
    def GetObservedRelativePos3(self, obj):
        # global delta is the object's position in global coordinates,
        # but with the origin moved to the the observer
        global_delta = obj.GetGlobalPos4()-self.GetGlobalPos4()
        # Now, we can convert to the observer's coordinate system, but with
        # the origin still at the observer.
        #local_delta = dot( self.__lorentz, global_delta )
        local_delta = array([0.0,0.0,0.0,0.0])
        #local_delta[0] = global_delta[0]*self.__lorentz[0][0]+ \
        #                 global_delta[1]*self.__lorentz[0][1]+ \
        #                 global_delta[2]*self.__lorentz[0][2]+ \
        #                 global_delta[3]*self.__lorentz[0][3]
        local_delta[1] = global_delta[0]*self.__lorentz[0][1]+ \
                         global_delta[1]*self.__lorentz[1][1]+ \
                         global_delta[2]*self.__lorentz[1][2]+ \
                         global_delta[3]*self.__lorentz[1][3]
        local_delta[2] = global_delta[0]*self.__lorentz[0][2]+ \
                         global_delta[1]*self.__lorentz[1][2]+ \
                         global_delta[2]*self.__lorentz[2][2]+ \
                         global_delta[3]*self.__lorentz[2][3]
        local_delta[3] = global_delta[0]*self.__lorentz[0][3]+ \
                         global_delta[1]*self.__lorentz[1][3]+ \
                         global_delta[2]*self.__lorentz[2][3]+ \
                         global_delta[3]*self.__lorentz[3][3]
        # We would use this if we wanted the answer in Observer coordinates
        #new_pos = self.__observer.GetGlobalPos4()+local_delta
        new_pos = local_delta
        return new_pos[1:4]
    def GetGlobalTime(self):
        return self.__pos4[0]/self.__c
    def ApplyForce(self, force3):
        self.__force = array([0,force3[0],force3[1],force3[2]])
        #vp = math.sqrt(dot(force3, force3))
        #bp = vp/self.__c
        #gp = 1.0/math.sqrt(1-bp*bp)
        #self.__dv = gp*array([self.__c,force3[0],force3[1],force3[2]])
        #self.__accel4 = self.__gamma/self.__restmass*array([sum(force3*self.__vel4[1:4])/self.__c,force3[0],force3[1],force3[2]])
    def IncrementTime(self,delta_tau):
        new_vel = self.__vel4 + self.__force*delta_tau/self.__restmass
        D_squared = dot( new_vel[1:4], new_vel[1:4] )
        gamma = 1.0/math.sqrt(1.0-D_squared/(self.__c*self.__c+D_squared))
        new_vel[0] = gamma*self.__c
        self.SetGlobalVel4(new_vel)
        #if self.__name == "ship":
            #print 'D_2=',D_squared
            #print 'b=',math.sqrt(D_squared/(self.__c*self.__c+D_squared))
            #print Metric(self.__vel4, self.__vel4), self.__vel4
            #print 'v_x =',self.__vel4[1]/gamma
            #print
        #self.__vel4 = p_after/self.__restmass
        #self.__gamma = self.__vel4[0]/self.__c
        #self.__vel4 = self.__vel4 + self.__accel4*delta_tau
        self.__pos4 = self.__pos4 + self.__vel4*delta_tau
        self.__clock += delta_tau
        #if self.GetName() != 'beacon':
        #    print self.__clock,delta_tau        

