/**
 * Created with JetBrains WebStorm.
 * User: elimak
 * Date: 3/15/14
 * Time: 4:14 PM
 * To change this template use File | Settings | File Templates.
 */

// namespace:
this.codamePlayground = this.codamePlayground||{};

(function() {
    "use strict";

    var Controller = function(){

        var intensityInd = [25, 12,98, 50, 95, 50, 95, 87, 54, 12, 95, 87, 54, 12 ];
        var intensityInc = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2];

        var stage,
            mode; // live or replay

        var resources = new codamePlayground.Resources();
        resources.on("resourcesLoaded", handleLoad, this);

        // models
      /*  var liveData,
            replayData;  */

        var pulsars = [];
        var orbits = [];
        var visitor;
        var incr = +0.1;

        /**
         * The assets are loaded
         * @param evt
         */
        function handleLoad(evt){
           // set the frame rate of the whole visualization
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.on("tick", tick, this);

            // instantiate the beacons
            var beacons = resources.getBeaconsModel();
            var i;

            for(i=0; i<15;i++){
                var b = beacons[Math.round(Math.random()*(beacons.length-1))];
                var orbit = new codamePlayground.Orbit(resources.getOrbitsSS());
                orbit.ui.x = b.position.x;
                orbit.ui.y = b.position.y;
                stage.addChild(orbit.ui);
                orbits.push(orbit);
            }

            visitor = codamePlayground.Visitor(resources.getOrbitsSS());
            visitor.setRoom(102);
            stage.addChild(visitor.ui);

           for(i=0; i< beacons.length; i++){
                var pulsar = new codamePlayground.Pulsar(resources.getLightsSS());
                pulsar.ui.x = beacons[i].position.x;
                pulsar.ui.y = beacons[i].position.y;
                pulsar.ui.scaleX = pulsar.ui.scaleY = 0.3;
                pulsar.name = beacons[i].id;

                stage.addChild(pulsar.ui);
                pulsars.push(pulsar);
            }
        }

        function tick(evt) {

            for(var i=0; i< pulsars.length; i++){
                var pulsar = pulsars[i];

                intensityInd[i] += intensityInc[i];
                if(intensityInd[i] > 80) intensityInc[i] = -0.05;
                if(intensityInd[i] < 0) intensityInc[i] = +0.05;

                pulsar.setIntensity(intensityInd[i]);
            }


            if(createjs.Ticker.getTicks()<250) {
                visitor.keepAlive(102);
            }
            else if(createjs.Ticker.getTicks()>250 && createjs.Ticker.getTicks()<500){
                visitor.keepAlive();
            }
            else if(createjs.Ticker.getTicks()==500){
                visitor.moveToOrbit({x:565,y:225});
            }
            else if(createjs.Ticker.getTicks()==600){
                visitor.moveToRoom(102);
            }
            else if(createjs.Ticker.getTicks()>900 && createjs.Ticker.getTicks()<1200){
                visitor.keepAlive();
            }
            else if(createjs.Ticker.getTicks()== 1200){
                visitor.moveToOrbit({x:388,y:225});
            }
            else if(createjs.Ticker.getTicks()== 1300){
                visitor.moveToRoom(101);
            }
            else if(createjs.Ticker.getTicks()== 1500){
                visitor.moveToRoom(102);
            }

            for(i=0; i<orbits.length; i++){
                orbits[i].setIntensity(Math.round(Math.random()*100));
            }

            stage.update(evt);
        }

         return {
             start : function(){
                 // create WebGL or Canvas 2D context
                 if (location.search.match(/c2d/i)) {
                     stage = new createjs.Stage("testCanvas"); // force it to use Context2D if c2d appears in the query string: ex. Runners.html?c2d
                 } else {
                     stage = new createjs.SpriteStage("testCanvas");
                 }
                 resources.load();
             }
         }
    };

   codamePlayground.Controller = Controller;
}());
