(function(global, undefined){
	
	"use strict";
	
	/** 
	*  A collection of utilities for detecting the availability of HTML5 audio
	*  
	*  @module cloudkid
	*  @class AudioUtils
	*/
	var AudioUtils = {};
	
	/**
	*  Create an SwishSprite object from config
	*  
	*  @method importSpriteMap
	*  @param {SwishSprite} The reference to the SwishSprite
	*  @param {object} config The JSON config created from autogenerated
	*  @return {SwishSprite} SwishSprite instance
	*  @static
	*/
	AudioUtils.importSpriteMap = function(audio, config)
	{
		if (config.resources === undefined)
		{
			throw "Sprite configuration must contain 'resources': an array of file types";
		}
		
		var playableUrl = AudioUtils.getPlayableURL(config.resources);
		
		if (config.spritemap === undefined)
		{
			throw "Sprite configuration must contain 'spritemap': a dictionary of audio sprites";
		}
		
		// Add the sounds to the audio sprite
		var s, alias;
		for(alias in config.spritemap)
		{
			s = config.spritemap[alias];
			audio.setSound(alias, s.start, (s.end - s.start), s.loop);
		}
		return playableUrl;
	};
	
	/**
	*  Check if HTML5 Audio is supported in any of the available 
	*  formats. If returns false, we should disable sounds. Modified from modernizr
	*  @method supported
	*  @return {Boolean} If we can play HTML5 audio
	*  @static
	*/
	AudioUtils.supported = function()
	{
		return _fileSupport;
	};
	
	/**
	*  Get the the internal cache support
	*  
	*  @method _fileSupport
	*  @return {bool}
	*  @private
	*/
	var _fileSupport = (function(){
		
		var elem = document.createElement('audio'), bool = false;

        try {
			bool = !!elem.canPlayType;
            if (bool) {
                bool      = {};
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.oga  = bool.ogg;
				bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');
				bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.caf  = elem.canPlayType('audio/x-caf')               .replace(/^no$/,'');
				bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) {}

        return bool;

	}());
	
	/**
	* Determines playability of a URL based on audio support.
	* @method canPlayURL
	* @param {string} url The URL to test
	* @return {bool} URL playability
	* @static
	*/
	AudioUtils.canPlayURL = function(url) 
	{
		if (!_fileSupport) return false;
		
		// Get the file extension from the url
		var ext = url.toLowerCase().match(/\.([a-z0-9]{3})(\?.*)?$/i);
				
		// Url doesn't have an extension
		if (!ext || !ext.length) return false;
		
		// Get the extension from the match
		ext = ext[1];
		
		return _fileSupport[ext] || false;
	};
	
	/**
	*  Get the url from the sprite resources array or single url
	*  
	*  @method getPlayableURL
	*  @param {*} url The resources (i.e {url""}, {url}, or string url)
	*  @return {string} Result url
	*  @static
	*/
	AudioUtils.getPlayableURL = function(url)
	{
		var i, len, result = null;
		if (url instanceof Array) 
		{
			for (i=0, len=url.length; i<len; i++) 
			{
				// Item is an object
				if (url[i] instanceof Object) 
				{
					if (AudioUtils.canPlayURL(url[i].url)) 
					{
						result = url[i].url;
						break;
					}
				}
				// The item is a string
				else if (AudioUtils.canPlayURL(url[i])) 
				{
					result = url[i];
					break;
				}
			}
		} 
		else if (AudioUtils.canPlayURL(url))
		{
			result = url;
		}
		return result;
	};
	
	// Assign to the global space
	namespace('cloudkid').AudioUtils = AudioUtils;
	
}(window));