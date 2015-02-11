# -*- coding: utf-8 -*-
"""
Created on Thu Nov 03 10:32:13 2011

@author: Frank
"""

#Import Modules
from numpy import *
import os, pygame
from pygame.locals import *
import sr

import math

if not pygame.font: print 'Warning, fonts disabled'
if not pygame.mixer: print 'Warning, sound disabled'

pygame.font.init()
font = pygame.font.Font(None,16)

class Object2D(sr.Object):
    def __init__(self, universe, name, pos3, vel3, clock, restmass):
        sr.Object.__init__(self, universe, name, pos3, vel3, clock, restmass)
        self.__color = (255,255,255)
        self.__radius = 10
    def SetColor(self, color):
        self.__color = color
    def SetRadius(self, radius):
        self.__radius = radius
    def Draw(self, surf, center):
        pos = self._Object__universe.GetPos3Local(self)
        pos = (int(pos[0]+0.5)+center[0], int(pos[1]+0.5)+center[1])
        if self.__radius == 1:
            l = 3
            pygame.draw.line(surf, self.__color, (pos[0]-l,pos[1]), (pos[0]+l,pos[1]), 1) 
            pygame.draw.line(surf, self.__color, (pos[0],pos[1]-l), (pos[0],pos[1]+l), 1) 
            #pygame.draw.circle(surf, self.__color, pos, self.__radius, 1)
        else:
            pygame.draw.circle(surf, self.__color, pos, self.__radius, 0) 
        if self.GetName() != 'beacon':
            t = self.GetClock()
            txt = font.render("Clock=%s.%s" % (int(t),int(t*10)%10), True, self.__color)
            surf.unlock()
            surf.blit(txt, (pos[0]+self.__radius, pos[1]+self.__radius))
            surf.lock()
        
class Ship2D(sr.Object):
    def __init__(self, universe, name, pos3, vel3, clock, restmass):
        sr.Object.__init__(self, universe, name, pos3, vel3, clock, restmass)
        self.__color = (255,255,255)
        self.__wire = [(1.0,0.0),(-1.0,-0.7),(-0.5,0.0),(-1.0,0.7)]
        #self.__wire = [(-0.5,0.0),(0.5,-0.3),(-0.5,-0.6),
        #               (-0.9,-0.6),(-0.8,-0.5),(-0.3,-0.4),
        #               (-0.6,-0.3),(-0.3,-0.2),(-0.8,-0.1),
        #               (-0.8,0.1),(-0.3,0.2),(-0.6,0.3),
        #               (-0.3,0.4),(-0.8,0.5),(-0.9,0.6),
        #               (-0.5,0.6),(0.5,0.3)]
        self.__flame = [(-0.75,-0.35),(-1.5,0.0),(-0.75,0.35)]
        self.__toggle = False
        self.__thruster = False
        self.SetRadius(10)
    def SetColor(self, color):
        self.__color = color
    def SetRadius(self, radius):
        self.__radius = radius
    def Thrust(self, amount):
        if amount > 0:
            self.__thruster = True
        else:
            self.__thruster = False
        self.ApplyForce(self.GetOrientation()*amount)
    def Draw(self, surf, center):
        pos = self._Object__universe.GetPos3Local(self)
        pos = (int(pos[0]+0.5)+center[0], int(pos[1]+0.5)+center[1])
        vel4 = self.GetGlobalVel4()
        c = self._Object__c
        g = vel4[0]/self._Object__c
        gv = math.sqrt(dot(vel4[1:4],vel4[1:4]))
        v = gv/g
        t = self.GetClock()
        for r in range(50,600,50):
            center_offset = r
            center_pos = (int(pos[0]+vel4[1]/c*center_offset),int(pos[1]+vel4[2]/c*center_offset))
            radius = int(r*g)
            #center_pos = (int(pos[0]+xaxis[0]),int(pos[1]+xaxis[1]))
            pygame.draw.circle(surf, (64,64,64), center_pos, radius, 1)
        if self.__radius == 1:
            pygame.draw.circle(surf, self.__color, pos, self.__radius, 1)
        else:
            xaxis = self.GetOrientation()[0:2]
            yaxis = array([-xaxis[1],xaxis[0]])
            p_rots = []
            for p in self.__wire:
                p_rot = (p[0]*xaxis + p[1]*yaxis)*self.__radius
                p_rot[0] += pos[0]
                p_rot[1] += pos[1]
                p_rots.append(p_rot)
            pygame.draw.lines(surf, self.__color, True, p_rots, 1)
            if self.__toggle:
                self.__toggle = False
            else:
                self.__toggle = True
            if (self.__thruster and self.__toggle):
                p_rots = []
                for p in self.__flame:
                    p_rot = (p[0]*xaxis + p[1]*yaxis)*self.__radius
                    p_rot[0] += pos[0]
                    p_rot[1] += pos[1]
                    p_rots.append(p_rot)
                pygame.draw.lines(surf, self.__color, False, p_rots, 1)
        txt = font.render("v/c=%s%%, Clock=%s.%s" % (int(v/c*100),int(t),int(t*10)%10), True, self.__color)
        surf.unlock()
        surf.blit(txt, (pos[0]+self.__radius, pos[1]+self.__radius))
        surf.lock()

            
def main():
    """this function is called when the program starts.
       it initializes everything it needs, then runs in
       a loop until the function returns."""
#Initialize Everything
    pygame.init()
    size = (1024,768) #ipad
    #size = (640, 480)
    screen = pygame.display.set_mode(size)
    center = (size[0]/2,size[1]/2)
    pygame.display.set_caption('Starship 2')
    pygame.mouse.set_visible(0)

#Create The Backgound
    background = pygame.Surface(screen.get_size())
    background = background.convert()
    background.fill((0, 0, 0))

#Prepare Game Objects
    clock = pygame.time.Clock()
    u = sr.Universe()
    objects = []
    #for i in range(-14,15):
    #    for j in range(-14,14):
    for i in range(-10,11):
        for j in range(-10,11):
            if i==0 and j==0:
                continue
            beacon = Object2D(u, "beacon", (i*50,j*50,0), (0,0,0), 0, 1)
            #beacon = Object2D(u, "beacon", (math.cos(math.pi*i/7.5)*(j+15)*20,math.sin(math.pi*i/7.5)*(j+15)*20,0), (0,0,0), 0, 1)
            beacon.SetColor((128,128,128))
            beacon.SetRadius(1)
            objects.append(beacon)
    
    ship2   = Object2D(u, "ship2",   (-200,50,0), (0,0,0), 0, 10)
    #ship2   = Object2D(u, "ship2",   (-400,50,0), (50,0,0), 0, 10)
    ship2.SetColor((0,0,255))
    ship2.SetRadius(5)
    objects.append(ship2)
    ship3   = Object2D(u, "ship3",   (-200,150,0), (0,0,0), 0, 10)
    #ship3   = Object2D(u, "ship3",   (-350,50,0), (50,0,0), 0, 10)
    ship3.SetColor((255,0,0))
    ship3.SetRadius(5)
    objects.append(ship3)

    station = Object2D(u, "station",(0,0,0), (0,0,0), 0, 100)
    station.SetColor((255,255,0))
    station.SetRadius(10)
    objects.append(station)
    ship    = Ship2D(u, "ship",   (-200,50,0), (0,0,0), 0, 10)
    ship.SetColor((0,255,0))
    ship.SetRadius(20)
    objects.append(ship)

    u.SetObserver(ship)

    surf = pygame.display.get_surface()
    tau = 0
    delta_tau = 1.0/24.0
    
    delta_turn = 15.0 #degrees
    
    turn = 0.0
    thrust = 200.0
    
#Main Loop
    while True:
        clock.tick(int(1.0/delta_tau))

    #Handle Input Events
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                return
            """
            elif event.type == KEYDOWN:
                if event.key == K_ESCAPE:
                    pygame.quit()
                    return
                elif event.key == K_z:
                    turn = +delta_turn
                    ship.Turn(turn)
                elif event.key == K_x:
                    turn = -delta_turn
                    ship.Turn(turn)
            elif event.type == KEYUP:
                if event.key == K_z:
                    turn = 0.0
                    ship.Turn(turn)
                elif event.key == K_x:
                    turn = 0.0
                    ship.Turn(turn)
            elif event.type == MOUSEBUTTONDOWN:
                #ship.SetGlobalVel3((speed,0,0))
                #ship2.SetGlobalVel3((speed,0,0))
                #ship3.SetGlobalVel3((speed,0,0))
                if event.button == 1:
                    ship.ApplyForce(10*ship.GetOrientation())
                    #ship2.ApplyForce((10.0,0,0))
                    #ship3.ApplyForce((10.0,0,0))
                    if delta_tau == 0.0:
                        delta_tau = 1.0
                #else:
                    #ship.ApplyForce((-10.0,0,0))
                    #ship2.ApplyForce((-10.0,0,0))
                    #ship3.ApplyForce((-10.0,0,0))
            elif event.type is MOUSEBUTTONUP:
                ship.ApplyForce((0.0,0,0))
                ship2.ApplyForce((0.0,0,0))
                ship3.ApplyForce((0.0,0,0))
            """    
        keys = pygame.key.get_pressed()
        if keys[K_ESCAPE]:
            pygame.quit()
            return
        if keys[K_z] or keys[K_LEFT]:
            turn = +delta_turn
            ship.Turn(turn)
        if keys[K_x] or keys[K_RIGHT]:
            turn = -delta_turn
            ship.Turn(turn)
        if keys[K_SPACE] or keys[K_LCTRL] or keys[K_UP]:    
            ship.Thrust(thrust)
            if delta_tau == 0.0:
                delta_tau = 1.0
        else:
            ship.Thrust(0.0)
        if keys[K_0]:
            ship.SetGlobalVel3(ship.GetOrientation()*0.0)
        if keys[K_1]:
            ship.SetGlobalVel3(ship.GetOrientation()*10.0)
        if keys[K_2]:
            ship.SetGlobalVel3(ship.GetOrientation()*20.0)
        if keys[K_3]:
            ship.SetGlobalVel3(ship.GetOrientation()*30.0)
        if keys[K_4]:
            ship.SetGlobalVel3(ship.GetOrientation()*40.0)
        if keys[K_5]:
            ship.SetGlobalVel3(ship.GetOrientation()*50.0)
        if keys[K_6]:
            ship.SetGlobalVel3(ship.GetOrientation()*60.0)
        if keys[K_7]:
            ship.SetGlobalVel3(ship.GetOrientation()*70.0)
        if keys[K_8]:
            ship.SetGlobalVel3(ship.GetOrientation()*80.0)
        if keys[K_9]:
            ship.SetGlobalVel3(ship.GetOrientation()*90.0)
        if keys[K_BACKQUOTE]:
            ship.SetGlobalVel3(ship.GetOrientation()*99.0)

        if delta_tau != 0.0:
            u.MoveToObserverClock(tau)
            tau += delta_tau 
        
    #Draw Everything
        screen.blit(background, (0, 0))  
        surf.lock()
        for obj in objects:
            obj.Draw(surf, center)
        surf.unlock()
        pygame.display.flip()

#Game Over

#this calls the 'main' function when this script is executed
if __name__ == '__main__': main()
