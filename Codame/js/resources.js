/**
 * Created with JetBrains WebStorm.
 * User: elimak
 * Date: 3/15/14
 * Time: 3:56 PM
 * To change this template use File | Settings | File Templates.
 */

// namespace:
this.codamePlayground = this.codamePlayground||{};

(function() {
    "use strict";

    var Resources = function(){

        var queue = new createjs.LoadQueue(true);
        queue.on("complete", handleLoad, this);

        var lightsSS;
        var orbitsSS;

        function handleLoad(evt) {
            publicApi.dispatchEvent("resourcesLoaded");
        }

        var publicApi = {
            load: function(){
                queue.loadManifest([
                    {id: "orbits", src: "assets/lights2.png"},
                    {id: "lights", src: "assets/lights7.png"},
                    {id: "circle", src: "assets/circle.jpg"},
                    {id: "beacons", src: "assets/beacons.json"}
                ], true);
            },
            getLightsSS: function(){
                if(lightsSS == null){
                    lightsSS = new createjs.SpriteSheet({
                        "animations":{
                            "light0": [0, 0],
                            "light1": [1, 1],
                            "light2": [2, 2],
                            "light3": [3, 3],
                            "light4": [4, 4],
                            "light5": [5, 5],
                            "light6": [6, 6]},
                        "images": [queue.getResult("lights")],
                        "frames": {
                            "height": 140,
                            "width":140,
                            "regX": 0,
                            "regY": 0,
                            "count": 7
                        }
                    });
                }
                return lightsSS;
            },
            getOrbitsSS: function(){
                if(orbitsSS == null){
                    orbitsSS = new createjs.SpriteSheet({
                        "animations":{
                            "orbit0": [0, 0],
                            "orbit1": [1, 1],
                            "orbit2": [2, 2],
                            "orbit3": [3, 3],
                            "orbit4": [4, 4],
                            "orbit5": [5, 5],
                            "orbit6": [6, 6]},
                        "images": [queue.getResult("orbits")],
                        "frames": {
                            "height": 140,
                            "width":140,
                            "regX": 0,
                            "regY": 0,
                            "count": 7
                        }
                    });
                }
                return orbitsSS;
            },
            getDebugDot : function() {
               return new createjs.Bitmap("assets/circle.jpg");
            },
            getBeaconsModel: function(){
                return queue.getResult("beacons");
            }
        };
        // make sure we "extends" the EventDispatcher
        createjs.EventDispatcher.initialize(publicApi);
        return publicApi;
    };

    codamePlayground.Resources = Resources;
}());
/*

function init() {
    if (location.search.match(/c2d/i)) {
        // force it to use Context2D if c2d appears in the query string: ex. Runners.html?c2d
        stage = new createjs.Stage("testCanvas");
    } else {
        stage = new createjs.SpriteStage("testCanvas");
    }

    var queue = new createjs.LoadQueue();
    queue.on("complete", handleLoad, this);
    queue.loadManifest([
        {id: "lights", src: "assets/lights2.png"},
        {id: "yellowCircle", src: "assets/yellowCircle.png"}
    ], true);
}

function handleLoad(evt) {
    setupUI(evt.target);
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.on("tick", tick, this);
}


function convertAngle(degree){
    return degree * Math.PI / 180;
}
 /*
function setupUI(queue) {

    for(var j=0; j< centralPoints.length; j++){
        var l = lightMaker();
        l.target.x = centralPoints[j].x;
        l.target.y = centralPoints[j].y;
        stage.addChild(l.target);
        lights.push(l);
    }
} */