(function(global, undefined){
	
	"use strict";
	
	/**
	*  Constructor for the event dispatcher
	*/
	var EventDispatcher = function(){},
	
	/** Reference to the prototype */
	p = EventDispatcher.prototype;
	
	/** The collection of listeners */
	p._listeners = [];
	
	/**
	*  Dispatch an event
	*  @param The event string name
	*  @param Additional parameters
	*/
	p.dispatchEvent = function(type, params)
	{
		if (this._listeners[type] !== undefined) 
		{	
			var listeners = this._listeners[type];
			
			for(var i = 0; i < listeners.length; i++) 
			{
				listeners[i](params);
			}
		}
	};
	
	/**
	*  Add an event listener
	*  @param The type of event
	*  @param The listener function
	*/
	p.addEventListener = function(type, listener)
	{
		if (this._listeners[type] === undefined)
		{
			this._listeners[type] = [];	
		}
		this._listeners[type].push(listener);
	};
	
	/**
	*  Remove the event listener
	*  @param The type of event string
	*  @param The listener function
	*/
	p.removeEventListener = function(type, listener)
	{		
		if (this._listeners[type])
		{
			if (listener === undefined)
			{
				delete this._listeners[type];
				return;
			}
			for (var i = 0; i < this._listeners[type].length; i++)
			{
				if (this._listeners[type][i] === listener)
				{
					this._listeners[type].splice(i, 1);
					break;
				}
			}
		}
	};	
	
	/**
	*  Remove all of the event listeners
	*/
	p.removeAllEventListeners = function()
	{
		this._listeners = {};
	};
	
	/** Assign to the global spacing */
	namespace('cloudkid').EventDispatcher = EventDispatcher;
	
}(window));