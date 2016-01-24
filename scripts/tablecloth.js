"use strict";

var Tablecloth = (function () {
	/* jshint -W040 */ // this

	function conjugate(term) {
		/* jshint -W084 */ // conditional assignment
		var macroRegex = /([^[]*)\[([^\]]*)\](.*)/;
		var match;

		while ( match = term.match(macroRegex) ) {
			term = match[1] + this.pick(match[2]) + match[3];
		}

		return term;
	}

	function getTables(o) {
		var tables = [];
		var self = this;
		o = o || self.definition;

		Object.keys(o).forEach(function (key) {
			var branch = o[key];

			// Sheets and columns starting with underscores are hidden
			if ( key.match(/^_|\._/) ) {
				return;
			}

			if ( branch instanceof Array ) {
				tables.push(key);
				return;
			}

			if ( typeof branch !== "object" ) {
				return;
			}

			var subTables = self.getTables(branch);

			subTables.forEach(function (subTable) {
				tables.push(key + "." + subTable);
			});
		});

		return tables;
	}

	function roll(tablename) {
		return this.conjugate("[" + tablename + "]");
	}

	function pick(path) {
		var keys = path.split(/\./);
		var target = this.definition;
		var next;

		while ( keys.length ) {
			next = keys.shift();

			if ( !target[next] ) {
				throw new Error("Can't find definition: " + path);
			}

			target = target[next];
		}

		if ( ! (target instanceof Array) ) {
				throw new Error("Not an array: " . path);
		}

		var index = Math.floor(Math.random() * target.length);

		return target[index];
	}

	function tableSet(definition) {
		var t = { conjugate, definition, getTables, pick, roll };

		return t;
	}

	return {
		tableSet: tableSet,
	};
}());
