#SwishSprite

JavaScript library for playing HTML5 audio sprites. An audio sprite is multiple audio files combined into a single audio file with a little silence inbetween each sound. Playback is generally supported on any devices which support HTML5's `<audio>` element. 

##Features

+ No Flash fallbacks or shim
+ Supported by native `<audio>` HTML5 element
+ Wide desktop and mobile browser support
+ Minified version of less than 9K
+ Tested on iOS5+ Safari & Chrome, Android 2.3+ and current desktop browsers
+ Ideal for HTML5 game audio when WebAudio API is not available

##Installation

Install using bower.

```bash
bower install swish-sprite
```

##Usage

```js
// Create the new audio sprite
var audio = new cloudkid.SwishSprite(['sprite.m4a', 'sprite.ogg', 'sprite.mp3']);

// Add the audio sprites 
audio.setSound('intro', 3, 2, false);
audio.setSound('music', 5, 20, true);
audio.setSound('bleep', 26, 0.5, false);

// Add listener for the Loaded event
audio.on('loaded', function(){
	
    // Play the audio when it's done loading
	audio.play('music');
});

// Trigger a user load on a button press
// for mobile browser that require a user's
// input before initiating the audio load
$('button#load').click(function(){
	audio.load();
});

```

We suggest using [audiosprite](https://github.com/CloudKidStudio/audiosprite) to generate your audio sprite map. Then creating your SwishSprite using the map JSON:

```js
// Load the audiosprite map JSON with jQuery
$.getJSON("sprite.json", function(data){

	// Create new SwishSprite from map
	var audio = new cloudkid.SwishSprite(data);
	
	// Trigger a user load on a button press
	// for mobile browser that require a user's
	// input before initiating the audio load
	$('button#load').click(function(){
		audio.load();
	});

	// Add event for when audio finishes loading
	audio.on('loaded', function(){
		audio.play('music');
	});
});
```

##Format Note

Audio codec support vary widely between browsers. We suggest using m4a, oga, mp3 (in that order) for the largest and most accurate playback support.

##API Documentation

### YUI Docs

http://cloudkidstudio.github.io/SwishSprite/

###cloudkid.SwishSprite

####Methods

**SwishSprite(resources)** Constructor for the SwishSprite

+ @param **resources** _string|array|object_ Can be a URL string, an array of URL in order of browser preference, or a spritemap in the following format:

	```
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


**getAudioElement()** Get the DOM Element used by the SwishSprite

+ @return _DOMElement_ The `<audio>` element
    
**mute()** Mute the audio volume

+ @return _SwishSprite_ The current instance of SwishSprite

**unmute()** Unmute the audio volume

+ @return _SwishSprite_ The current instance of SwishSprite

**pause()** Pause the current sprite playback

+ @return _SwishSprite_ The current instance of SwishSprite

**resume()** Resume the current sprite playback

+ @return _SwishSprite_ The current instance of SwishSprite

**stop()** Stop the sprite playback and clear the current sprite

+ @return _SwishSprite_ The current instance of SwishSprite

**getLength(alias)** Return the length of a sprite in seconds

+ @param **alias** _string|undefined_ If undefined, returns the current sprite length or else the sprite alias specified
+ @return _number_ The duration of the sprite in seconds
    
**getPosition** Get the current local position of plaback on the current sprite being played

+ @return _number_ The local position in seconds of thecurrent sprite being played back. If there is no sprite, returns a value of 0.
    
**getSound(alias)** Get the sound data for a sprite or the current sprite being played.

+ @param **alias** _string|undefined_ If undefined, returns the current sprite else the name of the sprite. 
+ @return _object_ Returns and object with keys of start (number of seconds when the sprite begins on the audio), end (number of seconds when the sprite ends), duration (the total number of seconds of the sprite), and loop (boolean if the sprite should loop).

**setSound(alias, startTime, duration, isLoop)** Set the sound date for a particular sprite sound.

+ @param **alias** _string_ The alias to set for playing
+ @param **startTime** _number_ The start position of the sprite in seconds
+ @param **duration** _number_ The length of the sprite in seconds
+ @param **isLoop** _boolean_ If the sound should loop during playback
+ @return _SwishSprite_ The current instance of SwishSprite

**clear()** Remove all of the current sound sprite data.

+ @return _SwishSprite_ The current instance of SwishSprite

**load()** Some mobile browsers require a sound to be load only by a user interaction. This should be triggered upon callback of a user click. 

+ @return _SwishSprite_ The current instance of SwishSprite

**play(alias, playStartTime)** Play an sprite by name

+ @param **alias** _string_ The name alias for a sprite
+ @param **playStartTime** _number|undefined_ The optional start time to play a sound. This is in global seconds to the whole audio, not local as returned by `getPosition`
+ @return _boolean_ If we were able to successfully start playing

**update()** Optional, for optimization purposes, you can use your own update function as the internal ticker for the playback. If you play to use this feature make sure to set `manualUpdate` to true;

**on(name, callback)** Add an event listeners (see Events section below for complete list)

+ @param **name** _string|object_ The name of the event or multiple events separated by spaces or an object map of the `{ event : callback, event1 : callback1 }`
+ @param **callback** _array|function_ The collection of functions or single function to call when event is fired
+ @return _SwishSprite_ The current instance of SwishSprite

**off(name, callback)** Remove an event listener (see Events section below for complete list)

+ @param **name** _string|undefined_ The name of the event. If undefined, remove all event listeners
+ @param **callback** _array|function|undefined_ The function, collection of functions to remove. If undefined, we remove all listeners for a given type. 
+ @return _SwishSprite_ The current instance of SwishSprite

####Properties

**manualUpdate** _boolean_ If you plan to manually call the SwishSprite's `update` method by setting your own external interval. The default is false.

####Events

| Constant			| String		| Description							|
|-------------------|---------------|---------------------------------------|
| **LOAD_STARTED**	| loadStarted	| when load has started					|
| **LOADED**		| loaded		| with audio loaded						|
| **LOAD_PROGRESS**	| loadProgress	| when percentage of load changed		|
| **COMPLETE**		| complete		| when sound play completed				|
| **PROGRESS**		| progress		| when the play progress has changed	|
| **PAUSED**		| paused		| when the playback has paused			|
| **RESUMED**		| resumed		| when the playback as resumed			|
| **STOPPED**		| stopped		| when playback has stopped				|
| **STARTED**		| started		| when playback has started				|


##Build Instructions

1. Install [NPM](https://npmjs.org/)
2. Install [UglifyJS](https://github.com/mishoo/UglifyJS) `npm install uglifyjs -g`
3. Install [JSHint](https://github.com/jshint/jshint/) `npm install jshint -g`
4. Install [Apache Ant](http://ant.apache.org/)
5. Build project `ant -f build.xml buildAll`

##License

Copyright (c) 2014 Matt Karl [@bigtimebuddy](http://github.com/bigtimebuddy) and [CloudKid, LLC](http://cloudkid.com)

Released under the MIT License.
