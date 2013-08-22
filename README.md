#SwishSprite

JavaScript library for playing HTML5 audio sprites. An audio sprite is multiple audio files combined into a single audio file with a little silence inbetween each sound. Playback is generally supported on any devices which support HTML5's `<audio>` element. 

##Features

+ No Flash fallbacks or shim
+ Supported by native `<audio>` HTML5 element
+ Wide desktop and mobile browser support
+ Minified version of less than 9K
+ Tested on iOS5+ Safari & Chrome, Android 2.3+ and current desktop browsers
+ Ideal for HTML5 game audio when WebAudio API is not available

##Usage

```js
// Create the new audio sprite
var audio = new cloudkid.SwishSprite(['sprite.m4a', 'sprite.ogg', 'sprite.mp3']);

// Add the audio sprites 
audio.setSound('intro', 3, 2, false);
audio.setSound('music', 5, 20, true);
audio.setSound('bleep', 26, 0.5, false);

// Add listener for the Loaded event
audio.addEventListener(SwishSprite.LOAD_STARTED, function(){
	
    // Play the audio when it's done loading
	audio.play('music');
});

// Trigger a user load on a button press
// for mobile browser that require a user's
// input before initiating the audio load
$('button#load').click(function(){
	audio.loadByUserInteraction();
});

```

We suggest using [audiosprite](https://github.com/CloudKidStudio/audiosprite) to generate your audio sprite map. Then creating your SwishSprite using the map JSON:

```js
// Load the audiosprite map JSON with jQuery
$.getJSON("sprite.json", function(data){

	// Create new SwishSprite from map
	var audio = cloudkid.AudioUtils.createFromSpriteMap(data);
});
```

##Format Note

Audio codec support vary widely between browsers. We suggest using m4a, oga, mp3 (in that order) for the largest and most accurate playback support.

##API Documentation

###cloudkid.SwishSprite

####Methods

+ **`SwishSprite(resources)`** Constructor for the SwishSprite
	+ **@param _resources_** {string|array} can be a URL or an array of URL in order of browser preference
+ **`getAudioElement()`** Get the DOM Element used by the SwishSprite
	+ **@return {DOMElement}** The `<audio>` element
+ **`mute()`** Mute the audio volume
+ **`unmute()`** Unmute the audio volume
+ **`pause()`** Pause the current sprite playback
+ **`resume()`** Resume the current sprite playback
+ **`stop()`** Stop the sprite playback and clear the current sprite
+ **`getLength(alias)`** Return the length of a sprite in seconds
	+ **@param _alias_** {string|undefined} If undefined, returns the current sprite length or else the sprite alias specified
	+ **@return {number}** The duration of the sprite in seconds
+ **`getPosition`** Get the current local position of plaback on the current sprite being played
	+ **@return {number}** The local position in seconds of the current sprite being played back. If there is no sprite, returns a value of 0.
+ **`getSound(alias)`** Get the sound data for a sprite or the current sprite being played.
	* **@param _alias_** {string|undefined} If undefined, returns the current sprite else the name of the sprite. 
    * **@return {object}** Returns and object with keys of start (number of seconds when the sprite begins on the audio), end (number of seconds when the sprite ends), duration (the total number of seconds of the sprite), and loop (boolean if the sprite should loop).
+ **`clear()`** Remove all of the current sound sprite data.
+ **`loadByUserInteraction()`** Some mobile browsers require a sound to be load only by a user interaction. This should be triggered upon callback of a user click. 
+ **`play(alias, playStartTime)`** Play an sprite by name
	+ **@param _alias_** {string} The name alias for a sprite
    + **@param _playStartTime_** {number|undefined} The optional start time to play a sound. This is in global seconds to the whole audio, not local as returned by `getPosition`
+ **`update()`** Optional, for optimization purposes, you can use your own update function as the internal ticker for the playback. If you play to use this feature make sure to set `manualUpdate` to true;

####Properties

+ **`manualUpdate`** {boolean} If you plan to manually call the SwishSprite's update function by setting your own interval.

####Events

+ **`LOAD_STARTED`** Event dispatched when load has started
+ **`LOADED`** Event dispatched with audio loaded
+ **`LOAD_PROGRESS`** Event dispatched when percentage of load changed
+ **`COMPLETE`** Event dispatched when sound play completed
+ **`PROGRESS`** Event dispatched when the play progress has changed
+ **`PAUSED`** Event dispatched when the playback has paused
+ **`UNPAUSED`** Event dispatched when the playback as resumed

###cloudkid.AudioUtils

####Methods

+ **`createFromSpriteMap(map)`** Create and SwishSprite from an audio sprite map. 
	+ **@param _map_** {object} The data which represents the sprites in the audio file. Must be in this format:
    ```js
      {
      	// The list of files, orderd by preference
        "resources": [
          "sounds/output.m4a",
          "sounds/output.oga",
          "sounds/output.mp3"
        ],
        // The spritemap dictionary
        "spritemap": {
          "silence": {
            "start": 0,
            "end": 5,
            "loop": true
          },
          "boing": {
            "start": 6,
            "end": 6.7785714285714285,
            "loop": false
          }
        }
      }
    ```
	+ **@return** {SwishSprite} Returns the instance of the SwishSprite object.
    
##License

Copyright (c) 2013 Matt Moore and [CloudKid, LLC](http://cloudkid.com)

Released under the MIT License.