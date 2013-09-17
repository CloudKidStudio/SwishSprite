(function(global, undefined){
	
	"use strict";
	
	/**
	*  Constructor for the event dispatcher
	*  
	*  @class cloudkid.EventDispatcher
	*  @constructor
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
	p.trigger = function(type, params)
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
	*  @param The type of event (can be multiple events separated by spaces)
	*  @param The callback function when even is fired
	*/
	p.on = function(name, callback)
	{
		// Callbacks map
		if (type(name) === 'object')
		{
			for (var key in name)
			{
				if (name.hasOwnProperty(key))
				{
					this.on(key, name[key]);
				}
			}
		}
		// Callback
		else if (type(callback) === 'function')
		{
			var names = name.split(' '), n = null;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				this._listeners[n] = this._listeners[n] || [];
				
				if (this._callbackIndex(n, callback) === -1)
				{
					this._listeners[n].push(callback);
				}
			}
		}
		// Callbacks array
		else if (type(callback) === 'array')
		{
			for (var f = 0, fl = callback.length; f < fl; f++)
			{
				this.on(name, callback[f]);
			}
		}
		return this;
	};
	
	/**
	*  Remove the event listener
	*  @param The type of event string
	*  @param The listener function
	*/
	p.off = function(name, callback)
	{	
		// remove all 
		if (name === undefined)
		{
			this._listeners = [];
		}
		// remove multiple callbacks
		else if (type(callback) === 'array')
		{
			for (var f = 0, fl = callback.length; f < fl; f++) 
			{
				this.off(name, callback[f]);
			}
		}
		else
		{
			var names = name.split(' '), n = null;
			for (var i = 0, nl = names.length; i < nl; i++)
			{
				n = names[i];
				this._listeners[n] = this._listeners[n] || [];
				
				// remove all by time
				if (callback === undefined)
				{
					this._listeners[n].length = 0;
				}
				else
				{
					var index = this._callbackIndex(n, callback);
					if (index !== -1)
					{
						this._listeners[name].splice(index, 1);
					}
				}
			}
		}
		return this;
	};
	
	/**
	* Return type of the value.
	*
	* @param  {Mixed} value
	* @return {String}
	*/
	function type(value)
	{
		if (value === null)
		{
			return String(value);
		}
		if (typeof value === 'object' || typeof value === 'function')
		{
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}
		return typeof value;
	}
	
	/**
	 * Returns callback array index.
	 *
	 * @param  {String}   name Event name.
	 * @param  {Function} fn   Function
	 *
	 * @return {Int} Callback array index, or -1 if isn't registered.
	 */
	p._callbackIndex = function(name, callback)
	{		
		for (var i = 0, l = this._listeners[name].length; i < l; i++)
		{
			if (this._listeners[name][i] === callback)
			{
				return i;
			}
		}
		return -1;
	};
	
	/** Assign to the global spacing */
	namespace('cloudkid').EventDispatcher = EventDispatcher;
	
}(window));