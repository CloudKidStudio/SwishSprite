/**
*  Static class for namespacing objects and adding
*  classes to it
*  @class namespace
*  @static
*/
(function(global){
	
	"use strict";
	
	// The namespace function already exists
	if ("namespace" in global) return;
	
	/**
	*  Create the namespace and assing to the window
	*
	*  @example
		var SpriteUtils = function(){};
		namespace('cloudkid.utils').SpriteUtils = SpriteUtils;
	*
	*  @function namespace
	*  @param {string} namespaceString Name space, for instance 'cloudkid.utils'
	*  @return {object} The namespace object attached to the current window
	*/
	var namespace = function(namespaceString) {
		var parts = namespaceString.split('.'),
			parent = window,
			currentPart = '';

		for(var i = 0, length = parts.length; i < length; i++)
		{
			currentPart = parts[i];
			parent[currentPart] = parent[currentPart] || {};
			parent = parent[currentPart];
		}
		return parent;
	};
	
	// Assign to the global namespace
	global.namespace = namespace;
	
}(window));