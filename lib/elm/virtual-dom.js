// @noflow

const __2_TEXT = "VirtualDOM.Text"
const __2_NODE = "VirtualDOM.Node"
const __2_KEYED_NODE = "VirtualDOM.Keyed.Node"
const __2_CUSTOM = "VirtualDOM.Custom"
const __2_TAGGER = "VirtualDOM.Tagger"
const __2_THUNK = "VirtualDOM.Thunk"
const __3_REDRAW = "VirtualDOM.OP.Redraw"
const __3_THUNK = "VirtualDOM.OP.Thunk"
const __3_TAGGER = "VirtualDOM.OP.Tagger"
const __3_TEXT = "VirtualDOM.OP.Text"
const __3_FACTS = "VirtualDOM.OP.Facts"
const __3_CUSTOM = "VirtualDOM.OP.Custom"
const __3_REMOVE_LAST = "VirtualDOM.OP.RemoveLast"
const __3_APPEND = "VirtualDOM.OP.Append"
const __3_REORDER = "VirtualDOM.OP.Reorder"
const __3_REMOVE = "VirtualDOM.OP.Remove"
const __5_REMOVE = "VirtualDOM.OP.Remove2"
const __5_INSERT = "VirtualDOM.OP.Insert"
const __5_MOVE = "VirtualDOM.OP.Move"

// HELPERS

function appendChild(parent, child) {
  parent.appendChild(child)
}

var init = function(virtualNode, flagDecoder, debugMetadata, args) {
  // NOTE: this function needs __Platform_export available to work

  /**__PROD/
	var node = args['node'];
	//*/
  /**__DEBUG/
	var node = args && args['node'] ? args['node'] : __Debug_crash(0);
  //*/
  const { node } = args

  node.parentNode.replaceChild(
    render(node.ownerDocument, virtualNode, function() {}),
    node
  )

  return {}
}

// TEXT

class Text {
  constructor(content) {
    this.$ = __2_TEXT
    this.__text = content
  }
  map(tagger) {
    return this
  }
}

export const text = content => new Text(content)

// NODE

const noKids = Object.freeze([])
const noFacts = Object.freeze([])

class Node {
  constructor(tag, facts, kids, namespace, descendantsCount) {
    this.$ = __2_NODE
    this.__tag = tag
    this.__facts = facts
    this.__kids = kids
    this.namespace = namespace
    this.__descendantsCount = descendantsCount
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
}

export const nodeNS = (
  namespace,
  tag,
  factList = noFacts,
  kidList = noKids
) => {
  for (
    var kids = [], descendantsCount = 0, index = 0;
    kidList.length > index;
    index++
  ) {
    var kid = kidList[index]
    descendantsCount += kid.__descendantsCount || 0
    kids.push(kid)
  }
  descendantsCount += kids.length

  return new Node(
    tag,
    organizeFacts(factList),
    kids,
    namespace,
    descendantsCount
  )
}

export var node = nodeNS.bind(null, null)

// KEYED NODE

class KeyedNode {
  constructor() {
    this.$ = __2_KEYED_NODE
    this.__tag = tag
    this.__facts = facts
    this.__kids = kids
    this.namespace = namespace
    this.__descendantsCount = descendantsCount
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
}

export const keyedNodeNS = (namespace, tag) => {
  return (factList, kidList) => {
    for (
      var kids = [], descendantsCount = 0;
      kidList.b;
      kidList = kidList.b // WHILE_CONS
    ) {
      var kid = kidList.a
      descendantsCount += kid.b.__descendantsCount || 0
      kids.push(kid)
    }
    descendantsCount += kids.length

    return new KeyedNode(
      tag,
      organizeFacts(factList),
      kids,
      namespace,
      descendantsCount
    )
  }
}

export var keyedNode = keyedNodeNS(undefined)

// CUSTOM

class CustomNode {
  constructor(facts, model, render, diff) {
    this.$ = __2_CUSTOM
    this.__facts = facts
    this.__model = model
    this.__render = render
    this.__diff = diff
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
}

export const custom = (factList, model, render, diff) =>
  new CustomNode(organizeFacts(factList), model, render, diff)

class Doc {
  constructor(title, body) {
    this.title = title
    this.body = body
  }
  map(tagger) {
    return new Doc(this.title, this.body.map(tagger))
  }
}

export const doc = (title, body) => new Doc(title, body)

// MAP

class TaggerNode {
  constructor(tagger, node) {
    this.$ = __2_TAGGER
    this.__tagger = tagger
    this.__node = node
    this.__descendantsCount = 1 + (node.__descendantsCount || 0)
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
}

export const map = (tagger, node) => new TaggerNode(tagger, node)

// LAZY

class Thunk {
  constructor(refs, thunk) {
    this.$ = __2_THUNK
    this.__refs = refs
    this.__thunk = thunk
    this.__node = undefined
  }
  map(tagger) {
    return new TaggerNode(tagger, this)
  }
}

const thunk = (refs, thunk) => new Thunk(refs, thunk)

export var lazy = function(func, a) {
  return thunk([func, a], function() {
    return func(a)
  })
}

export var lazy2 = function(func, a, b) {
  return thunk([func, a, b], function() {
    return func(a, b)
  })
}

export var lazy3 = function(func, a, b, c) {
  return thunk([func, a, b, c], function() {
    return func(a, b, c)
  })
}

export var lazy4 = function(func, a, b, c, d) {
  return thunk([func, a, b, c, d], function() {
    return func(a, b, c, d)
  })
}

export var lazy5 = function(func, a, b, c, d, e) {
  return thunk([func, a, b, c, d, e], function() {
    return func(a, b, c, d, e)
  })
}

export var lazy6 = function(func, a, b, c, d, e, f) {
  return thunk([func, a, b, c, d, e, f], function() {
    return func(a, b, c, d, e, f)
  })
}

export var lazy7 = function(func, a, b, c, d, e, f, g) {
  return thunk([func, a, b, c, d, e, f, g], function() {
    return func(a, b, c, d, e, f, g)
  })
}

export var lazy8 = function(func, a, b, c, d, e, f, g, h) {
  return thunk([func, a, b, c, d, e, f, g, h], function() {
    return func(a, b, c, d, e, f, g, h)
  })
}

// FACTS

class VirtualDOMEvent {
  constructor(type, handler) {
    this.$ = "a__1_EVENT"
    this.type = type
    this.handler = handler
  }
  map(tag) {
    return new VirtualDOMEvent(this.type, this.handler.map(tag))
  }
  equal(other) {
    return this.type === other.type && this.handler.equal(other.handler)
  }
}

export var on = function(key, handler) {
  return new VirtualDOMEvent(key, handler)
}

class VirtualDOMStyle {
  constructor(key, value) {
    this.$ = "a__1_STYLE"
    this.key = key
    this.value = value
  }
  map(tag) {
    return this
  }
}

export var style = function(key, value) {
  return new VirtualDOMStyle(key, value)
}

class VirtualDOMProperty {
  constructor(key, value) {
    this.$ = "a__1_PROP"
    this.key = key
    this.value = value
  }
  map(tag) {
    return this
  }
}

export var property = function(key, value) {
  return new VirtualDOMProperty(key, value)
}

class VirtualDOMAttribute {
  constructor(key, value) {
    this.$ = "a__1_ATTR"
    this.key = key
    this.value = value
  }
  map(tag) {
    return this
  }
}

export const attribute = (key, value) => new VirtualDOMAttribute(key, value)

class VirtualDOMAttributeNS {
  constructor(namespace, key, value) {
    this.$ = "a__1_ATTR_NS"
    this.key = key
    this.value = { namespace: namespace, value: value }
  }
  map(tag) {
    return this
  }
}

export const attributeNS = (namespace, key, value) =>
  new VirtualDOMAttributeNS(namespace, key, value)

// XSS ATTACK VECTOR CHECKS

export function noScript(tag) {
  return tag == "script" ? "p" : tag
}

export function noOnOrFormAction(key) {
  return /^(on|formAction$)/i.test(key) ? "data-" + key : key
}

export function noInnerHtmlOrFormAction(key) {
  return key == "innerHTML" || key == "formAction" ? "data-" + key : key
}

export function noJavaScriptUri__PROD(value) {
  return /^javascript:/i.test(value.replace(/\s/g, "")) ? "" : value
}

export function noJavaScriptUri__DEBUG(value) {
  return /^javascript:/i.test(value.replace(/\s/g, ""))
    ? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
    : value
}

export function noJavaScriptOrHtmlUri__PROD(value) {
  return /^\s*(javascript:|data:text\/html)/i.test(value) ? "" : value
}

export function noJavaScriptOrHtmlUri__DEBUG(value) {
  return /^\s*(javascript:|data:text\/html)/i.test(value)
    ? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
    : value
}

// MAP FACTS

class TaggedDecoder {
  constructor(tag, decoder) {
    this.tag = tag
    this.decoder = decoder
  }
  decode(input) {
    const result = this.decoder.decode(input)
    if (!(result instanceof Error)) {
      return this.tag(result)
    } else {
      return result
    }
  }
}

class EventHandler {
  constructor(decoder, eventPhase) {
    this.decoder = decoder
    this.eventPhase = eventPhase
    this.tag = null
  }
  map(tag) {
    return new TaggedEventHandler(tag, this, this.eventPhase)
  }
  decode(input) {
    return this.decoder.decode(input)
  }
  equal(other) {
    return (
      this.eventPhase === other.eventPhase &&
      this.decoder === other.decoder &&
      this.tag === other.tag
    )
  }
}

class TaggedEventHandler {
  constructor(tag, handler, eventPhase) {
    this.tag = tag
    this.handler = handler
    this.eventPhase = eventPhase
  }
  map(tag) {
    return new TaggedEventHandler(tag, this, this.eventPhase)
  }
  decode(input) {
    const result = this.handler.decode(input)
    if (result instanceof Error) {
      return result
    } else {
      const { message, preventDefault, stopPropagation } = result
      return { message: this.tag(message), preventDefault, stopPropagation }
    }
  }
  equal(other) {
    return (
      this.eventPhase === other.eventPhase &&
      this.handler.equal(other.handler) &&
      this.tag === other.tag
    )
  }
}

// ORGANIZE FACTS

function organizeFacts(factList) {
  for (
    var facts = {}, index = 0;
    factList.length > index;
    index++ // WHILE_CONS
  ) {
    var fact = factList[index]

    var tag = fact.$

    switch (tag) {
      case "a__1_PROP": {
        const { key, value } = fact
        if (key === "className") {
          addClass(facts, key, value)
        } else {
          facts[key] = value
        }
        break
      }
      case "a__1_STYLE": {
        const { key, value } = fact
        var subFacts = facts[tag] || (facts[tag] = {})
        subFacts[key] = value
        break
      }
      case "a__1_EVENT": {
        const { type, handler } = fact
        var subFacts = facts[tag] || (facts[tag] = {})
        subFacts[type] = handler
        break
      }
      case "a__1_ATTR": {
        const { key, value } = fact
        var subFacts = facts[tag] || (facts[tag] = {})
        if (key === "class") {
          addClass(subFacts, key, value)
        } else {
          subFacts[key] = value
        }
        break
      }
      case "a__1_ATTR_NS": {
        const { key, value } = fact
        var subFacts = facts[tag] || (facts[tag] = {})
        if (key === "class") {
          addClass(subFacts, key, value)
        } else {
          subFacts[key] = value
        }
        break
      }
    }
  }

  return facts
}

function addClass(object, key, newClass) {
  var classes = object[key]
  object[key] = classes ? classes + " " + newClass : newClass
}

// RENDER

function render(doc, vNode, eventNode) {
  var tag = vNode.$

  if (tag === __2_THUNK) {
    return render(
      doc,
      vNode.__node || (vNode.__node = vNode.__thunk()),
      eventNode
    )
  }

  if (tag === __2_TEXT) {
    return doc.createTextNode(vNode.__text)
  }

  if (tag === __2_TAGGER) {
    var subNode = vNode.__node
    var tagger = vNode.__tagger

    while (subNode.$ === __2_TAGGER) {
      typeof tagger !== "object"
        ? (tagger = [tagger, subNode.__tagger])
        : tagger.push(subNode.__tagger)

      subNode = subNode.__node
    }

    var subEventRoot = { __tagger: tagger, __parent: eventNode }
    var domNode = render(doc, subNode, subEventRoot)
    domNode.elm_event_node_ref = subEventRoot
    return domNode
  }

  if (tag === __2_CUSTOM) {
    var domNode = vNode.__render(doc, vNode.__model)
    applyFacts(domNode, eventNode, vNode.__facts)
    return domNode
  }

  // at this point `tag` must be __2_NODE or __2_KEYED_NODE

  var domNode = vNode.namespace
    ? doc.createElementNS(vNode.namespace, vNode.__tag)
    : doc.createElement(vNode.__tag)

  const { onnavigate } = doc.defaultView
  if (onnavigate && vNode.__tag == "a") {
    domNode.addEventListener("click", onnavigate)
  }

  applyFacts(domNode, eventNode, vNode.__facts)

  for (var kids = vNode.__kids, i = 0; i < kids.length; i++) {
    appendChild(
      domNode,
      render(doc, tag === __2_NODE ? kids[i] : kids[i].b, eventNode)
    )
  }

  return domNode
}

// APPLY FACTS

function applyFacts(domNode, eventNode, facts) {
  for (var key in facts) {
    var value = facts[key]

    switch (key) {
      case "a__1_STYLE": {
        applyStyles(domNode, value)
        break
      }
      case "a__1_EVENT": {
        applyEvents(domNode, eventNode, value)
        break
      }
      case "a__1_ATTR": {
        applyAttrs(domNode, value)
        break
      }
      case "a__1_ATTR_NS": {
        applyAttrsNS(domNode, value)
        break
      }
      default: {
        switch (key) {
          case "value":
            break
          case "checked":
            break
          case domNode[key]:
            break
          default: {
            domNode[key] = value
            break
          }
        }
      }
    }
  }
}

// APPLY STYLES

function applyStyles(domNode, styles) {
  var domNodeStyle = domNode.style

  for (var key in styles) {
    domNodeStyle[key] = styles[key]
  }
}

// APPLY ATTRS

function applyAttrs(domNode, attrs) {
  for (var key in attrs) {
    var value = attrs[key]
    value != null ? domNode.setAttribute(key, value) : domNode.removeAttribute(key)
  }
}

// APPLY NAMESPACED ATTRS

function applyAttrsNS(domNode, nsAttrs) {
  for (var key in nsAttrs) {
    var pair = nsAttrs[key]
    var namespace = pair.namespace
    var value = pair.value

    value
      ? domNode.setAttributeNS(namespace, key, value)
      : domNode.removeAttributeNS(namespace, key)
  }
}

// APPLY EVENTS

function applyEvents(domNode, eventNode, events) {
  var allCallbacks = domNode.elmFs || (domNode.elmFs = {})

  for (var key in events) {
    var newHandler = events[key]
    var oldCallback = allCallbacks[key]

    if (!newHandler) {
      domNode.removeEventListener(key, oldCallback)
      allCallbacks[key] = undefined
      continue
    }

    if (oldCallback) {
      var oldHandler = oldCallback.handler
      if (oldHandler.$ === newHandler.$) {
        oldCallback.handler = newHandler
        continue
      }
      domNode.removeEventListener(key, oldCallback)
    }

    oldCallback = makeCallback(eventNode, newHandler)
    const { eventPhase } = newHandler

    const passive = eventPhase == Normal || eventPhase == MayStopPropagation
    domNode.addEventListener(key, oldCallback, passiveSupported && { passive })
    allCallbacks[key] = oldCallback
  }
}

// PASSIVE EVENTS

var passiveSupported

try {
  window.addEventListener(
    "t",
    null,
    Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true
      }
    })
  )
} catch (e) {}

// EVENT HANDLERS

const Normal = 0
const MayStopPropagation = 1
const MayPreventDefault = 2
const Custom = 3

function makeCallback(eventNode, handler) {
  function callback(event) {
    var handler = callback.handler
    var result = handler.decode(event)

    if (result instanceof Error) {
      return
    }

    var tag = handler.eventPhase

    // 0 = Normal
    // 1 = MayStopPropagation
    // 2 = MayPreventDefault
    // 3 = Custom

    var { message, stopPropagation, preventDefault } = result

    if (stopPropagation) {
      event.stopPropagation()
    }

    if (preventDefault) {
      event.preventDefault()
    }

    var currentEventNode = eventNode

    var tagger
    var i
    while ((tagger = currentEventNode.__tagger)) {
      if (typeof tagger == "function") {
        message = tagger(message)
      } else {
        for (var i = tagger.length; i--; ) {
          message = tagger[i](message)
        }
      }
      currentEventNode = currentEventNode.__parent
    }

    if (stopPropagation) {
      currentEventNode.sync(message) // stopPropagation implies isSync
    } else {
      currentEventNode.send(message)
    }
  }

  callback.handler = handler

  return callback
}

// DIFF

// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
export function diff(x, y) {
  var patches = []
  diffHelp(x, y, patches, 0)
  return patches
}

function pushPatch(patches, type, index, data) {
  var patch = {
    $: type,
    __index: index,
    __data: data,
    __domNode: undefined,
    __eventNode: undefined
  }
  patches.push(patch)
  return patch
}

function diffHelp(x, y, patches, index) {
  if (x === y) {
    return
  }

  var xType = x.$
  var yType = y.$

  // Bail if you run into different types of nodes. Implies that the
  // structure has changed significantly and it's not worth a diff.
  if (xType !== yType) {
    if (xType === __2_NODE && yType === __2_KEYED_NODE) {
      y = dekey(y)
      yType = __2_NODE
    } else {
      pushPatch(patches, __3_REDRAW, index, y)
      return
    }
  }

  // Now we know that both nodes are the same $.
  switch (yType) {
    case __2_THUNK:
      var xRefs = x.__refs
      var yRefs = y.__refs
      var i = xRefs.length
      var same = i === yRefs.length
      while (same && i--) {
        same = xRefs[i] === yRefs[i]
      }
      if (same) {
        y.__node = x.__node
        return
      }
      y.__node = y.__thunk()
      var subPatches = []
      diffHelp(x.__node, y.__node, subPatches, 0)
      subPatches.length > 0 && pushPatch(patches, __3_THUNK, index, subPatches)
      return

    case __2_TAGGER:
      // gather nested taggers
      var xTaggers = x.__tagger
      var yTaggers = y.__tagger
      var nesting = false

      var xSubNode = x.__node
      while (xSubNode.$ === __2_TAGGER) {
        nesting = true

        typeof xTaggers !== "object"
          ? (xTaggers = [xTaggers, xSubNode.__tagger])
          : xTaggers.push(xSubNode.__tagger)

        xSubNode = xSubNode.__node
      }

      var ySubNode = y.__node
      while (ySubNode.$ === __2_TAGGER) {
        nesting = true

        typeof yTaggers !== "object"
          ? (yTaggers = [yTaggers, ySubNode.__tagger])
          : yTaggers.push(ySubNode.__tagger)

        ySubNode = ySubNode.__node
      }

      // Just bail if different numbers of taggers. This implies the
      // structure of the virtual DOM has changed.
      if (nesting && xTaggers.length !== yTaggers.length) {
        pushPatch(patches, __3_REDRAW, index, y)
        return
      }

      // check if taggers are "the same"
      if (
        nesting ? !pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers
      ) {
        pushPatch(patches, __3_TAGGER, index, yTaggers)
      }

      // diff everything below the taggers
      diffHelp(xSubNode, ySubNode, patches, index + 1)
      return

    case __2_TEXT:
      if (x.__text !== y.__text) {
        pushPatch(patches, __3_TEXT, index, y.__text)
      }
      return

    case __2_NODE:
      diffNodes(x, y, patches, index, diffKids)
      return

    case __2_KEYED_NODE:
      diffNodes(x, y, patches, index, diffKeyedKids)
      return

    case __2_CUSTOM:
      if (x.__render !== y.__render) {
        pushPatch(patches, __3_REDRAW, index, y)
        return
      }

      var factsDiff = diffFacts(x.__facts, y.__facts)
      factsDiff && pushPatch(patches, __3_FACTS, index, factsDiff)

      var patch = y.__diff(x.__model, y.__model)
      patch && pushPatch(patches, __3_CUSTOM, index, patch)

      return
  }
}

// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs) {
  for (var i = 0; i < as.length; i++) {
    if (as[i] !== bs[i]) {
      return false
    }
  }

  return true
}

function diffNodes(x, y, patches, index, diffKids) {
  // Bail if obvious indicators have changed. Implies more serious
  // structural changes such that it's not worth it to diff.
  if (x.__tag !== y.__tag || x.namespace !== y.namespace) {
    pushPatch(patches, __3_REDRAW, index, y)
    return
  }

  var factsDiff = diffFacts(x.__facts, y.__facts)
  factsDiff && pushPatch(patches, __3_FACTS, index, factsDiff)

  diffKids(x, y, patches, index)
}

// DIFF FACTS

// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(x, y, category) {
  var diff

  // look for changes and removals
  for (var xKey in x) {
    if (
      xKey === "a__1_STYLE" ||
      xKey === "a__1_EVENT" ||
      xKey === "a__1_ATTR" ||
      xKey === "a__1_ATTR_NS"
    ) {
      var subDiff = diffFacts(x[xKey], y[xKey] || {}, xKey)
      if (subDiff) {
        diff = diff || {}
        diff[xKey] = subDiff
      }
      continue
    }

    // remove if not in the new facts
    if (!(xKey in y)) {
      diff = diff || {}
      diff[xKey] = !category
        ? typeof x[xKey] === "string"
          ? ""
          : null
        : category === "a__1_STYLE"
          ? ""
          : category === "a__1_EVENT" || category === "a__1_ATTR"
            ? undefined
            : { namespace: x[xKey].namespace, value: undefined }

      continue
    }

    var xValue = x[xKey]
    var yValue = y[xKey]

    // reference equal, so don't worry about it
    if (
      (xValue === yValue && xKey !== "value" && xKey !== "checked") ||
      (category === "a__1_EVENT" && xValue.equal(yValue))
    ) {
      continue
    }

    diff = diff || {}
    diff[xKey] = yValue
  }

  // add new stuff
  for (var yKey in y) {
    if (!(yKey in x)) {
      diff = diff || {}
      diff[yKey] = y[yKey]
    }
  }

  return diff
}

// DIFF KIDS

function diffKids(xParent, yParent, patches, index) {
  var xKids = xParent.__kids
  var yKids = yParent.__kids

  var xLen = xKids.length
  var yLen = yKids.length

  // FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

  if (xLen > yLen) {
    pushPatch(patches, __3_REMOVE_LAST, index, {
      __length: yLen,
      __diff: xLen - yLen
    })
  } else if (xLen < yLen) {
    pushPatch(patches, __3_APPEND, index, {
      __length: xLen,
      __kids: yKids
    })
  }

  // PAIRWISE DIFF EVERYTHING ELSE

  for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++) {
    var xKid = xKids[i]
    diffHelp(xKid, yKids[i], patches, ++index)
    index += xKid.__descendantsCount || 0
  }
}

// KEYED DIFF

function diffKeyedKids(xParent, yParent, patches, rootIndex) {
  var localPatches = []

  var changes = {} // Dict String Entry
  var inserts = [] // Array { index : Int, entry : Entry }
  // type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

  var xKids = xParent.__kids
  var yKids = yParent.__kids
  var xLen = xKids.length
  var yLen = yKids.length
  var xIndex = 0
  var yIndex = 0

  var index = rootIndex

  while (xIndex < xLen && yIndex < yLen) {
    var x = xKids[xIndex]
    var y = yKids[yIndex]

    var xKey = x.a
    var yKey = y.a
    var xNode = x.b
    var yNode = y.b

    // check if keys match

    if (xKey === yKey) {
      index++
      diffHelp(xNode, yNode, localPatches, index)
      index += xNode.__descendantsCount || 0

      xIndex++
      yIndex++
      continue
    }

    // look ahead 1 to detect insertions and removals.

    var xNext = xKids[xIndex + 1]
    var yNext = yKids[yIndex + 1]

    if (xNext) {
      var xNextKey = xNext.a
      var xNextNode = xNext.b
      var oldMatch = yKey === xNextKey
    }

    if (yNext) {
      var yNextKey = yNext.a
      var yNextNode = yNext.b
      var newMatch = xKey === yNextKey
    }

    // swap x and y
    if (newMatch && oldMatch) {
      index++
      diffHelp(xNode, yNextNode, localPatches, index)
      insertNode(changes, localPatches, xKey, yNode, yIndex, inserts)
      index += xNode.__descendantsCount || 0

      index++
      removeNode(changes, localPatches, xKey, xNextNode, index)
      index += xNextNode.__descendantsCount || 0

      xIndex += 2
      yIndex += 2
      continue
    }

    // insert y
    if (newMatch) {
      index++
      insertNode(changes, localPatches, yKey, yNode, yIndex, inserts)
      diffHelp(xNode, yNextNode, localPatches, index)
      index += xNode.__descendantsCount || 0

      xIndex += 1
      yIndex += 2
      continue
    }

    // remove x
    if (oldMatch) {
      index++
      removeNode(changes, localPatches, xKey, xNode, index)
      index += xNode.__descendantsCount || 0

      index++
      diffHelp(xNextNode, yNode, localPatches, index)
      index += xNextNode.__descendantsCount || 0

      xIndex += 2
      yIndex += 1
      continue
    }

    // remove x, insert y
    if (xNext && xNextKey === yNextKey) {
      index++
      removeNode(changes, localPatches, xKey, xNode, index)
      insertNode(changes, localPatches, yKey, yNode, yIndex, inserts)
      index += xNode.__descendantsCount || 0

      index++
      diffHelp(xNextNode, yNextNode, localPatches, index)
      index += xNextNode.__descendantsCount || 0

      xIndex += 2
      yIndex += 2
      continue
    }

    break
  }

  // eat up any remaining nodes with removeNode and insertNode

  while (xIndex < xLen) {
    index++
    var x = xKids[xIndex]
    var xNode = x.b
    removeNode(changes, localPatches, x.a, xNode, index)
    index += xNode.__descendantsCount || 0
    xIndex++
  }

  while (yIndex < yLen) {
    var endInserts = endInserts || []
    var y = yKids[yIndex]
    insertNode(changes, localPatches, y.a, y.b, undefined, endInserts)
    yIndex++
  }

  if (localPatches.length > 0 || inserts.length > 0 || endInserts) {
    pushPatch(patches, __3_REORDER, rootIndex, {
      __patches: localPatches,
      __inserts: inserts,
      __endInserts: endInserts
    })
  }
}

// CHANGES FROM KEYED DIFF

var POSTFIX = "_elmW6BL"

function insertNode(changes, localPatches, key, vnode, yIndex, inserts) {
  var entry = changes[key]

  // never seen this key before
  if (!entry) {
    entry = {
      __tag: __5_INSERT,
      __vnode: vnode,
      __index: yIndex,
      __data: undefined
    }

    inserts.push({ __index: yIndex, __entry: entry })
    changes[key] = entry

    return
  }

  // this key was removed earlier, a match!
  if (entry.__tag === __5_REMOVE) {
    inserts.push({ __index: yIndex, __entry: entry })

    entry.__tag = __5_MOVE
    var subPatches = []
    diffHelp(entry.__vnode, vnode, subPatches, entry.__index)
    entry.__index = yIndex
    entry.__data.__data = {
      __patches: subPatches,
      __entry: entry
    }

    return
  }

  // this key has already been inserted or moved, a duplicate!
  insertNode(changes, localPatches, key + POSTFIX, vnode, yIndex, inserts)
}

function removeNode(changes, localPatches, key, vnode, index) {
  var entry = changes[key]

  // never seen this key before
  if (!entry) {
    var patch = pushPatch(localPatches, __3_REMOVE, index, undefined)

    changes[key] = {
      __tag: __5_REMOVE,
      __vnode: vnode,
      __index: index,
      __data: patch
    }

    return
  }

  // this key was inserted earlier, a match!
  if (entry.__tag === __5_INSERT) {
    entry.__tag = __5_MOVE
    var subPatches = []
    diffHelp(vnode, entry.__vnode, subPatches, index)

    pushPatch(localPatches, __3_REMOVE, index, {
      __patches: subPatches,
      __entry: entry
    })

    return
  }

  // this key has already been removed or moved, a duplicate!
  removeNode(changes, localPatches, key + POSTFIX, vnode, index)
}

// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.

function addDomNodes(domNode, vNode, patches, eventNode) {
  addDomNodesHelp(
    domNode,
    vNode,
    patches,
    0,
    0,
    vNode.__descendantsCount,
    eventNode
  )
}

// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode) {
  var patch = patches[i]
  var index = patch.__index

  while (index === low) {
    var patchType = patch.$

    if (patchType === __3_THUNK) {
      addDomNodes(domNode, vNode.__node, patch.__data, eventNode)
    } else if (patchType === __3_REORDER) {
      patch.__domNode = domNode
      patch.__eventNode = eventNode

      var subPatches = patch.__data.__patches
      if (subPatches.length > 0) {
        addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode)
      }
    } else if (patchType === __3_REMOVE) {
      patch.__domNode = domNode
      patch.__eventNode = eventNode

      var data = patch.__data
      if (data) {
        data.__entry.__data = domNode
        var subPatches = data.__patches
        if (subPatches.length > 0) {
          addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode)
        }
      }
    } else {
      patch.__domNode = domNode
      patch.__eventNode = eventNode
    }

    i++

    if (!(patch = patches[i]) || (index = patch.__index) > high) {
      return i
    }
  }

  var tag = vNode.$

  if (tag === __2_TAGGER) {
    var subNode = vNode.__node

    while (subNode.$ === __2_TAGGER) {
      subNode = subNode.__node
    }

    return addDomNodesHelp(
      domNode,
      subNode,
      patches,
      i,
      low + 1,
      high,
      domNode.elm_event_node_ref
    )
  }

  // tag must be __2_NODE or __2_KEYED_NODE at this point

  var vKids = vNode.__kids
  var childNodes = domNode.childNodes
  for (var j = 0; j < vKids.length; j++) {
    low++
    var vKid = tag === __2_NODE ? vKids[j] : vKids[j].b
    var nextLow = low + (vKid.__descendantsCount || 0)
    if (low <= index && index <= nextLow) {
      i = addDomNodesHelp(
        childNodes[j],
        vKid,
        patches,
        i,
        low,
        nextLow,
        eventNode
      )
      if (!(patch = patches[i]) || (index = patch.__index) > high) {
        return i
      }
    }
    low = nextLow
  }
  return i
}

// APPLY PATCHES

export const patch = (rootDomNode, oldVirtualNode, patches, eventNode) => {
  if (patches.length === 0) {
    return rootDomNode
  }

  addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode)
  return applyPatchesHelp(rootDomNode, patches)
}

function applyPatchesHelp(rootDomNode, patches) {
  for (var i = 0; i < patches.length; i++) {
    var patch = patches[i]
    var localDomNode = patch.__domNode
    var newNode = applyPatch(localDomNode, patch)
    if (localDomNode === rootDomNode) {
      rootDomNode = newNode
    }
  }
  return rootDomNode
}

function applyPatch(domNode, patch) {
  const doc = domNode.ownerDocument
  switch (patch.$) {
    case __3_REDRAW: {
      return applyPatchRedraw(domNode, patch.__data, patch.__eventNode)
    }
    case __3_FACTS: {
      applyFacts(domNode, patch.__eventNode, patch.__data)
      return domNode
    }
    case __3_TEXT: {
      domNode.replaceData(0, domNode.length, patch.__data)
      return domNode
    }
    case __3_THUNK: {
      return applyPatchesHelp(domNode, patch.__data)
    }
    case __3_TAGGER: {
      if (domNode.elm_event_node_ref) {
        domNode.elm_event_node_ref.__tagger = patch.__data
      } else {
        domNode.elm_event_node_ref = {
          __tagger: patch.__data,
          __parent: patch.__eventNode
        }
      }
      return domNode
    }
    case __3_REMOVE_LAST: {
      var data = patch.__data
      for (var i = 0; i < data.__diff; i++) {
        domNode.removeChild(domNode.childNodes[data.__length])
      }
      return domNode
    }
    case __3_APPEND: {
      var data = patch.__data
      var kids = data.__kids
      var i = data.__length
      var theEnd = domNode.childNodes[i]
      for (; i < kids.length; i++) {
        domNode.insertBefore(render(doc, kids[i], patch.__eventNode), theEnd)
      }
      return domNode
    }
    case __3_REMOVE: {
      var data = patch.__data
      if (!data) {
        domNode.parentNode.removeChild(domNode)
        return domNode
      }
      var entry = data.__entry
      if (typeof entry.__index !== "undefined") {
        domNode.parentNode.removeChild(domNode)
      }
      entry.__data = applyPatchesHelp(domNode, data.__patches)
      return domNode
    }
    case __3_REORDER: {
      return applyPatchReorder(domNode, patch)
    }
    case __3_CUSTOM: {
      return patch.__data(domNode)
    }
    default: {
      throw TypeError("Unknown operation")
    }
  }
}

function applyPatchRedraw(domNode, vNode, eventNode) {
  const doc = domNode.ownerDocument
  var parentNode = domNode.parentNode
  var newNode = render(doc, vNode, eventNode)

  if (!newNode.elm_event_node_ref) {
    newNode.elm_event_node_ref = domNode.elm_event_node_ref
  }

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode)
  }
  return newNode
}

function applyPatchReorder(domNode, patch) {
  const doc = domNode.ownerDocument
  var data = patch.__data

  // remove end inserts
  var frag = applyPatchReorderEndInsertsHelp(doc, data.__endInserts, patch)

  // removals
  domNode = applyPatchesHelp(domNode, data.__patches)

  // inserts
  var inserts = data.__inserts
  for (var i = 0; i < inserts.length; i++) {
    var insert = inserts[i]
    var entry = insert.__entry
    var node =
      entry.__tag === __5_MOVE
        ? entry.__data
        : render(doc, entry.__vnode, patch.__eventNode)
    domNode.insertBefore(node, domNode.childNodes[insert.__index])
  }

  // add end inserts
  if (frag) {
    appendChild(domNode, frag)
  }

  return domNode
}

function applyPatchReorderEndInsertsHelp(doc, endInserts, patch) {
  if (!endInserts) {
    return
  }

  var frag = doc.createDocumentFragment()
  for (var i = 0; i < endInserts.length; i++) {
    var insert = endInserts[i]
    var entry = insert.__entry
    appendChild(
      frag,
      entry.__tag === __5_MOVE
        ? entry.__data
        : render(doc, entry.__vnode, patch.__eventNode)
    )
  }
  return frag
}

export function virtualize(root) {
  // TEXT NODES

  if (root.nodeType === 3) {
    return text(root.textContent)
  }

  // WEIRD NODES

  if (root.nodeType !== 1) {
    return text("")
  }

  // ELEMENT NODES

  var factList = []
  var attrs = root.attributes
  for (var i = attrs.length; i--; ) {
    var attr = attrs[i]
    var name = attr.name
    var value = attr.value

    switch (name) {
      case "style":
        break
      default:
        factList.push(attribute(name, value))
    }
  }

  const rules = root.style
  for (var i = rules.length; i--; ) {
    var name = rules[i]
    var value = rules[name]
    factList.push(style(name, value))
  }

  var tag = root.tagName.toLowerCase()
  var kidList = []
  var kids = root.childNodes

  for (var i = kids.length; i--; ) {
    kidList.push(virtualize(kids[i]))
  }
  return node(tag, factList, kidList)
}

function dekey(keyedNode) {
  var keyedKids = keyedNode.__kids
  var len = keyedKids.length
  var kids = new Array(len)
  for (var i = 0; i < len; i++) {
    kids[i] = keyedKids[i].b
  }

  return {
    $: __2_NODE,
    __tag: keyedNode.__tag,
    __facts: keyedNode.__facts,
    __kids: kids,
    namespace: keyedNode.namespace,
    __descendantsCount: keyedNode.__descendantsCount
  }
}
