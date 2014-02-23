!function(global) {
    "use strict";
    if (!("namespace" in global)) {
        var namespace = function(namespaceString) {
            for (var parts = namespaceString.split("."), parent = window, currentPart = "", i = 0, length = parts.length; length > i; i++) currentPart = parts[i], 
            parent[currentPart] = parent[currentPart] || {}, parent = parent[currentPart];
            return parent;
        };
        global.namespace = namespace;
    }
}(window), function(global, undefined) {
    "use strict";
    function output(level, args) {
        Debug.output && Debug.output.append('<div class="' + level + '">' + args + "</div>");
    }
    var Debug = function() {}, hasConsole = global.console !== undefined;
    Debug.GENERAL = 0, Debug.DEBUG = 1, Debug.INFO = 2, Debug.WARN = 3, Debug.ERROR = 4, 
    Debug.minLogLevel = Debug.GENERAL, Debug.enabled = !0, Debug.output = null, Debug.log = function(params) {
        Debug.enabled && Debug.minLogLevel == Debug.GENERAL && hasConsole && (console.log(params), 
        output("general", params));
    }, Debug.debug = function(params) {
        Debug.enabled && Debug.minLogLevel <= Debug.DEBUG && hasConsole && (console.debug(params), 
        output("debug", params));
    }, Debug.info = function(params) {
        Debug.enabled && Debug.minLogLevel <= Debug.INFO && hasConsole && (console.info(params), 
        output("info", params));
    }, Debug.warn = function(params) {
        Debug.enabled && Debug.minLogLevel <= Debug.WARN && hasConsole && (console.warn(params), 
        output("warn", params));
    }, Debug.error = function(params) {
        Debug.enabled && hasConsole && (console.error(params), output("error", params));
    }, Debug.assert = function(truth, params) {
        hasConsole && Debug.enabled && console.assert && (console.assert(truth, params), 
        truth || output("error", params));
    }, Debug.dir = function(params) {
        Debug.minLogLevel == Debug.GENERAL && hasConsole && Debug.enabled && console.dir(params);
    }, Debug.trace = function(params) {
        Debug.minLogLevel == Debug.GENERAL && hasConsole && Debug.enabled && console.trace(params);
    }, global.Debug = Debug;
}(window), function(global, doc, undefined) {
    "use strict";
    var PageVisibility = function(onFocus, onBlur) {
        this.initialize(onFocus, onBlur);
    }, p = PageVisibility.prototype, _visibilityChange = null;
    p._onFocus = null, p._onBlur = null, p._onToggle = null, doc.hidden !== undefined ? _visibilityChange = "visibilitychange" : doc.mozHidden !== undefined ? _visibilityChange = "mozvisibilitychange" : doc.msHidden !== undefined ? _visibilityChange = "msvisibilitychange" : doc.webkitHidden !== undefined && (_visibilityChange = "webkitvisibilitychange"), 
    p.initialize = function(onFocus, onBlur) {
        if (_visibilityChange) {
            this._onBlur = onBlur, this._onFocus = onFocus;
            var onVisibilityChange = function() {
                doc.hidden || doc.webkitHidden || doc.msHidden || doc.mozHidden ? onBlur() : onFocus();
            };
            doc.addEventListener(_visibilityChange, onVisibilityChange, !1), global.addEventListener("pagehide", onBlur), 
            global.addEventListener("pageshow", onFocus), global.addEventListener("blur", onBlur), 
            global.addEventListener("focus", onFocus), global.addEventListener("visibilitychange", onVisibilityChange, !1), 
            this._onToggle = onVisibilityChange;
        }
    }, p.destroy = function() {
        _visibilityChange && (global.removeEventListener("pagehide", this._onBlur), global.removeEventListener("pageshow", this._onFocus), 
        global.removeEventListener("blur", this._onBlur), global.removeEventListener("focus", this._onFocus), 
        global.addEventListener("visibilitychange", this._onToggle), doc.removeEventListener(_visibilityChange, this._onToggle, !1), 
        this._onFocus = null, this._onBlur = null);
    }, namespace("cloudkid").PageVisibility = PageVisibility;
}(window, document), function(global, undefined) {
    "use strict";
    function type(value) {
        return null === value ? String(value) : "object" == typeof value || "function" == typeof value ? Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || "object" : typeof value;
    }
    var EventDispatcher = function() {}, p = EventDispatcher.prototype;
    p._listeners = [], p.trigger = function(type, params) {
        if (this._listeners[type] !== undefined) for (var listeners = this._listeners[type], i = 0; i < listeners.length; i++) listeners[i](params);
    }, p.on = function(name, callback) {
        if ("object" === type(name)) for (var key in name) name.hasOwnProperty(key) && this.on(key, name[key]); else if ("function" === type(callback)) for (var names = name.split(" "), n = null, i = 0, nl = names.length; nl > i; i++) n = names[i], 
        this._listeners[n] = this._listeners[n] || [], -1 === this._callbackIndex(n, callback) && this._listeners[n].push(callback); else if ("array" === type(callback)) for (var f = 0, fl = callback.length; fl > f; f++) this.on(name, callback[f]);
        return this;
    }, p.off = function(name, callback) {
        if (name === undefined) this._listeners = []; else if ("array" === type(callback)) for (var f = 0, fl = callback.length; fl > f; f++) this.off(name, callback[f]); else for (var names = name.split(" "), n = null, i = 0, nl = names.length; nl > i; i++) if (n = names[i], 
        this._listeners[n] = this._listeners[n] || [], callback === undefined) this._listeners[n].length = 0; else {
            var index = this._callbackIndex(n, callback);
            -1 !== index && this._listeners[name].splice(index, 1);
        }
        return this;
    }, p._callbackIndex = function(name, callback) {
        for (var i = 0, l = this._listeners[name].length; l > i; i++) if (this._listeners[name][i] === callback) return i;
        return -1;
    }, namespace("cloudkid").EventDispatcher = EventDispatcher;
}(window), function(global, undefined) {
    "use strict";
    var SwishSprite = function(data) {
        this.initialize(data);
    }, p = SwishSprite.prototype = new cloudkid.EventDispatcher(), _audio = null, _paused = !0, _loaded = !1, _updatingLoad = !1, _updatingPlay = !1, _loadStartedByUserInteraction = !1, _loadStarted = !1, _playInterval = null, _loadInterval = null, _playTimeout = null, _loadAmount = 0, _sounds = null, _formatPadding = 0, _playingAlias = null, _scrubberMoved = null, _outOfRangeCount = null, _scrubberNotMovingCount = 0, _successfullyPlayedSound = !1, _scrubberStartTime = null, _checkInterval = null, _lastScrubberPos = null, _instance = null, _pageVisibility = null, _autoPaused = -1, _lastCurrentTime = null;
    SwishSprite.LOAD_STARTED = "loadStarted", SwishSprite.LOADED = "loaded", SwishSprite.LOAD_PROGRESS = "loadProgress", 
    SwishSprite.COMPLETE = "complete", SwishSprite.PROGRESS = "progress", SwishSprite.PAUSED = "paused", 
    SwishSprite.RESUMED = "resumed", SwishSprite.STOPPED = "stopped", SwishSprite.STARTED = "started", 
    SwishSprite.M4A_PADDING = .1, SwishSprite.VERSION = "1.0.2", p.manualUpdate = !1, 
    p.initialize = function(data) {
        var AudioUtils = cloudkid.AudioUtils;
        if (!AudioUtils.supported()) throw "HTML5 Audio is not supported!";
        if (null !== _instance) throw "SwishSprite instance is already create. Destroy before re-creating";
        this.clear();
        var playableUrl = null !== data && "object" == typeof data ? AudioUtils.importSpriteMap(this, data) : AudioUtils.getPlayableURL(data);
        if (!playableUrl) throw "The supplied filetype is unsupported in this browser.";
        _instance = this, _loadStartedByUserInteraction = !1, _loaded = !1, _paused = !0, 
        _loadStarted = !1, _scrubberNotMovingCount = 0, _successfullyPlayedSound = !1, _pageVisibility = new cloudkid.PageVisibility(onFocus, onBlur), 
        _autoPaused = -1, _formatPadding = playableUrl.indexOf(".m4a") > -1 ? SwishSprite.M4A_PADDING : 0, 
        _audio = global.document.createElement("audio"), _audio.addEventListener("canplay", onLoadChange), 
        _audio.addEventListener("canplaythrough", onCanPlayThrough), _audio.addEventListener("loadeddata", onLoadChange), 
        _audio.addEventListener("loadedmetadata", onLoadChange), _audio.addEventListener("progress", onLoadChange), 
        _audio.addEventListener("ended", soundPlayComplete), _audio.addEventListener("stalled", onStalled), 
        Debug.log("_audio.src: " + playableUrl), _audio.src = playableUrl;
    }, p.getAudioElement = function() {
        return _audio;
    }, p.mute = function() {
        return _audio.volume = 0, this;
    }, p.unmute = function() {
        return _audio.volume = 1, this;
    }, p.pause = function() {
        Debug.log("SwishSprite.pause"), _updatingPlay = !1, _playInterval && global.clearInterval(_playInterval), 
        _playTimeout && global.clearTimeout(_playTimeout);
        var oldPaused = _paused;
        return _audio.pause(), _paused = !0, oldPaused || this.trigger(SwishSprite.PAUSED), 
        this;
    }, p.resume = function() {
        return Debug.log("SwishSprite.resume"), _paused && _playingAlias && (this.play(_playingAlias, _audio.currentTime), 
        this.trigger(SwishSprite.RESUMED)), this;
    }, p.stop = function() {
        return Debug.log("SwishSprite.stop"), null !== _playingAlias && this.trigger(SwishSprite.STOPPED), 
        this.pause(), _playingAlias = null, this;
    }, p.getLength = function(alias) {
        return alias === undefined && _playingAlias !== undefined ? _sounds[_playingAlias].duration : alias !== undefined ? _sounds[alias].duration : 0;
    }, p.getPosition = function() {
        return _playingAlias !== undefined && _sounds[_playingAlias] !== undefined ? _audio.currentTime - _sounds[_playingAlias].start : 0;
    }, p.getSound = function(alias) {
        return alias === undefined && _playingAlias !== undefined ? _sounds[_playingAlias] : alias ? _sounds[alias] : void 0;
    }, p.setSound = function(alias, startTime, duration, isLoop) {
        var padding = isLoop ? 0 : _formatPadding;
        return _sounds[alias] = {
            start: startTime - padding,
            end: startTime + duration + padding,
            duration: duration + 2 * padding,
            loop: isLoop
        }, this;
    }, p.prepare = function(alias) {
        _sounds[alias] !== undefined && (_audio.currentTime = _sounds[alias].start);
    }, p.clear = function() {
        return _sounds = {}, this;
    }, p.load = function() {
        if (Debug.log("SwishSprite.load"), !_loadStartedByUserInteraction) {
            _loadStartedByUserInteraction = !0;
            try {
                if (_loadInterval && global.clearInterval(_loadInterval), _updatingLoad = !0, this.manualUpdate || (_loadInterval = global.setInterval(onLoadChange, 10)), 
                _sounds.silence === undefined) throw "'silence' audio is required";
                this.play("silence");
            } catch (e) {
                Debug.log("load: Audio did not play: " + e.message);
            }
        }
        return this;
    }, p.update = function() {
        _updatingLoad && onLoadChange(), _updatingPlay && playUpdate();
    }, p.play = function(alias, playStartTime) {
        var startTime;
        if (_outOfRangeCount = 0, _updatingPlay = !1, global.clearInterval(_playInterval), 
        global.clearTimeout(_playTimeout), _sounds[alias] === undefined) return Debug.error("SoundUnknown: Sound not found. Playing sound '" + alias + "' has failed."), 
        !1;
        var sound = _sounds[alias];
        startTime = sound.start, playStartTime !== undefined && playStartTime >= sound.start && playStartTime < sound.end && (startTime = playStartTime);
        try {
            _scrubberMoved = !1, _audio.pause(), _scrubberStartTime = _audio.currentTime;
            try {
                _audio.currentTime = _lastCurrentTime = startTime;
            } catch (ex) {
                Debug.error("CurrentTimeSetException: Setting the current time has failed: " + ex);
            }
            if (Math.abs(_audio.currentTime - startTime) > .5) return Debug.warn("ScrubberNotMoving: Set the scrubber to " + startTime + " however it is " + _audio.currentTime + ". Playing sound '" + alias + "' has failed."), 
            !0;
            _playingAlias = alias, _paused = !1, _audio.play(), _instance.trigger(SwishSprite.STARTED);
            var progress = Math.max(0, Math.min((_audio.currentTime - _sounds[_playingAlias].start) / _sounds[_playingAlias].duration, 1));
            _instance.trigger(SwishSprite.PROGRESS, progress), _playTimeout = global.setTimeout(onPlayTimeout, 1e3 * _sounds[_playingAlias].duration + 500), 
            _updatingPlay = !0, this.manualUpdate || (_playInterval = global.setInterval(playUpdate, 10));
        } catch (ex) {
            return Debug.error("SoundPlayException: Sound Playback has failed: " + ex), !1;
        }
        return !0;
    };
    var playUpdate = function() {
        var timeoutAmt, sound = _sounds[_playingAlias];
        if (!_scrubberMoved && global.Math.abs(_audio.currentTime - _scrubberStartTime) > .1) Debug.log("Scrubber moved Once. Current time is: " + _scrubberStartTime.toFixed(3) + " to " + _audio.currentTime.toFixed(3)), 
        _scrubberMoved = !0, _scrubberStartTime = _audio.currentTime, _playTimeout && global.clearTimeout(_playTimeout), 
        timeoutAmt = sound.end - _audio.currentTime, global.Math.abs(timeoutAmt - sound.duration) > .1 && (timeoutAmt = sound.duration), 
        _playTimeout = global.setTimeout(onPlayTimeout, 1e3 * timeoutAmt + 500); else if (_successfullyPlayedSound || _audio.currentTime === _scrubberStartTime) {
            if (_scrubberMoved && _successfullyPlayedSound) {
                if (_audio.currentTime > _lastCurrentTime) {
                    var progress = Math.max(0, Math.min((_audio.currentTime - sound.start) / sound.duration, 1));
                    _instance.trigger(SwishSprite.PROGRESS, progress);
                }
                _lastCurrentTime = _audio.currentTime, _audio.currentTime >= sound.end && (Debug.log("Audio current time (" + _audio.currentTime + " is greater than the sound duration plus start time (" + sound.end + "), so sound is complete."), 
                soundPlayComplete());
            }
        } else _successfullyPlayedSound = !0, Debug.log("Scrubber moved for a second time from " + _scrubberStartTime.toFixed(2) + " to " + _audio.currentTime.toFixed(2)), 
        _audio.currentTime < sound.start - .5 && (Debug.log("Scrubber moved a second time but is out of range so set current time to the sound start time"), 
        _audio.currentTime = sound.start);
    };
    p.destroy = function() {
        this.manualUpdate = !1, _updatingPlay = !1, _updatingLoad = !1, _playInterval && global.clearInterval(_playInterval), 
        _checkInterval && global.clearInterval(_checkInterval), _playTimeout && global.clearTimeout(_playTimeout), 
        _loadInterval && global.clearInterval(_loadInterval), _pageVisibility && _pageVisibility.destroy(), 
        _pageVisibility = null, _audio.removeEventListener("canplay", onLoadChange), _audio.removeEventListener("canplaythrough", onCanPlayThrough), 
        _audio.removeEventListener("loadeddata", onLoadChange), _audio.removeEventListener("loadedmetadata", onLoadChange), 
        _audio.removeEventListener("progress", onLoadChange), _audio.removeEventListener("ended", soundPlayComplete), 
        _audio.removeEventListener("stalled", onStalled), this.off(), this.stop(), this.clear(), 
        _audio = null, _instance = null;
    }, p.isLoaded = function() {
        return _loaded;
    };
    var onLoadStarted = function() {
        Debug.log("onLoadStarted"), _loadStarted || (_loadStarted = !0, _instance.trigger(SwishSprite.LOAD_STARTED), 
        _checkInterval = global.setInterval(checkUpdate, 1e3));
    }, onBlur = function() {
        _instance && (-1 == _autoPaused && (_autoPaused = _paused ? 1 : 0), _instance.pause());
    }, onFocus = function() {
        _instance && (0 === _autoPaused && _instance.resume(), _autoPaused = -1);
    }, checkUpdate = function() {
        var sound = _sounds[_playingAlias];
        _playingAlias ? (_audio.currentTime < sound.start - 1 || _audio.currentTime > sound.end + 1 ? (_outOfRangeCount += 1, 
        Debug.warn("ScrubberOutOfRange: The scrubber position (" + _audio.currentTime + ") is out of range (" + sound.start + " - " + sound.end + "). This warning reported " + _outOfRangeCount + " times."), 
        _outOfRangeCount >= 5 && (Debug.log("OutofRangeCount too many times, setting audio current time to the sound start time: " + sound.start), 
        _audio.currentTime = sound.start)) : _outOfRangeCount = 0, _audio.currentTime !== _lastScrubberPos ? (_scrubberNotMovingCount = 0, 
        _lastScrubberPos = _audio.currentTime) : (_scrubberNotMovingCount++, Debug.warn("AudioNotPlaying: The scrubber position has not changed in a while. This warning reported " + _scrubberNotMovingCount + " times."), 
        !_paused && _scrubberNotMovingCount >= 5 && (Debug.log("_scrubberNotMovingCount too many times so playing."), 
        _audio.play()))) : (_outOfRangeCount = 0, _scrubberNotMovingCount = 0);
    }, onLoadChange = function() {
        var loadAmount, buffered = 0;
        if (_audio.buffered.length && (buffered = _audio.buffered.end(_audio.buffered.length - 1)), 
        !_loadStarted && buffered > 0 && _audio.duration > 0 && onLoadStarted(), !_loaded) {
            if (loadAmount = Math.max(1, buffered / _audio.duration), isNaN(loadAmount)) return;
            loadAmount !== _loadAmount && (_loadAmount = loadAmount, _instance.trigger(SwishSprite.LOAD_PROGRESS, _loadAmount), 
            Debug.log("Audio load Percentage: " + (100 * loadAmount).toFixed(2) + "%")), .001 > 1 - loadAmount && (_updatingLoad = !1, 
            global.clearInterval(_loadInterval), _loadAmount = 1, _loaded = !0, _sounds.silence !== undefined && _instance.play("silence"), 
            _instance.trigger(SwishSprite.LOADED));
        }
    }, onPlayTimeout = function() {
        var sound = _sounds[_playingAlias];
        Debug.warn("SoundTimeout: Audio scrubber at position " + _audio.currentTime.toFixed(3) + " but expected " + sound.end.toFixed(3) + " Sound Details [Name: " + _playingAlias + ", Start Time: " + sound.start + " Duration: " + sound.duration + "]");
    }, onCanPlayThrough = function() {
        Debug.log("onCanPlayThrough"), onLoadStarted();
    }, onStalled = function() {
        _loadStarted || Debug.log("Media stalled before load started");
    }, soundPlayComplete = function() {
        var sound = _sounds[_playingAlias];
        sound && sound.loop ? (_instance.pause(), _audio.currentTime = sound.start, global.setTimeout(function() {
            Debug.log("Play sound (" + _playingAlias + ") because it is set to loop."), _instance.trigger(SwishSprite.PROGRESS, 1), 
            _instance.trigger(SwishSprite.COMPLETE), _playingAlias && _instance.play(_playingAlias);
        }, 0)) : (_instance.stop(), _instance.trigger(SwishSprite.PROGRESS, 1), _instance.trigger(SwishSprite.COMPLETE));
    };
    namespace("cloudkid").SwishSprite = SwishSprite;
}(window), function(global, undefined) {
    "use strict";
    var AudioUtils = {};
    AudioUtils.importSpriteMap = function(audio, config) {
        if (config.resources === undefined) throw "Sprite configuration must contain 'resources': an array of file types";
        var playableUrl = AudioUtils.getPlayableURL(config.resources);
        if (config.spritemap === undefined) throw "Sprite configuration must contain 'spritemap': a dictionary of audio sprites";
        var s, alias;
        for (alias in config.spritemap) s = config.spritemap[alias], audio.setSound(alias, s.start, s.end - s.start, s.loop);
        return playableUrl;
    }, AudioUtils.supported = function() {
        return _fileSupport;
    };
    var _fileSupport = function() {
        var elem = document.createElement("audio"), bool = !1;
        try {
            bool = !!elem.canPlayType, bool && (bool = {}, bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), 
            bool.oga = bool.ogg, bool.mp3 = elem.canPlayType("audio/mpeg;").replace(/^no$/, ""), 
            bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), bool.caf = elem.canPlayType("audio/x-caf").replace(/^no$/, ""), 
            bool.m4a = (elem.canPlayType("audio/x-m4a;") || elem.canPlayType("audio/aac;")).replace(/^no$/, ""));
        } catch (e) {}
        return bool;
    }();
    AudioUtils.canPlayURL = function(url) {
        if (!_fileSupport) return !1;
        var ext = url.toLowerCase().match(/\.([a-z0-9]{3})(\?.*)?$/i);
        return ext && ext.length ? (ext = ext[1], _fileSupport[ext] || !1) : !1;
    }, AudioUtils.getPlayableURL = function(url) {
        var i, len, result = null;
        if (url instanceof Array) {
            for (i = 0, len = url.length; len > i; i++) if (url[i] instanceof Object) {
                if (AudioUtils.canPlayURL(url[i].url)) {
                    result = url[i].url;
                    break;
                }
            } else if (AudioUtils.canPlayURL(url[i])) {
                result = url[i];
                break;
            }
        } else AudioUtils.canPlayURL(url) && (result = url);
        return result;
    }, namespace("cloudkid").AudioUtils = AudioUtils;
}(window);