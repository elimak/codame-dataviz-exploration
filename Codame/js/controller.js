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

        var resources = new codamePlayground.Resources();
        resources.on("resourcesLoaded", handleLoad, this);

        var timestampBegin = 1398970800 + 60*60*2;
        var timestampEnd = timestampBegin + 60*60*24;

        var timeHtml = document.getElementById("time");

/**
 * The assets are loaded
 */
        var pulsars = {};
        var stage, visitorsRecords, beaconsModel;

        function handleLoad(evt){

           // set the frame rate of the whole visualization
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.on("tick", tick, this);

            visitorsRecords = resources.getVisitorsModel();
            beaconsModel = resources.getBeaconsModel();

            // instantiate the beacons aka pulsars

           for(var i=0; i< beaconsModel.length; i++){
                var pulsar = new codamePlayground.Pulsar(resources.getLightsSS());
                pulsar.ui.x = beaconsModel[i].position.x;
                pulsar.ui.y = beaconsModel[i].position.y;
                pulsar.ui.scaleX = pulsar.ui.scaleY = 0.2;
                pulsar.name = beaconsModel[i].id;
                pulsar.intensityInc = 0.2;
                pulsar.intensityInd = 0;
                pulsar.orbitCount = 0;

                stage.addChild(pulsar.ui);
                pulsars[pulsar.name] = pulsar;
            }
        }

/**
 * ---------------------
 * Get Visitor & Get Orbit
 */
        var visLoop = 0;
        var visTempCopy = [];
        var activeVisitors = [];
        var visitorsPool = [];
        var orbitsPool = [];
        var orbits = [];
        var visitors = {};

        function updateActiveVisitors (newTimestp){

            visLoop = 0;
            visTempCopy = [];
            activeVisitors = [];
            while(visLoop < visitorsRecords.length){
               if(visitorsRecords[visLoop].timestamp <= newTimestp ){
                   activeVisitors.push(visitorsRecords[visLoop]);
               }
                else{
                   visTempCopy.push(visitorsRecords[visLoop]);
               }
                visLoop ++;
            }
            visitorsRecords = visTempCopy;
        }

/**
 * ---------------------
 * Get Visitor & Get Orbit
 * if exist, or borrow one from the pool
 */
        function getVisitorObjById ( id ){
            if(!visitors[id]){
                borrowVisitor(id);
            }
            return visitors[id];
        }

        function getOrbitObjById ( id ){
            if(!orbits[id]){
                borrowOrbit(id);
            }
            return orbits[id];
        }

/**
 * --------------------------
 * Borrow Visitor & Borrow Orbit
 * from the pool, if none available, create new
 */
        function borrowVisitor (id){
           if(visitorsPool.length > 0){
               var r = visitorsPool.pop();
               r.reset(id);
               visitors[id] =  r;
           }else{
               visitors[id] = new codamePlayground.Visitor(resources.getOrbitsSS(), id);
           }
            // by default the visitor is on the sidewalk
            visitors[id].ui.x = 750;
            visitors[id].ui.y = 285;
            stage.addChild(visitors[id].ui);
        }

        function borrowOrbit (id){
           if(orbitsPool.length > 0){
               var r = orbitsPool.pop();
               r.reset(id, visitors[id].getColor() );
               orbits[id] =  r;
           }else{
               orbits[id] = new codamePlayground.Orbit(resources.getOrbitsSS(), id, visitors[id].getColor());
           }
            stage.addChild(orbits[id].ui);
        }

/**
 * --------------------------
 * Release Visitor & Release Orbit
 * Push object into the pool when its not used anymore, so it can be recycled
 */
        function releaseOrbit (orbitObj){
            orbitsPool.push(orbitObj);
            stage.removeChild(orbitObj.ui);
            delete orbits[orbitObj.getId()];
        }

        function releaseVisitor (visitorObj){
            visitorsPool.push(visitorObj);
            stage.removeChild(visitorObj.ui);
            delete visitors[visitorObj.getId()];
        }

/**
 * --------------------------
 * Lookup the position {x:n, y:n} for a beacon id
 */
        function getBeaconPosition( id ){

             for(var i=0; i < beaconsModel.length; i++) {
                 if(beaconsModel[i]["id"] === id){
                     return beaconsModel[i]["position"]
                 }
             }
             return {x:0,y:0};
        }

/**
 * --------------------------
 * Ticking!! Were life is taking place!
 */
        var visitorToUpdate,
            orbitToUpdate,
            orbitPos,
            nowTicking;

        function tick(evt) {
            nowTicking = timestampBegin+createjs.Ticker.getTicks()*2;
            timeHtml.innerHTML = moment.unix(nowTicking).format("ddd, MMM Do h:mm A");

            // activeVisitors will now list all the visitor records that occurred before nowTicking and were not yet visualized
            updateActiveVisitors( nowTicking );

            // if we have any record to update:
            if(activeVisitors.length>0){

                for(visLoop=0; visLoop<activeVisitors.length; visLoop++){

                    // store the id to update
                    visitorToUpdate = getVisitorObjById(activeVisitors[visLoop].app);
                    orbitToUpdate = getOrbitObjById(activeVisitors[visLoop].app);

                    if( activeVisitors[visLoop].ibeacons.length === 0){
                         releaseVisitor(visitorToUpdate);
                         releaseOrbit(orbitToUpdate);
                    }
                    else if(activeVisitors[visLoop].ibeacons.length === 1){
                        // treating an exception here !!
                        if(activeVisitors[visLoop].ibeacons[0] === 1013) {

                            // the visitor is orbiting around an exhibit
                            orbitPos = getBeaconPosition(activeVisitors[visLoop].ibeacons[0]);
                            visitorToUpdate.moveToOrbit(orbitPos);
                            visitors[activeVisitors[visLoop].app].orbiting = 1013;
                        }
                        else{
                            // the visitor is in the room
                            visitorToUpdate.moveToRoom(activeVisitors[visLoop].ibeacons[0]);
                            visitors[activeVisitors[visLoop].app].orbiting = -1;
                        }
                    }
                    else if(activeVisitors[visLoop].ibeacons.length === 2){
                        // the visitor is orbiting around an exhibit
                        orbitPos = getBeaconPosition(activeVisitors[visLoop].ibeacons[1]);
                        visitorToUpdate.moveToOrbit(orbitPos);
                        visitors[activeVisitors[visLoop].app].orbiting = activeVisitors[visLoop].ibeacons[1];
                    }

                    if(visitors[activeVisitors[visLoop].app] && visitors[activeVisitors[visLoop].app].orbiting >= 0){
                        orbitToUpdate.ui.x = orbitPos.x;
                        orbitToUpdate.ui.y = orbitPos.y;
                    }
                }
            }

            var pulsar;
            for(var pulsarID in pulsars){
                pulsar = pulsars[pulsarID];
                pulsar.orbitCount = 0;
            }

            for( var id in visitors ){
                if(visitors[id].orbiting > 0){
                    pulsar = pulsars[visitors[id].orbiting];
                    pulsar.orbitCount++;
                    orbits[id].setIntensity(Math.round(Math.random()*100));
                    orbits[id].show();
                }
                else{
                    orbits[id].hide();
                }

            }

            /**
             * Update the intensity of the ibeacons aka pulsars
             */
            for(var pulsarID in pulsars){
                pulsar = pulsars[pulsarID];
                var max, min;

                switch (true){
                    case pulsar.orbitCount == 0:
                        max = 20; min=0;
                        if(pulsar.intensityInd > 16) pulsar.intensityInd = 16;

                        break;
                    case pulsar.orbitCount == 1 :
                        max = 40; min=20;
                        if(pulsar.intensityInd > 41) pulsar.intensityInd = 41;
                        if(pulsar.intensityInd < 19) pulsar.intensityInd = 19;

                        break;
                    case pulsar.orbitCount == 2:
                        max = 65; min=40;
                        if(pulsar.intensityInd > 36) pulsar.intensityInd = 36;
                        if(pulsar.intensityInd < 24) pulsar.intensityInd = 24;

                        break;
                    case pulsar.orbitCount >= 3 :
                        max = 80; min=60;
                        if(pulsar.intensityInd > 81) pulsar.intensityInd = 81;
                        if(pulsar.intensityInd < 59) pulsar.intensityInd = 59;

                        break;
                }

                pulsar.intensityInd += pulsar.intensityInc;
                if(pulsar.intensityInd > max) pulsar.intensityInc = -1;
                if(pulsar.intensityInd < min) pulsar.intensityInc = +1;

                pulsar.setIntensity(pulsar.intensityInd);
            }

            stage.update(evt);
        }

/**
 *  Public API of the controller
 *  --> start();
 */
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
