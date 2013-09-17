/**
*  A static closure to provide easy access to the console
*  without having errors if the console doesn't exist
*  to use call: Debug.log('Your log here')
*  
*  @class Debug
*  @static
*/
(function(global, undefined){
	
	"use strict";
	
	// Dummy console if window.console doesn't exist
	var Debug = function(){};	
	
	/**
	*  If we have a console
	*  
	*  @property {bool} hasConsole
	*  @private
	*/
	var hasConsole = (global.console !== undefined);
	
	/**
	* General Log type
	* @property {int} GENERAL
	* @static
	* @final
	*/
	Debug.GENERAL = 0;
	/**
	* Debug Log type
	* @property {int} DEBUG
	* @static
	* @final
	*/
	Debug.DEBUG = 1;
	/**
	* Info Log type
	* @property {int} INFO
	* @static
	* @final
	*/
	Debug.INFO = 2;
	/**
	* Warning Log type
	* @property {int} WARN
	* @static
	* @final
	*/
	Debug.WARN = 3;
	/**
	* Error Log type
	* @property {int} ERROR
	* @static
	* @final
	*/
	Debug.ERROR = 4;
	
	/**
	* The minimum log level to show, by default it's set to
	* show all levels of logging. 
	* @property {int} minLogLevel
	* @static
	*/
	Debug.minLogLevel = Debug.GENERAL;
	
	/** 
	* Boolean to turn on or off the debugging
	* @property {bool} enabled
	* @static
	*/
	Debug.enabled = true;
	
	/**
	*  The jQuery element to output debug messages to
	*
	*  @public
	*  @static
	*  @property {jQuery} output
	*/
	Debug.output = null;
	
	/**
	*  Sent to the output
	*  @private
	*  @static
	*  @function output
	*  @param {string} level The log level
	*  @param {string} args Additional arguments
	*/
	function output(level, args)
	{
		if (Debug.output) 
		{
			Debug.output.append("<div class=\""+level+"\">" + args + "</div>");
		}
	}
	
	/**
	*  Log something in the console
	*  @static
	*  @public 
	*  @function log
	*  @param {*} params The statement or object to log
	*/
	Debug.log = function(params)
	{
		if(!Debug.enabled) return;

		if (Debug.minLogLevel == Debug.GENERAL && hasConsole) 
		{
			console.log(params);
			output("general", params);
		}	
	};
	
	/**
	*  Debug something in the console or remote
	*  @static
	*  @public 
	*  @function debug
	*  @param {*} params The statement or object to debug
	*/
	Debug.debug = function(params)
	{
		if(!Debug.enabled) return;
		
		if (Debug.minLogLevel <= Debug.DEBUG && hasConsole) 
		{
			console.debug(params);
			output("debug", params);
		}
	};
	
	/**
	*  Info something in the console
	*  @static
	*  @public 
	*  @function info
	*  @param {*} params The statement or object to info
	*/
	Debug.info = function(params)
	{
		if(!Debug.enabled) return;
		
		if (Debug.minLogLevel <= Debug.INFO && hasConsole) 
		{
			console.info(params);
			output("info", params);
		}	
	};
	
	/**
	*  Warn something in the console or remote
	*  @static
	*  @public 
	*  @method warn
	*  @param {*} params The statement or object to warn
	*/
	Debug.warn = function(params)
	{
		if(!Debug.enabled) return;
		
		if (Debug.minLogLevel <= Debug.WARN && hasConsole) 
		{
			console.warn(params);
			output("warn", params);
		}	
	};
	
	/**
	*  Error something in the console
	*  @static
	*  @public 
	*  @function error
	*  @param {*} params The statement or object to error
	*/
	Debug.error = function(params)
	{
		if(!Debug.enabled) return;
		
		if (hasConsole) 
		{
			console.error(params);
			output("error", params);
		}	
	};
	
	/**
	*  Assert that something is true
	*  @static
	*  @public
	*  @function assert
	*  @param {bool} truth As statement that is assumed true
	*  @param {*} params The message to error if the assert is false
	*/
	Debug.assert = function(truth, params)
	{
		if (hasConsole && Debug.enabled && console.assert) 
		{
			console.assert(truth, params);
			if (!truth) output("error", params);
		}	
	};
	
	/**
	*  Method to describe an object in the console
	*  @static
	*  @function dir
	*  @public
	*  @param {object} params The object to describe in the console
	*/
	Debug.dir = function(params)
	{
		if (Debug.minLogLevel == Debug.GENERAL && hasConsole && Debug.enabled) 
		{
			console.dir(params);
		}	
	};
	
	/**
	*  Method to clear the console
	*  @static
	*  @public
	*  @function clear
	Debug.clear = function(params)
	{
		if (hasConsole && Debug.enabled) 
		{
			console.clear(params);
			if (Debug.output) Debug.output.html("");
		}	
	};
	
	/**
	*  Generate a stack track in the output
	*  @static
	*  @public
	*  @function trace
	*  @param {*} params Optional parameters to log
	*/
	Debug.trace = function(params)
	{
		if (Debug.minLogLevel == Debug.GENERAL && hasConsole && Debug.enabled) 
		{
			console.trace(params);
		}	
	};
	
	// Make the debug class globally accessible
	// If the console doesn't exist, use the dummy to prevent errors
	global.Debug = Debug;
	
}(window));