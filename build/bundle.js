(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  /**
   * Find the index to insert an element in array keeping the sort order.
   *
   * @param {function} comparatorFn The comparator function which sorted the array.
   * @param {array} arr The sorted array.
   * @param {object} el The element to insert.
   */
  function findInsertIndex(comparatorFn, arr, el) {
    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
      if (comparatorFn(arr[i], el) > 0) {
        break;
      }
    }
    return i;
  }

  return findInsertIndex;
})();

},{}],2:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  /**
   * Sort an array using the merge sort algorithm.
   *
   * @param {function} comparatorFn The comparator function.
   * @param {array} arr The array to sort.
   * @returns {array} The sorted array.
   */
  function mergeSort(comparatorFn, arr) {
    var len = arr.length, firstHalf, secondHalf;
    if (len >= 2) {
      firstHalf = arr.slice(0, len / 2);
      secondHalf = arr.slice(len / 2, len);
      return merge(comparatorFn, mergeSort(comparatorFn, firstHalf), mergeSort(comparatorFn, secondHalf));
    } else {
      return arr.slice();
    }
  }

  /**
   * The merge part of the merge sort algorithm.
   *
   * @param {function} comparatorFn The comparator function.
   * @param {array} arr1 The first sorted array.
   * @param {array} arr2 The second sorted array.
   * @returns {array} The merged and sorted array.
   */
  function merge(comparatorFn, arr1, arr2) {
    var result = [], left1 = arr1.length, left2 = arr2.length;
    while (left1 > 0 && left2 > 0) {
      if (comparatorFn(arr1[0], arr2[0]) <= 0) {
        result.push(arr1.shift());
        left1--;
      } else {
        result.push(arr2.shift());
        left2--;
      }
    }
    if (left1 > 0) {
      result.push.apply(result, arr1);
    } else {
      result.push.apply(result, arr2);
    }
    return result;
  }

  return mergeSort;
})();

},{}],3:[function(require,module,exports){
var mergeSort, findInsertIndex;
mergeSort = require('mergesort');
findInsertIndex = require('find-insert-index');

module.exports = (function () {
  'use strict';

  var walkStrategies;

  walkStrategies = {};

  function k(result) {
    return function () {
      return result;
    };
  }

  function TreeModel(config) {
    config = config || {};
    this.config = config;
    this.config.childrenPropertyName = config.childrenPropertyName || 'children';
    this.config.modelComparatorFn = config.modelComparatorFn;
  }

  function addChildToNode(node, child) {
    child.parent = node;
    node.children.push(child);
    return child;
  }

  function Node(config, model) {
    this.config = config;
    this.model = model;
    this.children = [];
  }

  TreeModel.prototype.parse = function (model) {
    var i, childCount, node;

    if (!(model instanceof Object)) {
      throw new TypeError('Model must be of type object.');
    }

    node = new Node(this.config, model);
    if (model[this.config.childrenPropertyName] instanceof Array) {
      if (this.config.modelComparatorFn) {
        model[this.config.childrenPropertyName] = mergeSort(
          this.config.modelComparatorFn,
          model[this.config.childrenPropertyName]);
      }
      for (i = 0, childCount = model[this.config.childrenPropertyName].length; i < childCount; i++) {
        addChildToNode(node, this.parse(model[this.config.childrenPropertyName][i]));
      }
    }
    return node;
  };

  function hasComparatorFunction(node) {
    return typeof node.config.modelComparatorFn === 'function';
  }

  Node.prototype.isRoot = function () {
    return this.parent === undefined;
  };

  Node.prototype.hasChildren = function () {
    return this.children.length > 0;
  };

  function addChild(self, child, insertIndex) {
    var index;

    if (!(child instanceof Node)) {
      throw new TypeError('Child must be of type Node.');
    }

    child.parent = self;
    if (!(self.model[self.config.childrenPropertyName] instanceof Array)) {
      self.model[self.config.childrenPropertyName] = [];
    }

    if (hasComparatorFunction(self)) {
      // Find the index to insert the child
      index = findInsertIndex(
          self.config.modelComparatorFn,
          self.model[self.config.childrenPropertyName],
          child.model);

      // Add to the model children
      self.model[self.config.childrenPropertyName].splice(index, 0, child.model);

      // Add to the node children
      self.children.splice(index, 0, child);
    } else {
      if (insertIndex === undefined) {
        self.model[self.config.childrenPropertyName].push(child.model);
        self.children.push(child);
      } else {
        if (insertIndex < 0 || insertIndex > self.children.length) {
          throw new Error('Invalid index.');
        }
        self.model[self.config.childrenPropertyName].splice(insertIndex, 0, child.model);
        self.children.splice(insertIndex, 0, child);
      }
    }
    return child;
  }

  Node.prototype.addChild = function (child) {
    return addChild(this, child);
  };

  Node.prototype.addChildAtIndex = function (child, index) {
    if (hasComparatorFunction(this)) {
      throw new Error('Cannot add child at index when using a comparator function.');
    }

    return addChild(this, child, index);
  };

  Node.prototype.setIndex = function (index) {
    if (hasComparatorFunction(this)) {
      throw new Error('Cannot set node index when using a comparator function.');
    }

    if (this.isRoot()) {
      if (index === 0) {
        return this;
      }
      throw new Error('Invalid index.');
    }

    if (index < 0 || index >= this.parent.children.length) {
      throw new Error('Invalid index.');
    }

    var oldIndex = this.parent.children.indexOf(this);

    this.parent.children.splice(index, 0, this.parent.children.splice(oldIndex, 1)[0]);

    this.parent.model[this.parent.config.childrenPropertyName]
    .splice(index, 0, this.parent.model[this.parent.config.childrenPropertyName].splice(oldIndex, 1)[0]);

    return this;
  };

  Node.prototype.getPath = function () {
    var path = [];
    (function addToPath(node) {
      path.unshift(node);
      if (!node.isRoot()) {
        addToPath(node.parent);
      }
    })(this);
    return path;
  };

  Node.prototype.getIndex = function () {
    if (this.isRoot()) {
      return 0;
    }
    return this.parent.children.indexOf(this);
  };

  /**
   * Parse the arguments of traversal functions. These functions can take one optional
   * first argument which is an options object. If present, this object will be stored
   * in args.options. The only mandatory argument is the callback function which can
   * appear in the first or second position (if an options object is given). This
   * function will be saved to args.fn. The last optional argument is the context on
   * which the callback function will be called. It will be available in args.ctx.
   *
   * @returns Parsed arguments.
   */
  function parseArgs() {
    var args = {};
    if (arguments.length === 1) {
      if (typeof arguments[0] === 'function') {
        args.fn = arguments[0];
      } else {
        args.options = arguments[0];
      }
    } else if (arguments.length === 2) {
      if (typeof arguments[0] === 'function') {
        args.fn = arguments[0];
        args.ctx = arguments[1];
      } else {
        args.options = arguments[0];
        args.fn = arguments[1];
      }
    } else {
      args.options = arguments[0];
      args.fn = arguments[1];
      args.ctx = arguments[2];
    }
    args.options = args.options || {};
    if (!args.options.strategy) {
      args.options.strategy = 'pre';
    }
    if (!walkStrategies[args.options.strategy]) {
      throw new Error('Unknown tree walk strategy. Valid strategies are \'pre\' [default], \'post\' and \'breadth\'.');
    }
    return args;
  }

  Node.prototype.walk = function () {
    var args;
    args = parseArgs.apply(this, arguments);
    walkStrategies[args.options.strategy].call(this, args.fn, args.ctx);
  };

  walkStrategies.pre = function depthFirstPreOrder(callback, context) {
    var i, childCount, keepGoing;
    keepGoing = callback.call(context, this);
    for (i = 0, childCount = this.children.length; i < childCount; i++) {
      if (keepGoing === false) {
        return false;
      }
      keepGoing = depthFirstPreOrder.call(this.children[i], callback, context);
    }
    return keepGoing;
  };

  walkStrategies.post = function depthFirstPostOrder(callback, context) {
    var i, childCount, keepGoing;
    for (i = 0, childCount = this.children.length; i < childCount; i++) {
      keepGoing = depthFirstPostOrder.call(this.children[i], callback, context);
      if (keepGoing === false) {
        return false;
      }
    }
    keepGoing = callback.call(context, this);
    return keepGoing;
  };

  walkStrategies.breadth = function breadthFirst(callback, context) {
    var queue = [this];
    (function processQueue() {
      var i, childCount, node;
      if (queue.length === 0) {
        return;
      }
      node = queue.shift();
      for (i = 0, childCount = node.children.length; i < childCount; i++) {
        queue.push(node.children[i]);
      }
      if (callback.call(context, node) !== false) {
        processQueue();
      }
    })();
  };

  Node.prototype.all = function () {
    var args, all = [];
    args = parseArgs.apply(this, arguments);
    args.fn = args.fn || k(true);
    walkStrategies[args.options.strategy].call(this, function (node) {
      if (args.fn.call(args.ctx, node)) {
        all.push(node);
      }
    }, args.ctx);
    return all;
  };

  Node.prototype.first = function () {
    var args, first;
    args = parseArgs.apply(this, arguments);
    args.fn = args.fn || k(true);
    walkStrategies[args.options.strategy].call(this, function (node) {
      if (args.fn.call(args.ctx, node)) {
        first = node;
        return false;
      }
    }, args.ctx);
    return first;
  };

  Node.prototype.drop = function () {
    var indexOfChild;
    if (!this.isRoot()) {
      indexOfChild = this.parent.children.indexOf(this);
      this.parent.children.splice(indexOfChild, 1);
      this.parent.model[this.config.childrenPropertyName].splice(indexOfChild, 1);
      this.parent = undefined;
      delete this.parent;
    }
    return this;
  };

  return TreeModel;
})();

},{"find-insert-index":1,"mergesort":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createGroup = exports.blackHoleRect = exports.createIconSelection = exports.NodeCreationWidget = exports.DetailsWidget = exports.TextInput = exports.DrawInput = exports.EllipseButton = exports.CircleButton = exports.RectButton = exports.getEl = exports.saveVarsToComponents = undefined;

var _viewController = require('./viewController.js');

exports.saveVarsToComponents = saveVarsToComponents; /**
                                                      * Created by jtsjordan on 7/3/17.
                                                      */

exports.getEl = getEl;
exports.RectButton = RectButton;
exports.CircleButton = CircleButton;
exports.EllipseButton = EllipseButton;
exports.DrawInput = DrawInput;
exports.TextInput = TextInput;
exports.DetailsWidget = DetailsWidget;
exports.NodeCreationWidget = NodeCreationWidget;
exports.createIconSelection = createIconSelection;
exports.blackHoleRect = blackHoleRect;
exports.createGroup = createGroup;

// Container

var $at_depth = $('.at_depth');

// Node Property Obj
var nVars = void 0;

// View Dimensions
var viewW = void 0;
var viewH = void 0;
var xMid = void 0;
var yMid = void 0;

// --- UI Components ---


// ----- WIDGETS -----


// Node Details
function DetailsWidget(attr) {

    var detailsSVG = createSVG({ id: 'details_widget', class: 'widget_svg', vis: 'visible' });
    var detailsBack = getDetailsBase();
    var detailsText = getDetailsText(attr.text);

    var inputs = getDetailsInputs(attr);

    $(inputs[2]).css('visibility', 'hidden');
    // $( inputs[ 3 ] ).css( 'visibility', 'hidden' );

    detailsSVG.append(inputs[1]);
    detailsSVG.append(detailsBack, detailsText);
    detailsSVG.append(inputs[0], inputs[2]);
    detailsSVG.append(inputs[3]);

    createIconSelection('details');

    return detailsSVG;
}

// Node Creation
function NodeCreationWidget(attr) {

    attr.id = 'icon_canvas';attr.class = 'canvas_back';attr.vis = 'visible';attr.visibility = 'visible';attr.icon = 'imageIcon.png';

    var creationSVG = createSVG({ id: 'node_creation_widget', class: 'widget_svg', vis: 'visible' });
    var iconCanvas = new EllipseButton(attr, _viewController.buttonClicked);

    $.data(iconCanvas, 'clickAction', 'showIconSelection');

    var inputs = getCreationInputs(attr);

    // Appends
    creationSVG.append(inputs[3], inputs[2]);
    creationSVG.append(iconCanvas);
    creationSVG.append(inputs[0], inputs[1]);

    createIconSelection('creation');

    return creationSVG;
}

// ----- Widget Methods -----


// Details
function getDetailsBase() {

    return createRect({ class: 'widget_back', x: xMid - 150, y: yMid - 62, width: 300, height: 125, vis: 'visible' });
}
function getDetailsText(text) {

    var textFO = createForeignObject({ 'class': 'details_text_fo', 'x': xMid - 120, 'y': yMid - 55, 'width': 205, 'height': 110, 'vis': 'visible' });
    $(textFO).append($("<div>", { class: "widget_text_div", text: text }));

    return textFO;
}
function getDetailsInputs(attr) {

    attr.icon = 'menuIcon.png';attr.id = 'edit';
    var editButton = new RectButton(attr, _viewController.buttonClicked);attr.icon = 'deleteIcon.png';attr.id = 'delete';
    var deleteButton = new EllipseButton(attr, _viewController.buttonClicked);attr.icon = 'imageIcon.png';

    $.data(editButton, 'clickAction', 'edit');
    $.data(deleteButton, 'clickAction', 'delete');

    attr.x = '' + xMid - 155;
    attr.y = '' + yMid - 25;
    attr.width = '' + 270;
    attr.height = '' + 135;

    var textInput = new TextArea(attr);

    attr.text = attr.name;
    attr.id = 'name';

    var nameInput = new TextInput(attr);

    return [editButton, deleteButton, textInput, nameInput];
}

// Creation
function getCreationBase() {

    return new IconCanvas(_viewController.buttonClicked);
}
function getCreationInputs(attr) {

    // Text Inputs
    attr.id = 'creation_name';attr.text = 'Name';var nameInput = new TextInput(attr);
    attr.id = 'creation_text';attr.text = 'Text';var textInput = new TextInput(attr);

    // Buttons
    attr.id = 'confirm_creation';attr.icon = "checkIcon.png";var confirmButton = new EllipseButton(attr, _viewController.buttonClicked);
    attr.id = 'cancel_creation';attr.icon = "closeIcon.png";var cancelButton = new EllipseButton(attr, _viewController.buttonClicked);

    $.data(confirmButton, 'clickAction', 'confirm');
    $.data(cancelButton, 'clickAction', 'cancel');

    return [nameInput, textInput, confirmButton, cancelButton];
}

function IconCanvas(attr) {
    attr.icon = 'plusIcon.png';attr.id = 'canvas_back';attr.class = 'canvas_back';
    var canvasSVG = createSVG({ id: 'icon_canvas', class: 'icon_canvas', vis: 'visible' });
    var canvasBack = new EllipseButton({ attr: attr, buttonClicked: _viewController.buttonClicked });
    var canvasIcon = createImage({ 'class': 'icon_canvas_icon', 'icon': "plusIcon.png", 'x': xMid - 40, 'y': yMid - 40, 'width': '80', 'height': '80', 'vis': 'visible' });

    $(canvasSVG).append(canvasBack);
    $(canvasSVG).append(canvasIcon);

    return canvasSVG;
}

// --------------------------


// ----- SELECTION MENU -----


// selectionType INTERFACE  --  ToDo


// Creat Menu
function createIconSelection(context) {

    var selectionContainerSVG = createSVG({ id: 'icon_selection_container', class: 'selection_container', vis: 'hidden' });

    $(selectionContainerSVG).append(createSingleSelection('knowledgeIcon.png', context));
    $(selectionContainerSVG).append(createSingleSelection('nodeIcon.png', context));
    $(selectionContainerSVG).append(createSingleSelection('noteIcon.png', context));
    $(selectionContainerSVG).append(createSingleSelection('projectIcon.png', context));
    $(selectionContainerSVG).append(createSingleSelection('scheduleIcon.png', context));

    $at_depth.append(selectionContainerSVG);

    return selectionContainerSVG;
}

// Create Single Menu Selection
function createSingleSelection(icon, context) {

    var iconName = icon.replace('.png', '');

    var selectionSVG = createSVG({ id: 'icon_selection' + iconName, class: 'icon_selection', vis: 'visible' });
    var selectionBack = createEllipse({ class: 'selection_back', cx: xMid, cy: yMid, rx: '30', ry: '20', vis: 'hidden' });
    var selectionIcon = createImage({ 'class': 'selection_icon', 'icon': icon, 'x': xMid - 10, 'y': yMid - 10, 'width': '' + 20, 'height': '' + 20, 'vis': 'hidden' });

    $(selectionSVG).append(selectionBack);
    $(selectionSVG).append(selectionIcon);

    $.data(selectionSVG, 'clickAction', 'changeIcon');
    $.data(selectionSVG, 'context', context);

    $(selectionSVG).click(_viewController.buttonClicked);

    return selectionSVG;
}

// --------------------------


// ----- BUTTONS -----


// Rect
function RectButton(attr, callback) {

    var type = 'svg_button';

    var buttonBase = getRectBase(attr, type, callback);
    var buttonIcon = getIcon(attr);
    var buttonText = getRectText(attr);

    $(buttonBase).append(buttonIcon, buttonText);

    return buttonBase;
}

// Circle
function CircleButton(attr, callback) {

    // attr: [ cx, cy, r, text ]

    this.attr = attr;
    var buttonSVG = createSVG({ id: attr.text + '_svg_button', class: 'svg_button', vis: 'visible' });
    var buttonBack = createCircle({ class: 'node', cx: attr.cx, cy: attr.cy, r: attr.r, vis: 'visible' });

    // HTML Text
    var textFO = createForeignObject({ 'class': 'button_text_fo', 'x': attr.cx - .5 * attr.r, 'y': attr.cy - .5 * attr.r, 'width': attr.r, 'height': attr.r, 'vis': 'visible' });
    var textDiv = $("<div>", { class: "button_text_div", text: attr.text });

    $(textFO).append(textDiv);

    $(buttonSVG).append(buttonBack);
    $(buttonSVG).append(textFO);

    $(buttonBack).click(callback);

    return buttonSVG;
}

// Ellipse
function EllipseButton(attr, callback) {

    var type = attr.class == 'node_group' ? attr.class : 'svg_button';

    var buttonBase = getEllipseBase(attr, type, callback);
    var buttonIcon = getIcon(attr);
    var buttonText = getEllipseText(attr);

    $(buttonBase).append(buttonIcon, buttonText);

    return buttonBase;
}

// ----- Button Methods -----


// Rect
function getRectBase(attr, type, callback) {

    var buttonSVG = createSVG({ id: attr.id + '_' + type, class: type, vis: 'hidden' });
    var buttonBack = createRect({ class: 'svg_button_back', x: xMid - 25, y: yMid - 25, width: 50, height: 50, vis: 'visible' });

    $(buttonSVG).append(buttonBack);

    $(buttonBack).click(callback);

    return buttonSVG;
}
function getRectText(attr) {

    var textFO = createForeignObject({ 'class': 'button_text_fo', 'x': xMid - 100, 'y': yMid - 50, 'width': 100, 'height': 50, 'vis': 'hidden' });
    $(textFO).append($("<div>", { class: "button_text_div", text: attr.name }));

    return textFO;
}

// Ellipse
function getEllipseBase(attr, type, callback) {

    var backType = void 0;
    if (type == 'canvas_back') {
        backType = type;
    } else {
        backType = type == 'svg_button' ? 'svg_button_back' : 'node';
    }
    // let backType = type == 'svg_button' ? 'svg_button_back' : 'node';
    // let backType = attr.class;

    var buttonSVG = createSVG({ id: attr.id + '_' + type, class: type, vis: 'hidden' });
    var buttonBack = createEllipse({ class: backType, cx: xMid, cy: yMid, rx: attr.rx, ry: attr.ry, vis: 'visible' });

    $(buttonSVG).append(buttonBack);

    $(buttonBack).click(callback);

    return buttonSVG;
}
function getEllipseText(attr) {

    var textFO = createForeignObject({ 'class': 'button_text_fo', 'x': xMid + 50, 'y': yMid - 105, 'width': 250, 'height': 40, 'vis': 'hidden' });
    $(textFO).append($("<div>", { class: "button_text_div", text: attr.name }));

    return textFO;
}

// --------------------------


// ----- INPUTS -----


// Canvas
function DrawInput() {

    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var clickColor = [];
    var clickSize = [];
    var clickTool = [];

    var paint = void 0;

    var colorPurple = "#cb3594";
    var colorGreen = "#659b41";
    var colorYellow = "#ffcf33";
    var colorBrown = "#986928";
    var colorBlack = "#000000";

    var strokeSizeObj = {

        huge: 30,
        large: 15,
        normal: 5,
        small: 2

    };

    var currentColor = colorBlack;
    var currentSize = "large";
    var currentTool = "marker";

    var canvasFO = document.getElementById('canvasFO');
    var canvas = canvasFO.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", 'canvas')[0];
    var context = canvas.getContext('2d');

    canvasContext = context;

    // TweenLite.to( canvasFO, 1, { x: '50%' } );
    TweenLite.to(canvas, 1, { autoAlpha: 1 });

    function addClick(x, y, dragging) {

        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);

        if (currentTool == "eraser") {

            clickColor.push("white");
        } else {

            clickColor.push(currentColor);
        }

        // clickColor.push( currentColor );
        clickSize.push(currentSize);
    }

    function redraw() {

        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

        context.lineJoin = "round";

        for (var i = 0; i < clickX.length; i++) {

            context.beginPath();

            if (clickDrag[i] && i) {

                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {

                context.moveTo(clickX[i] - 1, clickY[i]);
            }

            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.strokeStyle = clickColor[i];
            context.lineWidth = strokeSizeObj[currentSize];
            context.stroke();
        }

        if (currentTool == "crayon") {

            context.globalAlpha = 0.4;
            // context.drawImage( crayonTextureImage, 0, 0, 250, 250 );
        } else {

            context.globalAlpha = 1;
        }
    }

    // Mouse DOWN
    function clickDown(e) {

        e.preventDefault();

        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;

        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        redraw();
    }
    function drag(e) {

        e.preventDefault();

        if (paint) {

            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    }
    function clickUp(e) {

        e.preventDefault();

        paint = false;
    }
    function leftBounds(e) {

        e.preventDefault();

        paint = false;
    }

    canvas.addEventListener(startEvent, clickDown, false);
    canvas.addEventListener(endEvent, clickUp, false);
    canvas.addEventListener(moveEvent, drag, false);
    // canvas.addEventListener( startEvent, leftBounds, false );
}

// Text
function TextInput(attr) {

    // HTML Text Input
    var textInputFO = createForeignObject({ 'class': 'text_input_fo', 'x': attr.x, 'y': attr.y, 'width': attr.width, 'height': attr.height, 'vis': 'visible' });
    var form = $("<form>", { class: "text_input_form" });
    var textInput = $("<input>", { type: "text", name: "Name", value: attr.name ? attr.name : attr.text, id: attr.id + "_text_input", class: "text_input", text: attr.text });

    $(form).append(textInput);

    $(textInputFO).append(form);

    return textInputFO;
}

// Text Area
function TextArea(attr) {

    var textFO = createForeignObject({ 'class': 'details_text_fo', 'x': xMid - 120, 'y': yMid - 55, 'width': 205, 'height': 110, 'vis': 'visible' });
    $(textFO).append($("<textarea>", { class: "widget_text_area", text: attr.text, cols: 8, rows: 1 }));

    return textFO;
}

// -----------------

function blackHoleRect() {

    return createRect({ class: 'black_hole_rect', x: xMid + 180, y: yMid - 100, width: 25, height: 200, vis: 'visible' });
}

// ----- ELEMENTS -----


function getEl(type, attr) {

    switch (type) {

        case 'circle':
            return createCircle(attr);

        case 'ellipse':
            return createEllipse(attr);

        case 'rect':
            return createRect(attr);

        case 'svgRect':
            return createSVGRect(attr);

        case 'path':
            return createPath(attr);

        case 'image':
            return createImage(attr);

        case 'customImage':
            return createCustomImage(attr);

        case 'text':
            return createText(attr);

        case 'g':
            return createGroup(attr);

        case 'svg':
            return createSVG(attr);

        case 'htmlText':
            return createHTMLText(attr);

        case 'foreignObject':
            return createForeignObject(attr);

        default:
            return 'Unknown';

    }
}

function getIcon(attr) {

    if (attr.imgURL) {

        return createCustomImage({ 'icon': attr.imgURL, 'x': xMid - 17, 'y': yMid - 17, 'width': 34, 'height': 34, 'vis': 'visible' });
    } else {

        return createImage({ 'icon': attr.icon, 'x': xMid - 17, 'y': yMid - 17, 'width': 34, 'height': 34, 'vis': 'visible' });
    }
}

// --- SVG Elements ---


function createCircle(attr) {

    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    circle.setAttributeNS(null, 'class', attr.class || 'new_circle');
    circle.setAttributeNS(null, 'cx', attr.cx || 0);
    circle.setAttributeNS(null, 'cy', attr.cy || 0);
    circle.setAttributeNS(null, 'r', attr.r || 30);
    circle.setAttributeNS(null, 'cursor', 'pointer');
    circle.setAttributeNS(null, 'visibility', attr.vis || 'visible');

    return circle;
}
function createEllipse(attr) {

    var ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

    ellipse.setAttributeNS(null, 'class', attr.class || 'new_ellipse');
    ellipse.setAttributeNS(null, 'cx', attr.cx || 0);
    ellipse.setAttributeNS(null, 'cy', attr.cy || 0);
    ellipse.setAttributeNS(null, 'rx', attr.rx || 30);
    ellipse.setAttributeNS(null, 'ry', attr.ry || 30);
    ellipse.setAttributeNS(null, 'cursor', 'pointer');
    ellipse.setAttributeNS(null, 'visibility', attr.vis || 'visible');

    return ellipse;
}
function createRect(attr) {

    var rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    rectangle.setAttributeNS(null, 'class', attr.class || 'new_rect');
    rectangle.setAttributeNS(null, 'x', attr.x || 0);
    rectangle.setAttributeNS(null, 'y', attr.y || 0);
    rectangle.setAttributeNS(null, 'width', attr.width || 100);
    rectangle.setAttributeNS(null, 'height', attr.height || 35);
    rectangle.setAttributeNS(null, 'cursor', 'pointer');
    rectangle.setAttributeNS(null, 'visibility', attr.vis || 'visible');

    return rectangle;
}
function createSVGRect(attr) {

    var rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'SVGRect');

    rectangle.setAttributeNS(null, 'class', attr.class || 'new_svg_rect');
    rectangle.setAttributeNS(null, 'x', attr.x || 0);
    rectangle.setAttributeNS(null, 'y', attr.y || 0);
    rectangle.setAttributeNS(null, 'width', attr.width || 50);
    rectangle.setAttributeNS(null, 'height', attr.height || 50);
    rectangle.setAttributeNS(null, 'cursor', 'pointer');
    rectangle.setAttributeNS(null, 'visibility', attr.vis || 'visible');

    return rectangle;
}
function createPath(attr) {

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    path.setAttribute('class', 'connector');
    path.setAttribute('d', attr.d || '');
    path.setAttribute('stroke', '#687886');
    path.setAttribute('stroke-width', attr.strokeWidth || 2);

    return path;
}
function createImage(attr) {

    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');

    icon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "src/styles/images/" + (attr.icon || 'atomIcon.png'));
    icon.setAttributeNS(null, 'class', attr.class || 'node_icon');
    icon.setAttributeNS(null, 'height', attr.height || 50);
    icon.setAttributeNS(null, 'width', attr.width || 50);
    icon.setAttributeNS(null, 'x', attr.x || 0);
    icon.setAttributeNS(null, 'y', attr.y || 0);
    icon.setAttributeNS(null, 'visibility', attr.vis || 'visible');
    icon.setAttributeNS(null, 'pointer-events', 'none');

    return icon;
}
function createCustomImage(attr) {

    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');

    icon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', attr.icon);
    icon.setAttributeNS(null, 'class', 'node_icon');
    icon.setAttributeNS(null, 'height', attr.height || 100);
    icon.setAttributeNS(null, 'width', attr.width || 100);
    icon.setAttributeNS(null, 'x', attr.x || 0);
    icon.setAttributeNS(null, 'y', attr.y || 0);
    icon.setAttributeNS(null, 'visibility', attr.vis || 'visible');
    icon.setAttributeNS(null, 'pointer-events', 'none');

    return icon;
}
function createText(attr) {

    var newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    newText.setAttributeNS(null, 'class', attr.class || 'new_text');
    newText.setAttributeNS(null, 'x', attr.x || 0);
    newText.setAttributeNS(null, 'y', attr.y || 0);
    newText.setAttributeNS(null, 'font-family', 'Arial, Helvetica, sans-serif');
    newText.setAttributeNS(null, 'font-size', attr.fontSize || 16);
    newText.setAttributeNS(null, 'pointer-events', 'none');
    newText.setAttributeNS(null, 'visibility', attr.vis || 'visible');

    newText.textContent = attr.title;

    return newText;
}
function createGroup(attr) {

    var newGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    newGroup.setAttributeNS(null, 'id', attr.id);
    newGroup.setAttributeNS(null, 'class', attr.class || 'new_group');
    newGroup.setAttributeNS(null, 'visibility', attr.vis || 'visible');

    return newGroup;
}
function createSVG(attr) {

    var newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    newSVG.setAttributeNS(null, 'id', attr.id);
    newSVG.setAttributeNS(null, 'class', attr.class || 'new_svg');
    newSVG.setAttributeNS(null, 'visibility', attr.vis || 'visible');
    newSVG.setAttributeNS(null, 'x', 0);
    newSVG.setAttributeNS(null, 'y', 0);

    return newSVG;
}
function createHTMLText(attr, text) {

    // HTML Text
    var textFO = createForeignObject({ 'class': 'html_text_fo', 'x': attr.oX || 0, 'y': attr.oY + attr.height * .3 || 0, 'width': attr.width || 150, 'height': attr.height * .5 || 35, 'vis': 'visible' });
    var textDiv = $("<div>", { class: "html_text_div", text: text });

    $(textFO).append(textDiv);

    return textFO;
}
function createTextArea() {}
function createForeignObject(attr) {

    var newFO = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');

    newFO.setAttributeNS(null, 'class', attr.class || 'new_foreign_object');
    newFO.setAttributeNS(null, 'x', attr.x || 0);
    newFO.setAttributeNS(null, 'y', attr.y || 0);
    newFO.setAttributeNS(null, 'width', attr.width || 150);
    newFO.setAttributeNS(null, 'height', attr.height || 40);
    newFO.setAttributeNS(null, 'visibility', attr.vis || 'visible');

    return newFO;
}

// --------------------


// Save dimension vars from initialization to this module
function saveVarsToComponents(viewVars, nodeVars) {

    nVars = nodeVars;

    viewW = viewVars.viewWidth;
    viewH = viewVars.viewHeight;
    xMid = viewVars.xMid;
    yMid = viewVars.yMid;
}

},{"./viewController.js":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by jtsjordan on 7/3/17.
 */

exports.createCoordinateSpace = createCoordinateSpace;

// Attribute Value Objects

// View

var viewVars = {

    viewDims: 0,
    viewWidth: 0,
    viewHeight: 0,
    xMid: 0,
    yMid: 0

};

// Node
var nodeVars = {

    projectRadius: 240,
    focusRadius: 80,
    childRadius: 30,
    iconMenuRadius: 200,

    fadeX: 0,
    fadeY: 0,

    cornerX: 0,
    cornerY: 0,

    expandedX: -165,
    expandedY: -200

};

// --- Coordinate Space Calculations ---


// Starts Process / Returns Results
function createCoordinateSpace(callback) {

    var process = setWidthAndHeight();

    callback(process);
}

function setWidthAndHeight() {

    viewVars.viewDims = getWindowDimensions();

    return roundWindowDimensions();
}

function getWindowDimensions() {

    var doc = document,
        w = window;

    var docEl = doc.compatMode && doc.compatMode === 'CSS1Compat' ? doc.documentElement : doc.body;

    var width = docEl.clientWidth;
    var height = docEl.clientHeight;

    // mobile zoomed in?
    if (w.innerWidth && width > w.innerWidth) {
        width = w.innerWidth;
        height = w.innerHeight;
    }

    return { width: width, height: height };
}

function roundWindowDimensions() {

    viewVars.viewWidth = rd(viewVars.viewDims.width);
    viewVars.viewHeight = rd(viewVars.viewDims.height);

    return setMidPoints();
}

function setMidPoints() {

    viewVars.xMid = Math.round(viewVars.viewWidth * .5);
    viewVars.yMid = Math.round(viewVars.viewHeight * .5);

    return applyDimensionsToBody();
}

function applyDimensionsToBody() {

    var vW = viewVars.viewWidth;
    var vH = viewVars.viewHeight;

    $('body').css({ 'width': vW, 'height': vH });

    return getValuesForScreenSize(vW, vH);
}

function getValuesForScreenSize(vW, vH) {

    var attrs = void 0;

    vW < 600 ? attrs = [130, 50, 30, 95, -150, -135, rd(vW * .3), rd(-vH * .3), rd(-vW * .35), rd(-vH * .4)] : attrs = [240, 80, 30, 200, -175, -120, rd(-vW * .2), rd(-vH * .2), rd(-vW * .45), rd(-vH * .4)];

    return setNodeDimensionValues(attrs);
}

function setNodeDimensionValues(attrs) {

    nodeVars.projectRadius = attrs[0];
    nodeVars.focusRadius = attrs[1];
    nodeVars.childRadius = attrs[2];
    nodeVars.iconMenuRadius = attrs[3];

    nodeVars.expandedX = attrs[4];
    nodeVars.expandedY = attrs[5];

    nodeVars.fadeX = attrs[6];
    nodeVars.fadeY = attrs[7];

    nodeVars.cornerX = attrs[8];
    nodeVars.cornerY = attrs[9];

    return returnValueObjects();
}

function returnValueObjects() {

    return [viewVars, nodeVars];
}

// ---

// Shorthand Math.round()
function rd(val) {

    return Math.round(val);
}

// ---

},{}],6:[function(require,module,exports){
"use strict";

var _storage = require("./storage.js");

var _coordSpace = require("./coordSpace.js");

var _viewController = require("./viewController.js");

var _views = require("./views.js");

var _components = require("./components.js");

var TreeModel = require('tree-model');
// import { rootModel }             from "./rootModel.js";

var viewVars = void 0;
var nodeVars = void 0;

var tree = void 0;
var root = void 0;

$(document).ready(function () {

    initializeApp();
});

// --- Initialize ---


function initializeApp() {

    /* Module - coordSpace.js */
    // Sets Coordinate Space
    // Returns Two Attr Objects
    (0, _coordSpace.createCoordinateSpace)(coordResponse);
}

function coordResponse(varObjects) {

    viewVars = varObjects[0];
    nodeVars = varObjects[1];

    (0, _views.saveVarsToView)(viewVars, nodeVars);
    (0, _components.saveVarsToComponents)(viewVars, nodeVars);

    checkStorageForTree();
}

function checkStorageForTree() {

    var savedTree = (0, _storage.getSavedTree)();

    savedTree ? rebuildSavedTree(savedTree) : populateTreeModel();
}

function rebuildSavedTree(savedTree) {

    var obj = savedTree[0];

    tree = new TreeModel();
    root = tree.parse(obj.data);

    initializeInterface();
}

function populateTreeModel() {

    tree = new TreeModel();
    root = tree.parse(rootModel);

    initializeInterface();
}

function initializeInterface() {

    (0, _viewController.startViewController)(tree, root);
}

// -----
function testTree() {

    // Get node  id === "projects_node"
    var projectsNode = root.first(function (node) {

        return node.model.id === 'projects_node';
    });

    console.log(projectsNode);

    // Get all nodes with no children
    var leafNodes = root.all(function (node) {

        return node.children.length === 0;
    });

    console.log(leafNodes);

    // Drop node from tree, returns removed node
    projectsNode.drop();

    // Add node to tree
    var newProjectsNode = tree.parse(projectsNode);
    var oldSibling = leafNodes[0];

    oldSibling.addChild(newProjectsNode);

    // Get node's path
    var path = newProjectsNode.getPath();

    // root --> schedule_node --> projects_node
    console.log(path);
}
// -----


var rootModel = {

    id: 'meta_node',
    children: [{
        id: 'schedule_node',
        children: [{
            id: 'schedChild_node',
            children: [{
                id: 'test2_node',
                children: [],
                icon: 'summaryIcon.png',
                name: 'Level 3 Test',
                text: 'Another test child for another depth.'
            }],
            icon: 'toParentIcon.png',
            name: 'Level Two Test',
            text: 'A test child with a hidden start.'
        }],
        icon: 'scheduleIcon.png',
        name: 'Schedule Node',
        text: 'Make plans, set a timer, or save To-Dos.'
    }, {
        id: 'projects_node',
        children: [],
        icon: 'projectIcon.png',
        name: 'Projects Node',
        text: 'Always know the next step with a solid project plan.'
    }, {
        id: 'knowledge_node',
        children: [],
        icon: 'knowledgeIcon.png',
        name: 'Knowledge Node',
        text: 'Gain valuable insight on things by connecting dots.'
    }, {
        id: 'notes_node',
        children: [],
        icon: 'noteIcon.png',
        name: 'Notes Node',
        text: 'Something on your mind? Jot it down!'
    }],
    icon: 'atomIcon.png',
    name: 'Meta Node',
    text: 'This is the root node of the tree.'

};

/*

--- MODEL the DATA

        * Data Structure: Tree

            node:
                array of children
                ref to parent node Obj
                model obj

         * Data Traversal Methods:

            * Traverse Tree - Breadth First ( top down )
            * Traverse Tree - Depth First   ( bottom up )
            * Find Node ( id )
            * Find Parent
            * Find Children


--- VIEW the MODELS

        NAVIGATION VIEWS

           A) * Navigate Method ( Initial ):

                  1) takes node model as input
                  2) create  FOCUS  view for node
                  3) create  CHILD  views
                  4) create  PARENT view

           B) * Create Node Element Method

           C) * Adjust Element Style by Type ( FOCUS, CHILD,

                 - target node:     FOCUS
                 - target parent:   FADE
                 - target children: SHRINK
                 - everything else: HIDE

           D) * Place Elements

                 - FOCUS is centered
                 - parent is offset
                 - children are projected radially

            * Navigation Methods ( Secondary ):

                * clicked === CHILD

                    - FADE current FOCUS
                    - loop current CHILDREN
                        if === target
                            FOCUS
                        else
                            HIDE
                    - CHILD views for new FOCUS


                * clicked === PARENT

                    - FOCUS current FADE
                    - HIDE old FOCUS
                    - HIDE all CHILDREN
                    - CHILD views for new FOCUS


                * clicked === ROOT

                    - HIDE current FADE
                    - HIDE current FOCUS
                    - HIDE current CHILDREN

                    * Navigate Method ( Initial )

        NEW NODE VIEW

            click === space

                * New Node View

                    - Name : text_input
                    - Icon : selection menu

                    - Buttons:
                        - Save      (EDIT the MODELS)
                        - Cancel    (EDIT the MODELS)

        NODE DETAILS VIEW

            click === FOCUS

                * Node Details View

                    - Name : text
                    - Icon : image

                    - Buttons:
                        - Edit      (EDIT the MODELS)
                        - Delete    (EDIT the MODELS)


--- EDIT the MODELS

        * Data Manipulation Methods:

            * ADD NODE

                1) newNode = tree.parse( newNodeModel )

                2) parentNode.addChild( newNode )

                    ( parentNode defaults to current FOCUS )

            * REMOVE NODE

                1) nodeToDrop = Find Node ( id )

                2) nodeToDrop.drop()

            * EDIT NODE

                1) get Node to edit

                2) set node.model._attr-to-change_ = _attr-val_


--- STORE the MODELS

    * Store Tree


    * Retrieve Tree


    * Check Storage


 */

},{"./components.js":4,"./coordSpace.js":5,"./storage.js":7,"./viewController.js":8,"./views.js":9,"tree-model":3}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by jtsjordan on 7/4/17.
 */

exports.saveTree = saveTree;
exports.getSavedTree = getSavedTree;

// --- Local Storage Save/Retrieve ---


// Save to localStorage

function saveTree(tree) {

    var flatArray = [];

    flattenTree(tree);

    saveToLocalStorage(stringify(flatArray));

    // Replaces Circular References With IDs
    function flattenTree(tree) {

        tree.all(function (node) {

            var model = node.model;
            var childIDs = [];
            var parentID = void 0;

            parentID = model.id === 'meta_node' ? undefined : node.parent.model.id;

            for (var i = 0; i < node.children.length; i++) {

                var currentChild = node.children[i];

                childIDs.push(currentChild.model.id);
            }

            var flatNode = new FlatNode(model);
            flatNode.parent = parentID;
            flatNode.children = childIDs;

            flatArray.push(flatNode);
        });
    }

    // Stringify Flat Nodes
    function stringify(itemToSave) {

        return JSON.stringify(itemToSave);
    }

    // Save String to localStorage
    function saveToLocalStorage(flatTree) {

        localStorage.setItem('saved_tree', flatTree);
    }
}

// Get From localStorage
function getSavedTree() {

    // Get String From localStorage
    function getFromLocalStorage(key) {

        return parseString(localStorage.getItem(key));
    }

    // Parse Stringified Nodes
    function parseString(itemToGet) {

        return JSON.parse(itemToGet);
    }

    return getFromLocalStorage('saved_tree');
}

// -----------------------------------


// --- Flat Node Constructor ---


function FlatNode(data) {

    this.data = data;
    this.parent = null;
    this.children = [];
}

// -----------------------------

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.startSave = exports.getPanelInputValues = exports.buttonClicked = exports.nodeClicked = exports.startViewController = undefined;

var _views = require("./views.js");

var _storage = require("./storage.js");

/**
 * Created by jtsjordan on 7/4/17.
 */

exports.startViewController = startViewController;
exports.nodeClicked = nodeClicked;
exports.buttonClicked = buttonClicked;
exports.getPanelInputValues = getPanelInputValues;
exports.startSave = startSave;

//------------------------------------------------

// Background

var $space = $('.space_back');

// Depth Container
var $at_depth = $('.at_depth');
var $at_base = $('.at_component_base');
var $at_shallow = $('.at_shallow');

// Panel Container
var $panel = $('.panel_view_back');
var $panel_front = $('.panel_view_front');

// Node Containers
var $root = $('.root_node_view');
var $focus = $('.focus');
var $fade = $('.fade');

// Check for iOS Browser
var isOnIOS = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
var eventName = isOnIOS ? "pagehide" : "onbeforeunload";

console.log('iOS Browser? : ' + isOnIOS);

var tree = void 0;
var root = void 0;

// -----------------------------------------------


// Module Entry
function startViewController(mainTree, mainRoot) {

    tree = mainTree;
    root = mainRoot;

    $space.click(spaceClicked);

    (0, _views.freshRender)(root);
}

// --- Navigation Methods ---


function navigateDown(node) {

    var currentFocus = getCurrentFocus();

    // Root to CORNER?
    handleRoot(currentFocus);

    // FADE current FOCUS
    (0, _views.fadeNode)(currentFocus);

    // FOCUS node
    (0, _views.focusNode)(node);
}

function navigateUp(node) {

    // HIDE current FOCUS
    (0, _views.hideNode)($focus.children()[0]);

    // FOCUS node
    (0, _views.focusNode)(node);

    // node.parent = new FADE
    checkFocusParent($.data(node, 'model'));
}

function navigateJump(node) {

    // HIDE current FOCUS
    (0, _views.hideNode)($focus.children()[0]);

    // HIDE current FADE
    (0, _views.hideNode)($fade.children()[0]);

    // FOCUS node
    (0, _views.focusNode)(node);
}

// ----- Panel Logic -----


// Check For Open Panel
function checkPanelState(doClose, isCorner) {

    var activePanel = $panel.children()[0];

    if (activePanel && doClose) {

        closeActivePanels(activePanel, isCorner);
    }

    return $panel.children()[0];
}

// Close Active Panels Before Navigation
function closeActivePanels(panel, isCorner) {

    var panelType = $.data(panel, 'panelType');

    panelType == 'nodeDetails' ? closeNodeDetails(isCorner) : closeNodeCreation(isCorner);
}

// Close Node Details
function closeNodeDetails(isCorner) {

    hideIconSelection(true);
    (0, _views.panelRouterInterface)('hideDetails', { cornerClose: isCorner, doSave: true });
}

// Close Node Creation
function closeNodeCreation(isCorner) {

    hideIconSelection(true);
    (0, _views.panelRouterInterface)('hideNodeCreation', { cornerClose: isCorner, doSave: false });
}

// ----------------------


// ----- Icon Selection Logic -----


// Menu States

// Reveal Icon Select Menu
function showIconSelection(selections, isNewNode) {

    var timeline = new TimelineMax();

    // Alter Menu's Alignment by Panel Type
    var points = isNewNode ? (0, _views.calculateTargetCoords)(29, 12, 260) : (0, _views.calculateTargetCoords)(30, 13, 260);

    for (var i = 0; i < selections.length; i++) {

        var point = points[i];

        timeline.to(selections[i], .5, { attr: { x: point[0], y: point[1] }, autoAlpha: 1, ease: Back.easeOut }, 0 + .1 * i);
    }
}

// Hide Icon Select Menu
function hideIconSelection(doQuick) {

    var depth = $at_depth.children()[0];
    var children = $(depth).children();

    var timeline = new TimelineMax();

    var x = 0;
    for (var i = children.length - 1; i > -1; i--) {

        timeline.to(children[x], doQuick ? .1 : .25, { attr: { x: 0, y: 0 }, autoAlpha: 0, ease: Back.easeIn }, doQuick ? 0 : 0 + .1 * i);
        x++;
    }
}

// Menu Action Router

function iconToChange(selectionSVG) {

    var icon = $(selectionSVG).children()[1];
    var iconPath = $(icon).attr('xlink:href');
    var context = $.data(selectionSVG, 'context');

    context === 'creation' ? changeCreationIcon(iconPath, selectionSVG.cloneNode(true)) : changeDetailsIcon(iconPath, selectionSVG.cloneNode(true));
}

// Menu Action Routes

// Details

function changeDetailsIcon(iconPath, selClone) {

    $at_shallow.append(selClone);

    var timeline = new TimelineMax();

    // Move Selection to Target
    timeline.to(selClone, .5, { attr: { x: -175, y: 0 }, ease: Power2.easeInOut }, 0);

    // Size Selection to Target
    timeline.to($(selClone).children()[0], .5, { attr: { rx: 40, ry: 120 }, ease: Power2.easeInOut }, 0);

    // Fade Selection
    timeline.to(selClone, 1, { autoAlpha: 0 }, .5);

    timeline.call(setDetailsIconPath, [iconPath], null, .5);
    timeline.call(_views.removeElement, [selClone], null, 1);
}

function setDetailsIconPath(iconPath) {

    var detailsWidget = $panel.children()[0];
    var node = $.data(detailsWidget, 'focus');
    var icon = $(node).children()[1];

    $(icon).attr('xlink:href', iconPath);
}

// Creation

function changeCreationIcon(iconPath, selClone) {

    $at_base.append(selClone);

    var timeline = new TimelineMax();

    // Move Selection to Target
    timeline.to(selClone, .5, { attr: { x: 0, y: 0 }, ease: Power2.easeInOut }, 0);

    // Size Selection to Target
    timeline.to($(selClone).children()[0], .5, { attr: { rx: 120, ry: 120 }, ease: Power2.easeInOut }, 0);

    // Fade Selection
    timeline.to(selClone, 1, { autoAlpha: 0 }, .5);

    timeline.call(setCreationIconPath, [iconPath], null, .5);
    timeline.call(_views.removeElement, [selClone], null, 1);
}

function setCreationIconPath(iconPath) {

    var creationWidget = $panel.children()[0];
    var iconCanvas = $(creationWidget).children()[2];
    var icon = $(iconCanvas).children()[1];

    $(icon).attr('xlink:href', iconPath);

    TweenLite.set(icon, { autoAlpha: 1 });
}

// Menu Helpers

// Returns: Array of Menu Selections
function getSelections() {

    // Gather Selections
    var selection = $at_depth.children()[0];
    return $(selection).children();
}

// --------------------------------


// ----- Edit Logic -----


function setEditState(setActive) {

    setActive ? editOn() : editOff();
}

function editOn() {

    // Notify View Module
    (0, _views.panelRouterInterface)('edit', { node: getCurrentFocus() });

    // Show Menu Selection
    showIconSelection(getSelections());
}

function editOff() {

    var panel = $panel.children()[0];

    // Update Widget's Text Value
    checkTextValues(panel);

    // Update Widget's Name Value
    checkNameValues(panel);

    // Hide Menu Selection
    hideIconSelection();

    // Notify View Module
    (0, _views.panelRouterInterface)('stop_edit', { node: getCurrentFocus() });
}

// Text
function checkTextValues(panel) {

    // Panel Text / TextArea Values
    var textValue = getTextDivValue(panel);
    var textAreaValue = getTextAreaValue(panel);

    if (textValue !== textAreaValue) {

        textValue = textAreaValue;
    }

    updatePanelTextValues(panel, textValue);

    return textValue;
}

function getTextDivValue(panel) {

    // Panel Text Div
    var panelTextFO = $(panel).children()[2];
    var textDiv = $(panelTextFO).children()[0];

    return textDiv.textContent;
}

function getTextAreaValue(panel) {

    // Panel Text Area
    var panelTextAreaFO = $(panel).children()[4];
    var textArea = $(panelTextAreaFO).children()[0];

    return $(textArea).val();
}

function updatePanelTextValues(panel, textValue) {

    // Panel Text Div
    var panelTextFO = $(panel).children()[2];
    var textDiv = $(panelTextFO).children()[0];

    textDiv.textContent = textValue;
}

// Name
function checkNameValues(panel) {

    var node = getCurrentFocus();

    // Panel Text / TextArea Values
    var nameValue = getNodeTitleValue(node);
    var nameInputValue = getNameInputValue(panel);

    if (nameValue !== nameInputValue) {

        nameValue = nameInputValue;
    }

    updateNodeTitleValue(node, nameValue);

    return nameValue;
}

function getNodeTitleValue(node) {

    // Panel Text Div
    var nodeTitleFO = $(node).children()[2];
    var nameDiv = $(nodeTitleFO).children()[0];

    return nameDiv.textContent;
}

function getNameInputValue(panel) {

    // Panel Text Area
    var panelNameInputFO = $(panel).children()[5];
    var form = $(panelNameInputFO).children()[0];
    var nameInput = $(form).children()[0];

    return $(nameInput).val();
}

function updateNodeTitleValue(node, nameValue) {

    // Panel Text Div
    var nodeTitleFO = $(node).children()[2];
    var nameDiv = $(nodeTitleFO).children()[0];

    nameDiv.textContent = nameValue;
}

// ----------------------


// --- Click Handlers ---


function spaceClicked(e) {

    e.preventDefault();

    var activePanel = checkPanelState(true, false);

    if (!activePanel) {

        (0, _views.panelRouterInterface)('showNodeCreation', { node: getCurrentFocus(), fade: getCurrentFade() });
    }
}

function nodeClicked(e) {

    e.preventDefault();

    var nodeSVG = $(e.target).parent()[0];
    var action = $.data(nodeSVG, 'clickAction');

    nodeEventRouter(nodeSVG, action);
}

function buttonClicked(e) {

    e.preventDefault();

    var buttonSVG = $(e.target).parent()[0];
    var action = $.data(buttonSVG, 'clickAction');

    buttonEventRouter(buttonSVG, action);
}

// ----------------------


// ----- Routers -----


// Node Event Router
function nodeEventRouter(node, action) {

    switch (action) {

        case 'navigateDown':

            navigateDown(node);
            break;

        case 'navigateUp':

            navigateUp(node);
            break;

        case 'navigateJump':

            checkPanelState(true, true);
            navigateJump(node);
            break;

        case 'showDetails':

            $.data(node, 'clickAction', 'hideDetails');
            (0, _views.panelRouterInterface)('showDetails', { node: node, fade: getCurrentFade() });
            break;

        case 'hideDetails':

            $.data(node, 'clickAction', 'showDetails');
            hideIconSelection(true);
            (0, _views.panelRouterInterface)('hideDetails', { cornerClose: false, doSave: true });
            break;

        default:

            console.log('Unknown Event Type');

    }
}

// Button Event Router
function buttonEventRouter(button, action) {

    switch (action) {

        case 'edit':

            $.data(button, 'clickAction', 'stop_edit');
            setEditState(true);
            break;

        case 'stop_edit':

            $.data(button, 'clickAction', 'edit');
            setEditState(false);
            break;

        case 'delete':

            console.log('- DELETE PROCESS -');
            deleteNode(getCurrentFocus());
            hideIconSelection(true);
            (0, _views.panelRouterInterface)('delete', { node: getCurrentFocus() });
            break;

        case 'confirm':

            hideIconSelection(true);
            (0, _views.panelRouterInterface)('hideNodeCreation', { cornerClose: false, doSave: true });
            break;

        case 'cancel':

            hideIconSelection(true);
            (0, _views.panelRouterInterface)('hideNodeCreation', { cornerClose: false, doSave: false });
            break;

        case 'showIconSelection':
            console.log('show icon selection');
            $.data(button, 'clickAction', 'hideIconSelection');
            showIconSelection(getSelections(), true);
            break;

        case 'hideIconSelection':

            $.data(button, 'clickAction', 'showIconSelection');
            hideIconSelection();
            break;

        case 'changeIcon':

            iconToChange(button);
            break;

        default:

            console.log('Unknown Action: ' + action);

    }
}

// --------------------


// ----- Helpers -----


// Find or make node to FADE
function checkFocusParent(model) {

    if (model.isRoot()) {

        // Do Nothing, Root Has No Parent

    } else if (model.parent.isRoot()) {

        // Root is Parent, FADE it
        (0, _views.fadeNode)($root.children()[0]);
    } else {

        // Create el for FADE
        var newFade = (0, _views.createNode)(model.parent);

        // Data to alter entrance animation
        $.data(newFade, 'fromSpace', true);

        (0, _views.fadeNode)(newFade);
    }
}

// Return Current Focus Node
function getCurrentFocus() {

    var currentFocus = $focus.children();

    if (currentFocus.length > 0) {

        return currentFocus[0];
    } else {

        return $root.children()[0];
    }
}

// Return Current Fade Node
function getCurrentFade() {

    var currentFade = $fade.children();

    if (currentFade.length > 0) {

        return currentFade[0];
    } else {

        var currentFocus = getCurrentFocus();
        var _root = $root.children()[0];
        if (currentFocus == _root) {
            return 'none';
        } else {
            return _root;
        }
    }
}

// Root to CORNER ?
function handleRoot(currentFocus) {

    // Send Root to CORNER if it would be removed
    if (!$.data(currentFocus, 'root')) {

        (0, _views.cornerNode)($root.children()[0]);
    }
}

// -------------------


// ----- Model Updates -----


// Update Router
function getPanelInputValues(panel, externalComps) {

    var panelType = $.data(panel, 'panelType');

    panelType == 'nodeDetails' ? getDetailsValues(panel) : getCreationValues(panel, externalComps);
}

// Update Details

function getDetailsValues(panel) {

    var textValue = checkTextValues(panel);
    var nameValue = checkNameValues(panel);

    var node = $.data(panel, 'focus');

    // icon value
    var nodeIcon = $(node).children()[1];
    var iconPath = $(nodeIcon).attr('xlink:href');
    var iconValue = iconPath.replace('src/styles/images/', '');

    var model = $.data(node, 'model');

    updateNodeValues(model, [textValue, iconValue, nameValue]);
}

function updateNodeValues(nodeObj, values) {

    nodeObj.model.text = values[0];
    nodeObj.model.icon = values[1];
    nodeObj.model.name = values[2];

    // Save Changes If iOS
    isOnIOS ? startSave() : null;
}

// New Tree Node

function getCreationValues(panel, externalComps) {

    // Panel Components
    var comps = $(panel).children();
    var text = externalComps[0];
    var name = externalComps[1];

    // Parent Node & Model
    var parentNode = $.data(panel, 'focus');
    var parentObj = $.data(parentNode, 'model');

    // Pull Icon Path from Canvas
    var nodeIcon = $(comps[2]).children()[1];
    var iconPath = $(nodeIcon).attr('xlink:href');

    // Icon, Name, & Text Values for New Node
    var iconValue = iconPath.replace('src/styles/images/', '');
    var nameValue = $(name).find('.text_input')[0].value;
    var textValue = $(text).find('.text_input')[0].value;

    addNodeToTree(parentObj, [nameValue, iconValue, textValue]);
}

function addNodeToTree(parentObj, values) {

    var newNode = tree.parse({ id: values[0], name: values[0], icon: values[1], text: values[2] });

    parentObj.addChild(newNode);

    startSave();
}

// Delete Node
function deleteNode(focus) {

    var node = $.data(focus, 'model');
    node.drop();

    // Save Changes If iOS
    isOnIOS ? startSave() : null;
}

// -------------------------


// ----- Storage Methods -----


function startSave() {

    // console.log( "-- Save --" );

    (0, _storage.saveTree)(root);
}

// ---------------------------


// Save Data Before Window Close/Refresh
//     window.onbeforeunload = function( e ) {
//
//         let dialogText = 'Oh sheeee...';
//         startSave();
//         // e.returnValue  = dialogText;
//         // return dialogText;
//
//     };


// let isOnIOS   = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);
// let eventName = isOnIOS ? "pagehide" : "onbeforeunload";

// console.log( 'iOS? : ' + isOnIOS );
// console.log( 'Event Name: ' + eventName );

if (isOnIOS) {

    // Save Data Before Window Close/Refresh
    //     document.unload = function( e ) {
    //
    //         let dialogText = 'Oh sheeee...';
    //         alert('Triggered.');
    //         startSave();
    //         // e.returnValue  = dialogText;
    //         // return dialogText;
    //
    //     };


} else {

    // Save Data Before Window Close/Refresh
    window.onbeforeunload = function (e) {

        var dialogText = 'Oh sheeee...';
        startSave();
        // e.returnValue  = dialogText;
        // return dialogText;
    };
}

},{"./storage.js":7,"./views.js":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.calculateTargetCoords = exports.removeElement = exports.panelRouterInterface = exports.closeNodeDetailsAnimation = exports.createNode = exports.hideNode = exports.cornerNode = exports.focusNode = exports.fadeNode = exports.saveVarsToView = exports.freshRender = undefined;

var _components = require('./components.js');

var _viewController = require('./viewController.js');

exports.freshRender = freshRender; /**
                                    * Created by jtsjordan on 7/3/17.
                                    */

exports.saveVarsToView = saveVarsToView;
exports.fadeNode = fadeNode;
exports.focusNode = focusNode;
exports.cornerNode = cornerNode;
exports.hideNode = hideNode;
exports.createNode = createNode;
exports.closeNodeDetailsAnimation = closeNodeDetailsAnimation;
exports.panelRouterInterface = panelRouterInterface;
exports.removeElement = removeElement;
exports.calculateTargetCoords = calculateTargetCoords;

// Node Containers

var $root_view = $('.root_node_view');
var $focus_view = $('.focus');
var $child_view = $('.focus_children');
var $fade_view = $('.fade');

// Depth
var $at_depth = $('.at_depth');
var $at_shallow = $('.at_shallow');

// UI Components

// Gooey
var $gooeyUI = $('#gooey_ui_components');
// Normal
var $normalUI = $('#normal_ui_components');

// Panel Container
var $panel = $('.panel_view_back');

// Node Property Obj
var nVars = void 0;

// View Dimensions
var viewW = void 0;
var viewH = void 0;
var xMid = void 0;
var yMid = void 0;

// --- Initial Interface Rendering ---


// Module Entry
function freshRender(root) {

    var newNode = createNode(root);

    focusNode(newNode);
}

// -----------------------------------


// --------- Tree Navigation ---------


// FOCUS Node

function focusNode(node) {

    var nodeBack = $(node).find('.node');
    var nodeIcon = $(node).find('.node_icon');

    appendFocus(node);

    clearOldChildren();

    animateNodeFocus(node, nodeBack, nodeIcon);
}

function appendFocus(node) {

    if (!$.data(node, 'root')) {

        $focus_view.append(node);
    } else {

        $root_view.append(node);
    }

    $.data(node, 'clickAction', 'showDetails');
}

function animateNodeFocus(node, nodeBack, nodeIcon) {

    var timeline = new TimelineMax();
    var focRad = nVars.focusRadius;
    var nodeObj = $.data(node, 'model');

    var oX = Math.round(xMid - focRad / 2);
    var oY = Math.round(yMid - focRad / 2);

    timeline.to(nodeBack, .5, { attr: { rx: focRad, ry: focRad }, ease: Back.easeOut }, 0);
    timeline.to(nodeIcon, .5, { attr: { x: oX, y: oY, width: focRad, height: focRad }, ease: Back.easeOut }, 0);
    timeline.to(node, .5, { attr: { x: 0, y: 0 }, ease: Back.easeIn }, 0);
    timeline.to(node, .5, { autoAlpha: 1 }, 0);

    timeline.call(createChildNodes, [nodeObj.children], null, .5);
}

// FADE Node

function fadeNode(node) {

    var nodeBack = $(node).find('.node');
    var nodeIcon = $(node).find('.node_icon');

    clearOldFade();

    appendFade(node);

    animateNodeFade(node, nodeBack, nodeIcon);
}

function appendFade(node) {

    if ($.data(node, 'root') === false) {

        $('.fade').append(node);
    }

    $.data(node, 'clickAction', 'navigateUp');
}

function animateNodeFade(node, nodeBack, nodeIcon) {

    var timeline = new TimelineMax();

    timeline.to(nodeBack, .5, { attr: { rx: 30, ry: 30 }, ease: Back.easeOut }, 0);
    timeline.to(nodeIcon, .5, { attr: { x: xMid - 20, y: yMid - 20, width: 40, height: 40 }, ease: Back.easeOut }, 0);

    if ($.data(node, 'fromSpace')) {

        timeline.fromTo(node, .5, { attr: { x: nVars.fadeX * .5, y: nVars.fadeY * 2 } }, { attr: { x: nVars.fadeX, y: nVars.fadeY }, ease: Power2.easeIn }, 0);
        $.data(node, 'fromSpace', false);
    } else {

        timeline.to(node, .5, { attr: { x: nVars.fadeX, y: nVars.fadeY }, ease: Back.easeIn }, 0);
    }

    timeline.to(node, .5, { autoAlpha: .2 }, 0);
}

// CORNER Node

function cornerNode(node) {

    var nodeBack = $(node).find('.node');
    var nodeIcon = $(node).find('.node_icon');

    $.data(node, 'clickAction', 'navigateJump');

    animateNodeCorner(node, nodeBack, nodeIcon);
}

function animateNodeCorner(nodeSVG, nodeBack, nodeIcon) {

    var timeline = new TimelineMax();

    timeline.to(nodeBack, .5, { attr: { rx: 32, ry: 32 }, ease: Back.easeIn }, 0);
    timeline.to(nodeIcon, .5, { attr: { x: xMid - 16, y: yMid - 16, width: 32, height: 32 }, ease: Back.easeIn }, 0);
    timeline.to(nodeSVG, .5, { attr: { x: nVars.cornerX, y: nVars.cornerY }, ease: Back.easeIn }, 0);

    timeline.to(nodeSVG, .5, { autoAlpha: 1 }, .5);
}

// CHILD Node

function appendChild(node) {

    $child_view.append(node);

    $.data(node, 'clickAction', 'navigateDown');
}

function animateChildren(childNodes, coords) {

    for (var i = 0; i < childNodes.length; i++) {

        var coord = coords[i];
        var childNode = childNodes[i];

        TweenLite.to(childNode, 1, { attr: { x: coord[0], y: coord[1] }, ease: Back.easeOut });
    }
}

// HIDE  Node

function hideNode(node) {

    var nodeBack = $(node).find('.node');
    var nodeIcon = $(node).find('.node_icon');

    animateNodeRemoval(node, nodeBack, nodeIcon);
}

function clearNodes() {

    clearOldChildren();
}

function clearOldChildren() {

    var oldChildren = $child_view.children();

    if (oldChildren.length > 0) {

        for (var i = 0; i < oldChildren.length; i++) {

            hideNode(oldChildren[i]);
        }
    }
}

function clearOldFade() {

    var oldFade = $fade_view.children();

    if (oldFade.length > 0) {

        hideNode(oldFade[0]);
    }
}

function animateNodeRemoval(nodeSVG, nodeBack, nodeIcon) {

    var timeline = new TimelineMax();

    timeline.to(nodeBack, .25, { attr: { rx: 0, ry: 0 }, ease: Back.easeIn }, 0);
    timeline.to(nodeIcon, .25, { css: { scale: 0, transformOrigin: 'center' }, ease: Back.easeIn }, 0);

    timeline.call(removeElement, [nodeSVG], null, .25);
}

// -----------------------------------


// ----- ROUTER -----


function panelRouterInterface(type, props) {

    switch (type) {

        case 'showDetails':
            createDetailsView(props.node, props.fade);
            break;
        case 'hideDetails':
            closeNodeDetailsAnimation(props.cornerClose, props.doSave);
            break;
        case 'showNodeCreation':
            createNewNodeView(props.node, props.fade);
            break;
        case 'hideNodeCreation':
            closeNodeCreationAnimation(props.cornerClose, props.doSave);
            break;
        case 'close':
            closeNodeDetailsAnimation();
            break;
        case 'edit':
            detailsEditableAnimation(props.node);
            break;
        case 'stop_edit':
            detailsUneditableAnimation(props.node);
            break;
        case 'delete':
            deleteNodeAnimation(props.node);
            break;
        default:
            console.log('Unknown Router Type: ' + type);

    }
}

// ------------------


// -------- Node Details View --------


function createDetailsView(node, fade) {

    var model = $.data(node, 'model');

    // Hide Children
    clearOldChildren();

    // Create Widget
    var detailsWidget = new _components.DetailsWidget({ text: model.model.text, name: model.model.name });

    $.data(detailsWidget, 'panelType', 'nodeDetails');
    $.data(detailsWidget, 'focus', node);
    $.data(detailsWidget, 'fade', fade);

    $panel.append(detailsWidget);

    // Show Widget
    showNodeDetailsAnimation(node, fade, $(detailsWidget).children());
}

// Show/Close Node Details
function showNodeDetailsAnimation(node, fade, comps) {

    var expX = nVars.expandedX;
    var nodeTitle = $(node).children()[2];

    var textDivFO = comps[2];
    var textDiv = $(textDivFO).children()[0];

    var timeline = new TimelineMax();

    // Hide Fade
    timeline.to(fade, .25, { css: { autoAlpha: 0 }, ease: Back.easeIn }, 0);

    // Position Edit Button to Top Right and Hide
    timeline.set(comps[3], { attr: { x: 124, y: -36 }, ease: Back.easeInOut }, 0);
    timeline.set(comps[3], { css: { strokeOpacity: 0, autoAlpha: 0 } }, 0);

    // Hide Components

    // Delete Button
    timeline.set(comps[0], { autoAlpha: 0 }, 0);
    // Text Div
    //     timeline.set( comps[ 2 ], { autoAlpha: 0 }, 0 );
    // timeline.set( comps[ 2 ], { css: { scaleY: 0, transformOrigin: 'top', autoAlpha: 0 } }, 0 );
    // Text Input
    //     timeline.set( comps[ 4 ], { css: { scaleY: 0, transformOrigin: 'top' } }, 0 );


    // Name Input

    // Position
    timeline.set(comps[5], { attr: { x: xMid - 135, y: yMid - 120 } }, 0); // NameInput
    // Shrink Down
    //     timeline.set( comps[ 5 ], { css: { scaleY: 0, transformOrigin: 'bottom' } }, 0 );

    var nameInput = $(comps[5]).find('.text_input')[0];
    timeline.set(nameInput, { css: { scaleY: 1, transformOrigin: 'bottom', autoAlpha: 0 } }, 0);

    // Node to Left
    timeline.to(node, .5, { attr: { x: expX }, ease: Back.easeOut }, 0);

    // Ellipse
    timeline.to($(node).children()[0], .25, { attr: { rx: 90, ry: 50 }, ease: Back.easeOut }, 0);
    timeline.to($(node).children()[0], .5, { attr: { rx: 40, ry: 120 }, ease: Back.easeOut }, .25);

    // Icon
    timeline.to($(node).children()[1], .25, { css: { scale: .7, transformOrigin: 'center' }, ease: Back.easeOut }, 0);
    timeline.to($(node).children()[1], .25, { css: { scale: .8, transformOrigin: 'center' }, ease: Back.easeOut }, .25);

    // Title Reveal
    timeline.fromTo(nodeTitle, .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: 'left center', autoAlpha: 1 } }, .5);

    // Reveal Back Card
    timeline.fromTo(comps[1], .5, { css: { scaleY: 0, transformOrigin: 'top', autoAlpha: 0 } }, { css: { scaleY: 1, transformOrigin: 'top', autoAlpha: 1 } }, .25);

    // Show Edit Button
    timeline.to(comps[3], .5, { autoAlpha: 1 }, .5);

    // Reveal Card Text
    timeline.fromTo(textDiv, .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: 'left', autoAlpha: 1 } }, .75);

    timeline.call(iconSelectionsVisible, null, null, 1);

    function iconSelectionsVisible() {

        $('.selection_back').css('visibility', 'visible');
        $('.selection_icon').css('visibility', 'visible');
    }
}

function closeNodeDetailsAnimation(cornerClose, doSave) {

    var panelSVG = $panel.children()[0];
    var comps = $(panelSVG).children();

    var selMenu = $at_depth.children()[0];
    var node = $.data(panelSVG, 'focus');
    var fade = $.data(panelSVG, 'fade');

    var nodeTitle = $(node).children()[2];

    doSave ? (0, _viewController.getPanelInputValues)(panelSVG) : console.log('- DONT SAVE -');

    var timeline = new TimelineMax();

    timeline.to($(panelSVG).children()[1], .25, { autoAlpha: 0, ease: Sine.easeIn }, 0);
    timeline.to(nodeTitle, .25, { autoAlpha: 0, ease: Sine.easeIn }, 0);

    // Title Reveal
    timeline.to(nodeTitle, .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, 0.25);

    // Reveal Back Card
    timeline.to(comps[1], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0.25);

    // Show Edit Button
    timeline.to(comps[3], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0.25);

    // Reveal Card Text
    timeline.to(comps[2], .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0.25 } }, 0);

    // Show Fade
    timeline.to(fade, 1, { autoAlpha: .2, ease: Back.easeOut }, 1);

    !cornerClose ? timeline.call(focusNode, [node], null, .5) : null;
    timeline.call(removeElement, [panelSVG], null, .5);
    timeline.call(removeElement, [selMenu], null, .5);
}

// Toggle Edit Details States
function detailsEditableAnimation(node) {

    var panelSVG = $panel.children()[0],
        // Widget SVG
    uiComponents = $(panelSVG).children(),
        // Widget UI Component Array


    // Components

    deleteBtn = uiComponents[0],
        editBtn = uiComponents[3],
        // Edit/Delete
    textDivFO = uiComponents[2],
        textAreaFO = uiComponents[4],
        // Text Comps

    nameInput = uiComponents[5],
        nodeName = $(node).children()[2],
        // Name Comps
    nameInputEl = $(nameInput).find('.text_input')[0],
        nodeNameEl = $(nodeName).children()[0],
        // Name Input El

    editIcon = $(editBtn).children()[1],
        // Edit Icon


    // Calc Button Alpha
    deleteAlpha = getDeleteAlpha(panelSVG);

    // Animation Sequence
    var timeline = new TimelineMax();

    // Icon : Edit -> Close
    $(editIcon).attr('xlink:href', 'src/styles/images/closeIcon.png');

    // Fill/Stroke Background
    timeline.set($(deleteBtn).children()[0], { css: { fill: '#ff3e3e', stroke: '#778899', strokeWidth: 2 } }, 0);

    // Slide In
    timeline.to(deleteBtn, .5, { attr: { x: 168, y: 80 }, autoAlpha: deleteAlpha, ease: Back.easeOut }, 0);

    // Shrink Up / Expand Down
    timeline.to($(textDivFO).children()[0], .5, { css: { scaleY: 0, transformOrigin: 'center top' }, ease: Sine.easeIn }, 0.25);

    timeline.to(textAreaFO, .5, { css: { scaleY: 1, transformOrigin: 'center top', autoAlpha: 1 }, ease: Sine.easeIn }, .75);
    timeline.to($(textAreaFO).children()[0], .5, { css: { scaleY: 1, transformOrigin: 'center top', autoAlpha: 1 }, ease: Sine.easeIn }, .75);

    // Fade / Expand Up
    timeline.to(nodeName, .5, { css: { autoAlpha: 0 }, ease: Sine.easeIn }, 0);

    timeline.to(nameInput, .5, { css: { scaleY: 1, transformOrigin: 'bottom', autoAlpha: 1 }, ease: Sine.easeInOut }, .5);
    timeline.to(nameInputEl, .5, { css: { scaleY: 1, transformOrigin: 'bottom', autoAlpha: 1 } }, .5);
}

function detailsUneditableAnimation(node) {

    var panelSVG = $panel.children()[0];
    var comps = $(panelSVG).children();

    var nodeTitle = $(node).children()[2];

    var timeline = new TimelineMax();

    var editIcon = $(comps[3]).children()[1];
    $(editIcon).attr('xlink:href', 'src/styles/images/menuIcon.png');

    // Delete Button
    timeline.to(comps[0], .5, { attr: { x: 0, y: 0 }, autoAlpha: 0, ease: Back.easeIn }, 0);

    // Shrink Text Area / Expand Text Div - Top
    timeline.to($(comps[4]).children()[0], .5, { css: { scaleY: 0, transformOrigin: 'center top' }, ease: Sine.easeIn }, 0);
    timeline.to($(comps[2]).children()[0], .5, { css: { scaleY: 1, transformOrigin: 'center top' }, ease: Sine.easeIn }, .5);

    // Shrink Name Input / Expand Node Title - Left
    timeline.to(comps[5], .5, { css: { scaleY: 0, transformOrigin: 'bottom' }, ease: Sine.easeInOut }, 0);
    timeline.to(nodeTitle, .5, { css: { autoAlpha: 1 }, ease: Sine.easeIn }, .5);

    timeline.to($(comps[5]).find('.text_input')[0], .5, { css: { scaleY: 0, transformOrigin: 'center bottom' } }, 0);
}

// -----------------------------------


// -------- Add New Node View --------


function createNewNodeView(node, fade) {

    var model = $.data(node, 'model');

    // Hide Children
    clearOldChildren();

    var createNodeWidget = new _components.NodeCreationWidget({});

    $.data(createNodeWidget, 'panelType', 'nodeCreation');
    $.data(createNodeWidget, 'focus', node);
    $.data(createNodeWidget, 'fade', fade);

    $panel.append(createNodeWidget);

    newNodeCreationAnimation(node, fade, $(createNodeWidget).children());
}

// Show/Close New Node Creation
function newNodeCreationAnimation(node, fade, comps) {

    var timeline = new TimelineMax();

    var canvasSVG = comps[2];
    var canvas_back = $(canvasSVG).children()[0];
    var canvas_icon = $(canvasSVG).children()[1];

    // Hide Icon Button / Delete Button / Text / Text Input
    timeline.set(comps[0], { autoAlpha: 0 }, 0); // Confirm Button
    timeline.set(comps[1], { autoAlpha: 0 }, 0); // Cancel Button
    timeline.set(comps[3], { attr: { x: xMid - 240, y: yMid - 170, width: 240, height: 40 }, autoAlpha: 0 }, 0); // Name Text_Input
    timeline.set(comps[4], { attr: { x: xMid - 120, y: yMid + 65, width: 240, height: 40 }, autoAlpha: 0 }, 0); // Text Text_Input

    // Hide Focus/Fade
    timeline.to(fade, .25, { css: { autoAlpha: 0, pointerEvents: 'none' }, ease: Back.easeOut }, 0);
    timeline.to(node, .25, { css: { autoAlpha: 0, pointerEvents: 'none' }, ease: Back.easeOut }, 0);

    // Reveal Back Card
    timeline.to(canvasSVG, .5, { autoAlpha: 1 }, .25);
    timeline.fromTo(canvas_back, .5, { attr: { rx: 0, ry: 0 }, autoAlpha: 0 }, { attr: { rx: 120, ry: 120 }, autoAlpha: 1, ease: Back.easeOut }, .25);
    timeline.to(canvas_icon, .5, { attr: { x: xMid - 45, y: yMid - 45, width: 90, height: 90 }, autoAlpha: 0.25, ease: Back.easeOut }, .25);

    // Reveal Name Input
    timeline.fromTo(comps[3], .5, { css: { scaleX: 0, transformOrigin: "right", autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: "right", autoAlpha: 1 }, ease: Back.easeOut }, .25);
    timeline.fromTo($(comps[3]).find('.text_input')[0], .5, { css: { scaleX: 0, transformOrigin: "right", autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: "right", autoAlpha: 1 }, ease: Back.easeOut }, .25);

    // Separate non-glow elements into exterior layer
    $normalUI.append(comps[3]);

    // Separate elements that glow, but must be in front of other components
    $gooeyUI.append(comps[4]);

    // Reveal Text Input
    timeline.fromTo(comps[4], .5, { css: { scaleX: 0, scaleY: .1, transformOrigin: "left top", autoAlpha: 0 } }, { css: { scaleX: 1, transformOrigin: "left top", autoAlpha: 1 }, ease: Power2.easeInOut }, .75);
    timeline.to(comps[4], .5, { css: { scaleY: 1, transformOrigin: 'top' }, ease: Back.easeOut }, 1.25);

    // Reveal Confirm / Cancel Buttons
    timeline.to(comps[0], .5, { attr: { x: 240, y: 70 }, autoAlpha: 1 }, .5);
    timeline.to(comps[1], .5, { attr: { x: 210, y: 100 }, autoAlpha: 1 }, .5);

    timeline.call(iconSelectionsVisible, null, null, 1);

    function iconSelectionsVisible() {

        $('.selection_back').css('visibility', 'visible');
        $('.selection_icon').css('visibility', 'visible');
    }
}

function closeNodeCreationAnimation(cornerClose, doSave) {

    var panelSVG = $panel.children()[0];
    var gooeyUI = $gooeyUI.children()[0]; // Text Input
    var normalUI = $normalUI.children()[0]; // Name Input

    var comps = $(panelSVG).children();

    var selMenu = $at_depth.children()[0];
    var node = $.data(panelSVG, 'focus');
    var fade = $.data(panelSVG, 'fade');

    var nodeTitle = $(node).children()[2];

    doSave ? (0, _viewController.getPanelInputValues)(panelSVG, [gooeyUI, normalUI]) : console.log('- DONT SAVE -');

    var timeline = new TimelineMax();

    // Temporary solution for hiding the creation panel
    timeline.to(panelSVG, .5, { autoAlpha: 0 }, 0);
    timeline.to(gooeyUI, .5, { autoAlpha: 0 }, 0);
    timeline.to(normalUI, .5, { autoAlpha: 0 }, 0);

    // Re-enable Pointer Events for Focus/Fade
    timeline.to(fade, .25, { css: { pointerEvents: 'all' } }, .5);
    timeline.to(node, .25, { css: { pointerEvents: 'all' } }, .5);

    // Title Reveal
    //     timeline.to( nodeTitle, .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, 0 );

    // Reveal Back Card
    //     timeline.to( comps[ 1 ], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0 );
    //
    // // Show Edit Button
    //     timeline.to( comps[ 3 ], .5, { css: { scaleX: 0, transformOrigin: 'left', autoAlpha: 0 } }, 0 );
    //
    // // Reveal Card Text
    //     timeline.to( comps[ 2 ], .5, { css: { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 } }, 0 );
    //
    // // Show Fade
    //     timeline.to( fade, 1, { autoAlpha: .2, ease: Back.easeOut }, 1 );


    // Call focusNode unless the corner node triggered this update
    !cornerClose ? timeline.call(focusNode, [node], null, .5) : null;

    // Unhide the fade node if it exists
    fade !== 'none' ? timeline.to(fade, 1, { autoAlpha: .2 }, .5) : null;

    timeline.call(removeElement, [panelSVG], null, .5);
    timeline.call(removeElement, [gooeyUI], null, .5);
    timeline.call(removeElement, [normalUI], null, .5);
    timeline.call(removeElement, [selMenu], null, .5);
}

// -----------------------------------


// ------ Delete Node Animation ------


function deleteNodeAnimation() {

    // Panel / Delete Button
    var panelSVG = $panel.children()[0];
    var deleteBtn = $(panelSVG).children()[0];

    // Focus / Fade
    var node = $.data(panelSVG, 'focus');
    var fade = $.data(panelSVG, 'fade');

    // Icon Selection Menu
    var selMenu = $at_depth.children()[0];

    var timeline = new TimelineMax();

    // Remove Delete Button Icon
    removeElement($(deleteBtn).children()[1]);

    // Remove Delete Button from Panel
    $at_depth.append(deleteBtn);

    // Shallow Portion of Hole, Covers "Sucked In" Objects
    var blackRect = (0, _components.blackHoleRect)();
    $normalUI.append(blackRect);

    // Reskin Buttons to Black Hole
    timeline.to($(deleteBtn).children()[0], .25, { css: { fill: '#000000', stroke: '#bcffca', strokeWidth: 2, pointerEvents: 'none' } }, 0);

    // Move Hole Right
    timeline.to(deleteBtn, .5, { attr: { x: 190, y: 0 }, ease: Back.easeOut }, 0);

    // Stretch Hole
    timeline.to($(deleteBtn).children()[0], .5, { attr: { ry: 180 }, ease: Back.easeOut }, 0);

    // Wrap Panel in Group
    var panelWrapper = wrapPanelComponents(panelSVG, node);

    // 'Suck' Panel into Hole
    timeline.to(panelWrapper, .5, { x: 50, ease: Sine.easeIn }, 0);
    timeline.to(panelWrapper, .5, { scaleX: 0, scaleY: 0.7, transformOrigin: 'right center', ease: Sine.easeIn }, 0.25);

    timeline.to($(panelSVG).children()[4], .25, { autoAlpha: 0, ease: Sine.easeIn }, 0);
    timeline.to($(panelSVG).children()[3], .25, { autoAlpha: 0, ease: Sine.easeIn }, 0);

    // // Hide Black Rect
    timeline.set(blackRect, { autoAlpha: 0 }, .65);

    // Shrink Hole
    timeline.to($(deleteBtn).children()[0], .5, { attr: { rx: 0, ry: 0 }, ease: Back.easeIn }, .65); // 1

    timeline.call(removeElement, [deleteBtn], null, 1.25);
    timeline.call(removeElement, [panelWrapper], null, 1.25);
    timeline.call(removeElement, [selMenu], null, 1.25);
    timeline.call(removeElement, [blackRect], null, 1.25);

    timeline.call(focusNode, [fade], null, 1.25);
}

function wrapPanelComponents(panelSVG, node) {

    var attr = { id: "panel_wrapper" };
    var group = (0, _components.createGroup)(attr);

    $panel.append(group);

    group.append(panelSVG);
    group.append(node);

    return group;
}

// -----------------------------------


// ------ Node Element Creation ------


// Create Child Nodes
function createChildNodes(nodes) {

    var childNodes = [];

    for (var i = 0; i < nodes.length; i++) {

        var childNode = createNode(nodes[i]);

        appendChild(childNode);
        childNodes.push(childNode);
    }

    getChildDestinations(childNodes);
}

// Create Node
function createNode(nodeObj) {

    var nodeEl = createNodeEl(nodeObj);

    bindData(nodeEl, nodeObj);

    return nodeEl;
}

function createNodeEl(nodeObj) {

    return new _components.EllipseButton({

        class: 'node_group',
        id: nodeObj.model.id,
        cx: xMid,
        cy: yMid,
        rx: nVars.childRadius,
        ry: nVars.childRadius,
        name: nodeObj.model.name,
        text: nodeObj.model.text,
        icon: nodeObj.model.icon,
        imgURL: nodeObj.model.imgURL }, _viewController.nodeClicked);
}

function bindData(el, obj) {

    $.data(el, 'root', obj.isRoot());
    $.data(el, 'model', obj);
}

// -----------------------------------


// ------ Node Element Removal -------

function removeElements(els) {

    for (var i = 0; i < els.length; i++) {
        removeElement(els[i]);
    }
}

function removeElement(el) {

    $(el).unbind();
    $(el).remove();
}

// -----------------------------------


// ---------- Helpers -----------


// Save dimension vars from initialization to this module
function saveVarsToView(viewVars, nodeVars) {

    nVars = nodeVars;

    viewW = viewVars.viewWidth;
    viewH = viewVars.viewHeight;
    xMid = viewVars.xMid;
    yMid = viewVars.yMid;
}

// Get Child Destination Coords
function getChildDestinations(childNodes) {

    var coordArray = calculateTargetCoords(childNodes.length, 0, nVars.projectRadius);

    animateChildren(childNodes, coordArray);
}

// Returns Array of Points Around a Circle
function calculateTargetCoords(totalPoints, iStart, radius) {

    var pointArray = [];

    for (var i = iStart; i < totalPoints; i++) {

        var coord = getPoint(radius, i, totalPoints); // i + rotationFactor

        pointArray.push(coord);
    }

    return pointArray;
}

// Returns Coordinate Pair
function getPoint(radius, currentPoint, totalPoints) {

    var theta = Math.PI * 2 / totalPoints;
    var angle = theta * currentPoint;

    var x = Math.round(radius * Math.cos(angle)); // + xMid;
    var y = Math.round(radius * Math.sin(angle)); // + yMid;

    return [x, y];
}

// Get Delete Alpha
function getDeleteAlpha(panelSVG) {

    var focus = $.data(panelSVG, 'focus');
    var model = $.data(focus, 'model');

    return model.isRoot() ? 0 : 1;
}

// -----------------------------------


// ------ Touch Event Processing -----


// -----------------------------------

},{"./components.js":4,"./viewController.js":8}]},{},[6]);
