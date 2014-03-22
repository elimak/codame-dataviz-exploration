package com.elimak.codame.datamaker;

import neko.Lib;

/**
 * ...
 * @author elimak
 */

class Main {
	
	static function main() {
		new Main();
	}
	
	public function new() {
		var gen = new Generator();
		gen.buildData(50);
	}	
}