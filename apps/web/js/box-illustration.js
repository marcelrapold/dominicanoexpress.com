// node_modules/@elchininet/isometric/esm/index.js
var t = "http://www.w3.org/2000/svg";
var e;
var i;
!(function(t2) {
  t2.svg = "svg", t2.group = "g", t2.path = "path", t2.rect = "rect", t2.text = "text", t2.tspan = "tspan", t2.pattern = "pattern", t2.image = "image", t2.animate = "animate", t2.animateTransform = "animateTransform";
})(e || (e = {})), (function(t2) {
  t2.viewBox = "viewBox";
})(i || (i = {}));
Math.sqrt(3).toFixed(6);
var s = +(Math.sqrt(3) / 2).toFixed(6);
var n = "(-?\\d+(?:\\.\\d+)?|-?\\.\\d+)";
var r = "\\s*";
var o = "\\s+";
var h = `${n}${o}${n}${o}${n}`;
var a = new RegExp(`(?:(M|L)${r}${h}${r}|(C)${r}${`${h}${o}${h}`})${r}`, "g");
var l = Math.sqrt(1.5);
var d = Math.PI / 3;
var c = Math.PI / 4;
var p = Math.atan(Math.SQRT2);
var u;
var m;
var g;
var f;
var x;
var _;
var v;
var y;
var E;
!(function(t2) {
  t2.white = "white", t2.black = "black";
})(u || (u = {})), (function(t2) {
  t2.butt = "butt", t2.square = "square", t2.round = "round";
})(m || (m = {})), (function(t2) {
  t2.miter = "miter", t2.round = "round", t2.bevel = "bevel";
})(g || (g = {})), (function(t2) {
  t2.move = "move", t2.line = "line", t2.curve = "curve";
})(f || (f = {})), (function(t2) {
  t2.FRONT = "FRONT", t2.SIDE = "SIDE", t2.TOP = "TOP";
})(x || (x = {})), (function(t2) {
  t2.RIGHT = "RIGHT", t2.LEFT = "LEFT", t2.TOP = "TOP";
})(_ || (_ = {})), (function(t2) {
  t2.BOOLEAN = "boolean", t2.UNDEFINED = "undefined", t2.NUMBER = "number", t2.STRING = "string";
})(v || (v = {})), (function(t2) {
  t2.MOUSE_MOVE = "mousemove", t2.MOUSE_DOWN = "mousedown", t2.MOUSE_UP = "mouseup", t2.TOUCH_START = "touchstart", t2.TOUCH_MOVE = "touchmove", t2.TOUCH_END = "touchend";
})(y || (y = {})), (function(t2) {
  t2.CENTER = "center", t2.LEFT = "left", t2.RIGHT = "right", t2.TOP = "top", t2.BOTTOM = "bottom";
})(E || (E = {}));
var b = (t2, e2) => {
  const i2 = Math.pow(10, e2);
  return Math.round(t2 * i2) / i2;
};
var O = (t2) => ({ sin: b(Math.sin(t2), 6), cos: b(Math.cos(t2), 6) });
var C = (t2, e2) => ({ x: t2.x - e2.x, y: t2.y - e2.y });
var w = (t2, e2) => {
  const i2 = C(t2, e2);
  return Math.sqrt(Math.pow(i2.x, 2) + Math.pow(i2.y, 2));
};
var T = (t2, e2, i2) => ({ x: t2.x + Math.cos(e2) * i2, y: t2.y + Math.sin(e2) * i2 });
var S = (t2, e2) => {
  const i2 = C(e2, t2);
  return Math.atan2(i2.y, i2.x);
};
var k = (t2, e2, i2, n2) => ({ x: b(t2 + (i2.r - i2.l) * n2 * s, 6), y: b(e2 + ((i2.r + i2.l) / 2 - i2.t) * n2, 6) });
var A = (t2, e2, i2) => {
  const s2 = C(e2, t2), n2 = { x: t2.x + s2.x / 2, y: t2.y + s2.y / 2 }, r2 = ((t3, e3, i3) => {
    const s3 = C(t3, e3), n3 = s3.x * Math.cos(i3) - s3.y * Math.sin(i3), r3 = s3.x * Math.sin(i3) + s3.y * Math.cos(i3);
    return { x: e3.x + n3, y: e3.y + r3 };
  })(e2, n2, Math.PI / 2), o2 = { x: r2.x + (i2.x - r2.x) / 2, y: r2.y + (i2.y - r2.y) / 2 }, h2 = w(o2, n2), a2 = T(o2, S(o2, r2), h2), l2 = T(o2, S(o2, i2), h2);
  return [b(w(i2, a2), 6), b(w(i2, l2), 6), b(180 * S(n2, l2) / Math.PI, 6)];
};
var $ = () => Array.from(Array(3)).map(() => Math.random().toString(16).slice(2)).join("-");
var M = (t2, e2) => t2.map((i2, s2) => e2[0].map((n2, r2) => i2.reduce((i3, n3, o2) => i3 + t2[s2][o2] * e2[o2][r2], 0)));
var N = (...t2) => {
  let e2 = t2[0];
  for (let i2 = 1; i2 < t2.length; i2++) e2 = M(e2, t2[i2]);
  return e2;
};
var P = (t2) => {
  const e2 = O(t2);
  return [[1, 0, 0], [0, e2.cos, -e2.sin], [0, e2.sin, e2.cos]];
};
var I = (t2) => {
  const e2 = O(t2);
  return [[e2.cos, 0, e2.sin], [0, 1, 0], [-e2.sin, 0, e2.cos]];
};
var j = (t2) => {
  const e2 = O(t2);
  return [[e2.cos, -e2.sin, 0], [e2.sin, e2.cos, 0], [0, 0, 1]];
};
var D = N(P(p), j(-c));
var R = N(j(-d), P(p), j(c));
var L = N(j(d), P(p), j(-c));
var B = (t2, e2) => {
  const i2 = e2.value * Math.PI / 180;
  switch (t2) {
    case x.TOP:
      switch (e2.axis) {
        case _.TOP:
          return j(i2);
        case _.LEFT:
          return P(-i2);
        case _.RIGHT:
          return I(i2);
        default:
          return null;
      }
    case x.FRONT:
      switch (e2.axis) {
        case _.TOP:
          return I(i2);
        case _.LEFT:
          return P(i2);
        case _.RIGHT:
          return j(i2);
        default:
          return null;
      }
    case x.SIDE:
      switch (e2.axis) {
        case _.TOP:
          return I(i2);
        case _.LEFT:
          return j(i2);
        case _.RIGHT:
          return P(-i2);
        default:
          return null;
      }
    default:
      return null;
  }
};
var F = (t2) => typeof t2 === v.NUMBER;
var V = (t2) => typeof t2 === v.UNDEFINED;
var U = (t2) => "values" in t2;
var G = (t2, e2) => {
  Object.keys(e2).forEach((i2) => {
    t2.setAttributeNS(null, i2, e2[i2]);
  });
};
var z = (t2) => 0 === t2.length || t2[0].command === f.move ? [...t2] : [{ command: f.move, point: { r: 0, l: 0, t: 0 } }, ...t2];
var X = (t2, e2, i2, s2, n2) => {
  const r2 = z(t2).map((n3, r3) => {
    const o2 = k(e2, i2, n3.point, s2);
    switch (n3.command) {
      case f.move:
        return `M${o2.x} ${o2.y}`;
      case f.line:
        return `L${o2.x} ${o2.y}`;
      case f.curve: {
        const d2 = k(e2, i2, t2[r3 - 1].point, s2), c2 = k(e2, i2, n3.control, s2), p2 = A(d2, o2, c2), u2 = (h2 = d2, l2 = o2, ((a2 = c2).y - h2.y) * (l2.x - a2.x) - (a2.x - h2.x) * (l2.y - a2.y) >= 0 ? 0 : 1);
        return `A ${p2[0]} ${p2[1]} ${p2[2]} 0 ${u2} ${o2.x} ${o2.y}`;
      }
    }
    var h2, a2, l2;
  });
  if (r2.length) {
    const t3 = n2 ? "z" : "";
    return `${r2.join(" ").trim()}${t3}`;
  }
  return "";
};
var W = (t2, e2, i2, s2) => {
  t2.forEach((t3) => {
    t3.point.r += e2, t3.point.l += i2, t3.point.t += s2, t3.control && (t3.control.r += e2, t3.control.l += i2, t3.control.t += s2);
  });
};
var Y = (t2) => ["fillColor", "fillOpacity", "strokeColor", "strokeOpacity", "strokeWidth"].includes(t2);
function q(t2, e2, i2, s2, n2) {
  const r2 = { fn: s2, fnBind: s2.bind(this) };
  e2.push(r2), t2.addEventListener(i2, r2.fnBind, n2);
}
var Q = (t2, e2, i2, s2) => {
  const n2 = ((t3, e3) => {
    const i3 = [], s3 = e3 ? B(t3, e3) : null;
    switch (s3 && i3.push(s3), t3) {
      case x.TOP:
        return N(D, ...i3);
      case x.FRONT:
        return N(R, ...i3);
      case x.SIDE:
        return N(L, ...i3);
    }
    return null;
  })(e2, s2);
  let r2 = `translate(${t2.x} ${t2.y})`;
  if (n2) {
    r2 += ` matrix(${b(n2[0][0], 6)},${b(n2[1][0], 6)},${b(n2[0][1], 6)},${b(n2[1][1], 6)},0,0)`, r2 += ` scale(${b(l * (i2 || 1), 6)})`;
  } else i2 && (r2 += ` scale(${b(i2, 6)})`);
  return r2;
};
var J = (t2) => !!t2.parentNode && ("SVGSVGElement" === t2.parentNode.constructor.name || J(t2.parentNode));
var K = (t2, e2, i2) => {
  let s2;
  const n2 = (s3) => t2(i2 ? Object.assign(Object.assign({}, i2), { [e2.property]: +s3 }) : s3);
  return s2 = U(e2) ? Array.isArray(e2.values) ? { values: e2.values.map((t3) => n2(t3)).join(";") } : { values: n2(e2.values) } : { from: n2(e2.from), to: n2(e2.to) }, s2;
};
var Z = class {
  constructor(t2, e2, i2) {
    this.sizes = { centerX: t2 / 2, centerY: e2 / 2, height: e2, width: t2, scale: i2 };
  }
  get width() {
    return this.sizes.width;
  }
  set width(t2) {
    this.sizes.width = t2, this.sizes.centerX = t2 / 2;
  }
  get height() {
    return this.sizes.height;
  }
  set height(t2) {
    this.sizes.height = t2, this.sizes.centerY = t2 / 2;
  }
  get scale() {
    return this.sizes.scale;
  }
  set scale(t2) {
    this.sizes.scale = t2;
  }
  get centerX() {
    return this.sizes.centerX;
  }
  get centerY() {
    return this.sizes.centerY;
  }
};
var tt = class {
  get data() {
    return this.dataStore;
  }
  set data(t2) {
    this.dataStore = t2;
  }
};
var et = class extends tt {
  constructor(e2, i2) {
    super(), this._id = e2, this.listeners = [], this.element = document.createElementNS(t, i2), G(this.element, { id: this._id });
  }
  setId(t2) {
    this._id = t2, G(this.element, { id: this._id });
  }
  getElement() {
    return this.element;
  }
  addEventListener(t2, e2, i2 = false) {
    return q.call(this, this.element, this.listeners, t2, e2, i2), this;
  }
  removeEventListener(t2, e2, i2 = false) {
    return (function(t3, e3, i3, s2, n2) {
      const r2 = e3.find((t4) => t4.fn === s2);
      r2 && (e3.splice(e3.indexOf(r2), 1), t3.removeEventListener(i3, r2.fnBind, n2));
    })(this.element, this.listeners, t2, e2, i2), this;
  }
};
function it(t2, e2) {
  var i2 = {};
  for (var s2 in t2) Object.prototype.hasOwnProperty.call(t2, s2) && e2.indexOf(s2) < 0 && (i2[s2] = t2[s2]);
  if (null != t2 && "function" == typeof Object.getOwnPropertySymbols) {
    var n2 = 0;
    for (s2 = Object.getOwnPropertySymbols(t2); n2 < s2.length; n2++) e2.indexOf(s2[n2]) < 0 && Object.prototype.propertyIsEnumerable.call(t2, s2[n2]) && (i2[s2[n2]] = t2[s2[n2]]);
  }
  return i2;
}
var st = { fillColor: u.white, fillOpacity: 1, strokeColor: u.black, strokeDashArray: [], strokeLinecap: m.butt, strokeLinejoin: g.round, strokeOpacity: 1, strokeWidth: 1 };
var nt = class extends et {
  constructor(t2, e2) {
    super(t2.id || $(), e2), this.props = Object.assign(Object.assign({}, st), t2), this.animations = [], this.props.texture && this.createTexture(this.props.texture), G(this.element, Object.assign({ fill: this.props.texture ? `url(#${this.patternId}) ${this.fillColor}` : this.fillColor, "fill-opacity": `${this.fillOpacity}`, stroke: this.strokeColor, "stroke-dasharray": this.strokeDashArray.join(" "), "stroke-linecap": this.strokeLinecap, "stroke-linejoin": this.strokeLinejoin, "stroke-opacity": `${this.strokeOpacity}`, "stroke-width": `${this.strokeWidth}` }, this.props.className && { class: this.props.className }));
  }
  createTexture(i2) {
    this.patternId = `${this.id}__texture`, this.pattern = document.createElementNS(t, e.pattern), G(this.pattern, { id: this.patternId, preserveAspectRatio: "none", patternUnits: "userSpaceOnUse" });
    const s2 = document.createElementNS(t, e.image);
    G(s2, { href: i2.url, x: "0", y: "0", preserveAspectRatio: "none" }), i2.pixelated && G(s2, { style: "image-rendering: pixelated" }), this.pattern.appendChild(s2);
  }
  _updateTexture() {
    const t2 = this.pattern.firstChild;
    this.props.texture.url && t2.getAttribute("href") !== this.props.texture.url && G(t2, { href: this.props.texture.url }), this.props.texture.pixelated ? G(t2, { style: "image-rendering: pixelated" }) : t2.removeAttribute("style"), this.update();
  }
  addAnimationBasicProperties(t2, e2) {
    G(e2.element, { repeatCount: `${e2.repeat || "indefinite"}`, attributeName: t2, dur: `${e2.duration || 1}s` });
  }
  updateAnimations() {
    this.animations.forEach((i2) => {
      if (Y(i2.property)) {
        const s2 = ((t2) => ({ fillColor: "fill", fillOpacity: "fill-opacity", strokeColor: "stroke", strokeOpacity: "stroke-opacity", strokeWidth: "stroke-width" })[t2])(i2.property);
        i2.element = document.createElementNS(t, e.animate), this.element.appendChild(i2.element), this.addAnimationBasicProperties(s2, i2);
        const n2 = K((t2) => `${t2}`, i2);
        G(i2.element, n2);
      }
    }), this.updateSubClassAnimations();
  }
  updatePatternTransform(t2, e2) {
    var i2, s2, n2, r2;
    if (this.props.texture) {
      const o2 = this.props.texture.height ? "" + this.props.texture.height * this.data.scale : "100%", h2 = this.props.texture.width ? "" + this.props.texture.width * this.data.scale : "100%", a2 = k(0, 0, { r: (null === (i2 = this.props.texture.shift) || void 0 === i2 ? void 0 : i2.right) || 0, l: (null === (s2 = this.props.texture.shift) || void 0 === s2 ? void 0 : s2.left) || 0, t: (null === (n2 = this.props.texture.shift) || void 0 === n2 ? void 0 : n2.top) || 0 }, this.data.scale), l2 = Q({ x: b(t2.x + a2.x, 6), y: b(t2.y + a2.y, 6) }, null !== (r2 = this.props.texture.planeView) && void 0 !== r2 ? r2 : e2, this.props.texture.scale, this.props.texture.rotation);
      G(this.pattern, { patternTransform: l2, height: o2, width: h2 }), G(this.pattern.firstChild, { height: o2, width: h2 });
    }
  }
  get id() {
    return this._id;
  }
  set id(t2) {
    this.setId(t2), this.pattern && (this.patternId = `${this.id}__texture`, G(this.pattern, { id: this.patternId }));
  }
  get fillColor() {
    return this.props.fillColor;
  }
  set fillColor(t2) {
    this.props.fillColor = t2, G(this.element, { fill: this.props.texture ? `url(#${this.patternId}) ${this.fillColor}` : this.fillColor });
  }
  get fillOpacity() {
    return this.props.fillOpacity;
  }
  set fillOpacity(t2) {
    this.props.fillOpacity = t2, G(this.element, { "fill-opacity": `${this.fillOpacity}` });
  }
  set texture(t2) {
    const e2 = !!this.props.texture;
    this.props.texture = t2, e2 ? this._updateTexture() : (this.createTexture(this.props.texture), this.update());
  }
  get texture() {
    return this.props.texture;
  }
  get strokeColor() {
    return this.props.strokeColor;
  }
  set strokeColor(t2) {
    this.props.strokeColor = t2, G(this.element, { stroke: this.strokeColor });
  }
  get strokeDashArray() {
    return this.props.strokeDashArray;
  }
  set strokeDashArray(t2) {
    this.props.strokeDashArray = t2, G(this.element, { "stroke-dasharray": this.strokeDashArray.join(" ") });
  }
  get strokeLinecap() {
    return this.props.strokeLinecap;
  }
  set strokeLinecap(t2) {
    this.props.strokeLinecap = m[t2], G(this.element, { "stroke-linecap": this.strokeLinecap });
  }
  get strokeLinejoin() {
    return this.props.strokeLinejoin;
  }
  set strokeLinejoin(t2) {
    this.props.strokeLinejoin = g[t2], G(this.element, { "stroke-linejoin": this.strokeLinejoin });
  }
  get strokeOpacity() {
    return this.props.strokeOpacity;
  }
  set strokeOpacity(t2) {
    this.props.strokeOpacity = t2, G(this.element, { "stroke-opacity": `${this.strokeOpacity}` });
  }
  get strokeWidth() {
    return this.props.strokeWidth;
  }
  set strokeWidth(t2) {
    this.props.strokeWidth = t2, G(this.element, { "stroke-width": `${this.strokeWidth}` });
  }
  get className() {
    var t2;
    return null !== (t2 = this.props.className) && void 0 !== t2 ? t2 : "";
  }
  set className(t2) {
    this.props.className = t2, G(this.element, { class: this.props.className });
  }
  getPattern() {
    return this.pattern;
  }
  updateTexture(t2) {
    const e2 = !!this.props.texture;
    if (e2 || t2.url) {
      const { shift: i2, rotation: s2 } = t2, n2 = it(t2, ["shift", "rotation"]);
      this.props.texture = e2 ? Object.assign(Object.assign({}, this.props.texture), n2) : Object.assign({}, n2), i2 && (this.props.texture.shift = Object.assign(Object.assign({}, this.props.texture.shift || {}), i2)), s2 && (this.props.texture.rotation = s2), e2 ? this._updateTexture() : (this.createTexture(this.props.texture), this.update());
    }
    return this;
  }
  addAnimation(t2) {
    return this.animations.push(Object.assign({}, t2)), this.update(), this;
  }
  removeAnimationByIndex(t2) {
    if (t2 >= 0 && t2 < this.animations.length) {
      const e2 = this.animations.splice(t2, 1)[0];
      e2.element && e2.element.parentNode && e2.element.parentNode.removeChild(e2.element);
    }
    return this;
  }
  removeAnimations() {
    return this.animations.splice(0).forEach((t2) => {
      t2.element && t2.element.parentNode && t2.element.parentNode.removeChild(t2.element);
    }), this;
  }
};
var rt = class extends et {
  constructor(t2, e2) {
    super(t2, e2), this._children = [];
  }
  getChildIndex(t2) {
    return this._children.indexOf(t2);
  }
  throwChildError() {
    throw new Error("You cannot provide a child that is not a children of the container");
  }
  removeSVGChild(t2) {
    const e2 = t2.getElement();
    if (t2 instanceof nt) {
      const e3 = t2.getPattern();
      e3 && e3.parentNode && this.element.removeChild(e3);
    }
    e2.parentNode && this.element.removeChild(e2);
  }
  insertPattern(t2) {
    t2 && this.element.insertBefore(t2, this.element.firstChild);
  }
  get id() {
    return this._id;
  }
  set id(t2) {
    this.setId(t2);
  }
  get children() {
    return this._children;
  }
  update() {
    return J(this.element) && this._children.forEach((t2) => {
      t2.data = this.data, t2.update();
    }), this;
  }
  clear() {
    return this._children.splice(0).forEach((t2) => {
      this.removeSVGChild(t2);
    }), this;
  }
  addChild(t2) {
    return t2.data = this.data, this._children.push(t2), t2 instanceof nt && this.insertPattern(t2.getPattern()), this.element.appendChild(t2.getElement()), t2.update(), this;
  }
  addChildren(...t2) {
    return t2.forEach((t3) => this.addChild(t3)), this;
  }
  getChildByIndex(t2) {
    return this._children[t2] || null;
  }
  getChildById(t2) {
    return this._children.find((e2) => e2.id === t2) || null;
  }
  removeChild(t2) {
    const e2 = this.getChildIndex(t2);
    if (e2 > -1) return this._children.splice(e2, 1), this.removeSVGChild(t2), this;
    this.throwChildError();
  }
  removeChildren(...t2) {
    return t2.forEach((t3) => {
      -1 === this.getChildIndex(t3) && this.throwChildError(), this.removeChild(t3);
    }), this;
  }
  removeChildByIndex(t2) {
    if (t2 >= 0 && t2 < this._children.length) {
      const [e2] = this._children.splice(t2, 1);
      this.removeSVGChild(e2);
    }
    return this;
  }
  removeChildById(t2) {
    const e2 = this.getChildById(t2);
    return e2 && this.removeChild(e2), this;
  }
  setChildIndex(t2, e2) {
    const i2 = this.getChildIndex(t2);
    if (i2 > -1) {
      e2 = Math.min(Math.max(0, e2), this._children.length - 1);
      const s2 = t2.getElement(), n2 = this._children[e2].getElement();
      return this._children[e2] !== t2 && (this._children.splice(i2, 1), this._children.splice(e2, 0, t2), i2 > e2 ? this.element.insertBefore(s2, n2) : n2.nextSibling ? this.element.insertBefore(s2, n2.nextSibling) : this.element.appendChild(s2)), this;
    }
    this.throwChildError();
  }
  bringChildToFront(t2) {
    if (this.getChildIndex(t2) > -1) return this.setChildIndex(t2, this._children.length - 1), this;
    this.throwChildError();
  }
  bringChildForward(t2) {
    const e2 = this.getChildIndex(t2);
    if (e2 > -1) return this.setChildIndex(t2, e2 + 1), this;
    this.throwChildError();
  }
  sendChildToBack(t2) {
    if (this.getChildIndex(t2) > -1) return this.setChildIndex(t2, 0), this;
    this.throwChildError();
  }
  sendChildBackward(t2) {
    const e2 = this.getChildIndex(t2);
    if (e2 > -1) return this.setChildIndex(t2, e2 - 1), this;
    this.throwChildError();
  }
};
var ot = { container: "body", backgroundColor: u.white, scale: 1, height: 480, width: 640 };
var ht = class extends rt {
  constructor(s2 = {}) {
    super(s2.id || $(), e.svg), this.props = Object.assign(Object.assign({}, ot), s2), this.isAnimated = true, this.data = new Z(this.props.width, this.props.height, this.props.scale), G(this.element, { [i.viewBox]: `0 0 ${this.data.width} ${this.data.height}`, width: `${this.data.width}px`, height: `${this.data.height}px` }), this.background = document.createElementNS(t, e.rect), G(this.background, { fill: this.backgroundColor, x: "0", y: "0", width: `${this.data.width}px`, height: `${this.data.height}px` }), this.element.appendChild(this.background);
    const n2 = typeof this.props.container === v.STRING ? document.querySelector(this.props.container) : this.props.container;
    n2 && n2.appendChild(this.element);
  }
  get backgroundColor() {
    return this.props.backgroundColor;
  }
  set backgroundColor(t2) {
    this.props.backgroundColor = t2, G(this.background, { fill: this.backgroundColor });
  }
  get scale() {
    return this.data.scale;
  }
  set scale(t2) {
    this.data.scale = t2, this.update();
  }
  get height() {
    return this.data.height;
  }
  set height(t2) {
    this.data.height = t2, G(this.element, { [i.viewBox]: `0 0 ${this.data.width} ${this.data.height}`, height: `${this.data.height}px` }), G(this.background, { height: `${this.data.height}px` }), this.update();
  }
  get width() {
    return this.data.width;
  }
  set width(t2) {
    this.data.width = t2, G(this.element, { [i.viewBox]: `0 0 ${this.data.width} ${this.data.height}`, width: `${this.data.width}px` }), G(this.background, { width: `${this.data.width}px` }), this.update();
  }
  get animated() {
    return this.isAnimated;
  }
  getSVGCode() {
    return this.element.outerHTML;
  }
  pauseAnimations() {
    const t2 = this.element;
    return "function" == typeof t2.pauseAnimations && t2.pauseAnimations(), this.isAnimated = false, this;
  }
  resumeAnimations() {
    const t2 = this.element;
    return "function" == typeof t2.unpauseAnimations && t2.unpauseAnimations(), this.isAnimated = true, this;
  }
};
var at = (t2, e2) => {
  Object.getOwnPropertyNames(e2.prototype).forEach((i2) => {
    Object.defineProperty(t2.prototype, i2, Object.getOwnPropertyDescriptor(e2.prototype, i2));
  });
};
var lt = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
var dt;
!(function(t2) {
  t2.DRAG_START = "dragstart", t2.DRAG = "drag", t2.DRAG_END = "dragend";
})(dt || (dt = {}));
var ct = !V(window);
var pt = ct ? window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame : null;
var ut = { right: 0, left: 0, top: 0, x: 0, y: 0 };
var mt = (t2) => t2 instanceof Event ? ((t3) => "clientX" in t3)(t2) ? { clientX: t2.clientX, clientY: t2.clientY } : { clientX: t2.touches[0].clientX, clientY: t2.touches[0].clientY } : t2;
var gt = class extends et {
  setup() {
    this.startDrag = this.startDrag.bind(this), this.stopDrag = this.stopDrag.bind(this), this.moveElement = this.moveElement.bind(this), this.dropElement = this.dropElement.bind(this), this.animate = this.animate.bind(this), V(this._bounds) && (this._bounds = false), this._dragStore = ut, this._coords = {};
  }
  betweenBounds(t2, e2) {
    const i2 = [...e2].sort();
    return b(Math.min(Math.max(t2, i2[0]), i2[1]), 6);
  }
  getBoundOrMaximum(t2) {
    var e2;
    return this.bounds && null !== (e2 = this.bounds[t2]) && void 0 !== e2 ? e2 : [...lt];
  }
  getRight(t2) {
    const e2 = this.getBoundOrMaximum("right");
    return this.betweenBounds(this._dragStore.right + t2 / this.data.scale, e2);
  }
  getLeft(t2) {
    const e2 = this.getBoundOrMaximum("left");
    return this.betweenBounds(this._dragStore.left + t2 / this.data.scale, e2);
  }
  getTop(t2) {
    const e2 = this.getBoundOrMaximum("top");
    return this.betweenBounds(this._dragStore.top + t2 / this.data.scale, e2);
  }
  getFixedCoordinates(t2) {
    return Object.entries(t2).reduce((t3, e2) => {
      const i2 = Object.assign({}, t3);
      switch (e2[0]) {
        case "right":
          i2.right = this.getRight(e2[1]);
          break;
        case "left":
          i2.left = this.getLeft(e2[1]);
          break;
        default:
          i2.top = this.getTop(e2[1]);
      }
      return i2;
    }, {});
  }
  dispatchEvent(t2) {
    var e2, i2, s2;
    const n2 = new CustomEvent(t2, { cancelable: t2 === dt.DRAG, detail: { right: null !== (e2 = this._coords.right) && void 0 !== e2 ? e2 : this.right, left: null !== (i2 = this._coords.left) && void 0 !== i2 ? i2 : this.left, top: null !== (s2 = this._coords.top) && void 0 !== s2 ? s2 : this.top } });
    return this.element.dispatchEvent(n2), n2;
  }
  animate() {
    this._update && (this._prevented || (F(this._coords.right) && (this.right = this._coords.right), F(this._coords.left) && (this.left = this._coords.left), F(this._coords.top) && (this.top = this._coords.top)), pt(this.animate));
  }
  startDrag(t2) {
    t2.preventDefault();
    const { clientX: e2, clientY: i2 } = mt(t2);
    this._dragStore.x = e2, this._dragStore.y = i2, this._dragStore.right = this.right, this._dragStore.left = this.left, this._dragStore.top = this.top, this._update = true, this.moveElement({ clientX: e2, clientY: i2 }), this.element.addEventListener(y.TOUCH_MOVE, this.moveElement, true), this.element.addEventListener(y.TOUCH_END, this.dropElement, true), document.addEventListener(y.MOUSE_MOVE, this.moveElement, true), document.addEventListener(y.MOUSE_UP, this.dropElement, true), pt(this.animate);
  }
  moveElement(t2) {
    const { clientX: e2, clientY: i2 } = mt(t2), n2 = e2 - this._dragStore.x, r2 = i2 - this._dragStore.y;
    this._drag === x.TOP ? this._coords = this.getFixedCoordinates(((t3, e3) => {
      const i3 = t3 / s, n3 = (2 * e3 + i3) / 2;
      return { right: n3, left: n3 - i3 };
    })(n2, r2)) : this._drag === x.FRONT ? this._coords = this.getFixedCoordinates(((t3, e3) => {
      const i3 = -t3 / s;
      return { left: i3, top: i3 / 2 - e3 };
    })(n2, r2)) : this._coords = this.getFixedCoordinates(((t3, e3) => {
      const i3 = t3 / s;
      return { right: i3, top: i3 / 2 - e3 };
    })(n2, r2));
    let o2 = null;
    t2 instanceof Event && (t2.preventDefault(), this.dispatchEvent(dt.DRAG_START), o2 = this.dispatchEvent(dt.DRAG)), this._prevented = !(!o2 || !o2.defaultPrevented);
  }
  dropElement() {
    this._update = false, this.element.removeEventListener(y.TOUCH_MOVE, this.moveElement, true), this.element.removeEventListener(y.TOUCH_END, this.dropElement, true), document.removeEventListener(y.MOUSE_MOVE, this.moveElement, true), document.removeEventListener(y.MOUSE_UP, this.dropElement, true), this.dispatchEvent(dt.DRAG_END);
  }
  beginDrag() {
    this.element.addEventListener(y.TOUCH_START, this.startDrag, true), this.element.addEventListener(y.MOUSE_DOWN, this.startDrag, true);
  }
  stopDrag() {
    this.element.removeEventListener(y.TOUCH_START, this.startDrag, true), this.element.removeEventListener(y.TOUCH_MOVE, this.moveElement, true), this.element.removeEventListener(y.TOUCH_END, this.dropElement, true), this.element.removeEventListener(y.MOUSE_DOWN, this.startDrag, true), document.removeEventListener(y.MOUSE_MOVE, this.moveElement, true), document.removeEventListener(y.MOUSE_UP, this.dropElement, true);
  }
  get right() {
    return this.props.right;
  }
  set right(t2) {
    this.props.right !== t2 && (this.props.right = t2, this.update());
  }
  get left() {
    return this.props.left;
  }
  set left(t2) {
    this.props.left !== t2 && (this.props.left = t2, this.update());
  }
  get top() {
    return this.props.top;
  }
  set top(t2) {
    this.props.top !== t2 && (this.props.top = t2, this.update());
  }
  get drag() {
    return this._drag || false;
  }
  set drag(t2) {
    V(this._drag) && this.setup(), this._drag = t2, ct && (this.stopDrag(), this.beginDrag());
  }
  get bounds() {
    return this._bounds || false;
  }
  set bounds(t2) {
    this._bounds = t2;
    const e2 = this.getBoundOrMaximum("right"), i2 = this.getBoundOrMaximum("left"), s2 = this.getBoundOrMaximum("top");
    this.right = this.betweenBounds(this.right, e2), this.left = this.betweenBounds(this.left, i2), this.top = this.betweenBounds(this.top, s2);
  }
};
var ft = { right: 0, left: 0, top: 0 };
var xt = class extends rt {
  constructor(t2 = {}) {
    super(t2.id || $(), e.group), this.props = Object.assign(Object.assign({}, ft), t2);
  }
  update() {
    if (J(this.element)) {
      const t2 = k(0, 0, { r: this.props.right, l: this.props.left, t: this.props.top }, this.data.scale);
      G(this.element, { transform: `translate(${t2.x}, ${t2.y})` });
    }
    return super.update();
  }
};
at(xt, gt);
var _t = class extends nt {
  constructor(t2, e2) {
    super(t2, e2);
  }
  updateGraphic(t2, e2 = true) {
    if (J(this.element)) {
      const i2 = this.getCommands(), s2 = ((t3, e3, i3, s3) => {
        const n2 = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
        return z(t3).forEach((t4) => {
          const r2 = k(e3, i3, t4.point, s3);
          (r2.x < n2.x || r2.x === n2.x && r2.y < n2.y) && (n2.x = r2.x, n2.y = r2.y);
        }), n2;
      })(i2, this.data.centerX, this.data.centerY, this.data.scale);
      G(this.element, { d: X(i2, this.data.centerX, this.data.centerY, this.data.scale, e2) }), this.updatePatternTransform(s2, t2), this.updateAnimations();
    }
  }
};
var vt = { right: 0, left: 0, top: 0 };
var yt = class extends _t {
  constructor(t2) {
    super(Object.assign(Object.assign({}, vt), t2), e.path);
  }
  update() {
    return this.updateGraphic(this.planeView), this;
  }
  clear() {
    return G(this.element, { d: "" }), this;
  }
  get planeView() {
    return this.props.planeView;
  }
  set planeView(t2) {
    this.props.planeView = t2, this.update();
  }
};
at(yt, gt);
var Et = class extends yt {
  constructor(t2) {
    const { height: e2, width: i2 } = t2;
    super(it(t2, ["height", "width"])), this._width = i2, this._height = e2;
  }
  getCommands(t2) {
    var e2, i2, s2, n2, r2;
    const o2 = null !== (e2 = null == t2 ? void 0 : t2.right) && void 0 !== e2 ? e2 : this.right, h2 = null !== (i2 = null == t2 ? void 0 : t2.left) && void 0 !== i2 ? i2 : this.left, a2 = null !== (s2 = null == t2 ? void 0 : t2.top) && void 0 !== s2 ? s2 : this.top, l2 = null !== (n2 = null == t2 ? void 0 : t2.width) && void 0 !== n2 ? n2 : this.width, d2 = null !== (r2 = null == t2 ? void 0 : t2.height) && void 0 !== r2 ? r2 : this.height, c2 = [{ command: f.move, point: { r: 0, l: 0, t: 0 } }];
    switch (this.planeView) {
      case x.FRONT:
        c2.push({ command: f.line, point: { r: 0, l: l2, t: 0 } }, { command: f.line, point: { r: 0, l: l2, t: d2 } }, { command: f.line, point: { r: 0, l: 0, t: d2 } });
        break;
      case x.SIDE:
        c2.push({ command: f.line, point: { r: l2, l: 0, t: 0 } }, { command: f.line, point: { r: l2, l: 0, t: d2 } }, { command: f.line, point: { r: 0, l: 0, t: d2 } });
        break;
      case x.TOP:
        c2.push({ command: f.line, point: { r: l2, l: 0, t: 0 } }, { command: f.line, point: { r: l2, l: d2, t: 0 } }, { command: f.line, point: { r: 0, l: d2, t: 0 } });
    }
    return W(c2, o2, h2, a2), c2;
  }
  getRectanglePath(t2) {
    const e2 = this.getCommands(t2);
    return X(e2, this.data.centerX, this.data.centerY, this.data.scale, true);
  }
  updateSubClassAnimations() {
    this.animations.forEach((i2) => {
      if (!Y(i2.property)) {
        const s2 = { right: this.right, left: this.left, top: this.top, width: this.width, height: this.height }, n2 = K(this.getRectanglePath.bind(this), i2, s2);
        i2.element = document.createElementNS(t, e.animate), this.element.appendChild(i2.element), this.addAnimationBasicProperties("d", i2), G(i2.element, n2);
      }
    });
  }
  get width() {
    return this._width;
  }
  set width(t2) {
    this._width = t2, this.update();
  }
  get height() {
    return this._height;
  }
  set height(t2) {
    this._height = t2, this.update();
  }
  addAnimation(t2) {
    return super.addAnimation(t2);
  }
};

// apps/web/js/box-illustration-src.mjs
var BOX_MODELS = {
  mediana: { id: "mediana", h: 70, r: 50, l: 50 },
  jumbo: { id: "jumbo", h: 85, r: 60, l: 60 },
  maxi: { id: "maxi", h: 100, r: 70, l: 70 },
  mega: { id: "mega", h: 120, r: 85, l: 85 }
};
var COLORS = {
  top: "#e8dcc8",
  front: "#d4b896",
  side: "#c4a574",
  stroke: "#5c4a32",
  dimLine: "#1e3a5f",
  dimText: "#102a4c"
};
var NS = "http://www.w3.org/2000/svg";
function proj(cx, cy, r2, l2, t2, scale) {
  const s2 = Math.sqrt(3) / 2;
  return {
    x: cx + (r2 - l2) * scale * s2,
    y: cy + ((r2 + l2) / 2 - t2) * scale
  };
}
function el(name, attrs, parent) {
  const n2 = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k2, v2]) => {
    if (v2 != null && v2 !== "") n2.setAttribute(k2, String(v2));
  });
  if (parent) parent.appendChild(n2);
  return n2;
}
function addAlignedDimension(svg, cx, cy, scale, p1, p2, label, offsetDir, options = {}) {
  const { color = COLORS.dimLine, fontSize = 11 } = options;
  const a2 = proj(cx, cy, p1.r, p1.l, p1.t, scale);
  const b2 = proj(cx, cy, p2.r, p2.l, p2.t, scale);
  const dx = b2.x - a2.x;
  const dy = b2.y - a2.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  let nx = -uy;
  let ny = ux;
  if (offsetDir === "inward") {
    nx = -nx;
    ny = -ny;
  }
  const gap = 16;
  const ext = 6;
  const pA = { x: a2.x + nx * gap, y: a2.y + ny * gap };
  const pB = { x: b2.x + nx * gap, y: b2.y + ny * gap };
  const g2 = el("g", {
    class: "box-dim",
    fill: "none",
    stroke: color,
    "stroke-width": 1,
    "stroke-linecap": "round"
  }, svg);
  el("line", { x1: a2.x, y1: a2.y, x2: pA.x, y2: pA.y, "stroke-dasharray": "3 3", opacity: "0.5" }, g2);
  el("line", { x1: b2.x, y1: b2.y, x2: pB.x, y2: pB.y, "stroke-dasharray": "3 3", opacity: "0.5" }, g2);
  el("line", {
    x1: pA.x - ux * ext,
    y1: pA.y - uy * ext,
    x2: pB.x + ux * ext,
    y2: pB.y + uy * ext
  }, g2);
  const tick = 3;
  const tx = -ny * tick;
  const ty = nx * tick;
  el("line", { x1: pA.x - ux * ext + tx, y1: pA.y - uy * ext + ty, x2: pA.x - ux * ext - tx, y2: pA.y - uy * ext - ty }, g2);
  el("line", { x1: pB.x + ux * ext + tx, y1: pB.y + uy * ext + ty, x2: pB.x + ux * ext - tx, y2: pB.y + uy * ext - ty }, g2);
  const mx = (pA.x + pB.x) / 2 + nx * (gap * 0.35);
  const my = (pA.y + pB.y) / 2 + ny * (gap * 0.35);
  const ang = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);
  const t2 = el("text", {
    x: mx,
    y: my,
    fill: COLORS.dimText,
    "font-size": fontSize,
    "font-family": "system-ui, Segoe UI, sans-serif",
    "font-weight": "600",
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    transform: `rotate(${ang > 90 || ang < -90 ? ang + 180 : ang}, ${mx}, ${my})`
  }, g2);
  t2.textContent = label;
}
function buildBoxGroup(R2, L2, H) {
  const g2 = new xt();
  const side = new Et({
    planeView: x.SIDE,
    width: R2,
    height: H,
    right: 0,
    left: 0,
    top: 0,
    fillColor: COLORS.side,
    strokeColor: COLORS.stroke,
    strokeWidth: 0.8
  });
  const front = new Et({
    planeView: x.FRONT,
    width: L2,
    height: H,
    right: 0,
    left: 0,
    top: 0,
    fillColor: COLORS.front,
    strokeColor: COLORS.stroke,
    strokeWidth: 0.8
  });
  const top = new Et({
    planeView: x.TOP,
    width: R2,
    height: L2,
    right: 0,
    left: 0,
    top: H,
    fillColor: COLORS.top,
    strokeColor: COLORS.stroke,
    strokeWidth: 0.8
  });
  g2.addChildren(side, front, top);
  return g2;
}
function mountBoxIllustration(container, dims, opts = {}) {
  const { h: H, r: R2, l: L2 } = dims;
  const variant = opts.variant || "card";
  const wPx = variant === "hero" ? 220 : 300;
  const hPx = variant === "hero" ? 140 : 210;
  const scale = variant === "hero" ? 0.5 : 0.68;
  const cx = wPx / 2;
  const cy = hPx / 2;
  const dimFont = variant === "hero" ? 9 : 11;
  container.innerHTML = "";
  container.classList.add("box-illustration-root");
  const canvas = new ht({
    container,
    width: wPx,
    height: hPx,
    scale,
    backgroundColor: "transparent"
  });
  const svg = canvas.getElement();
  svg.setAttribute("overflow", "visible");
  const bg = svg.querySelector("rect");
  if (bg) {
    bg.setAttribute("fill", "none");
    bg.setAttribute("opacity", "0");
  }
  const group = buildBoxGroup(R2, L2, H);
  canvas.addChild(group);
  canvas.update();
  const dimLayer = el("g", { class: "box-dimensions", "pointer-events": "none" }, svg);
  const ariaKey = container.getAttribute("data-i18n-aria");
  const lang = typeof document !== "undefined" ? document.documentElement.lang || "es" : "es";
  if (ariaKey && typeof window !== "undefined" && window.T?.[lang]?.[ariaKey]) {
    container.setAttribute("aria-label", window.T[lang][ariaKey]);
  } else {
    container.setAttribute("aria-label", `${H} \xD7 ${R2} \xD7 ${L2} cm`);
  }
  addAlignedDimension(
    dimLayer,
    cx,
    cy,
    scale,
    { r: 0, l: 0, t: 0 },
    { r: 0, l: 0, t: H },
    `${H}`,
    "inward",
    { fontSize: dimFont }
  );
  addAlignedDimension(
    dimLayer,
    cx,
    cy,
    scale,
    { r: 0, l: 0, t: H },
    { r: R2, l: 0, t: H },
    `${R2}`,
    "outward",
    { fontSize: dimFont }
  );
  addAlignedDimension(
    dimLayer,
    cx,
    cy,
    scale,
    { r: 0, l: 0, t: H },
    { r: 0, l: L2, t: H },
    `${L2}`,
    "outward",
    { fontSize: dimFont }
  );
  return svg;
}
function initAllBoxIllustrations() {
  document.querySelectorAll("[data-box-model]").forEach((node) => {
    const key = node.getAttribute("data-box-model");
    const variant = node.getAttribute("data-box-variant") || "card";
    const m2 = BOX_MODELS[key];
    if (!m2 || !(node instanceof HTMLElement)) return;
    try {
      mountBoxIllustration(node, m2, { variant: variant === "hero" ? "hero" : "card" });
    } catch (e2) {
      console.error("box-illustration", e2);
    }
  });
}
if (typeof window !== "undefined") {
  window.initBoxIllustrations = initAllBoxIllustrations;
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initAllBoxIllustrations());
  } else {
    initAllBoxIllustrations();
  }
}
export {
  BOX_MODELS,
  initAllBoxIllustrations,
  mountBoxIllustration
};
