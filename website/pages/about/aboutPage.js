define([
	"hbs!aboutPageTemplate"
], function(aboutPageTemplate) {
	"use strict";

	var _init = function() {
		$("#about").html(aboutPageTemplate());
	};

	return {
		init: _init
	};
});