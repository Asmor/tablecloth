"use strict";

angular.module("tablecloth", ["yaru22.md"])
.filter("reverse", [function () {
	return function(a) {
		var out = [];

		a.forEach(item => out.unshift(item));

		return out;
	};
}])
;
