/**
 * Created with JetBrains WebStorm.
 * User: elimak
 * Date: 3/13/14
 * Time: 3:04 PM
 * To change this template use File | Settings | File Templates.
 */

// namespace:
this.codamePlayground = this.codamePlayground||{};

(function() {
    "use strict";

     var Pulsar = function( lightsSS ){

        var intensityRange = [];

        var LIGHT_WIDTH = 140;
        var LIGHT_HEIGHT = 140;

         var angles = [30, 150, 270];
         var radius = [20,20,20];
         var frequency = 15;
         var amplitude = 0.2;
         var lightIndex = 0;
         var variation;
         var direction = 1;

        var target = new createjs.SpriteContainer();
        target.layers = [];
        target.layers[0] = getLayer("light0"); // coldest lights
        target.layers[1] = getLayer("light1");
        target.layers[2] = getLayer("light2");
        target.layers[3] = getLayer("light3");
        target.layers[4] = getLayer("light4");
        target.layers[5] = getLayer("light5"); // warmest lights

        target.layers[6] = getLayer("light6"); // white lights

        function getLayer(imgId){

            var res = [];
            for(var i=0; i < 3; i++){
                var l = new createjs.Sprite(lightsSS, imgId);
                l.x = Math.cos(convertAngle(angles[i])) * radius[i] - LIGHT_WIDTH/2;
                l.y = Math.sin(convertAngle(angles[i])) * radius[i] - LIGHT_HEIGHT/2;
                res.push(l);
                target.addChild(l);
                l.alpha = 0;
            }
            return res;
        }

        function convertAngle(degree){
            return degree * Math.PI / 180;
        }

         function getRangeValue (range1, range2, value){
             if( value < range1[0] || value > range1[1] ){
                 return 0;
             }
             else{
                 var prcnt = Math.round((value - range1[0]) / (range1[1] - range1[0]) * 100);
                 return (range2[1] - range2[0]) * prcnt / 100 + range2[0];
             }
         }

         function setLayers(index, intensity){
             var set = target.layers[index];
             var sX, sY, a;

             switch (index){
                 case 0:         // range is [0, 20]
                     sX = sY = getRangeValue([-10, 30], [0.1, 1.2], intensity);   // scale range is [0.1, 1.2]
                     a = getRangeValue([-10, 10], [0, 1], intensity);             // scale range is [0.1, 1.2]
                     a = a!= 0 ? a : getRangeValue([10, 30], [1, 0], intensity);  // scale range is [0.1, 1.2]
                     // console.log("case 0 = "+sX+" -alpha- "+a);
                     break;
                 case 1:         // range is [20, 40]
                     sX = sY = getRangeValue([8, 48], [0.1, 1.2], intensity);   // scale range is [0.1, 1.2]
                     a = getRangeValue([8, 28], [0, 1], intensity);             // scale range is [0.1, 1.2]
                     a = a!= 0 ? a : getRangeValue([28, 48], [1, 0], intensity);  // scale range is [0.1, 1.2]
                     //  console.log("case 1 = "+sX+" -alpha- "+a);
                     break;
                 case 2:         // range is [40, 60]
                     sX = sY = getRangeValue([26, 66], [0.1, 1.2], intensity);   // scale range is [0.1, 1.2]
                     a = getRangeValue([26, 46], [0, 1], intensity);             // scale range is [0.1, 1.2]
                     a = a!= 0 ? a : getRangeValue([46, 66], [1, 0], intensity);  // scale range is [0.1, 1.2]
                     // console.log("case 2 = "+sX+" -alpha- "+a);
                     break;
                 case 3:         // range is [60, 80]
                     sX = sY = getRangeValue([44, 84], [0.1, 1.2], intensity);   // scale range is [0.1, 1.2]
                     a = getRangeValue([44, 64], [0, 1], intensity);             // scale range is [0.1, 1.2]
                     a = a!= 0 ? a : getRangeValue([64, 84], [1, 0], intensity);  // scale range is [0.1, 1.2]
                     //  console.log("case 3 = "+sX+" -alpha- "+a);
                     break;
                 case 4:         // range is [80, 100]
                     sX = sY = getRangeValue([62, 102], [0.1, 1.2], intensity);   // scale range is [0.1, 1.2]
                     a = getRangeValue([62, 82], [0, 1], intensity);             // scale range is [0.1, 1.2]
                     a = a!= 0 ? a : getRangeValue([82,102], [1, 0], intensity);  // scale range is [0.1, 1.2]
                     //   console.log("case 4 = "+sX+" -alpha- "+a);
                     break;
                 case 5:         // range is [80, 100]
                     sX = sY = getRangeValue([80, 120], [0.1, 1.2], intensity);   // scale range is [0.1, 1.2]
                     a = getRangeValue([80, 100], [0, 1], intensity);             // scale range is [0.1, 1.2]
                     a = a!= 0 ? a : getRangeValue([100,120], [1, 0], intensity);  // scale range is [0.1, 1.2]
                     //   console.log("case 4 = "+sX+" -alpha- "+a);
                     break;

                 case 6:         // range is [80, 100]
                     sX = sY = getRangeValue([60, 110], [0.1, 0.5], intensity);   // scale range is [0.1, 1.2]
                     a = getRangeValue([50, 80], [0, 0.8], intensity);             // scale range is [0.1, 1.2]
                     a = a!= 0 ? a : getRangeValue([80,110], [0.8, 0], intensity);  // scale range is [0.1, 1.2]
                     //   console.log("case 4 = "+sX+" -alpha- "+a);
                     break;
             }

             for(var i=0; i < 3; i++){
                 var l = set[i];
                 l.scaleX = sX;
                 l.scaleY = sY;
                 var ang = angles[i] + 70*index;
                 if(index === 6) radius[i] -= 3;
                 l.x = Math.cos(convertAngle(ang)) * radius[i]*(sX+0.2) - LIGHT_WIDTH/2*sX;
                 l.y = Math.sin(convertAngle(ang)) * radius[i]*(sY+0.2) - LIGHT_HEIGHT/2*sY;
                 l.alpha = a;
                 if(index === 6) l.alpha = Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude;
             }
         }

         function applyVariation(){
             lightIndex += variation*direction;
             if(lightIndex >= intensityRange[1]){
                 direction = -1;
             }
             if( lightIndex <= intensityRange[0]) {
                 direction = +1;
             }
         }

        return {
            ui : target,
            setIntensity : function( intensity ){ // from 0 to 100
                variation = intensity / 250;
                switch (true){
                    case intensity < 20:
                        intensityRange = [0, 20];
                        break;
                    case intensity >= 20 && intensity < 40:
                        intensityRange = [20, 40];
                        break;
                    case intensity >= 40 && intensity < 60:
                        intensityRange = [40, 60];
                        break;
                    case intensity >= 60 && intensity < 80:
                        intensityRange = [60, 80];
                        break;
                    case intensity >= 80 && intensity <= 100:
                        intensityRange = [80, 100];
                        break;
                }

                applyVariation();

                frequency = 8+lightIndex/6;
                amplitude = 0.1+lightIndex/500;

                for(var i=0; i < angles.length; i++){
                    angles[i] = angles[i] +(lightIndex/25 * 0.8);
                    radius[i] = 10+lightIndex/15 + Math.sin(createjs.Ticker.getTicks()/frequency)*amplitude;
                }

                setLayers(0, lightIndex);
                setLayers(1, lightIndex);
                setLayers(2, lightIndex);
                setLayers(3, lightIndex);
                setLayers(4, lightIndex);
                setLayers(5, lightIndex);
                setLayers(6, lightIndex);
            }
        };
     };

     codamePlayground.Pulsar = Pulsar;
}());