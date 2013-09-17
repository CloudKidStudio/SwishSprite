(function(global, doc, undefined){
	
	"use strict";
	
	/**
	*  Handle the page visiblity change, if supported
	*  
	*  @class cloudkid.PageVisibility
	*  @constructor
	*  @param {function} onFocus Callback when the page becomes visible
	*  @param {function} onBlur Callback when the page loses visibility
	*  @author Matt Moore <matt@cloudkid.com>
	*/
	var PageVisibility = function(onFocus, onBlur)
	{
		this.initialize(onFocus, onBlur);
	},
	
	/** Reference to the prototype */
	p = PageVisibility.prototype,
	
	/** The name of the visibility change event for the browser */
	_visibilityChange = null;
	
	/** Callback when the page becomes visible */
	p._onFocus = null;
	
	/** Callback when the page loses visibility */
	p._onBlur = null;
	
	/** The visibility toggle function */
	p._onToggle = null;
	
	// Select the visiblity change event name
	if (doc.hidden !== undefined)
	{
		_visibilityChange = "visibilitychange";
	} 
	else if (doc.mozHidden !== undefined)
	{
		_visibilityChange = "mozvisibilitychange";
	} 
	else if (doc.msHidden !== undefined)
	{
		_visibilityChange = "msvisibilitychange";
	} 
	else if (doc.webkitHidden !== undefined)
	{
		_visibilityChange = "webkitvisibilitychange";
	}
	
	/**
	*  Create new Page visibility
	*  @param {function} The callback when the page comes into focus
	*  @param {function} The callback when the page loses focus
	*/
	p.initialize = function(onFocus, onBlur)
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange) return;
		
		this._onBlur = onBlur;
		this._onFocus = onFocus;
		
		// The visibility toggle function
		var onVisibilityChange = function() 
		{
			if (doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden)
				onBlur();
			else 
				onFocus();
		};
		
		// Listen to visibility change
		// see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
		doc.addEventListener(_visibilityChange, onVisibilityChange, false);
		
		// Listen for page events (when clicking the home button on iOS)
		global.addEventListener("pagehide", onBlur);
		global.addEventListener("pageshow", onFocus);
		global.addEventListener("blur", onBlur);
		global.addEventListener("focus", onFocus);
		global.addEventListener("visibilitychange", onVisibilityChange, false);
		
		this._onToggle = onVisibilityChange;
	};
	
	/**
	*  Disable the detection
	*/
	p.destroy = function()
	{
		// If this browser doesn't support visibility
		if (!_visibilityChange) return;
		
		global.removeEventListener("pagehide", this._onBlur);
		global.removeEventListener("pageshow", this._onFocus);
		global.removeEventListener("blur", this._onBlur);
		global.removeEventListener("focus", this._onFocus);
		global.addEventListener("visibilitychange", this._onToggle);
		
		doc.removeEventListener(_visibilityChange, this._onToggle, false);
		
		this._onFocus = null;
		this._onBlur = null;
	};
	
	// Assign to the global space
	namespace('cloudkid').PageVisibility = PageVisibility;
	
}(window, document));