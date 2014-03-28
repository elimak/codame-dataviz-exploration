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

    var Visitor = function( orbitsSS, inId ){

        var id = inId;

        var ROOMS = {
            102:{minX:250, maxX:500,y:285},
            101:{minX:520, maxX:680,y:285},
            201:{minX:505, maxX:680,y:155},
            2:{minX:120, maxX:200,y:415},
            1:{minX:250, maxX:680,y:415}};

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
        var speed = -0.5;

        var light, tail;

        function init(){
            if(target && target.getNumChildren() != 0) {
                target.removeAllChildren();
            }
            if(light && light.getNumChildren() != 0) {
                light.removeAllChildren();
            }
            if(tail && tail.getNumChildren() != 0) {
                tail.removeAllChildren();
            }
            light = new createjs.SpriteContainer();
            light.layers = [];
            tail = new createjs.SpriteContainer();
            tail.layers = [];

            for(var i=0; i < 7; i++){
                light.layers[i] = getLayer("orbit"+i, i, light); // coldest to warmest lights
                tail.layers[i]  = getTailLayer("orbit"+i, i, tail); // coldest to warmest lights
            }
            target.addChild(tail);
            target.addChild(light);
        }
        init();

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

            for(var i=0; i < 15; i++){
                var l = new createjs.Sprite(orbitsSS, imgId);
                l.scaleX = 0.2+0.5*(i/15);
                l.scaleY = 0.05-0.05*(i/15);  // goes from 0.05 to 0.001

                l.x = 3*i- l.scaleX* LIGHT_WIDTH/4;
                l.y = -l.scaleY * LIGHT_HEIGHT/2;

                if(alpha != 0)   {
                    res.push(l);
                    parent.addChild(l);
                    l.xRef = l.x;
                    l.alphaRef = alpha*((15-i)/15);
                    l.alpha = alpha*((15-i)/15);
                }
            }
            return res;
        }

        function convertAngle(degree){
            return degree * Math.PI / 180;
        }

        function hideHead(){
            var childNr,l;
            childNr = light.getNumChildren();
            for(var j=0; j < childNr; j++){
                l =  light.getChildAt(j);
                l.alpha = 0;
            }

            createjs.Tween.get(tail, {override:true}).to({scaleX:0}, 200);
        }

        function showHead(){
            var childNr,l;
            childNr = light.getNumChildren();
            for(var j=0; j < childNr; j++){
                l =  light.getChildAt(j);
                l.scaleX = 0.2;
                l.x = l.xRef-l.scaleX*LIGHT_WIDTH/4;
                l.alpha = l.alphaRef* Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude)+0.1;
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
                childNr = light.getNumChildren();
                for(var j=0; j < childNr; j++){
                    l =  light.getChildAt(j);
                    l.alpha = l.alphaRef* Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude)+0.1;
                    l.scaleX = Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude)/6 + 0.1;

                    l.x = l.xRef-l.scaleX*LIGHT_WIDTH/4;
                }

                tail.scaleX = Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude);
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
            reset:function(inId){
                color = Math.random()*6;
                id = inId;
                init();
            },
            getId : function(){
                return id;
            },
            getColor: function(){
              return color;
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