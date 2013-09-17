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
	*  @private
	*/
	var hasConsole = (global.console !== undefined);
	
	/** The different log levels */
	Debug.GENERAL = 0;
	Debug.DEBUG = 1;
	Debug.INFO = 2;
	Debug.WARN = 3;
	Debug.ERROR = 4;
	
	/**
	* The minimum log level to show, by default it's set to
	* show all levels of logging. 
	* @public
	* @static
	*/
	Debug.minLogLevel = Debug.GENERAL;
	
	/** 
	* Boolean to turn on or off the debugging
	* @public
	* @static
	*/
	Debug.enabled = true;
	
	/**
	*  The output jQuery element
	*  @public
	*  @static
	*/
	Debug.output = null;
	
	/**
	*  Sent to the output
	*  @param 
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
	*  @param The statement to log
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
	*  Debug something in the console
	*  @static
	*  @param The statement to debug
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
	*  @param The statement to info
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
	*  Warn something in the console
	*  @static
	*  @param The statement to warn
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
	*  Method to describe an object in the console
	*  @static
	*  @param The statement to error
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
	*  @param As statement that is assumed true
	*  @param The addition parameters
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
	*  @param The object
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
	*  @param Optional parameters
	*/
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
	*  @param Optional parameters
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