/* global Tablecloth */
/* global loadGS */
"use strict";

angular.module("tablecloth")
.factory("sheetService", ["$q", function ($q) {
	var ss = {
		keys: [
			"1MBKVa23DHV_PeenD8iv-dAPVfqBqDmZMS5Enfjf73Y0"
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

	// Initialize
	ss.load(ss.keys[0]);

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
