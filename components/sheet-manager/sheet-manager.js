/* global Tablecloth */
/* global loadGS */
"use strict";

angular.module("tablecloth")
.factory("sheetService", ["$q", "$rootScope", function ($q, $rootScope) {
	var ss = {
		keys: [
			{ id: "1MBKVa23DHV_PeenD8iv-dAPVfqBqDmZMS5Enfjf73Y0", name: "Default" }
		],
		tables: [],
		results: [],
	};
	var tableSet;

	ss.load = function load(index, noScroll) {
		$q.when(loadGS(ss.keys[index].id)).then(function (data) {
			tableSet = Tablecloth.tableSet(data);
			ss.tables = tableSet.getTables();
			$rootScope.$broadcast("tables-loaded");

			if ( !noScroll ) {
				document.querySelectorAll(".result-list")[0].scrollIntoView();
			}

		}).catch(function (ex) {
			alert("Unable to load spreadsheet. Are you sure it's published?");
			console.error(ex);

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

		name = decodeURIComponent(name);
		id = decodeURIComponent(id);

		var match = id.match(/\b([-a-z0-9_]{44})\b/i);

		if ( !match ) {
			alert("Couldn't find a valid ID in: " + id);
			return false;
		}

		id = match[1];

		var index = ss.getIndexById(id);

		if ( index !== null ) {
			ss.load(index);
			return false;
		}

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
		ss.load(0, true);
		save();
		return true;
	};

	ss.getIndexById = function getIndexById(id) {
		var index = null;

		ss.keys.some(function (key, i) {
			if ( key.id === id ) {
				index = i;
				return true;
			}
		});

		return index;
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
	load();
	var idMatch = document.location.search.match(/(?:\?|&)id=([-a-z0-9_]{44})/i);
	var nameMatch = document.location.search.match(/(?:\?|&)name=([^&]*)/);

	if ( idMatch && nameMatch ) {
		ss.add(nameMatch[1], idMatch[1]);
	} else {
		ss.load(0, true);
	}

	return ss;
}])
.directive("sheetManager", ["sheetService", function (sheetService) {
	function shareLink(key) {
		var basePath = document.location.toString().match(/[^?#]*/)[0];

		return basePath + "?id=" + encodeURIComponent(key.id) + "&name=" + encodeURIComponent(key.name);
	}

	return {
		restrict: "E",
		templateUrl: "components/sheet-manager/sheet-manager.html",
		replace: true,
		link: function (scope) {
			scope.sheets = sheetService;
			scope.shareLink = shareLink;
		},
	};
}])
.directive("tableList", ["sheetService", function (sheetService) {
	return {
		restrict: "E",
		templateUrl: "components/sheet-manager/table-list.html",
		link: function (scope) {
			scope.sheets = sheetService;
			scope.rollOn = function rollOn(table) {
				sheetService.results.push(sheetService.roll(table));
				document.getElementsByClassName("result-list")[0].scrollTop = 0;
			};

			scope.$on("tables-loaded", function () {
				scope.selectedTable = scope.sheets.tables[0];
			});
		},
	};
}])
.directive("resultList", ["sheetService", function (sheetService) {
	return {
		restrict: "E",
		templateUrl: "components/sheet-manager/result-list.html",
		replace: true,
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
