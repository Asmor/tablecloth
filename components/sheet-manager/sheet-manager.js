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
	};
	var tableSet;

	ss.load = function load(id) {
		$q.when(loadGS(id)).then(function (data) {
			tableSet = Tablecloth.tableSet(data);
			ss.tables = tableSet.getTables();
		});
	};

	ss.roll = function roll(table) {
		if ( !tableSet ) { return null; }

		return tableSet.roll(table);
	};

	ss.add = function add(name, id) {
		if ( !name || !id ) {
			return false;
		}

		ss.keys.push({name, id});
		ss.load(id);
		save();
		return true;
	};

	ss.remove = function remove(index) {
		if ( index === 0 ) {
			// Don't allow default to be removed
			return false;
		}

		ss.keys.splice(index, 1);
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
	ss.load(ss.keys[0].id);
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
			scope.results = [];
		},
	};
}])
;
