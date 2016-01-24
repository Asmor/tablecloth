/* global Tablecloth */
/* global loadGS */
"use strict";

angular.module("tablecloth")
.factory("sheetService", ["$q", function ($q) {
	var ss = {
		keys: [
			{ id: "1MBKVa23DHV_PeenD8iv-dAPVfqBqDmZMS5Enfjf73Y0", name: "Default" }
		],
		tables: [],
		results: [],
	};
	var tableSet;

	ss.load = function load(index) {
		$q.when(loadGS(ss.keys[index].id)).then(function (data) {
			tableSet = Tablecloth.tableSet(data);
			ss.tables = tableSet.getTables();
		}).catch(function () {
			alert("Unable to load spreadsheet. Are you sure it's published?");

			// Fall back to default
			if ( ss.loadedIndex ) {
				ss.load(0);
			}
		});
		ss.loadedIndex = index;
	};

	ss.roll = function roll(table) {
		if ( !tableSet ) { return null; }

		return tableSet.roll(table);
	};

	ss.add = function add(name, id) {
		if ( !name || !id ) {
			return false;
		}

		alert(name + id);

		var match = id.match(/\b([-a-z0-9_]{44})\b/i);

		if ( !match ) {
			alert("Couldn't find a valid ID in: " + id);
			return false;
		}

		id = match[1];

		var newLength = ss.keys.push({name, id});
		ss.load(newLength - 1);
		save();
		return true;
	};

	ss.remove = function remove(index) {
		if ( index === 0 ) {
			// Don't allow default to be removed
			return false;
		}

		ss.keys.splice(index, 1);
		ss.load(0);
		save();
		return true;
	};

	function load() {
		var defaultSetting = [
			{ id: "1MBKVa23DHV_PeenD8iv-dAPVfqBqDmZMS5Enfjf73Y0", name: "Default" }
		];

		if ( !window.localStorage || !window.localStorage.length ) {
			ss.keys = defaultSetting;
			return;
		}

		try {
			ss.keys = JSON.parse(window.localStorage.tableClothKeys);
		} catch (ex) {
			ss.keys = defaultSetting;
		}
	}

	function save() {
		if ( !window.localStorage ) { return; }

		window.localStorage.tableClothKeys = JSON.stringify(ss.keys);
	}

	// Initialize
	ss.load(0);
	load();

	return ss;
}])
.directive("sheetManager", ["sheetService", function (sheetService) {
	return {
		restrict: "E",
		templateUrl: "components/sheet-manager/sheet-manager.html",
		link: function (scope) {
			scope.sheets = sheetService;
		},
	};
}])
.directive("tableList", ["sheetService", function (sheetService) {
	return {
		restrict: "E",
		templateUrl: "components/sheet-manager/table-list.html",
		link: function (scope) {
			scope.sheets = sheetService;
		},
	};
}])
.directive("resultList", ["sheetService", function (sheetService) {
	return {
		restrict: "E",
		templateUrl: "components/sheet-manager/result-list.html",
		link: function (scope) {
			scope.sheets = sheetService;
		},
	};
}])
.directive("instructions", [function () {
	return {
		restrict: "E",
		templateUrl: "components/sheet-manager/instructions.html",
	};
}])
;
