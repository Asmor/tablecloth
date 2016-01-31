"use strict";

var Tablecloth = (function () {
	/* jshint -W040 */ // this

	function conjugate(term) {
		var diceRegex = /(.*)(\d+d\d+(?:[-+x]\d+)?)(.*)/i;
		var macroRegex = /([^[]*)\[([^\]]*)\](.*)/;
		var macro, dice;

		while (
			// Roll dice expressions first before evaluating macros so macros can always expect numbers
			( dice = term.match(diceRegex) ) ||
			( macro = term.match(macroRegex) )
		) {
			if ( dice ) {
				term = dice[1] + rollDice(dice[2]) + dice[3];
			} else {
				term = macro[1] + this.pick(macro[2]) + macro[3];
			}
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

	function getWeightedTable(path) {
		/* jshint -W084 */ // Conditional assignment
		if (this.weightedTables[path]) {
			return this.weightedTables[path];
		}

		var keys   = path.split(/\./);
		var table  = this.definition;
		var next;

		while ( next = keys.shift() ) {
			if ( !table[next] ) {
				throw new Error("Can't find definition: " + path);
			}

			table = table[next];
		}

		if ( ! (table instanceof Array) ) {
				throw new Error("Not an array: " . path);
		}

		this.weightedTables[path] = generateWeightedTable(table);

		return this.weightedTables[path];
	}

	function pick(expression) {
		var parts  = expression.match(/(?:(\d+)\s+)?(?:(unique)\s+)?(.*)/i);
		var qty    = parts[1] * 1 || 1;
		var unique = !!parts[2];
		var path   = parts[3];
		var keys   = path.split(/\./);
		var table  = this.getWeightedTable(path);

		var rolls = {};
		var index, result;
		var successes = 0;
		var failures = 0;

		while ( (successes < qty) && (failures < 1000) ) {
			result = table.roll();

			if ( unique && rolls[result] ) {
				failures++;
			} else {
				successes++;
				rolls[result] = rolls[result] || 0;
				rolls[result]++;
			}
		}

		var results = [];
		Object.keys(rolls).sort().forEach(function (result) {
			var qty = rolls[result];
			if ( qty > 1 ) {
				results.push(qty + "x " + result);
			} else {
				results.push(result);
			}
		});

		return results.join(", ");
	}

	function tableSet(definition) {
		var weightedTables = {};

		return {
			conjugate,
			definition,
			getTables,
			getWeightedTable,
			pick,
			roll,
			weightedTables
		};
	}

	function rollDice(expression) {
		var parts = expression.match(/(\d+)d(\d+)(?:([-+x])(\d+))?/i);
		var qty   = parts[1] * 1;
		var size  = parts[2] * 1;
		var op    = parts[3];
		var mod   = parts[4] * 1 || 0;
		var total = 0;
		var i;

		for ( i = 0; i < qty; i++ ) {
			total += Math.floor(Math.random() * size) + 1;
		}

		if ( op === "-" ) {
			total -= mod;
		} else if ( op === "+" ) {
			total += mod;
		} else if ( op === "x" ) {
			total *= mod;
		} 

		return total;
	}

	return {
		tableSet: tableSet,
	};
}());

var generateWeightedTable = (function () {
	/* jshint -W040 */ // this

	function roll() {
		var n = Math.floor(Math.random() * this.sum);
		var i, value;

		for ( i = 0; i < this.results.length; i++ ) {
			value = this.results[i];
			if ( n < value.weight ) {
				return value.text;
			}

			n -= value.weight;
		}
	}

	return function generateWeightedTable(arr) {
		var results = [];
		var multiplier = 10;
		var sum = 0;

		arr.forEach(function (expression) {
			var parts = expression.match(/(\d+(?:\.\d+)?)?\s*(.*)/);
			var weight = parts[1] * 1 || 1;
			var text = parts[2];

			// Allow up to 1 decimal digit
			weight = Math.round(weight * 10);
			sum += weight;

			results.push({ text, weight });
		});

		return {
			results,
			roll,
			sum,
		};
	};
}());
