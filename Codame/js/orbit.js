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

   var Orbit = function( orbitsSS, inId, inColor ){

        var id = inId;
        var color = inColor;
        var LIGHT_WIDTH = 140;
        var LIGHT_HEIGHT = 140;

        var angles = [30,150,270];
        var radius = [2,2,2];
        var light;

       var frequency = 15;
       var amplitude = 1;

        var globalAngle = Math.round(Math.random()*359);

        var target = new createjs.SpriteContainer();
        var lights;

       function init(){
           lights = [];
           for(var i=0; i<3; i++) {
               light = new createjs.SpriteContainer();
               light.layers = [];
               light.layers[0] = getLayer("orbit0", 0, light); // coldest lights
               light.layers[1] = getLayer("orbit1", 1, light);
               light.layers[2] = getLayer("orbit2", 2, light);
               light.layers[3] = getLayer("orbit3", 3, light);
               light.layers[4] = getLayer("orbit4", 4, light);
               light.layers[5] = getLayer("orbit5", 5, light); // warmest lights
               light.layers[6] = getLayer("orbit6", 6, light); // white lights

               lights.push(light);
           }
           target.addChild(light);
       }
       init();

        function getLayer(imgId, id, parent){

            var res = [];
            var alpha = ( color > id && color < (id +1) )? color - id : 0;
            alpha = ( color < id && (color+1) > id )? id - color : alpha;

            for(var i=0; i < 3; i++){
                var l = new createjs.Sprite(orbitsSS, imgId);
                l.scaleX =  l.scaleY = 0.1;
                l.x = Math.cos(convertAngle(angles[i])) * radius[i] - LIGHT_WIDTH* l.scaleX/2;
                l.y = Math.sin(convertAngle(angles[i])) * radius[i] - LIGHT_HEIGHT* l.scaleX/2;

                if(alpha != 0)   {
                    res.push(l);
                    parent.addChild(l);
                }
                l.alpha = alpha;
            }
            return res;
        }

        function convertAngle(degree){
            return degree * Math.PI / 180;
        }

        return {
            ui : target,
            getId:function(){
                return id;
            },
            reset: function (inId, inColor){
                id = inId;
                color = inColor;
                if(!light.parent){
                    init();
                   // console.log("-------------------------- >Orbit id "+id+" - was recycled and should now be visible");
                }
            },
            show: function(){
                if(!light.parent){
                    target.addChild(light);
                    // console.log("-------------------------- >Orbit id "+id+" - was hidden and should now be visible");
                }
            },
            hide: function(){
                if(light.parent){
                    target.removeChild(light);
                    // console.log("-------------------------- >Orbit id "+id+" - removing light children!");
                }

            },
            setIntensity : function(intensity){
                var ang;
                for(var i=0; i<lights.length; i++){

                    lights[i].scaleX = lights[i].scaleY = 0.5+Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude - (0.05*i);
                    ang = globalAngle+i*intensity/100;//lights[i].scaleX;
                    lights[i].x = Math.cos(ang) * (Math.round(Math.random()*2)+20);
                    lights[i].y = Math.sin(ang) * (Math.round(Math.random()*2)+20);
                }
                light.alpha = Math.abs(Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude);
                globalAngle +=0.08;
            }
        };
    };

    codamePlayground.Orbit = Orbit;
}());