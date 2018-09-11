/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 116);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = assert;
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

function assert(test, message) {
  if (!test) {
    debugger; // eslint-disable-line no-debugger
    throw new Error(message);
  }
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



class Strategizer {
  constructor(strategies, evaluators, ruleset) {
    this._strategies = strategies;
    this._evaluators = evaluators;
    this._generation = 0;
    this._internalPopulation = [];
    this._population = [];
    this._generated = [];
    this._terminal = [];
    this._ruleset = ruleset;
    this.populationHash = new Map();
  }
  // Latest generation number.
  get generation() {
    return this._generation;
  }
  // All individuals in the current population.
  get population() {
    return this._population;
  }
  // Individuals of the latest generation.
  get generated() {
    return this._generated;
  }
  // Individuals from the previous generation that were not decended from in the
  // current generation.
  get terminal() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._terminal);
    return this._terminal;
  }
  async generate() {
    // Generate
    let generation = this.generation + 1;
    let generated = await Promise.all(this._strategies.map(strategy => {
      let recipeFilter = recipe => this._ruleset.isAllowed(strategy, recipe);
      return strategy.generate({
        generation: this.generation,
        generated: this.generated.filter(recipeFilter),
        terminal: this.terminal.filter(recipeFilter),
        population: this.population.filter(recipeFilter)
      });
    }));

    let record = {};
    record.generation = generation;
    record.sizeOfLastGeneration = this.generated.length;
    record.generatedDerivationsByStrategy = {};
    for (let i = 0; i < this._strategies.length; i++) {
      record.generatedDerivationsByStrategy[this._strategies[i].constructor.name] = generated[i].length;
    }

    generated = [].concat(...generated);

    // TODO: get rid of this additional asynchrony
    generated = await Promise.all(generated.map(async result => {
      if (result.hash) result.hash = await result.hash;
      return result;
    }));

    record.generatedDerivations = generated.length;
    record.nullDerivations = 0;
    record.invalidDerivations = 0;
    record.duplicateDerivations = 0;
    record.duplicateSameParentDerivations = 0;
    record.nullDerivationsByStrategy = {};
    record.invalidDerivationsByStrategy = {};
    record.duplicateDerivationsByStrategy = {};
    record.duplicateSameParentDerivationsByStrategy = {};

    generated = generated.filter(result => {
      let strategy = result.derivation[0].strategy.constructor.name;
      if (result.hash) {
        let existingResult = this.populationHash.get(result.hash);
        if (existingResult) {
          if (result.derivation[0].parent == existingResult) {
            record.nullDerivations += 1;
            if (record.nullDerivationsByStrategy[strategy] == undefined)
              record.nullDerivationsByStrategy[strategy] = 0;
            record.nullDerivationsByStrategy[strategy]++;
          } else if (existingResult.derivation.map(a => a.parent).indexOf(result.derivation[0].parent) != -1) {
            record.duplicateSameParentDerivations += 1;
            if (record.duplicateSameParentDerivationsByStrategy[strategy] == undefined)
              record.duplicateSameParentDerivationsByStrategy[strategy] = 0;
            record.duplicateSameParentDerivationsByStrategy[strategy]++;
          } else {
            record.duplicateDerivations += 1;
            if (record.duplicateDerivationsByStrategy[strategy] == undefined)
              record.duplicateDerivationsByStrategy[strategy] = 0;
            record.duplicateDerivationsByStrategy[strategy]++;
            this.populationHash.get(result.hash).derivation.push(result.derivation[0]);
          }
          return false;
        }
        this.populationHash.set(result.hash, result);
      }
      if (result.valid === false) {
        record.invalidDerivations++;
        record.invalidDerivationsByStrategy[strategy] = (record.invalidDerivationsByStrategy[strategy] || 0) + 1;
        return false;
      }
      return true;
    });

    let terminal = new Map();
    for (let candidate of this.generated) {
      terminal.set(candidate.result, candidate);
    }
    // TODO(piotrs): This is inefficient, improve at some point.
    for (let result of this.populationHash.values()) {
      for (let {parent} of result.derivation) {
        if (parent && terminal.has(parent.result)) {
          terminal.delete(parent.result);
        }
      }
    }
    terminal = [...terminal.values()];

    record.survivingDerivations = generated.length;

    generated.sort((a, b) => {
      if (a.score > b.score)
        return -1;
      if (a.score < b.score)
        return 1;
      return 0;
    });

    // Evalute
    let evaluations = await Promise.all(this._evaluators.map(strategy => {
      return strategy.evaluate(this, generated);
    }));
    let fitness = Strategizer._mergeEvaluations(evaluations, generated);

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(fitness.length == generated.length);
    for (let i = 0; i < fitness.length; i++) {
      this._internalPopulation.push({
        fitness: fitness[i],
        individual: generated[i],
      });
    }

    // TODO: Instead of push+sort, merge `internalPopulation` with `generated`.
    this._internalPopulation.sort((x, y) => y.fitness - x.fitness);

    // Publish
    this._terminal = terminal;
    this._generation = generation;
    this._generated = generated;
    this._population = this._internalPopulation.map(x => x.individual);

    return record;
  }

  static _mergeEvaluations(evaluations, generated) {
    let n = generated.length;
    let mergedEvaluations = [];
    for (let i = 0; i < n; i++) {
      let merged = NaN;
      for (let evaluation of evaluations) {
        let fitness = evaluation[i];
        if (isNaN(fitness)) {
          continue;
        }
        if (isNaN(merged)) {
          merged = fitness;
        } else {
          // TODO: how should evaluations be combined?
          merged = (merged * i + fitness) / (i + 1);
        }
      }
      if (isNaN(merged)) {
        // TODO: What should happen when there was no evaluation?
        merged = 0.5;
      }
      mergedEvaluations.push(merged);
    }
    return mergedEvaluations;
  }

  static over(results, walker, strategy) {
    walker.onStrategy(strategy);
    results.forEach(result => {
      walker.onResult(result);
      walker.onResultDone();
    });
    walker.onStrategyDone();
    return walker.descendants;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Strategizer;


class Walker {
  constructor() {
    this.descendants = [];
  }

  onStrategy(strategy) {
    this.currentStrategy = strategy;
  }

  onResult(result) {
    this.currentResult = result;
  }

  createDescendant(result, score, hash, valid) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.currentResult, 'no current result');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.currentStrategy, 'no current strategy');
    if (this.currentResult.score)
      score += this.currentResult.score;
    this.descendants.push({
      result,
      score,
      derivation: [{parent: this.currentResult, strategy: this.currentStrategy}],
      hash,
      valid,
    });
  }

  onResultDone() {
    this.currentResult = undefined;
  }

  onStrategyDone() {
    this.currentStrategy = undefined;
  }
}

Strategizer.Walker = Walker;

// TODO: Doc call convention, incl strategies are stateful.
class Strategy {
  async activate(strategizer) {
    // Returns estimated ability to generate/evaluate.
    // TODO: What do these numbers mean? Some sort of indication of the accuracy of the
    // generated individuals and evaluations.
    return {generate: 0, evaluate: 0};
  }
  getResults(inputParams) {
    return inputParams.generated;
  }
  async generate(inputParams) {
    return [];
  }
  async evaluate(strategizer, individuals) {
    return individuals.map(() => NaN);
  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Strategy;


class Ruleset {
  constructor(orderingRules) {
    this._orderingRules = orderingRules;
  }

  isAllowed(strategy, recipe) {
    let forbiddenAncestors = this._orderingRules.get(strategy.constructor);
    if (!forbiddenAncestors) return true;
    // TODO: This can be sped up with AND-ing bitsets of derivation strategies and forbiddenAncestors.
    return !recipe.derivation.some(d => forbiddenAncestors.has(d.strategy.constructor));
  }
}
/* harmony export (immutable) */ __webpack_exports__["c"] = Ruleset;


Ruleset.Builder = class {
  constructor() {
    // Strategy -> [Strategy*]
    this._orderingRules = new Map();
  }

  /**
   * When invoked for strategies (A, B), ensures that B will never follow A in
   * the chain of derivations of all generated recipes.
   *
   * Following sequences are therefore valid: A, B, AB, AAABB, AC, DBC, CADCBCBD
   * Following sequences are therefore invalid: BA, ABA, BCA, DBCA
   *
   * Transitive closure of the ordering is computed.
   * I.e. For orderings (A, B) and (B, C), the ordering (A, C) is implied.
   *
   * Method can be called with multiple strategies at once.
   * E.g. (A, B, C) implies (A, B), (B, C) and transitively (A, C).
   *
   * Method can be called with arrays of strategies, which represent groups.
   * The ordering in the group is not enforced, but the ordering between them is.
   * E.g. ([A, B], [C, D], E) is a shorthand for:
   * (A, C), (A, D), (B, C), (B, D), (C, E), (D, E).
   */
  order(...strategiesOrGroups) {
    for (let i = 0; i < strategiesOrGroups.length - 1; i++) {
      let current = strategiesOrGroups[i], next = strategiesOrGroups[i + 1];
      for (let strategy of Array.isArray(current) ? current : [current]) {
        let set = this._orderingRules.get(strategy);
        if (!set) {
          this._orderingRules.set(strategy, set = new Set());
        }
        for (let nextStrategy of Array.isArray(next) ? next : [next]) {
          set.add(nextStrategy);
        }
      }
    }
    return this;
  }

  build() {
    // Making the ordering transitive.
    let beingExpanded = new Set();
    let alreadyExpanded = new Set();
    for (let strategy of this._orderingRules.keys()) {
      this._transitiveClosureFor(strategy, beingExpanded, alreadyExpanded);
    }
    return new Ruleset(this._orderingRules);
  }

  _transitiveClosureFor(strategy, beingExpanded, alreadyExpanded) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!beingExpanded.has(strategy), 'Detected a loop in the ordering rules');

    let followingStrategies = this._orderingRules.get(strategy);
    if (alreadyExpanded.has(strategy)) return followingStrategies || [];

    if (followingStrategies) {
      beingExpanded.add(strategy);
      for (let following of followingStrategies) {
        for (let expanded of this._transitiveClosureFor(
            following, beingExpanded, alreadyExpanded)) {
          followingStrategies.add(expanded);
        }
      }
      beingExpanded.delete(strategy);
    }
    alreadyExpanded.add(strategy);

    return followingStrategies || [];
  }
};


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_digest_web_js__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__connection_constraint_js__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__particle_js__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__search_js__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__slot_js__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__handle_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__util_js__ = __webpack_require__(5);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt











class Recipe {
  constructor(name) {
    this._particles = [];
    this._handles = [];
    this._slots = [];
    this.name = name;

    // TODO: Recipes should be collections of records that are tagged
    // with a type. Strategies should register the record types they
    // can handle. ConnectionConstraints should be a different record
    // type to particles/handles.
    this._connectionConstraints = [];

    // Obligations are like connection constraints in that they describe
    // required connections between particles/verbs. However, where 
    // connection constraints can be acted upon in order to create these
    // connections, obligations can't be. Instead, they describe requirements
    // that must be discharged before a recipe can be considered to be
    // resolved.
    this._obligations = [];

    this._verbs = [];

    // TODO: Change to array, if needed for search strings of merged recipes.
    this._search = null;

    this._pattern = null;
  }

  newConnectionConstraint(from, to, direction) {
    let result = new __WEBPACK_IMPORTED_MODULE_3__connection_constraint_js__["a" /* ConnectionConstraint */](from, to, direction, 'constraint');
    this._connectionConstraints.push(result);
    return result;
  }

  newObligation(from, to, direction) {
    let result = new __WEBPACK_IMPORTED_MODULE_3__connection_constraint_js__["a" /* ConnectionConstraint */](from, to, direction, 'obligation');
    this._obligations.push(result);
    return result;
  }
  
  removeObligation(obligation) {
    let idx = this._obligations.indexOf(obligation);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx > -1);
    this._obligations.splice(idx, 1);
  }

  removeConstraint(constraint) {
    let idx = this._connectionConstraints.indexOf(constraint);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx >= 0);
    this._connectionConstraints.splice(idx, 1);
  }

  clearConnectionConstraints() {
    this._connectionConstraints = [];
  }

  newParticle(name) {
    let particle = new __WEBPACK_IMPORTED_MODULE_4__particle_js__["a" /* Particle */](this, name);
    this._particles.push(particle);
    return particle;
  }

  removeParticle(particle) {
    let idx = this._particles.indexOf(particle);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx > -1);
    this._particles.splice(idx, 1);
    for (let slotConnection of Object.values(particle._consumedSlotConnections))
      slotConnection.remove();
  }

  newHandle() {
    let handle = new __WEBPACK_IMPORTED_MODULE_7__handle_js__["a" /* Handle */](this);
    this._handles.push(handle);
    return handle;
  }

  removeHandle(handle) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handle.connections.length == 0);
    let idx = this._handles.indexOf(handle);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx > -1);
    this._handles.splice(idx, 1);
  }

  newSlot(name) {
    let slot = new __WEBPACK_IMPORTED_MODULE_6__slot_js__["a" /* Slot */](this, name);
    this._slots.push(slot);
    return slot;
  }

  removeSlot(slot) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(slot.consumeConnections.length == 0);
    let idx = this._slots.indexOf(slot);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx > -1);
    this._slots.splice(idx, 1);
  }

  isResolved() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this), 'Recipe must be normalized to be resolved.');
    if (this._obligations.length > 0)
      return false;
    return this._connectionConstraints.length == 0
        && (this._search === null || this._search.isResolved())
        && this._handles.every(handle => handle.isResolved())
        && this._particles.every(particle => particle.isResolved())
        && this._slots.every(slot => slot.isResolved())
        && this.handleConnections.every(connection => connection.isResolved())
        && this.slotConnections.every(slotConnection => slotConnection.isResolved());

    // TODO: check recipe level resolution requirements, eg there is no slot loops.
  }

  _findDuplicate(items, options) {
    let seenHandles = new Set();
    let duplicateHandle = items.find(handle => {
      if (handle.id) {
        if (seenHandles.has(handle.id)) {
          return handle;
        }
        seenHandles.add(handle.id);
      }
    });
    if (duplicateHandle && options && options.errors) {
      options.errors.set(duplicateHandle, `Has Duplicate ${duplicateHandle instanceof __WEBPACK_IMPORTED_MODULE_7__handle_js__["a" /* Handle */] ? 'Handle' : 'Slot'} '${duplicateHandle.id}'`);
    }
    return duplicateHandle;
  }

  _isValid(options) {
    return !this._findDuplicate(this._handles, options)
        && !this._findDuplicate(this._slots, options)
        && this._handles.every(handle => handle._isValid(options))
        && this._particles.every(particle => particle._isValid(options))
        && this._slots.every(slot => slot._isValid(options))
        && this.handleConnections.every(connection => connection._isValid(options))
        && this.slotConnections.every(connection => connection._isValid(options))
        && (!this.search || this.search.isValid(options));
  }

  get localName() { return this._localName; }
  set localName(name) { this._localName = name; }
  get particles() { return this._particles; } // Particle*
  set particles(particles) { this._particles = particles; }
  get handles() { return this._handles; } // Handle*
  set handles(handles) { this._handles = handles; }
  get slots() { return this._slots; } // Slot*
  set slots(slots) { this._slots = slots; }
  get connectionConstraints() { return this._connectionConstraints; }
  get obligations() { return this._obligations; }
  get verbs() { return this._verbs; }
  set verbs(verbs) { this._verbs = verbs; }
  get search() { return this._search; }
  set search(search) {
    this._search = search;
  }
  setSearchPhrase(phrase) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this._search, 'Cannot override search phrase');
    if (phrase) {
      this._search = new __WEBPACK_IMPORTED_MODULE_5__search_js__["a" /* Search */](phrase);
    }
  }

  get slotConnections() { // SlotConnection*
    let slotConnections = [];
    this._particles.forEach(particle => {
      slotConnections.push(...Object.values(particle.consumedSlotConnections));
    });
    return slotConnections;
  }

  get handleConnections() {
    let handleConnections = [];
    this._particles.forEach(particle => {
      handleConnections.push(...Object.values(particle.connections));
      handleConnections.push(...particle._unnamedConnections);
    });
    return handleConnections;
  }

  isEmpty() {
    return this.particles.length == 0 &&
           this.handles.length == 0 &&
           this.slots.length == 0 &&
           this._connectionConstraints.length == 0;
  }

  findHandle(id) {
    for (let handle of this.handles) {
      if (handle.id == id)
        return handle;
    }
  }

  findSlot(id) {
    for (let slot of this.slots) {
      if (slot.id == id)
        return slot;
    }
  }
  get pattern() { return this._pattern; }
  set pattern(pattern) { this._pattern = pattern; }
  set description(description) {
    let pattern = description.find(desc => desc.name == 'pattern');
    if (pattern) {
      this._pattern = pattern.pattern;
    }
    description.forEach(desc => {
      if (desc.name != 'pattern') {
        let handle = this.handles.find(handle => handle.localName == desc.name);
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handle, `Cannot set description pattern for nonexistent handle ${desc.name}.`);
        handle.pattern = desc.pattern;
      }
    });
  }

  async digest() {
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_digest_web_js__["a" /* digest */])(this.toString());
  }

  normalize(options) {
    if (Object.isFrozen(this)) {
      if (options && options.errors) {
        options.errors.set(this, 'already normalized');
      }
      return;
    }
    if (!this._isValid()) {
      this._findDuplicate(this._handles, options);
      this._findDuplicate(this._slots, options);
      let checkForInvalid = (list) => list.forEach(item => !item._isValid(options));
      checkForInvalid(this._handles);
      checkForInvalid(this._particles);
      checkForInvalid(this._slots);
      checkForInvalid(this.handleConnections);
      checkForInvalid(this.slotConnections);
      return false;
    }
    // Get handles and particles ready to sort connections.
    for (let particle of this._particles) {
      particle._startNormalize();
    }
    for (let handle of this._handles) {
      handle._startNormalize();
    }
    for (let slot of this._slots) {
      slot._startNormalize();
    }

    // Sort and normalize handle connections.
    let connections = this.handleConnections;
    for (let connection of connections) {
      connection._normalize();
    }
    connections.sort(__WEBPACK_IMPORTED_MODULE_8__util_js__["a" /* compareComparables */]);

    // Sort and normalize slot connections.
    let slotConnections = this.slotConnections;
    for (let slotConnection of slotConnections) {
      slotConnection._normalize();
    }
    slotConnections.sort(__WEBPACK_IMPORTED_MODULE_8__util_js__["a" /* compareComparables */]);

    if (this.search) {
      this.search._normalize();
    }

    // Finish normalizing particles and handles with sorted connections.
    for (let particle of this._particles) {
      particle._finishNormalize();
    }
    for (let handle of this._handles) {
      handle._finishNormalize();
    }
    for (let slot of this._slots) {
      slot._finishNormalize();
    }

    let seenHandles = new Set();
    let seenParticles = new Set();
    let seenSlots = new Set();
    let particles = [];
    let handles = [];
    let slots = [];
    // Reorder connections so that interfaces come last.
    // TODO: update handle-connection comparison method instead?
    for (let connection of connections.filter(c => !c.type || !c.type.isInterface).concat(connections.filter(c => !!c.type && !!c.type.isInterface))) {
      if (!seenParticles.has(connection.particle)) {
        particles.push(connection.particle);
        seenParticles.add(connection.particle);
      }
      if (connection.handle && !seenHandles.has(connection.handle)) {
        handles.push(connection.handle);
        seenHandles.add(connection.handle);
      }
    }

    for (let slotConnection of slotConnections) {
      if (slotConnection.targetSlot && !seenSlots.has(slotConnection.targetSlot)) {
        slots.push(slotConnection.targetSlot);
        seenSlots.add(slotConnection.targetSlot);
      }
      Object.values(slotConnection.providedSlots).forEach(ps => {
        if (!seenSlots.has(ps)) {
          slots.push(ps);
          seenSlots.add(ps);
        }
      });
    }

    let orphanedHandles = this._handles.filter(handle => !seenHandles.has(handle));
    orphanedHandles.sort(__WEBPACK_IMPORTED_MODULE_8__util_js__["a" /* compareComparables */]);
    handles.push(...orphanedHandles);

    let orphanedParticles = this._particles.filter(particle => !seenParticles.has(particle));
    orphanedParticles.sort(__WEBPACK_IMPORTED_MODULE_8__util_js__["a" /* compareComparables */]);
    particles.push(...orphanedParticles);

    let orphanedSlots = this._slots.filter(slot => !seenSlots.has(slot));
    orphanedSlots.sort(__WEBPACK_IMPORTED_MODULE_8__util_js__["a" /* compareComparables */]);
    slots.push(...orphanedSlots);

    // Put particles and handles in their final ordering.
    this._particles = particles;
    this._handles = handles;
    this._slots = slots;
    this._connectionConstraints.sort(__WEBPACK_IMPORTED_MODULE_8__util_js__["a" /* compareComparables */]);

    Object.freeze(this._particles);
    Object.freeze(this._handles);
    Object.freeze(this._slots);
    Object.freeze(this._connectionConstraints);
    Object.freeze(this);

    return true;
  }

  clone(cloneMap) {
    // for now, just copy everything

    let recipe = new Recipe(this.name);

    if (cloneMap == undefined)
      cloneMap = new Map();

    this._copyInto(recipe, cloneMap);

    // TODO: figure out a better approach than stashing the cloneMap permanently
    // on the recipe
    recipe._cloneMap = cloneMap;

    return recipe;
  }

  mergeInto(recipe) {
    let cloneMap = new Map();
    let numHandles = recipe._handles.length;
    let numParticles = recipe._particles.length;
    let numSlots = recipe._slots.length;
    this._copyInto(recipe, cloneMap);
    return {
      handles: recipe._handles.slice(numHandles),
      particles: recipe._particles.slice(numParticles),
      slots: recipe._slots.slice(numSlots),
      cloneMap
    };
  }

  _copyInto(recipe, cloneMap) {
    function cloneTheThing(object) {
      let clonedObject = object._copyInto(recipe, cloneMap);
      cloneMap.set(object, clonedObject);
    }

    this._handles.forEach(cloneTheThing);
    this._particles.forEach(cloneTheThing);
    this._slots.forEach(cloneTheThing);
    this._connectionConstraints.forEach(cloneTheThing);
    this._obligations.forEach(cloneTheThing);
    recipe.verbs = recipe.verbs.slice();
    if (this.search) {
      this.search._copyInto(recipe);
    }
    if (this.pattern) {
      if (recipe.pattern) {
        // TODO(mmandlis): Join |this.pattern| with the pattern already existing in the recipe.
      } else {
        recipe.pattern = this.pattern;
      }
    }
  }

  updateToClone(dict) {
    let result = {};
    Object.keys(dict).forEach(key => result[key] = this._cloneMap.get(dict[key]));
    return result;
  }

  static over(results, walker, strategy) {
    return __WEBPACK_IMPORTED_MODULE_2__strategizer_strategizer_js__["a" /* Strategizer */].over(results, walker, strategy);
  }

  _makeLocalNameMap() {
    let names = new Set();
    for (let particle of this.particles) {
      names.add(particle.localName);
    }
    for (let handle of this.handles) {
      names.add(handle.localName);
    }
    for (let slot of this.slots) {
      names.add(slot.localName);
    }

    let nameMap = new Map();
    let i = 0;
    for (let particle of this.particles) {
      let localName = particle.localName;
      if (!localName) {
        do {
          localName = `particle${i++}`;
        } while (names.has(localName));
      }
      nameMap.set(particle, localName);
    }

    i = 0;
    for (let handle of this.handles) {
      let localName = handle.localName;
      if (!localName) {
        do {
          localName = `handle${i++}`;
        } while (names.has(localName));
      }
      nameMap.set(handle, localName);
    }

    i = 0;
    for (let slot of this.slots) {
      let localName = slot.localName;
      if (!localName) {
        do {
          localName = `slot${i++}`;
        } while (names.has(localName));
      }
      nameMap.set(slot, localName);
    }

    return nameMap;
  }

  // TODO: Add a normalize() which strips local names and puts and nested
  //       lists into a normal ordering.
  //
  // use { showUnresolved: true } in options to see why a recipe can't resolve.
  toString(options) {
    let nameMap = this._makeLocalNameMap();
    let result = [];
    let verbs = this.verbs.length > 0 ? ` ${this.verbs.map(verb => `&${verb}`).join(' ')}` : '';
    result.push(`recipe${this.name ? ` ${this.name}` : ''}${verbs}`);
    if (this.search) {
      result.push(this.search.toString(options).replace(/^|(\n)/g, '$1  '));
    }
    for (let constraint of this._connectionConstraints) {
      let constraintStr = constraint.toString().replace(/^|(\n)/g, '$1  ');
      if (options && options.showUnresolved) {
        constraintStr = constraintStr.concat(' // unresolved connection-constraint');
      }
      result.push(constraintStr);
    }
    for (let handle of this.handles) {
      result.push(handle.toString(nameMap, options).replace(/^|(\n)/g, '$1  '));
    }
    for (let slot of this.slots) {
      let slotString = slot.toString(nameMap, options);
      if (slotString) {
        result.push(slotString.replace(/^|(\n)/g, '$1  '));
      }
    }
    for (let particle of this.particles) {
      result.push(particle.toString(nameMap, options).replace(/^|(\n)/g, '$1  '));
    }
    if (this.pattern || this.handles.find(h => h.pattern)) {
      result.push(`  description \`${this.pattern}\``);
      this.handles.forEach(h => {
        if (h.pattern) {
          result.push(`    ${h.localName} \`${h.pattern}\``);
        }
      });
    }
    if (this._obligations.length > 0) {
      result.push('  obligations');
      for (let obligation of this._obligations) {
        let obligationStr = obligation.toString(nameMap, options).replace(/^|(\n)/g, '$1    ');
        result.push(obligationStr);
      }
    }
    return result.join('\n');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Recipe;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__walker_base_js__ = __webpack_require__(102);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



class Walker extends __WEBPACK_IMPORTED_MODULE_0__walker_base_js__["a" /* WalkerBase */] {
  onResult(result) {
    super.onResult(result);
    let recipe = result.result;
    let updateList = [];

    // update phase - walk through recipe and call onRecipe,
    // onHandle, etc.

    if (this.onRecipe) {
      result = this.onRecipe(recipe, result);
      if (!this.isEmptyResult(result))
        updateList.push({continuation: result});
    }
    for (let particle of recipe.particles) {
      if (this.onParticle) {
        let result = this.onParticle(recipe, particle);
        if (!this.isEmptyResult(result))
          updateList.push({continuation: result, context: particle});
      }
    }
    for (let handleConnection of recipe.handleConnections) {
      if (this.onHandleConnection) {
        let result = this.onHandleConnection(recipe, handleConnection);
        if (!this.isEmptyResult(result))
          updateList.push({continuation: result, context: handleConnection});
      }
    }
    for (let handle of recipe.handles) {
      if (this.onHandle) {
        let result = this.onHandle(recipe, handle);
        if (!this.isEmptyResult(result))
          updateList.push({continuation: result, context: handle});
      }
    }
    for (let slotConnection of recipe.slotConnections) {
      if (this.onSlotConnection) {
        let result = this.onSlotConnection(recipe, slotConnection);
        if (!this.isEmptyResult(result))
          updateList.push({continuation: result, context: slotConnection});
      }
    }
    for (let slot of recipe.slots) {
      if (this.onSlot) {
        let result = this.onSlot(recipe, slot);
        if (!this.isEmptyResult(result))
          updateList.push({continuation: result, context: slot});
      }
    }
    for (let obligation of recipe.obligations) {
      if (this.onObligation) {
        let result = this.onObligation(recipe, obligation);
        if (!this.isEmptyResult(result))
          updateList.push({continuation: result, context: obligation});
      }
    }

    this._runUpdateList(recipe, updateList);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Walker;


Walker.Permuted = __WEBPACK_IMPORTED_MODULE_0__walker_base_js__["a" /* WalkerBase */].Permuted;
Walker.Independent = __WEBPACK_IMPORTED_MODULE_0__walker_base_js__["a" /* WalkerBase */].Independent;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shape_js__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__schema_js__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__type_variable_js__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tuple_fields_js__ = __webpack_require__(113);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__recipe_type_checker_js__ = __webpack_require__(8);
// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




function addType(name, arg) {
  let lowerName = name[0].toLowerCase() + name.substring(1);
  Object.defineProperty(Type, `new${name}`, {
    value: function(arg) {
      return new Type(name, arg);
    }});
  let upperArg = arg ? arg[0].toUpperCase() + arg.substring(1) : '';
  Object.defineProperty(Type.prototype, `${lowerName}${upperArg}`, {
    get: function() {
      if (!this[`is${name}`])
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this[`is${name}`], `{${this.tag}, ${this.data}} is not of type ${name}`);
      return this.data;
    }});
  Object.defineProperty(Type.prototype, `is${name}`, {
    get: function() {
      return this.tag == name;
    }});
}

class Type {
  constructor(tag, data) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(typeof tag == 'string');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(data);
    if (tag == 'Entity') {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(data instanceof __WEBPACK_IMPORTED_MODULE_2__schema_js__["a" /* Schema */]);
    }
    if (tag == 'Collection') {
      if (!(data instanceof Type) && data.tag && data.data) {
        data = new Type(data.tag, data.data);
      }
    }
    if (tag == 'Variable') {
      if (!(data instanceof __WEBPACK_IMPORTED_MODULE_3__type_variable_js__["a" /* TypeVariable */])) {
        data = new __WEBPACK_IMPORTED_MODULE_3__type_variable_js__["a" /* TypeVariable */](data.name, data.constraint);
      }
    }
    this.tag = tag;
    this.data = data;
  }

  mergeTypeVariablesByName(variableMap) {
    if (this.isVariable) {
      let name = this.variable.name;
      let variable = variableMap.get(name);
      if (!variable) {
        variable = this;
        variableMap.set(name, this);
      } else {
        if (variable.variable.constraint || this.variable.constraint) {
          let mergedConstraint = __WEBPACK_IMPORTED_MODULE_3__type_variable_js__["a" /* TypeVariable */].maybeMergeConstraints(variable.variable, this.variable);
          if (!mergedConstraint) {
            throw new Error('could not merge type variables');
          }
          variable.variable.constraint = mergedConstraint;
        }
      }
      return variable;
    }

    if (this.isCollection) {
      let primitiveType = this.primitiveType();
      let result = primitiveType.mergeTypeVariablesByName(variableMap);
      if (result === primitiveType) {
        return this;
      }
      return result.collectionOf();
    }

    if (this.isInterface) {
      let shape = this.interfaceShape.clone(new Map());
      shape._typeVars.map(({object, field}) => object[field] = object[field].mergeTypeVariablesByName(variableMap));
      // TODO: only build a new type when a variable is modified
      return Type.newInterface(shape);
    }

    return this;
  }

  static unwrapPair(type1, type2) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(type1 instanceof Type);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(type2 instanceof Type);
    if (type1.isCollection && type2.isCollection)
      return Type.unwrapPair(type1.primitiveType(), type2.primitiveType());
    return [type1, type2];
  }


  // TODO: update call sites to use the type checker instead (since they will
  // have additional information about direction etc.)
  equals(type) {
    return __WEBPACK_IMPORTED_MODULE_5__recipe_type_checker_js__["a" /* TypeChecker */].compareTypes({type: this}, {type});
  }

  _applyExistenceTypeTest(test) {
    if (this.isCollection)
      return this.primitiveType()._applyExistenceTypeTest(test);
    if (this.isInterface)
      return this.data._applyExistenceTypeTest(test);
    return test(this);
  }

  get hasVariable() {
    return this._applyExistenceTypeTest(type => type.isVariable);
  }

  get hasUnresolvedVariable() {
    return this._applyExistenceTypeTest(type => type.isVariable && !type.variable.isResolved());
  }

  get hasVariableReference() {
    return this._applyExistenceTypeTest(type => type.isVariableReference);
  }

  // TODO: remove this in favor of a renamed collectionType
  primitiveType() {
    return this.collectionType;
  }

  collectionOf() {
    return Type.newCollection(this);
  }

  resolvedType() {
    if (this.isCollection) {
      let primitiveType = this.primitiveType();
      let resolvedPrimitiveType = primitiveType.resolvedType();
      return primitiveType !== resolvedPrimitiveType ? resolvedPrimitiveType.collectionOf() : this;
    }
    if (this.isVariable) {
      let resolution = this.variable.resolution;
      if (resolution)
        return resolution;
    }
    if (this.isInterface) {
      return Type.newInterface(this.data.resolvedType());
    }
    return this;
  }

  isResolved() {
    // TODO: one of these should not exist.
    return !this.hasUnresolvedVariable;
  }

  canEnsureResolved() {
    if (this.isResolved())
      return true;
    if (this.isInterface)
      return this.interfaceShape.canEnsureResolved();
    if (this.isVariable)
      return this.variable.canEnsureResolved();
    if (this.isCollection)
      return this.primitiveType().canEnsureResolved();
    return true;
  }

  maybeEnsureResolved() {
    if (this.isInterface)
      return this.interfaceShape.maybeEnsureResolved();
    if (this.isVariable)
      return this.variable.maybeEnsureResolved();
    if (this.isCollection)
      return this.primitiveType().maybeEnsureResolved();
    return true;
  }

  get canWriteSuperset() {
    if (this.isVariable)
      return this.variable.canWriteSuperset;
    if (this.isEntity)
      return this;
    if (this.isInterface)
      return Type.newInterface(this.interfaceShape.canWriteSuperset);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `canWriteSuperset not implemented for ${this}`);
  }

  get canReadSubset() {
    if (this.isVariable)
      return this.variable.canReadSubset;
    if (this.isEntity)
      return this;
    if (this.isInterface)
      return Type.newInterface(this.interfaceShape.canReadSubset);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `canReadSubset not implemented for ${this}`);
  }

  isMoreSpecificThan(type) {
    if (this.tag !== type.tag)
      return false;
    if (this.isEntity)
      return this.entitySchema.isMoreSpecificThan(type.entitySchema);
    if (this.isInterface)
      return this.interfaceShape.isMoreSpecificThan(type.interfaceShape);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `contains not implemented for ${this}`);
  }

  static _canMergeCanReadSubset(type1, type2) {
    if (type1.canReadSubset && type2.canReadSubset) {
      if (type1.canReadSubset.tag !== type2.canReadSubset.tag)
        return false;
      if (type1.canReadSubset.isEntity)
        return __WEBPACK_IMPORTED_MODULE_2__schema_js__["a" /* Schema */].intersect(type1.canReadSubset.entitySchema, type2.canReadSubset.entitySchema) !== null;
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `_canMergeCanReadSubset not implemented for types tagged with ${type1.canReadSubset.tag}`);
    }
    return true;
  }

  static _canMergeCanWriteSuperset(type1, type2) {
    if (type1.canWriteSuperset && type2.canWriteSuperset) {
      if (type1.canWriteSuperset.tag !== type2.canWriteSuperset.tag)
        return false;
      if (type1.canWriteSuperset.isEntity)
        return __WEBPACK_IMPORTED_MODULE_2__schema_js__["a" /* Schema */].union(type1.canWriteSuperset.entitySchema, type2.canWriteSuperset.entitySchema) !== null;

    }
    return true;
  }

  // Tests whether two types' constraints are compatible with each other
  static canMergeConstraints(type1, type2) {
    return Type._canMergeCanReadSubset(type1, type2) && Type._canMergeCanWriteSuperset(type1, type2);
  }

  // Clone a type object.
  // When cloning multiple types, variables that were associated with the same name
  // before cloning should still be associated after cloning. To maintain this 
  // property, create a Map() and pass it into all clone calls in the group.
  clone(variableMap) {
    let type = this.resolvedType();
    if (type.isVariable) {
      if (variableMap.has(type.variable)) {
        return new Type('Variable', variableMap.get(type.variable));
      } else {
        let newTypeVariable = __WEBPACK_IMPORTED_MODULE_3__type_variable_js__["a" /* TypeVariable */].fromLiteral(type.variable.toLiteral());
        variableMap.set(type.variable, newTypeVariable);
        return new Type('Variable', newTypeVariable);
      }
    }
    if (type.data.clone) {
      return new Type(type.tag, type.data.clone(variableMap));
    }
    return Type.fromLiteral(type.toLiteral());
  }

  // Clone a type object, maintaining resolution information.
  // This function SHOULD NOT BE USED at the type level. In order for type variable
  // information to be maintained correctly, an entire context root needs to be
  // cloned.
  _cloneWithResolutions(variableMap) {
    if (this.isVariable) {
      if (variableMap.has(this.variable)) {
        return new Type('Variable', variableMap.get(this.variable));
      } else {
        let newTypeVariable = __WEBPACK_IMPORTED_MODULE_3__type_variable_js__["a" /* TypeVariable */].fromLiteral(this.variable.toLiteralIgnoringResolutions());
        if (this.variable.resolution)
          newTypeVariable.resolution = this.variable.resolution._cloneWithResolutions(variableMap);
        if (this.variable._canReadSubset)
          newTypeVariable.canReadSubset = this.variable.canReadSubset._cloneWithResolutions(variableMap);
        if (this.variable._canWriteSuperset)
          newTypeVariable.canWriteSuperset = this.variable.canWriteSuperset._cloneWithResolutions(variableMap);
        variableMap.set(this.variable, newTypeVariable);
        return new Type('Variable', newTypeVariable);
      }
    }
    if (this.data._cloneWithResolutions) {
      return new Type(this.tag, this.data._cloneWithResolutions(variableMap));
    }
    return Type.fromLiteral(this.toLiteral());
  }

  toLiteral() {
    if (this.isVariable && this.variable.resolution) {
      return this.variable.resolution.toLiteral();
    }
    if (this.data.toLiteral)
      return {tag: this.tag, data: this.data.toLiteral()};
    return this;
  }

  static _deliteralizer(tag) {
    switch (tag) {
      case 'Interface':
        return __WEBPACK_IMPORTED_MODULE_1__shape_js__["a" /* Shape */].fromLiteral;
      case 'Entity':
        return __WEBPACK_IMPORTED_MODULE_2__schema_js__["a" /* Schema */].fromLiteral;
      case 'Collection':
        return Type.fromLiteral;
      case 'Tuple':
        return __WEBPACK_IMPORTED_MODULE_4__tuple_fields_js__["a" /* TupleFields */].fromLiteral;
      case 'Variable':
        return __WEBPACK_IMPORTED_MODULE_3__type_variable_js__["a" /* TypeVariable */].fromLiteral;
      default:
        return a => a;
    }
  }

  static fromLiteral(literal) {
    if (literal.tag == 'SetView') {
      // TODO: SetView is deprecated, remove when possible.
      literal.tag = 'Collection';
    }
    return new Type(literal.tag, Type._deliteralizer(literal.tag)(literal.data));
  }

  // TODO: is this the same as _applyExistenceTypeTest
  hasProperty(property) {
    if (property(this))
      return true;
    if (this.isCollection)
      return this.collectionType.hasProperty(property);
    return false;
  }

  toString() {
    if (this.isCollection)
      return `[${this.primitiveType().toString()}]`;
    if (this.isEntity)
      return this.entitySchema.toInlineSchemaString();
    if (this.isInterface)
      return this.interfaceShape.name;
    if (this.isTuple)
      return this.tupleFields.toString();
    if (this.isVariableReference)
      return `~${this.data}`;
    if (this.isManifestReference)
      return this.data;
    if (this.isVariable)
      return `~${this.data.name}`;
    if (this.isSlot)
      return 'Slot';
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `Add support to serializing type: ${JSON.stringify(this)}`);
  }

  getEntitySchema() {
    if (this.isCollection) {
      return this.primitiveType().getEntitySchema();
    }
    if (this.isEntity) {
      return this.entitySchema;
    }
    if (this.isVariable) {
      if (this.variable.isResolved()) {
        return this.resolvedType().getEntitySchema();
      }
    }
  }

  toPrettyString() {
    // Try extract the description from schema spec.
    let entitySchema = this.getEntitySchema();
    if (entitySchema) {
      if (this.isCollection && entitySchema.description.plural) {
        return entitySchema.description.plural;
      }
      if (this.isEntity && entitySchema.description.pattern) {
        return entitySchema.description.pattern;
      }
    }

    if (this.isRelation) {
      return JSON.stringify(this.data);
    }
    if (this.isCollection) {
      return `${this.primitiveType().toPrettyString()} List`;
    }
    if (this.isVariable)
      return this.variable.isResolved() ? this.resolvedType().toPrettyString() : `[~${this.name}]`;
    if (this.isEntity) {
      // Spit MyTypeFOO to My Type FOO
      if (this.entitySchema.name) {
        return this.entitySchema.name.replace(/([^A-Z])([A-Z])/g, '$1 $2').replace(/([A-Z][^A-Z])/g, ' $1').replace(/[\s]+/g, ' ').trim();
      }
      return JSON.stringify(this.entitySchema._model);
    }
    if (this.isTuple)
      return this.tupleFields.toString();
    if (this.isInterface)
      return this.interfaceShape.toPrettyString();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Type;


addType('Entity', 'schema');
addType('Variable');
addType('Collection', 'type');
addType('Relation', 'entities');
addType('Interface', 'shape');
addType('Tuple', 'fields');
addType('Slot');








/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export compareNulls */
/* harmony export (immutable) */ __webpack_exports__["b"] = compareStrings;
/* harmony export (immutable) */ __webpack_exports__["d"] = compareNumbers;
/* unused harmony export compareBools */
/* harmony export (immutable) */ __webpack_exports__["c"] = compareArrays;
/* unused harmony export compareObjects */
/* harmony export (immutable) */ __webpack_exports__["a"] = compareComparables;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt


function compareNulls(o1, o2) {
  if (o1 == o2) return 0;
  if (o1 == null) return -1;
  return 1;
}

function compareStrings(s1, s2) {
  if (s1 == null || s2 == null) return compareNulls(s1, s2);
  return s1.localeCompare(s2);
}

function compareNumbers(n1, n2) {
  if (n1 == null || n2 == null) return compareNulls(n1, n2);
  return n1 - n2;
}

function compareBools(b1, b2) {
  if (b1 == null || b2 == null) return compareNulls(b1, b2);
  return b1 - b2;
}

function compareArrays(a1, a2, compare) {
  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(a1 != null);
  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(a2 != null);
  if (a1.length != a2.length) return compareNumbers(a1.length, a2.length);
  for (let i = 0; i < a1.length; i++) {
    let result;
    if ((result = compare(a1[i], a2[i])) != 0) return result;
  }
  return 0;
}

function compareObjects(o1, o2, compare) {
  let keys = Object.keys(o1);
  let result;
  if ((result = compareNumbers(keys.length, Object.keys(o2).length)) != 0) return result;
  for (let key of keys) {
    if ((result = compare(o1[key], o2[key])) != 0) return result;
  }
  return 0;
}

function compareComparables(o1, o2) {
  if (o1 == null || o2 == null) return compareNulls(o1, o2);
  return o1._compareTo(o2);
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/*
  Copyright 2015 Google Inc. All Rights Reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

let events = [];
let pid;
let now;
if (typeof document == 'object') {
  pid = 42;
  now = function() {
    return performance.now() * 1000;
  };
} else {
  pid = process.pid;
  now = function() {
    let t = process.hrtime();
    return t[0] * 1000000 + t[1] / 1000;
  };
}

let flowId = 0;

function parseInfo(info) {
  if (!info)
    return {};
  if (typeof info == 'function')
    return parseInfo(info());
  if (info.toTraceInfo)
    return parseInfo(info.toTraceInfo());
  return info;
}

let streamingCallbacks = [];
function pushEvent(event) {
    event.pid = pid;
    event.tid = 0;
    if (!event.args) {
      delete event.args;
    }
    if (!event.ov) {
      delete event.ov;
    }
    if (!event.cat) {
      event.cat = '';
    }
    events.push(event);
    Promise.resolve().then(() => {
      for (let {callback, predicate} of streamingCallbacks) {
          if (!predicate || predicate(event)) callback(event);
      }
    });
}

let module = {exports: {}};
const Tracing = module.exports;
/* harmony export (immutable) */ __webpack_exports__["a"] = Tracing;

module.exports.enabled = false;
module.exports.enable = function() {
  module.exports.enabled = true;
  init();
};

// TODO: Add back support for options.
//module.exports.options = options;
//var enabled = Boolean(options.traceFile);

function init() {
  let result = {
    wait: async function(v) {
      return v;
    },
    start: function() {
      return this;
    },
    end: function() {
      return this;
    },
    step: function() {
      return this;
    },
    addArgs: function() {
    },
    endWith: async function(v) {
      return v;
    },
  };
  module.exports.wrap = function(info, fn) {
    return fn;
  };
  module.exports.start = function(info, fn) {
    return result;
  };
  module.exports.flow = function(info, fn) {
    return result;
  };

  if (!module.exports.enabled) {
    return;
  }

  module.exports.wrap = function(info, fn) {
    return function(...args) {
      let t = module.exports.start(info);
      try {
        return fn(...args);
      } finally {
        t.end();
      }
    };
  };

  function startSyncTrace(info) {
    info = parseInfo(info);
    let args = info.args;
    let begin = now();
    return {
      addArgs: function(extraArgs) {
        args = Object.assign(args || {}, extraArgs);
      },
      end: function(endInfo = {}, flow) {
        endInfo = parseInfo(endInfo);
        if (endInfo.args) {
          args = Object.assign(args || {}, endInfo.args);
        }
        endInfo = Object.assign({}, info, endInfo);
        this.endTs = now();
        pushEvent({
          ph: 'X',
          ts: begin,
          dur: this.endTs - begin,
          cat: endInfo.cat,
          name: endInfo.name,
          ov: endInfo.overview,
          args: args,
          // Arcs Devtools Specific:
          flowId: flow && flow.id(),
          seq: endInfo.sequence
        });
      },
      beginTs: begin
    };
  }
  module.exports.start = function(info) {
    let trace = startSyncTrace(info);
    let flow;
    let baseInfo = {cat: info.cat, name: info.name + ' (async)', overview: info.overview, sequence: info.sequence};
    return {
      async wait(v, info) {
        let flowExisted = !!flow;
        if (!flowExisted) {
          flow = module.exports.flow(baseInfo);
        }
        trace.end(info, flow);
        if (flowExisted) {
          flow.step(Object.assign({ts: trace.beginTs}, baseInfo));
        } else {
          flow.start({ts: trace.endTs});
        }
        trace = null;
        try {
          return await v;
        } finally {
          trace = startSyncTrace(baseInfo);
        }
      },
      addArgs(extraArgs) {
        trace.addArgs(extraArgs);
      },
      end(endInfo) {
        trace.end(endInfo, flow);
        if (flow) {
          flow.end({ts: trace.beginTs});
        }
      },
      async endWith(v, endInfo) {
        if (Promise.resolve(v) === v) { // If v is a promise.
          v = this.wait(v);
          try {
            return await v;
          } finally {
            this.end(endInfo);
          }
        } else { // If v is not a promise.
          this.end(endInfo);
          return v;
        }
      }
    };
  };
  module.exports.flow = function(info) {
    info = parseInfo(info);
    let id = flowId++;
    let started = false;
    return {
      start: function(startInfo) {
        let ts = (startInfo && startInfo.ts) || now();
        started = true;
        pushEvent({
          ph: 's',
          ts,
          cat: info.cat,
          name: info.name,
          ov: info.overview,
          args: info.args,
          id: id,
          seq: info.sequence
        });
        return this;
      },
      end: function(endInfo) {
        if (!started) return;
        let ts = (endInfo && endInfo.ts) || now();
        endInfo = parseInfo(endInfo);
        pushEvent({
          ph: 'f',
          bp: 'e', // binding point is enclosing slice.
          ts,
          cat: info.cat,
          name: info.name,
          ov: info.overview,
          args: endInfo && endInfo.args,
          id: id,
          seq: info.sequence
        });
        return this;
      },
      step: function(stepInfo) {
        if (!started) return;
        let ts = (stepInfo && stepInfo.ts) || now();
        stepInfo = parseInfo(stepInfo);
        pushEvent({
          ph: 't',
          ts,
          cat: info.cat,
          name: info.name,
          ov: info.overview,
          args: stepInfo && stepInfo.args,
          id: id,
          seq: info.sequence
        });
        return this;
      },
      id: () => id
    };
  };
  module.exports.save = function() {
    return {traceEvents: events};
  };
  module.exports.download = function() {
    let a = document.createElement('a');
    a.download = 'trace.json';
    a.href = 'data:text/plain;base64,' + btoa(JSON.stringify(module.exports.save()));
    a.click();
  };
  module.exports.now = now;
  module.exports.stream = function(callback, predicate) {
    streamingCallbacks.push({callback, predicate});
  };
  module.exports.__clearForTests = function() {
    events.length = 0;
    streamingCallbacks.length = 0;
  };
}

init();

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(67)))

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




class Shape {
  constructor(recipe, particles, handles, hcs) {
    this.recipe = recipe;
    this.particles = particles;
    this.handles = handles;
    this.reverse = new Map();
    for (let p in particles)
      this.reverse.set(particles[p], p);
    for (let h of handles.keys())
      this.reverse.set(handles.get(h), h);
    for (let hc in hcs)
      this.reverse.set(hcs[hc], hc);
  }
}

class RecipeUtil {
  static makeShape(particles, handles, map, recipe) {
    recipe = recipe || new __WEBPACK_IMPORTED_MODULE_0__recipe_js__["a" /* Recipe */]();
    let pMap = {};
    let hMap = new Map();
    let hcMap = {};
    particles.forEach(particle => pMap[particle] = recipe.newParticle(particle));
    handles.forEach(handle => hMap.set(handle, recipe.newHandle()));
    Object.keys(map).forEach(key => {
      Object.keys(map[key]).forEach(name => {
        let handle = map[key][name];
        let direction = '=';
        let tags = [];
        if (handle.handle) {
        // NOTE: for now, '=' on the shape means "accept anything". This is going
        // to change when we redo capabilities; for now it's modeled by mapping '=' to
        // '=' rather than to 'inout'.

          direction = {'->': 'out', '<-': 'in', '=': '='}[handle.direction];
          tags = handle.tags || [];
          handle = handle.handle;
        }
        if (handle.localName)
          hMap.get(handle).localName = handle.localName;

        let connection = pMap[key].addConnectionName(name);
        connection.direction = direction;
        hMap.get(handle).tags = tags;
        connection.connectToHandle(hMap.get(handle));
        hcMap[key + ':' + name] = pMap[key].connections[name];
      });
    });
    return new Shape(recipe, pMap, hMap, hcMap);
  }

  static recipeToShape(recipe) {
    let particles = {};
    let id = 0;
    recipe.particles.forEach(particle => particles[particle.name] = particle);
    let handles = new Map();
    recipe.handles.forEach(handle => handles.set('h' + id++, handle));
    let hcs = {};
    recipe.handleConnections.forEach(hc => hcs[hc.particle.name + ':' + hc.name] = hc);
    return new Shape(recipe, particles, handles, hcs);
  }

  static find(recipe, shape) {

    function _buildNewHCMatches(recipe, shapeHC, match, outputList) {
      let {forward, reverse, score} = match;
      let matchFound = false;
      for (let recipeHC of recipe.handleConnections) {
        // TODO are there situations where multiple handleConnections should
        // be allowed to point to the same one in the recipe?
        if (reverse.has(recipeHC))
          continue;

        // TODO support unnamed shape particles.
        if (recipeHC.particle.name != shapeHC.particle.name)
          continue;

        if (shapeHC.name && shapeHC.name != recipeHC.name)
          continue;

        let acceptedDirections = {'in': ['in', 'inout'], 'out': ['out', 'inout'], '=': ['in', 'out', 'inout'], 'inout': ['inout'], 'host': ['host']};
        if (recipeHC.direction) {
          if (!acceptedDirections[shapeHC.direction].includes(recipeHC.direction))
            continue;
        }

        if (shapeHC.handle && recipeHC.handle && shapeHC.handle.localName && shapeHC.handle.localName !== recipeHC.handle.localName)
          continue;

        // recipeHC is a candidate for shapeHC. shapeHC references a
        // particle, so recipeHC must reference the matching particle,
        // or a particle that isn't yet mapped from shape.
        if (reverse.has(recipeHC.particle)) {
          if (reverse.get(recipeHC.particle) != shapeHC.particle)
            continue;
        } else if (forward.has(shapeHC.particle)) {
          // we've already mapped the particle referenced by shapeHC
          // and it doesn't match recipeHC's particle as recipeHC's
          // particle isn't mapped
          continue;
        }

        // shapeHC doesn't necessarily reference a handle, but if it does
        // then recipeHC needs to reference the matching handle, or one
        // that isn't yet mapped, or no handle yet.
        if (shapeHC.handle && recipeHC.handle) {
          if (reverse.has(recipeHC.handle)) {
            if (reverse.get(recipeHC.handle) != shapeHC.handle)
              continue;
          } else if (forward.has(shapeHC.handle) && forward.get(shapeHC.handle) !== null) {
            continue;
          }
          // Check whether shapeHC and recipeHC reference the same handle.
          // Note: the id of a handle with 'copy' fate changes during recipe instantiation, hence comparing to original id too.
          // Skip the check if handles have 'create' fate (their ids are arbitrary).
          if ((shapeHC.handle.fate != 'create' || (recipeHC.handle.fate != 'create' && recipeHC.handle.originalFate != 'create')) &&
              shapeHC.handle.id != recipeHC.handle.id && shapeHC.handle.id != recipeHC.handle.originalId) {
            // this is a different handle.
            continue;
          }
        }

        // clone forward and reverse mappings and establish new components.
        let newMatch = {forward: new Map(forward), reverse: new Map(reverse), score};
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(!newMatch.forward.has(shapeHC.particle) || newMatch.forward.get(shapeHC.particle) == recipeHC.particle);
        newMatch.forward.set(shapeHC.particle, recipeHC.particle);
        newMatch.reverse.set(recipeHC.particle, shapeHC.particle);
        if (shapeHC.handle) {
          if (!recipeHC.handle) {
            if (!newMatch.forward.has(shapeHC.handle)) {
              newMatch.forward.set(shapeHC.handle, null);
              newMatch.score -= 2;
            }
          } else {
            newMatch.forward.set(shapeHC.handle, recipeHC.handle);
            newMatch.reverse.set(recipeHC.handle, shapeHC.handle);
          }
        }
        newMatch.forward.set(shapeHC, recipeHC);
        newMatch.reverse.set(recipeHC, shapeHC);
        outputList.push(newMatch);
        matchFound = true;
      }

      if (matchFound == false) {
        // The current handle connection from the shape doesn't match anything
        // in the recipe. Find (or create) a particle for it.
        let newMatches = [];
        _buildNewParticleMatches(recipe, shapeHC.particle, match, newMatches);
        newMatches.forEach(newMatch => {
          // the shape references a handle, might also need to create a recipe
          // handle for it (if there isn't already one from a previous match).
          if (shapeHC.handle && !newMatch.forward.has(shapeHC.handle)) {
            newMatch.forward.set(shapeHC.handle, null);
            newMatch.score -= 2;
          }
          newMatch.forward.set(shapeHC, null);
          newMatch.score -= 1;
          outputList.push(newMatch);
        });
      }
    }

    function _buildNewParticleMatches(recipe, shapeParticle, match, newMatches) {
      let {forward, reverse, score} = match;
      let matchFound = false;
      for (let recipeParticle of recipe.particles) {
        if (reverse.has(recipeParticle))
          continue;

        if (recipeParticle.name != shapeParticle.name)
          continue;

        let handleNamesMatch = true;
        for (let connectionName in recipeParticle.connections) {
          let recipeConnection = recipeParticle.connections[connectionName];
          if (!recipeConnection.handle)
            continue;
          let shapeConnection = shapeParticle.connections[connectionName];
          if (shapeConnection && shapeConnection.handle && shapeConnection.handle.localName && shapeConnection.handle.localName !== recipeConnection.handle.localName) {
            handleNamesMatch = false;
            break;
          }
        }

        if (!handleNamesMatch)
          continue;

        let newMatch = {forward: new Map(forward), reverse: new Map(reverse), score};
        newMatch.forward.set(shapeParticle, recipeParticle);
        newMatch.reverse.set(recipeParticle, shapeParticle);
        newMatches.push(newMatch);
        matchFound = true;
      }
      if (matchFound == false) {
        let newMatch = {forward: new Map(), reverse: new Map(), score: 0};
        forward.forEach((value, key) => newMatch.forward.set(key, value));
        reverse.forEach((value, key) => newMatch.reverse.set(key, value));
        if (!newMatch.forward.has(shapeParticle)) {
          newMatch.forward.set(shapeParticle, null);
          newMatch.score = match.score - 1;
        }
        newMatches.push(newMatch);
      }
    }

    function _assignHandlesToEmptyPosition(match, emptyHandles, nullHandles) {
      if (emptyHandles.length == 1) {
        let matches = [];
        let {forward, reverse, score} = match;
        for (let nullHandle of nullHandles) {
          let tagsMatch = true;
          for (let tag of nullHandle.tags) {
            if (!emptyHandles[0].tags.includes(tag)) {
              tagsMatch = false;
              break;
            }
          }
          if (!tagsMatch)
            continue;
          let newMatch = {forward: new Map(forward), reverse: new Map(reverse), score: score + 1};
          newMatch.forward.set(nullHandle, emptyHandles[0]);
          newMatch.reverse.set(emptyHandles[0], nullHandle);
          matches.push(newMatch);
        }
        return matches;
      }
      let thisHandle = emptyHandles.pop();
      let matches = _assignHandlesToEmptyPosition(match, emptyHandles, nullHandles);
      let newMatches = [];
      for (let match of matches) {
        let nullHandles = Object.values(shape.handle).filter(handle => match.forward.get(handle) == null);
        if (nullHandles.length > 0)
          newMatches = newMatches.concat(_assignHandlesToEmptyPosition(match, [thisHandle], nullHandles));
        else
          newMatches.concat(match);
      }
      return newMatches;
    }

    // Particles and Handles are initially stored by a forward map from
    // shape component to recipe component.
    // Handle connections, particles and handles are also stored by a reverse map
    // from recipe component to shape component.

    // Start with a single, empty match
    let matches = [{forward: new Map(), reverse: new Map(), score: 0}];
    for (let shapeHC of shape.recipe.handleConnections) {
      let newMatches = [];
      for (let match of matches) {
        // collect matching handle connections into a new matches list
        _buildNewHCMatches(recipe, shapeHC, match, newMatches);
      }
      matches = newMatches;
    }

    for (let shapeParticle of shape.recipe.particles) {
      if (Object.keys(shapeParticle.connections).length > 0)
        continue;
      if (shapeParticle.unnamedConnections.length > 0)
        continue;
      let newMatches = [];
      for (let match of matches)
        _buildNewParticleMatches(recipe, shapeParticle, match, newMatches);
      matches = newMatches;
    }

    let emptyHandles = recipe.handles.filter(handle => handle.connections.length == 0);

    if (emptyHandles.length > 0) {
      let newMatches = [];
      for (let match of matches) {
        let nullHandles = [...shape.handles.values()].filter(handle => match.forward.get(handle) == null);
        if (nullHandles.length > 0)
          newMatches = newMatches.concat(_assignHandlesToEmptyPosition(match, emptyHandles, nullHandles));
        else
          newMatches.concat(match);
      }
      matches = newMatches;
    }

    return matches.map(({forward, score}) => {
      let match = {};
      forward.forEach((value, key) => match[shape.reverse.get(key)] = value);
      return {match, score};
    });
  }

  static directionCounts(handle) {
    let counts = {'in': 0, 'out': 0, 'inout': 0, 'unknown': 0};
    for (let connection of handle.connections) {
      let direction = connection.direction;
      if (counts[direction] == undefined)
        direction = 'unknown';
      counts[direction]++;
    }
    counts.in += counts.inout;
    counts.out += counts.inout;
    return counts;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = RecipeUtil;



/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__type_variable_js__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class TypeChecker {

  // resolve a list of handleConnection types against a handle
  // base type. This is the core type resolution mechanism, but should only
  // be used when types can actually be associated with each other / constrained.
  //
  // By design this function is called exactly once per handle in a recipe during
  // normalization, and should provide the same final answers regardless of the
  // ordering of handles within that recipe
  //
  // NOTE: you probably don't want to call this function, if you think you
  // do, talk to shans@.
  static processTypeList(baseType, list) {
    let newBaseType = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].newVariable(new __WEBPACK_IMPORTED_MODULE_1__type_variable_js__["a" /* TypeVariable */](''));
    if (baseType)
      newBaseType.data.resolution = baseType;
    baseType = newBaseType;

    let concreteTypes = [];

    // baseType might be a variable (and is definitely a variable if no baseType was available).
    // Some of the list might contain variables too.

    // First attempt to merge all the variables into the baseType
    //
    // If the baseType is a variable then this results in a single place to manipulate the constraints
    // of all the other connected variables at the same time.
    for (let item of list) {
      if (item.type.resolvedType().hasVariable) {
        baseType = TypeChecker._tryMergeTypeVariable(baseType, item.type);
        if (baseType == null)
          return null;
      } else {
        concreteTypes.push(item);
      }
    }

    for (let item of concreteTypes) {
      let success = TypeChecker._tryMergeConstraints(baseType, item);
      if (!success)
        return null;
    }

    let getResolution = candidate => {
      if (candidate.isVariable == false)
        return candidate;
      if (candidate.canReadSubset == null || candidate.canWriteSuperset == null)
        return candidate;
      if (candidate.canReadSubset.isMoreSpecificThan(candidate.canWriteSuperset)) {
        if (candidate.canWriteSuperset.isMoreSpecificThan(candidate.canReadSubset))
          candidate.variable.resolution = candidate.canReadSubset;
        return candidate;
      }
      return null;
    };

    let candidate = baseType.resolvedType();

    if (candidate.isCollection) {
      candidate = candidate.primitiveType();
      let resolution = getResolution(candidate);
      if (resolution == null)
        return null;
      return resolution.collectionOf();
    }

    return getResolution(candidate);
  }

  static _tryMergeTypeVariable(base, onto) {
    let [primitiveBase, primitiveOnto] = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].unwrapPair(base.resolvedType(), onto.resolvedType());

    if (primitiveBase.isVariable) {
      if (primitiveOnto.isVariable) {
        // base, onto both variables.
        let result = primitiveBase.variable.maybeMergeConstraints(primitiveOnto.variable);
        if (result == false)
          return null;
        // Here onto grows, one level at a time,
        // as we assign new resolution to primitiveOnto, which is a leaf.
        primitiveOnto.variable.resolution = primitiveBase;
      } else {
        // base variable, onto not.
        primitiveBase.variable.resolution = primitiveOnto;
      }
    } else if (primitiveOnto.isVariable) {
      // onto variable, base not.
      primitiveOnto.variable.resolution = primitiveBase;
      return onto;
    } else if (primitiveBase.isInterface && primitiveOnto.isInterface) {
      let result = primitiveBase.interfaceShape.tryMergeTypeVariablesWith(primitiveOnto.interfaceShape);
      if (result == null)
        return null;
      return __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].newInterface(result);
    } else {
      if ((primitiveBase.isCollection && primitiveBase.hasVariable)
          || (primitiveOnto.isCollection && primitiveOnto.hasVariable)) {
        // Cannot merge [~a] with a type that is not a variable and not a collection.
        return null;
      }

      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(false, 'tryMergeTypeVariable shouldn\'t be called on two types without any type variables');
    }

    return base;
  }

  static _tryMergeConstraints(handleType, {type, direction}) {
    let [primitiveHandleType, primitiveConnectionType] = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].unwrapPair(handleType.resolvedType(), type.resolvedType());
    if (primitiveHandleType.isVariable) {
      while (primitiveConnectionType.isCollection) {
        if (primitiveHandleType.variable.resolution != null
            || primitiveHandleType.variable.canReadSubset != null
            || primitiveHandleType.variable.canWriteSuperset != null) {
          // Resolved and/or constrained variables can only represent Entities, not sets.
          return false;
        }
        // If this is an undifferentiated variable then we need to create structure to match against. That's
        // allowed because this variable could represent anything, and it needs to represent this structure
        // in order for type resolution to succeed.
        primitiveHandleType.variable.resolution = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].newCollection(__WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].newVariable(new __WEBPACK_IMPORTED_MODULE_1__type_variable_js__["a" /* TypeVariable */]('a')));
        let unwrap = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].unwrapPair(primitiveHandleType.resolvedType(), primitiveConnectionType);
        primitiveHandleType = unwrap[0];
        primitiveConnectionType = unwrap[1];
      }

      if (direction == 'out' || direction == 'inout') {
        // the canReadSubset of the handle represents the maximal type that can be read from the
        // handle, so we need to intersect out any type that is more specific than the maximal type
        // that could be written.
        if (!primitiveHandleType.variable.maybeMergeCanReadSubset(primitiveConnectionType.canWriteSuperset))
          return false;
      }
      if (direction == 'in' || direction == 'inout') {
        // the canWriteSuperset of the handle represents the maximum lower-bound type that is read from the handle,
        // so we need to union it with the type that wants to be read here.
        if (!primitiveHandleType.variable.maybeMergeCanWriteSuperset(primitiveConnectionType.canReadSubset))
          return false;
      }
    } else {
      if (primitiveConnectionType.tag !== primitiveHandleType.tag) return false;

      if (direction == 'out' || direction == 'inout')
        if (!TypeChecker._writeConstraintsApply(primitiveHandleType, primitiveConnectionType))
          return false;
      if (direction == 'in' || direction == 'inout')
        if (!TypeChecker._readConstraintsApply(primitiveHandleType, primitiveConnectionType))
          return false;
    }

    return true;
  }

  static _writeConstraintsApply(handleType, connectionType) {
    // this connection wants to write to this handle. If the written type is
    // more specific than the canReadSubset then it isn't violating the maximal type
    // that can be read.
    let writtenType = connectionType.canWriteSuperset;
    if (writtenType == null || handleType.canReadSubset == null)
      return true;
    if (writtenType.isMoreSpecificThan(handleType.canReadSubset))
      return true;
    return false;
  }

  static _readConstraintsApply(handleType, connectionType) {
    // this connection wants to read from this handle. If the read type
    // is less specific than the canWriteSuperset, then it isn't violating
    // the maximum lower-bound read type.
    let readType = connectionType.canReadSubset;
    if (readType == null|| handleType.canWriteSuperset == null)
      return true;
    if (handleType.canWriteSuperset.isMoreSpecificThan(readType))
      return true;
    return false;
  }

  // Compare two types to see if they could be potentially resolved (in the absence of other
  // information). This is used as a filter when selecting compatible handles or checking
  // validity of recipes. This function returning true never implies that full type resolution
  // will succeed, but if the function returns false for a pair of types that are associated
  // then type resolution is guaranteed to fail.
  //
  // left, right: {type, direction, connection}
  static compareTypes(left, right) {
    let resolvedLeft = left.type.resolvedType();
    let resolvedRight = right.type.resolvedType();
    let [leftType, rightType] = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].unwrapPair(resolvedLeft, resolvedRight);

    // a variable is compatible with a set only if it is unconstrained.
    if (leftType.isVariable && rightType.isCollection)
      return !(leftType.variable.canReadSubset || leftType.variable.canWriteSuperset);
    if (rightType.isVariable && leftType.isCollection)
      return !(rightType.variable.canReadSubset || rightType.variable.canWriteSuperset);

    if (leftType.isVariable || rightType.isVariable) {
      // TODO: everything should use this, eventually. Need to implement the
      // right functionality in Shapes first, though.
      return __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].canMergeConstraints(leftType, rightType);
    }

    if (leftType.type != rightType.type) {
      return false;
    }

    // TODO: we need a generic way to evaluate type compatibility
    //       shapes + entities + etc
    if (leftType.isInterface && rightType.isInterface) {
      if (leftType.interfaceShape.equals(rightType.interfaceShape)) {
        return true;
      }
    }

    if (!leftType.isEntity || !rightType.isEntity) {
      return false;
    }

    let leftIsSub = leftType.entitySchema.isMoreSpecificThan(rightType.entitySchema);
    let leftIsSuper = rightType.entitySchema.isMoreSpecificThan(leftType.entitySchema);

    if (leftIsSuper && leftIsSub) {
       return true;
    }
    if (!leftIsSuper && !leftIsSub) {
      return false;
    }
    let [superclass, subclass] = leftIsSuper ? [left, right] : [right, left];

    // treat handle types as if they were 'inout' connections. Note that this
    // guarantees that the handle's type will be preserved, and that the fact
    // that the type comes from a handle rather than a connection will also
    // be preserved.
    let superDirection = superclass.direction || (superclass.connection ? superclass.connection.direction : 'inout');
    let subDirection = subclass.direction || (subclass.connection ? subclass.connection.direction : 'inout');
    if (superDirection == 'in') {
      return true;
    }
    if (subDirection == 'out') {
      return true;
    }
    return false;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = TypeChecker;



/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_digest_web_js__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__build_manifest_parser_js__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__particle_spec_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__schema_js__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__recipe_search_js__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__shape_js__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__recipe_util_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__storage_storage_provider_factory_js__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__manifest_meta_js__ = __webpack_require__(91);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__recipe_type_checker_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__recipe_connection_constraint_js__ = __webpack_require__(22);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
















class ManifestError extends Error {
  constructor(location, message) {
    super(message);
    this.location = location;
  }
}

class StorageStub {
  constructor(type, id, name, storageKey, storageProviderFactory) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.storageKey = storageKey;
    this.storageProviderFactory;
  }

  inflate() {
    return this.storageProviderFactory.connect(this.id, this.type, this.storageKey);
  }
}

// Calls `this.visit()` for each node in a manfest AST, parents before children.
class ManifestVisitor {
  traverse(ast) {
    if (['string', 'number', 'boolean'].includes(typeof ast) || ast === null) {
      return;
    }
    if (Array.isArray(ast)) {
      for (let item of ast) {
        this.traverse(item);
      }
      return;
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(ast.location, 'expected manifest node to have `location`');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(ast.kind, 'expected manifest node to have `kind`');
    let childrenVisited = false;
    let visitChildren = () => {
      if (childrenVisited) {
        return;
      }
      childrenVisited = true;
      for (let key of Object.keys(ast)) {
        if (['location', 'kind', 'model'].includes(key)) {
          continue;
        }
        this.traverse(ast[key]);
      }
    };
    this.visit(ast, visitChildren);
    visitChildren();
  }

  // Parents are visited before children, but an implementation can force
  // children to be visted by calling `visitChildren()`.
  visit(node, visitChildren) {
  }
}

let globalWarningKeys = new Set();

class Manifest {
  constructor({id}) {
    this._recipes = [];
    this._imports = [];
    // TODO: These should be lists, possibly with a separate flattened map.
    this._particles = {};
    this._schemas = {};
    this._stores = [];
    this._shapes = [];
    this._storeTags = new Map();
    this._fileName = null;
    this._nextLocalID = 0;
    this._id = id;
    this._storageProviderFactory = undefined;
    this._meta = new __WEBPACK_IMPORTED_MODULE_11__manifest_meta_js__["a" /* ManifestMeta */]();
    this._resources = {};
    this._storeManifestUrls = new Map();
    this._warnings = [];
  }
  get id() {
    if (this._meta.name)
      return this._meta.name;
    return this._id;
  }
  get storageProviderFactory() {
    if (this._storageProviderFactory == undefined)
      this._storageProviderFactory = new __WEBPACK_IMPORTED_MODULE_10__storage_storage_provider_factory_js__["a" /* StorageProviderFactory */](this.id);
    return this._storageProviderFactory;
  }
  get recipes() {
    return [...new Set(this._findAll(manifest => manifest._recipes))];
  }

  get activeRecipe() {
    return this._recipes.find(recipe => recipe.annotation == 'active');
  }

  get particles() {
    return [...new Set(this._findAll(manifest => Object.values(manifest._particles)))];
  }
  get imports() {
    return this._imports;
  }
  get schemas() {
    return this._schemas;
  }
  get fileName() {
    return this._fileName;
  }
  get stores() {
    return this._stores;
  }
  get shapes() {
    return this._shapes;
  }
  get meta() {
    return this._meta;
  }
  get resources() {
    return this._resources;
  }
  applyMeta(section) {
    if (this._storageProviderFactory !== undefined)
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(section.name == this._meta.name || section.name == undefined, `can't change manifest ID after storage is constructed`);
    this._meta.apply(section);
  }
  // TODO: newParticle, Schema, etc.
  // TODO: simplify() / isValid().
  async createStore(type, name, id, tags, storageKey) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!type.hasVariableReference, `stores can't have variable references`);
    let store = await this.storageProviderFactory.construct(id, type, storageKey || `in-memory://${this.id}`);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(store._version !== null);
    store.name = name;
    this._storeManifestUrls.set(store.id, this.fileName);
    return this._addStore(store, tags);
  }

  _addStore(store, tags) {
    this._stores.push(store);
    this._storeTags.set(store, tags ? tags : []);
    return store;
  }

  newStorageStub(type, name, id, storageKey, tags) {
    return this._addStore(new StorageStub(type, id, name, storageKey, this.storageProviderFactory), tags);
  }

  _find(manifestFinder) {
    let result = manifestFinder(this);
    if (!result) {
      for (let importedManifest of this._imports) {
        result = importedManifest._find(manifestFinder);
        if (result) {
          break;
        }
      }
    }
    return result;
  }
  * _findAll(manifestFinder) {
    yield* manifestFinder(this);
    for (let importedManifest of this._imports) {
      yield* importedManifest._findAll(manifestFinder);
    }
  }
  findSchemaByName(name) {
    return this._find(manifest => manifest._schemas[name]);
  }
  findTypeByName(name) {
    let schema = this.findSchemaByName(name);
    if (schema)
      return __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newEntity(schema);
    let shape = this.findShapeByName(name);
    if (shape)
      return __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newInterface(shape);
    return null;
  }
  findParticleByName(name) {
    return this._find(manifest => manifest._particles[name]);
  }
  findParticlesByVerb(verb) {
    return [...this._findAll(manifest => Object.values(manifest._particles).filter(particle => particle.primaryVerb == verb))];
  }
  findStoreByName(name) {
    return this._find(manifest => manifest._stores.find(store => store.name == name));
  }
  findStoreById(id) {
    return this._find(manifest => manifest._stores.find(store => store.id == id));
  }
  findManifestUrlForHandleId(id) {
    return this._find(manifest => manifest._storeManifestUrls.get(id));
  }
  findStoreByType(type, options={}) {
    let tags = options.tags || [];
    let subtype = options.subtype || false;
    function typePredicate(store) {
      let resolvedType = type.resolvedType();
      if (!resolvedType.isResolved()) {
        return type.isCollection == store.type.isCollection;
      }

      if (subtype) {
        let [left, right] = __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].unwrapPair(store.type, resolvedType);
        if (left.isEntity && right.isEntity) {
          return left.entitySchema.isMoreSpecificThan(right.entitySchema);
        }
        return false;
      }

      return store.type.equals(type);
    }
    function tagPredicate(manifest, handle) {
      return tags.filter(tag => !manifest._storeTags.get(handle).includes(tag)).length == 0;
    }
    return [...this._findAll(manifest => manifest._stores.filter(store => typePredicate(store) && tagPredicate(manifest, store)))];
  }
  findShapeByName(name) {
    return this._find(manifest => manifest._shapes.find(shape => shape.name == name));
  }
  findRecipesByVerb(verb) {
    return [...this._findAll(manifest => manifest._recipes.filter(recipe => recipe.verbs.includes(verb)))];
  }
  generateID() {
    return `${this.id}:${this._nextLocalID++}`;
  }
  static async load(fileName, loader, options) {
    options = options || {};
    let {registry, id} = options;
    registry = registry || {};
    if (registry && registry[fileName]) {
      return await registry[fileName];
    }
    registry[fileName] = (async () => {
      let content = await loader.loadResource(fileName);
      // TODO: When does this happen? The loader should probably throw an exception here.
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(content !== undefined, `${fileName} unable to be loaded by Manifest parser`);
      return await Manifest.parse(content, {
        id,
        fileName,
        loader,
        registry,
        position: {line: 1, column: 0}
      });
    })();
    return await registry[fileName];
  }

  static async parse(content, options) {
    options = options || {};
    let {id, fileName, position, loader, registry} = options;
    registry = registry || {};
    position = position || {line: 1, column: 0};
    id = `manifest:${fileName}:`;

    function dumpWarnings(manifest) {
      for (let warning of manifest._warnings) {
        // TODO: make a decision as to whether we should be logging these here, or if it should
        //       be a responsibility of the caller.
        // TODO: figure out how to have node print the correct message and stack trace
        if (warning.key) {
          if (globalWarningKeys.has(warning.key))
            continue;
          globalWarningKeys.add(warning.key);
        }
        console.warn(processError(warning).message);
      }
    }

    function processError(e, parseError) {
      if (!((e instanceof ManifestError) || e.location)) {
        return e;
      }
      let lines = content.split('\n');
      let line = lines[e.location.start.line - 1];
      let span = 1;
      if (e.location.end.line == e.location.start.line) {
        span = e.location.end.column - e.location.start.column;
      } else {
        span = line.length - e.location.start.column;
      }
      span = Math.max(1, span);
      let highlight = '';
      for (let i = 0; i < e.location.start.column - 1; i++) {
        highlight += ' ';
      }
      for (let i = 0; i < span; i++) {
        highlight += '^';
      }
      let preamble;
      if (parseError)
        preamble = 'Parse error in';
      else
        preamble = 'Post-parse processing error caused by';
      let message = `${preamble} '${fileName}' line ${e.location.start.line}.
${e.message}
  ${line}
  ${highlight}`;
      let err = new Error(message);
      if (!parseError)
        err.stack = e.stack;
      return err;
    }

    let items = [];
    try {
      items = __WEBPACK_IMPORTED_MODULE_2__build_manifest_parser_js__["a" /* parser */].parse(content);
    } catch (e) {
      throw processError(e, true);
    }
    let manifest = new Manifest({id});
    manifest._fileName = fileName;

    try {
      // Loading of imported manifests is triggered in parallel to avoid a serial loading
      // of resources over the network.
      await Promise.all(items.filter(item => item.kind == 'import').map(async item => {
        let path = loader.path(manifest.fileName);
        let target = loader.join(path, item.path);
        try {
          manifest._imports.push(await Manifest.load(target, loader, {registry}));
        } catch (e) {
          manifest._warnings.push(e);
          manifest._warnings.push(new ManifestError(item.location, `Error importing '${target}'`));
        }
      }));

      let processItems = async (kind, f) => {
        for (let item of items) {
          if (item.kind == kind) {
            Manifest._augmentAstWithTypes(manifest, item);
            await f(item);
          }
        }
      };

      // processing meta sections should come first as this contains identifying
      // information that might need to be used in other sections. For example,
      // the meta.name, if present, becomes the manifest id which is relevant
      // when constructing manifest stores.
      await processItems('meta', meta => manifest.applyMeta(meta.items));
      // similarly, resources may be referenced from other parts of the manifest.
      await processItems('resource', item => this._processResource(manifest, item));
      await processItems('schema', item => this._processSchema(manifest, item));
      await processItems('shape', item => this._processShape(manifest, item));
      await processItems('particle', item => this._processParticle(manifest, item, loader));
      await processItems('store', item => this._processStore(manifest, item, loader));
      await processItems('recipe', item => this._processRecipe(manifest, item, loader));
    } catch (e) {
      dumpWarnings(manifest);
      throw processError(e, false);
    }
    dumpWarnings(manifest);
    return manifest;
  }
  static _augmentAstWithTypes(manifest, items) {
    let visitor = new class extends ManifestVisitor {
      constructor() {
        super();
      }
      visit(node, visitChildren) {
        // TODO(dstockwell): set up a scope and merge type variables here, so that
        //     errors relating to failed merges can reference the manifest source.
        visitChildren();
        switch (node.kind) {
        case 'schema-inline': {
          let schemas = [];
          let aliases = [];
          let names = [];
          for (let name of node.names) {
            let resolved = manifest.resolveReference(name);
            if (resolved && resolved.schema && resolved.schema.isAlias) {
              aliases.push(resolved.schema);
            } else {
              names.push(name);
            }
            if (resolved && resolved.schema) {
              schemas.push(resolved.schema);
            }
          }
          let fields = {};
          for (let {name, type} of node.fields) {
            for (let schema of schemas) {
              if (!type) {
                // If we don't have a type, try to infer one from the schema.
                type = schema.fields[name];
              } else {
                // Validate that the specified or inferred type matches the schema.
                let externalType = schema.fields[name];
                if (externalType && !__WEBPACK_IMPORTED_MODULE_5__schema_js__["a" /* Schema */].typesEqual(externalType, type)) {
                  throw new ManifestError(
                      node.location,
                      `Type of '${name}' does not match schema (${type} vs ${externalType})`);
                }
              }
            }
            if (!type) {
              throw new ManifestError(
                  node.location,
                  `Could not infer type of '${name}' field`);
            }
            fields[name] = type;
          }
          let schema = new __WEBPACK_IMPORTED_MODULE_5__schema_js__["a" /* Schema */]({
            names,
            fields,
          });
          for (let alias of aliases) {
            schema = __WEBPACK_IMPORTED_MODULE_5__schema_js__["a" /* Schema */].union(alias, schema);
            if (!schema) {
              throw new ManifestError(
                  node.location,
                  `Could not merge schema aliases`);
            }
          }
          node.model = __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newEntity(schema);
          return;
        }
        case 'variable-type': {
          let constraint = node.constraint && node.constraint.model;
          node.model = __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newVariable({name: node.name, constraint});
          return;
        }
        case 'slot-type': {
          let slotInfo = {};
          for (let field of node.fields)
            slotInfo[field.name] = field.value;
          node.model = __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newSlot(slotInfo);
          return;
        }
        case 'reference-type': {
          let resolved = manifest.resolveReference(node.name);
          if (!resolved) {
            throw new ManifestError(
                node.location,
                `Could not resolve type reference '${node.name}'`);
          }
          if (resolved.schema) {
            node.model = __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newEntity(resolved.schema);
          } else if (resolved.shape) {
            node.model = __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newInterface(resolved.shape);
          } else {
            throw new Error('Expected {shape} or {schema}');
          }
          return;
        }
        case 'list-type':
          node.model = __WEBPACK_IMPORTED_MODULE_8__type_js__["a" /* Type */].newCollection(node.type.model);
          return;
        default:
          return;
        }
      }
    }();
    visitor.traverse(items);
  }
  static _processSchema(manifest, schemaItem) {
    let description;
    let fields = {};
    let names = [...schemaItem.names];
    for (let item of schemaItem.items) {
      switch (item.kind) {
        case 'schema-field': {
          let field = item;
          if (fields[field.name]) {
            throw new ManifestError(field.location, `Duplicate definition of field '${field.name}'`);
          }
          fields[field.name] = field.type;
          break;
        }
        case 'schema-section': {
          let section = item;
          manifest._warnings.push(new ManifestError(section.location, `Schema sections are deprecated`));
          for (let field of section.fields) {
            if (fields[field.name]) {
              throw new ManifestError(field.location, `Duplicate definition of field '${field.name}'`);
            }
            fields[field.name] = field.type;
          }
          break;
        }
        case 'description': {
          if (description) {
            throw new ManifestError(item.location, `Duplicate schema description`);
          }
          description = item;
        }
      }
    }

    for (let parent of schemaItem.parents) {
      let result = manifest.findSchemaByName(parent);
      if (!result) {
        throw new ManifestError(
            schemaItem.location,
            `Could not find parent schema '${parent}'`);
      }
      for (let [name, type] of Object.entries(result.fields)) {
        if (fields[name] && !__WEBPACK_IMPORTED_MODULE_5__schema_js__["a" /* Schema */].typesEqual(fields[name], type)) {
          throw new ManifestError(schemaItem.location,
              `'${parent}' defines incompatible type for field '${name}'`);
        }
      }
      Object.assign(fields, result.fields);
      names.push(...result.names);
    }
    names = [names[0], ...names.filter(name => name != names[0])];
    let name = schemaItem.alias || names[0];
    if (!name) {
      throw new ManifestError(
          schemaItem.location,
          `Schema defined without name or alias`);
    }
    let model = {names, fields};
    if (description) model.description = description;
    let schema = new __WEBPACK_IMPORTED_MODULE_5__schema_js__["a" /* Schema */](model);
    if (schemaItem.alias) {
      schema.isAlias = true;
    }
    manifest._schemas[name] = schema;
  }
  static _processResource(manifest, schemaItem) {
    manifest._resources[schemaItem.name] = schemaItem.data;
  }
  static _processParticle(manifest, particleItem, loader) {
    // TODO: we should be producing a new particleSpec, not mutating
    //       particleItem directly.
    // TODO: we should require both of these and update failing tests...
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particleItem.implFile == null || particleItem.args !== null, 'no valid body defined for this particle');
    if (!particleItem.args) {
      particleItem.args = [];
    }

    if (particleItem.hasParticleArgument) {
      let warning = new ManifestError(particleItem.location, `Particle uses deprecated argument body`);
      warning.key = 'hasParticleArgument';
      manifest._warnings.push(warning);

    }

    // TODO: loader should not be optional.
    if (particleItem.implFile && loader) {
      particleItem.implFile = loader.join(manifest.fileName, particleItem.implFile);
    }

    let processArgTypes = args => {
      for (let arg of args) {
        arg.type = arg.type.model;
        processArgTypes(arg.dependentConnections);
      }
    };
    processArgTypes(particleItem.args);

    let particleSpec = new __WEBPACK_IMPORTED_MODULE_4__particle_spec_js__["a" /* ParticleSpec */](particleItem);
    manifest._particles[particleItem.name] = particleSpec;
  }
  // TODO: Move this to a generic pass over the AST and merge with resolveReference.
  static _processShape(manifest, shapeItem) {
    if (shapeItem.interface) {
      let warning = new ManifestError(shapeItem.location, `Shape uses deprecated argument body`);
      warning.key = 'hasShapeArgument';
      manifest._warnings.push(warning);
    }
    let inHandles = shapeItem.interface ? shapeItem.interface.args : shapeItem.args;
    let handles = [];

    for (let arg of inHandles) {
      let handle = {};
      handle.name = arg.name == '*' ? undefined : arg.name;
      handle.type = arg.type ? arg.type.model : undefined;
      handle.direction = arg.direction;
      handles.push(handle);
    }
    let slots = [];
    for (let slotItem of shapeItem.slots) {
      slots.push({
        direction: slotItem.direction,
        name: slotItem.name,
        isRequired: slotItem.isRequired,
        isSet: slotItem.isSet
      });
    }
    // TODO: move shape to recipe/ and add shape builder?
    let shape = new __WEBPACK_IMPORTED_MODULE_7__shape_js__["a" /* Shape */](shapeItem.name, handles, slots);
    manifest._shapes.push(shape);
  }
  static async _processRecipe(manifest, recipeItem, loader) {
    // TODO: annotate other things too
    let recipe = manifest._newRecipe(recipeItem.name);
    recipe.annotation = recipeItem.annotation;
    recipe.verbs = recipeItem.verbs;
    let items = {
      handles: recipeItem.items.filter(item => item.kind == 'handle'),
      byHandle: new Map(),
      particles: recipeItem.items.filter(item => item.kind == 'particle'),
      byParticle: new Map(),
      slots: recipeItem.items.filter(item => item.kind == 'slot'),
      bySlot: new Map(),
      byName: new Map(),
      connections: recipeItem.items.filter(item => item.kind == 'connection'),
      search: recipeItem.items.find(item => item.kind == 'search'),
      description: recipeItem.items.find(item => item.kind == 'description')
    };

    for (let item of items.handles) {
      let handle = recipe.newHandle();
      let ref = item.ref || {tags: []};
      if (ref.id) {
        handle.id = ref.id;
        let targetStore = manifest.findStoreById(handle.id);
        if (targetStore)
          handle.mapToStorage(targetStore);
      } else if (ref.name) {
        let targetStore = manifest.findStoreByName(ref.name);
        // TODO: Error handling.
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(targetStore, `Could not find handle ${ref.name}`);
        handle.mapToStorage(targetStore);
      }
      handle.tags = ref.tags;
      if (item.name) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!items.byName.has(item.name));
        handle.localName = item.name;
        items.byName.set(item.name, {item, handle});
      }
      handle.fate = item.fate;
      items.byHandle.set(handle, item);
    }

    let prepareEndpoint = (connection, info) => {
      switch (info.targetType) {
        case 'particle': {
          let particle = manifest.findParticleByName(info.particle);
          if (!particle)
            throw new ManifestError(connection.location, `could not find particle '${info.particle}'`);
          if (info.param !== null && !particle.connectionMap.has(info.param))
            throw new ManifestError(connection.location, `param '${info.param}' is not defined by '${info.particle}'`);
          return new __WEBPACK_IMPORTED_MODULE_13__recipe_connection_constraint_js__["b" /* ParticleEndPoint */](particle, info.param);
        }
        case 'localName': {
          if (!items.byName.has(info.name))
            throw new ManifestError(connection.location, `local name '${info.name}' does not exist in recipe`);
          if (info.param == null && info.tags.length == 0 && items.byName.get(info.name).handle)
            return new __WEBPACK_IMPORTED_MODULE_13__recipe_connection_constraint_js__["c" /* HandleEndPoint */](items.byName.get(info.name).handle);
          throw new ManifestError(connection.location, `references to particles by local name not yet supported`);
        }
        case 'tag': {
          return new __WEBPACK_IMPORTED_MODULE_13__recipe_connection_constraint_js__["d" /* TagEndPoint */](info.tags);
        }
        default:
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `endpoint ${info.targetType} not supported`);
      }
    };

    for (let connection of items.connections) {
      let from = prepareEndpoint(connection, connection.from);
      let to = prepareEndpoint(connection, connection.to);
      recipe.newConnectionConstraint(from, to, connection.direction);
    }

    if (items.search) {
      recipe.search = new __WEBPACK_IMPORTED_MODULE_6__recipe_search_js__["a" /* Search */](items.search.phrase, items.search.tokens);
    }

    for (let item of items.slots) {
      let slot = recipe.newSlot();
      item.ref = item.ref || {};
      if (item.ref.id) {
        slot.id = item.ref.id;
      }
      if (item.ref.tags) {
        slot.tags = item.ref.tags;
      }
      if (item.name) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!items.byName.has(item.name), `Duplicate slot local name ${item.name}`);
        slot.localName = item.name;
        items.byName.set(item.name, slot);
      }
      items.bySlot.set(slot, item);
    }

    // TODO: disambiguate.
    for (let item of items.particles) {
      let particle = recipe.newParticle(item.ref.name);
      particle.tags = item.ref.tags;
      particle.verbs = item.ref.verbs;
      if (item.ref.name) {
        let spec = manifest.findParticleByName(item.ref.name);
        if (!spec) {
          throw new ManifestError(item.location, `could not find particle ${item.ref.name}`);
        }
        particle.spec = spec.clone();
      }
      if (item.name) {
        // TODO: errors.
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!items.byName.has(item.name));
        particle.localName = item.name;
        items.byName.set(item.name, {item, particle});
      }
      items.byParticle.set(particle, item);

      for (let slotConnectionItem of item.slotConnections) {
        let slotConn = particle.consumedSlotConnections[slotConnectionItem.param];
        if (!slotConn) {
          slotConn = particle.addSlotConnection(slotConnectionItem.param);
        }
        slotConn.tags = slotConnectionItem.tags || [];
        slotConnectionItem.providedSlots.forEach(ps => {
          let providedSlot = slotConn.providedSlots[ps.param];
          if (providedSlot) {
            if (ps.name) {
              items.byName.set(ps.name, providedSlot);
            }
            items.bySlot.set(providedSlot, ps);
          } else
            providedSlot = items.byName.get(ps.name);
          if (!providedSlot) {
            providedSlot = recipe.newSlot(ps.param);
            providedSlot.localName = ps.name;
            providedSlot.sourceConnection = slotConn;
            if (ps.name) {
              __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!items.byName.has(ps.name));
              items.byName.set(ps.name, providedSlot);
            }
            items.bySlot.set(providedSlot, ps);
          }
          if (!slotConn.providedSlots[ps.param]) {
            slotConn.providedSlots[ps.param] = providedSlot;
          }
        });
      }
    }

    for (let [particle, item] of items.byParticle) {
      for (let connectionItem of item.connections) {
        let connection;
        if (connectionItem.param == '*') {
          connection = particle.addUnnamedConnection();
        } else {
          connection = particle.connections[connectionItem.param];
          if (!connection) {
            connection = particle.addConnectionName(connectionItem.param);
          }
          // TODO: else, merge tags? merge directions?
        }
        connection.tags = connectionItem.target ? connectionItem.target.tags : [];
        let direction = {'->': 'out', '<-': 'in', '=': 'inout', 'consume': '`consume', 'provide': '`provide'}[connectionItem.dir];
        if (connection.direction) {
          if (connection.direction != direction && 
              direction != 'inout' && 
              !(connection.direction == 'host' && direction == 'in') &&
              !(connection.direction == '`consume' && direction == 'in') &&
              !(connection.direction == '`provide' && direction == 'out')
            ) {
            throw new ManifestError(
                connectionItem.location,
                `'${connectionItem.dir}' not compatible with '${connection.direction}' param of '${particle.name}'`);
          }
        } else {
          if (connectionItem.param != '*' && particle.spec !== undefined) {
            throw new ManifestError(
                connectionItem.location,
                `param '${connectionItem.param}' is not defined by '${particle.name}'`);
          }
          connection.direction = direction;
        }

        let targetHandle;
        let targetParticle;

        if (connectionItem.target && connectionItem.target.name) {
          let entry = items.byName.get(connectionItem.target.name);
          if (!entry) {
            let handle = recipe.newHandle();
            handle.tags = [];
            handle.localName = connectionItem.target.name;
            handle.fate = 'create';
            handle.item = {kind: 'handle'};
            entry = {item: handle.item, handle};
            items.byName.set(handle.localName, entry);
            items.byHandle.set(handle, handle.item);
          }

          if (entry.item.kind == 'handle') {
            targetHandle = entry.handle;
          } else if (entry.item.kind == 'particle') {
            targetParticle = entry.particle;
          } else {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `did not expect ${entry.item.kind}`);
          }
        }

        // Handle implicit handle connections in the form `param = SomeParticle`
        if (connectionItem.target && connectionItem.target.particle) {
          let hostedParticle = manifest.findParticleByName(connectionItem.target.particle);
          if (!hostedParticle) {
            throw new ManifestError(
                connectionItem.target.location,
                `Could not find hosted particle '${connectionItem.target.particle}'`);
          }
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!connection.type.hasVariableReference);
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(connection.type.isInterface);
          if (!connection.type.interfaceShape.restrictType(hostedParticle)) {
            throw new ManifestError(
                connectionItem.target.location,
                `Hosted particle '${hostedParticle.name}' does not match shape '${connection.name}'`);
          }
          // TODO: loader should not be optional.
          if (hostedParticle.implFile && loader) {
            hostedParticle.implFile = loader.join(manifest.fileName, hostedParticle.implFile);
          }
          const hostedParticleLiteral = hostedParticle.clone().toLiteral();
          let particleSpecHash = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_digest_web_js__["a" /* digest */])(JSON.stringify(hostedParticleLiteral));
          let id = `${manifest.generateID()}:${particleSpecHash}:${hostedParticle.name}`;
          targetHandle = recipe.newHandle();
          targetHandle.fate = 'copy';
          let store = await manifest.createStore(connection.type, null, id, []);
          store.set(hostedParticleLiteral);
          targetHandle.mapToStorage(store);
        }

        if (targetParticle) {
          let targetConnection;
          if (connectionItem.target.param) {
            targetConnection = targetParticle.connections[connectionItem.target.param];
            if (!targetConnection) {
              targetConnection = targetParticle.addConnectionName(connectionItem.target.param);
              // TODO: direction?
            }
          } else {
            targetConnection = targetParticle.addUnnamedConnection();
            // TODO: direction?
          }

          targetHandle = targetConnection.handle;
          if (!targetHandle) {
            // TODO: tags?
            targetHandle = recipe.newHandle();
            targetConnection.connectToHandle(targetHandle);
          }
        }

        if (targetHandle) {
          connection.connectToHandle(targetHandle);
        }
      }

      for (let slotConnectionItem of item.slotConnections) {
        // particles that reference verbs should store slot connection information as constraints to be used
        // during verb matching. However, if there's a spec then the slots need to be validated against it
        // instead.
        if (particle.spec !== undefined) {
          // Validate consumed and provided slots names are according to spec.
          if (!particle.spec.slots.has(slotConnectionItem.param)) {
            throw new ManifestError(
                slotConnectionItem.location,
                `Consumed slot '${slotConnectionItem.param}' is not defined by '${particle.name}'`);
          }
          slotConnectionItem.providedSlots.forEach(ps => {
            if (!particle.spec.slots.get(slotConnectionItem.param).getProvidedSlotSpec(ps.param)) {
              throw new ManifestError(
                  ps.location,
                  `Provided slot '${ps.param}' is not defined by '${particle.name}'`);
            }
          });
        }

        let targetSlot = items.byName.get(slotConnectionItem.name);
        if (targetSlot) {
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(items.bySlot.has(targetSlot));
          if (!targetSlot.name) {
            targetSlot.name = slotConnectionItem.param;
          }
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(targetSlot == items.byName.get(slotConnectionItem.name),
                 `Target slot ${targetSlot.name} doesn't match slot connection ${slotConnectionItem.param}`);
        } else if (slotConnectionItem.name) {
          targetSlot = recipe.newSlot(slotConnectionItem.param);
          targetSlot.localName = slotConnectionItem.name;
          if (slotConnectionItem.name)
            items.byName.set(slotConnectionItem.name, targetSlot);
          items.bySlot.set(targetSlot, slotConnectionItem);
        }
        if (targetSlot) {
          particle.consumedSlotConnections[slotConnectionItem.param].connectToSlot(targetSlot);
        }
      }
    }

    if (items.description && items.description.description) {
      recipe.description = items.description.description;
    }
  }
  resolveReference(name) {
    let schema = this.findSchemaByName(name);
    if (schema) {
      return {schema};
    }
    let shape = this.findShapeByName(name);
    if (shape) {
      return {shape};
    }
    return null;
  }
  static async _processStore(manifest, item, loader) {
    let name = item.name;
    let id = item.id;
    let type = item.type.model;
    if (id == null) {
      id = `${manifest._id}store${manifest._stores.length}`;
    }
    let tags = item.tags;
    if (tags == null)
      tags = [];


    // Instead of creating links to remote firebase during manifest parsing,
    // we generate storage stubs that contain the relevant information.
    if (item.origin == 'storage') {
      manifest.newStorageStub(type, name, id, item.source, tags);
      return;
    }

    let json;
    let source;
    if (item.origin == 'file') {
      source = loader.join(manifest.fileName, item.source);
      // TODO: json5?
      json = await loader.loadResource(source);
    } else if (item.origin == 'resource') {
      source = item.source;
      json = manifest.resources[source];
      if (json == undefined)
        throw new Error(`Resource '${source}' referenced by store '${id}' is not defined in this manifest`);
    }
    let entities;
    try {
      entities = JSON.parse(json);
    } catch (e) {
      throw new ManifestError(item.location, `Error parsing JSON from '${source}' (${e.message})'`);
    }

    let unitType;
    if (!type.isCollection) {
      if (entities.length == 0) {
        await Manifest._createStore(manifest, type, name, id, tags, item);
        return;
      }
      entities = entities.slice(entities.length - 1);
      unitType = type;
    } else {
      unitType = type.primitiveType();
    }

    if (unitType.isEntity) {
      let hasSerializedId = false;
      entities = entities.map(entity => {
        if (entity == null) {
          // FIXME: perhaps this happens when we have an empty variable?
          // we should just generate an empty list in that case.
          return null;
        }
        hasSerializedId = hasSerializedId || entity.$id;
        let id = entity.$id || manifest.generateID();
        delete entity.$id;
        return {id, rawData: entity};
      });
      // TODO(wkorman): Efficiency improvement opportunities: (1) We could build
      // array of entities in above map rather than mapping again below, (2) we
      // could hash the object tree data directly rather than stringifying.
      if (!item.id && !hasSerializedId) {
        let entityHash = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_digest_web_js__["a" /* digest */])(JSON.stringify(entities.map(entity => entity.rawData)));
        id = `${id}:${entityHash}`;
      }
    }

    let version = item.version || 0;
    let store = await Manifest._createStore(manifest, type, name, id, tags, item);
    store.fromLiteral({
      version,
      model: entities.map(value => ({id: value.id, value})),
    });
  }
  static async _createStore(manifest, type, name, id, tags, item) {
    let store = await manifest.createStore(type, name, id, tags);
    store.source = item.source;
    store.description = item.description;
    return store;
  }
  _newRecipe(name) {
    let recipe = new __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_js__["a" /* Recipe */](name);
    this._recipes.push(recipe);
    return recipe;
  }

  toString(options) {
    // TODO: sort?
    options = options || {};
    let results = [];

    this._imports.forEach(i => {
      if (options.recursive) {
        results.push(`// import '${i.fileName}'`);
        let importStr = i.toString(options);
        results.push(`${i.toString(options)}`);
      } else {
        results.push(`import '${i.fileName}'`);
      }
    });

    Object.values(this._schemas).forEach(s => {
      results.push(s.toManifestString());
    });

    Object.values(this._particles).forEach(p => {
      results.push(p.toString());
    });

    this._recipes.forEach(r => {
      results.push(r.toString(options));
    });

    let stores = [...this.stores].sort(__WEBPACK_IMPORTED_MODULE_9__recipe_util_js__["a" /* compareComparables */]);
    stores.forEach(store => {
      results.push(store.toString(this._storeTags.get(store).map(a => `#${a}`)));
    });

    return results.join('\n');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Manifest;



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_devtools_channel_web_js__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__testing_devtools_channel_stub_js__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__devtools_shared_devtools_broker_js__ = __webpack_require__(66);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */






let channel = null;
let isConnected = false;
let onceConnectedResolve = null;
let onceConnected = new Promise(resolve => onceConnectedResolve = resolve);

__WEBPACK_IMPORTED_MODULE_3__devtools_shared_devtools_broker_js__["a" /* DevtoolsBroker */].onceConnected.then(() => {
  DevtoolsConnection.ensure();
  onceConnectedResolve(channel);
  isConnected = true;
});

class DevtoolsConnection {
  static get isConnected() {
    return isConnected;
  }
  static get onceConnected() {
    return onceConnected;
  }
  static get() {
    return channel;
  }
  static ensure() {
    if (!channel) channel = new __WEBPACK_IMPORTED_MODULE_1__platform_devtools_channel_web_js__["a" /* DevtoolsChannel */]();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DevtoolsConnection;


class DevtoolsForTests {
  static get channel() {
    return channel;
  }
  static ensureStub() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!channel);
    channel = new __WEBPACK_IMPORTED_MODULE_2__testing_devtools_channel_stub_js__["a" /* DevtoolsChannelStub */]();
    onceConnectedResolve(channel);
    isConnected = true;
  }
  static reset() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(channel);
    isConnected = false;
    onceConnectedResolve = null;
    onceConnected = new Promise(resolve => onceConnectedResolve = resolve);
    channel = null;
  }
}
/* unused harmony export DevtoolsForTests */



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_type_checker_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shape_js__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__ = __webpack_require__(0);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */






class ConnectionSpec {
  constructor(rawData, typeVarMap) {
    this.rawData = rawData;
    this.direction = rawData.direction;
    this.name = rawData.name;
    this.type = rawData.type.mergeTypeVariablesByName(typeVarMap);
    this.isOptional = rawData.isOptional;
    this.tags = rawData.tags || [];
    this.dependentConnections = [];
  }

  instantiateDependentConnections(particle, typeVarMap) {
    for (let dependentArg of this.rawData.dependentConnections) {
      let dependentConnection = particle.createConnection(dependentArg, typeVarMap);
      dependentConnection.parentConnection = this;
      this.dependentConnections.push(dependentConnection);
    }

  }

  get isInput() {
    // TODO: we probably don't really want host to be here.
    return this.direction == 'in' || this.direction == 'inout' || this.direction == 'host';
  }

  get isOutput() {
    return this.direction == 'out' || this.direction == 'inout';
  }

  isCompatibleType(type) {
    return __WEBPACK_IMPORTED_MODULE_1__recipe_type_checker_js__["a" /* TypeChecker */].compareTypes({type}, {type: this.type, direction: this.direction});
  }
}

class SlotSpec {
  constructor(slotModel) {
    this.name = slotModel.name;
    this.isRequired = slotModel.isRequired;
    this.isSet = slotModel.isSet;
    this.tags = slotModel.tags || [];
    this.formFactor = slotModel.formFactor; // TODO: deprecate form factors?
    this.providedSlots = [];
    if (!slotModel.providedSlots)
      return;
    slotModel.providedSlots.forEach(ps => {
      this.providedSlots.push(new ProvidedSlotSpec(ps));
    });
  }

  getProvidedSlotSpec(name) {
    return this.providedSlots.find(ps => ps.name == name);
  }
}

class ProvidedSlotSpec {
  constructor(slotModel) {
    this.name = slotModel.name;
    this.isRequired = slotModel.isRequired;
    this.isSet = slotModel.isSet;
    this.tags = slotModel.tags || [];
    this.formFactor = slotModel.formFactor; // TODO: deprecate form factors?
    this.handles = slotModel.handles || [];
  }
}

class ParticleSpec {
  constructor(model) {
    this._model = model;
    this.name = model.name;
    this.verbs = model.verbs;
    let typeVarMap = new Map();
    this.connections = [];
    model.args.forEach(arg => this.createConnection(arg, typeVarMap));
    this.connectionMap = new Map();
    this.connections.forEach(a => this.connectionMap.set(a.name, a));
    this.inputs = this.connections.filter(a => a.isInput);
    this.outputs = this.connections.filter(a => a.isOutput);

    // initialize descriptions patterns.
    model.description = model.description || {};
    this.validateDescription(model.description);
    this.pattern = model.description['pattern'];
    this.connections.forEach(connectionSpec => {
      connectionSpec.pattern = model.description[connectionSpec.name];
    });

    this.implFile = model.implFile;
    this.affordance = model.affordance;
    this.slots = new Map();
    if (model.slots)
      model.slots.forEach(s => this.slots.set(s.name, new SlotSpec(s)));
    // Verify provided slots use valid handle connection names.
    this.slots.forEach(slot => {
      slot.providedSlots.forEach(ps => {
        ps.handles.forEach(v => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__["a" /* assert */])(this.connectionMap.has(v), 'Cannot provide slot for nonexistent handle constraint ', v));
      });
    });
  }

  createConnection(arg, typeVarMap) {
    let connection = new ConnectionSpec(arg, typeVarMap);
    this.connections.push(connection);
    connection.instantiateDependentConnections(this, typeVarMap);
    return connection;
  }

  isInput(param) {
    for (let input of this.inputs) if (input.name == param) return true;
  }

  isOutput(param) {
    for (let outputs of this.outputs) if (outputs.name == param) return true;
  }

  getSlotSpec(slotName) {
    return this.slots.get(slotName);
  }

  get primaryVerb() {
    if (this.verbs.length > 0) {
      return this.verbs[0];
    }
  }

  matchAffordance(affordance) {
    return this.slots.size <= 0 || this.affordance.includes(affordance);
  }

  toLiteral() {
    let {args, name, verbs, description, implFile, affordance, slots} = this._model;
    let connectionToLiteral = ({type, direction, name, isOptional, dependentConnections}) => ({type: type.toLiteral(), direction, name, isOptional, dependentConnections: dependentConnections.map(connectionToLiteral)});
    args = args.map(a => connectionToLiteral(a));
    return {args, name, verbs, description, implFile, affordance, slots};
  }

  static fromLiteral(literal) {
    let {args, name, verbs, description, implFile, affordance, slots} = literal;
    let connectionFromLiteral = ({type, direction, name, isOptional, dependentConnections}) => ({type: __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].fromLiteral(type), direction, name, isOptional, dependentConnections: dependentConnections.map(connectionFromLiteral)}); 
    args = args.map(connectionFromLiteral);
    return new ParticleSpec({args, name, verbs, description, implFile, affordance, slots});
  }

  clone() {
    return ParticleSpec.fromLiteral(this.toLiteral());
  }

  equals(other) {
    return JSON.stringify(this.toLiteral()) === JSON.stringify(other.toLiteral());
  }

  validateDescription(description) {
    Object.keys(description || []).forEach(d => {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__["a" /* assert */])(['kind', 'location', 'pattern'].includes(d) || this.connectionMap.has(d), `Unexpected description for ${d}`);
    });
  }

  toInterface() {
    return __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].newInterface(this._toShape());
  }

  _toShape() {
    const handles = this._model.args;
    // TODO: wat do?
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__["a" /* assert */])(!this.slots.length, 'please implement slots toShape');
    const slots = [];
    return new __WEBPACK_IMPORTED_MODULE_2__shape_js__["a" /* Shape */](handles, slots);
  }

  toString() {
    let results = [];
    let verbs = '';
    if (this.verbs.length > 0)
      verbs = ' ' + this.verbs.map(verb => `&${verb}`).join(' ');
    results.push(`particle ${this.name}${verbs} in '${this.implFile}'`.trim());
    let indent = '  ';
    let writeConnection = (connection, indent) => {
      results.push(`${indent}${connection.direction} ${connection.type.toString()}${connection.isOptional ? '?' : ''} ${connection.name}`);
      for (let dependent of connection.dependentConnections) {
        writeConnection(dependent, indent + '  ');
      }
    };

    for (let connection of this.connections) {
      if (connection.parentConnection)
        continue;
      writeConnection(connection, indent);
    }

    this.affordance.filter(a => a != 'mock').forEach(a => results.push(`  affordance ${a}`));
    this.slots.forEach(s => {
      // Consume slot.
      let consume = [];
      if (s.isRequired) {
        consume.push('must');
      }
      consume.push('consume');
      if (s.isSet) {
        consume.push('set of');
      }
      consume.push(s.name);
      if (s.tags.length > 0) {
        consume.push(s.tags.map(a => `#${a}`).join(' '));
      }
      results.push(`  ${consume.join(' ')}`);
      if (s.formFactor) {
        results.push(`    formFactor ${s.formFactor}`);
      }
      // Provided slots.
      s.providedSlots.forEach(ps => {
        let provide = [];
        if (ps.isRequired) {
          provide.push('must');
        }
        provide.push('provide');
        if (ps.isSet) {
          provide.push('set of');
        }
        provide.push(ps.name);
        if (ps.tags.length > 0) {
          provide.push(ps.tags.map(a => `#${a}`).join(' '));
        }
        results.push(`    ${provide.join(' ')}`);
        if (ps.formFactor) {
          results.push(`      formFactor ${ps.formFactor}`);
        }
        ps.handles.forEach(handle => results.push(`      handle ${handle}`));
      });
    });
    // Description
    if (this.pattern) {
      results.push(`  description \`${this.pattern}\``);
      this.connections.forEach(cs => {
        if (cs.pattern) {
          results.push(`    ${cs.name} \`${cs.pattern}\``);
        }
      });
    }
    return results.join('\n');
  }

  toManifestString() {
    return this.toString();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ParticleSpec;



/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__type_checker_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__type_js__ = __webpack_require__(4);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class Handle {
  constructor(recipe) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipe);
    this._recipe = recipe;
    this._id = null;
    this._localName = undefined;
    this._tags = [];
    this._type = undefined;
    this._fate = null;
    // TODO: replace originalFate and originalId with more generic mechanism for tracking
    // how and from what the recipe was generated.
    this._originalFate = null;
    this._originalId = null;
    this._connections = [];
    this._mappedType = undefined;
    this._storageKey = undefined;
    this._pattern = undefined;
  }

  _copyInto(recipe) {
    let handle = undefined;
    if (this._id !== null && ['map', 'use', 'copy'].includes(this.fate))
      handle = recipe.findHandle(this._id);

    if (handle == undefined) {
      handle = recipe.newHandle();
      handle._id = this._id;
      handle._tags = [...this._tags];
      handle._type = this._type ? __WEBPACK_IMPORTED_MODULE_3__type_js__["a" /* Type */].fromLiteral(this._type.toLiteral()) : undefined;
      handle._fate = this._fate;
      handle._originalFate = this._originalFate;
      handle._originalId = this._originalId;
      handle._mappedType = this._mappedType;
      handle._storageKey = this._storageKey;

      // the connections are re-established when Particles clone their
      // attached HandleConnection objects.
      handle._connections = [];
      handle._pattern = this._pattern;
    }
    return handle;
  }

  _startNormalize() {
    this._localName = null;
    this._tags.sort();
    // TODO: type?
  }

  _finishNormalize() {
    for (let connection of this._connections) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(connection), `Handle connection '${connection.name}' is not frozen.`);
    }
    this._connections.sort(__WEBPACK_IMPORTED_MODULE_1__util_js__["a" /* compareComparables */]);
    Object.freeze(this);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this._id, other._id)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this._localName, other._localName)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["c" /* compareArrays */](this._tags, other._tags, __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */])) != 0) return cmp;
    // TODO: type?
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this.fate, other.fate)) != 0) return cmp;
    return 0;
  }

  // a resolved Handle has either an id or create=true
  get fate() { return this._fate || '?'; }
  set fate(fate) {
    if (this._originalFate == null) {
      this._originalFate = this._fate;
    }
    this._fate = fate;
  }
  get originalFate() { return this._originalFate || '?'; }
  get originalId() { return this._originalId; }
  get recipe() { return this._recipe; }
  get tags() { return this._tags; } // only tags owned by the handle
  set tags(tags) { this._tags = tags; }
  get type() { return this._type; } // nullable
  get id() { return this._id; }
  set id(id) {
    if (!this._originalId) {
      this._originalId = this._id;
    }
    this._id = id;
  }
  mapToStorage(storage) {
    this._id = storage.id;
    this._type = undefined;
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(storage.type == undefined || !(storage.type.hasVariableReference), `variable references shouldn't be part of handle types`);
    this._mappedType = storage.type;
    this._storageKey = storage.storageKey;
  }
  get localName() { return this._localName; }
  set localName(name) { this._localName = name; }
  get connections() { return this._connections; } // HandleConnection*
  get storageKey() { return this._storageKey; }
  set storageKey(key) { this._storageKey = key; }
  get pattern() { return this._pattern; }
  set pattern(pattern) { this._pattern = pattern; }

  static effectiveType(handleType, connections) {
    let variableMap = new Map();
    // It's OK to use _cloneWithResolutions here as for the purpose of this test, the handle set + handleType 
    // contain the full set of type variable information that needs to be maintained across the clone.
    let typeSet = connections.filter(connection => connection.type != null).map(connection => ({type: connection.type._cloneWithResolutions(variableMap), direction: connection.direction}));
    return __WEBPACK_IMPORTED_MODULE_2__type_checker_js__["a" /* TypeChecker */].processTypeList(handleType ? handleType._cloneWithResolutions(variableMap) : null, typeSet);
  }

  static resolveEffectiveType(handleType, connections) {
    let typeSet = connections.filter(connection => connection.type != null).map(connection => ({type: connection.type, direction: connection.direction}));
    return __WEBPACK_IMPORTED_MODULE_2__type_checker_js__["a" /* TypeChecker */].processTypeList(handleType, typeSet);   
  }

  _isValid(options) {
    let tags = new Set();
    for (let connection of this._connections) {
      // A remote handle cannot be connected to an output param.
      if (this.fate == 'map' && ['out', 'inout'].includes(connection.direction)) {
        if (options && options.errors) {
          options.errors.set(this, `Invalid fate '${this.fate}' for handle '${this}'; it is used for '${connection.direction}' ${connection.particle.name}::${connection.name} connection`);
        }
        return false;
      }
      connection.tags.forEach(tag => tags.add(tag));
    }
    let type = Handle.resolveEffectiveType(this._mappedType, this._connections);
    if (type) {
      this._type = type;
      this._tags.forEach(tag => tags.add(tag));
      this._tags = [...tags];
      return true;
    }
    if (options && options.errors) {
      // TODO: pass options to TypeChecker.processTypeList for better error.
      options.errors.set(this, `Type validations failed for handle '${this}'`);
    }
    return false;
  }

  isResolved(options) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this));
    let resolved = true;
    if (this.type) {
      if ((!this.type.isResolved() && this.fate !== 'create') || 
          (!this.type.canEnsureResolved() && this.fate == 'create')) {
        if (options) {
          options.details = 'unresolved type';
        }
        resolved = false;
      }
    } else {
      if (options) {
        options.details = 'missing type';
      }
      resolved = false;
    }

    switch (this.fate) {
      case '?': {
        if (options) {
          options.details += 'missing fate';
        }
        resolved = false;
        break;
      }
      case 'copy':
      case 'map':
      case 'use': {
        if (options && this.id === null) {
          options.details += 'missing id';
        }
        resolved = resolved && (this.id !== null);
        break;
      }
      case 'create':
        break;
      default: {
        if (options) {
          options.details += `invalid fate ${this.fate}`;
        }
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `Unexpected fate: ${this.fate}`);
        resolved = false;
      }
    }
    return resolved;
  }

  toString(nameMap, options) {
    // TODO: type? maybe output in a comment
    let result = [];
    result.push(this.fate);
    if (this.id) {
      result.push(`'${this.id}'`);
    }
    result.push(...this.tags.map(a => `#${a}`));
    result.push(`as ${(nameMap && nameMap.get(this)) || this.localName}`);
    if (this.type) {
      result.push('//');
      if (this.type.isResolved()) {
        result.push(this.type.resolvedType().toString());
      } else if (this.type.canEnsureResolved()) {
        let type = __WEBPACK_IMPORTED_MODULE_3__type_js__["a" /* Type */].fromLiteral(this.type.toLiteral());
        type.maybeEnsureResolved();
        result.push(type.resolvedType().toString());
      } else {
        result.push(this.type.toString());
      }
    }
    if (options && options.showUnresolved) {
      let options = {};
      if (!this.isResolved(options)) {
        result.push(` // unresolved handle: ${options.details}`);
      }
    }

    return result.join(' ');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Handle;



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class MapSlots extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();
    this._arc = arc;
  }
  async generate(inputParams) {
    let arc = this._arc;

    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onSlotConnection(recipe, slotConnection) {
        // don't try to connect verb constraints
        // TODO: is this right? Should constraints be connectible, in order to precompute the
        // recipe side once the verb is substituted?
        if (slotConnection.slotSpec == undefined)
          return;

        if (slotConnection.isConnected()) {
          return;
        }

        let {local, remote} = MapSlots.findAllSlotCandidates(slotConnection, arc);

        // ResolveRecipe handles one-slot case.
        if (local.length + remote.length < 2) {
          return;
        }

        // If there are any local slots, prefer them over remote slots.
        let slotList = local.length > 0 ? local : remote;
        return slotList.map(slot => ((recipe, slotConnection) => {
          MapSlots.connectSlotConnection(slotConnection, slot);
          return 1;
        }));
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }

  // Helper methods.
  // Connect the given slot connection to the selectedSlot, create the slot, if needed.
  static connectSlotConnection(slotConnection, selectedSlot) {
    let recipe = slotConnection.recipe;
    if (!slotConnection.targetSlot) {
      let clonedSlot = recipe.updateToClone({selectedSlot}).selectedSlot;

      if (!clonedSlot) {
        clonedSlot = recipe.slots.find(s => selectedSlot.id && selectedSlot.id == s.id);
        if (clonedSlot == undefined) {
          clonedSlot = recipe.newSlot(selectedSlot.name);
          clonedSlot.id = selectedSlot.id;
        }
      }
      slotConnection.connectToSlot(clonedSlot);
    }

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__["a" /* assert */])(!selectedSlot.id || !slotConnection.targetSlot.id || (selectedSlot.id == slotConnection.targetSlot.id),
           `Cannot override slot id '${slotConnection.targetSlot.id}' with '${selectedSlot.id}'`);
    slotConnection.targetSlot.id = selectedSlot.id || slotConnection.targetSlot.id;

    // TODO: need to concat to existing tags and dedup?
    slotConnection.targetSlot.tags = [...selectedSlot.tags];
  }

  // Returns all possible slot candidates, sorted by "quality"
  static findAllSlotCandidates(slotConnection, arc) {
    return {
      // Note: during manfiest parsing, target slot is only set in slot connection, if the slot exists in the recipe.
      // If this slot is internal to the recipe, it has the sourceConnection set to the providing connection
      // (and hence the consuming connection is considered connected already). Otherwise, this may only be a remote slot.
      local: !slotConnection.targetSlot ? MapSlots._findSlotCandidates(slotConnection, slotConnection.recipe.slots) : [],
      remote: MapSlots._findSlotCandidates(slotConnection, arc.pec.slotComposer.getAvailableSlots())
    };
  }

  // Returns the given slot candidates, sorted by "quality".
  static _findSlotCandidates(slotConnection, slots) {
    let possibleSlots = slots.filter(s => this._filterSlot(slotConnection, s));
    possibleSlots.sort((slot1, slot2) => {
        // TODO: implement.
        return slot1.name < slot2.name;
    });
    return possibleSlots;
  }

  // Returns true, if the given slot is a viable candidate for the slotConnection.
  static _filterSlot(slotConnection, slot) {
    if (!MapSlots.specMatch(slotConnection, slot)) {
      return false;
    }

    if (!MapSlots.tagsOrNameMatch(slotConnection, slot)) {
      return false;
    }

    // Match handles of the provided slot with the slot-connection particle's handles.
    if (!MapSlots.handlesMatch(slotConnection, slot)) {
      return false;
    }
    return true;
  }

  static specMatch(slotConnection, slot) {
    return slotConnection.slotSpec && // if there's no slotSpec, this is just a slot constraint on a verb
          slotConnection.slotSpec.isSet == slot.getProvidedSlotSpec().isSet;
  }

  // Returns true, if the slot connection's tags intersection with slot's tags is nonempty.
  // TODO: replace with generic tag matcher
  static tagsOrNameMatch(slotConnection, slot) {
    let consumeConnTags = [].concat(slotConnection.slotSpec.tags || [], slotConnection.tags);
    let slotTags = new Set([].concat(slot.tags, slot.getProvidedSlotSpec().tags || [], [slot.name]));
    // Consume connection tags aren't empty and intersection with the slot isn't empty.
    if (consumeConnTags.length > 0 && consumeConnTags.some(t => slotTags.has(t))) {
      return true;
    }
    // For backward compatibility support explicit slot names matching.
    return (slotConnection.name === slot.name);
  }

  static handlesMatch(slotConnection, slot) {
    return MapSlots._handlesMatch(slotConnection.particle,
                                  slot.handleConnections.map(connection => connection.handle).filter(a => a !== undefined));
  }

  // Returns true, if the providing slot handle restrictions are satisfied by the consuming slot connection.
      // TODO: should we move some of this logic to the recipe? Or type matching?
  static _handlesMatch(consumingParticle, providingSlotHandles) {
    if (providingSlotHandles.length == 0) {
      return true; // slot is not limited to specific handles
    }
    return Object.values(consumingParticle.connections).find(handleConn => {
      return providingSlotHandles.includes(handleConn.handle) ||
              (handleConn.handle && handleConn.handle.id && providingSlotHandles.map(sh => sh.id).includes(handleConn.handle.id));
    });
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MapSlots;



/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__map_slots_js__ = __webpack_require__(13);
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt








class ResolveRecipe extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();
    this._arc = arc;
  }

  async generate(inputParams) {
    let arc = this._arc;
    return __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__["a" /* Walker */] {
      onHandle(recipe, handle) {
        if (handle.connections.length == 0 || (handle.id && handle.storageKey) || (!handle.type) || (!handle.fate))
          return;

        let mappable;

        if (!handle.id) {
          // Handle doesn't have an ID, finding by type and tags.
          const counts = __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__["a" /* RecipeUtil */].directionCounts(handle);
          switch (handle.fate) {
            case 'use':
              mappable = arc.findStoresByType(handle.type, {tags: handle.tags, subtype: counts.out == 0});
              break;
            case 'map':
            case 'copy':
              mappable = arc.context.findStoreByType(handle.type, {tags: handle.tags, subtype: true});
              break;
            case 'create':
            case '?':
              mappable = [];
              break;
            default:
              __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__["a" /* assert */])(false, `unexpected fate ${handle.fate}`);
          }
        } else if (!handle.storageKey) {
          // Handle specified by the ID, but not yet mapped to storage.
          let storeById;
          switch (handle.fate) {
            case 'use':
              storeById = arc.findStoreById(handle.id);
              break;
            case 'map':
            case 'copy':
              storeById = arc.context.findStoreById(handle.id);
              break;
            case 'create':
            case '?':
              break;
            default:
              __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__["a" /* assert */])(false, `unexpected fate ${handle.fate}`);
          }
          mappable = storeById ? [storeById] : [];
        }

        mappable = mappable.filter(incomingHandle => {
          for (let existingHandle of recipe.handles)
            if (incomingHandle.id == existingHandle.id
                && existingHandle !== handle)
              return false;
          return true;
        });

        if (mappable.length == 1) {
          return (recipe, handle) => {
            handle.mapToStorage(mappable[0]);
          };
        }
      }

      onSlotConnection(recipe, slotConnection) {
        if (slotConnection.isConnected()) {
          return;
        }

        let {local, remote} = __WEBPACK_IMPORTED_MODULE_5__map_slots_js__["a" /* MapSlots */].findAllSlotCandidates(slotConnection, arc);
        let allSlots = [...local, ...remote];

        // MapSlots handles a multi-slot case.
        if (allSlots.length !== 1) {
          return;
        }

        let selectedSlot = allSlots[0];
        return (recipe, slotConnection) => {
          __WEBPACK_IMPORTED_MODULE_5__map_slots_js__["a" /* MapSlots */].connectSlotConnection(slotConnection, selectedSlot);
          return 1;
        };
      }

      onObligation(recipe, obligation) {
        let fromParticle = obligation.from.instance;
        let toParticle = obligation.to.instance;
        for (let fromConnection of Object.values(fromParticle.connections)) {
          for (let toConnection of Object.values(toParticle.connections)) {
            if (fromConnection.handle && fromConnection.handle == toConnection.handle) {
              return (recipe, obligation) => {
                recipe.removeObligation(obligation);
                return 1;
              };
            }
          }
        }
      }
    }(__WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ResolveRecipe;



/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__particle_spec_js__ = __webpack_require__(11);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





class Description {
  constructor(arc) {
    this._arc = arc;
    this._relevance = null;
  }

  get arc() { return this._arc; }
  get relevance() { return this._relevance; }
  set relevance(relevance) { this._relevance = relevance; }

  async getArcDescription(formatterClass) {
    let desc = await new (formatterClass || DescriptionFormatter)(this).getDescription(this._arc.activeRecipe);
    if (desc) {
      return desc;
    }
  }

  async getRecipeSuggestion(formatterClass) {
    let formatter = await new (formatterClass || DescriptionFormatter)(this);
    let desc = await formatter.getDescription(this._arc.recipes[this._arc.recipes.length - 1]);
    if (desc) {
      return desc;
    }

    return formatter._capitalizeAndPunctuate(this._arc.activeRecipe.name || Description.defaultDescription);
  }

  async getHandleDescription(recipeHandle) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipeHandle.connections.length > 0, 'handle has no connections?');

    let formatter = new DescriptionFormatter(this);
    formatter.excludeValues = true;
    return await formatter.getHandleDescription(recipeHandle);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Description;


Description.defaultDescription = 'i\'m feeling lucky';

class DescriptionFormatter {
  constructor(description) {
    this._description = description;
    this._arc = description._arc;
    this._particleDescriptions = [];

    this.seenHandles = new Set();
    this.seenParticles = new Set();
    this.excludeValues = false;
  }

  async getDescription(recipe) {
    await this._updateDescriptionHandles(this._description);

    if (recipe.pattern) {
      let recipeDesc = await this.patternToSuggestion(recipe.pattern, {_recipe: recipe});
      if (recipeDesc) {
        return this._capitalizeAndPunctuate(recipeDesc);
      }
    }

    // Choose particles, sort them by rank and generate suggestions.
    let particlesSet = new Set(recipe.particles);
    let selectedDescriptions = this._particleDescriptions
      .filter(desc => (particlesSet.has(desc._particle) && this._isSelectedDescription(desc)));
    // Prefer particles that render UI, if any.
    if (selectedDescriptions.find(desc => (desc._particle.spec.slots.size > 0))) {
      selectedDescriptions = selectedDescriptions.filter(desc => (desc._particle.spec.slots.size > 0));
    }
    selectedDescriptions = selectedDescriptions.sort(DescriptionFormatter.sort);

    if (selectedDescriptions.length > 0) {
      return this._combineSelectedDescriptions(selectedDescriptions);
    }
  }

  _isSelectedDescription(desc) {
    return !!desc.pattern;
  }

  async getHandleDescription(recipeHandle) {
    await this._updateDescriptionHandles(this._description);

    let handleConnection = this._selectHandleConnection(recipeHandle) || recipeHandle.connections[0];
    let store = this._arc.findStoreById(recipeHandle.id);
    return this._formatDescription(handleConnection, store);
  }

  async _updateDescriptionHandles(description) {
    this._particleDescriptions = [];

    // Combine all particles from direct and inner arcs.
    let innerParticlesByName = {};
    description._arc.recipes.forEach(recipe => {
      let innerArcs = [...recipe.innerArcs.values()];
      innerArcs.forEach(innerArc => {
        innerArc.recipes.forEach(innerRecipe => {
          innerRecipe.particles.forEach(innerParticle => {
            if (!innerParticlesByName[innerParticle.name]) {
              innerParticlesByName[innerParticle.name] = innerParticle;
            }
          });
        });
      });
    });
    let allParticles = description.arc.activeRecipe.particles.concat(Object.values(innerParticlesByName));

    await Promise.all(allParticles.map(async particle => {
      this._particleDescriptions.push(await this._createParticleDescription(particle, description.relevance));
    }));
  }

  async _createParticleDescription(particle, relevance) {
    let pDesc = {
      _particle: particle,
      _connections: {}
    };
    if (relevance) {
      pDesc._rank = relevance.calcParticleRelevance(particle);
    }

    let descByName = await this._getPatternByNameFromDescriptionHandle(particle) || {};
    pDesc = Object.assign(pDesc, this._populateParticleDescription(particle, descByName));
    Object.values(particle.connections).forEach(handleConn => {
      let specConn = particle.spec.connectionMap.get(handleConn.name);
      let pattern = descByName[handleConn.name] || specConn.pattern;
      if (pattern) {
        let handleDescription = {pattern: pattern, _handleConn: handleConn, _store: this._arc.findStoreById(handleConn.handle.id)};
        pDesc._connections[handleConn.name] = handleDescription;
      }
    });
    return pDesc;
  }

  async _getPatternByNameFromDescriptionHandle(particle) {
    let descriptionConn = particle.connections['descriptions'];
    if (descriptionConn && descriptionConn.handle && descriptionConn.handle.id) {
      let descHandle = this._arc.findStoreById(descriptionConn.handle.id);
      if (descHandle) {
        let descList = await descHandle.toList();
        let descByName = {};
        descList.forEach(d => descByName[d.rawData.key] = d.rawData.value);
        return descByName;
      }
    }
  }

  _populateParticleDescription(particle, descriptionByName) {
    let pattern = descriptionByName['_pattern_'] || particle.spec.pattern;
    return pattern ? {pattern} : {};
  }

  async _combineSelectedDescriptions(selectedDescriptions) {
    let suggestions = [];
    await Promise.all(selectedDescriptions.map(async particle => {
      if (!this.seenParticles.has(particle._particle)) {
        suggestions.push(await this.patternToSuggestion(particle.pattern, particle));
      }
    }));
    let jointDescription = this._joinDescriptions(suggestions);
    if (jointDescription) {
      return this._capitalizeAndPunctuate(jointDescription);
    }
  }

  _joinDescriptions(strings) {
    let nonEmptyStrings = strings.filter(str => str);
    let count = nonEmptyStrings.length;
    if (count > 0) {
      // Combine descriptions into a sentence:
      // "A."
      // "A and b."
      // "A, b, ..., and z." (Oxford comma ftw)
      let delim = ['', '', ' and ', ', and '][Math.min(3, count)];
      const lastString = nonEmptyStrings.pop();
      return `${nonEmptyStrings.join(', ')}${delim}${lastString}`;
    }
  }

  _joinTokens(tokens) {
    return tokens.join('');
  }

  _capitalizeAndPunctuate(sentence) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(sentence);
    // "Capitalize, punctuate." (if the sentence doesn't end with a punctuation character).
    let last = sentence.length - 1;
    return `${sentence[0].toUpperCase()}${sentence.slice(1, last)}${sentence[last]}${sentence[last].match(/[a-z0-9()'>\]]/i) ? '.' : ''}`;
  }

  async patternToSuggestion(pattern, particleDescription) {
    let tokens = this._initTokens(pattern, particleDescription);
    let tokenPromises = tokens.map(async token => await this.tokenToString(token));
    let tokenResults = await Promise.all(tokenPromises);
    if (tokenResults.filter(res => res == undefined).length == 0) {
      return this._joinTokens(tokenResults);
    }
  }

  _initTokens(pattern, particleDescription) {
    pattern = pattern.replace(/</g, '&lt;');
    let results = [];
    while (pattern.length > 0) {
      let tokens = pattern.match(/\${[a-zA-Z0-9.]+}(?:\.[_a-zA-Z]+)?/g);
      let firstToken;
      let tokenIndex;
      if (tokens) {
        firstToken = tokens[0];
        tokenIndex = pattern.indexOf(firstToken);
      } else {
        firstToken = '';
        tokenIndex = pattern.length;
      }
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(tokenIndex >= 0);
      let nextToken = pattern.substring(0, tokenIndex);
      if (nextToken.length > 0)
        results.push({text: nextToken});
      if (firstToken.length > 0) {
        results = results.concat(this._initSubTokens(firstToken, particleDescription));
      }
      pattern = pattern.substring(tokenIndex + firstToken.length);
    }
    return results;
  }

  _initSubTokens(pattern, particleDescription) {
    let valueTokens = pattern.match(/\${([a-zA-Z0-9.]+)}(?:\.([_a-zA-Z]+))?/);
    let handleNames = valueTokens[1].split('.');
    let extra = valueTokens.length == 3 ? valueTokens[2] : undefined;
    let valueToken;

    // Fetch the particle description by name from the value token - if it wasn't passed, this is a recipe description.
    if (!particleDescription._particle) {
      let particleName = handleNames.shift();
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particleName[0] === particleName[0].toUpperCase(), `Expected particle name, got '${particleName}' instead.`);
      let particleDescriptions = this._particleDescriptions.filter(desc => {
        return desc._particle.name == particleName
            // The particle description is from the current recipe.
            && particleDescription._recipe.particles.find(p => p == desc._particle);
      });
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particleDescriptions.length > 0, `Cannot find particles with name ${particleName}.`);
      // Note: when an arc's active recipes contains several recipes, the last recipe's description
      // is used as the arc's description. If this last recipe's description has a description pattern
      // that references a particle that is also used in one of the previous recipes,
      // there will be a duplicate particle-description.
      particleDescription = particleDescriptions[particleDescriptions.length - 1];
    }
    let particle = particleDescription._particle;

    if (handleNames.length == 0) {
      // Use the full particle description
      return this._initTokens(particle.spec.pattern || '', particleDescription);
    }

    let handleConn = particle.connections[handleNames[0]];
    if (handleConn) { // handle connection
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handleConn.handle && handleConn.handle.id, 'Missing id???');
      return [{
        fullName: valueTokens[0],
        handleName: handleConn.name,
        properties: handleNames.splice(1),
        extra,
        _handleConn: handleConn,
        _store: this._arc.findStoreById(handleConn.handle.id)}];
    }

    // slot connection
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handleNames.length == 2, 'slot connections tokens must have 2 names');
    let providedSlotConn = particle.consumedSlotConnections[handleNames[0]].providedSlots[handleNames[1]];
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(providedSlotConn, `Could not find handle ${handleNames.join('.')}`);
    return [{
      fullName: valueTokens[0],
      consumeSlotName: handleNames[0],
      provideSlotName: handleNames[1],
      extra,
      _providedSlotConn: providedSlotConn
    }];
  }

  async tokenToString(token) {
    if (token.text) {
      return token.text;
    }
    if (token.handleName) {
      return this._handleTokenToString(token);
    } else if (token.consumeSlotName && token.provideSlotName) {
      return this._slotTokenToString(token);
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, 'no handle or slot name');
  }

  async _handleTokenToString(token) {
    switch (token.extra) {
      case '_type_':
        return token._handleConn.type.toPrettyString().toLowerCase();
      case '_values_':
        return this._formatStoreValue(token.handleName, token._store);
      case '_name_':
        return this._formatDescription(token._handleConn, token._store);
      default: {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!token.extra, `Unrecognized extra ${token.extra}`);

        // Transformation's hosted particle.
        if (token._handleConn.type.isInterface) {
          let particleSpec = __WEBPACK_IMPORTED_MODULE_1__particle_spec_js__["a" /* ParticleSpec */].fromLiteral(await token._store.get());
          // TODO: call this.patternToSuggestion(...) to resolved expressions in the pattern template.
          return particleSpec.pattern;
        }

        // singleton handle property.
        if (token.properties && token.properties.length > 0) {
          return this._propertyTokenToString(token.handleName, token._store, token.properties);
        }

        // full handle description
        let description = (await this._formatDescriptionPattern(token._handleConn)) ||
                          this._formatStoreDescription(token._handleConn, token._store);
        let storeValue = await this._formatStoreValue(token.handleName, token._store);
        if (!description) {
          // For singleton handle, if there is no real description (the type was used), use the plain value for description.
          if (storeValue && !token._store.type.isCollection && !this.excludeValues) {
            return storeValue;
          }
        }

        description = description || this._formatHandleType(token._handleConn);
        if (storeValue && !this.excludeValues && !this.seenHandles.has(token._store.id)) {
          this.seenHandles.add(token._store.id);
          return this._combineDescriptionAndValue(token, description, storeValue);
        }
        return description;
      }
    }
  }

  _combineDescriptionAndValue(token, description, storeValue) {
    return `${description} (${storeValue})`;
  }

  async _slotTokenToString(token) {
    switch (token.extra) {
      case '_empty_':
        // TODO: also return false, if the consuming particles generate an empty description.
        return token._providedSlotConn.consumeConnections.length == 0;
      default:
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!token.extra, `Unrecognized slot extra ${token.extra}`);
    }

    let results = (await Promise.all(token._providedSlotConn.consumeConnections.map(async consumeConn => {
      let particle = consumeConn.particle;
      let particleDescription = this._particleDescriptions.find(desc => desc._particle == particle);
      this.seenParticles.add(particle);
      return this.patternToSuggestion(particle.spec.pattern, particleDescription);
    })));

    return this._joinDescriptions(results);
  }

  async _propertyTokenToString(handleName, store, properties) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!store.type.isCollection, `Cannot return property ${properties.join(',')} for collection`);
    // Use singleton value's property (eg. "09/15" for person's birthday)
    let valueVar = await store.get();
    if (valueVar) {
      let value = valueVar.rawData;
      properties.forEach(p => {
        if (value) {
          value = value[p];
        }
      });
      if (value) {
        return this._formatEntityProperty(handleName, properties, value);
      }
    }
  }

  _formatEntityProperty(handleName, properties, value) {
    return value;
  }

  async _formatStoreValue(handleName, store) {
    if (!store) {
      return;
    }
    if (store.type.isCollection) {
      let values = await store.toList();
      if (values && values.length > 0) {
        return this._formatCollection(handleName, values);
      }
    } else {
      let value = await store.get();
      if (value) {
        return this._formatSingleton(handleName, value, store.type.data.description.value);
      }
    }
  }

  _formatCollection(handleName, values) {
    if (values[0].rawData.name) {
      if (values.length > 2) {
        return `${values[0].rawData.name} plus ${values.length-1} other items`;
      }
      return values.map(v => v.rawData.name).join(', ');
    } else {
      return `${values.length} items`;
    }
  }

  _formatSingleton(handleName, value, handleDescription) {
    if (handleDescription) {
      let valueDescription = handleDescription;
      let matches;
      while (matches = valueDescription.match(/\${([a-zA-Z0-9.]+)}/)) {
        valueDescription = valueDescription.replace(matches[0], value.rawData[matches[1]]);
      }
      return valueDescription;
    }
    if (value.rawData.name) {
      return value.rawData.name;
    }
  }

  async _formatDescription(handleConnection, store) {
    return (await this._formatDescriptionPattern(handleConnection)) ||
           this._formatStoreDescription(handleConnection, store) ||
           this._formatHandleType(handleConnection);
  }

  async _formatDescriptionPattern(handleConnection) {
    let chosenConnection = handleConnection;

    // For "out" connection, use its own description
    // For "in" connection, use description of the highest ranked out connection with description.
    if (!chosenConnection.spec.isOutput) {
      let otherConnection = this._selectHandleConnection(handleConnection.handle);
      if (otherConnection) {
        chosenConnection = otherConnection;
      }
    }

    let chosenParticleDescription = this._particleDescriptions.find(desc => desc._particle == chosenConnection.particle);
    let handleDescription = chosenParticleDescription ? chosenParticleDescription._connections[chosenConnection.name] : null;
    // Add description to result array.
    if (handleDescription) {
      // Add the connection spec's description pattern.
      return await this.patternToSuggestion(handleDescription.pattern, chosenParticleDescription);
    }
  }
  _formatStoreDescription(handleConn, store) {
    if (store) {
      let storeDescription = this._arc.getStoreDescription(store);
      let handleType = this._formatHandleType(handleConn);
      // Use the handle description available in the arc (if it is different than type name).
      if (!!storeDescription && storeDescription != handleType) {
        return storeDescription;
      }
    }
  }
  _formatHandleType(handleConnection) {
    let type = handleConnection.handle && handleConnection.handle.type.isResolved() ? handleConnection.handle.type : handleConnection.type;
    return type.toPrettyString().toLowerCase();
  }

  _selectHandleConnection(recipeHandle) {
    let possibleConnections = recipeHandle.connections.filter(connection => {
      // Choose connections with patterns (manifest-based or dynamic).
      let connectionSpec = connection.spec;
      let particleDescription = this._particleDescriptions.find(desc => desc._particle == connection.particle);
      return !!connectionSpec.pattern || !!particleDescription._connections[connection.name];
    });

    possibleConnections.sort((c1, c2) => {
      let isOutput1 = c1.spec.isOutput;
      let isOutput2 = c2.spec.isOutput;
      if (isOutput1 != isOutput2) {
        // Prefer output connections
        return isOutput1 ? -1 : 1;
      }

      let d1 = this._particleDescriptions.find(desc => desc._particle == c1.particle);
      let d2 = this._particleDescriptions.find(desc => desc._particle == c2.particle);
      // Sort by particle's rank in descending order.
      return d2._rank - d1._rank;
    });

    if (possibleConnections.length > 0) {
      return possibleConnections[0];
    }
  }

  static sort(p1, p2) {
    let isRoot = (slotSpec) => slotSpec.name == 'root' || slotSpec.tags.includes('root');
    // Root slot comes first.
    let hasRoot1 = Boolean([...p1._particle.spec.slots.values()].find(slotSpec => isRoot(slotSpec)));
    let hasRoot2 = Boolean([...p2._particle.spec.slots.values()].find(slotSpec => isRoot(slotSpec)));
    if (hasRoot1 != hasRoot2) {
      return hasRoot1 ? -1 : 1;
    }

    // Sort by rank
    if (p1._rank != p2._rank) {
      return p2._rank - p1._rank;
    }

    // Sort by number of singleton slots.
    let p1Slots = 0, p2Slots = 0;
    p1._particle.spec.slots.forEach((slotSpec) => { if (!slotSpec.isSet) ++p1Slots; });
    p2._particle.spec.slots.forEach((slotSpec) => { if (!slotSpec.isSet) ++p2Slots; });
    return p2Slots - p1Slots;
  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = DescriptionFormatter;



/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_date_web_js__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__strategies_rulesets_js__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__platform_deviceinfo_web_js__ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__strategies_convert_constraints_to_connections_js__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__strategies_assign_remote_handles_js__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__strategies_copy_remote_handles_js__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__strategies_assign_handles_by_tag_and_type_js__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__strategies_init_population_js__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__strategies_map_slots_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__strategies_match_particle_by_verb_js__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__strategies_match_recipe_by_verb_js__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__strategies_name_unnamed_connections_js__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__strategies_add_use_handles_js__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__strategies_create_description_handle_js__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__strategies_init_search_js__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__strategies_search_tokens_to_handles_js__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__strategies_search_tokens_to_particles_js__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__strategies_fallback_fate_js__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__strategies_group_handle_connections_js__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__strategies_match_free_handles_to_connections_js__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__strategies_create_handles_js__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__strategies_create_handle_group_js__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__strategies_combined_strategy_js__ = __webpack_require__(108);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__strategies_find_hosted_particle_js__ = __webpack_require__(109);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__strategies_coalesce_recipes_js__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__strategies_resolve_recipe_js__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__speculator_js__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__tracelib_trace_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__debug_strategy_explorer_adapter_js__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__debug_devtools_connection_js__ = __webpack_require__(10);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt


































class Planner {
  constructor() {
    this._relevances = [];
  }

  // TODO: Use context.arc instead of arc
  init(arc, {strategies, ruleset, strategyArgs = {}} = {}) {
    strategyArgs = Object.freeze(Object.assign({}, strategyArgs));
    this._arc = arc;
    strategies = (strategies || Planner.AllStrategies).map(strategy => new strategy(arc, strategyArgs));
    this.strategizer = new __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__["a" /* Strategizer */](strategies, [], ruleset || __WEBPACK_IMPORTED_MODULE_2__strategies_rulesets_js__["a" /* Empty */]);
  }

  // Specify a timeout value less than zero to disable timeouts.
  async plan(timeout, generations) {
    let trace = __WEBPACK_IMPORTED_MODULE_29__tracelib_trace_js__["a" /* Tracing */].start({cat: 'planning', name: 'Planner::plan', overview: true, args: {timeout}});
    timeout = timeout || -1;
    let allResolved = [];
    let start = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_date_web_js__["a" /* now */])();
    do {
      let record = await trace.wait(this.strategizer.generate());
      let generated = this.strategizer.generated;
      trace.addArgs({
        generated: generated.length,
        generation: this.strategizer.generation
      });
      if (generations) {
        generations.push({generated, record});
      }

      let resolved = this.strategizer.generated
          .map(individual => individual.result)
          .filter(recipe => recipe.isResolved());

      allResolved.push(...resolved);
      const elapsed = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_date_web_js__["a" /* now */])() - start;
      if (timeout >= 0 && elapsed > timeout) {
        console.warn(`Planner.plan timed out [elapsed=${Math.floor(elapsed)}ms, timeout=${timeout}ms].`);
        break;
      }
    } while (this.strategizer.generated.length + this.strategizer.terminal.length > 0);
    trace.end();
    return allResolved;
  }

  _matchesActiveRecipe(plan) {
    let planShape = __WEBPACK_IMPORTED_MODULE_4__recipe_recipe_util_js__["a" /* RecipeUtil */].recipeToShape(plan);
    let result = __WEBPACK_IMPORTED_MODULE_4__recipe_recipe_util_js__["a" /* RecipeUtil */].find(this._arc._activeRecipe, planShape);
    return result.some(r => r.score == 0);
  }

  _speculativeThreadCount() {
    // TODO(wkorman): We'll obviously have to rework the below when we do
    // speculation in the cloud.
    const cores = __WEBPACK_IMPORTED_MODULE_3__platform_deviceinfo_web_js__["a" /* DeviceInfo */].hardwareConcurrency();
    const memory = __WEBPACK_IMPORTED_MODULE_3__platform_deviceinfo_web_js__["a" /* DeviceInfo */].deviceMemory();
    // For now, allow occupying half of the available cores while constraining
    // total memory used to at most a quarter of what's available. In the
    // absence of resource information we just run two in parallel as a
    // perhaps-low-end-device-oriented balancing act.
    const minCores = 2;
    if (!cores || !memory) {
      return minCores;
    }

    // A rough estimate of memory used per thread in gigabytes.
    const memoryPerThread = 0.125;
    const quarterMemory = memory / 4;
    const maxThreadsByMemory = quarterMemory / memoryPerThread;
    const maxThreadsByCores = cores / 2;
    return Math.max(minCores, Math.min(maxThreadsByMemory, maxThreadsByCores));
  }
  _splitToGroups(items, groupCount) {
    const groups = [];
    if (!items || items.length == 0) return groups;
    const groupItemSize = Math.max(1, Math.floor(items.length / groupCount));
    let startIndex = 0;
    for (let i = 0; i < groupCount && startIndex < items.length; i++) {
      groups.push(items.slice(startIndex, startIndex + groupItemSize));
      startIndex += groupItemSize;
    }
    // Add any remaining items to the end of the last group.
    if (startIndex < items.length) {
      groups[groups.length - 1].push(...items.slice(startIndex, items.length));
    }
    return groups;
  }
  async suggest(timeout, generations, speculator) {
    let trace = __WEBPACK_IMPORTED_MODULE_29__tracelib_trace_js__["a" /* Tracing */].start({cat: 'planning', name: 'Planner::suggest', overview: true, args: {timeout}});
    if (!generations && __WEBPACK_IMPORTED_MODULE_31__debug_devtools_connection_js__["a" /* DevtoolsConnection */].isConnected) generations = [];
    let plans = await trace.wait(this.plan(timeout, generations));
    let suggestions = [];
    speculator = speculator || new __WEBPACK_IMPORTED_MODULE_28__speculator_js__["a" /* Speculator */]();
    // We don't actually know how many threads the VM will decide to use to
    // handle the parallel speculation, but at least we know we won't kick off
    // more than this number and so can somewhat limit resource utilization.
    // TODO(wkorman): Rework this to use a fixed size 'thread' pool for more
    // efficient work distribution.
    const threadCount = this._speculativeThreadCount();
    const planGroups = this._splitToGroups(plans, threadCount);
    let results = await trace.wait(Promise.all(planGroups.map(async (group, groupIndex) => {
      let results = [];
      for (let plan of group) {
        let hash = ((hash) => { return hash.substring(hash.length - 4);})(await plan.digest());

        if (this._matchesActiveRecipe(plan)) {
          this._updateGeneration(generations, hash, (g) => g.active = true);
          continue;
        }

        let planTrace = __WEBPACK_IMPORTED_MODULE_29__tracelib_trace_js__["a" /* Tracing */].start({
          cat: 'speculating',
          sequence: `speculator_${groupIndex}`,
          overview: true,
          args: {groupIndex}
        });

        // TODO(wkorman): Look at restoring trace.wait() here, and whether we
        // should do similar for the async getRecipeSuggestion() below as well?
        let relevance = await speculator.speculate(this._arc, plan, hash);
        if (!relevance.isRelevant(plan)) {
          this._updateGeneration(generations, hash, (g) => g.irrelevant = true);
          planTrace.end({name: '[Irrelevant suggestion]', hash, groupIndex});
          continue;
        }
        let rank = relevance.calcRelevanceScore();

        relevance.newArc.description.relevance = relevance;
        let description = await relevance.newArc.description.getRecipeSuggestion();

        this._updateGeneration(generations, hash, (g) => g.description = description);

        // TODO: Move this logic inside speculate, so that it can stop the arc
        // before returning.
        relevance.newArc.stop();

        results.push({
          plan,
          rank,
          description: relevance.newArc.description,
          descriptionText: description, // TODO(mmandlis): exclude the text description from returned results.
          hash,
          groupIndex
        });

        planTrace.end({name: description, args: {rank, hash, groupIndex}});
      }
      return results;
    })));
    results = [].concat(...results);

    this._relevances = [];

    if (generations && __WEBPACK_IMPORTED_MODULE_31__debug_devtools_connection_js__["a" /* DevtoolsConnection */].isConnected) {
      __WEBPACK_IMPORTED_MODULE_30__debug_strategy_explorer_adapter_js__["a" /* StrategyExplorerAdapter */].processGenerations(generations, __WEBPACK_IMPORTED_MODULE_31__debug_devtools_connection_js__["a" /* DevtoolsConnection */].get());
    }

    return trace.endWith(results);
  }
  _updateGeneration(generations, hash, handler) {
    if (generations) {
      generations.forEach(g => {
        g.generated.forEach(gg => {
          if (gg.hash.endsWith(hash)) {
            handler(gg);
          }
        });
      });
    }
  }
  dispose() {
    // The speculative arc particle execution contexts are are worklets,
    // so they need to be cleanly shut down, otherwise they would persist,
    // as an idle eventLoop in a process waiting for messages.
    this._relevances.forEach(relevance => relevance.newArc.dispose());
    this._relevances = [];
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Planner;


Planner.InitializationStrategies = [
  __WEBPACK_IMPORTED_MODULE_9__strategies_init_population_js__["a" /* InitPopulation */],
  __WEBPACK_IMPORTED_MODULE_16__strategies_init_search_js__["a" /* InitSearch */]
];

Planner.ResolutionStrategies = [
  __WEBPACK_IMPORTED_MODULE_18__strategies_search_tokens_to_particles_js__["a" /* SearchTokensToParticles */],
  __WEBPACK_IMPORTED_MODULE_17__strategies_search_tokens_to_handles_js__["a" /* SearchTokensToHandles */],
  __WEBPACK_IMPORTED_MODULE_20__strategies_group_handle_connections_js__["a" /* GroupHandleConnections */],
  __WEBPACK_IMPORTED_MODULE_19__strategies_fallback_fate_js__["a" /* FallbackFate */],
  __WEBPACK_IMPORTED_MODULE_22__strategies_create_handles_js__["a" /* CreateHandles */],
  __WEBPACK_IMPORTED_MODULE_23__strategies_create_handle_group_js__["a" /* CreateHandleGroup */],
  __WEBPACK_IMPORTED_MODULE_8__strategies_assign_handles_by_tag_and_type_js__["a" /* AssignHandlesByTagAndType */],
  __WEBPACK_IMPORTED_MODULE_5__strategies_convert_constraints_to_connections_js__["a" /* ConvertConstraintsToConnections */],
  __WEBPACK_IMPORTED_MODULE_10__strategies_map_slots_js__["a" /* MapSlots */],
  __WEBPACK_IMPORTED_MODULE_6__strategies_assign_remote_handles_js__["a" /* AssignRemoteHandles */],
  __WEBPACK_IMPORTED_MODULE_7__strategies_copy_remote_handles_js__["a" /* CopyRemoteHandles */],
  __WEBPACK_IMPORTED_MODULE_11__strategies_match_particle_by_verb_js__["a" /* MatchParticleByVerb */],
  __WEBPACK_IMPORTED_MODULE_12__strategies_match_recipe_by_verb_js__["a" /* MatchRecipeByVerb */],
  __WEBPACK_IMPORTED_MODULE_13__strategies_name_unnamed_connections_js__["a" /* NameUnnamedConnections */],
  __WEBPACK_IMPORTED_MODULE_14__strategies_add_use_handles_js__["a" /* AddUseHandles */],
  __WEBPACK_IMPORTED_MODULE_15__strategies_create_description_handle_js__["a" /* CreateDescriptionHandle */],
  __WEBPACK_IMPORTED_MODULE_21__strategies_match_free_handles_to_connections_js__["a" /* MatchFreeHandlesToConnections */],
  __WEBPACK_IMPORTED_MODULE_27__strategies_resolve_recipe_js__["a" /* ResolveRecipe */],
  __WEBPACK_IMPORTED_MODULE_25__strategies_find_hosted_particle_js__["a" /* FindHostedParticle */],
  __WEBPACK_IMPORTED_MODULE_26__strategies_coalesce_recipes_js__["a" /* CoalesceRecipes */]
];

Planner.AllStrategies = Planner.InitializationStrategies.concat(Planner.ResolutionStrategies);


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = digest;
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

async function digest(str) {
  let buffer = new TextEncoder('utf-8').encode(str);
  let digest = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(digest)).map(x => ('00' + x.toString(16)).slice(-2)).join('');
}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shell_components_xen_xen_template_js__ = __webpack_require__(115);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





const templateByName = new Map();

class DomContext {
  constructor(container, containerKind, subId, templateName) {
    this._container = container; // html node, e.g. <div>
    this._containerKind = containerKind; // string, e.g 'div'
    // TODO(sjmiles): _liveDom needs new name
    this._liveDom = null;
    this._innerContainerBySlotName = {};
    this._templateName = templateName || null;
    this._subId = subId || null;
  }
  get subId() {return this._subId; }
  set subId(subId) { this._subId = subId; }
  static clear(container) {
    container.textContent = '';
  }
  static createContext(container, content) {
    let context = new DomContext(container);
    context._stampTemplate(context.createTemplateElement(content.template), () => {});
    context.updateModel(content.model);
    return context;
  }
  initContainer(container) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(container);
    if (!this._container) {
      this._container = document.createElement(this._containerKind || 'div');
      this._setParticleName('');
      container.appendChild(this._container);
    } else {
      //assert(this._container.parentNode == container, 'TODO: add support for moving slot to different container');
    }
  }
  updateParticleName(slotName, particleName) {
    this._setParticleName(`${slotName}::${particleName}`);
  }
  _setParticleName(name) {
    this._container.setAttribute('particle-host', name);
  }
  get container() { return this._container; }
  isSameContainer(container) {
    return this._container.parentNode == container;
  }
  setTemplate(templatePrefix, templateName, template) {
    this._templateName = [templatePrefix, templateName].filter(s => s).join('::');
    if (typeof template === 'string') {
      if (templateByName.has(this._templateName)) {
        // TODO: check whether the new template is different from the one that was previously used.
        // Template is being replaced.
        this.clear();
      }
      templateByName.set(this._templateName, this.createTemplateElement(template));
    }
  }
  hasTemplate(templatePrefix) {
    return DomContext.hasTemplate(templatePrefix);
  }
  static hasTemplate(templatePrefix) {
    return [...templateByName.keys()].find(key => key.startsWith(templatePrefix));
  }
  static dispose() {
    // empty template cache
    templateByName.clear();
  }
  updateModel(model) {
    if (this._liveDom) {
      this._liveDom.set(model);
    }
  }
  clear() {
    if (this._liveDom) {
      this._liveDom.root.textContent = '';
    }
    this._liveDom = null;
    this._innerContainerBySlotName = {};
  }
  static createTemplateElement(template) {
    return Object.assign(document.createElement('template'), {innerHTML: template});
  }
  createTemplateElement(template) {
    return DomContext.createTemplateElement(template);
  }
  stampTemplate(eventHandler) {
    if (this._templateName) {
      let template = templateByName.get(this._templateName);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(template, `No template for ${this._templateName}`);
      this._stampTemplate(template, eventHandler);
    }
  }
  _stampTemplate(template, eventHandler) {
    if (!this._liveDom) {
      // TODO(sjmiles): hack to allow subtree elements (e.g. x-list) to marshal events
      this._container._eventMapper = this._eventMapper.bind(this, eventHandler);
      this._liveDom = __WEBPACK_IMPORTED_MODULE_1__shell_components_xen_xen_template_js__["a" /* default */]
          .stamp(template)
          .events(this._container._eventMapper)
          .appendTo(this._container);
    }
  }
  observe(observer) {
    observer.observe(this._container, {childList: true, subtree: true});
  }
  getInnerContainer(innerSlotName) {
    return this._innerContainerBySlotName[innerSlotName];
  }
  isDirectInnerSlot(container) {
    if (container === this._container) {
      return true;
    }
    let parentNode = container.parentNode;
    while (parentNode) {
      if (parentNode == this._container) {
        return true;
      }
      if (parentNode.getAttribute('slotid')) {
        // this is an inner slot of an inner slot.
        return false;
      }
      parentNode = parentNode.parentNode;
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false);
  }
  // get a value from node that could be an attribute, if not a property
  getNodeValue(node, name) {
    // TODO(sjmiles): remember that attribute names from HTML are lower-case
    return node[name] || node.getAttribute(name);
  }
  initInnerContainers(slotSpec) {
    this._innerContainerBySlotName = {};
    Array.from(this._container.querySelectorAll('[slotid]')).forEach(container => {
      if (!this.isDirectInnerSlot(container)) {
        // Skip inner slots of an inner slot of the given slot.
        return;
      }
      const slotId = this.getNodeValue(container, 'slotid');
      const providedSlotSpec = slotSpec.getProvidedSlotSpec(slotId);
      if (!providedSlotSpec) { // Skip non-declared slots
        console.warn(`Slot ${slotSpec.name} has unexpected inner slot ${slotId}`);
        return;
      }
      const subId = this.getNodeValue(container, 'subid');
      this._validateSubId(providedSlotSpec, subId);
      this._initInnerSlotContainer(slotId, subId, container);
    });
  }
  _initInnerSlotContainer(slotId, subId, container) {
    if (subId) {
      if (!this._innerContainerBySlotName[slotId]) {
        this._innerContainerBySlotName[slotId] = {};
      }
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this._innerContainerBySlotName[slotId][subId], `Multiple ${slotId}:${subId} inner slots cannot be provided`);
      this._innerContainerBySlotName[slotId][subId] = container;
    } else {
      this._innerContainerBySlotName[slotId] = container;
    }
  }
  _validateSubId(providedSlotSpec, subId) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this.subId || !subId || this.subId == subId, `Unexpected sub-id ${subId}, expecting ${this.subId}`);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Boolean(this.subId || subId) === providedSlotSpec.isSet,
        `Sub-id ${subId} for provided slot ${providedSlotSpec.name} doesn't match set spec: ${providedSlotSpec.isSet}`);
  }
  findRootContainers() {
    let containerBySlotId = {};
    Array.from(this._container.querySelectorAll('[slotid]')).forEach(container => {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.isDirectInnerSlot(container), 'Unexpected inner slot');
      let slotId = container.getAttribute('slotid');
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!containerBySlotId[slotId], `Duplicate root slot ${slotId}`);
      containerBySlotId[slotId] = container;
    });
    return containerBySlotId;
  }
  _eventMapper(eventHandler, node, eventName, handlerName) {
    node.addEventListener(eventName, event => {
      // TODO(sjmiles): we have an extremely minimalist approach to events here, this is useful IMO for
      // finding the smallest set of features that we are going to need.
      // First problem: click event firing multiple times as it bubbles up the tree, minimalist solution
      // is to enforce a 'first listener' rule by executing `stopPropagation`.
      event.stopPropagation();
      // propagate keyboard information
      const {altKey, ctrlKey, metaKey, shiftKey, code, key, repeat} = event;
      eventHandler({
        handler: handlerName,
        data: {
          // TODO(sjmiles): this is a data-key (as in key-value pair), may be confusing vs `keys`
          key: node.key,
          value: node.value,
          keys: {altKey, ctrlKey, metaKey, shiftKey, code, key, repeat}
        }
      });
    });
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DomContext;



/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shell_components_xen_xen_state_js__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dom_particle_base_js__ = __webpack_require__(86);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





/** @class DomParticle
 * Particle that interoperates with DOM and uses a simple state system
 * to handle updates.
 */
class DomParticle extends __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__shell_components_xen_xen_state_js__["a" /* XenStateMixin */])(__WEBPACK_IMPORTED_MODULE_1__dom_particle_base_js__["a" /* DomParticleBase */]) {
  constructor() {
    super();
    // alias properties to remove `_`
    this.state = this._state;
    this.props = this._props;
  }
  /** @method willReceiveProps(props, state, oldProps, oldState)
   * Override if necessary, to do things when props change.
   */
  willReceiveProps() {
  }
  /** @method update(props, state, oldProps, oldState)
   * Override if necessary, to modify superclass config.
   */
  update() {
  }
  /** @method shouldRender(props, state, oldProps, oldState)
   * Override to return false if the Particle won't use
   * it's slot.
   */
  shouldRender() {
    return true;
  }
  /** @method render(props, state, oldProps, oldState)
   * Override to return a dictionary to map into the template.
   */
  render() {
    return {};
  }
  /** @method setState(state)
   * Copy values from `state` into the particle's internal state,
   * triggering an update cycle unless currently updating.
   */
  setState(state) {
    return this._setState(state);
  }
  // TODO(sjmiles): deprecated, just use setState
  setIfDirty(state) {
    console.warn('DomParticle: `setIfDirty` is deprecated, please use `setState` instead');
    return this._setState(state);
  }
  /** @method get config()
   * Override if necessary, to modify superclass config.
   */
  get config() {
    // TODO(sjmiles): getter that does work is a bad idea, this is temporary
    return {
      handleNames: this.spec.inputs.map(i => i.name),
      // TODO(mmandlis): this.spec needs to be replaced with a particle-spec loaded from
      // .manifest files, instead of .ptcl ones.
      slotNames: [...this.spec.slots.values()].map(s => s.name)
    };
  }
  // affordances for aliasing methods to remove `_`
  _willReceiveProps(...args) {
    this.willReceiveProps(...args);
  }
  _update(...args) {
    this.update(...args);
    if (this.shouldRender(...args)) { // TODO: should shouldRender be slot specific?
      this.relevance = 1; // TODO: improve relevance signal.
    }
    this.config.slotNames.forEach(s => this.renderSlot(s, ['model']));
  }
  //
  // deprecated
  get _views() {
    console.warn(`Particle ${this.spec.name} uses deprecated _views getter.`);
    return this.handles;
  }
  async setViews(views) {
    console.warn(`Particle ${this.spec.name} uses deprecated setViews method.`);
    return this.setHandles(views);
  }
  // end deprecated
  //
  async setHandles(handles) {
    this.handles = handles;
    this._handlesToSync = new Set(this.config.handleNames);
    // make sure we invalidate once, even if there are no incoming handles
    this._invalidate();
  }
  async onHandleSync(handle, model) {
    this._handlesToSync.delete(handle.name);
    if (this._handlesToSync.size == 0) {
      await this._handlesToProps();
    }
  }
  async onHandleUpdate(handle, update) {
    await this._handlesToProps();
  }
  async _handlesToProps() {
    let config = this.config;
    // acquire (async) list data from handles
    let data = await Promise.all(
      config.handleNames
      .map(name => this.handles.get(name))
      .map(handle => handle.toList ? handle.toList() : handle.get())
    );
    // convert handle data (array) into props (dictionary)
    let props = Object.create(null);
    config.handleNames.forEach((name, i) => {
      props[name] = data[i];
    });
    this._setProps(props);
  }
  fireEvent(slotName, {handler, data}) {
    if (this[handler]) {
      // TODO(sjmiles): remove `this._state` parameter
      this[handler]({data}, this._state);
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DomParticle;



/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_fs_web_js__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_vm_web_js__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__fetch_web_js__ = __webpack_require__(89);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__particle_js__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dom_particle_js__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__multiplexer_dom_particle_js__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__transformation_dom_particle_js__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__converters_jsonldToManifest_js__ = __webpack_require__(77);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */










const html = (strings, ...values) => (strings[0] + values.map((v, i) => v + strings[i + 1]).join('')).trim();

function schemaLocationFor(name) {
  return `../entities/${name}.schema`;
}

class Loader {
  path(fileName) {
    let path = fileName.replace(/[/][^/]+$/, '/');
    return path;
  }

  join(prefix, path) {
    if (/^https?:\/\//.test(path))
      return path;
    // TODO: replace this with something that isn't hacky
    if (path[0] == '/' || path[1] == ':')
      return path;
    prefix = this.path(prefix);
    return prefix + path;
  }

  loadResource(file) {
    if (/^https?:\/\//.test(file))
      return this._loadURL(file);
    return this._loadFile(file);
  }

  _loadFile(file) {
    return new Promise((resolve, reject) => {
      __WEBPACK_IMPORTED_MODULE_0__platform_fs_web_js__["a" /* fs */].readFile(file, (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data.toString('utf-8'));
      });
    });
  }

  _loadURL(url) {
    if (/\/\/schema.org\//.test(url)) {
      if (url.endsWith('/Thing')) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__fetch_web_js__["a" /* fetch */])('https://schema.org/Product.jsonld').then(res => res.text()).then(data => __WEBPACK_IMPORTED_MODULE_8__converters_jsonldToManifest_js__["a" /* JsonldToManifest */].convert(data, {'@id': 'schema:Thing'}));
      }
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__fetch_web_js__["a" /* fetch */])(url + '.jsonld').then(res => res.text()).then(data => __WEBPACK_IMPORTED_MODULE_8__converters_jsonldToManifest_js__["a" /* JsonldToManifest */].convert(data));
    }
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__fetch_web_js__["a" /* fetch */])(url).then(res => res.text());
  }

  async loadParticleClass(spec) {
    let clazz = await this.requireParticle(spec.implFile);
    clazz.spec = spec;
    return clazz;
  }

  async requireParticle(fileName) {
    if (fileName === null) fileName = '';
    let src = await this.loadResource(fileName);
    // Note. This is not real isolation.
    let script = new __WEBPACK_IMPORTED_MODULE_1__platform_vm_web_js__["a" /* vm */].Script(src, {filename: fileName, displayErrors: true});
    let result = [];
    let self = {
      defineParticle(particleWrapper) {
        result.push(particleWrapper);
      },
      console,
      importScripts: s => null //console.log(`(skipping browser-space import for [${s}])`)
    };
    script.runInNewContext(self, {filename: fileName, displayErrors: true});
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__platform_assert_web_js__["a" /* assert */])(result.length > 0 && typeof result[0] == 'function', `Error while instantiating particle implementation from ${fileName}`);
    return this.unwrapParticle(result[0]);
  }

  unwrapParticle(particleWrapper) {
    return particleWrapper({Particle: __WEBPACK_IMPORTED_MODULE_4__particle_js__["a" /* Particle */], DomParticle: __WEBPACK_IMPORTED_MODULE_5__dom_particle_js__["a" /* DomParticle */], TransformationDomParticle: __WEBPACK_IMPORTED_MODULE_7__transformation_dom_particle_js__["a" /* TransformationDomParticle */], MultiplexerDomParticle: __WEBPACK_IMPORTED_MODULE_6__multiplexer_dom_particle_js__["a" /* MultiplexerDomParticle */], html});
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Loader;



/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tracelib_trace_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__ = __webpack_require__(0);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





/** @class Particle
 * A basic particle. For particles that provide UI, you may like to
 * instead use DOMParticle.
 */
class Particle {
  constructor(capabilities) {
    this.spec = this.constructor.spec;
    if (this.spec.inputs.length == 0)
      this.extraData = true;
    this.relevances = [];
    this._idle = Promise.resolve();
    this._busy = 0;
    this._slotByName = new Map();
    this.capabilities = capabilities || {};
  }

  /** @method setHandles(handles)
   * This method is invoked with a handle for each store this particle
   * is registered to interact with, once those handles are ready for
   * interaction. Override the method to register for events from
   * the handles.
   *
   * Handles is a map from handle names to store handles.
   */
  setHandles(handles) {
  }
  
  /** @method setViews(views)
   * This method is deprecated. Use setHandles instead.
   */
  setViews(views) {
  }

  /** @method onHandleSync(handle, model)
   * Called for handles that are configured with both keepSynced and notifySync, when they are
   * updated with the full model of their data. This will occur once after setHandles() and any time
   * thereafter if the handle is resynchronized.
   *
   * handle: The Handle instance that was updated.
   * model: For Variable-backed Handles, the Entity data or null if the Variable is not set.
   *        For Collection-backed Handles, the Array of Entities, which may be empty.
   */
  onHandleSync(handle, model) {
  }

  /** @method onHandleUpdate(handle, update)
   * Called for handles that are configued with notifyUpdate, when change events are received from
   * the backing store. For handles also configured with keepSynced these events will be correctly
   * ordered, with some potential skips if a desync occurs. For handles not configured with
   * keepSynced, all change events will be passed through as they are received.
   *
   * handle: The Handle instance that was updated.
   * update: An object containing one of the following fields:
   *    data: The full Entity for a Variable-backed Handle.
   *    added: An Array of Entities added to a Collection-backed Handle.
   *    removed: An Array of Entities removed from a Collection-backed Handle.
   */
  onHandleUpdate(handle, update) {
  }

  /** @method onHandleDesync(handle)
   * Called for handles that are configured with both keepSynced and notifyDesync, when they are
   * detected as being out-of-date against the backing store. For Variables, the event that triggers
   * this will also resync the data and thus this call may usually be ignored. For Collections, the
   * underlying proxy will automatically request a full copy of the stored data to resynchronize.
   * onHandleSync will be invoked when that is received.
   *
   * handle: The Handle instance that was desynchronized.
   */
  onHandleDesync(handle) {
  }

  constructInnerArc() {
    if (!this.capabilities.constructInnerArc)
      throw new Error('This particle is not allowed to construct inner arcs');
    return this.capabilities.constructInnerArc(this);
  }

  get busy() {
    return this._busy > 0;
  }

  get idle() {
    return this._idle;
  }

  set relevance(r) {
    this.relevances.push(r);
  }

  inputs() {
    return this.spec.inputs;
  }

  outputs() {
    return this.spec.outputs;
  }

  /** @method getSlot(name)
   * Returns the slot with provided name.
   */
  getSlot(name) {
    return this._slotByName.get(name);
  }

  static buildManifest(strings, ...bits) {
    let output = [];
    for (let i = 0; i < bits.length; i++) {
        let str = strings[i];
        let indent = / *$/.exec(str)[0];
        let bitStr;
        if (typeof bits[i] == 'string')
          bitStr = bits[i];
        else
          bitStr = bits[i].toManifestString();
        bitStr = bitStr.replace(/(\n)/g, '$1' + indent);
        output.push(str);
        output.push(bitStr);
    }
    if (strings.length > bits.length)
      output.push(strings[strings.length - 1]);
    return output.join('');
  }

  setParticleDescription(pattern) {
    return this.setDescriptionPattern('_pattern_', pattern);
  }
  setDescriptionPattern(connectionName, pattern) {
    let descriptions = this.handles.get('descriptions');
    if (descriptions) {
      descriptions.store(new descriptions.entityClass({key: connectionName, value: pattern}, connectionName));
      return true;
    }
    return false;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Particle;



/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




class ParticleEndPoint {
  constructor(particle, connection) {
    this.particle = particle;
    this.connection = connection;
  }

  _clone() {
    return new ParticleEndPoint(this.particle, this.connection);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_0__util_js__["b" /* compareStrings */](this.particle.name, other.particle.name)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_0__util_js__["b" /* compareStrings */](this.connection, other.connection)) != 0) return cmp;
    return 0;
  }

  toString() {
    if (!this.connection)
      return `${this.particle.name}`;
    return `${this.particle.name}.${this.connection}`;
  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = ParticleEndPoint;


class InstanceEndPoint {
  constructor(instance, connection) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(instance);
    this.recipe = instance.recipe;
    this.instance = instance;
    this.connection = connection;
  }

  _clone(cloneMap) {
    return new InstanceEndPoint(cloneMap.get(this.instance), this.connection);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = this.instance._compareTo(other.instance)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_0__util_js__["b" /* compareStrings */](this.connection, other.connection)) != 0) return cmp;
    return 0;
  }

  toString(nameMap) {
    if (!this.connection)
      return `${nameMap.get(this.instance)}`;
    return `${nameMap.get(this.instance)}.${this.connection}`;
  }
}
/* harmony export (immutable) */ __webpack_exports__["e"] = InstanceEndPoint;


class HandleEndPoint {
  constructor(handle) {
    this.handle = handle;
  }

  _clone() {
    return new HandleEndPoint(this.handle);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_0__util_js__["b" /* compareStrings */](this.handle.localName, other.handle.localName)) != 0) return cmp;
    return 0;
  }

  toString() {
    return `${this.handle.localName}`;
  }
}
/* harmony export (immutable) */ __webpack_exports__["c"] = HandleEndPoint;


class TagEndPoint {
  constructor(tags) {
    this.tags = tags;
  }

  _clone() {
    return new TagEndPoint(this.tags);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_0__util_js__["c" /* compareArrays */](this.handle.tags, other.handle.tags, __WEBPACK_IMPORTED_MODULE_0__util_js__["b" /* compareStrings */])) != 0) return cmp;
    return 0;
  }

  toString() {
    return this.tags.map(a => `#${a}`).join(' ');
  }
}
/* harmony export (immutable) */ __webpack_exports__["d"] = TagEndPoint;


class ConnectionConstraint {
  constructor(fromConnection, toConnection, direction, type) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(direction);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(type);
    this.from = fromConnection;
    this.to = toConnection;
    this.direction = direction;
    this.type = type;
    Object.freeze(this);
  }

  _copyInto(recipe, cloneMap) {
    if (this.type == 'constraint')
      return recipe.newConnectionConstraint(this.from._clone(), this.to._clone(), this.direction);
    return recipe.newObligation(this.from._clone(cloneMap), this.to._clone(cloneMap), this.direction);
  }
    
  _compareTo(other) {
    let cmp;
    if ((cmp = this.from._compareTo(other.from)) != 0) return cmp;
    if ((cmp = this.to._compareTo(other.to)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_0__util_js__["b" /* compareStrings */](this.direction, other.direction)) != 0) return cmp;
    return 0;
  }

  toString(nameMap, options) {
    let unresolved = '';
    if (options && options.showUnresolved == true && this.type == 'obligation') {
      unresolved = ' // unresolved obligation';
    }
    return `${this.from.toString(nameMap)} ${this.direction} ${this.to.toString(nameMap)}${unresolved}`;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ConnectionConstraint;



/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__entity_js__ = __webpack_require__(39);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





class Schema {
  constructor(model) {
    let legacy = [];
    // TODO: remove this (remnants of normative/optional)
    if (model.sections) {
      legacy.push('sections');
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!model.fields);
      model.fields = {};
      for (let section of model.sections) {
        Object.assign(model.fields, section.fields);
      }
      delete model.sections;
    }
    if (model.name) {
      legacy.push('name');
      model.names = [model.name];
      delete model.name;
    }
    if (model.parents) {
      legacy.push('parents');
      for (let parent of model.parents) {
        let parentSchema = new Schema(parent);
        model.names.push(...parent.names);
        Object.assign(model.fields, parent.fields);
      }
      model.names = [...new Set(model.names)];
    }
    if (legacy.length > 0) {
      console.warn(`Schema ${model.names[0] || '*'} was serialized with legacy format (${legacy.join(', ')})`, new Error());
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(model.fields);
    this._model = model;
    this.description = {};
    if (model.description) {
      model.description.description.forEach(desc => this.description[desc.name] = desc.pattern);
    }
  }

  toLiteral() {
    return this._model;
  }

  static fromLiteral(data) {
    return new Schema(data);
  }

  get fields() {
    return this._model.fields;
  }

  get names() {
    return this._model.names;
  }

  // TODO: This should only be an ident used in manifest parsing.
  get name() {
    return this.names[0];
  }

  static typesEqual(fieldType1, fieldType2) {
    // TODO: structural check instead of stringification.
    return Schema._typeString(fieldType1) == Schema._typeString(fieldType2);
  }

  static _typeString(type) {
    if (typeof(type) != 'object') {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(typeof type == 'string');
      return type;
    }
    switch (type.kind) {
      case 'schema-union':
        return `(${type.types.join(' or ')})`;
      case 'schema-tuple':
        return `(${type.types.join(', ')})`;
      default:
        throw new Error(`Unknown type kind ${type.kind} in schema ${this.name}`);
    }
  }

  static union(schema1, schema2) {
    let names = [...new Set([...schema1.names, ...schema2.names])];
    let fields = {};

    for (let [field, type] of [...Object.entries(schema1.fields), ...Object.entries(schema2.fields)]) {
      if (fields[field]) {
        if (!Schema.typesEqual(fields[field], type)) {
          return null;
        }
      } else {
        fields[field] = type;
      }
    }

    return new Schema({
      names,
      fields,
    });
  }

  static intersect(schema1, schema2) {
    let names = [...schema1.names].filter(name => schema2.names.includes(name));
    let fields = {};

    for (let [field, type] of Object.entries(schema1.fields)) {
      let otherType = schema2.fields[field];
      if (otherType && Schema.typesEqual(type, otherType)) {
        fields[field] = type;
      }
    }

    return new Schema({
      names,
      fields,
    });
  }

  equals(otherSchema) {
    return this === otherSchema || (this.name == otherSchema.name
       // TODO: Check equality without calling contains.
       && this.isMoreSpecificThan(otherSchema)
       && otherSchema.isMoreSpecificThan(this));
  }

  isMoreSpecificThan(otherSchema) {
    let names = new Set(this.names);
    for (let name of otherSchema.names) {
      if (!names.has(name)) {
        return false;
      }
    }
    let fields = {};
    for (let [name, type] of Object.entries(this.fields)) {
      fields[name] = type;
    }
    for (let [name, type] of Object.entries(otherSchema.fields)) {
      if (fields[name] == undefined)
        return false;
      if (!Schema.typesEqual(fields[name], type)) {
        return false;
      }
    }
    return true;
  }

  get type() {
    return __WEBPACK_IMPORTED_MODULE_1__type_js__["a" /* Type */].newEntity(this);
  }

  entityClass() {
    let schema = this;
    let className = this.name;
    let classJunk = ['toJSON', 'prototype', 'toString', 'inspect'];

    let convertToJsType = fieldType => {
      switch (fieldType) {
        case 'Text':
          return 'string';
        case 'URL':
          return 'string';
        case 'Number':
          return 'number';
        case 'Boolean':
          return 'boolean';
        case 'Object':
          return 'object';
        default:
          throw new Error(`Unknown field type ${fieldType} in schema ${className}`);
      }
    };

    const fieldTypes = this.fields;
    let validateFieldAndTypes = (op, name, value) => {
      let fieldType = fieldTypes[name];
      if (fieldType === undefined) {
        throw new Error(`Can't ${op} field ${name}; not in schema ${className}`);
      }
      if (value === undefined || value === null) {
        return;
      }

      if (typeof(fieldType) !== 'object') {
        // Primitive fields.
        if (typeof(value) !== convertToJsType(fieldType)) {
          throw new TypeError(
              `Type mismatch ${op}ting field ${name} (type ${fieldType}); ` +
              `value '${value}' is type ${typeof(value)}`);
        }
        return;
      }

      switch (fieldType.kind) {
        case 'schema-union':
          // Value must be a primitive that matches one of the union types.
          for (let innerType of fieldType.types) {
            if (typeof(value) === convertToJsType(innerType)) {
              return;
            }
          }
          throw new TypeError(
              `Type mismatch ${op}ting field ${name} (union [${fieldType.types}]); ` +
              `value '${value}' is type ${typeof(value)}`);

        case 'schema-tuple':
          // Value must be an array whose contents match each of the tuple types.
          if (!Array.isArray(value)) {
            throw new TypeError(`Cannot ${op} tuple ${name} with non-array value '${value}'`);
          }
          if (value.length != fieldType.types.length) {
            throw new TypeError(`Length mismatch ${op}ting tuple ${name} ` +
                                `[${fieldType.types}] with value '${value}'`);
          }
          fieldType.types.map((innerType, i) => {
            if (value[i] !== undefined && value[i] !== null &&
                typeof(value[i]) !== convertToJsType(innerType)) {
              throw new TypeError(
                  `Type mismatch ${op}ting field ${name} (tuple [${fieldType.types}]); ` +
                  `value '${value}' has type ${typeof(value[i])} at index ${i}`);
            }
          });
          break;

        default:
          throw new Error(`Unknown kind ${fieldType.kind} in schema ${className}`);
      }
    };

    let clazz = class extends __WEBPACK_IMPORTED_MODULE_2__entity_js__["a" /* Entity */] {
      constructor(data, userIDComponent) {
        super(userIDComponent);
        this.rawData = new Proxy({}, {
          get: (target, name) => {
            if (classJunk.includes(name) || name.constructor == Symbol) {
              return undefined;
            }
            let value = target[name];
            validateFieldAndTypes('get', name, value);
            return value;
          },
          set: (target, name, value) => {
            validateFieldAndTypes('set', name, value);
            target[name] = value;
            return true;
          }
        });
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(data, `can't construct entity with null data`);
        for (let [name, value] of Object.entries(data)) {
          this.rawData[name] = value;
        }
      }

      dataClone() {
        let clone = {};
        for (let name of Object.keys(schema.fields)) {
          if (this.rawData[name] !== undefined)
            clone[name] = this.rawData[name];
        }
        return clone;
      }

      static get key() {
        return {
          tag: 'entity',
          schema: schema.toLiteral(),
        };
      }
    };

    Object.defineProperty(clazz, 'type', {value: this.type});
    Object.defineProperty(clazz, 'name', {value: this.name});
    // TODO: add query / getter functions for user properties
    for (let name of Object.keys(this.fields)) {
      Object.defineProperty(clazz.prototype, name, {
        get: function() {
          return this.rawData[name];
        },
        set: function(v) {
          this.rawData[name] = v;
        }
      });
    }
    return clazz;
  }

  toInlineSchemaString() {
    let names = (this.names || ['*']).join(' ');
    let fields = Object.entries(this.fields).map(([name, type]) => `${Schema._typeString(type)} ${name}`).join(', ');
    return `${names} {${fields}}`;
  }

  toManifestString() {
    let results = [];
    results.push(`schema ${this.names.join(' ')}`);
    results.push(...Object.entries(this.fields).map(([name, type]) => `  ${Schema._typeString(type)} ${name}`));
    if (Object.keys(this.description).length > 0) {
      results.push(`  description \`${this.description.pattern}\``);
      for (let name of Object.keys(this.description)) {
        if (name != 'pattern') {
          results.push(`    ${name} \`${this.description[name]}\``);
        }
      }
    }
    return results.join('\n');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Schema;



/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_type_checker_js__ = __webpack_require__(8);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */



// ShapeHandle {name, direction, type}
// Slot {name, direction, isRequired, isSet}

function _fromLiteral(member) {
  if (!!member && typeof member == 'object')
    return __WEBPACK_IMPORTED_MODULE_1__type_js__["a" /* Type */].fromLiteral(member);
  return member;
}

function _toLiteral(member) {
  if (!!member && member.toLiteral)
    return member.toLiteral();
  return member;
}

const handleFields = ['type', 'name', 'direction'];
const slotFields = ['name', 'direction', 'isRequired', 'isSet'];

class Shape {
  constructor(name, handles, slots) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(name);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handles !== undefined);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(slots !== undefined);
    this.name = name;
    this.handles = handles;
    this.slots = slots;
    this._typeVars = [];
    for (let handle of handles)
      for (let field of handleFields)
        if (Shape.isTypeVar(handle[field]))
          this._typeVars.push({object: handle, field});

    for (let slot of slots)
      for (let field of slotFields)
        if (Shape.isTypeVar(slot[field]))
          this._typeVars.push({object: slot, field});
  }

  toPrettyString() {
    return 'SHAAAAPE';
  }

  get canReadSubset() {
    return this._cloneAndUpdate(typeVar => typeVar.canReadSubset);
  }

  get canWriteSuperset() {
    return this._cloneAndUpdate(typeVar => typeVar.canWriteSuperset);
  }

  isMoreSpecificThan(other) {
    if (this.handles.length !== other.handles.length || this.slots.length !== other.slots.length)
      return false;
    // TODO: should probably confirm that handles and slots actually match.
    for (let i = 0; i < this._typeVars.length; i++) {
      let thisTypeVar = this._typeVars[i];
      let otherTypeVar = other._typeVars[i];
      if (!thistypeVar.object[thistypeVar.field].isMoreSpecificThan(othertypeVar.object[othertypeVar.field]))
        return false;
    }
    return true;
  }

  _applyExistenceTypeTest(test) {
    for (let typeRef of this._typeVars) {
      if (test(typeRef.object[typeRef.field]))
        return true;
    }

    return false;
  }

  _handlesToManifestString() {
    return this.handles
      .map(handle => {
        let type = handle.type.resolvedType();
        return `  ${handle.direction ? handle.direction + ' ': ''}${type.toString()} ${handle.name ? handle.name : '*'}`;
      }).join('\n');
  }

  _slotsToManifestString() {
    // TODO deal with isRequired
    return this.slots
      .map(slot => `  ${slot.direction} ${slot.isSet ? 'set of ' : ''}${slot.name ? slot.name + ' ' : ''}`)
      .join('\n');
  }
  // TODO: Include name as a property of the shape and normalize this to just
  // toString().
  toString() {
    return `shape ${this.name}
${this._handlesToManifestString()}
${this._slotsToManifestString()}
`;
  }

  static fromLiteral(data) {
    let handles = data.handles.map(handle => ({type: _fromLiteral(handle.type), name: _fromLiteral(handle.name), direction: _fromLiteral(handle.direction)}));
    let slots = data.slots.map(slot => ({name: _fromLiteral(slot.name), direction: _fromLiteral(slot.direction), isRequired: _fromLiteral(slot.isRequired), isSet: _fromLiteral(slot.isSet)}));
    return new Shape(data.name, handles, slots);
  }

  toLiteral() {
    let handles = this.handles.map(handle => ({type: _toLiteral(handle.type), name: _toLiteral(handle.name), direction: _toLiteral(handle.direction)}));
    let slots = this.slots.map(slot => ({name: _toLiteral(slot.name), direction: _toLiteral(slot.direction), isRequired: _toLiteral(slot.isRequired), isSet: _toLiteral(slot.isSet)}));
    return {name: this.name, handles, slots};
  }

  clone(variableMap) {
    let handles = this.handles.map(({name, direction, type}) => ({name, direction, type: type ? type.clone(variableMap) : undefined}));
    let slots = this.slots.map(({name, direction, isRequired, isSet}) => ({name, direction, isRequired, isSet}));
    return new Shape(this.name, handles, slots);
  }

  cloneWithResolutions(variableMap) {
    return this._cloneWithResolutions(variableMap);
  }

  _cloneWithResolutions(variableMap) {
    let handles = this.handles.map(({name, direction, type}) => ({name, direction, type: type ? type._cloneWithResolutions(variableMap) : undefined}));
    let slots = this.slots.map(({name, direction, isRequired, isSet}) => ({name, direction, isRequired, isSet}));
    return new Shape(this.name, handles, slots);
  }

  canEnsureResolved() {
    for (let typeVar of this._typeVars)
      if (!typeVar.object[typeVar.field].canEnsureResolved()) return false;
    return true;
  }

  maybeEnsureResolved() {
    for (let typeVar of this._typeVars) {
      let variable = typeVar.object[typeVar.field];
      variable = variable.clone(new Map());
      if (!variable.maybeEnsureResolved()) return false;
    }
    for (let typeVar of this._typeVars)
      typeVar.object[typeVar.field].maybeEnsureResolved();
    return true;
  }

  tryMergeTypeVariablesWith(other) {
    // Type variable enabled slot matching will Just Work when we
    // unify slots and handles.
    if (!this._equalItems(other.slots, this.slots, this._equalSlot))
      return null;
    if (other.handles.length !== this.handles.length)
      return null;

    let handles = new Set(this.handles);
    let otherHandles = new Set(other.handles);
    let handleMap = new Map();
    let sizeCheck = handles.size;
    while (handles.size > 0) {
      let handleMatches = [...handles.values()].map(
        handle => ({handle, match: [...otherHandles.values()].filter(otherHandle =>this._equalHandle(handle, otherHandle))}));

      for (let handleMatch of handleMatches) {
        // no match!
        if (handleMatch.match.length == 0)
          return null;
        if (handleMatch.match.length == 1) {
          handleMap.set(handleMatch.handle, handleMatch.match[0]);
          otherHandles.delete(handleMatch.match[0]);
          handles.delete(handleMatch.handle);
        }
      }
      // no progress!
      if (handles.size == sizeCheck)
        return null;
      sizeCheck = handles.size;
    }

    handles = [];
    for (let handle of this.handles) {
      let otherHandle = handleMap.get(handle);
      let resultType;
      if (handle.type.hasVariable || otherHandle.type.hasVariable) {
        resultType = __WEBPACK_IMPORTED_MODULE_2__recipe_type_checker_js__["a" /* TypeChecker */]._tryMergeTypeVariable(handle.type, otherHandle.type);
        if (!resultType)
          return null;
      } else {
        resultType = handle.type || otherHandle.type;
      }
      handles.push({name: handle.name || otherHandle.name, direction: handle.direction || otherHandle.direction, type: resultType});
    }
    let slots = this.slots.map(({name, direction, isRequired, isSet}) => ({name, direction, isRequired, isSet}));
    return new Shape(this.name, handles, slots);
  }

  resolvedType() {
    return this._cloneAndUpdate(typeVar => typeVar.resolvedType());
  }

  equals(other) {
    if (this.handles.length !== other.handles.length)
      return false;

    // TODO: this isn't quite right as it doesn't deal with duplicates properly
    if (!this._equalItems(other.handles, this.handles, this._equalHandle)) {
      return false;
    }

    if (!this._equalItems(other.slots, this.slots, this._equalSlot)) {
      return false;
    }
    return true;
  }

  _equalHandle(handle, otherHandle) {
    return handle.name == otherHandle.name && handle.direction == otherHandle.direction && handle.type.equals(otherHandle.type);
  }

  _equalSlot(slot, otherSlot) {
    return slot.name == otherSlot.name && slot.direction == otherSlot.direction && slot.isRequired == otherSlot.isRequired && slot.isSet == otherSlot.isSet;
  }

  _equalItems(otherItems, items, compareItem) {
    for (let otherItem of otherItems) {
      let exists = false;
      for (let item of items) {
        if (compareItem(item, otherItem)) {
          exists = true;
          break;
        }
      }
      if (!exists)
        return false;
    }

    return true;
  }

  _cloneAndUpdate(update) {
    let copy = this.clone(new Map());
    copy._typeVars.forEach(typeVar => Shape._updateTypeVar(typeVar, update));
    return copy;
  }

  static _updateTypeVar(typeVar, update) {
    typeVar.object[typeVar.field] = update(typeVar.object[typeVar.field]);
  }

  static isTypeVar(reference) {
    return (reference instanceof __WEBPACK_IMPORTED_MODULE_1__type_js__["a" /* Type */]) && reference.hasProperty(r => r.isVariable);
  }

  static mustMatch(reference) {
    return !(reference == undefined || Shape.isTypeVar(reference));
  }

  static handlesMatch(shapeHandle, particleHandle) {
    if (Shape.mustMatch(shapeHandle.name) && shapeHandle.name !== particleHandle.name)
      return false;
    // TODO: direction subsetting?
    if (Shape.mustMatch(shapeHandle.direction) && shapeHandle.direction !== particleHandle.direction)
      return false;
    if (shapeHandle.type == undefined)
      return true;
    if (shapeHandle.type.isVariableReference)
      return false;
    let [left, right] = __WEBPACK_IMPORTED_MODULE_1__type_js__["a" /* Type */].unwrapPair(shapeHandle.type, particleHandle.type);
    if (left.isVariable) {
      return [{var: left, value: right, direction: shapeHandle.direction}];
    } else {
      return left.equals(right);
    }

  }

  static slotsMatch(shapeSlot, particleSlot) {
    if (Shape.mustMatch(shapeSlot.name) && shapeSlot.name !== particleSlot.name)
      return false;
    if (Shape.mustMatch(shapeSlot.direction) && shapeSlot.direction !== particleSlot.direction)
      return false;
    if (Shape.mustMatch(shapeSlot.isRequired) && shapeSlot.isRequired !== particleSlot.isRequired)
      return false;
    if (Shape.mustMatch(shapeSlot.isSet) && shapeSlot.isSet !== particleSlot.isSet)
      return false;
    return true;
  }

  particleMatches(particleSpec) {
    let shape = this.cloneWithResolutions(new Map());
    return shape.restrictType(particleSpec) !== false;
  }

  restrictType(particleSpec) {
    return this._restrictThis(particleSpec);
  }

  _restrictThis(particleSpec) {

    let handleMatches = this.handles.map(
      handle => particleSpec.connections.map(connection => ({match: connection, result: Shape.handlesMatch(handle, connection)}))
                                      .filter(a => a.result !== false));

    let particleSlots = [];
    particleSpec.slots.forEach(consumedSlot => {
      particleSlots.push({name: consumedSlot.name, direction: 'consume', isRequired: consumedSlot.isRequired, isSet: consumedSlot.isSet});
      consumedSlot.providedSlots.forEach(providedSlot => {
        particleSlots.push({name: providedSlot.name, direction: 'provide', isRequired: false, isSet: providedSlot.isSet});
      });
    });
    let slotMatches = this.slots.map(slot => particleSlots.filter(particleSlot => Shape.slotsMatch(slot, particleSlot)));
    slotMatches = slotMatches.map(matchList => matchList.map(slot => ({match: slot, result: true})));

    let exclusions = [];

    // TODO: this probably doesn't deal with multiple match options.
    function choose(list, exclusions) {
      if (list.length == 0)
        return [];
      let thisLevel = list.pop();
      for (let connection of thisLevel) {
        if (exclusions.includes(connection.match))
          continue;
        let newExclusions = exclusions.slice();
        newExclusions.push(connection.match);
        let constraints = choose(list, newExclusions);
        if (constraints !== false) {
          return connection.result.length ? constraints.concat(connection.result) : constraints;
        }
      }

      return false;
    }

    let handleOptions = choose(handleMatches, []);
    let slotOptions = choose(slotMatches, []);

    if (handleOptions === false || slotOptions === false)
      return false;

    for (let constraint of handleOptions) {
      if (!constraint.var.variable.resolution) {
        constraint.var.variable.resolution = constraint.value;
      } else if (constraint.var.variable.resolution.isVariable) {
        // TODO(shans): revisit how this should be done,
        // consider reusing tryMergeTypeVariablesWith(other).
        if (!__WEBPACK_IMPORTED_MODULE_2__recipe_type_checker_js__["a" /* TypeChecker */].processTypeList(constraint.var, [{
            type: constraint.value, direction: constraint.direction}])) return false;
      } else {
        if (!constraint.var.variable.resolution.equals(constraint.value)) return false;
      }
    }

    return this;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Shape;






/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class AddUseHandles extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  // TODO: move generation to use an async generator.
  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onRecipe(recipe) {
        // Don't add use handles while there are outstanding constraints
        if (recipe.connectionConstraints.length > 0)
          return;
        // Don't add use handles to a recipe with free handles
        let freeHandles = recipe.handles.filter(handle => handle.connections.length == 0);
        if (freeHandles.length > 0)
          return;

        // TODO: "description" handles are always created, and in the future they need to be "optional" (blocked by optional handles
        // not being properly supported in arc instantiation). For now just hardcode skiping them.
        let disconnectedConnections = recipe.handleConnections.filter(
            hc => hc.handle == null && !hc.isOptional && hc.name != 'descriptions' && hc.direction !== 'host');
        if (disconnectedConnections.length == 0) {
          return;
        }

        return recipe => {
          disconnectedConnections.forEach(hc => {
            let clonedHC = recipe.updateToClone({hc}).hc;
            let handle = recipe.newHandle();
            handle.fate = 'use';
            clonedHC.connectToHandle(handle);
          });
          return 0;
        };
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AddUseHandles;



/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__ = __webpack_require__(22);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt







class ConvertConstraintsToConnections extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();
    this.affordance = arc.pec.slotComposer ? arc.pec.slotComposer.affordance : null;
  }
  async generate(inputParams) {
    let affordance = this.affordance;
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onRecipe(recipe) {
        // The particles & handles Sets are used as input to RecipeUtil's shape functionality
        // (this is the algorithm that "finds" the constraint set in the recipe).
        // They track which particles/handles need to be found/created.
        let particles = new Set();
        let handles = new Set();
        // The map object tracks the connections between particles that need to be found/created.
        // It's another input to RecipeUtil.makeShape.
        let map = {};
        let particlesByName = {};
        let handleCount = 0;
        let obligations = [];
        if (recipe.connectionConstraints.length == 0) {
          return;
        }

        for (let constraint of recipe.connectionConstraints) {
          // Don't process constraints if their listed particles don't match the current affordance.
          if (affordance && (!constraint.from.particle.matchAffordance(affordance) || !constraint.to.particle.matchAffordance(affordance))) {
            return;
          }

          let reverse = {'->': '<-', '=': '=', '<-': '->'};

          // Set up initial mappings & input to RecipeUtil.
          let handle;
          let handleIsConcrete = false;
          let createObligation = false;
          if (constraint.from instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["b" /* ParticleEndPoint */]) {
            particles.add(constraint.from.particle.name);
            if (map[constraint.from.particle.name] == undefined) {
              map[constraint.from.particle.name] = {};
              particlesByName[constraint.from.particle.name] = constraint.from.particle;
            }
            if (constraint.from.connection) {
              handleIsConcrete = true;
              handle = map[constraint.from.particle.name][constraint.from.connection];
            } else {
              createObligation = true;
            }
          }
          if (constraint.from instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["c" /* HandleEndPoint */]) {
            handle = {handle: constraint.from.handle, direction: reverse[constraint.direction]};
            handles.add(handle.handle);
          }
          if (constraint.to instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["b" /* ParticleEndPoint */]) {
            particles.add(constraint.to.particle.name);
            if (map[constraint.to.particle.name] == undefined) {
              map[constraint.to.particle.name] = {};
              particlesByName[constraint.to.particle.name] = constraint.to.particle;
            }
            if (constraint.to.connection) {
              handleIsConcrete = true;
              if (!handle)
                handle = map[constraint.to.particle.name][constraint.to.connection];
            } else {
              createObligation = true;
            }
          }
          if (constraint.to instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["c" /* HandleEndPoint */]) {
            handle = {handle: constraint.to.handle, direction: constraint.direction};
            handles.add(handle.handle);
          }
          if (handle == undefined) {
            handle = {handle: 'v' + handleCount++, direction: constraint.direction};
            if (handleIsConcrete)
              handles.add(handle.handle);
          }
          if (constraint.from instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["d" /* TagEndPoint */]) {
            handle.tags = constraint.from.tags;
          } else if (constraint.to instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["d" /* TagEndPoint */]) {
            handle.tags = constraint.to.tags;
          }

          if (createObligation)
            obligations.push({from: constraint.from._clone(), to: constraint.to._clone(), direction: constraint.direction});

          let unionDirections = (a, b) => {
            if (a == '=')
              return '=';
            if (b == '=')
              return '=';
            if (a !== b)
              return '=';
            return a;
          };

          let direction = constraint.direction;
          if (constraint.from instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["b" /* ParticleEndPoint */]) {
            let connection = constraint.from.connection;
            if (connection) {
              let existingHandle = map[constraint.from.particle.name][connection];
              if (existingHandle) {
                direction = unionDirections(direction, existingHandle.direction);
                if (direction == null)
                  return;
              }
              map[constraint.from.particle.name][connection] = {handle: handle.handle, direction, tags: handle.tags};
            }
          }

          direction = reverse[constraint.direction];          
          if (constraint.to instanceof __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["b" /* ParticleEndPoint */]) {
            let connection = constraint.to.connection;
            if (connection) {
              let existingHandle = map[constraint.to.particle.name][connection];
              if (existingHandle) {
                direction = unionDirections(direction, existingHandle.direction);
                if (direction == null)
                  return;
              }
              map[constraint.to.particle.name][connection] = {handle: handle.handle, direction, tags: handle.tags};
            }
          }
        }
        let shape = __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__["a" /* RecipeUtil */].makeShape([...particles.values()], [...handles.values()], map);

        let results = __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__["a" /* RecipeUtil */].find(recipe, shape);

        results = results.filter(match => {
          // Ensure that every handle is either matched, or an input of at least one
          // connected particle in the constraints.
          let resolvedHandles = {};
          for (let particle in map) {
            for (let connection in map[particle]) {
              let handle = map[particle][connection].handle;
              if (resolvedHandles[handle]) {
                continue;
              }
              if (match.match[handle]) {
                resolvedHandles[handle] = true;
              } else {
                let spec = particlesByName[particle];
                resolvedHandles[handle] = spec.isOutput(connection);
              }
            }
          }
          return Object.values(resolvedHandles).every(value => value);
        }).map(match => {
          return (recipe) => {
            let score = recipe.connectionConstraints.length + match.score;
            let recipeMap = recipe.updateToClone(match.match);
            
            for (let particle in map) {
              let recipeParticle = recipeMap[particle];
              if (!recipeParticle) {
                recipeParticle = recipe.newParticle(particle);
                recipeParticle.spec = particlesByName[particle];
                recipeMap[particle] = recipeParticle;
              }

              for (let connection in map[particle]) {
                let handle = map[particle][connection];
                let recipeHandleConnection = recipeParticle.connections[connection];
                if (recipeHandleConnection == undefined)
                  recipeHandleConnection = recipeParticle.addConnectionName(connection);
                let recipeHandle = recipeMap[handle.handle];
                if (recipeHandle == null && recipeHandleConnection.handle == null) {
                  recipeHandle = recipe.newHandle();
                  recipeHandle.fate = 'create';
                  recipeHandle.tags = handle.tags || [];
                  recipeMap[handle.handle] = recipeHandle;
                }
                if (recipeHandleConnection.handle == null)
                  recipeHandleConnection.connectToHandle(recipeHandle);
              }
            }
            recipe.clearConnectionConstraints();
            for (let obligation of obligations) {
              let from = new __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["e" /* InstanceEndPoint */](recipeMap[obligation.from.particle.name], obligation.from.connection);
              let to = new __WEBPACK_IMPORTED_MODULE_4__recipe_connection_constraint_js__["e" /* InstanceEndPoint */](recipeMap[obligation.to.particle.name], obligation.to.connection);
              recipe.newObligation(from, to, obligation.direction);
            }
            return score;
          };
        });

        return results;
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Independent), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ConvertConstraintsToConnections;



/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt







class HandleMapperBase extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  async generate(inputParams) {
    let self = this;

    return __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__["a" /* Walker */] {
      onHandle(recipe, handle) {
        if (handle.fate !== self.fate)
          return;

        if (handle.connections.length == 0)
          return;

        if (handle.id)
          return;

        if (!handle.type)
          return;

        // TODO: using the connection to retrieve type information is wrong.
        // Once validation of recipes generates type information on the handle
        // we should switch to using that instead.
        let counts = __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__["a" /* RecipeUtil */].directionCounts(handle);
        return this.mapHandle(handle, handle.tags, handle.type, counts);
      }

      mapHandle(handle, tags, type, counts) {
        let score = -1;
        if (counts.in == 0 || counts.out == 0) {
          if (counts.unknown > 0)
            return;
          if (counts.out == 0)
            score = 1;
          else
            score = 0;
        }

        if (tags.length > 0)
          score += 4;

        let fate = self.fate;
        if (counts.out > 0 && fate == 'map') {
          return;
        }
        let handles = self.getMappableHandles(type, tags, counts);
        if (handles.length < 2)
          return;

        let responses = handles.map(newHandle =>
          ((recipe, clonedHandle) => {
            for (let existingHandle of recipe.handles)
              // TODO: Why don't we link the handle connections to the existingHandle?
              if (existingHandle.id == newHandle.id)
                return 0;
            let tscore = 0;

            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__["a" /* assert */])(newHandle.id);
            clonedHandle.mapToStorage(newHandle);
            if (clonedHandle.fate != 'copy') {
              clonedHandle.fate = fate;
            }
            return score + tscore;
          }));

        responses.push(null); // "do nothing" for this handle.
        return responses;
      }
    }(__WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = HandleMapperBase;



/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class InitSearch extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc, {search}) {
    super();
    this._search = search;
  }
  async generate({generation}) {
    if (this._search == null || generation != 0) {
      return [];
    }

    let recipe = new __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */]();
    recipe.setSearchPhrase(this._search);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(recipe.normalize());
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(!recipe.isResolved());

    return [{
      result: recipe,
      score: 0,
      derivation: [{strategy: this, parent: undefined}],
      hash: recipe.digest(),
    }];
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = InitSearch;



/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





/*
 * Match free handles (i.e. handles that aren't connected to any connections)
 * to connections.
 */
class MatchFreeHandlesToConnections extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  async generate(inputParams) {
    let self = this;

    return __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__["a" /* Walker */] {
      onHandle(recipe, handle) {
        if (handle.connections.length > 0)
          return;

        let matchingConnections = recipe.handleConnections.filter(connection => connection.handle == undefined && connection.name !== 'descriptions');

        return matchingConnections.map(connection => {
          return (recipe, handle) => {
            let newConnection = recipe.updateToClone({connection}).connection;
            newConnection.connectToHandle(handle);
            return 1;
          };
        });
      }
    }(__WEBPACK_IMPORTED_MODULE_1__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MatchFreeHandlesToConnections;



/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dom_particle_js__ = __webpack_require__(19);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */




// Regex to separate style and template.
let re = /<style>((?:.|[\r\n])*)<\/style>((?:.|[\r\n])*)/;

/** @class TransformationDomParticle
 * Particle that does transformation stuff with DOM.
 */
class TransformationDomParticle extends __WEBPACK_IMPORTED_MODULE_0__dom_particle_js__["a" /* DomParticle */] {
  getTemplate(slotName) {
    // TODO: add support for multiple slots.
    return this._state.template;
  }
  getTemplateName(slotName) {
    // TODO: add support for multiple slots.
    return this._state.templateName;
  }
  render(props, state) {
    return state.renderModel;
  }
  shouldRender(props, state) {
    return Boolean((state.template || state.templateName) && state.renderModel);
  }

  renderHostedSlot(slotName, hostedSlotId, content) {
    this.combineHostedTemplate(slotName, hostedSlotId, content);
    this.combineHostedModel(slotName, hostedSlotId, content);
  }

  // abstract
  combineHostedTemplate(slotName, hostedSlotId, content) {}
  combineHostedModel(slotName, hostedSlotId, content) {}

  // Helper methods that may be reused in transformation particles to combine hosted content.
  static propsToItems(propsValues) {
    return propsValues ? propsValues.map(({rawData, id}) => Object.assign({}, rawData, {subId: id})) : [];
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = TransformationDomParticle;



/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__handle_js__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__particle_execution_host_js__ = __webpack_require__(94);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__manifest_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__description_js__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__recipe_util_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__fake_pec_factory_js__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__storage_storage_provider_factory_js__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__debug_devtools_connection_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__id_js__ = __webpack_require__(90);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__debug_arc_debug_handler_js__ = __webpack_require__(79);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__recipe_index_js__ = __webpack_require__(96);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

















class Arc {
  constructor({id, context, pecFactory, slotComposer, loader, storageKey, storageProviderFactory, speculative, scheduler, recipeIndex}) {
    // TODO: context should not be optional.
    this._context = context || new __WEBPACK_IMPORTED_MODULE_5__manifest_js__["a" /* Manifest */]({id});
    // TODO: pecFactory should not be optional. update all callers and fix here.
    this._pecFactory = pecFactory || __WEBPACK_IMPORTED_MODULE_8__fake_pec_factory_js__["a" /* FakePecFactory */].bind(null);

    // for now, every Arc gets its own session
    this.sessionId = __WEBPACK_IMPORTED_MODULE_11__id_js__["a" /* Id */].newSessionId();
    this.id = this.sessionId.fromString(id);
    this._speculative = !!speculative; // undefined => false
    this._nextLocalID = 0;
    this._activeRecipe = new __WEBPACK_IMPORTED_MODULE_4__recipe_recipe_js__["a" /* Recipe */]();
    // TODO: rename: this are just tuples of {particles, handles, slots, pattern} of instantiated recipes merged into active recipe.
    this._recipes = [];
    this._loader = loader;
    this._dataChangeCallbacks = new Map();

    // All the stores, mapped by store ID
    this._storesById = new Map();

    // storage keys for referenced handles
    this._storageKeys = {};
    this._storageKey = storageKey;

    this.particleHandleMaps = new Map();
    let pecId = this.generateID();
    let innerPecPort = this._pecFactory(pecId);
    this.pec = new __WEBPACK_IMPORTED_MODULE_3__particle_execution_host_js__["a" /* ParticleExecutionHost */](innerPecPort, slotComposer, this, `${pecId}:outer`);
    if (slotComposer) {
      slotComposer.arc = this;
    }
    this._storageProviderFactory = storageProviderFactory || new __WEBPACK_IMPORTED_MODULE_9__storage_storage_provider_factory_js__["a" /* StorageProviderFactory */](this.id);

    // Map from each store to a set of tags.
    this._storeTags = new Map();
    // Map from each store to its description (originating in the manifest).
    this._storeDescriptions = new Map();

    this._description = new __WEBPACK_IMPORTED_MODULE_6__description_js__["a" /* Description */](this);

    this._instantiatePlanCallbacks = [];
    this._recipeIndex = recipeIndex || new __WEBPACK_IMPORTED_MODULE_13__recipe_index_js__["a" /* RecipeIndex */](this._context, slotComposer && slotComposer.affordance);

    __WEBPACK_IMPORTED_MODULE_10__debug_devtools_connection_js__["a" /* DevtoolsConnection */].onceConnected.then(
        devtoolsChannel => new __WEBPACK_IMPORTED_MODULE_12__debug_arc_debug_handler_js__["a" /* ArcDebugHandler */](this, devtoolsChannel));
  }
  get loader() {
    return this._loader;
  }

  get description() {
    return this._description;
  }

  get recipeIndex() {
    return this._recipeIndex;
  }

  registerInstantiatePlanCallback(callback) {
    this._instantiatePlanCallbacks.push(callback);
  }

  unregisterInstantiatePlanCallback(callback) {
    let index = this._instantiatePlanCallbacks.indexOf(callback);
    if (index >= 0) {
      this._instantiatePlanCallbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  dispose() {
    this._instantiatePlanCallbacks = [];
    // TODO: disconnect all assocated store event handlers
    this.pec.close();
    this.pec.slotComposer && this.pec.slotComposer.dispose();
  }

  // Returns a promise that spins sending a single `AwaitIdle` message until it
  // sees no other messages were sent.
  async _waitForIdle() {
    let messageCount;
    do {
      messageCount = this.pec.messageCount;
      await this.pec.idle;
      // We expect two messages here, one requesting the idle status, and one answering it.
    } while (this.pec.messageCount !== messageCount + 2);
  }

  get idle() {
    if (!this._waitForIdlePromise) {
      // Store one active completion promise for use by any subsequent callers.
      // We explicitly want to avoid, for example, multiple simultaneous
      // attempts to identify idle state each sending their own `AwaitIdle`
      // message and expecting settlement that will never arrive.
      this._waitForIdlePromise =
          this._waitForIdle().then(() => this._waitForIdlePromise = null);
    }
    return this._waitForIdlePromise;
  }

  get isSpeculative() {
    return this._speculative;
  }

  async _serializeHandles() {
    let handles = '';
    let resources = '';
    let interfaces = '';

    let id = 0;
    let importSet = new Set();
    let handleSet = new Set();
    for (let handle of this._activeRecipe.handles) {
      if (handle.fate == 'map')
        importSet.add(this.context.findManifestUrlForHandleId(handle.id));
      else
        handleSet.add(handle.id);
    }
    for (let url of importSet.values())
      resources += `import '${url}'\n`;

    for (let handle of this._stores) {
      if (!handleSet.has(handle.id))
        continue;
      let type = handle.type;
      if (type.isCollection)
        type = type.primitiveType();
      if (type.isInterface) {
        interfaces += type.interfaceShape.toString() + '\n';
      }
      let key = this._storageProviderFactory.parseStringAsKey(handle.storageKey);
      let handleTags = [...this._storeTags.get(handle)].map(a => `#${a}`).join(' ');
      switch (key.protocol) {
        case 'firebase':
          handles += `store Store${id++} of ${handle.type.toString()} '${handle.id}' @${handle._version} ${handleTags} at '${handle.storageKey}'\n`;
          break;
        case 'in-memory': {
          resources += `resource Store${id}Resource\n`;
          let indent = '  ';
          resources += indent + 'start\n';

          let serializedData = (await handle.toLiteral()).model.map(({id, value}) => {
            if (value == null)
              return null;
            if (value.rawData) {
              let result = {};
              for (let field in value.rawData) {
                result[field] = value.rawData[field];
              }
              result.$id = id;
              return result;
            } else {
              return value;
            }
          });
          let data = JSON.stringify(serializedData);
          resources += data.split('\n').map(line => indent + line).join('\n');
          resources += '\n';
          handles += `store Store${id} of ${handle.type.toString()} '${handle.id}' @${handle._version} ${handleTags} in Store${id++}Resource\n`;
          break;
        }
      }
    }

    return resources + interfaces + handles;
  }

  _serializeParticles() {
    return this._activeRecipe.particles.map(entry => entry.spec.toString()).join('\n');
  }

  _serializeStorageKey() {
    if (this._storageKey)
      return `storageKey: '${this._storageKey}'\n`;
    return '';
  }

  async serialize() {
    await this.idle;
    return `
meta
  name: '${this.id}'
  ${this._serializeStorageKey()}

${await this._serializeHandles()}

${this._serializeParticles()}

@active
${this.activeRecipe.toString()}`;
  }

  static async deserialize({serialization, pecFactory, slotComposer, loader, fileName, context}) {
    let manifest = await __WEBPACK_IMPORTED_MODULE_5__manifest_js__["a" /* Manifest */].parse(serialization, {loader, fileName});
    let arc = new Arc({
      id: manifest.meta.name,
      storageKey: manifest.meta.storageKey,
      slotComposer,
      pecFactory,
      loader,
      storageProviderFactory: manifest._storageProviderFactory,
      context
    });
    manifest.stores.forEach(store => {
      if (store.constructor.name == 'StorageStub')
        store = store.inflate();
      arc._registerStore(store, manifest._storeTags.get(store));
    });
    let recipe = manifest.activeRecipe.clone();
    let options = {errors: new Map()};
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipe.normalize(options), `Couldn't normalize recipe ${recipe.toString()}:\n${[...options.errors.values()].join('\n')}`);
    await arc.instantiate(recipe);
    return arc;
  }

  get context() {
    return this._context;
  }

  get activeRecipe() { return this._activeRecipe; }
  get recipes() { return this._recipes; }

  loadedParticles() {
    return [...this.particleHandleMaps.values()].map(({spec}) => spec);
  }

  _instantiateParticle(recipeParticle) {
    let id = this.generateID('particle');
    let handleMap = {spec: recipeParticle.spec, handles: new Map()};
    this.particleHandleMaps.set(id, handleMap);

    for (let [name, connection] of Object.entries(recipeParticle.connections)) {
      if (!connection.handle) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(connection.isOptional);
        continue;
      }
      let handle = this.findStoreById(connection.handle.id);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handle, `can't find handle of id ${connection.handle.id}`);
      this._connectParticleToHandle(id, recipeParticle, name, handle);
    }

    // At least all non-optional connections must be resolved
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handleMap.handles.size >= handleMap.spec.connections.filter(c => !c.isOptional).length,
           `Not all mandatory connections are resolved for {$particle}`);
    this.pec.instantiate(recipeParticle, id, handleMap.spec, handleMap.handles);
    return id;
  }

  generateID(component) {
    return this.id.createId(component).toString();
  }

  generateIDComponents() {
    return {base: this.id, component: () => this._nextLocalID++};
  }

  get _stores() {
    return [...this._storesById.values()];
  }

  // Makes a copy of the arc used for speculative execution.
  async cloneForSpeculativeExecution() {
    let arc = new Arc({id: this.generateID().toString(), pecFactory: this._pecFactory, context: this.context, loader: this._loader, recipeIndex: this._recipeIndex, speculative: true});
    let handleMap = new Map();
    for (let handle of this._stores) {
      let clone = await arc._storageProviderFactory.construct(handle.id, handle.type, 'in-memory');
      await clone.cloneFrom(handle);
      handleMap.set(handle, clone);
      if (this._storeDescriptions.has(handle)) {
        arc._storeDescriptions.set(clone, this._storeDescriptions.get(handle));
      }
    }
    this.particleHandleMaps.forEach((value, key) => {
      arc.particleHandleMaps.set(key, {
        spec: value.spec,
        handles: new Map()
      });
      value.handles.forEach(handle => arc.particleHandleMaps.get(key).handles.set(handle.name, handleMap.get(handle)));
    });

   let {particles, handles, slots} = this._activeRecipe.mergeInto(arc._activeRecipe);
   let particleIndex = 0, handleIndex = 0, slotIndex = 0;
   this._recipes.forEach(recipe => {
     let arcRecipe = {particles: [], handles: [], slots: [], innerArcs: new Map(), pattern: recipe.pattern};
     recipe.particles.forEach(p => {
       arcRecipe.particles.push(particles[particleIndex++]);
       if (recipe.innerArcs.has(p)) {
         let thisInnerArc = recipe.innerArcs.get(p);
         let transformationParticle = arcRecipe.particles[arcRecipe.particles.length - 1];
         let innerArc = {activeRecipe: new __WEBPACK_IMPORTED_MODULE_4__recipe_recipe_js__["a" /* Recipe */](), recipes: []};
         let innerTuples = thisInnerArc.activeRecipe.mergeInto(innerArc.activeRecipe);
         thisInnerArc.recipes.forEach(thisInnerArcRecipe => {
           let innerArcRecipe = {particles: [], handles: [], slots: [], innerArcs: new Map()};
           let innerIndex = 0;
           thisInnerArcRecipe.particles.forEach(thisInnerArcRecipeParticle => {
             innerArcRecipe.particles.push(innerTuples.particles[innerIndex++]);
           });
           innerIndex = 0;
           thisInnerArcRecipe.handles.forEach(thisInnerArcRecipeParticle => {
             innerArcRecipe.handles.push(innerTuples.handles[innerIndex++]);
           });
           innerIndex = 0;
           thisInnerArcRecipe.slots.forEach(thisInnerArcRecipeParticle => {
             innerArcRecipe.slots.push(innerTuples.slots[innerIndex++]);
           });
           innerArc.recipes.push(innerArcRecipe);
         });
         arcRecipe.innerArcs.set(transformationParticle, innerArc);
       }
     });
     recipe.handles.forEach(p => {
       arcRecipe.handles.push(handles[handleIndex++]);
     });
     recipe.slots.forEach(p => {
       arcRecipe.slots.push(slots[slotIndex++]);
     });

     arc._recipes.push(arcRecipe);
   });

    for (let v of handleMap.values()) {
      // FIXME: Tags
      arc._registerStore(v, []);
    }
    return arc;
  }

  async instantiate(recipe, innerArc) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipe.isResolved(), `Cannot instantiate an unresolved recipe: ${recipe.toString({showUnresolved: true})}`);

    let currentArc = {activeRecipe: this._activeRecipe, recipes: this._recipes};
    if (innerArc) {
      let innerArcs = this._recipes.find(r => !!r.particles.find(p => p == innerArc.particle)).innerArcs;
      if (!innerArcs.has(innerArc.particle)) {
         innerArcs.set(innerArc.particle, {activeRecipe: new __WEBPACK_IMPORTED_MODULE_4__recipe_recipe_js__["a" /* Recipe */](), recipes: []});
      }
      currentArc = innerArcs.get(innerArc.particle);
    }
    let {handles, particles, slots} = recipe.mergeInto(currentArc.activeRecipe);
    currentArc.recipes.push({particles, handles, slots, innerArcs: new Map(), pattern: recipe.pattern});
    slots.forEach(slot => slot.id = slot.id || `slotid-${this.generateID()}`);

    for (let recipeHandle of handles) {
      if (['copy', 'create'].includes(recipeHandle.fate)) {
        let type = recipeHandle.type;
        if (recipeHandle.fate == 'create')
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(type.maybeEnsureResolved(), `Can't assign resolved type to ${type}`);

        type = type.resolvedType();
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(type.isResolved(), `Can't create handle for unresolved type ${type}`);

        let newStore = await this.createStore(type, /* name= */ null, this.generateID(), recipeHandle.tags);
        if (recipeHandle.id && recipeHandle.type.isInterface
            && recipeHandle.id.includes(':particle-literal:')) {
          // 'particle-literal' handles are created by the FindHostedParticle strategy.
          let particleName = recipeHandle.id.match(/:particle-literal:([a-zA-Z]+)$/)[1];
          let particle = this.context.findParticleByName(particleName);
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipeHandle.type.interfaceShape.particleMatches(particle));
          newStore.set(particle.clone().toLiteral());
        } else if (recipeHandle.fate === 'copy') {
          let copiedStore = this.findStoreById(recipeHandle.id);
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(copiedStore._version !== null);
          await newStore.cloneFrom(copiedStore);
          let copiedStoreDesc = this.getStoreDescription(copiedStore);
          if (copiedStoreDesc) {
            this._storeDescriptions.set(newStore, copiedStoreDesc);
          }
        }
        recipeHandle.id = newStore.id;
        recipeHandle.fate = 'use';
        recipeHandle.storageKey = newStore.storageKey;
        // TODO: move the call to ParticleExecutionHost's DefineHandle to here
      }

      let storageKey = recipeHandle.storageKey;
      if (!storageKey)
        storageKey = this.keyForId(recipeHandle.id);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(storageKey, `couldn't find storage key for handle '${recipeHandle}'`);
      let store = await this._storageProviderFactory.connect(recipeHandle.id, recipeHandle.type, storageKey);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(store, `store '${recipeHandle.id}' was not found`);
    }

    particles.forEach(recipeParticle => this._instantiateParticle(recipeParticle));

    if (this.pec.slotComposer) {
      // TODO: pass slot-connections instead
      this.pec.slotComposer.initializeRecipe(particles);
    }

    if (!this.isSpeculative && !innerArc) {
      // Note: callbacks not triggered for inner-arc recipe instantiation or speculative arcs.
      this._instantiatePlanCallbacks.forEach(callback => callback(recipe));
    }
  }

  _connectParticleToHandle(particleId, particle, name, targetHandle) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(targetHandle, 'no target handle provided');
    let handleMap = this.particleHandleMaps.get(particleId);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handleMap.spec.connectionMap.get(name) !== undefined, 'can\'t connect handle to a connection that doesn\'t exist');
    handleMap.handles.set(name, targetHandle);
  }

  async createStore(type, name, id, tags, storageKey) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(type instanceof __WEBPACK_IMPORTED_MODULE_1__type_js__["a" /* Type */], `can't createStore with type ${type} that isn't a Type`);

    if (type.isRelation) {
      type = __WEBPACK_IMPORTED_MODULE_1__type_js__["a" /* Type */].newCollection(type);
    }

    if (id == undefined)
      id = this.generateID();

    if (storageKey == undefined && this._storageKey)
      storageKey = this._storageProviderFactory.parseStringAsKey(this._storageKey).childKeyForHandle(id).toString();

    if (storageKey == undefined)
      storageKey = 'in-memory';

    let store = await this._storageProviderFactory.construct(id, type, storageKey);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(store, 'stopre with id ${id} already exists');
    store.name = name;

    this._registerStore(store, tags);
    return store;
  }

  _registerStore(store, tags) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this._storesById.has(store.id), `Store already registered '${store.id}'`);
    tags = tags || [];
    tags = Array.isArray(tags) ? tags : [tags];


    this._storesById.set(store.id, store);

    this._storeTags.set(store, new Set(tags));

    this._storageKeys[store.id] = store.storageKey;
    store.on('change', () => this._onDataChange(), this);
  }

  _onDataChange() {
    for (let callback of this._dataChangeCallbacks.values()) {
      callback();
    }
  }

  onDataChange(callback, registration) {
    this._dataChangeCallbacks.set(registration, callback);
  }

  clearDataChange(registration) {
    this._dataChangeCallbacks.delete(registration);
  }

  // Convert a type to a normalized key that we can use for
  // equality testing.
  //
  // TODO: we should be testing the schemas for compatiblity instead of using just the name.
  // TODO: now that this is only used to implement findStoresByType we can probably replace
  // the check there with a type system equality check or similar.
  static _typeToKey(type) {
    if (type.isCollection) {
      let key = this._typeToKey(type.primitiveType());
      if (key) {
        return `list:${key}`;
      }
    } else if (type.isEntity) {
      return type.entitySchema.name;
    } else if (type.isShape) {
      // TODO we need to fix this too, otherwise all handles of shape type will
      // be of the 'same type' when searching by type.
      return type.shapeShape;
    } else if (type.isVariable && type.isResolved()) {
      return Arc._typeToKey(type.resolvedType());
    }
  }

  findStoresByType(type, options) {
    // TODO: dstockwell to rewrite this to use constraints and more
    let typeKey = Arc._typeToKey(type);
    let stores = [...this._storesById.values()].filter(handle => {
      if (typeKey) {
        let handleKey = Arc._typeToKey(handle.type);
        if (typeKey === handleKey) {
          return true;
        }
      } else {
        if (type.isVariable && !type.isResolved() && handle.type.isEntity) {
          return true;
        } else if (type.isCollection && type.primitiveType().isVariable && !type.primitiveType().isResolved() && handle.type.isCollection) {
          return true;
        }
      }
      return false;
    });

    if (options && options.tags && options.tags.length > 0) {
      stores = stores.filter(store => options.tags.filter(tag => !this._storeTags.get(store).has(tag)).length == 0);
    }
    return stores;
  }

  findStoreById(id) {
    let store = this._storesById.get(id);
    if (store == null) {
      store = this._context.findStoreById(id);
    }
    return store;
  }

  getStoreDescription(store) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(store, 'Cannot fetch description for nonexistent store');
    return this._storeDescriptions.get(store) || store.description;
  }

  getStoresState() {
    let versionById = new Map();
    this._storesById.forEach((handle, id) => versionById.set(id, handle._version));
    return versionById;
  }

  isSameState(storesState) {
    for (let [id, version] of storesState ) {
      if (!this._storesById.has(id) || this._storesById.get(id)._version != version) {
        return false;
      }
    }
    return true;
  }

  keyForId(id) {
    return this._storageKeys[id];
  }

  stop() {
    this.pec.stop();
  }

  toContextString(options) {
    let results = [];
    let stores = [...this._storesById.values()].sort(__WEBPACK_IMPORTED_MODULE_7__recipe_util_js__["a" /* compareComparables */]);
    stores.forEach(store => {
      results.push(store.toString(this._storeTags.get(store)));
    });

    // TODO: include stores entities
    // TODO: include (remote) slots?

    if (!this._activeRecipe.isEmpty()) {
      results.push(this._activeRecipe.toString());
    }

    return results.join('\n');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Arc;



/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_digest_web_js__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__slot_js__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dom_context_js__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dom_set_context_js__ = __webpack_require__(87);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */








class DomSlot extends __WEBPACK_IMPORTED_MODULE_2__slot_js__["a" /* Slot */] {
  constructor(consumeConn, arc, containerKind) {
    super(consumeConn, arc);
    this._model = null;
    this._observer = this._initMutationObserver();
    this._containerKind = containerKind;
  }
  get templatePrefix() {
    return `${this.consumeConn.particle.name}::${this.consumeConn.name}`;
  }

  setContainer(container) {
    let wasNull = true;
    if (this.getContext()) {
      this.getContext().clear();
      wasNull = false;
    }

    if (container) {
      if (!this.getContext()) {
        this._context = this._createDomContext();
      }
      this.getContext().initContainer(container);
      if (!wasNull) {
        this._doRender();
      }
    } else {
      this._context = null;
    }
  }
  _createDomContext() {
    if (this.consumeConn.slotSpec.isSet) {
      return new __WEBPACK_IMPORTED_MODULE_4__dom_set_context_js__["a" /* DomSetContext */](this._containerKind);
    }
    return new __WEBPACK_IMPORTED_MODULE_3__dom_context_js__["a" /* DomContext */](null, this._containerKind);
  }
  dispose() {
    this._observer.disconnect();
  }
  _initMutationObserver() {
    const observer = new MutationObserver(async (records) => {
      this._observer.disconnect();
      if (this.getContext() && records.some(r => this.getContext().isDirectInnerSlot(r.target))) {
        // Update inner slots.
        this.getContext().initInnerContainers(this.consumeConn.slotSpec);
        this.innerSlotsUpdateCallback(this);
        // Reactivate the observer.
        this.getContext().observe(this._observer);
      }
    });
    return observer;
  }
  isSameContainer(container) {
    return this.getContext().isSameContainer(container);
  }
  // TODO(sjmiles): triggered when innerPEC sends Render message to outerPEC,
  // (usually by request of DomParticle::render())
  // `handler` is generated by caller (slot-composer::renderSlot())
  async setContent(content, handler) {
    if (!content || Object.keys(content).length == 0) {
      if (this.getContext()) {
        this.getContext().clear();
        this.innerSlotsUpdateCallback && this.innerSlotsUpdateCallback(this);
      }
      this._model = null;
      return;
    }
    if (!this.getContext()) {
      return;
    }
    if (content.templateName) {
      this.getContext().setTemplate(this.templatePrefix, content.templateName, content.template);
    }
    this.eventHandler = handler;
    if (Object.keys(content).indexOf('model') >= 0) {
      if (content.model) {
        this._model = Object.assign(content.model, await this.populateHandleDescriptions());
      } else {
        this._model = undefined;
      }
    }
    this._doRender();
  }
  _doRender() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.getContext());

    this.getContext().observe(this._observer);

    this.getContext().stampTemplate(this.eventHandler);

    if (this._model) {
      this.getContext().updateModel(this._model);
    }
  }
  getInnerContainer(slotName) {
    return this.getContext() && this.getContext().getInnerContainer(slotName);
  }
  constructRenderRequest(hostedSlot) {
    let request = ['model'];
    let prefixes = [this.templatePrefix];
    if (hostedSlot) {
      prefixes.push(hostedSlot.particle.name);
      prefixes.push(hostedSlot.slotName);
    }
    if (!this.getContext().hasTemplate(prefixes.join('::'))) {
      request.push('template');
    }
    return request;
  }
  formatHostedContent(hostedSlot, content) {
    if (content.templateName) {
      if (typeof content.templateName == 'string') {
        content.templateName = `${hostedSlot.particleName}::${hostedSlot.slotName}::${content.templateName}`;
      } else {
        // TODO(mmandlis): add support for hosted particle rendering set slot.
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, 'TODO: Implement this!');
      }
    }
    return content;
  }
  static findRootContainers(container) {
    return new __WEBPACK_IMPORTED_MODULE_3__dom_context_js__["a" /* DomContext */](container, this._containerKind).findRootContainers(container);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DomSlot;



/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__affordance_js__ = __webpack_require__(36);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */




class SlotComposer {
  /**
   * |options| must contain:
   * - affordance: the UI affordance the slots composer render to (for example: dom).
   * - rootContainer: the top level container to be used for slots.
   * and may contain:
   * - containerKind: the type of container wrapping each slot-context's container  (for example, div).
   */
  constructor(options) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(options.affordance, 'Affordance is mandatory');
    // TODO: Support rootContext for backward compatibility, remove when unused.
    options.rootContainer = options.rootContainer || options.rootContext;
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(options.rootContainer !== undefined ^ options.noRoot === true,
      'Root container is mandatory unless it is explicitly skipped');

    this._containerKind = options.containerKind;
    this._affordance = __WEBPACK_IMPORTED_MODULE_1__affordance_js__["a" /* Affordance */].forName(options.affordance);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._affordance.slotClass);

    // TODO: refactor and rename _contextSlots: regular slots hold a context, that holds a container.
    // These are pseudo slots and hold the container directly. Should instead mimic the regular slots.
    this._contextSlots = [];
    this._slots = [];

    if (options.noRoot) {
      return;
    }

    let containerByName = this._affordance.slotClass.findRootContainers(options.rootContainer) || {};
    if (Object.keys(containerByName).length == 0) {
      // fallback to single 'root' slot using the rootContainer.
      containerByName['root'] = options.rootContainer;
    }

    Object.keys(containerByName).forEach(slotName => {
      this._contextSlots.push({
        id: `rootslotid-${slotName}`,
        name: slotName,
        tags: [`${slotName}`],
        container: containerByName[slotName],
        handleConnections: [],
        handles: 0,
        getProvidedSlotSpec: () => { return {isSet: false}; }});
    });
  }

  get affordance() { return this._affordance.name; }

  getSlot(particle, slotName) {
    return this._slots.find(s => s.consumeConn.particle == particle && s.consumeConn.name == slotName);
  }

  _findContainer(slotId) {
    let contextSlot = this._contextSlots.find(slot => slot.id == slotId);
    if (contextSlot) {
      return contextSlot.container;
    }
  }

  createHostedSlot(transformationParticle, transformationSlotName, hostedParticleName, hostedSlotName) {
    let hostedSlotId = this.arc.generateID();

    let transformationSlot = this.getSlot(transformationParticle, transformationSlotName);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(transformationSlot,
           `Unexpected transformation slot particle ${transformationParticle.name}:${transformationSlotName}, hosted particle ${hostedParticleName}, slot name ${hostedSlotName}`);
    transformationSlot.addHostedSlot(hostedSlotId, hostedParticleName, hostedSlotName);
    return hostedSlotId;
  }
  _findSlotByHostedSlotId(hostedSlotId) {
    for (let slot of this._slots) {
      let hostedSlot = slot.getHostedSlot(hostedSlotId);
      if (hostedSlot) {
        return slot;
      }
    }
  }
  findHostedSlot(hostedParticle, hostedSlotName) {
    for (let slot of this._slots) {
      let hostedSlot = slot.findHostedSlot(hostedParticle, hostedSlotName);
      if (hostedSlot) {
        return hostedSlot;
      }
    }
  }

  initializeRecipe(recipeParticles) {
    let newSlots = [];
    // Create slots for each of the recipe's particles slot connections.
    recipeParticles.forEach(p => {
      Object.values(p.consumedSlotConnections).forEach(cs => {
        if (!cs.targetSlot) {
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!cs.slotSpec.isRequired, `No target slot for particle's ${p.name} required consumed slot: ${cs.name}.`);
          return;
        }

        if (this._initHostedSlot(cs.targetSlot.id, p)) {
          // Skip slot creation for hosted slots.
          return;
        }

        let slot = new this._affordance.slotClass(cs, this.arc, this._containerKind);
        slot.startRenderCallback = this.arc.pec.startRender.bind(this.arc.pec);
        slot.stopRenderCallback = this.arc.pec.stopRender.bind(this.arc.pec);
        slot.innerSlotsUpdateCallback = this.updateInnerSlots.bind(this);
        newSlots.push(slot);
      });
    });

    // Attempt to set context for each of the slots.
    newSlots.forEach(s => {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!s.getContext(), `Unexpected context in new slot`);

      let container = null;
      let sourceConnection = s.consumeConn.targetSlot && s.consumeConn.targetSlot.sourceConnection;
      if (sourceConnection) {
        let sourceConnSlot = this.getSlot(sourceConnection.particle, sourceConnection.name);
        if (sourceConnSlot) {
          container = sourceConnSlot.getInnerContainer(s.consumeConn.name);
        }
      } else { // External slots provided at SlotComposer ctor (eg 'root')
        container = this._findContainer(s.consumeConn.targetSlot.id);
      }

      this._slots.push(s);

      if (container) {
        s.updateContainer(container);
      }
    });
  }

  _initHostedSlot(hostedSlotId, hostedParticle) {
    let transformationSlot = this._findSlotByHostedSlotId(hostedSlotId);
    if (!transformationSlot) {
      return false;
    }
    transformationSlot.initHostedSlot(hostedSlotId, hostedParticle);
    return true;
  }

  async renderSlot(particle, slotName, content) {
    let slot = this.getSlot(particle, slotName);
    if (slot) {
      // Set the slot's new content.
      await slot.setContent(content, eventlet => {
        this.arc.pec.sendEvent(particle, slotName, eventlet);
      });
      return;
    }

    if (this._renderHostedSlot(particle, slotName, content)) {
      return;
    }

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(slot, `Cannot find slot (or hosted slot) ${slotName} for particle ${particle.name}`);
  }

  _renderHostedSlot(particle, slotName, content) {
    let hostedSlot = this.findHostedSlot(particle, slotName);
    if (!hostedSlot) {
      return false;
    }
    let transformationSlot = this._findSlotByHostedSlotId(hostedSlot.slotId);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(transformationSlot, `No transformation slot found for ${hostedSlot.slotId}`);

    this.arc.pec.innerArcRender(transformationSlot.consumeConn.particle, transformationSlot.consumeConn.name, hostedSlot.slotId,
      transformationSlot.formatHostedContent(hostedSlot, content));

    return true;
  }

  updateInnerSlots(slot) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(slot, 'Cannot update inner slots of null');
    // Update provided slot contexts.
    Object.keys(slot.consumeConn.providedSlots).forEach(providedSlotName => {
      let providedContainer = slot.getInnerContainer(providedSlotName);
      let providedSlot = slot.consumeConn.providedSlots[providedSlotName];
      providedSlot.consumeConnections.forEach(cc => {
        // This will trigger 'start' or 'stop' render, if applicable.
        let innerSlot = this.getSlot(cc.particle, cc.name);
        // Note: slot may not exist yet, if providing particle's context was updated after arc's
        // active recipe was updated, but before slot-composer initialized the new recipe.
        if (innerSlot) {
          innerSlot.updateContainer(providedContainer);
        }
      });
    });
  }

  getAvailableSlots() {
    let availableSlots = this.arc.activeRecipe.slots.slice();

    this._contextSlots.forEach(contextSlot => {
      if (!availableSlots.find(s => s.id == contextSlot.id)) {
        availableSlots.push(contextSlot);
      }
    });
    return availableSlots;
  }

  dispose() {
    this._slots.forEach(slot => slot.dispose());
    this._slots.forEach(slot => slot.setContainer(null));
    this._affordance.contextClass.dispose();
    this._contextSlots.forEach(contextSlot => this._affordance.contextClass.clear(contextSlot.container));
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SlotComposer;



/***/ }),
/* 34 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = now;
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

function now() {
  return performance.now();
}


/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__slot_js__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dom_slot_js__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dom_context_js__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__description_dom_formatter_js__ = __webpack_require__(85);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */






class Affordance {
  constructor(options) {
    Object.keys(options).forEach(key => {
      this[`_${key}`] = options[key];
      Object.defineProperty(this, [key], {
        get: function() {
          return this[`_${key}`];
        }});
    });
  }
  static forName(name) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(_affordances[name], `Unsupported affordance ${name}`);
    return _affordances[name];
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Affordance;


let _affordances = {};
[
  {name: 'dom', slotClass: __WEBPACK_IMPORTED_MODULE_2__dom_slot_js__["a" /* DomSlot */], contextClass: __WEBPACK_IMPORTED_MODULE_3__dom_context_js__["a" /* DomContext */], descriptionFormatter: __WEBPACK_IMPORTED_MODULE_4__description_dom_formatter_js__["a" /* DescriptionDomFormatter */]},
  {name: 'dom-touch', slotClass: __WEBPACK_IMPORTED_MODULE_2__dom_slot_js__["a" /* DomSlot */], contextClass: __WEBPACK_IMPORTED_MODULE_3__dom_context_js__["a" /* DomContext */], descriptionFormatter: __WEBPACK_IMPORTED_MODULE_4__description_dom_formatter_js__["a" /* DescriptionDomFormatter */]},
  {name: 'vr', slotClass: __WEBPACK_IMPORTED_MODULE_2__dom_slot_js__["a" /* DomSlot */], contextClass: __WEBPACK_IMPORTED_MODULE_3__dom_context_js__["a" /* DomContext */], descriptionFormatter: __WEBPACK_IMPORTED_MODULE_4__description_dom_formatter_js__["a" /* DescriptionDomFormatter */]},
  {name: 'mock', slotClass: __WEBPACK_IMPORTED_MODULE_1__slot_js__["a" /* Slot */]}
].forEach(options => _affordances[options.name] = new Affordance(options));


/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__particle_spec_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__debug_outer_port_attachment_js__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__debug_devtools_connection_js__ = __webpack_require__(10);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */








class ThingMapper {
  constructor(prefix) {
    this._prefix = prefix;
    this._nextIdentifier = 0;
    this._idMap = new Map();
    this._reverseIdMap = new Map();
  }

  _newIdentifier() {
    return this._prefix + (this._nextIdentifier++);
  }

  createMappingForThing(thing, requestedId) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this._reverseIdMap.has(thing));
    let id;
    if (requestedId) {
      id = requestedId;
    } else if (thing.apiChannelMappingId) {
      id = thing.apiChannelMappingId;
    } else {
      id = this._newIdentifier();
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this._idMap.has(id), `${requestedId ? 'requestedId' : (thing.apiChannelMappingId ? 'apiChannelMappingId' : 'newIdentifier()')} ${id} already in use`);
    this.establishThingMapping(id, thing);
    return id;
  }

  maybeCreateMappingForThing(thing) {
    if (this.hasMappingForThing(thing)) {
      return this.identifierForThing(thing);
    }
    return this.createMappingForThing(thing);
  }

  async establishThingMapping(id, thing) {
    let continuation;
    if (Array.isArray(thing)) {
      [thing, continuation] = thing;
    }
    this._idMap.set(id, thing);
    if (thing instanceof Promise) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(continuation == null);
      await this.establishThingMapping(id, await thing);
    } else {
      this._reverseIdMap.set(thing, id);
      if (continuation) {
        await continuation();
      }
    }
  }

  hasMappingForThing(thing) {
    return this._reverseIdMap.has(thing);
  }

  identifierForThing(thing) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._reverseIdMap.has(thing), `Missing thing ${thing}`);
    return this._reverseIdMap.get(thing);
  }

  thingForIdentifier(id) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._idMap.has(id), `Missing id: ${id}`);
    return this._idMap.get(id);
  }
}


class APIPort {
  constructor(messagePort, prefix) {
    this._port = messagePort;
    this._mapper = new ThingMapper(prefix);
    this._messageMap = new Map();
    this._port.onmessage = async e => this._handle(e);
    this._debugAttachment = null;
    this.messageCount = 0;

    this.Direct = {
      convert: a => a,
      unconvert: a => a
    };

    this.LocalMapped = {
      convert: a => this._mapper.maybeCreateMappingForThing(a),
      unconvert: a => this._mapper.thingForIdentifier(a)
    };

    this.Mapped = {
      convert: a => this._mapper.identifierForThing(a),
      unconvert: a => this._mapper.thingForIdentifier(a)
    };

    this.Dictionary = function(primitive) {
      return {
        convert: a => {
          let r = {};
          for (let key in a) {
            r[key] = primitive.convert(a[key]);
          }
          return r;
        }
      };
    };

    this.Map = function(keyprimitive, valueprimitive) {
      return {
        convert: a => {
          let r = {};
          a.forEach((value, key) => r[keyprimitive.convert(key)] = valueprimitive.convert(value));
          return r;
        },
        unconvert: a => {
          let r = new Map();
          for (let key in a)
            r.set(keyprimitive.unconvert(key), valueprimitive.unconvert(a[key]));
          return r;
        }
      };
    };

    this.List = function(primitive) {
      return {
        convert: a => a.map(v => primitive.convert(v)),
        unconvert: a => a.map(v => primitive.unconvert(v))
      };
    };

    this.ByLiteral = function(clazz) {
      return {
        convert: a => a.toLiteral(),
        unconvert: a => clazz.fromLiteral(a)
      };
    };
  }

  close() {
    this._port.close();
  }

  async _handle(e) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._messageMap.has(e.data.messageType));

    this.messageCount++;

    let handler = this._messageMap.get(e.data.messageType);
    let args;
    try {
      args = this._unprocessArguments(handler.args, e.data.messageBody);
    } catch (exc) {
      console.error(`Exception during unmarshaling for ${e.data.messageType}`);
      throw exc;
    }
    // If any of the converted arguments are still pending promises
    // wait for them to complete before processing the message.
    for (let arg of Object.values(args)) {
      if (arg instanceof Promise) {
        arg.then(() => this._handle(e));
        return;
      }
    }
    let handlerName = 'on' + e.data.messageType;
    let result = this[handlerName](args);
    if (this._debugAttachment && this._debugAttachment[handlerName]) {
      this._debugAttachment[handlerName](args);
    }
    if (handler.isInitializer) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(args.identifier);
      await this._mapper.establishThingMapping(args.identifier, result);
    }
  }

  _processArguments(argumentTypes, args) {
    let messageBody = {};
    for (let argument in argumentTypes)
      messageBody[argument] = argumentTypes[argument].convert(args[argument]);
    return messageBody;
  }

  _unprocessArguments(argumentTypes, args) {
    let messageBody = {};
    for (let argument in argumentTypes)
      messageBody[argument] = argumentTypes[argument].unconvert(args[argument]);
    return messageBody;
  }

  registerCall(name, argumentTypes) {
    this[name] = args => {
      let call = {messageType: name, messageBody: this._processArguments(argumentTypes, args)};
      this.messageCount++;
      this._port.postMessage(call);
      if (this._debugAttachment && this._debugAttachment[name]) {
        this._debugAttachment[name](args);
      }
    };
  }

  registerHandler(name, argumentTypes) {
    this._messageMap.set(name, {args: argumentTypes});
  }

  registerInitializerHandler(name, argumentTypes) {
    argumentTypes.identifier = this.Direct;
    this._messageMap.set(name, {
      isInitializer: true,
      args: argumentTypes,
    });
  }

  registerRedundantInitializer(name, argumentTypes, mappingIdArg) {
    this.registerInitializer(name, argumentTypes, mappingIdArg, true /* redundant */);
  }

  registerInitializer(name, argumentTypes, mappingIdArg = null, redundant = false) {
    this[name] = (thing, args) => {
      if (redundant && this._mapper.hasMappingForThing(thing)) return;
      let call = {messageType: name, messageBody: this._processArguments(argumentTypes, args)};
      let requestedId = mappingIdArg && args[mappingIdArg];
      call.messageBody.identifier = this._mapper.createMappingForThing(thing, requestedId);
      this.messageCount++;
      this._port.postMessage(call);
      if (this._debugAttachment && this._debugAttachment[name]) {
        this._debugAttachment[name](thing, args);
      }
    };
  }
}

class PECOuterPort extends APIPort {
  constructor(messagePort, arc) {
    super(messagePort, 'o');

    this.registerCall('Stop', {});
    this.registerRedundantInitializer('DefineHandle', {type: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_2__type_js__["a" /* Type */]), name: this.Direct});
    this.registerInitializer('InstantiateParticle',
      {id: this.Direct, spec: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_1__particle_spec_js__["a" /* ParticleSpec */]), handles: this.Map(this.Direct, this.Mapped)}, 'id');

    this.registerCall('UIEvent', {particle: this.Mapped, slotName: this.Direct, event: this.Direct});
    this.registerCall('SimpleCallback', {callback: this.Direct, data: this.Direct});
    this.registerCall('AwaitIdle', {version: this.Direct});
    this.registerCall('StartRender', {particle: this.Mapped, slotName: this.Direct, contentTypes: this.List(this.Direct)});
    this.registerCall('StopRender', {particle: this.Mapped, slotName: this.Direct});

    this.registerHandler('Render', {particle: this.Mapped, slotName: this.Direct, content: this.Direct});
    this.registerHandler('InitializeProxy', {handle: this.Mapped, callback: this.Direct});
    this.registerHandler('SynchronizeProxy', {handle: this.Mapped, callback: this.Direct});
    this.registerHandler('HandleGet', {handle: this.Mapped, callback: this.Direct, particleId: this.Direct});
    this.registerHandler('HandleToList', {handle: this.Mapped, callback: this.Direct, particleId: this.Direct});
    this.registerHandler('HandleSet', {handle: this.Mapped, data: this.Direct, particleId: this.Direct});
    this.registerHandler('HandleStore', {handle: this.Mapped, data: this.Direct, particleId: this.Direct});
    this.registerHandler('HandleRemove', {handle: this.Mapped, data: this.Direct});
    this.registerHandler('HandleClear', {handle: this.Mapped, particleId: this.Direct});
    this.registerHandler('Idle', {version: this.Direct, relevance: this.Map(this.Mapped, this.Direct)});

    this.registerHandler('ConstructInnerArc', {callback: this.Direct, particle: this.Mapped});
    this.registerCall('ConstructArcCallback', {callback: this.Direct, arc: this.LocalMapped});

    this.registerHandler('ArcCreateHandle', {callback: this.Direct, arc: this.LocalMapped, type: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_2__type_js__["a" /* Type */]), name: this.Direct});
    this.registerInitializer('CreateHandleCallback', {callback: this.Direct, type: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_2__type_js__["a" /* Type */]), name: this.Direct, id: this.Direct});

    this.registerHandler('ArcMapHandle', {callback: this.Direct, arc: this.LocalMapped, handle: this.Mapped});
    this.registerInitializer('MapHandleCallback', {callback: this.Direct, id: this.Direct});

    this.registerHandler('ArcCreateSlot',
      {callback: this.Direct, arc: this.LocalMapped, transformationParticle: this.Mapped, transformationSlotName: this.Direct, hostedParticleName: this.Direct, hostedSlotName: this.Direct});
    this.registerInitializer('CreateSlotCallback', {callback: this.Direct, hostedSlotId: this.Direct});
    this.registerCall('InnerArcRender', {transformationParticle: this.Mapped, transformationSlotName: this.Direct, hostedSlotId: this.Direct, content: this.Direct});

    this.registerHandler('ArcLoadRecipe', {arc: this.LocalMapped, recipe: this.Direct, callback: this.Direct});

    this.registerHandler('RaiseSystemException', {exception: this.Direct, methodName: this.Direct, particleId: this.Direct});

    __WEBPACK_IMPORTED_MODULE_4__debug_devtools_connection_js__["a" /* DevtoolsConnection */].onceConnected.then(
      devtoolsChannel => this._debugAttachment = new __WEBPACK_IMPORTED_MODULE_3__debug_outer_port_attachment_js__["a" /* OuterPortAttachment */](arc, devtoolsChannel));
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = PECOuterPort;


class PECInnerPort extends APIPort {
  constructor(messagePort) {
    super(messagePort, 'i');

    this.registerHandler('Stop', {});
    this.registerInitializerHandler('DefineHandle', {type: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_2__type_js__["a" /* Type */]), name: this.Direct});
    this.registerInitializerHandler('InstantiateParticle',
      {id: this.Direct, spec: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_1__particle_spec_js__["a" /* ParticleSpec */]), handles: this.Map(this.Direct, this.Mapped)});

    this.registerHandler('UIEvent', {particle: this.Mapped, slotName: this.Direct, event: this.Direct});
    this.registerHandler('SimpleCallback', {callback: this.LocalMapped, data: this.Direct});
    this.registerHandler('AwaitIdle', {version: this.Direct});
    this.registerHandler('StartRender', {particle: this.Mapped, slotName: this.Direct, contentTypes: this.Direct});
    this.registerHandler('StopRender', {particle: this.Mapped, slotName: this.Direct});

    this.registerCall('Render', {particle: this.Mapped, slotName: this.Direct, content: this.Direct});
    this.registerCall('InitializeProxy', {handle: this.Mapped, callback: this.LocalMapped});
    this.registerCall('SynchronizeProxy', {handle: this.Mapped, callback: this.LocalMapped});
    this.registerCall('HandleGet', {handle: this.Mapped, callback: this.LocalMapped, particleId: this.Direct});
    this.registerCall('HandleToList', {handle: this.Mapped, callback: this.LocalMapped, particleId: this.Direct});
    this.registerCall('HandleSet', {handle: this.Mapped, data: this.Direct, particleId: this.Direct, barrier: this.Direct});
    this.registerCall('HandleStore', {handle: this.Mapped, data: this.Direct, particleId: this.Direct});
    this.registerCall('HandleRemove', {handle: this.Mapped, data: this.Direct});
    this.registerCall('HandleClear', {handle: this.Mapped, particleId: this.Direct, barrier: this.Direct});
    this.registerCall('Idle', {version: this.Direct, relevance: this.Map(this.Mapped, this.Direct)});

    this.registerCall('ConstructInnerArc', {callback: this.LocalMapped, particle: this.Mapped});
    this.registerHandler('ConstructArcCallback', {callback: this.LocalMapped, arc: this.Direct});

    this.registerCall('ArcCreateHandle', {callback: this.LocalMapped, arc: this.Direct, type: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_2__type_js__["a" /* Type */]), name: this.Direct});
    this.registerInitializerHandler('CreateHandleCallback', {callback: this.LocalMapped, type: this.ByLiteral(__WEBPACK_IMPORTED_MODULE_2__type_js__["a" /* Type */]), name: this.Direct, id: this.Direct});
    this.registerCall('ArcMapHandle', {callback: this.LocalMapped, arc: this.Direct, handle: this.Mapped});
    this.registerInitializerHandler('MapHandleCallback', {callback: this.LocalMapped, id: this.Direct});
    this.registerCall('ArcCreateSlot',
      {callback: this.LocalMapped, arc: this.Direct, transformationParticle: this.Mapped, transformationSlotName: this.Direct, hostedParticleName: this.Direct, hostedSlotName: this.Direct});
    this.registerInitializerHandler('CreateSlotCallback', {callback: this.LocalMapped, hostedSlotId: this.Direct});
    this.registerHandler('InnerArcRender', {transformationParticle: this.Mapped, transformationSlotName: this.Direct, hostedSlotId: this.Direct, content: this.Direct});

    this.registerCall('ArcLoadRecipe', {arc: this.Direct, recipe: this.Direct, callback: this.LocalMapped});

    this.registerCall('RaiseSystemException', {exception: this.Direct, methodName: this.Direct, particleId: this.Direct});

  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = PECInnerPort;



/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

class StrategyExplorerAdapter {
  static processGenerations(generations, devtoolsChannel, options = {}) {
    devtoolsChannel.send({
      messageType: 'generations',
      // TODO: Implement simple serialization and move the logic in adapt()
      //       into the Strategy Explorer proper.
      messageBody: {results: StrategyExplorerAdapter.adapt(generations), options}
    });
  }
  static adapt(generations) {
    // Make a copy of everything and assign IDs to recipes.
    const idMap = new Map(); // Recipe -> ID
    let lastID = 0;
    const assignIdAndCopy = recipe => {
      idMap.set(recipe, lastID);
      let {result, score, derivation, description, hash, valid, active, irrelevant} = recipe;
      return {result, score, derivation, description, hash, valid, active, irrelevant, id: lastID++};
    };
    generations = generations.map(pop => ({
      record: pop.record,
      generated: pop.generated.map(assignIdAndCopy)
    }));

    // CombinedStrategy creates recipes with derivations that are missing
    // from the population. Re-adding them as 'combined'.
    for (let pop of generations) {
      let lengthWithoutCombined = pop.generated.length;
      for (let i = 0; i < lengthWithoutCombined; i++) {
        pop.generated[i].derivation.forEach(function addMissing({parent}) {
          if (parent && !idMap.has(parent)) {
            pop.generated.push(Object.assign(assignIdAndCopy(parent), {combined: true}));
            parent.derivation.forEach(addMissing);
          }
        });
      }
    }

    // Change recipes in derivation to IDs and compute resolved stats.
    return generations.map(pop => {
      let population = pop.generated;
      let record = pop.record;
      // Adding those here to reuse recipe resolution computation.
      record.resolvedDerivations = 0;
      record.resolvedDerivationsByStrategy = {};

      population.forEach(item => {
        item.derivation = item.derivation.map(derivItem => {
          let parent, strategy;
          if (derivItem.parent)
            parent = idMap.get(derivItem.parent);
          if (derivItem.strategy)
            strategy = derivItem.strategy.constructor.name;
          return {parent, strategy};
        });
        item.resolved = item.result.isResolved();
        if (item.resolved) {
          record.resolvedDerivations++;
          let strategy = item.derivation[0].strategy;
          if (record.resolvedDerivationsByStrategy[strategy] === undefined)
            record.resolvedDerivationsByStrategy[strategy] = 0;
          record.resolvedDerivationsByStrategy[strategy]++;
        }
        let options = {showUnresolved: true, showInvalid: false, details: ''};
        item.result = item.result.toString(options);
      });
      let populationMap = {};
      population.forEach(item => {
        if (populationMap[item.derivation[0].strategy] == undefined)
          populationMap[item.derivation[0].strategy] = [];
        populationMap[item.derivation[0].strategy].push(item);
      });
      let result = {population: [], record};
      Object.keys(populationMap).forEach(strategy => {
        result.population.push({strategy: strategy, recipes: populationMap[strategy]});
      });
      return result;
    });
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = StrategyExplorerAdapter;



/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__symbols_js__ = __webpack_require__(62);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__type_js__ = __webpack_require__(4);
// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class Entity {
  constructor(userIDComponent) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!userIDComponent || userIDComponent.indexOf(':') == -1, 'user IDs must not contain the \':\' character');
    this[__WEBPACK_IMPORTED_MODULE_1__symbols_js__["a" /* Symbols */].identifier] = undefined;
    this._userIDComponent = userIDComponent;
  }
  get data() {
    return undefined;
  }

  getUserID() {
    return this._userIDComponent;
  }

  isIdentified() {
    return this[__WEBPACK_IMPORTED_MODULE_1__symbols_js__["a" /* Symbols */].identifier] !== undefined;
  }
  // TODO: entity should not be exposing its IDs.
  get id() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!!this.isIdentified());
    return this[__WEBPACK_IMPORTED_MODULE_1__symbols_js__["a" /* Symbols */].identifier];
  }
  identify(identifier) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this.isIdentified());
    this[__WEBPACK_IMPORTED_MODULE_1__symbols_js__["a" /* Symbols */].identifier] = identifier;
    let components = identifier.split(':');
    if (components[components.length - 2] == 'uid')
      this._userIDComponent = components[components.length - 1];
  }
  createIdentity(components) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this.isIdentified());
    let id;
    if (this._userIDComponent)
      id = `${components.base}:uid:${this._userIDComponent}`;
    else
      id = `${components.base}:${components.component()}`;
    this[__WEBPACK_IMPORTED_MODULE_1__symbols_js__["a" /* Symbols */].identifier] = id;
  }
  toLiteral() {
    return this.rawData;
  }

  static get type() {
    // TODO: should the entity's key just be its type?
    // Should it just be called type in that case?
    return __WEBPACK_IMPORTED_MODULE_2__type_js__["a" /* Type */].newEntity(this.key.schema);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Entity;



/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = handleFor;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__entity_js__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__symbols_js__ = __webpack_require__(62);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__particle_spec_js__ = __webpack_require__(11);
/** @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */







// TODO: This won't be needed once runtime is transferred between contexts.
function cloneData(data) {
  return data;
  //return JSON.parse(JSON.stringify(data));
}

function restore(entry, entityClass) {
  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(entityClass, 'Handles need entity classes for deserialization');
  let {id, rawData} = entry;
  let entity = new entityClass(cloneData(rawData));
  if (entry.id) {
    entity.identify(entry.id);
  }

  // TODO some relation magic, somewhere, at some point.

  return entity;
}

/** @class Handle
 * Base class for Collections and Variables.
 */
class Handle {
  constructor(proxy, name, particleId, canRead, canWrite) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(!(proxy instanceof Handle));
    this._proxy = proxy;
    this.name = name || this._proxy.name;
    this.canRead = canRead;
    this.canWrite = canWrite;
    this._particleId = particleId;
    this.options = {
      keepSynced: true,
      notifySync: true,
      notifyUpdate: true,
      notifyDesync: false,
    };
  }

  raiseSystemException(exception, method) {
    this._proxy.raiseSystemException(exception, method, this._particleId);
  }

  // `options` may contain any of:
  // - keepSynced (bool): load full data on startup, maintain data in proxy and resync as required
  // - notifySync (bool): if keepSynced is true, call onHandleSync when the full data is received
  // - notifyUpdate (bool): call onHandleUpdate for every change event received
  // - notifyDesync (bool): if keepSynced is true, call onHandleDesync when desync is detected
  configure(options) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(this.canRead, 'configure can only be called on readable Handles');
    try {
      let keys = Object.keys(this.options);
      let badKeys = Object.keys(options).filter(o => !keys.includes(o));
      if (badKeys.length > 0) {
        throw new Error(`Invalid option in Handle.configure(): ${badKeys}`);
      }
      Object.assign(this.options, options);
    } catch (e) {
      this.raiseSystemException(e, 'Handle::configure');
      throw e;
    }
  }

  _serialize(entity) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(entity, 'can\'t serialize a null entity');
    if (!entity.isIdentified())
      entity.createIdentity(this._proxy.generateIDComponents());
    let id = entity[__WEBPACK_IMPORTED_MODULE_1__symbols_js__["a" /* Symbols */].identifier];
    let rawData = entity.dataClone();
    return {
      id,
      rawData
    };
  }

  get type() {
    return this._proxy._type;
  }

  get _id() {
    return this._proxy._id;
  }

  toManifestString() {
    return `'${this._id}'`;
  }
}

/** @class Collection
 * A handle on a set of Entity data. Note that, as a set, a Collection can only
 * contain a single version of an Entity for each given ID. Further, no order is
 * implied by the set. A particle's manifest dictates the types of handles that
 * need to be connected to that particle, and the current recipe identifies
 * which handles are connected.
 */
class Collection extends Handle {
  constructor(proxy, name, particleId, canRead, canWrite) {
    // TODO: this should talk to an API inside the PEC.
    super(proxy, name, particleId, canRead, canWrite);
  }
  query() {
    // TODO: things
  }

  // Called by StorageProxy.
  _notify(kind, particle, details) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(this.canRead, '_notify should not be called for non-readable handles');
    switch (kind) {
      case 'sync':
        particle.onHandleSync(this, this._restore(details));
        return;
      case 'update': {
        let update = {};
        if ('add' in details)
          update.added = this._restore(details.add);
        if ('remove' in details)
          update.removed = this._restore(details.remove);
        update.originator = details.originatorId == this._particleId;
        particle.onHandleUpdate(this, update);
        return;
      }
      case 'desync':
        particle.onHandleDesync(this);
        return;
    }
  }

  /** @method async toList()
   * Returns a list of the Entities contained by the handle.
   * throws: Error if this handle is not configured as a readable handle (i.e. 'in' or 'inout')
     in the particle's manifest.
   */
  async toList() {
    // TODO: remove this and use query instead
    if (!this.canRead)
      throw new Error('Handle not readable');
    return this._restore(await this._proxy.toList(this._particleId));
  }

  _restore(list) {
    return (list !== null) ? list.map(a => restore(a, this.entityClass)) : null;
  }

  /** @method store(entity)
   * Stores a new entity into the Handle.
   * throws: Error if this handle is not configured as a writeable handle (i.e. 'out' or 'inout')
     in the particle's manifest.
   */
  async store(entity) {
    if (!this.canWrite)
      throw new Error('Handle not writeable');
    let serialization = this._serialize(entity);
    let keys = [this._proxy.generateID('key')];
    return this._proxy.store(serialization, keys, this._particleId);
  }

  /** @method remove(entity)
   * Removes an entity from the Handle.
   * throws: Error if this handle is not configured as a writeable handle (i.e. 'out' or 'inout')
     in the particle's manifest.
   */
  async remove(entity) {
    if (!this.canWrite)
      throw new Error('Handle not writeable');
    let serialization = this._serialize(entity);
    // Remove the keys that exist at storage/proxy.
    let keys = [];
    return this._proxy.remove(serialization.id, keys, this._particleId);
  }
}

/** @class Variable
 * A handle on a single entity. A particle's manifest dictates
 * the types of handles that need to be connected to that particle, and
 * the current recipe identifies which handles are connected.
 */
class Variable extends Handle {
  constructor(proxy, name, particleId, canRead, canWrite) {
    super(proxy, name, particleId, canRead, canWrite);
  }

  // Called by StorageProxy.
  _notify(kind, particle, details) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(this.canRead, '_notify should not be called for non-readable handles');
    switch (kind) {
      case 'sync':
        particle.onHandleSync(this, this._restore(details));
        return;
      case 'update': {
        particle.onHandleUpdate(this, {data: this._restore(details.data)});
        return;
      }
      case 'desync':
        particle.onHandleDesync(this);
        return;
    }
  }

  /** @method async get()
  * Returns the Entity contained by the Variable, or undefined if the Variable
  * is cleared.
  * throws: Error if this variable is not configured as a readable handle (i.e. 'in' or 'inout')
    in the particle's manifest.
   */
  async get() {
    if (!this.canRead)
      throw new Error('Handle not readable');
    let model = await this._proxy.get(this._particleId);
    return this._restore(model);
  }

  _restore(model) {
    if (model === null)
      return null;
    if (this.type.isEntity) {
      return restore(model, this.entityClass);
    }
    return this.type.isInterface ? __WEBPACK_IMPORTED_MODULE_3__particle_spec_js__["a" /* ParticleSpec */].fromLiteral(model) : model;
  }

  /** @method set(entity)
   * Stores a new entity into the Variable, replacing any existing entity.
   * throws: Error if this variable is not configured as a writeable handle (i.e. 'out' or 'inout')
     in the particle's manifest.
   */
  async set(entity) {
    try {
      if (!this.canWrite)
        throw new Error('Handle not writeable');
      return this._proxy.set(this._serialize(entity), this._particleId);
    } catch (e) {
      this.raiseSystemException(e, 'Handle::set');
      throw e;
    }
  }

  /** @method clear()
   * Clears any entity currently in the Variable.
   * throws: Error if this variable is not configured as a writeable handle (i.e. 'out' or 'inout')
     in the particle's manifest.
   */
  async clear() {
    if (!this.canWrite)
      throw new Error('Handle not writeable');
    await this._proxy.clear(this._particleId);
  }
}

function handleFor(proxy, isSet, name, particleId, canRead = true, canWrite = true) {
  return (isSet || (isSet == undefined && proxy.type.isCollection))
      ? new Collection(proxy, name, particleId, canRead, canWrite)
      : new Variable(proxy, name, particleId, canRead, canWrite);
}


/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__particle_spec_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__transformation_dom_particle_js__ = __webpack_require__(30);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */






class MultiplexerDomParticle extends __WEBPACK_IMPORTED_MODULE_2__transformation_dom_particle_js__["a" /* TransformationDomParticle */] {
  constructor() {
    super();
    this._itemSubIdByHostedSlotId = new Map();
    this._connByHostedConn = new Map();
  }

  async _mapParticleConnections(
      listHandleName,
      particleHandleName,
      hostedParticle,
      handles,
      arc) {
    let otherMappedHandles = [];
    let otherConnections = [];
    let index = 2;
    const skipConnectionNames = [listHandleName, particleHandleName];
    for (let [connectionName, otherHandle] of handles) {
      if (skipConnectionNames.includes(connectionName)) {
        continue;
      }
      // TODO(wkorman): For items with embedded recipes we may need a map
      // (perhaps id to index) to make sure we don't map a handle into the inner
      // arc multiple times unnecessarily.
      otherMappedHandles.push(
          `map '${await arc.mapHandle(otherHandle._proxy)}' as v${index}`);
      let hostedOtherConnection = hostedParticle.connections.find(
          conn => conn.isCompatibleType(otherHandle.type));
      if (hostedOtherConnection) {
        otherConnections.push(`${hostedOtherConnection.name} <- v${index++}`);
        // TODO(wkorman): For items with embedded recipes where we may have a
        // different particle rendering each item, we need to track
        // |connByHostedConn| keyed on the particle type.
        this._connByHostedConn.set(hostedOtherConnection.name, connectionName);
      }
    }
    return [otherMappedHandles, otherConnections];
  }

  async setHandles(handles) {
    this.handleIds = {};
    let arc = await this.constructInnerArc();
    const listHandleName = 'list';
    const particleHandleName = 'hostedParticle';
    let particleHandle = handles.get(particleHandleName);
    let hostedParticle = null;
    let otherMappedHandles = [];
    let otherConnections = [];
    if (particleHandle) {
      hostedParticle = await particleHandle.get();
      if (hostedParticle) {
        [otherMappedHandles, otherConnections] =
            await this._mapParticleConnections(
                listHandleName, particleHandleName, hostedParticle, handles, arc);
      }
    }
    this.setState({
      arc,
      type: handles.get(listHandleName).type,
      hostedParticle,
      otherMappedHandles,
      otherConnections
    });

    super.setHandles(handles);
  }

  async willReceiveProps(
      {list},
      {arc, type, hostedParticle, otherMappedHandles, otherConnections}) {
    if (list.length > 0) {
      this.relevance = 0.1;
    }

    for (let [index, item] of this.getListEntries(list)) {
      let resolvedHostedParticle = hostedParticle;
      if (this.handleIds[item.id]) {
        let itemHandle = await this.handleIds[item.id];
        itemHandle.set(item);
        continue;
      }

      let itemHandlePromise =
          arc.createHandle(type.primitiveType(), 'item' + index);
      this.handleIds[item.id] = itemHandlePromise;

      let itemHandle = await itemHandlePromise;

      if (!resolvedHostedParticle) {
        // If we're muxing on behalf of an item with an embedded recipe, the
        // hosted particle should be retrievable from the item itself. Else we
        // just skip this item.
        if (!item.renderParticleSpec) {
          continue;
        }
        resolvedHostedParticle =
            __WEBPACK_IMPORTED_MODULE_1__particle_spec_js__["a" /* ParticleSpec */].fromLiteral(JSON.parse(item.renderParticleSpec));
        // Re-map compatible handles and compute the connections specific
        // to this item's render particle.
        const listHandleName = 'list';
        const particleHandleName = 'renderParticle';
        [otherMappedHandles, otherConnections] =
            await this._mapParticleConnections(
                listHandleName,
                particleHandleName,
                resolvedHostedParticle,
                this.handles,
                arc);
      }
      let hostedSlotName = [...resolvedHostedParticle.slots.keys()][0];
      let slotName = [...this.spec.slots.values()][0].name;
      let slotId = await arc.createSlot(
          this, slotName, resolvedHostedParticle.name, hostedSlotName);

      if (!slotId) {
        continue;
      }

      this._itemSubIdByHostedSlotId.set(slotId, item.id);

      try {
        const recipe = this.constructInnerRecipe(
          resolvedHostedParticle,
          item,
          itemHandle,
          {name: hostedSlotName, id: slotId},
          {connections: otherConnections, handles: otherMappedHandles}
        );
        await arc.loadRecipe(recipe, this);
        itemHandle.set(item);
      } catch (e) {
        console.log(e);
      }
    }
  }

  combineHostedModel(slotName, hostedSlotId, content) {
    let subId = this._itemSubIdByHostedSlotId.get(hostedSlotId);
    if (!subId) {
      return;
    }
    let items = this._state.renderModel ? this._state.renderModel.items : [];
    let listIndex = items.findIndex(item => item.subId == subId);
    let item = Object.assign({}, content.model, {subId});
    if (listIndex >= 0 && listIndex < items.length) {
      items[listIndex] = item;
    } else {
      items.push(item);
    }
    this._setState({renderModel: {items}});
  }

  combineHostedTemplate(slotName, hostedSlotId, content) {
    let subId = this._itemSubIdByHostedSlotId.get(hostedSlotId);
    if (!subId) {
      return;
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(content.templateName, `Template name is missing for slot '${slotName}' (hosted slot ID: '${hostedSlotId}')`);
    this._setState({templateName: Object.assign(this._state.templateName || {}, {[subId]: `${content.templateName}`})});

    if (content.template) {
      let template = content.template;
      // Replace hosted particle connection in template with the corresponding particle connection names.
      // TODO: make this generic!
      this._connByHostedConn.forEach((conn, hostedConn) => {
        template = template.replace(
            new RegExp(`{{${hostedConn}.description}}`, 'g'),
            `{{${conn}.description}}`);
      });
      this._setState({template: Object.assign(this._state.template || {}, {[content.templateName]: template})});

      this.forceRenderTemplate();
    }
  }

  // Abstract methods below.

  // Called to produce a full interpolated recipe for loading into an inner
  // arc for each item. Subclasses should override this method as by default
  // it does nothing and so no recipe will be returned and content will not
  // be loaded successfully into the inner arc.
  constructInnerRecipe(hostedParticle, item, itemHandle, slot, other) {}

  // Called with the list of items and by default returns the direct result of
  // `Array.entries()`. Subclasses can override this method to alter the item
  // order or otherwise permute the items as desired before their slots are
  // created and contents are rendered.
  getListEntries(list) {
    return list.entries();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MultiplexerDomParticle;



/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



class Search {
  constructor(phrase, unresolvedTokens) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(phrase);

    this._phrase = '';
    this._unresolvedTokens = [];
    this._resolvedTokens = [];

    this.appendPhrase(phrase, unresolvedTokens);
  }
  appendPhrase(phrase, unresolvedTokens) {
    // concat phrase
    if (this._phrase.length > 0) {
      this._phrase = this.phrase.concat(' ');
    }
    this._phrase = this._phrase.concat(phrase);

    // update tokens
    let newTokens = phrase.toLowerCase().split(/[^a-z0-9]/g);
    newTokens.forEach(t => {
      if (!unresolvedTokens || unresolvedTokens.indexOf(t) >= 0) {
        this._unresolvedTokens.push(t);
      } else {
        this._resolvedTokens.push(t);
      }
    });
  }
  get phrase() { return this._phrase; }
  get unresolvedTokens() { return this._unresolvedTokens; }
  get resolvedTokens() { return this._resolvedTokens; }
  resolveToken(token) {
    let index = this.unresolvedTokens.indexOf(token.toLowerCase());
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(index >= 0, `Cannot resolved nonexistent token ${token}`);
    this._unresolvedTokens.splice(index, 1);
    this._resolvedTokens.push(token.toLowerCase());
  }

  isValid() {
    return this._unresolvedTokens.length > 0 || this._resolvedTokens.length > 0;
  }

  isResolved() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this));
    // Recipe is considered resolved, if at least one of the search tokens was resolved.
    // TODO: Unresolved tokens don't prevent the recipe from being resolved. For now...
    return this._resolvedTokens.length > 0;
  }

  _normalize() {
    this._unresolvedTokens.sort();
    this._resolvedTokens.sort();

    Object.freeze(this);
  }

  _copyInto(recipe) {
    if (recipe.search) {
      recipe.search.appendPhrase(this.phrase, this.unresolvedTokens);
    } else {
      recipe.search = new Search(this.phrase, this.unresolvedTokens);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipe.search.resolvedTokens.length == this.resolvedTokens.length);
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.resolvedTokens.every(rt => recipe.search.resolvedTokens.indexOf(rt) >= 0) &&
           this.unresolvedTokens.every(rt => recipe.search.unresolvedTokens.indexOf(rt) >= 0));
    return recipe.search;
  }

  toString(options) {
    let result = [];
    result.push(`search \`${this.phrase}\``);

    let tokenStr = [];
    tokenStr.push('  tokens');
    if (this.unresolvedTokens.length > 0) {
      tokenStr.push(this.unresolvedTokens.map(t => `\`${t}\``).join(' '));
    }
    if (this.resolvedTokens.length > 0) {
      tokenStr.push(`// ${this.resolvedTokens.map(t => `\`${t}\``).join(' ')}`);
    }
    if (options && options.showUnresolved) {
      if (this.unresolvedTokens.length > 0) {
        tokenStr.push('// unresolved search tokens');
      }
    }
    result.push(tokenStr.join(' '));

    return result.join('\n');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Search;



/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */




class Slot {
  constructor(consumeConn, arc) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(consumeConn);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(arc);
    this._consumeConn = consumeConn;
    this._arc = arc;
    this._context = null;
    this.startRenderCallback = null;
    this.stopRenderCallback = null;
    this._hostedSlotById = new Map();
  }
  get consumeConn() { return this._consumeConn; }
  get arc() { return this._arc; }
  getContext() { return this._context; }
  setContainer(container) { this._context = container; }
  isSameContainer(container) { return this._context == container; }

  updateContainer(container) {
    // do nothing, if container unchanged.
    if ((!this.getContext() && !container) ||
        (this.getContext() && container && this.isSameContainer(container))) {
      return;
    }

    // update the container;
    let wasNull = !this.getContext();
    this.setContainer(container);
    if (this.getContext()) {
      if (wasNull) {
        this.startRender();
      }
    } else {
      this.stopRender();
    }
  }
  startRender() {
    if (this.startRenderCallback) {
      const slotName = this.consumeConn.name;
      const particle = this.consumeConn.particle;
      const context = this.getContext();
      if (context.updateParticleName) {
        context.updateParticleName(slotName, particle.name);
      }
      this.startRenderCallback({particle, slotName, contentTypes: this.constructRenderRequest()});

      for (let hostedSlot of this._hostedSlotById.values()) {
        if (hostedSlot.particle) {
          // Note: hosted particle may still not be set, if the hosted slot was already created, but the inner recipe wasn't instantiate yet.
          this.startRenderCallback({
              particle: hostedSlot.particle,
              slotName: hostedSlot.slotName,
              // TODO(mmandlis): Only one of each type of hosted particles need to send the particle template.
              // The problem is with rendering content arriving out of order - currently can't track all slots using the same
              // template and render them after the template is uploaded.
              contentTypes: this.constructRenderRequest(hostedSlot)
          });
        }
      }
    }
  }

  stopRender() {
    if (this.stopRenderCallback) {
      this.stopRenderCallback({particle: this.consumeConn.particle, slotName: this.consumeConn.name});

      for (let hostedSlot of this._hostedSlotById.values()) {
        this.stopRenderCallback({particle: hostedSlot.particle, slotName: hostedSlot.slotName});
      }
    }
  }

  async populateHandleDescriptions() {
    let descriptions = {};
    await Promise.all(Object.values(this.consumeConn.particle.connections).map(async handleConn => {
      if (handleConn.handle) {
        descriptions[`${handleConn.name}.description`] = (await this._arc.description.getHandleDescription(handleConn.handle)).toString();
      }
    }));
    return descriptions;
  }

  addHostedSlot(hostedSlotId, hostedParticleName, hostedSlotName) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(hostedSlotId, `Hosted slot ID must be provided`);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this._hostedSlotById.has(hostedSlotId), `Hosted slot ${hostedSlotId} already exists`);
    this._hostedSlotById.set(hostedSlotId, {slotId: hostedSlotId, particleName: hostedParticleName, slotName: hostedSlotName});
    return hostedSlotId;
  }
  getHostedSlot(hostedSlotId) {
    return this._hostedSlotById.get(hostedSlotId);
  }
  findHostedSlot(hostedParticle, hostedSlotName) {
    for (let hostedSlot of this._hostedSlotById.values()) {
      if (hostedSlot.particle == hostedParticle && hostedSlot.slotName == hostedSlotName) {
        return hostedSlot;
      }
    }
  }
  initHostedSlot(hostedSlotId, hostedParticle) {
    let hostedSlot = this.getHostedSlot(hostedSlotId);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(hostedSlot, `Hosted slot ${hostedSlotId} doesn't exist`);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(hostedSlot.particleName == hostedParticle.name,
           `Unexpected particle name ${hostedParticle.name} for slot ${hostedSlotId}; expected: ${hostedSlot.particleName}`);
    hostedSlot.particle = hostedParticle;
    if (this.getContext() && this.startRenderCallback) {
      this.startRenderCallback({
          particle: hostedSlot.particle,
          slotName: hostedSlot.slotName,
          // TODO(mmandlis): Only one of each type of hosted particles need to send the particle template.
          // The problem is with rendering content arriving out of order - currently can't track all slots using the same
          // template and render them after the template is uploaded.
          contentTypes: this.constructRenderRequest(hostedSlot)
      });
    }
  }
  formatHostedContent(hostedSlot, content) { return content; }

  // Abstract methods.
  async setContent(content, handler) {}
  getInnerContainer(slotName) {}
  constructRenderRequest(hostedSlot) {}
  dispose() {}
  static findRootContainers(container) {}
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Slot;



/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tracelib_trace_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__relevance_js__ = __webpack_require__(103);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





class Speculator {
  constructor() {
    this._relevanceByHash = new Map();
  }

  async speculate(arc, plan, hash) {
    if (this._relevanceByHash.has(hash)) {
      let arcStoreVersionById = arc.getStoresState();
      let relevance = this._relevanceByHash.get(hash);
      let relevanceStoreVersionById = relevance.arcState;
      if (plan.handles.every(handle => arcStoreVersionById.get(handle.id) == relevanceStoreVersionById.get(handle.id))) {
        return relevance;
      }
    }

    let newArc = await arc.cloneForSpeculativeExecution();
    let relevance = new __WEBPACK_IMPORTED_MODULE_1__relevance_js__["a" /* Relevance */](arc.getStoresState());
    let relevanceByHash = this._relevanceByHash;
    async function awaitCompletion() {
      let messageCount = newArc.pec.messageCount;
      relevance.apply(await newArc.pec.idle);

      // We expect two messages here, one requesting the idle status, and one answering it.
      if (newArc.pec.messageCount !== messageCount + 2)
        return awaitCompletion();
      else {
        relevance.newArc = newArc;
        relevanceByHash.set(hash, relevance);
        return relevance;
      }
    }

    return newArc.instantiate(plan).then(a => awaitCompletion());
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Speculator;



/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



// Bulding block for CRDT collections. Tracks the membership (keys) of
// values identified by unique IDs. A value is considered to be part
// of the collection if the set of keys added by calls to
// `add(id, ..., keys)` minus the set of keys removed by calls to
// `remove(id, keys)` is non-empty.
//
// Note: This implementation does not guard against the case of the
// same membership key being added more than once. Don't do that.
class CrdtCollectionModel {
  constructor(model) {
    // id => {value, Set[keys]}
    this._items = new Map();
    if (model) {
      for (let {id, value, keys} of model) {
        if (!keys) {
          keys = [];
        }
        this._items.set(id, {value, keys: new Set(keys)});
      }
    }
  }
  // Adds membership, `keys`, of `value` indexed by `id` to this collection.
  // Returns whether the change is effective (`id` is new to the collection,
  // or `value` is different to the value previously stored).
  add(id, value, keys) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(keys.length > 0, 'add requires keys');
    let item = this._items.get(id);
    let effective = false;
    if (!item) {
      item = {value, keys: new Set(keys)};
      this._items.set(id, item);
      effective = true;
    } else {
      let newKeys = false;
      for (let key of keys) {
        if (!item.keys.has(key)) {
          newKeys = true;
        }
        item.keys.add(key);
      }
      if (JSON.stringify(item.value) != JSON.stringify(value)) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(newKeys, 'cannot add without new keys');
        item.value = value;
        effective = true;
      }
    }
    return effective;
  }
  // Removes the membership, `keys`, of the value indexed by `id` from this collection.
  // Returns whether the change is effective (the value is no longer present
  // in the collection because all of the keys have been removed).
  remove(id, keys) {
    let item = this._items.get(id);
    if (!item) {
      return false;
    }
    for (let key of keys) {
      item.keys.delete(key);
    }
    let effective = item.keys.size == 0;
    if (effective) {
      this._items.delete(id);
    }
    return effective;
  }
  // [{id, value, keys: []}]
  toLiteral() {
    let result = [];
    for (let [id, {value, keys}] of this._items.entries()) {
      result.push({id, value, keys: [...keys]});
    }
    return result;
  }
  toList() {
    return [...this._items.values()].map(item => item.value);
  }
  getKeys(id) {
    let item = this._items.get(id);
    return item ? [...item.keys] : [];
  }
  getValue(id) {
    let item = this._items.get(id);
    return item ? item.value : null;
  }
  get size() {
    return this._items.size;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CrdtCollectionModel;


/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// @
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt


class KeyBase {
  childKeyForHandle(id) {
    throw 'NotImplemented';
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = KeyBase;



/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tracelib_trace_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_util_js__ = __webpack_require__(5);
// @
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class StorageProviderBase {
  constructor(type, arcId, name, id, key) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(id, 'id must be provided when constructing StorageProviders');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!type.hasUnresolvedVariable, 'Storage types must be concrete');
    let trace = __WEBPACK_IMPORTED_MODULE_1__tracelib_trace_js__["a" /* Tracing */].start({cat: 'handle', name: 'StorageProviderBase::constructor', args: {type: type.key, name: name}});
    this._type = type;
    this._arcId = arcId;
    this._listeners = new Map();
    this.name = name;
    this._version = 0;
    this.id = id;
    this.source = null;
    this._storageKey = key;
    this._nextLocalID = 0;
    trace.end();
  }

  get storageKey() {
    return this._storageKey;
  }

  generateID() {
    return `${this.id}:${this._nextLocalID++}`;
  }

  generateIDComponents() {
    return {base: this.id, component: () => this._nextLocalID++};
  }

  get type() {
    return this._type;
  }
  // TODO: add 'once' which returns a promise.
  on(kind, callback, target) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(target !== undefined, 'must provide a target to register a storage event handler');
    let listeners = this._listeners.get(kind) || new Map();
    listeners.set(callback, {target});
    this._listeners.set(kind, listeners);
  }

  async _fire(kind, details) {
    let listenerMap = this._listeners.get(kind);
    if (!listenerMap || listenerMap.size == 0)
      return;

    let trace = __WEBPACK_IMPORTED_MODULE_1__tracelib_trace_js__["a" /* Tracing */].start({cat: 'handle', name: 'StorageProviderBase::_fire', args: {kind, type: this._type.key,
        name: this.name, listeners: listenerMap.size}});

    let callbacks = [];
    for (let [callback] of listenerMap.entries()) {
      callbacks.push(callback);
    }
    // Yield so that event firing is not re-entrant with mutation.
    await trace.wait(0);
    for (let callback of callbacks) {
      callback(details);
    }
    trace.end();
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_2__recipe_util_js__["b" /* compareStrings */](this.name, other.name)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_2__recipe_util_js__["d" /* compareNumbers */](this._version, other._version)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_2__recipe_util_js__["b" /* compareStrings */](this.source, other.source)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_2__recipe_util_js__["b" /* compareStrings */](this.id, other.id)) != 0) return cmp;
    return 0;
  }

  toString(handleTags) {
    let results = [];
    let handleStr = [];
    handleStr.push(`store`);
    if (this.name) {
      handleStr.push(`${this.name}`);
    }
    handleStr.push(`of ${this.type.toString()}`);
    if (this.id) {
      handleStr.push(`'${this.id}'`);
    }
    if (handleTags && handleTags.length) {
      handleStr.push(`${[...handleTags].join(' ')}`);
    }
    if (this.source) {
      handleStr.push(`in '${this.source}'`);
    }
    results.push(handleStr.join(' '));
    if (this.description)
      results.push(`  description \`${this.description}\``);
    return results.join('\n');
  }

  get apiChannelMappingId() {
    return this.id;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = StorageProviderBase;



/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__in_memory_storage_js__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__firebase_storage_js__ = __webpack_require__(105);
// @
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class StorageProviderFactory {
  constructor(arcId) {
    this._arcId = arcId;
    this._storageInstances = {'in-memory': new __WEBPACK_IMPORTED_MODULE_0__in_memory_storage_js__["a" /* InMemoryStorage */](arcId), 'firebase': new __WEBPACK_IMPORTED_MODULE_1__firebase_storage_js__["a" /* FirebaseStorage */](arcId)};
  }

  _storageForKey(key) {
    let protocol = key.split(':')[0];
    return this._storageInstances[protocol];
  }

  async construct(id, type, keyFragment) {
    return this._storageForKey(keyFragment).construct(id, type, keyFragment);
  }

  async connect(id, type, key) {
    return this._storageForKey(key).connect(id, type, key);
  }

  parseStringAsKey(string) {
    return this._storageForKey(string).parseStringAsKey(string);
  }

  newKey(id, associatedKeyFragment) {

  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = StorageProviderFactory;



/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handle_mapper_base_js__ = __webpack_require__(27);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



class AssignHandlesByTagAndType extends __WEBPACK_IMPORTED_MODULE_0__handle_mapper_base_js__["a" /* HandleMapperBase */] {
  constructor(arc) {
    super();
    this.arc = arc;
    this.fate = 'use';
  }

  getMappableHandles(type, tags, counts) {
    // We can use a handle that has a subtype only when all of the connections
    // are inputs.
    let subtype = counts.out == 0;
    if (tags.length > 0) {
      return this.arc.findStoresByType(type, {tags, subtype});
    } else {
      return this.arc.findStoresByType(type);
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AssignHandlesByTagAndType;



/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handle_mapper_base_js__ = __webpack_require__(27);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



class AssignRemoteHandles extends __WEBPACK_IMPORTED_MODULE_0__handle_mapper_base_js__["a" /* HandleMapperBase */] {
  constructor(arc) {
    super();
    this._arc = arc;
    this.fate = 'map';
  }

  getMappableHandles(type, tags=[]) {
    return this._arc.context.findStoreByType(type, {tags, subtype: true});
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AssignRemoteHandles;



/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handle_mapper_base_js__ = __webpack_require__(27);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



class CopyRemoteHandles extends __WEBPACK_IMPORTED_MODULE_0__handle_mapper_base_js__["a" /* HandleMapperBase */] {
  constructor(arc) {
    super();
    this._arc = arc;
    this.fate = 'copy';
  }

  getMappableHandles(type, tags=[]) {
    return this._arc.context.findStoreByType(type, {tags, subtype: true});
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CopyRemoteHandles;



/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class CreateDescriptionHandle extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onHandleConnection(recipe, handleConnection) {
        if (handleConnection.handle)
          return;
        if (handleConnection.name != 'descriptions')
          return;

        return (recipe, handleConnection) => {
          let handle = recipe.newHandle();
          handle.fate = 'create';
          handleConnection.connectToHandle(handle);
          return 1;
        };
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CreateDescriptionHandle;



/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_handle_js__ = __webpack_require__(12);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class CreateHandleGroup extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {

  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onRecipe(recipe) {
        // Resolve constraints before assuming connections are free.
        if (recipe.connectionConstraints.length > 0) return;

        const freeConnections = recipe.handleConnections.filter(hc => !hc.handle && !hc.isOptional);
        let maximalGroup = null;
        for (let writer of freeConnections.filter(hc => hc.isOutput)) {
          let compatibleConnections = [writer];
          let effectiveType = __WEBPACK_IMPORTED_MODULE_3__recipe_handle_js__["a" /* Handle */].effectiveType(null, compatibleConnections);
          let typeCandidate = null;
          let involvedParticles = new Set([writer.particle]);

          let foundSomeReader = false;
          for (let reader of freeConnections.filter(hc => hc.isInput)) {
            if (!involvedParticles.has(reader.particle) &&
                (typeCandidate = __WEBPACK_IMPORTED_MODULE_3__recipe_handle_js__["a" /* Handle */].effectiveType(effectiveType, [reader])) !== null) {
              compatibleConnections.push(reader);
              involvedParticles.add(reader.particle);
              effectiveType = typeCandidate;
              foundSomeReader = true;
            }
          }

          // Only make a 'create' group for a writer->reader case.
          if (!foundSomeReader) continue;

          for (let otherWriter of freeConnections.filter(hc => hc.isOutput)) {
            if (!involvedParticles.has(otherWriter.particle) &&
                (typeCandidate = __WEBPACK_IMPORTED_MODULE_3__recipe_handle_js__["a" /* Handle */].effectiveType(effectiveType, [otherWriter])) !== null) {
              compatibleConnections.push(otherWriter);
              involvedParticles.add(otherWriter.particle);
              effectiveType = typeCandidate;
            }
          }

          if (!maximalGroup || compatibleConnections.length > maximalGroup.length) {
            maximalGroup = compatibleConnections;
          }
        }

        if (maximalGroup) return recipe => {
          let newHandle = recipe.newHandle();
          newHandle.fate = 'create';
          for (let conn of maximalGroup) {
            let cloneConn = recipe.updateToClone({conn}).conn;
            cloneConn.connectToHandle(newHandle);
          }
        };
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Independent), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CreateHandleGroup;



/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class CreateHandles extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  // TODO: move generation to use an async generator.
  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */] {
      onHandle(recipe, handle) {
        let counts = __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_util_js__["a" /* RecipeUtil */].directionCounts(handle);

        // Don't make a 'create' handle, unless there is someone reading,
        // someone writing and at least 2 particles invloved.
        if (counts.in == 0 || counts.out == 0
            || new Set(handle.connections.map(hc => hc.particle)).size <= 1) {
          return;
        }

        if (!handle.id && handle.fate == '?') {
          return (recipe, handle) => {handle.fate = 'create'; return 1;};
        }
      }
    }(__WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CreateHandles;



/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__ = __webpack_require__(3);

// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class FallbackFate extends __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__["b" /* Strategy */] {
  getResults(inputParams) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(inputParams);
    let generated = inputParams.generated.filter(result => !result.result.isResolved());
    let terminal = inputParams.terminal;
    return [...generated, ...terminal];
  }

  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */] {
      onHandle(recipe, handle) {
        // Only apply this strategy only to user query based recipes with resolved tokens.
        if (!recipe.search || (recipe.search.resolvedTokens.length == 0)) {
          return;
        }

        // Only apply to handles whose fate is set, but wasn't explicitly defined in the recipe.
        if (handle.isResolved() || handle.fate == '?' || handle.originalFate != '?') {
          return;
        }

        let hasOutConns = handle.connections.some(hc => hc.isOutput);
        let newFate = hasOutConns ? 'copy' : 'map';
        if (handle.fate == newFate) {
          return;
        }

        return (recipe, clonedHandle) => {
          clonedHandle.fate = newFate;
          return 0;
        };
      }
    }(__WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = FallbackFate;



/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class GroupHandleConnections extends __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor() {
    super();

    this._walker = new class extends __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */] {
      onRecipe(recipe) {
        // Only apply this strategy if ALL handle connections are named and have types.
        if (recipe.handleConnections.find(hc => !hc.type || !hc.name || hc.isOptional)) {
          return;
        }
        // Find all unique types used in the recipe that have unbound handle connections.
        let types = new Set();
        recipe.handleConnections.forEach(hc => {
          if (!hc.isOptional && !hc.handle && !Array.from(types).find(t => t.equals(hc.type))) {
            types.add(hc.type);
          }
        });

        let groupsByType = new Map();
        types.forEach(type => {
          // Find the particle with the largest number of unbound connections of the same type.
          let countConnectionsByType = (connections) => Object.values(connections).filter(conn => {
            return !conn.isOptional && !conn.handle && type.equals(conn.type);
          }).length;
          let sortedParticles = [...recipe.particles].sort((p1, p2) => {
            return countConnectionsByType(p2.connections) - countConnectionsByType(p1.connections);
          }).filter(p => countConnectionsByType(p.connections) > 0);
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(sortedParticles.length > 0);

          // Handle connections of the same particle cannot be bound to the same handle. Iterate on handle connections of the particle
          // with the most connections of the given type, and group each of them with same typed handle connections of other particles.
          let particleWithMostConnectionsOfType = sortedParticles[0];
          let groups = new Map();
          let allTypeHandleConnections = recipe.handleConnections.filter(c => {
            return !c.isOptional && !c.handle && type.equals(c.type) && (c.particle != particleWithMostConnectionsOfType);
          });

          let iteration = 0;
          while (allTypeHandleConnections.length > 0) {
            Object.values(particleWithMostConnectionsOfType.connections).forEach(handleConnection => {
              if (!type.equals(handleConnection.type)) {
                return;
              }
              if (!groups.has(handleConnection)) {
                groups.set(handleConnection, []);
              }
              let group = groups.get(handleConnection);

              // filter all connections where this particle is already in a group.
              let possibleConnections = allTypeHandleConnections.filter(c => !group.find(gc => gc.particle == c.particle));
              let selectedConn = possibleConnections.find(c => handleConnection.isInput != c.isInput || handleConnection.isOutput != c.isOutput);
              // TODO: consider tags.
              // TODO: Slots handle restrictions should also be accounted for when grouping.
              if (!selectedConn) {
                if (possibleConnections.length == 0 || iteration == 0) {
                  // During first iteration only bind opposite direction connections ("in" with "out" and vice versa)
                  // to ensure each group has both direction connections as much as possible.
                  return;
                }
                selectedConn = possibleConnections[0];
              }
              group.push(selectedConn);
              allTypeHandleConnections = allTypeHandleConnections.filter(c => c != selectedConn);
            });
            iteration++;
          }
          // Remove groups where no connections were bound together.
          groups.forEach((otherConns, conn) => {
            if (otherConns.length == 0) {
              groups.delete(conn);
            } else {
              otherConns.push(conn);
            }
          });

          if (groups.size !== 0) {
            groupsByType.set(type, groups);
          }
        });

        if (groupsByType.size > 0) return recipe => {
          groupsByType.forEach((groups, type) => {
            groups.forEach(group => {
              let recipeHandle = recipe.newHandle();
              group.forEach(conn => {
                let cloneConn = recipe.updateToClone({conn}).conn;
                cloneConn.connectToHandle(recipeHandle);
              });
            });
          });
          // TODO: score!
        };
      }
    }(__WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */].Permuted);
  }
  get walker() {
    return this._walker;
  }
  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), this.walker, this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = GroupHandleConnections;



/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




class InitPopulation extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc, {contextual = false}) {
    super();
    this._arc = arc;
    this._contextual = contextual;
    this._loadedParticles = new Set(this._arc.loadedParticles().map(spec => spec.implFile));
  }

  async generate({generation}) {
    if (generation != 0) {
      return [];
    }

    await this._arc.recipeIndex.ready;
    const results = this._contextual
        ? this._contextualResults()
        : this._allResults();

    return results.map(({recipe, score = 1}) => ({
      result: recipe,
      score,
      derivation: [{strategy: this, parent: undefined}],
      hash: recipe.digest(),
      valid: Object.isFrozen(recipe)
    }));
  }

  _contextualResults() {
    let results = [];
    for (let slot of this._arc.activeRecipe.slots.filter(s => s.sourceConnection)) {
      results.push(...this._arc.recipeIndex.findConsumeSlotConnectionMatch(slot).map(
          ({slotConn}) => ({recipe: slotConn.recipe})));
    }
    for (let handle of this._arc.activeRecipe.handles) {
      results.push(...this._arc.recipeIndex.findHandleMatch(handle, ['use', '?']).map(
          otherHandle => ({recipe: otherHandle.recipe})));
    }
    return results;
  }

  _allResults() {
    return this._arc.recipeIndex.recipes.map(recipe => ({
      recipe,
      score: 1 - recipe.particles.filter(
          particle => particle.spec && this._loadedParticles.has(particle.spec.implFile)).length
    }));
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = InitPopulation;



/***/ }),
/* 58 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class MatchParticleByVerb extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();
    this._arc = arc;
  }

  async generate(inputParams) {
    let arc = this._arc;
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onParticle(recipe, particle) {
        if (particle.name) {
          // Particle already has explicit name.
          return;
        }

        let particleSpecs = arc.context.findParticlesByVerb(particle.primaryVerb)
            .filter(spec => !arc.pec.slotComposer || spec.matchAffordance(arc.pec.slotComposer.affordance));

        return particleSpecs.map(spec => {
          return (recipe, particle) => {
            let score = 1;

            particle.name = spec.name;
            particle.spec = spec;

            return score;
          };
        });
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MatchParticleByVerb;



/***/ }),
/* 59 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_handle_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt







// This strategy substitutes '&verb' declarations with recipes,
// according to the following conditions:
// 1) the recipe is named by the verb described in the particle
// 2) the recipe has the slot pattern (if any) owned by the particle
//
// The strategy also reconnects any slots that were connected to the
// particle, so that the substituted recipe fully takes the particle's place.
//
// Note that the recipe may have the slot pattern multiple times over, but
// this strategy currently only connects the first instance of the pattern up
// if there are multiple instances.
class MatchRecipeByVerb extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();
    this._arc = arc;
  }

  async generate(inputParams) {
    let arc = this._arc;
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onParticle(recipe, particle) {
        if (particle.name) {
          // Particle already has explicit name.
          return;
        }

        let recipes = arc.context.findRecipesByVerb(particle.primaryVerb);

        // Extract slot information from recipe. This is extracted in the form:
        // {consume-slot-name: targetSlot: <slot>, providedSlots: {provide-slot-name: <slot>}}
        //
        // Note that slots are only included if connected to other components of the recipe - e.g.
        // the target slot has a source connection.
        let slotConstraints = {};
        for (let consumeSlot of Object.values(particle.consumedSlotConnections)) {
          let targetSlot = consumeSlot.targetSlot && consumeSlot.targetSlot.sourceConnection ? consumeSlot.targetSlot : null;
          slotConstraints[consumeSlot.name] = {targetSlot, providedSlots: {}};
          for (let providedSlot of Object.keys(consumeSlot.providedSlots)) {
            let sourceSlot = consumeSlot.providedSlots[providedSlot].consumeConnections.length > 0 ? consumeSlot.providedSlots[providedSlot] : null;
            slotConstraints[consumeSlot.name].providedSlots[providedSlot] = sourceSlot;
          }
        }

        let handleConstraints = {named: {}, unnamed: []};
        for (let handleConnection of Object.values(particle.connections)) {
          handleConstraints.named[handleConnection.name] = {direction: handleConnection.direction, handle: handleConnection.handle};
        }
        for (let unnamedConnection of particle.unnamedConnections) {
          handleConstraints.unnamed.push({direction: unnamedConnection.direction, handle: unnamedConnection.handle});
        }

        recipes = recipes.filter(recipe => MatchRecipeByVerb.satisfiesSlotConstraints(recipe, slotConstraints))
                         .filter(recipe => MatchRecipeByVerb.satisfiesHandleConstraints(recipe, handleConstraints));

        return recipes.map(recipe => {
          return (outputRecipe, particleForReplacing) => {
            let {handles, particles, slots} = recipe.mergeInto(outputRecipe);

            particleForReplacing.remove();


            for (let consumeSlot in slotConstraints) {
              if (slotConstraints[consumeSlot].targetSlot || Object.values(slotConstraints[consumeSlot].providedSlots).filter(a => a != null).length > 0) {
                let slotMapped = false;
                for (let particle of particles) {
                  if (MatchRecipeByVerb.slotsMatchConstraint(particle.consumedSlotConnections, consumeSlot, slotConstraints[consumeSlot].providedSlots)) {
                    if (slotConstraints[consumeSlot].targetSlot) {
                      let {mappedSlot} = outputRecipe.updateToClone({mappedSlot: slotConstraints[consumeSlot].targetSlot});
                      particle.consumedSlotConnections[consumeSlot]._targetSlot = mappedSlot;
                      mappedSlot.consumeConnections.push(particle.consumedSlotConnections[consumeSlot]);
                    }
                    for (let slotName in slotConstraints[consumeSlot].providedSlots) {
                      let slot = slotConstraints[consumeSlot].providedSlots[slotName];
                      if (slot == null)
                        continue;
                      let {mappedSlot} = outputRecipe.updateToClone({mappedSlot: slot});
                      let oldSlot = particle.consumedSlotConnections[consumeSlot].providedSlots[slotName];
                      oldSlot.remove();
                      particle.consumedSlotConnections[consumeSlot].providedSlots[slotName] = mappedSlot;
                      mappedSlot._sourceConnection = particle.consumedSlotConnections[consumeSlot];
                    }
                    slotMapped = true;
                    break;
                  }
                }
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__["a" /* assert */])(slotMapped);
              }
            }

            function tryApplyHandleConstraint(name, connection, constraint, handle) {
              if (connection.handle != null)
                return false;
              if (!MatchRecipeByVerb.connectionMatchesConstraint(connection, constraint))
                return false;
              for (let i = 0; i < handle.connections.length; i++) {
                let candidate = handle.connections[i];
                if (candidate.particle == particleForReplacing && candidate.name == name) {
                  connection._handle = handle;
                  handle.connections[i] = connection;
                  return true;
                }
              }
              return false;
            }

            function applyHandleConstraint(name, constraint, handle) {
              let {mappedHandle} = outputRecipe.updateToClone({mappedHandle: handle});
              for (let particle of particles) {
                if (name) {
                  if (tryApplyHandleConstraint(name, particle.connections[name], constraint, mappedHandle))
                    return true;
                } else {
                  for (let connection of Object.values(particle.connections)) {
                    if (tryApplyHandleConstraint(name, connection, constraint, mappedHandle))
                      return true;
                  }
                }
              }
              return false;
            }

            for (let name in handleConstraints.named) {
              if (handleConstraints.named[name].handle)
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__["a" /* assert */])(applyHandleConstraint(name, handleConstraints.named[name], handleConstraints.named[name].handle));
            }

            for (let connection of handleConstraints.unnamed) {
              if (connection.handle)
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__["a" /* assert */])(applyHandleConstraint(null, connection, connection.handle));
            }

            return 1;
          };
        });
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }

  static satisfiesHandleConstraints(recipe, handleConstraints) {
    for (let handleName in handleConstraints.named)
      if (!MatchRecipeByVerb.satisfiesHandleConnection(recipe, handleName, handleConstraints.named[handleName]))
        return false;
    for (let handleData of handleConstraints.unnamed) {
      if (!MatchRecipeByVerb.satisfiesUnnamedHandleConnection(recipe, handleData))
        return false;
    }
    return true;
  }

  static satisfiesUnnamedHandleConnection(recipe, handleData) {
    // refuse to match unnamed handle connections unless some type information is present.
    if (!handleData.handle)
      return false;
    for (let particle of recipe.particles) {
      for (let connection of Object.values(particle.connections)) {
        if (MatchRecipeByVerb.connectionMatchesConstraint(connection, handleData))
          return true;
      }
    }
    return false;
  }

  static satisfiesHandleConnection(recipe, handleName, handleData) {
    for (let particle of recipe.particles) {
      if (particle.connections[handleName]) {
        if (MatchRecipeByVerb.connectionMatchesConstraint(particle.connections[handleName], handleData))
          return true;
      }
    }
    return false;
  }

  static connectionMatchesConstraint(connection, handleData) {
    if (connection.direction !== handleData.direction)
      return false;
    if (!handleData.handle)
      return true;
    return __WEBPACK_IMPORTED_MODULE_3__recipe_handle_js__["a" /* Handle */].effectiveType(handleData.handle._mappedType, handleData.handle.connections.concat(connection)) != null;
  }

  static satisfiesSlotConstraints(recipe, slotConstraints) {
    for (let slotName in slotConstraints)
      if (!MatchRecipeByVerb.satisfiesSlotConnection(recipe, slotName, slotConstraints[slotName]))
        return false;
    return true;
  }

  static satisfiesSlotConnection(recipe, slotName, constraints) {
    for (let particle of recipe.particles) {
      if (MatchRecipeByVerb.slotsMatchConstraint(particle.consumedSlotConnections, slotName, constraints))
        return true;
    }
    return false;
  }

  static slotsMatchConstraint(connections, name, constraints) {
    if (connections[name] == null)
      return false;
    if (connections[name]._targetSlot != null && constraints.targetSlot != null)
      return false;
    for (let provideName in constraints.providedSlots)
      if (connections[name].providedSlots[provideName] == null)
        return false;
    return true;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MatchRecipeByVerb;



/***/ }),
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__convert_constraints_to_connections_js__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__assign_remote_handles_js__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__copy_remote_handles_js__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__assign_handles_by_tag_and_type_js__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__init_population_js__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__map_slots_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__match_particle_by_verb_js__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__match_recipe_by_verb_js__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__add_use_handles_js__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__create_description_handle_js__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__init_search_js__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__search_tokens_to_particles_js__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__fallback_fate_js__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__group_handle_connections_js__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__match_free_handles_to_connections_js__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__create_handles_js__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__resolve_recipe_js__ = __webpack_require__(14);
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




















const Empty = new __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["c" /* Ruleset */].Builder().build();
/* harmony export (immutable) */ __webpack_exports__["a"] = Empty;


const ExperimentalPhased = new __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["c" /* Ruleset */].Builder().order(
  [
    __WEBPACK_IMPORTED_MODULE_5__init_population_js__["a" /* InitPopulation */],
    __WEBPACK_IMPORTED_MODULE_11__init_search_js__["a" /* InitSearch */]
  ],
  __WEBPACK_IMPORTED_MODULE_12__search_tokens_to_particles_js__["a" /* SearchTokensToParticles */],
  [
    __WEBPACK_IMPORTED_MODULE_8__match_recipe_by_verb_js__["a" /* MatchRecipeByVerb */],
    __WEBPACK_IMPORTED_MODULE_7__match_particle_by_verb_js__["a" /* MatchParticleByVerb */]
  ],
  __WEBPACK_IMPORTED_MODULE_1__convert_constraints_to_connections_js__["a" /* ConvertConstraintsToConnections */],
  __WEBPACK_IMPORTED_MODULE_14__group_handle_connections_js__["a" /* GroupHandleConnections */],
  [
    __WEBPACK_IMPORTED_MODULE_16__create_handles_js__["a" /* CreateHandles */],
    __WEBPACK_IMPORTED_MODULE_9__add_use_handles_js__["a" /* AddUseHandles */],
    __WEBPACK_IMPORTED_MODULE_2__assign_remote_handles_js__["a" /* AssignRemoteHandles */],
    __WEBPACK_IMPORTED_MODULE_3__copy_remote_handles_js__["a" /* CopyRemoteHandles */],
    __WEBPACK_IMPORTED_MODULE_4__assign_handles_by_tag_and_type_js__["a" /* AssignHandlesByTagAndType */],
    __WEBPACK_IMPORTED_MODULE_15__match_free_handles_to_connections_js__["a" /* MatchFreeHandlesToConnections */],
    __WEBPACK_IMPORTED_MODULE_13__fallback_fate_js__["a" /* FallbackFate */],
  ],
  __WEBPACK_IMPORTED_MODULE_6__map_slots_js__["a" /* MapSlots */],
  __WEBPACK_IMPORTED_MODULE_10__create_description_handle_js__["a" /* CreateDescriptionHandle */],
  __WEBPACK_IMPORTED_MODULE_17__resolve_recipe_js__["a" /* ResolveRecipe */]
).build();
/* unused harmony export ExperimentalPhased */


const ExperimentalLinear = new __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["c" /* Ruleset */].Builder().order(
  __WEBPACK_IMPORTED_MODULE_5__init_population_js__["a" /* InitPopulation */],
  __WEBPACK_IMPORTED_MODULE_11__init_search_js__["a" /* InitSearch */],
  __WEBPACK_IMPORTED_MODULE_12__search_tokens_to_particles_js__["a" /* SearchTokensToParticles */],
  __WEBPACK_IMPORTED_MODULE_8__match_recipe_by_verb_js__["a" /* MatchRecipeByVerb */],
  __WEBPACK_IMPORTED_MODULE_7__match_particle_by_verb_js__["a" /* MatchParticleByVerb */],
  __WEBPACK_IMPORTED_MODULE_1__convert_constraints_to_connections_js__["a" /* ConvertConstraintsToConnections */],
  __WEBPACK_IMPORTED_MODULE_14__group_handle_connections_js__["a" /* GroupHandleConnections */],
  __WEBPACK_IMPORTED_MODULE_15__match_free_handles_to_connections_js__["a" /* MatchFreeHandlesToConnections */],
  __WEBPACK_IMPORTED_MODULE_16__create_handles_js__["a" /* CreateHandles */],
  __WEBPACK_IMPORTED_MODULE_9__add_use_handles_js__["a" /* AddUseHandles */],
  __WEBPACK_IMPORTED_MODULE_13__fallback_fate_js__["a" /* FallbackFate */],
  __WEBPACK_IMPORTED_MODULE_2__assign_remote_handles_js__["a" /* AssignRemoteHandles */],
  __WEBPACK_IMPORTED_MODULE_3__copy_remote_handles_js__["a" /* CopyRemoteHandles */],
  __WEBPACK_IMPORTED_MODULE_4__assign_handles_by_tag_and_type_js__["a" /* AssignHandlesByTagAndType */],
  __WEBPACK_IMPORTED_MODULE_6__map_slots_js__["a" /* MapSlots */],
  __WEBPACK_IMPORTED_MODULE_10__create_description_handle_js__["a" /* CreateDescriptionHandle */],
  __WEBPACK_IMPORTED_MODULE_17__resolve_recipe_js__["a" /* ResolveRecipe */]
).build();
/* unused harmony export ExperimentalLinear */



/***/ }),
/* 61 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class SearchTokensToParticles extends __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();

    let thingByToken = {};
    let thingByPhrase = {};
    for (let [thing, packaged] of [...arc.context.particles.map(p => [p, {spec: p}]),
                                   ...arc.context.recipes.map(r => [r, {innerRecipe: r}])]) {
      this._addThing(thing.name, packaged, thingByToken, thingByPhrase);
      thing.verbs.forEach(verb => this._addThing(verb, packaged, thingByToken, thingByPhrase));
    }

    class SearchWalker extends __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */] {
      onRecipe(recipe) {
        if (!recipe.search || !recipe.search.unresolvedTokens.length) {
          return;
        }

        let byToken = {};
        let resolvedTokens = new Set();
        let _addThingsByToken = (token, things) => {
          things.forEach(thing => {
            byToken[token] = byToken[token] || [];
            byToken[token].push(thing);
            token.split(' ').forEach(t => resolvedTokens.add(t));
          });
        };

        for (let [phrase, things] of Object.entries(thingByPhrase)) {
          let tokens = phrase.split(' ');
          if (tokens.every(token => recipe.search.unresolvedTokens.find(unresolved => unresolved == token)) &&
              recipe.search.phrase.includes(phrase)) {
            _addThingsByToken(phrase, things);
          }
        }

        for (let token of recipe.search.unresolvedTokens) {
          if (resolvedTokens.has(token)) {
            continue;
          }
          let things = thingByToken[token];
          things && _addThingsByToken(token, things);
        }

        if (resolvedTokens.size == 0) {
          return;
        }

        const flatten = (arr) => [].concat(...arr);
        const product = (...sets) =>
          sets.reduce((acc, set) =>
            flatten(acc.map(x => set.map(y => [...x, y]))),
            [[]]);
        let possibleCombinations = product(...Object.values(byToken).map(v => flatten(v)));

        return possibleCombinations.map(combination => {
          return recipe => {
            resolvedTokens.forEach(token => recipe.search.resolveToken(token));
            combination.forEach(({spec, innerRecipe}) => {
              if (spec) {
                let particle = recipe.newParticle(spec.name);
                particle.spec = spec;
              } else {
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(innerRecipe);
                innerRecipe.mergeInto(recipe);
              }
            });
            return resolvedTokens.size;
          };
        });
      }
    }
    this._walker = new SearchWalker(__WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */].Permuted);
  }

  get walker() {
    return this._walker;
  }

  getResults(inputParams) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(inputParams);
    let generated = super.getResults(inputParams).filter(result => !result.result.isResolved());
    let terminal = inputParams.terminal;
    return [...generated, ...terminal];
  }

  _addThing(token, thing, thingByToken, thingByPhrase) {
    if (!token) {
      return;
    }
    this._addThingByToken(token.toLowerCase(), thing, thingByToken);

    // split DoSomething into "do something" and add the phrase
    let phrase = token.replace(/([^A-Z])([A-Z])/g, '$1 $2').replace(/([A-Z][^A-Z])/g, ' $1').replace(/[\s]+/g, ' ').trim();
    if (phrase != token) {
      this._addThingByToken(phrase.toLowerCase(), thing, thingByPhrase);
    }
  }
  _addThingByToken(key, thing, thingByKey) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(key == key.toLowerCase());
    thingByKey[key] = thingByKey[key] || [];
    if (!thingByKey[key].find(t => t == thing)) {
      thingByKey[key].push(thing);
    }
  }

  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), this.walker, this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SearchTokensToParticles;



/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt


const Symbols = {identifier: Symbol('id')};
/* harmony export (immutable) */ __webpack_exports__["a"] = Symbols;



/***/ }),
/* 63 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__schema_js__ = __webpack_require__(23);
// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class TypeVariable {
  constructor(name, canWriteSuperset, canReadSubset) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(typeof name == 'string');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(canWriteSuperset == null || canWriteSuperset instanceof __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */]);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(canReadSubset == null || canReadSubset instanceof __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */]);
    this.name = name;
    this._canWriteSuperset = canWriteSuperset;
    this._canReadSubset = canReadSubset;
    this._resolution = null;
  }

  // Merge both the read subset (upper bound) and write superset (lower bound) constraints
  // of two variables together. Use this when two separate type variables need to resolve
  // to the same value.
  maybeMergeConstraints(variable) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(variable instanceof TypeVariable);

    if (!this.maybeMergeCanReadSubset(variable.canReadSubset))
      return false;
    return this.maybeMergeCanWriteSuperset(variable.canWriteSuperset);
  }

  // merge a type variable's read subset (upper bound) constraints into this variable.
  // This is used to accumulate read constraints when resolving a handle's type.
  maybeMergeCanReadSubset(constraint) {
    if (constraint == null)
      return true;
    
    if (this.canReadSubset == null) {
      this.canReadSubset = constraint;
      return true;
    }

    let mergedSchema = __WEBPACK_IMPORTED_MODULE_2__schema_js__["a" /* Schema */].intersect(this.canReadSubset.entitySchema, constraint.entitySchema);
    if (!mergedSchema)
      return false;
    
    this.canReadSubset = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].newEntity(mergedSchema);
    return true;
  }

  // merge a type variable's write superset (lower bound) constraints into this variable.
  // This is used to accumulate write constraints when resolving a handle's type.
  maybeMergeCanWriteSuperset(constraint) {
    if (constraint == null)
      return true;

    if (this.canWriteSuperset == null) {
      this.canWriteSuperset = constraint;
      return true;
    }

    let mergedSchema = __WEBPACK_IMPORTED_MODULE_2__schema_js__["a" /* Schema */].union(this.canWriteSuperset.entitySchema, constraint.entitySchema);
    if (!mergedSchema)
      return false;

    this.canWriteSuperset = __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].newEntity(mergedSchema);
    return true;
  }

  isSatisfiedBy(type) {
    let constraint = this._canWriteSuperset;
    if (!constraint) {
      return true;
    }
    if (!constraint.isEntity || !type.isEntity) {
      throw new Error(`constraint checking not implemented for ${this} and ${type}`);
    }
    return type.entitySchema.isMoreSpecificThan(constraint.entitySchema);
  }

  get resolution() {
    if (this._resolution) {
      return this._resolution.resolvedType();
    }
    return null;
  }

  set resolution(value) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(value instanceof __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */]);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(!this._resolution);
    let resolvedValue = value.resolvedType();
    if (resolvedValue.isCollection && resolvedValue.collectionType.isVariable) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(resolvedValue.collectionType.variable != this,
        'variable cannot resolve to collection of itself');
    }

    let probe = value;
    while (probe) {
      if (!probe.isVariable)
        break;
      if (probe.variable == this)
        return;
      probe = probe.variable.resolution;
    }

    this._resolution = value;
    this._canWriteSuperset = null;
    this._canReadSubset = null;
  }

  get canWriteSuperset() {
    if (this._resolution) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(!this._canWriteSuperset);
      if (this._resolution.isVariable) {
        return this._resolution.variable.canWriteSuperset;
      }
      return null;
    }
    return this._canWriteSuperset;
  }

  set canWriteSuperset(value) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(!this._resolution);
    this._canWriteSuperset = value;
  }

  get canReadSubset() {
    if (this._resolution) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(!this._canReadSubset);
      if (this._resolution.isVariable) {
        return this._resolution.variable.canReadSubset;
      }
      return null;
    }
    return this._canReadSubset;
  }

  set canReadSubset(value) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(!this._resolution);
    this._canReadSubset = value;
  }

  canEnsureResolved() {
    if (this._resolution)
      return this._resolution.canEnsureResolved();
    if (this._canWriteSuperset || this._canReadSubset)
      return true;
    return false;
  }

  maybeEnsureResolved() {
    if (this._resolution)
      return this._resolution.maybeEnsureResolved();
    if (this._canWriteSuperset) {
      this._resolution = this._canWriteSuperset;
      return true;
    }
    if (this._canReadSubset) {
      this._resolution = this._canReadSubset;
      return true;
    }
    return false;
  }

  toLiteral() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(this.resolution == null);
    return this.toLiteralIgnoringResolutions();
  }

  toLiteralIgnoringResolutions() {
    return {
      name: this.name,
      canWriteSuperset: this._canWriteSuperset && this._canWriteSuperset.toLiteral(),
      canReadSubset: this._canReadSubset && this._canReadSubset.toLiteral()
    };
  }

  static fromLiteral(data) {
    return new TypeVariable(
        data.name,
        data.canWriteSuperset ? __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].fromLiteral(data.canWriteSuperset) : null,
        data.canReadSubset ? __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].fromLiteral(data.canReadSubset) : null);
  }

  isResolved() {
    return (this._resolution && this._resolution.isResolved());
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = TypeVariable;



/***/ }),
/* 64 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_date_web_js__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__strategies_init_search_js__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__platform_log_web_js__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__planner_js__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__speculator_js__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__suggestion_composer_js__ = __webpack_require__(112);
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt









let defaultTimeoutMs = 5000;

const log = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__platform_log_web_js__["a" /* logFactory */])('Planificator', '#ff0090', 'log');
const error = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__platform_log_web_js__["a" /* logFactory */])('Planificator', '#ff0090', 'error');

class ReplanQueue {
  constructor(planificator, options) {
    this._planificator = planificator;
    this._options = options || {};
    this._options.defaultReplanDelayMs = this._options.defaultReplanDelayMs || 3000;

    this._changes = [];
    this._replanTimer = null;
    this._planificator.registerStateChangedCallback(this._onPlanningStateChanged.bind(this));
  }
  addChange() {
    this._changes.push(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_date_web_js__["a" /* now */])());
    if (this._isReplanningScheduled()) {
      this._postponeReplan();
    } else if (!this._planificator.isPlanning) {
      this._scheduleReplan(this._options.defaultReplanDelayMs);
    }
  }

  _onPlanningStateChanged(isPlanning) {
    if (isPlanning) {
      // Cancel scheduled planning.
      this._cancelReplanIfScheduled();
      this._changes = [];
    } else if (this._changes.length > 0) {
      // Schedule delayed planning.
      let timeNow = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_date_web_js__["a" /* now */])();
      this._changes.forEach((ch, i) => this._changes[i] = timeNow);
      this._scheduleReplan(this._options.defaultReplanDelayMs);
    }
  }
  _isReplanningScheduled() {
    return Boolean(this._replanTimer);
  }
  _scheduleReplan(intervalMs) {
    this._cancelReplanIfScheduled();
    this._replanTimer = setTimeout(() => this._planificator._requestPlanning(), intervalMs);
  }
  _cancelReplanIfScheduled() {
    if (this._isReplanningScheduled()) {
      clearTimeout(this._replanTimer);
      this._replanTimer = null;
    }
  }
  _postponeReplan() {
    if (this._changes.length <= 1) {
      return;
    }
    let now = this._changes[this._changes.length - 1];
    let sincePrevChangeMs = now - this._changes[this._changes.length - 2];
    let sinceFirstChangeMs = now - this._changes[0];
    if (this._canPostponeReplan(sinceFirstChangeMs)) {
      this._cancelReplanIfScheduled();
      let nextReplanDelayMs = this._options.defaultReplanDelayMs;
      if (this._options.maxNoReplanMs) {
        nextReplanDelayMs = Math.min(nextReplanDelayMs, this._options.maxNoReplanMs - sinceFirstChangeMs);
      }
      this._scheduleReplan(nextReplanDelayMs);
    }
  }
  _canPostponeReplan(changesInterval) {
    return !this._options.maxNoReplanMs || changesInterval < this._options.maxNoReplanMs;
  }
}

const defaultOptions = {
  defaultReplanDelayMs: 200,
  maxNoReplanMs: 10000
};

class Planificator {
  constructor(arc, options) {
    this._arc = arc;
    this._speculator = new __WEBPACK_IMPORTED_MODULE_5__speculator_js__["a" /* Speculator */]();
    this._search = null;

    // The currently running Planner object.
    this._planner = null;
    // The latest results of a Planner session. These may become 'current', or be disposed as transient,
    // if a new replanning request came in during the Planner execution.
    this._next = {plans: [], generations: []}; // {plans, generations}
    // The current set plans to be presented to the user (full or subset)
    this._current = {plans: [], generations: []}; // {plans, generations}
    this._suggestFilter = {showAll: false};
    // The previous set of suggestions with the plan that was instantiated - copied over from the `current`
    // set, once suggestion is being accepted. Other sets of generated plans aren't stored.
    this._past = {}; // {plan, plans, generations}

    // Callbacks triggered when the `current` set of plans is being updated.
    this._plansChangedCallbacks = [];
    // Callbacks triggered when the current set of suggestions is being updated.
    this._suggestChangedCallbacks = [];
    // Callbacks triggered when Planificator isPlanning state changes.
    this._stateChangedCallbacks = [];

    // planning state
    this._isPlanning = false; // whether planning is ongoing
    this._valid = false; // whether replanning was requested (since previous planning was complete).

    this._dataChangesQueue = new ReplanQueue(this, options || defaultOptions);

    // Set up all callbacks that trigger re-planning.
    this._init();
  }

  _init() {
    // TODO(mmandlis): Planificator subscribes to various change events.
    // Later, it will evaluate and batch events and trigger replanning intelligently.
    // Currently, just trigger replanning for each event.
    this._arcCallback = this._onPlanInstantiated.bind(this);
    this._arc.registerInstantiatePlanCallback(this._arcCallback);
    this._arc.onDataChange(() => this._onDataChange(), this);

    if (this._arc.pec.slotComposer) {
      let suggestionComposer = new __WEBPACK_IMPORTED_MODULE_6__suggestion_composer_js__["a" /* SuggestionComposer */](this._arc.pec.slotComposer);
      this.registerSuggestChangedCallback((suggestions) => suggestionComposer.setSuggestions(suggestions));
    }
  }

  dispose() {
    // clear all callbacks the planificator has registered.
    this._arc.unregisterInstantiatePlanCallback(this._arcCallback);
    this._arc.clearDataChange(this);
    // clear all planificator's callbacks.
    this._plansChangedCallbacks = [];
    this._suggestChangedCallbacks = [];
    this._stateChangedCallbacks = [];
  }

  get isPlanning() { return this._isPlanning; }
  set isPlanning(isPlanning) {
    if (this._isPlanning != isPlanning) {
      this._isPlanning = isPlanning;
      this._stateChangedCallbacks.forEach(callback => callback(this._isPlanning));
    }
  }
  get suggestFilter() { return this._suggestFilter; }
  set suggestFilter(suggestFilter) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!suggestFilter.showAll || !suggestFilter.search);
    this._suggestFilter = suggestFilter;
  }

  setSearch(search) {
    search = search ? search.toLowerCase().trim() : null;
    search = (search !== '') ? search : null;
    let showAll = search === '*';
    search = showAll ? null : search;
    if (showAll == this.suggestFilter.showAll && search == this.suggestFilter.search) {
      return;
    }

    let previousSuggestions = this.getCurrentSuggestions();
    this.suggestFilter = {showAll, search};
    let suggestions = this.getCurrentSuggestions();

    if (this._plansDiffer(suggestions, previousSuggestions)) {
      this._suggestChangedCallbacks.forEach(callback => callback(suggestions));
    }

    let previousSearch = this._search;
    this._search = search;

    if (!this._current.contextual && (showAll || !search)) {
      // If we already have all results (i.e. not only contextual) and there is
      // no search term there is no need to replan: whatever search was before,
      // it was only affecting suggestions filters.
      return;
    }

    if (previousSearch !== search && !this._current.contextual) {
      // If search changed and we already how all plans (i.e. including
      // non-contextual ones) then it's enough to initialize with InitSearch
      // with a new search phrase.
      this._search = search;
      this._requestPlanning({
        cancelOngoingPlanning: true,
        strategies: [__WEBPACK_IMPORTED_MODULE_2__strategies_init_search_js__["a" /* InitSearch */]].concat(__WEBPACK_IMPORTED_MODULE_4__planner_js__["a" /* Planner */].ResolutionStrategies),
        append: true
      });
    } else if (this._current.contextual) {
      // Else if we're searching but currently only have contextual plans,
      // we need get non-contextual plans as well.
      this._search = search;
      this._requestPlanning({
        cancelOngoingPlanning: true,
        contextual: false
      });
    }
  }

  getLastActivatedPlan() {
    return this._past; // {plan, plans, generations}
  }
  getCurrentPlans() {
    return this._current; // {plans, generations}
  }
  getCurrentSuggestions() {
    let suggestions = this._current.plans.filter(plan => plan.plan.slots.length > 0) || [];
    if (!this.suggestFilter.showAll) {
      if (this.suggestFilter.search) {
        suggestions = suggestions.filter(suggestion => {
          if (suggestion.plan.search && this.suggestFilter.search.includes(suggestion.plan.search.phrase)) {
            return true;
          }
          return suggestion.descriptionText.toLowerCase().includes(this.suggestFilter.search);
        });
      } else {
        suggestions = suggestions.filter(suggestion => {
          let plan = suggestion.plan;
          let usesHandlesFromActiveRecipe = plan.handles.find(handle => {
            // TODO(mmandlis): find a generic way to exlude system handles (eg Theme), either by tagging or
            // by exploring connection directions etc.
            return !!handle.id && this._arc._activeRecipe.handles.find(activeHandle => activeHandle.id == handle.id);
          });
          let usesRemoteNonRootSlots = plan.slots.find(slot => {
            return !slot.name.includes('root') && !slot.tags.includes('root') && slot.id && !slot.id.includes('root');
          });
          let onlyUsesNonRootSlots = !plan.slots.find(s => s.name.includes('root') || s.tags.includes('root'));
          return (usesHandlesFromActiveRecipe && usesRemoteNonRootSlots) || onlyUsesNonRootSlots;
        });
      }
    }
    return suggestions || [];
  }

  registerPlansChangedCallback(callback) {
    this._plansChangedCallbacks.push(callback);
  }
  registerSuggestChangedCallback(callback) {
    this._suggestChangedCallbacks.push(callback);
  }
  registerStateChangedCallback(callback) {
    this._stateChangedCallbacks.push(callback);
  }

  _onPlanInstantiated(plan) {
    let planString = plan.toString();
    // Check that plan is in this._current.plans
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._current.plans.some(currentPlan => currentPlan.plan.toString() == planString),
           `The instantiated plan (${plan.toString()}) doesn't appear in the current plans.`);

    // Move current to past, and clear current;
    this._past = {plan, plans: this._current.plans, generations: this._current.generations};
    this._setCurrent({plans: [], generations: [], contextual: true});
    this._requestPlanning({cancelOngoingPlanning: true, contextual: this._shouldRequestContextualPlanning()});
  }


  _onDataChange() {
    this._dataChangesQueue.addChange();
  }

  _requestPlanning(options) {
    options = options || {
      contextual: this._shouldRequestContextualPlanning()
    };
    if (options.cancelOngoingPlanning && this.isPlanning) {
      this._cancelPlanning();
    }

    // Activate replanning and trigger subscribed callbacks.
    return this._schedulePlanning(options);
  }

  async _schedulePlanning(options) {
    this._valid = false;
    if (!this.isPlanning) {
      this.isPlanning = true;
      this._next = {generations: [], contextual: options.contextual};

      await this._runPlanning(options);

      this.isPlanning = false;
      this._setCurrent(Object.assign({}, this._next), options.append || false);
    }
  }

  async _runPlanning(options) {
    let time = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_date_web_js__["a" /* now */])();
    while (!this._valid) {
      this._valid = true;
      await this._doNextPlans({
        strategies: options.strategies,
        timeout: options.timeout,
        strategyArgs: {
          search: this._search,
          contextual: options.contextual
        }
      });
    }
    time = ((__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_date_web_js__["a" /* now */])() - time) / 1000).toFixed(2);
    log(`Produced plans [count=${this._next.plans.length}, elapsed=${time}s].`);
  }

  _cancelPlanning() {
    if (this._planner) {
      this._planner.dispose();
      this._planner = null;
    }
    this._next = {plans: [], generations: []};
    this.isPlanning = false; // using the setter method to trigger callbacks.
    this._valid = true;
    log(`Cancel planning`);
  }

  _plansDiffer(newPlans, oldPlans) {
    if (!newPlans) {
      // Ignore change, if new plans were removed by subsequent replanning (avoids race condition).
      return;
    }

    return !oldPlans ||
        oldPlans.length !== newPlans.length ||
        oldPlans.some(oldPlan => !newPlans.find(newPlan => newPlan.hash === oldPlan.hash && newPlan.descriptionText === oldPlan.descriptionText));
  }

  async _doNextPlans({strategies, strategyArgs, timeout = defaultTimeoutMs}) {
    this._planner = new __WEBPACK_IMPORTED_MODULE_4__planner_js__["a" /* Planner */]();
    this._planner.init(this._arc, {strategies, strategyArgs});
    this._next.plans = await this._planner.suggest(timeout, this._next.generations, this._speculator);
    this._planner = null;
  }

  _setCurrent(current, append) {
    let hasChange = false;
    let newPlans = [];
    if (append) {
      newPlans = current.plans.filter(newPlan => !this._current.plans.find(currentPlan => currentPlan.hash == newPlan.hash));
      hasChange = newPlans.length > 0;
    } else {
      hasChange = this._plansDiffer(current.plans, this._current.plans);
    }

    if (hasChange) {
      let previousSuggestions = this.getCurrentSuggestions();
      if (append) {
        this._current.plans.push(...newPlans);
        this._current.generations.push(...current.generations);
      } else {
        this._current = current;
      }
      this._plansChangedCallbacks.forEach(callback => callback(this._current));
      let suggestions = this.getCurrentSuggestions();
      if (this._plansDiffer(suggestions, previousSuggestions)) {
        this._suggestChangedCallbacks.forEach(callback => callback(suggestions));
      }
    } else {
      this._current.contextual = current.contextual;
    }
  }

  _shouldRequestContextualPlanning() {
    // If user is searching, request broad, non-contextual planning.
    if (this._suggestFilter.showAll || this._suggestFilter.search) return false;

    return this._isArcPopulated();
  }

  _isArcPopulated() {
    if (this._arc.recipes.length == 0) return false;
    if (this._arc.recipes.length == 1) {
      let [recipe] = this._arc.recipes;
      if (recipe.particles.length == 0 ||
          (recipe.particles.length == 1 && recipe.particles[0].name === 'Launcher')) {
        // TODO: Check for Launcher is hacky, find a better way.
        return false;
      }
    }
    return true;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Planificator;



/***/ }),
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__runtime_loader_js__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__runtime_particle_js__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__runtime_dom_particle_js__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__runtime_multiplexer_dom_particle_js__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__runtime_transformation_dom_particle_js__ = __webpack_require__(30);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */







const logFactory = (preamble, color, log='log') => console[log].bind(console, `%c${preamble} [Particle]`, `background: ${color}; color: white; padding: 1px 6px 2px 7px; border-radius: 4px;`);
const html = (strings, ...values) => (strings[0] + values.map((v, i) => v + strings[i + 1]).join('')).trim();

const dumbCache = {};

class BrowserLoader extends __WEBPACK_IMPORTED_MODULE_0__runtime_loader_js__["a" /* Loader */] {
  constructor(urlMap) {
    super();
    this._urlMap = urlMap;
  }
  _loadURL(url) {
    // use URL to normalize the path for deduping
    const cacheKey = new URL(url, document.URL).href;
    const resource = dumbCache[cacheKey];
    return resource || (dumbCache[cacheKey] = super._loadURL(url));
  }
  _resolve(path) {
    //return new URL(path, this._base).href;
    let url = this._urlMap[path];
    if (!url && path) {
      // TODO(sjmiles): inefficient!
      let macro = Object.keys(this._urlMap).sort((a, b) => b.length - a.length).find(k => path.slice(0, k.length) == k);
      if (macro) {
        url = this._urlMap[macro] + path.slice(macro.length);
      }
    }
    url = url || path;
    //console.log(`browser-loader: resolve(${path}) = ${url}`);
    return url;
  }
  loadResource(name) {
    return this._loadURL(this._resolve(name));
  }
  requireParticle(fileName) {
    const path = this._resolve(fileName);
    // inject path to this particle into the UrlMap,
    // allows "foo.js" particle to invoke `importScripts(resolver('foo/othermodule.js'))`
    this.mapParticleUrl(path);
    const result = [];
    self.defineParticle = function(particleWrapper) {
      result.push(particleWrapper);
    };
    importScripts(path);
    delete self.defineParticle;
    const logger = logFactory(fileName.split('/').pop(), '#1faa00');
    return this.unwrapParticle(result[0], logger);
  }
  mapParticleUrl(path) {
    let parts = path.split('/');
    let suffix = parts.pop();
    let folder = parts.join('/');
    let name = suffix.split('.').shift();
    this._urlMap[name] = folder;
  }
  unwrapParticle(particleWrapper, log) {
    // TODO(sjmiles): regarding `resolver`:
    //  _resolve method allows particles to request remapping of assets paths
    //  for use in DOM
    let resolver = this._resolve.bind(this);
    return particleWrapper({
      Particle: __WEBPACK_IMPORTED_MODULE_1__runtime_particle_js__["a" /* Particle */],
      DomParticle: __WEBPACK_IMPORTED_MODULE_2__runtime_dom_particle_js__["a" /* DomParticle */],
      MultiplexerDomParticle: __WEBPACK_IMPORTED_MODULE_3__runtime_multiplexer_dom_particle_js__["a" /* MultiplexerDomParticle */],
      SimpleParticle: __WEBPACK_IMPORTED_MODULE_2__runtime_dom_particle_js__["a" /* DomParticle */],
      TransformationDomParticle: __WEBPACK_IMPORTED_MODULE_4__runtime_transformation_dom_particle_js__["a" /* TransformationDomParticle */],
      resolver,
      log,
      html
    });
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = BrowserLoader;



/***/ }),
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

// Debugging is initialized either by /devtools/src/run-mark-connected.js, which is
// injected by the devtools extension content script in the browser env,
// or used directly when debugging nodeJS.

// Data needs to be referenced via a global object, otherwise extension and
// Arcs have different instances.
let root = typeof window === 'object' ? window : global;

if (!root._arcDebugPromise) {
  root._arcDebugPromise = new Promise(resolve => {
    root._arcDebugPromiseResolve = resolve;
  });
}

class DevtoolsBroker {
  static get onceConnected() {
    return root._arcDebugPromise;
  }
  static markConnected() {
    root._arcDebugPromiseResolve();
    return {preExistingArcs: !!root.arc};
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DevtoolsBroker;


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(34)))

/***/ }),
/* 67 */
/***/ (function(module, exports) {

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


/***/ }),
/* 68 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

// Assume firebase has been loaded. We can't `import` it here as it does not
// support strict mode.
const btoa = window.btoa;
/* harmony export (immutable) */ __webpack_exports__["a"] = btoa;



/***/ }),
/* 69 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

// Provides access to device hardware resource metrics for a web browser.
class DeviceInfo {
  // Returns the number of logical cores.
  static hardwareConcurrency() {
    return navigator.hardwareConcurrency;
  }
  // Returns the device memory in gigabytes.
  static deviceMemory() {
    return navigator.deviceMemory;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DeviceInfo;



/***/ }),
/* 70 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__runtime_debug_abstract_devtools_channel_js__ = __webpack_require__(78);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */




class DevtoolsChannel extends __WEBPACK_IMPORTED_MODULE_0__runtime_debug_abstract_devtools_channel_js__["a" /* AbstractDevtoolsChannel */] {
  constructor() {
    super();
    document.addEventListener('arcs-debug-in', e => this._handleMessage(e.detail));
  }

  _flush(messages) {
    document.dispatchEvent(new CustomEvent('arcs-debug-out', {detail: messages}));
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DevtoolsChannel;



/***/ }),
/* 71 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

// Assume firebase has been loaded. We can't `import` it here as it does not
// support strict mode.
const firebase = window.firebase;
/* harmony export (immutable) */ __webpack_exports__["a"] = firebase;



/***/ }),
/* 72 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

const fs = {};
/* harmony export (immutable) */ __webpack_exports__["a"] = fs;



/***/ }),
/* 73 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return logFactory; });
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

const logFactory = (preamble, color, log='log') => {
  return console[log].bind(console, `%c${preamble}`,
      `background: ${color}; color: white; padding: 1px 6px 2px 7px; border-radius: 6px;`);
};




/***/ }),
/* 74 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

const vm = {};
/* harmony export (immutable) */ __webpack_exports__["a"] = vm;



/***/ }),
/* 75 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = reportSystemException;
/* unused harmony export registerSystemExceptionHandler */
/* unused harmony export removeSystemExceptionHandler */
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

let systemHandlers = [];

function reportSystemException(exception, methodName, particle) {
  for (let handler of systemHandlers)
    handler(exception, methodName, particle);
}

function registerSystemExceptionHandler(handler) {
  if (!systemHandlers.includes(handler))
    systemHandlers.push(handler);
}

function removeSystemExceptionHandler(handler) {
  let idx = systemHandlers.indexOf(handler);
  if (idx > -1)
    systemHandlers.splice(idx, 1);
}


/***/ }),
/* 76 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const parser = /*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */
(function() {
  "use strict";

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
          },

          "class": function(expectation) {
            var escapedParts = "",
                i;

            for (i = 0; i < expectation.parts.length; i++) {
              escapedParts += expectation.parts[i] instanceof Array
                ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                : classEscape(expectation.parts[i]);
            }

            return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
          },

          any: function(expectation) {
            return "any character";
          },

          end: function(expectation) {
            return "end of input";
          },

          other: function(expectation) {
            return expectation.description;
          }
        };

    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }

    function literalEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/"/g,  '\\"')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function classEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/\]/g, '\\]')
        .replace(/\^/g, '\\^')
        .replace(/-/g,  '\\-')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }

    function describeExpected(expected) {
      var descriptions = new Array(expected.length),
          i, j;

      for (i = 0; i < expected.length; i++) {
        descriptions[i] = describeExpectation(expected[i]);
      }

      descriptions.sort();

      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }

      switch (descriptions.length) {
        case 1:
          return descriptions[0];

        case 2:
          return descriptions[0] + " or " + descriptions[1];

        default:
          return descriptions.slice(0, -1).join(", ")
            + ", or "
            + descriptions[descriptions.length - 1];
      }
    }

    function describeFound(found) {
      return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }

    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };

  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};

    var peg$FAILED = {},

        peg$startRuleFunctions = { Manifest: peg$parseManifest },
        peg$startRuleFunction  = peg$parseManifest,

        peg$c0 = function(items) {
            let result = items.map(item => {
              let manifestItem = item[2];
              manifestItem.annotation = optional(item[0], a => a[1], null);
              return manifestItem;
            });
            checkNormal(result);
            return result;
          },
        peg$c1 = "@",
        peg$c2 = peg$literalExpectation("@", false),
        peg$c3 = function(annotation) { return annotation; },
        peg$c4 = "resource",
        peg$c5 = peg$literalExpectation("resource", false),
        peg$c6 = function(name, body) {
          return {
            kind: 'resource',
            name,
            data: body,
            location: location()
          };
        },
        peg$c7 = "start",
        peg$c8 = peg$literalExpectation("start", false),
        peg$c9 = function() { startIndent = indent; },
        peg$c10 = function(lines) {
          return lines.map(line => line[0].substring(startIndent.length) + line[1]).join('');
        },
        peg$c11 = /^[^\n]/,
        peg$c12 = peg$classExpectation(["\n"], true, false),
        peg$c13 = function() { return text(); },
        peg$c14 = "store",
        peg$c15 = peg$literalExpectation("store", false),
        peg$c16 = "of",
        peg$c17 = peg$literalExpectation("of", false),
        peg$c18 = function(name, type, id, version, tags, source, items) {
            items = optional(items, extractIndented, []);
            return {
              kind: 'store',
              location: location(),
              name,
              type,
              id: optional(id, id => id[1], null),
              version: optional(version, version => version[1], null),
              tags: optional(tags, tags => tags[1], null),
              source: source.source,
              origin: source.origin,
              description: items.length > 0 ? items[0][2] : null
            };
          },
        peg$c19 = "in",
        peg$c20 = peg$literalExpectation("in", false),
        peg$c21 = function(source) { return {origin: 'file', source }; },
        peg$c22 = function(source) { return {origin: 'resource', source }; },
        peg$c23 = "at",
        peg$c24 = peg$literalExpectation("at", false),
        peg$c25 = function(source) { return {origin: 'storage', source }; },
        peg$c26 = "description",
        peg$c27 = peg$literalExpectation("description", false),
        peg$c28 = "import",
        peg$c29 = peg$literalExpectation("import", false),
        peg$c30 = function(path) {
            return {
              kind: 'import',
              location: location(),
              path,
            };
          },
        peg$c31 = "shape",
        peg$c32 = peg$literalExpectation("shape", false),
        peg$c33 = "<",
        peg$c34 = peg$literalExpectation("<", false),
        peg$c35 = ">",
        peg$c36 = peg$literalExpectation(">", false),
        peg$c37 = function(name, typeVars, items) {
            var iface = optional(items, extractIndented, []).find(item => item.kind == 'shape-interface');
            if (iface) {
              return {
                kind: 'shape',
                location: location(),
                name,
                interface: iface,
                slots: optional(items, extractIndented, []).filter(item => item.kind == 'shape-slot'),
              };
            } else {
              return {
                kind: 'shape',
                location: location(),
                name,
                args: optional(items, extractIndented, []).filter(item => item.kind == 'shape-argument'),
                slots: optional(items, extractIndented, []).filter(item => item.kind == 'shape-slot'),
              };

            }
          },
        peg$c38 = "(",
        peg$c39 = peg$literalExpectation("(", false),
        peg$c40 = ")",
        peg$c41 = peg$literalExpectation(")", false),
        peg$c42 = function(verb, args) {
            return {
              kind: 'shape-interface',
              location: location(),
              verb,
              args: args || []
            };
          },
        peg$c43 = function(arg) {
            return arg;
          },
        peg$c44 = ",",
        peg$c45 = peg$literalExpectation(",", false),
        peg$c46 = function(head, tail) {
            return [head].concat(tail.map(a => a[2]));
          },
        peg$c47 = function(direction, type, name) {
            if (direction == 'host') {
              error(`Shape cannot have arguments with a 'host' direction.`);
            }

            return {
              kind: 'shape-argument',
              location: location(),
              direction,
              type,
              name,
            };
          },
        peg$c48 = "*",
        peg$c49 = peg$literalExpectation("*", false),
        peg$c50 = function(direction, type, name) {return name == 'consume' || name == 'provide'},
        peg$c51 = "must",
        peg$c52 = peg$literalExpectation("must", false),
        peg$c53 = "consume",
        peg$c54 = peg$literalExpectation("consume", false),
        peg$c55 = "provide",
        peg$c56 = peg$literalExpectation("provide", false),
        peg$c57 = "set of",
        peg$c58 = peg$literalExpectation("set of", false),
        peg$c59 = function(isRequired, direction, isSet, name) {
            return {
              kind: 'shape-slot',
              location: location(),
              name: optional(name, isRequired => name[1], null),
              isRequired: optional(isRequired, isRequired => isRequired[0] == 'must', false),
              direction,
              isSet: !!isSet,
            }
          },
        peg$c60 = "meta",
        peg$c61 = peg$literalExpectation("meta", false),
        peg$c62 = function(items) {
          items = items ? extractIndented(items): [];
          return {kind: 'meta', items: items, location: location()};
        },
        peg$c63 = "name",
        peg$c64 = peg$literalExpectation("name", false),
        peg$c65 = ":",
        peg$c66 = peg$literalExpectation(":", false),
        peg$c67 = function(name) {
          return { key: 'name', value: name, location: location(), kind: 'name' }
        },
        peg$c68 = "storageKey",
        peg$c69 = peg$literalExpectation("storageKey", false),
        peg$c70 = function(key) {
          return {key: 'storageKey', value: key, location: location(), kind: 'storageKey' }
        },
        peg$c71 = "particle",
        peg$c72 = peg$literalExpectation("particle", false),
        peg$c73 = function(name, verbs, implFile, items) {
            let args = [];
            let affordance = [];
            let slots = [];
            let description = null;
            let hasParticleArgument = false;
            verbs = optional(verbs, parsedOutput => parsedOutput[1], []);
            items = items ? extractIndented(items) : [];
            items.forEach(item => {
              if (item.kind == 'interface') {
                if (/[A-Z]/.test(item.verb[0]) && item.verb != name) {
                  error(`Verb ${item.verb} must start with a lower case character or be same as particle name.`);
                }
                verbs.push(item.verb);
                args = item.args;
                hasParticleArgument = true;
              } else if (item.kind == 'particle-argument') {
                args.push(item);
              } else if (item.kind == 'particle-slot') {
                slots.push(item);
              } else if (item.kind == 'description') {
                // TODO: Super hacks.
                description = {
                  kind: 'description?',
                  location: 'FIXME',
                };
                item.description.forEach(d => { description[d.name] = d.pattern; });
              } else if (item.affordance) {
                affordance.push(item.affordance)
              } else {
                error(`Particle ${name} contains an unknown element: ${item.name}`);
              }
            });
            if (affordance.length == 0) {
              // Add default affordance
              affordance.push('dom');
            }
            affordance.push('mock');

            return {
              kind: 'particle',
              location: location(),
              name,
              implFile: optional(implFile, implFile => implFile[3], null),
              verbs,
              args,
              affordance,
              slots,
              description,
              hasParticleArgument
            };
          },
        peg$c74 = function(verb, args) {
            return {
              kind: 'interface',
              location: location(),
              verb,
              args: args || []
            };
          },
        peg$c75 = function(arg, dependentConnections) {
            dependentConnections = optional(dependentConnections, extractIndented, []);
            arg.dependentConnections = dependentConnections;
            return arg;
          },
        peg$c76 = "?",
        peg$c77 = peg$literalExpectation("?", false),
        peg$c78 = function(direction, type, isOptional, nametag) {
            return {
              kind: 'particle-argument',
              location: location(),
              direction,
              type: type,
              isOptional: !!isOptional,
              dependentConnections: [],
              name: nametag.name,
              tags: nametag.tags,
            };
          },
        peg$c79 = "inout",
        peg$c80 = peg$literalExpectation("inout", false),
        peg$c81 = "out",
        peg$c82 = peg$literalExpectation("out", false),
        peg$c83 = "host",
        peg$c84 = peg$literalExpectation("host", false),
        peg$c85 = "`consume",
        peg$c86 = peg$literalExpectation("`consume", false),
        peg$c87 = "`provide",
        peg$c88 = peg$literalExpectation("`provide", false),
        peg$c89 = function() {
            return text();
          },
        peg$c90 = "[",
        peg$c91 = peg$literalExpectation("[", false),
        peg$c92 = "]",
        peg$c93 = peg$literalExpectation("]", false),
        peg$c94 = function(type) {
            return {
              kind: 'list-type',
              location: location(),
              type,
            };
          },
        peg$c95 = "~",
        peg$c96 = peg$literalExpectation("~", false),
        peg$c97 = "with",
        peg$c98 = peg$literalExpectation("with", false),
        peg$c99 = function(name, constraint) {
            return {
              kind: 'variable-type',
              location: location(),
              name,
              constraint: optional(constraint, constraint => constraint[3], null),
            };
          },
        peg$c100 = "Slot",
        peg$c101 = peg$literalExpectation("Slot", false),
        peg$c102 = "{",
        peg$c103 = peg$literalExpectation("{", false),
        peg$c104 = "}",
        peg$c105 = peg$literalExpectation("}", false),
        peg$c106 = function(fields) {
          fields = optional(fields, fields => {
            let data = fields[2];
            return [data[0], data[1].map(tail => tail[2])];
          }, []);

          return {
            kind: 'slot-type',
            location: location(),
            fields
          };
        },
        peg$c107 = function(name, value) {
          return {
            kind: 'slot-field',
            location: location(),
            name,
            value
          }
        },
        peg$c108 = function(name) {
            return {
              kind: 'reference-type',
              location: location(),
              name,
            };
          },
        peg$c109 = function(head, tail) {
            return [head, ...tail.map(a => a[2])];
          },
        peg$c110 = "affordance",
        peg$c111 = peg$literalExpectation("affordance", false),
        peg$c112 = "dom-touch",
        peg$c113 = peg$literalExpectation("dom-touch", false),
        peg$c114 = "dom",
        peg$c115 = peg$literalExpectation("dom", false),
        peg$c116 = "vr",
        peg$c117 = peg$literalExpectation("vr", false),
        peg$c118 = "voice",
        peg$c119 = peg$literalExpectation("voice", false),
        peg$c120 = function(affordance) {
            return {
              kind: 'particle-affordance',
              location: location(),
              affordance,
            };
          },
        peg$c121 = function(isRequired, isSet, name, tags, items) {
            let formFactor = null;
            let providedSlots = [];
            items = optional(items, extractIndented, []);
            items.forEach(item => {
              if (item.kind == 'provided-slot') {
                providedSlots.push(item);
              } else if (item.kind == 'form-factor') {
                if (formFactor)
                  error('duplicate form factor for a slot');
                formFactor = item.formFactor;
              } else {
                error('Unsupported particle slot item ', item);
              }
            });
            return {
              kind: 'particle-slot',
              location: location(),
              name,
              tags: optional(tags, tags => tags[1], []),
              isRequired: optional(isRequired, isRequired => isRequired[0] == 'must', false),
              isSet: !!isSet,
              formFactor,
              providedSlots
            };
          },
        peg$c122 = "formFactor",
        peg$c123 = peg$literalExpectation("formFactor", false),
        peg$c124 = "fullscreen",
        peg$c125 = peg$literalExpectation("fullscreen", false),
        peg$c126 = "big",
        peg$c127 = peg$literalExpectation("big", false),
        peg$c128 = "medium",
        peg$c129 = peg$literalExpectation("medium", false),
        peg$c130 = "small",
        peg$c131 = peg$literalExpectation("small", false),
        peg$c132 = function(formFactor) {
            return {
              kind: 'form-factor',
              location: location(),
              formFactor
            };
          },
        peg$c133 = function(isRequired, isSet, name, tags, items) {
            let formFactor = null;
            let handles = [];
            items = items ? extractIndented(items) : [];
            items.forEach(item => {
              if (item.kind == 'form-factor') {
                if (formFactor)
                  error('duplicate form factor for a slot');
                formFactor = item.formFactor;
              } else {
                handles.push(item.handle);
              }
            });
            return {
              kind: 'provided-slot',
              location: location(),
              name,
              tags: optional(tags, tags => tags[1], []),
              isRequired: optional(isRequired, isRequired => isRequired[0] == 'must', false),
              isSet: !!isSet,
              formFactor,
              handles
            };
          },
        peg$c134 = "handle",
        peg$c135 = peg$literalExpectation("handle", false),
        peg$c136 = function(handle) {
            return {
              kind: 'particle-provided-slot-handle',
              location: location(),
              handle,
            };
          },
        peg$c137 = function(pattern, handleDescriptions) {
            return {
              kind: 'description',
              location: location(),
              description: [
                {
                  // TODO: this should be stored in a different field.
                  kind: 'default-description?',
                  location: location(),
                  name: 'pattern',
                  pattern: pattern,
                },
                ...optional(handleDescriptions, extractIndented, []),
              ],
            };
          },
        peg$c138 = function(name, pattern) {
            return {
              kind: 'handle-description',
              location: location(),
              name,
              pattern,
            };
          },
        peg$c139 = "recipe",
        peg$c140 = peg$literalExpectation("recipe", false),
        peg$c141 = function(name, verbs, items) {
            verbs = optional(verbs, parsedOutput => parsedOutput[1], []);
            return {
              kind: 'recipe',
              location: location(),
              name: optional(name, name => name[1], null),
              verbs,
              items: optional(items, extractIndented, []),
            };
          },
        peg$c142 = "as",
        peg$c143 = peg$literalExpectation("as", false),
        peg$c144 = function(name) {
            return name;
          },
        peg$c145 = function(ref, name, connections) {
            let handleConnections = [];
            let slotConnections = [];
            if (connections) {
              connections = extractIndented(connections);
              for (let conn of connections) {
                if (conn.kind == 'handle-connection')
                  handleConnections.push(conn);
                else
                  slotConnections.push(conn)
              }
            }
            return {
              kind: 'particle',
              location: location(),
              name: optional(name, name => name[1], null),
              ref,
              connections: handleConnections,
              slotConnections: slotConnections,
            };
          },
        peg$c146 = function(param, dir, target) {
            return {
              kind: 'handle-connection',
              location: location(),
              param,
              dir,
              target: optional(target, target => target[1], null),
            };
          },
        peg$c147 = function(param, tags) {
            param = optional(param, param => param, null);
            let name = null;
            let particle = null;
            if (param) {
              if (param[0].toUpperCase() == param[0])
                particle = param;
              else
                name = param;
            }

            return {
              kind: 'handle-connection-components',
              location: location(),
              name,
              particle,
              tags: optional(tags, tags => tags, []),
            }
          },
        peg$c148 = function(ref, name, providedSlots) {
            return {
              kind: 'slot-connection',
              location: location(),
              param: ref.param,
              tags: ref.tags,
              name: optional(name, name=>name[1], null),
              providedSlots: optional(providedSlots, extractIndented, [])
            };
          },
        peg$c149 = function(param, tags) {
            return {
              kind: 'slot-connection-ref',
              location: location(),
              param,
              tags,
            };
          },
        peg$c150 = function(param, name) {
            return {
              kind: 'provided-slot',
              location: location(),
              param,
              name: optional(name, name=>name[1], null)
            };
          },
        peg$c151 = function(from, direction, to) {
            return {
              kind: 'connection',
              location: location(),
              direction,
              from,
              to,
            };
          },
        peg$c152 = "search",
        peg$c153 = peg$literalExpectation("search", false),
        peg$c154 = "tokens",
        peg$c155 = peg$literalExpectation("tokens", false),
        peg$c156 = function(phrase, tokens) {
            return {
              kind: 'search',
              location: location(),
              phrase,
              tokens: optional(tokens, tokens => tokens[1][2].map(t => t[1]), null)
            };
          },
        peg$c157 = "<-",
        peg$c158 = peg$literalExpectation("<-", false),
        peg$c159 = "->",
        peg$c160 = peg$literalExpectation("->", false),
        peg$c161 = "=",
        peg$c162 = peg$literalExpectation("=", false),
        peg$c163 = function(verbs, components) {
            let {param, tags} = optional(components, components => components, {param: null, tags: []});
            return {
              kind: 'connection-target',
              location: location(),
              targetType: 'verb',
              verbs,
              param,
              tags
            }
          },
        peg$c164 = function(tags) {
            return {
              kind: 'connection-target',
              location: location(),
              targetType: 'tag',
              tags
            }
          },
        peg$c165 = function(name, components) {
            let {param, tags} = optional(components, components => components, {param: null, tags: []});
            return {
              kind: 'connection-target',
              targetType: 'localName',
              location: location(),
              name,
              param,
              tags
            }
          },
        peg$c166 = function(particle, components) {
            let {param, tags} = optional(components, components => components, {param: null, tags: []});
            return {
              kind: 'connection-target',
              targetType: 'particle',
              location: location(),
              particle,
              param,
              tags
            }
          },
        peg$c167 = ".",
        peg$c168 = peg$literalExpectation(".", false),
        peg$c169 = function(param, tags) {
            return {
              param: optional(param, param => param, null),
              tags: optional(tags, tags => tags[1], []),
            }
          },
        peg$c170 = "use",
        peg$c171 = peg$literalExpectation("use", false),
        peg$c172 = "map",
        peg$c173 = peg$literalExpectation("map", false),
        peg$c174 = "create",
        peg$c175 = peg$literalExpectation("create", false),
        peg$c176 = "copy",
        peg$c177 = peg$literalExpectation("copy", false),
        peg$c178 = "`slot",
        peg$c179 = peg$literalExpectation("`slot", false),
        peg$c180 = function(type, ref, name) {
            return {
              kind: 'handle',
              location: location(),
              name: optional(name, name => name[1], null),
              ref: optional(ref, ref => ref[1], null),
              fate: type
            }
          },
        peg$c181 = "#",
        peg$c182 = peg$literalExpectation("#", false),
        peg$c183 = /^[a-zA-Z]/,
        peg$c184 = peg$classExpectation([["a", "z"], ["A", "Z"]], false, false),
        peg$c185 = /^[a-zA-Z0-9_]/,
        peg$c186 = peg$classExpectation([["a", "z"], ["A", "Z"], ["0", "9"], "_"], false, false),
        peg$c187 = function() {return text().substring(1);},
        peg$c188 = function(head, tail) { return [head, ...(tail && tail[1] || [])]; },
        peg$c189 = "&",
        peg$c190 = peg$literalExpectation("&", false),
        peg$c191 = function(tags) { return tags; },
        peg$c192 = function(name, tags) {
             return {
               name: name,
               tags: tags
             }
           },
        peg$c193 = function(name) {
             return {
               name: name,
               tags: []
             };
           },
        peg$c194 = function(tags) {
              return {
                name: tags[0],
                tags: tags
              }
           },
        peg$c195 = function(name) {
            return {
              kind: 'particle-ref',
              location: location(),
              name,
              verbs: [],
            };
          },
        peg$c196 = function(verb) {
            return {
              kind: 'particle-ref',
              location: location(),
              verbs: [verb],
            };
          },
        peg$c197 = function(id, tags) {
            return {
              kind: 'handle-ref',
              location: location(),
              id,
              tags: tags || [],
            };
          },
        peg$c198 = function(name, tags) {
            return {
              kind: 'handle-ref',
              location: location(),
              name,
              tags: tags || [],
            };
          },
        peg$c199 = function(tags) {
            return {
              kind: 'handle-ref',
              location: location(),
              tags,
            };
          },
        peg$c200 = "slot",
        peg$c201 = peg$literalExpectation("slot", false),
        peg$c202 = function(ref, name) {
            return {
              kind: 'slot',
              location: location(),
              ref: optional(ref, ref => ref[1], null),
              name: optional(name, name => name[1], '')
            }
          },
        peg$c203 = function(names, fields) {
            return {
              kind: 'schema-inline',
              location: location(),
              names: optional(names, names => names.map(name => name[0]).filter(name => name != '*'), []),
              fields: optional(fields, fields => [fields[0], ...fields[1].map(tail => tail[2])], []),
            }
          },
        peg$c204 = function(type, name) {
            return {
              kind: 'schema-inline-field',
              location: location(),
              name,
              type: optional(type, type => type[0], null),
            };
          },
        peg$c205 = "schema",
        peg$c206 = peg$literalExpectation("schema", false),
        peg$c207 = function(names, parents) {
            return {
              names: names.map(name => name[1]).filter(name => name != '*'),
              parents: optional(parents, parents => parents, []),
            };
          },
        peg$c208 = "alias",
        peg$c209 = peg$literalExpectation("alias", false),
        peg$c210 = function(spec, alias, items) {
            return Object.assign(spec, {
              kind: 'schema',
              location: location(),
              items: optional(items, extractIndented, []),
              alias,
            });
          },
        peg$c211 = function(spec, items) {
            return Object.assign(spec, {
              kind: 'schema',
              location: location(),
              items: optional(items, extractIndented, []),
            });
          },
        peg$c212 = "extends",
        peg$c213 = peg$literalExpectation("extends", false),
        peg$c214 = function(first, rest) {
          var list = [first];
          for (let item of rest) {
            list.push(item[3]);
          }
          return list;
        },
        peg$c215 = "normative",
        peg$c216 = peg$literalExpectation("normative", false),
        peg$c217 = "optional",
        peg$c218 = peg$literalExpectation("optional", false),
        peg$c219 = function(sectionType, fields) {
            return {
              kind: 'schema-section',
              location: location(),
              sectionType,
              fields: extractIndented(fields),
            };
          },
        peg$c220 = function(type, name) {
            return {
              kind: 'schema-field',
              location: location(),
              type,
              name,
            };
          },
        peg$c221 = "Text",
        peg$c222 = peg$literalExpectation("Text", false),
        peg$c223 = "URL",
        peg$c224 = peg$literalExpectation("URL", false),
        peg$c225 = "Number",
        peg$c226 = peg$literalExpectation("Number", false),
        peg$c227 = "Boolean",
        peg$c228 = peg$literalExpectation("Boolean", false),
        peg$c229 = "Bytes",
        peg$c230 = peg$literalExpectation("Bytes", false),
        peg$c231 = "Object",
        peg$c232 = peg$literalExpectation("Object", false),
        peg$c233 = "or",
        peg$c234 = peg$literalExpectation("or", false),
        peg$c235 = function(first, rest) {
            let types = [first];
            for (let type of rest) {
              types.push(type[3]);
            }
            return {kind: 'schema-union', location: location(), types};
          },
        peg$c236 = function(first, rest) {
            let types = [first];
            for (let type of rest) {
              types.push(type[3]);
            }
            return {kind: 'schema-tuple', location: location(), types};
          },
        peg$c237 = /^[0-9]/,
        peg$c238 = peg$classExpectation([["0", "9"]], false, false),
        peg$c239 = function(version) {
            return Number(version.join(''));
          },
        peg$c240 = " ",
        peg$c241 = peg$literalExpectation(" ", false),
        peg$c242 = function(i) {
          i = i.join('');
          if (i.length > indent.length) {
            indents.push(indent);
            indent = i;
            return true;
          }
        },
        peg$c243 = function(i) {
          i = i.join('');
          if (i.length == indent.length) {
            return true;
          } else if (i.length < indent.length) {
            indent = indents.pop();
            return false;
          }
        },
        peg$c244 = function(i) {
          i = i.join('');
          if (i.length >= indent.length) {
            return true;
          } else if (i.length < indent.length) {
            indent = indents.pop();
            return false;
          }
        },
        peg$c245 = "`",
        peg$c246 = peg$literalExpectation("`", false),
        peg$c247 = /^[^`]/,
        peg$c248 = peg$classExpectation(["`"], true, false),
        peg$c249 = function(pattern) { return pattern.join(''); },
        peg$c250 = "'",
        peg$c251 = peg$literalExpectation("'", false),
        peg$c252 = /^[^']/,
        peg$c253 = peg$classExpectation(["'"], true, false),
        peg$c254 = function(id) {return id.join('')},
        peg$c255 = /^[A-Z]/,
        peg$c256 = peg$classExpectation([["A", "Z"]], false, false),
        peg$c257 = /^[a-z0-9_]/i,
        peg$c258 = peg$classExpectation([["a", "z"], ["0", "9"], "_"], false, true),
        peg$c259 = function(ident) {return text()},
        peg$c260 = /^[a-z]/,
        peg$c261 = peg$classExpectation([["a", "z"]], false, false),
        peg$c262 = /^[ ]/,
        peg$c263 = peg$classExpectation([" "], false, false),
        peg$c264 = peg$anyExpectation(),
        peg$c265 = "//",
        peg$c266 = peg$literalExpectation("//", false),
        peg$c267 = "\r",
        peg$c268 = peg$literalExpectation("\r", false),
        peg$c269 = "\n",
        peg$c270 = peg$literalExpectation("\n", false),

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1 }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

      throw peg$buildStructuredError(
        [peg$otherExpectation(description)],
        input.substring(peg$savedPos, peg$currPos),
        location
      );
    }

    function error(message, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

      throw peg$buildSimpleError(message, location);
    }

    function peg$literalExpectation(text, ignoreCase) {
      return { type: "literal", text: text, ignoreCase: ignoreCase };
    }

    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
    }

    function peg$anyExpectation() {
      return { type: "any" };
    }

    function peg$endExpectation() {
      return { type: "end" };
    }

    function peg$otherExpectation(description) {
      return { type: "other", description: description };
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos], p;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column
        };

        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildSimpleError(message, location) {
      return new peg$SyntaxError(message, null, null, location);
    }

    function peg$buildStructuredError(expected, found, location) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parseManifest() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parseeolWhiteSpace();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseIndent();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$currPos;
          s6 = peg$parseSameIndent();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseAnnotation();
            if (s7 !== peg$FAILED) {
              s8 = peg$parseeolWhiteSpace();
              if (s8 !== peg$FAILED) {
                s6 = [s6, s7, s8];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 === peg$FAILED) {
            s5 = null;
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parseSameIndent();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseManifestItem();
              if (s7 !== peg$FAILED) {
                s5 = [s5, s6, s7];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$currPos;
            s6 = peg$parseSameIndent();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseAnnotation();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseeolWhiteSpace();
                if (s8 !== peg$FAILED) {
                  s6 = [s6, s7, s8];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseSameIndent();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseManifestItem();
                if (s7 !== peg$FAILED) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c0(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseManifestItem() {
      var s0;

      s0 = peg$parseRecipe();
      if (s0 === peg$FAILED) {
        s0 = peg$parseParticleDefinition();
        if (s0 === peg$FAILED) {
          s0 = peg$parseImport();
          if (s0 === peg$FAILED) {
            s0 = peg$parseSchemaDefinition();
            if (s0 === peg$FAILED) {
              s0 = peg$parseSchemaAliasDefinition();
              if (s0 === peg$FAILED) {
                s0 = peg$parseManifestStorage();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseShape();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseMeta();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseResource();
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseAnnotation() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 64) {
        s1 = peg$c1;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c2); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parselowerIdent();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c3(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseResource() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c4) {
        s1 = peg$c4;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c5); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseupperIdent();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseIndent();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseSameIndent();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseResourceStart();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseResourceBody();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseeolWhiteSpace();
                      if (s9 === peg$FAILED) {
                        s9 = null;
                      }
                      if (s9 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c6(s3, s8);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseResourceStart() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c7) {
        s1 = peg$c7;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeolWhiteSpace();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c9();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseResourceBody() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parseSameOrMoreIndent();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseResourceLine();
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parseSameOrMoreIndent();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseResourceLine();
            if (s4 !== peg$FAILED) {
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c10(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseResourceLine() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c11.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c12); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c11.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c12); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeol();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c13();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseManifestStorage() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c14) {
        s1 = peg$c14;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseupperIdent();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c16) {
                s5 = peg$c16;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c17); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsewhiteSpace();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseSchemaInline();
                  if (s7 === peg$FAILED) {
                    s7 = peg$parseListType();
                    if (s7 === peg$FAILED) {
                      s7 = peg$parseReferenceType();
                    }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$currPos;
                    s9 = peg$parsewhiteSpace();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parseid();
                      if (s10 !== peg$FAILED) {
                        s9 = [s9, s10];
                        s8 = s9;
                      } else {
                        peg$currPos = s8;
                        s8 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                    if (s8 === peg$FAILED) {
                      s8 = null;
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$currPos;
                      s10 = peg$parsewhiteSpace();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseVersion();
                        if (s11 !== peg$FAILED) {
                          s10 = [s10, s11];
                          s9 = s10;
                        } else {
                          peg$currPos = s9;
                          s9 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s9;
                        s9 = peg$FAILED;
                      }
                      if (s9 === peg$FAILED) {
                        s9 = null;
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$currPos;
                        s11 = peg$parsewhiteSpace();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parseTagList();
                          if (s12 !== peg$FAILED) {
                            s11 = [s11, s12];
                            s10 = s11;
                          } else {
                            peg$currPos = s10;
                            s10 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s10;
                          s10 = peg$FAILED;
                        }
                        if (s10 === peg$FAILED) {
                          s10 = null;
                        }
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsewhiteSpace();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parseManifestStorageSource();
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseeolWhiteSpace();
                              if (s13 !== peg$FAILED) {
                                s14 = peg$currPos;
                                s15 = peg$parseIndent();
                                if (s15 !== peg$FAILED) {
                                  s16 = [];
                                  s17 = peg$currPos;
                                  s18 = peg$parseSameIndent();
                                  if (s18 !== peg$FAILED) {
                                    s19 = peg$parseManifestStorageDescription();
                                    if (s19 !== peg$FAILED) {
                                      s18 = [s18, s19];
                                      s17 = s18;
                                    } else {
                                      peg$currPos = s17;
                                      s17 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s17;
                                    s17 = peg$FAILED;
                                  }
                                  if (s17 !== peg$FAILED) {
                                    while (s17 !== peg$FAILED) {
                                      s16.push(s17);
                                      s17 = peg$currPos;
                                      s18 = peg$parseSameIndent();
                                      if (s18 !== peg$FAILED) {
                                        s19 = peg$parseManifestStorageDescription();
                                        if (s19 !== peg$FAILED) {
                                          s18 = [s18, s19];
                                          s17 = s18;
                                        } else {
                                          peg$currPos = s17;
                                          s17 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s17;
                                        s17 = peg$FAILED;
                                      }
                                    }
                                  } else {
                                    s16 = peg$FAILED;
                                  }
                                  if (s16 !== peg$FAILED) {
                                    s15 = [s15, s16];
                                    s14 = s15;
                                  } else {
                                    peg$currPos = s14;
                                    s14 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s14;
                                  s14 = peg$FAILED;
                                }
                                if (s14 === peg$FAILED) {
                                  s14 = null;
                                }
                                if (s14 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$c18(s3, s7, s8, s9, s10, s12, s14);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseManifestStorageSource() {
      var s0;

      s0 = peg$parseManifestStorageFileSource();
      if (s0 === peg$FAILED) {
        s0 = peg$parseManifestStorageResourceSource();
        if (s0 === peg$FAILED) {
          s0 = peg$parseManifestStorageStorageSource();
        }
      }

      return s0;
    }

    function peg$parseManifestStorageFileSource() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c19) {
        s1 = peg$c19;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseid();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c21(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseManifestStorageResourceSource() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c19) {
        s1 = peg$c19;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseupperIdent();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c22(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseManifestStorageStorageSource() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c23) {
        s1 = peg$c23;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseid();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c25(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseManifestStorageDescription() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 11) === peg$c26) {
        s1 = peg$c26;
        peg$currPos += 11;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c27); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsebackquotedString();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              s1 = [s1, s2, s3, s4];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseImport() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c28) {
        s1 = peg$c28;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseid();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c30(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseShape() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c31) {
        s1 = peg$c31;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseupperIdent();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsewhiteSpace();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 60) {
                s6 = peg$c33;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parsewhiteSpace();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseVariableTypeList();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsewhiteSpace();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 62) {
                        s10 = peg$c35;
                        peg$currPos++;
                      } else {
                        s10 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c36); }
                      }
                      if (s10 !== peg$FAILED) {
                        s5 = [s5, s6, s7, s8, s9, s10];
                        s4 = s5;
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseeolWhiteSpace();
              if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                s7 = peg$parseIndent();
                if (s7 !== peg$FAILED) {
                  s8 = [];
                  s9 = peg$currPos;
                  s10 = peg$parseSameIndent();
                  if (s10 !== peg$FAILED) {
                    s11 = peg$parseShapeItem();
                    if (s11 !== peg$FAILED) {
                      s10 = [s10, s11];
                      s9 = s10;
                    } else {
                      peg$currPos = s9;
                      s9 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s9;
                    s9 = peg$FAILED;
                  }
                  while (s9 !== peg$FAILED) {
                    s8.push(s9);
                    s9 = peg$currPos;
                    s10 = peg$parseSameIndent();
                    if (s10 !== peg$FAILED) {
                      s11 = peg$parseShapeItem();
                      if (s11 !== peg$FAILED) {
                        s10 = [s10, s11];
                        s9 = s10;
                      } else {
                        peg$currPos = s9;
                        s9 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s9;
                      s9 = peg$FAILED;
                    }
                  }
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseeolWhiteSpace();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c37(s3, s4, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseShapeItem() {
      var s0;

      s0 = peg$parseShapeInterface();
      if (s0 === peg$FAILED) {
        s0 = peg$parseShapeArgumentItem();
        if (s0 === peg$FAILED) {
          s0 = peg$parseShapeSlot();
        }
      }

      return s0;
    }

    function peg$parseShapeInterface() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseupperIdent();
      if (s1 === peg$FAILED) {
        s1 = peg$parselowerIdent();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s2 = peg$c38;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseShapeArgumentList();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s4 = peg$c40;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c41); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseeolWhiteSpace();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c42(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseShapeArgumentItem() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseShapeArgument2();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeolWhiteSpace();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c43(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseShapeArgumentList() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseShapeArgument();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c44;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c45); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsewhiteSpace();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseShapeArgument();
            if (s6 !== peg$FAILED) {
              s4 = [s4, s5, s6];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c44;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c45); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseShapeArgument();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c46(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseShapeArgument() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseParticleArgumentDirection();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseParticleArgumentType();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parselowerIdent();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c47(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseShapeArgument2() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseParticleArgumentDirection();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseParticleArgumentType();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parselowerIdent();
              if (s5 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 42) {
                  s5 = peg$c48;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c49); }
                }
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = peg$currPos;
                s6 = peg$c50(s1, s3, s5);
                if (s6) {
                  s6 = peg$FAILED;
                } else {
                  s6 = void 0;
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c47(s1, s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseShapeSlot() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c51) {
        s2 = peg$c51;
        peg$currPos += 4;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 7) === peg$c53) {
          s2 = peg$c53;
          peg$currPos += 7;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 7) === peg$c55) {
            s2 = peg$c55;
            peg$currPos += 7;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c56); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parsewhiteSpace();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 6) === peg$c57) {
              s5 = peg$c57;
              peg$currPos += 6;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c58); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parselowerIdent();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseeolWhiteSpace();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c59(s1, s2, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseMeta() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c60) {
        s1 = peg$c60;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c61); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeolWhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parseIndent();
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$currPos;
            s7 = peg$parseSameIndent();
            if (s7 !== peg$FAILED) {
              s8 = peg$parseMetaItem();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              s6 = peg$currPos;
              s7 = peg$parseSameIndent();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseMetaItem();
                if (s8 !== peg$FAILED) {
                  s7 = [s7, s8];
                  s6 = s7;
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c62(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseMetaItem() {
      var s0;

      s0 = peg$parseMetaStorageKey();
      if (s0 === peg$FAILED) {
        s0 = peg$parseMetaName();
      }

      return s0;
    }

    function peg$parseMetaName() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c63) {
        s1 = peg$c63;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c64); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c65;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c66); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseid();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseeolWhiteSpace();
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c67(s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseMetaStorageKey() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 10) === peg$c68) {
        s1 = peg$c68;
        peg$currPos += 10;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c65;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c66); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseid();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseeolWhiteSpace();
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c70(s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleDefinition() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c71) {
        s1 = peg$c71;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c72); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseupperIdent();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseVerbList();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              s6 = peg$parsewhiteSpace();
              if (s6 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c19) {
                  s7 = peg$c19;
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c20); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsewhiteSpace();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseid();
                    if (s9 !== peg$FAILED) {
                      s6 = [s6, s7, s8, s9];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseeolWhiteSpace();
                if (s6 !== peg$FAILED) {
                  s7 = peg$currPos;
                  s8 = peg$parseIndent();
                  if (s8 !== peg$FAILED) {
                    s9 = [];
                    s10 = peg$currPos;
                    s11 = peg$parseSameIndent();
                    if (s11 !== peg$FAILED) {
                      s12 = peg$parseParticleItem();
                      if (s12 !== peg$FAILED) {
                        s11 = [s11, s12];
                        s10 = s11;
                      } else {
                        peg$currPos = s10;
                        s10 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s10;
                      s10 = peg$FAILED;
                    }
                    while (s10 !== peg$FAILED) {
                      s9.push(s10);
                      s10 = peg$currPos;
                      s11 = peg$parseSameIndent();
                      if (s11 !== peg$FAILED) {
                        s12 = peg$parseParticleItem();
                        if (s12 !== peg$FAILED) {
                          s11 = [s11, s12];
                          s10 = s11;
                        } else {
                          peg$currPos = s10;
                          s10 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s10;
                        s10 = peg$FAILED;
                      }
                    }
                    if (s9 !== peg$FAILED) {
                      s8 = [s8, s9];
                      s7 = s8;
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseeolWhiteSpace();
                    if (s8 === peg$FAILED) {
                      s8 = null;
                    }
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c73(s3, s4, s5, s7);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleItem() {
      var s0;

      s0 = peg$parseParticleInterface();
      if (s0 === peg$FAILED) {
        s0 = peg$parseParticleHandle();
        if (s0 === peg$FAILED) {
          s0 = peg$parseParticleAffordance();
          if (s0 === peg$FAILED) {
            s0 = peg$parseParticleSlot();
            if (s0 === peg$FAILED) {
              s0 = peg$parseDescription();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseParticleInterface() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseupperIdent();
      if (s1 === peg$FAILED) {
        s1 = peg$parselowerIdent();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s2 = peg$c38;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseParticleArgumentList();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s4 = peg$c40;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c41); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseeolWhiteSpace();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c74(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleHandle() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parseParticleArgument();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeolWhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parseIndent();
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$currPos;
            s7 = peg$parseSameIndent();
            if (s7 !== peg$FAILED) {
              s8 = peg$parseParticleHandle();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              s6 = peg$currPos;
              s7 = peg$parseSameIndent();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseParticleHandle();
                if (s8 !== peg$FAILED) {
                  s7 = [s7, s8];
                  s6 = s7;
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c75(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleArgumentList() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseParticleArgument();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c44;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c45); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsewhiteSpace();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseParticleArgument();
            if (s6 !== peg$FAILED) {
              s4 = [s4, s5, s6];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c44;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c45); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseParticleArgument();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c46(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleArgument() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseParticleArgumentDirection();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseParticleArgumentType();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 63) {
              s4 = peg$c76;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c77); }
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseNameAndTagList();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c78(s1, s3, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleArgumentDirection() {
      var s0, s1;

      if (input.substr(peg$currPos, 5) === peg$c79) {
        s0 = peg$c79;
        peg$currPos += 5;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c80); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c19) {
          s0 = peg$c19;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c81) {
            s0 = peg$c81;
            peg$currPos += 3;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c82); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 4) === peg$c83) {
              s0 = peg$c83;
              peg$currPos += 4;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c84); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 8) === peg$c85) {
                s0 = peg$c85;
                peg$currPos += 8;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c86); }
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 8) === peg$c87) {
                  s1 = peg$c87;
                  peg$currPos += 8;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c88); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c89();
                }
                s0 = s1;
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseParticleArgumentType() {
      var s0;

      s0 = peg$parseVariableType();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSlotType();
        if (s0 === peg$FAILED) {
          s0 = peg$parseSchemaInline();
          if (s0 === peg$FAILED) {
            s0 = peg$parseReferenceType();
            if (s0 === peg$FAILED) {
              s0 = peg$parseListType();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseListType() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c90;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c91); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseParticleArgumentType();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s3 = peg$c92;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c93); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c94(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseVariableType() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 126) {
        s1 = peg$c95;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c96); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parselowerIdent();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parsewhiteSpace();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 4) === peg$c97) {
              s5 = peg$c97;
              peg$currPos += 4;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c98); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsewhiteSpace();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseParticleArgumentType();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c99(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSlotType() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c100) {
        s1 = peg$c100;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c101); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 123) {
            s4 = peg$c102;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c103); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            s6 = peg$parseSlotField();
            if (s6 !== peg$FAILED) {
              s7 = [];
              s8 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s9 = peg$c44;
                peg$currPos++;
              } else {
                s9 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c45); }
              }
              if (s9 !== peg$FAILED) {
                s10 = peg$parsewhiteSpace();
                if (s10 !== peg$FAILED) {
                  s11 = peg$parseSlotField();
                  if (s11 !== peg$FAILED) {
                    s9 = [s9, s10, s11];
                    s8 = s9;
                  } else {
                    peg$currPos = s8;
                    s8 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s8;
                  s8 = peg$FAILED;
                }
              } else {
                peg$currPos = s8;
                s8 = peg$FAILED;
              }
              while (s8 !== peg$FAILED) {
                s7.push(s8);
                s8 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s9 = peg$c44;
                  peg$currPos++;
                } else {
                  s9 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c45); }
                }
                if (s9 !== peg$FAILED) {
                  s10 = peg$parsewhiteSpace();
                  if (s10 !== peg$FAILED) {
                    s11 = peg$parseSlotField();
                    if (s11 !== peg$FAILED) {
                      s9 = [s9, s10, s11];
                      s8 = s9;
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s8;
                    s8 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s8;
                  s8 = peg$FAILED;
                }
              }
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s6 = peg$c104;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c105); }
              }
              if (s6 !== peg$FAILED) {
                s3 = [s3, s4, s5, s6];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c106(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSlotField() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parselowerIdent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c65;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c66); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parselowerIdent();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c107(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseReferenceType() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseupperIdent();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c108(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseVariableTypeList() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseVariableType();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c44;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c45); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsewhiteSpace();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseVariableType();
            if (s6 !== peg$FAILED) {
              s4 = [s4, s5, s6];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c44;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c45); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseVariableType();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c109(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleAffordance() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 10) === peg$c110) {
        s1 = peg$c110;
        peg$currPos += 10;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c111); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 9) === peg$c112) {
            s3 = peg$c112;
            peg$currPos += 9;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c113); }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c114) {
              s3 = peg$c114;
              peg$currPos += 3;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c115); }
            }
            if (s3 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c116) {
                s3 = peg$c116;
                peg$currPos += 2;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c117); }
              }
              if (s3 === peg$FAILED) {
                if (input.substr(peg$currPos, 5) === peg$c118) {
                  s3 = peg$c118;
                  peg$currPos += 5;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c119); }
                }
              }
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c120(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleSlot() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c51) {
        s2 = peg$c51;
        peg$currPos += 4;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 7) === peg$c53) {
          s2 = peg$c53;
          peg$currPos += 7;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsewhiteSpace();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 6) === peg$c57) {
              s5 = peg$c57;
              peg$currPos += 6;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c58); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsewhiteSpace();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parselowerIdent();
              if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                s7 = peg$parsewhiteSpace();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseTagList();
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseeolWhiteSpace();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$currPos;
                    s9 = peg$parseIndent();
                    if (s9 !== peg$FAILED) {
                      s10 = [];
                      s11 = peg$currPos;
                      s12 = peg$parseSameIndent();
                      if (s12 !== peg$FAILED) {
                        s13 = peg$parseParticleSlotItem();
                        if (s13 !== peg$FAILED) {
                          s12 = [s12, s13];
                          s11 = s12;
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s11;
                        s11 = peg$FAILED;
                      }
                      while (s11 !== peg$FAILED) {
                        s10.push(s11);
                        s11 = peg$currPos;
                        s12 = peg$parseSameIndent();
                        if (s12 !== peg$FAILED) {
                          s13 = peg$parseParticleSlotItem();
                          if (s13 !== peg$FAILED) {
                            s12 = [s12, s13];
                            s11 = s12;
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      }
                      if (s10 !== peg$FAILED) {
                        s9 = [s9, s10];
                        s8 = s9;
                      } else {
                        peg$currPos = s8;
                        s8 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                    if (s8 === peg$FAILED) {
                      s8 = null;
                    }
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c121(s1, s4, s5, s6, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleSlotItem() {
      var s0;

      s0 = peg$parseSlotFormFactor();
      if (s0 === peg$FAILED) {
        s0 = peg$parseParticleProvidedSlot();
      }

      return s0;
    }

    function peg$parseSlotFormFactor() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 10) === peg$c122) {
        s1 = peg$c122;
        peg$currPos += 10;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c123); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 10) === peg$c124) {
            s3 = peg$c124;
            peg$currPos += 10;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c125); }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c126) {
              s3 = peg$c126;
              peg$currPos += 3;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c127); }
            }
            if (s3 === peg$FAILED) {
              if (input.substr(peg$currPos, 6) === peg$c128) {
                s3 = peg$c128;
                peg$currPos += 6;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c129); }
              }
              if (s3 === peg$FAILED) {
                if (input.substr(peg$currPos, 5) === peg$c130) {
                  s3 = peg$c130;
                  peg$currPos += 5;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c131); }
                }
              }
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c132(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleProvidedSlot() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c51) {
        s2 = peg$c51;
        peg$currPos += 4;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 7) === peg$c55) {
          s2 = peg$c55;
          peg$currPos += 7;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c56); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsewhiteSpace();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.substr(peg$currPos, 6) === peg$c57) {
              s5 = peg$c57;
              peg$currPos += 6;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c58); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsewhiteSpace();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parselowerIdent();
              if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                s7 = peg$parsewhiteSpace();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseTagList();
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseeolWhiteSpace();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$currPos;
                    s9 = peg$parseIndent();
                    if (s9 !== peg$FAILED) {
                      s10 = [];
                      s11 = peg$currPos;
                      s12 = peg$parseSameIndent();
                      if (s12 !== peg$FAILED) {
                        s13 = peg$parseParticleProvidedSlotItem();
                        if (s13 !== peg$FAILED) {
                          s12 = [s12, s13];
                          s11 = s12;
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s11;
                        s11 = peg$FAILED;
                      }
                      while (s11 !== peg$FAILED) {
                        s10.push(s11);
                        s11 = peg$currPos;
                        s12 = peg$parseSameIndent();
                        if (s12 !== peg$FAILED) {
                          s13 = peg$parseParticleProvidedSlotItem();
                          if (s13 !== peg$FAILED) {
                            s12 = [s12, s13];
                            s11 = s12;
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      }
                      if (s10 !== peg$FAILED) {
                        s9 = [s9, s10];
                        s8 = s9;
                      } else {
                        peg$currPos = s8;
                        s8 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                    if (s8 === peg$FAILED) {
                      s8 = null;
                    }
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c133(s1, s4, s5, s6, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleProvidedSlotItem() {
      var s0;

      s0 = peg$parseSlotFormFactor();
      if (s0 === peg$FAILED) {
        s0 = peg$parseParticleProvidedSlotHandle();
      }

      return s0;
    }

    function peg$parseParticleProvidedSlotHandle() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c134) {
        s1 = peg$c134;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c135); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parselowerIdent();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c136(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseDescription() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 11) === peg$c26) {
        s1 = peg$c26;
        peg$currPos += 11;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c27); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsebackquotedString();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              s6 = peg$parseIndent();
              if (s6 !== peg$FAILED) {
                s7 = [];
                s8 = peg$currPos;
                s9 = peg$parseSameIndent();
                if (s9 !== peg$FAILED) {
                  s10 = peg$parseParticleHandleDescription();
                  if (s10 !== peg$FAILED) {
                    s9 = [s9, s10];
                    s8 = s9;
                  } else {
                    peg$currPos = s8;
                    s8 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s8;
                  s8 = peg$FAILED;
                }
                if (s8 !== peg$FAILED) {
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$currPos;
                    s9 = peg$parseSameIndent();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parseParticleHandleDescription();
                      if (s10 !== peg$FAILED) {
                        s9 = [s9, s10];
                        s8 = s9;
                      } else {
                        peg$currPos = s8;
                        s8 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                  }
                } else {
                  s7 = peg$FAILED;
                }
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c137(s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleHandleDescription() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parselowerIdent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsebackquotedString();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c138(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipe() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c139) {
        s1 = peg$c139;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c140); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseupperIdent();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parsewhiteSpace();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseVerbList();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              s6 = peg$parseIndent();
              if (s6 !== peg$FAILED) {
                s7 = [];
                s8 = peg$currPos;
                s9 = peg$parseSameIndent();
                if (s9 !== peg$FAILED) {
                  s10 = peg$parseRecipeItem();
                  if (s10 !== peg$FAILED) {
                    s9 = [s9, s10];
                    s8 = s9;
                  } else {
                    peg$currPos = s8;
                    s8 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s8;
                  s8 = peg$FAILED;
                }
                while (s8 !== peg$FAILED) {
                  s7.push(s8);
                  s8 = peg$currPos;
                  s9 = peg$parseSameIndent();
                  if (s9 !== peg$FAILED) {
                    s10 = peg$parseRecipeItem();
                    if (s10 !== peg$FAILED) {
                      s9 = [s9, s10];
                      s8 = s9;
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s8;
                    s8 = peg$FAILED;
                  }
                }
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c141(s2, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeItem() {
      var s0;

      s0 = peg$parseRecipeParticle();
      if (s0 === peg$FAILED) {
        s0 = peg$parseRecipeHandle();
        if (s0 === peg$FAILED) {
          s0 = peg$parseRecipeSlot();
          if (s0 === peg$FAILED) {
            s0 = peg$parseRecipeConnection();
            if (s0 === peg$FAILED) {
              s0 = peg$parseRecipeSearch();
              if (s0 === peg$FAILED) {
                s0 = peg$parseDescription();
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseLocalName() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c142) {
        s1 = peg$c142;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c143); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parselowerIdent();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c144(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseTopLevelAlias() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c142) {
        s1 = peg$c142;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c143); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseupperIdent();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c144(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeParticle() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      s1 = peg$parseParticleRef();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseLocalName();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseeolWhiteSpace();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parseIndent();
            if (s5 !== peg$FAILED) {
              s6 = [];
              s7 = peg$currPos;
              s8 = peg$parseSameIndent();
              if (s8 !== peg$FAILED) {
                s9 = peg$parseRecipeParticleItem();
                if (s9 !== peg$FAILED) {
                  s8 = [s8, s9];
                  s7 = s8;
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                s7 = peg$currPos;
                s8 = peg$parseSameIndent();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parseRecipeParticleItem();
                  if (s9 !== peg$FAILED) {
                    s8 = [s8, s9];
                    s7 = s8;
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
              }
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c145(s1, s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeParticleItem() {
      var s0;

      s0 = peg$parseRecipeParticleConnection();
      if (s0 === peg$FAILED) {
        s0 = peg$parseRecipeParticleSlotConnection();
      }

      return s0;
    }

    function peg$parseRecipeParticleConnection() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parselowerIdent();
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 42) {
          s1 = peg$c48;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseDirection();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseParticleConnectionTargetComponents();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseeolWhiteSpace();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c146(s1, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleConnectionTargetComponents() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseupperIdent();
      if (s1 === peg$FAILED) {
        s1 = peg$parselowerIdent();
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTagList();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c147(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeParticleSlotConnection() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c53) {
        s1 = peg$c53;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c54); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRecipeSlotConnectionRef();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseLocalName();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseeolWhiteSpace();
              if (s5 !== peg$FAILED) {
                s6 = peg$currPos;
                s7 = peg$parseIndent();
                if (s7 !== peg$FAILED) {
                  s8 = [];
                  s9 = peg$currPos;
                  s10 = peg$parseSameIndent();
                  if (s10 !== peg$FAILED) {
                    s11 = peg$parseRecipeParticleProvidedSlot();
                    if (s11 !== peg$FAILED) {
                      s10 = [s10, s11];
                      s9 = s10;
                    } else {
                      peg$currPos = s9;
                      s9 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s9;
                    s9 = peg$FAILED;
                  }
                  while (s9 !== peg$FAILED) {
                    s8.push(s9);
                    s9 = peg$currPos;
                    s10 = peg$parseSameIndent();
                    if (s10 !== peg$FAILED) {
                      s11 = peg$parseRecipeParticleProvidedSlot();
                      if (s11 !== peg$FAILED) {
                        s10 = [s10, s11];
                        s9 = s10;
                      } else {
                        peg$currPos = s9;
                        s9 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s9;
                      s9 = peg$FAILED;
                    }
                  }
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c148(s3, s4, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeSlotConnectionRef() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parselowerIdent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSpaceTagList();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c149(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeParticleProvidedSlot() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c55) {
        s1 = peg$c55;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c56); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parselowerIdent();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            s5 = peg$parsewhiteSpace();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseLocalName();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseeolWhiteSpace();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c150(s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeConnection() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseConnectionTarget();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseDirection();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseConnectionTarget();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseeolWhiteSpace();
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c151(s1, s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeSearch() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c152) {
        s1 = peg$c152;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c153); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsebackquotedString();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              s6 = peg$parseIndent();
              if (s6 !== peg$FAILED) {
                s7 = peg$currPos;
                s8 = peg$parseSameIndent();
                if (s8 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 6) === peg$c154) {
                    s9 = peg$c154;
                    peg$currPos += 6;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c155); }
                  }
                  if (s9 !== peg$FAILED) {
                    s10 = [];
                    s11 = peg$currPos;
                    s12 = peg$parsewhiteSpace();
                    if (s12 !== peg$FAILED) {
                      s13 = peg$parsebackquotedString();
                      if (s13 !== peg$FAILED) {
                        s12 = [s12, s13];
                        s11 = s12;
                      } else {
                        peg$currPos = s11;
                        s11 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s11;
                      s11 = peg$FAILED;
                    }
                    if (s11 !== peg$FAILED) {
                      while (s11 !== peg$FAILED) {
                        s10.push(s11);
                        s11 = peg$currPos;
                        s12 = peg$parsewhiteSpace();
                        if (s12 !== peg$FAILED) {
                          s13 = peg$parsebackquotedString();
                          if (s13 !== peg$FAILED) {
                            s12 = [s12, s13];
                            s11 = s12;
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      }
                    } else {
                      s10 = peg$FAILED;
                    }
                    if (s10 !== peg$FAILED) {
                      s11 = peg$parseeolWhiteSpace();
                      if (s11 !== peg$FAILED) {
                        s8 = [s8, s9, s10, s11];
                        s7 = s8;
                      } else {
                        peg$currPos = s7;
                        s7 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c156(s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseDirection() {
      var s0;

      if (input.substr(peg$currPos, 2) === peg$c157) {
        s0 = peg$c157;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c158); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c159) {
          s0 = peg$c159;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c160); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s0 = peg$c161;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c162); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 7) === peg$c53) {
              s0 = peg$c53;
              peg$currPos += 7;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c54); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 7) === peg$c55) {
                s0 = peg$c55;
                peg$currPos += 7;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c56); }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseConnectionTarget() {
      var s0;

      s0 = peg$parseVerbConnectionTarget();
      if (s0 === peg$FAILED) {
        s0 = peg$parseTagConnectionTarget();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNameConnectionTarget();
          if (s0 === peg$FAILED) {
            s0 = peg$parseParticleConnectionTarget();
          }
        }
      }

      return s0;
    }

    function peg$parseVerbConnectionTarget() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseVerbList();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseConnectionTargetHandleComponents();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c163(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseTagConnectionTarget() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseTagList();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c164(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseNameConnectionTarget() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parselowerIdent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseConnectionTargetHandleComponents();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c165(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseParticleConnectionTarget() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseupperIdent();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseConnectionTargetHandleComponents();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c166(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseConnectionTargetHandleComponents() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c167;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c168); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parselowerIdent();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parsewhiteSpace();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseTagList();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c169(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseRecipeHandle() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 63) {
        s1 = peg$c76;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c77); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c170) {
          s1 = peg$c170;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c171); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c172) {
            s1 = peg$c172;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c173); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 6) === peg$c174) {
              s1 = peg$c174;
              peg$currPos += 6;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c175); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c176) {
                s1 = peg$c176;
                peg$currPos += 4;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c177); }
              }
              if (s1 === peg$FAILED) {
                if (input.substr(peg$currPos, 5) === peg$c178) {
                  s1 = peg$c178;
                  peg$currPos += 5;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c179); }
                }
              }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseHandleOrSlotRef();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parsewhiteSpace();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseLocalName();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c180(s1, s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseTag() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c181;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c182); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c183.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c184); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c185.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c186); }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c185.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c186); }
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c187();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseTagList() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseTag();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseTagList();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c188(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseVerb() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 38) {
        s1 = peg$c189;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c190); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c183.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c184); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c185.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c186); }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c185.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c186); }
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c187();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseVerbList() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseVerb();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseVerbList();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c188(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSpaceTagList() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsewhiteSpace();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTagList();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c191(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseNameAndTagList() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsewhiteSpace();
      if (s1 !== peg$FAILED) {
        s2 = peg$parselowerIdent();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsewhiteSpace();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseTagList();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c192(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsewhiteSpace();
        if (s1 !== peg$FAILED) {
          s2 = peg$parselowerIdent();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c193(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsewhiteSpace();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseTagList();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c194(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }

      return s0;
    }

    function peg$parseParticleRef() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseupperIdent();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c195(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseVerb();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c196(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseVerb();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c196(s1);
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseHandleOrSlotRef() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseid();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSpaceTagList();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c197(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseupperIdent();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseSpaceTagList();
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c198(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseTagList();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c199(s1);
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseRecipeSlot() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c200) {
        s1 = peg$c200;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c201); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseHandleOrSlotRef();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parsewhiteSpace();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseLocalName();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c202(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaInline() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parseupperIdent();
      if (s3 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 42) {
          s3 = peg$c48;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsewhiteSpace();
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parseupperIdent();
          if (s3 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 42) {
              s3 = peg$c48;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c49); }
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 !== peg$FAILED) {
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 123) {
          s2 = peg$c102;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c103); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parseSchemaInlineField();
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 44) {
              s7 = peg$c44;
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c45); }
            }
            if (s7 !== peg$FAILED) {
              s8 = peg$parsewhiteSpace();
              if (s8 !== peg$FAILED) {
                s9 = peg$parseSchemaInlineField();
                if (s9 !== peg$FAILED) {
                  s7 = [s7, s8, s9];
                  s6 = s7;
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              s6 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s7 = peg$c44;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c45); }
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parsewhiteSpace();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parseSchemaInlineField();
                  if (s9 !== peg$FAILED) {
                    s7 = [s7, s8, s9];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s4 = peg$c104;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c105); }
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c203(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaInlineField() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseSchemaType();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsewhiteSpace();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parselowerIdent();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c204(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaSpec() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c205) {
        s1 = peg$c205;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c206); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parsewhiteSpace();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 42) {
            s5 = peg$c48;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
          if (s5 === peg$FAILED) {
            s5 = peg$parseupperIdent();
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parsewhiteSpace();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 42) {
                s5 = peg$c48;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
              if (s5 === peg$FAILED) {
                s5 = peg$parseupperIdent();
              }
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSchemaExtends();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c207(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaAliasDefinition() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c208) {
        s1 = peg$c208;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c209); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSchemaSpec();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseTopLevelAlias();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseeolWhiteSpace();
                if (s6 !== peg$FAILED) {
                  s7 = peg$currPos;
                  s8 = peg$parseIndent();
                  if (s8 !== peg$FAILED) {
                    s9 = [];
                    s10 = peg$currPos;
                    s11 = peg$parseSameIndent();
                    if (s11 !== peg$FAILED) {
                      s12 = peg$parseSchemaItem();
                      if (s12 !== peg$FAILED) {
                        s11 = [s11, s12];
                        s10 = s11;
                      } else {
                        peg$currPos = s10;
                        s10 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s10;
                      s10 = peg$FAILED;
                    }
                    while (s10 !== peg$FAILED) {
                      s9.push(s10);
                      s10 = peg$currPos;
                      s11 = peg$parseSameIndent();
                      if (s11 !== peg$FAILED) {
                        s12 = peg$parseSchemaItem();
                        if (s12 !== peg$FAILED) {
                          s11 = [s11, s12];
                          s10 = s11;
                        } else {
                          peg$currPos = s10;
                          s10 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s10;
                        s10 = peg$FAILED;
                      }
                    }
                    if (s9 !== peg$FAILED) {
                      s8 = [s8, s9];
                      s7 = s8;
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c210(s3, s5, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaDefinition() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parseSchemaSpec();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeolWhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parseIndent();
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$currPos;
            s7 = peg$parseSameIndent();
            if (s7 !== peg$FAILED) {
              s8 = peg$parseSchemaItem();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              s6 = peg$currPos;
              s7 = peg$parseSameIndent();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseSchemaItem();
                if (s8 !== peg$FAILED) {
                  s7 = [s7, s8];
                  s6 = s7;
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c211(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaExtends() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      s1 = peg$parsewhiteSpace();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 7) === peg$c212) {
          s2 = peg$c212;
          peg$currPos += 7;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c213); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsewhiteSpace();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseupperIdent();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$currPos;
              s7 = peg$parsewhiteSpace();
              if (s7 === peg$FAILED) {
                s7 = null;
              }
              if (s7 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 44) {
                  s8 = peg$c44;
                  peg$currPos++;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c45); }
                }
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsewhiteSpace();
                  if (s9 !== peg$FAILED) {
                    s10 = peg$parseupperIdent();
                    if (s10 !== peg$FAILED) {
                      s7 = [s7, s8, s9, s10];
                      s6 = s7;
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$currPos;
                s7 = peg$parsewhiteSpace();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s8 = peg$c44;
                    peg$currPos++;
                  } else {
                    s8 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c45); }
                  }
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsewhiteSpace();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parseupperIdent();
                      if (s10 !== peg$FAILED) {
                        s7 = [s7, s8, s9, s10];
                        s6 = s7;
                      } else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c214(s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaItem() {
      var s0;

      s0 = peg$parseSchemaSection();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSchemaField();
        if (s0 === peg$FAILED) {
          s0 = peg$parseDescription();
        }
      }

      return s0;
    }

    function peg$parseSchemaSection() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c215) {
        s1 = peg$c215;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c216); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 8) === peg$c217) {
          s1 = peg$c217;
          peg$currPos += 8;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c218); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeolWhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = peg$parseIndent();
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$currPos;
            s7 = peg$parseSameIndent();
            if (s7 !== peg$FAILED) {
              s8 = peg$parseSchemaField();
              if (s8 !== peg$FAILED) {
                s7 = [s7, s8];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
            if (s6 !== peg$FAILED) {
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$currPos;
                s7 = peg$parseSameIndent();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseSchemaField();
                  if (s8 !== peg$FAILED) {
                    s7 = [s7, s8];
                    s6 = s7;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c219(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaField() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseSchemaType();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 !== peg$FAILED) {
          s3 = peg$parselowerIdent();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseeolWhiteSpace();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c220(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaType() {
      var s0;

      s0 = peg$parseSchemaPrimitiveType();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSchemaUnionType();
        if (s0 === peg$FAILED) {
          s0 = peg$parseSchemaTupleType();
        }
      }

      return s0;
    }

    function peg$parseSchemaPrimitiveType() {
      var s0;

      if (input.substr(peg$currPos, 4) === peg$c221) {
        s0 = peg$c221;
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c222); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c223) {
          s0 = peg$c223;
          peg$currPos += 3;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c224); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 6) === peg$c225) {
            s0 = peg$c225;
            peg$currPos += 6;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c226); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 7) === peg$c227) {
              s0 = peg$c227;
              peg$currPos += 7;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c228); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 5) === peg$c229) {
                s0 = peg$c229;
                peg$currPos += 5;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c230); }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 6) === peg$c231) {
                  s0 = peg$c231;
                  peg$currPos += 6;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c232); }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseSchemaUnionType() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c38;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c39); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSchemaPrimitiveType();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$parsewhiteSpace();
            if (s6 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c233) {
                s7 = peg$c233;
                peg$currPos += 2;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c234); }
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parsewhiteSpace();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parseSchemaPrimitiveType();
                  if (s9 !== peg$FAILED) {
                    s6 = [s6, s7, s8, s9];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$parsewhiteSpace();
                if (s6 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c233) {
                    s7 = peg$c233;
                    peg$currPos += 2;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c234); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsewhiteSpace();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseSchemaPrimitiveType();
                      if (s9 !== peg$FAILED) {
                        s6 = [s6, s7, s8, s9];
                        s5 = s6;
                      } else {
                        peg$currPos = s5;
                        s5 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              }
            } else {
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsewhiteSpace();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 41) {
                  s6 = peg$c40;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c41); }
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c235(s3, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSchemaTupleType() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c38;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c39); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSchemaPrimitiveType();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$parsewhiteSpace();
            if (s6 === peg$FAILED) {
              s6 = null;
            }
            if (s6 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s7 = peg$c44;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c45); }
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parsewhiteSpace();
                if (s8 === peg$FAILED) {
                  s8 = null;
                }
                if (s8 !== peg$FAILED) {
                  s9 = peg$parseSchemaPrimitiveType();
                  if (s9 !== peg$FAILED) {
                    s6 = [s6, s7, s8, s9];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              s6 = peg$parsewhiteSpace();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 44) {
                  s7 = peg$c44;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c45); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsewhiteSpace();
                  if (s8 === peg$FAILED) {
                    s8 = null;
                  }
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseSchemaPrimitiveType();
                    if (s9 !== peg$FAILED) {
                      s6 = [s6, s7, s8, s9];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsewhiteSpace();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 41) {
                  s6 = peg$c40;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c41); }
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c236(s3, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseVersion() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 64) {
        s1 = peg$c1;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c2); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c237.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c238); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c237.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c238); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c239(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseIndent() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      peg$silentFails++;
      s1 = peg$currPos;
      s2 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s3 = peg$c240;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c241); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c240;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c241); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s3 = peg$c242(s2);
        if (s3) {
          s3 = void 0;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      peg$silentFails--;
      if (s1 !== peg$FAILED) {
        peg$currPos = s0;
        s0 = void 0;
      } else {
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSameIndent() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$currPos;
      s3 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s4 = peg$c240;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c241); }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        if (input.charCodeAt(peg$currPos) === 32) {
          s4 = peg$c240;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c241); }
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s4 = peg$c243(s3);
        if (s4) {
          s4 = void 0;
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      peg$silentFails--;
      if (s2 !== peg$FAILED) {
        peg$currPos = s1;
        s1 = void 0;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c240;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c241); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c240;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c241); }
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSameOrMoreIndent() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$currPos;
      s3 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s4 = peg$c240;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c241); }
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        if (input.charCodeAt(peg$currPos) === 32) {
          s4 = peg$c240;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c241); }
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = peg$currPos;
        s4 = peg$c244(s3);
        if (s4) {
          s4 = void 0;
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      peg$silentFails--;
      if (s2 !== peg$FAILED) {
        peg$currPos = s1;
        s1 = void 0;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c240;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c241); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c240;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c241); }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c13();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsebackquotedString() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 96) {
        s1 = peg$c245;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c246); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c247.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c248); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c247.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c248); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 96) {
            s3 = peg$c245;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c246); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c249(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseid() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c250;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c251); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c252.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c253); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c252.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c253); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s3 = peg$c250;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c251); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c254(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseupperIdent() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c255.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c256); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c257.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c258); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c257.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c258); }
          }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c259(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parselowerIdent() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c260.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c261); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c257.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c258); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c257.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c258); }
          }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c259(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsewhiteSpace() {
      var s0, s1;

      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c240;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c241); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (input.charCodeAt(peg$currPos) === 32) {
            s1 = peg$c240;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c241); }
          }
        }
      } else {
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseeolWhiteSpace() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c262.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c263); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c262.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c263); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.length > peg$currPos) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c264); }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (peg$c262.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c263); }
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c262.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c263); }
          }
        }
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c265) {
            s2 = peg$c265;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c266); }
          }
          if (s2 !== peg$FAILED) {
            s3 = [];
            if (peg$c11.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c12); }
            }
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c11.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c12); }
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseeolWhiteSpace();
              if (s4 !== peg$FAILED) {
                s1 = [s1, s2, s3, s4];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          if (peg$c262.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c263); }
          }
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (peg$c262.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c263); }
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseeol();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseeolWhiteSpace();
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }

      return s0;
    }

    function peg$parseeol() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 13) {
        s1 = peg$c267;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c268); }
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c269;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c270); }
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 13) {
            s3 = peg$c267;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c268); }
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }


      var indent = '';
      var startIndent = '';
      var indents = [];
      function extractIndented(items) {
        return items[1].map(item => item[1]);
      }
      function optional(result, extract, defaultValue) {
        if (result != null) {
          let value = extract(result);
          if (value != null) {
            return value;
          }
        }
        return defaultValue == null ? null : defaultValue;
      }
      function checkNormal(result) {
        if (['string', 'number', 'boolean'].includes(typeof result) || result === null) {
          return;
        }
        if (result === undefined) {
          throw new Error(`result was undefined`);
        }
        if (Array.isArray(result)) {
          for (let item of result) {
            checkNormal(item);
          }
          return;
        }
        if (result.model) {
          throw new Error(`unexpected 'model' in ${JSON.stringify(result)}`);
        }
        if (!result.location) {
          throw new Error(`no 'location' in ${JSON.stringify(result)}`);
        }
        if (!result.kind) {
          throw new Error(`no 'kind' in ${JSON.stringify(result)}`);
        }
        for (let key of Object.keys(result)) {
          if (['location', 'kind'].includes(key)) {
            continue;
          }
          checkNormal(result[key]);
        }
      }


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }

      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})()
/* harmony export (immutable) */ __webpack_exports__["a"] = parser;


/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

let supportedTypes = ['Text', 'URL', 'Number', 'Boolean'];

class JsonldToManifest {
  static convert(jsonld, theClass) {
    let obj = JSON.parse(jsonld);
    let classes = {};
    let properties = {};

    if (!obj['@graph']) {
      obj['@graph'] = [obj];
    }

    for (let item of obj['@graph']) {
      if (item['@type'] == 'rdf:Property')
        properties[item['@id']] = item;
      else if (item['@type'] == 'rdfs:Class') {
        classes[item['@id']] = item;
        item.subclasses = [];
        item.superclass = null;
      }
    }

    for (let clazz of Object.values(classes)) {
      if (clazz['rdfs:subClassOf'] !== undefined) {
        if (clazz['rdfs:subClassOf'].length == undefined)
          clazz['rdfs:subClassOf'] = [clazz['rdfs:subClassOf']];
        for (let subClass of clazz['rdfs:subClassOf']) {
          let superclass = subClass['@id'];
          if (clazz.superclass == undefined)
            clazz.superclass = [];
          if (classes[superclass]) {
            classes[superclass].subclasses.push(clazz);
            clazz.superclass.push(classes[superclass]);
          } else {
            clazz.superclass.push({'@id': superclass});
          }
        }
      }
    }

    for (let clazz of Object.values(classes)) {
      if (clazz.subclasses.length == 0 && theClass == undefined) {
        theClass = clazz;
      }
    }

    let relevantProperties = [];
    for (let property of Object.values(properties)) {
      let domains = property['schema:domainIncludes'];
      if (!domains)
        domains = {'@id': theClass['@id']};
      if (!domains.length)
        domains = [domains];
      domains = domains.map(a => a['@id']);
      if (domains.includes(theClass['@id'])) {
        let name = property['@id'].split(':')[1];
        let type = property['schema:rangeIncludes'];
        if (!type)
          console.log(property);
        if (!type.length)
          type = [type];

        type = type.map(a => a['@id'].split(':')[1]);
        type = type.filter(type => supportedTypes.includes(type));
        if (type.length > 0)
        relevantProperties.push({name, type});
      }
    }

    let className = theClass['@id'].split(':')[1];
    let superNames = theClass.superclass ? theClass.superclass.map(a => a['@id'].split(':')[1]) : [];

    let s = '';
    for (let superName of superNames)
      s += `import 'https://schema.org/${superName}'\n\n`;

    s += `schema ${className}`;
    if (superNames.length > 0)
      s += ` extends ${superNames.join(', ')}`;

    if (relevantProperties.length > 0) {
      for (let property of relevantProperties) {
        let type;
        if (property.type.length > 1)
          type = '(' + property.type.join(' or ') + ')';
        else
          type = property.type[0];
        s += `\n  ${type} ${property.name}`;
      }
    }
    s += '\n';

    return s;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = JsonldToManifest;



/***/ }),
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */




class AbstractDevtoolsChannel {
  constructor() {
    this.debouncedMessages = [];
    this.debouncing = false;
    this.messageListeners = new Map();
  }

  send(message) {
    this.debouncedMessages.push(message);
    if (!this.debouncing) {
      this.debouncing = true;
      setTimeout(() => {
        this._flush(this.debouncedMessages);
        this.debouncedMessages = [];
        this.debouncing = false;
      }, 100);
    }
  }

  listen(arcOrId, messageType, callback) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(messageType);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(arcOrId);
    const arcId = typeof arcOrId === 'string' ? arcOrId : arcOrId.id.toString();
    const key = `${arcId}/${messageType}`;
    let listeners = this.messageListeners.get(key);
    if (!listeners) this.messageListeners.set(key, listeners = []);
    listeners.push(callback);
  }

  _handleMessage(msg) {
    let listeners = this.messageListeners.get(`${msg.arcId}/${msg.messageType}`);
    if (!listeners) {
      console.warn(`No one is listening to ${msg.messageType} message`);
    } else {
      for (let listener of listeners) listener(msg);
    }
  }

  _flush(messages) {
    throw 'Not implemented in an abstract class';
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AbstractDevtoolsChannel;



/***/ }),
/* 79 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tracing_adapter_js__ = __webpack_require__(84);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__arc_planner_invoker_js__ = __webpack_require__(80);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__arc_stores_fetcher_js__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__devtools_connection_js__ = __webpack_require__(10);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */






// Arc-independent handlers for devtools logic.
__WEBPACK_IMPORTED_MODULE_3__devtools_connection_js__["a" /* DevtoolsConnection */].onceConnected.then(devtoolsChannel => {
  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__tracing_adapter_js__["a" /* enableTracingAdapter */])(devtoolsChannel);
});

class ArcDebugHandler {
  constructor(arc, devtoolsChannel) {

    // Message handles go here.
    if (!arc.isSpeculative) {
      new __WEBPACK_IMPORTED_MODULE_1__arc_planner_invoker_js__["a" /* ArcPlannerInvoker */](arc, devtoolsChannel);
      new __WEBPACK_IMPORTED_MODULE_2__arc_stores_fetcher_js__["a" /* ArcStoresFetcher */](arc, devtoolsChannel);
    }

    // TODO: Disconnect when arc is disposed?

    devtoolsChannel.send({
      messageType: 'arc-available',
      messageBody: {
        id: arc.id.toString(),
        isSpeculative: arc.isSpeculative
      }
    });
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ArcDebugHandler;



/***/ }),
/* 80 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__planner_js__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__manifest_js__ = __webpack_require__(9);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */




class ArcPlannerInvoker {
  constructor(arc, devtoolsChannel) {
    this.arc = arc;
    this.planner = new __WEBPACK_IMPORTED_MODULE_0__planner_js__["a" /* Planner */]();
    this.planner.init(arc);

    devtoolsChannel.listen(arc, 'fetch-strategies', () => devtoolsChannel.send({
      messageType: 'fetch-strategies-result',
      messageBody: this.planner.strategizer._strategies.map(a => a.constructor.name)
    }));

    devtoolsChannel.listen(arc, 'invoke-planner', async msg => devtoolsChannel.send({
      messageType: 'invoke-planner-result',
      messageBody: await this.invokePlanner(msg.messageBody)
    }));
  }

  async invokePlanner(msg) {
    let strategy = this.planner.strategizer._strategies.find(s => s.constructor.name === msg.strategy);
    if (!strategy) return {error: 'could not find strategy'};

    let manifest;
    try {
      manifest = await __WEBPACK_IMPORTED_MODULE_1__manifest_js__["a" /* Manifest */].parse(msg.recipe, {loader: this.arc._loader, fileName: 'manifest.manifest'});
    } catch (error) {
      return {error: error.message};
    }

    let recipe = manifest.recipes[0];
    recipe.normalize();

    let results = await strategy.generate({
      generation: 0,
      generated: [{result: recipe, score: 1}],
      population: [{result: recipe, score: 1}],
      terminal: []
    });

    for (let result of results) {
      result.hash = await result.hash;
      result.derivation = undefined;
      let recipe = result.result;
      result.result = recipe.toString({showUnresolved: true});

      if (!Object.isFrozen(recipe)) {
        let errors = new Map();
        recipe.normalize({errors});
        result.errors = [...errors.keys()].map(thing => ({id: thing.id, error: errors.get(thing)}));
        result.normalized = recipe.toString();
      }
    }

    return {results};
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ArcPlannerInvoker;



/***/ }),
/* 81 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

class ArcStoresFetcher {
  constructor(arc, devtoolsChannel) {
    this._arc = arc;

    devtoolsChannel.listen(arc, 'fetch-stores', async () => devtoolsChannel.send({
      messageType: 'fetch-stores-result',
      messageBody: await this._listStores()
    }));
  }

  async _listStores() {
    const find = manifest => {
      let tags = [...manifest._storeTags];
      if (manifest.imports) {
        manifest.imports.forEach(imp => tags = tags.concat(find(imp)));
      }
      return tags;
    };
    return {
      arcStores: await this._digestStores(this._arc._storeTags),
      contextStores: await this._digestStores(find(this._arc.context))
    };
  }

  async _digestStores(stores) {
    const result = [];
    for (let [store, tags] of stores) {
      let value = `(don't know how to dereference)`;
      if (store.toList) {
        value = await store.toList();
      } else if (store.get) {
        value = await store.get();
      }
      result.push({
        name: store.name,
        tags: tags ? [...tags] : [],
        id: store.id,
        storage: store.storageKey,
        type: store.type,
        description: store.description,
        value
      });
    }
    return result;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ArcStoresFetcher;



/***/ }),
/* 82 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
 

class OuterPortAttachment {
  constructor(arc, devtoolsChannel) {
    this._devtoolsChannel = devtoolsChannel;
    this._arcIdString = arc.id.toString();
    this._speculative = arc.isSpeculative;
    this._callbackRegistry = {};
    this._particleRegistry = {};
  }

  InstantiateParticle(particle, {id, spec, handles}) {
    this._particleRegistry[id] = spec;
    this._devtoolsChannel.send({
      messageType: 'InstantiateParticle',
      messageBody: Object.assign(
        this._arcMetadata(),
        this._trimParticleSpec(id, spec, handles)
      )
    });
  }

  SimpleCallback({callback, data}) {
    let callbackDetails = this._callbackRegistry[callback];
    if (callbackDetails) {
      // Copying callback data, as the callback can be used multiple times.
      this._sendDataflowMessage(Object.assign({}, callbackDetails), data);
    }
  }

  onInitializeProxy({handle, callback}) {
    this._callbackRegistry[callback] = this._describeHandleCall(
      {operation: 'on-change', handle});
  }

  onSynchronizeProxy({handle, callback}) {
    this._callbackRegistry[callback] = this._describeHandleCall(
      {operation: 'sync-model', handle});
  }

  onHandleGet({handle, callback, particleId}) {
    this._callbackRegistry[callback] = this._describeHandleCall(
      {operation: 'get', handle, particleId});
  }

  onHandleToList({handle, callback, particleId}) {
    this._callbackRegistry[callback] = this._describeHandleCall(
      {operation: 'toList', handle, particleId});
  }

  onHandleSet({handle, data, particleId}) {
    this._logHandleCall({operation: 'set', handle, data, particleId});
  }

  onHandleStore({handle, data, particleId}) {
    this._logHandleCall({operation: 'store', handle, data, particleId});
  }

  onHandleClear({handle, particleId}) {
    this._logHandleCall({operation: 'clear', handle, particleId});
  }

  onHandleRemove({handle, data, particleId}) {
    this._logHandleCall({operation: 'remove', handle, data, particleId});
  }

  _logHandleCall(args) {
    this._sendDataflowMessage(this._describeHandleCall(args), args.data);
  }

  _sendDataflowMessage(messageBody, data) {
    messageBody.data = JSON.stringify(data);
    messageBody.timestamp = Date.now();
    this._devtoolsChannel.send({messageType: 'dataflow', messageBody});
  }

  _describeHandleCall({operation, handle, particleId}) {
    let metadata = Object.assign(this._arcMetadata(), {
      operation,
      handle: this._describeHandle(handle)
    });
    if (particleId) metadata.particle = this._describeParticle(particleId);
    return metadata;
  }

  _arcMetadata() {
    return {
      arcId: this._arcIdString,
      speculative: this._speculative
    };
  }

  _trimParticleSpec(id, spec, handles) {
    let connections = {};
    spec.connectionMap.forEach((value, key) => {
      connections[key] = Object.assign({
        direction: value.direction
      }, this._describeHandle(handles.get(key)));
    });
    return {
      id,
      name: spec.name,
      connections,
      implFile: spec.implFile
    };
  }

  _describeParticle(id) {
    let particleSpec = this._particleRegistry[id];
    return {
      id,
      name: particleSpec && particleSpec.name
      // TODO: Send entire spec only once and refer to it by ID in the tool.
    };
  }

  _describeHandle(handle) {
    return {
      id: handle.id,
      storageKey: handle._storageKey,
      name: handle.name,
      description: handle.description,
      type: this._describeHandleType(handle._type)
    };
  }

  // TODO: This is fragile and incomplete. Change this into sending entire
  //       handle object once and refer back to it via its ID in the tool.
  _describeHandleType(handleType) {
    switch (handleType.constructor.name) {
      case 'Type':
        switch (handleType.tag) {
          case 'Collection': return `[${this._describeHandleType(handleType.data)}]`;
          case 'Entity': return this._describeHandleType(handleType.data);
          default: return `${handleType.tag} ${this._describeHandleType(handleType.data)}`;
        }
      case 'Schema':
        return handleType.name;
      case 'Shape':
        return 'Shape';
    }
    return '';
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = OuterPortAttachment;



/***/ }),
/* 83 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

class DevtoolsChannelStub {
  constructor() {
    this._messages = [];
  }

  get messages() {
    return this._messages;
  }

  send(message) {
    this._messages.push(JSON.parse(JSON.stringify(message)));
  }

  listen(arcOrId, messageType, callback) { /* No-op */ }

  clear() {
    this._messages.length = 0;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DevtoolsChannelStub;



/***/ }),
/* 84 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = enableTracingAdapter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tracelib_trace_js__ = __webpack_require__(6);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */


let streamingToDevtools = false;

function enableTracingAdapter(devtoolsChannel) {
  if (!streamingToDevtools) {
    if (!__WEBPACK_IMPORTED_MODULE_0__tracelib_trace_js__["a" /* Tracing */].enabled) __WEBPACK_IMPORTED_MODULE_0__tracelib_trace_js__["a" /* Tracing */].enable();

    devtoolsChannel.send({
      messageType: 'trace-time-sync',
      messageBody: {
        traceTime: __WEBPACK_IMPORTED_MODULE_0__tracelib_trace_js__["a" /* Tracing */].now(),
        localTime: Date.now()
      }
    });

    __WEBPACK_IMPORTED_MODULE_0__tracelib_trace_js__["a" /* Tracing */].stream(
      trace => devtoolsChannel.send({
        messageType: 'trace',
        messageBody: trace
      }),
      trace => trace.ov // Overview events only.
    );

    streamingToDevtools = true;
  }
}


/***/ }),
/* 85 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__description_js__ = __webpack_require__(15);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





class DescriptionDomFormatter extends __WEBPACK_IMPORTED_MODULE_1__description_js__["b" /* DescriptionFormatter */] {
  constructor(description) {
    super(description);
    this._nextID = 0;
  }

  _isSelectedDescription(desc) {
    return super._isSelectedDescription(desc) || (!!desc.template && !!desc.model);
  }

  _populateParticleDescription(particle, descriptionByName) {
    let result = super._populateParticleDescription(particle, descriptionByName);

    if (descriptionByName['_template_']) {
      result = Object.assign(result, {
        template: descriptionByName['_template_'],
        model: JSON.parse(descriptionByName['_model_'])
      });
    }

    return result;
  }

  async _combineSelectedDescriptions(selectedDescriptions) {
    let suggestionByParticleDesc = new Map();
    await Promise.all(selectedDescriptions.map(async (particleDesc, index) => {
      if (this.seenParticles.has(particleDesc._particle)) {
        return;
      }

      let {template, model} = this._retrieveTemplateAndModel(particleDesc, index);

      let success = await Promise.all(Object.keys(model).map(async tokenKey => {
        let tokens = this._initSubTokens(model[tokenKey], particleDesc);
        let token = tokens[0];
        return (await Promise.all(tokens.map(async token => {
          let tokenValue = await this.tokenToString(token);
          if (tokenValue == undefined) {
            return false;
          } else if (tokenValue && tokenValue.template && tokenValue.model) {
            // Dom token.
            template = template.replace(`{{${tokenKey}}}`, tokenValue.template);
            delete model[tokenKey];
            model = Object.assign(model, tokenValue.model);
          } else { // Text token.
            // Replace tokenKey, in case multiple selected suggestions use the same key.
            let newTokenKey = `${tokenKey}${++this._nextID}`;
            template = template.replace(`{{${tokenKey}}}`, `{{${newTokenKey}}}`);
            delete model[tokenKey];
            model[newTokenKey] = tokenValue;
          }
          return true;
        }))).every(t => !!t);
      }));

      if (success.every(s => !!s)) {
        suggestionByParticleDesc.set(particleDesc, {template, model});
      }
    }));

    // Populate suggestions list while maintaining original particles order.
    let suggestions = [];
    selectedDescriptions.forEach(desc => {
      if (suggestionByParticleDesc.has(desc)) {
        suggestions.push(suggestionByParticleDesc.get(desc));
      }
    });

    if (suggestions.length > 0) {
      let result = this._joinDescriptions(suggestions);
      result.template += '.';
      return result;
    }
  }

  _retrieveTemplateAndModel(particleDesc, index) {
    if (particleDesc.template && particleDesc.model) {
      return {template: particleDesc.template, model: particleDesc.model};
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particleDesc.pattern, 'Description must contain template and model, or pattern');
    let template = '';
    let model = {};
    let tokens = this._initTokens(particleDesc.pattern, particleDesc);

    tokens.forEach((token, i) => {
      if (token.text) {
        template = template.concat(`${index == 0 && i == 0 ? token.text[0].toUpperCase() + token.text.slice(1) : token.text}`);
      } else { // handle or slot handle.
        let sanitizedFullName = token.fullName.replace(/[.{}_$]/g, '');
        let attribute = '';
        // TODO(mmandlis): capitalize the data in the model instead.
        if (i == 0) {
          // Capitalize the first letter in the token.
          template = template.concat(`<style>
            [firstletter]::first-letter { text-transform: capitalize; }
            [firstletter] {display: inline-block}
            </style>`);
          attribute = ' firstletter';
        }
        template = template.concat(`<span${attribute}>{{${sanitizedFullName}}}</span>`);
        model[sanitizedFullName] = token.fullName;
      }
    });

    return {template, model};
  }

  _capitalizeAndPunctuate(sentence) {
    if (typeof sentence === 'string') {
      return {template: super._capitalizeAndPunctuate(sentence), model: {}};
    }

    // Capitalize the first element in the DOM template.
    let tokens = sentence.template.match(/<[a-zA-Z0-9]+>{{([a-zA-Z0-9]*)}}<\/[a-zA-Z0-9]+>/);
    if (tokens && tokens.length > 1 && sentence.model[tokens[1]]) {
      let modelToken = sentence.model[tokens[1]];
      if (modelToken.length > 0) {
        sentence.model[tokens[1]] = `${modelToken[0].toUpperCase()}${modelToken.substr(1)}`;
      }
    }
    sentence.template += '.';
    return sentence;
  }

  _joinDescriptions(descs) {
    // // If all tokens are strings, just join them.
    if (descs.every(desc => typeof desc === 'string')) {
      return super._joinDescriptions(descs);
    }

    let result = {template: '', model: {}};
    let count = descs.length;
    descs.forEach((desc, i) => {
      if (!desc.template || !desc.model) {
        return;
      }

      result.template += desc.template;
      result.model = Object.assign(result.model, desc.model);
      let delim;
      if (i < count - 2) {
        delim = ', ';
      } else if (i == count - 2) {
        delim = ['', '', ' and ', ', and '][Math.min(3, count)];
      }
      if (delim) {
        result.template += delim;
      }
    });
    return result;
  }

  _joinTokens(tokens) {
    // If all tokens are strings, just join them.
    if (tokens.every(token => typeof token === 'string')) {
      return super._joinTokens(tokens);
    }

    tokens = tokens.map(token => {
      if (typeof token !== 'object') {
        return {
          template: `<span>{{text${++this._nextID}}}</span>`,
          model: {[`text${this._nextID}`]: token}
        };
      }
      return token;
    });

    let nonEmptyTokens = tokens.filter(token => token && !!token.template && !!token.model);
    return {
      template: nonEmptyTokens.map(token => token.template).join(''),
      model: nonEmptyTokens.map(token => token.model).reduce((prev, curr) => Object.assign(prev, curr), {})
    };
  }

  _combineDescriptionAndValue(token, description, storeValue) {
    if (!!description.template && !!description.model) {
      return {
        template: `${description.template} (${storeValue.template})`,
        model: Object.assign(description.model, storeValue.model)
      };
    }
    let descKey = `${token.handleName}Description${++this._nextID}`;
    return {
      template: `<span>{{${descKey}}}</span> (${storeValue.template})`,
      model: Object.assign({[descKey]: description}, storeValue.model)
    };
  }

  _formatEntityProperty(handleName, properties, value) {
    let key = `${handleName}${properties.join('')}Value${++this._nextID}`;
    return {
      template: `<b>{{${key}}}</b>`,
      model: {[`${key}`]: value}
    };
  }

  _formatCollection(handleName, values) {
    let handleKey = `${handleName}${++this._nextID}`;
    if (values[0].rawData.name) {
      if (values.length > 2) {
        return {
          template: `<b>{{${handleKey}FirstName}}</b> plus <b>{{${handleKey}OtherCount}}</b> other items`,
          model: {[`${handleKey}FirstName`]: values[0].rawData.name, [`${handleKey}OtherCount`]: values.length - 1}
        };
      }
      return {
        template: values.map((v, i) => `<b>{{${handleKey}${i}}}</b>`).join(', '),
        model: Object.assign(...values.map((v, i) => ({[`${handleKey}${i}`]: v.rawData.name} )))
      };
    }
    return {
      template: `<b>{{${handleKey}Length}}</b> items`,
      model: {[`${handleKey}Length`]: values.length}
    };
  }

  _formatSingleton(handleName, value, handleDescription) {
    let formattedValue = super._formatSingleton(handleName, value, handleDescription);
    if (formattedValue) {
      return {
        template: `<b>{{${handleName}Var}}</b>`,
        model: {[`${handleName}Var`]: formattedValue}
      };
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DescriptionDomFormatter;



/***/ }),
/* 86 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__particle_js__ = __webpack_require__(21);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





/** @class DomParticleBase
 * Particle that interoperates with DOM.
 */
class DomParticleBase extends __WEBPACK_IMPORTED_MODULE_1__particle_js__["a" /* Particle */] {
  constructor() {
    super();
  }
  /** @method get template()
   * Override to return a String defining primary markup.
   */
  get template() {
    return '';
  }
  /** @method getTemplate(slotName)
   * Override to return a String defining primary markup for the given slot name.
   */
  getTemplate(slotName) {
    // TODO: only supports a single template for now. add multiple templates support.
    return this.template;
  }
  /** @method getTemplateName(slotName)
   * Override to return a String defining the name of the template for the given slot name.
   */
  getTemplateName(slotName) {
    // TODO: only supports a single template for now. add multiple templates support.
    return `default`;
  }
  /** @method shouldRender(props, state, oldProps, oldState)
   * Override to return false if the Particle won't use
   * it's slot.
   */
  shouldRender() {
    return true;
  }
  /** @method render()
   * Override to return a dictionary to map into the template.
   */
  render() {
    return {};
  }
  renderSlot(slotName, contentTypes) {
    const stateArgs = this._getStateArgs();
    let slot = this.getSlot(slotName);
    if (!slot) {
      return; // didn't receive StartRender.
    }
    // Set this to support multiple slots consumed by a particle, without needing
    // to pass slotName to particle's render method, where it useless in most cases.
    this.currentSlotName = slotName;
    contentTypes.forEach(ct => slot._requestedContentTypes.add(ct));
    // TODO(sjmiles): redundant, same answer for every slot
    if (this.shouldRender(...stateArgs)) {
      let content = {};
      if (slot._requestedContentTypes.has('template')) {
        content.template = this.getTemplate(slot.slotName);
      }
      if (slot._requestedContentTypes.has('model')) {
        content.model = this.render(...stateArgs);
      }
      content.templateName = this.getTemplateName(slot.slotName);
      slot.render(content);
    } else if (slot.isRendered) {
      // Send empty object, to clear rendered slot contents.
      slot.render({});
    }
    this.currentSlotName = undefined;
  }
  _getStateArgs() {
    return [];
  }
  forceRenderTemplate(slotName) {
    this._slotByName.forEach((slot, name) => {
      if (!slotName || (name == slotName)) {
        slot._requestedContentTypes.add('template');
      }
    });
  }
  fireEvent(slotName, {handler, data}) {
    if (this[handler]) {
      this[handler]({data});
    }
  }
  setParticleDescription(pattern) {
    if (typeof pattern === 'string') {
      return super.setParticleDescription(pattern);
    }
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!!pattern.template && !!pattern.model, 'Description pattern must either be string or have template and model');
    super.setDescriptionPattern('_template_', pattern.template);
    super.setDescriptionPattern('_model_', JSON.stringify(pattern.model));
  }
  /** @method updateVariable(handleName, record)
   * Modify value of named handle.
   */
  updateVariable(handleName, record) {
    const handle = this.handles.get(handleName);
    const newRecord = new (handle.entityClass)(record);
    handle.set(newRecord);
    return newRecord;
  }
  /** @method updateSet(handleName, record)
   * Modify or insert `record` into named handle.
   * Modification is done by removing the old record and reinserting the new one.
   */
  updateSet(handleName, record) {
    // Set the record into the right place in the set. If we find it
    // already present replace it, otherwise, add it.
    // TODO(dstockwell): Replace this with happy entity mutation approach.
    const handle = this.handles.get(handleName);
    const records = this._props[handleName];
    const target = records.find(r => r.id === record.id);
    if (target) {
      handle.remove(target);
    }
    handle.store(record);
  }
  /** @method boxQuery(box, userid)
   * Returns array of Entities found in BOXED data `box` that are owned by `userid`
   */
  boxQuery(box, userid) {
    return box.filter(item => userid === item.getUserID().split('|')[0]);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DomParticleBase;



/***/ }),
/* 87 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dom_context_js__ = __webpack_require__(18);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





// Class for rendering set slots. Stores a map from entity subID to its corresponding DomContext object.
class DomSetContext {
  constructor(containerKind, contextClass) {
    this._contextBySubId = {};
    this._containerKind = containerKind;
    this._contextClass = contextClass || __WEBPACK_IMPORTED_MODULE_1__dom_context_js__["a" /* DomContext */];
  }
  initContainer(container) {
    Object.keys(container).forEach(subId => {
      let subContext = this._contextBySubId[subId];
      if (!subContext || !subContext.isSameContainer(container[subId])) {
        // Replace the context corresponding to subId with a newly created context,
        // while maintaining the template name.
        subContext = new this._contextClass(null, this._containerKind, subId, subContext ? subContext._templateName : null);
        this._contextBySubId[subId] = subContext;
      }
      subContext.initContainer(container[subId]);
    });
    // Delete sub-contexts that don't have a container in the new containers map.
    Object.keys(this._contextBySubId).forEach(subId => {
      if (!container[subId]) {
        delete this._contextBySubId[subId];
      }
    });
  }
  updateParticleName(slotName, particleName) {
    Object.values(this._contextBySubId).forEach(context => context.updateParticleName(slotName, particleName));
  }
  isSameContainer(container) { // container is an Object {subId, dom-element}
    return Object.keys(this._contextBySubId).length == Object.keys(container).length &&
           !Object.keys(this._contextBySubId).find(subId => this._contextBySubId[subId].isSameContainer(container[subId]));
  }
  setTemplate(templatePrefix, templateName, template) {
    let isStringTemplateName = typeof templateName == 'string';
    let isStringTemplate = typeof template == 'string';
    Object.keys(this._contextBySubId).forEach(subId => {
      let templateNameForSubId = isStringTemplateName ? templateName : templateName[subId];
      if (templateNameForSubId) {
        let templateForSubId = (!template || isStringTemplate) ? template : template[templateNameForSubId];
        this._contextBySubId[subId].setTemplate(templatePrefix, templateNameForSubId, templateForSubId);
      }
    });
  }
  hasTemplate(templatePrefix) {
    return this._contextClass.hasTemplate(templatePrefix);
  }
  updateModel(model) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(model.items, `Model must contain items`);
    model.items.forEach(item => {
      // Properties from item override properties from model.
      item = Object.assign(Object.assign({}, model), item);
      delete item.items;
      if (this._contextBySubId[item.subId]) {
        this._contextBySubId[item.subId].updateModel(item);
      }
    });
  }
  clear() {
    Object.values(this._contextBySubId).forEach(context => context.clear());
  }
  createTemplateElement(template) {
    let templates = {};
    if (typeof template === 'string') {
      return this._contextClass.createTemplateElement(template);
    } else {
      Object.keys(template).forEach(subId => {
        templates[subId] = this._contextBySubId[subId].createTemplateElement(template[subId]);
      });
    }
    return templates;
  }
  stampTemplate(eventHandler, eventMapper) {
    Object.keys(this._contextBySubId).forEach(subId => {
      this._contextBySubId[subId].stampTemplate(eventHandler, eventMapper);
    });
  }
  observe(observer) {
    Object.values(this._contextBySubId).forEach(context => context.observe(observer));
  }
  getInnerContainer(innerSlotName) {
    let innerContainers = {};
    Object.keys(this._contextBySubId).forEach(subId => {
      innerContainers[subId] = this._contextBySubId[subId].getInnerContainer(innerSlotName);
    });
    return innerContainers;
  }
  initInnerContainers(slotSpec) {
    Object.values(this._contextBySubId).forEach(context => context.initInnerContainers(slotSpec));
  }
  isDirectInnerSlot(slot) {
    return Object.values(this._contextBySubId).find(context => context.isDirectInnerSlot(slot)) != null;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DomSetContext;



/***/ }),
/* 88 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = FakePecFactory;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__particle_execution_context_js__ = __webpack_require__(93);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__message_channel_js__ = __webpack_require__(92);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__loader_js__ = __webpack_require__(20);
// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt







// TODO: Make this generic so that it can also be used in-browser, or add a
// separate in-process browser pec-factory.
function FakePecFactory(id) {
  let channel = new __WEBPACK_IMPORTED_MODULE_1__message_channel_js__["a" /* MessageChannel */]();
  new __WEBPACK_IMPORTED_MODULE_0__particle_execution_context_js__["a" /* ParticleExecutionContext */](channel.port1, `${id}:inner`, new __WEBPACK_IMPORTED_MODULE_2__loader_js__["a" /* Loader */]());
  return channel.port2;
}


/***/ }),
/* 89 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return local_fetch; });
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

// 'export default fetch' works because 'fetch' is evaluated as an expression, which finds the
// appropriate global definition - but we don't want to use default exports.
// 'export {fetch}' doesn't work because 'fetch' is just a name in that context and is not defined.
// So we need to use an expression to find the global fetch function then map that for export.

const local_fetch = fetch;



/***/ }),
/* 90 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__random_js__ = __webpack_require__(95);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */



class Id {
  constructor(currentSession) {
    this._session = currentSession;
    this._currentSession = currentSession;
    this._nextIdComponent = 0;
    this._components = [];
  }
  static newSessionId() {
    let session = Math.floor(__WEBPACK_IMPORTED_MODULE_0__random_js__["a" /* Random */].next() * Math.pow(2, 50)) + '';
    return new Id(session);
  }

  fromString(string) {
    let components = string.split(':');

    let id = new Id(this._currentSession);

    if (components[0][0] == '!') {
      id._session = components[0].slice(1);
      id._components = components.slice(1);
    } else {
      id._components = components;
    }

    return id;
  }

  toString() {
    return `!${this._session}:${this._components.join(':')}`;
  }

  // Only use this for testing!
  toStringWithoutSessionForTesting() {
    return this._components.join(':');
  }

  createId(component) {
    if (component == undefined)
      component = '';
    let id = new Id(this._currentSession);
    id._components = this._components.slice();
    id._components.push(component + this._nextIdComponent++);
    return id;
  }

  equal(id) {
    if (id._session !== this._session)
      return false;
    return this.equalWithoutSession(id);
  }

  // Only use this for testing!
  equalWithoutSessionForTesting(id) {
    if (id._components.length !== this._components.length)
      return false;
    for (let i = 0; i < id._components.length; i++)
      if (id._components[i] !== this._components[i])
        return false;

    return true;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Id;



/***/ }),
/* 91 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */


class ManifestMeta {
  constructor() {
    this.storageKey = null;
    this.name = null;
  }
  apply(items) {
    items.forEach(item => { this[item.key] = item.value; });
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ManifestMeta;



/***/ }),
/* 92 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */


class MessagePort {
  constructor(channel, id, other) {
    this._channel = channel;
    this._id = id;
    this._other = other;
    this._onmessage = undefined;
  }

  postMessage(message) {
    this._channel._post(this._other, message);
  }

  set onmessage(f) {
    this._onmessage = f;
  }

  close() {
    this.postMessage = function() {};
  }
}

class MessageEvent {
  constructor(message) {
    this.data = message;
  }
}

class MessageChannel {
  constructor() {
    this.port1 = new MessagePort(this, 0, 1);
    this.port2 = new MessagePort(this, 1, 0);
    this._ports = [this.port1, this.port2];
  }

  async _post(id, message) {
    message = JSON.parse(JSON.stringify(message));
    if (this._ports[id]._onmessage) {
      try {
        // Yield so that we deliver the message asynchronously.
        await 0;
        await this._ports[id]._onmessage(new MessageEvent(message));
      } catch (e) {
        console.error('Exception in particle code\n', e);
      }
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MessageChannel;



/***/ }),
/* 93 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handle_js__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__api_channel_js__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__storage_proxy_js__ = __webpack_require__(104);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */







class ParticleExecutionContext {
  constructor(port, idBase, loader) {
    this._apiPort = new __WEBPACK_IMPORTED_MODULE_2__api_channel_js__["b" /* PECInnerPort */](port);
    this._particles = [];
    this._idBase = idBase;
    this._nextLocalID = 0;
    this._loader = loader;
    this._pendingLoads = [];
    this._scheduler = new __WEBPACK_IMPORTED_MODULE_3__storage_proxy_js__["a" /* StorageProxyScheduler */]();

    /*
     * This code ensures that the relevant types are known
     * in the scope object, because otherwise we can't do
     * particleSpec resolution, which is currently a necessary
     * part of particle construction.
     *
     * Possibly we should eventually consider having particle
     * specifications separated from particle classes - and
     * only keeping type information on the arc side.
     */
    this._apiPort.onDefineHandle = ({type, identifier, name}) => {
      return new __WEBPACK_IMPORTED_MODULE_3__storage_proxy_js__["b" /* StorageProxy */](identifier, type, this._apiPort, this, this._scheduler, name);
    };

    this._apiPort.onCreateHandleCallback = ({type, id, name, callback}) => {
      let proxy = new __WEBPACK_IMPORTED_MODULE_3__storage_proxy_js__["b" /* StorageProxy */](id, type, this._apiPort, this, this._scheduler, name);
      return [proxy, () => callback(proxy)];
    };

    this._apiPort.onMapHandleCallback = ({id, callback}) => {
      return [id, () => callback(id)];
    };

    this._apiPort.onCreateSlotCallback = ({hostedSlotId, callback}) => {
      return [hostedSlotId, () => callback(hostedSlotId)];
    };

    this._apiPort.onInnerArcRender = ({transformationParticle, transformationSlotName, hostedSlotId, content}) => {
      transformationParticle.renderHostedSlot(transformationSlotName, hostedSlotId, content);
    };

    this._apiPort.onStop = () => {
      if (global.close) {
        global.close();
      }
    };

    this._apiPort.onInstantiateParticle =
      ({id, spec, handles}) => this._instantiateParticle(id, spec, handles);

    this._apiPort.onSimpleCallback = ({callback, data}) => callback(data);

    this._apiPort.onConstructArcCallback = ({callback, arc}) => callback(arc);

    this._apiPort.onAwaitIdle = ({version}) =>
      this.idle.then(a => {
        // TODO: dom-particles update is async, this is a workaround to allow dom-particles to
        // update relevance, after handles are updated. Needs better idle signal.
        setTimeout(() => { this._apiPort.Idle({version, relevance: this.relevance}); }, 0);
      });

    this._apiPort.onUIEvent = ({particle, slotName, event}) => particle.fireEvent(slotName, event);

    this._apiPort.onStartRender = ({particle, slotName, contentTypes}) => {
      /** @class Slot
       * A representation of a consumed slot. Retrieved from a particle using
       * particle.getSlot(name)
       */
      class Slotlet {
        constructor(pec, particle, slotName) {
          this._slotName = slotName;
          this._particle = particle;
          this._handlers = new Map();
          this._pec = pec;
          this._requestedContentTypes = new Set();
        }
        get particle() { return this._particle; }
        get slotName() { return this._slotName; }
        get isRendered() { return this._isRendered; }
        /** @method render(content)
         * renders content to the slot.
         */
        render(content) {
          this._pec._apiPort.Render({particle, slotName, content});

          Object.keys(content).forEach(key => { this._requestedContentTypes.delete(key); });
          // Slot is considered rendered, if a non-empty content was sent and all requested content types were fullfilled.
          this._isRendered = this._requestedContentTypes.size == 0 && (Object.keys(content).length > 0);
        }
        /** @method registerEventHandler(name, f)
         * registers a callback to be invoked when 'name' event happens.
         */
        registerEventHandler(name, f) {
          if (!this._handlers.has(name)) {
            this._handlers.set(name, []);
          }
          this._handlers.get(name).push(f);
        }
        clearEventHandlers(name) {
          this._handlers.set(name, []);
        }
        fireEvent(event) {
          for (let handler of this._handlers.get(event.handler) || []) {
            handler(event);
          }
        }
      }

      particle._slotByName.set(slotName, new Slotlet(this, particle, slotName));
      particle.renderSlot(slotName, contentTypes);
    };

    this._apiPort.onStopRender = ({particle, slotName}) => {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(particle._slotByName.has(slotName),
        `Stop render called for particle ${particle.name} slot ${slotName} without start render being called.`);
      particle._slotByName.delete(slotName);
    };
  }

  generateIDComponents() {
    return {base: this._idBase, component: () => this._nextLocalID++};
  }

  generateID() {
    return `${this._idBase}:${this._nextLocalID++}`;
  }

  innerArcHandle(arcId, particleId) {
    let pec = this;
    return {
      createHandle: function(type, name, hostParticle) {
        return new Promise((resolve, reject) =>
          pec._apiPort.ArcCreateHandle({arc: arcId, type, name, callback: proxy => {
            let handle = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__handle_js__["a" /* handleFor */])(proxy, proxy.type.isCollection, name, particleId);
            handle.entityClass = (proxy.type.isCollection ? proxy.type.primitiveType() : proxy.type).entitySchema.entityClass();
            resolve(handle);
            if (hostParticle) {
              proxy.register(hostParticle, handle);
            }
          }}));
      },
      mapHandle: function(handle) {
        return new Promise((resolve, reject) =>
          pec._apiPort.ArcMapHandle({arc: arcId, handle, callback: id => {
            resolve(id);
          }}));
      },
      createSlot: function(transformationParticle, transformationSlotName, hostedParticleName, hostedSlotName) {
        return new Promise((resolve, reject) =>
          pec._apiPort.ArcCreateSlot({arc: arcId, transformationParticle, transformationSlotName, hostedParticleName, hostedSlotName, callback: hostedSlotId => {
            resolve(hostedSlotId);
          }}));
      },
      loadRecipe: function(recipe) {
        // TODO: do we want to return a promise on completion?
        return new Promise((resolve, reject) =>
          pec._apiPort.ArcLoadRecipe({arc: arcId, recipe, callback: a => {
            if (a == undefined)
              resolve();
            else
              reject(a);
          }}));
      }
    };
  }

  defaultCapabilitySet() {
    return {
      constructInnerArc: particle => {
        return new Promise((resolve, reject) =>
          this._apiPort.ConstructInnerArc({callback: arcId => {resolve(this.innerArcHandle(arcId, particle.id));}, particle}));
      }
    };
  }

  async _instantiateParticle(id, spec, proxies) {
    let name = spec.name;
    let resolve = null;
    let p = new Promise((res, rej) => resolve = res);
    this._pendingLoads.push(p);
    let clazz = await this._loader.loadParticleClass(spec);
    let capabilities = this.defaultCapabilitySet();
    let particle = new clazz(); // TODO: how can i add an argument to DomParticle ctor?
    particle.id = id;
    particle.capabilities = capabilities;
    this._particles.push(particle);

    let handleMap = new Map();
    let registerList = [];
    proxies.forEach((proxy, name) => {
      let connSpec = spec.connectionMap.get(name);
      let handle = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__handle_js__["a" /* handleFor */])(proxy, proxy.type.isCollection, name, id, connSpec.isInput, connSpec.isOutput);
      let type = proxy.type.isCollection ? proxy.type.primitiveType() : proxy.type;
      if (type.isEntity) {
        handle.entityClass = type.entitySchema.entityClass();
      }
      handleMap.set(name, handle);

      // Defer registration of handles with proxies until after particles have a chance to
      // configure them in setHandles.
      registerList.push({proxy, particle, handle});
    });

    return [particle, async () => {
      resolve();
      let idx = this._pendingLoads.indexOf(p);
      this._pendingLoads.splice(idx, 1);
      await particle.setHandles(handleMap);
      registerList.forEach(({proxy, particle, handle}) => proxy.register(particle, handle));
    }];
  }

  get relevance() {
    let rMap = new Map();
    this._particles.forEach(p => {
      if (p.relevances.length == 0)
        return;
      rMap.set(p, p.relevances);
      p.relevances = [];
    });
    return rMap;
  }

  get busy() {
    if (this._pendingLoads.length > 0 || this._scheduler.busy)
      return true;
    return false;
  }

  get idle() {
    if (!this.busy) {
      return Promise.resolve();
    }
    return Promise.all([this._scheduler.idle, ...this._pendingLoads]).then(() => this.idle);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ParticleExecutionContext;


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(34)))

/***/ }),
/* 94 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__api_channel_js__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__manifest_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_resolver_js__ = __webpack_require__(99);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__arc_exceptions_js__ = __webpack_require__(75);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */








class ParticleExecutionHost {
  constructor(port, slotComposer, arc) {
    this._particles = [];
    this._apiPort = new __WEBPACK_IMPORTED_MODULE_1__api_channel_js__["a" /* PECOuterPort */](port, arc);
    this.close = () => {
      port.close();
      this._apiPort.close();
    };
    this._arc = arc;
    this._nextIdentifier = 0;
    this.slotComposer = slotComposer;

    this._apiPort.onRender = ({particle, slotName, content}) => {
      if (this.slotComposer) {
        this.slotComposer.renderSlot(particle, slotName, content);
      }
    };

    this._apiPort.onInitializeProxy = async ({handle, callback}) => {
      let target = {};
      handle.on('change', data => this._apiPort.SimpleCallback({callback, data}), target);
    };

    this._apiPort.onSynchronizeProxy = async ({handle, callback}) => {
      let data = await handle.toLiteral();
      this._apiPort.SimpleCallback({callback, data});
    };

    this._apiPort.onHandleGet = async ({handle, callback}) => {
      this._apiPort.SimpleCallback({callback, data: await handle.get()});
    };

    this._apiPort.onHandleToList = async ({handle, callback}) => {
      this._apiPort.SimpleCallback({callback, data: await handle.toList()});
    };

    this._apiPort.onHandleSet = ({handle, data, particleId, barrier}) => handle.set(data, particleId, barrier);
    this._apiPort.onHandleClear = ({handle, particleId, barrier}) => handle.clear(particleId, barrier);
    this._apiPort.onHandleStore = ({handle, data: {value, keys}, particleId}) => handle.store(value, keys, particleId);
    this._apiPort.onHandleRemove = ({handle, data: {value, keys}, particleId}) => handle.remove(value, keys, particleId);

    this._apiPort.onIdle = ({version, relevance}) => {
      if (version == this._idleVersion) {
        this._idlePromise = undefined;
        this._idleResolve(relevance);
      }
    };

    this._apiPort.onConstructInnerArc = ({callback, particle}) => {
      let arc = {particle};
      this._apiPort.ConstructArcCallback({callback, arc});
    };

    this._apiPort.onArcCreateHandle = async ({callback, arc, type, name}) => {
      let store = await this._arc.createStore(type, name);
      this._apiPort.CreateHandleCallback(store, {type, name, callback, id: store.id});
    };

    this._apiPort.onArcMapHandle = async ({callback, arc, handle}) => {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._arc.findStoreById(handle.id), `Cannot map nonexistent handle ${handle.id}`);
      // TODO: create hosted handles map with specially generated ids instead of returning the real ones?
      this._apiPort.MapHandleCallback({}, {callback, id: handle.id});
    };

    this._apiPort.onArcCreateSlot = ({callback, arc, transformationParticle, transformationSlotName, hostedParticleName, hostedSlotName}) => {
      let hostedSlotId;
      if (this.slotComposer) {
        hostedSlotId = this.slotComposer.createHostedSlot(transformationParticle, transformationSlotName, hostedParticleName, hostedSlotName);
      }
      this._apiPort.CreateSlotCallback({}, {callback, hostedSlotId});
    };

    this._apiPort.onArcLoadRecipe = async ({arc, recipe, callback}) => {
      let manifest = await __WEBPACK_IMPORTED_MODULE_2__manifest_js__["a" /* Manifest */].parse(recipe, {loader: this._arc._loader, fileName: ''});
      let error = undefined;
      // TODO(wkorman): Consider reporting an error or at least warning if
      // there's more than one recipe since currently we silently ignore them.
      let recipe0 = manifest.recipes[0];
      if (recipe0) {
        const missingHandles = [];
        for (let handle of recipe0.handles) {
          const fromHandle = this._arc.findStoreById(handle.id) || manifest.findStoreById(handle.id);
          if (!fromHandle) {
            missingHandles.push(handle);
            continue;
          }
          handle.mapToStorage(fromHandle);
        }
        if (missingHandles.length > 0) {
          const resolvedRecipe = await new __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_resolver_js__["a" /* RecipeResolver */](this._arc).resolve(recipe0);
          if (!resolvedRecipe) {
            error = `Recipe couldn't load due to missing handles [recipe=${recipe0}, missingHandles=${missingHandles.join('\n')}].`;
          } else {
            recipe0 = resolvedRecipe;
          }
        }
        if (!error) {
          let options = {errors: new Map()};
          // If we had missing handles but we made it here, then we ran recipe
          // resolution which will have already normalized the recipe.
          if ((missingHandles.length > 0) || recipe0.normalize(options)) {
            if (recipe0.isResolved()) {
              // TODO: pass tags through too, and reconcile with similar logic
              // in Arc.deserialize.
              manifest.stores.forEach(store => this._arc._registerStore(store, []));
              this._arc.instantiate(recipe0, arc);
            } else {
              error = `Recipe is not resolvable ${recipe0.toString({showUnresolved: true})}`;
            }
          } else {
            error = `Recipe ${recipe0} could not be normalized:\n${[...options.errors.values()].join('\n')}`;
          }
        }
      } else {
        error = 'No recipe defined';
      }
      this._apiPort.SimpleCallback({callback, data: error});
    };

    this._apiPort.onRaiseSystemException = async ({exception, methodName, particleId}) => {
     let particle = this._arc.particleHandleMaps.get(particleId).spec.name;
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__arc_exceptions_js__["a" /* reportSystemException */])(exception, methodName, particle);
    };
  }

  stop() {
    this._apiPort.Stop();
  }

  get idle() {
    if (this._idlePromise == undefined) {
      this._idlePromise = new Promise((resolve, reject) => {
        this._idleResolve = resolve;
      });
    }
    this._idleVersion = this._nextIdentifier;
    this._apiPort.AwaitIdle({version: this._nextIdentifier++});
    return this._idlePromise;
  }

  get messageCount() {
    return this._apiPort.messageCount;
  }

  sendEvent(particle, slotName, event) {
    this._apiPort.UIEvent({particle, slotName, event});
  }

  instantiate(particleSpec, id, spec, handles) {
    handles.forEach(handle => {
      this._apiPort.DefineHandle(handle, {type: handle.type.resolvedType(), name: handle.name});
    });

    // TODO: rename this concept to something like instantiatedParticle, handle or registration.
    this._apiPort.InstantiateParticle(particleSpec, {id, spec, handles});
    return particleSpec;
  }
  startRender({particle, slotName, contentTypes}) {
    this._apiPort.StartRender({particle, slotName, contentTypes});
  }
  stopRender({particle, slotName}) {
    this._apiPort.StopRender({particle, slotName});
  }
  innerArcRender(transformationParticle, transformationSlotName, hostedSlotId, content) {
    this._apiPort.InnerArcRender({transformationParticle, transformationSlotName, hostedSlotId, content});
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ParticleExecutionHost;



/***/ }),
/* 95 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

let random = Math.random;

const seededRandom = () => {
  return seededRandom.x = Math.pow(seededRandom.x + Math.E, Math.PI) % 1;
};

class Random {
  static next() {
    return random();
  }

  static seedForTests() {
    seededRandom.x = 0; // Re-seed on each call for test isolation.
    random = seededRandom;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Random;



/***/ }),
/* 96 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__loader_js__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__manifest_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__arc_js__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__slot_composer_js__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__debug_strategy_explorer_adapter_js__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__tracelib_trace_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__strategies_convert_constraints_to_connections_js__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__strategies_match_free_handles_to_connections_js__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__strategies_resolve_recipe_js__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__strategies_create_handle_group_js__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__strategies_add_use_handles_js__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__strategies_rulesets_js__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__strategies_map_slots_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__debug_devtools_connection_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__recipe_handle_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__platform_assert_web_js__ = __webpack_require__(0);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */




















class RelevantContextRecipes extends __WEBPACK_IMPORTED_MODULE_4__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(context, affordance) {
    super();
    this._recipes = [];
    for (let recipe of context.recipes) {
      if (affordance && recipe.particles.find(p => p.spec && !p.spec.matchAffordance(affordance)) !== undefined) {
        continue;
      }

      recipe = recipe.clone();
      let options = {errors: new Map()};
      if (recipe.normalize(options)) {
        this._recipes.push(recipe);
      } else {
        console.warn(`could not normalize a context recipe: ${[...options.errors.values()].join('\n')}.\n${recipe.toString()}`);
      }
    }
  }

  async generate({generation}) {
    if (generation != 0) {
      return [];
    }

    return this._recipes.map(recipe => ({
      result: recipe,
      score: 1,
      derivation: [{strategy: this, parent: undefined}],
      hash: recipe.digest(),
      valid: Object.isFrozen(recipe),
    }));
  }
}

const IndexStrategies = [
  __WEBPACK_IMPORTED_MODULE_7__strategies_convert_constraints_to_connections_js__["a" /* ConvertConstraintsToConnections */],
  __WEBPACK_IMPORTED_MODULE_11__strategies_add_use_handles_js__["a" /* AddUseHandles */],
  __WEBPACK_IMPORTED_MODULE_9__strategies_resolve_recipe_js__["a" /* ResolveRecipe */],
  __WEBPACK_IMPORTED_MODULE_8__strategies_match_free_handles_to_connections_js__["a" /* MatchFreeHandlesToConnections */],
  // This one is not in-line with 'transparent' interfaces, but it operates on
  // recipes without looking at the context and cannot run after AddUseHandles.
  // We will revisit this list when we take a stab at recipe interfaces.
  __WEBPACK_IMPORTED_MODULE_10__strategies_create_handle_group_js__["a" /* CreateHandleGroup */]
];

class RecipeIndex {
  constructor(context, affordance) {
    let trace = __WEBPACK_IMPORTED_MODULE_6__tracelib_trace_js__["a" /* Tracing */].start({cat: 'indexing', name: 'RecipeIndex::constructor', overview: true});
    let arcStub = new __WEBPACK_IMPORTED_MODULE_2__arc_js__["a" /* Arc */]({
      id: 'index-stub',
      context: new __WEBPACK_IMPORTED_MODULE_1__manifest_js__["a" /* Manifest */]({id: 'empty-context'}),
      slotComposer: affordance ? new __WEBPACK_IMPORTED_MODULE_3__slot_composer_js__["a" /* SlotComposer */]({affordance, noRoot: true}) : null,
      recipeIndex: {},
      // TODO: Not speculative really, figure out how to mark it so DevTools doesn't pick it up.
      speculative: true
    });
    let strategizer = new __WEBPACK_IMPORTED_MODULE_4__strategizer_strategizer_js__["a" /* Strategizer */](
      [
        new RelevantContextRecipes(context, affordance),
        ...IndexStrategies.map(S => new S(arcStub))
      ],
      [],
      __WEBPACK_IMPORTED_MODULE_12__strategies_rulesets_js__["a" /* Empty */]
    );
    this.ready = trace.endWith(new Promise(async resolve => {
      let generations = [];

      do {
        let record = await strategizer.generate();
        generations.push({record, generated: strategizer.generated});
      } while (strategizer.generated.length + strategizer.terminal.length > 0);

      if (__WEBPACK_IMPORTED_MODULE_14__debug_devtools_connection_js__["a" /* DevtoolsConnection */].isConnected) {
        __WEBPACK_IMPORTED_MODULE_5__debug_strategy_explorer_adapter_js__["a" /* StrategyExplorerAdapter */].processGenerations(
            generations, __WEBPACK_IMPORTED_MODULE_14__debug_devtools_connection_js__["a" /* DevtoolsConnection */].get(), {label: 'Index', keep: true});
      }

      let population = strategizer.population;
      let candidates = new Set(population);
      for (let result of population) {
        for (let deriv of result.derivation) {
          if (deriv.parent) candidates.delete(deriv.parent);
        }
      }
      this._recipes = [...candidates].map(r => r.result);
      this._isReady = true;
      resolve(true);
    }));
  }

  get recipes() {
    if (!this._isReady) throw Error('await on recipeIndex.ready before accessing');
    return this._recipes;
  }

  ensureReady() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_17__platform_assert_web_js__["a" /* assert */])(this._isReady, 'await on recipeIndex.ready before accessing');
  }

  // Given provided handle and requested fates, finds handles with
  // matching type and requested fate.
  findHandleMatch(handle, requestedFates) {
    this.ensureReady();

    let counts = __WEBPACK_IMPORTED_MODULE_15__recipe_recipe_util_js__["a" /* RecipeUtil */].directionCounts(handle);
    let particleNames = handle.connections.map(conn => conn.particle.name);

    let results = [];
    for (let recipe of this._recipes) {
      for (let otherHandle of recipe.handles) {
        if (requestedFates && !(requestedFates.includes(otherHandle.fate))
            || otherHandle.connections.length === 0
            || otherHandle.name === 'descriptions') continue;

        // If we're connecting only create/use/? handles, we require communication.
        // We don't do that if at least one handle is map/copy, as in such case
        // everyone can be a reader.
        // We inspect both fate and originalFate as copy ends up as use in an
        // active recipe, and ? could end up as anything.
        let fates = [handle.originalFate, handle.fate, otherHandle.originalFate, otherHandle.fate];
        if (!fates.includes('copy') && !fates.includes('map')) {
          let otherCounts = __WEBPACK_IMPORTED_MODULE_15__recipe_recipe_util_js__["a" /* RecipeUtil */].directionCounts(otherHandle);
          // Someone has to read and someone has to write.
          if (otherCounts.in + counts.in === 0
              || otherCounts.out + counts.out === 0) continue;
        }

        // If one or the handles have tags, we need to have overlap.
        if (handle.tags.length > 0 || otherHandle.tags.length > 0) {
          if (!handle.tags.some(t => otherHandle.tags.includes(t))) continue;
        }

        // If types don't match.
        if (!__WEBPACK_IMPORTED_MODULE_16__recipe_handle_js__["a" /* Handle */].effectiveType(handle._mappedType,
            [...handle.connections, ...otherHandle.connections])) continue;

        // If we're connecting the same sets of particles, that's probably not OK.
        // This is a poor workaround for connecting the exact same recipes together, to be improved.
        const otherParticleNames = otherHandle.connections.map(conn => conn.particle.name);
        const connectedParticles = new Set([...particleNames, ...otherParticleNames]);
        if (connectedParticles.size == particleNames.length
            && particleNames.length == otherParticleNames.length) continue;

        results.push(otherHandle);
      }
    }
    return results;
  }

  // Given a slot, find consume slot connections that could be connected to it.
  findConsumeSlotConnectionMatch(slot) {
    this.ensureReady();

    let consumeConns = [];
    for (let recipe of this._recipes) {
      for (let slotConn of recipe.slotConnections) {
        if (!slotConn.targetSlot && __WEBPACK_IMPORTED_MODULE_13__strategies_map_slots_js__["a" /* MapSlots */].specMatch(slotConn, slot) && __WEBPACK_IMPORTED_MODULE_13__strategies_map_slots_js__["a" /* MapSlots */].tagsOrNameMatch(slotConn, slot)) {
          let matchingHandles = [];
          if (!__WEBPACK_IMPORTED_MODULE_13__strategies_map_slots_js__["a" /* MapSlots */].handlesMatch(slotConn, slot)) {
            // Find potential handle connections to coalesce
            slot.handleConnections.forEach(slotHandleConn => {
              let matchingConns = Object.values(slotConn.particle.connections).filter(particleConn => {
                return particleConn.direction !== 'host'
                    && (!particleConn.handle || !particleConn.handle.id || particleConn.handle.id == slotHandleConn.handle.id)
                    && __WEBPACK_IMPORTED_MODULE_16__recipe_handle_js__["a" /* Handle */].effectiveType(slotHandleConn.handle._mappedType, [particleConn]);
              });
              matchingConns.forEach(matchingConn => {
                if (this._fatesAndDirectionsMatch(slotHandleConn, matchingConn)) {
                  matchingHandles.push({handle: slotHandleConn.handle, matchingConn});
                }
              });
            });

            if (matchingHandles.length == 0) {
              continue;
            }
          }
          consumeConns.push({slotConn, matchingHandles});
        }
      }
    }
    return consumeConns;
  }

  // Helper function that determines whether handle connections in a provided slot
  // and a potential consuming slot connection could be match, considering their fates and directions.
  // `slotHandleConn` is a handle connection restricting the provided slot.
  // `matchingHandleConn` - a handle connection of a particle, whose slot connection is explored
  // as a potential match to a slot above.
  _fatesAndDirectionsMatch(slotHandleConn, matchingHandleConn) {
    let matchingHandle = matchingHandleConn.handle;
    let allMatchingHandleConns = matchingHandle ? matchingHandle.connections : [matchingHandleConn];
    let matchingHandleConnsHasOutput = allMatchingHandleConns.find(conn => ['out', 'inout'].includes(conn.direction));
    switch (slotHandleConn.handle.fate) {
      case 'create':
        // matching handle not defined or its fate is 'create' or '?'.
        return !matchingHandle || ['use', '?'].includes(matchingHandle.fate);
      case 'use':
        // matching handle is not defined or its fate is either 'use' or '?'.
        return !matchingHandle || ['use', '?'].includes(matchingHandle.fate);
      case 'copy':
        // Any handle fate, except explicit 'create'.
        return !matchingHandle || matchingHandle.fate != 'create';
      case 'map':
        // matching connections don't have output direction and matching handle's fate isn't copy.
        return !matchingHandleConnsHasOutput && (!matchingHandle || matchingHandle.fate != 'copy');
      case '?':
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_17__platform_assert_web_js__["a" /* assert */])(false, `Unexpected '?' fate in terminal recipe`);
        break;
      default:
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_17__platform_assert_web_js__["a" /* assert */])(false, `Unexpected fate ${slotHandleConn.handle.fate}`);
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = RecipeIndex;



/***/ }),
/* 97 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__type_js__ = __webpack_require__(4);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class HandleConnection {
  constructor(name, particle) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particle);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particle.recipe);
    this._recipe = particle.recipe;
    this._name = name;
    this._tags = [];
    this._type = undefined;
    this._rawType = undefined;
    this._direction = undefined;
    this._particle = particle;
    this._handle = undefined;
  }

  _clone(particle, cloneMap) {
    if (cloneMap.has(this)) {
      return cloneMap.get(this);
    }
    let handleConnection = new HandleConnection(this._name, particle);
    handleConnection._tags = [...this._tags];
    // Note that _rawType will be cloned later by the particle that references this connection.
    // Doing it there allows the particle to maintain variable associations across the particle
    // scope.    
    handleConnection._rawType = this._rawType;
    handleConnection._direction = this._direction;
    if (this._handle != undefined) {
      handleConnection._handle = cloneMap.get(this._handle);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handleConnection._handle !== undefined);
      handleConnection._handle.connections.push(handleConnection);
    }
    cloneMap.set(this, handleConnection);
    return handleConnection;
  }

  _normalize() {
    this._tags.sort();
    // TODO: type?
    Object.freeze(this);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["a" /* compareComparables */](this._particle, other._particle)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this._name, other._name)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["c" /* compareArrays */](this._tags, other._tags, __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */])) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["a" /* compareComparables */](this._handle, other._handle)) != 0) return cmp;
    // TODO: add type comparison
    // if ((cmp = util.compareStrings(this._type, other._type)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this._direction, other._direction)) != 0) return cmp;
    return 0;
  }

  get recipe() { return this._recipe; }
  get name() { return this._name; } // Parameter name?
  get tags() { return this._tags; }
  get type() {
    if (this._type)
      return this._type;
    return this._rawType;
  }
  get rawType() {
    return this._rawType;
  }
  get direction() { return this._direction; } // in/out
  get isInput() {
    return this.direction == 'in' || this.direction == 'inout';
  }
  get isOutput() {
    return this.direction == 'out' || this.direction == 'inout';
  }
  get handle() { return this._handle; } // Handle?
  get particle() { return this._particle; } // never null

  set tags(tags) { this._tags = tags; }
  set type(type) {
    this._rawType = type;
    this._type = undefined;
    this._resetHandleType();
  }

  set direction(direction) {
    this._direction = direction;
    this._resetHandleType();
  }

  get spec() {
    if (this.particle.spec == null)
      return null;
    return this.particle.spec.connectionMap.get(this.name);
  }

  get isOptional() {
    if (this.spec == null)
      return false;
    return this.spec.isOptional;
  }

  _isValid(options) {
    if (this.direction && !['in', 'out', 'inout', 'host'].includes(this.direction)) {
      if (options && options.errors) {
        options.errors.set(this, `Invalid direction '${this.direction}' for handle connection '${this.particle.name}::${this.name}'`);
      }
      return false;
    }
    if (this.type && this.spec) {
      let connectionSpec = this.spec;
      if (!connectionSpec.isCompatibleType(this.rawType)) {
        if (options && options.errors) {
          options.errors.set(this, `Type '${this.rawType} for handle connection '${this.particle.name}::${this.name}' doesn't match particle spec's type '${connectionSpec.type}'`);
        }
        return false;
      }
      if (this.direction != connectionSpec.direction) {
        if (options && options.errors) {
          options.errors.set(this, `Direction '${this.direction}' for handle connection '${this.particle.name}::${this.name}' doesn't match particle spec's direction '${connectionSpec.direction}'`);
        }
        return false;
      }
    }
    return true;
  }

  isResolved(options) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this));

    if (this.isOptional) {
      return true;
    }

    let parent;
    if (this.spec && this.spec.parentConnection)
      parent = this.particle.connections[this.spec.parentConnection.name];

    // TODO: This should use this._type, or possibly not consider type at all.
    if (!this.type) {
      if (options) {
        options.details = 'missing type';
      }
      return false;
    }
    if (!this._direction) {
      if (options) {
        options.details = 'missing direction';
      }
      return false;
    }
    if (!this.handle) {
      if (parent && parent.isOptional && !parent.handle)
        return true;
      if (options) {
        options.details = 'missing handle';
      }
      return false;
    } else if (parent) {
      if (!parent.handle) {
        if (options) {
          options.details = 'parent connection missing handle';
        }
        return false;
      }
    }
    return true;
  }

  _resetHandleType() {
    if (this._handle)
      this._handle._type = undefined;
  }

  connectToHandle(handle) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(handle.recipe == this.recipe);
    this._handle = handle;
    this._resetHandleType();
    this._handle.connections.push(this);
  }

  disconnectHandle() {
    let idx = this._handle.connections.indexOf(this);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx >= 0);
    this._handle.connections.splice(idx, 1);
    this._handle = undefined;
  }

  toString(nameMap, options) {
    let result = [];
    result.push(this.name || '*');
    // TODO: better deal with unspecified direction.
    result.push({'in': '<-', 'out': '->', 'inout': '=', 'host': '=', '`consume': '<-', '`provide': '->'}[this.direction] || this.direction || '=');
    if (this.handle) {
      result.push(`${(nameMap && nameMap.get(this.handle)) || this.handle.localName}`);
    }
    result.push(...this.tags.map(a => `#${a}`));

    if (options && options.showUnresolved) {
      if (!this.isResolved(options)) {
        result.push(`// unresolved handle-connection: ${options.details}`);
      }
    }

    return result.join(' ');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = HandleConnection;



/***/ }),
/* 98 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__slot_connection_js__ = __webpack_require__(100);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__handle_connection_js__ = __webpack_require__(97);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_js__ = __webpack_require__(5);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt






class Particle {
  constructor(recipe, name) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipe);
    this._recipe = recipe;
    this._id = undefined;
    this._name = name;
    this._localName = undefined;
    this._spec = undefined;
    this._verbs = [];

    this._connections = {};
    // TODO: replace with constraint connections on the recipe
    this._unnamedConnections = [];
    this._consumedSlotConnections = {}; // map of consumed Slot connections by slot name.
  }

  _copyInto(recipe, cloneMap) {
    let particle = recipe.newParticle(this._name);
    particle._id = this._id;
    particle._verbs = [...this._verbs];
    particle._spec = this._spec;

    Object.keys(this._connections).forEach(key => {
      particle._connections[key] = this._connections[key]._clone(particle, cloneMap);
    });
    particle._unnamedConnections = this._unnamedConnections.map(connection => connection._clone(particle, cloneMap));
    particle._cloneConnectionRawTypes();
    Object.keys(this._consumedSlotConnections).forEach(key => {
      particle._consumedSlotConnections[key] = this._consumedSlotConnections[key]._clone(particle, cloneMap);
    });

    return particle;
  }

  _cloneConnectionRawTypes() {
    // TODO(shans): evaluate whether this is the appropriate context root for cloneWithResolution
    let map = new Map();
    for (let connection of Object.values(this._connections))
      if (connection._rawType)
        connection._rawType = connection._rawType._cloneWithResolutions(map);
    for (let connection of this._unnamedConnections)
      if (connection._rawType)
        connection._rawType = connection._rawType._cloneWithResolutions(map);
  }

  _startNormalize() {
    this._localName = null;
    this._verbs.sort();
    let normalizedConnections = {};
    for (let key of (Object.keys(this._connections).sort())) {
      normalizedConnections[key] = this._connections[key];
    }
    this._connections = normalizedConnections;

    let normalizedSlotConnections = {};
    for (let key of (Object.keys(this._consumedSlotConnections).sort())) {
      normalizedSlotConnections[key] = this._consumedSlotConnections[key];
    }
    this._consumedSlotConnections = normalizedSlotConnections;
  }

  _finishNormalize() {
    this._unnamedConnections.sort(__WEBPACK_IMPORTED_MODULE_3__util_js__["a" /* compareComparables */]);
    Object.freeze(this);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_3__util_js__["b" /* compareStrings */](this._id, other._id)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_3__util_js__["b" /* compareStrings */](this._name, other._name)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_3__util_js__["b" /* compareStrings */](this._localName, other._localName)) != 0) return cmp;
    // TODO: spec?
    if ((cmp = __WEBPACK_IMPORTED_MODULE_3__util_js__["c" /* compareArrays */](this._verbs, other._verbs, __WEBPACK_IMPORTED_MODULE_3__util_js__["b" /* compareStrings */])) != 0) return cmp;
    // TODO: slots
    return 0;
  }

  _isValid(options) {
    if (!this.spec) {
      return true;
    }
    if (!this.name && !this.primaryVerb) {
      // Must have either name of a verb
      if (options && options.errors) {
        options.errors.set(this, `Particle has no name and no verb`);
      }
      return false;
    }
    // TODO: What
    return true;
  }

  isResolved(options) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this));
    let consumedSlotConnections = Object.values(this.consumedSlotConnections);
    if (consumedSlotConnections.length > 0) {
      let fulfilledSlotConnections = consumedSlotConnections.filter(connection => connection.targetSlot !== undefined);
      if (fulfilledSlotConnections.length == 0) {
        if (options && options.showUnresolved) {
          options.details = 'unfullfilled slot connections';
        }
        return false;
      }
    }
    if (!this.spec) {
      if (options && options.showUnresolved) {
        options.details = 'missing spec';
      }
      return false;
    }
    if (this.spec.connectionMap.size != Object.keys(this._connections).length) {
      if (options && options.showUnresolved) {
        options.details = 'unresolved connections';
      }
      return false;
    }
    if (this.unnamedConnections.length != 0) {
      if (options && options.showUnresolved) {
        options.details = `${this.unnamedConnections.length} unnamed connections`;
      }
      return false;
    }
    return true;
  }

  get recipe() { return this._recipe; }
  get localName() { return this._localName; }
  set localName(name) { this._localName = name; }
  get id() { return this._id; } // Not resolved until we have an ID.
  get name() { return this._name; }
  set name(name) { this._name = name; }
  get spec() { return this._spec; }
  get connections() { return this._connections; } // {parameter -> HandleConnection}
  get unnamedConnections() { return this._unnamedConnections; } // HandleConnection*
  get consumedSlotConnections() { return this._consumedSlotConnections; }
  get primaryVerb() { if (this._verbs.length > 0) return this._verbs[0]; }
  set verbs(verbs) { this._verbs = verbs; }

  set spec(spec) {
    this._spec = spec;
    for (let connectionName of spec.connectionMap.keys()) {
      let speccedConnection = spec.connectionMap.get(connectionName);
      let connection = this.connections[connectionName];
      if (connection == undefined) {
        connection = this.addConnectionName(connectionName);
      }
      // TODO: don't just overwrite here, check that the types
      // are compatible if one already exists.
      connection.type = speccedConnection.type;
      connection.direction = speccedConnection.direction;
    }
    spec.slots.forEach(slotSpec => {
      if (this._consumedSlotConnections[slotSpec.name] == undefined)
        this.addSlotConnection(slotSpec.name);
      this._consumedSlotConnections[slotSpec.name].slotSpec = slotSpec;
    });
  }

  addUnnamedConnection() {
    let connection = new __WEBPACK_IMPORTED_MODULE_2__handle_connection_js__["a" /* HandleConnection */](undefined, this);
    this._unnamedConnections.push(connection);
    return connection;
  }

  addConnectionName(name) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._connections[name] == undefined);
    this._connections[name] = new __WEBPACK_IMPORTED_MODULE_2__handle_connection_js__["a" /* HandleConnection */](name, this);
    return this._connections[name];
  }

  allConnections() {
    return Object.values(this._connections).concat(this._unnamedConnections);
  }

  ensureConnectionName(name) {
    return this._connections[name] || this.addConnectionName(name);
  }

  getConnectionByName(name) {
    return this._connections[name];
  }

  nameConnection(connection, name) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this._connections[name].handle, `Connection "${name}" already has a handle`);

    let idx = this._unnamedConnections.indexOf(connection);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx >= 0, `Cannot name '${name}' nonexistent unnamed connection.`);
    connection._name = name;

    connection.type = this._connections[name].type;
    if (connection.direction != this._connections[name].direction) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(connection.direction == 'inout',
             `Unnamed connection cannot adjust direction ${connection.direction} to ${name}'s direction ${this._connections[name].direction}`);
      connection.direction = this._connections[name].direction;
    }

    this._connections[name] = connection;
    this._unnamedConnections.splice(idx, 1);
  }

  addSlotConnection(name) {
    let slotConn = new __WEBPACK_IMPORTED_MODULE_1__slot_connection_js__["a" /* SlotConnection */](name, this);
    this._consumedSlotConnections[name] = slotConn;
    return slotConn;
  }

  removeSlotConnection(slotConnection) {
    this._consumedSlotConnections[slotConnection._name] = null;
    slotConnection.disconnectFromSlot();
  }

  remove() {
    this.recipe.removeParticle(this);
  }

  toString(nameMap, options) {
    let result = [];
    // TODO: we need at least name or verb(s)
    if (this.name) {
      result.push(this.name);

      result.push(`as ${(nameMap && nameMap.get(this)) || this.localName}`);
      if (this.primaryVerb && this.primaryVerb != this.name) {
        result.push(`// verb=${this.primaryVerb}`);
      }
    } else { // verb must exist, if there is no name.
      result.push(`&${this.primaryVerb}`);
    }
    if (options && options.showUnresolved) {
      if (!this.isResolved(options)) {
        result.push(`// unresolved particle: ${options.details}`);
      }
    }

    result = [result.join(' ')];

    for (let connection of this.unnamedConnections) {
      result.push(connection.toString(nameMap, options).replace(/^|(\n)/g, '$1  '));
    }
    for (let connection of Object.values(this.connections)) {
      result.push(connection.toString(nameMap, options).replace(/^|(\n)/g, '$1  '));
    }
    for (let slotConnection of Object.values(this._consumedSlotConnections)) {
      result.push(slotConnection.toString(nameMap, options).replace(/^|(\n)/g, '$1  '));
    }
    return result.join('\n');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Particle;



/***/ }),
/* 99 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategies_resolve_recipe_js__ = __webpack_require__(14);
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt



// Provides basic recipe resolution for recipes against a particular arc.
class RecipeResolver {
  constructor(arc) {
    this._resolver = new __WEBPACK_IMPORTED_MODULE_0__strategies_resolve_recipe_js__["a" /* ResolveRecipe */](arc);
  }

  // Attempts to run basic resolution on the given recipe. Returns a new
  // instance of the recipe normalized and resolved if possible. Returns null if
  // normalization or attempting to resolve slot connection fails.
  async resolve(recipe) {
    recipe = recipe.clone();
    let options = {errors: new Map()};
    if (!recipe.normalize(options)) {
      console.warn(`could not normalize a recipe: ${
              [...options.errors.values()].join('\n')}.\n${recipe.toString()}`);
      return null;
    }

    const result = await this._resolver.generate(
        {generated: [{result: recipe, score: 1}], terminal: []});
    return (result.length == 0) ? null : result[0].result;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = RecipeResolver;



/***/ }),
/* 100 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_js__ = __webpack_require__(5);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




class SlotConnection {
  constructor(name, particle) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particle);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(particle.recipe);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(name);

    this._recipe = particle.recipe;
    this._particle = particle;
    this._name = name;
    this._slotSpec = undefined; // isRequired + formFactor
    this._targetSlot = undefined; // Slot?
    this._providedSlots = {}; // Slot*
    this._tags = [];
  }

  remove() {
    this._particle.removeSlotConnection(this);
  }

  get recipe() { return this._recipe; }
  get particle() { return this._particle; }
  get name() { return this._name; }
  get slotSpec() { return this._slotSpec; }
  get targetSlot() { return this._targetSlot; }
  get providedSlots() { return this._providedSlots; }
  get tags() { return this._tags; }
  set tags(tags) { this._tags = tags; }

  set slotSpec(slotSpec) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.name == slotSpec.name);
    this._slotSpec = slotSpec;
    slotSpec.providedSlots.forEach(providedSlot => {
      let slot = this.providedSlots[providedSlot.name];
      if (slot == undefined) {
        slot = this.recipe.newSlot(providedSlot.name);
        slot._sourceConnection = this;
        slot._name = providedSlot.name;
        this.providedSlots[providedSlot.name] = slot;
      }
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(slot.handleConnections.length == 0, 'Handle connections must be empty');
      providedSlot.handles.forEach(handle => slot.handleConnections.push(this.particle.connections[handle]));
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(slot._name == providedSlot.name);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!slot.formFactor);
      slot.formFactor = providedSlot.formFactor;
    });
  }

  connectToSlot(targetSlot) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(targetSlot);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(!this.targetSlot);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.recipe == targetSlot.recipe, 'Cannot connect to slot from different recipe');

    this._targetSlot = targetSlot;
    targetSlot.consumeConnections.push(this);
  }

  disconnectFromSlot() {
    if (this._targetSlot) {
      this._targetSlot.removeConsumeConnection(this);
      this._targetSlot = undefined;
    }
  }
  
  _clone(particle, cloneMap) {
    if (cloneMap.has(this)) {
      return cloneMap.get(this);
    }

    let slotConnection = particle.addSlotConnection(this.name);
    slotConnection.tags = this.tags;
    if (this.slotSpec) {
      slotConnection._slotSpec = particle.spec.getSlotSpec(this.name);
    }

    cloneMap.set(this, slotConnection);
    return slotConnection;
  }

  _normalize() {
    let normalizedSlots = {};
    for (let key of (Object.keys(this._providedSlots).sort())) {
      normalizedSlots[key] = this._providedSlots[key];
    }
    this._providedSlots = normalizedSlots;
    Object.freeze(this);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this.name, other.name)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["a" /* compareComparables */](this._targetSlot, other._targetSlot)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["a" /* compareComparables */](this._particle, other._particle)) != 0) return cmp;
    return 0;
  }

  _isValid(options) {
    if (this._targetSlot && this._targetSlot.sourceConnection &&
        this._targetSlot != this._targetSlot.sourceConnection.providedSlots[this._targetSlot.name]) {
      if (options && options.errors) {
        options.errors.set(this, `Invalid target slot '${this._targetSlot.name}' for slot connection '${this.name}' of particle ${this.particle.name}`);
      }
      return false;
    }

    // TODO: add more checks.
    return true;
  }

  isResolved(options) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this));

    if (!this.name) {
      if (options) {
        options.details = 'missing name';
      }
      return false;
    }
    if (!this.particle) {
      if (options) {
        options.details = 'missing particle';
      }
      return false;
    }
    if (!this.targetSlot) {
      if (this.slotSpec.isRequired) {
        if (options) {
          options.details = 'missing target-slot';
        }
        return false;
      }
      return true;
    }

    return this.slotSpec.providedSlots.every(providedSlot => {
      if (providedSlot.isRequired && this.providedSlots[providedSlot.name].consumeConnections.length == 0) {
        if (options) {
          options.details = 'missing consuming slot';
        }
        return false;
      }
      return true;
    });
  }

  isConnectedToInternalSlot() {
    return this.targetSlot && (!!this.targetSlot.sourceConnection);
  }
  isConnectedToRemoteSlot() {
    return this.targetSlot && (!!this.targetSlot.id);
  }
  isConnected() {
    return this.isConnectedToInternalSlot() || this.isConnectedToRemoteSlot();
  }

  toString(nameMap, options) {
    let consumeRes = [];
    consumeRes.push('consume');
    consumeRes.push(`${this.name}`);
    if (this.targetSlot)
      consumeRes.push(`as ${(nameMap && nameMap.get(this.targetSlot)) || this.targetSlot.localName}`);

    if (options && options.showUnresolved) {
      if (!this.isResolved(options)) {
        consumeRes.push(`// unresolved slot-connection: ${options.details}`);
      }
    }

    let result = [];
    result.push(consumeRes.join(' '));

    Object.keys(this.providedSlots).forEach(psName => {
      let providedSlot = this.providedSlots[psName];
      let provideRes = [];
      provideRes.push('  provide');
      
      // Only assert that there's a spec for this provided slot if there's a spec for
      // the consumed slot .. otherwise this is just a constraint.
      if (this.slotSpec) {
        let providedSlotSpec = this.slotSpec.getProvidedSlotSpec(psName);
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(providedSlotSpec, `Cannot find providedSlotSpec for ${psName}`);
      }
      provideRes.push(`${psName} as ${(nameMap && nameMap.get(providedSlot)) || providedSlot}`);
      result.push(provideRes.join(' '));
    });
    return result.join('\n');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SlotConnection;



/***/ }),
/* 101 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_js__ = __webpack_require__(5);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




class Slot {
  constructor(recipe, name) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(recipe);

    this._recipe = recipe;
    this._id = undefined; // The ID of the slot in the context
    this._localName = undefined; // Local id within the recipe
    this._name = name;
    this._tags = [];

    this._formFactor = undefined;
    this._handleConnections = []; // HandleConnection* (can only be set if source connection is set and particle in slot connections is set)
    this._sourceConnection = undefined; // SlotConnection
    this._consumeConnections = []; // SlotConnection*
  }

  get recipe() { return this._recipe; }
  get id() { return this._id; }
  set id(id) { this._id = id; }
  get localName() { return this._localName; }
  set localName(localName) { this._localName = localName; }
  get name() { return this._name; }
  set name(name) { this._name = name; }
  get tags() { return this._tags; }
  set tags(tags) { this._tags = tags; }
  get formFactor() { return this._formFactor; }
  set formFactor(formFactor) { this._formFactor = formFactor; }
  get handleConnections() { return this._handleConnections; }
  get sourceConnection() { return this._sourceConnection; }
  set sourceConnection(sourceConnection) { this._sourceConnection = sourceConnection; }
  get consumeConnections() { return this._consumeConnections; }
  getProvidedSlotSpec() {
    // TODO: should this return something that indicates this isn't available yet instead of 
    // the constructed {isSet: false, tags: []}?
    return (this.sourceConnection && this.sourceConnection.slotSpec) ? this.sourceConnection.slotSpec.getProvidedSlotSpec(this.name) : {isSet: false, tags: []};
  }

  _copyInto(recipe, cloneMap) {
    let slot = undefined;
    if (!this.sourceConnection && this.id)
      slot = recipe.findSlot(this.id);
    if (slot == undefined) {
      slot = recipe.newSlot(this.name);
      slot._id = this.id;
      slot._formFactor = this.formFactor;
      slot._localName = this._localName;
      slot._tags = [...this._tags];
      // the connections are re-established when Particles clone their attached SlotConnection objects.
      slot._sourceConnection = cloneMap.get(this._sourceConnection);
      if (slot.sourceConnection)
        slot.sourceConnection._providedSlots[slot.name] = slot;
      this._handleConnections.forEach(connection => slot._handleConnections.push(cloneMap.get(connection)));
    }
    this._consumeConnections.forEach(connection => cloneMap.get(connection).connectToSlot(slot));
    return slot;
  }

  _startNormalize() {
    this.localName = null;
    this._tags.sort();
  }

  _finishNormalize() {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this._source));
    this._consumeConnections.forEach(cc => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(cc)));
    this._consumeConnections.sort(__WEBPACK_IMPORTED_MODULE_1__util_js__["a" /* compareComparables */]);
    Object.freeze(this);
  }

  _compareTo(other) {
    let cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this.id, other.id)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this.localName, other.localName)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */](this.formFactor, other.formFactor)) != 0) return cmp;
    if ((cmp = __WEBPACK_IMPORTED_MODULE_1__util_js__["c" /* compareArrays */](this._tags, other._tags, __WEBPACK_IMPORTED_MODULE_1__util_js__["b" /* compareStrings */])) != 0) return cmp;
    return 0;
  }

  removeConsumeConnection(slotConnection) {
    let idx = this._consumeConnections.indexOf(slotConnection);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(idx > -1);
    this._consumeConnections.splice(idx, 1);
    if (this._consumeConnections.length == 0)
      this.remove();
  }

  remove() {
    this._recipe.removeSlot(this);
  }

  isResolved(options) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(Object.isFrozen(this));

    if (options && options.showUnresolved) {
      options.details = [];
      if (!this._sourceConnection) {
        options.details.push('missing source-connection');
      }
      if (!this.id) {
        options.details.push('missing id');
      }
      options.details = options.details.join('; ');
    }

    return this._sourceConnection || this.id;
  }

  _isValid(options) {
    // TODO: implement
    return true;
  }

  toString(nameMap, options) {
    let result = [];
    result.push('slot');
    if (this.id) {
      result.push(`'${this.id}'`);
    }
    if (this.tags.length > 0) {
      result.push(this.tags.map(tag => `#${tag}`).join(' '));
    }
    result.push(`as ${(nameMap && nameMap.get(this)) || this.localName}`);
    let includeUnresolved = options && options.showUnresolved && !this.isResolved(options);
    if (includeUnresolved) {
      result.push(`// unresolved slot: ${options.details}`);
    }

    if (this.id || includeUnresolved) {
      return result.join(' ');
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Slot;



/***/ }),
/* 102 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt




/**
 * Walkers traverse an object, calling methods based on the
 * features encountered on that object. For example, a RecipeWalker
 * takes a list of recipes and calls methods when:
 *  - a new recipe is encountered
 *  - a handle is found inside a recipe
 *  - a particle is found inside a recipe
 *  - etc..
 * 
 * Each of these methods can return a list of updates:
 *   [(recipe, encountered_thing) => new_recipe]
 *
 * The walker then does something with the updates depending on the
 * tactic selected.
 * 
 * If the tactic is "Permuted", then an output will be generated
 * for every combination of 1 element drawn from each update list.
 * For example, if 3 methods return [a,b], [c,d,e], and [f] respectively
 * then "Permuted" will cause 6 outputs to be generated: [acf, adf, aef, bcf, bdf, bef]
 * 
 * If the tactic is "Independent", an output will be generated for each
 * update, regardless of the list the update is in. For example,
 * if 3 methods return [a,b], [c,d,e], and [f] respectively,
 * then "Independent" will cause 6 outputs to be generated: [a,b,c,d,e,f]
 */
class WalkerBase extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["a" /* Strategizer */].Walker {
  constructor(tactic) {
    super();
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(tactic);
    this.tactic = tactic;
  }

  _runUpdateList(recipe, updateList) {
    let newRecipes = [];
    if (updateList.length) {
      switch (this.tactic) {
        case WalkerBase.Permuted: {
          let permutations = [[]];
          updateList.forEach(({continuation, context}) => {
            let newResults = [];
            if (typeof continuation == 'function')
              continuation = [continuation];
            continuation.forEach(f => {
              permutations.forEach(p => {
                let newP = p.slice();
                newP.push({f, context});
                newResults.push(newP);
              });
            });
            permutations = newResults;
          });

          for (let permutation of permutations) {
            let cloneMap = new Map();
            let newRecipe = recipe.clone(cloneMap);
            let score = 0;
            permutation = permutation.filter(p => p.f !== null);
            if (permutation.length == 0)
              continue;
            permutation.forEach(({f, context}) => {
              score += f(newRecipe, cloneMap.get(context));
            });

            newRecipes.push({recipe: newRecipe, score});
          }
          break;
        }
        case WalkerBase.Independent:
          updateList.forEach(({continuation, context}) => {
            if (typeof continuation == 'function')
              continuation = [continuation];
            continuation.forEach(f => {
              if (f == null)
                f = () => 0;
              let cloneMap = new Map();
              let newRecipe = recipe.clone(cloneMap);
              let score = f(newRecipe, cloneMap.get(context));
              newRecipes.push({recipe: newRecipe, score});
            });
          });
          break;
        default:
          throw `${this.tactic} not supported`;
      }
    }

    // commit phase - output results.

    for (let newRecipe of newRecipes) {
      let result = this.createDescendant(newRecipe.recipe, newRecipe.score);
    }
  }

  createDescendant(recipe, score) {
    let valid = recipe.normalize();
    //if (!valid) debugger;
    let hash = valid ? recipe.digest() : null;
    super.createDescendant(recipe, score, hash, valid);
  }

  isEmptyResult(result) {
    if (!result)
      return true;

    if (result.constructor == Array && result.length <= 0)
      return true;

      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__platform_assert_web_js__["a" /* assert */])(typeof result == 'function' || result.length);

    return false;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WalkerBase;


WalkerBase.Permuted = 'permuted';
WalkerBase.Independent = 'independent';


/***/ }),
/* 103 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */


class Relevance {
  constructor(arcState) {
    this.arcState = arcState;
    this.relevanceMap = new Map();
  }

  apply(relevance) {
    for (let key of relevance.keys()) {
      if (this.relevanceMap.has(key))
        this.relevanceMap.set(key, this.relevanceMap.get(key).concat(relevance.get(key)));
      else
        this.relevanceMap.set(key, relevance.get(key));
    }
  }

  calcRelevanceScore() {
    let relevance = 1;
    let hasNegative = false;
    for (let rList of this.relevanceMap.values()) {
      let particleRelevance = Relevance.particleRelevance(rList);
      if (particleRelevance < 0) {
        hasNegative = true;
      }
      relevance *= Math.abs(particleRelevance);
    }
    return relevance * (hasNegative ? -1 : 1);
  }

  // Returns false, if at least one of the particles relevance lists ends with a negative score.
  isRelevant(plan) {
    let hasUi = plan.particles.some(p => Object.keys(p.consumedSlotConnections).length > 0);
    let rendersUi = false;
    this.relevanceMap.forEach((rList, particle) => {
      if (rList[rList.length - 1] < 0) {
        return false;
      } else if (Object.keys(particle.consumedSlotConnections).length) {
        rendersUi = true;
      }
    });
    // If the recipe has UI rendering particles, at least one of the particles must render UI.
    return hasUi == rendersUi;
  }

  static scaleRelevance(relevance) {
    if (relevance == undefined) {
      relevance = 5;
    }
    relevance = Math.max(-1, Math.min(relevance, 10));
    // TODO: might want to make this geometric or something instead;
    return relevance / 5;
  }

  static particleRelevance(relevanceList) {
    let relevance = 1;
    let hasNegative = false;
    relevanceList.forEach(r => {
      let scaledRelevance = Relevance.scaleRelevance(r);
      if (scaledRelevance < 0) {
        hasNegative = true;
      }
      relevance *= Math.abs(scaledRelevance);
    });
    return relevance * (hasNegative ? -1 : 1);
  }

  calcParticleRelevance(particle) {
    if (this.relevanceMap.has(particle)) {
      return Relevance.particleRelevance(this.relevanceMap.get(particle));
    }
    return -1;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Relevance;



/***/ }),
/* 104 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__storage_crdt_collection_model_js__ = __webpack_require__(45);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */





const SyncState = {none: 0, pending: 1, full: 2};

/** @class StorageProxy
 * Mediates between one or more Handles and the backing store outside the PEC.
 *
 * This can operate in two modes, based on how observing handles are configured:
 * - synchronized: the proxy maintains a copy of the full data held by the backing store, keeping
 *                 it in sync by listening to change events from the store.
 * - unsynchronized: the proxy simply passes through calls from Handles to the backing store.
 *
 * In synchronized mode we maintain a queue of sorted update events received from the backing store.
 * While events are received correctly - each update is one version ahead of our stored model - they
 * are processed immediately and observing handles are notified accordingly. If we receive an update
 * with a "future" version, the proxy is desynchronized:
 * - a request for the full data is sent to the backing store;
 * - any update events received after that (and before the response) are added to the queue;
 * - any new updates that can be applied will be (which may cause the proxy to "catch up" and resync
 *   before the full data response arrives);
 * - once the resync response is received, stale queued updates are discarded and any remaining ones
 *   are applied.
 */
class StorageProxy {
  constructor(id, type, port, pec, scheduler, name) {
    return type.isCollection
        ? new CollectionProxy(id, type, port, pec, scheduler, name)
        : new VariableProxy(id, type, port, pec, scheduler, name);
  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = StorageProxy;


class StorageProxyBase {
  constructor(id, type, port, pec, scheduler, name) {
    this._id = id;
    this._type = type;
    this._port = port;
    this._pec = pec;
    this._scheduler = scheduler;
    this.name = name;

    this._version = undefined;
    this._listenerAttached = false;
    this._keepSynced = false;
    this._synchronized = SyncState.none;
    this._observers = [];
    this._updates = [];
  }

  raiseSystemException(exception, methodName, particleId) {
    this._port.RaiseSystemException({exception: {message: exception.message, stack: exception.stack, name: exception.name}, methodName, particleId});
  }

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  // Called by ParticleExecutionContext to associate (potentially multiple) particle/handle pairs with this proxy.
  register(particle, handle) {
    if (!handle.canRead)
      return;
    this._observers.push({particle, handle});

    // Attach an event listener to the backing store when the first readable handle is registered.
    if (!this._listenerAttached) {
      this._port.InitializeProxy({handle: this, callback: x => this._onUpdate(x)});
      this._listenerAttached = true;
    }

    // Change to synchronized mode as soon as we get any handle configured with keepSynced and send
    // a request to get the full model (once).
    // TODO: drop back to non-sync mode if all handles re-configure to !keepSynced
    if (handle.options.keepSynced) {
      if (!this._keepSynced) {
        this._port.SynchronizeProxy({handle: this, callback: x => this._onSynchronize(x)});
        this._keepSynced = true;
      }

      // If a handle configured for sync notifications registers after we've received the full
      // model, notify it immediately.
      if (handle.options.notifySync && this._synchronized == SyncState.full) {
        let syncModel = this._getModelForSync();
        this._scheduler.enqueue(particle, handle, ['sync', particle, syncModel]);
      }
    }
  }

  // `model` contains 'version' and one of 'data' or 'list'.
  _onSynchronize(model) {
    if (this._version !== undefined && model.version <= this._version) {
      console.warn(`StorageProxy '${this._id}' received stale model version ${model.version}; ` +
                   `current is ${this._version}`);
      return;
    }

    // We may have queued updates that were received after a desync; discard any that are stale
    // with respect to the received model.
    this._synchronized = SyncState.full;
    while (this._updates.length > 0 && this._updates[0].version <= model.version) {
      this._updates.shift();
    }

    // Replace the stored data with the new one and notify handles that are configured for it.
    this._synchronizeModel(model);

    let syncModel = this._getModelForSync();
    this._notify('sync', syncModel, options => options.keepSynced && options.notifySync);
    this._processUpdates();
  }

  // `update` contains 'version' and one of 'data', 'add' or 'remove'.
  _onUpdate(update) {
    // Immediately notify any handles that are not configured with keepSynced but do want updates.
    if (this._observers.find(({handle}) => !handle.options.keepSynced && handle.options.notifyUpdate)) {
      let handleUpdate = this._processUpdate(update, false);
      this._notify('update', handleUpdate, options => !options.keepSynced && options.notifyUpdate);
    }

    // Bail if we're not in synchronized mode or this is a stale event.
    if (!this._keepSynced)
      return;
    if (update.version <= this._version) {
      console.warn(`StorageProxy '${this._id}' received stale update version ${update.version}; ` +
                   `current is ${this._version}`);
      return;
    }

    // Add the update to the queue and process. Most of the time the queue should be empty and
    // _processUpdates will consume this event immediately.
    this._updates.push(update);
    this._updates.sort((a, b) => a.version - b.version);
    this._processUpdates();
  }

  _notify(kind, details, predicate=() => true) {
    for (let {handle, particle} of this._observers) {
      if (predicate(handle.options)) {
        this._scheduler.enqueue(particle, handle, [kind, particle, details]);
      }
    }
  }

  _processUpdates() {
    // Consume all queued updates whose versions are monotonically increasing from our stored one.
    while (this._updates.length > 0 && this._updates[0].version === this._version + 1) {
      let update = this._updates.shift();

      // Fold the update into our stored model.
      let handleUpdate = this._processUpdate(update);
      this._version = update.version;

      // Notify handles configured with keepSynced and notifyUpdates (non-keepSynced handles are
      // notified as updates are received).
      if (handleUpdate) {
        this._notify('update', handleUpdate, options => options.keepSynced && options.notifyUpdate);
      }
    }

    // If we still have update events queued, we must have received a future version are are now
    // desynchronized. Send a request for the full model and notify handles configured for it.
    if (this._updates.length > 0) {
      if (this._synchronized != SyncState.none) {
        this._synchronized = SyncState.none;
        this._port.SynchronizeProxy({handle: this, callback: x => this._onSynchronize(x)});
        for (let {handle, particle} of this._observers) {
          if (handle.options.notifyDesync) {
            this._scheduler.enqueue(particle, handle, ['desync', particle]);
          }
        }
      }
    } else if (this._synchronized != SyncState.full) {
      // If we were desynced but have now consumed all update events, we've caught up.
      this._synchronized = SyncState.full;
    }
  }

  generateID(component) {
    return this._pec.generateID(component);
  }

  generateIDComponents() {
    return this._pec.generateIDComponents();
  }
}


// Collections are synchronized in a CRDT Observed/Removed scheme. 
// Each value is identified by an ID and a set of membership keys.
// Concurrent adds of the same value will specify the same ID but different
// keys. A value is removed by removing all of the observed keys. A value
// is considered to be removed if all of it's keys have been removed.
//
// In synchronized mode mutation takes place synchronously inside the proxy.
// The proxy uses the originatorId to skip over redundant events sent back
// by the storage object.
//
// In unsynchronized mode removal is not based on the keys observed at the
// proxy, since the proxy does not remember the state, but instead the set
// of keys that exist at the storage object at the time it receives the
// request.
class CollectionProxy extends StorageProxyBase {
  constructor(...args) {
    super(...args);
    this._model = new __WEBPACK_IMPORTED_MODULE_1__storage_crdt_collection_model_js__["a" /* CrdtCollectionModel */]();
  }
  _getModelForSync() {
    return this._model.toList();
  }
  _synchronizeModel({version, model}) {
    this._version = version;
    this._model = new __WEBPACK_IMPORTED_MODULE_1__storage_crdt_collection_model_js__["a" /* CrdtCollectionModel */](model);
  }
  _processUpdate(update, apply=true) {
    if (this._synchronized == SyncState.full) {
      // If we're synchronized, then any updates we sent have
      // already been applied/notified.
      for (let {handle} of this._observers) {
        if (update.originatorId == handle._particleId) {
          return null;
        }
      }
    }
    let added = [];
    let removed = [];
    if ('add' in update) {
      for (let {value, keys, effective} of update.add) {
        if (apply && this._model.add(value.id, value, keys) || !apply && effective) {
          added.push(value);
        }
      }
    } else if ('remove' in update) {
      for (let {value, keys, effective} of update.remove) {
        if (apply && this._model.remove(value.id, keys) || !apply && effective) {
          removed.push(value);
        }
      }
    } else {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(false, `StorageProxy received invalid update event: ${JSON.stringify(update)}`);
    }
    if (added.length || removed.length) {
      let result = {};
      if (added.length) result.add = added;
      if (removed.length) result.remove = removed;
      result.originatorId = update.originatorId;
      return result;
    }
    return null;
  }
  // Read ops: if we're synchronized we can just return the local copy of the data.
  // Otherwise, send a request to the backing store.
  toList(particleId) {
    if (this._synchronized == SyncState.full) {
      return Promise.resolve(this._model.toList());
    } else {
      // TODO: in synchronized mode, this should integrate with SynchronizeProxy rather than
      //       sending a parallel request
      return new Promise((resolve, reject) =>
        this._port.HandleToList({callback: r => resolve(r), handle: this, particleId}));
    }
  }
  store(value, keys, particleId) {
    let id = value.id;
    let data = {
      value,
      keys,
    };
    this._port.HandleStore({data, handle: this, particleId});

    if (this._synchronized != SyncState.full) {
      return;
    }
    if (!this._model.add(id, value, keys)) {
      return;
    }
    let update = {
      originatorId: particleId,
      add: [value],
    };
    this._notify('update', update, options => options.notifyUpdate);
  }

  remove(id, keys, particleId) {
    if (this._synchronized != SyncState.full) {
      let data = {
        id,
        keys: [],
      };
      this._port.HandleRemove({data, handle: this, particleId});
      return;
    }

    let value = this._model.getValue(id);
    if (!value) return;
    if (keys.length == 0) {
      keys = this._model.getKeys(id);
    }
    let data = {
      id,
      keys,
    };
    this._port.HandleRemove({data, handle: this, particleId});

    if (!this._model.remove(id, keys)) {
      return;
    }
    let update = {
      originatorId: particleId,
      remove: [value],
    };
    this._notify('update', update, options => options.notifyUpdate);
  }
}

// Variables are synchronized in a 'last-writer-wins' scheme. When the
// VariableProxy mutates the model, it sets a barrier and expects to 
// receive the barrier value echoed back in a subsequent update event.
// Between those two points in time updates are not applied or
// notified about as these reflect concurrent writes that did not 'win'.
class VariableProxy extends StorageProxyBase {
  constructor(...args) {
    super(...args);
    this._model = null;
    this._barrier = null;
  }
  _getModelForSync() {
    return this._model;
  }
  _synchronizeModel({version, model}) {
    this._version = version;
    this._model = model.length == 0 ? null : model[0].value;
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._model !== undefined);
  }
  _processUpdate(update, apply=true) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])('data' in update);
    if (!apply) return update;
    // If we have set a barrier, suppress updates until after
    // we have seen the barrier return via an update.
    if (this._barrier != null) {
      if (update.barrier == this._barrier) {
        this._barrier = null;
      }
      return null;
    }
    this._model = update.data;
    return update;
  }
  // Read ops: if we're synchronized we can just return the local copy of the data.
  // Otherwise, send a request to the backing store.
  // TODO: in synchronized mode, these should integrate with SynchronizeProxy rather than
  //       sending a parallel request
  get(particleId) {
    if (this._synchronized == SyncState.full) {
      return Promise.resolve(this._model);
    } else {
      return new Promise((resolve, reject) =>
        this._port.HandleGet({callback: resolve, handle: this, particleId}));
    }
  }
  set(entity, particleId) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(entity !== undefined);
    if (JSON.stringify(this._model) == JSON.stringify(entity)) {
      return;
    }
    let barrier = this.generateID('barrier');
    // TODO: is this already a clone?
    this._model = JSON.parse(JSON.stringify(entity));
    this._barrier = barrier;
    this._port.HandleSet({data: entity, handle: this, particleId, barrier});
    let update = {
      originatorId: particleId,
      data: entity,
    };
    this._notify('update', update, options => options.notifyUpdate);
  }

  clear(particleId) {
    if (this._model == null) {
      return;
    }
    let barrier = this.generateID('barrier');
    this._model = null;
    this._barrier = barrier;
    this._port.HandleClear({handle: this, particleId, barrier});
    let update = {
      originatorId: particleId,
      data: null,
    };
    this._notify('update', update, options => options.notifyUpdate);
  }
}

class StorageProxyScheduler {
  constructor() {
    this._scheduled = false;
    // Particle -> {Handle -> [Queue of events]}
    this._queues = new Map();
  }

  // TODO: break apart args here, sync events should flush the queue.
  enqueue(particle, handle, args) {
    if (!this._queues.has(particle)) {
      this._queues.set(particle, new Map());
    }
    let byHandle = this._queues.get(particle);
    if (!byHandle.has(handle)) {
      byHandle.set(handle, []);
    }
    let queue = byHandle.get(handle);
    queue.push(args);
    this._schedule();
  }

  get busy() {
    return this._queues.size > 0;
  }

  _updateIdle() {
    if (this._idleResolver && !this.busy) {
      this._idleResolver();
      this._idle = null;
      this._idleResolver = null;
    }
  }
  
  get idle() {
    if (!this.busy) {
      return Promise.resolve();
    }
    if (this._idle) {
      return this._idle;
    }
    this._idle = new Promise(resolver => {
      this._idleResolver = resolver;
    });
    return this._idle;
  }

  _schedule() {
    if (this._scheduled) {
      return;
    }
    this._scheduled = true;
    setTimeout(() => {
      this._scheduled = false;
      this._dispatch();
    }, 0);
  }

  _dispatch() {
    // TODO: should we process just one particle per task?
    while (this._queues.size > 0) {
      let particle = [...this._queues.keys()][0];
      let byHandle = this._queues.get(particle);
      this._queues.delete(particle);
      for (let [handle, queue] of byHandle.entries()) {
        for (let args of queue) {
          try {
            handle._notify(...args);
          } catch (e) {
            // TODO: report it via channel?
            console.error('Error dispatching to particle', e);
          }
        }
      }
    }

    this._updateIdle();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = StorageProxyScheduler;



/***/ }),
/* 105 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__storage_provider_base_js__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__platform_firebase_web_js__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__key_base_js__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__platform_btoa_web_js__ = __webpack_require__(68);
// @
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt







class FirebaseKey extends __WEBPACK_IMPORTED_MODULE_3__key_base_js__["a" /* KeyBase */] {
  constructor(key) {
    super();
    let parts = key.split('://');
    this.protocol = parts[0];
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(this.protocol == 'firebase');
    if (parts[1]) {
      parts = parts[1].split('/');
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(parts[0].endsWith('.firebaseio.com'));
      this.databaseUrl = parts[0];
      this.projectId = this.databaseUrl.split('.')[0];
      this.apiKey = parts[1];
      this.location = parts.slice(2).join('/');
    } else {
      this.databaseUrl = undefined;
      this.projectId = undefined;
      this.apiKey = undefined;
      this.location = '';
    }
  }

  childKeyForHandle(id) {
    let location = '';
    if (this.location != undefined && this.location.length > 0)
      location = this.location + '/';
    location += `handles/${id}`;
    return new FirebaseKey(`${this.protocol}://${this.databaseUrl}/${this.apiKey}/${location}`);
  }

  toString() {
    if (this.databaseUrl && this.apiKey)
      return `${this.protocol}://${this.databaseUrl}/${this.apiKey}/${this.location}`;
    return `${this.protocol}://`;
  }
}

async function realTransaction(reference, transactionFunction) {
  let realData = undefined;
  await reference.once('value', data => {realData = data.val(); });
  return reference.transaction(data => {
    if (data == null)
      data = realData;
    let result = transactionFunction(data);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(result);
    return result;
  }, undefined, false);
}

let _nextAppNameSuffix = 0;

class FirebaseStorage {
  constructor(arcId) {
    this._arcId = arcId;
    this._apps = {};
  }

  async construct(id, type, keyFragment) {
    return this._join(id, type, keyFragment, false);
  }

  async connect(id, type, key) {
    return this._join(id, type, key, true);
  }

  parseStringAsKey(string) {
    return new FirebaseKey(string);
  }

  async _join(id, type, key, shouldExist) {
    key = new FirebaseKey(key);
    // TODO: is it ever going to be possible to autoconstruct new firebase datastores?
    if (key.databaseUrl == undefined || key.apiKey == undefined)
      throw new Error('Can\'t complete partial firebase keys');

    if (this._apps[key.projectId] == undefined) {
      for (let app of __WEBPACK_IMPORTED_MODULE_1__platform_firebase_web_js__["a" /* firebase */].apps) {
        if (app.options.databaseURL == key.databaseURL) {
          this._apps[key.projectId] = app;
          break;
        }
      }
    }

    if (this._apps[key.projectId] == undefined) {
      this._apps[key.projectId] = __WEBPACK_IMPORTED_MODULE_1__platform_firebase_web_js__["a" /* firebase */].initializeApp({
        apiKey: key.apiKey,
        databaseURL: key.databaseUrl
      }, `app${_nextAppNameSuffix++}`);
    }

    let reference = __WEBPACK_IMPORTED_MODULE_1__platform_firebase_web_js__["a" /* firebase */].database(this._apps[key.projectId]).ref(key.location);

    let result = await realTransaction(reference, data => {
      if ((data == null) == shouldExist)
        return; // abort transaction
      if (!shouldExist) {
        return {version: 0};
      }
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__platform_assert_web_js__["a" /* assert */])(data);
      return data;
    });


    if (!result.committed)
      return null;

    return FirebaseStorageProvider.newProvider(type, this._arcId, id, reference, key);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = FirebaseStorage;


class FirebaseStorageProvider extends __WEBPACK_IMPORTED_MODULE_0__storage_provider_base_js__["a" /* StorageProviderBase */] {
  constructor(type, arcId, id, reference, key) {
    super(type, arcId, undefined, id, key.toString());
    this.firebaseKey = key;
    this.reference = reference;
  }

  static newProvider(type, arcId, id, reference, key) {
    if (type.isCollection)
      return new FirebaseCollection(type, arcId, id, reference, key);
    return new FirebaseVariable(type, arcId, id, reference, key);
  }

  static encodeKey(key) {
    key = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_btoa_web_js__["a" /* btoa */])(key);
    return key.replace(/\//g, '*');
  }
  static decodeKey(key) {
    key = key.replace(/\*/g, '/');
    return atob(key);
  }
}

class FirebaseVariable extends FirebaseStorageProvider {
  constructor(type, arcId, id, reference, firebaseKey) {
    super(type, arcId, id, reference, firebaseKey);
    this.dataSnapshot = undefined;
    this._pendingGets = [];
    this._version = 0;
    this.reference.on('value', dataSnapshot => {
      this.dataSnapshot = dataSnapshot;
      let data = dataSnapshot.val();
      this._pendingGets.forEach(_get => _get(data));
      this._pendingGets = [];
      this._version = data.version;
      this._fire('change', {data: data.data, version: data.version});
    });
  }

  async cloneFrom(store) {
    let {data, version} = await store.getWithVersion();
    await this._setWithVersion(data, version);
  }

  async get() {
    return this.dataSnapshot.val().data;
  }

  async getWithVersion() {
    if (this.dataSnapshot == undefined) {
      return new Promise((resolve, reject) => {
        this._pendingGets.push(resolve);
      });
    }
    return this.dataSnapshot.val();
  }

  async _setWithVersion(data, version) {
    await realTransaction(this.reference, _ => ({data, version}));
  }

  async set(value) {
    return realTransaction(this.reference, data => {
      if (JSON.stringify(data.data) == JSON.stringify(value))
        return data;
      return {data: value, version: data.version + 1};
    });
  }

  async clear() {
    return this.set(null);
  }
}

class FirebaseCollection extends FirebaseStorageProvider {
  constructor(type, arcId, id, reference, firebaseKey) {
    super(type, arcId, id, reference, firebaseKey);
    this.dataSnapshot = undefined;
    this._pendingGets = [];
    this.reference.on('value', dataSnapshot => {
      this.dataSnapshot = dataSnapshot;
      let data = dataSnapshot.val();
      this._pendingGets.forEach(_get => _get(data));
      this._pendingGets = [];
      this._fire('change', {list: this._setToList(data.data), version: data.version});
    });
  }

  async get(id) {
    let set = this.dataSnapshot.val().data;
    let encId = FirebaseStorageProvider.encodeKey(id);
    if (set)
      return set[encId];
    return undefined;
  }

  async remove(id) {
    return realTransaction(this.reference, data => {
      if (!data.data)
        data.data = {};
      let encId = FirebaseStorageProvider.encodeKey(id);
      data.data[encId] = null;
      data.version += 1;
      return data;
    });
  }

  async store(entity) {
    return realTransaction(this.reference, data => {
      if (!data.data)
        data.data = {};
      let encId = FirebaseStorageProvider.encodeKey(entity.id);
      if (data.data[encId] && JSON.stringify(data.data[encId]) == JSON.stringify(entity))
        return data;
      data.data[encId] = entity;
      data.version += 1;
      return data;
    });
  }

  async cloneFrom(store) {
    let {list, version} = await store.toListWithVersion();
    await this._fromListWithVersion(list, version);
  }

  async _fromListWithVersion(list, version) {
    return realTransaction(this.reference, data => {
      if (!data.data)
        data.data = {};
      list.forEach(item => {
        let encId = FirebaseStorageProvider.encodeKey(item.id);
        data.data[encId] = item;
      });
      data.version = version;
      return data;
    });
  }

  async toList() {
    if (this.dataSnapshot == undefined) {
      return new Promise((resolve, reject) => {
        this._pendingGets.push(resolve);
      }).then(data => this._setToList(data.data));
    }
    return this._setToList(this.dataSnapshot.val().data);
  }

  async toListWithVersion() {
    if (this.dataSnapshot == undefined) {
      return new Promise((resolve, reject) => {
        this._pendingGets.push(resolve);
      }).then(data => ({list: this._setToList(data.data), version: data.version}));
    }
    let data = this.dataSnapshot.val();
    return {list: this._setToList(data.data), version: data.version};
  }

  _setToList(set) {
    let list = [];
    if (set) {
      for (let key in set) {
        list.push(set[key]);
      }
    }
    return list;
  }
}


/***/ }),
/* 106 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tracelib_trace_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__storage_provider_base_js__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__key_base_js__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__crdt_collection_model_js__ = __webpack_require__(45);
// @
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt








class InMemoryKey extends __WEBPACK_IMPORTED_MODULE_3__key_base_js__["a" /* KeyBase */] {
  constructor(key) {
    super();
    let parts = key.split('://');
    this.protocol = parts[0];
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.protocol == 'in-memory');
    parts = parts[1] ? parts.slice(1).join('://').split('^^') : [];
    this.arcId = parts[0];
    this.location = parts[1];
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this.toString() == key);
  }

  childKeyForHandle(id) {
    return new InMemoryKey('in-memory://');
  }

  toString() {
    if (this.location !== undefined && this.arcId !== undefined)
      return `${this.protocol}://${this.arcId}^^${this.location}`;
    if (this.arcId !== undefined)
      return `${this.protocol}://${this.arcId}`;
    return `${this.protocol}`;
  }
}

let __storageCache = {};

class InMemoryStorage {
  constructor(arcId) {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(arcId !== undefined, 'Arcs with storage must have ids');
      this._arcId = arcId;
      this._memoryMap = {};
      this.localIDBase = 0;
      // TODO(shans): re-add this assert once we have a runtime object to put it on.
      // assert(__storageCache[this._arc.id] == undefined, `${this._arc.id} already exists in local storage cache`);
      __storageCache[this._arcId] = this;
  }

  async construct(id, type, keyFragment) {
    let key = new InMemoryKey(keyFragment);
    if (key.arcId == undefined)
      key.arcId = this._arcId;
    if (key.location == undefined)
      key.location = 'in-memory-' + this.localIDBase++;
    let provider = InMemoryStorageProvider.newProvider(type, this._arcId, undefined, id, key.toString());
    if (this._memoryMap[key.toString()] !== undefined)
      return null;
    this._memoryMap[key.toString()] = provider;
    return provider;
  }

  async connect(id, type, keyString) {
    let key = new InMemoryKey(keyString);
    if (key.arcId !== this._arcId.toString()) {
      if (__storageCache[key.arcId] == undefined)
        return null;
      return __storageCache[key.arcId].connect(id, type, keyString);
    }
    if (this._memoryMap[keyString] == undefined)
      return null;
    // TODO assert types match?
    return this._memoryMap[keyString];
  }

  parseStringAsKey(string) {
    return new InMemoryKey(string);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = InMemoryStorage;


class InMemoryStorageProvider extends __WEBPACK_IMPORTED_MODULE_2__storage_provider_base_js__["a" /* StorageProviderBase */] {
  static newProvider(type, arcId, name, id, key) {
    if (type.isCollection)
      return new InMemoryCollection(type, arcId, name, id, key);
    return new InMemoryVariable(type, arcId, name, id, key);
  }
}

class InMemoryCollection extends InMemoryStorageProvider {
  constructor(type, arcId, name, id, key) {
    super(type, arcId, name, id, key);
    this._model = new __WEBPACK_IMPORTED_MODULE_4__crdt_collection_model_js__["a" /* CrdtCollectionModel */]();
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._version !== null);
  }

  clone() {
    let handle = new InMemoryCollection(this._type, this._arcId, this.name, this.id);
    handle.cloneFrom(this);
    return handle;
  }

  async cloneFrom(handle) {
    this.fromLiteral(await handle.toLiteral());
  }

  // Returns {version, model: [{id, value, keys: []}]}
  toLiteral() {
    return {
      version: this._version,
      model: this._model.toLiteral(),
    };
  }

  fromLiteral({version, model}) {
    this._version = version;
    this._model = new __WEBPACK_IMPORTED_MODULE_4__crdt_collection_model_js__["a" /* CrdtCollectionModel */](model);
  }

  toList() {
    return this.toLiteral().model.map(item => item.value);
  }

  traceInfo() {
    return {items: this._model.size};
  }

  async store(value, keys, originatorId=null) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(keys != null && keys.length > 0, 'keys required');
    let trace = __WEBPACK_IMPORTED_MODULE_1__tracelib_trace_js__["a" /* Tracing */].start({cat: 'handle', name: 'InMemoryCollection::store', args: {name: this.name}});
    let effective = this._model.add(value.id, value, keys);
    this._version++;
    await trace.wait(
        this._fire('change', {add: [{value, keys, effective}], version: this._version, originatorId}));
    trace.end({args: {value}});
  }

  async remove(id, keys=[], originatorId=null) {
    let trace = __WEBPACK_IMPORTED_MODULE_1__tracelib_trace_js__["a" /* Tracing */].start({cat: 'handle', name: 'InMemoryCollection::remove', args: {name: this.name}});
    if (keys.length == 0) {
      keys = this._model.getKeys(id);
    }
    let value = this._model.getValue(id);
    let effective = this._model.remove(id, keys);
    this._version++;
    await trace.wait(
        this._fire('change', {remove: [{value, keys, effective}], version: this._version, originatorId}));
    trace.end({args: {entity: value}});
  }

  clearItemsForTesting() {
    this._model = new __WEBPACK_IMPORTED_MODULE_4__crdt_collection_model_js__["a" /* CrdtCollectionModel */]();
  }
}

class InMemoryVariable extends InMemoryStorageProvider {
  constructor(type, arcId, name, id, key) {
    super(type, arcId, name, id, key);
    this._stored = null;
  }

  clone() {
    let variable = new InMemoryVariable(this._type, this._arcId, this.name, this.id);
    variable.cloneFrom(this);
    return variable;
  }

  async cloneFrom(handle) {
    let literal = await handle.toLiteral();
    await this.fromLiteral(literal);
  }

  // Returns {version, model: [{id, value}]}
  async toLiteral() {
    let value = this._stored;
    let model = [];
    if (value != null) {
      model = [{
        id: value.id,
        value,
      }];
    }
    return {
      version: this._version,
      model,
    };
  }

  fromLiteral({version, model}) {
    let value = model.length == 0 ? null : model[0].value;
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(value !== undefined);
    this._stored = value;
    this._version = version;
  }

  traceInfo() {
    return {stored: this._stored !== null};
  }

  async get() {
    return this._stored;
  }

  async set(value, originatorId=null, barrier=null) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(value !== undefined);
    // If there's a barrier set, then the originating storage-proxy is expecting
    // a result so we cannot suppress the event here.
    if (JSON.stringify(this._stored) == JSON.stringify(value) && barrier == null)
      return;
    this._stored = value;
    this._version++;
    await this._fire('change', {data: this._stored, version: this._version, originatorId, barrier});
  }

  async clear(originatorId=null, barrier=null) {
    this.set(null, originatorId, barrier);
  }
}


/***/ }),
/* 107 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__recipe_handle_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__type_js__ = __webpack_require__(4);
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt








// This strategy coalesces unresolved terminal recipes (i.e. those that cannot
// be modified by any strategy apart from this one) by finding unresolved
// use/? handle and finding a matching create/? handle in another recipe and
// merging those.
class CoalesceRecipes extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();
    this._index = arc.recipeIndex;
  }

  getResults(inputParams) {
    return inputParams.terminal.filter(result => !result.result.isResolved());
  }

  async generate(inputParams) {
    const index = this._index;
    await index.ready;

    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */] {
      onSlot(recipe, slot) {
        // Find slots that according to their provided-spec must be consumed, but have no consume connection.
        if (slot.consumeConnections.length > 0) {
          return; // slot has consume connections.
        }
        if (!slot.sourceConnection || !slot.sourceConnection.slotSpec.getProvidedSlotSpec(slot.name).isRequired) {
          return; // either a remote slot (no source connection), or a not required one.
        }

        let results = [];
        for (let {slotConn, matchingHandles} of index.findConsumeSlotConnectionMatch(slot)) {
          results.push((recipe, slot) => {
            let {cloneMap} = slotConn.recipe.mergeInto(slot.recipe);
            let mergedSlotConn = cloneMap.get(slotConn);
            mergedSlotConn.connectToSlot(slot);
            for (let {handle, matchingConn} of matchingHandles) {
              // matchingConn in the mergedSlotConnection's recipe should be connected to `handle` in the slot's recipe.
              let mergedMatchingConn = cloneMap.get(matchingConn);
              let disconnectedHandle = mergedMatchingConn.handle;
              let clonedHandle = slot.handleConnections.find(handleConn => handleConn.handle && handleConn.handle.id == handle.id).handle;
              if (disconnectedHandle == clonedHandle) {
                continue; // this handle was already reconnected
              }

              while (disconnectedHandle.connections.length > 0) {
                let conn = disconnectedHandle.connections[0];
                conn.disconnectHandle();
                conn.connectToHandle(clonedHandle);
              }
              recipe.removeHandle(disconnectedHandle);
            }
            return 1;
          });
        }

        if (results.length > 0) {
          return results;
        }
      }

      onHandle(recipe, handle) {
        if ((handle.fate !== 'use' && handle.fate !== '?')
            || handle.id
            || handle.connections.length === 0
            || handle.name === 'descriptions') return;

        let results = [];

        for (let otherHandle of index.findHandleMatch(handle, ['create', '?'])) {

          // Don't grow recipes above 10 particles, otherwise we might never stop.
          if (recipe.particles.length + otherHandle.recipe.particles.length > 10) continue;

          // This is a poor man's proxy for the other handle being an output of a recipe.
          if (otherHandle.connections.find(conn => conn.direction === 'in')) continue;

          // We ignore type variables not constrained for reading, otherwise
          // generic recipes would apply - which we currently don't want here.
          if (otherHandle.type.hasVariable) {
            let resolved = otherHandle.type.resolvedType();
            if (resolved.isCollection) resolved = resolved.collectionType;
            if (resolved.isVariable && !resolved.canReadSubset) continue;
          }

          results.push((recipe, handle) => {
            let {cloneMap} = otherHandle.recipe.mergeInto(recipe);
            let mergedOtherHandle = cloneMap.get(otherHandle);
            if (!mergedOtherHandle) return null;
            while (mergedOtherHandle.connections.length > 0) {
              let [connection] = mergedOtherHandle.connections;
              connection.disconnectHandle();
              connection.connectToHandle(handle);
            }
            recipe.removeHandle(mergedOtherHandle);
            handle.fate = 'create';

            // Clear verbs and recipe name after coalescing two recipes.
            recipe.verbs.splice(0);
            recipe.name = null;

            // TODO: Merge description/patterns of both recipes.

            return 1;
          });
        }

        return results;
      }
    }(__WEBPACK_IMPORTED_MODULE_3__recipe_walker_js__["a" /* Walker */].Independent), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CoalesceRecipes;



/***/ }),
/* 108 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class CombinedStrategy extends __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(strategies) {
    super();
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(strategies.length > 1, 'Strategies must contain at least 2 elements.');
    this._strategies = strategies;
    this._strategies.forEach(strategy => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(strategy.walker));
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._strategies[0].getResults);
  }
  _getLeaves(results) {
    // Only use leaf recipes.
    let recipeByParent = new Map();
    let resultsList = [...results.values()];
    resultsList.forEach(r => {
      r.derivation.forEach(d => {
        if (d.parent) {
          recipeByParent.set(d.parent, r);
        }
      });
    });
    return resultsList.filter(r => !recipeByParent.has(r));
  }
  async generate(inputParams) {
    let results = this._strategies[0].getResults(inputParams);
    let totalResults = new Map();
    for (let strategy of this._strategies) {
      results = __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(results, strategy.walker, strategy);
      results = await Promise.all(results.map(async result => {
        if (result.hash) {
          result.hash = await result.hash;
        }
        if (!totalResults.has(result.hash)) {
          // TODO: deduping of results is already done in strategizer.
          // It should dedup the intermeditate derivations as well.
          totalResults.set(result.hash, result);
        }
        return result;
      }));
      results = this._getLeaves(totalResults);
    }

    return results;
  }
}
/* unused harmony export CombinedStrategy */



/***/ }),
/* 109 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_type_checker_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__ = __webpack_require__(0);
// Copyright (c) 2018 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt







class FindHostedParticle extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {

  constructor(arc) {
    super();
    this._arc = arc;
  }

  async generate(inputParams) {
    let arc = this._arc;
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onHandleConnection(recipe, connection) {
        if (connection.direction !== 'host' || connection.handle) return;
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__platform_assert_web_js__["a" /* assert */])(connection.type.isInterface);

        let results = [];
        for (let particle of arc.context.particles) {
          // This is what shape.particleMatches() does, but we also do
          // canEnsureResolved at the end:
          let shapeClone = connection.type.interfaceShape.cloneWithResolutions(new Map());
          // If particle doesn't match the requested shape.
          if (shapeClone.restrictType(particle) === false) continue;
          // If we still have unresolvable shape after matching a particle.
          // This can happen if both shape and particle have type variables.
          // TODO: What to do here? We need concrete type for the particle spec
          //       handle, but we don't have one.
          if (!shapeClone.canEnsureResolved()) continue;

          results.push((recipe, hc) => {
            // Restricting the type of the connection to the concrete particle
            // may restrict type variable across the recipe.
            hc.type.interfaceShape.restrictType(particle);

            // The connection type may still have type variables:
            // E.g. if shape requires `in ~a *`
            //      and particle has `in Entity input`
            //      then type system has to ensure ~a is at least Entity.
            // The type of a handle hosting the particle literal has to be
            // concrete, so we concretize connection type with maybeEnsureResolved().
            let handleType = hc.type.clone(new Map());
            handleType.maybeEnsureResolved();

            // TODO: Add a digest of a particle literal to the ID, so that we
            //       can ensure we load the correct particle. It is currently
            //       hard as digest is asynchronous and recipe walker is
            //       synchronous.
            let handle = recipe.newHandle();
            handle._mappedType = handleType;
            handle.fate = 'copy';
            handle.id = `${arc.generateID()}:particle-literal:${particle.name}`;
            hc.connectToHandle(handle);
          });
        }
        return results;
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Independent), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = FindHostedParticle;



/***/ }),
/* 110 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt





class NameUnnamedConnections extends __WEBPACK_IMPORTED_MODULE_0__strategizer_strategizer_js__["b" /* Strategy */] {
  async generate(inputParams) {
    return __WEBPACK_IMPORTED_MODULE_1__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */] {
      onHandleConnection(recipe, handleConnection) {
        if (handleConnection.name)
          return; // it is already named.

        if (!handleConnection.particle.spec)
          return; // the particle doesn't have spec yet.

        let possibleSpecConns = handleConnection.particle.spec.connections.filter(specConn => {
          // filter specs with matching types that don't have handles bound to the corresponding handle connection.
          return !specConn.isOptional &&
                 handleConnection.handle.type.equals(specConn.type) &&
                 !handleConnection.particle.getConnectionByName(specConn.name).handle;
        });

        return possibleSpecConns.map(specConn => {
          return (recipe, handleConnection) => {
            handleConnection.particle.nameConnection(handleConnection, specConn.name);
            return 1;
          };
        });
      }
    }(__WEBPACK_IMPORTED_MODULE_2__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = NameUnnamedConnections;



/***/ }),
/* 111 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__recipe_walker_js__ = __webpack_require__(3);
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt







class SearchTokensToHandles extends __WEBPACK_IMPORTED_MODULE_1__strategizer_strategizer_js__["b" /* Strategy */] {
  constructor(arc) {
    super();
    this._arc = arc;
  }

  async generate(inputParams) {
    let arc = this._arc;
    // Finds stores matching the provided token and compatible with the provided handle's type,
    // which are not already mapped into the provided handle's recipe
    let findMatchingStores = (token, handle) => {
      const counts = __WEBPACK_IMPORTED_MODULE_3__recipe_recipe_util_js__["a" /* RecipeUtil */].directionCounts(handle);
      let stores = arc.findStoresByType(handle.type, {tags: [`${token}`], subtype: counts.out == 0});
      let fate = 'use';
      if (stores.length == 0) {
        stores = arc._context.findStoreByType(handle.type, {tags: [`${token}`], subtype: counts.out == 0});
        fate = counts.out == 0 ? 'map' : 'copy';
      }
      stores = stores.filter(store => !handle.recipe.handles.find(handle => handle.id == store.id));
      return stores.map(store => { return {store, fate, token}; });
    };

    return __WEBPACK_IMPORTED_MODULE_2__recipe_recipe_js__["a" /* Recipe */].over(this.getResults(inputParams), new class extends __WEBPACK_IMPORTED_MODULE_4__recipe_walker_js__["a" /* Walker */] {
      onHandle(recipe, handle) {
        if (!recipe.search || recipe.search.unresolvedTokens.length == 0) {
          return;
        }
        if (handle.isResolved() || handle.connections.length == 0) {
          return;
        }

        let possibleMatches = [];
        for (let token of recipe.search.unresolvedTokens) {
          possibleMatches.push(...findMatchingStores(token, handle));
        }
        if (possibleMatches.length == 0) {
          return;
        }
        return possibleMatches.map(match => {
          return (recipe, handle) => {
            handle.fate = match.fate;
            handle.mapToStorage(match.store);
            recipe.search.resolveToken(match.token);
          };
        });
      }
    }(__WEBPACK_IMPORTED_MODULE_4__recipe_walker_js__["a" /* Walker */].Permuted), this);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SearchTokensToHandles;



/***/ }),
/* 112 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__affordance_js__ = __webpack_require__(36);
/**
 * @license
 * Copyright (c) 2018 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */



class SuggestionComposer {
  constructor(slotComposer) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(slotComposer);
    this._affordance = __WEBPACK_IMPORTED_MODULE_1__affordance_js__["a" /* Affordance */].forName(slotComposer.affordance);
    // TODO(mmandlis): find a cleaner way to fetch suggestions context.
    this._context = slotComposer._contextSlots.find(context => context.name == 'suggestions').container;
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(this._context);

    this._suggestions = [];
    this._suggestionsQueue = [];
    this._updateComplete = null;
  }

  async setSuggestions(suggestions) {
    this._suggestionsQueue.push(suggestions);
    Promise.resolve().then(async () => {
      if (this._updateComplete) {
        await this._updateComplete;
      }
      if (this._suggestionsQueue.length > 0) {
        this._suggestions = this._suggestionsQueue.pop();
        this._suggestionsQueue = [];
        this._updateComplete = this._updateSuggestions(this._suggestions);
      }
    });
  }

  async _updateSuggestions(suggestions) {
    this._affordance.contextClass.clear(this._context);
    let sortedSuggestions = suggestions.sort((s1, s2) => s2.rank - s1.rank);
    for (let suggestion of sortedSuggestions) {
      let suggestionContent =
        await suggestion.description.getRecipeSuggestion(this._affordance.descriptionFormatter);
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__platform_assert_web_js__["a" /* assert */])(suggestionContent, 'No suggestion content available');
      this._affordance.contextClass.createContext(
          this.createSuggestionElement(this._context, suggestion), suggestionContent);
    }
  }

  createSuggestionElement(container, plan) {
    let suggest = Object.assign(document.createElement('suggestion-element'), {plan});
    // TODO(sjmiles): LIFO is weird, iterate top-down elsewhere?
    container.insertBefore(suggest, container.firstElementChild);
    return suggest;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SuggestionComposer;



/***/ }),
/* 113 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__type_js__ = __webpack_require__(4);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */



class TupleFields {
  constructor(fieldList) {
    this.fieldList = fieldList;
  }

  static fromLiteral(literal) {
    return new TupleFields(literal.map(a => __WEBPACK_IMPORTED_MODULE_0__type_js__["a" /* Type */].fromLiteral(a)));
  }

  toLiteral() {
    return this.fieldList.map(a => a.toLiteral());
  }

  clone() {
    return new TupleFields(this.fieldList.map(a => a.clone()));
  }

  equals(other) {
    if (this.fieldList.length !== other.fieldList.length)
      return false;
    for (let i = 0; i < this.fieldList.length; i++) {
      if (!this.fieldList[i].equals(other.fieldList[i]))
        return false;
    }
    return true;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = TupleFields;



/***/ }),
/* 114 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return XenStateMixin; });
/* unused harmony export nob */
/* unused harmony export debounce */
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const nob = () => Object.create(null);

const debounce = (key, action, delay) => {
  if (key) {
    window.clearTimeout(key);
  }
  if (action && delay) {
    return window.setTimeout(action, delay);
  }
};

const XenStateMixin = Base => class extends Base {
  constructor() {
    super();
    this._pendingProps = nob();
    this._props = this._getInitialProps() || nob();
    this._lastProps = nob();
    this._state = this._getInitialState() || nob();
    this._lastState = nob();
  }
  _getInitialProps() {
  }
  _getInitialState() {
  }
  _getProperty(name) {
    return this._pendingProps[name] || this._props[name];
  }
  _setProperty(name, value) {
    // dirty checking opportunity
    if (this._validator || this._wouldChangeProp(name, value)) {
      this._pendingProps[name] = value;
      this._invalidateProps();
    }
  }
  _wouldChangeValue(map, name, value) {
    // TODO(sjmiles): fundamental dirty-checking issue here. Can be overridden to change
    // behavior, but the default implementation will use strict reference checking.
    // To modify structured values one must create a new Object with the new values.
    // See `_setImmutableState`.
    return (map[name] !== value);
    // TODO(sjmiles): an example of dirty-checking that instead simply punts on structured data
    //return (typeof value === 'object') || (map[name] !== value);
  }
  _wouldChangeProp(name, value) {
    return this._wouldChangeValue(this._props, name, value);
  }
  _wouldChangeState(name, value) {
    return this._wouldChangeValue(this._state, name, value);
  }
  _setProps(props) {
    // TODO(sjmiles): should be a replace instead of a merge?
    Object.assign(this._pendingProps, props);
    this._invalidateProps();
  }
  _invalidateProps() {
    this._propsInvalid = true;
    this._invalidate();
  }
  _setImmutableState(name, value) {
    if (typeof name === 'object') {
      console.warn('Xen:: _setImmutableState takes name and value args for a single property, dictionaries not supported.');
      value = Object.values(name)[0];
      name = Object.names(name)[0];
    }
    if (typeof value === 'object') {
      value = Object.assign(Object.create(null), value);
    }
    this._state[name] = value;
    this._invalidate();
  }
  _setState(object) {
    let dirty = false;
    const state = this._state;
    for (const property in object) {
      const value = object[property];
      if (this._wouldChangeState(property, value)) {
        dirty = true;
        state[property] = value;
      }
    }
    if (dirty) {
      this._invalidate();
      return true;
    }
  }
  // TODO(sjmiles): deprecated
  _setIfDirty(object) {
    return this._setState(object);
  }
  _async(fn) {
    return Promise.resolve().then(fn.bind(this));
    //return setTimeout(fn.bind(this), 10);
  }
  _invalidate() {
    if (!this._validator) {
      this._validator = this._async(this._validate);
    }
  }
  _getStateArgs() {
    return [this._props, this._state, this._lastProps, this._lastState];
  }
  _validate() {
    const stateArgs = this._getStateArgs();
    // try..catch to ensure we nullify `validator` before return
    try {
      // TODO(sjmiles): should be a replace instead of a merge
      Object.assign(this._props, this._pendingProps);
      if (this._propsInvalid) {
        // TODO(sjmiles): should/can have different timing from rendering?
        this._willReceiveProps(...stateArgs);
        this._propsInvalid = false;
      }
      if (this._shouldUpdate(...stateArgs)) {
        // TODO(sjmiles): consider throttling update to rAF
        this._ensureMount();
        this._doUpdate(...stateArgs);
      }
    } catch (x) {
      console.error(x);
    }
    // nullify validator _after_ methods so state changes don't reschedule validation
    this._validator = null;
    // save the old props and state
    this._lastProps = Object.assign(nob(), this._props);
    this._lastState = Object.assign(nob(), this._state);
  }
  _doUpdate(...stateArgs) {
    this._update(...stateArgs);
    this._didUpdate(...stateArgs);
  }
  _ensureMount() {
  }
  _willReceiveProps() {
  }
  _shouldUpdate() {
    return true;
  }
  _update() {
  }
  _didUpdate() {
  }
  _debounce(key, func, delay) {
    key = `_debounce_${key}`;
    this._state[key] = debounce(this._state[key], func, delay != null ? delay : 16);
  }
};




/***/ }),
/* 115 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// HTMLImports compatibility stuff, delete soonish
if (typeof document !== 'undefined' && !('currentImport' in document)) {
  Object.defineProperty(document, 'currentImport', {
    get() {
      const script = this.currentScript;
      let doc = script.ownerDocument || this;
      // this code for CEv1 compatible HTMLImports polyfill (aka modern)
      if (window['HTMLImports']) {
        doc = window.HTMLImports.importForElement(script);
        doc.URL = script.parentElement.href;
      }
      return doc;
    }
  });
}

/* Annotator */
// tree walker that generates arbitrary data using visitor function `cb`
// `cb` is called as `cb(node, key, notes)`
// where
//   `node` is a visited node.
//   `key` is a handle which identifies the node in a map generated by `Annotator.locateNodes`.
class Annotator {
  constructor(cb) {
    this.cb = cb;
  }
  // For subtree at `node`, produce annotation object `notes`.
  // the content of `notes` is completely determined by the behavior of the
  // annotator callback function supplied at the constructor.
  annotate(node, notes, opts) {
    this.notes = notes;
    this.opts = opts || 0;
    this.key = this.opts.key || 0;
    notes.locator = this._annotateSubtree(node);
    return notes;
  }
  // walking subtree at `node`
  _annotateSubtree(node) {
    let childLocators;
    for (let i = 0, child = node.firstChild, previous = null, neo; child; i++) {
      // returns a locator only if a node in the subtree requires one
      let childLocator = this._annotateNode(child);
      // only when necessary, maintain a sparse array of locators
      if (childLocator) {
        (childLocators = childLocators || {})[i] = childLocator;
      }
      // `child` may have been evacipated by visitor
      neo = previous ? previous.nextSibling : node.firstChild;
      if (neo === child) {
        previous = child;
        child = child.nextSibling;
      } else {
        child = neo;
        i--;
      }
    }
    // is falsey unless there was at least one childLocator
    return childLocators;
  }
  _annotateNode(node) {
    // visit node
    let key = this.key++;
    let shouldLocate = this.cb(node, key, this.notes, this.opts);
    // recurse
    let locators = this._annotateSubtree(node);
    if (shouldLocate || locators) {
      let cl = Object.create(null);
      cl.key = key;
      if (locators) {
        cl.sub = locators;
      }
      return cl;
    }
  }
}

const locateNodes = function(root, locator, map) {
  map = map || [];
  for (let n in locator) {
    const loc = locator[n];
    if (loc) {
      const node = root.childNodes[n];
      // TODO(sjmiles): text-nodes sometimes evacipate when stamped, so map to the parentElement instead
      map[loc.key] = (node.nodeType === Node.TEXT_NODE) ? node.parentElement : node;
      if (loc.sub) {
        // recurse
        locateNodes(node, loc.sub, map);
      }
    }
  }
  return map;
};

/* Annotation Producer */
// must return `true` for any node whose key we wish to track
const annotatorImpl = function(node, key, notes, opts) {
  // hook
  if (opts.annotator && opts.annotator(node, key, notes, opts)) {
    return true;
  }
  // default
  switch (node.nodeType) {
    case Node.DOCUMENT_FRAGMENT_NODE:
      return;
    case Node.ELEMENT_NODE:
      return annotateElementNode(node, key, notes);
    case Node.TEXT_NODE:
      return annotateTextNode(node, key, notes);
  }
};

const annotateTextNode = function(node, key, notes) {
  if (annotateMustache(node, key, notes, 'textContent', node.textContent)) {
    node.textContent = '';
    return true;
  }
};

const annotateElementNode = function(node, key, notes) {
  if (node.hasAttributes()) {
    let noted = false;
    for (let a$ = node.attributes, i = a$.length - 1, a; i >= 0 && (a = a$[i]); i--) {
      if (
        annotateEvent(node, key, notes, a.name, a.value) ||
        annotateMustache(node, key, notes, a.name, a.value)
      ) {
        node.removeAttribute(a.name);
        noted = true;
      }
    }
    return noted;
  }
};

const annotateMustache = function(node, key, notes, property, mustache) {
  if (mustache.slice(0, 2) === '{{') {
    if (property === 'class') {
      property = 'className';
    }
    let value = mustache.slice(2, -2);
    let override = value.split(':');
    if (override.length === 2) {
      property = override[0];
      value = override[1];
    }
    takeNote(notes, key, 'mustaches', property, value);
    if (value[0] === '$') {
      takeNote(notes, 'xlate', value, true);
    }
    return true;
  }
};

const annotateEvent = function(node, key, notes, name, value) {
  if (name.slice(0, 3) === 'on-') {
    if (value.slice(0, 2) === '{{') {
      value = value.slice(2, -2);
      console.warn(
        `Xen: event handler for '${name}' expressed as a mustache, which is not supported. Using literal value '${value}' instead.`
      );
    }
    takeNote(notes, key, 'events', name.slice(3), value);
    return true;
  }
};

const takeNote = function(notes, key, group, name, note) {
  let n$ = notes[key] || (notes[key] = Object.create(null));
  (n$[group] || (n$[group] = {}))[name] = note;
};

const annotator = new Annotator(annotatorImpl);

const annotate = function(root, key, opts) {
  return (root._notes ||
    (root._notes = annotator.annotate(root.content, {/*ids:{}*/}, key, opts))
  );
};

/* Annotation Consumer */
const mapEvents = function(notes, map, mapper) {
  // add event listeners
  for (let key in notes) {
    let node = map[key];
    let events = notes[key] && notes[key].events;
    if (node && events) {
      for (let name in events) {
        mapper(node, name, events[name]);
      }
    }
  }
};

const listen = function(controller, node, eventName, handlerName) {
  node.addEventListener(eventName, function(e) {
    if (controller[handlerName]) {
      return controller[handlerName](e, e.detail);
    }
  });
};

const set = function(notes, map, scope, controller) {
  if (scope) {
    for (let key in notes) {
      let node = map[key];
      if (node) {
        // everybody gets a scope
        node.scope = scope;
        // now get your regularly scheduled bindings
        let mustaches = notes[key].mustaches;
        for (let name in mustaches) {
          let property = mustaches[name];
          if (property in scope) {
            _set(node, name, scope[property], controller);
          }
        }
      }
    }
  }
};

const _set = function(node, property, value, controller) {
  // TODO(sjmiles): the property conditionals here could be precompiled
  let modifier = property.slice(-1);
  if (property === 'style%' || property === 'style') {
    if (typeof value === 'string') {
      node.style.cssText = value;
    } else {
      Object.assign(node.style, value);
    }
  } else if (modifier == '$') {
    let n = property.slice(0, -1);
    if (typeof value === 'boolean') {
      setBoolAttribute(node, n, value);
    } else {
      node.setAttribute(n, value);
    }
  } else if (property === 'textContent') {
    if (value && (value.$template || value.template)) {
      _setSubTemplate(node, value, controller);
    } else {
      node.textContent = (value || '');
    }
  } else if (property === 'unsafe-html') {
    node.innerHTML = value || '';
  } else if (property === 'value') {
    // TODO(sjmiles): specifically dirty-check `value` to avoid resetting input elements
    if (node.value !== value) {
      node.value = value;
    }
  } else {
    node[property] = value;
  }
};

const setBoolAttribute = function(node, attr, state) {
  node[
    (state === undefined ? !node.hasAttribute(attr) : state)
      ? 'setAttribute'
      : 'removeAttribute'
  ](attr, '');
};

const _setSubTemplate = function(node, value, controller) {
  // TODO(sjmiles): sub-template iteration ability specially implemented to support arcs (serialization boundary)
  // TODO(sjmiles): Aim to re-implement as a plugin.
  let {template, models} = value;
  if (!template) {
    let container = node.getRootNode();
    template = container.querySelector(`template[${value.$template}]`);
  } else {
    template = maybeStringToTemplate(template);
  }
  _renderSubtemplates(node, controller, template, models);
};

const _renderSubtemplates = function(container, controller, template, models) {
  //console.log('XList::_renderList:', props);
  let next, child = container.firstElementChild;
  if (template && models) {
    models && models.forEach((model, i)=>{
      next = child && child.nextElementSibling;
      // use existing node if possible
      if (!child) {
        const dom = stamp(template).events(controller);
        child = dom.root.firstElementChild;
        if (child) {
          child._subtreeDom = dom;
          container.appendChild(child);
          if (!template._shapeWarning && dom.root.firstElementChild) {
            template._shapeWarning = true;
            console.warn(`xen-template: subtemplate has multiple root nodes: only the first is used.`, template);
          }
        }
      }
      if (child) {
        child._subtreeDom.set(model);
        child = next;
      }
    });
  }
  // remove extra nodes
  while (child) {
    next = child.nextElementSibling;
    child.remove();
    child = next;
  }
};

//window.stampCount = 0;
//window.stampTime = 0;

const stamp = function(template, opts) {
  //const startTime = performance.now();
  //window.stampCount++;
  template = maybeStringToTemplate(template);
  // construct (or use memoized) notes
  let notes = annotate(template, opts);
  // CRITICAL TIMING ISSUE #1:
  // importNode can have side-effects, like CustomElement callbacks (before we
  // can do any work on the imported subtree, before we can mapEvents, e.g.).
  // we could clone into an inert document (say a new template) and process the nodes
  // before importing if necessary.
  let root = document.importNode(template.content, true);
  // map DOM to keys
  let map = locateNodes(root, notes.locator);
  // return dom manager
  let dom = {
    root,
    notes,
    map,
    $(slctr) {
      return this.root.querySelector(slctr);
    },
    set: function(scope) {
      scope && set(notes, map, scope, this.controller);
      return this;
    },
    events: function(controller) {
      // TODO(sjmiles): originally `controller` was expected to be an Object with event handler
      // methods on it (typically a custom-element stamping a template).
      // In Arcs, we want to attach a generic handler (Function) for any event on this node.
      // Subtemplate stamping gets involved because they need to reuse whichever controller.
      // I suspect this can be simplified, but right now I'm just making it go.
      if (controller && typeof controller !== 'function') {
        controller = listen.bind(this, controller);
      }
      this.controller = controller;
      if (controller) {
        mapEvents(notes, map, controller);
      }
      return this;
    },
    appendTo: function(node) {
      if (this.root) {
        // TODO(sjmiles): assumes this.root is a fragment
        node.appendChild(this.root);
      } else {
        console.warn('Xen: cannot appendTo, template stamped no DOM');
      }
      // TODO(sjmiles): this.root is no longer a fragment
      this.root = node;
      return this;
    }
  };
  //window.stampTime += performance.now() - startTime;
  return dom;
};

const maybeStringToTemplate = template => {
  // TODO(sjmiles): need to memoize this somehow
  return (typeof template === 'string') ? createTemplate(template) : template;
};

const createTemplate = innerHTML => {
  return Object.assign(document.createElement('template'), {innerHTML});
};

/* harmony default export */ __webpack_exports__["a"] = ({
  createTemplate,
  setBoolAttribute,
  stamp
});


/***/ }),
/* 116 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__runtime_arc_js__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__runtime_description_js__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__runtime_manifest_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__runtime_planificator_js__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__runtime_planner_js__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__runtime_slot_composer_js__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__runtime_dom_slot_js__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__runtime_type_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__browser_loader_js__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__tracelib_trace_js__ = __webpack_require__(6);
/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */












//Tracing.enable();

const Arcs = {
  version: '0.3',
  Arc: __WEBPACK_IMPORTED_MODULE_0__runtime_arc_js__["a" /* Arc */],
  Description: __WEBPACK_IMPORTED_MODULE_1__runtime_description_js__["a" /* Description */],
  Manifest: __WEBPACK_IMPORTED_MODULE_2__runtime_manifest_js__["a" /* Manifest */],
  Planificator: __WEBPACK_IMPORTED_MODULE_3__runtime_planificator_js__["a" /* Planificator */],
  Planner: __WEBPACK_IMPORTED_MODULE_4__runtime_planner_js__["a" /* Planner */],
  SlotComposer: __WEBPACK_IMPORTED_MODULE_5__runtime_slot_composer_js__["a" /* SlotComposer */],
  DomSlot: __WEBPACK_IMPORTED_MODULE_6__runtime_dom_slot_js__["a" /* DomSlot */],
  Type: __WEBPACK_IMPORTED_MODULE_7__runtime_type_js__["a" /* Type */],
  BrowserLoader: __WEBPACK_IMPORTED_MODULE_8__browser_loader_js__["a" /* BrowserLoader */],
  Tracing: __WEBPACK_IMPORTED_MODULE_9__tracelib_trace_js__["a" /* Tracing */],
};

// TODO(sjmiles): can't export because WebPack won't make a built version with a module export
// Instead we fall back to populating a global (possibly already created in app-shell/lib/arcs.js).
// export default Arcs;

window.Arcs = window.Arcs ? Object.assign(window.Arcs, Arcs) : Arcs;



/***/ })
/******/ ]);
//# sourceMappingURL=ArcsLib.js.map