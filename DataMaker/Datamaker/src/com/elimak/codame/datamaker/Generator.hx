package com.elimak.codame.datamaker;
import haxe.ds.HashMap.HashMap;
import haxe.Json;
import neko.Lib;
import sys.io.File;
import sys.io.FileOutput;

/**
 * [
    {"timestamp": 1395262912, "app":10, "ibeacons": [102]},
    {"timestamp": 1395263008, "app":10, "ibeacons": [102, 1201]},
    {"timestamp": 1395275987, "app":10, "ibeacons": [102]},
    {"timestamp": 1395310324, "app":10, "ibeacons": [101]},
    {"timestamp": 1395332654, "app":10, "ibeacons": []},
]
 */

/**
 * ...
 * @author elimak
 */
class Generator{

	private var timestampStart:Float;
	private var window:Int;
	private var entranceProbabilities:Array<Dynamic>;
	
	private var entries : Array<Int>;
	private var outputObject : Array<String>;
	private var roomVisited : Map<Int, Bool>;
	
	private var f : FileOutput;
	
	public function new() {
		timestampStart = 1398970800;
		
		var tMilli = Std.parseFloat(Std.string(timestampStart) + "000");
		//
		Lib.println("Initial date & time " + Date.fromTime(tMilli));
		
		window = convertHourToSec(24);
		outputObject = [];
		roomVisited = new Map();
		roomVisited.set(1013, false);
		roomVisited.set(101, false);
		roomVisited.set(102, false);
		roomVisited.set(201, false);
		roomVisited.set(2, false);
		roomVisited.set(1, false);
		
		entries = [101, 1013]; // 2 checkins likely to occur first
		
		entranceProbabilities = [ { chance:[0, 0.25], range:[2, 7] }, { chance:[0.25, 0.85], range:[7, 9] }, { chance:[0.85, 0.95], range:[9, 10] }, { chance:[0.95, 1], range:[10, 11] } ];
	}
	
	public function buildData(nLoop: Int) {
		var entryT	: Float;
		var entryiB : Int;
		var appId 	: Int;
		
		for (i in 0...nLoop) {
			appId = i;
			entryT = randomizeEntryTime();
			entryiB = entries[ Math.round(randomizeInRange(0, 1))];
			roomVisited.set(entryiB, true);
			
			startPath(appId, entryT, entryiB);
		}
		var str : String = "["+"\n";
		for (i in 0...outputObject.length) {
			
			var obj = Json.parse(outputObject[i]);
			var t = Std.parseFloat(Std.string(Reflect.getProperty(obj, "timestamp")) + "000") ;
		
			str += outputObject[i];
			str += (i == (outputObject.length - 1))? "" : ",";
			str += /* +" // "+Date.fromTime(t)*/ "\n";
		}
		str += "]";
		
		f = File.write( "data50.json", true);
		f.writeString( str );
		f.close();
		
		var js : Array<Dynamic> = untyped Json.parse(str);
		//Lib.println(js[0].timestamp);
		//Lib.println(Std.parseFloat(Reflect.getProperty(js[0], "timestamp")));
		//var n1, n2;
		js.sort( function(a:Dynamic, b:Dynamic):Int {
				/*n1 = Std.parseFloat();
				n2 = Std.parseFloat(b.timestamp);*/
				if (a.timestamp < b.timestamp) return -1;
				if (a.timestamp > b.timestamp) return 1;
				return 0;
			} );
			
		f = File.write( "data50Sorted.json", true);
		f.writeString( Json.stringify(js) );
		f.close();
		
		/*
		arrayOfStrings.sort( function(a:String, b:String):Int
			{
				a = a.toLowerCase();
				b = b.toLowerCase();
				if (a < b) return -1;
				if (a > b) return 1;
				return 0;
			} );
		*/
			
		Lib.println(str);
	}
	
	function startPath(appId:Int, entryT:Float, entryiB:Int) {
		var tMilli = Std.parseFloat(Std.string(entryT) + "000");

		// sidewalk || lobby
		var durationInRoom : Int = (entryiB == 1013 )? convertMinuteToSec(Math.floor(randomizeInRange(3.0, 15.0))) : convertMinuteToSec(Math.floor(randomizeInRange(5.0, 50.0)));
		var isExiting = randomizeWithChance(5);
		
		outputObject.push( '{ "timestamp": ' + entryT + ', "app":' + appId + ', "ibeacons": [' + entryiB + '] }' );

		var roomID : Int;
		var t : Float = entryT;
		var count = 0;
		
		if (entryiB == 101)
			buildPathInRoom(t, durationInRoom, entryiB, appId);
		
		while (!isExiting) {
			roomID = getNextRoom(entryiB);
			roomVisited.set(roomID, true);

			t += durationInRoom;
			outputObject.push( '{ "timestamp": ' + t + ', "app":' + appId + ', "ibeacons": [' + roomID + '] }' );
			
			durationInRoom = (roomID == 1013 )? convertMinuteToSec(Math.floor(randomizeInRange(3.0, 8.0))) : convertMinuteToSec(Math.floor(randomizeInRange(0.5, 35.0)));
			buildPathInRoom(t, durationInRoom, roomID, appId);
			//t += durationInRoom;
			
			var durationOfPresence = convertSecToMinutes((t - entryT));
			var chanceOfExit = (durationOfPresence < 60) ? 15 : ((durationOfPresence < 120) ? 40 : 70); 
			
			isExiting = (roomID == 101 || roomID == 1013)? randomizeWithChance(chanceOfExit) : false;	
			if (count == 0) isExiting = false;
			if (count > 10) isExiting = true;

			entryiB = roomID;
			count ++;
		}
		t += durationInRoom;
		outputObject.push('{ "timestamp": '+t+', "app":'+appId+', "ibeacons": [] }' );
	}

	/**
	 * 
	 * @param	tStart
	 * @param	durationInRoom
	 * @param	roomID
	 * @param	appId
	 */
	function buildPathInRoom(tStart:Float, durationInRoom:Int, roomID:Int, appId: Int) {
		
		var exhibits : Array<Int> = [];
		var durationSequence = convertMinuteToSec(Math.round(randomizeInRange(1.0, 4.0)));
		var durationAdded = durationSequence;
		
		var currentCheckin = roomID;
		
		switch (roomID) {
			case 1013: 	// sidewalk
				exhibits = [];
			case 101: 	// lobby
				exhibits = [1012, 1011];
			case 102: 	// theater
				exhibits = [1021];
			case 201: 	// open room
				exhibits = [2001, 2002];
			case 2: 	// back room
				exhibits = [22, 21];
			case 1:		// dance floor
				exhibits = [14, 11,15,12,13];
		}
		
		while ( durationAdded < durationInRoom && exhibits.length > 0) {
			var exhibitCheckedIn = (roomID == 1013) ? false : randomizeWithChance(50);
			var newCheckin : Int = roomID;
			if ( exhibitCheckedIn) {
				newCheckin = exhibits[Math.round(randomizeInRange(0.0, (exhibits.length - 1)))];
			}
			if ( newCheckin != currentCheckin) {
				if (roomID != newCheckin) {
					outputObject.push('{ "timestamp": '+(tStart + durationAdded)+', "app":'+appId+', "ibeacons": ['+roomID+", "+newCheckin+'] }' );
				}
				else {
					outputObject.push('{ "timestamp": '+(tStart + durationAdded)+', "app":'+appId+', "ibeacons": ['+newCheckin+'] }' );
				}
				
				durationSequence = convertMinuteToSec(Math.round(randomizeInRange(1.0, 8.0)));
				durationAdded += durationSequence;
				currentCheckin = newCheckin;
			}
		}
		if ( currentCheckin != roomID) {
			outputObject.push( '{ "timestamp": '+ (tStart + durationAdded)+', "app":'+appId+', "ibeacons": ['+roomID+'] }' );
		}
	}
	
	function getNextRoom(roomId:Int): Int {
		
		var nextR = -1;
		switch (roomId) {
			case 1013: 	// sidewalk
				nextR = 101;
			case 101: 	// lobby
				var r;
				if (!roomVisited.get(201) && !roomVisited.get(102)) {
					r = Math.round(randomizeInRange(0, 1));
					r != 0 ? (nextR = 201): (nextR = 102);
				}
				if (roomVisited.get(201) && !roomVisited.get(102)) {
					nextR = 102;
				}
				if (!roomVisited.get(201) && roomVisited.get(102)) {
					nextR = 201;
				}
				else if (roomVisited.get(201) && roomVisited.get(102)) { // doubling chances
					r = Math.round(randomizeInRange(0, 2));
					r <= 1 ? (nextR = r == 0? 102: 1013) : (nextR = 101);
				}
			case 102: 	// theater
				nextR = !roomVisited.get(2)? 2 : (Math.round(randomizeInRange(0, 3)) == 0? 2:101);
			case 201: 	// open room
				nextR = 101;
			case 2: 	// back room
				nextR = !roomVisited.get(1)? 1 : (Math.round(randomizeInRange(0, 3)) == 0? 1:102);
			case 1:		// dance floor
				nextR = 2;
		}
		roomVisited.set(nextR, true);
		if (nextR == -1) {
			Lib.println("{{{ ERROR }}} The new Room id id should not be -1 // something went wrong with roomId : "+roomId);
			throw "The new Room id id should not be -1 // something went wrong with roomId : "+roomId;
		}
		return nextR;
	}
	
	private function randomizeInRange( min:Float, max: Float): Float {
		if (min == max) {
			return min;
		}
		return min + (Math.random() * (max - min));
	}
	
	private function randomizeWithChance (percent: Int) : Bool {
		var r = Math.random();
		return r <= (percent / 100);
	}
	
	private function randomizeEntryTime(): Float {
		var r = Math.random();
		var t : Float=0;
		
		for ( i in 0...entranceProbabilities.length) {
			var prob: Dynamic = entranceProbabilities[i];
			var range : Array<Int> = Reflect.getProperty(prob, "range");
			var chance : Array<Int> = Reflect.getProperty(prob, "chance");
			
			if (r >= chance[0] && r < chance[1]) {
				t = randomizeInRange( range[0], range[1]);
			}
		}
		var addedTime : Float = timestampStart + convertHourToSec(t);
		return addedTime;
	}
	
	private function convertHourToSec(h:Float): Int {
		return Math.floor(h * 60 * 60 );
	}	
	
	private function convertMinuteToSec(m:Float): Int {
		return Math.floor(m * 60 );
	}
	
	private function convertSecToMilliSec(s:Float):Int {
		return Math.floor(s * 1000);
	}
	
	function convertSecToMinutes ( sec: Float) : Float {
		return sec / 60;
	}
}