/**
*  @module cloudkid
*/
(function(global, undefined){
	
	"use strict";
	
	// Class imports
	var EventDispatcher = cloudkid.EventDispatcher,
		PageVisibility = cloudkid.PageVisibility,
		AudioUtils = cloudkid.AudioUtils;

	/**
	*  This class is responsible for playback of an audiosprite 
	*  file (multiple sounds in a single timeline) using HTML5 audio
	*  
	*  @class SwishSprite
	*  @constructor
	*  @extends EventDispatcher
	*  @param {*} data The name of the audio file to load, array of resources, or a spritemap
	*/
	var SwishSprite = function(data)
	{
		this.initialize(data);
	},
	
	// Reference to the prototype, extends event dispatcher 
	p = SwishSprite.prototype = new EventDispatcher(),
	
	/**
	* The audio element
	* 
	* @property {DOMElement} _audio
	* @private
	*/
	_audio = null,
	
	/**
	* If we're paused
	* 
	* @property {bool} _paused
	* @private
	*/
	_paused = true,
	
	/**
	* If the current audio has been loaded
	* 
	* @property {bool} _loaded
	* @private
	*/
	_loaded = false,
	
	/**
	* If the loading update should run
	* 
	* @property {bool} _updatingLoad
	* @private
	*/
	_updatingLoad = false,
	
	/**
	* If the playing update should run
	* 
	* @property {bool} _updatingPlay
	* @private
	*/
	_updatingPlay = false,
	
	/**
	* If the load has started
	* 
	* @property {bool} _loadStarted
	* @private
	*/
	_loadStarted = false,
	
	/**
	* The interval ID for playback
	* 
	* @property {String} _playInterval
	* @private
	*/
	_playInterval = null,
	
	/**
	* The interval ID for loading
	* 
	* @property {String} _loadInterval
	* @private
	*/
	_loadInterval = null,
	
	/**
	* The playback timeout ID
	* 
	* @property {String} _playTimeout
	* @private
	*/
	_playTimeout = null,
	
	/**
	* The previous interval loaded percentage 
	* 
	* @property {int} _loadAmount
	* @private
	*/
	_loadAmount = 0,
	
	/**
	* The collection of sounds
	* 
	* @property {Array} _sounds
	* @private
	*/
	_sounds = null,

	/**
	* Some formats require a little padding to the end of a sprite
	* 
	* @property {int} _formatPadding
	* @private
	*/
	_formatPadding = 0,
	
	/**
	* The sound name of the current sprite we're playing
	* 
	* @property {String} _playingAlias
	* @private
	*/
	_playingAlias = null,
	
	/**
	* If the scrubber playhead has moved
	* 
	* @property {bool} _scrubberMoved
	* @private
	*/
	_scrubberMoved = null,
	
	/**
	* If we're out of round 
	* @property {int} _outOfRangeCount
	* @private
	*/
	_outOfRangeCount = null,
	
	/**
	* The num of times the scrubber has not moved
	* 
	* @property {int} _scrubberNotMovingCount
	* @private
	*/
	_scrubberNotMovingCount = 0,
	
	/**
	* If the sound successfully played
	* 
	* @property {bool} _successfullyPlayedSound
	* @private
	*/
	_successfullyPlayedSound = false,
	
	/**
	* The start time for the scrubber
	* 
	* @property {int} _scrubberStartTime
	* @private
	*/
	_scrubberStartTime = null,
	
	/**
	* The interval ID for checking audio
	* 
	* @property {String} _checkInterval
	* @private
	*/
	_checkInterval = null,
	
	/**
	* The position of the last scrubber 
	* 
	* @property {int} _lastScrubberPos
	* @private
	*/
	_lastScrubberPos = null,
	
	/**
	* The singleton instance of the audiosprite 
	* 
	* @property {SwishSprite} _instance
	* @private
	*/
	_instance = null,
	
	/**
	* Instance of page visibility for pause/resuming on page blur/focus
	* 
	* @property {PageVisibility} _pageVisibility
	* @private
	*/
	_pageVisibility = null,
	
	/** 
	* Keep track of the paused state when the page blur/focuses 
	* a value of -1 means the page isn't hidden, 0 means the 
	* playing before blur, and 1 means paused before blur
	* 
	* @property {int} _autoPaused
	* @private
	*/
	_autoPaused = -1,
	
	/**
	* The last current time played
	* 
	* @property {int} _lastCurrentTime
	* @private
	*/
	_lastCurrentTime = null;
	
	/** 
	* Event dispatched when load has started
	* 
	* @event loadStarted
	*/
	SwishSprite.LOAD_STARTED = "loadStarted";
	
	/**
	* Event dispatched with audio loaded
	* 
	* @event loaded
	*/
	SwishSprite.LOADED = "loaded";
	
	/**
	* Event dispatched when percentage of load changed
	* 
	* @event loadProgress
	*/
	SwishSprite.LOAD_PROGRESS = "loadProgress";
	
	/**
	* Event dispatched when sound play completed
	* 
	* @event complete
	*/
	SwishSprite.COMPLETE = "complete";
	
	/**
	* The progress event
	* 
	* @event progress
	*/
	SwishSprite.PROGRESS = "progress";
	
	/**
	* The playback has been paused
	* 
	* @event paused
	*/
	SwishSprite.PAUSED = "paused";
	
	/**
	* The sound has been unpaused
	* 
	* @event resumed
	*/
	SwishSprite.RESUMED = "resumed";
	
	/**
	* The sound has been stopped or canceled
	* 
	* @event stopped
	*/
	SwishSprite.STOPPED = "stopped";
	
	/**
	* The sound has begun playing
	* 
	* @event started
	*/
	SwishSprite.STARTED = "started";
	
	/** 
	* A little padding for the m4a audio format will help add extra
	* time for the Kindle Fire who likes to end the sound too early
	* 
	* @property {float} M4A_PADDING
	* @static
	* @final
	*/
	SwishSprite.M4A_PADDING = 0.1;
	
	/**
	* The version of this library
	* 
	* @property {String} VERSION
	* @static
	* @final
	*/
	SwishSprite.VERSION = "${version}";
	
	/**
	* If using external update call, you can use this to save performance
	* if you're already running a frame update call (such as request animation frame)
	* 
	* @property {bool} manualUpdate
	*/
	p.manualUpdate = false;
	
	/**
	*  Create the audio sprite
	*  
	*  @method initialize
	*  @param {*} data The name of the audio file to load, array of resources, or a spritemap
	*/
	p.initialize = function(data)
	{		
		if (!AudioUtils.supported())
		{
			throw "HTML5 Audio is not supported!";
		}
		
		if (_instance !== null)
		{
			throw "SwishSprite instance is already create. Destroy before re-creating";
		}
		
		this.clear();
		
		var playableUrl = (data !== null && typeof data === "object") ? 
			AudioUtils.importSpriteMap(this, data):
			AudioUtils.getPlayableURL(data);
				
		if (!playableUrl)
		{
			throw "The supplied filetype is unsupported in this browser.";
		}
		
		_instance = this;
		_loaded = false;
		_paused = true;
		_loadStarted = false;
		_scrubberNotMovingCount = 0;
		_successfullyPlayedSound = false;
		_pageVisibility = new PageVisibility(onFocus, onBlur);
		_autoPaused = -1;
		_formatPadding = playableUrl.indexOf(".m4a") > -1 ? SwishSprite.M4A_PADDING : 0;
		
		_audio = global.document.createElement("audio");
				
		// Listen to media events
		_audio.addEventListener("canplay", onLoadChange);
		_audio.addEventListener("canplaythrough", onCanPlayThrough);
		_audio.addEventListener("loadeddata", onLoadChange);
		_audio.addEventListener("loadedmetadata", onLoadChange);
		_audio.addEventListener("progress", onLoadChange);
		_audio.addEventListener("ended", soundPlayComplete);
		_audio.addEventListener("stalled", onStalled);
		
		if (DEBUG)
		{
			Debug.log("_audio.src: " + playableUrl);
		}
		_audio.src = playableUrl;
	};
	
	/**
	*  Get the audio element
	*  
	*  @method getAudioElement
	*  @return {DOMElement} The audio element
	*/
	p.getAudioElement = function()
	{
		return _audio;
	};
	
	/**
	*  Mute the audio, not available on all devices
	*  
	*  @method mute
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.mute = function()
	{
		_audio.volume = 0;
		return this;
	};
	
	/**
	*  Unmute the audio, not available on all devices
	*  
	*  @method unmute
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.unmute = function()
	{
		_audio.volume = 1;
		return this;
	};

	/**
	*  Pause the sound playback
	*  
	*  @method pause
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.pause = function()
	{
		if (DEBUG)
		{
			Debug.log("SwishSprite.pause");
		}
			
		_updatingPlay = false;
		
		if (_playInterval) 
		{	
			global.clearInterval(_playInterval);
		}
		if (_playTimeout) 
		{
			global.clearTimeout(_playTimeout);
		}
		var oldPaused = _paused;
		_audio.pause();
		_paused = true;
		
		if (!oldPaused)
		{
			this.trigger(SwishSprite.PAUSED);
		}
		return this;
	};
	
	/**
	*  Unpause the audio playback
	*  
	*  @method resume
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.resume = function()
	{
		if (DEBUG)
		{
			Debug.log("SwishSprite.resume");
		}		
		if (_paused && _playingAlias)
		{
			this.play(_playingAlias, _audio.currentTime);
			this.trigger(SwishSprite.RESUMED);
		}
		return this;
	};
	
	/**
	*  Stop the sound playback clear the current sound playing
	*  
	*  @method stop
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.stop = function()
	{
		if (DEBUG)
		{
			Debug.log("SwishSprite.stop");
		}
		if (_playingAlias !== null)
		{
			this.trigger(SwishSprite.STOPPED);
		}
		this.pause();
		_playingAlias = null;
		return this;
	};
	
	/**
	*  Get the length of a sprite
	*  
	*  @method getLength
	*  @param {String} alias The optional alias, or get the current
	*  @return {int} The duration in seconds
	*/
	p.getLength = function(alias)
	{
		if (alias === undefined && _playingAlias !== undefined)
		{
			return _sounds[_playingAlias].duration;
		}	
		else if (alias !== undefined)
		{
			return _sounds[alias].duration;
		}
		return 0;
	};
	
	/**
	*  Get the current position in seconds of the audio
	*  
	*  @method getPosition
	*  @return {int} The duration in seconds
	*/
	p.getPosition = function()
	{		
		if (_playingAlias !== undefined && _sounds[_playingAlias] !== undefined)
		{
			return _audio.currentTime - _sounds[_playingAlias].start;
		}
		return 0;
	};
	
	/**
	*  Get a sound by name
	*  
	*  @method getSound
	*  @param {String} alias The sound name, optional, if no sound name returns the current
	*  @return {DOMElement} The sound
	*/
	p.getSound = function(alias)
	{
		if (alias === undefined && _playingAlias !== undefined)
		{
			return _sounds[_playingAlias];
		}	
		if (alias)
		{
			return _sounds[alias];
		}
	};
	
	/**
	*  Add a sound to the list of playable sounds
	*  
	*  @method setSound
	*  @param {String} alias The name of the audio
	*  @param {int} startTime Sound's start time
	*  @param {int} duration Length of the sound
	*  @param {bool} isLoop Whether the sound should loop
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.setSound = function(alias, startTime, duration, isLoop)
	{
		// Only add the padding for non-looping sounds
		var padding = !isLoop ? _formatPadding : 0;
		
		_sounds[alias] = {
			start: startTime - padding,
			end: startTime + duration + padding,
			duration: duration + (2 * padding),
			loop: isLoop
		};
		
		return this;
	};
	
	/**
	*  Set the current time to the start alias
	*  
	*  @method prepare
	*  @param {String} alias The name of the sound alias
	*/
	p.prepare = function(alias)
	{
		if (_sounds[alias] === undefined) return;
		_audio.currentTime = _sounds[alias].start;
	};
	
	/**
	*  Clear all of the current sounds
	*  
	*  @method clear
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.clear = function()
	{
		_sounds = {};
		return this;
	};
	
	/**
	*  For iOS, start loading the audio via user click
	*  
	*  @method load
	*  @return {SwishSprite} Return this SwishSprite
	*/
	p.load = function()
	{
		if (DEBUG) 
		{
			Debug.log("SwishSprite.load");
		}
		try 
		{
			if (_loadInterval) 
			{
				global.clearInterval(_loadInterval);
			}
			_updatingLoad = true;
			
			// Call the interval if we aren't updating manually
			if (!this.manualUpdate)
			{
				_loadInterval = global.setInterval(onLoadChange, 10);
			}			
			
			if (_sounds.silence !== undefined)
			{
				this.play("silence");
				/*_audio.play();
				_audio.pause();*/
			}
			else
			{
				throw "'silence' audio is required";
			}
		} 
		catch (e) 
		{
			if (DEBUG)
			{
				Debug.log("load: Audio did not play: " + e.message);
			}
		}
		return this;
	};
	
	/**
	*  The update function, call this manually if manualUpdate is set to true
	*  @method update
	*/
	p.update = function()
	{
		if (_updatingLoad)
		{
			onLoadChange();
		}
		if (_updatingPlay)
		{
			playUpdate();
		}
	};
	
	/**
	*  Play a sound sprite
	*  
	*  @method play
	*  @param {String} alias The sprite name
	*  @param {int} playStartTime The play start time
	*  @return {bool} If playback succeeded
	*/
	p.play = function(alias, playStartTime)
	{
		var startTime;

		_outOfRangeCount = 0;

		// Clear timers
		_updatingPlay = false;
		
		global.clearInterval(_playInterval);
		global.clearTimeout(_playTimeout);

		// Ensure sound exists
		if (_sounds[alias] === undefined)
		{
			Debug.error("SoundUnknown: Sound not found. Playing sound '" + alias + "' has failed.");
			return false;	
		}
		
		var sound = _sounds[alias];
		
		// use the sound as the default start time
		startTime = sound.start;
				
		// If play start time is out of range for the sound, set play start time beginning of the sound
		if (playStartTime !== undefined && playStartTime >= sound.start && playStartTime < sound.end)
		{
			startTime = playStartTime;
		}
		
		try 
		{
			/*if (DEBUG)
			{
				Debug.log("Play sound: " + alias + ". audio.currentTime: " + _audio.currentTime.toFixed(2) + ", startTime: " + sound.start.toFixed(2) + ", duration: "  + sound.duration.toFixed(2));
			}*/
			
			_scrubberMoved = false;

			// Pause before moving scrubber
			_audio.pause();

			// Save the current scrubber position
			_scrubberStartTime = _audio.currentTime;
			
			// Move the scrubber to the start time of the sound
			try 
			{
				_audio.currentTime = _lastCurrentTime = startTime;
			} 
			catch (ex) 
			{
				if (DEBUG)//Error happens first time audio is loaded from user interaction. This is the only way to get Android Stock Browser working.
				{
					Debug.error("CurrentTimeSetException: Setting the current time has failed: " + ex);
				}
			}
			
			if (Math.abs(_audio.currentTime - startTime) > 0.5)
			{
				if (DEBUG)
				{
					Debug.warn("ScrubberNotMoving: Set the scrubber to " + startTime + " however it is " +  _audio.currentTime + ". Playing sound '" + alias + "' has failed.");
				}
				/*global.setTimeout(function(){
				
					if (DEBUG)
					{
						Debug.log("Playing sound because it failed earlier. alias: " + alias + ", playStartTime: " + playStartTime);
					}
					_instance.play(alias, playStartTime);
				}, 1000);*/
				
				return true;
			}
			
			_playingAlias = alias;
			_paused = false;
			_audio.play();
			
			_instance.trigger(SwishSprite.STARTED);
			
			// Set an initial progress update
			var progress = Math.max(0, Math.min((_audio.currentTime - _sounds[_playingAlias].start) / _sounds[_playingAlias].duration, 1));
			_instance.trigger(SwishSprite.PROGRESS, progress);
		
			// Set timeout for if the sound suddently stop playing
			_playTimeout = global.setTimeout(onPlayTimeout, _sounds[_playingAlias].duration * 1000 + 500);

			
			// Set an update interval for the playing
			_updatingPlay = true;
			
			// Run the interval if we aren't updating manually
			if (!this.manualUpdate)
			{
				_playInterval = global.setInterval(playUpdate, 10);
			}	
		} 
		catch (ex) 
		{
			Debug.error("SoundPlayException: Sound Playback has failed: " + ex);
			return false;
		}
		return true;
	};
	
	/**
	*  The play updating function
	*  
	*  @method playUpdate
	*/
	var playUpdate = function()
	{
		var timeoutAmt;
		var sound = _sounds[_playingAlias];
		
		// Reset the timeout if the scrubber moves
		if (!_scrubberMoved && global.Math.abs(_audio.currentTime - _scrubberStartTime) > 0.1)
		{
			if (DEBUG) 
			{
				Debug.log("Scrubber moved Once. Current time is: " + _scrubberStartTime.toFixed(3) + " to " + _audio.currentTime.toFixed(3));
			}
			_scrubberMoved = true;
			_scrubberStartTime = _audio.currentTime;
		
			if (_playTimeout)
			{
				global.clearTimeout(_playTimeout);
			}
			
			timeoutAmt = (sound.end - _audio.currentTime);
			
			if (global.Math.abs(timeoutAmt - sound.duration) > 0.1)
			{
				timeoutAmt = sound.duration;
			}
			
			_playTimeout = global.setTimeout(onPlayTimeout, timeoutAmt * 1000 + 500);	
		}
		else if (!_successfullyPlayedSound && _audio.currentTime !== _scrubberStartTime)
		{
			_successfullyPlayedSound = true;
			
			if (DEBUG)
			{
				Debug.log("Scrubber moved for a second time from " + _scrubberStartTime.toFixed(2) + " to " + _audio.currentTime.toFixed(2));	
			}
			
			if (_audio.currentTime < sound.start - 0.5)
			{
				if (DEBUG)
				{
					Debug.log("Scrubber moved a second time but is out of range so set current time to the sound start time");
				}										
				_audio.currentTime = sound.start;
			}
		}
		else if (_scrubberMoved && _successfullyPlayedSound)
		{
			// Only progress if the current time increases
			if (_audio.currentTime > _lastCurrentTime)
			{
				// Report the process event, clamp between 0 and 1, incase the current time is out of bounds
				var progress = Math.max(0, Math.min((_audio.currentTime - sound.start) / sound.duration, 1));
				_instance.trigger(SwishSprite.PROGRESS, progress);
			}
			_lastCurrentTime = _audio.currentTime;
			
			// If we're at the end
			if (_audio.currentTime >= sound.end)
			{
				// If the current audio sprite is done playing then stop the audio playback
				if (DEBUG) 
				{
					Debug.log("Audio current time (" + _audio.currentTime + " is greater than the sound duration plus start time (" + sound.end + "), so sound is complete.");
				}
				soundPlayComplete();
			}
		}
	};
	
	/**
	*  Destroy the audiosprite, don't use after this
	*  must recreate the SwishSprite
	*  
	*  @method destroy
	*/
	p.destroy = function() 
	{
		this.manualUpdate = false;
		
		_updatingPlay = false;
		_updatingLoad = false;
		
		if (_playInterval)
		{
			global.clearInterval(_playInterval);
		}
		if (_checkInterval)
		{
			global.clearInterval(_checkInterval);
		}
		if (_playTimeout)
		{
			global.clearTimeout(_playTimeout);
		}
		if (_loadInterval)
		{
			global.clearInterval(_loadInterval);
		}
		if (_pageVisibility)
		{
			_pageVisibility.destroy();
		}
		_pageVisibility = null;
		
		_audio.removeEventListener("canplay", onLoadChange);
		_audio.removeEventListener("canplaythrough", onCanPlayThrough);
		_audio.removeEventListener("loadeddata", onLoadChange);
		_audio.removeEventListener("loadedmetadata", onLoadChange);
		_audio.removeEventListener("progress", onLoadChange);
		_audio.removeEventListener("ended", soundPlayComplete);
		_audio.removeEventListener("stalled", onStalled);
		
		this.off();
		
		this.stop();
		this.clear();
		
		_audio = null;
		_instance = null;
	};
	
	/**
	*  Get whether the audio has been loaded yet
	*  @method isLoaded
	*  @return {bool} If loaded
	*/
	p.isLoaded = function()
	{
		return _loaded;
	};
	
	/** 
	* Function call when load has started
	* @method onLoadStarted
	*/
	var onLoadStarted = function()
	{
		if (DEBUG)
		{
			Debug.log("onLoadStarted");	
		}
		
		if (!_loadStarted)
		{
			_loadStarted = true;
			_instance.trigger(SwishSprite.LOAD_STARTED);
		
			// Start a timer that checks the scrubber position
			_checkInterval = global.setInterval(checkUpdate, 1000);
		}
	},
	
	/** 
	* Callback when page visibility has gone to hidden
	* @method onBlur
	*/
	onBlur = function() 
	{
		if (!_instance) return;
		
		// Only do this once (this callback can happen repeatedly)
		if (_autoPaused == -1)
		{
			// save the current status of the paused state
			_autoPaused = _paused ? 1 : 0;
		}
		_instance.pause();
	},
	
	/** 
	* Callback when page visibility has gone to show
	* @method onFocus
	*/
	onFocus = function()
	{
		if (!_instance) return;
		
		// 0 means we were playing before we went away
		// if that's the case we should unpause what the page
		// blur created
		if (_autoPaused === 0)
		{
			_instance.resume();
		}
		_autoPaused = -1;
	},
	
	/**
	*  1 second update to check what the status of the scrubber is
	*  @method checkUpdate
	*/
	checkUpdate = function()
	{	
		var sound = _sounds[_playingAlias];
		if (_playingAlias)
		{
			/*if (DEBUG)
			{
				Debug.log("audio.currentTime: " + _audio.currentTime + ", _sounds[" + _playingAlias + "].start " + sound.start + ", endTime: " + sound.end + ", paused: " + _paused + ", audio.paused: " + _audio.paused);
			}*/
			
			// If the scrubber is out of range
			if (_audio.currentTime < sound.start - 1 || _audio.currentTime > (sound.end + 1))
			{
				_outOfRangeCount += 1;
				Debug.warn("ScrubberOutOfRange: The scrubber position (" + _audio.currentTime + ") is out of range (" + sound.start + " - " +  sound.end + "). This warning reported " + _outOfRangeCount + " times.");
				if (_outOfRangeCount >= 5)
				{
					if (DEBUG)
					{
						Debug.log("OutofRangeCount too many times, setting audio current time to the sound start time: " + sound.start);
					}
					_audio.currentTime = sound.start;
				}
			} 
			else 
			{
				_outOfRangeCount = 0;
			}
			
			if (_audio.currentTime !== _lastScrubberPos)
			{
				_scrubberNotMovingCount = 0;
				_lastScrubberPos = _audio.currentTime;					
			} 
			else
			{
				_scrubberNotMovingCount++;
				
				if (DEBUG)
				{
					Debug.warn("AudioNotPlaying: The scrubber position has not changed in a while. This warning reported " + _scrubberNotMovingCount + " times.");
				}
				
				if (!_paused && _scrubberNotMovingCount >= 5)
				{
					if (DEBUG)
					{
						Debug.log("_scrubberNotMovingCount too many times so playing.");
					}
					_audio.play();
				}
			}	
		} 
		else 
		{
			_outOfRangeCount = 0;
			_scrubberNotMovingCount = 0;				
		}
	},
	
	/** 
	* Function call when load state has changed 
	* @method onLoadChange
	*/
	onLoadChange = function()
	{		
		var buffered = 0, loadAmount;
		
		if (_audio.buffered.length)
		{
			buffered = _audio.buffered.end(_audio.buffered.length - 1);
		}
		
		if (!_loadStarted && buffered > 0 && _audio.duration > 0)
		{
			onLoadStarted();
		}
		
		if (!_loaded) 
		{
			// Check how much we've current loaded
			loadAmount = Math.max(1, buffered / _audio.duration);
			
			// Make sure we ahve something to buffer and there's a duration
			if (isNaN(loadAmount)) return;
			
			// Check for changes in the load amount
			if (loadAmount !== _loadAmount)
			{
				_loadAmount = loadAmount;
				_instance.trigger(SwishSprite.LOAD_PROGRESS, _loadAmount);
				if (DEBUG) 
				{
					Debug.log("Audio load Percentage: " + (loadAmount * 100).toFixed(2) + "%");
				}
			}
			
			// Check for the load completed
			if (1 - loadAmount < 0.001)
			{
				_updatingLoad = false;
				global.clearInterval(_loadInterval);
				_loadAmount = 1;
				_loaded = true;

				// Start playing the sound right way, having
				// 5 seconds of silence at the beginning of a sprite
				// sheet is pretty standard, this fixes
				// some playback initialization issues with Android
				if (_sounds.silence !== undefined) 
					_instance.play("silence");
								
				_instance.trigger(SwishSprite.LOADED);
			}
		}
	},
	
	/**
	* Callback on playback timeout
	* @method onPlayTimeout
	*/
	onPlayTimeout = function()
	{
		var sound = _sounds[_playingAlias];
		if (DEBUG)
		{
			Debug.warn("SoundTimeout: Audio scrubber at position " + _audio.currentTime.toFixed(3) + " but expected " + sound.end.toFixed(3) + " Sound Details [Name: " + _playingAlias + ", Start Time: " + sound.start + " Duration: " + sound.duration + "]");
		}
	},
	
	/**
	* Callback on canplaythrough event
	* @method onCanPlayThrough
	*/
	onCanPlayThrough = function()
	{
		if (DEBUG)
		{	
			Debug.log("onCanPlayThrough");
		}
		onLoadStarted();
	},
	
	/**
	* Callback when audio has stalled
	* 
	* @method onStalled
	*/
	onStalled = function()
	{
		if (!_loadStarted) 
		{
			Debug.log("Media stalled before load started");
		}
	},
	
	/**
	* When sound has completed callback
	* 
	* @method soundPlayComplete
	*/
	soundPlayComplete = function()
	{
		var sound = _sounds[_playingAlias];
		if (sound && sound.loop)
		{
			_instance.pause();
			
			// Move the scrubber so if the audio autoplays from coming out of focus it will start from the correct point
			_audio.currentTime = sound.start;
			
			// Use setTimeout so it will not work in Safari Mobile if the window is not in focus
			global.setTimeout(
				function()
				{	
					if (DEBUG)
					{
						Debug.log("Play sound (" + _playingAlias + ") because it is set to loop.");
					}
					_instance.trigger(SwishSprite.PROGRESS, 1);
					_instance.trigger(SwishSprite.COMPLETE);
					if (_playingAlias) _instance.play(_playingAlias);
				}, 0);
		} 
		else 
		{
			_instance.stop();
			_instance.trigger(SwishSprite.PROGRESS, 1);
			_instance.trigger(SwishSprite.COMPLETE);
		}
	};
	
	namespace('cloudkid').SwishSprite = SwishSprite;
		
}(window));