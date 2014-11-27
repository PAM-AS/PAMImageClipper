(function() {
  /**
   * From: http://code.this.com/mobile/articles/fast_buttons.html
   * Also see: http://stackoverflow.com/questions/6300136/trying-to-implement-googles-fast-button
   */

  /** For IE8 and earlier compatibility: https://developer.mozilla.org/en/DOM/element.addEventListener */
  function addListener(el, type, listener, useCapture) {
    if (el.addEventListener) {
      el.addEventListener(type, listener, useCapture);
      return {
        destroy: function() { el.removeEventListener(type, listener, useCapture); }
      };
    } else {
      // see: http://stackoverflow.com/questions/5198845/javascript-this-losing-context-in-ie
      var handler = function(e) {listener.handleEvent(window.event, listener);}
      el.attachEvent('on' + type, handler);
      return {
        destroy: function() { el.detachEvent('on' + type, handler); }
      };
    }
  }

  var isTouch = "ontouchstart" in window; // Is this a touch-based browser?

  /* Construct the FastButton with a reference to the element and click handler. */
  this.FastButton = function(element, handler, useCapture) {
    // collect functions to call to cleanup events
    this.events = [];
    this.touchEvents = [];
    this.element = element;
    this.handler = handler;
    this.useCapture = useCapture;
    if (isTouch){
      this.events.push(addListener(element, 'touchstart', this, this.useCapture));
      this.events.push(addListener(element, 'touchmove', this, this.useCapture));
      this.events.push(addListener(element, 'touchend', this, this.useCapture));
    }
    else {
      this.events.push(addListener(element, 'click', this, this.useCapture)); // Needed for desktop compatibility
    }
  };

  /* Remove event handling when no longer needed for this button */
  this.FastButton.prototype.destroy = function() {
    for (i = this.events.length - 1; i >= 0; i -= 1)
      this.events[i].destroy();
    this.events = this.touchEvents = this.element = this.handler = this.fastButton = null;
  };

  /* acts as an event dispatcher */
  this.FastButton.prototype.handleEvent = function(event) {
    if (typeof me != 'undefined'){ try { clicks.add(); } catch(err) {} }
    switch (event.type) {
      case 'touchstart': this.onTouchStart(event); break;
      case 'touchmove': this.onTouchMove(event); break;
      case 'touchend': this.onClick(event); break;
      case 'click': this.onClick(event); break;
    }
  };

  /* Save a reference to the touchstart coordinate and start listening to touchmove and
   touchend events. Calling stopPropagation guarantees that other behaviors donâ€™t get a
   chance to handle the same click event. This is executed at the beginning of touch. */
  this.FastButton.prototype.onTouchStart = function(event) {
    this.touchEvents.push(addListener(this.element, 'touchend', this, this.useCapture));
    this.touchEvents.push(addListener(document.body, 'touchmove', this, this.useCapture));
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  };

  /* When /if touchmove event is invoked, check if the user has dragged past the threshold of 10px. */
  this.FastButton.prototype.onTouchMove = function(event) {
    if (Math.abs(event.touches[0].clientX - this.startX) > 30 || Math.abs(event.touches[0].clientY - this.startY) > 15) {
      this.reset(); //if he did, then cancel the touch event
    }
  };

  /* Invoke the actual click handler and prevent ghost clicks if this was a touchend event. */
  this.FastButton.prototype.onClick = function(event) {
    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
    this.reset();
    // Use .call to call the method so that we have the correct "this": https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/call
    var result = this.handler.call(this.element, event);
    if (event.type == 'touchend')
      clickbuster.preventGhostClick(this.startX, this.startY);
    return result;
  };

  this.FastButton.prototype.reset = function() {
    for (i = this.touchEvents.length - 1; i >= 0; i -= 1)
      this.touchEvents[i].destroy();
    this.touchEvents = [];
  };

  this.clickbuster = function() {}

  /* Call preventGhostClick to bust all click events that happen within 25px of
   the provided x, y coordinates in the next 2.5s. */
  this.clickbuster.preventGhostClick = function(x, y) {
    clickbuster.coordinates.push(x, y);
    window.setTimeout(clickbuster.pop, 2500);
  };

  this.clickbuster.pop = function() {
    clickbuster.coordinates.splice(0, 2);
  };

  /* If we catch a click event inside the given radius and time threshold then we call
   stopPropagation and preventDefault. Calling preventDefault will stop links
   from being activated. */
  this.clickbuster.onClick = function(event) {
    for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
      var x = clickbuster.coordinates[i];
      var y = clickbuster.coordinates[i + 1];
      if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
        event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
        event.preventDefault ? event.preventDefault() : (event.returnValue=false);
      }
    }
  };

  if (isTouch) {
    // Don't need to use our custom addListener function since we only bust clicks on touch devices
    document.addEventListener('click', clickbuster.onClick, true);
    clickbuster.coordinates = [];
  }
})(this);


// http://stackoverflow.com/questions/2430503/list-of-all-background-images-in-dom
// Get all background images in DOM
function _PAM_getallBgimages(){
 var url, B= [], A= document.getElementsByTagName('*');
 A= B.slice.call(A, 0, A.length);
 while(A.length){
  url= document._PAM_deepCss(A.shift(),'background-image');
  if(url) url=/url\(['"]?([^")]+)/.exec(url) || [];
  url= url[1];
  if(url && B.indexOf(url)== -1) B[B.length]= url;
 }
 return B;
}

document._PAM_deepCss= function(who, css){
 if(!who || !who.style) return '';
 var sty= css.replace(/\-([a-z])/g, function(a, b){
  return b.toUpperCase();
 });
 if(who.currentStyle){
  return who.style[sty] || who.currentStyle[sty] || '';
 }
 var dv= document.defaultView || window;
 return who.style[sty] ||
 dv.getComputedStyle(who,"").getPropertyValue(css) || '';
}

Array.prototype.indexOf= Array.prototype.indexOf ||
 function(what, index){
 index= index || 0;
 var L= this.length;
 while(index< L){
  if(this[index]=== what) return index;
  ++index;
 }
 return -1;
}

// Conveniences
function _PAM_arrayContains(needle, arrhaystack)
{
    return (arrhaystack.indexOf(needle) > -1);
}

function _PAM_hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function _PAM_removeOverlay() {
  document.getElementById("_PAM_overlayDiv").parent.removeChild(getElementById("_PAM_overlayDiv"));
}

function _PAM_checkSelfURL() {
  selfURL = window.location.href;
  if (selfURL.indexOf('.jpg') > -1 || selfURL.indexOf('.jpeg') > -1 || selfURL.indexOf('.png') > -1)
    return selfURL;
  return false;
}

function _PAM_addEventToElement(element) {
  new FastButton(element, function(event){
    _PAM_element = event.target;
    if (_PAM_hasClass(_PAM_element, "selected"))
    {
      _PAM_element.className = "";
      _PAM_element.style.boxShadow = "";
      for (var i=_PAM_imagesToDownload.length-1; i>=0; i--) {
        if (_PAM_imagesToDownload[i] == _PAM_element.src) {
          _PAM_imagesToDownload.splice(i, 1);
        }
      }
    }
    else
    {
      _PAM_element.className = "selected";
    _PAM_imagesToDownload.push(_PAM_element.src);
    _PAM_element.style.boxShadow = "cornflowerblue 0px 0px 18px 12px, cornflowerblue 0px 0px 0px 1px";
    }
  });
}

// Get
var _PAM_elements = [];
var _PAM_imagesToDownload = [];
var _PAM_tags = Array.prototype.slice.call(document.getElementsByTagName('IMG'));
var _PAM_urls = [];
for (i = 0; i < _PAM_tags.length; i++)
{
  var tag = _PAM_tags[i];
  _PAM_urls[i] = tag.src;
}

var _PAM_cssImages = _PAM_getallBgimages();
_PAM_elements = _PAM_urls.concat(_PAM_cssImages);

var _PAM_overlayDiv = document.createElement('div');
_PAM_overlayDiv.style.cssText = 'position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:2147483647;overflow:scroll;background:rgba(0,0,0,0.8);-webkit-overflow-scrolling:touch;-webkit-user-select:none;';
_PAM_overlayDiv.id = "_PAM_overlayDiv";

var _PAM_existingSources = [];

function _PAM_addElementForURL (url) {
  if (_PAM_arrayContains(url, _PAM_existingSources))
    return;

  _PAM_existingSources.push(url);
  var _PAM_imageTag = _PAM_elementForURL(url);
  var _PAM_wrapper = document.createElement('div');
  _PAM_wrapper.style.cssText = "display:inline-block;float:left;width:50%;margin:0;padding:2%;margin-top:2%;margin-bottom:2%;";
  _PAM_wrapper.appendChild(_PAM_imageTag);
  _PAM_wrapper.appendChild(_PAM_SizeBadgeForImage(_PAM_imageTag));
  _PAM_overlayDiv.appendChild(_PAM_wrapper);
}

function _PAM_SizeBadgeForImage (imageTag) {
  var _PAM_sizeIndicator = document.createElement('div');
  _PAM_sizeIndicator.style.cssText = 'text-align:center;position:relative;display:block;margin-left:15px;padding:5px;min-height:16px;line-height:16px;border-radius:5px;margin-top:-41px;width:130px;font-size:16px;color:#fff;font-family: "LatoLatin","Helvetica Neue","Helvetica",Helvetica,Arial,sans-serif;';
  var _PAM_smallestSize = Math.min(_PAM_imageTag.width, _PAM_imageTag.height);
  if (_PAM_smallestSize < 400)
  {
    _PAM_sizeIndicator.innerHTML = "Ukjent ";
    _PAM_sizeIndicator.style.background = "#BDC3C7";
  }
  else if (_PAM_smallestSize < 600)
  {
    _PAM_sizeIndicator.innerHTML = "Lav ";
    _PAM_sizeIndicator.style.background = "#D15419";
  }
  else if (_PAM_smallestSize < 1000)
  {
    _PAM_sizeIndicator.innerHTML = "Middels ";
    _PAM_sizeIndicator.style.background = "#F0C330";
  }
  else
  {
    _PAM_sizeIndicator.innerHTML = "Høy ";
    _PAM_sizeIndicator.style.background = "#48D381";
  }

  _PAM_sizeIndicator.innerHTML += " kvalitet";

  return _PAM_sizeIndicator;
}

function _PAM_elementForURL (url) {
  var _PAM_imageTag = document.createElement('img');
  _PAM_imageTag.src = url;
  _PAM_imageTag.style.cssText = 'width:100%;-webkit-box-sizing: border-box;';
  _PAM_addEventToElement(_PAM_imageTag);
  return _PAM_imageTag;
}

for (i = 0; i < _PAM_elements.length; i++)
{
  if (_PAM_arrayContains(_PAM_elements[i], _PAM_existingSources))
    continue;

  var _PAM_imageTag = _PAM_elementForURL(_PAM_elements[i]);

  if (_PAM_imageTag.width > 400 && _PAM_imageTag.height > 400)
  {
    _PAM_existingSources.push(_PAM_elements[i]);
    var _PAM_wrapper = document.createElement('div');
    _PAM_wrapper.style.cssText = "display:inline-block;box-sizing:border-box;float:left;width:50%;margin:0;padding:2%;margin-top:1%;margin-bottom:1%;";
    _PAM_wrapper.appendChild(_PAM_imageTag);
    _PAM_wrapper.appendChild(_PAM_SizeBadgeForImage(_PAM_imageTag));
    _PAM_overlayDiv.appendChild(_PAM_wrapper);
  }
}

_PAM_selfURL = _PAM_checkSelfURL();

if (_PAM_selfURL)
{
  _PAM_addElementForURL(_PAM_selfURL);
}
else if (!_PAM_selfURL && navigator.userAgent.indexOf("PAM") > -1 && _PAM_overlayDiv.children.length == 0)
{
  window.location.href = 'pam://checkMimeType';
}
else if (_PAM_overlayDiv.children.length == 0)
{
  showNoImageMessage();
}

function mimeTypeIsImage(isImage)
{
  if (isImage)
  {
    _PAM_addElementForURL(window.location.href);
 }
  else
    showNoImageMessage();
}

function showNoImageMessage()
{
  var _PAM_noImagesDiv = document.createElement('div');
  _PAM_noImagesDiv.style.cssText = 'margin:10%;max-width:90%;color:white;font-size:40px;text-align:center;';
  _PAM_noImagesDiv.innerHTML = "Beklager, men vi greide ikke å finne noen bilder som var store nok på denne siden.";
  _PAM_overlayDiv.appendChild(_PAM_noImagesDiv);
}

document.body.appendChild(_PAM_overlayDiv);
