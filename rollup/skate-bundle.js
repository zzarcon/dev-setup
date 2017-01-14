(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process,global){
'use strict';

const { HTMLElement: HTMLElement$1, MutationObserver: MutationObserver$1, navigator: navigator$1 } = window;
const { userAgent } = navigator$1;
const safari = userAgent.indexOf('Safari/60') !== -1;
const safariVersion = safari && userAgent.match(/Version\/([^\s]+)/)[1];
const safariVersions = [0, 1].map(v => `10.0.${v}`).concat(['10.0']);
const patch = safari && safariVersions.indexOf(safariVersion) > -1;

// Workaround for https://bugs.webkit.org/show_bug.cgi?id=160331
function fixSafari () {
  const oldAttachShadow = HTMLElement$1.prototype.attachShadow;

  // We observe a shadow root, but only need to know if the target that was mutated is a <style>
  // element as this is the only scenario where styles aren't recalculated.
  const moOpts = { childList: true, subtree: true };
  const mo = new MutationObserver$1((muts) => {
    muts.forEach((mut) => {
      const { target } = mut;
      if (target.tagName === 'STYLE') {
        const { nextSibling, parentNode } = target;

        // We actually have to remove and subsequently re-insert rather than doing insertBefore()
        // as it seems that doesn't trigger a recalc.
        parentNode.removeChild(target);
        parentNode.insertBefore(target, nextSibling);
      }
    });
  });

  // Our override simply calls the native (or overridden) attachShadow but it ensures that changes
  // to it are observed so that we can take any <style> elements and re-insert them.
  function newAttachShadow (opts) {
    const sr = oldAttachShadow.call(this, opts);
    mo.observe(sr, moOpts);
    return sr;
  }

  // We have to define a property because Safari won't take the override if it is set directly.
  Object.defineProperty(HTMLElement$1.prototype, 'attachShadow', {
    // Ensure polyfills can override it (hoping they call it back).
    configurable: true,
    enumerable: true,
    value: newAttachShadow,
    writable: true
  });
}

// We target a specific version of Safari instead of trying to but detect as it seems to involve
// contriving a breaking case and detecting computed styles. We can remove this code when Safari
// fixes the bug.
if (patch) {
  fixSafari();
}

window.customElements && eval(`/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * This shim allows elements written in, or compiled to, ES5 to work on native
 * implementations of Custom Elements.
 *
 * ES5-style classes don't work with native Custom Elements because the
 * HTMLElement constructor uses the value of \`new.target\` to look up the custom
 * element definition for the currently called constructor. \`new.target\` is only
 * set when \`new\` is called and is only propagated via super() calls. super()
 * is not emulatable in ES5. The pattern of \`SuperClass.call(this)\`\` only works
 * when extending other ES5-style classes, and does not propagate \`new.target\`.
 *
 * This shim allows the native HTMLElement constructor to work by generating and
 * registering a stand-in class instead of the users custom element class. This
 * stand-in class's constructor has an actual call to super().
 * \`customElements.define()\` and \`customElements.get()\` are both overridden to
 * hide this stand-in class from users.
 *
 * In order to create instance of the user-defined class, rather than the stand
 * in, the stand-in's constructor swizzles its instances prototype and invokes
 * the user-defined constructor. When the user-defined constructor is called
 * directly it creates an instance of the stand-in class to get a real extension
 * of HTMLElement and returns that.
 *
 * There are two important constructors: A patched HTMLElement constructor, and
 * the StandInElement constructor. They both will be called to create an element
 * but which is called first depends on whether the browser creates the element
 * or the user-defined constructor is called directly. The variables
 * \`browserConstruction\` and \`userConstruction\` control the flow between the
 * two constructors.
 *
 * This shim should be better than forcing the polyfill because:
 *   1. It's smaller
 *   2. All reaction timings are the same as native (mostly synchronous)
 *   3. All reaction triggering DOM operations are automatically supported
 *
 * There are some restrictions and requirements on ES5 constructors:
 *   1. All constructors in a inheritance hierarchy must be ES5-style, so that
 *      they can be called with Function.call(). This effectively means that the
 *      whole application must be compiled to ES5.
 *   2. Constructors must return the value of the emulated super() call. Like
 *      \`return SuperClass.call(this)\`
 *   3. The \`this\` reference should not be used before the emulated super() call
 *      just like \`this\` is illegal to use before super() in ES6.
 *   4. Constructors should not create other custom elements before the emulated
 *      super() call. This is the same restriction as with native custom
 *      elements.
 *
 *  Compiling valid class-based custom elements to ES5 will satisfy these
 *  requirements with the latest version of popular transpilers.
 */
(() => {
  'use strict';

  const NativeHTMLElement = window.HTMLElement;
  const nativeDefine = window.customElements.define;
  const nativeGet = window.customElements.get;

  /**
   * Map of user-provided constructors to tag names.
   *
   * @type {Map<Function, string>}
   */
  const tagnameByConstructor = new Map();

  /**
   * Map of tag names to user-provided constructors.
   *
   * @type {Map<string, Function>}
   */
  const constructorByTagname = new Map();


  /**
   * Whether the constructors are being called by a browser process, ie parsing
   * or createElement.
   */
  let browserConstruction = false;

  /**
   * Whether the constructors are being called by a user-space process, ie
   * calling an element constructor.
   */
  let userConstruction = false;

  window.HTMLElement = function() {
    if (!browserConstruction) {
      const tagname = tagnameByConstructor.get(this.constructor);
      const fakeClass = nativeGet.call(window.customElements, tagname);

      // Make sure that the fake constructor doesn't call back to this constructor
      userConstruction = true;
      const instance = new (fakeClass)();
      return instance;
    }
    // Else do nothing. This will be reached by ES5-style classes doing
    // HTMLElement.call() during initialization
    browserConstruction = false;
  };

  window.HTMLElement.prototype = Object.create(NativeHTMLElement.prototype);
  window.HTMLElement.prototype.constructor = window.HTMLElement;

  window.customElements.define = (tagname, elementClass) => {
    const elementProto = elementClass.prototype;
    const StandInElement = class extends NativeHTMLElement {
      constructor() {
        // Call the native HTMLElement constructor, this gives us the
        // under-construction instance as \`this\`:
        super();

        // The prototype will be wrong up because the browser used our fake
        // class, so fix it:
        Object.setPrototypeOf(this, elementProto);

        if (!userConstruction) {
          // Make sure that user-defined constructor bottom's out to a do-nothing
          // HTMLElement() call
          browserConstruction = true;
          // Call the user-defined constructor on our instance:
          elementClass.call(this);
        }
        userConstruction = false;
      }
    };
    const standInProto = StandInElement.prototype;
    StandInElement.observedAttributes = elementClass.observedAttributes;
    standInProto.connectedCallback = elementProto.connectedCallback;
    standInProto.disconnectedCallback = elementProto.disconnectedCallback;
    standInProto.attributeChangedCallback = elementProto.attributeChangedCallback;
    standInProto.adoptedCallback = elementProto.adoptedCallback;

    tagnameByConstructor.set(elementClass, tagname);
    constructorByTagname.set(tagname, elementClass);
    nativeDefine.call(window.customElements, tagname, StandInElement);
  };

  window.customElements.get = (tagname) => constructorByTagname.get(tagname);

})();`);

/*

 Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
(function(){function c(){this.a=new Map;this.j=new Map;this.h=new Map;this.o=new Set;this.C=new MutationObserver(this.D.bind(this));this.f=null;this.F=new Set;this.enableFlush=!0;this.s=!1;this.m=null;}function g(){return h.customElements}function k(a){if(!/^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(a)||-1!==r.indexOf(a))return Error("The element name '"+a+"' is not valid.")}function l(a,b,e,d){var c=g();a=e?m.call(a,b,e):m.call(a,b);(b=c.a.get(b.toLowerCase()))&&c.u(a,b,d);c.b(a);return a}
function n(a,b,e,d){b=b.toLowerCase();var c=a.getAttribute(b);d.call(a,b,e);1==a.__$CE_upgraded&&(d=g().a.get(a.localName),e=d.A,(d=d.i)&&0<=e.indexOf(b)&&(e=a.getAttribute(b),e!==c&&d.call(a,b,c,e,null)));}var f=document,h=window;if(g()&&(g().g=function(){},!g().forcePolyfill))return;var r="annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" ");c.prototype.L=function(a,b){function e(a){var b=f[a];if(void 0!==b&&"function"!==typeof b)throw Error(c+
" '"+a+"' is not a Function");return b}if("function"!==typeof b)throw new TypeError("constructor must be a Constructor");var d=k(a);if(d)throw d;if(this.a.has(a))throw Error("An element with name '"+a+"' is already defined");if(this.j.has(b))throw Error("Definition failed for '"+a+"': The constructor is already used.");var c=a,f=b.prototype;if("object"!==typeof f)throw new TypeError("Definition failed for '"+a+"': constructor.prototype must be an object");var d=e("connectedCallback"),g=e("disconnectedCallback"),
h=e("attributeChangedCallback");this.a.set(c,{name:a,localName:c,constructor:b,v:d,w:g,i:h,A:h&&b.observedAttributes||[]});this.j.set(b,c);this.K();if(a=this.h.get(c))a.resolve(void 0),this.h.delete(c);};c.prototype.get=function(a){return(a=this.a.get(a))?a.constructor:void 0};c.prototype.M=function(a){var b=k(a);if(b)return Promise.reject(b);if(this.a.has(a))return Promise.resolve();if(b=this.h.get(a))return b.N;var e,d=new Promise(function(a){e=a;}),b={N:d,resolve:e};this.h.set(a,b);return d};c.prototype.g=
function(){this.enableFlush&&(this.l(this.m.takeRecords()),this.D(this.C.takeRecords()),this.o.forEach(function(a){this.l(a.takeRecords());},this));};c.prototype.K=function(){var a=this;if(!this.s){this.s=!0;var b=function(){a.s=!1;a.m||(a.m=a.b(f));a.c(f.childNodes);};window.HTMLImports?window.HTMLImports.whenReady(b):b();}};c.prototype.I=function(a){this.f=a;};c.prototype.b=function(a){if(null!=a.__$CE_observer)return a.__$CE_observer;a.__$CE_observer=new MutationObserver(this.l.bind(this));a.__$CE_observer.observe(a,
{childList:!0,subtree:!0});this.enableFlush&&this.o.add(a.__$CE_observer);return a.__$CE_observer};c.prototype.J=function(a){null!=a.__$CE_observer&&(a.__$CE_observer.disconnect(),this.enableFlush&&this.o.delete(a.__$CE_observer),a.__$CE_observer=null);};c.prototype.l=function(a){for(var b=0;b<a.length;b++){var e=a[b];if("childList"===e.type){var d=e.removedNodes;this.c(e.addedNodes);this.H(d);}}};c.prototype.c=function(a,b){b=b||new Set;for(var e=0;e<a.length;e++){var d=a[e];if(d.nodeType===Node.ELEMENT_NODE){this.J(d);
d=f.createTreeWalker(d,NodeFilter.SHOW_ELEMENT,null,!1);do this.G(d.currentNode,b);while(d.nextNode())}}};c.prototype.G=function(a,b){if(!b.has(a)){b.add(a);var e=this.a.get(a.localName);if(e){a.__$CE_upgraded||this.u(a,e,!0);var d;if(d=a.__$CE_upgraded&&!a.__$CE_attached)a:{d=a;do{if(d.__$CE_attached||d.nodeType===Node.DOCUMENT_NODE){d=!0;break a}d=d.parentNode||d.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&d.host;}while(d);d=!1;}d&&(a.__$CE_attached=!0,e.v&&e.v.call(a));}a.shadowRoot&&this.c(a.shadowRoot.childNodes,
b);"LINK"===a.tagName&&a.rel&&-1!==a.rel.toLowerCase().split(" ").indexOf("import")&&this.B(a,b);}};c.prototype.B=function(a,b){var e=a.import;if(e)b.has(e)||(b.add(e),e.__$CE_observer||this.b(e),this.c(e.childNodes,b));else if(b=a.href,!this.F.has(b)){this.F.add(b);var d=this,c=function(){a.removeEventListener("load",c);a.import.__$CE_observer||d.b(a.import);d.c(a.import.childNodes);};a.addEventListener("load",c);}};c.prototype.H=function(a){for(var b=0;b<a.length;b++){var e=a[b];if(e.nodeType===Node.ELEMENT_NODE){this.b(e);
e=f.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,null,!1);do{var d=e.currentNode;if(d.__$CE_upgraded&&d.__$CE_attached){d.__$CE_attached=!1;var c=this.a.get(d.localName);c&&c.w&&c.w.call(d);}}while(e.nextNode())}}};c.prototype.u=function(a,b,e){a.__proto__=b.constructor.prototype;e&&(this.I(a),new b.constructor,a.__$CE_upgraded=!0,console.assert(!this.f));e=b.A;if((b=b.i)&&0<e.length){this.C.observe(a,{attributes:!0,attributeOldValue:!0,attributeFilter:e});for(var d=0;d<e.length;d++){var c=e[d];if(a.hasAttribute(c)){var f=
a.getAttribute(c);b.call(a,c,null,f,null);}}}};c.prototype.D=function(a){for(var b=0;b<a.length;b++){var c=a[b];if("attributes"===c.type){var d=c.target,f=this.a.get(d.localName),g=c.attributeName,h=c.oldValue,k=d.getAttribute(g);k!==h&&f.i.call(d,g,h,k,c.attributeNamespace);}}};window.CustomElementRegistry=c;c.prototype.define=c.prototype.L;c.prototype.get=c.prototype.get;c.prototype.whenDefined=c.prototype.M;c.prototype.flush=c.prototype.g;c.prototype.polyfilled=!0;c.prototype._observeRoot=c.prototype.b;
c.prototype._addImport=c.prototype.B;var p=h.HTMLElement;c.prototype.nativeHTMLElement=p;h.HTMLElement=function(){var a=g();if(a.f){var b=a.f;a.f=null;return b}if(this.constructor)return a=a.j.get(this.constructor),l(f,a,void 0,!1);throw Error("Unknown constructor. Did you call customElements.define()?");};h.HTMLElement.prototype=Object.create(p.prototype,{constructor:{value:h.HTMLElement,configurable:!0,writable:!0}});var m=f.createElement;f.createElement=function(a,b){return l(f,a,b,!0)};var t=
f.createElementNS;f.createElementNS=function(a,b){return"http://www.w3.org/1999/xhtml"===a?f.createElement(b):t.call(f,a,b)};var q=Element.prototype.attachShadow;q&&Object.defineProperty(Element.prototype,"attachShadow",{value:function(a){a=q.call(this,a);g().b(a);return a}});var u=f.importNode;f.importNode=function(a,b){a=u.call(f,a,b);g().c(a.nodeType===Node.ELEMENT_NODE?[a]:a.childNodes);return a};var v=Element.prototype.setAttribute;Element.prototype.setAttribute=function(a,b){n(this,a,b,v);};
var w=Element.prototype.removeAttribute;Element.prototype.removeAttribute=function(a){n(this,a,null,w);};Object.defineProperty(window,"customElements",{value:new c,configurable:!0,enumerable:!0});window.CustomElements={takeRecords:function(){g().g&&g().g();}};})();

(function () {
'use strict';

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var settings = window.ShadyDOM || {};

settings.hasNativeShadowDOM = Boolean(Element.prototype.attachShadow && Node.prototype.getRootNode);

settings.inUse = settings.force || !settings.hasNativeShadowDOM;

function isShadyRoot(obj) {
  return Boolean(obj.__localName === 'ShadyRoot');
}

var p = Element.prototype;
var matches = p.matches || p.matchesSelector ||
  p.mozMatchesSelector || p.msMatchesSelector ||
  p.oMatchesSelector || p.webkitMatchesSelector;

function matchesSelector(element, selector) {
  return matches.call(element, selector);
}

function copyOwnProperty(name, source, target) {
  var pd = Object.getOwnPropertyDescriptor(source, name);
  if (pd) {
    Object.defineProperty(target, name, pd);
  }
}

function extend(target, source) {
  if (target && source) {
    var n$ = Object.getOwnPropertyNames(source);
    for (var i=0, n; (i<n$.length) && (n=n$[i]); i++) {
      copyOwnProperty(n, source, target);
    }
  }
  return target || source;
}

function extendAll(target) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  for (var i=0; i < sources.length; i++) {
    extend(target, sources[i]);
  }
  return target;
}

function mixin(target, source) {
  for (var i in source) {
    target[i] = source[i];
  }
  return target;
}

var setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
  obj.__proto__ = proto;
  return obj;
};

function patchPrototype(obj, mixin) {
  var proto = Object.getPrototypeOf(obj);
  if (!proto.hasOwnProperty('__patchProto')) {
    var patchProto = Object.create(proto);
    patchProto.__sourceProto = proto;
    extend(patchProto, mixin);
    proto.__patchProto = patchProto;
  }
  setPrototypeOf(obj, proto.__patchProto);
}



var common = {};

// TODO(sorvell): actually rely on a real Promise polyfill...
var promish;
if (window.Promise) {
  promish = Promise.resolve();
} else {
  promish = {
    then: function(cb) {
      var twiddle = document.createTextNode('');
      var observer = new MutationObserver(function() {
        observer.disconnect();
        cb();
      });
      observer.observe(twiddle, {characterData: true});
    }
  };
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

function newSplice(index, removed, addedCount) {
  return {
    index: index,
    removed: removed,
    addedCount: addedCount
  };
}

var EDIT_LEAVE = 0;
var EDIT_UPDATE = 1;
var EDIT_ADD = 2;
var EDIT_DELETE = 3;

var ArraySplice = {

  // Note: This function is *based* on the computation of the Levenshtein
  // "edit" distance. The one change is that "updates" are treated as two
  // edits - not one. With Array splices, an update is really a delete
  // followed by an add. By retaining this, we optimize for "keeping" the
  // maximum array items in the original array. For example:
  //
  //   'xxxx123' -> '123yyyy'
  //
  // With 1-edit updates, the shortest path would be just to update all seven
  // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
  // leaves the substring '123' intact.
  calcEditDistances: function calcEditDistances(current, currentStart, currentEnd,
                              old, oldStart, oldEnd) {
    var this$1 = this;

    // "Deletion" columns
    var rowCount = oldEnd - oldStart + 1;
    var columnCount = currentEnd - currentStart + 1;
    var distances = new Array(rowCount);

    // "Addition" rows. Initialize null column.
    for (var i = 0; i < rowCount; i++) {
      distances[i] = new Array(columnCount);
      distances[i][0] = i;
    }

    // Initialize null row
    for (var j = 0; j < columnCount; j++)
      distances[0][j] = j;

    for (var i$1 = 1; i$1 < rowCount; i$1++) {
      for (var j$1 = 1; j$1 < columnCount; j$1++) {
        if (this$1.equals(current[currentStart + j$1 - 1], old[oldStart + i$1 - 1]))
          distances[i$1][j$1] = distances[i$1 - 1][j$1 - 1];
        else {
          var north = distances[i$1 - 1][j$1] + 1;
          var west = distances[i$1][j$1 - 1] + 1;
          distances[i$1][j$1] = north < west ? north : west;
        }
      }
    }

    return distances;
  },

  // This starts at the final weight, and walks "backward" by finding
  // the minimum previous weight recursively until the origin of the weight
  // matrix.
  spliceOperationsFromEditDistances: function spliceOperationsFromEditDistances(distances) {
    var i = distances.length - 1;
    var j = distances[0].length - 1;
    var current = distances[i][j];
    var edits = [];
    while (i > 0 || j > 0) {
      if (i == 0) {
        edits.push(EDIT_ADD);
        j--;
        continue;
      }
      if (j == 0) {
        edits.push(EDIT_DELETE);
        i--;
        continue;
      }
      var northWest = distances[i - 1][j - 1];
      var west = distances[i - 1][j];
      var north = distances[i][j - 1];

      var min;
      if (west < north)
        min = west < northWest ? west : northWest;
      else
        min = north < northWest ? north : northWest;

      if (min == northWest) {
        if (northWest == current) {
          edits.push(EDIT_LEAVE);
        } else {
          edits.push(EDIT_UPDATE);
          current = northWest;
        }
        i--;
        j--;
      } else if (min == west) {
        edits.push(EDIT_DELETE);
        i--;
        current = west;
      } else {
        edits.push(EDIT_ADD);
        j--;
        current = north;
      }
    }

    edits.reverse();
    return edits;
  },

  /**
   * Splice Projection functions:
   *
   * A splice map is a representation of how a previous array of items
   * was transformed into a new array of items. Conceptually it is a list of
   * tuples of
   *
   *   <index, removed, addedCount>
   *
   * which are kept in ascending index order of. The tuple represents that at
   * the |index|, |removed| sequence of items were removed, and counting forward
   * from |index|, |addedCount| items were added.
   */

  /**
   * Lacking individual splice mutation information, the minimal set of
   * splices can be synthesized given the previous state and final state of an
   * array. The basic approach is to calculate the edit distance matrix and
   * choose the shortest path through it.
   *
   * Complexity: O(l * p)
   *   l: The length of the current array
   *   p: The length of the old array
   */
  calcSplices: function calcSplices(current, currentStart, currentEnd,
                        old, oldStart, oldEnd) {
    var prefixCount = 0;
    var suffixCount = 0;
    var splice;

    var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
    if (currentStart == 0 && oldStart == 0)
      prefixCount = this.sharedPrefix(current, old, minLength);

    if (currentEnd == current.length && oldEnd == old.length)
      suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

    currentStart += prefixCount;
    oldStart += prefixCount;
    currentEnd -= suffixCount;
    oldEnd -= suffixCount;

    if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
      return [];

    if (currentStart == currentEnd) {
      splice = newSplice(currentStart, [], 0);
      while (oldStart < oldEnd)
        splice.removed.push(old[oldStart++]);

      return [ splice ];
    } else if (oldStart == oldEnd)
      return [ newSplice(currentStart, [], currentEnd - currentStart) ];

    var ops = this.spliceOperationsFromEditDistances(
        this.calcEditDistances(current, currentStart, currentEnd,
                               old, oldStart, oldEnd));

    splice = undefined;
    var splices = [];
    var index = currentStart;
    var oldIndex = oldStart;
    for (var i = 0; i < ops.length; i++) {
      switch(ops[i]) {
        case EDIT_LEAVE:
          if (splice) {
            splices.push(splice);
            splice = undefined;
          }

          index++;
          oldIndex++;
          break;
        case EDIT_UPDATE:
          if (!splice)
            splice = newSplice(index, [], 0);

          splice.addedCount++;
          index++;

          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
        case EDIT_ADD:
          if (!splice)
            splice = newSplice(index, [], 0);

          splice.addedCount++;
          index++;
          break;
        case EDIT_DELETE:
          if (!splice)
            splice = newSplice(index, [], 0);

          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
      }
    }

    if (splice) {
      splices.push(splice);
    }
    return splices;
  },

  sharedPrefix: function sharedPrefix(current, old, searchLength) {
    var this$1 = this;

    for (var i = 0; i < searchLength; i++)
      if (!this$1.equals(current[i], old[i]))
        return i;
    return searchLength;
  },

  sharedSuffix: function sharedSuffix(current, old, searchLength) {
    var index1 = current.length;
    var index2 = old.length;
    var count = 0;
    while (count < searchLength && this.equals(current[--index1], old[--index2]))
      count++;

    return count;
  },

  calculateSplices: function calculateSplices$1(current, previous) {
    return this.calcSplices(current, 0, current.length, previous, 0,
                            previous.length);
  },

  equals: function equals(currentValue, previousValue) {
    return currentValue === previousValue;
  }

};

var calculateSplices = function (current, previous) { return ArraySplice.calculateSplices(current, previous); };

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// TODO(sorvell): circular (patch loads tree and tree loads patch)
// for now this is stuck on `utils`
//import {patchNode} from './patch'
// native add/remove
var nativeInsertBefore = Element.prototype.insertBefore;
var nativeAppendChild = Element.prototype.appendChild;
var nativeRemoveChild = Element.prototype.removeChild;

/**
 * `tree` is a dom manipulation library used by ShadyDom to
 * manipulate composed and logical trees.
 */
var tree = {

  // sad but faster than slice...
  arrayCopyChildNodes: function arrayCopyChildNodes(parent) {
    var copy=[], i=0;
    for (var n=parent.firstChild; n; n=n.nextSibling) {
      copy[i++] = n;
    }
    return copy;
  },

  arrayCopyChildren: function arrayCopyChildren(parent) {
    var copy=[], i=0;
    for (var n=parent.firstElementChild; n; n=n.nextElementSibling) {
      copy[i++] = n;
    }
    return copy;
  },

  arrayCopy: function arrayCopy(a$) {
    var l = a$.length;
    var copy = new Array(l);
    for (var i=0; i < l; i++) {
      copy[i] = a$[i];
    }
    return copy;
  },

  saveChildNodes: function saveChildNodes(node) {
    tree.Logical.saveChildNodes(node);
    if (!tree.Composed.hasParentNode(node)) {
      tree.Composed.saveComposedData(node);
      //tree.Composed.saveParentNode(node);
    }
    tree.Composed.saveChildNodes(node);
  }

};

tree.Logical = {

  hasParentNode: function hasParentNode(node) {
    return Boolean(node.__dom && node.__dom.parentNode);
  },

  hasChildNodes: function hasChildNodes(node) {
    return Boolean(node.__dom && node.__dom.childNodes !== undefined);
  },

  getChildNodes: function getChildNodes(node) {
    // note: we're distinguishing here between undefined and false-y:
    // hasChildNodes uses undefined check to see if this element has logical
    // children; the false-y check indicates whether or not we should rebuild
    // the cached childNodes array.
    return this.hasChildNodes(node) ? this._getChildNodes(node) :
      tree.Composed.getChildNodes(node);
  },

  _getChildNodes: function _getChildNodes(node) {
    if (!node.__dom.childNodes) {
      node.__dom.childNodes = [];
      for (var n=this.getFirstChild(node); n; n=this.getNextSibling(n)) {
        node.__dom.childNodes.push(n);
      }
    }
    return node.__dom.childNodes;
  },

  // NOTE: __dom can be created under 2 conditions: (1) an element has a
  // logical tree, or (2) an element is in a logical tree. In case (1), the
  // element will store firstChild/lastChild, and in case (2), the element
  // will store parentNode, nextSibling, previousSibling. This means that
  // the mere existence of __dom is not enough to know if the requested
  // logical data is available and instead we do an explicit undefined check.
  getParentNode: function getParentNode(node) {
    return node.__dom && node.__dom.parentNode !== undefined ?
      node.__dom.parentNode : tree.Composed.getParentNode(node);
  },

  getFirstChild: function getFirstChild(node) {
    return node.__dom && node.__dom.firstChild !== undefined ?
      node.__dom.firstChild : tree.Composed.getFirstChild(node);
  },

  getLastChild: function getLastChild(node) {
    return node.__dom && node.__dom.lastChild  !== undefined ?
      node.__dom.lastChild : tree.Composed.getLastChild(node);
  },

  getNextSibling: function getNextSibling(node) {
    return node.__dom && node.__dom.nextSibling  !== undefined ?
      node.__dom.nextSibling : tree.Composed.getNextSibling(node);
  },

  getPreviousSibling: function getPreviousSibling(node) {
    return node.__dom && node.__dom.previousSibling  !== undefined ?
      node.__dom.previousSibling : tree.Composed.getPreviousSibling(node);
  },

  getFirstElementChild: function getFirstElementChild(node) {
    return node.__dom && node.__dom.firstChild !== undefined ?
      this._getFirstElementChild(node) :
      tree.Composed.getFirstElementChild(node);
  },

  _getFirstElementChild: function _getFirstElementChild(node) {
    var n = node.__dom.firstChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.nextSibling;
    }
    return n;
  },

  getLastElementChild: function getLastElementChild(node) {
    return node.__dom && node.__dom.lastChild !== undefined ?
      this._getLastElementChild(node) :
      tree.Composed.getLastElementChild(node);
  },

  _getLastElementChild: function _getLastElementChild(node) {
    var n = node.__dom.lastChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.previousSibling;
    }
    return n;
  },

  getNextElementSibling: function getNextElementSibling(node) {
    return node.__dom && node.__dom.nextSibling !== undefined ?
      this._getNextElementSibling(node) :
      tree.Composed.getNextElementSibling(node);
  },

  _getNextElementSibling: function _getNextElementSibling(node) {
    var this$1 = this;

    var n = node.__dom.nextSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this$1.getNextSibling(n);
    }
    return n;
  },

  getPreviousElementSibling: function getPreviousElementSibling(node) {
    return node.__dom && node.__dom.previousSibling !== undefined ?
      this._getPreviousElementSibling(node) :
      tree.Composed.getPreviousElementSibling(node);
  },

  _getPreviousElementSibling: function _getPreviousElementSibling(node) {
    var this$1 = this;

    var n = node.__dom.previousSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this$1.getPreviousSibling(n);
    }
    return n;
  },

  // Capture the list of light children. It's important to do this before we
  // start transforming the DOM into "rendered" state.
  // Children may be added to this list dynamically. It will be treated as the
  // source of truth for the light children of the element. This element's
  // actual children will be treated as the rendered state once this function
  // has been called.
  saveChildNodes: function saveChildNodes$1(node) {
    if (!this.hasChildNodes(node)) {
      node.__dom = node.__dom || {};
      node.__dom.firstChild = node.firstChild;
      node.__dom.lastChild = node.lastChild;
      var c$ = node.__dom.childNodes = tree.arrayCopyChildNodes(node);
      for (var i=0, n; (i<c$.length) && (n=c$[i]); i++) {
        n.__dom = n.__dom || {};
        n.__dom.parentNode = node;
        n.__dom.nextSibling = c$[i+1] || null;
        n.__dom.previousSibling = c$[i-1] || null;
        common.patchNode(n);
      }
    }
  },

  // TODO(sorvell): may need to patch saveChildNodes iff the tree has
  // already been distributed.
  // NOTE: ensure `node` is patched...
  recordInsertBefore: function recordInsertBefore(node, container, ref_node) {
    var this$1 = this;

    container.__dom.childNodes = null;
    // handle document fragments
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      var c$ = tree.arrayCopyChildNodes(node);
      for (var i=0; i < c$.length; i++) {
        this$1._linkNode(c$[i], container, ref_node);
      }
      // cleanup logical dom in doc fragment.
      node.__dom = node.__dom || {};
      node.__dom.firstChild = node.__dom.lastChild = null;
      node.__dom.childNodes = null;
    } else {
      this._linkNode(node, container, ref_node);
    }
  },

  _linkNode: function _linkNode(node, container, ref_node) {
    common.patchNode(node);
    ref_node = ref_node || null;
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (ref_node) {
      ref_node.__dom = ref_node.__dom || {};
    }
    // update ref_node.previousSibling <-> node
    node.__dom.previousSibling = ref_node ? ref_node.__dom.previousSibling :
      container.__dom.lastChild;
    if (node.__dom.previousSibling) {
      node.__dom.previousSibling.__dom.nextSibling = node;
    }
    // update node <-> ref_node
    node.__dom.nextSibling = ref_node;
    if (node.__dom.nextSibling) {
      node.__dom.nextSibling.__dom.previousSibling = node;
    }
    // update node <-> container
    node.__dom.parentNode = container;
    if (ref_node) {
      if (ref_node === container.__dom.firstChild) {
        container.__dom.firstChild = node;
      }
    } else {
      container.__dom.lastChild = node;
      if (!container.__dom.firstChild) {
        container.__dom.firstChild = node;
      }
    }
    // remove caching of childNodes
    container.__dom.childNodes = null;
  },

  recordRemoveChild: function recordRemoveChild(node, container) {
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (node === container.__dom.firstChild) {
      container.__dom.firstChild = node.__dom.nextSibling;
    }
    if (node === container.__dom.lastChild) {
      container.__dom.lastChild = node.__dom.previousSibling;
    }
    var p = node.__dom.previousSibling;
    var n = node.__dom.nextSibling;
    if (p) {
      p.__dom = p.__dom || {};
      p.__dom.nextSibling = n;
    }
    if (n) {
      n.__dom = n.__dom || {};
      n.__dom.previousSibling = p;
    }
    // When an element is removed, logical data is no longer tracked.
    // Explicitly set `undefined` here to indicate this. This is disginguished
    // from `null` which is set if info is null.
    node.__dom.parentNode = node.__dom.previousSibling =
      node.__dom.nextSibling = null;
    // remove caching of childNodes
    container.__dom.childNodes = null;
  }

};


// TODO(sorvell): composed tree manipulation is made available
// (1) to maninpulate the composed tree, and (2) to track changes
// to the tree for optional patching pluggability.
tree.Composed = {

  hasParentNode: function hasParentNode$1(node) {
    return Boolean(node.__dom && node.__dom.$parentNode !== undefined);
  },

  hasChildNodes: function hasChildNodes$1(node) {
    return Boolean(node.__dom && node.__dom.$childNodes !== undefined);
  },

  getChildNodes: function getChildNodes$1(node) {
    return this.hasChildNodes(node) ? this._getChildNodes(node) :
      (!node.__patched && tree.arrayCopy(node.childNodes));
  },

  _getChildNodes: function _getChildNodes$1(node) {
    if (!node.__dom.$childNodes) {
      node.__dom.$childNodes = [];
      for (var n=node.__dom.$firstChild; n; n=n.__dom.$nextSibling) {
        node.__dom.$childNodes.push(n);
      }
    }
    return node.__dom.$childNodes;
  },

  getComposedChildNodes: function getComposedChildNodes(node) {
    return node.__dom.$childNodes;
  },

  getParentNode: function getParentNode$1(node) {
    return this.hasParentNode(node) ? node.__dom.$parentNode :
      (!node.__patched && node.parentNode);
  },

  getFirstChild: function getFirstChild$1(node) {
    return node.__patched ? node.__dom.$firstChild : node.firstChild;
  },

  getLastChild: function getLastChild$1(node) {
    return node.__patched ? node.__dom.$lastChild : node.lastChild;
  },

  getNextSibling: function getNextSibling$1(node) {
    return node.__patched ? node.__dom.$nextSibling : node.nextSibling;
  },

  getPreviousSibling: function getPreviousSibling$1(node) {
    return node.__patched ? node.__dom.$previousSibling : node.previousSibling;
  },

  getFirstElementChild: function getFirstElementChild$1(node) {
    return node.__patched ? this._getFirstElementChild(node) :
      node.firstElementChild;
  },

  _getFirstElementChild: function _getFirstElementChild$1(node) {
    var n = node.__dom.$firstChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.$nextSibling;
    }
    return n;
  },

  getLastElementChild: function getLastElementChild$1(node) {
    return node.__patched ? this._getLastElementChild(node) :
      node.lastElementChild;
  },

  _getLastElementChild: function _getLastElementChild$1(node) {
    var n = node.__dom.$lastChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.$previousSibling;
    }
    return n;
  },

  getNextElementSibling: function getNextElementSibling$1(node) {
    return node.__patched ? this._getNextElementSibling(node) :
      node.nextElementSibling;
  },

  _getNextElementSibling: function _getNextElementSibling$1(node) {
    var this$1 = this;

    var n = node.__dom.$nextSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this$1.getNextSibling(n);
    }
    return n;
  },

  getPreviousElementSibling: function getPreviousElementSibling$1(node) {
    return node.__patched ? this._getPreviousElementSibling(node) :
      node.previousElementSibling;
  },

  _getPreviousElementSibling: function _getPreviousElementSibling$1(node) {
    var this$1 = this;

    var n = node.__dom.$previousSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this$1.getPreviousSibling(n);
    }
    return n;
  },

  saveChildNodes: function saveChildNodes$2(node) {
    var this$1 = this;

    if (!this.hasChildNodes(node)) {
      node.__dom = node.__dom || {};
      node.__dom.$firstChild = node.firstChild;
      node.__dom.$lastChild = node.lastChild;
      var c$ = node.__dom.$childNodes = tree.arrayCopyChildNodes(node);
      for (var i=0, n; (i<c$.length) && (n=c$[i]); i++) {
        this$1.saveComposedData(n);
      }
    }
  },

  saveComposedData: function saveComposedData(node) {
    node.__dom = node.__dom || {};
    if (node.__dom.$parentNode === undefined) {
      node.__dom.$parentNode = node.parentNode;
    }
    if (node.__dom.$nextSibling === undefined) {
      node.__dom.$nextSibling = node.nextSibling;
    }
    if (node.__dom.$previousSibling === undefined) {
      node.__dom.$previousSibling = node.previousSibling;
    }
  },

  recordInsertBefore: function recordInsertBefore$1(node, container, ref_node) {
    var this$1 = this;

    container.__dom.$childNodes = null;
    // handle document fragments
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // TODO(sorvell): remember this for patching:
      // the act of setting this info can affect patched nodes
      // getters; therefore capture childNodes before patching.
      for (var n=this.getFirstChild(node); n; n=this.getNextSibling(n)) {
        this$1._linkNode(n, container, ref_node);
      }
    } else {
      this._linkNode(node, container, ref_node);
    }
  },

  _linkNode: function _linkNode$1(node, container, ref_node) {
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (ref_node) {
      ref_node.__dom = ref_node.__dom || {};
    }
    // update ref_node.previousSibling <-> node
    node.__dom.$previousSibling = ref_node ? ref_node.__dom.$previousSibling :
      container.__dom.$lastChild;
    if (node.__dom.$previousSibling) {
      node.__dom.$previousSibling.__dom.$nextSibling = node;
    }
    // update node <-> ref_node
    node.__dom.$nextSibling = ref_node;
    if (node.__dom.$nextSibling) {
      node.__dom.$nextSibling.__dom.$previousSibling = node;
    }
    // update node <-> container
    node.__dom.$parentNode = container;
    if (ref_node) {
      if (ref_node === container.__dom.$firstChild) {
        container.__dom.$firstChild = node;
      }
    } else {
      container.__dom.$lastChild = node;
      if (!container.__dom.$firstChild) {
        container.__dom.$firstChild = node;
      }
    }
    // remove caching of childNodes
    container.__dom.$childNodes = null;
  },

  recordRemoveChild: function recordRemoveChild$1(node, container) {
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (node === container.__dom.$firstChild) {
      container.__dom.$firstChild = node.__dom.$nextSibling;
    }
    if (node === container.__dom.$lastChild) {
      container.__dom.$lastChild = node.__dom.$previousSibling;
    }
    var p = node.__dom.$previousSibling;
    var n = node.__dom.$nextSibling;
    if (p) {
      p.__dom = p.__dom || {};
      p.__dom.$nextSibling = n;
    }
    if (n) {
      n.__dom = n.__dom || {};
      n.__dom.$previousSibling = p;
    }
    node.__dom.$parentNode = node.__dom.$previousSibling =
      node.__dom.$nextSibling = null;
    // remove caching of childNodes
    container.__dom.$childNodes = null;
  },

  clearChildNodes: function clearChildNodes(node) {
    var this$1 = this;

    var c$ = this.getChildNodes(node);
    for (var i=0, c; i < c$.length; i++) {
      c = c$[i];
      this$1.recordRemoveChild(c, node);
      nativeRemoveChild.call(node, c);
    }
  },

  saveParentNode: function saveParentNode(node) {
    node.__dom = node.__dom || {};
    node.__dom.$parentNode = node.parentNode;
  },

  insertBefore: function insertBefore(parentNode, newChild, refChild) {
    this.saveChildNodes(parentNode);
    // remove from current location.
    this._addChild(parentNode, newChild, refChild);
    return nativeInsertBefore.call(parentNode, newChild, refChild || null);
  },

  appendChild: function appendChild(parentNode, newChild) {
    this.saveChildNodes(parentNode);
    this._addChild(parentNode, newChild);
    return nativeAppendChild.call(parentNode, newChild);
  },

  removeChild: function removeChild(parentNode, node) {
    var currentParent = this.getParentNode(node);
    this.saveChildNodes(parentNode);
    this._removeChild(parentNode, node);
    if (currentParent === parentNode) {
      return nativeRemoveChild.call(parentNode, node);
    }
  },

  _addChild: function _addChild(parentNode, newChild, refChild) {
    var this$1 = this;

    var isFrag = (newChild.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
    var oldParent = this.getParentNode(newChild);
    if (oldParent) {
      this._removeChild(oldParent, newChild);
    }
    if (isFrag) {
      var c$ = this.getChildNodes(newChild);
      for (var i=0; i < c$.length; i++) {
        var c = c$[i];
        // unlink document fragment children
        this$1._removeChild(newChild, c);
        this$1.recordInsertBefore(c, parentNode, refChild);
      }
    } else {
      this.recordInsertBefore(newChild, parentNode, refChild);
    }
  },

  _removeChild: function _removeChild(parentNode, node) {
    this.recordRemoveChild(node, parentNode);
  }

};

// for testing...
var descriptors = {};
function getNativeProperty(element, property) {
  if (!descriptors[property]) {
    descriptors[property] = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype, property) ||
    Object.getOwnPropertyDescriptor(
      Element.prototype, property) ||
    Object.getOwnPropertyDescriptor(
      Node.prototype, property);
  }
  return descriptors[property].get.call(element);
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// NOTE: normalize event contruction where necessary (IE11)
var NormalizedEvent = typeof Event === 'function' ? Event :
  function(inType, params) {
    params = params || {};
    var e = document.createEvent('Event');
    e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
    return e;
  };

var Distributor = (function () {
  function anonymous(root) {
    this.root = root;
    this.insertionPointTag = 'slot';
  }

  anonymous.prototype.getInsertionPoints = function getInsertionPoints () {
    return this.root.querySelectorAll(this.insertionPointTag);
  };

  anonymous.prototype.hasInsertionPoint = function hasInsertionPoint () {
    return Boolean(this.root._insertionPoints &&
      this.root._insertionPoints.length);
  };

  anonymous.prototype.isInsertionPoint = function isInsertionPoint (node) {
    return node.localName && node.localName == this.insertionPointTag;
  };

  anonymous.prototype.distribute = function distribute () {
    if (this.hasInsertionPoint()) {
      return this.distributePool(this.root, this.collectPool());
    }
    return [];
  };

  // Gather the pool of nodes that should be distributed. We will combine
  // these with the "content root" to arrive at the composed tree.
  anonymous.prototype.collectPool = function collectPool () {
    return tree.arrayCopy(
      tree.Logical.getChildNodes(this.root.host));
  };

  // perform "logical" distribution; note, no actual dom is moved here,
  // instead elements are distributed into storage
  // array where applicable.
  anonymous.prototype.distributePool = function distributePool (node, pool) {
    var this$1 = this;

    var dirtyRoots = [];
    var p$ = this.root._insertionPoints;
    for (var i=0, l=p$.length, p; (i<l) && (p=p$[i]); i++) {
      this$1.distributeInsertionPoint(p, pool);
      // provoke redistribution on insertion point parents
      // must do this on all candidate hosts since distribution in this
      // scope invalidates their distribution.
      // only get logical parent.
      var parent = tree.Logical.getParentNode(p);
      if (parent && parent.shadyRoot &&
          this$1.hasInsertionPoint(parent.shadyRoot)) {
        dirtyRoots.push(parent.shadyRoot);
      }
    }
    for (var i$1=0; i$1 < pool.length; i$1++) {
      var p$1 = pool[i$1];
      if (p$1) {
        p$1._assignedSlot = undefined;
        // remove undistributed elements from physical dom.
        var parent$1 = tree.Composed.getParentNode(p$1);
        if (parent$1) {
          tree.Composed.removeChild(parent$1, p$1);
        }
      }
    }
    return dirtyRoots;
  };

  anonymous.prototype.distributeInsertionPoint = function distributeInsertionPoint (insertionPoint, pool) {
    var this$1 = this;

    var prevAssignedNodes = insertionPoint._assignedNodes;
    if (prevAssignedNodes) {
      this.clearAssignedSlots(insertionPoint, true);
    }
    insertionPoint._assignedNodes = [];
    var needsSlotChange = false;
    // distribute nodes from the pool that this selector matches
    var anyDistributed = false;
    for (var i=0, l=pool.length, node; i < l; i++) {
      node=pool[i];
      // skip nodes that were already used
      if (!node) {
        continue;
      }
      // distribute this node if it matches
      if (this$1.matchesInsertionPoint(node, insertionPoint)) {
        if (node.__prevAssignedSlot != insertionPoint) {
          needsSlotChange = true;
        }
        this$1.distributeNodeInto(node, insertionPoint);
        // remove this node from the pool
        pool[i] = undefined;
        // since at least one node matched, we won't need fallback content
        anyDistributed = true;
      }
    }
    // Fallback content if nothing was distributed here
    if (!anyDistributed) {
      var children = tree.Logical.getChildNodes(insertionPoint);
      for (var j = 0, node$1; j < children.length; j++) {
        node$1 = children[j];
        if (node$1.__prevAssignedSlot != insertionPoint) {
          needsSlotChange = true;
        }
        this$1.distributeNodeInto(node$1, insertionPoint);
      }
    }
    // we're already dirty if a node was newly added to the slot
    // and we're also dirty if the assigned count decreased.
    if (prevAssignedNodes) {
      // TODO(sorvell): the tracking of previously assigned slots
      // could instead by done with a Set and then we could
      // avoid needing to iterate here to clear the info.
      for (var i$1=0; i$1 < prevAssignedNodes.length; i$1++) {
        prevAssignedNodes[i$1].__prevAssignedSlot = null;
      }
      if (insertionPoint._assignedNodes.length < prevAssignedNodes.length) {
        needsSlotChange = true;
      }
    }
    this.setDistributedNodesOnInsertionPoint(insertionPoint);
    if (needsSlotChange) {
      this._fireSlotChange(insertionPoint);
    }
  };

  anonymous.prototype.clearAssignedSlots = function clearAssignedSlots (slot, savePrevious) {
    var n$ = slot._assignedNodes;
    if (n$) {
      for (var i=0; i < n$.length; i++) {
        var n = n$[i];
        if (savePrevious) {
          n.__prevAssignedSlot = n._assignedSlot;
        }
        // only clear if it was previously set to this slot;
        // this helps ensure that if the node has otherwise been distributed
        // ignore it.
        if (n._assignedSlot === slot) {
          n._assignedSlot = null;
        }
      }
    }
  };

  anonymous.prototype.matchesInsertionPoint = function matchesInsertionPoint (node, insertionPoint) {
    var slotName = insertionPoint.getAttribute('name');
    slotName = slotName ? slotName.trim() : '';
    var slot = node.getAttribute && node.getAttribute('slot');
    slot = slot ? slot.trim() : '';
    return (slot == slotName);
  };

  anonymous.prototype.distributeNodeInto = function distributeNodeInto (child, insertionPoint) {
    insertionPoint._assignedNodes.push(child);
    child._assignedSlot = insertionPoint;
  };

  anonymous.prototype.setDistributedNodesOnInsertionPoint = function setDistributedNodesOnInsertionPoint (insertionPoint) {
    var this$1 = this;

    var n$ = insertionPoint._assignedNodes;
    insertionPoint._distributedNodes = [];
    for (var i=0, n; (i<n$.length) && (n=n$[i]) ; i++) {
      if (this$1.isInsertionPoint(n)) {
        var d$ = n._distributedNodes;
        if (d$) {
          for (var j=0; j < d$.length; j++) {
            insertionPoint._distributedNodes.push(d$[j]);
          }
        }
      } else {
        insertionPoint._distributedNodes.push(n$[i]);
      }
    }
  };

  anonymous.prototype._fireSlotChange = function _fireSlotChange (insertionPoint) {
    // NOTE: cannot bubble correctly here so not setting bubbles: true
    // Safari tech preview does not bubble but chrome does
    // Spec says it bubbles (https://dom.spec.whatwg.org/#mutation-observers)
    insertionPoint.dispatchEvent(new NormalizedEvent('slotchange'));
    if (insertionPoint._assignedSlot) {
      this._fireSlotChange(insertionPoint._assignedSlot);
    }
  };

  anonymous.prototype.isFinalDestination = function isFinalDestination (insertionPoint) {
    return !(insertionPoint._assignedSlot);
  };

  return anonymous;
}());

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
  Implements a pared down version of ShadowDOM's scoping, which is easy to
  polyfill across browsers.
*/
var ShadyRoot = function ShadyRoot(host) {
  if (!host) {
    throw 'Must provide a host';
  }
  // NOTE: this strange construction is necessary because
  // DocumentFragment cannot be subclassed on older browsers.
  var frag = document.createDocumentFragment();
  frag.__proto__ = ShadyFragmentMixin;
  frag._init(host);
  return frag;
};

var ShadyMixin = {

  _init: function _init(host) {
    // NOTE: set a fake local name so this element can be
    // distinguished from a DocumentFragment when patching.
    // FF doesn't allow this to be `localName`
    this.__localName = 'ShadyRoot';
    // root <=> host
    host.shadyRoot = this;
    this.host = host;
    // logical dom setup
    tree.Logical.saveChildNodes(host);
    tree.Logical.saveChildNodes(this);
    // state flags
    this._clean = true;
    this._hasRendered = false;
    this._distributor = new Distributor(this);
    this.update();
  },

  // async render the "top" distributor (this is all that is needed to
  // distribute this host).
  update: function update() {
    // TODO(sorvell): instead the root should always be enqueued to helps record that it is dirty.
    // Then, in `render`, the top most (in the distribution tree) "dirty" root should be rendered.
    var distributionRoot = this._findDistributionRoot(this.host);
    //console.log('update from', this.host, 'root', distributionRoot.host, distributionRoot._clean);
    if (distributionRoot._clean) {
      distributionRoot._clean = false;
      enqueue(function() {
        distributionRoot.render();
      });
    }
  },

  // TODO(sorvell): this may not return a shadowRoot (for example if the element is in a docFragment)
  // this should only return a shadowRoot.
  // returns the host that's the top of this host's distribution tree
  _findDistributionRoot: function _findDistributionRoot(element) {
    var root = element.shadyRoot;
    while (element && this._elementNeedsDistribution(element)) {
      root = element.getRootNode();
      element = root && root.host;
    }
    return root;
  },

  // Return true if a host's children includes
  // an insertion point that selects selectively
  _elementNeedsDistribution: function _elementNeedsDistribution(element) {
    var this$1 = this;

    var c$ = tree.Logical.getChildNodes(element);
    for (var i=0, c; i < c$.length; i++) {
      c = c$[i];
      if (this$1._distributor.isInsertionPoint(c)) {
        return element.getRootNode();
      }
    }
  },

  render: function render() {
    if (!this._clean) {
      this._clean = true;
      if (!this._skipUpdateInsertionPoints) {
        this.updateInsertionPoints();
      } else if (!this._hasRendered) {
        this._insertionPoints = [];
      }
      this._skipUpdateInsertionPoints = false;
      // TODO(sorvell): previous ShadyDom had a fast path here
      // that would avoid distribution for initial render if
      // no insertion points exist. We cannot currently do this because
      // it relies on elements being in the physical shadowRoot element
      // so that native methods will be used. The current append code
      // simply provokes distribution in this case and does not put the
      // nodes in the shadowRoot. This could be done but we'll need to
      // consider if the special processing is worth the perf gain.
      // if (!this._hasRendered && !this._insertionPoints.length) {
      //   tree.Composed.clearChildNodes(this.host);
      //   tree.Composed.appendChild(this.host, this);
      // } else {
      // logical
      this.distribute();
      // physical
      this.compose();
      this._hasRendered = true;
    }
  },

  forceRender: function forceRender() {
    this._clean = false;
    this.render();
  },

  distribute: function distribute() {
    var dirtyRoots = this._distributor.distribute();
    for (var i=0; i<dirtyRoots.length; i++) {
      dirtyRoots[i].forceRender();
    }
  },

  updateInsertionPoints: function updateInsertionPoints() {
    var this$1 = this;

    var i$ = this.__insertionPoints;
    // if any insertion points have been removed, clear their distribution info
    if (i$) {
      for (var i=0, c; i < i$.length; i++) {
        c = i$[i];
        if (c.getRootNode() !== this$1) {
          this$1._distributor.clearAssignedSlots(c);
        }
      }
    }
    i$ = this._insertionPoints = this._distributor.getInsertionPoints();
    // ensure insertionPoints's and their parents have logical dom info.
    // save logical tree info
    // a. for shadyRoot
    // b. for insertion points (fallback)
    // c. for parents of insertion points
    for (var i$1=0, c$1; i$1 < i$.length; i$1++) {
      c$1 = i$[i$1];
      tree.Logical.saveChildNodes(c$1);
      tree.Logical.saveChildNodes(tree.Logical.getParentNode(c$1));
    }
  },

  get _insertionPoints() {
    if (!this.__insertionPoints) {
      this.updateInsertionPoints();
    }
    return this.__insertionPoints || (this.__insertionPoints = []);
  },

  set _insertionPoints(insertionPoints) {
    this.__insertionPoints = insertionPoints;
  },

  hasInsertionPoint: function hasInsertionPoint() {
    return this._distributor.hasInsertionPoint();
  },

  compose: function compose() {
    // compose self
    // note: it's important to mark this clean before distribution
    // so that attachment that provokes additional distribution (e.g.
    // adding something to your parentNode) works
    this._composeTree();
    // TODO(sorvell): See fast paths here in Polymer v1
    // (these seem unnecessary)
  },

  // Reify dom such that it is at its correct rendering position
  // based on logical distribution.
  _composeTree: function _composeTree() {
    var this$1 = this;

    this._updateChildNodes(this.host, this._composeNode(this.host));
    var p$ = this._insertionPoints || [];
    for (var i=0, l=p$.length, p, parent; (i<l) && (p=p$[i]); i++) {
      parent = tree.Logical.getParentNode(p);
      if ((parent !== this$1.host) && (parent !== this$1)) {
        this$1._updateChildNodes(parent, this$1._composeNode(parent));
      }
    }
  },

  // Returns the list of nodes which should be rendered inside `node`.
  _composeNode: function _composeNode(node) {
    var this$1 = this;

    var children = [];
    var c$ = tree.Logical.getChildNodes(node.shadyRoot || node);
    for (var i = 0; i < c$.length; i++) {
      var child = c$[i];
      if (this$1._distributor.isInsertionPoint(child)) {
        var distributedNodes = child._distributedNodes ||
          (child._distributedNodes = []);
        for (var j = 0; j < distributedNodes.length; j++) {
          var distributedNode = distributedNodes[j];
          if (this$1.isFinalDestination(child, distributedNode)) {
            children.push(distributedNode);
          }
        }
      } else {
        children.push(child);
      }
    }
    return children;
  },

  isFinalDestination: function isFinalDestination(insertionPoint, node) {
    return this._distributor.isFinalDestination(
      insertionPoint, node);
  },

  // Ensures that the rendered node list inside `container` is `children`.
  _updateChildNodes: function _updateChildNodes(container, children) {
    var composed = tree.Composed.getChildNodes(container);
    var splices = calculateSplices(children, composed);
    // process removals
    for (var i=0, d=0, s; (i<splices.length) && (s=splices[i]); i++) {
      for (var j=0, n; (j < s.removed.length) && (n=s.removed[j]); j++) {
        // check if the node is still where we expect it is before trying
        // to remove it; this can happen if we move a node and
        // then schedule its previous host for distribution resulting in
        // the node being removed here.
        if (tree.Composed.getParentNode(n) === container) {
          tree.Composed.removeChild(container, n);
        }
        composed.splice(s.index + d, 1);
      }
      d -= s.addedCount;
    }
    // process adds
    for (var i$1=0, s$1, next; (i$1<splices.length) && (s$1=splices[i$1]); i$1++) { //eslint-disable-line no-redeclare
      next = composed[s$1.index];
      for (var j$1=s$1.index, n$1; j$1 < s$1.index + s$1.addedCount; j$1++) {
        n$1 = children[j$1];
        tree.Composed.insertBefore(container, n$1, next);
        // TODO(sorvell): is this splice strictly needed?
        composed.splice(j$1, 0, n$1);
      }
    }
  },

  getInsertionPointTag: function getInsertionPointTag() {
    return this._distributor.insertionPointTag;
  }

};

var ShadyFragmentMixin = Object.create(DocumentFragment.prototype);
extend(ShadyFragmentMixin, ShadyMixin);

// let needsUpgrade = window.CustomElements && !CustomElements.useNative;

// function upgradeLogicalChildren(children) {
//   if (needsUpgrade && children) {
//     for (let i=0; i < children.length; i++) {
//       CustomElements.upgrade(children[i]);
//     }
//   }
// }

// render enqueuer/flusher
var customElements = window.customElements;
var flushList = [];
var scheduled;
var flushCount = 0;
var flushMax = 100;
function enqueue(callback) {
  if (!scheduled) {
    scheduled = true;
    promish.then(flush$1);
  }
  flushList.push(callback);
}

function flush$1() {
  scheduled = false;
  flushCount++;
  while (flushList.length) {
    flushList.shift()();
  }
  if (customElements && customElements.flush) {
    customElements.flush();
  }
  // continue flushing after elements are upgraded...
  var isFlushedMaxed = (flushCount > flushMax);
  if (flushList.length && !isFlushedMaxed) {
      flush$1();
  }
  flushCount = 0;
  if (isFlushedMaxed) {
    throw new Error('Loop detected in ShadyDOM distribution, aborting.')
  }
}

flush$1.list = flushList;

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// Cribbed from ShadowDOM polyfill
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/ShadowDOM/wrappers/HTMLElement.js#L28
/////////////////////////////////////////////////////////////////////////////
// innerHTML and outerHTML

// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#escapingString
var escapeAttrRegExp = /[&\u00A0"]/g;
var escapeDataRegExp = /[&\u00A0<>]/g;

function escapeReplace(c) {
  switch (c) {
    case '&':
      return '&amp;';
    case '<':
      return '&lt;';
    case '>':
      return '&gt;';
    case '"':
      return '&quot;';
    case '\u00A0':
      return '&nbsp;';
  }
}

function escapeAttr(s) {
  return s.replace(escapeAttrRegExp, escapeReplace);
}

function escapeData(s) {
  return s.replace(escapeDataRegExp, escapeReplace);
}

function makeSet(arr) {
  var set = {};
  for (var i = 0; i < arr.length; i++) {
    set[arr[i]] = true;
  }
  return set;
}

// http://www.whatwg.org/specs/web-apps/current-work/#void-elements
var voidElements = makeSet([
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

var plaintextParents = makeSet([
  'style',
  'script',
  'xmp',
  'iframe',
  'noembed',
  'noframes',
  'plaintext',
  'noscript'
]);

function getOuterHTML(node, parentNode, composed) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE: {
      var tagName = node.localName;
      var s = '<' + tagName;
      var attrs = node.attributes;
      for (var i = 0, attr; (attr = attrs[i]); i++) {
        s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
      }
      s += '>';
      if (voidElements[tagName]) {
        return s;
      }
      return s + getInnerHTML(node, composed) + '</' + tagName + '>';
    }
    case Node.TEXT_NODE: {
      var data = node.data;
      if (parentNode && plaintextParents[parentNode.localName]) {
        return data;
      }
      return escapeData(data);
    }
    case Node.COMMENT_NODE: {
      return '<!--' + node.data + '-->';
    }
    default: {
      window.console.error(node);
      throw new Error('not implemented');
    }
  }
}

function getInnerHTML(node, composed) {
  if (node.localName === 'template') {
    node = node.content;
  }
  var s = '';
  var c$ = composed ? composed(node) : node.childNodes;
  for (var i=0, l=c$.length, child; (i<l) && (child=c$[i]); i++) {
    s += getOuterHTML(child, node, composed);
  }
  return s;
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var mixinImpl = {

  // Try to add node. Record logical info, track insertion points, perform
  // distribution iff needed. Return true if the add is handled.
  addNode: function addNode(container, node, ref_node) {
    var ownerRoot = this.ownerShadyRootForNode(container);
    if (ownerRoot) {
      // optimization: special insertion point tracking
      if (node.__noInsertionPoint && ownerRoot._clean) {
        ownerRoot._skipUpdateInsertionPoints = true;
      }
      // note: we always need to see if an insertion point is added
      // since this saves logical tree info; however, invalidation state
      // needs
      var ipAdded = this._maybeAddInsertionPoint(node, container, ownerRoot);
      // invalidate insertion points IFF not already invalid!
      if (ipAdded) {
        ownerRoot._skipUpdateInsertionPoints = false;
      }
    }
    if (tree.Logical.hasChildNodes(container)) {
      tree.Logical.recordInsertBefore(node, container, ref_node);
    }
    // if not distributing and not adding to host, do a fast path addition
    var handled = this._maybeDistribute(node, container, ownerRoot) ||
      container.shadyRoot;
    return handled;
  },

  // Try to remove node: update logical info and perform distribution iff
  // needed. Return true if the removal has been handled.
  // note that it's possible for both the node's host and its parent
  // to require distribution... both cases are handled here.
  removeNode: function removeNode(node) {
    // important that we want to do this only if the node has a logical parent
    var logicalParent = tree.Logical.hasParentNode(node) &&
      tree.Logical.getParentNode(node);
    var distributed;
    var ownerRoot = this.ownerShadyRootForNode(node);
    if (logicalParent) {
      // distribute node's parent iff needed
      distributed = this.maybeDistributeParent(node);
      tree.Logical.recordRemoveChild(node, logicalParent);
      // remove node from root and distribute it iff needed
      if (ownerRoot && (this._removeDistributedChildren(ownerRoot, node) ||
        logicalParent.localName === ownerRoot.getInsertionPointTag())) {
        ownerRoot._skipUpdateInsertionPoints = false;
        ownerRoot.update();
      }
    }
    this._removeOwnerShadyRoot(node);
    return distributed;
  },


  _scheduleObserver: function _scheduleObserver(node, addedNode, removedNode) {
    var observer = node.__dom && node.__dom.observer;
    if (observer) {
      if (addedNode) {
        observer.addedNodes.push(addedNode);
      }
      if (removedNode) {
        observer.removedNodes.push(removedNode);
      }
      observer.schedule();
    }
  },

  removeNodeFromParent: function removeNodeFromParent(node, parent) {
    if (parent) {
      this._scheduleObserver(parent, null, node);
      this.removeNode(node);
    } else {
      this._removeOwnerShadyRoot(node);
    }
  },

  _hasCachedOwnerRoot: function _hasCachedOwnerRoot(node) {
    return Boolean(node.__ownerShadyRoot !== undefined);
  },

  getRootNode: function getRootNode$1(node) {
    if (!node || !node.nodeType) {
      return;
    }
    var root = node.__ownerShadyRoot;
    if (root === undefined) {
      if (isShadyRoot(node)) {
        root = node;
      } else {
        var parent = tree.Logical.getParentNode(node);
        root = parent ? this.getRootNode(parent) : node;
      }
      // memo-ize result for performance but only memo-ize
      // result if node is in the document. This avoids a problem where a root
      // can be cached while an element is inside a fragment.
      // If this happens and we cache the result, the value can become stale
      // because for perf we avoid processing the subtree of added fragments.
      if (document.documentElement.contains(node)) {
        node.__ownerShadyRoot = root;
      }
    }
    return root;
  },

  ownerShadyRootForNode: function ownerShadyRootForNode(node) {
    var root = this.getRootNode(node);
    if (isShadyRoot(root)) {
      return root;
    }
  },

  _maybeDistribute: function _maybeDistribute(node, container, ownerRoot) {
    // TODO(sorvell): technically we should check non-fragment nodes for
    // <content> children but since this case is assumed to be exceedingly
    // rare, we avoid the cost and will address with some specific api
    // when the need arises.  For now, the user must call
    // distributeContent(true), which updates insertion points manually
    // and forces distribution.
    var insertionPointTag = ownerRoot && ownerRoot.getInsertionPointTag() || '';
    var fragContent = (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) &&
      !node.__noInsertionPoint &&
      insertionPointTag && node.querySelector(insertionPointTag);
    var wrappedContent = fragContent &&
      (tree.Logical.getParentNode(fragContent).nodeType !==
      Node.DOCUMENT_FRAGMENT_NODE);
    var hasContent = fragContent || (node.localName === insertionPointTag);
    // There are 3 possible cases where a distribution may need to occur:
    // 1. <content> being inserted (the host of the shady root where
    //    content is inserted needs distribution)
    // 2. children being inserted into parent with a shady root (parent
    //    needs distribution)
    // 3. container is an insertionPoint
    if (hasContent || (container.localName === insertionPointTag)) {
      if (ownerRoot) {
        // note, insertion point list update is handled after node
        // mutations are complete
        ownerRoot.update();
      }
    }
    var needsDist = this._nodeNeedsDistribution(container);
    if (needsDist) {
      container.shadyRoot.update();
    }
    // Return true when distribution will fully handle the composition
    // Note that if a content was being inserted that was wrapped by a node,
    // and the parent does not need distribution, return false to allow
    // the nodes to be added directly, after which children may be
    // distributed and composed into the wrapping node(s)
    return needsDist || (hasContent && !wrappedContent);
  },

  /* note: parent argument is required since node may have an out
  of date parent at this point; returns true if a <content> is being added */
  _maybeAddInsertionPoint: function _maybeAddInsertionPoint(node, parent, root) {
    var this$1 = this;

    var added;
    var insertionPointTag = root.getInsertionPointTag();
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE &&
      !node.__noInsertionPoint) {
      var c$ = node.querySelectorAll(insertionPointTag);
      for (var i=0, n, np, na; (i<c$.length) && (n=c$[i]); i++) {
        np = tree.Logical.getParentNode(n);
        // don't allow node's parent to be fragment itself
        if (np === node) {
          np = parent;
        }
        na = this$1._maybeAddInsertionPoint(n, np, root);
        added = added || na;
      }
    } else if (node.localName === insertionPointTag) {
      tree.Logical.saveChildNodes(parent);
      tree.Logical.saveChildNodes(node);
      added = true;
    }
    return added;
  },

  _nodeNeedsDistribution: function _nodeNeedsDistribution(node) {
    return node && node.shadyRoot &&
      node.shadyRoot.hasInsertionPoint();
  },

  _removeDistributedChildren: function _removeDistributedChildren(root, container) {
    var this$1 = this;

    var hostNeedsDist;
    var ip$ = root._insertionPoints;
    for (var i=0; i<ip$.length; i++) {
      var insertionPoint = ip$[i];
      if (this$1._contains(container, insertionPoint)) {
        var dc$ = insertionPoint.assignedNodes({flatten: true});
        for (var j=0; j<dc$.length; j++) {
          hostNeedsDist = true;
          var node = dc$[j];
          var parent = tree.Composed.getParentNode(node);
          if (parent) {
            tree.Composed.removeChild(parent, node);
          }
        }
      }
    }
    return hostNeedsDist;
  },

  _contains: function _contains(container, node) {
    while (node) {
      if (node == container) {
        return true;
      }
      node = tree.Logical.getParentNode(node);
    }
  },

  _removeOwnerShadyRoot: function _removeOwnerShadyRoot(node) {
    var this$1 = this;

    // optimization: only reset the tree if node is actually in a root
    if (this._hasCachedOwnerRoot(node)) {
      var c$ = tree.Logical.getChildNodes(node);
      for (var i=0, l=c$.length, n; (i<l) && (n=c$[i]); i++) {
        this$1._removeOwnerShadyRoot(n);
      }
    }
    node.__ownerShadyRoot = undefined;
  },

  // TODO(sorvell): This will fail if distribution that affects this
  // question is pending; this is expected to be exceedingly rare, but if
  // the issue comes up, we can force a flush in this case.
  firstComposedNode: function firstComposedNode(insertionPoint) {
    var n$ = insertionPoint.assignedNodes({flatten: true});
    var root = this.getRootNode(insertionPoint);
    for (var i=0, l=n$.length, n; (i<l) && (n=n$[i]); i++) {
      // means that we're composed to this spot.
      if (root.isFinalDestination(insertionPoint, n)) {
        return n;
      }
    }
  },

  clearNode: function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  },

  maybeDistributeParent: function maybeDistributeParent(node) {
    var parent = tree.Logical.getParentNode(node);
    if (this._nodeNeedsDistribution(parent)) {
      parent.shadyRoot.update();
      return true;
    }
  },

  maybeDistributeAttributeChange: function maybeDistributeAttributeChange(node, name) {
    if (name === 'slot') {
      this.maybeDistributeParent(node);
    } else if (node.localName === 'slot' && name === 'name') {
      var root = this.ownerShadyRootForNode(node);
      if (root) {
        root.update();
      }
    }
  },

  // NOTE: `query` is used primarily for ShadyDOM's querySelector impl,
  // but it's also generally useful to recurse through the element tree
  // and is used by Polymer's styling system.
  query: function query(node, matcher, halter) {
    var list = [];
    this._queryElements(tree.Logical.getChildNodes(node), matcher,
      halter, list);
    return list;
  },

  _queryElements: function _queryElements(elements, matcher, halter, list) {
    var this$1 = this;

    for (var i=0, l=elements.length, c; (i<l) && (c=elements[i]); i++) {
      if (c.nodeType === Node.ELEMENT_NODE &&
          this$1._queryElement(c, matcher, halter, list)) {
        return true;
      }
    }
  },

  _queryElement: function _queryElement(node, matcher, halter, list) {
    var result = matcher(node);
    if (result) {
      list.push(node);
    }
    if (halter && halter(result)) {
      return result;
    }
    this._queryElements(tree.Logical.getChildNodes(node), matcher,
      halter, list);
  },

  activeElementForNode: function activeElementForNode(node) {
    var this$1 = this;

    var active = document.activeElement;
    if (!active) {
      return null;
    }
    var isShadyRoot$$1 = !!(isShadyRoot(node));
    if (node !== document) {
      // If this node isn't a document or shady root, then it doesn't have
      // an active element.
      if (!isShadyRoot$$1) {
        return null;
      }
      // If this shady root's host is the active element or the active
      // element is not a descendant of the host (in the composed tree),
      // then it doesn't have an active element.
      if (node.host === active ||
          !node.host.contains(active)) {
        return null;
      }
    }
    // This node is either the document or a shady root of which the active
    // element is a (composed) descendant of its host; iterate upwards to
    // find the active element's most shallow host within it.
    var activeRoot = this.ownerShadyRootForNode(active);
    while (activeRoot && activeRoot !== node) {
      active = activeRoot.host;
      activeRoot = this$1.ownerShadyRootForNode(active);
    }
    if (node === document) {
      // This node is the document, so activeRoot should be null.
      return activeRoot ? null : active;
    } else {
      // This node is a non-document shady root, and it should be
      // activeRoot.
      return activeRoot === node ? active : null;
    }
  }

};

var nativeCloneNode = Element.prototype.cloneNode;
var nativeImportNode = Document.prototype.importNode;
var nativeSetAttribute$1 = Element.prototype.setAttribute;
var nativeRemoveAttribute = Element.prototype.removeAttribute;

var setAttribute = function(attr, value) {
  // avoid scoping elements in non-main document to avoid template documents
  if (window.ShadyCSS && attr === 'class' && this.ownerDocument === document) {
    window.ShadyCSS.setElementClass(this, value);
  } else {
    nativeSetAttribute$1.call(this, attr, value);
  }
};

var NodeMixin = {};

Object.defineProperties(NodeMixin, {

  parentElement: {
    get: function get() {
      return tree.Logical.getParentNode(this);
    },
    configurable: true
  },

  parentNode: {
    get: function get$1() {
      return tree.Logical.getParentNode(this);
    },
    configurable: true
  },

  nextSibling: {
    get: function get$2() {
      return tree.Logical.getNextSibling(this);
    },
    configurable: true
  },

  previousSibling: {
    get: function get$3() {
      return tree.Logical.getPreviousSibling(this);
    },
    configurable: true
  },

  nextElementSibling: {
    get: function get$4() {
      return tree.Logical.getNextElementSibling(this);
    },
    configurable: true
  },

  previousElementSibling: {
    get: function get$5() {
      return tree.Logical.getPreviousElementSibling(this);
    },
    configurable: true
  },

  assignedSlot: {
    get: function get$6() {
      return this._assignedSlot;
    },
    configurable: true
  }
});

var FragmentMixin = {

  appendChild: function appendChild(node) {
    return this.insertBefore(node);
  },

  // cases in which we may not be able to just do standard native call
  // 1. container has a shadyRoot (needsDistribution IFF the shadyRoot
  // has an insertion point)
  // 2. container is a shadyRoot (don't distribute, instead set
  // container to container.host.
  // 3. node is <content> (host of container needs distribution)
  insertBefore: function insertBefore(node, ref_node) {
    if (ref_node && tree.Logical.getParentNode(ref_node) !== this) {
      throw Error('The ref_node to be inserted before is not a child ' +
        'of this node');
    }
    // remove node from its current position iff it's in a tree.
    if (node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      var parent = tree.Logical.getParentNode(node);
      mixinImpl.removeNodeFromParent(node, parent);
    }
    if (!mixinImpl.addNode(this, node, ref_node)) {
      if (ref_node) {
        // if ref_node is an insertion point replace with first distributed node
        var root = mixinImpl.ownerShadyRootForNode(ref_node);
        if (root) {
          ref_node = ref_node.localName === root.getInsertionPointTag() ?
            mixinImpl.firstComposedNode(ref_node) : ref_node;
        }
      }
      // if adding to a shadyRoot, add to host instead
      var container = isShadyRoot(this) ?
        this.host : this;
      if (ref_node) {
        tree.Composed.insertBefore(container, node, ref_node);
      } else {
        tree.Composed.appendChild(container, node);
      }
    }
    mixinImpl._scheduleObserver(this, node);
    return node;
  },

  /**
    Removes the given `node` from the element's `lightChildren`.
    This method also performs dom composition.
  */
  removeChild: function removeChild(node) {
    if (tree.Logical.getParentNode(node) !== this) {
      throw Error('The node to be removed is not a child of this node: ' +
        node);
    }
    if (!mixinImpl.removeNode(node)) {
      // if removing from a shadyRoot, remove form host instead
      var container = isShadyRoot(this) ?
        this.host :
        this;
      // not guaranteed to physically be in container; e.g.
      // undistributed nodes.
      var parent = tree.Composed.getParentNode(node);
      if (container === parent) {
        tree.Composed.removeChild(container, node);
      }
    }
    mixinImpl._scheduleObserver(this, null, node);
    return node;
  },

  replaceChild: function replaceChild(node, ref_node) {
    this.insertBefore(node, ref_node);
    this.removeChild(ref_node);
    return node;
  },

  // TODO(sorvell): consider doing native QSA and filtering results.
  querySelector: function querySelector(selector) {
    // match selector and halt on first result.
    var result = mixinImpl.query(this, function(n) {
      return matchesSelector(n, selector);
    }, function(n) {
      return Boolean(n);
    })[0];
    return result || null;
  },

  querySelectorAll: function querySelectorAll(selector) {
    return mixinImpl.query(this, function(n) {
      return matchesSelector(n, selector);
    });
  },

  cloneNode: function cloneNode(deep) {
    if (this.localName == 'template') {
      return nativeCloneNode.call(this, deep);
    } else {
      var n = nativeCloneNode.call(this, false);
      if (deep) {
        var c$ = this.childNodes;
        for (var i=0, nc; i < c$.length; i++) {
          nc = c$[i].cloneNode(true);
          n.appendChild(nc);
        }
      }
      return n;
    }
  },

  importNode: function importNode(externalNode, deep) {
    // for convenience use this node's ownerDoc if the node isn't a document
    var doc = this instanceof Document ? this :
      this.ownerDocument;
    var n = nativeImportNode.call(doc, externalNode, false);
    if (deep) {
      var c$ = tree.Logical.getChildNodes(externalNode);
      common.patchNode(n);
      for (var i=0, nc; i < c$.length; i++) {
        nc = doc.importNode(c$[i], true);
        n.appendChild(nc);
      }
    }
    return n;
  }
};

Object.defineProperties(FragmentMixin, {

  childNodes: {
    get: function get$7() {
      var c$ = tree.Logical.getChildNodes(this);
      return Array.isArray(c$) ? c$ : tree.arrayCopyChildNodes(this);
    },
    configurable: true
  },

  children: {
    get: function get$8() {
      if (tree.Logical.hasChildNodes(this)) {
        return Array.prototype.filter.call(this.childNodes, function(n) {
          return (n.nodeType === Node.ELEMENT_NODE);
        });
      } else {
        return tree.arrayCopyChildren(this);
      }
    },
    configurable: true
  },

  firstChild: {
    get: function get$9() {
      return tree.Logical.getFirstChild(this);
    },
    configurable: true
  },

  lastChild: {
    get: function get$10() {
      return tree.Logical.getLastChild(this);
    },
    configurable: true
  },

  firstElementChild: {
    get: function get$11() {
      return tree.Logical.getFirstElementChild(this);
    },
    configurable: true
  },

  lastElementChild: {
    get: function get$12() {
      return tree.Logical.getLastElementChild(this);
    },
    configurable: true
  },

  // TODO(srovell): strictly speaking fragments do not have textContent
  // or innerHTML but ShadowRoots do and are not easily distinguishable.
  // textContent / innerHTML
  textContent: {
    get: function get$13() {
      if (this.childNodes) {
        var tc = [];
        for (var i = 0, cn = this.childNodes, c; (c = cn[i]); i++) {
          if (c.nodeType !== Node.COMMENT_NODE) {
            tc.push(c.textContent);
          }
        }
        return tc.join('');
      }
      return '';
    },
    set: function set(text) {
      mixinImpl.clearNode(this);
      if (text) {
        this.appendChild(document.createTextNode(text));
      }
    },
    configurable: true
  },

  innerHTML: {
    get: function get$14() {
      return getInnerHTML(this);
    },
    set: function set$1(text) {
      var this$1 = this;

      mixinImpl.clearNode(this);
      var d = document.createElement('div');
      d.innerHTML = text;
      // here, appendChild may move nodes async so we cannot rely
      // on node position when copying
      var c$ = tree.arrayCopyChildNodes(d);
      for (var i=0; i < c$.length; i++) {
        this$1.appendChild(c$[i]);
      }
    },
    configurable: true
  }

});

var ElementMixin = {

  // TODO(sorvell): should only exist on <slot>
  assignedNodes: function assignedNodes(options) {
    return (options && options.flatten ? this._distributedNodes :
      this._assignedNodes) || [];
  },


  setAttribute: function setAttribute$1(name, value) {
    setAttribute.call(this, name, value);
    mixinImpl.maybeDistributeAttributeChange(this, name);
  },

  removeAttribute: function removeAttribute(name) {
    nativeRemoveAttribute.call(this, name);
    mixinImpl.maybeDistributeAttributeChange(this, name);
  }

};

Object.defineProperties(ElementMixin, {

  shadowRoot: {
    get: function get$15() {
      return this.shadyRoot;
    }
  },

  slot: {
    get: function get$16() {
      return this.getAttribute('slot');
    },
    set: function set$2(value) {
      this.setAttribute('slot', value);
    }
  }

});

var activeElementDescriptor = {
  get: function get$17() {
    return mixinImpl.activeElementForNode(this);
  }
};

var ActiveElementMixin = {};
Object.defineProperties(ActiveElementMixin, {
  activeElement: activeElementDescriptor
});

var UnderActiveElementMixin = {};
Object.defineProperties(UnderActiveElementMixin, {
  _activeElement: activeElementDescriptor
});

var Mixins = {

  Node: extendAll({__patched: 'Node'}, NodeMixin),

  Fragment: extendAll({__patched: 'Fragment'},
    NodeMixin, FragmentMixin, ActiveElementMixin),

  Element: extendAll({__patched: 'Element'},
    NodeMixin, FragmentMixin, ElementMixin, ActiveElementMixin),

  // Note: activeElement cannot be patched on document!
  Document: extendAll({__patched: 'Document'},
    NodeMixin, FragmentMixin, ElementMixin, UnderActiveElementMixin)

};

var getRootNode = function(node) {
  return mixinImpl.getRootNode(node);
};

function filterMutations(mutations, target) {
  var targetRootNode = getRootNode(target);
  return mutations.map(function(mutation) {
    var mutationInScope = (targetRootNode === getRootNode(mutation.target));
    if (mutationInScope && mutation.addedNodes) {
      var nodes = Array.from(mutation.addedNodes).filter(function(n) {
        return (targetRootNode === getRootNode(n));
      });
      if (nodes.length) {
        mutation = Object.create(mutation);
        Object.defineProperty(mutation, 'addedNodes', {
          value: nodes,
          configurable: true
        });
        return mutation;
      }
    } else if (mutationInScope) {
      return mutation;
    }
  }).filter(function(m) { return m});
}

// const promise = Promise.resolve();

var AsyncObserver = function AsyncObserver() {
  this._scheduled = false;
  this.addedNodes = [];
  this.removedNodes = [];
  this.callbacks = new Set();
};

AsyncObserver.prototype.schedule = function schedule () {
    var this$1 = this;

  if (!this._scheduled) {
    this._scheduled = true;
    promish.then(function () {
      this$1.flush();
    });
  }
};

AsyncObserver.prototype.flush = function flush () {
  if (this._scheduled) {
    this._scheduled = false;
    var mutations = this.takeRecords();
    if (mutations.length) {
      this.callbacks.forEach(function(cb) {
        cb(mutations);
      });
    }
  }
};

AsyncObserver.prototype.takeRecords = function takeRecords () {
  if (this.addedNodes.length || this.removedNodes.length) {
    var mutations = [{
      addedNodes: this.addedNodes,
      removedNodes: this.removedNodes
    }];
    this.addedNodes = [];
    this.removedNodes = [];
    return mutations;
  }
  return [];
};

var getComposedInnerHTML = function(node) {
  if (common.isNodePatched(node)) {
    return getInnerHTML(node, function(n) {
      return tree.Composed.getChildNodes(n);
    })
  } else {
    return node.innerHTML;
  }
};

var getComposedChildNodes$1 = function(node) {
  return common.isNodePatched(node) ?
    tree.Composed.getChildNodes(node) :
    node.childNodes;
};

// TODO(sorvell): consider instead polyfilling MutationObserver
// directly so that users do not have to fork their code.
// Supporting the entire api may be challenging: e.g. filtering out
// removed nodes in the wrong scope and seeing non-distributing
// subtree child mutations.
var observeChildren = function(node, callback) {
  common.patchNode(node);
  if (!node.__dom.observer) {
    node.__dom.observer = new AsyncObserver();
  }
  node.__dom.observer.callbacks.add(callback);
  var observer = node.__dom.observer;
  return {
    _callback: callback,
    _observer: observer,
    _node: node,
    takeRecords: function takeRecords() {
      return observer.takeRecords()
    }
  };
};

var unobserveChildren = function(handle) {
  var observer = handle && handle._observer;
  if (observer) {
    observer.callbacks.delete(handle._callback);
    if (!observer.callbacks.size) {
      handle._node.__dom.observer = null;
    }
  }
};

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Patches elements that interacts with ShadyDOM
 * such that tree traversal and mutation apis act like they would under
 * ShadowDOM.
 *
 * This import enables seemless interaction with ShadyDOM powered
 * custom elements, enabling better interoperation with 3rd party code,
 * libraries, and frameworks that use DOM tree manipulation apis.
 */

var patchedCount = 0;

var log = false;

var patchImpl = {

  canPatchNode: function(node) {
    switch (node) {
      case document.head:
      case document.documentElement:
        return false;
      default:
        return true;
    }
  },

  hasPrototypeDescriptors: Boolean(Object.getOwnPropertyDescriptor(
    window.Node.prototype, 'textContent')),

  patch: function(node) {
    patchedCount++;
    log && window.console.warn('patch node', node);
    if (this.hasPrototypeDescriptors) {
      patchPrototype(node, this.mixinForObject(node));
    } else {
      window.console.warn('Patching instance rather than prototype', node);
      extend(node, this.mixinForObject(node));
    }
  },

  mixinForObject: function(obj) {
    switch (obj.nodeType) {
      case Node.ELEMENT_NODE:
        return Mixins.Element;
      case Node.DOCUMENT_FRAGMENT_NODE:
        return Mixins.Fragment;
      case Node.DOCUMENT_NODE:
        return Mixins.Document;
      case Node.TEXT_NODE:
      case Node.COMMENT_NODE:
        return Mixins.Node;
    }
  },

  unpatch: function(obj) {
    if (obj.__sourceProto) {
      obj.__proto__ = obj.__sourceProto;

    }
    // TODO(sorvell): implement unpatching for non-proto patchable browsers
  }

};

function patchNode(node) {
  if (!settings.inUse) {
    return;
  }
  if (!isNodePatched(node) && patchImpl.canPatchNode(node)) {
    tree.saveChildNodes(node);
    patchImpl.patch(node);
  }
}

function canUnpatchNode() {
  return Boolean(patchImpl.hasPrototypeDescriptors);
}

function unpatchNode(node) {
  patchImpl.unpatch(node);
}

function isNodePatched(node) {
  return Boolean(node.__patched);
}

// TODO(sorvell): fake export
common.patchNode = patchNode;
common.canUnpatchNode = canUnpatchNode;
common.isNodePatched = isNodePatched;

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var origAddEventListener = Element.prototype.addEventListener;
var origRemoveEventListener = Element.prototype.removeEventListener;

// https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
var alwaysComposed = {
  blur: true,
  focus: true,
  focusin: true,
  focusout: true,
  click: true,
  dblclick: true,
  mousedown: true,
  mouseenter: true,
  mouseleave: true,
  mousemove: true,
  mouseout: true,
  mouseover: true,
  mouseup: true,
  wheel: true,
  beforeinput: true,
  input: true,
  keydown: true,
  keyup: true,
  compositionstart: true,
  compositionupdate: true,
  compositionend: true,
  touchstart: true,
  touchend: true,
  touchmove: true,
  touchcancel: true,
  pointerover: true,
  pointerenter: true,
  pointerdown: true,
  pointermove: true,
  pointerup: true,
  pointercancel: true,
  pointerout: true,
  pointerleave: true,
  gotpointercapture: true,
  lostpointercapture: true,
  dragstart: true,
  drag: true,
  dragenter: true,
  dragleave: true,
  dragover: true,
  drop: true,
  dragend: true,
  DOMActivate: true,
  DOMFocusIn: true,
  DOMFocusOut: true,
  keypress: true
};

function pathComposer(startNode, composed) {
  var composedPath = [];
  var current = startNode;
  var startRoot = startNode === window ? window : startNode.getRootNode();
  while (current) {
    composedPath.push(current);
    if (current.assignedSlot) {
      current = current.assignedSlot;
    } else if (current.nodeType === Node.DOCUMENT_FRAGMENT_NODE && current.host && (composed || current !== startRoot)) {
      current = current.host;
    } else {
      current = current.parentNode;
    }
  }
  // event composedPath includes window when startNode's ownerRoot is document
  if (composedPath[composedPath.length - 1] === document) {
    composedPath.push(window);
  }
  return composedPath;
}

function retarget(refNode, path) {
  if (!isShadyRoot) {
    return refNode;
  }
  // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
  // shadow-including inclusive ancestor, return ANCESTOR.
  var refNodePath = pathComposer(refNode, true);
  var p$ = path;
  for (var i=0, ancestor, lastRoot, root, rootIdx; i < p$.length; i++) {
    ancestor = p$[i];
    root = ancestor === window ? window : ancestor.getRootNode();
    if (root !== lastRoot) {
      rootIdx = refNodePath.indexOf(root);
      lastRoot = root;
    }
    if (!isShadyRoot(root) || rootIdx > -1) {
      return ancestor;
    }
  }
}

var EventMixin = {

  __patched: 'Event',

  get composed() {
    if (this.isTrusted && this.__composed === undefined) {
      this.__composed = alwaysComposed[this.type];
    }
    return this.__composed || false;
  },

  composedPath: function composedPath() {
    if (!this.__composedPath) {
      this.__composedPath = pathComposer(this.__target, this.composed);
    }
    return this.__composedPath;
  },

  get target() {
    return retarget(this.currentTarget, this.composedPath());
  },

  // http://w3c.github.io/webcomponents/spec/shadow/#event-relatedtarget-retargeting
  get relatedTarget() {
    if (!this.__relatedTarget) {
      return null;
    }
    if (!this.__relatedTargetComposedPath) {
      this.__relatedTargetComposedPath = pathComposer(this.__relatedTarget, true);
    }
    // find the deepest node in relatedTarget composed path that is in the same root with the currentTarget
    return retarget(this.currentTarget, this.__relatedTargetComposedPath);
  },
  stopPropagation: function stopPropagation() {
    Event.prototype.stopPropagation.call(this);
    this.__propagationStopped = true;
  },
  stopImmediatePropagation: function stopImmediatePropagation() {
    Event.prototype.stopImmediatePropagation.call(this);
    this.__immediatePropagationStopped = true;
    this.__propagationStopped = true;
  }

};

function mixinComposedFlag(Base) {
  // NOTE: avoiding use of `class` here so that transpiled output does not
  // try to do `Base.call` with a dom construtor.
  var klazz = function(type, options) {
    var event = new Base(type, options);
    event.__composed = options && Boolean(options.composed);
    return event;
  };
  // put constructor properties on subclass
  mixin(klazz, Base);
  klazz.prototype = Base.prototype;
  return klazz;
}

var nonBubblingEventsToRetarget = {
  focus: true,
  blur: true
};

function fireHandlers(event, node, phase) {
  var hs = node.__handlers && node.__handlers[event.type] &&
    node.__handlers[event.type][phase];
  if (hs) {
    for (var i = 0, fn; (fn = hs[i]); i++) {
      fn.call(node, event);
      if (event.__immediatePropagationStopped) {
        return;
      }
    }
  }
}

function retargetNonBubblingEvent(e) {
  var path = e.composedPath();
  var node;
  // override `currentTarget` to let patched `target` calculate correctly
  Object.defineProperty(e, 'currentTarget', {
    get: function() {
      return node;
    },
    configurable: true
  });
  for (var i = path.length - 1; i >= 0; i--) {
    node = path[i];
    // capture phase fires all capture handlers
    fireHandlers(e, node, 'capture');
    if (e.__propagationStopped) {
      return;
    }
  }

  // set the event phase to `AT_TARGET` as in spec
  Object.defineProperty(e, 'eventPhase', {value: Event.AT_TARGET});

  // the event only needs to be fired when owner roots change when iterating the event path
  // keep track of the last seen owner root
  var lastFiredRoot;
  for (var i$1 = 0; i$1 < path.length; i$1++) {
    node = path[i$1];
    if (i$1 === 0 || (node.shadowRoot && node.shadowRoot === lastFiredRoot)) {
      fireHandlers(e, node, 'bubble');
      // don't bother with window, it doesn't have `getRootNode` and will be last in the path anyway
      if (node !== window) {
        lastFiredRoot = node.getRootNode();
      }
      if (e.__propagationStopped) {
        return;
      }
    }
  }
}

function addEventListener(type, fn, optionsOrCapture) {
  var this$1 = this;

  if (!fn) {
    return;
  }

  // The callback `fn` might be used for multiple nodes/events. Since we generate
  // a wrapper function, we need to keep track of it when we remove the listener.
  // It's more efficient to store the node/type/options information as Array in
  // `fn` itself rather than the node (we assume that the same callback is used
  // for few nodes at most, whereas a node will likely have many event listeners).
  // NOTE(valdrin) invoking external functions is costly, inline has better perf.
  var capture, once, passive;
  if (typeof optionsOrCapture === 'object') {
    capture = Boolean(optionsOrCapture.capture);
    once = Boolean(optionsOrCapture.once);
    passive = Boolean(optionsOrCapture.passive);
  } else {
    capture = Boolean(optionsOrCapture);
    once = false;
    passive = false;
  }
  if (fn.__eventWrappers) {
    // Stop if the wrapper function has already been created.
    for (var i = 0; i < fn.__eventWrappers.length; i++) {
      if (fn.__eventWrappers[i].node === this$1 &&
          fn.__eventWrappers[i].type === type &&
          fn.__eventWrappers[i].capture === capture &&
          fn.__eventWrappers[i].once === once &&
          fn.__eventWrappers[i].passive === passive) {
        return;
      }
    }
  } else {
    fn.__eventWrappers = [];
  }

  var wrapperFn = function(e) {
    // Support `once` option.
    if (once) {
      this.removeEventListener(type, fn, optionsOrCapture);
    }
    if (!e.__target) {
      e.__target = e.target;
      e.__relatedTarget = e.relatedTarget;
      patchPrototype(e, EventMixin);
    }
    // There are two critera that should stop events from firing on this node
    // 1. the event is not composed and the current node is not in the same root as the target
    // 2. when bubbling, if after retargeting, relatedTarget and target point to the same node
    if (e.composed || e.composedPath().indexOf(this) > -1) {
      if (e.eventPhase === Event.BUBBLING_PHASE) {
        if (e.target === e.relatedTarget) {
          e.stopImmediatePropagation();
          return;
        }
      }
      return fn(e);
    }
  };
  // Store the wrapper information.
  fn.__eventWrappers.push({
    node: this,
    type: type,
    capture: capture,
    once: once,
    passive: passive,
    wrapperFn: wrapperFn
  });

  if (nonBubblingEventsToRetarget[type]) {
    this.__handlers = this.__handlers || {};
    this.__handlers[type] = this.__handlers[type] || {capture: [], bubble: []};
    this.__handlers[type][capture ? 'capture' : 'bubble'].push(wrapperFn);
  } else {
    origAddEventListener.call(this, type, wrapperFn, optionsOrCapture);
  }
}

function removeEventListener(type, fn, optionsOrCapture) {
  var this$1 = this;

  if (!fn) {
    return;
  }

  // NOTE(valdrin) invoking external functions is costly, inline has better perf.
  var capture, once, passive;
  if (typeof optionsOrCapture === 'object') {
    capture = Boolean(optionsOrCapture.capture);
    once = Boolean(optionsOrCapture.once);
    passive = Boolean(optionsOrCapture.passive);
  } else {
    capture = Boolean(optionsOrCapture);
    once = false;
    passive = false;
  }
  // Search the wrapped function.
  var wrapperFn = undefined;
  if (fn.__eventWrappers) {
    for (var i = 0; i < fn.__eventWrappers.length; i++) {
      if (fn.__eventWrappers[i].node === this$1 &&
          fn.__eventWrappers[i].type === type &&
          fn.__eventWrappers[i].capture === capture &&
          fn.__eventWrappers[i].once === once &&
          fn.__eventWrappers[i].passive === passive) {
        wrapperFn = fn.__eventWrappers.splice(i, 1)[0].wrapperFn;
        // Cleanup.
        if (!fn.__eventWrappers.length) {
          fn.__eventWrappers = undefined;
        }
        break;
      }
    }
  }

  origRemoveEventListener.call(this, type, wrapperFn || fn, optionsOrCapture);
  if (wrapperFn && nonBubblingEventsToRetarget[type] &&
      this.__handlers && this.__handlers[type]) {
    var arr = this.__handlers[type][capture ? 'capture' : 'bubble'];
    var idx = arr.indexOf(wrapperFn);
    if (idx > -1) {
      arr.splice(idx, 1);
    }
  }
}

function activateFocusEventOverrides() {
  for (var ev in nonBubblingEventsToRetarget) {
    window.addEventListener(ev, function(e) {
      if (!e.__target) {
        e.__target = e.target;
        e.__relatedTarget = e.relatedTarget;
        patchPrototype(e, EventMixin);
        retargetNonBubblingEvent(e);
        e.stopImmediatePropagation();
      }
    }, true);
  }
}


var PatchedEvent = mixinComposedFlag(Event);
var PatchedCustomEvent = mixinComposedFlag(CustomEvent);
var PatchedMouseEvent = mixinComposedFlag(MouseEvent);

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Patches elements that interacts with ShadyDOM
 * such that tree traversal and mutation apis act like they would under
 * ShadowDOM.
 *
 * This import enables seemless interaction with ShadyDOM powered
 * custom elements, enabling better interoperation with 3rd party code,
 * libraries, and frameworks that use DOM tree manipulation apis.
 */

if (settings.inUse) {

  window.ShadyDOM = {
    tree: tree,
    getNativeProperty: getNativeProperty,
    patch: patchNode,
    isPatched: isNodePatched,
    getComposedInnerHTML: getComposedInnerHTML,
    getComposedChildNodes: getComposedChildNodes$1,
    unpatch: unpatchNode,
    canUnpatch: canUnpatchNode,
    isShadyRoot: isShadyRoot,
    enqueue: enqueue,
    flush: flush$1,
    inUse: settings.inUse,
    filterMutations: filterMutations,
    observeChildren: observeChildren,
    unobserveChildren: unobserveChildren
  };

  var createRootAndEnsurePatched = function(node) {
    // TODO(sorvell): need to ensure ancestors are patched but this introduces
    // a timing problem with gathering composed children.
    // (1) currently the child list is crawled and patched when patching occurs
    // (this needs to change)
    // (2) we can only patch when an element has received its parsed children
    // because we cannot detect them when inserted by parser.
    // let ancestor = node;
    // while (ancestor) {
    //   patchNode(ancestor);
    //   ancestor = ancestor.parentNode || ancestor.host;
    // }
    patchNode(node);
    var root = new ShadyRoot(node);
    patchNode(root);
    return root;
  };

  Element.prototype.attachShadow = function() {
    return createRootAndEnsurePatched(this);
  };

  Node.prototype.addEventListener = addEventListener;
  Node.prototype.removeEventListener = removeEventListener;
  Event = PatchedEvent;
  CustomEvent = PatchedCustomEvent;
  MouseEvent = PatchedMouseEvent;
  activateFocusEventOverrides();

  Object.defineProperty(Node.prototype, 'isConnected', {
    get: function get() {
      return document.documentElement.contains(this);
    },
    configurable: true
  });

  Node.prototype.getRootNode = function(options) {
    return getRootNode(this, options);
  };

  Object.defineProperty(Element.prototype, 'slot', {
    get: function get$1() {
      return this.getAttribute('slot');
    },
    set: function set(value) {
      this.setAttribute('slot', value);
    },
    configurable: true
  });

  Object.defineProperty(Node.prototype, 'assignedSlot', {
    get: function get$2() {
      return this._assignedSlot || null;
    },
    configurable: true
  });

  var nativeSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = setAttribute;
  // NOTE: expose native setAttribute to allow hooking native method
  // (e.g. this is done in ShadyCSS)
  Element.prototype.__nativeSetAttribute = nativeSetAttribute;

  var classNameDescriptor = {
    get: function get$3() {
      return this.getAttribute('class');
    },
    set: function set$1(value) {
      this.setAttribute('class', value);
    },
    configurable: true
  };

  // Safari 9 `className` is not configurable
  var cn = Object.getOwnPropertyDescriptor(Element.prototype, 'className');
  if (cn && cn.configurable) {
    Object.defineProperty(Element.prototype, 'className', classNameDescriptor);
  } else {
    // on IE `className` is on Element
    var h = window.customElements && window.customElements.nativeHTMLElement ||
      HTMLElement;
    cn = Object.getOwnPropertyDescriptor(h.prototype, 'className');
    if (cn && cn.configurable) {
      Object.defineProperty(h.prototype, 'className', classNameDescriptor);
    }
  }
}

}());

(function () {
'use strict';

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
Extremely simple css parser. Intended to be not more than what we need
and definitely not necessarily correct =).
*/

// given a string of css, return a simple rule tree

function parse(text) {
  text = clean(text);
  return parseCss(lex(text), text);
}

// remove stuff we don't care about that may hinder parsing
function clean(cssText) {
  return cssText.replace(RX.comments, '').replace(RX.port, '');
}

// super simple {...} lexer that returns a node tree
function lex(text) {
  var root = {
    start: 0,
    end: text.length
  };
  var n = root;
  for (var i = 0, l = text.length; i < l; i++) {
    if (text[i] === OPEN_BRACE) {
      if (!n.rules) {
        n.rules = [];
      }
      var p = n;
      var previous = p.rules[p.rules.length - 1];
      n = {
        start: i + 1,
        parent: p,
        previous: previous
      };
      p.rules.push(n);
    } else if (text[i] === CLOSE_BRACE) {
      n.end = i + 1;
      n = n.parent || root;
    }
  }
  return root;
}

// add selectors/cssText to node tree
function parseCss(node, text) {
  var t = text.substring(node.start, node.end - 1);
  node.parsedCssText = node.cssText = t.trim();
  if (node.parent) {
    var ss = node.previous ? node.previous.end : node.parent.start;
    t = text.substring(ss, node.start - 1);
    t = _expandUnicodeEscapes(t);
    t = t.replace(RX.multipleSpaces, ' ');
    // TODO(sorvell): ad hoc; make selector include only after last ;
    // helps with mixin syntax
    t = t.substring(t.lastIndexOf(';') + 1);
    var s = node.parsedSelector = node.selector = t.trim();
    node.atRule = s.indexOf(AT_START) === 0;
    // note, support a subset of rule types...
    if (node.atRule) {
      if (s.indexOf(MEDIA_START) === 0) {
        node.type = types.MEDIA_RULE;
      } else if (s.match(RX.keyframesRule)) {
        node.type = types.KEYFRAMES_RULE;
        node.keyframesName = node.selector.split(RX.multipleSpaces).pop();
      }
    } else {
      if (s.indexOf(VAR_START) === 0) {
        node.type = types.MIXIN_RULE;
      } else {
        node.type = types.STYLE_RULE;
      }
    }
  }
  var r$ = node.rules;
  if (r$) {
    for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
      parseCss(r, text);
    }
  }
  return node;
}

// conversion of sort unicode escapes with spaces like `\33 ` (and longer) into
// expanded form that doesn't require trailing space `\000033`
function _expandUnicodeEscapes(s) {
  return s.replace(/\\([0-9a-f]{1,6})\s/gi, function () {
    var code = arguments[1],
        repeat = 6 - code.length;
    while (repeat--) {
      code = '0' + code;
    }
    return '\\' + code;
  });
}

// stringify parsed css.
function stringify(node, preserveProperties, text) {
  text = text || '';
  // calc rule cssText
  var cssText = '';
  if (node.cssText || node.rules) {
    var r$ = node.rules;
    if (r$ && !_hasMixinRules(r$)) {
      for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
        cssText = stringify(r, preserveProperties, cssText);
      }
    } else {
      cssText = preserveProperties ? node.cssText : removeCustomProps(node.cssText);
      cssText = cssText.trim();
      if (cssText) {
        cssText = '  ' + cssText + '\n';
      }
    }
  }
  // emit rule if there is cssText
  if (cssText) {
    if (node.selector) {
      text += node.selector + ' ' + OPEN_BRACE + '\n';
    }
    text += cssText;
    if (node.selector) {
      text += CLOSE_BRACE + '\n\n';
    }
  }
  return text;
}

function _hasMixinRules(rules) {
  return rules[0].selector.indexOf(VAR_START) === 0;
}

function removeCustomProps(cssText) {
  cssText = removeCustomPropAssignment(cssText);
  return removeCustomPropApply(cssText);
}

function removeCustomPropAssignment(cssText) {
  return cssText.replace(RX.customProp, '').replace(RX.mixinProp, '');
}

function removeCustomPropApply(cssText) {
  return cssText.replace(RX.mixinApply, '').replace(RX.varApply, '');
}

var types = {
  STYLE_RULE: 1,
  KEYFRAMES_RULE: 7,
  MEDIA_RULE: 4,
  MIXIN_RULE: 1000
};

var OPEN_BRACE = '{';
var CLOSE_BRACE = '}';

// helper regexp's
var RX = {
  comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
  port: /@import[^;]*;/gim,
  customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
  mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
  mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
  varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
  keyframesRule: /^@[^\s]*keyframes/,
  multipleSpaces: /\s+/g
};

var VAR_START = '--';
var MEDIA_START = '@media';
var AT_START = '@';

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var nativeShadow = !(window.ShadyDOM && window.ShadyDOM.inUse);
// chrome 49 has semi-working css vars, check if box-shadow works
// safari 9.1 has a recalc bug: https://bugs.webkit.org/show_bug.cgi?id=155782
var nativeCssVariables = !navigator.userAgent.match('AppleWebKit/601') && window.CSS && CSS.supports && CSS.supports('box-shadow', '0 0 0 var(--foo)');

// experimental support for native @apply
function detectNativeApply() {
  var style = document.createElement('style');
  style.textContent = '.foo { @apply --foo }';
  document.head.appendChild(style);
  var nativeCssApply = style.sheet.cssRules[0].cssText.indexOf('apply') >= 0;
  document.head.removeChild(style);
  return nativeCssApply;
}

var nativeCssApply = false && detectNativeApply();

function parseSettings(settings) {
  if (settings) {
    nativeCssVariables = nativeCssVariables && !settings.shimcssproperties;
    nativeShadow = nativeShadow && !settings.shimshadow;
  }
}

if (window.ShadyCSS) {
  parseSettings(window.ShadyCSS);
} else if (window.WebComponents) {
  parseSettings(window.WebComponents.flags);
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

function toCssText(rules, callback) {
  if (typeof rules === 'string') {
    rules = parse(rules);
  }
  if (callback) {
    forEachRule(rules, callback);
  }
  return stringify(rules, nativeCssVariables);
}

function rulesForStyle(style) {
  if (!style.__cssRules && style.textContent) {
    style.__cssRules = parse(style.textContent);
  }
  return style.__cssRules;
}

// Tests if a rule is a keyframes selector, which looks almost exactly
// like a normal selector but is not (it has nothing to do with scoping
// for example).
function isKeyframesSelector(rule) {
  return rule.parent && rule.parent.type === types.KEYFRAMES_RULE;
}

function forEachRule(node, styleRuleCallback, keyframesRuleCallback, onlyActiveRules) {
  if (!node) {
    return;
  }
  var skipRules = false;
  if (onlyActiveRules) {
    if (node.type === types.MEDIA_RULE) {
      var matchMedia = node.selector.match(rx.MEDIA_MATCH);
      if (matchMedia) {
        // if rule is a non matching @media rule, skip subrules
        if (!window.matchMedia(matchMedia[1]).matches) {
          skipRules = true;
        }
      }
    }
  }
  if (node.type === types.STYLE_RULE) {
    styleRuleCallback(node);
  } else if (keyframesRuleCallback && node.type === types.KEYFRAMES_RULE) {
    keyframesRuleCallback(node);
  } else if (node.type === types.MIXIN_RULE) {
    skipRules = true;
  }
  var r$ = node.rules;
  if (r$ && !skipRules) {
    for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
      forEachRule(r, styleRuleCallback, keyframesRuleCallback, onlyActiveRules);
    }
  }
}

// add a string of cssText to the document.
function applyCss(cssText, moniker, target, contextNode) {
  var style = createScopeStyle(cssText, moniker);
  return applyStyle$1(style, target, contextNode);
}

function applyStyle$1(style, target, contextNode) {
  target = target || document.head;
  var after = contextNode && contextNode.nextSibling || target.firstChild;
  lastHeadApplyNode = style;
  return target.insertBefore(style, after);
}

function createScopeStyle(cssText, moniker) {
  var style = document.createElement('style');
  if (moniker) {
    style.setAttribute('scope', moniker);
  }
  style.textContent = cssText;
  return style;
}

var lastHeadApplyNode = null;

// insert a comment node as a styling position placeholder.
function applyStylePlaceHolder(moniker) {
  var placeHolder = document.createComment(' Shady DOM styles for ' + moniker + ' ');
  var after = lastHeadApplyNode ? lastHeadApplyNode.nextSibling : null;
  var scope = document.head;
  scope.insertBefore(placeHolder, after || scope.firstChild);
  lastHeadApplyNode = placeHolder;
  return placeHolder;
}



// cssBuildTypeForModule: function (module) {
//   let dm = Polymer.DomModule.import(module);
//   if (dm) {
//     return getCssBuildType(dm);
//   }
// },
//


// Walk from text[start] matching parens
// returns position of the outer end paren
function findMatchingParen(text, start) {
  var level = 0;
  for (var i = start, l = text.length; i < l; i++) {
    if (text[i] === '(') {
      level++;
    } else if (text[i] === ')') {
      if (--level === 0) {
        return i;
      }
    }
  }
  return -1;
}

function processVariableAndFallback(str, callback) {
  // find 'var('
  var start = str.indexOf('var(');
  if (start === -1) {
    // no var?, everything is prefix
    return callback(str, '', '', '');
  }
  //${prefix}var(${inner})${suffix}
  var end = findMatchingParen(str, start + 3);
  var inner = str.substring(start + 4, end);
  var prefix = str.substring(0, start);
  // suffix may have other variables
  var suffix = processVariableAndFallback(str.substring(end + 1), callback);
  var comma = inner.indexOf(',');
  // value and fallback args should be trimmed to match in property lookup
  if (comma === -1) {
    // variable, no fallback
    return callback(prefix, inner.trim(), '', suffix);
  }
  // var(${value},${fallback})
  var value = inner.substring(0, comma).trim();
  var fallback = inner.substring(comma + 1).trim();
  return callback(prefix, value, fallback, suffix);
}

function setElementClassRaw(element, value) {
  // use native setAttribute provided by ShadyDOM when setAttribute is patched
  if (element.__nativeSetAttribute) {
    element.__nativeSetAttribute('class', value);
  } else {
    element.setAttribute('class', value);
  }
}

var rx = {
  VAR_ASSIGN: /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,
  MIXIN_MATCH: /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,
  VAR_CONSUMED: /(--[\w-]+)\s*([:,;)]|$)/gi,
  ANIMATION_MATCH: /(animation\s*:)|(animation-name\s*:)/,
  MEDIA_MATCH: /@media[^(]*(\([^)]*\))/,
  IS_VAR: /^--/,
  BRACKETED: /\{[^}]*\}/g,
  HOST_PREFIX: '(?:^|[^.#[:])',
  HOST_SUFFIX: '($|[.:[\\s>+~])'
};

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/* Transforms ShadowDOM styling into ShadyDOM styling

* scoping:

  * elements in scope get scoping selector class="x-foo-scope"
  * selectors re-written as follows:

    div button -> div.x-foo-scope button.x-foo-scope

* :host -> scopeName

* :host(...) -> scopeName...

* ::slotted(...) -> scopeName > ...

* ...:dir(ltr|rtl) -> [dir="ltr|rtl"] ..., ...[dir="ltr|rtl"]

* :host(:dir[rtl]) -> scopeName:dir(rtl) -> [dir="rtl"] scopeName, scopeName[dir="rtl"]

*/
var SCOPE_NAME = 'style-scope';

var StyleTransformer = {

  // Given a node and scope name, add a scoping class to each node
  // in the tree. This facilitates transforming css into scoped rules.
  dom: function dom(node, scope, shouldRemoveScope) {
    // one time optimization to skip scoping...
    if (node.__styleScoped) {
      node.__styleScoped = null;
    } else {
      this._transformDom(node, scope || '', shouldRemoveScope);
    }
  },

  _transformDom: function _transformDom(node, selector, shouldRemoveScope) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      this.element(node, selector, shouldRemoveScope);
    }
    var c$ = node.localName === 'template' ? (node.content || node._content).childNodes : node.children || node.childNodes;
    if (c$) {
      for (var i = 0; i < c$.length; i++) {
        this._transformDom(c$[i], selector, shouldRemoveScope);
      }
    }
  },

  element: function element(_element, scope, shouldRemoveScope) {
    // note: if using classes, we add both the general 'style-scope' class
    // as well as the specific scope. This enables easy filtering of all
    // `style-scope` elements
    if (scope) {
      // note: svg on IE does not have classList so fallback to class
      if (_element.classList) {
        if (shouldRemoveScope) {
          _element.classList.remove(SCOPE_NAME);
          _element.classList.remove(scope);
        } else {
          _element.classList.add(SCOPE_NAME);
          _element.classList.add(scope);
        }
      } else if (_element.getAttribute) {
        var c = _element.getAttribute(CLASS);
        if (shouldRemoveScope) {
          if (c) {
            var newValue = c.replace(SCOPE_NAME, '').replace(scope, '');
            setElementClassRaw(_element, newValue);
          }
        } else {
          var _newValue = (c ? c + ' ' : '') + SCOPE_NAME + ' ' + scope;
          setElementClassRaw(_element, _newValue);
        }
      }
    }
  },

  elementStyles: function elementStyles(element, styleRules, callback) {
    var cssBuildType = element.__cssBuild;
    // no need to shim selectors if settings.useNativeShadow, also
    // a shady css build will already have transformed selectors
    // NOTE: This method may be called as part of static or property shimming.
    // When there is a targeted build it will not be called for static shimming,
    // but when the property shim is used it is called and should opt out of
    // static shimming work when a proper build exists.
    var cssText = nativeShadow || cssBuildType === 'shady' ? toCssText(styleRules, callback) : this.css(styleRules, element.is, element.extends, callback) + '\n\n';
    return cssText.trim();
  },

  // Given a string of cssText and a scoping string (scope), returns
  // a string of scoped css where each selector is transformed to include
  // a class created from the scope. ShadowDOM selectors are also transformed
  // (e.g. :host) to use the scoping selector.
  css: function css(rules, scope, ext, callback) {
    var hostScope = this._calcHostScope(scope, ext);
    scope = this._calcElementScope(scope);
    var self = this;
    return toCssText(rules, function (rule) {
      if (!rule.isScoped) {
        self.rule(rule, scope, hostScope);
        rule.isScoped = true;
      }
      if (callback) {
        callback(rule, scope, hostScope);
      }
    });
  },

  _calcElementScope: function _calcElementScope(scope) {
    if (scope) {
      return CSS_CLASS_PREFIX + scope;
    } else {
      return '';
    }
  },

  _calcHostScope: function _calcHostScope(scope, ext) {
    return ext ? '[is=' + scope + ']' : scope;
  },

  rule: function rule(_rule, scope, hostScope) {
    this._transformRule(_rule, this._transformComplexSelector, scope, hostScope);
  },

  // transforms a css rule to a scoped rule.
  _transformRule: function _transformRule(rule, transformer, scope, hostScope) {
    // NOTE: save transformedSelector for subsequent matching of elements
    // against selectors (e.g. when calculating style properties)
    rule.selector = rule.transformedSelector = this._transformRuleCss(rule, transformer, scope, hostScope);
  },

  _transformRuleCss: function _transformRuleCss(rule, transformer, scope, hostScope) {
    var p$ = rule.selector.split(COMPLEX_SELECTOR_SEP);
    // we want to skip transformation of rules that appear in keyframes,
    // because they are keyframe selectors, not element selectors.
    if (!isKeyframesSelector(rule)) {
      for (var i = 0, l = p$.length, p; i < l && (p = p$[i]); i++) {
        p$[i] = transformer.call(this, p, scope, hostScope);
      }
    }
    return p$.join(COMPLEX_SELECTOR_SEP);
  },

  _transformComplexSelector: function _transformComplexSelector(selector, scope, hostScope) {
    var _this = this;

    var stop = false;
    selector = selector.trim();
    // Remove spaces inside of selectors like `:nth-of-type` because it confuses SIMPLE_SELECTOR_SEP
    selector = selector.replace(NTH, function (m, type, inner) {
      return ':' + type + '(' + inner.replace(/\s/g, '') + ')';
    });
    selector = selector.replace(SLOTTED_START, HOST + ' $1');
    selector = selector.replace(SIMPLE_SELECTOR_SEP, function (m, c, s) {
      if (!stop) {
        var info = _this._transformCompoundSelector(s, c, scope, hostScope);
        stop = stop || info.stop;
        c = info.combinator;
        s = info.value;
      }
      return c + s;
    });
    return selector;
  },

  _transformCompoundSelector: function _transformCompoundSelector(selector, combinator, scope, hostScope) {
    // replace :host with host scoping class
    var slottedIndex = selector.indexOf(SLOTTED);
    if (selector.indexOf(HOST) >= 0) {
      selector = this._transformHostSelector(selector, hostScope);
      // replace other selectors with scoping class
    } else if (slottedIndex !== 0) {
      selector = scope ? this._transformSimpleSelector(selector, scope) : selector;
    }
    // mark ::slotted() scope jump to replace with descendant selector + arg
    // also ignore left-side combinator
    var slotted = false;
    if (slottedIndex >= 0) {
      combinator = '';
      slotted = true;
    }
    // process scope jumping selectors up to the scope jump and then stop
    var stop = void 0;
    if (slotted) {
      stop = true;
      if (slotted) {
        // .zonk ::slotted(.foo) -> .zonk.scope > .foo
        selector = selector.replace(SLOTTED_PAREN, function (m, paren) {
          return ' > ' + paren;
        });
      }
    }
    selector = selector.replace(DIR_PAREN, function (m, before, dir) {
      return '[dir="' + dir + '"] ' + before + ', ' + before + '[dir="' + dir + '"]';
    });
    return { value: selector, combinator: combinator, stop: stop };
  },

  _transformSimpleSelector: function _transformSimpleSelector(selector, scope) {
    var p$ = selector.split(PSEUDO_PREFIX);
    p$[0] += scope;
    return p$.join(PSEUDO_PREFIX);
  },

  // :host(...) -> scopeName...
  _transformHostSelector: function _transformHostSelector(selector, hostScope) {
    var m = selector.match(HOST_PAREN);
    var paren = m && m[2].trim() || '';
    if (paren) {
      if (!paren[0].match(SIMPLE_SELECTOR_PREFIX)) {
        // paren starts with a type selector
        var typeSelector = paren.split(SIMPLE_SELECTOR_PREFIX)[0];
        // if the type selector is our hostScope then avoid pre-pending it
        if (typeSelector === hostScope) {
          return paren;
          // otherwise, this selector should not match in this scope so
          // output a bogus selector.
        } else {
          return SELECTOR_NO_MATCH;
        }
      } else {
        // make sure to do a replace here to catch selectors like:
        // `:host(.foo)::before`
        return selector.replace(HOST_PAREN, function (m, host, paren) {
          return hostScope + paren;
        });
      }
      // if no paren, do a straight :host replacement.
      // TODO(sorvell): this should not strictly be necessary but
      // it's needed to maintain support for `:host[foo]` type selectors
      // which have been improperly used under Shady DOM. This should be
      // deprecated.
    } else {
      return selector.replace(HOST, hostScope);
    }
  },

  documentRule: function documentRule(rule) {
    // reset selector in case this is redone.
    rule.selector = rule.parsedSelector;
    this.normalizeRootSelector(rule);
    this._transformRule(rule, this._transformDocumentSelector);
  },

  normalizeRootSelector: function normalizeRootSelector(rule) {
    if (rule.selector === ROOT) {
      rule.selector = 'html';
    }
  },

  _transformDocumentSelector: function _transformDocumentSelector(selector) {
    return selector.match(SLOTTED) ? this._transformComplexSelector(selector, SCOPE_DOC_SELECTOR) : this._transformSimpleSelector(selector.trim(), SCOPE_DOC_SELECTOR);
  },
  SCOPE_NAME: SCOPE_NAME
};

var NTH = /:(nth[-\w]+)\(([^)]+)\)/;
var SCOPE_DOC_SELECTOR = ':not(.' + SCOPE_NAME + ')';
var COMPLEX_SELECTOR_SEP = ',';
var SIMPLE_SELECTOR_SEP = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=\[])+)/g;
var SIMPLE_SELECTOR_PREFIX = /[[.:#*]/;
var HOST = ':host';
var ROOT = ':root';
var SLOTTED = '::slotted';
var SLOTTED_START = new RegExp('^(' + SLOTTED + ')');
// NOTE: this supports 1 nested () pair for things like
// :host(:not([selected]), more general support requires
// parsing which seems like overkill
var HOST_PAREN = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
// similar to HOST_PAREN
var SLOTTED_PAREN = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
var DIR_PAREN = /(.*):dir\((?:(ltr|rtl))\)/;
var CSS_CLASS_PREFIX = '.';
var PSEUDO_PREFIX = ':';
var CLASS = 'class';
var SELECTOR_NO_MATCH = 'should_not_match';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var StyleInfo = function () {
  createClass(StyleInfo, null, [{
    key: 'get',
    value: function get(node) {
      return node.__styleInfo;
    }
  }, {
    key: 'set',
    value: function set(node, styleInfo) {
      node.__styleInfo = styleInfo;
      return styleInfo;
    }
  }]);

  function StyleInfo(ast, placeholder, ownStylePropertyNames, elementName, typeExtension, cssBuild) {
    classCallCheck(this, StyleInfo);

    this.styleRules = ast || null;
    this.placeholder = placeholder || null;
    this.ownStylePropertyNames = ownStylePropertyNames || [];
    this.overrideStyleProperties = null;
    this.elementName = elementName || '';
    this.cssBuild = cssBuild || '';
    this.typeExtension = typeExtension || '';
    this.styleProperties = null;
    this.scopeSelector = null;
    this.customStyle = null;
  }

  return StyleInfo;
}();

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// TODO: dedupe with shady
var p = window.Element.prototype;
var matchesSelector = p.matches || p.matchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || p.webkitMatchesSelector;

var IS_IE = navigator.userAgent.match('Trident');

var StyleProperties = {

  // decorates styles with rule info and returns an array of used style
  // property names
  decorateStyles: function decorateStyles(rules) {
    var self = this,
        props = {},
        keyframes = [],
        ruleIndex = 0;
    forEachRule(rules, function (rule) {
      self.decorateRule(rule);
      // mark in-order position of ast rule in styles block, used for cache key
      rule.index = ruleIndex++;
      self.collectPropertiesInCssText(rule.propertyInfo.cssText, props);
    }, function onKeyframesRule(rule) {
      keyframes.push(rule);
    });
    // Cache all found keyframes rules for later reference:
    rules._keyframes = keyframes;
    // return this list of property names *consumes* in these styles.
    var names = [];
    for (var i in props) {
      names.push(i);
    }
    return names;
  },

  // decorate a single rule with property info
  decorateRule: function decorateRule(rule) {
    if (rule.propertyInfo) {
      return rule.propertyInfo;
    }
    var info = {},
        properties = {};
    var hasProperties = this.collectProperties(rule, properties);
    if (hasProperties) {
      info.properties = properties;
      // TODO(sorvell): workaround parser seeing mixins as additional rules
      rule.rules = null;
    }
    info.cssText = this.collectCssText(rule);
    rule.propertyInfo = info;
    return info;
  },

  // collects the custom properties from a rule's cssText
  collectProperties: function collectProperties(rule, properties) {
    var info = rule.propertyInfo;
    if (info) {
      if (info.properties) {
        Object.assign(properties, info.properties);
        return true;
      }
    } else {
      var m = void 0,
          rx$$1 = this.rx.VAR_ASSIGN;
      var cssText = rule.parsedCssText;
      var value = void 0;
      var any = void 0;
      while (m = rx$$1.exec(cssText)) {
        // note: group 2 is var, 3 is mixin
        value = (m[2] || m[3]).trim();
        // value of 'inherit' or 'unset' is equivalent to not setting the property here
        if (value !== 'inherit' || value !== 'unset') {
          properties[m[1].trim()] = value;
        }
        any = true;
      }
      return any;
    }
  },

  // returns cssText of properties that consume variables/mixins
  collectCssText: function collectCssText(rule) {
    return this.collectConsumingCssText(rule.parsedCssText);
  },

  // NOTE: we support consumption inside mixin assignment
  // but not production, so strip out {...}
  collectConsumingCssText: function collectConsumingCssText(cssText) {
    return cssText.replace(this.rx.BRACKETED, '').replace(this.rx.VAR_ASSIGN, '');
  },

  collectPropertiesInCssText: function collectPropertiesInCssText(cssText, props) {
    var m = void 0;
    while (m = this.rx.VAR_CONSUMED.exec(cssText)) {
      var name = m[1];
      // This regex catches all variable names, and following non-whitespace char
      // If next char is not ':', then variable is a consumer
      if (m[2] !== ':') {
        props[name] = true;
      }
    }
  },

  // turns custom properties into realized values.
  reify: function reify(props) {
    // big perf optimization here: reify only *own* properties
    // since this object has __proto__ of the element's scope properties
    var names = Object.getOwnPropertyNames(props);
    for (var i = 0, n; i < names.length; i++) {
      n = names[i];
      props[n] = this.valueForProperty(props[n], props);
    }
  },

  // given a property value, returns the reified value
  // a property value may be:
  // (1) a literal value like: red or 5px;
  // (2) a variable value like: var(--a), var(--a, red), or var(--a, --b) or
  // var(--a, var(--b));
  // (3) a literal mixin value like { properties }. Each of these properties
  // can have values that are: (a) literal, (b) variables, (c) @apply mixins.
  valueForProperty: function valueForProperty(property, props) {
    var _this = this;

    // case (1) default
    // case (3) defines a mixin and we have to reify the internals
    if (property) {
      if (property.indexOf(';') >= 0) {
        property = this.valueForProperties(property, props);
      } else {
        (function () {
          // case (2) variable
          var self = _this;
          var fn = function fn(prefix, value, fallback, suffix) {
            if (!value) {
              return prefix + suffix;
            }
            var propertyValue = self.valueForProperty(props[value], props);
            // if value is "initial", then the variable should be treated as unset
            if (!propertyValue || propertyValue === 'initial') {
              // fallback may be --a or var(--a) or literal
              propertyValue = self.valueForProperty(props[fallback] || fallback, props) || fallback;
            } else if (propertyValue === 'apply-shim-inherit') {
              // CSS build will replace `inherit` with `apply-shim-inherit`
              // for use with native css variables.
              // Since we have full control, we can use `inherit` directly.
              propertyValue = 'inherit';
            }
            return prefix + (propertyValue || '') + suffix;
          };
          property = processVariableAndFallback(property, fn);
        })();
      }
    }
    return property && property.trim() || '';
  },

  // note: we do not yet support mixin within mixin
  valueForProperties: function valueForProperties(property, props) {
    var parts = property.split(';');
    for (var i = 0, _p, m; i < parts.length; i++) {
      if (_p = parts[i]) {
        this.rx.MIXIN_MATCH.lastIndex = 0;
        m = this.rx.MIXIN_MATCH.exec(_p);
        if (m) {
          _p = this.valueForProperty(props[m[1]], props);
        } else {
          var colon = _p.indexOf(':');
          if (colon !== -1) {
            var pp = _p.substring(colon);
            pp = pp.trim();
            pp = this.valueForProperty(pp, props) || pp;
            _p = _p.substring(0, colon) + pp;
          }
        }
        parts[i] = _p && _p.lastIndexOf(';') === _p.length - 1 ?
        // strip trailing ;
        _p.slice(0, -1) : _p || '';
      }
    }
    return parts.join(';');
  },

  applyProperties: function applyProperties(rule, props) {
    var output = '';
    // dynamically added sheets may not be decorated so ensure they are.
    if (!rule.propertyInfo) {
      this.decorateRule(rule);
    }
    if (rule.propertyInfo.cssText) {
      output = this.valueForProperties(rule.propertyInfo.cssText, props);
    }
    rule.cssText = output;
  },

  // Apply keyframe transformations to the cssText of a given rule. The
  // keyframeTransforms object is a map of keyframe names to transformer
  // functions which take in cssText and spit out transformed cssText.
  applyKeyframeTransforms: function applyKeyframeTransforms(rule, keyframeTransforms) {
    var input = rule.cssText;
    var output = rule.cssText;
    if (rule.hasAnimations == null) {
      // Cache whether or not the rule has any animations to begin with:
      rule.hasAnimations = this.rx.ANIMATION_MATCH.test(input);
    }
    // If there are no animations referenced, we can skip transforms:
    if (rule.hasAnimations) {
      var transform = void 0;
      // If we haven't transformed this rule before, we iterate over all
      // transforms:
      if (rule.keyframeNamesToTransform == null) {
        rule.keyframeNamesToTransform = [];
        for (var keyframe in keyframeTransforms) {
          transform = keyframeTransforms[keyframe];
          output = transform(input);
          // If the transform actually changed the CSS text, we cache the
          // transform name for future use:
          if (input !== output) {
            input = output;
            rule.keyframeNamesToTransform.push(keyframe);
          }
        }
      } else {
        // If we already have a list of keyframe names that apply to this
        // rule, we apply only those keyframe name transforms:
        for (var i = 0; i < rule.keyframeNamesToTransform.length; ++i) {
          transform = keyframeTransforms[rule.keyframeNamesToTransform[i]];
          input = transform(input);
        }
        output = input;
      }
    }
    rule.cssText = output;
  },

  // Test if the rules in these styles matches the given `element` and if so,
  // collect any custom properties into `props`.
  propertyDataFromStyles: function propertyDataFromStyles(rules, element) {
    var props = {},
        self = this;
    // generates a unique key for these matches
    var o = [];
    // note: active rules excludes non-matching @media rules
    forEachRule(rules, function (rule) {
      // TODO(sorvell): we could trim the set of rules at declaration
      // time to only include ones that have properties
      if (!rule.propertyInfo) {
        self.decorateRule(rule);
      }
      // match element against transformedSelector: selector may contain
      // unwanted uniquification and parsedSelector does not directly match
      // for :host selectors.
      var selectorToMatch = rule.transformedSelector || rule.parsedSelector;
      if (element && rule.propertyInfo.properties && selectorToMatch) {
        if (matchesSelector.call(element, selectorToMatch)) {
          self.collectProperties(rule, props);
          // produce numeric key for these matches for lookup
          addToBitMask(rule.index, o);
        }
      }
    }, null, true);
    return { properties: props, key: o };
  },

  whenHostOrRootRule: function whenHostOrRootRule(scope, rule, cssBuild, callback) {
    if (!rule.propertyInfo) {
      this.decorateRule(rule);
    }
    if (!rule.propertyInfo.properties) {
      return;
    }
    var hostScope = scope.is ? StyleTransformer._calcHostScope(scope.is, scope.extends) : 'html';
    var parsedSelector = rule.parsedSelector;
    var isRoot = parsedSelector === ':host > *' || parsedSelector === 'html';
    var isHost = parsedSelector.indexOf(':host') === 0 && !isRoot;
    // build info is either in scope (when scope is an element) or in the style
    // when scope is the default scope; note: this allows default scope to have
    // mixed mode built and unbuilt styles.
    if (cssBuild === 'shady') {
      // :root -> x-foo > *.x-foo for elements and html for custom-style
      isRoot = parsedSelector === hostScope + ' > *.' + hostScope || parsedSelector.indexOf('html') !== -1;
      // :host -> x-foo for elements, but sub-rules have .x-foo in them
      isHost = !isRoot && parsedSelector.indexOf(hostScope) === 0;
    }
    if (cssBuild === 'shadow') {
      isRoot = parsedSelector === ':host > *' || parsedSelector === 'html';
      isHost = isHost && !isRoot;
    }
    if (!isRoot && !isHost) {
      return;
    }
    var selectorToMatch = hostScope;
    if (isHost) {
      // need to transform :host under ShadowDOM because `:host` does not work with `matches`
      if (nativeShadow && !rule.transformedSelector) {
        // transform :host into a matchable selector
        rule.transformedSelector = StyleTransformer._transformRuleCss(rule, StyleTransformer._transformComplexSelector, StyleTransformer._calcElementScope(scope.is), hostScope);
      }
      selectorToMatch = rule.transformedSelector || hostScope;
    }
    callback({
      selector: selectorToMatch,
      isHost: isHost,
      isRoot: isRoot
    });
  },

  hostAndRootPropertiesForScope: function hostAndRootPropertiesForScope(scope, rules) {
    var hostProps = {},
        rootProps = {},
        self = this;
    // note: active rules excludes non-matching @media rules
    var cssBuild = rules && rules.__cssBuild;
    forEachRule(rules, function (rule) {
      // if scope is StyleDefaults, use _element for matchesSelector
      self.whenHostOrRootRule(scope, rule, cssBuild, function (info) {
        var element = scope._element || scope;
        if (matchesSelector.call(element, info.selector)) {
          if (info.isHost) {
            self.collectProperties(rule, hostProps);
          } else {
            self.collectProperties(rule, rootProps);
          }
        }
      });
    }, null, true);
    return { rootProps: rootProps, hostProps: hostProps };
  },

  transformStyles: function transformStyles(element, properties, scopeSelector) {
    var self = this;
    var hostSelector = StyleTransformer._calcHostScope(element.is, element.extends);
    var rxHostSelector = element.extends ? '\\' + hostSelector.slice(0, -1) + '\\]' : hostSelector;
    var hostRx = new RegExp(this.rx.HOST_PREFIX + rxHostSelector + this.rx.HOST_SUFFIX);
    var rules = StyleInfo.get(element).styleRules;
    var keyframeTransforms = this._elementKeyframeTransforms(element, rules, scopeSelector);
    return StyleTransformer.elementStyles(element, rules, function (rule) {
      self.applyProperties(rule, properties);
      if (!nativeShadow && !isKeyframesSelector(rule) && rule.cssText) {
        // NOTE: keyframe transforms only scope munge animation names, so it
        // is not necessary to apply them in ShadowDOM.
        self.applyKeyframeTransforms(rule, keyframeTransforms);
        self._scopeSelector(rule, hostRx, hostSelector, scopeSelector);
      }
    });
  },

  _elementKeyframeTransforms: function _elementKeyframeTransforms(element, rules, scopeSelector) {
    var keyframesRules = rules._keyframes;
    var keyframeTransforms = {};
    if (!nativeShadow && keyframesRules) {
      // For non-ShadowDOM, we transform all known keyframes rules in
      // advance for the current scope. This allows us to catch keyframes
      // rules that appear anywhere in the stylesheet:
      for (var i = 0, keyframesRule = keyframesRules[i]; i < keyframesRules.length; keyframesRule = keyframesRules[++i]) {
        this._scopeKeyframes(keyframesRule, scopeSelector);
        keyframeTransforms[keyframesRule.keyframesName] = this._keyframesRuleTransformer(keyframesRule);
      }
    }
    return keyframeTransforms;
  },

  // Generate a factory for transforming a chunk of CSS text to handle a
  // particular scoped keyframes rule.
  _keyframesRuleTransformer: function _keyframesRuleTransformer(keyframesRule) {
    return function (cssText) {
      return cssText.replace(keyframesRule.keyframesNameRx, keyframesRule.transformedKeyframesName);
    };
  },

  // Transforms `@keyframes` names to be unique for the current host.
  // Example: @keyframes foo-anim -> @keyframes foo-anim-x-foo-0
  _scopeKeyframes: function _scopeKeyframes(rule, scopeId) {
    rule.keyframesNameRx = new RegExp(rule.keyframesName, 'g');
    rule.transformedKeyframesName = rule.keyframesName + '-' + scopeId;
    rule.transformedSelector = rule.transformedSelector || rule.selector;
    rule.selector = rule.transformedSelector.replace(rule.keyframesName, rule.transformedKeyframesName);
  },

  // Strategy: x scope shim a selector e.g. to scope `.x-foo-42` (via classes):
  // non-host selector: .a.x-foo -> .x-foo-42 .a.x-foo
  // host selector: x-foo.wide -> .x-foo-42.wide
  // note: we use only the scope class (.x-foo-42) and not the hostSelector
  // (x-foo) to scope :host rules; this helps make property host rules
  // have low specificity. They are overrideable by class selectors but,
  // unfortunately, not by type selectors (e.g. overriding via
  // `.special` is ok, but not by `x-foo`).
  _scopeSelector: function _scopeSelector(rule, hostRx, hostSelector, scopeId) {
    rule.transformedSelector = rule.transformedSelector || rule.selector;
    var selector = rule.transformedSelector;
    var scope = '.' + scopeId;
    var parts = selector.split(',');
    for (var i = 0, l = parts.length, _p2; i < l && (_p2 = parts[i]); i++) {
      parts[i] = _p2.match(hostRx) ? _p2.replace(hostSelector, scope) : scope + ' ' + _p2;
    }
    rule.selector = parts.join(',');
  },

  applyElementScopeSelector: function applyElementScopeSelector(element, selector, old) {
    var c = element.getAttribute('class') || '';
    var v = c;
    if (old) {
      v = c.replace(new RegExp('\\s*' + this.XSCOPE_NAME + '\\s*' + old + '\\s*', 'g'), ' ');
    }
    v += (v ? ' ' : '') + this.XSCOPE_NAME + ' ' + selector;
    if (c !== v) {
      // hook from ShadyDOM
      if (element.__nativeSetAttribute) {
        element.__nativeSetAttribute('class', v);
      } else {
        element.setAttribute('class', v);
      }
    }
  },

  applyElementStyle: function applyElementStyle(element, properties, selector, style) {
    // calculate cssText to apply
    var cssText = style ? style.textContent || '' : this.transformStyles(element, properties, selector);
    // if shady and we have a cached style that is not style, decrement
    var styleInfo = StyleInfo.get(element);
    var s = styleInfo.customStyle;
    if (s && !nativeShadow && s !== style) {
      s._useCount--;
      if (s._useCount <= 0 && s.parentNode) {
        s.parentNode.removeChild(s);
      }
    }
    // apply styling always under native or if we generated style
    // or the cached style is not in document(!)
    if (nativeShadow) {
      // update existing style only under native
      if (styleInfo.customStyle) {
        styleInfo.customStyle.textContent = cssText;
        style = styleInfo.customStyle;
        // otherwise, if we have css to apply, do so
      } else if (cssText) {
        // apply css after the scope style of the element to help with
        // style precedence rules.
        style = applyCss(cssText, selector, element.shadowRoot, styleInfo.placeholder);
      }
    } else {
      // shady and no cache hit
      if (!style) {
        // apply css after the scope style of the element to help with
        // style precedence rules.
        if (cssText) {
          style = applyCss(cssText, selector, null, styleInfo.placeholder);
        }
        // shady and cache hit but not in document
      } else if (!style.parentNode) {
        applyStyle$1(style, null, styleInfo.placeholder);
      }
    }
    // ensure this style is our custom style and increment its use count.
    if (style) {
      style._useCount = style._useCount || 0;
      // increment use count if we changed styles
      if (styleInfo.customStyle != style) {
        style._useCount++;
      }
      styleInfo.customStyle = style;
    }
    // @media rules may be stale in IE 10 and 11
    if (IS_IE) {
      style.textContent = style.textContent;
    }
    return style;
  },

  applyCustomStyle: function applyCustomStyle(style, properties) {
    var rules = rulesForStyle(style);
    var self = this;
    style.textContent = toCssText(rules, function (rule) {
      var css = rule.cssText = rule.parsedCssText;
      if (rule.propertyInfo && rule.propertyInfo.cssText) {
        // remove property assignments
        // so next function isn't confused
        // NOTE: we have 3 categories of css:
        // (1) normal properties,
        // (2) custom property assignments (--foo: red;),
        // (3) custom property usage: border: var(--foo); @apply(--foo);
        // In elements, 1 and 3 are separated for efficiency; here they
        // are not and this makes this case unique.
        css = removeCustomPropAssignment(css);
        // replace with reified properties, scenario is same as mixin
        rule.cssText = self.valueForProperties(css, properties);
      }
    });
  },

  rx: rx,
  XSCOPE_NAME: 'x-scope'
};

function addToBitMask(n, bits) {
  var o = parseInt(n / 32);
  var v = 1 << n % 32;
  bits[o] = (bits[o] || 0) | v;
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var templateMap = {};

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var placeholderMap = {};

var ce = window.customElements;
if (ce && !nativeShadow) {
  (function () {
    var origDefine = ce.define;
    ce.define = function (name, clazz, options) {
      placeholderMap[name] = applyStylePlaceHolder(name);
      return origDefine.call(ce, name, clazz, options);
    };
  })();
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
var StyleCache = function () {
  function StyleCache() {
    var typeMax = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
    classCallCheck(this, StyleCache);

    // map element name -> [{properties, styleElement, scopeSelector}]
    this.cache = {};
    this.typeMax = typeMax;
  }

  createClass(StyleCache, [{
    key: '_validate',
    value: function _validate(cacheEntry, properties, ownPropertyNames) {
      for (var idx = 0; idx < ownPropertyNames.length; idx++) {
        var pn = ownPropertyNames[idx];
        if (cacheEntry.properties[pn] !== properties[pn]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: 'store',
    value: function store(tagname, properties, styleElement, scopeSelector) {
      var list = this.cache[tagname] || [];
      list.push({ properties: properties, styleElement: styleElement, scopeSelector: scopeSelector });
      if (list.length > this.typeMax) {
        list.shift();
      }
      this.cache[tagname] = list;
    }
  }, {
    key: 'fetch',
    value: function fetch(tagname, properties, ownPropertyNames) {
      var list = this.cache[tagname];
      if (!list) {
        return;
      }
      // reverse list for most-recent lookups
      for (var idx = list.length - 1; idx >= 0; idx--) {
        var entry = list[idx];
        if (this._validate(entry, properties, ownPropertyNames)) {
          return entry;
        }
      }
    }
  }]);
  return StyleCache;
}();

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/**
 * The apply shim simulates the behavior of `@apply` proposed at
 * https://tabatkins.github.io/specs/css-apply-rule/.
 * The approach is to convert a property like this:
 *
 *    --foo: {color: red; background: blue;}
 *
 * to this:
 *
 *    --foo_-_color: red;
 *    --foo_-_background: blue;
 *
 * Then where `@apply --foo` is used, that is converted to:
 *
 *    color: var(--foo_-_color);
 *    background: var(--foo_-_background);
 *
 * This approach generally works but there are some issues and limitations.
 * Consider, for example, that somewhere *between* where `--foo` is set and used,
 * another element sets it to:
 *
 *    --foo: { border: 2px solid red; }
 *
 * We must now ensure that the color and background from the previous setting
 * do not apply. This is accomplished by changing the property set to this:
 *
 *    --foo_-_border: 2px solid red;
 *    --foo_-_color: initial;
 *    --foo_-_background: initial;
 *
 * This works but introduces one new issue.
 * Consider this setup at the point where the `@apply` is used:
 *
 *    background: orange;
 *    @apply --foo;
 *
 * In this case the background will be unset (initial) rather than the desired
 * `orange`. We address this by altering the property set to use a fallback
 * value like this:
 *
 *    color: var(--foo_-_color);
 *    background: var(--foo_-_background, orange);
 *    border: var(--foo_-_border);
 *
 * Note that the default is retained in the property set and the `background` is
 * the desired `orange`. This leads us to a limitation.
 *
 * Limitation 1:

 * Only properties in the rule where the `@apply`
 * is used are considered as default values.
 * If another rule matches the element and sets `background` with
 * less specificity than the rule in which `@apply` appears,
 * the `background` will not be set.
 *
 * Limitation 2:
 *
 * When using Polymer's `updateStyles` api, new properties may not be set for
 * `@apply` properties.

*/

var MIXIN_MATCH = rx.MIXIN_MATCH;
var VAR_ASSIGN = rx.VAR_ASSIGN;

var APPLY_NAME_CLEAN = /;\s*/m;
var INITIAL_INHERIT = /^\s*(initial)|(inherit)\s*$/;

// separator used between mixin-name and mixin-property-name when producing properties
// NOTE: plain '-' may cause collisions in user styles
var MIXIN_VAR_SEP = '_-_';

// map of mixin to property names
// --foo: {border: 2px} -> {properties: {(--foo, ['border'])}, dependants: {'element-name': proto}}

var MixinMap = function () {
  function MixinMap() {
    classCallCheck(this, MixinMap);

    this._map = {};
  }

  createClass(MixinMap, [{
    key: 'set',
    value: function set(name, props) {
      name = name.trim();
      this._map[name] = {
        properties: props,
        dependants: {}
      };
    }
  }, {
    key: 'get',
    value: function get(name) {
      name = name.trim();
      return this._map[name];
    }
  }]);
  return MixinMap;
}();

var ApplyShim = function () {
  function ApplyShim() {
    var _this = this;

    classCallCheck(this, ApplyShim);

    this._currentTemplate = null;
    this._measureElement = null;
    this._map = new MixinMap();
    this._separator = MIXIN_VAR_SEP;
    this._boundProduceCssProperties = function (matchText, propertyName, valueProperty, valueMixin) {
      return _this._produceCssProperties(matchText, propertyName, valueProperty, valueMixin);
    };
  }

  createClass(ApplyShim, [{
    key: 'transformStyle',
    value: function transformStyle(style, elementName) {
      var ast = rulesForStyle(style);
      this.transformRules(ast, elementName);
      return ast;
    }
  }, {
    key: 'transformRules',
    value: function transformRules(rules, elementName) {
      var _this2 = this;

      this._currentTemplate = templateMap[elementName];
      forEachRule(rules, function (r) {
        _this2.transformRule(r);
      });
      if (this._currentTemplate) {
        this._currentTemplate.__applyShimInvalid = false;
      }
      this._currentTemplate = null;
    }
  }, {
    key: 'transformRule',
    value: function transformRule(rule) {
      rule.cssText = this.transformCssText(rule.parsedCssText);
      // :root was only used for variable assignment in property shim,
      // but generates invalid selectors with real properties.
      // replace with `:host > *`, which serves the same effect
      if (rule.selector === ':root') {
        rule.selector = ':host > *';
      }
    }
  }, {
    key: 'transformCssText',
    value: function transformCssText(cssText) {
      // produce variables
      cssText = cssText.replace(VAR_ASSIGN, this._boundProduceCssProperties);
      // consume mixins
      return this._consumeCssProperties(cssText);
    }
  }, {
    key: '_getInitialValueForProperty',
    value: function _getInitialValueForProperty(property) {
      if (!this._measureElement) {
        this._measureElement = document.createElement('meta');
        this._measureElement.style.all = 'initial';
        document.head.appendChild(this._measureElement);
      }
      return window.getComputedStyle(this._measureElement).getPropertyValue(property);
    }
    // replace mixin consumption with variable consumption

  }, {
    key: '_consumeCssProperties',
    value: function _consumeCssProperties(text) {
      var m = void 0;
      // loop over text until all mixins with defintions have been applied
      while (m = MIXIN_MATCH.exec(text)) {
        var matchText = m[0];
        var mixinName = m[1];
        var idx = m.index;
        // collect properties before apply to be "defaults" if mixin might override them
        // match includes a "prefix", so find the start and end positions of @apply
        var applyPos = idx + matchText.indexOf('@apply');
        var afterApplyPos = idx + matchText.length;
        // find props defined before this @apply
        var textBeforeApply = text.slice(0, applyPos);
        var textAfterApply = text.slice(afterApplyPos);
        var defaults$$1 = this._cssTextToMap(textBeforeApply);
        var replacement = this._atApplyToCssProperties(mixinName, defaults$$1);
        // use regex match position to replace mixin, keep linear processing time
        text = [textBeforeApply, replacement, textAfterApply].join('');
        // move regex search to _after_ replacement
        MIXIN_MATCH.lastIndex = idx + replacement.length;
      }
      return text;
    }
    // produce variable consumption at the site of mixin consumption
    // @apply --foo; -> for all props (${propname}: var(--foo_-_${propname}, ${fallback[propname]}}))
    // Example:
    // border: var(--foo_-_border); padding: var(--foo_-_padding, 2px)

  }, {
    key: '_atApplyToCssProperties',
    value: function _atApplyToCssProperties(mixinName, fallbacks) {
      mixinName = mixinName.replace(APPLY_NAME_CLEAN, '');
      var vars = [];
      var mixinEntry = this._map.get(mixinName);
      // if we depend on a mixin before it is created
      // make a sentinel entry in the map to add this element as a dependency for when it is defined.
      if (!mixinEntry) {
        this._map.set(mixinName, {});
        mixinEntry = this._map.get(mixinName);
      }
      if (mixinEntry) {
        if (this._currentTemplate) {
          mixinEntry.dependants[this._currentTemplate.name] = this._currentTemplate;
        }
        var p = void 0,
            parts = void 0,
            f = void 0;
        for (p in mixinEntry.properties) {
          f = fallbacks && fallbacks[p];
          parts = [p, ': var(', mixinName, MIXIN_VAR_SEP, p];
          if (f) {
            parts.push(',', f);
          }
          parts.push(')');
          vars.push(parts.join(''));
        }
      }
      return vars.join('; ');
    }
  }, {
    key: '_replaceInitialOrInherit',
    value: function _replaceInitialOrInherit(property, value) {
      var match = INITIAL_INHERIT.exec(value);
      if (match) {
        if (match[1]) {
          // initial
          // replace `initial` with the concrete initial value for this property
          value = ApplyShim._getInitialValueForProperty(property);
        } else {
          // inherit
          // with this purposfully illegal value, the variable will be invalid at
          // compute time (https://www.w3.org/TR/css-variables/#invalid-at-computed-value-time)
          // and for inheriting values, will behave similarly
          // we cannot support the same behavior for non inheriting values like 'border'
          value = 'apply-shim-inherit';
        }
      }
      return value;
    }

    // "parse" a mixin definition into a map of properties and values
    // cssTextToMap('border: 2px solid black') -> ('border', '2px solid black')

  }, {
    key: '_cssTextToMap',
    value: function _cssTextToMap(text) {
      var props = text.split(';');
      var property = void 0,
          value = void 0;
      var out = {};
      for (var i = 0, p, sp; i < props.length; i++) {
        p = props[i];
        if (p) {
          sp = p.split(':');
          // ignore lines that aren't definitions like @media
          if (sp.length > 1) {
            property = sp[0].trim();
            // some properties may have ':' in the value, like data urls
            value = this._replaceInitialOrInherit(property, sp.slice(1).join(':'));
            out[property] = value;
          }
        }
      }
      return out;
    }
  }, {
    key: '_invalidateMixinEntry',
    value: function _invalidateMixinEntry(mixinEntry) {
      for (var elementName in mixinEntry.dependants) {
        if (elementName !== this._currentTemplate) {
          mixinEntry.dependants[elementName].__applyShimInvalid = true;
        }
      }
    }
  }, {
    key: '_produceCssProperties',
    value: function _produceCssProperties(matchText, propertyName, valueProperty, valueMixin) {
      var _this3 = this;

      // handle case where property value is a mixin
      if (valueProperty) {
        // form: --mixin2: var(--mixin1), where --mixin1 is in the map
        processVariableAndFallback(valueProperty, function (prefix, value) {
          if (value && _this3._map.get(value)) {
            valueMixin = '@apply ' + value + ';';
          }
        });
      }
      if (!valueMixin) {
        return matchText;
      }
      var mixinAsProperties = this._consumeCssProperties(valueMixin);
      var prefix = matchText.slice(0, matchText.indexOf('--'));
      var mixinValues = this._cssTextToMap(mixinAsProperties);
      var combinedProps = mixinValues;
      var mixinEntry = this._map.get(propertyName);
      var oldProps = mixinEntry && mixinEntry.properties;
      if (oldProps) {
        // NOTE: since we use mixin, the map of properties is updated here
        // and this is what we want.
        combinedProps = Object.assign(Object.create(oldProps), mixinValues);
      } else {
        this._map.set(propertyName, combinedProps);
      }
      var out = [];
      var p = void 0,
          v = void 0;
      // set variables defined by current mixin
      var needToInvalidate = false;
      for (p in combinedProps) {
        v = mixinValues[p];
        // if property not defined by current mixin, set initial
        if (v === undefined) {
          v = 'initial';
        }
        if (oldProps && !(p in oldProps)) {
          needToInvalidate = true;
        }
        out.push(propertyName + MIXIN_VAR_SEP + p + ': ' + v);
      }
      if (needToInvalidate) {
        this._invalidateMixinEntry(mixinEntry);
      }
      if (mixinEntry) {
        mixinEntry.properties = combinedProps;
      }
      // because the mixinMap is global, the mixin might conflict with
      // a different scope's simple variable definition:
      // Example:
      // some style somewhere:
      // --mixin1:{ ... }
      // --mixin2: var(--mixin1);
      // some other element:
      // --mixin1: 10px solid red;
      // --foo: var(--mixin1);
      // In this case, we leave the original variable definition in place.
      if (valueProperty) {
        prefix = matchText + ';' + prefix;
      }
      return prefix + out.join('; ') + ';';
    }
  }]);
  return ApplyShim;
}();

var applyShim = new ApplyShim();
window['ApplyShim'] = applyShim;

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var flush = function flush() {};

if (!nativeShadow) {
  (function () {
    var elementNeedsScoping = function elementNeedsScoping(element) {
      return element.classList && !element.classList.contains(StyleTransformer.SCOPE_NAME) ||
      // note: necessary for IE11
      element instanceof SVGElement && (!element.hasAttribute('class') || element.getAttribute('class').indexOf(StyleTransformer.SCOPE_NAME) < 0);
    };

    var handler = function handler(mxns) {
      for (var x = 0; x < mxns.length; x++) {
        var mxn = mxns[x];
        if (mxn.target === document.documentElement || mxn.target === document.head) {
          continue;
        }
        for (var i = 0; i < mxn.addedNodes.length; i++) {
          var n = mxn.addedNodes[i];
          if (elementNeedsScoping(n)) {
            var root = n.getRootNode();
            if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
              // may no longer be in a shadowroot
              var host = root.host;
              if (host) {
                var scope = host.is || host.localName;
                StyleTransformer.dom(n, scope);
              }
            }
          }
        }
        for (var _i = 0; _i < mxn.removedNodes.length; _i++) {
          var _n = mxn.removedNodes[_i];
          if (_n.nodeType === Node.ELEMENT_NODE) {
            var classes = undefined;
            if (_n.classList) {
              classes = Array.from(_n.classList);
            } else if (_n.hasAttribute('class')) {
              classes = _n.getAttribute('class').split(/\s+/);
            }
            if (classes !== undefined) {
              // NOTE: relies on the scoping class always being adjacent to the
              // SCOPE_NAME class.
              var classIdx = classes.indexOf(StyleTransformer.SCOPE_NAME);
              if (classIdx >= 0) {
                var _scope = classes[classIdx + 1];
                if (_scope) {
                  StyleTransformer.dom(_n, _scope, true);
                }
              }
            }
          }
        }
      }
    };

    var observer = new MutationObserver(handler);
    var start = function start(node) {
      observer.observe(node, { childList: true, subtree: true });
    };
    var nativeCustomElements = window.customElements && !window.customElements.flush;
    // need to start immediately with native custom elements
    // TODO(dfreedm): with polyfilled HTMLImports and native custom elements
    // excessive mutations may be observed; this can be optimized via cooperation
    // with the HTMLImports polyfill.
    if (nativeCustomElements) {
      start(document);
    } else {
      (function () {
        var delayedStart = function delayedStart() {
          start(document.body);
        };
        // use polyfill timing if it's available
        if (window.HTMLImports) {
          window.HTMLImports.whenReady(delayedStart);
          // otherwise push beyond native imports being ready
          // which requires RAF + readystate interactive.
        } else {
          requestAnimationFrame(function () {
            if (document.readyState === 'loading') {
              (function () {
                var listener = function listener() {
                  delayedStart();
                  document.removeEventListener('readystatechange', listener);
                };
                document.addEventListener('readystatechange', listener);
              })();
            } else {
              delayedStart();
            }
          });
        }
      })();
    }

    flush = function flush() {
      handler(observer.takeRecords());
    };
  })();
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// TODO(dfreedm): consider spliting into separate global
var styleCache = new StyleCache();

var ShadyCSS = {
  flush: flush,
  scopeCounter: {},
  nativeShadow: nativeShadow,
  nativeCss: nativeCssVariables,
  nativeCssApply: nativeCssApply,
  _documentOwner: document.documentElement,
  _documentOwnerStyleInfo: StyleInfo.set(document.documentElement, new StyleInfo({ rules: [] })),
  _generateScopeSelector: function _generateScopeSelector(name) {
    var id = this.scopeCounter[name] = (this.scopeCounter[name] || 0) + 1;
    return name + '-' + id;
  },
  getStyleAst: function getStyleAst(style) {
    return rulesForStyle(style);
  },
  styleAstToString: function styleAstToString(ast) {
    return toCssText(ast);
  },
  _gatherStyles: function _gatherStyles(template) {
    var styles = template.content.querySelectorAll('style');
    var cssText = [];
    for (var i = 0; i < styles.length; i++) {
      var s = styles[i];
      cssText.push(s.textContent);
      s.parentNode.removeChild(s);
    }
    return cssText.join('').trim();
  },
  _getCssBuild: function _getCssBuild(template) {
    var style = template.content.querySelector('style');
    if (!style) {
      return '';
    }
    return style.getAttribute('css-build') || '';
  },
  prepareTemplate: function prepareTemplate(template, elementName, typeExtension) {
    if (template._prepared) {
      return;
    }
    template._prepared = true;
    template.name = elementName;
    template.extends = typeExtension;
    templateMap[elementName] = template;
    var cssBuild = this._getCssBuild(template);
    var cssText = this._gatherStyles(template);
    var info = {
      is: elementName,
      extends: typeExtension,
      __cssBuild: cssBuild
    };
    if (!this.nativeShadow) {
      StyleTransformer.dom(template.content, elementName);
    }
    var ast = parse(cssText);
    if (this.nativeCss && !this.nativeCssApply) {
      applyShim.transformRules(ast, elementName);
    }
    template._styleAst = ast;

    var ownPropertyNames = [];
    if (!this.nativeCss) {
      ownPropertyNames = StyleProperties.decorateStyles(template._styleAst, info);
    }
    if (!ownPropertyNames.length || this.nativeCss) {
      var root = this.nativeShadow ? template.content : null;
      var placeholder = placeholderMap[elementName];
      var style = this._generateStaticStyle(info, template._styleAst, root, placeholder);
      template._style = style;
    }
    template._ownPropertyNames = ownPropertyNames;
  },
  _generateStaticStyle: function _generateStaticStyle(info, rules, shadowroot, placeholder) {
    var cssText = StyleTransformer.elementStyles(info, rules);
    if (cssText.length) {
      return applyCss(cssText, info.is, shadowroot, placeholder);
    }
  },
  _prepareHost: function _prepareHost(host) {
    var is = host.getAttribute('is') || host.localName;
    var typeExtension = void 0;
    if (is !== host.localName) {
      typeExtension = host.localName;
    }
    var placeholder = placeholderMap[is];
    var template = templateMap[is];
    var ast = void 0;
    var ownStylePropertyNames = void 0;
    var cssBuild = void 0;
    if (template) {
      ast = template._styleAst;
      ownStylePropertyNames = template._ownPropertyNames;
      cssBuild = template._cssBuild;
    }
    return StyleInfo.set(host, new StyleInfo(ast, placeholder, ownStylePropertyNames, is, typeExtension, cssBuild));
  },
  applyStyle: function applyStyle(host, overrideProps) {
    var is = host.getAttribute('is') || host.localName;
    if (window.CustomStyle) {
      var CS = window.CustomStyle;
      if (CS._documentDirty) {
        CS.findStyles();
        if (!this.nativeCss) {
          this._updateProperties(this._documentOwner, this._documentOwnerStyleInfo);
        } else if (!this.nativeCssApply) {
          CS._revalidateApplyShim();
        }
        CS.applyStyles();
        CS._documentDirty = false;
      }
    }
    var styleInfo = StyleInfo.get(host);
    var hasApplied = Boolean(styleInfo);
    if (!styleInfo) {
      styleInfo = this._prepareHost(host);
    }
    if (overrideProps) {
      styleInfo.overrideStyleProperties = styleInfo.overrideStyleProperties || {};
      Object.assign(styleInfo.overrideStyleProperties, overrideProps);
    }
    if (this.nativeCss) {
      var template = templateMap[is];
      if (template && template.__applyShimInvalid && template._style) {
        // update template
        applyShim.transformRules(template._styleAst, is);
        template._style.textContent = StyleTransformer.elementStyles(host, styleInfo.styleRules);
        // update instance if native shadowdom
        if (this.nativeShadow) {
          var style = host.shadowRoot.querySelector('style');
          style.textContent = StyleTransformer.elementStyles(host, styleInfo.styleRules);
        }
        styleInfo.styleRules = template._styleAst;
      }
      this._updateNativeProperties(host, styleInfo.overrideStyleProperties);
    } else {
      this._updateProperties(host, styleInfo);
      if (styleInfo.ownStylePropertyNames && styleInfo.ownStylePropertyNames.length) {
        // TODO: use caching
        this._applyStyleProperties(host, styleInfo);
      }
    }
    if (hasApplied) {
      var root = this._isRootOwner(host) ? host : host.shadowRoot;
      // note: some elements may not have a root!
      if (root) {
        this._applyToDescendants(root);
      }
    }
  },
  _applyToDescendants: function _applyToDescendants(root) {
    var c$ = root.children;
    for (var i = 0, c; i < c$.length; i++) {
      c = c$[i];
      if (c.shadowRoot) {
        this.applyStyle(c);
      }
      this._applyToDescendants(c);
    }
  },
  _styleOwnerForNode: function _styleOwnerForNode(node) {
    var root = node.getRootNode();
    var host = root.host;
    if (host) {
      if (StyleInfo.get(host)) {
        return host;
      } else {
        return this._styleOwnerForNode(host);
      }
    }
    return this._documentOwner;
  },
  _isRootOwner: function _isRootOwner(node) {
    return node === this._documentOwner;
  },
  _applyStyleProperties: function _applyStyleProperties(host, styleInfo) {
    var is = host.getAttribute('is') || host.localName;
    var cacheEntry = styleCache.fetch(is, styleInfo.styleProperties, styleInfo.ownStylePropertyNames);
    var cachedScopeSelector = cacheEntry && cacheEntry.scopeSelector;
    var cachedStyle = cacheEntry ? cacheEntry.styleElement : null;
    var oldScopeSelector = styleInfo.scopeSelector;
    // only generate new scope if cached style is not found
    styleInfo.scopeSelector = cachedScopeSelector || this._generateScopeSelector(is);
    var style = StyleProperties.applyElementStyle(host, styleInfo.styleProperties, styleInfo.scopeSelector, cachedStyle);
    if (!this.nativeShadow) {
      StyleProperties.applyElementScopeSelector(host, styleInfo.scopeSelector, oldScopeSelector);
    }
    if (!cacheEntry) {
      styleCache.store(is, styleInfo.styleProperties, style, styleInfo.scopeSelector);
    }
    return style;
  },
  _updateProperties: function _updateProperties(host, styleInfo) {
    var owner = this._styleOwnerForNode(host);
    var ownerStyleInfo = StyleInfo.get(owner);
    var ownerProperties = ownerStyleInfo.styleProperties;
    var props = Object.create(ownerProperties || null);
    var hostAndRootProps = StyleProperties.hostAndRootPropertiesForScope(host, styleInfo.styleRules);
    var propertyData = StyleProperties.propertyDataFromStyles(ownerStyleInfo.styleRules, host);
    var propertiesMatchingHost = propertyData.properties;
    Object.assign(props, hostAndRootProps.hostProps, propertiesMatchingHost, hostAndRootProps.rootProps);
    this._mixinOverrideStyles(props, styleInfo.overrideStyleProperties);
    StyleProperties.reify(props);
    styleInfo.styleProperties = props;
  },
  _mixinOverrideStyles: function _mixinOverrideStyles(props, overrides) {
    for (var p in overrides) {
      var v = overrides[p];
      // skip override props if they are not truthy or 0
      // in order to fall back to inherited values
      if (v || v === 0) {
        props[p] = v;
      }
    }
  },
  _updateNativeProperties: function _updateNativeProperties(element, properties) {
    // remove previous properties
    for (var p in properties) {
      // NOTE: for bc with shim, don't apply null values.
      if (p === null) {
        element.style.removeProperty(p);
      } else {
        element.style.setProperty(p, properties[p]);
      }
    }
  },
  updateStyles: function updateStyles(properties) {
    if (window.CustomStyle) {
      window.CustomStyle._documentDirty = true;
    }
    this.applyStyle(this._documentOwner, properties);
  },

  /* Custom Style operations */
  _transformCustomStyleForDocument: function _transformCustomStyleForDocument(style) {
    var _this = this;

    var ast = rulesForStyle(style);
    forEachRule(ast, function (rule) {
      if (nativeShadow) {
        StyleTransformer.normalizeRootSelector(rule);
      } else {
        StyleTransformer.documentRule(rule);
      }
      if (_this.nativeCss && !_this.nativeCssApply) {
        applyShim.transformRule(rule);
      }
    });
    if (this.nativeCss) {
      style.textContent = toCssText(ast);
    } else {
      this._documentOwnerStyleInfo.styleRules.rules.push(ast);
    }
  },
  _revalidateApplyShim: function _revalidateApplyShim(style) {
    if (this.nativeCss && !this.nativeCssApply) {
      var ast = rulesForStyle(style);
      applyShim.transformRules(ast);
      style.textContent = toCssText(ast);
    }
  },
  _applyCustomStyleToDocument: function _applyCustomStyleToDocument(style) {
    if (!this.nativeCss) {
      StyleProperties.applyCustomStyle(style, this._documentOwnerStyleInfo.styleProperties);
    }
  },
  getComputedStyleValue: function getComputedStyleValue(element, property) {
    var value = void 0;
    if (!this.nativeCss) {
      // element is either a style host, or an ancestor of a style host
      var styleInfo = StyleInfo.get(element) || StyleInfo.get(this._styleOwnerForNode(element));
      value = styleInfo.styleProperties[property];
    }
    // fall back to the property value from the computed styling
    value = value || window.getComputedStyle(element).getPropertyValue(property);
    // trim whitespace that can come after the `:` in css
    // example: padding: 2px -> " 2px"
    return value.trim();
  },

  // given an element and a classString, replaces
  // the element's class with the provided classString and adds
  // any necessary ShadyCSS static and property based scoping selectors
  setElementClass: function setElementClass(element, classString) {
    var root = element.getRootNode();
    var classes = classString ? classString.split(/\s/) : [];
    var scopeName = root.host && root.host.localName;
    // If no scope, try to discover scope name from existing class.
    // This can occur if, for example, a template stamped element that
    // has been scoped is manipulated when not in a root.
    if (!scopeName) {
      var classAttr = element.getAttribute('class');
      if (classAttr) {
        var k$ = classAttr.split(/\s/);
        for (var i = 0; i < k$.length; i++) {
          if (k$[i] === StyleTransformer.SCOPE_NAME) {
            scopeName = k$[i + 1];
            break;
          }
        }
      }
    }
    if (scopeName) {
      classes.push(StyleTransformer.SCOPE_NAME, scopeName);
    }
    if (!this.nativeCss) {
      var styleInfo = StyleInfo.get(element);
      if (styleInfo && styleInfo.scopeSelector) {
        classes.push(StyleProperties.XSCOPE_NAME, styleInfo.scopeSelector);
      }
    }
    setElementClassRaw(element, classes.join(' '));
  },
  _styleInfoForNode: function _styleInfoForNode(node) {
    return StyleInfo.get(node);
  }
};

window['ShadyCSS'] = ShadyCSS;

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
Wrapper over <style> elements to co-operate with ShadyCSS

Example:
<shady-style>
  <style>
  ...
  </style>
</shady-style>
*/

var ShadyCSS$1 = window.ShadyCSS;

var enqueued = false;

var customStyles = [];

var hookFn = null;

/*
If a page only has <custom-style> elements, it will flash unstyled content,
as all the instances will boot asynchronously after page load.

Calling ShadyCSS.updateStyles() will force the work to happen synchronously
*/
function enqueueDocumentValidation() {
  if (enqueued) {
    return;
  }
  enqueued = true;
  if (window.HTMLImports) {
    window.HTMLImports.whenReady(validateDocument);
  } else if (document.readyState === 'complete') {
    validateDocument();
  } else {
    document.addEventListener('readystatechange', function () {
      if (document.readyState === 'complete') {
        validateDocument();
      }
    });
  }
}

function validateDocument() {
  requestAnimationFrame(function () {
    if (enqueued) {
      ShadyCSS$1.updateStyles();
      enqueued = false;
    }
  });
}

function CustomStyle() {
  /*
  Use Reflect to invoke the HTMLElement constructor, or rely on the
  CustomElement polyfill replacement that can be `.call`ed
  */
  var self = window.Reflect && Reflect.construct ? Reflect.construct(HTMLElement, [], this.constructor || CustomStyle) : HTMLElement.call(this);
  customStyles.push(self);
  enqueueDocumentValidation();
  return self;
}

Object.defineProperties(CustomStyle, {
  /*
  CustomStyle.processHook is provided to customize the <style> element child of
  a <custom-style> element before the <style> is processed by ShadyCSS
   The function must take a <style> element as input, and return nothing.
  */
  processHook: {
    get: function get() {
      return hookFn;
    },
    set: function set(fn) {
      hookFn = fn;
      return fn;
    }
  },
  _customStyles: {
    get: function get() {
      return customStyles;
    }
  },
  _documentDirty: {
    get: function get() {
      return enqueued;
    },
    set: function set(value) {
      enqueued = value;
      return value;
    }
  }
});

CustomStyle.findStyles = function () {
  for (var i = 0; i < customStyles.length; i++) {
    customStyles[i]._findStyle();
  }
};

CustomStyle._revalidateApplyShim = function () {
  for (var i = 0; i < customStyles.length; i++) {
    var s = customStyles[i];
    if (s._style) {
      ShadyCSS$1._revalidateApplyShim(s._style);
    }
  }
};

CustomStyle.applyStyles = function () {
  for (var i = 0; i < customStyles.length; i++) {
    customStyles[i]._applyStyle();
  }
};

CustomStyle.prototype = Object.create(HTMLElement.prototype, {
  'constructor': {
    value: CustomStyle,
    configurable: true,
    writable: true
  }
});

CustomStyle.prototype._findStyle = function () {
  if (!this._style) {
    var style = this.querySelector('style');
    if (!style) {
      return;
    }
    // HTMLImports polyfill may have cloned the style into the main document,
    // which is referenced with __appliedElement.
    // Also, we must copy over the attributes.
    if (style.__appliedElement) {
      for (var i = 0; i < style.attributes.length; i++) {
        var attr = style.attributes[i];
        style.__appliedElement.setAttribute(attr.name, attr.value);
      }
    }
    this._style = style.__appliedElement || style;
    if (hookFn) {
      hookFn(this._style);
    }
    ShadyCSS$1._transformCustomStyleForDocument(this._style);
  }
};

CustomStyle.prototype._applyStyle = function () {
  if (this._style) {
    ShadyCSS$1._applyCustomStyleToDocument(this._style);
  }
};

window.customElements.define('custom-style', CustomStyle);
window['CustomStyle'] = CustomStyle;

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/*
Small module to load ShadyCSS and CustomStyle together
*/

}());

const isFunction = val => typeof val === 'function';
const isObject = val => (typeof val === 'object' && val !== null);
const isString = val => typeof val === 'string';
const isSymbol = val => typeof val === 'symbol';
const isUndefined = val => typeof val === 'undefined';

/**
 * Returns array of owned property names and symbols for the given object
 */
function getPropNamesAndSymbols (obj = {}) {
  const listOfKeys = Object.getOwnPropertyNames(obj);
  return isFunction(Object.getOwnPropertySymbols)
    ? listOfKeys.concat(Object.getOwnPropertySymbols(obj))
    : listOfKeys;
}

// We are not using Object.assign if it is defined since it will cause problems when Symbol is polyfilled.
// Apparently Object.assign (or any polyfill for this method) does not copy non-native Symbols.
var assign = (obj, ...args) => {
  args.forEach(arg => getPropNamesAndSymbols(arg).forEach(nameOrSymbol => obj[nameOrSymbol] = arg[nameOrSymbol])); // eslint-disable-line no-return-assign
  return obj;
};

var empty = function (val) {
  return typeof val === 'undefined' || val === null;
};

/**
 * Attributes value can only be null or string;
 */
const toNullOrString = val => (empty(val) ? null : String(val));

const connected = '____skate_connected';
const created = '____skate_created';

// DEPRECATED
//
// This is the only "symbol" that must stay a string. This is because it is
// relied upon across several versions. We should remove it, but ensure that
// it's considered a breaking change that whatever version removes it cannot
// be passed to vdom functions as tag names.
const name = '____skate_name';

// Used on the Constructor
const ctorCreateInitProps = '____skate_ctor_createInitProps';
const ctorObservedAttributes = '____skate_ctor_observedAttributes';
const ctorProps = '____skate_ctor_props';
const ctorPropsMap = '____skate_ctor_propsMap';

// Used on the Element
const props = '____skate_props';
const ref = '____skate_ref';
const renderer = '____skate_renderer';
const rendering = '____skate_rendering';
const rendererDebounced = '____skate_rendererDebounced';
const updated = '____skate_updated';

// DEPRECTAED
//
// We should not be relying on internals for symbols as this creates version
// coupling. We will move forward with platform agnostic ways of doing this.

/**
 * @license
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A cached reference to the hasOwnProperty function.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * A cached reference to the create function.
 */
var create$1 = Object.create;

/**
 * Used to prevent property collisions between our "map" and its prototype.
 * @param {!Object<string, *>} map The map to check.
 * @param {string} property The property to check.
 * @return {boolean} Whether map has property.
 */
var has = function (map, property) {
  return hasOwnProperty.call(map, property);
};

/**
 * Creates an map object without a prototype.
 * @return {!Object}
 */
var createMap = function () {
  return create$1(null);
};

/**
 * Keeps track of information needed to perform diffs for a given DOM node.
 * @param {!string} nodeName
 * @param {?string=} key
 * @constructor
 */
function NodeData(nodeName, key) {
  /**
   * The attributes and their values.
   * @const {!Object<string, *>}
   */
  this.attrs = createMap();

  /**
   * An array of attribute name/value pairs, used for quickly diffing the
   * incomming attributes to see if the DOM node's attributes need to be
   * updated.
   * @const {Array<*>}
   */
  this.attrsArr = [];

  /**
   * The incoming attributes for this Node, before they are updated.
   * @const {!Object<string, *>}
   */
  this.newAttrs = createMap();

  /**
   * The key used to identify this node, used to preserve DOM nodes when they
   * move within their parent.
   * @const
   */
  this.key = key;

  /**
   * Keeps track of children within this node by their key.
   * {?Object<string, !Element>}
   */
  this.keyMap = null;

  /**
   * Whether or not the keyMap is currently valid.
   * {boolean}
   */
  this.keyMapValid = true;

  /**
   * The node name for this node.
   * @const {string}
   */
  this.nodeName = nodeName;

  /**
   * @type {?string}
   */
  this.text = null;
}

/**
 * Initializes a NodeData object for a Node.
 *
 * @param {Node} node The node to initialize data for.
 * @param {string} nodeName The node name of node.
 * @param {?string=} key The key that identifies the node.
 * @return {!NodeData} The newly initialized data object
 */
var initData = function (node, nodeName, key) {
  var data = new NodeData(nodeName, key);
  node['__incrementalDOMData'] = data;
  return data;
};

/**
 * Retrieves the NodeData object for a Node, creating it if necessary.
 *
 * @param {Node} node The node to retrieve the data for.
 * @return {!NodeData} The NodeData for this Node.
 */
var getData = function (node) {
  var data = node['__incrementalDOMData'];

  if (!data) {
    var nodeName = node.nodeName.toLowerCase();
    var key = null;

    if (node instanceof Element) {
      key = node.getAttribute('key');
    }

    data = initData(node, nodeName, key);
  }

  return data;
};

/**
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const */
var symbols = {
  default: '__default',

  placeholder: '__placeholder'
};

/**
 * @param {string} name
 * @return {string|undefined} The namespace to use for the attribute.
 */
var getNamespace = function (name) {
  if (name.lastIndexOf('xml:', 0) === 0) {
    return 'http://www.w3.org/XML/1998/namespace';
  }

  if (name.lastIndexOf('xlink:', 0) === 0) {
    return 'http://www.w3.org/1999/xlink';
  }
};

/**
 * Applies an attribute or property to a given Element. If the value is null
 * or undefined, it is removed from the Element. Otherwise, the value is set
 * as an attribute.
 * @param {!Element} el
 * @param {string} name The attribute's name.
 * @param {?(boolean|number|string)=} value The attribute's value.
 */
var applyAttr = function (el, name, value) {
  if (value == null) {
    el.removeAttribute(name);
  } else {
    var attrNS = getNamespace(name);
    if (attrNS) {
      el.setAttributeNS(attrNS, name, value);
    } else {
      el.setAttribute(name, value);
    }
  }
};

/**
 * Applies a property to a given Element.
 * @param {!Element} el
 * @param {string} name The property's name.
 * @param {*} value The property's value.
 */
var applyProp = function (el, name, value) {
  el[name] = value;
};

/**
 * Applies a style to an Element. No vendor prefix expansion is done for
 * property names/values.
 * @param {!Element} el
 * @param {string} name The attribute's name.
 * @param {*} style The style to set. Either a string of css or an object
 *     containing property-value pairs.
 */
var applyStyle$1 = function (el, name, style) {
  if (typeof style === 'string') {
    el.style.cssText = style;
  } else {
    el.style.cssText = '';
    var elStyle = el.style;
    var obj = /** @type {!Object<string,string>} */style;

    for (var prop in obj) {
      if (has(obj, prop)) {
        elStyle[prop] = obj[prop];
      }
    }
  }
};

/**
 * Updates a single attribute on an Element.
 * @param {!Element} el
 * @param {string} name The attribute's name.
 * @param {*} value The attribute's value. If the value is an object or
 *     function it is set on the Element, otherwise, it is set as an HTML
 *     attribute.
 */
var applyAttributeTyped = function (el, name, value) {
  var type = typeof value;

  if (type === 'object' || type === 'function') {
    applyProp(el, name, value);
  } else {
    applyAttr(el, name, /** @type {?(boolean|number|string)} */value);
  }
};

/**
 * Calls the appropriate attribute mutator for this attribute.
 * @param {!Element} el
 * @param {string} name The attribute's name.
 * @param {*} value The attribute's value.
 */
var updateAttribute = function (el, name, value) {
  var data = getData(el);
  var attrs = data.attrs;

  if (attrs[name] === value) {
    return;
  }

  var mutator = attributes[name] || attributes[symbols.default];
  mutator(el, name, value);

  attrs[name] = value;
};

/**
 * A publicly mutable object to provide custom mutators for attributes.
 * @const {!Object<string, function(!Element, string, *)>}
 */
var attributes = createMap();

// Special generic mutator that's called for any attribute that does not
// have a specific mutator.
attributes[symbols.default] = applyAttributeTyped;

attributes[symbols.placeholder] = function () {};

attributes['style'] = applyStyle$1;

/**
 * Gets the namespace to create an element (of a given tag) in.
 * @param {string} tag The tag to get the namespace for.
 * @param {?Node} parent
 * @return {?string} The namespace to create the tag in.
 */
var getNamespaceForTag = function (tag, parent) {
  if (tag === 'svg') {
    return 'http://www.w3.org/2000/svg';
  }

  if (getData(parent).nodeName === 'foreignObject') {
    return null;
  }

  return parent.namespaceURI;
};

/**
 * Creates an Element.
 * @param {Document} doc The document with which to create the Element.
 * @param {?Node} parent
 * @param {string} tag The tag for the Element.
 * @param {?string=} key A key to identify the Element.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element.
 * @return {!Element}
 */
var createElement = function (doc, parent, tag, key, statics) {
  var namespace = getNamespaceForTag(tag, parent);
  var el = undefined;

  if (namespace) {
    el = doc.createElementNS(namespace, tag);
  } else {
    el = doc.createElement(tag);
  }

  initData(el, tag, key);

  if (statics) {
    for (var i = 0; i < statics.length; i += 2) {
      updateAttribute(el, /** @type {!string}*/statics[i], statics[i + 1]);
    }
  }

  return el;
};

/**
 * Creates a Text Node.
 * @param {Document} doc The document with which to create the Element.
 * @return {!Text}
 */
var createText = function (doc) {
  var node = doc.createTextNode('');
  initData(node, '#text', null);
  return node;
};

/**
 * Creates a mapping that can be used to look up children using a key.
 * @param {?Node} el
 * @return {!Object<string, !Element>} A mapping of keys to the children of the
 *     Element.
 */
var createKeyMap = function (el) {
  var map = createMap();
  var child = el.firstElementChild;

  while (child) {
    var key = getData(child).key;

    if (key) {
      map[key] = child;
    }

    child = child.nextElementSibling;
  }

  return map;
};

/**
 * Retrieves the mapping of key to child node for a given Element, creating it
 * if necessary.
 * @param {?Node} el
 * @return {!Object<string, !Node>} A mapping of keys to child Elements
 */
var getKeyMap = function (el) {
  var data = getData(el);

  if (!data.keyMap) {
    data.keyMap = createKeyMap(el);
  }

  return data.keyMap;
};

/**
 * Retrieves a child from the parent with the given key.
 * @param {?Node} parent
 * @param {?string=} key
 * @return {?Node} The child corresponding to the key.
 */
var getChild = function (parent, key) {
  return key ? getKeyMap(parent)[key] : null;
};

/**
 * Registers an element as being a child. The parent will keep track of the
 * child using the key. The child can be retrieved using the same key using
 * getKeyMap. The provided key should be unique within the parent Element.
 * @param {?Node} parent The parent of child.
 * @param {string} key A key to identify the child with.
 * @param {!Node} child The child to register.
 */
var registerChild = function (parent, key, child) {
  getKeyMap(parent)[key] = child;
};

/**
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const */
var notifications = {
  /**
   * Called after patch has compleated with any Nodes that have been created
   * and added to the DOM.
   * @type {?function(Array<!Node>)}
   */
  nodesCreated: null,

  /**
   * Called after patch has compleated with any Nodes that have been removed
   * from the DOM.
   * Note it's an applications responsibility to handle any childNodes.
   * @type {?function(Array<!Node>)}
   */
  nodesDeleted: null
};

/**
 * Keeps track of the state of a patch.
 * @constructor
 */
function Context() {
  /**
   * @type {(Array<!Node>|undefined)}
   */
  this.created = notifications.nodesCreated && [];

  /**
   * @type {(Array<!Node>|undefined)}
   */
  this.deleted = notifications.nodesDeleted && [];
}

/**
 * @param {!Node} node
 */
Context.prototype.markCreated = function (node) {
  if (this.created) {
    this.created.push(node);
  }
};

/**
 * @param {!Node} node
 */
Context.prototype.markDeleted = function (node) {
  if (this.deleted) {
    this.deleted.push(node);
  }
};

/**
 * Notifies about nodes that were created during the patch opearation.
 */
Context.prototype.notifyChanges = function () {
  if (this.created && this.created.length > 0) {
    notifications.nodesCreated(this.created);
  }

  if (this.deleted && this.deleted.length > 0) {
    notifications.nodesDeleted(this.deleted);
  }
};

/**
* Makes sure that keyed Element matches the tag name provided.
* @param {!string} nodeName The nodeName of the node that is being matched.
* @param {string=} tag The tag name of the Element.
* @param {?string=} key The key of the Element.
*/
var assertKeyedTagMatches = function (nodeName, tag, key) {
  if (nodeName !== tag) {
    throw new Error('Was expecting node with key "' + key + '" to be a ' + tag + ', not a ' + nodeName + '.');
  }
};

/** @type {?Context} */
var context = null;

/** @type {?Node} */
var currentNode = null;

/** @type {?Node} */
var currentParent = null;

/** @type {?Element|?DocumentFragment} */
var root = null;

/** @type {?Document} */
var doc = null;

/**
 * Returns a patcher function that sets up and restores a patch context,
 * running the run function with the provided data.
 * @param {function((!Element|!DocumentFragment),!function(T),T=)} run
 * @return {function((!Element|!DocumentFragment),!function(T),T=)}
 * @template T
 */
var patchFactory = function (run) {
  /**
   * TODO(moz): These annotations won't be necessary once we switch to Closure
   * Compiler's new type inference. Remove these once the switch is done.
   *
   * @param {(!Element|!DocumentFragment)} node
   * @param {!function(T)} fn
   * @param {T=} data
   * @template T
   */
  var f = function (node, fn, data) {
    var prevContext = context;
    var prevRoot = root;
    var prevDoc = doc;
    var prevCurrentNode = currentNode;
    var prevCurrentParent = currentParent;
    var previousInAttributes = false;
    var previousInSkip = false;

    context = new Context();
    root = node;
    doc = node.ownerDocument;
    currentParent = node.parentNode;

    run(node, fn, data);

    context.notifyChanges();

    context = prevContext;
    root = prevRoot;
    doc = prevDoc;
    currentNode = prevCurrentNode;
    currentParent = prevCurrentParent;
  };
  return f;
};

/**
 * Patches the document starting at node with the provided function. This
 * function may be called during an existing patch operation.
 * @param {!Element|!DocumentFragment} node The Element or Document
 *     to patch.
 * @param {!function(T)} fn A function containing elementOpen/elementClose/etc.
 *     calls that describe the DOM.
 * @param {T=} data An argument passed to fn to represent DOM state.
 * @template T
 */
var patchInner = patchFactory(function (node, fn, data) {
  currentNode = node;

  enterNode();
  fn(data);
  exitNode();

  
});

/**
 * Checks whether or not the current node matches the specified nodeName and
 * key.
 *
 * @param {?string} nodeName The nodeName for this node.
 * @param {?string=} key An optional key that identifies a node.
 * @return {boolean} True if the node matches, false otherwise.
 */
var matches = function (nodeName, key) {
  var data = getData(currentNode);

  // Key check is done using double equals as we want to treat a null key the
  // same as undefined. This should be okay as the only values allowed are
  // strings, null and undefined so the == semantics are not too weird.
  return nodeName === data.nodeName && key == data.key;
};

/**
 * Aligns the virtual Element definition with the actual DOM, moving the
 * corresponding DOM node to the correct location or creating it if necessary.
 * @param {string} nodeName For an Element, this should be a valid tag string.
 *     For a Text, this should be #text.
 * @param {?string=} key The key used to identify this element.
 * @param {?Array<*>=} statics For an Element, this should be an array of
 *     name-value pairs.
 */
var alignWithDOM = function (nodeName, key, statics) {
  if (currentNode && matches(nodeName, key)) {
    return;
  }

  var node = undefined;

  // Check to see if the node has moved within the parent.
  if (key) {
    node = getChild(currentParent, key);
    if (node && 'production' !== 'production') {
      assertKeyedTagMatches(getData(node).nodeName, nodeName, key);
    }
  }

  // Create the node if it doesn't exist.
  if (!node) {
    if (nodeName === '#text') {
      node = createText(doc);
    } else {
      node = createElement(doc, currentParent, nodeName, key, statics);
    }

    if (key) {
      registerChild(currentParent, key, node);
    }

    context.markCreated(node);
  }

  // If the node has a key, remove it from the DOM to prevent a large number
  // of re-orders in the case that it moved far or was completely removed.
  // Since we hold on to a reference through the keyMap, we can always add it
  // back.
  if (currentNode && getData(currentNode).key) {
    currentParent.replaceChild(node, currentNode);
    getData(currentParent).keyMapValid = false;
  } else {
    currentParent.insertBefore(node, currentNode);
  }

  currentNode = node;
};

/**
 * Clears out any unvisited Nodes, as the corresponding virtual element
 * functions were never called for them.
 */
var clearUnvisitedDOM = function () {
  var node = currentParent;
  var data = getData(node);
  var keyMap = data.keyMap;
  var keyMapValid = data.keyMapValid;
  var child = node.lastChild;
  var key = undefined;

  if (child === currentNode && keyMapValid) {
    return;
  }

  if (data.attrs[symbols.placeholder] && node !== root) {
    return;
  }

  while (child !== currentNode) {
    node.removeChild(child);
    context.markDeleted( /** @type {!Node}*/child);

    key = getData(child).key;
    if (key) {
      delete keyMap[key];
    }
    child = node.lastChild;
  }

  // Clean the keyMap, removing any unusued keys.
  if (!keyMapValid) {
    for (key in keyMap) {
      child = keyMap[key];
      if (child.parentNode !== node) {
        context.markDeleted(child);
        delete keyMap[key];
      }
    }

    data.keyMapValid = true;
  }
};

/**
 * Changes to the first child of the current node.
 */
var enterNode = function () {
  currentParent = currentNode;
  currentNode = null;
};

/**
 * Changes to the next sibling of the current node.
 */
var nextNode = function () {
  if (currentNode) {
    currentNode = currentNode.nextSibling;
  } else {
    currentNode = currentParent.firstChild;
  }
};

/**
 * Changes to the parent of the current node, removing any unvisited children.
 */
var exitNode = function () {
  clearUnvisitedDOM();

  currentNode = currentParent;
  currentParent = currentParent.parentNode;
};

/**
 * Makes sure that the current node is an Element with a matching tagName and
 * key.
 *
 * @param {string} tag The element's tag.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @return {!Element} The corresponding Element.
 */
var coreElementOpen = function (tag, key, statics) {
  nextNode();
  alignWithDOM(tag, key, statics);
  enterNode();
  return (/** @type {!Element} */currentParent
  );
};

/**
 * Closes the currently open Element, removing any unvisited children if
 * necessary.
 *
 * @return {!Element} The corresponding Element.
 */
var coreElementClose = function () {
  exitNode();
  return (/** @type {!Element} */currentNode
  );
};

/**
 * Makes sure the current node is a Text node and creates a Text node if it is
 * not.
 *
 * @return {!Text} The corresponding Text Node.
 */
var coreText = function () {
  nextNode();
  alignWithDOM('#text', null, null);
  return (/** @type {!Text} */currentNode
  );
};

/**
 * Skips the children in a subtree, allowing an Element to be closed without
 * clearing out the children.
 */
var skip = function () {
  currentNode = currentParent.lastChild;
};

/**
 * The offset in the virtual element declaration where the attributes are
 * specified.
 * @const
 */
var ATTRIBUTES_OFFSET = 3;

/**
 * @param {string} tag The element's tag.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @param {...*} const_args Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return {!Element} The corresponding Element.
 */
var elementOpen$1 = function (tag, key, statics, const_args) {
  var node = coreElementOpen(tag, key, statics);
  var data = getData(node);

  /*
   * Checks to see if one or more attributes have changed for a given Element.
   * When no attributes have changed, this is much faster than checking each
   * individual argument. When attributes have changed, the overhead of this is
   * minimal.
   */
  var attrsArr = data.attrsArr;
  var newAttrs = data.newAttrs;
  var attrsChanged = false;
  var i = ATTRIBUTES_OFFSET;
  var j = 0;

  for (; i < arguments.length; i += 1, j += 1) {
    if (attrsArr[j] !== arguments[i]) {
      attrsChanged = true;
      break;
    }
  }

  for (; i < arguments.length; i += 1, j += 1) {
    attrsArr[j] = arguments[i];
  }

  if (j < attrsArr.length) {
    attrsChanged = true;
    attrsArr.length = j;
  }

  /*
   * Actually perform the attribute update.
   */
  if (attrsChanged) {
    for (i = ATTRIBUTES_OFFSET; i < arguments.length; i += 2) {
      newAttrs[arguments[i]] = arguments[i + 1];
    }

    for (var _attr in newAttrs) {
      updateAttribute(node, _attr, newAttrs[_attr]);
      newAttrs[_attr] = undefined;
    }
  }

  return node;
};

/**
 * Closes an open virtual Element.
 *
 * @param {string} tag The element's tag.
 * @return {!Element} The corresponding Element.
 */
var elementClose = function (tag) {
  var node = coreElementClose();

  return node;
};

/**
 * Declares a virtual Text at this point in the document.
 *
 * @param {string|number|boolean} value The value of the Text.
 * @param {...(function((string|number|boolean)):string)} const_args
 *     Functions to format the value which are called only when the value has
 *     changed.
 * @return {!Text} The corresponding text node.
 */
var text = function (value, const_args) {
  var node = coreText();
  var data = getData(node);

  if (data.text !== value) {
    data.text = /** @type {string} */value;

    var formatted = value;
    for (var i = 1; i < arguments.length; i += 1) {
      /*
       * Call the formatter function directly to prevent leaking arguments.
       * https://github.com/google/incremental-dom/pull/204#issuecomment-178223574
       */
      var fn = arguments[i];
      formatted = fn(formatted);
    }

    node.data = formatted;
  }

  return node;
};

var patchInner_1 = patchInner;
var skip_1 = skip;
var elementOpen_1 = elementOpen$1;
var elementClose_1 = elementClose;
var text_1 = text;
var symbols_1 = symbols;
var attributes_1 = attributes;
var applyProp_1 = applyProp;

function enter (object, props) {
  const saved = {};
  Object.keys(props).forEach((key) => {
    saved[key] = object[key];
    object[key] = props[key];
  });
  return saved;
}

function exit (object, saved) {
  assign(object, saved);
}

// Decorates a function with a side effect that changes the properties of an
// object during its execution, and restores them after. There is no error
// handling here, if the wrapped function throws an error, properties are not
// restored and all bets are off.
var propContext = function (object, props) {
  return func => (...args) => {
    const saved = enter(object, props);
    const result = func(...args);
    exit(object, saved);
    return result;
  };
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var index$2 = (typeof self === 'object' && self.self === self && self) ||
  (typeof commonjsGlobal === 'object' && commonjsGlobal.global === commonjsGlobal && commonjsGlobal) ||
  commonjsGlobal;

/* eslint no-plusplus: 0 */

const { customElements, HTMLElement: HTMLElement$2 } = index$2;
const applyDefault = attributes_1[symbols_1.default];

// A stack of children that corresponds to the current function helper being
// executed.
const stackChren = [];

const $skip = '__skip';
const $currentEventHandlers = '__events';
const $stackCurrentHelperProps = '__props';

// The current function helper in the stack.
let stackCurrentHelper;

// This is used for the Incremental DOM overrides to keep track of what args
// to pass the main elementOpen() function.
let overrideArgs;

// The number of levels deep after skipping a tree.
let skips = 0;

const noop = () => {};

// Adds or removes an event listener for an element.
function applyEvent (elem, ename, newFunc) {
  let events = elem[$currentEventHandlers];

  if (!events) {
    events = elem[$currentEventHandlers] = {};
  }

  // Undefined indicates that there is no listener yet.
  if (typeof events[ename] === 'undefined') {
    // We only add a single listener once. Originally this was a workaround for
    // the Webcomponents ShadyDOM polyfill not removing listeners, but it's
    // also a simpler model for binding / unbinding events because you only
    // have a single handler you need to worry about and a single place where
    // you only store one event handler
    elem.addEventListener(ename, function (e) {
      if (events[ename]) {
        events[ename].call(this, e);
      }
    });
  }

  // Not undefined indicates that we have set a listener, so default to null.
  events[ename] = typeof newFunc === 'function' ? newFunc : null;
}

const attributesContext = propContext(attributes_1, {
  // Attributes that shouldn't be applied to the DOM.
  key: noop,
  statics: noop,

  // Attributes that *must* be set via a property on all elements.
  checked: applyProp_1,
  className: applyProp_1,
  disabled: applyProp_1,
  value: applyProp_1,

  // Ref handler.
  ref (elem, name$$1, value) {
    elem[ref] = value;
  },

  // Skip handler.
  skip (elem, name$$1, value) {
    if (value) {
      elem[$skip] = true;
    } else {
      delete elem[$skip];
    }
  },

  // Default attribute applicator.
  [symbols_1.default] (elem, name$$1, value) {
    const { props: props$$1, prototype } = customElements.get(elem.localName) || {
      props: {},
      prototype: {}
    };

    // TODO when refactoring properties to not have to workaround the old
    // WebKit bug we can remove the "name in props" check below.
    //
    // NOTE: That the "name in elem" check won't work for polyfilled custom
    // elements that set a property that isn't explicitly specified in "props"
    // or "prototype" unless it is added to the element explicitly as a
    // property prior to passing the prop to the vdom function. For example, if
    // it were added in a lifecycle callback because it wouldn't have been
    // upgraded yet.
    //
    // We prefer setting props, so we do this if there's a property matching
    // name that was passed. However, certain props on SVG elements are
    // readonly and error when you try to set them.
    if ((name$$1 in props$$1 || name$$1 in elem || name$$1 in prototype) && !('ownerSVGElement' in elem)) {
      applyProp_1(elem, name$$1, value);
      return;
    }

    // Explicit false removes the attribute.
    if (value === false) {
      applyDefault(elem, name$$1);
      return;
    }

    // Handle built-in and custom events.
    if (name$$1.indexOf('on') === 0) {
      const firstChar = name$$1[2];
      let eventName;

      if (firstChar === '-') {
        eventName = name$$1.substring(3);
      } else if (firstChar === firstChar.toUpperCase()) {
        eventName = firstChar.toLowerCase() + name$$1.substring(3);
      }

      if (eventName) {
        applyEvent(elem, eventName, value);
        return;
      }
    }

    applyDefault(elem, name$$1, value);
  }
});

function resolveTagName (name$$1) {
  // We return falsy values as some wrapped IDOM functions allow empty values.
  if (!name$$1) {
    return name$$1;
  }

  // We try and return the cached tag name, if one exists.
  if (name$$1[name]) {
    return name$$1[name];
  }

  // If it's a custom element, we get the tag name by constructing it and
  // caching it.
  if (name$$1.prototype instanceof HTMLElement$2) {
    // eslint-disable-next-line
    const elem = new name$$1();
    return (name$$1[name] = elem.localName);
  }

  // Pass all other values through so IDOM gets what it's expecting.
  return name$$1;
}

// Incremental DOM's elementOpen is where the hooks in `attributes` are applied,
// so it's the only function we need to execute in the context of our attributes.
const elementOpen$$1 = attributesContext(elementOpen_1);

function elementOpenStart$$1 (tag, key = null, statics = null) {
  overrideArgs = [tag, key, statics];
}

function elementOpenEnd$$1 () {
  const node = newElementOpen(...overrideArgs); // eslint-disable-line no-use-before-define
  overrideArgs = null;
  return node;
}

function wrapIdomFunc (func, tnameFuncHandler = noop) {
  return function wrap (...args) {
    args[0] = resolveTagName(args[0]);
    stackCurrentHelper = null;
    if (typeof args[0] === 'function') {
      // If we've encountered a function, handle it according to the type of
      // function that is being wrapped.
      stackCurrentHelper = args[0];
      return tnameFuncHandler(...args);
    } else if (stackChren.length) {
      // We pass the wrap() function in here so that when it's called as
      // children, it will queue up for the next stack, if there is one.
      stackChren[stackChren.length - 1].push([wrap, args]);
    } else {
      if (func === elementOpen$$1) {
        if (skips) {
          return ++skips;
        }

        const elem = func(...args);

        if (elem[$skip]) {
          ++skips;
        }

        return elem;
      }

      if (func === elementClose_1) {
        if (skips === 1) {
          skip_1();
        }

        // We only want to skip closing if it's not the last closing tag in the
        // skipped tree because we keep the element that initiated the skpping.
        if (skips && --skips) {
          return;
        }

        const elem = func(...args);
        const ref$$1 = elem[ref];

        // We delete so that it isn't called again for the same element. If the
        // ref changes, or the element changes, this will be defined again.
        delete elem[ref];

        // Execute the saved ref after esuring we've cleand up after it.
        if (typeof ref$$1 === 'function') {
          ref$$1(elem);
        }

        return elem;
      }

      // We must call elementOpenStart and elementOpenEnd even if we are
      // skipping because they queue up attributes and then call elementClose.
      if (!skips || (func === elementOpenStart$$1 || func === elementOpenEnd$$1)) {
        return func(...args);
      }
    }
  };
}

function newAttr (...args) {
  if (stackCurrentHelper) {
    stackCurrentHelper[$stackCurrentHelperProps][args[0]] = args[1];
  } else if (stackChren.length) {
    stackChren[stackChren.length - 1].push([newAttr, args]);
  } else {
    overrideArgs.push(args[0]);
    overrideArgs.push(args[1]);
  }
}

function stackOpen (tname, key, statics, ...attrs) {
  const props$$1 = { key, statics };
  for (let a = 0; a < attrs.length; a += 2) {
    props$$1[attrs[a]] = attrs[a + 1];
  }
  tname[$stackCurrentHelperProps] = props$$1;
  stackChren.push([]);
}

function stackClose (tname) {
  const chren = stackChren.pop();
  const props$$1 = tname[$stackCurrentHelperProps];
  delete tname[$stackCurrentHelperProps];
  const elemOrFn = tname(props$$1, () => chren.forEach(args => args[0](...args[1])));
  return typeof elemOrFn === 'function' ? elemOrFn() : elemOrFn;
}

// Incremental DOM overrides
// -------------------------

// We must override internal functions that call internal Incremental DOM
// functions because we can't override the internal references. This means
// we must roughly re-implement their behaviour. Luckily, they're fairly
// simple.
const newElementOpenStart = wrapIdomFunc(elementOpenStart$$1, stackOpen);
const newElementOpenEnd = wrapIdomFunc(elementOpenEnd$$1);

// Standard open / closed overrides don't need to reproduce internal behaviour
// because they are the ones referenced from *End and *Start.
const newElementOpen = wrapIdomFunc(elementOpen$$1, stackOpen);
const newElementClose = wrapIdomFunc(elementClose_1, stackClose);

// Ensure we call our overridden functions instead of the internal ones.
function newElementVoid (tag, ...args) {
  newElementOpen(tag, ...args);
  return newElementClose(tag);
}

// Text override ensures their calls can queue if using function helpers.
const newText = wrapIdomFunc(text_1);

// Convenience function for declaring an Incremental DOM element using
// hyperscript-style syntax.
function element$1 (tname, attrs, ...chren) {
  const atype = typeof attrs;

  // If attributes are a function, then they should be treated as children.
  if (atype === 'function' || atype === 'string' || atype === 'number') {
    chren.unshift(attrs);
  }

  // Ensure the attributes are an object. Null is considered an object so we
  // have to test for this explicitly.
  if (attrs === null || atype !== 'object') {
    attrs = {};
  }

  // We open the element so we can set attrs after.
  newElementOpenStart(tname, attrs.key, attrs.statics);

  // Delete so special attrs don't actually get set.
  delete attrs.key;
  delete attrs.statics;

  // Set attributes.
  Object.keys(attrs).forEach(name$$1 => newAttr(name$$1, attrs[name$$1]));

  // Close before we render the descendant tree.
  newElementOpenEnd(tname);

  chren.forEach((ch) => {
    const ctype = typeof ch;
    if (ctype === 'function') {
      ch();
    } else if (ctype === 'string' || ctype === 'number') {
      newText(ch);
    } else if (Array.isArray(ch)) {
      ch.forEach(sch => sch());
    }
  });

  return newElementClose(tname);
}

// Even further convenience for building a DSL out of JavaScript functions or hooking into standard
// transpiles for JSX (React.createElement() / h).
function builder (...tags) {
  if (tags.length === 0) {
    return (...args) => element$1.bind(null, ...args);
  }
  return tags.map(tag =>
    (...args) =>
      element$1.bind(null, tag, ...args)
  );
}




var vdom = Object.freeze({
	element: element$1,
	builder: builder,
	attr: newAttr,
	elementClose: newElementClose,
	elementOpen: newElementOpen,
	elementOpenEnd: newElementOpenEnd,
	elementOpenStart: newElementOpenStart,
	elementVoid: newElementVoid,
	text: newText
});

function createSymbol (description) {
  return typeof Symbol === 'function' ? Symbol(description) : description;
}

var data = function (element, namespace = '') {
  const data = element.__SKATE_DATA || (element.__SKATE_DATA = {});
  return namespace && (data[namespace] || (data[namespace] = {})) || data; // eslint-disable-line no-mixed-operators
};

const nativeHints = [
  'native code',
  '[object MutationObserverConstructor]' // for mobile safari iOS 9.0
];
var native = fn => nativeHints.map(
  (hint) => (fn || '').toString().indexOf([hint]) > -1
).reduce((a, b) => a || b);

const { MutationObserver: MutationObserver$2 } = index$2;

function microtaskDebounce (cbFunc) {
  let scheduled = false;
  let i = 0;
  let cbArgs = [];
  const elem = document.createElement('span');
  const observer = new MutationObserver$2(() => {
    cbFunc(...cbArgs);
    scheduled = false;
    cbArgs = null;
  });

  observer.observe(elem, { childList: true });

  return (...args) => {
    cbArgs = args;
    if (!scheduled) {
      scheduled = true;
      elem.textContent = `${i}`;
      i += 1;
    }
  };
}

// We have to use setTimeout() for IE9 and 10 because the Mutation Observer
// polyfill requires that the element be in the document to trigger Mutation
// Events. Mutation Events are also synchronous and thus wouldn't debounce.
//
// The soonest we can set the timeout for in IE is 1 as they have issues when
// setting to 0.
function taskDebounce (cbFunc) {
  let scheduled = false;
  let cbArgs = [];
  return (...args) => {
    cbArgs = args;
    if (!scheduled) {
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        cbFunc(...cbArgs);
      }, 1);
    }
  };
}
var debounce = native(MutationObserver$2) ? microtaskDebounce : taskDebounce;

let environment = process && process.env ? process.env.NODE_ENV : null;
if (!environment) {
  environment = 'production';
}
// IE doesn't support 'startsWith'
const isProduction = environment.toLowerCase().indexOf('prod') === 0;

function deprecated (elem, oldUsage, newUsage) {
  if (!isProduction) {
    const ownerName = elem.localName ? elem.localName : String(elem);
    console.warn(`${ownerName} ${oldUsage} is deprecated. Use ${newUsage}.`);
  }
}

/**
 * @internal
 * Attributes Manager
 *
 * Postpones attributes updates until when connected.
 */
class AttributesManager {
  constructor (elem) {
    this.elem = elem;
    this.connected = false;
    this.pendingValues = {};
    this.lastSetValues = {};
  }

  /**
   * Called from disconnectedCallback
   */
  suspendAttributesUpdates () {
    this.connected = false;
  }

  /**
   * Called from connectedCallback
   */
  resumeAttributesUpdates () {
    this.connected = true;
    const names = Object.keys(this.pendingValues);
    names.forEach(name => {
      const value = this.pendingValues[name];
      // Skip if already cleared
      if (!isUndefined(value)) {
        delete this.pendingValues[name];
        this._syncAttrValue(name, value);
      }
    });
  }

  /**
   * Returns true if the value is different from the one set internally
   * using setAttrValue()
   */
  onAttributeChanged (name, value) {
    value = toNullOrString(value);

    // A new attribute value voids the pending one
    this._clearPendingValue(name);

    const changed = this.lastSetValues[name] !== value;
    this.lastSetValues[name] = value;
    return changed;
  }

  /**
   * Updates or removes the attribute if value === null.
   *
   * When the component is not connected the value is saved and
   * the attribute is only updated when the component is re-connected.
   */
  setAttrValue (name, value) {
    value = toNullOrString(value);

    this.lastSetValues[name] = value;

    if (this.connected) {
      this._clearPendingValue(name);
      this._syncAttrValue(name, value);
    } else {
      this.pendingValues[name] = value;
    }
  }

  _syncAttrValue (name, value) {
    const currAttrValue = toNullOrString(this.elem.getAttribute(name));
    if (value !== currAttrValue) {
      if (value === null) {
        this.elem.removeAttribute(name);
      } else {
        this.elem.setAttribute(name, value);
      }
    }
  }

  _clearPendingValue (name) {
    if (name in this.pendingValues) {
      delete this.pendingValues[name];
    }
  }
}

// Only used by getAttrMgr
const $attributesMgr = '____skate_attributesMgr';

/**
 * @internal
 * Returns attribute manager instance for the given Component
 */
function getAttrMgr (elem) {
  let mgr = elem[$attributesMgr];
  if (!mgr) {
    mgr = new AttributesManager(elem);
    elem[$attributesMgr] = mgr;
  }
  return mgr;
}

var getOwnPropertyDescriptors = function (obj = {}) {
  return getPropNamesAndSymbols(obj).reduce((prev, nameOrSymbol) => {
    prev[nameOrSymbol] = Object.getOwnPropertyDescriptor(obj, nameOrSymbol);
    return prev;
  }, {});
};

var dashCase = function (str) {
  return str.split(/([A-Z])/).reduce((one, two, idx) => {
    const dash = !one || idx % 2 === 0 ? '' : '-';
    return `${one}${dash}${two.toLowerCase()}`;
  });
};

function error (message) {
  throw new Error(message);
}

/**
 * @internal
 * Property Definition
 *
 * Internal meta data and strategies for a property.
 * Created from the options of a PropOptions config object.
 *
 * Once created a PropDefinition should be treated as immutable and final.
 * 'getPropsMap' function memoizes PropDefinitions by Component's Class.
 *
 * The 'attribute' option is normalized to 'attrSource' and 'attrTarget' properties.
 */
class PropDefinition {

  constructor (nameOrSymbol, propOptions) {
    this._nameOrSymbol = nameOrSymbol;

    propOptions = propOptions || {};

    // default 'attrSource': no observed source attribute (name)
    this.attrSource = null;

    // default 'attrTarget': no reflected target attribute (name)
    this.attrTarget = null;

    // default 'attrTargetIsNotSource'
    this.attrTargetIsNotSource = false;

    // default 'coerce': identity function
    this.coerce = value => value;

    // default 'default': set prop to 'null'
    this.default = null;

    // default 'deserialize': return attribute's value (string or null)
    this.deserialize = value => value;

    // default 'get': no function
    this.get = null;

    // 'initial' default: unspecified
    // 'initial' option is truly optional and it cannot be initialized.
    // Its presence is tested using: ('initial' in propDef)

    // 'serialize' default: return string value or null
    this.serialize = value => (empty(value) ? null : String(value));

    // default 'set': no function
    this.set = null;

    // Note: option key is always a string (no symbols here)
    Object.keys(propOptions).forEach(option => {
      const optVal = propOptions[option];

      // Only accept documented options and perform minimal input validation.
      switch (option) {
        case 'attribute':
          if (!isObject(optVal)) {
            this.attrSource = this.attrTarget = resolveAttrName(optVal, nameOrSymbol);
          } else {
            const { source, target } = optVal;
            if (!source && !target) {
              error(`${option} 'source' or 'target' is missing.`);
            }
            this.attrSource = resolveAttrName(source, nameOrSymbol);
            this.attrTarget = resolveAttrName(target, nameOrSymbol);
            this.attrTargetIsNotSource = this.attrTarget !== this.attrSource;
          }
          break;
        case 'coerce':
        case 'deserialize':
        case 'get':
        case 'serialize':
        case 'set':
          if (isFunction(optVal)) {
            this[option] = optVal;
          } else {
            error(`${option} must be a function.`);
          }
          break;
        case 'default':
        case 'initial':
          this[option] = optVal;
          break;
        default:
          // TODO: undocumented options?
          this[option] = optVal;
          break;
      }
    });
  }

  get nameOrSymbol () {
    return this._nameOrSymbol;
  }

}

function resolveAttrName (attrOption, nameOrSymbol) {
  if (isSymbol(nameOrSymbol)) {
    error(`${nameOrSymbol.toString()} symbol property cannot have an attribute.`);
  } else {
    if (attrOption === true) {
      return dashCase(String(nameOrSymbol));
    }
    if (isString(attrOption)) {
      return attrOption;
    }
  }
  return null;
}

/**
 * This is needed to avoid IE11 "stack size errors" when creating
 * a new property on the constructor of an HTMLElement
 */
function setCtorNativeProperty (Ctor, propName, value) {
  Object.defineProperty(Ctor, propName, { configurable: true, value });
}

/**
 * Memoizes a map of PropDefinition for the given component class.
 * Keys in the map are the properties name which can a string or a symbol.
 *
 * The map is created from the result of: static get props
 */
function getPropsMap (Ctor) {
  // Must be defined on constructor and not from a superclass
  if (!Ctor.hasOwnProperty(ctorPropsMap)) {
    const props$$1 = Ctor.props || {};

    const propsMap = getPropNamesAndSymbols(props$$1).reduce((result, nameOrSymbol) => {
      result[nameOrSymbol] = new PropDefinition(nameOrSymbol, props$$1[nameOrSymbol]);
      return result;
    }, {});
    setCtorNativeProperty(Ctor, ctorPropsMap, propsMap);
  }

  return Ctor[ctorPropsMap];
}

function get$1$1 (elem) {
  const props$$1 = {};

  getPropNamesAndSymbols(getPropsMap(elem.constructor)).forEach((nameOrSymbol) => {
    props$$1[nameOrSymbol] = elem[nameOrSymbol];
  });

  return props$$1;
}

function set$1$1 (elem, newProps) {
  assign(elem, newProps);
  if (elem[renderer]) {
    elem[renderer]();
  }
}

var props$1 = function (elem, newProps) {
  return isUndefined(newProps) ? get$1$1(elem) : set$1$1(elem, newProps);
};

function getDefaultValue (elem, propDef) {
  return typeof propDef.default === 'function'
    ? propDef.default(elem, { name: propDef.nameOrSymbol })
    : propDef.default;
}

function getInitialValue (elem, propDef) {
  return typeof propDef.initial === 'function'
    ? propDef.initial(elem, { name: propDef.nameOrSymbol })
    : propDef.initial;
}

function getPropData (elem, name) {
  const elemData = data(elem, 'props');
  return elemData[name] || (elemData[name] = {});
}

function createNativePropertyDescriptor (propDef) {
  const { nameOrSymbol } = propDef;

  const prop = {
    configurable: true,
    enumerable: true
  };

  prop.beforeDefineProperty = elem => {
    const propData = getPropData(elem, nameOrSymbol);
    const attrSource = propDef.attrSource;

    // Store attrSource name to property link.
    if (attrSource) {
      data(elem, 'attrSourceLinks')[attrSource] = nameOrSymbol;
    }

    // prop value before upgrading
    let initialValue = elem[nameOrSymbol];

    // Set up initial value if it wasn't specified.
    let valueFromAttrSource = false;
    if (empty(initialValue)) {
      if (attrSource && elem.hasAttribute(attrSource)) {
        valueFromAttrSource = true;
        initialValue = propDef.deserialize(elem.getAttribute(attrSource));
      } else if ('initial' in propDef) {
        initialValue = getInitialValue(elem, propDef);
      } else {
        initialValue = getDefaultValue(elem, propDef);
      }
    }

    initialValue = propDef.coerce(initialValue);

    propData.internalValue = initialValue;

    // Reflect to Target Attribute
    const mustReflect = propDef.attrTarget && !empty(initialValue) &&
      (!valueFromAttrSource || propDef.attrTargetIsNotSource);

    if (mustReflect) {
      let serializedValue = propDef.serialize(initialValue);
      getAttrMgr(elem).setAttrValue(propDef.attrTarget, serializedValue);
    }
  };

  prop.get = function get () {
    const propData = getPropData(this, nameOrSymbol);
    const { internalValue } = propData;
    return propDef.get ? propDef.get(this, { name: nameOrSymbol, internalValue }) : internalValue;
  };

  prop.set = function set (newValue) {
    const propData = getPropData(this, nameOrSymbol);

    const useDefaultValue = empty(newValue);
    if (useDefaultValue) {
      newValue = getDefaultValue(this, propDef);
    }

    newValue = propDef.coerce(newValue);

    if (propDef.set) {
      let { oldValue } = propData;

      if (empty(oldValue)) {
        oldValue = null;
      }
      const changeData = { name: nameOrSymbol, newValue, oldValue };
      propDef.set(this, changeData);
    }

    // Queue a re-render.
    this[rendererDebounced](this);

    // Update prop data so we can use it next time.
    propData.internalValue = propData.oldValue = newValue;

    // Reflect to Target attribute.
    const mustReflect = propDef.attrTarget &&
      (propDef.attrTargetIsNotSource || !propData.settingPropFromAttrSource);
    if (mustReflect) {
      // Note: setting the prop to empty implies the default value
      // and therefore no attribute should be present!
      let serializedValue = useDefaultValue ? null : propDef.serialize(newValue);
      getAttrMgr(this).setAttrValue(propDef.attrTarget, serializedValue);
    }
  };

  return prop;
}

/**
 * Polyfill Object.is for IE
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
if (!Object.is) {
  Object.is = function (x, y) {
    // SameValue algorithm
    if (x === y) { // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  };
}
var objectIs = Object.is;

const HTMLElement$3 = index$2.HTMLElement || class {};
const _prevName = createSymbol('prevName');
const _prevOldValue = createSymbol('prevOldValue');
const _prevNewValue = createSymbol('prevNewValue');

function preventDoubleCalling (elem, name$$1, oldValue, newValue) {
  return name$$1 === elem[_prevName] &&
    oldValue === elem[_prevOldValue] &&
    newValue === elem[_prevNewValue];
}

// TODO remove when not catering to Safari < 10.
function createNativePropertyDescriptors (Ctor) {
  const propDefs = getPropsMap(Ctor);
  return getPropNamesAndSymbols(propDefs).reduce((propDescriptors, nameOrSymbol) => {
    propDescriptors[nameOrSymbol] = createNativePropertyDescriptor(propDefs[nameOrSymbol]);
    return propDescriptors;
  }, {});
}

// TODO refactor when not catering to Safari < 10.
//
// We should be able to simplify this where all we do is Object.defineProperty().
function createInitProps (Ctor) {
  const propDescriptors = createNativePropertyDescriptors(Ctor);

  return (elem) => {
    getPropNamesAndSymbols(propDescriptors).forEach((nameOrSymbol) => {
      const propDescriptor = propDescriptors[nameOrSymbol];
      propDescriptor.beforeDefineProperty(elem);

      // We check here before defining to see if the prop was specified prior
      // to upgrading.
      const hasPropBeforeUpgrading = nameOrSymbol in elem;

      // This is saved prior to defining so that we can set it after it it was
      // defined prior to upgrading. We don't want to invoke the getter if we
      // don't need to, so we only get the value if we need to re-sync.
      const valueBeforeUpgrading = hasPropBeforeUpgrading && elem[nameOrSymbol];

      // https://bugs.webkit.org/show_bug.cgi?id=49739
      //
      // When Webkit fixes that bug so that native property accessors can be
      // retrieved, we can move defining the property to the prototype and away
      // from having to do if for every instance as all other browsers support
      // this.
      Object.defineProperty(elem, nameOrSymbol, propDescriptor);

      // DEPRECATED
      //
      // We'll be removing get / set callbacks on properties. Use the
      // updatedCallback() instead.
      //
      // We re-set the prop if it was specified prior to upgrading because we
      // need to ensure set() is triggered both in polyfilled environments and
      // in native where the definition may be registerd after elements it
      // represents have already been created.
      if (hasPropBeforeUpgrading) {
        elem[nameOrSymbol] = valueBeforeUpgrading;
      }
    });
  };
}

var Component = class extends HTMLElement$3 {
  /**
   * Returns unique attribute names configured with props and
   * those set on the Component constructor if any
   */
  static get observedAttributes () {
    const attrsOnCtor = this.hasOwnProperty(ctorObservedAttributes) ? this[ctorObservedAttributes] : [];
    const propDefs = getPropsMap(this);

    // Use Object.keys to skips symbol props since they have no linked attributes
    const attrsFromLinkedProps = Object.keys(propDefs).map(propName =>
      propDefs[propName].attrSource).filter(Boolean);

    const all = attrsFromLinkedProps.concat(attrsOnCtor).concat(super.observedAttributes);
    return all.filter((item, index) =>
      all.indexOf(item) === index);
  }

  static set observedAttributes (value) {
    value = Array.isArray(value) ? value : [];
    setCtorNativeProperty(this, 'observedAttributes', value);
  }

  // Returns superclass props overwritten with this Component props
  static get props () {
    return assign({}, super.props, this[ctorProps]);
  }

  static set props (value) {
    setCtorNativeProperty(this, ctorProps, value);
  }

  // Passing args is designed to work with document-register-element. It's not
  // necessary for the webcomponents/custom-element polyfill.
  constructor (...args) {
    super(...args);

    const { constructor } = this;

    // Used for the ready() function so it knows when it can call its callback.
    this[created] = true;

    // TODO refactor to not cater to Safari < 10. This means we can depend on
    // built-in property descriptors.
    // Must be defined on constructor and not from a superclass
    if (!constructor.hasOwnProperty(ctorCreateInitProps)) {
      setCtorNativeProperty(constructor, ctorCreateInitProps, createInitProps(constructor));
    }

    // Set up a renderer that is debounced for property sets to call directly.
    this[rendererDebounced] = debounce(this[renderer].bind(this));

    // Set up property lifecycle.
    const propDefsCount = getPropNamesAndSymbols(getPropsMap(constructor)).length;
    if (propDefsCount && constructor[ctorCreateInitProps]) {
      constructor[ctorCreateInitProps](this);
    }

    // DEPRECATED
    //
    // static render()
    // Note that renderCallback is an optional method!
    if (!this.renderCallback && constructor.render) {
      deprecated(this, 'static render', 'renderCallback');
      this.renderCallback = constructor.render.bind(constructor, this);
    }

    // DEPRECATED
    //
    // static created()
    //
    // Props should be set up before calling this.
    const { created: created$$1 } = constructor;
    if (isFunction(created$$1)) {
      deprecated(this, 'static created', 'constructor');
      created$$1(this);
    }

    // DEPRECATED
    //
    // Feature has rarely been used.
    //
    // Created should be set before invoking the ready listeners.
    const elemData = data(this);
    const readyCallbacks = elemData.readyCallbacks;
    if (readyCallbacks) {
      readyCallbacks.forEach(cb => cb(this));
      delete elemData.readyCallbacks;
    }
  }

  // Custom Elements v1
  connectedCallback () {
    // Reflect attributes pending values
    getAttrMgr(this).resumeAttributesUpdates();

    // Used to check whether or not the component can render.
    this[connected] = true;

    // Render!
    this[rendererDebounced]();

    // DEPRECATED
    //
    // static attached()
    const { attached } = this.constructor;
    if (isFunction(attached)) {
      deprecated(this, 'static attached', 'connectedCallback');
      attached(this);
    }

    // DEPRECATED
    //
    // We can remove this once all browsers support :defined.
    this.setAttribute('defined', '');
  }

  // Custom Elements v1
  disconnectedCallback () {
    // Suspend updating attributes until re-connected
    getAttrMgr(this).suspendAttributesUpdates();

    // Ensures the component can't be rendered while disconnected.
    this[connected] = false;

    // DEPRECATED
    //
    // static detached()
    const { detached } = this.constructor;
    if (isFunction(detached)) {
      deprecated(this, 'static detached', 'disconnectedCallback');
      detached(this);
    }
  }

  // Custom Elements v1
  attributeChangedCallback (name$$1, oldValue, newValue) {
    // Polyfill calls this twice.
    if (preventDoubleCalling(this, name$$1, oldValue, newValue)) {
      return;
    }

    // Set data so we can prevent double calling if the polyfill.
    this[_prevName] = name$$1;
    this[_prevOldValue] = oldValue;
    this[_prevNewValue] = newValue;

    const propNameOrSymbol = data(this, 'attrSourceLinks')[name$$1];
    if (propNameOrSymbol) {
      const changedExternally = getAttrMgr(this).onAttributeChanged(name$$1, newValue);
      if (changedExternally) {
        // Sync up the property.
        const propDef = getPropsMap(this.constructor)[propNameOrSymbol];
        const newPropVal = newValue !== null && propDef.deserialize
          ? propDef.deserialize(newValue)
          : newValue;

        const propData = data(this, 'props')[propNameOrSymbol];
        propData.settingPropFromAttrSource = true;
        this[propNameOrSymbol] = newPropVal;
        propData.settingPropFromAttrSource = false;
      }
    }

    // DEPRECATED
    //
    // static attributeChanged()
    const { attributeChanged } = this.constructor;
    if (isFunction(attributeChanged)) {
      deprecated(this, 'static attributeChanged', 'attributeChangedCallback');
      attributeChanged(this, { name: name$$1, newValue, oldValue });
    }
  }

  // Skate
  updatedCallback (prevProps) {
    if (this.constructor.hasOwnProperty('updated')) {
      deprecated(this, 'static updated', 'updatedCallback');
    }
    return this.constructor.updated(this, prevProps);
  }

  // Skate
  renderedCallback () {
    if (this.constructor.hasOwnProperty('rendered')) {
      deprecated(this, 'static rendered', 'renderedCallback');
    }
    return this.constructor.rendered(this);
  }

  // Skate
  //
  // Maps to the static renderer() callback. That logic should be moved here
  // when that is finally removed.
  // TODO: finalize how to support different rendering strategies.
  rendererCallback () {
    // TODO: cannot move code here because tests expects renderer function to still exist on constructor!
    return this.constructor.renderer(this);
  }

  // Skate
  // @internal
  // Invokes the complete render lifecycle.
  [renderer] () {
    if (this[rendering] || !this[connected]) {
      return;
    }

    // Flag as rendering. This prevents anything from trying to render - or
    // queueing a render - while there is a pending render.
    this[rendering] = true;
    if (this[updated]() && isFunction(this.renderCallback)) {
      this.rendererCallback();
      this.renderedCallback();
    }

    this[rendering] = false;
  }

  // Skate
  // @internal
  // Calls the updatedCallback() with previous props.
  [updated] () {
    const prevProps = this[props];
    this[props] = props$1(this);
    return this.updatedCallback(prevProps);
  }

  // Skate
  static extend (definition = {}, Base = this) {
    // Create class for the user.
    class Ctor extends Base {}

    // For inheriting from the object literal.
    const opts = getOwnPropertyDescriptors(definition);
    const prot = getOwnPropertyDescriptors(definition.prototype);

    // Prototype is non configurable (but is writable).
    delete opts.prototype;

    // Pass on static and instance members from the definition.
    Object.defineProperties(Ctor, opts);
    Object.defineProperties(Ctor.prototype, prot);

    return Ctor;
  }

  // Skate
  //
  // DEPRECATED
  //
  // Stubbed in case any subclasses are calling it.
  static rendered () {}

  // Skate
  //
  // DEPRECATED
  //
  // Move this to rendererCallback() before removing.
  static renderer (elem) {
    if (!elem.shadowRoot) {
      elem.attachShadow({ mode: 'open' });
    }
    patchInner_1(elem.shadowRoot, () => {
      const possibleFn = elem.renderCallback(elem);
      if (isFunction(possibleFn)) {
        possibleFn();
      } else if (Array.isArray(possibleFn)) {
        possibleFn.forEach((fn) => {
          if (isFunction(fn)) {
            fn();
          }
        });
      }
    });
  }

  // Skate
  //
  // DEPRECATED
  //
  // Move this to updatedCallback() before removing.
  static updated (elem, previousProps) {
    // The 'previousProps' will be undefined if it is the initial render.
    if (!previousProps) {
      return true;
    }

    // The 'previousProps' will always contain all of the keys.
    //
    // Use classic loop because:
    // 'for ... in' skips symbols and 'for ... of' is not working yet with IE!?
    // for (let nameOrSymbol of getPropNamesAndSymbols(previousProps)) {
    const namesAndSymbols = getPropNamesAndSymbols(previousProps);
    for (let i = 0; i < namesAndSymbols.length; i++) {
      const nameOrSymbol = namesAndSymbols[i];

      // With Object.is NaN is equal to NaN
      if (!objectIs(previousProps[nameOrSymbol], elem[nameOrSymbol])) {
        return true;
      }
    }

    return false;
  }
};

function uniqueId (prefix) {
  // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/2117523#2117523
  const rand = 'xxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    // eslint-disable-next-line no-mixed-operators
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return `${prefix || 'x'}-${rand}`;
}

var define = function (...args) {
  const { customElements } = index$2;
  let [ name$$1, Ctor ] = args;

  if (!customElements) {
    throw new Error('Skate requires native custom element support or a polyfill.');
  }

  // Support passing an anonymous definition.
  if (args.length === 1) {
    // We are checking string for now, but once we remove the ability to pass
    // an object literal, we can change this to check "function" and invert the
    // blocks of logic.
    if (typeof name$$1 === 'string') {
      throw new Error('When passing only one argument to define(), it must be a custom element constructor.');
    } else {
      Ctor = name$$1;
      name$$1 = uniqueId();
    }
  }

  // Ensure there's no conflicts.
  if (customElements.get(name$$1)) {
    name$$1 = uniqueId(name$$1);
  }

  // DEPRECATED
  //
  // Object literals.
  if (typeof Ctor === 'object') {
    Ctor = Component.extend(Ctor);
  }

  // This allows us to check this before instantiating the custom element to
  // find its name from the constructor in the vdom module, thus improving
  // performance but still falling back to a robust method.
  Ctor[name] = name$$1;

  // Sipmle define. Not supporting customised built-ins yet.
  customElements.define(name$$1, Ctor);

  // The spec doesn't return but this allows for a simpler, more concise API.
  return Ctor;
};

const Event$1 = ((TheEvent) => {
  if (TheEvent) {
    try {
      new TheEvent('emit-init'); // eslint-disable-line no-new
    } catch (e) {
      return undefined;
    }
  }
  return TheEvent;
})(index$2.Event);

function createCustomEvent (name, opts = {}) {
  const { detail } = opts;
  delete opts.detail;

  let e;
  if (Event$1) {
    e = new Event$1(name, opts);
    Object.defineProperty(e, 'detail', { value: detail });
  } else {
    e = document.createEvent('CustomEvent');
    Object.defineProperty(e, 'composed', { value: opts.composed });
    e.initCustomEvent(name, opts.bubbles, opts.cancelable, detail);
  }
  return e;
}

function getValue (elem) {
  const type = elem.type;
  if (type === 'checkbox' || type === 'radio') {
    return elem.checked ? elem.value || true : false;
  }
  return elem.value;
}

const h = builder();

console.log('skate-demo');
console.log(define, vdom);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}]},{},[2]);
