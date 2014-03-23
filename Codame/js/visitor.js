/**
 * Created with JetBrains WebStorm.
 * User: elimak
 * Date: 3/22/14
 * Time: 6:01 PM
 * To change this template use File | Settings | File Templates.
 */

// namespace:
this.codamePlayground = this.codamePlayground||{};

(function() {
    "use strict";

    var Visitor = function( orbitsSS ){

        var ROOMS = {102:{minX:250, maxX:500,y:285},
                      101:{minX:520, maxX:690,y:285}};

        var currentRoomID;

        var LIGHT_WIDTH = 140;
        var LIGHT_HEIGHT = 140;

        var angles = [30,150,270];
        var radius = [2,2,2];
        var color = Math.random()*6;

        var frequency = 30;
        var amplitude = 1;

        var orbiting = false;

        var globalAngle = Math.round(Math.random()*359);

        var target = new createjs.SpriteContainer();
        var lights = [];
        var tail;
        var speed = -0.5;

        var light = new createjs.SpriteContainer();
        light.layers = [];
        light.layers[0] = getLayer("orbit0", 0, light); // coldest lights
        light.layers[1] = getLayer("orbit1", 1, light);
        light.layers[2] = getLayer("orbit2", 2, light);
        light.layers[3] = getLayer("orbit3", 3, light);
        light.layers[4] = getLayer("orbit4", 4, light);
        light.layers[5] = getLayer("orbit5", 5, light); // warmest lights
        light.layers[6] = getLayer("orbit6", 6, light); // white lights

        tail = new createjs.SpriteContainer();
        tail.layers = [];
        tail.layers[0] = getTailLayer("orbit0", 0, tail); // coldest lights
        tail.layers[1] = getTailLayer("orbit1", 1, tail);
        tail.layers[2] = getTailLayer("orbit2", 2, tail);
        tail.layers[3] = getTailLayer("orbit3", 3, tail);
        tail.layers[4] = getTailLayer("orbit4", 4, tail);
        tail.layers[5] = getTailLayer("orbit5", 5, tail); // warmest lights
        tail.layers[6] = getTailLayer("orbit6", 6, tail); // white lights

        target.addChild(tail);
        lights.push(light);

        target.addChild(light);
        lights.push(light);

        function getLayer(imgId, id, parent){

            var res = [];
            var alpha = ( color > id && color <= (id +1) )? color - id : 0;
            alpha = ( color < id && (color+1) >= id )? id - color : alpha;

            for(var i=0; i < 3; i++){
                var l = new createjs.Sprite(orbitsSS, imgId);
                l.scaleX =  l.scaleY = 0.1;
                l.x = Math.cos(convertAngle(angles[i])) * radius[i] - LIGHT_WIDTH* l.scaleX/2;
                l.y = Math.sin(convertAngle(angles[i])) * radius[i] - LIGHT_HEIGHT* l.scaleX/2;

                if(alpha != 0)   {
                    res.push(l);
                    parent.addChild(l);
                    l.xRef = l.x;
                    l.alphaRef = alpha;
                    l.alpha = alpha;
                }
            }
            return res;
        }

        function getTailLayer(imgId, id, parent){

            var res = [];
            var alpha = ( color > id && color <= (id +1) )? color - id : 0;
            alpha = ( color < id && (color+1) >= id )? id - color : alpha;

          //  console.log("-----------------------");
            for(var i=0; i < 15; i++){
                var l = new createjs.Sprite(orbitsSS, imgId);
                l.scaleX = 0.2+0.5*(i/15);
                l.scaleY = 0.05-0.05*(i/15);  // goes from 0.05 to 0.001
               // console.log("l.scaleX "+l.scaleX+" // l.scaleY "+l.scaleY+" -- i "+i);

                l.x = 3*i- l.scaleX* LIGHT_WIDTH/4;
                l.y = -l.scaleY * LIGHT_HEIGHT/2;

                if(alpha != 0)   {
                    res.push(l);
                    parent.addChild(l);
                    l.xRef = l.x;
                    l.alphaRef = alpha*((15-i)/15);
                    l.alpha = alpha*((15-i)/15);
                  // console.log("alpha "+alpha+" - imgId "+imgId+" tail");
                }

            }
            return res;
        }

        function convertAngle(degree){
            return degree * Math.PI / 180;
        }

        function hideHead(){
            var childNr,l;
            for(var i=0; i<lights.length; i++){
                childNr = lights[i].getNumChildren();
                for(var j=0; j < childNr; j++){
                    l =  lights[i].getChildAt(j);
                    l.alpha = 0;
                }
            }
            createjs.Tween.get(tail, {override:true}).to({scaleX:0}, 200);
        }

        function showHead(){
            var childNr,l;
            for(var i=0; i<lights.length; i++){
                childNr = lights[i].getNumChildren();
                for(var j=0; j < childNr; j++){
                    l =  lights[i].getChildAt(j);
                    l.scaleX = 0.2;
                    l.x = l.xRef-l.scaleX*LIGHT_WIDTH/4;
                    l.alpha = l.alphaRef* Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude)+0.1;
                }
            }
        }

        return {
            ui : target,
            setRoom : function(roomID){
                currentRoomID = roomID;
                var minX =  ROOMS[roomID].minX;
                var maxX = ROOMS[roomID].maxX;
                target.y = ROOMS[roomID].y;
                target.x = ROOMS[roomID].maxX - Math.random()*(ROOMS[roomID].maxX - ROOMS[roomID].minX);
            },
            keepAlive : function(){
                var maxX = ROOMS[currentRoomID].maxX;
                var minX =  ROOMS[currentRoomID].minX;

                 target.x += speed*Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude);
                 if(target.x > maxX){
                     speed = -0.5;
                     tail.rotation = 0;
                 }
                 else if(target.x < minX){
                     speed = +0.5;
                     tail.rotation = 180;
                 }

                var childNr;
                var l;
                for(var i=0; i<lights.length; i++){
                    childNr = lights[i].getNumChildren();
                    for(var j=0; j < childNr; j++){
                        l =  lights[i].getChildAt(j);
                        l.alpha = l.alphaRef* Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude)+0.1;
                        l.scaleX = Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude)/6 + 0.1;

                        l.x = l.xRef-l.scaleX*LIGHT_WIDTH/4;
                    }
                }
                //tail.rotation = globalAngle;
                tail.scaleX = Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude);
                //tail.alpha = tail.scaleX;
                globalAngle++;
            },
            moveToOrbit : function(point){
                var deltaY = point.y - target.y;
                var deltaX = point.x - target.x;

                var angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                tail.rotation = angleInDegrees+180;
                showHead();
                createjs.Tween.get(target, {override:true}).to({x:point.x,y:point.y}, 300).call(hideHead);
            },
            rotate: function(angle){
               tail.rotation = angle;
            },
            moveToRoom: function(roomID){
                currentRoomID = roomID;
                var randomX = ROOMS[roomID].maxX - Math.random()*(ROOMS[roomID].maxX - ROOMS[roomID].minX);
                var deltaY = target.y - ROOMS[roomID].y;
                var deltaX = target.x - randomX;

                var angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                tail.rotation = angleInDegrees;
                showHead();

                createjs.Tween.get(tail, {override:true}).to({scaleX:0.5}, 200).call(function(){
                    createjs.Tween.get(tail, {override:true}).to({scaleX:0}, 200);
                });
                createjs.Tween.get(target, {override:true}).to({x:randomX,y:ROOMS[roomID].y, scaleX:2}, 300).call(function(){
                    tail.rotation = (speed<0)? 0: 180;
                    createjs.Tween.get(target, {override:true}).to({scaleX:1}, 100);
                });

                if(orbiting){
                    orbiting = false;
                }
            }
        };
    };

    codamePlayground.Visitor = Visitor;
}());