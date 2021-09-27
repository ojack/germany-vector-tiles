(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _core = require("@loaders.gl/core");

var _csv = require("@loaders.gl/csv");

var _nanohtml = _interopRequireDefault(require("nanohtml"));

var _templateObject, _templateObject2, _templateObject3;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/*
* To do:
* - how to update tooltip when date is updated? 
* - definition file for datasets
* - make dataset files that only contain values, not geoid
* - implement start date and end date
* - add sample data for timeseries
* - loading spinner while data is loading
* - show selected elements as separate array
* 
* assumptions: geo id in tileset refers to data order (?)
* are there datasets that only exist at certain geolevels?
* https://deck.gl/docs/api-reference/geo-layers/mvt-layer
*/
var _deck = deck,
    DeckGL = _deck.DeckGL,
    MVTLayer = _deck.MVTLayer; //import { csv } from 'd3'

var viz;
var geoRegion;
var dataset = 'mobility';
var baseURL = window.location.href.replace('/example-data-loading/', '');
var datasetPath = "/sample-data/datasets/";
var tilesetPath = "/sample-data/tilesets/"; // sets of vector tilesets representing different geo-regions

var tilesets = [{
  label: 'gemeinden',
  // 
  id: 'gemeinden',
  // 
  url: 'gemeinden',
  numEntries: 11431,
  idLookup: 'myLookup.csv' // not yet implemented, a csv file with an array, where each value in the array is a geographicId. All datasets that use this geodata should have values in the same order as this array.

}, {
  label: 'kreise',
  id: 'kreise',
  url: 'kreise',
  numEntries: 432
}, {
  label: 'laender',
  id: 'laender',
  url: 'laender',
  numEntries: 34
}];
var datasets = [{
  label: 'Mobility by Date',
  id: 'mobility',
  url: '',
  startDate: '',
  endDate: '',
  tilesets: ['laendergeo', 'kreisegeo', 'gemeindengeo']
}];
tilesets.forEach(function (tileset, i) {
  var URL = "".concat(baseURL).concat(tilesetPath).concat(tileset.url, "/{z}/{x}/{y}.pbf");
  tileset.tiles = [URL];
  tileset.visibile = false;
  tileset.mobility = new Array(tileset.numEntries).fill(0).map(function (_, i) {
    return Math.random();
  });
});
var numDates = 100;
var currentDateIndex = 0;
selectGeoLevel('gemeinden'); //geoRegion = tilesets[0]

console.log('base url', tilesets, geoRegion);
var footer = (0, _nanohtml["default"])(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div style=\"position:absolute;bottom:0px;right:0px;width:100%\"></div>"])));

var generateDate = function generateDate() {
  var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'hi';
  return "<div style=\"font-size:4rem;color:white;background:rgba(0, 0, 0, 0.4)\">".concat(date, "</div>");
};

var dateEl = document.createElement('div');
var geoSelect = (0, _nanohtml["default"])(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<label for=\"geolevel\">Select map geo level</label>\n<select label=\"geolevel\" onchange=", " id=\"geolevel\">\n ", "\n</select>"])), function (e) {
  selectGeoLevel(e.target.value);
}, tilesets.map(function (tileset) {
  return (0, _nanohtml["default"])(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["<option value=\"", "\" ", ">", "</option>"])), tileset.id, tileset.id === geoRegion.id ? 'selected' : '', tileset.label);
}));
footer.appendChild(geoSelect);
footer.appendChild(dateEl); // optimizations for this: load directly as an array and do not parse into objects
// store already loaded data in some way and only load new data as necessary
// read more about deckgl / webgl performance
// show loading animation while loading

function getData() {
  return _getData.apply(this, arguments);
}

function _getData() {
  _getData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var d, dateStr, newData;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            currentDateIndex++;
            if (currentDateIndex > numDates) currentDateIndex = 0;
            d = new Date();
            d.setDate(-numDates + currentDateIndex);
            dateStr = d.toLocaleDateString('en-CA'); //date.format(d, 'YYYY-MM-DD')

            dateEl.innerHTML = generateDate(dateStr);
            _context.next = 8;
            return (0, _core.load)("".concat(baseURL).concat(datasetPath).concat(dataset, "/").concat(geoRegion.id, "/values-by-date/").concat(dateStr, ".csv"), _csv.CSVLoader);

          case 8:
            newData = _context.sent;
            // console.log('loaded', newData, geoRegion)
            geoRegion.mobility = geoRegion.mobility.map(function (_, i) {
              return newData[i].mobility;
            }); //gemeinden: new Array(11431).fill(0).map((_, i) => Math.random()),
            //kreise: new Array(432).fill(0).map((_, i) => Math.random())

            render();

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getData.apply(this, arguments);
}

getData();

function selectGeoLevel(id) {
  tilesets.forEach(function (tileset) {
    if (tileset.id === id) {
      tileset.visible = true;
      geoRegion = tileset;
    } else {
      tileset.visible = false;
    }
  });
}

function render() {
  // console.log(tilesets, 'tilesets')
  var layers = tilesets.map(function (tileset) {
    return new MVTLayer({
      // id: tileset.id,
      id: tileset.label,
      data: tileset.tiles,
      pickable: tileset.visible,
      getFillColor: function getFillColor(obj) {
        //console.log('getting mobility at', obj.id, tileset.mobility)
        var j = tileset.mobility[obj.id];
        return [j * 255, j * 255, j * 255]; //return [Math.random() * 255, Math.random() * 255, Math.random() * 255]
      },
      getLineWidth: 4,
      transitions: {
        getFillColor: 100
      },
      updateTriggers: {
        // if currentDateIndex changes, recompute getFillColor for each point
        getFillColor: [currentDateIndex]
      },
      visible: tileset.visible,
      lineWidthMinPixels: 0,
      maxZoom: 13,
      minZoom: 0
    });
  });
  viz.setProps({
    layers: layers
  });
}

viz = new DeckGL({
  initialViewState: {
    // longitude: -122.4,
    latitude: 51.66403781658121,
    longitude: 10.6460952758789,
    // latitude: 37.74,
    // longitude: 13.765869,
    //13.765869,54.117382
    zoom: 6,
    maxZoom: 20,
    pitch: 30,
    bearing: 0
  },
  controller: true,
  getTooltip: function getTooltip(_ref) {
    var object = _ref.object;

    if (object) {
      console.log(object);
      return "".concat(object.properties.GEN, " mobility ").concat(geoRegion.mobility[object.id]);
    }

    return null;
  } //layers: [layer]

});
setInterval(function () {
  //  console.log(shouldUpdate)
  // fakeData.laender = fakeData.laender.map((_, i) => Math.random())
  // fakeData.kreise = fakeData.kreise.map((_, i) => Math.random())
  //fakeData[geoRegion] = fakeData[geoRegion].map((_, i) => Math.random())
  //gemeinden: new Array(11431).fill(0).map((_, i) => Math.random()),
  //kreise: new Array(432).fill(0).map((_, i) => Math.random())
  //render()
  getData(); // shouldUpdate ++
}, 2000);
document.body.appendChild(footer); //   const tileURL = `${window.location.origin}/gemeinden-z7-uncompressed/{z}/{x}/{y}.pbf`
// const DATA = [
//     tileURL
//     //'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt'
//   ]
// function render () {
// const gemeinden = new MVTLayer({
//   id: 'gemeindengeo',
//   data: DATA,
//   pickable: true,
//   getFillColor: () => {
//    // console.log(shouldUpdate)
//    return [Math.random() * 255, Math.random() * 255, Math.random() * 255]
//   },
//   getLineColor: () => [Math.random() * 255, Math.random() * 255, Math.random() * 255],
//   getLineWidth: 4,
//   transitions: {
//     getFillColor: 100,
//   },
//   updateTriggers: {
//     // if showLibraries changes, recompute getFillColor for each point
//     getFillColor: [shouldUpdate]
//   },
//   lineWidthMinPixels: 1,
//   /* props from MVTLayer class */
//   // binary: false,
//   // highlightedFeatureId: null,
//   // loaders: ,
//   // uniqueIdProperty: '',
//   /* props inherited from TileLayer class */
//   // extent: null,
//   // getTileData: null,
//   // maxCacheByteSize: null,
//   // maxCacheSize: null,
//   // maxRequests: 6,
//   maxZoom: 13,
//   minZoom: 7,
//   // onTileError: null,
//   // onTileLoad: null,
//   // onTileUnload: null,
//   // onViewportLoad: null,
//   // refinementStrategy: 'best-available',
//   // renderSubLayers: null,
//   // tileSize: 512,
//   // zRange: null,
//   /* props inherited from Layer class */
//   // autoHighlight: false,
//   // coordinateOrigin: [0, 0, 0],
//   // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
//   // highlightColor: [0, 0, 128, 128],
//   // modelMatrix: null,
//   // opacity: 1,
//   // pickable: false,
//   // visible: true,
//   // wrapLongitude: false,
// });

},{"@loaders.gl/core":34,"@loaders.gl/csv":70,"nanohtml":135}],2:[function(require,module,exports){
var AwaitValue = require("./AwaitValue.js");

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
      var wrappedAwait = value instanceof AwaitValue;
      Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
        if (wrappedAwait) {
          resume(key === "return" ? "return" : "next", arg);
          return;
        }

        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
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

  if (typeof gen["return"] !== "function") {
    this["return"] = undefined;
  }
}

AsyncGenerator.prototype[typeof Symbol === "function" && Symbol.asyncIterator || "@@asyncIterator"] = function () {
  return this;
};

AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};

AsyncGenerator.prototype["throw"] = function (arg) {
  return this._invoke("throw", arg);
};

AsyncGenerator.prototype["return"] = function (arg) {
  return this._invoke("return", arg);
};

module.exports = AsyncGenerator;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./AwaitValue.js":3}],3:[function(require,module,exports){
function _AwaitValue(value) {
  this.wrapped = value;
}

module.exports = _AwaitValue;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],4:[function(require,module,exports){
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],5:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],6:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./arrayLikeToArray.js":4}],7:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],8:[function(require,module,exports){
function _asyncGeneratorDelegate(inner, awaitWrap) {
  var iter = {},
      waiting = false;

  function pump(key, value) {
    waiting = true;
    value = new Promise(function (resolve) {
      resolve(inner[key](value));
    });
    return {
      done: false,
      value: awaitWrap(value)
    };
  }

  ;

  iter[typeof Symbol !== "undefined" && Symbol.iterator || "@@iterator"] = function () {
    return this;
  };

  iter.next = function (value) {
    if (waiting) {
      waiting = false;
      return value;
    }

    return pump("next", value);
  };

  if (typeof inner["throw"] === "function") {
    iter["throw"] = function (value) {
      if (waiting) {
        waiting = false;
        throw value;
      }

      return pump("throw", value);
    };
  }

  if (typeof inner["return"] === "function") {
    iter["return"] = function (value) {
      if (waiting) {
        waiting = false;
        return value;
      }

      return pump("return", value);
    };
  }

  return iter;
}

module.exports = _asyncGeneratorDelegate;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],9:[function(require,module,exports){
function _asyncIterator(iterable) {
  var method;

  if (typeof Symbol !== "undefined") {
    if (Symbol.asyncIterator) method = iterable[Symbol.asyncIterator];
    if (method == null && Symbol.iterator) method = iterable[Symbol.iterator];
  }

  if (method == null) method = iterable["@@asyncIterator"];
  if (method == null) method = iterable["@@iterator"];
  if (method == null) throw new TypeError("Object is not async iterable");
  return method.call(iterable);
}

module.exports = _asyncIterator;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],10:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],11:[function(require,module,exports){
var AwaitValue = require("./AwaitValue.js");

function _awaitAsyncGenerator(value) {
  return new AwaitValue(value);
}

module.exports = _awaitAsyncGenerator;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./AwaitValue.js":3}],12:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],13:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf.js");

var isNativeReflectConstruct = require("./isNativeReflectConstruct.js");

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct;
    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _construct.apply(null, arguments);
}

module.exports = _construct;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./isNativeReflectConstruct.js":20,"./setPrototypeOf.js":26}],14:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],15:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],16:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],17:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./setPrototypeOf.js":26}],18:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],19:[function(require,module,exports){
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

module.exports = _isNativeFunction;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],20:[function(require,module,exports){
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = _isNativeReflectConstruct;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],21:[function(require,module,exports){
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

module.exports = _iterableToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],22:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],23:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],24:[function(require,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],25:[function(require,module,exports){
var _typeof = require("@babel/runtime/helpers/typeof")["default"];

var assertThisInitialized = require("./assertThisInitialized.js");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./assertThisInitialized.js":7,"@babel/runtime/helpers/typeof":29}],26:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],27:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles.js");

var iterableToArrayLimit = require("./iterableToArrayLimit.js");

var unsupportedIterableToArray = require("./unsupportedIterableToArray.js");

var nonIterableRest = require("./nonIterableRest.js");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./arrayWithHoles.js":5,"./iterableToArrayLimit.js":22,"./nonIterableRest.js":23,"./unsupportedIterableToArray.js":30}],28:[function(require,module,exports){
var arrayWithoutHoles = require("./arrayWithoutHoles.js");

var iterableToArray = require("./iterableToArray.js");

var unsupportedIterableToArray = require("./unsupportedIterableToArray.js");

var nonIterableSpread = require("./nonIterableSpread.js");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./arrayWithoutHoles.js":6,"./iterableToArray.js":21,"./nonIterableSpread.js":24,"./unsupportedIterableToArray.js":30}],29:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],30:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./arrayLikeToArray.js":4}],31:[function(require,module,exports){
var AsyncGenerator = require("./AsyncGenerator.js");

function _wrapAsyncGenerator(fn) {
  return function () {
    return new AsyncGenerator(fn.apply(this, arguments));
  };
}

module.exports = _wrapAsyncGenerator;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./AsyncGenerator.js":2}],32:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf.js");

var setPrototypeOf = require("./setPrototypeOf.js");

var isNativeFunction = require("./isNativeFunction.js");

var construct = require("./construct.js");

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return construct(Class, arguments, getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return setPrototypeOf(Wrapper, Class);
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _wrapNativeSuper(Class);
}

module.exports = _wrapNativeSuper;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./construct.js":13,"./getPrototypeOf.js":16,"./isNativeFunction.js":19,"./setPrototypeOf.js":26}],33:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":154}],34:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "fetchFile", {
  enumerable: true,
  get: function get() {
    return _fetchFile.fetchFile;
  }
});
Object.defineProperty(exports, "readArrayBuffer", {
  enumerable: true,
  get: function get() {
    return _readArrayBuffer.readArrayBuffer;
  }
});
Object.defineProperty(exports, "readFileSync", {
  enumerable: true,
  get: function get() {
    return _readFile.readFileSync;
  }
});
Object.defineProperty(exports, "writeFile", {
  enumerable: true,
  get: function get() {
    return _writeFile.writeFile;
  }
});
Object.defineProperty(exports, "writeFileSync", {
  enumerable: true,
  get: function get() {
    return _writeFile.writeFileSync;
  }
});
Object.defineProperty(exports, "setLoaderOptions", {
  enumerable: true,
  get: function get() {
    return _setLoaderOptions.setLoaderOptions;
  }
});
Object.defineProperty(exports, "registerLoaders", {
  enumerable: true,
  get: function get() {
    return _registerLoaders.registerLoaders;
  }
});
Object.defineProperty(exports, "_unregisterLoaders", {
  enumerable: true,
  get: function get() {
    return _registerLoaders._unregisterLoaders;
  }
});
Object.defineProperty(exports, "selectLoader", {
  enumerable: true,
  get: function get() {
    return _selectLoader.selectLoader;
  }
});
Object.defineProperty(exports, "selectLoaderSync", {
  enumerable: true,
  get: function get() {
    return _selectLoader.selectLoaderSync;
  }
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function get() {
    return _parse.parse;
  }
});
Object.defineProperty(exports, "parseSync", {
  enumerable: true,
  get: function get() {
    return _parseSync.parseSync;
  }
});
Object.defineProperty(exports, "parseInBatches", {
  enumerable: true,
  get: function get() {
    return _parseInBatches.parseInBatches;
  }
});
Object.defineProperty(exports, "load", {
  enumerable: true,
  get: function get() {
    return _load.load;
  }
});
Object.defineProperty(exports, "loadInBatches", {
  enumerable: true,
  get: function get() {
    return _loadInBatches.loadInBatches;
  }
});
Object.defineProperty(exports, "encode", {
  enumerable: true,
  get: function get() {
    return _encode.encode;
  }
});
Object.defineProperty(exports, "encodeSync", {
  enumerable: true,
  get: function get() {
    return _encode.encodeSync;
  }
});
Object.defineProperty(exports, "encodeInBatches", {
  enumerable: true,
  get: function get() {
    return _encode.encodeInBatches;
  }
});
Object.defineProperty(exports, "encodeText", {
  enumerable: true,
  get: function get() {
    return _encode.encodeText;
  }
});
Object.defineProperty(exports, "encodeURLtoURL", {
  enumerable: true,
  get: function get() {
    return _encode.encodeURLtoURL;
  }
});
Object.defineProperty(exports, "save", {
  enumerable: true,
  get: function get() {
    return _save.save;
  }
});
Object.defineProperty(exports, "saveSync", {
  enumerable: true,
  get: function get() {
    return _save.saveSync;
  }
});
Object.defineProperty(exports, "setPathPrefix", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.setPathPrefix;
  }
});
Object.defineProperty(exports, "getPathPrefix", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.getPathPrefix;
  }
});
Object.defineProperty(exports, "resolvePath", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.resolvePath;
  }
});
Object.defineProperty(exports, "RequestScheduler", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.RequestScheduler;
  }
});
Object.defineProperty(exports, "JSONLoader", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.JSONLoader;
  }
});
Object.defineProperty(exports, "isBrowser", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.isBrowser;
  }
});
Object.defineProperty(exports, "isWorker", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.isWorker;
  }
});
Object.defineProperty(exports, "self", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.self;
  }
});
Object.defineProperty(exports, "window", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.window;
  }
});
Object.defineProperty(exports, "global", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.global;
  }
});
Object.defineProperty(exports, "document", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.document;
  }
});
Object.defineProperty(exports, "assert", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.assert;
  }
});
Object.defineProperty(exports, "forEach", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.forEach;
  }
});
Object.defineProperty(exports, "concatenateArrayBuffersAsync", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.concatenateArrayBuffersAsync;
  }
});
Object.defineProperty(exports, "makeTextDecoderIterator", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.makeTextDecoderIterator;
  }
});
Object.defineProperty(exports, "makeTextEncoderIterator", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.makeTextEncoderIterator;
  }
});
Object.defineProperty(exports, "makeLineIterator", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.makeLineIterator;
  }
});
Object.defineProperty(exports, "makeNumberedLineIterator", {
  enumerable: true,
  get: function get() {
    return _loaderUtils.makeNumberedLineIterator;
  }
});
Object.defineProperty(exports, "makeIterator", {
  enumerable: true,
  get: function get() {
    return _makeIterator.makeIterator;
  }
});
Object.defineProperty(exports, "makeStream", {
  enumerable: true,
  get: function get() {
    return _makeStream.makeStream;
  }
});
Object.defineProperty(exports, "makeDOMStream", {
  enumerable: true,
  get: function get() {
    return _makeDomStream.makeDOMStream;
  }
});
Object.defineProperty(exports, "makeNodeStream", {
  enumerable: true,
  get: function get() {
    return _makeNodeStream.default;
  }
});
Object.defineProperty(exports, "NullWorkerLoader", {
  enumerable: true,
  get: function get() {
    return _nullLoader.NullWorkerLoader;
  }
});
Object.defineProperty(exports, "NullLoader", {
  enumerable: true,
  get: function get() {
    return _nullLoader.NullLoader;
  }
});
Object.defineProperty(exports, "_fetchProgress", {
  enumerable: true,
  get: function get() {
    return _fetchProgress.default;
  }
});
Object.defineProperty(exports, "_BrowserFileSystem", {
  enumerable: true,
  get: function get() {
    return _browserFilesystem.default;
  }
});
Object.defineProperty(exports, "isPureObject", {
  enumerable: true,
  get: function get() {
    return _isType.isPureObject;
  }
});
Object.defineProperty(exports, "isPromise", {
  enumerable: true,
  get: function get() {
    return _isType.isPromise;
  }
});
Object.defineProperty(exports, "isIterable", {
  enumerable: true,
  get: function get() {
    return _isType.isIterable;
  }
});
Object.defineProperty(exports, "isAsyncIterable", {
  enumerable: true,
  get: function get() {
    return _isType.isAsyncIterable;
  }
});
Object.defineProperty(exports, "isIterator", {
  enumerable: true,
  get: function get() {
    return _isType.isIterator;
  }
});
Object.defineProperty(exports, "isResponse", {
  enumerable: true,
  get: function get() {
    return _isType.isResponse;
  }
});
Object.defineProperty(exports, "isReadableStream", {
  enumerable: true,
  get: function get() {
    return _isType.isReadableStream;
  }
});
Object.defineProperty(exports, "isWritableStream", {
  enumerable: true,
  get: function get() {
    return _isType.isWritableStream;
  }
});

var _fetchFile = require("./lib/fetch/fetch-file");

var _readArrayBuffer = require("./lib/fetch/read-array-buffer");

var _readFile = require("./lib/fetch/read-file");

var _writeFile = require("./lib/fetch/write-file");

var _setLoaderOptions = require("./lib/api/set-loader-options");

var _registerLoaders = require("./lib/api/register-loaders");

var _selectLoader = require("./lib/api/select-loader");

var _parse = require("./lib/api/parse");

var _parseSync = require("./lib/api/parse-sync");

var _parseInBatches = require("./lib/api/parse-in-batches");

var _load = require("./lib/api/load");

var _loadInBatches = require("./lib/api/load-in-batches");

var _encode = require("./lib/api/encode");

var _save = require("./lib/api/save");

var _loaderUtils = require("@loaders.gl/loader-utils");

var _makeIterator = require("./iterators/make-iterator/make-iterator");

var _makeStream = require("./iterators/make-stream/make-stream");

var _makeDomStream = require("./iterators/make-stream/make-dom-stream");

var _makeNodeStream = _interopRequireDefault(require("./iterators/make-stream/make-node-stream"));

var _nullLoader = require("./null-loader");

var _fetchProgress = _interopRequireDefault(require("./lib/progress/fetch-progress"));

var _browserFilesystem = _interopRequireDefault(require("./lib/filesystems/browser-filesystem"));

var _isType = require("./javascript-utils/is-type");

},{"./iterators/make-iterator/make-iterator":37,"./iterators/make-stream/make-dom-stream":40,"./iterators/make-stream/make-node-stream":130,"./iterators/make-stream/make-stream":41,"./javascript-utils/is-type":42,"./lib/api/encode":43,"./lib/api/load":45,"./lib/api/load-in-batches":44,"./lib/api/parse":48,"./lib/api/parse-in-batches":46,"./lib/api/parse-sync":47,"./lib/api/register-loaders":49,"./lib/api/save":50,"./lib/api/select-loader":51,"./lib/api/set-loader-options":52,"./lib/fetch/fetch-file":53,"./lib/fetch/read-array-buffer":54,"./lib/fetch/read-file":55,"./lib/fetch/write-file":56,"./lib/filesystems/browser-filesystem":57,"./lib/progress/fetch-progress":64,"./null-loader":68,"@babel/runtime/helpers/interopRequireDefault":18,"@loaders.gl/loader-utils":73}],35:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeArrayBufferIterator = makeArrayBufferIterator;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _marked = _regenerator.default.mark(makeArrayBufferIterator);

var DEFAULT_CHUNK_SIZE = 256 * 1024;

function makeArrayBufferIterator(arrayBuffer) {
  var options,
      _options$chunkSize,
      chunkSize,
      byteOffset,
      chunkByteLength,
      chunk,
      sourceArray,
      chunkArray,
      _args = arguments;

  return _regenerator.default.wrap(function makeArrayBufferIterator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
          _options$chunkSize = options.chunkSize, chunkSize = _options$chunkSize === void 0 ? DEFAULT_CHUNK_SIZE : _options$chunkSize;
          byteOffset = 0;

        case 3:
          if (!(byteOffset < arrayBuffer.byteLength)) {
            _context.next = 14;
            break;
          }

          chunkByteLength = Math.min(arrayBuffer.byteLength - byteOffset, chunkSize);
          chunk = new ArrayBuffer(chunkByteLength);
          sourceArray = new Uint8Array(arrayBuffer, byteOffset, chunkByteLength);
          chunkArray = new Uint8Array(chunk);
          chunkArray.set(sourceArray);
          byteOffset += chunkByteLength;
          _context.next = 12;
          return chunk;

        case 12:
          _context.next = 3;
          break;

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],36:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeBlobIterator = makeBlobIterator;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

var DEFAULT_CHUNK_SIZE = 1024 * 1024;

function makeBlobIterator(_x, _x2) {
  return _makeBlobIterator.apply(this, arguments);
}

function _makeBlobIterator() {
  _makeBlobIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee(blob, options) {
    var chunkSize, offset, end, chunk;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            chunkSize = (options === null || options === void 0 ? void 0 : options.chunkSize) || DEFAULT_CHUNK_SIZE;
            offset = 0;

          case 2:
            if (!(offset < blob.size)) {
              _context.next = 12;
              break;
            }

            end = offset + chunkSize;
            _context.next = 6;
            return (0, _awaitAsyncGenerator2.default)(blob.slice(offset, end).arrayBuffer());

          case 6:
            chunk = _context.sent;
            offset = end;
            _context.next = 10;
            return chunk;

          case 10:
            _context.next = 2;
            break;

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _makeBlobIterator.apply(this, arguments);
}

},{"@babel/runtime/helpers/awaitAsyncGenerator":11,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/wrapAsyncGenerator":31,"@babel/runtime/regenerator":33}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeIterator = makeIterator;

var _makeStringIterator = require("./make-string-iterator");

var _makeArrayBufferIterator = require("./make-array-buffer-iterator");

var _makeBlobIterator = require("./make-blob-iterator");

var _makeStreamIterator = require("./make-stream-iterator");

var _isType = require("../../javascript-utils/is-type");

function makeIterator(data, options) {
  if (typeof data === 'string') {
    return (0, _makeStringIterator.makeStringIterator)(data, options);
  }

  if (data instanceof ArrayBuffer) {
    return (0, _makeArrayBufferIterator.makeArrayBufferIterator)(data, options);
  }

  if ((0, _isType.isBlob)(data)) {
    return (0, _makeBlobIterator.makeBlobIterator)(data, options);
  }

  if ((0, _isType.isReadableStream)(data)) {
    return (0, _makeStreamIterator.makeStreamIterator)(data, options);
  }

  if ((0, _isType.isResponse)(data)) {
    var response = data;
    return (0, _makeStreamIterator.makeStreamIterator)(response.body, options);
  }

  throw new Error('makeIterator');
}

},{"../../javascript-utils/is-type":42,"./make-array-buffer-iterator":35,"./make-blob-iterator":36,"./make-stream-iterator":38,"./make-string-iterator":39}],38:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeStreamIterator = makeStreamIterator;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

var _loaderUtils = require("@loaders.gl/loader-utils");

function makeStreamIterator(stream, options) {
  return _loaderUtils.isBrowser ? makeBrowserStreamIterator(stream, options) : makeNodeStreamIterator(stream, options);
}

function makeBrowserStreamIterator(_x, _x2) {
  return _makeBrowserStreamIterator.apply(this, arguments);
}

function _makeBrowserStreamIterator() {
  _makeBrowserStreamIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee(stream, options) {
    var reader, nextBatchPromise, currentBatchPromise, _yield$_awaitAsyncGen, done, value;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            reader = stream.getReader();
            _context.prev = 1;

          case 2:
            if (!true) {
              _context.next = 16;
              break;
            }

            currentBatchPromise = nextBatchPromise || reader.read();

            if (options !== null && options !== void 0 && options._streamReadAhead) {
              nextBatchPromise = reader.read();
            }

            _context.next = 7;
            return (0, _awaitAsyncGenerator2.default)(currentBatchPromise);

          case 7:
            _yield$_awaitAsyncGen = _context.sent;
            done = _yield$_awaitAsyncGen.done;
            value = _yield$_awaitAsyncGen.value;

            if (!done) {
              _context.next = 12;
              break;
            }

            return _context.abrupt("return");

          case 12:
            _context.next = 14;
            return (0, _loaderUtils.toArrayBuffer)(value);

          case 14:
            _context.next = 2;
            break;

          case 16:
            _context.next = 21;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](1);
            reader.releaseLock();

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 18]]);
  }));
  return _makeBrowserStreamIterator.apply(this, arguments);
}

function makeNodeStreamIterator(_x3, _x4) {
  return _makeNodeStreamIterator.apply(this, arguments);
}

function _makeNodeStreamIterator() {
  _makeNodeStreamIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee2(stream, options) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context2.prev = 2;
            _iterator = (0, _asyncIterator2.default)(stream);

          case 4:
            _context2.next = 6;
            return (0, _awaitAsyncGenerator2.default)(_iterator.next());

          case 6:
            _step = _context2.sent;
            _iteratorNormalCompletion = _step.done;
            _context2.next = 10;
            return (0, _awaitAsyncGenerator2.default)(_step.value);

          case 10:
            _value = _context2.sent;

            if (_iteratorNormalCompletion) {
              _context2.next = 18;
              break;
            }

            chunk = _value;
            _context2.next = 15;
            return (0, _loaderUtils.toArrayBuffer)(chunk);

          case 15:
            _iteratorNormalCompletion = true;
            _context2.next = 4;
            break;

          case 18:
            _context2.next = 24;
            break;

          case 20:
            _context2.prev = 20;
            _context2.t0 = _context2["catch"](2);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 24:
            _context2.prev = 24;
            _context2.prev = 25;

            if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
              _context2.next = 29;
              break;
            }

            _context2.next = 29;
            return (0, _awaitAsyncGenerator2.default)(_iterator.return());

          case 29:
            _context2.prev = 29;

            if (!_didIteratorError) {
              _context2.next = 32;
              break;
            }

            throw _iteratorError;

          case 32:
            return _context2.finish(29);

          case 33:
            return _context2.finish(24);

          case 34:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 20, 24, 34], [25,, 29, 33]]);
  }));
  return _makeNodeStreamIterator.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/awaitAsyncGenerator":11,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/wrapAsyncGenerator":31,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],39:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeStringIterator = makeStringIterator;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _marked = _regenerator.default.mark(makeStringIterator);

var DEFAULT_CHUNK_SIZE = 256 * 1024;

function makeStringIterator(string, options) {
  var chunkSize, offset, textEncoder, chunkLength, chunk;
  return _regenerator.default.wrap(function makeStringIterator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          chunkSize = (options === null || options === void 0 ? void 0 : options.chunkSize) || DEFAULT_CHUNK_SIZE;
          offset = 0;
          textEncoder = new TextEncoder();

        case 3:
          if (!(offset < string.length)) {
            _context.next = 11;
            break;
          }

          chunkLength = Math.min(string.length - offset, chunkSize);
          chunk = string.slice(offset, offset + chunkLength);
          offset += chunkLength;
          _context.next = 9;
          return textEncoder.encode(chunk);

        case 9:
          _context.next = 3;
          break;

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],40:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeDOMStream = makeDOMStream;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function makeDOMStream(source, options) {
  var iterator = source[Symbol.asyncIterator] ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
  return new ReadableStream({
    type: 'bytes',
    pull: function pull(controller) {
      return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
        var _yield$iterator$next, done, value;

        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return iterator.next();

              case 3:
                _yield$iterator$next = _context.sent;
                done = _yield$iterator$next.done;
                value = _yield$iterator$next.value;

                if (done) {
                  controller.close();
                } else {
                  controller.enqueue(new Uint8Array(value));
                }

                _context.next = 12;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);
                controller.error(_context.t0);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 9]]);
      }))();
    },
    cancel: function cancel() {
      return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
        var _iterator$return;

        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return iterator === null || iterator === void 0 ? void 0 : (_iterator$return = iterator.return) === null || _iterator$return === void 0 ? void 0 : _iterator$return.call(iterator);

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    }
  }, _objectSpread({
    highWaterMark: Math.pow(2, 24)
  }, options));
}

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],41:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeStream = makeStream;

var _loaderUtils = require("@loaders.gl/loader-utils");

var _makeDomStream = require("./make-dom-stream");

var _makeNodeStream = _interopRequireDefault(require("./make-node-stream"));

function makeStream(data, options) {
  return _loaderUtils.isBrowser ? (0, _makeDomStream.makeDOMStream)(data, options) : (0, _makeNodeStream.default)(data, options);
}

},{"./make-dom-stream":40,"./make-node-stream":130,"@babel/runtime/helpers/interopRequireDefault":18,"@loaders.gl/loader-utils":73}],42:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isWritableStream = exports.isReadableStream = exports.isReadableNodeStream = exports.isWritableNodeStream = exports.isBuffer = exports.isReadableDOMStream = exports.isWritableDOMStream = exports.isBlob = exports.isFile = exports.isResponse = exports.isIterator = exports.isAsyncIterable = exports.isIterable = exports.isPromise = exports.isPureObject = exports.isObject = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var isBoolean = function isBoolean(x) {
  return typeof x === 'boolean';
};

var isFunction = function isFunction(x) {
  return typeof x === 'function';
};

var isObject = function isObject(x) {
  return x !== null && (0, _typeof2.default)(x) === 'object';
};

exports.isObject = isObject;

var isPureObject = function isPureObject(x) {
  return isObject(x) && x.constructor === {}.constructor;
};

exports.isPureObject = isPureObject;

var isPromise = function isPromise(x) {
  return isObject(x) && isFunction(x.then);
};

exports.isPromise = isPromise;

var isIterable = function isIterable(x) {
  return x && typeof x[Symbol.iterator] === 'function';
};

exports.isIterable = isIterable;

var isAsyncIterable = function isAsyncIterable(x) {
  return x && typeof x[Symbol.asyncIterator] === 'function';
};

exports.isAsyncIterable = isAsyncIterable;

var isIterator = function isIterator(x) {
  return x && isFunction(x.next);
};

exports.isIterator = isIterator;

var isResponse = function isResponse(x) {
  return typeof Response !== 'undefined' && x instanceof Response || x && x.arrayBuffer && x.text && x.json;
};

exports.isResponse = isResponse;

var isFile = function isFile(x) {
  return typeof File !== 'undefined' && x instanceof File;
};

exports.isFile = isFile;

var isBlob = function isBlob(x) {
  return typeof Blob !== 'undefined' && x instanceof Blob;
};

exports.isBlob = isBlob;

var isWritableDOMStream = function isWritableDOMStream(x) {
  return isObject(x) && isFunction(x.abort) && isFunction(x.getWriter);
};

exports.isWritableDOMStream = isWritableDOMStream;

var isReadableDOMStream = function isReadableDOMStream(x) {
  return typeof ReadableStream !== 'undefined' && x instanceof ReadableStream || isObject(x) && isFunction(x.tee) && isFunction(x.cancel) && isFunction(x.getReader);
};

exports.isReadableDOMStream = isReadableDOMStream;

var isBuffer = function isBuffer(x) {
  return x && (0, _typeof2.default)(x) === 'object' && x.isBuffer;
};

exports.isBuffer = isBuffer;

var isWritableNodeStream = function isWritableNodeStream(x) {
  return isObject(x) && isFunction(x.end) && isFunction(x.write) && isBoolean(x.writable);
};

exports.isWritableNodeStream = isWritableNodeStream;

var isReadableNodeStream = function isReadableNodeStream(x) {
  return isObject(x) && isFunction(x.read) && isFunction(x.pipe) && isBoolean(x.readable);
};

exports.isReadableNodeStream = isReadableNodeStream;

var isReadableStream = function isReadableStream(x) {
  return isReadableDOMStream(x) || isReadableNodeStream(x);
};

exports.isReadableStream = isReadableStream;

var isWritableStream = function isWritableStream(x) {
  return isWritableDOMStream(x) || isWritableNodeStream(x);
};

exports.isWritableStream = isWritableStream;

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29}],43:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encode = encode;
exports.encodeSync = encodeSync;
exports.encodeText = encodeText;
exports.encodeInBatches = encodeInBatches;
exports.encodeURLtoURL = encodeURLtoURL;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _loaderUtils = require("@loaders.gl/loader-utils");

var _writeFile = require("../fetch/write-file");

var _fetchFile = require("../fetch/fetch-file");

function encode(_x, _x2, _x3) {
  return _encode.apply(this, arguments);
}

function _encode() {
  _encode = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, writer, options) {
    var batches, chunks, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, batch, tmpInputFilename, tmpOutputFilename, outputFilename, response;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!writer.encode) {
              _context.next = 4;
              break;
            }

            _context.next = 3;
            return writer.encode(data, options);

          case 3:
            return _context.abrupt("return", _context.sent);

          case 4:
            if (!writer.encodeSync) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", writer.encodeSync(data, options));

          case 6:
            if (!writer.encodeText) {
              _context.next = 12;
              break;
            }

            _context.t0 = new TextEncoder();
            _context.next = 10;
            return writer.encodeText(data, options);

          case 10:
            _context.t1 = _context.sent;
            return _context.abrupt("return", _context.t0.encode.call(_context.t0, _context.t1));

          case 12:
            if (!writer.encodeInBatches) {
              _context.next = 49;
              break;
            }

            batches = encodeInBatches(data, writer, options);
            chunks = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context.prev = 17;
            _iterator = (0, _asyncIterator2.default)(batches);

          case 19:
            _context.next = 21;
            return _iterator.next();

          case 21:
            _step = _context.sent;
            _iteratorNormalCompletion = _step.done;
            _context.next = 25;
            return _step.value;

          case 25:
            _value = _context.sent;

            if (_iteratorNormalCompletion) {
              _context.next = 32;
              break;
            }

            batch = _value;
            chunks.push(batch);

          case 29:
            _iteratorNormalCompletion = true;
            _context.next = 19;
            break;

          case 32:
            _context.next = 38;
            break;

          case 34:
            _context.prev = 34;
            _context.t2 = _context["catch"](17);
            _didIteratorError = true;
            _iteratorError = _context.t2;

          case 38:
            _context.prev = 38;
            _context.prev = 39;

            if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
              _context.next = 43;
              break;
            }

            _context.next = 43;
            return _iterator.return();

          case 43:
            _context.prev = 43;

            if (!_didIteratorError) {
              _context.next = 46;
              break;
            }

            throw _iteratorError;

          case 46:
            return _context.finish(43);

          case 47:
            return _context.finish(38);

          case 48:
            return _context.abrupt("return", _loaderUtils.concatenateArrayBuffers.apply(void 0, chunks));

          case 49:
            if (!(!_loaderUtils.isBrowser && writer.encodeURLtoURL)) {
              _context.next = 61;
              break;
            }

            tmpInputFilename = getTemporaryFilename('input');
            _context.next = 53;
            return (0, _writeFile.writeFile)(tmpInputFilename, data);

          case 53:
            tmpOutputFilename = getTemporaryFilename('output');
            _context.next = 56;
            return encodeURLtoURL(tmpInputFilename, tmpOutputFilename, writer, options);

          case 56:
            outputFilename = _context.sent;
            _context.next = 59;
            return (0, _fetchFile.fetchFile)(outputFilename);

          case 59:
            response = _context.sent;
            return _context.abrupt("return", response.arrayBuffer());

          case 61:
            throw new Error('Writer could not encode data');

          case 62:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[17, 34, 38, 48], [39,, 43, 47]]);
  }));
  return _encode.apply(this, arguments);
}

function encodeSync(data, writer, options) {
  if (writer.encodeSync) {
    return writer.encodeSync(data, options);
  }

  throw new Error('Writer could not synchronously encode data');
}

function encodeText(_x4, _x5, _x6) {
  return _encodeText.apply(this, arguments);
}

function _encodeText() {
  _encodeText = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, writer, options) {
    var arrayBuffer;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(writer.text && writer.encodeText)) {
              _context2.next = 4;
              break;
            }

            _context2.next = 3;
            return writer.encodeText(data, options);

          case 3:
            return _context2.abrupt("return", _context2.sent);

          case 4:
            if (!(writer.text && (writer.encode || writer.encodeInBatches))) {
              _context2.next = 9;
              break;
            }

            _context2.next = 7;
            return encode(data, writer, options);

          case 7:
            arrayBuffer = _context2.sent;
            return _context2.abrupt("return", new TextDecoder().decode(arrayBuffer));

          case 9:
            throw new Error('Writer could not encode data as text');

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _encodeText.apply(this, arguments);
}

function encodeInBatches(data, writer, options) {
  if (writer.encodeInBatches) {
    var dataIterator = getIterator(data);
    return writer.encodeInBatches(dataIterator, options);
  }

  throw new Error('Writer could not encode data in batches');
}

function encodeURLtoURL(_x7, _x8, _x9, _x10) {
  return _encodeURLtoURL.apply(this, arguments);
}

function _encodeURLtoURL() {
  _encodeURLtoURL = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(inputUrl, outputUrl, writer, options) {
    var outputFilename;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            inputUrl = (0, _loaderUtils.resolvePath)(inputUrl);
            outputUrl = (0, _loaderUtils.resolvePath)(outputUrl);

            if (!(_loaderUtils.isBrowser || !writer.encodeURLtoURL)) {
              _context3.next = 4;
              break;
            }

            throw new Error();

          case 4:
            _context3.next = 6;
            return writer.encodeURLtoURL(inputUrl, outputUrl, options);

          case 6:
            outputFilename = _context3.sent;
            return _context3.abrupt("return", outputFilename);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _encodeURLtoURL.apply(this, arguments);
}

function getIterator(data) {
  var dataIterator = [{
    table: data,
    start: 0,
    end: data.length
  }];
  return dataIterator;
}

function getTemporaryFilename(filename) {
  return "/tmp/".concat(filename);
}

},{"../fetch/fetch-file":53,"../fetch/write-file":56,"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],44:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadInBatches = loadInBatches;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _normalizeLoader = require("../loader-utils/normalize-loader");

var _optionUtils = require("../loader-utils/option-utils");

var _parseInBatches = require("./parse-in-batches");

function loadInBatches(files, loaders, options, context) {
  if (!Array.isArray(loaders) && !(0, _normalizeLoader.isLoaderObject)(loaders)) {
    context = undefined;
    options = loaders;
    loaders = null;
  }

  var fetch = (0, _optionUtils.getFetchFunction)(options || {});

  if (!Array.isArray(files)) {
    return loadOneFileInBatches(files, loaders, options, fetch);
  }

  var promises = files.map(function (file) {
    return loadOneFileInBatches(file, loaders, options, fetch);
  });
  return promises;
}

function loadOneFileInBatches(_x, _x2, _x3, _x4) {
  return _loadOneFileInBatches.apply(this, arguments);
}

function _loadOneFileInBatches() {
  _loadOneFileInBatches = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(file, loaders, options, fetch) {
    var url, response;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof file === 'string')) {
              _context.next = 8;
              break;
            }

            url = file;
            _context.next = 4;
            return fetch(url);

          case 4:
            response = _context.sent;
            _context.next = 7;
            return (0, _parseInBatches.parseInBatches)(response, loaders, options);

          case 7:
            return _context.abrupt("return", _context.sent);

          case 8:
            _context.next = 10;
            return (0, _parseInBatches.parseInBatches)(file, loaders, options);

          case 10:
            return _context.abrupt("return", _context.sent);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _loadOneFileInBatches.apply(this, arguments);
}

},{"../loader-utils/normalize-loader":61,"../loader-utils/option-utils":63,"./parse-in-batches":46,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],45:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = load;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _isType = require("../../javascript-utils/is-type");

var _normalizeLoader = require("../loader-utils/normalize-loader");

var _optionUtils = require("../loader-utils/option-utils");

var _parse = require("./parse");

function load(_x, _x2, _x3, _x4) {
  return _load.apply(this, arguments);
}

function _load() {
  _load = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(url, loaders, options, context) {
    var fetch, data;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!Array.isArray(loaders) && !(0, _normalizeLoader.isLoaderObject)(loaders)) {
              context = undefined;
              options = loaders;
              loaders = undefined;
            }

            fetch = (0, _optionUtils.getFetchFunction)(options);
            data = url;

            if (!(typeof url === 'string')) {
              _context.next = 7;
              break;
            }

            _context.next = 6;
            return fetch(url);

          case 6:
            data = _context.sent;

          case 7:
            if (!(0, _isType.isBlob)(url)) {
              _context.next = 11;
              break;
            }

            _context.next = 10;
            return fetch(url);

          case 10:
            data = _context.sent;

          case 11:
            _context.next = 13;
            return (0, _parse.parse)(data, loaders, options);

          case 13:
            return _context.abrupt("return", _context.sent);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _load.apply(this, arguments);
}

},{"../../javascript-utils/is-type":42,"../loader-utils/normalize-loader":61,"../loader-utils/option-utils":63,"./parse":48,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],46:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseInBatches = parseInBatches;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _asyncGeneratorDelegate2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncGeneratorDelegate"));

var _loaderUtils = require("@loaders.gl/loader-utils");

var _normalizeLoader = require("../loader-utils/normalize-loader");

var _optionUtils = require("../loader-utils/option-utils");

var _loaderContext = require("../loader-utils/loader-context");

var _getData = require("../loader-utils/get-data");

var _resourceUtils = require("../utils/resource-utils");

var _selectLoader = require("./select-loader");

var _parse = require("./parse");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function parseInBatches(_x2, _x3, _x4, _x5) {
  return _parseInBatches.apply(this, arguments);
}

function _parseInBatches() {
  _parseInBatches = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, loaders, options, context) {
    var _getResourceUrlAndTyp, url, loader;

    return _regenerator.default.wrap(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            (0, _loaderUtils.assert)(!context || (0, _typeof2.default)(context) === 'object');

            if (!Array.isArray(loaders) && !(0, _normalizeLoader.isLoaderObject)(loaders)) {
              context = undefined;
              options = loaders;
              loaders = undefined;
            }

            _context3.next = 4;
            return data;

          case 4:
            data = _context3.sent;
            options = options || {};
            _getResourceUrlAndTyp = (0, _resourceUtils.getResourceUrlAndType)(data), url = _getResourceUrlAndTyp.url;
            _context3.next = 9;
            return (0, _selectLoader.selectLoader)(data, loaders, options);

          case 9:
            loader = _context3.sent;

            if (loader) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt("return", null);

          case 12:
            options = (0, _optionUtils.normalizeOptions)(options, loader, loaders, url);
            context = (0, _loaderContext.getLoaderContext)({
              url: url,
              parseInBatches: parseInBatches,
              parse: _parse.parse,
              loaders: loaders
            }, options, context);
            _context3.next = 16;
            return parseWithLoaderInBatches(loader, data, options, context);

          case 16:
            return _context3.abrupt("return", _context3.sent);

          case 17:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee2);
  }));
  return _parseInBatches.apply(this, arguments);
}

function parseWithLoaderInBatches(loader, data, options, context) {
  var outputIterator, metadataBatch, makeMetadataBatchIterator, _makeMetadataBatchIterator;

  return _regenerator.default.async(function parseWithLoaderInBatches$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _makeMetadataBatchIterator = function _makeMetadataBatchIte2() {
            _makeMetadataBatchIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee(iterator) {
              return _regenerator.default.wrap(function _callee$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return metadataBatch;

                    case 2:
                      return _context2.delegateYield((0, _asyncGeneratorDelegate2.default)((0, _asyncIterator2.default)(iterator), _awaitAsyncGenerator2.default), "t0", 3);

                    case 3:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee);
            }));
            return _makeMetadataBatchIterator.apply(this, arguments);
          };

          makeMetadataBatchIterator = function _makeMetadataBatchIte(_x) {
            return _makeMetadataBatchIterator.apply(this, arguments);
          };

          _context.next = 4;
          return _regenerator.default.awrap(parseToOutputIterator(loader, data, options, context));

        case 4:
          outputIterator = _context.sent;

          if (options.metadata) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", outputIterator);

        case 7:
          metadataBatch = {
            batchType: 'metadata',
            metadata: {
              _loader: loader,
              _context: context
            },
            data: [],
            bytesUsed: 0
          };
          return _context.abrupt("return", makeMetadataBatchIterator(outputIterator));

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, null, Promise);
}

function parseToOutputIterator(_x6, _x7, _x8, _x9) {
  return _parseToOutputIterator.apply(this, arguments);
}

function _parseToOutputIterator() {
  _parseToOutputIterator = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(loader, data, options, context) {
    var inputIterator, transformedIterator, parseChunkInBatches, _parseChunkInBatches;

    return _regenerator.default.wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _parseChunkInBatches = function _parseChunkInBatches3() {
              _parseChunkInBatches = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee3() {
                var arrayBuffer, parsedData, batch;
                return _regenerator.default.wrap(function _callee3$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return (0, _awaitAsyncGenerator2.default)((0, _loaderUtils.concatenateArrayBuffersAsync)(transformedIterator));

                      case 2:
                        arrayBuffer = _context4.sent;
                        _context4.next = 5;
                        return (0, _awaitAsyncGenerator2.default)((0, _parse.parse)(arrayBuffer, loader, _objectSpread(_objectSpread({}, options), {}, {
                          mimeType: loader.mimeTypes[0]
                        }), context));

                      case 5:
                        parsedData = _context4.sent;
                        batch = {
                          mimeType: loader.mimeTypes[0],
                          shape: Array.isArray(parsedData) ? 'row-table' : 'unknown',
                          batchType: 'data',
                          data: parsedData,
                          length: Array.isArray(parsedData) ? parsedData.length : 1
                        };
                        _context4.next = 9;
                        return batch;

                      case 9:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee3);
              }));
              return _parseChunkInBatches.apply(this, arguments);
            };

            parseChunkInBatches = function _parseChunkInBatches2() {
              return _parseChunkInBatches.apply(this, arguments);
            };

            _context5.next = 4;
            return (0, _getData.getAsyncIterableFromData)(data, options);

          case 4:
            inputIterator = _context5.sent;
            _context5.next = 7;
            return applyInputTransforms(inputIterator, (options === null || options === void 0 ? void 0 : options.transforms) || []);

          case 7:
            transformedIterator = _context5.sent;

            if (!loader.parseInBatches) {
              _context5.next = 10;
              break;
            }

            return _context5.abrupt("return", loader.parseInBatches(transformedIterator, options, context));

          case 10:
            return _context5.abrupt("return", parseChunkInBatches());

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee4);
  }));
  return _parseToOutputIterator.apply(this, arguments);
}

function applyInputTransforms(_x10) {
  return _applyInputTransforms.apply(this, arguments);
}

function _applyInputTransforms() {
  _applyInputTransforms = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee5(inputIterator) {
    var transforms,
        iteratorChain,
        _iteratorNormalCompletion,
        _didIteratorError,
        _iteratorError,
        _iterator,
        _step,
        _value,
        transformBatches,
        _args6 = arguments;

    return _regenerator.default.wrap(function _callee5$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            transforms = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : [];
            iteratorChain = inputIterator;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context6.prev = 4;
            _iterator = (0, _asyncIterator2.default)(transforms);

          case 6:
            _context6.next = 8;
            return _iterator.next();

          case 8:
            _step = _context6.sent;
            _iteratorNormalCompletion = _step.done;
            _context6.next = 12;
            return _step.value;

          case 12:
            _value = _context6.sent;

            if (_iteratorNormalCompletion) {
              _context6.next = 19;
              break;
            }

            transformBatches = _value;
            iteratorChain = transformBatches(iteratorChain);

          case 16:
            _iteratorNormalCompletion = true;
            _context6.next = 6;
            break;

          case 19:
            _context6.next = 25;
            break;

          case 21:
            _context6.prev = 21;
            _context6.t0 = _context6["catch"](4);
            _didIteratorError = true;
            _iteratorError = _context6.t0;

          case 25:
            _context6.prev = 25;
            _context6.prev = 26;

            if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
              _context6.next = 30;
              break;
            }

            _context6.next = 30;
            return _iterator.return();

          case 30:
            _context6.prev = 30;

            if (!_didIteratorError) {
              _context6.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context6.finish(30);

          case 34:
            return _context6.finish(25);

          case 35:
            return _context6.abrupt("return", iteratorChain);

          case 36:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee5, null, [[4, 21, 25, 35], [26,, 30, 34]]);
  }));
  return _applyInputTransforms.apply(this, arguments);
}

},{"../loader-utils/get-data":58,"../loader-utils/loader-context":59,"../loader-utils/normalize-loader":61,"../loader-utils/option-utils":63,"../utils/resource-utils":66,"./parse":48,"./select-loader":51,"@babel/runtime/helpers/asyncGeneratorDelegate":8,"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/awaitAsyncGenerator":11,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"@babel/runtime/helpers/wrapAsyncGenerator":31,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],47:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSync = parseSync;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _loaderUtils = require("@loaders.gl/loader-utils");

var _selectLoader = require("./select-loader");

var _normalizeLoader = require("../loader-utils/normalize-loader");

var _optionUtils = require("../loader-utils/option-utils");

var _getData = require("../loader-utils/get-data");

var _loaderContext = require("../loader-utils/loader-context");

var _resourceUtils = require("../utils/resource-utils");

function parseSync(data, loaders, options, context) {
  (0, _loaderUtils.assert)(!context || (0, _typeof2.default)(context) === 'object');

  if (!Array.isArray(loaders) && !(0, _normalizeLoader.isLoaderObject)(loaders)) {
    context = undefined;
    options = loaders;
    loaders = undefined;
  }

  options = options || {};
  var typedLoaders = loaders;
  var candidateLoaders = (0, _loaderContext.getLoadersFromContext)(typedLoaders, context);
  var loader = (0, _selectLoader.selectLoaderSync)(data, candidateLoaders, options);

  if (!loader) {
    return null;
  }

  options = (0, _optionUtils.normalizeOptions)(options, loader, candidateLoaders);

  var _getResourceUrlAndTyp = (0, _resourceUtils.getResourceUrlAndType)(data),
      url = _getResourceUrlAndTyp.url;

  var parse = function parse() {
    throw new Error('parseSync called parse');
  };

  context = (0, _loaderContext.getLoaderContext)({
    url: url,
    parseSync: parseSync,
    parse: parse,
    loaders: loaders
  }, options);
  return parseWithLoaderSync(loader, data, options, context);
}

function parseWithLoaderSync(loader, data, options, context) {
  data = (0, _getData.getArrayBufferOrStringFromDataSync)(data, loader, options);

  if (loader.parseTextSync && typeof data === 'string') {
    return loader.parseTextSync(data, options);
  }

  if (loader.parseSync && data instanceof ArrayBuffer) {
    return loader.parseSync(data, options, context);
  }

  throw new Error("".concat(loader.name, " loader: 'parseSync' not supported by this loader, use 'parse' instead. ").concat(context.url || ''));
}

},{"../loader-utils/get-data":58,"../loader-utils/loader-context":59,"../loader-utils/normalize-loader":61,"../loader-utils/option-utils":63,"../utils/resource-utils":66,"./select-loader":51,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"@loaders.gl/loader-utils":73}],48:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _workerUtils = require("@loaders.gl/worker-utils");

var _loaderUtils = require("@loaders.gl/loader-utils");

var _normalizeLoader = require("../loader-utils/normalize-loader");

var _optionUtils = require("../loader-utils/option-utils");

var _getData = require("../loader-utils/get-data");

var _loaderContext = require("../loader-utils/loader-context");

var _resourceUtils = require("../utils/resource-utils");

var _selectLoader = require("./select-loader");

function parse(_x, _x2, _x3, _x4) {
  return _parse.apply(this, arguments);
}

function _parse() {
  _parse = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, loaders, options, context) {
    var _getResourceUrlAndTyp, url, typedLoaders, candidateLoaders, loader;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            (0, _workerUtils.assert)(!context || (0, _typeof2.default)(context) === 'object');

            if (loaders && !Array.isArray(loaders) && !(0, _normalizeLoader.isLoaderObject)(loaders)) {
              context = undefined;
              options = loaders;
              loaders = undefined;
            }

            _context.next = 4;
            return data;

          case 4:
            data = _context.sent;
            options = options || {};
            _getResourceUrlAndTyp = (0, _resourceUtils.getResourceUrlAndType)(data), url = _getResourceUrlAndTyp.url;
            typedLoaders = loaders;
            candidateLoaders = (0, _loaderContext.getLoadersFromContext)(typedLoaders, context);
            _context.next = 11;
            return (0, _selectLoader.selectLoader)(data, candidateLoaders, options);

          case 11:
            loader = _context.sent;

            if (loader) {
              _context.next = 14;
              break;
            }

            return _context.abrupt("return", null);

          case 14:
            options = (0, _optionUtils.normalizeOptions)(options, loader, candidateLoaders, url);
            context = (0, _loaderContext.getLoaderContext)({
              url: url,
              parse: parse,
              loaders: candidateLoaders
            }, options, context);
            _context.next = 18;
            return parseWithLoader(loader, data, options, context);

          case 18:
            return _context.abrupt("return", _context.sent);

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _parse.apply(this, arguments);
}

function parseWithLoader(_x5, _x6, _x7, _x8) {
  return _parseWithLoader.apply(this, arguments);
}

function _parseWithLoader() {
  _parseWithLoader = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(loader, data, options, context) {
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            (0, _workerUtils.validateWorkerVersion)(loader);
            _context2.next = 3;
            return (0, _getData.getArrayBufferOrStringFromData)(data, loader, options);

          case 3:
            data = _context2.sent;

            if (!(loader.parseTextSync && typeof data === 'string')) {
              _context2.next = 7;
              break;
            }

            options.dataType = 'text';
            return _context2.abrupt("return", loader.parseTextSync(data, options, context, loader));

          case 7:
            if (!(0, _loaderUtils.canParseWithWorker)(loader, options)) {
              _context2.next = 11;
              break;
            }

            _context2.next = 10;
            return (0, _loaderUtils.parseWithWorker)(loader, data, options, context, parse);

          case 10:
            return _context2.abrupt("return", _context2.sent);

          case 11:
            if (!(loader.parseText && typeof data === 'string')) {
              _context2.next = 15;
              break;
            }

            _context2.next = 14;
            return loader.parseText(data, options, context, loader);

          case 14:
            return _context2.abrupt("return", _context2.sent);

          case 15:
            if (!loader.parse) {
              _context2.next = 19;
              break;
            }

            _context2.next = 18;
            return loader.parse(data, options, context, loader);

          case 18:
            return _context2.abrupt("return", _context2.sent);

          case 19:
            (0, _workerUtils.assert)(!loader.parseSync);
            throw new Error("".concat(loader.id, " loader - no parser found and worker is disabled"));

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _parseWithLoader.apply(this, arguments);
}

},{"../loader-utils/get-data":58,"../loader-utils/loader-context":59,"../loader-utils/normalize-loader":61,"../loader-utils/option-utils":63,"../utils/resource-utils":66,"./select-loader":51,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73,"@loaders.gl/worker-utils":108}],49:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerLoaders = registerLoaders;
exports.getRegisteredLoaders = getRegisteredLoaders;
exports._unregisterLoaders = _unregisterLoaders;

var _normalizeLoader = require("../loader-utils/normalize-loader");

var _optionUtils = require("../loader-utils/option-utils");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var getGlobalLoaderRegistry = function getGlobalLoaderRegistry() {
  var state = (0, _optionUtils.getGlobalLoaderState)();
  state.loaderRegistry = state.loaderRegistry || [];
  return state.loaderRegistry;
};

function registerLoaders(loaders) {
  var loaderRegistry = getGlobalLoaderRegistry();
  loaders = Array.isArray(loaders) ? loaders : [loaders];

  var _iterator = _createForOfIteratorHelper(loaders),
      _step;

  try {
    var _loop = function _loop() {
      var loader = _step.value;
      var normalizedLoader = (0, _normalizeLoader.normalizeLoader)(loader);

      if (!loaderRegistry.find(function (registeredLoader) {
        return normalizedLoader === registeredLoader;
      })) {
        loaderRegistry.unshift(normalizedLoader);
      }
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function getRegisteredLoaders() {
  return getGlobalLoaderRegistry();
}

function _unregisterLoaders() {
  var state = (0, _optionUtils.getGlobalLoaderState)();
  state.loaderRegistry = [];
}

},{"../loader-utils/normalize-loader":61,"../loader-utils/option-utils":63}],50:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = save;
exports.saveSync = saveSync;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _encode = require("./encode");

var _writeFile = require("../fetch/write-file");

function save(_x, _x2, _x3, _x4) {
  return _save.apply(this, arguments);
}

function _save() {
  _save = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, url, writer, options) {
    var encodedData;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _encode.encode)(data, writer, options);

          case 2:
            encodedData = _context.sent;
            _context.next = 5;
            return (0, _writeFile.writeFile)(url, encodedData);

          case 5:
            return _context.abrupt("return", _context.sent);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _save.apply(this, arguments);
}

function saveSync(data, url, writer, options) {
  var encodedData = (0, _encode.encodeSync)(data, writer, options);
  return (0, _writeFile.writeFileSync)(url, encodedData);
}

},{"../fetch/write-file":56,"./encode":43,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],51:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectLoader = selectLoader;
exports.selectLoaderSync = selectLoaderSync;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _loaderUtils = require("@loaders.gl/loader-utils");

var _normalizeLoader = require("../loader-utils/normalize-loader");

var _resourceUtils = require("../utils/resource-utils");

var _registerLoaders = require("./register-loaders");

var _isType = require("../../javascript-utils/is-type");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var EXT_PATTERN = /\.([^.]+)$/;

function selectLoader(_x) {
  return _selectLoader.apply(this, arguments);
}

function _selectLoader() {
  _selectLoader = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data) {
    var loaders,
        options,
        context,
        loader,
        _args = arguments;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            loaders = _args.length > 1 && _args[1] !== undefined ? _args[1] : [];
            options = _args.length > 2 ? _args[2] : undefined;
            context = _args.length > 3 ? _args[3] : undefined;

            if (validHTTPResponse(data)) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", null);

          case 5:
            loader = selectLoaderSync(data, loaders, _objectSpread(_objectSpread({}, options), {}, {
              nothrow: true
            }), context);

            if (!loader) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return", loader);

          case 8:
            if (!(0, _isType.isBlob)(data)) {
              _context.next = 13;
              break;
            }

            _context.next = 11;
            return data.slice(0, 10).arrayBuffer();

          case 11:
            data = _context.sent;
            loader = selectLoaderSync(data, loaders, options, context);

          case 13:
            if (!(!loader && !(options !== null && options !== void 0 && options.nothrow))) {
              _context.next = 15;
              break;
            }

            throw new Error(getNoValidLoaderMessage(data));

          case 15:
            return _context.abrupt("return", loader);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _selectLoader.apply(this, arguments);
}

function selectLoaderSync(data) {
  var loaders = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var options = arguments.length > 2 ? arguments[2] : undefined;
  var context = arguments.length > 3 ? arguments[3] : undefined;

  if (!validHTTPResponse(data)) {
    return null;
  }

  if (loaders && !Array.isArray(loaders)) {
    return (0, _normalizeLoader.normalizeLoader)(loaders);
  }

  var candidateLoaders = [];

  if (loaders) {
    candidateLoaders = candidateLoaders.concat(loaders);
  }

  if (!(options !== null && options !== void 0 && options.ignoreRegisteredLoaders)) {
    var _candidateLoaders;

    (_candidateLoaders = candidateLoaders).push.apply(_candidateLoaders, (0, _toConsumableArray2.default)((0, _registerLoaders.getRegisteredLoaders)()));
  }

  normalizeLoaders(candidateLoaders);
  var loader = selectLoaderInternal(data, candidateLoaders, options, context);

  if (!loader && !(options !== null && options !== void 0 && options.nothrow)) {
    throw new Error(getNoValidLoaderMessage(data));
  }

  return loader;
}

function selectLoaderInternal(data, loaders, options, context) {
  var _getResourceUrlAndTyp = (0, _resourceUtils.getResourceUrlAndType)(data),
      url = _getResourceUrlAndTyp.url,
      type = _getResourceUrlAndTyp.type;

  var testUrl = url || (context === null || context === void 0 ? void 0 : context.url);
  var loader = null;

  if (options !== null && options !== void 0 && options.mimeType) {
    loader = findLoaderByMIMEType(loaders, options === null || options === void 0 ? void 0 : options.mimeType);
  }

  loader = loader || findLoaderByUrl(loaders, testUrl);
  loader = loader || findLoaderByMIMEType(loaders, type);
  loader = loader || findLoaderByInitialBytes(loaders, data);
  loader = loader || findLoaderByMIMEType(loaders, options === null || options === void 0 ? void 0 : options.fallbackMimeType);
  return loader;
}

function validHTTPResponse(data) {
  if (data instanceof Response) {
    if (data.status === 204) {
      return false;
    }
  }

  return true;
}

function getNoValidLoaderMessage(data) {
  var _getResourceUrlAndTyp2 = (0, _resourceUtils.getResourceUrlAndType)(data),
      url = _getResourceUrlAndTyp2.url,
      type = _getResourceUrlAndTyp2.type;

  var message = 'No valid loader found';

  if (data) {
    message += " data: \"".concat(getFirstCharacters(data), "\", contentType: \"").concat(type, "\"");
  }

  if (url) {
    message += " url: ".concat(url);
  }

  return message;
}

function normalizeLoaders(loaders) {
  var _iterator = _createForOfIteratorHelper(loaders),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var loader = _step.value;
      (0, _normalizeLoader.normalizeLoader)(loader);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function findLoaderByUrl(loaders, url) {
  var match = url && EXT_PATTERN.exec(url);
  var extension = match && match[1];
  return extension ? findLoaderByExtension(loaders, extension) : null;
}

function findLoaderByExtension(loaders, extension) {
  extension = extension.toLowerCase();

  var _iterator2 = _createForOfIteratorHelper(loaders),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var loader = _step2.value;

      var _iterator3 = _createForOfIteratorHelper(loader.extensions),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var loaderExtension = _step3.value;

          if (loaderExtension.toLowerCase() === extension) {
            return loader;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return null;
}

function findLoaderByMIMEType(loaders, mimeType) {
  var _iterator4 = _createForOfIteratorHelper(loaders),
      _step4;

  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var loader = _step4.value;

      if (loader.mimeTypes && loader.mimeTypes.includes(mimeType)) {
        return loader;
      }

      if (mimeType === "application/x.".concat(loader.id)) {
        return loader;
      }
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }

  return null;
}

function findLoaderByInitialBytes(loaders, data) {
  if (!data) {
    return null;
  }

  var _iterator5 = _createForOfIteratorHelper(loaders),
      _step5;

  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var loader = _step5.value;

      if (typeof data === 'string') {
        if (testDataAgainstText(data, loader)) {
          return loader;
        }
      } else if (ArrayBuffer.isView(data)) {
        if (testDataAgainstBinary(data.buffer, data.byteOffset, loader)) {
          return loader;
        }
      } else if (data instanceof ArrayBuffer) {
        var byteOffset = 0;

        if (testDataAgainstBinary(data, byteOffset, loader)) {
          return loader;
        }
      }
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }

  return null;
}

function testDataAgainstText(data, loader) {
  if (loader.testText) {
    return loader.testText(data);
  }

  var tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
  return tests.some(function (test) {
    return data.startsWith(test);
  });
}

function testDataAgainstBinary(data, byteOffset, loader) {
  var tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
  return tests.some(function (test) {
    return testBinary(data, byteOffset, loader, test);
  });
}

function testBinary(data, byteOffset, loader, test) {
  if (test instanceof ArrayBuffer) {
    return (0, _loaderUtils.compareArrayBuffers)(test, data, test.byteLength);
  }

  switch ((0, _typeof2.default)(test)) {
    case 'function':
      return test(data, loader);

    case 'string':
      var magic = getMagicString(data, byteOffset, test.length);
      return test === magic;

    default:
      return false;
  }
}

function getFirstCharacters(data) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (typeof data === 'string') {
    return data.slice(0, length);
  } else if (ArrayBuffer.isView(data)) {
    return getMagicString(data.buffer, data.byteOffset, length);
  } else if (data instanceof ArrayBuffer) {
    var byteOffset = 0;
    return getMagicString(data, byteOffset, length);
  }

  return '';
}

function getMagicString(arrayBuffer, byteOffset, length) {
  if (arrayBuffer.byteLength < byteOffset + length) {
    return '';
  }

  var dataView = new DataView(arrayBuffer);
  var magic = '';

  for (var i = 0; i < length; i++) {
    magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
  }

  return magic;
}

},{"../../javascript-utils/is-type":42,"../loader-utils/normalize-loader":61,"../utils/resource-utils":66,"./register-loaders":49,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/toConsumableArray":28,"@babel/runtime/helpers/typeof":29,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLoaderOptions = setLoaderOptions;

var _optionUtils = require("../loader-utils/option-utils");

function setLoaderOptions(options) {
  (0, _optionUtils.setGlobalOptions)(options);
}

},{"../loader-utils/option-utils":63}],53:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchFile = fetchFile;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _loaderUtils = require("@loaders.gl/loader-utils");

var _responseUtils = require("../utils/response-utils");

function fetchFile(_x, _x2) {
  return _fetchFile.apply(this, arguments);
}

function _fetchFile() {
  _fetchFile = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(url, options) {
    var fetchOptions;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof url === 'string')) {
              _context.next = 7;
              break;
            }

            url = (0, _loaderUtils.resolvePath)(url);
            fetchOptions = options;

            if (options !== null && options !== void 0 && options.fetch && typeof (options === null || options === void 0 ? void 0 : options.fetch) !== 'function') {
              fetchOptions = options.fetch;
            }

            _context.next = 6;
            return fetch(url, fetchOptions);

          case 6:
            return _context.abrupt("return", _context.sent);

          case 7:
            _context.next = 9;
            return (0, _responseUtils.makeResponse)(url);

          case 9:
            return _context.abrupt("return", _context.sent);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _fetchFile.apply(this, arguments);
}

},{"../utils/response-utils":67,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],54:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readArrayBuffer = readArrayBuffer;
exports.readBlob = readBlob;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _loaderUtils = require("@loaders.gl/loader-utils");

function readArrayBuffer(_x, _x2, _x3) {
  return _readArrayBuffer.apply(this, arguments);
}

function _readArrayBuffer() {
  _readArrayBuffer = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(file, start, length) {
    var slice;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof file === 'number')) {
              _context.next = 4;
              break;
            }

            _context.next = 3;
            return _loaderUtils.fs._readToArrayBuffer(file, start, length);

          case 3:
            return _context.abrupt("return", _context.sent);

          case 4:
            if (!(file instanceof Blob)) {
              file = new Blob([file]);
            }

            slice = file.slice(start, start + length);
            _context.next = 8;
            return readBlob(slice);

          case 8:
            return _context.abrupt("return", _context.sent);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _readArrayBuffer.apply(this, arguments);
}

function readBlob(_x4) {
  return _readBlob.apply(this, arguments);
}

function _readBlob() {
  _readBlob = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(blob) {
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return new Promise(function (resolve, reject) {
              var fileReader = new FileReader();

              fileReader.onload = function (event) {
                var _event$target;

                return resolve(event === null || event === void 0 ? void 0 : (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.result);
              };

              fileReader.onerror = function (error) {
                return reject(error);
              };

              fileReader.readAsArrayBuffer(blob);
            });

          case 2:
            return _context2.abrupt("return", _context2.sent);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _readBlob.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readFileSync = readFileSync;

var _loaderUtils = require("@loaders.gl/loader-utils");

function readFileSync(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  url = (0, _loaderUtils.resolvePath)(url);

  if (!_loaderUtils.isBrowser) {
    var buffer = _loaderUtils.fs.readFileSync(url, options);

    return typeof buffer !== 'string' ? (0, _loaderUtils.toArrayBuffer)(buffer) : buffer;
  }

  if (!options.nothrow) {
    (0, _loaderUtils.assert)(false);
  }

  return null;
}

},{"@loaders.gl/loader-utils":73}],56:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeFile = writeFile;
exports.writeFileSync = writeFileSync;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _loaderUtils = require("@loaders.gl/loader-utils");

function writeFile(_x, _x2, _x3) {
  return _writeFile.apply(this, arguments);
}

function _writeFile() {
  _writeFile = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(filePath, arrayBufferOrString, options) {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            filePath = (0, _loaderUtils.resolvePath)(filePath);

            if (_loaderUtils.isBrowser) {
              _context.next = 4;
              break;
            }

            _context.next = 4;
            return _loaderUtils.fs.writeFile(filePath, (0, _loaderUtils.toBuffer)(arrayBufferOrString), {
              flag: 'w'
            });

          case 4:
            (0, _loaderUtils.assert)(false);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _writeFile.apply(this, arguments);
}

function writeFileSync(filePath, arrayBufferOrString, options) {
  filePath = (0, _loaderUtils.resolvePath)(filePath);

  if (!_loaderUtils.isBrowser) {
    _loaderUtils.fs.writeFileSync(filePath, (0, _loaderUtils.toBuffer)(arrayBufferOrString), {
      flag: 'w'
    });
  }

  (0, _loaderUtils.assert)(false);
}

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],57:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var BrowserFileSystem = function () {
  function BrowserFileSystem(files, options) {
    (0, _classCallCheck2.default)(this, BrowserFileSystem);
    (0, _defineProperty2.default)(this, "_fetch", void 0);
    (0, _defineProperty2.default)(this, "files", {});
    (0, _defineProperty2.default)(this, "lowerCaseFiles", {});
    (0, _defineProperty2.default)(this, "usedFiles", {});
    this._fetch = (options === null || options === void 0 ? void 0 : options.fetch) || fetch;

    for (var i = 0; i < files.length; ++i) {
      var file = files[i];
      this.files[file.name] = file;
      this.lowerCaseFiles[file.name.toLowerCase()] = file;
      this.usedFiles[file.name] = false;
    }

    this.fetch = this.fetch.bind(this);
  }

  (0, _createClass2.default)(BrowserFileSystem, [{
    key: "fetch",
    value: function () {
      var _fetch = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(path, options) {
        var file, headers, range, bytes, start, end, data, _response, response;

        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!path.includes('://')) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this._fetch(path, options));

              case 2:
                file = this.files[path];

                if (file) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", new Response(path, {
                  status: 400,
                  statusText: 'NOT FOUND'
                }));

              case 5:
                headers = new Headers(options === null || options === void 0 ? void 0 : options.headers);
                range = headers.get('Range');
                bytes = range && /bytes=($1)-($2)/.exec(range);

                if (!bytes) {
                  _context.next = 17;
                  break;
                }

                start = parseInt(bytes[1]);
                end = parseInt(bytes[2]);
                _context.next = 13;
                return file.slice(start, end).arrayBuffer();

              case 13:
                data = _context.sent;
                _response = new Response(data);
                Object.defineProperty(_response, 'url', {
                  value: path
                });
                return _context.abrupt("return", _response);

              case 17:
                response = new Response(file);
                Object.defineProperty(response, 'url', {
                  value: path
                });
                return _context.abrupt("return", response);

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function fetch(_x, _x2) {
        return _fetch.apply(this, arguments);
      }

      return fetch;
    }()
  }, {
    key: "readdir",
    value: function () {
      var _readdir = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(dirname) {
        var files, path;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                files = [];

                for (path in this.files) {
                  files.push(path);
                }

                return _context2.abrupt("return", files);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function readdir(_x3) {
        return _readdir.apply(this, arguments);
      }

      return readdir;
    }()
  }, {
    key: "stat",
    value: function () {
      var _stat = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(path, options) {
        var file;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                file = this.files[path];

                if (file) {
                  _context3.next = 3;
                  break;
                }

                throw new Error(path);

              case 3:
                return _context3.abrupt("return", {
                  size: file.size
                });

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function stat(_x4, _x5) {
        return _stat.apply(this, arguments);
      }

      return stat;
    }()
  }, {
    key: "unlink",
    value: function () {
      var _unlink = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(path) {
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                delete this.files[path];
                delete this.lowerCaseFiles[path];
                this.usedFiles[path] = true;

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function unlink(_x6) {
        return _unlink.apply(this, arguments);
      }

      return unlink;
    }()
  }, {
    key: "open",
    value: function () {
      var _open = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee5(pathname, flags, mode) {
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", this.files[pathname]);

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function open(_x7, _x8, _x9) {
        return _open.apply(this, arguments);
      }

      return open;
    }()
  }, {
    key: "read",
    value: function () {
      var _read = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee6(fd, buffer) {
        var offset,
            length,
            position,
            file,
            startPosition,
            arrayBuffer,
            _args6 = arguments;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                offset = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : 0;
                length = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : buffer.byteLength;
                position = _args6.length > 4 && _args6[4] !== undefined ? _args6[4] : null;
                file = fd;
                startPosition = 0;
                _context6.next = 7;
                return file.slice(startPosition, startPosition + length).arrayBuffer();

              case 7:
                arrayBuffer = _context6.sent;
                return _context6.abrupt("return", {
                  bytesRead: length,
                  buffer: arrayBuffer
                });

              case 9:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function read(_x10, _x11) {
        return _read.apply(this, arguments);
      }

      return read;
    }()
  }, {
    key: "close",
    value: function () {
      var _close = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee7(fd) {
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function close(_x12) {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }, {
    key: "_getFile",
    value: function _getFile(path, used) {
      var file = this.files[path] || this.lowerCaseFiles[path];

      if (file && used) {
        this.usedFiles[path] = true;
      }

      return file;
    }
  }]);
  return BrowserFileSystem;
}();

exports.default = BrowserFileSystem;

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],58:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArrayBufferOrStringFromDataSync = getArrayBufferOrStringFromDataSync;
exports.getArrayBufferOrStringFromData = getArrayBufferOrStringFromData;
exports.getAsyncIterableFromData = getAsyncIterableFromData;
exports.getReadableStream = getReadableStream;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _loaderUtils = require("@loaders.gl/loader-utils");

var _isType = require("../../javascript-utils/is-type");

var _makeIterator = require("../../iterators/make-iterator/make-iterator");

var _responseUtils = require("../utils/response-utils");

var ERR_DATA = 'Cannot convert supplied data type';

function getArrayBufferOrStringFromDataSync(data, loader, options) {
  if (loader.text && typeof data === 'string') {
    return data;
  }

  if ((0, _isType.isBuffer)(data)) {
    data = data.buffer;
  }

  if (data instanceof ArrayBuffer) {
    var arrayBuffer = data;

    if (loader.text && !loader.binary) {
      var textDecoder = new TextDecoder('utf8');
      return textDecoder.decode(arrayBuffer);
    }

    return arrayBuffer;
  }

  if (ArrayBuffer.isView(data)) {
    if (loader.text && !loader.binary) {
      var _textDecoder = new TextDecoder('utf8');

      return _textDecoder.decode(data);
    }

    var _arrayBuffer = data.buffer;
    var byteLength = data.byteLength || data.length;

    if (data.byteOffset !== 0 || byteLength !== _arrayBuffer.byteLength) {
      _arrayBuffer = _arrayBuffer.slice(data.byteOffset, data.byteOffset + byteLength);
    }

    return _arrayBuffer;
  }

  throw new Error(ERR_DATA);
}

function getArrayBufferOrStringFromData(_x, _x2, _x3) {
  return _getArrayBufferOrStringFromData.apply(this, arguments);
}

function _getArrayBufferOrStringFromData() {
  _getArrayBufferOrStringFromData = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, loader, options) {
    var isArrayBuffer, response;
    return _regenerator.default.wrap(function _callee$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            isArrayBuffer = data instanceof ArrayBuffer || ArrayBuffer.isView(data);

            if (!(typeof data === 'string' || isArrayBuffer)) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", getArrayBufferOrStringFromDataSync(data, loader, options));

          case 3:
            if (!(0, _isType.isBlob)(data)) {
              _context3.next = 7;
              break;
            }

            _context3.next = 6;
            return (0, _responseUtils.makeResponse)(data);

          case 6:
            data = _context3.sent;

          case 7:
            if (!(0, _isType.isResponse)(data)) {
              _context3.next = 21;
              break;
            }

            response = data;
            _context3.next = 11;
            return (0, _responseUtils.checkResponse)(response);

          case 11:
            if (!loader.binary) {
              _context3.next = 17;
              break;
            }

            _context3.next = 14;
            return response.arrayBuffer();

          case 14:
            _context3.t0 = _context3.sent;
            _context3.next = 20;
            break;

          case 17:
            _context3.next = 19;
            return response.text();

          case 19:
            _context3.t0 = _context3.sent;

          case 20:
            return _context3.abrupt("return", _context3.t0);

          case 21:
            if ((0, _isType.isReadableStream)(data)) {
              data = (0, _makeIterator.makeIterator)(data, options);
            }

            if (!((0, _isType.isIterable)(data) || (0, _isType.isAsyncIterable)(data))) {
              _context3.next = 24;
              break;
            }

            return _context3.abrupt("return", (0, _loaderUtils.concatenateArrayBuffersAsync)(data));

          case 24:
            throw new Error(ERR_DATA);

          case 25:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee);
  }));
  return _getArrayBufferOrStringFromData.apply(this, arguments);
}

function getAsyncIterableFromData(_x4, _x5) {
  return _getAsyncIterableFromData.apply(this, arguments);
}

function _getAsyncIterableFromData() {
  _getAsyncIterableFromData = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, options) {
    var response, body;
    return _regenerator.default.wrap(function _callee2$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(0, _isType.isIterator)(data)) {
              _context4.next = 2;
              break;
            }

            return _context4.abrupt("return", data);

          case 2:
            if (!(0, _isType.isResponse)(data)) {
              _context4.next = 10;
              break;
            }

            response = data;
            _context4.next = 6;
            return (0, _responseUtils.checkResponse)(response);

          case 6:
            _context4.next = 8;
            return response.body;

          case 8:
            body = _context4.sent;
            return _context4.abrupt("return", (0, _makeIterator.makeIterator)(body, options));

          case 10:
            if (!((0, _isType.isBlob)(data) || (0, _isType.isReadableStream)(data))) {
              _context4.next = 12;
              break;
            }

            return _context4.abrupt("return", (0, _makeIterator.makeIterator)(data, options));

          case 12:
            if (!(0, _isType.isAsyncIterable)(data)) {
              _context4.next = 14;
              break;
            }

            return _context4.abrupt("return", data[Symbol.asyncIterator]());

          case 14:
            return _context4.abrupt("return", getIterableFromData(data));

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee2);
  }));
  return _getAsyncIterableFromData.apply(this, arguments);
}

function getReadableStream(_x6) {
  return _getReadableStream.apply(this, arguments);
}

function _getReadableStream() {
  _getReadableStream = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(data) {
    var response;
    return _regenerator.default.wrap(function _callee3$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!(0, _isType.isReadableStream)(data)) {
              _context5.next = 2;
              break;
            }

            return _context5.abrupt("return", data);

          case 2:
            if (!(0, _isType.isResponse)(data)) {
              _context5.next = 4;
              break;
            }

            return _context5.abrupt("return", data.body);

          case 4:
            _context5.next = 6;
            return (0, _responseUtils.makeResponse)(data);

          case 6:
            response = _context5.sent;
            return _context5.abrupt("return", response.body);

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee3);
  }));
  return _getReadableStream.apply(this, arguments);
}

function getIterableFromData(data) {
  if (ArrayBuffer.isView(data)) {
    return _regenerator.default.mark(function oneChunk() {
      return _regenerator.default.wrap(function oneChunk$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return data.buffer;

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, oneChunk);
    })();
  }

  if (data instanceof ArrayBuffer) {
    return _regenerator.default.mark(function oneChunk() {
      return _regenerator.default.wrap(function oneChunk$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return data;

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, oneChunk);
    })();
  }

  if ((0, _isType.isIterator)(data)) {
    return data;
  }

  if ((0, _isType.isIterable)(data)) {
    return data[Symbol.iterator]();
  }

  throw new Error(ERR_DATA);
}

},{"../../iterators/make-iterator/make-iterator":37,"../../javascript-utils/is-type":42,"../utils/response-utils":67,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33,"@loaders.gl/loader-utils":73}],59:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLoaderContext = getLoaderContext;
exports.getLoadersFromContext = getLoadersFromContext;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _optionUtils = require("./option-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getLoaderContext(context, options) {
  var previousContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (previousContext) {
    return previousContext;
  }

  var resolvedContext = _objectSpread({
    fetch: (0, _optionUtils.getFetchFunction)(options, context)
  }, context);

  if (!Array.isArray(resolvedContext.loaders)) {
    resolvedContext.loaders = null;
  }

  return resolvedContext;
}

function getLoadersFromContext(loaders, context) {
  if (!context && loaders && !Array.isArray(loaders)) {
    return loaders;
  }

  var candidateLoaders;

  if (loaders) {
    candidateLoaders = Array.isArray(loaders) ? loaders : [loaders];
  }

  if (context && context.loaders) {
    var contextLoaders = Array.isArray(context.loaders) ? context.loaders : [context.loaders];
    candidateLoaders = candidateLoaders ? [].concat((0, _toConsumableArray2.default)(candidateLoaders), (0, _toConsumableArray2.default)(contextLoaders)) : contextLoaders;
  }

  return candidateLoaders && candidateLoaders.length ? candidateLoaders : null;
}

},{"./option-utils":63,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/toConsumableArray":28}],60:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConsoleLog = exports.NullLog = exports.probeLog = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _probe = require("probe.gl");

var probeLog = new _probe.Log({
  id: 'loaders.gl'
});
exports.probeLog = probeLog;

var NullLog = function () {
  function NullLog() {
    (0, _classCallCheck2.default)(this, NullLog);
  }

  (0, _createClass2.default)(NullLog, [{
    key: "log",
    value: function log() {
      return function () {};
    }
  }, {
    key: "info",
    value: function info() {
      return function () {};
    }
  }, {
    key: "warn",
    value: function warn() {
      return function () {};
    }
  }, {
    key: "error",
    value: function error() {
      return function () {};
    }
  }]);
  return NullLog;
}();

exports.NullLog = NullLog;

var ConsoleLog = function () {
  function ConsoleLog() {
    (0, _classCallCheck2.default)(this, ConsoleLog);
    (0, _defineProperty2.default)(this, "console", void 0);
    this.console = console;
  }

  (0, _createClass2.default)(ConsoleLog, [{
    key: "log",
    value: function log() {
      var _this$console$log;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_this$console$log = this.console.log).bind.apply(_this$console$log, [this.console].concat(args));
    }
  }, {
    key: "info",
    value: function info() {
      var _this$console$info;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_this$console$info = this.console.info).bind.apply(_this$console$info, [this.console].concat(args));
    }
  }, {
    key: "warn",
    value: function warn() {
      var _this$console$warn;

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_this$console$warn = this.console.warn).bind.apply(_this$console$warn, [this.console].concat(args));
    }
  }, {
    key: "error",
    value: function error() {
      var _this$console$error;

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_this$console$error = this.console.error).bind.apply(_this$console$error, [this.console].concat(args));
    }
  }]);
  return ConsoleLog;
}();

exports.ConsoleLog = ConsoleLog;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"probe.gl":143}],61:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLoaderObject = isLoaderObject;
exports.normalizeLoader = normalizeLoader;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _loaderUtils = require("@loaders.gl/loader-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function isLoaderObject(loader) {
  var _loader;

  if (!loader) {
    return false;
  }

  if (Array.isArray(loader)) {
    loader = loader[0];
  }

  var hasExtensions = Array.isArray((_loader = loader) === null || _loader === void 0 ? void 0 : _loader.extensions);
  return hasExtensions;
}

function normalizeLoader(loader) {
  var _loader2, _loader3;

  (0, _loaderUtils.assert)(loader, 'null loader');
  (0, _loaderUtils.assert)(isLoaderObject(loader), 'invalid loader');
  var options;

  if (Array.isArray(loader)) {
    options = loader[1];
    loader = loader[0];
    loader = _objectSpread(_objectSpread({}, loader), {}, {
      options: _objectSpread(_objectSpread({}, loader.options), options)
    });
  }

  if ((_loader2 = loader) !== null && _loader2 !== void 0 && _loader2.parseTextSync || (_loader3 = loader) !== null && _loader3 !== void 0 && _loader3.parseText) {
    loader.text = true;
  }

  if (!loader.text) {
    loader.binary = true;
  }

  return loader;
}

},{"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@loaders.gl/loader-utils":73}],62:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.REMOVED_LOADER_OPTIONS = exports.DEFAULT_LOADER_OPTIONS = void 0;

var _loggers = require("./loggers");

var DEFAULT_LOADER_OPTIONS = {
  fetch: null,
  mimeType: undefined,
  nothrow: false,
  log: new _loggers.ConsoleLog(),
  CDN: 'https://unpkg.com/@loaders.gl',
  worker: true,
  maxConcurrency: 3,
  maxMobileConcurrency: 1,
  reuseWorkers: true,
  _workerType: '',
  limit: 0,
  _limitMB: 0,
  batchSize: 'auto',
  batchDebounceMs: 0,
  metadata: false,
  transforms: []
};
exports.DEFAULT_LOADER_OPTIONS = DEFAULT_LOADER_OPTIONS;
var REMOVED_LOADER_OPTIONS = {
  throws: 'nothrow',
  dataType: '(no longer used)',
  uri: 'baseUri',
  method: 'fetch.method',
  headers: 'fetch.headers',
  body: 'fetch.body',
  mode: 'fetch.mode',
  credentials: 'fetch.credentials',
  cache: 'fetch.cache',
  redirect: 'fetch.redirect',
  referrer: 'fetch.referrer',
  referrerPolicy: 'fetch.referrerPolicy',
  integrity: 'fetch.integrity',
  keepalive: 'fetch.keepalive',
  signal: 'fetch.signal'
};
exports.REMOVED_LOADER_OPTIONS = REMOVED_LOADER_OPTIONS;

},{"./loggers":60}],63:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGlobalLoaderState = getGlobalLoaderState;
exports.setGlobalOptions = setGlobalOptions;
exports.normalizeOptions = normalizeOptions;
exports.getFetchFunction = getFetchFunction;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _loaderUtils = require("@loaders.gl/loader-utils");

var _isType = require("../../javascript-utils/is-type");

var _fetchFile = require("../fetch/fetch-file");

var _loggers = require("./loggers");

var _optionDefaults = require("./option-defaults");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getGlobalLoaderState() {
  _loaderUtils.global.loaders = _loaderUtils.global.loaders || {};
  var loaders = _loaderUtils.global.loaders;
  loaders._state = loaders._state || {};
  return loaders._state;
}

var getGlobalLoaderOptions = function getGlobalLoaderOptions() {
  var state = getGlobalLoaderState();
  state.globalOptions = state.globalOptions || _objectSpread({}, _optionDefaults.DEFAULT_LOADER_OPTIONS);
  return state.globalOptions;
};

function setGlobalOptions(options) {
  var state = getGlobalLoaderState();
  var globalOptions = getGlobalLoaderOptions();
  state.globalOptions = normalizeOptionsInternal(globalOptions, options);
}

function normalizeOptions(options, loader, loaders, url) {
  loaders = loaders || [];
  loaders = Array.isArray(loaders) ? loaders : [loaders];
  validateOptions(options, loaders);
  return normalizeOptionsInternal(loader, options, url);
}

function getFetchFunction(options, context) {
  var globalOptions = getGlobalLoaderOptions();
  var fetchOptions = options || globalOptions;

  if (typeof fetchOptions.fetch === 'function') {
    return fetchOptions.fetch;
  }

  if ((0, _isType.isObject)(fetchOptions.fetch)) {
    return function (url) {
      return (0, _fetchFile.fetchFile)(url, fetchOptions);
    };
  }

  if (context !== null && context !== void 0 && context.fetch) {
    return context === null || context === void 0 ? void 0 : context.fetch;
  }

  return _fetchFile.fetchFile;
}

function validateOptions(options, loaders) {
  validateOptionsObject(options, null, _optionDefaults.DEFAULT_LOADER_OPTIONS, _optionDefaults.REMOVED_LOADER_OPTIONS, loaders);

  var _iterator = _createForOfIteratorHelper(loaders),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var loader = _step.value;
      var idOptions = options && options[loader.id] || {};
      var loaderOptions = loader.options && loader.options[loader.id] || {};
      var deprecatedOptions = loader.deprecatedOptions && loader.deprecatedOptions[loader.id] || {};
      validateOptionsObject(idOptions, loader.id, loaderOptions, deprecatedOptions, loaders);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function validateOptionsObject(options, id, defaultOptions, deprecatedOptions, loaders) {
  var loaderName = id || 'Top level';
  var prefix = id ? "".concat(id, ".") : '';

  for (var _key in options) {
    var isSubOptions = !id && (0, _isType.isObject)(options[_key]);
    var isBaseUriOption = _key === 'baseUri' && !id;
    var isWorkerUrlOption = _key === 'workerUrl' && id;

    if (!(_key in defaultOptions) && !isBaseUriOption && !isWorkerUrlOption) {
      if (_key in deprecatedOptions) {
        _loggers.probeLog.warn("".concat(loaderName, " loader option '").concat(prefix).concat(_key, "' no longer supported, use '").concat(deprecatedOptions[_key], "'"))();
      } else if (!isSubOptions) {
        var suggestion = findSimilarOption(_key, loaders);

        _loggers.probeLog.warn("".concat(loaderName, " loader option '").concat(prefix).concat(_key, "' not recognized. ").concat(suggestion))();
      }
    }
  }
}

function findSimilarOption(optionKey, loaders) {
  var lowerCaseOptionKey = optionKey.toLowerCase();
  var bestSuggestion = '';

  var _iterator2 = _createForOfIteratorHelper(loaders),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var loader = _step2.value;

      for (var _key2 in loader.options) {
        if (optionKey === _key2) {
          return "Did you mean '".concat(loader.id, ".").concat(_key2, "'?");
        }

        var lowerCaseKey = _key2.toLowerCase();

        var isPartialMatch = lowerCaseOptionKey.startsWith(lowerCaseKey) || lowerCaseKey.startsWith(lowerCaseOptionKey);

        if (isPartialMatch) {
          bestSuggestion = bestSuggestion || "Did you mean '".concat(loader.id, ".").concat(_key2, "'?");
        }
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return bestSuggestion;
}

function normalizeOptionsInternal(loader, options, url) {
  var loaderDefaultOptions = loader.options || {};

  var mergedOptions = _objectSpread({}, loaderDefaultOptions);

  addUrlOptions(mergedOptions, url);

  if (mergedOptions.log === null) {
    mergedOptions.log = new _loggers.NullLog();
  }

  mergeNestedFields(mergedOptions, getGlobalLoaderOptions());
  mergeNestedFields(mergedOptions, options);
  return mergedOptions;
}

function mergeNestedFields(mergedOptions, options) {
  for (var _key3 in options) {
    if (_key3 in options) {
      var value = options[_key3];

      if ((0, _isType.isPureObject)(value) && (0, _isType.isPureObject)(mergedOptions[_key3])) {
        mergedOptions[_key3] = _objectSpread(_objectSpread({}, mergedOptions[_key3]), options[_key3]);
      } else {
        mergedOptions[_key3] = options[_key3];
      }
    }
  }
}

function addUrlOptions(options, url) {
  if (url && !('baseUri' in options)) {
    options.baseUri = url;
  }
}

},{"../../javascript-utils/is-type":42,"../fetch/fetch-file":53,"./loggers":60,"./option-defaults":62,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@loaders.gl/loader-utils":73}],64:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchProgress;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function fetchProgress(_x, _x2) {
  return _fetchProgress.apply(this, arguments);
}

function _fetchProgress() {
  _fetchProgress = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(response, onProgress) {
    var onDone,
        onError,
        body,
        contentLength,
        totalBytes,
        progressStream,
        _args2 = arguments;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            onDone = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : function () {};
            onError = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : function () {};
            _context2.next = 4;
            return response;

          case 4:
            response = _context2.sent;

            if (response.ok) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return", response);

          case 7:
            body = response.body;

            if (body) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt("return", response);

          case 10:
            contentLength = response.headers.get('content-length') || 0;
            totalBytes = contentLength && parseInt(contentLength);

            if (contentLength > 0) {
              _context2.next = 14;
              break;
            }

            return _context2.abrupt("return", response);

          case 14:
            if (!(typeof ReadableStream === 'undefined' || !body.getReader)) {
              _context2.next = 16;
              break;
            }

            return _context2.abrupt("return", response);

          case 16:
            progressStream = new ReadableStream({
              start: function start(controller) {
                return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
                  var reader;
                  return _regenerator.default.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          reader = body.getReader();
                          _context.next = 3;
                          return read(controller, reader, 0, totalBytes, onProgress, onDone, onError);

                        case 3:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }))();
              }
            });
            return _context2.abrupt("return", new Response(progressStream));

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _fetchProgress.apply(this, arguments);
}

function read(_x3, _x4, _x5, _x6, _x7, _x8, _x9) {
  return _read.apply(this, arguments);
}

function _read() {
  _read = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(controller, reader, loadedBytes, totalBytes, onProgress, onDone, onError) {
    var _yield$reader$read, done, value, percent;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return reader.read();

          case 3:
            _yield$reader$read = _context3.sent;
            done = _yield$reader$read.done;
            value = _yield$reader$read.value;

            if (!done) {
              _context3.next = 10;
              break;
            }

            onDone();
            controller.close();
            return _context3.abrupt("return");

          case 10:
            loadedBytes += value.byteLength;
            percent = Math.round(loadedBytes / totalBytes * 100);
            onProgress(percent, {
              loadedBytes: loadedBytes,
              totalBytes: totalBytes
            });
            controller.enqueue(value);
            _context3.next = 16;
            return read(controller, reader, loadedBytes, totalBytes, onProgress, onDone, onError);

          case 16:
            _context3.next = 22;
            break;

          case 18:
            _context3.prev = 18;
            _context3.t0 = _context3["catch"](0);
            controller.error(_context3.t0);
            onError(_context3.t0);

          case 22:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 18]]);
  }));
  return _read.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMIMEType = parseMIMEType;
exports.parseMIMETypeFromURL = parseMIMETypeFromURL;
var DATA_URL_PATTERN = /^data:([-\w.]+\/[-\w.+]+)(;|,)/;
var MIME_TYPE_PATTERN = /^([-\w.]+\/[-\w.+]+)/;

function parseMIMEType(mimeString) {
  var matches = MIME_TYPE_PATTERN.exec(mimeString);

  if (matches) {
    return matches[1];
  }

  return mimeString;
}

function parseMIMETypeFromURL(url) {
  var matches = DATA_URL_PATTERN.exec(url);

  if (matches) {
    return matches[1];
  }

  return '';
}

},{}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResourceUrlAndType = getResourceUrlAndType;
exports.getResourceContentLength = getResourceContentLength;

var _isType = require("../../javascript-utils/is-type");

var _mimeTypeUtils = require("./mime-type-utils");

var QUERY_STRING_PATTERN = /\?.*/;

function getResourceUrlAndType(resource) {
  if ((0, _isType.isResponse)(resource)) {
    var url = stripQueryString(resource.url || '');
    var contentTypeHeader = resource.headers.get('content-type') || '';
    return {
      url: url,
      type: (0, _mimeTypeUtils.parseMIMEType)(contentTypeHeader) || (0, _mimeTypeUtils.parseMIMETypeFromURL)(url)
    };
  }

  if ((0, _isType.isBlob)(resource)) {
    return {
      url: stripQueryString(resource.name || ''),
      type: resource.type || ''
    };
  }

  if (typeof resource === 'string') {
    return {
      url: stripQueryString(resource),
      type: (0, _mimeTypeUtils.parseMIMETypeFromURL)(resource)
    };
  }

  return {
    url: '',
    type: ''
  };
}

function getResourceContentLength(resource) {
  if ((0, _isType.isResponse)(resource)) {
    return resource.headers['content-length'] || -1;
  }

  if ((0, _isType.isBlob)(resource)) {
    return resource.size;
  }

  if (typeof resource === 'string') {
    return resource.length;
  }

  if (resource instanceof ArrayBuffer) {
    return resource.byteLength;
  }

  if (ArrayBuffer.isView(resource)) {
    return resource.byteLength;
  }

  return -1;
}

function stripQueryString(url) {
  return url.replace(QUERY_STRING_PATTERN, '');
}

},{"../../javascript-utils/is-type":42,"./mime-type-utils":65}],67:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeResponse = makeResponse;
exports.checkResponse = checkResponse;
exports.checkResponseSync = checkResponseSync;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _isType = require("../../javascript-utils/is-type");

var _resourceUtils = require("./resource-utils");

function makeResponse(_x) {
  return _makeResponse.apply(this, arguments);
}

function _makeResponse() {
  _makeResponse = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(resource) {
    var headers, contentLength, _getResourceUrlAndTyp, url, type, initialDataUrl, response;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(0, _isType.isResponse)(resource)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", resource);

          case 2:
            headers = {};
            contentLength = (0, _resourceUtils.getResourceContentLength)(resource);

            if (contentLength >= 0) {
              headers['content-length'] = String(contentLength);
            }

            _getResourceUrlAndTyp = (0, _resourceUtils.getResourceUrlAndType)(resource), url = _getResourceUrlAndTyp.url, type = _getResourceUrlAndTyp.type;

            if (type) {
              headers['content-type'] = type;
            }

            _context.next = 9;
            return getInitialDataUrl(resource);

          case 9:
            initialDataUrl = _context.sent;

            if (initialDataUrl) {
              headers['x-first-bytes'] = initialDataUrl;
            }

            if (typeof resource === 'string') {
              resource = new TextEncoder().encode(resource);
            }

            response = new Response(resource, {
              headers: headers
            });
            Object.defineProperty(response, 'url', {
              value: url
            });
            return _context.abrupt("return", response);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _makeResponse.apply(this, arguments);
}

function checkResponse(_x2) {
  return _checkResponse.apply(this, arguments);
}

function _checkResponse() {
  _checkResponse = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(response) {
    var message;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (response.ok) {
              _context2.next = 5;
              break;
            }

            _context2.next = 3;
            return getResponseError(response);

          case 3:
            message = _context2.sent;
            throw new Error(message);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _checkResponse.apply(this, arguments);
}

function checkResponseSync(response) {
  if (!response.ok) {
    var message = "".concat(response.status, " ").concat(response.statusText);
    message = message.length > 60 ? "".concat(message.slice(60), "...") : message;
    throw new Error(message);
  }
}

function getResponseError(_x3) {
  return _getResponseError.apply(this, arguments);
}

function _getResponseError() {
  _getResponseError = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(response) {
    var message, contentType, text;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            message = "Failed to fetch resource ".concat(response.url, " (").concat(response.status, "): ");
            _context3.prev = 1;
            contentType = response.headers.get('Content-Type');
            text = response.statusText;

            if (!contentType.includes('application/json')) {
              _context3.next = 11;
              break;
            }

            _context3.t0 = text;
            _context3.t1 = " ";
            _context3.next = 9;
            return response.text();

          case 9:
            _context3.t2 = _context3.sent;
            text = _context3.t0 += _context3.t1.concat.call(_context3.t1, _context3.t2);

          case 11:
            message += text;
            message = message.length > 60 ? "".concat(message.slice(60), "...") : message;
            _context3.next = 17;
            break;

          case 15:
            _context3.prev = 15;
            _context3.t3 = _context3["catch"](1);

          case 17:
            return _context3.abrupt("return", message);

          case 18:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 15]]);
  }));
  return _getResponseError.apply(this, arguments);
}

function getInitialDataUrl(_x4) {
  return _getInitialDataUrl.apply(this, arguments);
}

function _getInitialDataUrl() {
  _getInitialDataUrl = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(resource) {
    var INITIAL_DATA_LENGTH, blobSlice, slice, base64;
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            INITIAL_DATA_LENGTH = 5;

            if (!(typeof resource === 'string')) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", "data:,".concat(resource.slice(0, INITIAL_DATA_LENGTH)));

          case 3:
            if (!(resource instanceof Blob)) {
              _context4.next = 8;
              break;
            }

            blobSlice = resource.slice(0, 5);
            _context4.next = 7;
            return new Promise(function (resolve) {
              var reader = new FileReader();

              reader.onload = function (event) {
                var _event$target;

                return resolve(event === null || event === void 0 ? void 0 : (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.result);
              };

              reader.readAsDataURL(blobSlice);
            });

          case 7:
            return _context4.abrupt("return", _context4.sent);

          case 8:
            if (!(resource instanceof ArrayBuffer)) {
              _context4.next = 12;
              break;
            }

            slice = resource.slice(0, INITIAL_DATA_LENGTH);
            base64 = arrayBufferToBase64(slice);
            return _context4.abrupt("return", "data:base64,".concat(base64));

          case 12:
            return _context4.abrupt("return", null);

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getInitialDataUrl.apply(this, arguments);
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);

  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

},{"../../javascript-utils/is-type":42,"./resource-utils":66,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],68:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NullLoader = exports.NullWorkerLoader = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var VERSION = typeof "3.0.9" !== 'undefined' ? "3.0.9" : 'latest';
var NullWorkerLoader = {
  name: 'Null loader',
  id: 'null',
  module: 'core',
  version: VERSION,
  worker: true,
  mimeTypes: ['application/x.empty'],
  extensions: ['null'],
  tests: [function () {
    return false;
  }],
  options: {
    null: {}
  }
};
exports.NullWorkerLoader = NullWorkerLoader;
var NullLoader = {
  name: 'Null loader',
  id: 'null',
  module: 'core',
  version: VERSION,
  mimeTypes: ['application/x.empty'],
  extensions: ['null'],
  parse: function () {
    var _parse = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(arrayBuffer) {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", arrayBuffer);

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function parse(_x2) {
      return _parse.apply(this, arguments);
    }

    return parse;
  }(),
  parseSync: function parseSync(arrayBuffer) {
    return arrayBuffer;
  },
  parseInBatches: function () {
    var _generator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee2(asyncIterator) {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, batch;

      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _context2.prev = 2;
              _iterator = (0, _asyncIterator2.default)(asyncIterator);

            case 4:
              _context2.next = 6;
              return (0, _awaitAsyncGenerator2.default)(_iterator.next());

            case 6:
              _step = _context2.sent;
              _iteratorNormalCompletion = _step.done;
              _context2.next = 10;
              return (0, _awaitAsyncGenerator2.default)(_step.value);

            case 10:
              _value = _context2.sent;

              if (_iteratorNormalCompletion) {
                _context2.next = 18;
                break;
              }

              batch = _value;
              _context2.next = 15;
              return batch;

            case 15:
              _iteratorNormalCompletion = true;
              _context2.next = 4;
              break;

            case 18:
              _context2.next = 24;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t0 = _context2["catch"](2);
              _didIteratorError = true;
              _iteratorError = _context2.t0;

            case 24:
              _context2.prev = 24;
              _context2.prev = 25;

              if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
                _context2.next = 29;
                break;
              }

              _context2.next = 29;
              return (0, _awaitAsyncGenerator2.default)(_iterator.return());

            case 29:
              _context2.prev = 29;

              if (!_didIteratorError) {
                _context2.next = 32;
                break;
              }

              throw _iteratorError;

            case 32:
              return _context2.finish(29);

            case 33:
              return _context2.finish(24);

            case 34:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[2, 20, 24, 34], [25,, 29, 33]]);
    }));

    function generator(_x) {
      return _generator.apply(this, arguments);
    }

    return generator;
  }(),
  tests: [function () {
    return false;
  }],
  options: {
    null: {}
  }
};
exports.NullLoader = NullLoader;

},{"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/awaitAsyncGenerator":11,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/wrapAsyncGenerator":31,"@babel/runtime/regenerator":33}],69:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._typecheckCSVLoader = exports.CSVLoader = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _schema = require("@loaders.gl/schema");

var _papaparse = _interopRequireDefault(require("./libs/papaparse"));

var _asyncIteratorStreamer = _interopRequireDefault(require("./lib/async-iterator-streamer"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var VERSION = typeof "3.0.9" !== 'undefined' ? "3.0.9" : 'latest';
var DEFAULT_CSV_LOADER_OPTIONS = {
  csv: {
    shape: 'object-row-table',
    optimizeMemoryUsage: false,
    header: 'auto',
    columnPrefix: 'column',
    quoteChar: '"',
    escapeChar: '"',
    dynamicTyping: true,
    comments: false,
    skipEmptyLines: true,
    delimitersToGuess: [',', '\t', '|', ';']
  }
};
var CSVLoader = {
  id: 'csv',
  module: 'csv',
  name: 'CSV',
  version: VERSION,
  extensions: ['csv'],
  mimeTypes: ['text/csv'],
  category: 'table',
  parse: function () {
    var _parse = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(arrayBuffer, options) {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", parseCSV(new TextDecoder().decode(arrayBuffer), options));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function parse(_x, _x2) {
      return _parse.apply(this, arguments);
    }

    return parse;
  }(),
  parseText: function parseText(text, options) {
    return parseCSV(text, options);
  },
  parseInBatches: parseCSVInBatches,
  options: DEFAULT_CSV_LOADER_OPTIONS
};
exports.CSVLoader = CSVLoader;

function parseCSV(_x3, _x4) {
  return _parseCSV.apply(this, arguments);
}

function _parseCSV() {
  _parseCSV = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(csvText, options) {
    var csvOptions, firstRow, header, parseWithHeader, papaparseConfig, result, rows, headerRow;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            csvOptions = _objectSpread(_objectSpread({}, DEFAULT_CSV_LOADER_OPTIONS.csv), options === null || options === void 0 ? void 0 : options.csv);
            firstRow = readFirstRow(csvText);
            header = csvOptions.header === 'auto' ? isHeaderRow(firstRow) : Boolean(csvOptions.header);
            parseWithHeader = header;
            papaparseConfig = _objectSpread(_objectSpread({}, csvOptions), {}, {
              header: parseWithHeader,
              download: false,
              transformHeader: parseWithHeader ? duplicateColumnTransformer() : undefined,
              error: function error(e) {
                throw new Error(e);
              }
            });
            result = _papaparse.default.parse(csvText, papaparseConfig);
            rows = result.data;
            headerRow = result.meta.fields || generateHeader(csvOptions.columnPrefix, firstRow.length);
            _context2.t0 = csvOptions.shape;
            _context2.next = _context2.t0 === 'object-row-table' ? 11 : _context2.t0 === 'array-row-table' ? 13 : 15;
            break;

          case 11:
            rows = rows.map(function (row) {
              return Array.isArray(row) ? (0, _schema.convertToObjectRow)(row, headerRow) : row;
            });
            return _context2.abrupt("break", 15);

          case 13:
            rows = rows.map(function (row) {
              return Array.isArray(row) ? row : (0, _schema.convertToArrayRow)(row, headerRow);
            });
            return _context2.abrupt("break", 15);

          case 15:
            return _context2.abrupt("return", rows);

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _parseCSV.apply(this, arguments);
}

function parseCSVInBatches(asyncIterator, options) {
  var _options;

  options = _objectSpread({}, options);

  if (options.batchSize === 'auto') {
    options.batchSize = 4000;
  }

  var csvOptions = _objectSpread(_objectSpread({}, DEFAULT_CSV_LOADER_OPTIONS.csv), (_options = options) === null || _options === void 0 ? void 0 : _options.csv);

  var asyncQueue = new _schema.AsyncQueue();
  var isFirstRow = true;
  var headerRow = null;
  var tableBatchBuilder = null;
  var schema = null;

  var config = _objectSpread(_objectSpread({}, csvOptions), {}, {
    header: false,
    download: false,
    chunkSize: 1024 * 1024 * 5,
    skipEmptyLines: false,
    step: function step(results) {
      var row = results.data;

      if (csvOptions.skipEmptyLines) {
        var collapsedRow = row.flat().join('').trim();

        if (collapsedRow === '') {
          return;
        }
      }

      var bytesUsed = results.meta.cursor;

      if (isFirstRow && !headerRow) {
        var header = csvOptions.header === 'auto' ? isHeaderRow(row) : Boolean(csvOptions.header);

        if (header) {
          headerRow = row.map(duplicateColumnTransformer());
          return;
        }
      }

      if (isFirstRow) {
        isFirstRow = false;

        if (!headerRow) {
          headerRow = generateHeader(csvOptions.columnPrefix, row.length);
        }

        schema = deduceSchema(row, headerRow);
      }

      if (csvOptions.optimizeMemoryUsage) {
        row = JSON.parse(JSON.stringify(row));
      }

      tableBatchBuilder = tableBatchBuilder || new _schema.TableBatchBuilder(schema, _objectSpread({
        shape: csvOptions.shape || 'array-row-table'
      }, options));

      try {
        tableBatchBuilder.addRow(row);
        var batch = tableBatchBuilder && tableBatchBuilder.getFullBatch({
          bytesUsed: bytesUsed
        });

        if (batch) {
          asyncQueue.enqueue(batch);
        }
      } catch (error) {
        asyncQueue.enqueue(error);
      }
    },
    complete: function complete(results) {
      try {
        var bytesUsed = results.meta.cursor;
        var batch = tableBatchBuilder && tableBatchBuilder.getFinalBatch({
          bytesUsed: bytesUsed
        });

        if (batch) {
          asyncQueue.enqueue(batch);
        }
      } catch (error) {
        asyncQueue.enqueue(error);
      }

      asyncQueue.close();
    }
  });

  _papaparse.default.parse(asyncIterator, config, _asyncIteratorStreamer.default);

  return asyncQueue;
}

function isHeaderRow(row) {
  return row && row.every(function (value) {
    return typeof value === 'string';
  });
}

function readFirstRow(csvText) {
  var result = _papaparse.default.parse(csvText, {
    download: false,
    dynamicTyping: true,
    preview: 1
  });

  return result.data[0];
}

function duplicateColumnTransformer() {
  var observedColumns = new Set();
  return function (col) {
    var colName = col;
    var counter = 1;

    while (observedColumns.has(colName)) {
      colName = "".concat(col, ".").concat(counter);
      counter++;
    }

    observedColumns.add(colName);
    return colName;
  };
}

function generateHeader(columnPrefix) {
  var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var headers = [];

  for (var i = 0; i < count; i++) {
    headers.push("".concat(columnPrefix).concat(i + 1));
  }

  return headers;
}

function deduceSchema(row, headerRow) {
  var schema = headerRow ? {} : [];

  for (var i = 0; i < row.length; i++) {
    var columnName = headerRow && headerRow[i] || i;
    var value = row[i];

    switch ((0, _typeof2.default)(value)) {
      case 'number':
      case 'boolean':
        schema[columnName] = {
          name: String(columnName),
          index: i,
          type: Float32Array
        };
        break;

      case 'string':
      default:
        schema[columnName] = {
          name: String(columnName),
          index: i,
          type: Array
        };
    }
  }

  return schema;
}

var _typecheckCSVLoader = CSVLoader;
exports._typecheckCSVLoader = _typecheckCSVLoader;

},{"./lib/async-iterator-streamer":71,"./libs/papaparse":72,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"@babel/runtime/regenerator":33,"@loaders.gl/schema":92}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CSVLoader", {
  enumerable: true,
  get: function get() {
    return _csvLoader.CSVLoader;
  }
});

var _csvLoader = require("./csv-loader");

},{"./csv-loader":69}],71:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AsyncIteratorStreamer;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _papaparse = _interopRequireDefault(require("../libs/papaparse"));

var ChunkStreamer = _papaparse.default.ChunkStreamer;

function AsyncIteratorStreamer(config) {
  config = config || {};
  ChunkStreamer.call(this, config);
  this.textDecoder = new TextDecoder(this._config.encoding);

  this.stream = function () {
    var _ref = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(asyncIterator) {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk;

      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this._input = asyncIterator;
              _context.prev = 1;
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _context.prev = 4;
              _iterator = (0, _asyncIterator2.default)(asyncIterator);

            case 6:
              _context.next = 8;
              return _iterator.next();

            case 8:
              _step = _context.sent;
              _iteratorNormalCompletion = _step.done;
              _context.next = 12;
              return _step.value;

            case 12:
              _value = _context.sent;

              if (_iteratorNormalCompletion) {
                _context.next = 19;
                break;
              }

              chunk = _value;
              this.parseChunk(this.getStringChunk(chunk));

            case 16:
              _iteratorNormalCompletion = true;
              _context.next = 6;
              break;

            case 19:
              _context.next = 25;
              break;

            case 21:
              _context.prev = 21;
              _context.t0 = _context["catch"](4);
              _didIteratorError = true;
              _iteratorError = _context.t0;

            case 25:
              _context.prev = 25;
              _context.prev = 26;

              if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
                _context.next = 30;
                break;
              }

              _context.next = 30;
              return _iterator.return();

            case 30:
              _context.prev = 30;

              if (!_didIteratorError) {
                _context.next = 33;
                break;
              }

              throw _iteratorError;

            case 33:
              return _context.finish(30);

            case 34:
              return _context.finish(25);

            case 35:
              this._finished = true;
              this.parseChunk('');
              _context.next = 42;
              break;

            case 39:
              _context.prev = 39;
              _context.t1 = _context["catch"](1);

              this._sendError(_context.t1);

            case 42:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[1, 39], [4, 21, 25, 35], [26,, 30, 34]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  this._nextChunk = function nextChunk() {};

  this.getStringChunk = function (chunk) {
    return typeof chunk === 'string' ? chunk : this.textDecoder.decode(chunk, {
      stream: true
    });
  };
}

AsyncIteratorStreamer.prototype = Object.create(ChunkStreamer.prototype);
AsyncIteratorStreamer.prototype.constructor = AsyncIteratorStreamer;

},{"../libs/papaparse":72,"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],72:[function(require,module,exports){
// This is a fork of papaparse
// https://github.com/mholt/PapaParse
/* @license
Papa Parse
v5.0.0-beta.0
https://github.com/mholt/PapaParse
License: MIT
*/
// FORK SUMMARY:
// - Adopt ES6 exports
// - Implement new AsyncIteratorStreamer
// - Remove non Async Iterator streamers (can all be handled by new streamer)
// - Remove unused Worker support (loaders.gl worker system used instead)
// - Remove unused jQuery plugin support

/* eslint-disable */
// @ts-nocheck
var global = (function() {
  // alternative method, similar to `Function('return this')()`
  // but without using `eval` (which is disabled when
  // using Content Security Policy).

  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }

  // When running tests none of the above have been defined
  return {};
})();

var IS_PAPA_WORKER = false;

var Papa = {};
module.exports = Papa;
Papa.parse = CsvToJson;
Papa.unparse = JsonToCsv;

Papa.RECORD_SEP = String.fromCharCode(30);
Papa.UNIT_SEP = String.fromCharCode(31);
Papa.BYTE_ORDER_MARK = '\ufeff';
Papa.BAD_DELIMITERS = ['\r', '\n', '"', Papa.BYTE_ORDER_MARK];
Papa.WORKERS_SUPPORTED = false; // !IS_WORKER && !!global.Worker;
Papa.NODE_STREAM_INPUT = 1;

// Configurable chunk sizes for local and remote files, respectively
Papa.LocalChunkSize = 1024 * 1024 * 10; // 10 MB
Papa.RemoteChunkSize = 1024 * 1024 * 5; // 5 MB
Papa.DefaultDelimiter = ','; // Used if not specified and detection fails

// Exposed for testing and development only
Papa.Parser = Parser;
Papa.ParserHandle = ParserHandle;

// BEGIN FORK
Papa.ChunkStreamer = ChunkStreamer;
Papa.StringStreamer = StringStreamer;
/*
Papa.NetworkStreamer = NetworkStreamer;
Papa.FileStreamer = FileStreamer;
Papa.ReadableStreamStreamer = ReadableStreamStreamer;
if (typeof PAPA_BROWSER_CONTEXT === 'undefined') {
  Papa.DuplexStreamStreamer = DuplexStreamStreamer;
}
*/
// END FORK

// BEGIN FORK
// Adds an argument to papa.parse
// function CsvToJson(_input, _config)
function CsvToJson(
  _input,
  _config,
  UserDefinedStreamer // BEGIN FORK
) {
  _config = _config || {};
  var dynamicTyping = _config.dynamicTyping || false;
  if (isFunction(dynamicTyping)) {
    _config.dynamicTypingFunction = dynamicTyping;
    // Will be filled on first row call
    dynamicTyping = {};
  }
  _config.dynamicTyping = dynamicTyping;

  _config.transform = isFunction(_config.transform) ? _config.transform : false;

  if (_config.worker && Papa.WORKERS_SUPPORTED) {
    var w = newWorker();

    w.userStep = _config.step;
    w.userChunk = _config.chunk;
    w.userComplete = _config.complete;
    w.userError = _config.error;

    _config.step = isFunction(_config.step);
    _config.chunk = isFunction(_config.chunk);
    _config.complete = isFunction(_config.complete);
    _config.error = isFunction(_config.error);
    delete _config.worker; // prevent infinite loop

    w.postMessage({
      input: _input,
      config: _config,
      workerId: w.id
    });

    return;
  }

  var streamer = null;
  /*
  if (_input === Papa.NODE_STREAM_INPUT && typeof PAPA_BROWSER_CONTEXT === 'undefined') {
    // create a node Duplex stream for use
    // with .pipe
    streamer = new DuplexStreamStreamer(_config);
    return streamer.getStream();
  } else
  */
  if (typeof _input === 'string') {
    // if (_config.download) streamer = new NetworkStreamer(_config);
    // else
    streamer = new StringStreamer(_config);
  }
  /*
  else if (_input.readable === true && isFunction(_input.read) && isFunction(_input.on)) {
    streamer = new ReadableStreamStreamer(_config);
  } else if ((global.File && _input instanceof File) || _input instanceof Object)
    // ...Safari. (see issue #106)
    streamer = new FileStreamer(_config);
  */

  // BEGIN FORK
  if (!streamer) {
    streamer = new UserDefinedStreamer(_config);
  }
  // END FORK

  return streamer.stream(_input);
}

function JsonToCsv(_input, _config) {
  // Default configuration

  /** whether to surround every datum with quotes */
  var _quotes = false;

  /** whether to write headers */
  var _writeHeader = true;

  /** delimiting character(s) */
  var _delimiter = ',';

  /** newline character(s) */
  var _newline = '\r\n';

  /** quote character */
  var _quoteChar = '"';

  /** escaped quote character, either "" or <config.escapeChar>" */
  var _escapedQuote = _quoteChar + _quoteChar;

  /** whether to skip empty lines */
  var _skipEmptyLines = false;

  /** the columns (keys) we expect when we unparse objects */
  var _columns = null;

  unpackConfig();

  var quoteCharRegex = new RegExp(escapeRegExp(_quoteChar), 'g');

  if (typeof _input === 'string') _input = JSON.parse(_input);

  if (Array.isArray(_input)) {
    if (!_input.length || Array.isArray(_input[0])) return serialize(null, _input, _skipEmptyLines);
    else if (typeof _input[0] === 'object')
      return serialize(_columns || objectKeys(_input[0]), _input, _skipEmptyLines);
  } else if (typeof _input === 'object') {
    if (typeof _input.data === 'string') _input.data = JSON.parse(_input.data);

    if (Array.isArray(_input.data)) {
      if (!_input.fields) _input.fields = _input.meta && _input.meta.fields;

      if (!_input.fields)
        _input.fields = Array.isArray(_input.data[0]) ? _input.fields : objectKeys(_input.data[0]);

      if (!Array.isArray(_input.data[0]) && typeof _input.data[0] !== 'object')
        _input.data = [_input.data]; // handles input like [1,2,3] or ['asdf']
    }

    return serialize(_input.fields || [], _input.data || [], _skipEmptyLines);
  }

  // Default (any valid paths should return before this)
  throw new Error('Unable to serialize unrecognized input');

  function unpackConfig() {
    if (typeof _config !== 'object') return;

    if (
      typeof _config.delimiter === 'string' &&
      !Papa.BAD_DELIMITERS.filter(function(value) {
        return _config.delimiter.indexOf(value) !== -1;
      }).length
    ) {
      _delimiter = _config.delimiter;
    }

    if (typeof _config.quotes === 'boolean' || Array.isArray(_config.quotes))
      _quotes = _config.quotes;

    if (typeof _config.skipEmptyLines === 'boolean' || typeof _config.skipEmptyLines === 'string')
      _skipEmptyLines = _config.skipEmptyLines;

    if (typeof _config.newline === 'string') _newline = _config.newline;

    if (typeof _config.quoteChar === 'string') _quoteChar = _config.quoteChar;

    if (typeof _config.header === 'boolean') _writeHeader = _config.header;

    if (Array.isArray(_config.columns)) {
      if (_config.columns.length === 0) throw new Error('Option columns is empty');

      _columns = _config.columns;
    }

    if (_config.escapeChar !== undefined) {
      _escapedQuote = _config.escapeChar + _quoteChar;
    }
  }

  /** Turns an object's keys into an array */
  function objectKeys(obj) {
    if (typeof obj !== 'object') return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
  }

  /** The double for loop that iterates the data and writes out a CSV string including header row */
  function serialize(fields, data, skipEmptyLines) {
    var csv = '';

    if (typeof fields === 'string') fields = JSON.parse(fields);
    if (typeof data === 'string') data = JSON.parse(data);

    var hasHeader = Array.isArray(fields) && fields.length > 0;
    var dataKeyedByField = !Array.isArray(data[0]);

    // If there a header row, write it first
    if (hasHeader && _writeHeader) {
      for (var i = 0; i < fields.length; i++) {
        if (i > 0) csv += _delimiter;
        csv += safe(fields[i], i);
      }
      if (data.length > 0) csv += _newline;
    }

    // Then write out the data
    for (var row = 0; row < data.length; row++) {
      var maxCol = hasHeader ? fields.length : data[row].length;

      var emptyLine = false;
      var nullLine = hasHeader ? Object.keys(data[row]).length === 0 : data[row].length === 0;
      if (skipEmptyLines && !hasHeader) {
        emptyLine =
          skipEmptyLines === 'greedy'
            ? data[row].join('').trim() === ''
            : data[row].length === 1 && data[row][0].length === 0;
      }
      if (skipEmptyLines === 'greedy' && hasHeader) {
        var line = [];
        for (var c = 0; c < maxCol; c++) {
          var cx = dataKeyedByField ? fields[c] : c;
          line.push(data[row][cx]);
        }
        emptyLine = line.join('').trim() === '';
      }
      if (!emptyLine) {
        for (var col = 0; col < maxCol; col++) {
          if (col > 0 && !nullLine) csv += _delimiter;
          var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
          csv += safe(data[row][colIdx], col);
        }
        if (row < data.length - 1 && (!skipEmptyLines || (maxCol > 0 && !nullLine))) {
          csv += _newline;
        }
      }
    }
    return csv;
  }

  /** Encloses a value around quotes if needed (makes a value safe for CSV insertion) */
  function safe(str, col) {
    if (typeof str === 'undefined' || str === null) return '';

    if (str.constructor === Date) return JSON.stringify(str).slice(1, 25);

    str = str.toString().replace(quoteCharRegex, _escapedQuote);

    var needsQuotes =
      (typeof _quotes === 'boolean' && _quotes) ||
      (Array.isArray(_quotes) && _quotes[col]) ||
      hasAny(str, Papa.BAD_DELIMITERS) ||
      str.indexOf(_delimiter) > -1 ||
      str.charAt(0) === ' ' ||
      str.charAt(str.length - 1) === ' ';

    return needsQuotes ? _quoteChar + str + _quoteChar : str;
  }

  function hasAny(str, substrings) {
    for (var i = 0; i < substrings.length; i++) if (str.indexOf(substrings[i]) > -1) return true;
    return false;
  }
}

/** ChunkStreamer is the base prototype for various streamer implementations. */
function ChunkStreamer(config) {
  this._handle = null;
  this._finished = false;
  this._completed = false;
  this._input = null;
  this._baseIndex = 0;
  this._partialLine = '';
  this._rowCount = 0;
  this._start = 0;
  this._nextChunk = null;
  this.isFirstChunk = true;
  this._completeResults = {
    data: [],
    errors: [],
    meta: {}
  };
  replaceConfig.call(this, config);

  this.parseChunk = function(chunk, isFakeChunk) {
    // First chunk pre-processing
    if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk)) {
      var modifiedChunk = this._config.beforeFirstChunk(chunk);
      if (modifiedChunk !== undefined) chunk = modifiedChunk;
    }
    this.isFirstChunk = false;

    // Rejoin the line we likely just split in two by chunking the file
    var aggregate = this._partialLine + chunk;
    this._partialLine = '';

    var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);

    if (this._handle.paused() || this._handle.aborted()) return;

    var lastIndex = results.meta.cursor;

    if (!this._finished) {
      this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
      this._baseIndex = lastIndex;
    }

    if (results && results.data) this._rowCount += results.data.length;

    var finishedIncludingPreview =
      this._finished || (this._config.preview && this._rowCount >= this._config.preview);

    if (IS_PAPA_WORKER) {
      global.postMessage({
        results: results,
        workerId: Papa.WORKER_ID,
        finished: finishedIncludingPreview
      });
    } else if (isFunction(this._config.chunk) && !isFakeChunk) {
      this._config.chunk(results, this._handle);
      if (this._handle.paused() || this._handle.aborted()) return;
      results = undefined;
      this._completeResults = undefined;
    }

    if (!this._config.step && !this._config.chunk) {
      this._completeResults.data = this._completeResults.data.concat(results.data);
      this._completeResults.errors = this._completeResults.errors.concat(results.errors);
      this._completeResults.meta = results.meta;
    }

    if (
      !this._completed &&
      finishedIncludingPreview &&
      isFunction(this._config.complete) &&
      (!results || !results.meta.aborted)
    ) {
      this._config.complete(this._completeResults, this._input);
      this._completed = true;
    }

    if (!finishedIncludingPreview && (!results || !results.meta.paused)) this._nextChunk();

    return results;
  };

  this._sendError = function(error) {
    if (isFunction(this._config.error)) this._config.error(error);
    else if (IS_PAPA_WORKER && this._config.error) {
      global.postMessage({
        workerId: Papa.WORKER_ID,
        error: error,
        finished: false
      });
    }
  };

  function replaceConfig(config) {
    // Deep-copy the config so we can edit it
    var configCopy = copy(config);
    configCopy.chunkSize = parseInt(configCopy.chunkSize); // parseInt VERY important so we don't concatenate strings!
    if (!config.step && !config.chunk) configCopy.chunkSize = null; // disable Range header if not streaming; bad values break IIS - see issue #196
    this._handle = new ParserHandle(configCopy);
    this._handle.streamer = this;
    this._config = configCopy; // persist the copy to the caller
  }
}
function StringStreamer(config) {
  config = config || {};
  ChunkStreamer.call(this, config);

  var remaining;
  this.stream = function(s) {
    remaining = s;
    return this._nextChunk();
  };
  this._nextChunk = function() {
    if (this._finished) return;
    var size = this._config.chunkSize;
    var chunk = size ? remaining.substr(0, size) : remaining;
    remaining = size ? remaining.substr(size) : '';
    this._finished = !remaining;
    return this.parseChunk(chunk);
  };
}
StringStreamer.prototype = Object.create(StringStreamer.prototype);
StringStreamer.prototype.constructor = StringStreamer;

// Use one ParserHandle per entire CSV file or string
function ParserHandle(_config) {
  // One goal is to minimize the use of regular expressions...
  var FLOAT = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
  var ISO_DATE = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

  var self = this;
  var _stepCounter = 0; // Number of times step was called (number of rows parsed)
  var _rowCounter = 0; // Number of rows that have been parsed so far
  var _input; // The input being parsed
  var _parser; // The core parser being used
  var _paused = false; // Whether we are paused or not
  var _aborted = false; // Whether the parser has aborted or not
  var _delimiterError; // Temporary state between delimiter detection and processing results
  var _fields = []; // Fields are from the header row of the input, if there is one
  var _results = {
    // The last results returned from the parser
    data: [],
    errors: [],
    meta: {}
  };

  if (isFunction(_config.step)) {
    var userStep = _config.step;
    _config.step = function(results) {
      _results = results;

      if (needsHeaderRow()) processResults();
      // only call user's step function after header row
      else {
        processResults();

        // It's possbile that this line was empty and there's no row here after all
        if (!_results.data || _results.data.length === 0) return;

        _stepCounter += results.data.length;
        if (_config.preview && _stepCounter > _config.preview) _parser.abort();
        else userStep(_results, self);
      }
    };
  }

  /**
   * Parses input. Most users won't need, and shouldn't mess with, the baseIndex
   * and ignoreLastRow parameters. They are used by streamers (wrapper functions)
   * when an input comes in multiple chunks, like from a file.
   */
  this.parse = function(input, baseIndex, ignoreLastRow) {
    var quoteChar = _config.quoteChar || '"';
    if (!_config.newline) _config.newline = guessLineEndings(input, quoteChar);

    _delimiterError = false;
    if (!_config.delimiter) {
      var delimGuess = guessDelimiter(
        input,
        _config.newline,
        _config.skipEmptyLines,
        _config.comments,
        _config.delimitersToGuess
      );
      if (delimGuess.successful) _config.delimiter = delimGuess.bestDelimiter;
      else {
        _delimiterError = true; // add error after parsing (otherwise it would be overwritten)
        _config.delimiter = Papa.DefaultDelimiter;
      }
      _results.meta.delimiter = _config.delimiter;
    } else if (isFunction(_config.delimiter)) {
      _config.delimiter = _config.delimiter(input);
      _results.meta.delimiter = _config.delimiter;
    }

    var parserConfig = copy(_config);
    if (_config.preview && _config.header) parserConfig.preview++; // to compensate for header row

    _input = input;
    _parser = new Parser(parserConfig);
    _results = _parser.parse(_input, baseIndex, ignoreLastRow);
    processResults();
    return _paused ? {meta: {paused: true}} : _results || {meta: {paused: false}};
  };

  this.paused = function() {
    return _paused;
  };

  this.pause = function() {
    _paused = true;
    _parser.abort();
    _input = _input.substr(_parser.getCharIndex());
  };

  this.resume = function() {
    _paused = false;
    self.streamer.parseChunk(_input, true);
  };

  this.aborted = function() {
    return _aborted;
  };

  this.abort = function() {
    _aborted = true;
    _parser.abort();
    _results.meta.aborted = true;
    if (isFunction(_config.complete)) _config.complete(_results);
    _input = '';
  };

  function testEmptyLine(s) {
    return _config.skipEmptyLines === 'greedy'
      ? s.join('').trim() === ''
      : s.length === 1 && s[0].length === 0;
  }

  function processResults() {
    if (_results && _delimiterError) {
      addError(
        'Delimiter',
        'UndetectableDelimiter',
        "Unable to auto-detect delimiting character; defaulted to '" + Papa.DefaultDelimiter + "'"
      );
      _delimiterError = false;
    }

    if (_config.skipEmptyLines) {
      for (var i = 0; i < _results.data.length; i++)
        if (testEmptyLine(_results.data[i])) _results.data.splice(i--, 1);
    }

    if (needsHeaderRow()) fillHeaderFields();

    return applyHeaderAndDynamicTypingAndTransformation();
  }

  function needsHeaderRow() {
    return _config.header && _fields.length === 0;
  }

  function fillHeaderFields() {
    if (!_results) return;

    function addHeder(header) {
      if (isFunction(_config.transformHeader)) header = _config.transformHeader(header);

      _fields.push(header);
    }

    if (Array.isArray(_results.data[0])) {
      for (var i = 0; needsHeaderRow() && i < _results.data.length; i++)
        _results.data[i].forEach(addHeder);

      _results.data.splice(0, 1);
    }
    // if _results.data[0] is not an array, we are in a step where _results.data is the row.
    else _results.data.forEach(addHeder);
  }

  function shouldApplyDynamicTyping(field) {
    // Cache function values to avoid calling it for each row
    if (_config.dynamicTypingFunction && _config.dynamicTyping[field] === undefined) {
      _config.dynamicTyping[field] = _config.dynamicTypingFunction(field);
    }
    return (_config.dynamicTyping[field] || _config.dynamicTyping) === true;
  }

  function parseDynamic(field, value) {
    if (shouldApplyDynamicTyping(field)) {
      if (value === 'true' || value === 'TRUE') return true;
      else if (value === 'false' || value === 'FALSE') return false;
      else if (FLOAT.test(value)) return parseFloat(value);
      else if (ISO_DATE.test(value)) return new Date(value);
      else return value === '' ? null : value;
    }
    return value;
  }

  function applyHeaderAndDynamicTypingAndTransformation() {
    if (!_results || !_results.data || (!_config.header && !_config.dynamicTyping && !_config.transform))
      return _results;

    function processRow(rowSource, i) {
      var row = _config.header ? {} : [];

      var j;
      for (j = 0; j < rowSource.length; j++) {
        var field = j;
        var value = rowSource[j];

        if (_config.header) field = j >= _fields.length ? '__parsed_extra' : _fields[j];

        if (_config.transform) value = _config.transform(value, field);

        value = parseDynamic(field, value);

        if (field === '__parsed_extra') {
          row[field] = row[field] || [];
          row[field].push(value);
        } else row[field] = value;
      }

      if (_config.header) {
        if (j > _fields.length)
          addError(
            'FieldMismatch',
            'TooManyFields',
            'Too many fields: expected ' + _fields.length + ' fields but parsed ' + j,
            _rowCounter + i
          );
        else if (j < _fields.length)
          addError(
            'FieldMismatch',
            'TooFewFields',
            'Too few fields: expected ' + _fields.length + ' fields but parsed ' + j,
            _rowCounter + i
          );
      }

      return row;
    }

    var incrementBy = 1;
    if (!_results.data[0] || Array.isArray(_results.data[0])) {
      _results.data = _results.data.map(processRow);
      incrementBy = _results.data.length;
    } else _results.data = processRow(_results.data, 0);

    if (_config.header && _results.meta) _results.meta.fields = _fields;

    _rowCounter += incrementBy;
    return _results;
  }

  function guessDelimiter(input, newline, skipEmptyLines, comments, delimitersToGuess) {
    var bestDelim, bestDelta, fieldCountPrevRow;

    delimitersToGuess = delimitersToGuess || [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP];

    for (var i = 0; i < delimitersToGuess.length; i++) {
      var delim = delimitersToGuess[i];
      var delta = 0,
        avgFieldCount = 0,
        emptyLinesCount = 0;
      fieldCountPrevRow = undefined;

      var preview = new Parser({
        comments: comments,
        delimiter: delim,
        newline: newline,
        preview: 10
      }).parse(input);

      for (var j = 0; j < preview.data.length; j++) {
        if (skipEmptyLines && testEmptyLine(preview.data[j])) {
          emptyLinesCount++;
          continue;
        }
        var fieldCount = preview.data[j].length;
        avgFieldCount += fieldCount;

        if (typeof fieldCountPrevRow === 'undefined') {
          fieldCountPrevRow = 0;
          continue;
        } else if (fieldCount > 1) {
          delta += Math.abs(fieldCount - fieldCountPrevRow);
          fieldCountPrevRow = fieldCount;
        }
      }

      if (preview.data.length > 0) avgFieldCount /= preview.data.length - emptyLinesCount;

      if ((typeof bestDelta === 'undefined' || delta > bestDelta) && avgFieldCount > 1.99) {
        bestDelta = delta;
        bestDelim = delim;
      }
    }

    _config.delimiter = bestDelim;

    return {
      successful: !!bestDelim,
      bestDelimiter: bestDelim
    };
  }

  function guessLineEndings(input, quoteChar) {
    input = input.substr(0, 1024 * 1024); // max length 1 MB
    // Replace all the text inside quotes
    var re = new RegExp(escapeRegExp(quoteChar) + '([^]*?)' + escapeRegExp(quoteChar), 'gm');
    input = input.replace(re, '');

    var r = input.split('\r');

    var n = input.split('\n');

    var nAppearsFirst = n.length > 1 && n[0].length < r[0].length;

    if (r.length === 1 || nAppearsFirst) return '\n';

    var numWithN = 0;
    for (var i = 0; i < r.length; i++) {
      if (r[i][0] === '\n') numWithN++;
    }

    return numWithN >= r.length / 2 ? '\r\n' : '\r';
  }

  function addError(type, code, msg, row) {
    _results.errors.push({
      type: type,
      code: code,
      message: msg,
      row: row
    });
  }
}

/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/** The core parser implements speedy and correct CSV parsing */
function Parser(config) {
  // Unpack the config object
  config = config || {};
  var delim = config.delimiter;
  var newline = config.newline;
  var comments = config.comments;
  var step = config.step;
  var preview = config.preview;
  var fastMode = config.fastMode;
  var quoteChar;
  /** Allows for no quoteChar by setting quoteChar to undefined in config */
  if (config.quoteChar === undefined) {
    quoteChar = '"';
  } else {
    quoteChar = config.quoteChar;
  }
  var escapeChar = quoteChar;
  if (config.escapeChar !== undefined) {
    escapeChar = config.escapeChar;
  }

  // Delimiter must be valid
  if (typeof delim !== 'string' || Papa.BAD_DELIMITERS.indexOf(delim) > -1) delim = ',';

  // Comment character must be valid
  if (comments === delim) throw new Error('Comment character same as delimiter');
  else if (comments === true) comments = '#';
  else if (typeof comments !== 'string' || Papa.BAD_DELIMITERS.indexOf(comments) > -1)
    comments = false;

  // Newline must be valid: \r, \n, or \r\n
  if (newline !== '\n' && newline !== '\r' && newline !== '\r\n') newline = '\n';

  // We're gonna need these at the Parser scope
  var cursor = 0;
  var aborted = false;

  this.parse = function(input, baseIndex, ignoreLastRow) {
    // For some reason, in Chrome, this speeds things up (!?)
    if (typeof input !== 'string') throw new Error('Input must be a string');

    // We don't need to compute some of these every time parse() is called,
    // but having them in a more local scope seems to perform better
    var inputLen = input.length,
      delimLen = delim.length,
      newlineLen = newline.length,
      commentsLen = comments.length;
    var stepIsFunction = isFunction(step);

    // Establish starting state
    cursor = 0;
    var data = [],
      errors = [],
      row = [],
      lastCursor = 0;

    if (!input) return returnable();

    if (fastMode || (fastMode !== false && input.indexOf(quoteChar) === -1)) {
      var rows = input.split(newline);
      for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        cursor += row.length;
        if (i !== rows.length - 1) cursor += newline.length;
        else if (ignoreLastRow) return returnable();
        if (comments && row.substr(0, commentsLen) === comments) continue;
        if (stepIsFunction) {
          data = [];
          pushRow(row.split(delim));
          doStep();
          if (aborted) return returnable();
        } else pushRow(row.split(delim));
        if (preview && i >= preview) {
          data = data.slice(0, preview);
          return returnable(true);
        }
      }
      return returnable();
    }

    var nextDelim = input.indexOf(delim, cursor);
    var nextNewline = input.indexOf(newline, cursor);
    var quoteCharRegex = new RegExp(escapeRegExp(escapeChar) + escapeRegExp(quoteChar), 'g');
    var quoteSearch;

    // Parser loop
    for (;;) {
      // Field has opening quote
      if (input[cursor] === quoteChar) {
        // Start our search for the closing quote where the cursor is
        quoteSearch = cursor;

        // Skip the opening quote
        cursor++;

        for (;;) {
          // Find closing quote
          quoteSearch = input.indexOf(quoteChar, quoteSearch + 1);

          //No other quotes are found - no other delimiters
          if (quoteSearch === -1) {
            if (!ignoreLastRow) {
              // No closing quote... what a pity
              errors.push({
                type: 'Quotes',
                code: 'MissingQuotes',
                message: 'Quoted field unterminated',
                row: data.length, // row has yet to be inserted
                index: cursor
              });
            }
            return finish();
          }

          // Closing quote at EOF
          if (quoteSearch === inputLen - 1) {
            var value = input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar);
            return finish(value);
          }

          // If this quote is escaped, it's part of the data; skip it
          // If the quote character is the escape character, then check if the next character is the escape character
          if (quoteChar === escapeChar && input[quoteSearch + 1] === escapeChar) {
            quoteSearch++;
            continue;
          }

          // If the quote character is not the escape character, then check if the previous character was the escape character
          if (
            quoteChar !== escapeChar &&
            quoteSearch !== 0 &&
            input[quoteSearch - 1] === escapeChar
          ) {
            continue;
          }

          // Check up to nextDelim or nextNewline, whichever is closest
          var checkUpTo = nextNewline === -1 ? nextDelim : Math.min(nextDelim, nextNewline);
          var spacesBetweenQuoteAndDelimiter = extraSpaces(checkUpTo);

          // Closing quote followed by delimiter or 'unnecessary spaces + delimiter'
          if (input[quoteSearch + 1 + spacesBetweenQuoteAndDelimiter] === delim) {
            row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
            cursor = quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen;
            nextDelim = input.indexOf(delim, cursor);
            nextNewline = input.indexOf(newline, cursor);

            if (stepIsFunction) {
              doStep();
              if (aborted) return returnable();
            }

            if (preview && data.length >= preview) return returnable(true);

            break;
          }

          var spacesBetweenQuoteAndNewLine = extraSpaces(nextNewline);

          // Closing quote followed by newline or 'unnecessary spaces + newLine'
          if (
            input.substr(quoteSearch + 1 + spacesBetweenQuoteAndNewLine, newlineLen) === newline
          ) {
            row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
            saveRow(quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen);
            nextDelim = input.indexOf(delim, cursor); // because we may have skipped the nextDelim in the quoted field

            if (stepIsFunction) {
              doStep();
              if (aborted) return returnable();
            }

            if (preview && data.length >= preview) return returnable(true);

            break;
          }

          // Checks for valid closing quotes are complete (escaped quotes or quote followed by EOF/delimiter/newline) -- assume these quotes are part of an invalid text string
          errors.push({
            type: 'Quotes',
            code: 'InvalidQuotes',
            message: 'Trailing quote on quoted field is malformed',
            row: data.length, // row has yet to be inserted
            index: cursor
          });

          quoteSearch++;
          continue;
        }

        if (stepIsFunction) {
          doStep();
          if (aborted) return returnable();
        }

        if (preview && data.length >= preview) return returnable(true);
        continue;
      }

      // Comment found at start of new line
      if (comments && row.length === 0 && input.substr(cursor, commentsLen) === comments) {
        if (nextNewline === -1)
          // Comment ends at EOF
          return returnable();
        cursor = nextNewline + newlineLen;
        nextNewline = input.indexOf(newline, cursor);
        nextDelim = input.indexOf(delim, cursor);
        continue;
      }

      // Next delimiter comes before next newline, so we've reached end of field
      if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1)) {
        row.push(input.substring(cursor, nextDelim));
        cursor = nextDelim + delimLen;
        nextDelim = input.indexOf(delim, cursor);
        continue;
      }

      // End of row
      if (nextNewline !== -1) {
        row.push(input.substring(cursor, nextNewline));
        saveRow(nextNewline + newlineLen);

        if (stepIsFunction) {
          doStep();
          if (aborted) return returnable();
        }

        if (preview && data.length >= preview) return returnable(true);

        continue;
      }

      break;
    }

    return finish();

    function pushRow(row) {
      data.push(row);
      lastCursor = cursor;
    }

    /**
     * checks if there are extra spaces after closing quote and given index without any text
     * if Yes, returns the number of spaces
     */
    function extraSpaces(index) {
      var spaceLength = 0;
      if (index !== -1) {
        var textBetweenClosingQuoteAndIndex = input.substring(quoteSearch + 1, index);
        if (textBetweenClosingQuoteAndIndex && textBetweenClosingQuoteAndIndex.trim() === '') {
          spaceLength = textBetweenClosingQuoteAndIndex.length;
        }
      }
      return spaceLength;
    }

    /**
     * Appends the remaining input from cursor to the end into
     * row, saves the row, calls step, and returns the results.
     */
    function finish(value) {
      if (ignoreLastRow) return returnable();
      if (typeof value === 'undefined') value = input.substr(cursor);
      row.push(value);
      cursor = inputLen; // important in case parsing is paused
      pushRow(row);
      if (stepIsFunction) doStep();
      return returnable();
    }

    /**
     * Appends the current row to the results. It sets the cursor
     * to newCursor and finds the nextNewline. The caller should
     * take care to execute user's step function and check for
     * preview and end parsing if necessary.
     */
    function saveRow(newCursor) {
      cursor = newCursor;
      pushRow(row);
      row = [];
      nextNewline = input.indexOf(newline, cursor);
    }

    /** Returns an object with the results, errors, and meta. */
    function returnable(stopped, step) {
      var isStep = step || false;
      return {
        data: isStep ? data[0] : data,
        errors: errors,
        meta: {
          delimiter: delim,
          linebreak: newline,
          aborted: aborted,
          truncated: !!stopped,
          cursor: lastCursor + (baseIndex || 0)
        }
      };
    }

    /** Executes the user's step function and resets data & errors. */
    function doStep() {
      step(returnable(undefined, true));
      data = [];
      errors = [];
    }
  };

  /** Sets the abort flag */
  this.abort = function() {
    aborted = true;
  };

  /** Gets the cursor position */
  this.getCharIndex = function() {
    return cursor;
  };
}

function notImplemented() {
  throw new Error('Not implemented.');
}

/** Makes a deep copy of an array or object (mostly) */
function copy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  var cpy = Array.isArray(obj) ? [] : {};
  for (var key in obj) cpy[key] = copy(obj[key]);
  return cpy;
}

function isFunction(func) {
  return typeof func === 'function';
}

},{}],73:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "assert", {
  enumerable: true,
  get: function get() {
    return _assert.assert;
  }
});
Object.defineProperty(exports, "isBrowser", {
  enumerable: true,
  get: function get() {
    return _globals.isBrowser;
  }
});
Object.defineProperty(exports, "isWorker", {
  enumerable: true,
  get: function get() {
    return _globals.isWorker;
  }
});
Object.defineProperty(exports, "nodeVersion", {
  enumerable: true,
  get: function get() {
    return _globals.nodeVersion;
  }
});
Object.defineProperty(exports, "self", {
  enumerable: true,
  get: function get() {
    return _globals.self;
  }
});
Object.defineProperty(exports, "window", {
  enumerable: true,
  get: function get() {
    return _globals.window;
  }
});
Object.defineProperty(exports, "global", {
  enumerable: true,
  get: function get() {
    return _globals.global;
  }
});
Object.defineProperty(exports, "document", {
  enumerable: true,
  get: function get() {
    return _globals.document;
  }
});
Object.defineProperty(exports, "createLoaderWorker", {
  enumerable: true,
  get: function get() {
    return _createLoaderWorker.createLoaderWorker;
  }
});
Object.defineProperty(exports, "parseWithWorker", {
  enumerable: true,
  get: function get() {
    return _parseWithWorker.parseWithWorker;
  }
});
Object.defineProperty(exports, "canParseWithWorker", {
  enumerable: true,
  get: function get() {
    return _parseWithWorker.canParseWithWorker;
  }
});
Object.defineProperty(exports, "parseJSON", {
  enumerable: true,
  get: function get() {
    return _parseJson.parseJSON;
  }
});
Object.defineProperty(exports, "toArrayBuffer", {
  enumerable: true,
  get: function get() {
    return _arrayBufferUtils.toArrayBuffer;
  }
});
Object.defineProperty(exports, "sliceArrayBuffer", {
  enumerable: true,
  get: function get() {
    return _arrayBufferUtils.sliceArrayBuffer;
  }
});
Object.defineProperty(exports, "concatenateArrayBuffers", {
  enumerable: true,
  get: function get() {
    return _arrayBufferUtils.concatenateArrayBuffers;
  }
});
Object.defineProperty(exports, "concatenateTypedArrays", {
  enumerable: true,
  get: function get() {
    return _arrayBufferUtils.concatenateTypedArrays;
  }
});
Object.defineProperty(exports, "compareArrayBuffers", {
  enumerable: true,
  get: function get() {
    return _arrayBufferUtils.compareArrayBuffers;
  }
});
Object.defineProperty(exports, "padToNBytes", {
  enumerable: true,
  get: function get() {
    return _memoryCopyUtils.padToNBytes;
  }
});
Object.defineProperty(exports, "copyToArray", {
  enumerable: true,
  get: function get() {
    return _memoryCopyUtils.copyToArray;
  }
});
Object.defineProperty(exports, "copyArrayBuffer", {
  enumerable: true,
  get: function get() {
    return _memoryCopyUtils.copyArrayBuffer;
  }
});
Object.defineProperty(exports, "copyPaddedArrayBufferToDataView", {
  enumerable: true,
  get: function get() {
    return _binaryCopyUtils.copyPaddedArrayBufferToDataView;
  }
});
Object.defineProperty(exports, "copyPaddedStringToDataView", {
  enumerable: true,
  get: function get() {
    return _binaryCopyUtils.copyPaddedStringToDataView;
  }
});
Object.defineProperty(exports, "padStringToByteAlignment", {
  enumerable: true,
  get: function get() {
    return _encodeUtils.padStringToByteAlignment;
  }
});
Object.defineProperty(exports, "copyStringToDataView", {
  enumerable: true,
  get: function get() {
    return _encodeUtils.copyStringToDataView;
  }
});
Object.defineProperty(exports, "copyBinaryToDataView", {
  enumerable: true,
  get: function get() {
    return _encodeUtils.copyBinaryToDataView;
  }
});
Object.defineProperty(exports, "getFirstCharacters", {
  enumerable: true,
  get: function get() {
    return _getFirstCharacters.getFirstCharacters;
  }
});
Object.defineProperty(exports, "getMagicString", {
  enumerable: true,
  get: function get() {
    return _getFirstCharacters.getMagicString;
  }
});
Object.defineProperty(exports, "makeTextEncoderIterator", {
  enumerable: true,
  get: function get() {
    return _textIterators.makeTextEncoderIterator;
  }
});
Object.defineProperty(exports, "makeTextDecoderIterator", {
  enumerable: true,
  get: function get() {
    return _textIterators.makeTextDecoderIterator;
  }
});
Object.defineProperty(exports, "makeLineIterator", {
  enumerable: true,
  get: function get() {
    return _textIterators.makeLineIterator;
  }
});
Object.defineProperty(exports, "makeNumberedLineIterator", {
  enumerable: true,
  get: function get() {
    return _textIterators.makeNumberedLineIterator;
  }
});
Object.defineProperty(exports, "forEach", {
  enumerable: true,
  get: function get() {
    return _asyncIteration.forEach;
  }
});
Object.defineProperty(exports, "concatenateArrayBuffersAsync", {
  enumerable: true,
  get: function get() {
    return _asyncIteration.concatenateArrayBuffersAsync;
  }
});
Object.defineProperty(exports, "RequestScheduler", {
  enumerable: true,
  get: function get() {
    return _requestScheduler.default;
  }
});
Object.defineProperty(exports, "setPathPrefix", {
  enumerable: true,
  get: function get() {
    return _fileAliases.setPathPrefix;
  }
});
Object.defineProperty(exports, "getPathPrefix", {
  enumerable: true,
  get: function get() {
    return _fileAliases.getPathPrefix;
  }
});
Object.defineProperty(exports, "resolvePath", {
  enumerable: true,
  get: function get() {
    return _fileAliases.resolvePath;
  }
});
Object.defineProperty(exports, "_addAliases", {
  enumerable: true,
  get: function get() {
    return _fileAliases.addAliases;
  }
});
Object.defineProperty(exports, "isBuffer", {
  enumerable: true,
  get: function get() {
    return _bufferUtils.isBuffer;
  }
});
Object.defineProperty(exports, "toBuffer", {
  enumerable: true,
  get: function get() {
    return _bufferUtils.toBuffer;
  }
});
Object.defineProperty(exports, "bufferToArrayBuffer", {
  enumerable: true,
  get: function get() {
    return _bufferUtils.bufferToArrayBuffer;
  }
});
Object.defineProperty(exports, "JSONLoader", {
  enumerable: true,
  get: function get() {
    return _jsonLoader.JSONLoader;
  }
});
exports.fs = exports.path = void 0;

var _assert = require("./lib/env-utils/assert");

var _globals = require("./lib/env-utils/globals");

var _createLoaderWorker = require("./lib/worker-loader-utils/create-loader-worker");

var _parseWithWorker = require("./lib/worker-loader-utils/parse-with-worker");

var _parseJson = require("./lib/parser-utils/parse-json");

var _arrayBufferUtils = require("./lib/binary-utils/array-buffer-utils");

var _memoryCopyUtils = require("./lib/binary-utils/memory-copy-utils");

var _binaryCopyUtils = require("./lib/binary-utils/binary-copy-utils");

var _encodeUtils = require("./lib/binary-utils/encode-utils");

var _getFirstCharacters = require("./lib/binary-utils/get-first-characters");

var _textIterators = require("./lib/iterators/text-iterators");

var _asyncIteration = require("./lib/iterators/async-iteration");

var _requestScheduler = _interopRequireDefault(require("./lib/request-utils/request-scheduler"));

var path = _interopRequireWildcard(require("./lib/path-utils/path"));

exports.path = path;

var _fileAliases = require("./lib/path-utils/file-aliases");

var fs = _interopRequireWildcard(require("./lib/node/fs"));

exports.fs = fs;

var _bufferUtils = require("./lib/binary-utils/buffer-utils");

var _jsonLoader = require("./json-loader");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

},{"./json-loader":74,"./lib/binary-utils/array-buffer-utils":75,"./lib/binary-utils/binary-copy-utils":76,"./lib/binary-utils/buffer-utils":77,"./lib/binary-utils/encode-utils":78,"./lib/binary-utils/get-first-characters":79,"./lib/binary-utils/memory-copy-utils":80,"./lib/env-utils/assert":81,"./lib/env-utils/globals":82,"./lib/iterators/async-iteration":83,"./lib/iterators/text-iterators":84,"./lib/node/fs":130,"./lib/parser-utils/parse-json":85,"./lib/path-utils/file-aliases":86,"./lib/path-utils/path":87,"./lib/request-utils/request-scheduler":88,"./lib/worker-loader-utils/create-loader-worker":89,"./lib/worker-loader-utils/parse-with-worker":90,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29}],74:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._typecheckJSONLoader = exports.JSONLoader = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var VERSION = typeof "3.0.9" !== 'undefined' ? "3.0.9" : 'latest';
var JSONLoader = {
  name: 'JSON',
  id: 'json',
  module: 'json',
  version: VERSION,
  extensions: ['json', 'geojson'],
  mimeTypes: ['application/json'],
  category: 'json',
  text: true,
  parseTextSync: parseTextSync,
  parse: function () {
    var _parse = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(arrayBuffer) {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", parseTextSync(new TextDecoder().decode(arrayBuffer)));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function parse(_x) {
      return _parse.apply(this, arguments);
    }

    return parse;
  }(),
  options: {}
};
exports.JSONLoader = JSONLoader;

function parseTextSync(text) {
  return JSON.parse(text);
}

var _typecheckJSONLoader = JSONLoader;
exports._typecheckJSONLoader = _typecheckJSONLoader;

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],75:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof3 = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArrayBuffer = toArrayBuffer;
exports.compareArrayBuffers = compareArrayBuffers;
exports.concatenateArrayBuffers = concatenateArrayBuffers;
exports.concatenateTypedArrays = concatenateTypedArrays;
exports.sliceArrayBuffer = sliceArrayBuffer;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var node = _interopRequireWildcard(require("../node/buffer-utils.node"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof3(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function toArrayBuffer(data) {
  if (node.toArrayBuffer) {
    data = node.toArrayBuffer(data);
  }

  if (data instanceof ArrayBuffer) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    return data.buffer;
  }

  if (typeof data === 'string') {
    var text = data;
    var uint8Array = new TextEncoder().encode(text);
    return uint8Array.buffer;
  }

  if (data && (0, _typeof2.default)(data) === 'object' && data._toArrayBuffer) {
    return data._toArrayBuffer();
  }

  throw new Error('toArrayBuffer');
}

function compareArrayBuffers(arrayBuffer1, arrayBuffer2, byteLength) {
  byteLength = byteLength || arrayBuffer1.byteLength;

  if (arrayBuffer1.byteLength < byteLength || arrayBuffer2.byteLength < byteLength) {
    return false;
  }

  var array1 = new Uint8Array(arrayBuffer1);
  var array2 = new Uint8Array(arrayBuffer2);

  for (var i = 0; i < array1.length; ++i) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

function concatenateArrayBuffers() {
  for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  var sourceArrays = sources.map(function (source2) {
    return source2 instanceof ArrayBuffer ? new Uint8Array(source2) : source2;
  });
  var byteLength = sourceArrays.reduce(function (length, typedArray) {
    return length + typedArray.byteLength;
  }, 0);
  var result = new Uint8Array(byteLength);
  var offset = 0;

  var _iterator = _createForOfIteratorHelper(sourceArrays),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var sourceArray = _step.value;
      result.set(sourceArray, offset);
      offset += sourceArray.byteLength;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return result.buffer;
}

function concatenateTypedArrays() {
  for (var _len2 = arguments.length, typedArrays = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    typedArrays[_key2] = arguments[_key2];
  }

  var arrays = typedArrays;
  var TypedArrayConstructor = arrays && arrays.length > 1 && arrays[0].constructor || null;

  if (!TypedArrayConstructor) {
    throw new Error('"concatenateTypedArrays" - incorrect quantity of arguments or arguments have incompatible data types');
  }

  var sumLength = arrays.reduce(function (acc, value) {
    return acc + value.length;
  }, 0);
  var result = new TypedArrayConstructor(sumLength);
  var offset = 0;

  for (var _i = 0, _arrays = arrays; _i < _arrays.length; _i++) {
    var array = _arrays[_i];
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

function sliceArrayBuffer(arrayBuffer, byteOffset, byteLength) {
  var subArray = byteLength !== undefined ? new Uint8Array(arrayBuffer).subarray(byteOffset, byteOffset + byteLength) : new Uint8Array(arrayBuffer).subarray(byteOffset);
  var arrayCopy = new Uint8Array(subArray);
  return arrayCopy.buffer;
}

},{"../node/buffer-utils.node":130,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29}],76:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.copyPaddedArrayBufferToDataView = copyPaddedArrayBufferToDataView;
exports.copyPaddedStringToDataView = copyPaddedStringToDataView;

var _memoryCopyUtils = require("./memory-copy-utils");

function copyPaddedArrayBufferToDataView(dataView, byteOffset, sourceBuffer, padding) {
  var paddedLength = (0, _memoryCopyUtils.padToNBytes)(sourceBuffer.byteLength, padding);
  var padLength = paddedLength - sourceBuffer.byteLength;

  if (dataView) {
    var targetArray = new Uint8Array(dataView.buffer, dataView.byteOffset + byteOffset, sourceBuffer.byteLength);
    var sourceArray = new Uint8Array(sourceBuffer);
    targetArray.set(sourceArray);

    for (var i = 0; i < padLength; ++i) {
      dataView.setUint8(byteOffset + sourceBuffer.byteLength + i, 0x20);
    }
  }

  byteOffset += paddedLength;
  return byteOffset;
}

function copyPaddedStringToDataView(dataView, byteOffset, string, padding) {
  var textEncoder = new TextEncoder();
  var stringBuffer = textEncoder.encode(string);
  byteOffset = copyPaddedArrayBufferToDataView(dataView, byteOffset, stringBuffer, padding);
  return byteOffset;
}

},{"./memory-copy-utils":80}],77:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof3 = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBuffer = isBuffer;
exports.toBuffer = toBuffer;
exports.bufferToArrayBuffer = bufferToArrayBuffer;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var node = _interopRequireWildcard(require("../node/buffer-utils.node"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof3(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function isBuffer(value) {
  return value && (0, _typeof2.default)(value) === 'object' && value.isBuffer;
}

function toBuffer(data) {
  return node.toBuffer ? node.toBuffer(data) : data;
}

function bufferToArrayBuffer(data) {
  if (node.toArrayBuffer) {
    return node.toArrayBuffer(data);
  }

  return data;
}

},{"../node/buffer-utils.node":130,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29}],78:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.padStringToByteAlignment = padStringToByteAlignment;
exports.copyStringToDataView = copyStringToDataView;
exports.copyBinaryToDataView = copyBinaryToDataView;

function padStringToByteAlignment(string, byteAlignment) {
  var length = string.length;
  var paddedLength = Math.ceil(length / byteAlignment) * byteAlignment;
  var padding = paddedLength - length;
  var whitespace = '';

  for (var i = 0; i < padding; ++i) {
    whitespace += ' ';
  }

  return string + whitespace;
}

function copyStringToDataView(dataView, byteOffset, string, byteLength) {
  if (dataView) {
    for (var i = 0; i < byteLength; i++) {
      dataView.setUint8(byteOffset + i, string.charCodeAt(i));
    }
  }

  return byteOffset + byteLength;
}

function copyBinaryToDataView(dataView, byteOffset, binary, byteLength) {
  if (dataView) {
    for (var i = 0; i < byteLength; i++) {
      dataView.setUint8(byteOffset + i, binary[i]);
    }
  }

  return byteOffset + byteLength;
}

},{}],79:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFirstCharacters = getFirstCharacters;
exports.getMagicString = getMagicString;

function getFirstCharacters(data) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (typeof data === 'string') {
    return data.slice(0, length);
  } else if (ArrayBuffer.isView(data)) {
    return getMagicString(data.buffer, data.byteOffset, length);
  } else if (data instanceof ArrayBuffer) {
    var byteOffset = 0;
    return getMagicString(data, byteOffset, length);
  }

  return '';
}

function getMagicString(arrayBuffer, byteOffset, length) {
  if (arrayBuffer.byteLength <= byteOffset + length) {
    return '';
  }

  var dataView = new DataView(arrayBuffer);
  var magic = '';

  for (var i = 0; i < length; i++) {
    magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
  }

  return magic;
}

},{}],80:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.padToNBytes = padToNBytes;
exports.copyArrayBuffer = copyArrayBuffer;
exports.copyToArray = copyToArray;

var _assert = require("../env-utils/assert");

function padToNBytes(byteLength, padding) {
  (0, _assert.assert)(byteLength >= 0);
  (0, _assert.assert)(padding > 0);
  return byteLength + (padding - 1) & ~(padding - 1);
}

function copyArrayBuffer(targetBuffer, sourceBuffer, byteOffset) {
  var byteLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sourceBuffer.byteLength;
  var targetArray = new Uint8Array(targetBuffer, byteOffset, byteLength);
  var sourceArray = new Uint8Array(sourceBuffer);
  targetArray.set(sourceArray);
  return targetBuffer;
}

function copyToArray(source, target, targetOffset) {
  var sourceArray;

  if (source instanceof ArrayBuffer) {
    sourceArray = new Uint8Array(source);
  } else {
    var srcByteOffset = source.byteOffset;
    var srcByteLength = source.byteLength;
    sourceArray = new Uint8Array(source.buffer || source.arrayBuffer, srcByteOffset, srcByteLength);
  }

  target.set(sourceArray, targetOffset);
  return targetOffset + padToNBytes(sourceArray.byteLength, 4);
}

},{"../env-utils/assert":81}],81:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assert = assert;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'loader assertion failed.');
  }
}

},{}],82:[function(require,module,exports){
(function (process,global){(function (){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nodeVersion = exports.isWorker = exports.isBrowser = exports.document = exports.global = exports.window = exports.self = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof global !== 'undefined' && global,
  document: typeof document !== 'undefined' && document
};
var self_ = globals.self || globals.window || globals.global || {};
exports.self = self_;
var window_ = globals.window || globals.self || globals.global || {};
exports.window = window_;
var global_ = globals.global || globals.self || globals.window || {};
exports.global = global_;
var document_ = globals.document || {};
exports.document = document_;
var isBrowser = (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) !== 'object' || String(process) !== '[object process]' || process.browser;
exports.isBrowser = isBrowser;
var isWorker = typeof importScripts === 'function';
exports.isWorker = isWorker;
var matches = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
var nodeVersion = matches && parseFloat(matches[1]) || 0;
exports.nodeVersion = nodeVersion;

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"_process":153}],83:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forEach = forEach;
exports.concatenateArrayBuffersAsync = concatenateArrayBuffersAsync;
exports.concatenateStringsAsync = concatenateStringsAsync;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _arrayBufferUtils = require("../binary-utils/array-buffer-utils");

function forEach(_x, _x2) {
  return _forEach.apply(this, arguments);
}

function _forEach() {
  _forEach = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(iterator, visitor) {
    var _yield$iterator$next, done, value, cancel;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!true) {
              _context.next = 14;
              break;
            }

            _context.next = 3;
            return iterator.next();

          case 3:
            _yield$iterator$next = _context.sent;
            done = _yield$iterator$next.done;
            value = _yield$iterator$next.value;

            if (!done) {
              _context.next = 9;
              break;
            }

            iterator.return();
            return _context.abrupt("return");

          case 9:
            cancel = visitor(value);

            if (!cancel) {
              _context.next = 12;
              break;
            }

            return _context.abrupt("return");

          case 12:
            _context.next = 0;
            break;

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _forEach.apply(this, arguments);
}

function concatenateArrayBuffersAsync(_x3) {
  return _concatenateArrayBuffersAsync.apply(this, arguments);
}

function _concatenateArrayBuffersAsync() {
  _concatenateArrayBuffersAsync = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(asyncIterator) {
    var arrayBuffers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            arrayBuffers = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context2.prev = 3;
            _iterator = (0, _asyncIterator2.default)(asyncIterator);

          case 5:
            _context2.next = 7;
            return _iterator.next();

          case 7:
            _step = _context2.sent;
            _iteratorNormalCompletion = _step.done;
            _context2.next = 11;
            return _step.value;

          case 11:
            _value = _context2.sent;

            if (_iteratorNormalCompletion) {
              _context2.next = 18;
              break;
            }

            chunk = _value;
            arrayBuffers.push(chunk);

          case 15:
            _iteratorNormalCompletion = true;
            _context2.next = 5;
            break;

          case 18:
            _context2.next = 24;
            break;

          case 20:
            _context2.prev = 20;
            _context2.t0 = _context2["catch"](3);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 24:
            _context2.prev = 24;
            _context2.prev = 25;

            if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
              _context2.next = 29;
              break;
            }

            _context2.next = 29;
            return _iterator.return();

          case 29:
            _context2.prev = 29;

            if (!_didIteratorError) {
              _context2.next = 32;
              break;
            }

            throw _iteratorError;

          case 32:
            return _context2.finish(29);

          case 33:
            return _context2.finish(24);

          case 34:
            return _context2.abrupt("return", _arrayBufferUtils.concatenateArrayBuffers.apply(void 0, arrayBuffers));

          case 35:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 20, 24, 34], [25,, 29, 33]]);
  }));
  return _concatenateArrayBuffersAsync.apply(this, arguments);
}

function concatenateStringsAsync(_x4) {
  return _concatenateStringsAsync.apply(this, arguments);
}

function _concatenateStringsAsync() {
  _concatenateStringsAsync = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(asyncIterator) {
    var strings, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, chunk;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            strings = [];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _context3.prev = 3;
            _iterator2 = (0, _asyncIterator2.default)(asyncIterator);

          case 5:
            _context3.next = 7;
            return _iterator2.next();

          case 7:
            _step2 = _context3.sent;
            _iteratorNormalCompletion2 = _step2.done;
            _context3.next = 11;
            return _step2.value;

          case 11:
            _value2 = _context3.sent;

            if (_iteratorNormalCompletion2) {
              _context3.next = 18;
              break;
            }

            chunk = _value2;
            strings.push(chunk);

          case 15:
            _iteratorNormalCompletion2 = true;
            _context3.next = 5;
            break;

          case 18:
            _context3.next = 24;
            break;

          case 20:
            _context3.prev = 20;
            _context3.t0 = _context3["catch"](3);
            _didIteratorError2 = true;
            _iteratorError2 = _context3.t0;

          case 24:
            _context3.prev = 24;
            _context3.prev = 25;

            if (!(!_iteratorNormalCompletion2 && _iterator2.return != null)) {
              _context3.next = 29;
              break;
            }

            _context3.next = 29;
            return _iterator2.return();

          case 29:
            _context3.prev = 29;

            if (!_didIteratorError2) {
              _context3.next = 32;
              break;
            }

            throw _iteratorError2;

          case 32:
            return _context3.finish(29);

          case 33:
            return _context3.finish(24);

          case 34:
            return _context3.abrupt("return", strings.join(''));

          case 35:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 20, 24, 34], [25,, 29, 33]]);
  }));
  return _concatenateStringsAsync.apply(this, arguments);
}

},{"../binary-utils/array-buffer-utils":75,"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],84:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeTextDecoderIterator = makeTextDecoderIterator;
exports.makeTextEncoderIterator = makeTextEncoderIterator;
exports.makeLineIterator = makeLineIterator;
exports.makeNumberedLineIterator = makeNumberedLineIterator;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

function makeTextDecoderIterator(_x) {
  return _makeTextDecoderIterator.apply(this, arguments);
}

function _makeTextDecoderIterator() {
  _makeTextDecoderIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee(arrayBufferIterator) {
    var options,
        textDecoder,
        _iteratorNormalCompletion,
        _didIteratorError,
        _iteratorError,
        _iterator,
        _step,
        _value,
        arrayBuffer,
        _args = arguments;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
            textDecoder = new TextDecoder(undefined, options);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context.prev = 4;
            _iterator = (0, _asyncIterator2.default)(arrayBufferIterator);

          case 6:
            _context.next = 8;
            return (0, _awaitAsyncGenerator2.default)(_iterator.next());

          case 8:
            _step = _context.sent;
            _iteratorNormalCompletion = _step.done;
            _context.next = 12;
            return (0, _awaitAsyncGenerator2.default)(_step.value);

          case 12:
            _value = _context.sent;

            if (_iteratorNormalCompletion) {
              _context.next = 20;
              break;
            }

            arrayBuffer = _value;
            _context.next = 17;
            return typeof arrayBuffer === 'string' ? arrayBuffer : textDecoder.decode(arrayBuffer, {
              stream: true
            });

          case 17:
            _iteratorNormalCompletion = true;
            _context.next = 6;
            break;

          case 20:
            _context.next = 26;
            break;

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](4);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 26:
            _context.prev = 26;
            _context.prev = 27;

            if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
              _context.next = 31;
              break;
            }

            _context.next = 31;
            return (0, _awaitAsyncGenerator2.default)(_iterator.return());

          case 31:
            _context.prev = 31;

            if (!_didIteratorError) {
              _context.next = 34;
              break;
            }

            throw _iteratorError;

          case 34:
            return _context.finish(31);

          case 35:
            return _context.finish(26);

          case 36:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[4, 22, 26, 36], [27,, 31, 35]]);
  }));
  return _makeTextDecoderIterator.apply(this, arguments);
}

function makeTextEncoderIterator(_x2) {
  return _makeTextEncoderIterator.apply(this, arguments);
}

function _makeTextEncoderIterator() {
  _makeTextEncoderIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee2(textIterator) {
    var textEncoder, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, text;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            textEncoder = new TextEncoder();
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _context2.prev = 3;
            _iterator2 = (0, _asyncIterator2.default)(textIterator);

          case 5:
            _context2.next = 7;
            return (0, _awaitAsyncGenerator2.default)(_iterator2.next());

          case 7:
            _step2 = _context2.sent;
            _iteratorNormalCompletion2 = _step2.done;
            _context2.next = 11;
            return (0, _awaitAsyncGenerator2.default)(_step2.value);

          case 11:
            _value2 = _context2.sent;

            if (_iteratorNormalCompletion2) {
              _context2.next = 19;
              break;
            }

            text = _value2;
            _context2.next = 16;
            return typeof text === 'string' ? textEncoder.encode(text) : text;

          case 16:
            _iteratorNormalCompletion2 = true;
            _context2.next = 5;
            break;

          case 19:
            _context2.next = 25;
            break;

          case 21:
            _context2.prev = 21;
            _context2.t0 = _context2["catch"](3);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t0;

          case 25:
            _context2.prev = 25;
            _context2.prev = 26;

            if (!(!_iteratorNormalCompletion2 && _iterator2.return != null)) {
              _context2.next = 30;
              break;
            }

            _context2.next = 30;
            return (0, _awaitAsyncGenerator2.default)(_iterator2.return());

          case 30:
            _context2.prev = 30;

            if (!_didIteratorError2) {
              _context2.next = 33;
              break;
            }

            throw _iteratorError2;

          case 33:
            return _context2.finish(30);

          case 34:
            return _context2.finish(25);

          case 35:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 21, 25, 35], [26,, 30, 34]]);
  }));
  return _makeTextEncoderIterator.apply(this, arguments);
}

function makeLineIterator(_x3) {
  return _makeLineIterator.apply(this, arguments);
}

function _makeLineIterator() {
  _makeLineIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee3(textIterator) {
    var previous, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _value3, textChunk, eolIndex, line;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            previous = '';
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _context3.prev = 3;
            _iterator3 = (0, _asyncIterator2.default)(textIterator);

          case 5:
            _context3.next = 7;
            return (0, _awaitAsyncGenerator2.default)(_iterator3.next());

          case 7:
            _step3 = _context3.sent;
            _iteratorNormalCompletion3 = _step3.done;
            _context3.next = 11;
            return (0, _awaitAsyncGenerator2.default)(_step3.value);

          case 11:
            _value3 = _context3.sent;

            if (_iteratorNormalCompletion3) {
              _context3.next = 26;
              break;
            }

            textChunk = _value3;
            previous += textChunk;
            eolIndex = void 0;

          case 16:
            if (!((eolIndex = previous.indexOf('\n')) >= 0)) {
              _context3.next = 23;
              break;
            }

            line = previous.slice(0, eolIndex + 1);
            previous = previous.slice(eolIndex + 1);
            _context3.next = 21;
            return line;

          case 21:
            _context3.next = 16;
            break;

          case 23:
            _iteratorNormalCompletion3 = true;
            _context3.next = 5;
            break;

          case 26:
            _context3.next = 32;
            break;

          case 28:
            _context3.prev = 28;
            _context3.t0 = _context3["catch"](3);
            _didIteratorError3 = true;
            _iteratorError3 = _context3.t0;

          case 32:
            _context3.prev = 32;
            _context3.prev = 33;

            if (!(!_iteratorNormalCompletion3 && _iterator3.return != null)) {
              _context3.next = 37;
              break;
            }

            _context3.next = 37;
            return (0, _awaitAsyncGenerator2.default)(_iterator3.return());

          case 37:
            _context3.prev = 37;

            if (!_didIteratorError3) {
              _context3.next = 40;
              break;
            }

            throw _iteratorError3;

          case 40:
            return _context3.finish(37);

          case 41:
            return _context3.finish(32);

          case 42:
            if (!(previous.length > 0)) {
              _context3.next = 45;
              break;
            }

            _context3.next = 45;
            return previous;

          case 45:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 28, 32, 42], [33,, 37, 41]]);
  }));
  return _makeLineIterator.apply(this, arguments);
}

function makeNumberedLineIterator(_x4) {
  return _makeNumberedLineIterator.apply(this, arguments);
}

function _makeNumberedLineIterator() {
  _makeNumberedLineIterator = (0, _wrapAsyncGenerator2.default)(_regenerator.default.mark(function _callee4(lineIterator) {
    var counter, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _value4, line;

    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            counter = 1;
            _iteratorNormalCompletion4 = true;
            _didIteratorError4 = false;
            _context4.prev = 3;
            _iterator4 = (0, _asyncIterator2.default)(lineIterator);

          case 5:
            _context4.next = 7;
            return (0, _awaitAsyncGenerator2.default)(_iterator4.next());

          case 7:
            _step4 = _context4.sent;
            _iteratorNormalCompletion4 = _step4.done;
            _context4.next = 11;
            return (0, _awaitAsyncGenerator2.default)(_step4.value);

          case 11:
            _value4 = _context4.sent;

            if (_iteratorNormalCompletion4) {
              _context4.next = 20;
              break;
            }

            line = _value4;
            _context4.next = 16;
            return {
              counter: counter,
              line: line
            };

          case 16:
            counter++;

          case 17:
            _iteratorNormalCompletion4 = true;
            _context4.next = 5;
            break;

          case 20:
            _context4.next = 26;
            break;

          case 22:
            _context4.prev = 22;
            _context4.t0 = _context4["catch"](3);
            _didIteratorError4 = true;
            _iteratorError4 = _context4.t0;

          case 26:
            _context4.prev = 26;
            _context4.prev = 27;

            if (!(!_iteratorNormalCompletion4 && _iterator4.return != null)) {
              _context4.next = 31;
              break;
            }

            _context4.next = 31;
            return (0, _awaitAsyncGenerator2.default)(_iterator4.return());

          case 31:
            _context4.prev = 31;

            if (!_didIteratorError4) {
              _context4.next = 34;
              break;
            }

            throw _iteratorError4;

          case 34:
            return _context4.finish(31);

          case 35:
            return _context4.finish(26);

          case 36:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[3, 22, 26, 36], [27,, 31, 35]]);
  }));
  return _makeNumberedLineIterator.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/awaitAsyncGenerator":11,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/wrapAsyncGenerator":31,"@babel/runtime/regenerator":33}],85:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseJSON = parseJSON;

var _getFirstCharacters = require("../binary-utils/get-first-characters");

function parseJSON(string) {
  try {
    return JSON.parse(string);
  } catch (_) {
    throw new Error("Failed to parse JSON from data starting with \"".concat((0, _getFirstCharacters.getFirstCharacters)(string), "\""));
  }
}

},{"../binary-utils/get-first-characters":79}],86:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPathPrefix = setPathPrefix;
exports.getPathPrefix = getPathPrefix;
exports.addAliases = addAliases;
exports.resolvePath = resolvePath;
var pathPrefix = '';
var fileAliases = {};

function setPathPrefix(prefix) {
  pathPrefix = prefix;
}

function getPathPrefix() {
  return pathPrefix;
}

function addAliases(aliases) {
  Object.assign(fileAliases, aliases);
}

function resolvePath(filename) {
  for (var alias in fileAliases) {
    if (filename.startsWith(alias)) {
      var replacement = fileAliases[alias];
      filename = filename.replace(alias, replacement);
    }
  }

  if (!filename.startsWith('http://') && !filename.startsWith('https://')) {
    filename = "".concat(pathPrefix).concat(filename);
  }

  return filename;
}

},{}],87:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dirname = dirname;
exports.join = join;

function dirname(url) {
  var slashIndex = url && url.lastIndexOf('/');
  return slashIndex >= 0 ? url.substr(0, slashIndex) : '';
}

function join() {
  for (var _len = arguments.length, parts = new Array(_len), _key = 0; _key < _len; _key++) {
    parts[_key] = arguments[_key];
  }

  var separator = '/';
  parts = parts.map(function (part, index) {
    if (index) {
      part = part.replace(new RegExp("^".concat(separator)), '');
    }

    if (index !== parts.length - 1) {
      part = part.replace(new RegExp("".concat(separator, "$")), '');
    }

    return part;
  });
  return parts.join(separator);
}

},{}],88:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _stats = require("@probe.gl/stats");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var STAT_QUEUED_REQUESTS = 'Queued Requests';
var STAT_ACTIVE_REQUESTS = 'Active Requests';
var STAT_CANCELLED_REQUESTS = 'Cancelled Requests';
var STAT_QUEUED_REQUESTS_EVER = 'Queued Requests Ever';
var STAT_ACTIVE_REQUESTS_EVER = 'Active Requests Ever';
var DEFAULT_PROPS = {
  id: 'request-scheduler',
  throttleRequests: true,
  maxRequests: 6
};

var RequestScheduler = function () {
  function RequestScheduler() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2.default)(this, RequestScheduler);
    (0, _defineProperty2.default)(this, "props", void 0);
    (0, _defineProperty2.default)(this, "stats", void 0);
    (0, _defineProperty2.default)(this, "activeRequestCount", 0);
    (0, _defineProperty2.default)(this, "requestQueue", []);
    (0, _defineProperty2.default)(this, "requestMap", new Map());
    (0, _defineProperty2.default)(this, "deferredUpdate", null);
    this.props = _objectSpread(_objectSpread({}, DEFAULT_PROPS), props);
    this.stats = new _stats.Stats({
      id: this.props.id
    });
    this.stats.get(STAT_QUEUED_REQUESTS);
    this.stats.get(STAT_ACTIVE_REQUESTS);
    this.stats.get(STAT_CANCELLED_REQUESTS);
    this.stats.get(STAT_QUEUED_REQUESTS_EVER);
    this.stats.get(STAT_ACTIVE_REQUESTS_EVER);
  }

  (0, _createClass2.default)(RequestScheduler, [{
    key: "scheduleRequest",
    value: function scheduleRequest(handle) {
      var getPriority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return 0;
      };

      if (!this.props.throttleRequests) {
        return Promise.resolve({
          done: function done() {}
        });
      }

      if (this.requestMap.has(handle)) {
        return this.requestMap.get(handle);
      }

      var request = {
        handle: handle,
        priority: 0,
        getPriority: getPriority
      };
      var promise = new Promise(function (resolve) {
        request.resolve = resolve;
        return request;
      });
      this.requestQueue.push(request);
      this.requestMap.set(handle, promise);

      this._issueNewRequests();

      return promise;
    }
  }, {
    key: "_issueRequest",
    value: function _issueRequest(request) {
      var _this = this;

      var handle = request.handle,
          resolve = request.resolve;
      var isDone = false;

      var done = function done() {
        if (!isDone) {
          isDone = true;

          _this.requestMap.delete(handle);

          _this.activeRequestCount--;

          _this._issueNewRequests();
        }
      };

      this.activeRequestCount++;
      return resolve ? resolve({
        done: done
      }) : Promise.resolve({
        done: done
      });
    }
  }, {
    key: "_issueNewRequests",
    value: function _issueNewRequests() {
      var _this2 = this;

      if (!this.deferredUpdate) {
        this.deferredUpdate = setTimeout(function () {
          return _this2._issueNewRequestsAsync();
        }, 0);
      }
    }
  }, {
    key: "_issueNewRequestsAsync",
    value: function _issueNewRequestsAsync() {
      this.deferredUpdate = null;
      var freeSlots = Math.max(this.props.maxRequests - this.activeRequestCount, 0);

      if (freeSlots === 0) {
        return;
      }

      this._updateAllRequests();

      for (var i = 0; i < freeSlots; ++i) {
        var request = this.requestQueue.shift();

        if (request) {
          this._issueRequest(request);
        }
      }
    }
  }, {
    key: "_updateAllRequests",
    value: function _updateAllRequests() {
      var requestQueue = this.requestQueue;

      for (var i = 0; i < requestQueue.length; ++i) {
        var request = requestQueue[i];

        if (!this._updateRequest(request)) {
          requestQueue.splice(i, 1);
          this.requestMap.delete(request.handle);
          i--;
        }
      }

      requestQueue.sort(function (a, b) {
        return a.priority - b.priority;
      });
    }
  }, {
    key: "_updateRequest",
    value: function _updateRequest(request) {
      request.priority = request.getPriority(request.handle);

      if (request.priority < 0) {
        request.resolve(null);
        return false;
      }

      return true;
    }
  }]);
  return RequestScheduler;
}();

exports.default = RequestScheduler;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@probe.gl/stats":126}],89:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLoaderWorker = createLoaderWorker;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _workerUtils = require("@loaders.gl/worker-utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var requestId = 0;

function createLoaderWorker(loader) {
  if (typeof self === 'undefined') {
    return;
  }

  _workerUtils.WorkerBody.onmessage = function () {
    var _ref = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(type, payload) {
      var input, _payload$options, options, result, message;

      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = type;
              _context.next = _context.t0 === 'process' ? 3 : 16;
              break;

            case 3:
              _context.prev = 3;
              input = payload.input, _payload$options = payload.options, options = _payload$options === void 0 ? {} : _payload$options;
              _context.next = 7;
              return parseData({
                loader: loader,
                arrayBuffer: input,
                options: options,
                context: {
                  parse: parseOnMainThread
                }
              });

            case 7:
              result = _context.sent;

              _workerUtils.WorkerBody.postMessage('done', {
                result: result
              });

              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t1 = _context["catch"](3);
              message = _context.t1 instanceof Error ? _context.t1.message : '';

              _workerUtils.WorkerBody.postMessage('error', {
                error: message
              });

            case 15:
              return _context.abrupt("break", 16);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 11]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}

function parseOnMainThread(arrayBuffer, options) {
  return new Promise(function (resolve, reject) {
    var id = requestId++;

    var onMessage = function onMessage(type, payload) {
      if (payload.id !== id) {
        return;
      }

      switch (type) {
        case 'done':
          _workerUtils.WorkerBody.removeEventListener(onMessage);

          resolve(payload.result);
          break;

        case 'error':
          _workerUtils.WorkerBody.removeEventListener(onMessage);

          reject(payload.error);
          break;

        default:
      }
    };

    _workerUtils.WorkerBody.addEventListener(onMessage);

    var payload = {
      id: id,
      input: arrayBuffer,
      options: options
    };

    _workerUtils.WorkerBody.postMessage('process', payload);
  });
}

function parseData(_x3) {
  return _parseData.apply(this, arguments);
}

function _parseData() {
  _parseData = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(_ref2) {
    var loader, arrayBuffer, options, context, data, parser, textDecoder;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            loader = _ref2.loader, arrayBuffer = _ref2.arrayBuffer, options = _ref2.options, context = _ref2.context;

            if (!(loader.parseSync || loader.parse)) {
              _context2.next = 6;
              break;
            }

            data = arrayBuffer;
            parser = loader.parseSync || loader.parse;
            _context2.next = 13;
            break;

          case 6:
            if (!loader.parseTextSync) {
              _context2.next = 12;
              break;
            }

            textDecoder = new TextDecoder();
            data = textDecoder.decode(arrayBuffer);
            parser = loader.parseTextSync;
            _context2.next = 13;
            break;

          case 12:
            throw new Error("Could not load data with ".concat(loader.name, " loader"));

          case 13:
            options = _objectSpread(_objectSpread({}, options), {}, {
              modules: loader && loader.options && loader.options.modules || {},
              worker: false
            });
            _context2.next = 16;
            return parser(data, _objectSpread({}, options), context, loader);

          case 16:
            return _context2.abrupt("return", _context2.sent);

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _parseData.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33,"@loaders.gl/worker-utils":108}],90:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canParseWithWorker = canParseWithWorker;
exports.parseWithWorker = parseWithWorker;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _workerUtils = require("@loaders.gl/worker-utils");

function canParseWithWorker(loader, options) {
  if (!_workerUtils.WorkerFarm.isSupported()) {
    return false;
  }

  return loader.worker && (options === null || options === void 0 ? void 0 : options.worker);
}

function parseWithWorker(_x, _x2, _x3, _x4, _x5) {
  return _parseWithWorker.apply(this, arguments);
}

function _parseWithWorker() {
  _parseWithWorker = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(loader, data, options, context, parseOnMainThread) {
    var name, url, workerFarm, workerPool, job, result;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            name = loader.id;
            url = (0, _workerUtils.getWorkerURL)(loader, options);
            workerFarm = _workerUtils.WorkerFarm.getWorkerFarm(options);
            workerPool = workerFarm.getWorkerPool({
              name: name,
              url: url
            });
            options = JSON.parse(JSON.stringify(options));
            _context.next = 7;
            return workerPool.startJob('process-on-worker', onMessage.bind(null, parseOnMainThread));

          case 7:
            job = _context.sent;
            job.postMessage('process', {
              input: data,
              options: options
            });
            _context.next = 11;
            return job.result;

          case 11:
            result = _context.sent;
            _context.next = 14;
            return result.result;

          case 14:
            return _context.abrupt("return", _context.sent);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _parseWithWorker.apply(this, arguments);
}

function onMessage(_x6, _x7, _x8, _x9) {
  return _onMessage.apply(this, arguments);
}

function _onMessage() {
  _onMessage = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(parseOnMainThread, job, type, payload) {
    var id, input, options, result, message;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.t0 = type;
            _context2.next = _context2.t0 === 'done' ? 3 : _context2.t0 === 'error' ? 5 : _context2.t0 === 'process' ? 7 : 20;
            break;

          case 3:
            job.done(payload);
            return _context2.abrupt("break", 21);

          case 5:
            job.error(payload.error);
            return _context2.abrupt("break", 21);

          case 7:
            id = payload.id, input = payload.input, options = payload.options;
            _context2.prev = 8;
            _context2.next = 11;
            return parseOnMainThread(input, options);

          case 11:
            result = _context2.sent;
            job.postMessage('done', {
              id: id,
              result: result
            });
            _context2.next = 19;
            break;

          case 15:
            _context2.prev = 15;
            _context2.t1 = _context2["catch"](8);
            message = _context2.t1 instanceof Error ? _context2.t1.message : 'unknown error';
            job.postMessage('error', {
              id: id,
              error: message
            });

          case 19:
            return _context2.abrupt("break", 21);

          case 20:
            console.warn("parse-with-worker unknown message ".concat(type));

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[8, 15]]);
  }));
  return _onMessage.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33,"@loaders.gl/worker-utils":108}],91:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMeshSize = getMeshSize;
exports.getMeshBoundingBox = getMeshBoundingBox;

function getMeshSize(attributes) {
  var size = 0;

  for (var attributeName in attributes) {
    var attribute = attributes[attributeName];

    if (ArrayBuffer.isView(attribute)) {
      size += attribute.byteLength * attribute.BYTES_PER_ELEMENT;
    }
  }

  return size;
}

function getMeshBoundingBox(attributes) {
  var minX = Infinity;
  var minY = Infinity;
  var minZ = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var maxZ = -Infinity;
  var positions = attributes.POSITION ? attributes.POSITION.value : [];
  var len = positions && positions.length;

  for (var i = 0; i < len; i += 3) {
    var x = positions[i];
    var y = positions[i + 1];
    var z = positions[i + 2];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    minZ = z < minZ ? z : minZ;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    maxZ = z > maxZ ? z : maxZ;
  }

  return [[minX, minY, minZ], [maxX, maxY, maxZ]];
}

},{}],92:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TableBatchBuilder", {
  enumerable: true,
  get: function get() {
    return _tableBatchBuilder.default;
  }
});
Object.defineProperty(exports, "RowTableBatchAggregator", {
  enumerable: true,
  get: function get() {
    return _rowTableBatchAggregator.default;
  }
});
Object.defineProperty(exports, "ColumnarTableBatchAggregator", {
  enumerable: true,
  get: function get() {
    return _columnarTableBatchAggregator.default;
  }
});
Object.defineProperty(exports, "convertToObjectRow", {
  enumerable: true,
  get: function get() {
    return _rowUtils.convertToObjectRow;
  }
});
Object.defineProperty(exports, "convertToArrayRow", {
  enumerable: true,
  get: function get() {
    return _rowUtils.convertToArrayRow;
  }
});
Object.defineProperty(exports, "getMeshSize", {
  enumerable: true,
  get: function get() {
    return _meshUtils.getMeshSize;
  }
});
Object.defineProperty(exports, "getMeshBoundingBox", {
  enumerable: true,
  get: function get() {
    return _meshUtils.getMeshBoundingBox;
  }
});
Object.defineProperty(exports, "Schema", {
  enumerable: true,
  get: function get() {
    return _schema.Schema;
  }
});
Object.defineProperty(exports, "Field", {
  enumerable: true,
  get: function get() {
    return _schema.Field;
  }
});
Object.defineProperty(exports, "DataType", {
  enumerable: true,
  get: function get() {
    return _schema.DataType;
  }
});
Object.defineProperty(exports, "Null", {
  enumerable: true,
  get: function get() {
    return _schema.Null;
  }
});
Object.defineProperty(exports, "Binary", {
  enumerable: true,
  get: function get() {
    return _schema.Binary;
  }
});
Object.defineProperty(exports, "Bool", {
  enumerable: true,
  get: function get() {
    return _schema.Bool;
  }
});
Object.defineProperty(exports, "Int", {
  enumerable: true,
  get: function get() {
    return _schema.Int;
  }
});
Object.defineProperty(exports, "Int8", {
  enumerable: true,
  get: function get() {
    return _schema.Int8;
  }
});
Object.defineProperty(exports, "Int16", {
  enumerable: true,
  get: function get() {
    return _schema.Int16;
  }
});
Object.defineProperty(exports, "Int32", {
  enumerable: true,
  get: function get() {
    return _schema.Int32;
  }
});
Object.defineProperty(exports, "Int64", {
  enumerable: true,
  get: function get() {
    return _schema.Int64;
  }
});
Object.defineProperty(exports, "Uint8", {
  enumerable: true,
  get: function get() {
    return _schema.Uint8;
  }
});
Object.defineProperty(exports, "Uint16", {
  enumerable: true,
  get: function get() {
    return _schema.Uint16;
  }
});
Object.defineProperty(exports, "Uint32", {
  enumerable: true,
  get: function get() {
    return _schema.Uint32;
  }
});
Object.defineProperty(exports, "Uint64", {
  enumerable: true,
  get: function get() {
    return _schema.Uint64;
  }
});
Object.defineProperty(exports, "Float", {
  enumerable: true,
  get: function get() {
    return _schema.Float;
  }
});
Object.defineProperty(exports, "Float16", {
  enumerable: true,
  get: function get() {
    return _schema.Float16;
  }
});
Object.defineProperty(exports, "Float32", {
  enumerable: true,
  get: function get() {
    return _schema.Float32;
  }
});
Object.defineProperty(exports, "Float64", {
  enumerable: true,
  get: function get() {
    return _schema.Float64;
  }
});
Object.defineProperty(exports, "Utf8", {
  enumerable: true,
  get: function get() {
    return _schema.Utf8;
  }
});
Object.defineProperty(exports, "Date", {
  enumerable: true,
  get: function get() {
    return _schema.Date;
  }
});
Object.defineProperty(exports, "DateDay", {
  enumerable: true,
  get: function get() {
    return _schema.DateDay;
  }
});
Object.defineProperty(exports, "DateMillisecond", {
  enumerable: true,
  get: function get() {
    return _schema.DateMillisecond;
  }
});
Object.defineProperty(exports, "Time", {
  enumerable: true,
  get: function get() {
    return _schema.Time;
  }
});
Object.defineProperty(exports, "TimeMillisecond", {
  enumerable: true,
  get: function get() {
    return _schema.TimeMillisecond;
  }
});
Object.defineProperty(exports, "TimeSecond", {
  enumerable: true,
  get: function get() {
    return _schema.TimeSecond;
  }
});
Object.defineProperty(exports, "Timestamp", {
  enumerable: true,
  get: function get() {
    return _schema.Timestamp;
  }
});
Object.defineProperty(exports, "TimestampSecond", {
  enumerable: true,
  get: function get() {
    return _schema.TimestampSecond;
  }
});
Object.defineProperty(exports, "TimestampMillisecond", {
  enumerable: true,
  get: function get() {
    return _schema.TimestampMillisecond;
  }
});
Object.defineProperty(exports, "TimestampMicrosecond", {
  enumerable: true,
  get: function get() {
    return _schema.TimestampMicrosecond;
  }
});
Object.defineProperty(exports, "TimestampNanosecond", {
  enumerable: true,
  get: function get() {
    return _schema.TimestampNanosecond;
  }
});
Object.defineProperty(exports, "Interval", {
  enumerable: true,
  get: function get() {
    return _schema.Interval;
  }
});
Object.defineProperty(exports, "IntervalDayTime", {
  enumerable: true,
  get: function get() {
    return _schema.IntervalDayTime;
  }
});
Object.defineProperty(exports, "IntervalYearMonth", {
  enumerable: true,
  get: function get() {
    return _schema.IntervalYearMonth;
  }
});
Object.defineProperty(exports, "FixedSizeList", {
  enumerable: true,
  get: function get() {
    return _schema.FixedSizeList;
  }
});
Object.defineProperty(exports, "deduceTableSchema", {
  enumerable: true,
  get: function get() {
    return _deduceTableSchema.deduceTableSchema;
  }
});
Object.defineProperty(exports, "getTypeInfo", {
  enumerable: true,
  get: function get() {
    return _getTypeInfo.getTypeInfo;
  }
});
Object.defineProperty(exports, "getArrowTypeFromTypedArray", {
  enumerable: true,
  get: function get() {
    return _typeUtils.getArrowTypeFromTypedArray;
  }
});
Object.defineProperty(exports, "AsyncQueue", {
  enumerable: true,
  get: function get() {
    return _asyncQueue.default;
  }
});

var _tableBatchBuilder = _interopRequireDefault(require("./lib/table/table-batch-builder"));

var _rowTableBatchAggregator = _interopRequireDefault(require("./lib/table/row-table-batch-aggregator"));

var _columnarTableBatchAggregator = _interopRequireDefault(require("./lib/table/columnar-table-batch-aggregator"));

var _rowUtils = require("./lib/utils/row-utils");

var _meshUtils = require("./category/mesh/mesh-utils");

var _schema = require("./lib/schema");

var _deduceTableSchema = require("./lib/schema-utils/deduce-table-schema");

var _getTypeInfo = require("./lib/schema-utils/get-type-info");

var _typeUtils = require("./lib/schema-utils/type-utils");

var _asyncQueue = _interopRequireDefault(require("./lib/utils/async-queue"));

},{"./category/mesh/mesh-utils":91,"./lib/schema":100,"./lib/schema-utils/deduce-table-schema":93,"./lib/schema-utils/get-type-info":94,"./lib/schema-utils/type-utils":95,"./lib/table/columnar-table-batch-aggregator":102,"./lib/table/row-table-batch-aggregator":103,"./lib/table/table-batch-builder":104,"./lib/utils/async-queue":106,"./lib/utils/row-utils":107,"@babel/runtime/helpers/interopRequireDefault":18}],93:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deduceTableSchema = deduceTableSchema;

function deduceTableSchema(table, schema) {
  var deducedSchema = Array.isArray(table) ? deduceSchemaForRowTable(table) : deduceSchemaForColumnarTable(table);
  return Object.assign(deducedSchema, schema);
}

function deduceSchemaForColumnarTable(columnarTable) {
  var schema = {};

  for (var field in columnarTable) {
    var column = columnarTable[field];

    if (ArrayBuffer.isView(column)) {
      schema[field] = column.constructor;
    } else if (column.length) {
      var value = column[0];
      schema[field] = deduceTypeFromValue(value);
    }

    schema[field] = schema[field] || null;
  }

  return schema;
}

function deduceSchemaForRowTable(rowTable) {
  var schema = {};

  if (rowTable.length) {
    var row = rowTable[0];

    for (var field in row) {
      var value = row[field];
      schema[field] = deduceTypeFromValue(value);
    }
  }

  return schema;
}

function deduceTypeFromValue(value) {
  if (value instanceof Date) {
    return Date;
  } else if (value instanceof Number) {
    return Float32Array;
  } else if (typeof value === 'string') {
    return String;
  }

  return null;
}

},{}],94:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTypeInfo = getTypeInfo;

var _schema = require("../schema");

function getTypeInfo(arrowTypeLike) {
  return {
    typeId: arrowTypeLike.typeId,
    ArrayType: arrowTypeLike.ArrayType,
    typeName: arrowTypeLike.toString(),
    typeEnumName: getTypeKey(arrowTypeLike.typeId),
    precision: arrowTypeLike.precision
  };
}

var ReverseType = null;

function getTypeKey(typeKey) {
  if (!ReverseType) {
    ReverseType = {};

    for (var _key in _schema.Type) {
      ReverseType[_schema.Type[_key]] = _key;
    }
  }

  return ReverseType[typeKey];
}

},{"../schema":100}],95:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getArrowTypeFromTypedArray = getArrowTypeFromTypedArray;

var _schema = require("../schema");

function getArrowTypeFromTypedArray(array) {
  switch (array.constructor) {
    case Int8Array:
      return new _schema.Int8();

    case Uint8Array:
      return new _schema.Uint8();

    case Int16Array:
      return new _schema.Int16();

    case Uint16Array:
      return new _schema.Uint16();

    case Int32Array:
      return new _schema.Int32();

    case Uint32Array:
      return new _schema.Uint32();

    case Float32Array:
      return new _schema.Float32();

    case Float64Array:
      return new _schema.Float64();

    default:
      throw new Error('array type not supported');
  }
}

},{"../schema":100}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Type = void 0;
var Type;
exports.Type = Type;

(function (Type) {
  Type[Type["NONE"] = 0] = "NONE";
  Type[Type["Null"] = 1] = "Null";
  Type[Type["Int"] = 2] = "Int";
  Type[Type["Float"] = 3] = "Float";
  Type[Type["Binary"] = 4] = "Binary";
  Type[Type["Utf8"] = 5] = "Utf8";
  Type[Type["Bool"] = 6] = "Bool";
  Type[Type["Decimal"] = 7] = "Decimal";
  Type[Type["Date"] = 8] = "Date";
  Type[Type["Time"] = 9] = "Time";
  Type[Type["Timestamp"] = 10] = "Timestamp";
  Type[Type["Interval"] = 11] = "Interval";
  Type[Type["List"] = 12] = "List";
  Type[Type["Struct"] = 13] = "Struct";
  Type[Type["Union"] = 14] = "Union";
  Type[Type["FixedSizeBinary"] = 15] = "FixedSizeBinary";
  Type[Type["FixedSizeList"] = 16] = "FixedSizeList";
  Type[Type["Map"] = 17] = "Map";
  Type[Type["Dictionary"] = -1] = "Dictionary";
  Type[Type["Int8"] = -2] = "Int8";
  Type[Type["Int16"] = -3] = "Int16";
  Type[Type["Int32"] = -4] = "Int32";
  Type[Type["Int64"] = -5] = "Int64";
  Type[Type["Uint8"] = -6] = "Uint8";
  Type[Type["Uint16"] = -7] = "Uint16";
  Type[Type["Uint32"] = -8] = "Uint32";
  Type[Type["Uint64"] = -9] = "Uint64";
  Type[Type["Float16"] = -10] = "Float16";
  Type[Type["Float32"] = -11] = "Float32";
  Type[Type["Float64"] = -12] = "Float64";
  Type[Type["DateDay"] = -13] = "DateDay";
  Type[Type["DateMillisecond"] = -14] = "DateMillisecond";
  Type[Type["TimestampSecond"] = -15] = "TimestampSecond";
  Type[Type["TimestampMillisecond"] = -16] = "TimestampMillisecond";
  Type[Type["TimestampMicrosecond"] = -17] = "TimestampMicrosecond";
  Type[Type["TimestampNanosecond"] = -18] = "TimestampNanosecond";
  Type[Type["TimeSecond"] = -19] = "TimeSecond";
  Type[Type["TimeMillisecond"] = -20] = "TimeMillisecond";
  Type[Type["TimeMicrosecond"] = -21] = "TimeMicrosecond";
  Type[Type["TimeNanosecond"] = -22] = "TimeNanosecond";
  Type[Type["DenseUnion"] = -23] = "DenseUnion";
  Type[Type["SparseUnion"] = -24] = "SparseUnion";
  Type[Type["IntervalDayTime"] = -25] = "IntervalDayTime";
  Type[Type["IntervalYearMonth"] = -26] = "IntervalYearMonth";
})(Type || (exports.Type = Type = {}));

},{}],97:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Field = function () {
  function Field(name, type) {
    var nullable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var metadata = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Map();
    (0, _classCallCheck2.default)(this, Field);
    (0, _defineProperty2.default)(this, "name", void 0);
    (0, _defineProperty2.default)(this, "type", void 0);
    (0, _defineProperty2.default)(this, "nullable", void 0);
    (0, _defineProperty2.default)(this, "metadata", void 0);
    this.name = name;
    this.type = type;
    this.nullable = nullable;
    this.metadata = metadata;
  }

  (0, _createClass2.default)(Field, [{
    key: "typeId",
    get: function get() {
      return this.type && this.type.typeId;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Field(this.name, this.type, this.nullable, this.metadata);
    }
  }, {
    key: "compareTo",
    value: function compareTo(other) {
      return this.name === other.name && this.type === other.type && this.nullable === other.nullable && this.metadata === other.metadata;
    }
  }, {
    key: "toString",
    value: function toString() {
      return "".concat(this.type).concat(this.nullable ? ', nullable' : '').concat(this.metadata ? ", metadata: ".concat(this.metadata) : '');
    }
  }]);
  return Field;
}();

exports.default = Field;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],98:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assert = require("../../utils/assert");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Schema = function () {
  function Schema(fields, metadata) {
    (0, _classCallCheck2.default)(this, Schema);
    (0, _defineProperty2.default)(this, "fields", void 0);
    (0, _defineProperty2.default)(this, "metadata", void 0);
    (0, _assert.assert)(Array.isArray(fields));
    checkNames(fields);
    this.fields = fields;
    this.metadata = metadata || new Map();
  }

  (0, _createClass2.default)(Schema, [{
    key: "compareTo",
    value: function compareTo(other) {
      if (this.metadata !== other.metadata) {
        return false;
      }

      if (this.fields.length !== other.fields.length) {
        return false;
      }

      for (var i = 0; i < this.fields.length; ++i) {
        if (!this.fields[i].compareTo(other.fields[i])) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "select",
    value: function select() {
      var nameMap = Object.create(null);

      for (var _len = arguments.length, columnNames = new Array(_len), _key = 0; _key < _len; _key++) {
        columnNames[_key] = arguments[_key];
      }

      for (var _i = 0, _columnNames = columnNames; _i < _columnNames.length; _i++) {
        var name = _columnNames[_i];
        nameMap[name] = true;
      }

      var selectedFields = this.fields.filter(function (field) {
        return nameMap[field.name];
      });
      return new Schema(selectedFields, this.metadata);
    }
  }, {
    key: "selectAt",
    value: function selectAt() {
      var _this = this;

      for (var _len2 = arguments.length, columnIndices = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        columnIndices[_key2] = arguments[_key2];
      }

      var selectedFields = columnIndices.map(function (index) {
        return _this.fields[index];
      }).filter(Boolean);
      return new Schema(selectedFields, this.metadata);
    }
  }, {
    key: "assign",
    value: function assign(schemaOrFields) {
      var fields;
      var metadata = this.metadata;

      if (schemaOrFields instanceof Schema) {
        var otherSchema = schemaOrFields;
        fields = otherSchema.fields;
        metadata = mergeMaps(mergeMaps(new Map(), this.metadata), otherSchema.metadata);
      } else {
        fields = schemaOrFields;
      }

      var fieldMap = Object.create(null);

      var _iterator = _createForOfIteratorHelper(this.fields),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var field = _step.value;
          fieldMap[field.name] = field;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var _iterator2 = _createForOfIteratorHelper(fields),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _field = _step2.value;
          fieldMap[_field.name] = _field;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var mergedFields = Object.values(fieldMap);
      return new Schema(mergedFields, metadata);
    }
  }]);
  return Schema;
}();

exports.default = Schema;

function checkNames(fields) {
  var usedNames = {};

  var _iterator3 = _createForOfIteratorHelper(fields),
      _step3;

  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var field = _step3.value;

      if (usedNames[field.name]) {
        console.warn('Schema: duplicated field name', field.name, field);
      }

      usedNames[field.name] = true;
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
}

function mergeMaps(m1, m2) {
  return new Map([].concat((0, _toConsumableArray2.default)(m1 || new Map()), (0, _toConsumableArray2.default)(m2 || new Map())));
}

},{"../../utils/assert":105,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/toConsumableArray":28}],99:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Type", {
  enumerable: true,
  get: function get() {
    return _enum.Type;
  }
});
exports.FixedSizeList = exports.IntervalYearMonth = exports.IntervalDayTime = exports.Interval = exports.TimestampNanosecond = exports.TimestampMicrosecond = exports.TimestampMillisecond = exports.TimestampSecond = exports.Timestamp = exports.TimeMillisecond = exports.TimeSecond = exports.Time = exports.DateMillisecond = exports.DateDay = exports.Date = exports.Utf8 = exports.Binary = exports.Float64 = exports.Float32 = exports.Float16 = exports.Float = exports.Uint64 = exports.Uint32 = exports.Uint16 = exports.Uint8 = exports.Int64 = exports.Int32 = exports.Int16 = exports.Int8 = exports.Int = exports.Bool = exports.Null = exports.DataType = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _enum = require("./enum");

var _Symbol$toStringTag, _Symbol$toStringTag2, _Symbol$toStringTag3, _Symbol$toStringTag4, _Symbol$toStringTag5, _Symbol$toStringTag6, _Symbol$toStringTag7;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var DataType = function () {
  function DataType() {
    (0, _classCallCheck2.default)(this, DataType);
  }

  (0, _createClass2.default)(DataType, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.NONE;
    }
  }, {
    key: "compareTo",
    value: function compareTo(other) {
      return this === other;
    }
  }], [{
    key: "isNull",
    value: function isNull(x) {
      return x && x.typeId === _enum.Type.Null;
    }
  }, {
    key: "isInt",
    value: function isInt(x) {
      return x && x.typeId === _enum.Type.Int;
    }
  }, {
    key: "isFloat",
    value: function isFloat(x) {
      return x && x.typeId === _enum.Type.Float;
    }
  }, {
    key: "isBinary",
    value: function isBinary(x) {
      return x && x.typeId === _enum.Type.Binary;
    }
  }, {
    key: "isUtf8",
    value: function isUtf8(x) {
      return x && x.typeId === _enum.Type.Utf8;
    }
  }, {
    key: "isBool",
    value: function isBool(x) {
      return x && x.typeId === _enum.Type.Bool;
    }
  }, {
    key: "isDecimal",
    value: function isDecimal(x) {
      return x && x.typeId === _enum.Type.Decimal;
    }
  }, {
    key: "isDate",
    value: function isDate(x) {
      return x && x.typeId === _enum.Type.Date;
    }
  }, {
    key: "isTime",
    value: function isTime(x) {
      return x && x.typeId === _enum.Type.Time;
    }
  }, {
    key: "isTimestamp",
    value: function isTimestamp(x) {
      return x && x.typeId === _enum.Type.Timestamp;
    }
  }, {
    key: "isInterval",
    value: function isInterval(x) {
      return x && x.typeId === _enum.Type.Interval;
    }
  }, {
    key: "isList",
    value: function isList(x) {
      return x && x.typeId === _enum.Type.List;
    }
  }, {
    key: "isStruct",
    value: function isStruct(x) {
      return x && x.typeId === _enum.Type.Struct;
    }
  }, {
    key: "isUnion",
    value: function isUnion(x) {
      return x && x.typeId === _enum.Type.Union;
    }
  }, {
    key: "isFixedSizeBinary",
    value: function isFixedSizeBinary(x) {
      return x && x.typeId === _enum.Type.FixedSizeBinary;
    }
  }, {
    key: "isFixedSizeList",
    value: function isFixedSizeList(x) {
      return x && x.typeId === _enum.Type.FixedSizeList;
    }
  }, {
    key: "isMap",
    value: function isMap(x) {
      return x && x.typeId === _enum.Type.Map;
    }
  }, {
    key: "isDictionary",
    value: function isDictionary(x) {
      return x && x.typeId === _enum.Type.Dictionary;
    }
  }]);
  return DataType;
}();

exports.DataType = DataType;

var Null = function (_DataType) {
  (0, _inherits2.default)(Null, _DataType);

  var _super = _createSuper(Null);

  function Null() {
    (0, _classCallCheck2.default)(this, Null);
    return _super.apply(this, arguments);
  }

  (0, _createClass2.default)(Null, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Null;
    }
  }, {
    key: Symbol.toStringTag,
    get: function get() {
      return 'Null';
    }
  }, {
    key: "toString",
    value: function toString() {
      return 'Null';
    }
  }]);
  return Null;
}(DataType);

exports.Null = Null;

var Bool = function (_DataType2) {
  (0, _inherits2.default)(Bool, _DataType2);

  var _super2 = _createSuper(Bool);

  function Bool() {
    (0, _classCallCheck2.default)(this, Bool);
    return _super2.apply(this, arguments);
  }

  (0, _createClass2.default)(Bool, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Bool;
    }
  }, {
    key: Symbol.toStringTag,
    get: function get() {
      return 'Bool';
    }
  }, {
    key: "toString",
    value: function toString() {
      return 'Bool';
    }
  }]);
  return Bool;
}(DataType);

exports.Bool = Bool;
_Symbol$toStringTag = Symbol.toStringTag;

var Int = function (_DataType3) {
  (0, _inherits2.default)(Int, _DataType3);

  var _super3 = _createSuper(Int);

  function Int(isSigned, bitWidth) {
    var _this;

    (0, _classCallCheck2.default)(this, Int);
    _this = _super3.call(this);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isSigned", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "bitWidth", void 0);
    _this.isSigned = isSigned;
    _this.bitWidth = bitWidth;
    return _this;
  }

  (0, _createClass2.default)(Int, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Int;
    }
  }, {
    key: _Symbol$toStringTag,
    get: function get() {
      return 'Int';
    }
  }, {
    key: "toString",
    value: function toString() {
      return "".concat(this.isSigned ? 'I' : 'Ui', "nt").concat(this.bitWidth);
    }
  }]);
  return Int;
}(DataType);

exports.Int = Int;

var Int8 = function (_Int) {
  (0, _inherits2.default)(Int8, _Int);

  var _super4 = _createSuper(Int8);

  function Int8() {
    (0, _classCallCheck2.default)(this, Int8);
    return _super4.call(this, true, 8);
  }

  return Int8;
}(Int);

exports.Int8 = Int8;

var Int16 = function (_Int2) {
  (0, _inherits2.default)(Int16, _Int2);

  var _super5 = _createSuper(Int16);

  function Int16() {
    (0, _classCallCheck2.default)(this, Int16);
    return _super5.call(this, true, 16);
  }

  return Int16;
}(Int);

exports.Int16 = Int16;

var Int32 = function (_Int3) {
  (0, _inherits2.default)(Int32, _Int3);

  var _super6 = _createSuper(Int32);

  function Int32() {
    (0, _classCallCheck2.default)(this, Int32);
    return _super6.call(this, true, 32);
  }

  return Int32;
}(Int);

exports.Int32 = Int32;

var Int64 = function (_Int4) {
  (0, _inherits2.default)(Int64, _Int4);

  var _super7 = _createSuper(Int64);

  function Int64() {
    (0, _classCallCheck2.default)(this, Int64);
    return _super7.call(this, true, 64);
  }

  return Int64;
}(Int);

exports.Int64 = Int64;

var Uint8 = function (_Int5) {
  (0, _inherits2.default)(Uint8, _Int5);

  var _super8 = _createSuper(Uint8);

  function Uint8() {
    (0, _classCallCheck2.default)(this, Uint8);
    return _super8.call(this, false, 8);
  }

  return Uint8;
}(Int);

exports.Uint8 = Uint8;

var Uint16 = function (_Int6) {
  (0, _inherits2.default)(Uint16, _Int6);

  var _super9 = _createSuper(Uint16);

  function Uint16() {
    (0, _classCallCheck2.default)(this, Uint16);
    return _super9.call(this, false, 16);
  }

  return Uint16;
}(Int);

exports.Uint16 = Uint16;

var Uint32 = function (_Int7) {
  (0, _inherits2.default)(Uint32, _Int7);

  var _super10 = _createSuper(Uint32);

  function Uint32() {
    (0, _classCallCheck2.default)(this, Uint32);
    return _super10.call(this, false, 32);
  }

  return Uint32;
}(Int);

exports.Uint32 = Uint32;

var Uint64 = function (_Int8) {
  (0, _inherits2.default)(Uint64, _Int8);

  var _super11 = _createSuper(Uint64);

  function Uint64() {
    (0, _classCallCheck2.default)(this, Uint64);
    return _super11.call(this, false, 64);
  }

  return Uint64;
}(Int);

exports.Uint64 = Uint64;
var Precision = {
  HALF: 16,
  SINGLE: 32,
  DOUBLE: 64
};
_Symbol$toStringTag2 = Symbol.toStringTag;

var Float = function (_DataType4) {
  (0, _inherits2.default)(Float, _DataType4);

  var _super12 = _createSuper(Float);

  function Float(precision) {
    var _this2;

    (0, _classCallCheck2.default)(this, Float);
    _this2 = _super12.call(this);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "precision", void 0);
    _this2.precision = precision;
    return _this2;
  }

  (0, _createClass2.default)(Float, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Float;
    }
  }, {
    key: _Symbol$toStringTag2,
    get: function get() {
      return 'Float';
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Float".concat(this.precision);
    }
  }]);
  return Float;
}(DataType);

exports.Float = Float;

var Float16 = function (_Float) {
  (0, _inherits2.default)(Float16, _Float);

  var _super13 = _createSuper(Float16);

  function Float16() {
    (0, _classCallCheck2.default)(this, Float16);
    return _super13.call(this, Precision.HALF);
  }

  return Float16;
}(Float);

exports.Float16 = Float16;

var Float32 = function (_Float2) {
  (0, _inherits2.default)(Float32, _Float2);

  var _super14 = _createSuper(Float32);

  function Float32() {
    (0, _classCallCheck2.default)(this, Float32);
    return _super14.call(this, Precision.SINGLE);
  }

  return Float32;
}(Float);

exports.Float32 = Float32;

var Float64 = function (_Float3) {
  (0, _inherits2.default)(Float64, _Float3);

  var _super15 = _createSuper(Float64);

  function Float64() {
    (0, _classCallCheck2.default)(this, Float64);
    return _super15.call(this, Precision.DOUBLE);
  }

  return Float64;
}(Float);

exports.Float64 = Float64;

var Binary = function (_DataType5) {
  (0, _inherits2.default)(Binary, _DataType5);

  var _super16 = _createSuper(Binary);

  function Binary() {
    (0, _classCallCheck2.default)(this, Binary);
    return _super16.call(this);
  }

  (0, _createClass2.default)(Binary, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Binary;
    }
  }, {
    key: "toString",
    value: function toString() {
      return 'Binary';
    }
  }, {
    key: Symbol.toStringTag,
    get: function get() {
      return 'Binary';
    }
  }]);
  return Binary;
}(DataType);

exports.Binary = Binary;

var Utf8 = function (_DataType6) {
  (0, _inherits2.default)(Utf8, _DataType6);

  var _super17 = _createSuper(Utf8);

  function Utf8() {
    (0, _classCallCheck2.default)(this, Utf8);
    return _super17.apply(this, arguments);
  }

  (0, _createClass2.default)(Utf8, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Utf8;
    }
  }, {
    key: Symbol.toStringTag,
    get: function get() {
      return 'Utf8';
    }
  }, {
    key: "toString",
    value: function toString() {
      return 'Utf8';
    }
  }]);
  return Utf8;
}(DataType);

exports.Utf8 = Utf8;
var DateUnit = {
  DAY: 0,
  MILLISECOND: 1
};
_Symbol$toStringTag3 = Symbol.toStringTag;

var Date = function (_DataType7) {
  (0, _inherits2.default)(Date, _DataType7);

  var _super18 = _createSuper(Date);

  function Date(unit) {
    var _this3;

    (0, _classCallCheck2.default)(this, Date);
    _this3 = _super18.call(this);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this3), "unit", void 0);
    _this3.unit = unit;
    return _this3;
  }

  (0, _createClass2.default)(Date, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Date;
    }
  }, {
    key: _Symbol$toStringTag3,
    get: function get() {
      return 'Date';
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Date".concat((this.unit + 1) * 32, "<").concat(DateUnit[this.unit], ">");
    }
  }]);
  return Date;
}(DataType);

exports.Date = Date;

var DateDay = function (_Date) {
  (0, _inherits2.default)(DateDay, _Date);

  var _super19 = _createSuper(DateDay);

  function DateDay() {
    (0, _classCallCheck2.default)(this, DateDay);
    return _super19.call(this, DateUnit.DAY);
  }

  return DateDay;
}(Date);

exports.DateDay = DateDay;

var DateMillisecond = function (_Date2) {
  (0, _inherits2.default)(DateMillisecond, _Date2);

  var _super20 = _createSuper(DateMillisecond);

  function DateMillisecond() {
    (0, _classCallCheck2.default)(this, DateMillisecond);
    return _super20.call(this, DateUnit.MILLISECOND);
  }

  return DateMillisecond;
}(Date);

exports.DateMillisecond = DateMillisecond;
var TimeUnit = {
  SECOND: 1,
  MILLISECOND: 1e3,
  MICROSECOND: 1e6,
  NANOSECOND: 1e9
};
_Symbol$toStringTag4 = Symbol.toStringTag;

var Time = function (_DataType8) {
  (0, _inherits2.default)(Time, _DataType8);

  var _super21 = _createSuper(Time);

  function Time(unit, bitWidth) {
    var _this4;

    (0, _classCallCheck2.default)(this, Time);
    _this4 = _super21.call(this);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this4), "unit", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this4), "bitWidth", void 0);
    _this4.unit = unit;
    _this4.bitWidth = bitWidth;
    return _this4;
  }

  (0, _createClass2.default)(Time, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Time;
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Time".concat(this.bitWidth, "<").concat(TimeUnit[this.unit], ">");
    }
  }, {
    key: _Symbol$toStringTag4,
    get: function get() {
      return 'Time';
    }
  }]);
  return Time;
}(DataType);

exports.Time = Time;

var TimeSecond = function (_Time) {
  (0, _inherits2.default)(TimeSecond, _Time);

  var _super22 = _createSuper(TimeSecond);

  function TimeSecond() {
    (0, _classCallCheck2.default)(this, TimeSecond);
    return _super22.call(this, TimeUnit.SECOND, 32);
  }

  return TimeSecond;
}(Time);

exports.TimeSecond = TimeSecond;

var TimeMillisecond = function (_Time2) {
  (0, _inherits2.default)(TimeMillisecond, _Time2);

  var _super23 = _createSuper(TimeMillisecond);

  function TimeMillisecond() {
    (0, _classCallCheck2.default)(this, TimeMillisecond);
    return _super23.call(this, TimeUnit.MILLISECOND, 32);
  }

  return TimeMillisecond;
}(Time);

exports.TimeMillisecond = TimeMillisecond;
_Symbol$toStringTag5 = Symbol.toStringTag;

var Timestamp = function (_DataType9) {
  (0, _inherits2.default)(Timestamp, _DataType9);

  var _super24 = _createSuper(Timestamp);

  function Timestamp(unit) {
    var _this5;

    var timezone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    (0, _classCallCheck2.default)(this, Timestamp);
    _this5 = _super24.call(this);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this5), "unit", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this5), "timezone", void 0);
    _this5.unit = unit;
    _this5.timezone = timezone;
    return _this5;
  }

  (0, _createClass2.default)(Timestamp, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Timestamp;
    }
  }, {
    key: _Symbol$toStringTag5,
    get: function get() {
      return 'Timestamp';
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Timestamp<".concat(TimeUnit[this.unit]).concat(this.timezone ? ", ".concat(this.timezone) : '', ">");
    }
  }]);
  return Timestamp;
}(DataType);

exports.Timestamp = Timestamp;

var TimestampSecond = function (_Timestamp) {
  (0, _inherits2.default)(TimestampSecond, _Timestamp);

  var _super25 = _createSuper(TimestampSecond);

  function TimestampSecond() {
    var timezone = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck2.default)(this, TimestampSecond);
    return _super25.call(this, TimeUnit.SECOND, timezone);
  }

  return TimestampSecond;
}(Timestamp);

exports.TimestampSecond = TimestampSecond;

var TimestampMillisecond = function (_Timestamp2) {
  (0, _inherits2.default)(TimestampMillisecond, _Timestamp2);

  var _super26 = _createSuper(TimestampMillisecond);

  function TimestampMillisecond() {
    var timezone = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck2.default)(this, TimestampMillisecond);
    return _super26.call(this, TimeUnit.MILLISECOND, timezone);
  }

  return TimestampMillisecond;
}(Timestamp);

exports.TimestampMillisecond = TimestampMillisecond;

var TimestampMicrosecond = function (_Timestamp3) {
  (0, _inherits2.default)(TimestampMicrosecond, _Timestamp3);

  var _super27 = _createSuper(TimestampMicrosecond);

  function TimestampMicrosecond() {
    var timezone = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck2.default)(this, TimestampMicrosecond);
    return _super27.call(this, TimeUnit.MICROSECOND, timezone);
  }

  return TimestampMicrosecond;
}(Timestamp);

exports.TimestampMicrosecond = TimestampMicrosecond;

var TimestampNanosecond = function (_Timestamp4) {
  (0, _inherits2.default)(TimestampNanosecond, _Timestamp4);

  var _super28 = _createSuper(TimestampNanosecond);

  function TimestampNanosecond() {
    var timezone = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck2.default)(this, TimestampNanosecond);
    return _super28.call(this, TimeUnit.NANOSECOND, timezone);
  }

  return TimestampNanosecond;
}(Timestamp);

exports.TimestampNanosecond = TimestampNanosecond;
var IntervalUnit = {
  DAY_TIME: 0,
  YEAR_MONTH: 1
};
_Symbol$toStringTag6 = Symbol.toStringTag;

var Interval = function (_DataType10) {
  (0, _inherits2.default)(Interval, _DataType10);

  var _super29 = _createSuper(Interval);

  function Interval(unit) {
    var _this6;

    (0, _classCallCheck2.default)(this, Interval);
    _this6 = _super29.call(this);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this6), "unit", void 0);
    _this6.unit = unit;
    return _this6;
  }

  (0, _createClass2.default)(Interval, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.Interval;
    }
  }, {
    key: _Symbol$toStringTag6,
    get: function get() {
      return 'Interval';
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Interval<".concat(IntervalUnit[this.unit], ">");
    }
  }]);
  return Interval;
}(DataType);

exports.Interval = Interval;

var IntervalDayTime = function (_Interval) {
  (0, _inherits2.default)(IntervalDayTime, _Interval);

  var _super30 = _createSuper(IntervalDayTime);

  function IntervalDayTime() {
    (0, _classCallCheck2.default)(this, IntervalDayTime);
    return _super30.call(this, IntervalUnit.DAY_TIME);
  }

  return IntervalDayTime;
}(Interval);

exports.IntervalDayTime = IntervalDayTime;

var IntervalYearMonth = function (_Interval2) {
  (0, _inherits2.default)(IntervalYearMonth, _Interval2);

  var _super31 = _createSuper(IntervalYearMonth);

  function IntervalYearMonth() {
    (0, _classCallCheck2.default)(this, IntervalYearMonth);
    return _super31.call(this, IntervalUnit.YEAR_MONTH);
  }

  return IntervalYearMonth;
}(Interval);

exports.IntervalYearMonth = IntervalYearMonth;
_Symbol$toStringTag7 = Symbol.toStringTag;

var FixedSizeList = function (_DataType11) {
  (0, _inherits2.default)(FixedSizeList, _DataType11);

  var _super32 = _createSuper(FixedSizeList);

  function FixedSizeList(listSize, child) {
    var _this7;

    (0, _classCallCheck2.default)(this, FixedSizeList);
    _this7 = _super32.call(this);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this7), "listSize", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this7), "children", void 0);
    _this7.listSize = listSize;
    _this7.children = [child];
    return _this7;
  }

  (0, _createClass2.default)(FixedSizeList, [{
    key: "typeId",
    get: function get() {
      return _enum.Type.FixedSizeList;
    }
  }, {
    key: "valueType",
    get: function get() {
      return this.children[0].type;
    }
  }, {
    key: "valueField",
    get: function get() {
      return this.children[0];
    }
  }, {
    key: _Symbol$toStringTag7,
    get: function get() {
      return 'FixedSizeList';
    }
  }, {
    key: "toString",
    value: function toString() {
      return "FixedSizeList[".concat(this.listSize, "]<").concat(this.valueType, ">");
    }
  }]);
  return FixedSizeList;
}(DataType);

exports.FixedSizeList = FixedSizeList;

},{"./enum":96,"@babel/runtime/helpers/assertThisInitialized":7,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/getPrototypeOf":16,"@babel/runtime/helpers/inherits":17,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/possibleConstructorReturn":25}],100:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Schema", {
  enumerable: true,
  get: function get() {
    return _schema.default;
  }
});
Object.defineProperty(exports, "Field", {
  enumerable: true,
  get: function get() {
    return _field.default;
  }
});
Object.defineProperty(exports, "Type", {
  enumerable: true,
  get: function get() {
    return _type.Type;
  }
});
Object.defineProperty(exports, "DataType", {
  enumerable: true,
  get: function get() {
    return _type.DataType;
  }
});
Object.defineProperty(exports, "Null", {
  enumerable: true,
  get: function get() {
    return _type.Null;
  }
});
Object.defineProperty(exports, "Bool", {
  enumerable: true,
  get: function get() {
    return _type.Bool;
  }
});
Object.defineProperty(exports, "Int", {
  enumerable: true,
  get: function get() {
    return _type.Int;
  }
});
Object.defineProperty(exports, "Int8", {
  enumerable: true,
  get: function get() {
    return _type.Int8;
  }
});
Object.defineProperty(exports, "Int16", {
  enumerable: true,
  get: function get() {
    return _type.Int16;
  }
});
Object.defineProperty(exports, "Int32", {
  enumerable: true,
  get: function get() {
    return _type.Int32;
  }
});
Object.defineProperty(exports, "Int64", {
  enumerable: true,
  get: function get() {
    return _type.Int64;
  }
});
Object.defineProperty(exports, "Uint8", {
  enumerable: true,
  get: function get() {
    return _type.Uint8;
  }
});
Object.defineProperty(exports, "Uint16", {
  enumerable: true,
  get: function get() {
    return _type.Uint16;
  }
});
Object.defineProperty(exports, "Uint32", {
  enumerable: true,
  get: function get() {
    return _type.Uint32;
  }
});
Object.defineProperty(exports, "Uint64", {
  enumerable: true,
  get: function get() {
    return _type.Uint64;
  }
});
Object.defineProperty(exports, "Float", {
  enumerable: true,
  get: function get() {
    return _type.Float;
  }
});
Object.defineProperty(exports, "Float16", {
  enumerable: true,
  get: function get() {
    return _type.Float16;
  }
});
Object.defineProperty(exports, "Float32", {
  enumerable: true,
  get: function get() {
    return _type.Float32;
  }
});
Object.defineProperty(exports, "Float64", {
  enumerable: true,
  get: function get() {
    return _type.Float64;
  }
});
Object.defineProperty(exports, "Binary", {
  enumerable: true,
  get: function get() {
    return _type.Binary;
  }
});
Object.defineProperty(exports, "Utf8", {
  enumerable: true,
  get: function get() {
    return _type.Utf8;
  }
});
Object.defineProperty(exports, "Date", {
  enumerable: true,
  get: function get() {
    return _type.Date;
  }
});
Object.defineProperty(exports, "DateDay", {
  enumerable: true,
  get: function get() {
    return _type.DateDay;
  }
});
Object.defineProperty(exports, "DateMillisecond", {
  enumerable: true,
  get: function get() {
    return _type.DateMillisecond;
  }
});
Object.defineProperty(exports, "Time", {
  enumerable: true,
  get: function get() {
    return _type.Time;
  }
});
Object.defineProperty(exports, "TimeSecond", {
  enumerable: true,
  get: function get() {
    return _type.TimeSecond;
  }
});
Object.defineProperty(exports, "TimeMillisecond", {
  enumerable: true,
  get: function get() {
    return _type.TimeMillisecond;
  }
});
Object.defineProperty(exports, "Timestamp", {
  enumerable: true,
  get: function get() {
    return _type.Timestamp;
  }
});
Object.defineProperty(exports, "TimestampSecond", {
  enumerable: true,
  get: function get() {
    return _type.TimestampSecond;
  }
});
Object.defineProperty(exports, "TimestampMillisecond", {
  enumerable: true,
  get: function get() {
    return _type.TimestampMillisecond;
  }
});
Object.defineProperty(exports, "TimestampMicrosecond", {
  enumerable: true,
  get: function get() {
    return _type.TimestampMicrosecond;
  }
});
Object.defineProperty(exports, "TimestampNanosecond", {
  enumerable: true,
  get: function get() {
    return _type.TimestampNanosecond;
  }
});
Object.defineProperty(exports, "Interval", {
  enumerable: true,
  get: function get() {
    return _type.Interval;
  }
});
Object.defineProperty(exports, "IntervalDayTime", {
  enumerable: true,
  get: function get() {
    return _type.IntervalDayTime;
  }
});
Object.defineProperty(exports, "IntervalYearMonth", {
  enumerable: true,
  get: function get() {
    return _type.IntervalYearMonth;
  }
});
Object.defineProperty(exports, "FixedSizeList", {
  enumerable: true,
  get: function get() {
    return _type.FixedSizeList;
  }
});

var _schema = _interopRequireDefault(require("./impl/schema"));

var _field = _interopRequireDefault(require("./impl/field"));

var _type = require("./impl/type");

},{"./impl/field":97,"./impl/schema":98,"./impl/type":99,"@babel/runtime/helpers/interopRequireDefault":18}],101:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var DEFAULT_ROW_COUNT = 100;

var RowTableBatchAggregator = function () {
  function RowTableBatchAggregator(schema, options) {
    (0, _classCallCheck2.default)(this, RowTableBatchAggregator);
    (0, _defineProperty2.default)(this, "schema", void 0);
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "length", 0);
    (0, _defineProperty2.default)(this, "rows", null);
    (0, _defineProperty2.default)(this, "cursor", 0);
    (0, _defineProperty2.default)(this, "_headers", []);
    this.options = options;
    this.schema = schema;

    if (!Array.isArray(schema)) {
      this._headers = [];

      for (var key in schema) {
        this._headers[schema[key].index] = schema[key].name;
      }
    }
  }

  (0, _createClass2.default)(RowTableBatchAggregator, [{
    key: "rowCount",
    value: function rowCount() {
      return this.length;
    }
  }, {
    key: "addArrayRow",
    value: function addArrayRow(row, cursor) {
      if (Number.isFinite(cursor)) {
        this.cursor = cursor;
      }

      this.rows = this.rows || new Array(DEFAULT_ROW_COUNT);
      this.rows[this.length] = row;
      this.length++;
    }
  }, {
    key: "addObjectRow",
    value: function addObjectRow(row, cursor) {
      if (Number.isFinite(cursor)) {
        this.cursor = cursor;
      }

      this.rows = this.rows || new Array(DEFAULT_ROW_COUNT);
      this.rows[this.length] = row;
      this.length++;
    }
  }, {
    key: "getBatch",
    value: function getBatch() {
      var rows = this.rows;

      if (!rows) {
        return null;
      }

      rows = rows.slice(0, this.length);
      this.rows = null;
      var batch = {
        shape: this.options.shape,
        batchType: 'data',
        data: rows,
        length: this.length,
        schema: this.schema,
        cursor: this.cursor
      };
      return batch;
    }
  }]);
  return RowTableBatchAggregator;
}();

exports.default = RowTableBatchAggregator;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],102:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var DEFAULT_ROW_COUNT = 100;

var ColumnarTableBatchAggregator = function () {
  function ColumnarTableBatchAggregator(schema, options) {
    (0, _classCallCheck2.default)(this, ColumnarTableBatchAggregator);
    (0, _defineProperty2.default)(this, "schema", void 0);
    (0, _defineProperty2.default)(this, "length", 0);
    (0, _defineProperty2.default)(this, "allocated", 0);
    (0, _defineProperty2.default)(this, "columns", {});
    this.schema = schema;

    this._reallocateColumns();
  }

  (0, _createClass2.default)(ColumnarTableBatchAggregator, [{
    key: "rowCount",
    value: function rowCount() {
      return this.length;
    }
  }, {
    key: "addArrayRow",
    value: function addArrayRow(row) {
      this._reallocateColumns();

      var i = 0;

      for (var fieldName in this.columns) {
        this.columns[fieldName][this.length] = row[i++];
      }

      this.length++;
    }
  }, {
    key: "addObjectRow",
    value: function addObjectRow(row) {
      this._reallocateColumns();

      for (var fieldName in row) {
        this.columns[fieldName][this.length] = row[fieldName];
      }

      this.length++;
    }
  }, {
    key: "getBatch",
    value: function getBatch() {
      this._pruneColumns();

      var columns = Array.isArray(this.schema) ? this.columns : {};

      if (!Array.isArray(this.schema)) {
        for (var fieldName in this.schema) {
          var field = this.schema[fieldName];
          columns[field.name] = this.columns[field.index];
        }
      }

      this.columns = {};
      var batch = {
        shape: 'columnar-table',
        batchType: 'data',
        data: columns,
        schema: this.schema,
        length: this.length
      };
      return batch;
    }
  }, {
    key: "_reallocateColumns",
    value: function _reallocateColumns() {
      if (this.length < this.allocated) {
        return;
      }

      this.allocated = this.allocated > 0 ? this.allocated *= 2 : DEFAULT_ROW_COUNT;
      this.columns = {};

      for (var fieldName in this.schema) {
        var field = this.schema[fieldName];
        var ArrayType = field.type || Float32Array;
        var oldColumn = this.columns[field.index];

        if (oldColumn && ArrayBuffer.isView(oldColumn)) {
          var typedArray = new ArrayType(this.allocated);
          typedArray.set(oldColumn);
          this.columns[field.index] = typedArray;
        } else if (oldColumn) {
          oldColumn.length = this.allocated;
          this.columns[field.index] = oldColumn;
        } else {
          this.columns[field.index] = new ArrayType(this.allocated);
        }
      }
    }
  }, {
    key: "_pruneColumns",
    value: function _pruneColumns() {
      for (var _i = 0, _Object$entries = Object.entries(this.columns); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = (0, _slicedToArray2.default)(_Object$entries[_i], 2),
            _columnName = _Object$entries$_i[0],
            column = _Object$entries$_i[1];

        this.columns[_columnName] = column.slice(0, this.length);
      }
    }
  }]);
  return ColumnarTableBatchAggregator;
}();

exports.default = ColumnarTableBatchAggregator;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/slicedToArray":27}],103:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rowUtils = require("../utils/row-utils");

var DEFAULT_ROW_COUNT = 100;

var RowTableBatchAggregator = function () {
  function RowTableBatchAggregator(schema, options) {
    (0, _classCallCheck2.default)(this, RowTableBatchAggregator);
    (0, _defineProperty2.default)(this, "schema", void 0);
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "length", 0);
    (0, _defineProperty2.default)(this, "objectRows", null);
    (0, _defineProperty2.default)(this, "arrayRows", null);
    (0, _defineProperty2.default)(this, "cursor", 0);
    (0, _defineProperty2.default)(this, "_headers", []);
    this.options = options;
    this.schema = schema;

    if (!Array.isArray(schema)) {
      this._headers = [];

      for (var key in schema) {
        this._headers[schema[key].index] = schema[key].name;
      }
    }
  }

  (0, _createClass2.default)(RowTableBatchAggregator, [{
    key: "rowCount",
    value: function rowCount() {
      return this.length;
    }
  }, {
    key: "addArrayRow",
    value: function addArrayRow(row, cursor) {
      if (Number.isFinite(cursor)) {
        this.cursor = cursor;
      }

      switch (this.options.shape) {
        case 'object-row-table':
          var rowObject = (0, _rowUtils.convertToObjectRow)(row, this._headers);
          this.addObjectRow(rowObject, cursor);
          break;

        case 'array-row-table':
          this.arrayRows = this.arrayRows || new Array(DEFAULT_ROW_COUNT);
          this.arrayRows[this.length] = row;
          this.length++;
          break;
      }
    }
  }, {
    key: "addObjectRow",
    value: function addObjectRow(row, cursor) {
      if (Number.isFinite(cursor)) {
        this.cursor = cursor;
      }

      switch (this.options.shape) {
        case 'array-row-table':
          var rowArray = (0, _rowUtils.convertToArrayRow)(row, this._headers);
          this.addArrayRow(rowArray, cursor);
          break;

        case 'object-row-table':
          this.objectRows = this.objectRows || new Array(DEFAULT_ROW_COUNT);
          this.objectRows[this.length] = row;
          this.length++;
          break;
      }
    }
  }, {
    key: "getBatch",
    value: function getBatch() {
      var rows = this.arrayRows || this.objectRows;

      if (!rows) {
        return null;
      }

      rows = rows.slice(0, this.length);
      this.arrayRows = null;
      this.objectRows = null;
      return {
        shape: this.options.shape,
        batchType: 'data',
        data: rows,
        length: this.length,
        schema: this.schema,
        cursor: this.cursor
      };
    }
  }]);
  return RowTableBatchAggregator;
}();

exports.default = RowTableBatchAggregator;

},{"../utils/row-utils":107,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],104:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _baseTableBatchAggregator = _interopRequireDefault(require("./base-table-batch-aggregator"));

var _rowTableBatchAggregator = _interopRequireDefault(require("./row-table-batch-aggregator"));

var _columnarTableBatchAggregator = _interopRequireDefault(require("./columnar-table-batch-aggregator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DEFAULT_OPTIONS = {
  shape: 'array-row-table',
  batchSize: 'auto',
  batchDebounceMs: 0,
  limit: 0,
  _limitMB: 0
};
var ERR_MESSAGE = 'TableBatchBuilder';

var TableBatchBuilder = function () {
  function TableBatchBuilder(schema, options) {
    (0, _classCallCheck2.default)(this, TableBatchBuilder);
    (0, _defineProperty2.default)(this, "schema", void 0);
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "aggregator", null);
    (0, _defineProperty2.default)(this, "batchCount", 0);
    (0, _defineProperty2.default)(this, "bytesUsed", 0);
    (0, _defineProperty2.default)(this, "isChunkComplete", false);
    (0, _defineProperty2.default)(this, "lastBatchEmittedMs", Date.now());
    (0, _defineProperty2.default)(this, "totalLength", 0);
    (0, _defineProperty2.default)(this, "totalBytes", 0);
    (0, _defineProperty2.default)(this, "rowBytes", 0);
    this.schema = schema;
    this.options = _objectSpread(_objectSpread({}, DEFAULT_OPTIONS), options);
  }

  (0, _createClass2.default)(TableBatchBuilder, [{
    key: "limitReached",
    value: function limitReached() {
      var _this$options, _this$options2;

      if (Boolean((_this$options = this.options) === null || _this$options === void 0 ? void 0 : _this$options.limit) && this.totalLength >= this.options.limit) {
        return true;
      }

      if (Boolean((_this$options2 = this.options) === null || _this$options2 === void 0 ? void 0 : _this$options2._limitMB) && this.totalBytes / 1e6 >= this.options._limitMB) {
        return true;
      }

      return false;
    }
  }, {
    key: "addRow",
    value: function addRow(row) {
      if (this.limitReached()) {
        return;
      }

      this.totalLength++;
      this.rowBytes = this.rowBytes || this._estimateRowMB(row);
      this.totalBytes += this.rowBytes;

      if (Array.isArray(row)) {
        this.addArrayRow(row);
      } else {
        this.addObjectRow(row);
      }
    }
  }, {
    key: "addArrayRow",
    value: function addArrayRow(row) {
      if (!this.aggregator) {
        var TableBatchType = this._getTableBatchType();

        this.aggregator = new TableBatchType(this.schema, this.options);
      }

      this.aggregator.addArrayRow(row);
    }
  }, {
    key: "addObjectRow",
    value: function addObjectRow(row) {
      if (!this.aggregator) {
        var TableBatchType = this._getTableBatchType();

        this.aggregator = new TableBatchType(this.schema, this.options);
      }

      this.aggregator.addObjectRow(row);
    }
  }, {
    key: "chunkComplete",
    value: function chunkComplete(chunk) {
      if (chunk instanceof ArrayBuffer) {
        this.bytesUsed += chunk.byteLength;
      }

      if (typeof chunk === 'string') {
        this.bytesUsed += chunk.length;
      }

      this.isChunkComplete = true;
    }
  }, {
    key: "getFullBatch",
    value: function getFullBatch(options) {
      return this._isFull() ? this._getBatch(options) : null;
    }
  }, {
    key: "getFinalBatch",
    value: function getFinalBatch(options) {
      return this._getBatch(options);
    }
  }, {
    key: "_estimateRowMB",
    value: function _estimateRowMB(row) {
      return Array.isArray(row) ? row.length * 8 : Object.keys(row).length * 8;
    }
  }, {
    key: "_isFull",
    value: function _isFull() {
      if (!this.aggregator || this.aggregator.rowCount() === 0) {
        return false;
      }

      if (this.options.batchSize === 'auto') {
        if (!this.isChunkComplete) {
          return false;
        }
      } else if (this.options.batchSize > this.aggregator.rowCount()) {
        return false;
      }

      if (this.options.batchDebounceMs > Date.now() - this.lastBatchEmittedMs) {
        return false;
      }

      this.isChunkComplete = false;
      this.lastBatchEmittedMs = Date.now();
      return true;
    }
  }, {
    key: "_getBatch",
    value: function _getBatch(options) {
      if (!this.aggregator) {
        return null;
      }

      if (options !== null && options !== void 0 && options.bytesUsed) {
        this.bytesUsed = options.bytesUsed;
      }

      var normalizedBatch = this.aggregator.getBatch();
      normalizedBatch.count = this.batchCount;
      normalizedBatch.bytesUsed = this.bytesUsed;
      Object.assign(normalizedBatch, options);
      this.batchCount++;
      this.aggregator = null;
      return normalizedBatch;
    }
  }, {
    key: "_getTableBatchType",
    value: function _getTableBatchType() {
      switch (this.options.shape) {
        case 'row-table':
          return _baseTableBatchAggregator.default;

        case 'array-row-table':
        case 'object-row-table':
          return _rowTableBatchAggregator.default;

        case 'columnar-table':
          return _columnarTableBatchAggregator.default;

        case 'arrow-table':
          if (!TableBatchBuilder.ArrowBatch) {
            throw new Error(ERR_MESSAGE);
          }

          return TableBatchBuilder.ArrowBatch;

        default:
          throw new Error(ERR_MESSAGE);
      }
    }
  }]);
  return TableBatchBuilder;
}();

exports.default = TableBatchBuilder;
(0, _defineProperty2.default)(TableBatchBuilder, "ArrowBatch", void 0);

},{"./base-table-batch-aggregator":101,"./columnar-table-batch-aggregator":102,"./row-table-batch-aggregator":103,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],105:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"dup":81}],106:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.takeAsync = takeAsync;
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var _Symbol$asyncIterator;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ArrayQueue = function (_Array) {
  (0, _inherits2.default)(ArrayQueue, _Array);

  var _super = _createSuper(ArrayQueue);

  function ArrayQueue() {
    (0, _classCallCheck2.default)(this, ArrayQueue);
    return _super.apply(this, arguments);
  }

  (0, _createClass2.default)(ArrayQueue, [{
    key: "enqueue",
    value: function enqueue(value) {
      return this.push(value);
    }
  }, {
    key: "dequeue",
    value: function dequeue() {
      return this.shift();
    }
  }]);
  return ArrayQueue;
}((0, _wrapNativeSuper2.default)(Array));

_Symbol$asyncIterator = Symbol.asyncIterator;

var AsyncQueue = function () {
  function AsyncQueue() {
    (0, _classCallCheck2.default)(this, AsyncQueue);
    (0, _defineProperty2.default)(this, "_values", void 0);
    (0, _defineProperty2.default)(this, "_settlers", void 0);
    (0, _defineProperty2.default)(this, "_closed", void 0);
    this._values = new ArrayQueue();
    this._settlers = new ArrayQueue();
    this._closed = false;
  }

  (0, _createClass2.default)(AsyncQueue, [{
    key: "close",
    value: function close() {
      while (this._settlers.length > 0) {
        this._settlers.dequeue().resolve({
          done: true
        });
      }

      this._closed = true;
    }
  }, {
    key: _Symbol$asyncIterator,
    value: function value() {
      return this;
    }
  }, {
    key: "enqueue",
    value: function enqueue(value) {
      if (this._closed) {
        throw new Error('Closed');
      }

      if (this._settlers.length > 0) {
        if (this._values.length > 0) {
          throw new Error('Illegal internal state');
        }

        var settler = this._settlers.dequeue();

        if (value instanceof Error) {
          settler.reject(value);
        } else {
          settler.resolve({
            value: value
          });
        }
      } else {
        this._values.enqueue(value);
      }
    }
  }, {
    key: "next",
    value: function next() {
      var _this = this;

      if (this._values.length > 0) {
        var value = this._values.dequeue();

        if (value instanceof Error) {
          return Promise.reject(value);
        }

        return Promise.resolve({
          value: value
        });
      }

      if (this._closed) {
        if (this._settlers.length > 0) {
          throw new Error('Illegal internal state');
        }

        return Promise.resolve({
          done: true
        });
      }

      return new Promise(function (resolve, reject) {
        _this._settlers.enqueue({
          resolve: resolve,
          reject: reject
        });
      });
    }
  }]);
  return AsyncQueue;
}();

exports.default = AsyncQueue;

function takeAsync(_x) {
  return _takeAsync.apply(this, arguments);
}

function _takeAsync() {
  _takeAsync = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(asyncIterable) {
    var count,
        result,
        iterator,
        _yield$iterator$next,
        value,
        done,
        _args = arguments;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            count = _args.length > 1 && _args[1] !== undefined ? _args[1] : Infinity;
            result = [];
            iterator = asyncIterable[Symbol.asyncIterator]();

          case 3:
            if (!(result.length < count)) {
              _context.next = 14;
              break;
            }

            _context.next = 6;
            return iterator.next();

          case 6:
            _yield$iterator$next = _context.sent;
            value = _yield$iterator$next.value;
            done = _yield$iterator$next.done;

            if (!done) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("break", 14);

          case 11:
            result.push(value);
            _context.next = 3;
            break;

          case 14:
            return _context.abrupt("return", result);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _takeAsync.apply(this, arguments);
}

},{"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/getPrototypeOf":16,"@babel/runtime/helpers/inherits":17,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/possibleConstructorReturn":25,"@babel/runtime/helpers/wrapNativeSuper":32,"@babel/runtime/regenerator":33}],107:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToObjectRow = convertToObjectRow;
exports.convertToArrayRow = convertToArrayRow;

function convertToObjectRow(arrayRow, headers) {
  if (!arrayRow) {
    throw new Error('null row');
  }

  if (!headers) {
    throw new Error('no headers');
  }

  var objectRow = {};

  for (var i = 0; i < headers.length; i++) {
    objectRow[headers[i]] = arrayRow[i];
  }

  return objectRow;
}

function convertToArrayRow(objectRow, headers) {
  if (!objectRow) {
    throw new Error('null row');
  }

  if (!headers) {
    throw new Error('no headers');
  }

  var arrayRow = new Array(headers.length);

  for (var i = 0; i < headers.length; i++) {
    arrayRow[i] = objectRow[headers[i]];
  }

  return arrayRow;
}

},{}],108:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "assert", {
  enumerable: true,
  get: function get() {
    return _assert.assert;
  }
});
Object.defineProperty(exports, "isBrowser", {
  enumerable: true,
  get: function get() {
    return _globals.isBrowser;
  }
});
Object.defineProperty(exports, "isWorker", {
  enumerable: true,
  get: function get() {
    return _globals.isWorker;
  }
});
Object.defineProperty(exports, "WorkerJob", {
  enumerable: true,
  get: function get() {
    return _workerJob.default;
  }
});
Object.defineProperty(exports, "WorkerThread", {
  enumerable: true,
  get: function get() {
    return _workerThread.default;
  }
});
Object.defineProperty(exports, "WorkerFarm", {
  enumerable: true,
  get: function get() {
    return _workerFarm.default;
  }
});
Object.defineProperty(exports, "WorkerPool", {
  enumerable: true,
  get: function get() {
    return _workerPool.default;
  }
});
Object.defineProperty(exports, "WorkerBody", {
  enumerable: true,
  get: function get() {
    return _workerBody.default;
  }
});
Object.defineProperty(exports, "processOnWorker", {
  enumerable: true,
  get: function get() {
    return _processOnWorker.processOnWorker;
  }
});
Object.defineProperty(exports, "canProcessOnWorker", {
  enumerable: true,
  get: function get() {
    return _processOnWorker.canProcessOnWorker;
  }
});
Object.defineProperty(exports, "createWorker", {
  enumerable: true,
  get: function get() {
    return _createWorker.createWorker;
  }
});
Object.defineProperty(exports, "getWorkerURL", {
  enumerable: true,
  get: function get() {
    return _getWorkerUrl.getWorkerURL;
  }
});
Object.defineProperty(exports, "validateWorkerVersion", {
  enumerable: true,
  get: function get() {
    return _validateWorkerVersion.validateWorkerVersion;
  }
});
Object.defineProperty(exports, "getTransferList", {
  enumerable: true,
  get: function get() {
    return _getTransferList.getTransferList;
  }
});
Object.defineProperty(exports, "getLibraryUrl", {
  enumerable: true,
  get: function get() {
    return _libraryUtils.getLibraryUrl;
  }
});
Object.defineProperty(exports, "loadLibrary", {
  enumerable: true,
  get: function get() {
    return _libraryUtils.loadLibrary;
  }
});
Object.defineProperty(exports, "AsyncQueue", {
  enumerable: true,
  get: function get() {
    return _asyncQueue.default;
  }
});
Object.defineProperty(exports, "ChildProcessProxy", {
  enumerable: true,
  get: function get() {
    return _childProcessProxy.default;
  }
});
exports.NullWorker = void 0;

var _version = require("./lib/env-utils/version");

var _assert = require("./lib/env-utils/assert");

var _globals = require("./lib/env-utils/globals");

var _workerJob = _interopRequireDefault(require("./lib/worker-farm/worker-job"));

var _workerThread = _interopRequireDefault(require("./lib/worker-farm/worker-thread"));

var _workerFarm = _interopRequireDefault(require("./lib/worker-farm/worker-farm"));

var _workerPool = _interopRequireDefault(require("./lib/worker-farm/worker-pool"));

var _workerBody = _interopRequireDefault(require("./lib/worker-farm/worker-body"));

var _processOnWorker = require("./lib/worker-api/process-on-worker");

var _createWorker = require("./lib/worker-api/create-worker");

var _getWorkerUrl = require("./lib/worker-api/get-worker-url");

var _validateWorkerVersion = require("./lib/worker-api/validate-worker-version");

var _getTransferList = require("./lib/worker-utils/get-transfer-list");

var _libraryUtils = require("./lib/library-utils/library-utils");

var _asyncQueue = _interopRequireDefault(require("./lib/async-queue/async-queue"));

var _childProcessProxy = _interopRequireDefault(require("./lib/process-utils/child-process-proxy"));

var NullWorker = {
  id: 'null',
  name: 'null',
  module: 'worker-utils',
  version: _version.VERSION,
  options: {
    null: {}
  }
};
exports.NullWorker = NullWorker;

},{"./lib/async-queue/async-queue":109,"./lib/env-utils/assert":110,"./lib/env-utils/globals":111,"./lib/env-utils/version":112,"./lib/library-utils/library-utils":113,"./lib/process-utils/child-process-proxy":130,"./lib/worker-api/create-worker":114,"./lib/worker-api/get-worker-url":115,"./lib/worker-api/process-on-worker":116,"./lib/worker-api/validate-worker-version":117,"./lib/worker-farm/worker-body":118,"./lib/worker-farm/worker-farm":119,"./lib/worker-farm/worker-job":120,"./lib/worker-farm/worker-pool":121,"./lib/worker-farm/worker-thread":122,"./lib/worker-utils/get-transfer-list":124,"@babel/runtime/helpers/interopRequireDefault":18}],109:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Symbol$asyncIterator;

_Symbol$asyncIterator = Symbol.asyncIterator;

var AsyncQueue = function () {
  function AsyncQueue() {
    (0, _classCallCheck2.default)(this, AsyncQueue);
    (0, _defineProperty2.default)(this, "_values", void 0);
    (0, _defineProperty2.default)(this, "_settlers", void 0);
    (0, _defineProperty2.default)(this, "_closed", void 0);
    this._values = [];
    this._settlers = [];
    this._closed = false;
  }

  (0, _createClass2.default)(AsyncQueue, [{
    key: _Symbol$asyncIterator,
    value: function value() {
      return this;
    }
  }, {
    key: "push",
    value: function push(value) {
      return this.enqueue(value);
    }
  }, {
    key: "enqueue",
    value: function enqueue(value) {
      if (this._closed) {
        throw new Error('Closed');
      }

      if (this._settlers.length > 0) {
        if (this._values.length > 0) {
          throw new Error('Illegal internal state');
        }

        var settler = this._settlers.shift();

        if (value instanceof Error) {
          settler.reject(value);
        } else {
          settler.resolve({
            value: value
          });
        }
      } else {
        this._values.push(value);
      }
    }
  }, {
    key: "close",
    value: function close() {
      while (this._settlers.length > 0) {
        var settler = this._settlers.shift();

        settler.resolve({
          done: true
        });
      }

      this._closed = true;
    }
  }, {
    key: "next",
    value: function next() {
      var _this = this;

      if (this._values.length > 0) {
        var value = this._values.shift();

        if (value instanceof Error) {
          return Promise.reject(value);
        }

        return Promise.resolve({
          done: false,
          value: value
        });
      }

      if (this._closed) {
        if (this._settlers.length > 0) {
          throw new Error('Illegal internal state');
        }

        return Promise.resolve({
          done: true,
          value: undefined
        });
      }

      return new Promise(function (resolve, reject) {
        _this._settlers.push({
          resolve: resolve,
          reject: reject
        });
      });
    }
  }]);
  return AsyncQueue;
}();

exports.default = AsyncQueue;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],110:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assert = assert;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'loaders.gl assertion failed.');
  }
}

},{}],111:[function(require,module,exports){
(function (process,global){(function (){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nodeVersion = exports.isMobile = exports.isWorker = exports.isBrowser = exports.document = exports.global = exports.window = exports.self = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof global !== 'undefined' && global,
  document: typeof document !== 'undefined' && document
};
var self_ = globals.self || globals.window || globals.global || {};
exports.self = self_;
var window_ = globals.window || globals.self || globals.global || {};
exports.window = window_;
var global_ = globals.global || globals.self || globals.window || {};
exports.global = global_;
var document_ = globals.document || {};
exports.document = document_;
var isBrowser = (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) !== 'object' || String(process) !== '[object process]' || process.browser;
exports.isBrowser = isBrowser;
var isWorker = typeof importScripts === 'function';
exports.isWorker = isWorker;
var isMobile = typeof window !== 'undefined' && typeof window.orientation !== 'undefined';
exports.isMobile = isMobile;
var matches = typeof process !== 'undefined' && process.version && /v([0-9]*)/.exec(process.version);
var nodeVersion = matches && parseFloat(matches[1]) || 0;
exports.nodeVersion = nodeVersion;

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"_process":153}],112:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VERSION = void 0;
var DEFAULT_VERSION = 'beta';
var VERSION = typeof "3.0.9" !== 'undefined' ? "3.0.9" : DEFAULT_VERSION;
exports.VERSION = VERSION;

if (typeof "3.0.9" === 'undefined') {
  console.error('loaders.gl: The __VERSION__ variable is not injected using babel plugin. Latest unstable workers would be fetched from the CDN.');
}

},{}],113:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadLibrary = loadLibrary;
exports.getLibraryUrl = getLibraryUrl;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _globals = require("../env-utils/globals");

var node = _interopRequireWildcard(require("../node/require-utils.node"));

var _assert = require("../env-utils/assert");

var _version = require("../env-utils/version");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var LATEST = 'beta';
var VERSION = typeof "3.0.9" !== 'undefined' ? "3.0.9" : LATEST;
var loadLibraryPromises = {};

function loadLibrary(_x) {
  return _loadLibrary.apply(this, arguments);
}

function _loadLibrary() {
  _loadLibrary = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(libraryUrl) {
    var moduleName,
        options,
        _args = arguments;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            moduleName = _args.length > 1 && _args[1] !== undefined ? _args[1] : null;
            options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};

            if (moduleName) {
              libraryUrl = getLibraryUrl(libraryUrl, moduleName, options);
            }

            loadLibraryPromises[libraryUrl] = loadLibraryPromises[libraryUrl] || loadLibraryFromFile(libraryUrl);
            _context.next = 6;
            return loadLibraryPromises[libraryUrl];

          case 6:
            return _context.abrupt("return", _context.sent);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _loadLibrary.apply(this, arguments);
}

function getLibraryUrl(library, moduleName, options) {
  if (library.startsWith('http')) {
    return library;
  }

  var modules = options.modules || {};

  if (modules[library]) {
    return modules[library];
  }

  if (!_globals.isBrowser) {
    return "modules/".concat(moduleName, "/dist/libs/").concat(library);
  }

  if (options.CDN) {
    (0, _assert.assert)(options.CDN.startsWith('http'));
    return "".concat(options.CDN, "/").concat(moduleName, "@").concat(VERSION, "/dist/libs/").concat(library);
  }

  if (_globals.isWorker) {
    return "../src/libs/".concat(library);
  }

  return "modules/".concat(moduleName, "/src/libs/").concat(library);
}

function loadLibraryFromFile(_x2) {
  return _loadLibraryFromFile.apply(this, arguments);
}

function _loadLibraryFromFile() {
  _loadLibraryFromFile = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(libraryUrl) {
    var _response, response, scriptSource;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!libraryUrl.endsWith('wasm')) {
              _context2.next = 7;
              break;
            }

            _context2.next = 3;
            return fetch(libraryUrl);

          case 3:
            _response = _context2.sent;
            _context2.next = 6;
            return _response.arrayBuffer();

          case 6:
            return _context2.abrupt("return", _context2.sent);

          case 7:
            if (_globals.isBrowser) {
              _context2.next = 14;
              break;
            }

            _context2.t0 = node.requireFromFile;

            if (!_context2.t0) {
              _context2.next = 13;
              break;
            }

            _context2.next = 12;
            return node.requireFromFile(libraryUrl);

          case 12:
            _context2.t0 = _context2.sent;

          case 13:
            return _context2.abrupt("return", _context2.t0);

          case 14:
            if (!_globals.isWorker) {
              _context2.next = 16;
              break;
            }

            return _context2.abrupt("return", importScripts(libraryUrl));

          case 16:
            _context2.next = 18;
            return fetch(libraryUrl);

          case 18:
            response = _context2.sent;
            _context2.next = 21;
            return response.text();

          case 21:
            scriptSource = _context2.sent;
            return _context2.abrupt("return", loadLibraryFromString(scriptSource, libraryUrl));

          case 23:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _loadLibraryFromFile.apply(this, arguments);
}

function loadLibraryFromString(scriptSource, id) {
  if (!_globals.isBrowser) {
    return node.requireFromString && node.requireFromString(scriptSource, id);
  }

  if (_globals.isWorker) {
    eval.call(_globals.global, scriptSource);
    return null;
  }

  var script = document.createElement('script');
  script.id = id;

  try {
    script.appendChild(document.createTextNode(scriptSource));
  } catch (e) {
    script.text = scriptSource;
  }

  document.body.appendChild(script);
  return null;
}

},{"../env-utils/assert":110,"../env-utils/globals":111,"../env-utils/version":112,"../node/require-utils.node":130,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"@babel/runtime/regenerator":33}],114:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWorker = createWorker;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

var _asyncQueue = _interopRequireDefault(require("../async-queue/async-queue"));

var _workerBody = _interopRequireDefault(require("../worker-farm/worker-body"));

var requestId = 0;
var inputBatches;
var options;

function createWorker(process, processInBatches) {
  if (typeof self === 'undefined') {
    return;
  }

  var context = {
    process: processOnMainThread
  };

  _workerBody.default.onmessage = function () {
    var _ref = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(type, payload) {
      var result, resultIterator, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, batch, message;

      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.t0 = type;
              _context.next = _context.t0 === 'process' ? 4 : _context.t0 === 'process-in-batches' ? 11 : _context.t0 === 'input-batch' ? 51 : _context.t0 === 'input-done' ? 53 : 55;
              break;

            case 4:
              if (process) {
                _context.next = 6;
                break;
              }

              throw new Error('Worker does not support atomic processing');

            case 6:
              _context.next = 8;
              return process(payload.input, payload.options || {}, context);

            case 8:
              result = _context.sent;

              _workerBody.default.postMessage('done', {
                result: result
              });

              return _context.abrupt("break", 55);

            case 11:
              if (processInBatches) {
                _context.next = 13;
                break;
              }

              throw new Error('Worker does not support batched processing');

            case 13:
              inputBatches = new _asyncQueue.default();
              options = payload.options || {};
              resultIterator = processInBatches(inputBatches, options, context === null || context === void 0 ? void 0 : context.processInBatches);
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _context.prev = 18;
              _iterator = (0, _asyncIterator2.default)(resultIterator);

            case 20:
              _context.next = 22;
              return _iterator.next();

            case 22:
              _step = _context.sent;
              _iteratorNormalCompletion = _step.done;
              _context.next = 26;
              return _step.value;

            case 26:
              _value = _context.sent;

              if (_iteratorNormalCompletion) {
                _context.next = 33;
                break;
              }

              batch = _value;

              _workerBody.default.postMessage('output-batch', {
                result: batch
              });

            case 30:
              _iteratorNormalCompletion = true;
              _context.next = 20;
              break;

            case 33:
              _context.next = 39;
              break;

            case 35:
              _context.prev = 35;
              _context.t1 = _context["catch"](18);
              _didIteratorError = true;
              _iteratorError = _context.t1;

            case 39:
              _context.prev = 39;
              _context.prev = 40;

              if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
                _context.next = 44;
                break;
              }

              _context.next = 44;
              return _iterator.return();

            case 44:
              _context.prev = 44;

              if (!_didIteratorError) {
                _context.next = 47;
                break;
              }

              throw _iteratorError;

            case 47:
              return _context.finish(44);

            case 48:
              return _context.finish(39);

            case 49:
              _workerBody.default.postMessage('done', {});

              return _context.abrupt("break", 55);

            case 51:
              inputBatches.push(payload.input);
              return _context.abrupt("break", 55);

            case 53:
              inputBatches.close();
              return _context.abrupt("break", 55);

            case 55:
              _context.next = 61;
              break;

            case 57:
              _context.prev = 57;
              _context.t2 = _context["catch"](0);
              message = _context.t2 instanceof Error ? _context.t2.message : '';

              _workerBody.default.postMessage('error', {
                error: message
              });

            case 61:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 57], [18, 35, 39, 49], [40,, 44, 48]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}

function processOnMainThread(arrayBuffer) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var id = requestId++;

    var onMessage = function onMessage(type, payload) {
      if (payload.id !== id) {
        return;
      }

      switch (type) {
        case 'done':
          _workerBody.default.removeEventListener(onMessage);

          resolve(payload.result);
          break;

        case 'error':
          _workerBody.default.removeEventListener(onMessage);

          reject(payload.error);
          break;

        default:
      }
    };

    _workerBody.default.addEventListener(onMessage);

    var payload = {
      id: id,
      input: arrayBuffer,
      options: options
    };

    _workerBody.default.postMessage('process', payload);
  });
}

},{"../async-queue/async-queue":109,"../worker-farm/worker-body":118,"@babel/runtime/helpers/asyncIterator":9,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],115:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWorkerName = getWorkerName;
exports.getWorkerURL = getWorkerURL;

var _assert = require("../env-utils/assert");

var _version = require("../env-utils/version");

var NPM_TAG = 'latest';
var VERSION = typeof "3.0.9" !== 'undefined' ? "3.0.9" : NPM_TAG;

function getWorkerName(worker) {
  var warning = worker.version !== VERSION ? " (worker-utils@".concat(VERSION, ")") : '';
  return "".concat(worker.name, "@").concat(worker.version).concat(warning);
}

function getWorkerURL(worker) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var workerOptions = options[worker.id] || {};
  var workerFile = "".concat(worker.id, "-worker.js");
  var url = workerOptions.workerUrl;

  if (options._workerType === 'test') {
    url = "modules/".concat(worker.module, "/dist/").concat(workerFile);
  }

  if (!url) {
    var version = worker.version;

    if (version === 'latest') {
      version = NPM_TAG;
    }

    var versionTag = version ? "@".concat(version) : '';
    url = "https://unpkg.com/@loaders.gl/".concat(worker.module).concat(versionTag, "/dist/").concat(workerFile);
  }

  (0, _assert.assert)(url);
  return url;
}

},{"../env-utils/assert":110,"../env-utils/version":112}],116:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canProcessOnWorker = canProcessOnWorker;
exports.processOnWorker = processOnWorker;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _workerFarm = _interopRequireDefault(require("../worker-farm/worker-farm"));

var _removeNontransferableOptions = require("../worker-utils/remove-nontransferable-options");

var _getWorkerUrl = require("./get-worker-url");

function canProcessOnWorker(worker, options) {
  if (!_workerFarm.default.isSupported()) {
    return false;
  }

  return worker.worker && (options === null || options === void 0 ? void 0 : options.worker);
}

function processOnWorker(_x, _x2) {
  return _processOnWorker.apply(this, arguments);
}

function _processOnWorker() {
  _processOnWorker = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(worker, data) {
    var options,
        context,
        name,
        url,
        workerFarm,
        workerPool,
        jobName,
        job,
        transferableOptions,
        result,
        _args = arguments;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
            context = _args.length > 3 && _args[3] !== undefined ? _args[3] : {};
            name = (0, _getWorkerUrl.getWorkerName)(worker);
            url = (0, _getWorkerUrl.getWorkerURL)(worker, options);
            workerFarm = _workerFarm.default.getWorkerFarm(options);
            workerPool = workerFarm.getWorkerPool({
              name: name,
              url: url
            });
            jobName = options.jobName || worker.name;
            _context.next = 9;
            return workerPool.startJob(jobName, onMessage.bind(null, context));

          case 9:
            job = _context.sent;
            transferableOptions = (0, _removeNontransferableOptions.removeNontransferableOptions)(options);
            job.postMessage('process', {
              input: data,
              options: transferableOptions
            });
            _context.next = 14;
            return job.result;

          case 14:
            result = _context.sent;
            return _context.abrupt("return", result.result);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _processOnWorker.apply(this, arguments);
}

function onMessage(_x3, _x4, _x5, _x6) {
  return _onMessage.apply(this, arguments);
}

function _onMessage() {
  _onMessage = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(context, job, type, payload) {
    var id, input, options, result, message;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.t0 = type;
            _context2.next = _context2.t0 === 'done' ? 3 : _context2.t0 === 'error' ? 5 : _context2.t0 === 'process' ? 7 : 23;
            break;

          case 3:
            job.done(payload);
            return _context2.abrupt("break", 24);

          case 5:
            job.error(payload.error);
            return _context2.abrupt("break", 24);

          case 7:
            id = payload.id, input = payload.input, options = payload.options;
            _context2.prev = 8;

            if (context.process) {
              _context2.next = 12;
              break;
            }

            job.postMessage('error', {
              id: id,
              error: 'Worker not set up to process on main thread'
            });
            return _context2.abrupt("return");

          case 12:
            _context2.next = 14;
            return context.process(input, options);

          case 14:
            result = _context2.sent;
            job.postMessage('done', {
              id: id,
              result: result
            });
            _context2.next = 22;
            break;

          case 18:
            _context2.prev = 18;
            _context2.t1 = _context2["catch"](8);
            message = _context2.t1 instanceof Error ? _context2.t1.message : 'unknown error';
            job.postMessage('error', {
              id: id,
              error: message
            });

          case 22:
            return _context2.abrupt("break", 24);

          case 23:
            console.warn("process-on-worker: unknown message ".concat(type));

          case 24:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[8, 18]]);
  }));
  return _onMessage.apply(this, arguments);
}

},{"../worker-farm/worker-farm":119,"../worker-utils/remove-nontransferable-options":125,"./get-worker-url":115,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],117:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateWorkerVersion = validateWorkerVersion;

var _assert = require("../env-utils/assert");

var _version = require("../env-utils/version");

function validateWorkerVersion(worker) {
  var coreVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _version.VERSION;
  (0, _assert.assert)(worker, 'no worker provided');
  var workerVersion = worker.version;

  if (!coreVersion || !workerVersion) {
    return false;
  }

  return true;
}

function parseVersion(version) {
  var parts = version.split('.').map(Number);
  return {
    major: parts[0],
    minor: parts[1]
  };
}

},{"../env-utils/assert":110,"../env-utils/version":112}],118:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _getTransferList = require("../worker-utils/get-transfer-list");

var onMessageWrapperMap = new Map();

var WorkerBody = function () {
  function WorkerBody() {
    (0, _classCallCheck2.default)(this, WorkerBody);
  }

  (0, _createClass2.default)(WorkerBody, null, [{
    key: "onmessage",
    set: function set(onMessage) {
      self.onmessage = function (message) {
        if (!isKnownMessage(message)) {
          return;
        }

        var _message$data = message.data,
            type = _message$data.type,
            payload = _message$data.payload;
        onMessage(type, payload);
      };
    }
  }, {
    key: "addEventListener",
    value: function addEventListener(onMessage) {
      var onMessageWrapper = onMessageWrapperMap.get(onMessage);

      if (!onMessageWrapper) {
        onMessageWrapper = function onMessageWrapper(message) {
          if (!isKnownMessage(message)) {
            return;
          }

          var _message$data2 = message.data,
              type = _message$data2.type,
              payload = _message$data2.payload;
          onMessage(type, payload);
        };
      }

      self.addEventListener('message', onMessageWrapper);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(onMessage) {
      var onMessageWrapper = onMessageWrapperMap.get(onMessage);
      onMessageWrapperMap.delete(onMessage);
      self.removeEventListener('message', onMessageWrapper);
    }
  }, {
    key: "postMessage",
    value: function postMessage(type, payload) {
      if (self) {
        var data = {
          source: 'loaders.gl',
          type: type,
          payload: payload
        };
        var transferList = (0, _getTransferList.getTransferList)(payload);
        self.postMessage(data, transferList);
      }
    }
  }]);
  return WorkerBody;
}();

exports.default = WorkerBody;

function isKnownMessage(message) {
  var type = message.type,
      data = message.data;
  return type === 'message' && data && typeof data.source === 'string' && data.source.startsWith('loaders.gl');
}

},{"../worker-utils/get-transfer-list":124,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":18}],119:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _workerPool = _interopRequireDefault(require("./worker-pool"));

var _workerThread = _interopRequireDefault(require("./worker-thread"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DEFAULT_PROPS = {
  maxConcurrency: 3,
  maxMobileConcurrency: 1,
  onDebug: function onDebug() {},
  reuseWorkers: true
};

var WorkerFarm = function () {
  function WorkerFarm(props) {
    (0, _classCallCheck2.default)(this, WorkerFarm);
    (0, _defineProperty2.default)(this, "props", void 0);
    (0, _defineProperty2.default)(this, "workerPools", new Map());
    this.props = _objectSpread({}, DEFAULT_PROPS);
    this.setProps(props);
    this.workerPools = new Map();
  }

  (0, _createClass2.default)(WorkerFarm, [{
    key: "destroy",
    value: function destroy() {
      var _iterator = _createForOfIteratorHelper(this.workerPools.values()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var workerPool = _step.value;
          workerPool.destroy();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      this.props = _objectSpread(_objectSpread({}, this.props), props);

      var _iterator2 = _createForOfIteratorHelper(this.workerPools.values()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var workerPool = _step2.value;
          workerPool.setProps(this._getWorkerPoolProps());
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "getWorkerPool",
    value: function getWorkerPool(options) {
      var name = options.name,
          source = options.source,
          url = options.url;
      var workerPool = this.workerPools.get(name);

      if (!workerPool) {
        workerPool = new _workerPool.default({
          name: name,
          source: source,
          url: url
        });
        workerPool.setProps(this._getWorkerPoolProps());
        this.workerPools.set(name, workerPool);
      }

      return workerPool;
    }
  }, {
    key: "_getWorkerPoolProps",
    value: function _getWorkerPoolProps() {
      return {
        maxConcurrency: this.props.maxConcurrency,
        maxMobileConcurrency: this.props.maxMobileConcurrency,
        reuseWorkers: this.props.reuseWorkers,
        onDebug: this.props.onDebug
      };
    }
  }], [{
    key: "isSupported",
    value: function isSupported() {
      return _workerThread.default.isSupported();
    }
  }, {
    key: "getWorkerFarm",
    value: function getWorkerFarm() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      WorkerFarm._workerFarm = WorkerFarm._workerFarm || new WorkerFarm({});

      WorkerFarm._workerFarm.setProps(props);

      return WorkerFarm._workerFarm;
    }
  }]);
  return WorkerFarm;
}();

exports.default = WorkerFarm;
(0, _defineProperty2.default)(WorkerFarm, "_workerFarm", void 0);

},{"./worker-pool":121,"./worker-thread":122,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],120:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assert = require("../env-utils/assert");

var WorkerJob = function () {
  function WorkerJob(jobName, workerThread) {
    var _this = this;

    (0, _classCallCheck2.default)(this, WorkerJob);
    (0, _defineProperty2.default)(this, "name", void 0);
    (0, _defineProperty2.default)(this, "workerThread", void 0);
    (0, _defineProperty2.default)(this, "isRunning", void 0);
    (0, _defineProperty2.default)(this, "result", void 0);
    (0, _defineProperty2.default)(this, "_resolve", void 0);
    (0, _defineProperty2.default)(this, "_reject", void 0);
    this.name = jobName;
    this.workerThread = workerThread;
    this.isRunning = true;

    this._resolve = function () {};

    this._reject = function () {};

    this.result = new Promise(function (resolve, reject) {
      _this._resolve = resolve;
      _this._reject = reject;
    });
  }

  (0, _createClass2.default)(WorkerJob, [{
    key: "postMessage",
    value: function postMessage(type, payload) {
      this.workerThread.postMessage({
        source: 'loaders.gl',
        type: type,
        payload: payload
      });
    }
  }, {
    key: "done",
    value: function done(value) {
      (0, _assert.assert)(this.isRunning);
      this.isRunning = false;

      this._resolve(value);
    }
  }, {
    key: "error",
    value: function error(_error) {
      (0, _assert.assert)(this.isRunning);
      this.isRunning = false;

      this._reject(_error);
    }
  }]);
  return WorkerJob;
}();

exports.default = WorkerJob;

},{"../env-utils/assert":110,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],121:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _globals = require("../env-utils/globals");

var _workerThread = _interopRequireDefault(require("./worker-thread"));

var _workerJob = _interopRequireDefault(require("./worker-job"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var WorkerPool = function () {
  function WorkerPool(props) {
    (0, _classCallCheck2.default)(this, WorkerPool);
    (0, _defineProperty2.default)(this, "name", 'unnamed');
    (0, _defineProperty2.default)(this, "source", void 0);
    (0, _defineProperty2.default)(this, "url", void 0);
    (0, _defineProperty2.default)(this, "maxConcurrency", 1);
    (0, _defineProperty2.default)(this, "maxMobileConcurrency", 1);
    (0, _defineProperty2.default)(this, "onDebug", function () {});
    (0, _defineProperty2.default)(this, "reuseWorkers", true);
    (0, _defineProperty2.default)(this, "props", {});
    (0, _defineProperty2.default)(this, "jobQueue", []);
    (0, _defineProperty2.default)(this, "idleQueue", []);
    (0, _defineProperty2.default)(this, "count", 0);
    (0, _defineProperty2.default)(this, "isDestroyed", false);
    this.source = props.source;
    this.url = props.url;
    this.setProps(props);
  }

  (0, _createClass2.default)(WorkerPool, [{
    key: "destroy",
    value: function destroy() {
      this.idleQueue.forEach(function (worker) {
        return worker.destroy();
      });
      this.isDestroyed = true;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      this.props = _objectSpread(_objectSpread({}, this.props), props);

      if (props.name !== undefined) {
        this.name = props.name;
      }

      if (props.maxConcurrency !== undefined) {
        this.maxConcurrency = props.maxConcurrency;
      }

      if (props.maxMobileConcurrency !== undefined) {
        this.maxMobileConcurrency = props.maxMobileConcurrency;
      }

      if (props.reuseWorkers !== undefined) {
        this.reuseWorkers = props.reuseWorkers;
      }

      if (props.onDebug !== undefined) {
        this.onDebug = props.onDebug;
      }
    }
  }, {
    key: "startJob",
    value: function () {
      var _startJob = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(name) {
        var _this = this;

        var onMessage,
            onError,
            startPromise,
            _args = arguments;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                onMessage = _args.length > 1 && _args[1] !== undefined ? _args[1] : function (job, type, data) {
                  return job.done(data);
                };
                onError = _args.length > 2 && _args[2] !== undefined ? _args[2] : function (job, error) {
                  return job.error(error);
                };
                startPromise = new Promise(function (onStart) {
                  _this.jobQueue.push({
                    name: name,
                    onMessage: onMessage,
                    onError: onError,
                    onStart: onStart
                  });

                  return _this;
                });

                this._startQueuedJob();

                _context.next = 6;
                return startPromise;

              case 6:
                return _context.abrupt("return", _context.sent);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function startJob(_x) {
        return _startJob.apply(this, arguments);
      }

      return startJob;
    }()
  }, {
    key: "_startQueuedJob",
    value: function () {
      var _startQueuedJob2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
        var workerThread, queuedJob, _job;

        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.jobQueue.length) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return");

              case 2:
                workerThread = this._getAvailableWorker();

                if (workerThread) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return");

              case 5:
                queuedJob = this.jobQueue.shift();

                if (!queuedJob) {
                  _context2.next = 18;
                  break;
                }

                this.onDebug({
                  message: 'Starting job',
                  name: queuedJob.name,
                  workerThread: workerThread,
                  backlog: this.jobQueue.length
                });
                _job = new _workerJob.default(queuedJob.name, workerThread);

                workerThread.onMessage = function (data) {
                  return queuedJob.onMessage(_job, data.type, data.payload);
                };

                workerThread.onError = function (error) {
                  return queuedJob.onError(_job, error);
                };

                queuedJob.onStart(_job);
                _context2.prev = 12;
                _context2.next = 15;
                return _job.result;

              case 15:
                _context2.prev = 15;
                this.returnWorkerToQueue(workerThread);
                return _context2.finish(15);

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[12,, 15, 18]]);
      }));

      function _startQueuedJob() {
        return _startQueuedJob2.apply(this, arguments);
      }

      return _startQueuedJob;
    }()
  }, {
    key: "returnWorkerToQueue",
    value: function returnWorkerToQueue(worker) {
      var shouldDestroyWorker = this.isDestroyed || !this.reuseWorkers || this.count > this._getMaxConcurrency();

      if (shouldDestroyWorker) {
        worker.destroy();
        this.count--;
      } else {
        this.idleQueue.push(worker);
      }

      if (!this.isDestroyed) {
        this._startQueuedJob();
      }
    }
  }, {
    key: "_getAvailableWorker",
    value: function _getAvailableWorker() {
      if (this.idleQueue.length > 0) {
        return this.idleQueue.shift() || null;
      }

      if (this.count < this._getMaxConcurrency()) {
        this.count++;
        var name = "".concat(this.name.toLowerCase(), " (#").concat(this.count, " of ").concat(this.maxConcurrency, ")");
        return new _workerThread.default({
          name: name,
          source: this.source,
          url: this.url
        });
      }

      return null;
    }
  }, {
    key: "_getMaxConcurrency",
    value: function _getMaxConcurrency() {
      return _globals.isMobile ? this.maxMobileConcurrency : this.maxConcurrency;
    }
  }]);
  return WorkerPool;
}();

exports.default = WorkerPool;

},{"../env-utils/globals":111,"./worker-job":120,"./worker-thread":122,"@babel/runtime/helpers/asyncToGenerator":10,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/regenerator":33}],122:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assert = require("../env-utils/assert");

var _getLoadableWorkerUrl = require("../worker-utils/get-loadable-worker-url");

var _getTransferList = require("../worker-utils/get-transfer-list");

var NOOP = function NOOP() {};

var WorkerThread = function () {
  function WorkerThread(props) {
    (0, _classCallCheck2.default)(this, WorkerThread);
    (0, _defineProperty2.default)(this, "name", void 0);
    (0, _defineProperty2.default)(this, "source", void 0);
    (0, _defineProperty2.default)(this, "url", void 0);
    (0, _defineProperty2.default)(this, "terminated", false);
    (0, _defineProperty2.default)(this, "worker", void 0);
    (0, _defineProperty2.default)(this, "onMessage", void 0);
    (0, _defineProperty2.default)(this, "onError", void 0);
    (0, _defineProperty2.default)(this, "_loadableURL", '');
    var name = props.name,
        source = props.source,
        url = props.url;
    (0, _assert.assert)(source || url);
    this.name = name;
    this.source = source;
    this.url = url;
    this.onMessage = NOOP;

    this.onError = function (error) {
      return console.log(error);
    };

    this.worker = this._createBrowserWorker();
  }

  (0, _createClass2.default)(WorkerThread, [{
    key: "destroy",
    value: function destroy() {
      this.onMessage = NOOP;
      this.onError = NOOP;
      this.worker.terminate();
      this.terminated = true;
    }
  }, {
    key: "isRunning",
    get: function get() {
      return Boolean(this.onMessage);
    }
  }, {
    key: "postMessage",
    value: function postMessage(data, transferList) {
      transferList = transferList || (0, _getTransferList.getTransferList)(data);
      this.worker.postMessage(data, transferList);
    }
  }, {
    key: "_getErrorFromErrorEvent",
    value: function _getErrorFromErrorEvent(event) {
      var message = 'Failed to load ';
      message += "worker ".concat(this.name, ". ");

      if (event.message) {
        message += "".concat(event.message, " in ");
      }

      if (event.lineno) {
        message += ":".concat(event.lineno, ":").concat(event.colno);
      }

      return new Error(message);
    }
  }, {
    key: "_createBrowserWorker",
    value: function _createBrowserWorker() {
      var _this = this;

      this._loadableURL = (0, _getLoadableWorkerUrl.getLoadableWorkerURL)({
        source: this.source,
        url: this.url
      });
      var worker = new Worker(this._loadableURL, {
        name: this.name
      });

      worker.onmessage = function (event) {
        if (!event.data) {
          _this.onError(new Error('No data received'));
        } else {
          _this.onMessage(event.data);
        }
      };

      worker.onerror = function (error) {
        _this.onError(_this._getErrorFromErrorEvent(error));

        _this.terminated = true;
      };

      worker.onmessageerror = function (event) {
        return console.error(event);
      };

      return worker;
    }
  }], [{
    key: "isSupported",
    value: function isSupported() {
      return typeof Worker !== 'undefined';
    }
  }]);
  return WorkerThread;
}();

exports.default = WorkerThread;

},{"../env-utils/assert":110,"../worker-utils/get-loadable-worker-url":123,"../worker-utils/get-transfer-list":124,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18}],123:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLoadableWorkerURL = getLoadableWorkerURL;

var _assert = require("../env-utils/assert");

var workerURLCache = new Map();

function getLoadableWorkerURL(props) {
  (0, _assert.assert)(props.source && !props.url || !props.source && props.url);
  var workerURL = workerURLCache.get(props.source || props.url);

  if (!workerURL) {
    if (props.url) {
      workerURL = getLoadableWorkerURLFromURL(props.url);
      workerURLCache.set(props.url, workerURL);
    }

    if (props.source) {
      workerURL = getLoadableWorkerURLFromSource(props.source);
      workerURLCache.set(props.source, workerURL);
    }
  }

  (0, _assert.assert)(workerURL);
  return workerURL;
}

function getLoadableWorkerURLFromURL(url) {
  if (!url.startsWith('http')) {
    return url;
  }

  var workerSource = buildScriptSource(url);
  return getLoadableWorkerURLFromSource(workerSource);
}

function getLoadableWorkerURLFromSource(workerSource) {
  var blob = new Blob([workerSource], {
    type: 'application/javascript'
  });
  return URL.createObjectURL(blob);
}

function buildScriptSource(workerUrl) {
  return "try {\n  importScripts('".concat(workerUrl, "');\n} catch (error) {\n  console.error(error);\n  throw error;\n}");
}

},{"../env-utils/assert":110}],124:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTransferList = getTransferList;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function getTransferList(object) {
  var recursive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var transfers = arguments.length > 2 ? arguments[2] : undefined;
  var transfersSet = transfers || new Set();

  if (!object) {} else if (isTransferable(object)) {
    transfersSet.add(object);
  } else if (isTransferable(object.buffer)) {
    transfersSet.add(object.buffer);
  } else if (ArrayBuffer.isView(object)) {} else if (recursive && (0, _typeof2.default)(object) === 'object') {
    for (var key in object) {
      getTransferList(object[key], recursive, transfersSet);
    }
  }

  return transfers === undefined ? Array.from(transfersSet) : [];
}

function isTransferable(object) {
  if (!object) {
    return false;
  }

  if (object instanceof ArrayBuffer) {
    return true;
  }

  if (typeof MessagePort !== 'undefined' && object instanceof MessagePort) {
    return true;
  }

  if (typeof ImageBitmap !== 'undefined' && object instanceof ImageBitmap) {
    return true;
  }

  if (typeof OffscreenCanvas !== 'undefined' && object instanceof OffscreenCanvas) {
    return true;
  }

  return false;
}

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29}],125:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeNontransferableOptions = removeNontransferableOptions;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function removeNontransferableOptions(object) {
  return JSON.parse(stringifyJSON(object));
}

function stringifyJSON(v) {
  var cache = new Set();
  return JSON.stringify(v, function (key, value) {
    if ((0, _typeof2.default)(value) === 'object' && value !== null) {
      if (cache.has(value)) {
        try {
          return JSON.parse(JSON.stringify(value));
        } catch (err) {
          return undefined;
        }
      }

      cache.add(value);
    }

    return value;
  });
}

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29}],126:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Stats", {
  enumerable: true,
  get: function get() {
    return _stats.default;
  }
});
Object.defineProperty(exports, "Stat", {
  enumerable: true,
  get: function get() {
    return _stat.default;
  }
});
Object.defineProperty(exports, "_getHiResTimestamp", {
  enumerable: true,
  get: function get() {
    return _hiResTimestamp.default;
  }
});

var _stats = _interopRequireDefault(require("./lib/stats"));

var _stat = _interopRequireDefault(require("./lib/stat"));

var _hiResTimestamp = _interopRequireDefault(require("./utils/hi-res-timestamp"));

},{"./lib/stat":127,"./lib/stats":128,"./utils/hi-res-timestamp":129,"@babel/runtime/helpers/interopRequireDefault":18}],127:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _hiResTimestamp = _interopRequireDefault(require("../utils/hi-res-timestamp"));

var Stat = function () {
  function Stat(name, type) {
    (0, _classCallCheck2.default)(this, Stat);
    this.name = name;
    this.type = type;
    this.sampleSize = 1;
    this.reset();
  }

  (0, _createClass2.default)(Stat, [{
    key: "setSampleSize",
    value: function setSampleSize(samples) {
      this.sampleSize = samples;
      return this;
    }
  }, {
    key: "incrementCount",
    value: function incrementCount() {
      this.addCount(1);
      return this;
    }
  }, {
    key: "decrementCount",
    value: function decrementCount() {
      this.subtractCount(1);
      return this;
    }
  }, {
    key: "addCount",
    value: function addCount(value) {
      this._count += value;
      this._samples++;

      this._checkSampling();

      return this;
    }
  }, {
    key: "subtractCount",
    value: function subtractCount(value) {
      this._count -= value;
      this._samples++;

      this._checkSampling();

      return this;
    }
  }, {
    key: "addTime",
    value: function addTime(time) {
      this._time += time;
      this.lastTiming = time;
      this._samples++;

      this._checkSampling();

      return this;
    }
  }, {
    key: "timeStart",
    value: function timeStart() {
      this._startTime = (0, _hiResTimestamp.default)();
      this._timerPending = true;
      return this;
    }
  }, {
    key: "timeEnd",
    value: function timeEnd() {
      if (!this._timerPending) {
        return this;
      }

      this.addTime((0, _hiResTimestamp.default)() - this._startTime);
      this._timerPending = false;

      this._checkSampling();

      return this;
    }
  }, {
    key: "getSampleAverageCount",
    value: function getSampleAverageCount() {
      return this.sampleSize > 0 ? this.lastSampleCount / this.sampleSize : 0;
    }
  }, {
    key: "getSampleAverageTime",
    value: function getSampleAverageTime() {
      return this.sampleSize > 0 ? this.lastSampleTime / this.sampleSize : 0;
    }
  }, {
    key: "getSampleHz",
    value: function getSampleHz() {
      return this.lastSampleTime > 0 ? this.sampleSize / (this.lastSampleTime / 1000) : 0;
    }
  }, {
    key: "getAverageCount",
    value: function getAverageCount() {
      return this.samples > 0 ? this.count / this.samples : 0;
    }
  }, {
    key: "getAverageTime",
    value: function getAverageTime() {
      return this.samples > 0 ? this.time / this.samples : 0;
    }
  }, {
    key: "getHz",
    value: function getHz() {
      return this.time > 0 ? this.samples / (this.time / 1000) : 0;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.time = 0;
      this.count = 0;
      this.samples = 0;
      this.lastTiming = 0;
      this.lastSampleTime = 0;
      this.lastSampleCount = 0;
      this._count = 0;
      this._time = 0;
      this._samples = 0;
      this._startTime = 0;
      this._timerPending = false;
      return this;
    }
  }, {
    key: "_checkSampling",
    value: function _checkSampling() {
      if (this._samples === this.sampleSize) {
        this.lastSampleTime = this._time;
        this.lastSampleCount = this._count;
        this.count += this._count;
        this.time += this._time;
        this.samples += this._samples;
        this._time = 0;
        this._count = 0;
        this._samples = 0;
      }
    }
  }]);
  return Stat;
}();

exports.default = Stat;

},{"../utils/hi-res-timestamp":129,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":18}],128:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _stat = _interopRequireDefault(require("./stat"));

var Stats = function () {
  function Stats(_ref) {
    var id = _ref.id,
        stats = _ref.stats;
    (0, _classCallCheck2.default)(this, Stats);
    this.id = id;
    this.stats = {};

    this._initializeStats(stats);

    Object.seal(this);
  }

  (0, _createClass2.default)(Stats, [{
    key: "get",
    value: function get(name) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'count';
      return this._getOrCreate({
        name: name,
        type: type
      });
    }
  }, {
    key: "size",
    get: function get() {
      return Object.keys(this.stats).length;
    }
  }, {
    key: "reset",
    value: function reset() {
      for (var key in this.stats) {
        this.stats[key].reset();
      }

      return this;
    }
  }, {
    key: "forEach",
    value: function forEach(fn) {
      for (var key in this.stats) {
        fn(this.stats[key]);
      }
    }
  }, {
    key: "getTable",
    value: function getTable() {
      var table = {};
      this.forEach(function (stat) {
        table[stat.name] = {
          time: stat.time || 0,
          count: stat.count || 0,
          average: stat.getAverageTime() || 0,
          hz: stat.getHz() || 0
        };
      });
      return table;
    }
  }, {
    key: "_initializeStats",
    value: function _initializeStats() {
      var _this = this;

      var stats = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      stats.forEach(function (stat) {
        return _this._getOrCreate(stat);
      });
    }
  }, {
    key: "_getOrCreate",
    value: function _getOrCreate(stat) {
      if (!stat || !stat.name) {
        return null;
      }

      var name = stat.name,
          type = stat.type;

      if (!this.stats[name]) {
        if (stat instanceof _stat.default) {
          this.stats[name] = stat;
        } else {
          this.stats[name] = new _stat.default(name, type);
        }
      }

      return this.stats[name];
    }
  }]);
  return Stats;
}();

exports.default = Stats;

},{"./stat":127,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":18}],129:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getHiResTimestamp;

function getHiResTimestamp() {
  var timestamp;

  if (typeof window !== 'undefined' && window.performance) {
    timestamp = window.performance.now();
  } else if (typeof process !== 'undefined' && process.hrtime) {
    var timeParts = process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}

}).call(this)}).call(this,require('_process'))

},{"_process":153}],130:[function(require,module,exports){

},{}],131:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],132:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        if (xstate === OPEN) {
          if (reg === '/') {
            p.push([ OPEN, '/', arg ])
            reg = ''
          } else {
            p.push([ OPEN, arg ])
          }
        } else if (xstate === COMMENT && opts.comments) {
          reg += String(arg)
        } else if (xstate !== COMMENT) {
          p.push([ VAR, xstate, arg ])
        }
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else parts[i][1]==="" || (cur[1][key] = concat(cur[1][key], parts[i][1]));
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else parts[i][2]==="" || (cur[1][key] = concat(cur[1][key], parts[i][2]));
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            if (parts[i][0] === CLOSE) {
              i--
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      if (opts.createFragment) return opts.createFragment(tree[2])
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN && reg.length) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && c === '/' && reg.length) {
          // no-op, self closing tag without a space <br/>
        } else if (state === OPEN && /\s/.test(c)) {
          if (reg.length) {
            res.push([OPEN, reg])
          }
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else if (x === null || x === undefined) return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":131}],133:[function(require,module,exports){
'use strict'

var trailingNewlineRegex = /\n[\s]+$/
var leadingNewlineRegex = /^\n[\s]+/
var trailingSpaceRegex = /[\s]+$/
var leadingSpaceRegex = /^[\s]+/
var multiSpaceRegex = /[\n\s]+/g

var TEXT_TAGS = [
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'amp', 'small', 'span',
  'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
]

var VERBATIM_TAGS = [
  'code', 'pre', 'textarea'
]

module.exports = function appendChild (el, childs) {
  if (!Array.isArray(childs)) return

  var nodeName = el.nodeName.toLowerCase()

  var hadText = false
  var value, leader

  for (var i = 0, len = childs.length; i < len; i++) {
    var node = childs[i]
    if (Array.isArray(node)) {
      appendChild(el, node)
      continue
    }

    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'function' ||
      node instanceof Date ||
      node instanceof RegExp) {
      node = node.toString()
    }

    var lastChild = el.childNodes[el.childNodes.length - 1]

    // Iterate over text nodes
    if (typeof node === 'string') {
      hadText = true

      // If we already had text, append to the existing text
      if (lastChild && lastChild.nodeName === '#text') {
        lastChild.nodeValue += node

      // We didn't have a text node yet, create one
      } else {
        node = el.ownerDocument.createTextNode(node)
        el.appendChild(node)
        lastChild = node
      }

      // If this is the last of the child nodes, make sure we close it out
      // right
      if (i === len - 1) {
        hadText = false
        // Trim the child text nodes if the current node isn't a
        // node where whitespace matters.
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          // The very first node in the list should not have leading
          // whitespace. Sibling text nodes should have whitespace if there
          // was any.
          leader = i === 0 ? '' : ' '
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, leader)
            .replace(leadingSpaceRegex, ' ')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

    // Iterate over DOM nodes
    } else if (node && node.nodeType) {
      // If the last node was a text node, make sure it is properly closed out
      if (hadText) {
        hadText = false

        // Trim the child text nodes if the current node isn't a
        // text node or a code node
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, ' ')
            .replace(multiSpaceRegex, ' ')

          // Remove empty text nodes, append otherwise
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        // Trim the child nodes but preserve the appropriate whitespace
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingSpaceRegex, ' ')
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, ' ')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

      // Store the last nodename
      var _nodeName = node.nodeName
      if (_nodeName) nodeName = _nodeName.toLowerCase()

      // Append the node to the DOM
      el.appendChild(node)
    }
  }
}

},{}],134:[function(require,module,exports){
'use strict'

module.exports = [
  'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default',
  'defaultchecked', 'defer', 'disabled', 'formnovalidate', 'hidden',
  'ismap', 'loop', 'multiple', 'muted', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected'
]

},{}],135:[function(require,module,exports){
module.exports = require('./dom')(document)

},{"./dom":137}],136:[function(require,module,exports){
'use strict'

module.exports = [
  'indeterminate'
]

},{}],137:[function(require,module,exports){
'use strict'

var hyperx = require('hyperx')
var appendChild = require('./append-child')
var SVG_TAGS = require('./svg-tags')
var BOOL_PROPS = require('./bool-props')
// Props that need to be set directly rather than with el.setAttribute()
var DIRECT_PROPS = require('./direct-props')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var COMMENT_TAG = '!--'

module.exports = function (document) {
  function nanoHtmlCreateElement (tag, props, children) {
    var el

    // If an svg tag, it needs a namespace
    if (SVG_TAGS.indexOf(tag) !== -1) {
      props.namespace = SVGNS
    }

    // If we are using a namespace
    var ns = false
    if (props.namespace) {
      ns = props.namespace
      delete props.namespace
    }

    // If we are extending a builtin element
    var isCustomElement = false
    if (props.is) {
      isCustomElement = props.is
      delete props.is
    }

    // Create the element
    if (ns) {
      if (isCustomElement) {
        el = document.createElementNS(ns, tag, { is: isCustomElement })
      } else {
        el = document.createElementNS(ns, tag)
      }
    } else if (tag === COMMENT_TAG) {
      return document.createComment(props.comment)
    } else if (isCustomElement) {
      el = document.createElement(tag, { is: isCustomElement })
    } else {
      el = document.createElement(tag)
    }

    // Create the properties
    for (var p in props) {
      if (props.hasOwnProperty(p)) {
        var key = p.toLowerCase()
        var val = props[p]
        // Normalize className
        if (key === 'classname') {
          key = 'class'
          p = 'class'
        }
        // The for attribute gets transformed to htmlFor, but we just set as for
        if (p === 'htmlFor') {
          p = 'for'
        }
        // If a property is boolean, set itself to the key
        if (BOOL_PROPS.indexOf(key) !== -1) {
          if (String(val) === 'true') val = key
          else if (String(val) === 'false') continue
        }
        // If a property prefers being set directly vs setAttribute
        if (key.slice(0, 2) === 'on' || DIRECT_PROPS.indexOf(key) !== -1) {
          el[p] = val
        } else {
          if (ns) {
            if (p === 'xlink:href') {
              el.setAttributeNS(XLINKNS, p, val)
            } else if (/^xmlns($|:)/i.test(p)) {
              // skip xmlns definitions
            } else {
              el.setAttributeNS(null, p, val)
            }
          } else {
            el.setAttribute(p, val)
          }
        }
      }
    }

    appendChild(el, children)
    return el
  }

  function createFragment (nodes) {
    var fragment = document.createDocumentFragment()
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] == null) continue
      if (Array.isArray(nodes[i])) {
        fragment.appendChild(createFragment(nodes[i]))
      } else {
        if (typeof nodes[i] === 'string') nodes[i] = document.createTextNode(nodes[i])
        fragment.appendChild(nodes[i])
      }
    }
    return fragment
  }

  var exports = hyperx(nanoHtmlCreateElement, {
    comments: true,
    createFragment: createFragment
  })
  exports.default = exports
  exports.createComment = nanoHtmlCreateElement
  return exports
}

},{"./append-child":133,"./bool-props":134,"./direct-props":136,"./svg-tags":138,"hyperx":132}],138:[function(require,module,exports){
'use strict'

module.exports = [
  'svg', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix',
  'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood',
  'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage',
  'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight',
  'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter',
  'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src',
  'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image',
  'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph',
  'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

},{}],139:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMobile = isMobile;
exports.default = getBrowser;

var _globals = require("./globals");

var _isBrowser = _interopRequireDefault(require("./is-browser"));

var _isElectron = _interopRequireDefault(require("./is-electron"));

function isMobile() {
  return typeof _globals.window.orientation !== 'undefined';
}

function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0, _isBrowser.default)()) {
    return 'Node';
  }

  if ((0, _isElectron.default)(mockUserAgent)) {
    return 'Electron';
  }

  var navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  var userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  var isMSIE = userAgent.indexOf('MSIE ') !== -1;
  var isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (_globals.window.chrome) {
    return 'Chrome';
  }

  if (_globals.window.safari) {
    return 'Safari';
  }

  if (_globals.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}

},{"./globals":140,"./is-browser":141,"./is-electron":142,"@babel/runtime/helpers/interopRequireDefault":18}],140:[function(require,module,exports){
(function (process,global){(function (){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.console = exports.process = exports.document = exports.global = exports.window = exports.self = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof global !== 'undefined' && global,
  document: typeof document !== 'undefined' && document,
  process: (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && process
};
var self_ = globals.self || globals.window || globals.global;
exports.self = self_;
var window_ = globals.window || globals.self || globals.global;
exports.window = window_;
var global_ = globals.global || globals.self || globals.window;
exports.global = global_;
var document_ = globals.document || {};
exports.document = document_;
var process_ = globals.process || {};
exports.process = process_;
var console_ = console;
exports.console = console_;

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"_process":153}],141:[function(require,module,exports){
(function (process){(function (){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isBrowser;
exports.isBrowserMainThread = isBrowserMainThread;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _isElectron = _interopRequireDefault(require("./is-electron"));

function isBrowser() {
  var isNode = (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0, _isElectron.default)();
}

function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}

}).call(this)}).call(this,require('_process'))

},{"./is-electron":142,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"_process":153}],142:[function(require,module,exports){
(function (process){(function (){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isElectron;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && (0, _typeof2.default)(window.process) === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && (0, _typeof2.default)(process.versions) === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  var realUserAgent = (typeof navigator === "undefined" ? "undefined" : (0, _typeof2.default)(navigator)) === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  var userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}

}).call(this)}).call(this,require('_process'))

},{"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"_process":153}],143:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Log", {
  enumerable: true,
  get: function get() {
    return _log.default;
  }
});
Object.defineProperty(exports, "VERSION", {
  enumerable: true,
  get: function get() {
    return _globals.VERSION;
  }
});
Object.defineProperty(exports, "self", {
  enumerable: true,
  get: function get() {
    return _globals2.self;
  }
});
Object.defineProperty(exports, "window", {
  enumerable: true,
  get: function get() {
    return _globals2.window;
  }
});
Object.defineProperty(exports, "global", {
  enumerable: true,
  get: function get() {
    return _globals2.global;
  }
});
Object.defineProperty(exports, "document", {
  enumerable: true,
  get: function get() {
    return _globals2.document;
  }
});
Object.defineProperty(exports, "process", {
  enumerable: true,
  get: function get() {
    return _globals2.process;
  }
});
Object.defineProperty(exports, "console", {
  enumerable: true,
  get: function get() {
    return _globals2.console;
  }
});
Object.defineProperty(exports, "isBrowser", {
  enumerable: true,
  get: function get() {
    return _isBrowser.default;
  }
});
Object.defineProperty(exports, "isBrowserMainThread", {
  enumerable: true,
  get: function get() {
    return _isBrowser.isBrowserMainThread;
  }
});
Object.defineProperty(exports, "getBrowser", {
  enumerable: true,
  get: function get() {
    return _getBrowser.default;
  }
});
Object.defineProperty(exports, "isMobile", {
  enumerable: true,
  get: function get() {
    return _getBrowser.isMobile;
  }
});
Object.defineProperty(exports, "isElectron", {
  enumerable: true,
  get: function get() {
    return _isElectron.default;
  }
});
Object.defineProperty(exports, "assert", {
  enumerable: true,
  get: function get() {
    return _assert.default;
  }
});
Object.defineProperty(exports, "COLOR", {
  enumerable: true,
  get: function get() {
    return _color.COLOR;
  }
});
Object.defineProperty(exports, "addColor", {
  enumerable: true,
  get: function get() {
    return _color.addColor;
  }
});
Object.defineProperty(exports, "leftPad", {
  enumerable: true,
  get: function get() {
    return _formatters.leftPad;
  }
});
Object.defineProperty(exports, "rightPad", {
  enumerable: true,
  get: function get() {
    return _formatters.rightPad;
  }
});
Object.defineProperty(exports, "autobind", {
  enumerable: true,
  get: function get() {
    return _autobind.autobind;
  }
});
Object.defineProperty(exports, "LocalStorage", {
  enumerable: true,
  get: function get() {
    return _localStorage.default;
  }
});
Object.defineProperty(exports, "getHiResTimestamp", {
  enumerable: true,
  get: function get() {
    return _hiResTimestamp.default;
  }
});
Object.defineProperty(exports, "Stats", {
  enumerable: true,
  get: function get() {
    return _stats.Stats;
  }
});
Object.defineProperty(exports, "Stat", {
  enumerable: true,
  get: function get() {
    return _stats.Stat;
  }
});
exports.default = void 0;

require("./init");

var _log = _interopRequireDefault(require("./lib/log"));

var _globals = require("./utils/globals");

var _globals2 = require("./env/globals");

var _isBrowser = _interopRequireWildcard(require("./env/is-browser"));

var _getBrowser = _interopRequireWildcard(require("./env/get-browser"));

var _isElectron = _interopRequireDefault(require("./env/is-electron"));

var _assert = _interopRequireDefault(require("./utils/assert"));

var _color = require("./utils/color");

var _formatters = require("./utils/formatters");

var _autobind = require("./utils/autobind");

var _localStorage = _interopRequireDefault(require("./utils/local-storage"));

var _hiResTimestamp = _interopRequireDefault(require("./utils/hi-res-timestamp"));

var _stats = require("@probe.gl/stats");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = new _log.default({
  id: 'probe.gl'
});

exports.default = _default;

},{"./env/get-browser":139,"./env/globals":140,"./env/is-browser":141,"./env/is-electron":142,"./init":144,"./lib/log":145,"./utils/assert":146,"./utils/autobind":147,"./utils/color":148,"./utils/formatters":149,"./utils/globals":150,"./utils/hi-res-timestamp":151,"./utils/local-storage":152,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/typeof":29,"@probe.gl/stats":126}],144:[function(require,module,exports){
"use strict";

var _globals = require("./utils/globals");

_globals.global.probe = {};

},{"./utils/globals":150}],145:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeArguments = normalizeArguments;
exports.default = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _globals = require("../utils/globals");

var _localStorage = _interopRequireDefault(require("../utils/local-storage"));

var _formatters = require("../utils/formatters");

var _color = require("../utils/color");

var _autobind = require("../utils/autobind");

var _assert2 = _interopRequireDefault(require("../utils/assert"));

var _hiResTimestamp = _interopRequireDefault(require("../utils/hi-res-timestamp"));

var originalConsole = {
  debug: _globals.isBrowser ? console.debug || console.log : console.log,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};
var DEFAULT_SETTINGS = {
  enabled: true,
  level: 0
};

function noop() {}

var cache = {};
var ONCE = {
  once: true
};

function getTableHeader(table) {
  for (var key in table) {
    for (var title in table[key]) {
      return title || 'untitled';
    }
  }

  return 'empty';
}

var Log = function () {
  function Log() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      id: ''
    },
        id = _ref.id;

    (0, _classCallCheck2.default)(this, Log);
    this.id = id;
    this.VERSION = _globals.VERSION;
    this._startTs = (0, _hiResTimestamp.default)();
    this._deltaTs = (0, _hiResTimestamp.default)();
    this.LOG_THROTTLE_TIMEOUT = 0;
    this._storage = new _localStorage.default("__probe-".concat(this.id, "__"), DEFAULT_SETTINGS);
    this.userData = {};
    this.timeStamp("".concat(this.id, " started"));
    (0, _autobind.autobind)(this);
    Object.seal(this);
  }

  (0, _createClass2.default)(Log, [{
    key: "level",
    get: function get() {
      return this.getLevel();
    },
    set: function set(newLevel) {
      this.setLevel(newLevel);
    }
  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this._storage.config.enabled;
    }
  }, {
    key: "getLevel",
    value: function getLevel() {
      return this._storage.config.level;
    }
  }, {
    key: "getTotal",
    value: function getTotal() {
      return Number(((0, _hiResTimestamp.default)() - this._startTs).toPrecision(10));
    }
  }, {
    key: "getDelta",
    value: function getDelta() {
      return Number(((0, _hiResTimestamp.default)() - this._deltaTs).toPrecision(10));
    }
  }, {
    key: "priority",
    get: function get() {
      return this.level;
    },
    set: function set(newPriority) {
      this.level = newPriority;
    }
  }, {
    key: "getPriority",
    value: function getPriority() {
      return this.level;
    }
  }, {
    key: "enable",
    value: function enable() {
      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this._storage.updateConfiguration({
        enabled: enabled
      });

      return this;
    }
  }, {
    key: "setLevel",
    value: function setLevel(level) {
      this._storage.updateConfiguration({
        level: level
      });

      return this;
    }
  }, {
    key: "assert",
    value: function assert(condition, message) {
      (0, _assert2.default)(condition, message);
    }
  }, {
    key: "warn",
    value: function warn(message) {
      return this._getLogFunction(0, message, originalConsole.warn, arguments, ONCE);
    }
  }, {
    key: "error",
    value: function error(message) {
      return this._getLogFunction(0, message, originalConsole.error, arguments);
    }
  }, {
    key: "deprecated",
    value: function deprecated(oldUsage, newUsage) {
      return this.warn("`".concat(oldUsage, "` is deprecated and will be removed in a later version. Use `").concat(newUsage, "` instead"));
    }
  }, {
    key: "removed",
    value: function removed(oldUsage, newUsage) {
      return this.error("`".concat(oldUsage, "` has been removed. Use `").concat(newUsage, "` instead"));
    }
  }, {
    key: "probe",
    value: function probe(logLevel, message) {
      return this._getLogFunction(logLevel, message, originalConsole.log, arguments, {
        time: true,
        once: true
      });
    }
  }, {
    key: "log",
    value: function log(logLevel, message) {
      return this._getLogFunction(logLevel, message, originalConsole.debug, arguments);
    }
  }, {
    key: "info",
    value: function info(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.info, arguments);
    }
  }, {
    key: "once",
    value: function once(logLevel, message) {
      return this._getLogFunction(logLevel, message, originalConsole.debug || originalConsole.info, arguments, ONCE);
    }
  }, {
    key: "table",
    value: function table(logLevel, _table, columns) {
      if (_table) {
        return this._getLogFunction(logLevel, _table, console.table || noop, columns && [columns], {
          tag: getTableHeader(_table)
        });
      }

      return noop;
    }
  }, {
    key: "image",
    value: function image(_ref2) {
      var logLevel = _ref2.logLevel,
          priority = _ref2.priority,
          _image = _ref2.image,
          _ref2$message = _ref2.message,
          message = _ref2$message === void 0 ? '' : _ref2$message,
          _ref2$scale = _ref2.scale,
          scale = _ref2$scale === void 0 ? 1 : _ref2$scale;

      if (!this._shouldLog(logLevel || priority)) {
        return noop;
      }

      return _globals.isBrowser ? logImageInBrowser({
        image: _image,
        message: message,
        scale: scale
      }) : logImageInNode({
        image: _image,
        message: message,
        scale: scale
      });
    }
  }, {
    key: "settings",
    value: function settings() {
      if (console.table) {
        console.table(this._storage.config);
      } else {
        console.log(this._storage.config);
      }
    }
  }, {
    key: "get",
    value: function get(setting) {
      return this._storage.config[setting];
    }
  }, {
    key: "set",
    value: function set(setting, value) {
      this._storage.updateConfiguration((0, _defineProperty2.default)({}, setting, value));
    }
  }, {
    key: "time",
    value: function time(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
    }
  }, {
    key: "timeEnd",
    value: function timeEnd(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
    }
  }, {
    key: "timeStamp",
    value: function timeStamp(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.timeStamp || noop);
    }
  }, {
    key: "group",
    value: function group(logLevel, message) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        collapsed: false
      };
      opts = normalizeArguments({
        logLevel: logLevel,
        message: message,
        opts: opts
      });
      var _opts = opts,
          collapsed = _opts.collapsed;
      opts.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
      return this._getLogFunction(opts);
    }
  }, {
    key: "groupCollapsed",
    value: function groupCollapsed(logLevel, message) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.group(logLevel, message, Object.assign({}, opts, {
        collapsed: true
      }));
    }
  }, {
    key: "groupEnd",
    value: function groupEnd(logLevel) {
      return this._getLogFunction(logLevel, '', console.groupEnd || noop);
    }
  }, {
    key: "withGroup",
    value: function withGroup(logLevel, message, func) {
      this.group(logLevel, message)();

      try {
        func();
      } finally {
        this.groupEnd(logLevel)();
      }
    }
  }, {
    key: "trace",
    value: function trace() {
      if (console.trace) {
        console.trace();
      }
    }
  }, {
    key: "_shouldLog",
    value: function _shouldLog(logLevel) {
      return this.isEnabled() && this.getLevel() >= normalizeLogLevel(logLevel);
    }
  }, {
    key: "_getLogFunction",
    value: function _getLogFunction(logLevel, message, method) {
      var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      var opts = arguments.length > 4 ? arguments[4] : undefined;

      if (this._shouldLog(logLevel)) {
        var _method;

        opts = normalizeArguments({
          logLevel: logLevel,
          message: message,
          args: args,
          opts: opts
        });
        method = method || opts.method;
        (0, _assert2.default)(method);
        opts.total = this.getTotal();
        opts.delta = this.getDelta();
        this._deltaTs = (0, _hiResTimestamp.default)();
        var tag = opts.tag || opts.message;

        if (opts.once) {
          if (!cache[tag]) {
            cache[tag] = (0, _hiResTimestamp.default)();
          } else {
            return noop;
          }
        }

        message = decorateMessage(this.id, opts.message, opts);
        return (_method = method).bind.apply(_method, [console, message].concat((0, _toConsumableArray2.default)(opts.args)));
      }

      return noop;
    }
  }]);
  return Log;
}();

exports.default = Log;
Log.VERSION = _globals.VERSION;

function normalizeLogLevel(logLevel) {
  if (!logLevel) {
    return 0;
  }

  var resolvedLevel;

  switch ((0, _typeof2.default)(logLevel)) {
    case 'number':
      resolvedLevel = logLevel;
      break;

    case 'object':
      resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
      break;

    default:
      return 0;
  }

  (0, _assert2.default)(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
  return resolvedLevel;
}

function normalizeArguments(opts) {
  var logLevel = opts.logLevel,
      message = opts.message;
  opts.logLevel = normalizeLogLevel(logLevel);
  var args = opts.args ? Array.from(opts.args) : [];

  while (args.length && args.shift() !== message) {}

  opts.args = args;

  switch ((0, _typeof2.default)(logLevel)) {
    case 'string':
    case 'function':
      if (message !== undefined) {
        args.unshift(message);
      }

      opts.message = logLevel;
      break;

    case 'object':
      Object.assign(opts, logLevel);
      break;

    default:
  }

  if (typeof opts.message === 'function') {
    opts.message = opts.message();
  }

  var messageType = (0, _typeof2.default)(opts.message);
  (0, _assert2.default)(messageType === 'string' || messageType === 'object');
  return Object.assign(opts, opts.opts);
}

function decorateMessage(id, message, opts) {
  if (typeof message === 'string') {
    var time = opts.time ? (0, _formatters.leftPad)((0, _formatters.formatTime)(opts.total)) : '';
    message = opts.time ? "".concat(id, ": ").concat(time, "  ").concat(message) : "".concat(id, ": ").concat(message);
    message = (0, _color.addColor)(message, opts.color, opts.background);
  }

  return message;
}

function logImageInNode(_ref3) {
  var image = _ref3.image,
      _ref3$message = _ref3.message,
      message = _ref3$message === void 0 ? '' : _ref3$message,
      _ref3$scale = _ref3.scale,
      scale = _ref3$scale === void 0 ? 1 : _ref3$scale;
  var asciify = null;

  try {
    asciify = module.require('asciify-image');
  } catch (error) {}

  if (asciify) {
    return function () {
      return asciify(image, {
        fit: 'box',
        width: "".concat(Math.round(80 * scale), "%")
      }).then(function (data) {
        return console.log(data);
      });
    };
  }

  return noop;
}

function logImageInBrowser(_ref4) {
  var image = _ref4.image,
      _ref4$message = _ref4.message,
      message = _ref4$message === void 0 ? '' : _ref4$message,
      _ref4$scale = _ref4.scale,
      scale = _ref4$scale === void 0 ? 1 : _ref4$scale;

  if (typeof image === 'string') {
    var img = new Image();

    img.onload = function () {
      var _console;

      var args = (0, _formatters.formatImage)(img, message, scale);

      (_console = console).log.apply(_console, (0, _toConsumableArray2.default)(args));
    };

    img.src = image;
    return noop;
  }

  var element = image.nodeName || '';

  if (element.toLowerCase() === 'img') {
    var _console2;

    (_console2 = console).log.apply(_console2, (0, _toConsumableArray2.default)((0, _formatters.formatImage)(image, message, scale)));

    return noop;
  }

  if (element.toLowerCase() === 'canvas') {
    var _img = new Image();

    _img.onload = function () {
      var _console3;

      return (_console3 = console).log.apply(_console3, (0, _toConsumableArray2.default)((0, _formatters.formatImage)(_img, message, scale)));
    };

    _img.src = image.toDataURL();
    return noop;
  }

  return noop;
}

},{"../utils/assert":146,"../utils/autobind":147,"../utils/color":148,"../utils/formatters":149,"../utils/globals":150,"../utils/hi-res-timestamp":151,"../utils/local-storage":152,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/toConsumableArray":28,"@babel/runtime/helpers/typeof":29}],146:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = assert;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

},{}],147:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.autobind = autobind;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function autobind(obj) {
  var predefined = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['constructor'];
  var proto = Object.getPrototypeOf(obj);
  var propNames = Object.getOwnPropertyNames(proto);

  var _iterator = _createForOfIteratorHelper(propNames),
      _step;

  try {
    var _loop = function _loop() {
      var key = _step.value;

      if (typeof obj[key] === 'function') {
        if (!predefined.find(function (name) {
          return key === name;
        })) {
          obj[key] = obj[key].bind(obj);
        }
      }
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

},{}],148:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addColor = addColor;
exports.COLOR = void 0;

var _globals = require("./globals");

var COLOR = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  MAGENTA: 35,
  CYAN: 36,
  WHITE: 37,
  BRIGHT_BLACK: 90,
  BRIGHT_RED: 91,
  BRIGHT_GREEN: 92,
  BRIGHT_YELLOW: 93,
  BRIGHT_BLUE: 94,
  BRIGHT_MAGENTA: 95,
  BRIGHT_CYAN: 96,
  BRIGHT_WHITE: 97
};
exports.COLOR = COLOR;

function getColor(color) {
  return typeof color === 'string' ? COLOR[color.toUpperCase()] || COLOR.WHITE : color;
}

function addColor(string, color, background) {
  if (!_globals.isBrowser && typeof string === 'string') {
    if (color) {
      color = getColor(color);
      string = "\x1B[".concat(color, "m").concat(string, "\x1B[39m");
    }

    if (background) {
      color = getColor(background);
      string = "\x1B[".concat(background + 10, "m").concat(string, "\x1B[49m");
    }
  }

  return string;
}

},{"./globals":150}],149:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatTime = formatTime;
exports.leftPad = leftPad;
exports.rightPad = rightPad;
exports.formatValue = formatValue;
exports.formatImage = formatImage;

function formatTime(ms) {
  var formatted;

  if (ms < 10) {
    formatted = "".concat(ms.toFixed(2), "ms");
  } else if (ms < 100) {
    formatted = "".concat(ms.toFixed(1), "ms");
  } else if (ms < 1000) {
    formatted = "".concat(ms.toFixed(0), "ms");
  } else {
    formatted = "".concat((ms / 1000).toFixed(2), "s");
  }

  return formatted;
}

function leftPad(string) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
  var padLength = Math.max(length - string.length, 0);
  return "".concat(' '.repeat(padLength)).concat(string);
}

function rightPad(string) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
  var padLength = Math.max(length - string.length, 0);
  return "".concat(string).concat(' '.repeat(padLength));
}

function formatValue(v) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var EPSILON = 1e-16;
  var _opts$isInteger = opts.isInteger,
      isInteger = _opts$isInteger === void 0 ? false : _opts$isInteger;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  var string = v.toPrecision(2);
  var decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}

function formatArrayValue(v, opts) {
  var _opts$maxElts = opts.maxElts,
      maxElts = _opts$maxElts === void 0 ? 16 : _opts$maxElts,
      _opts$size = opts.size,
      size = _opts$size === void 0 ? 1 : _opts$size;
  var string = '[';

  for (var i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += ",".concat(i % size === 0 ? ' ' : '');
    }

    string += formatValue(v[i], opts);
  }

  var terminator = v.length > maxElts ? '...' : ']';
  return "".concat(string).concat(terminator);
}

function formatImage(image, message, scale) {
  var maxWidth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 600;
  var imageUrl = image.src.replace(/\(/g, '%28').replace(/\)/g, '%29');

  if (image.width > maxWidth) {
    scale = Math.min(scale, maxWidth / image.width);
  }

  var width = image.width * scale;
  var height = image.height * scale;
  var style = ['font-size:1px;', "padding:".concat(Math.floor(height / 2), "px ").concat(Math.floor(width / 2), "px;"), "line-height:".concat(height, "px;"), "background:url(".concat(imageUrl, ");"), "background-size:".concat(width, "px ").concat(height, "px;"), 'color:transparent;'].join('');
  return ["".concat(message, " %c+"), style];
}

},{}],150:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "self", {
  enumerable: true,
  get: function get() {
    return _globals.self;
  }
});
Object.defineProperty(exports, "window", {
  enumerable: true,
  get: function get() {
    return _globals.window;
  }
});
Object.defineProperty(exports, "global", {
  enumerable: true,
  get: function get() {
    return _globals.global;
  }
});
Object.defineProperty(exports, "document", {
  enumerable: true,
  get: function get() {
    return _globals.document;
  }
});
Object.defineProperty(exports, "process", {
  enumerable: true,
  get: function get() {
    return _globals.process;
  }
});
Object.defineProperty(exports, "console", {
  enumerable: true,
  get: function get() {
    return _globals.console;
  }
});
exports.isBrowser = exports.VERSION = void 0;

var _isBrowser = _interopRequireDefault(require("../env/is-browser"));

var _globals = require("../env/globals");

var VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
exports.VERSION = VERSION;
var isBrowser = (0, _isBrowser.default)();
exports.isBrowser = isBrowser;

},{"../env/globals":140,"../env/is-browser":141,"@babel/runtime/helpers/interopRequireDefault":18}],151:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getHiResTimestamp;

var _globals = require("./globals");

function getHiResTimestamp() {
  var timestamp;

  if (_globals.isBrowser && _globals.window.performance) {
    timestamp = _globals.window.performance.now();
  } else if (_globals.process.hrtime) {
    var timeParts = _globals.process.hrtime();

    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}

},{"./globals":150}],152:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function getStorage(type) {
  try {
    var storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return storage;
  } catch (e) {
    return null;
  }
}

var LocalStorage = function () {
  function LocalStorage(id, defaultSettings) {
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'sessionStorage';
    (0, _classCallCheck2.default)(this, LocalStorage);
    this.storage = getStorage(type);
    this.id = id;
    this.config = {};
    Object.assign(this.config, defaultSettings);

    this._loadConfiguration();
  }

  (0, _createClass2.default)(LocalStorage, [{
    key: "getConfiguration",
    value: function getConfiguration() {
      return this.config;
    }
  }, {
    key: "setConfiguration",
    value: function setConfiguration(configuration) {
      this.config = {};
      return this.updateConfiguration(configuration);
    }
  }, {
    key: "updateConfiguration",
    value: function updateConfiguration(configuration) {
      Object.assign(this.config, configuration);

      if (this.storage) {
        var serialized = JSON.stringify(this.config);
        this.storage.setItem(this.id, serialized);
      }

      return this;
    }
  }, {
    key: "_loadConfiguration",
    value: function _loadConfiguration() {
      var configuration = {};

      if (this.storage) {
        var serializedConfiguration = this.storage.getItem(this.id);
        configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
      }

      Object.assign(this.config, configuration);
      return this;
    }
  }]);
  return LocalStorage;
}();

exports.default = LocalStorage;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":18}],153:[function(require,module,exports){
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],154:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

},{}]},{},[1])