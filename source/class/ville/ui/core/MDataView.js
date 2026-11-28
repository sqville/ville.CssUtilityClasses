/**
 * Unified Non-Virtual Data View Mixin (`ville.ui.core.MDataView` — `STRAT-WIDGET-08`, `STRAT-CORE-06`).
 *
 * Ends Qooxdoo's `Widget` vs. `Virtual*` widget dilemma across `SelectBox`,
 * `ComboBox`, `List`, `Tree`, and `Table` by combining:
 *  1. **Flattened Single-Widget Container**: The host widget is the *only*
 *     `ville.ui.core.Widget` instance; individual rows/options are lightweight
 *     DOM elements or `ville.ui.form.ListItem` descriptors.
 *  2. **Pre-Processed `<template>` Row Blueprint + C++ `cloneNode(true)`**:
 *     Evaluates the active theme's row appearance (`styleFrom(itemAppearance)`)
 *     *once* per render batch, stamps classes/attributes onto a cached HTML
 *     `<template>`, and clones rows in C++ into a single `DocumentFragment`.
 *  3. **Two-Tier Scaling (`content-visibility: auto` + Windowed DOM Recycling)**:
 *     - **Tier 1 (< `virtualThreshold` items)**: Applies native CSS
 *       `content-visibility: auto; contain-intrinsic-size: auto var(--ville-row-height, 32px)`.
 *     - **Tier 2 (>= `virtualThreshold` items)**: Windowed DOM slice rendering
 *       only the visible viewport rows + overscan buffer with top/bottom spacer padding
 *       driven by native `scroll` / `scrollend` events.
 *  4. **Zero-DOM-Mutation Search Highlighting (`CSS.highlights` — `STRAT-CORE-06`)**:
 *     Uses the W3C CSS Custom Highlight API (`CSS.highlights` + `Highlight` + `Range`)
 *     to highlight matching substrings across text nodes without injecting `<mark>` tags.
 *  5. **Dual API Ergonomics**: Supports both classic Qooxdoo `add(new ListItem(...))`
 *     and modern `setItems([{ label, value, icon, description, disabled }])` /
 *     `ville.data.Array` observable collections.
 *
 * @ignore(Highlight)
 */
qx.Mixin.define("ville.ui.core.MDataView", {
  statics: {
    /**
     * Applies zero-DOM-mutation text highlighting inside `containerEl` using the
     * W3C CSS Custom Highlight API (`CSS.highlights` + `Highlight` + `Range` — `STRAT-CORE-06`).
     * Styled in Layer 1 CSS via `::highlight(ville-search-match)`.
     *
     * @param {HTMLElement|null} containerEl Root DOM container to scan for text matches.
     * @param {string|null} query Search substring to highlight (clears highlight when empty).
     * @param {string} [highlightName="ville-search-match"] Registered CSS highlight name.
     * @returns {number} Number of matched text ranges highlighted.
     */
    applyCssHighlight(containerEl, query, highlightName = "ville-search-match") {
      if (
        typeof CSS === "undefined" ||
        !CSS.highlights ||
        typeof Highlight === "undefined" ||
        typeof document === "undefined"
      ) {
        return 0;
      }

      const trimmed = query ? String(query).trim().toLowerCase() : "";
      if (!trimmed || !containerEl) {
        CSS.highlights.delete(highlightName);
        return 0;
      }

      const ranges = [];
      const walker = document.createTreeWalker(
        containerEl,
        NodeFilter.SHOW_TEXT,
        null
      );
      let textNode = walker.nextNode();
      const qLen = trimmed.length;

      while (textNode) {
        const text = textNode.nodeValue || "";
        const lower = text.toLowerCase();
        let startPos = 0;
        let matchIdx = lower.indexOf(trimmed, startPos);
        while (matchIdx !== -1) {
          const range = new Range();
          range.setStart(textNode, matchIdx);
          range.setEnd(textNode, matchIdx + qLen);
          ranges.push(range);
          startPos = matchIdx + qLen;
          matchIdx = lower.indexOf(trimmed, startPos);
        }
        textNode = walker.nextNode();
      }

      if (ranges.length > 0) {
        CSS.highlights.set(highlightName, new Highlight(...ranges));
      } else {
        CSS.highlights.delete(highlightName);
      }

      return ranges.length;
    }
  },

  construct() {
    this.__dataItems = [];
    this.__itemChangeListeners = new Map();
    this.__virtualScrollTop = 0;
  },

  properties: {
    /**
     * Appearance selector ID used for pre-processing the `<template>` row blueprint.
     */
    itemAppearance: {
      check: "String",
      init: "listitem",
      apply: "_applyItemAppearance"
    },

    /**
     * Intrinsic row height in pixels for CSS `contain-intrinsic-size` and Tier 2 windowing.
     */
    rowHeight: {
      check: "Integer",
      init: 32,
      apply: "_applyRowHeight"
    },

    /**
     * Item count threshold at which `MDataView` automatically switches from Tier 1
     * (`content-visibility: auto`) to Tier 2 windowed DOM row-pool recycling.
     */
    virtualThreshold: {
      check: "Integer",
      init: 1500
    },

    /**
     * Live search substring highlighted across rendered rows via `CSS.highlights`.
     */
    highlightQuery: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyHighlightQuery"
    }
  },

  members: {
    /** @type {ville.ui.form.ListItem[]|null} @private */
    __dataItems: null,

    /** @type {Map<ville.ui.form.ListItem, string[]>|null} @private */
    __itemChangeListeners: null,

    /** @type {HTMLTemplateElement|null} @private */
    __rowTemplate: null,

    /** @type {string|null} @private */
    __cachedTemplateThemeKey: null,

    /** @type {boolean} @private */
    __renderScheduled: false,

    /** @type {number} @private */
    __virtualScrollTop: 0,

    /** @type {HTMLElement|null} @private */
    __lastRenderedContainer: null,

    /**
     * Normalizes a raw item (`string`, `{ label, value, icon, model, description, disabled }`,
     * or `ville.ui.form.ListItem`) into a `ville.ui.form.ListItem` descriptor.
     *
     * @param {string|Object|ville.ui.form.ListItem} raw
     * @returns {ville.ui.form.ListItem}
     * @protected
     */
    _normalizeDataItem(raw) {
      if (raw instanceof ville.ui.form.ListItem) {
        return raw;
      }
      if (typeof raw === "string" || typeof raw === "number") {
        const s = String(raw);
        return new ville.ui.form.ListItem(s, null, s);
      }
      if (raw && typeof raw === "object") {
        const label =
          raw.label !== undefined
            ? String(raw.label)
            : raw.text !== undefined
            ? String(raw.text)
            : String(raw.value ?? "");
        const icon = raw.icon || null;
        const model =
          raw.model !== undefined
            ? raw.model
            : raw.value !== undefined
            ? raw.value
            : raw;
        const item = new ville.ui.form.ListItem(label, icon, model);
        if (raw.value !== undefined && raw.value !== null) {
          item.setValue(String(raw.value));
        }
        if (raw.description) {
          item.setDescription(String(raw.description));
        }
        if (raw.disabled === true || raw.enabled === false) {
          item.setEnabled(false);
        }
        return item;
      }
      return new ville.ui.form.ListItem("");
    },

    /**
     * Attaches property change listeners to a `ListItem` so in-place mutations
     * automatically refresh the rendered row.
     *
     * @param {ville.ui.form.ListItem} item
     * @private
     */
    __watchDataItem(item) {
      if (!item || this.__itemChangeListeners.has(item)) {
        return;
      }
      const onMutate = () => this._scheduleDataViewRender();
      const ids = [
        item.addListener("changeLabel", onMutate, this),
        item.addListener("changeIcon", onMutate, this),
        item.addListener("changeEnabled", onMutate, this),
        item.addListener("changeModel", onMutate, this),
        item.addListener("changeDescription", onMutate, this)
      ];
      this.__itemChangeListeners.set(item, ids);
    },

    /**
     * Detaches property change listeners from a `ListItem`.
     *
     * @param {ville.ui.form.ListItem} item
     * @private
     */
    __unwatchDataItem(item) {
      const ids = this.__itemChangeListeners?.get(item);
      if (ids && item && !item.isDisposed()) {
        for (const id of ids) {
          item.removeListenerById(id);
        }
      }
      this.__itemChangeListeners?.delete(item);
    },

    /**
     * Replaces all items in the data view from an Array or `ville.data.Array` of
     * strings, option maps (`{ label, value, icon, description }`), or `ListItem`s.
     *
     * @param {Array<string|Object|ville.ui.form.ListItem>|ville.data.Array} items
     * @returns {this}
     */
    setItems(items) {
      this.removeAll();
      const arr =
        items instanceof ville.data.Array
          ? items.toArray()
          : Array.isArray(items)
          ? items
          : [];
      for (let i = 0; i < arr.length; i++) {
        const item = this._normalizeDataItem(arr[i]);
        this.__dataItems.push(item);
        this.__watchDataItem(item);
      }
      this._onDataItemsChanged();
      this._scheduleDataViewRender();
      return this;
    },

    /**
     * Returns all `ville.ui.form.ListItem` descriptors in this data view.
     *
     * @returns {ville.ui.form.ListItem[]}
     */
    getItems() {
      return this.__dataItems ? this.__dataItems.slice() : [];
    },

    /**
     * Qooxdoo compatibility alias for `getItems()`.
     *
     * @returns {ville.ui.form.ListItem[]}
     */
    getChildren() {
      return this.getItems();
    },

    /**
     * Appends one or more `ListItem` descriptors (or `{ label, value, icon }` maps)
     * to the data view.
     *
     * @param {...(ville.ui.form.ListItem|Object|string)} items
     * @returns {this}
     */
    add(...items) {
      for (const raw of items) {
        if (!raw) continue;
        const item = this._normalizeDataItem(raw);
        if (!this.__dataItems.includes(item)) {
          this.__dataItems.push(item);
          this.__watchDataItem(item);
        }
      }
      this._onDataItemsChanged();
      this._scheduleDataViewRender();
      return this;
    },

    /**
     * Inserts an item at the specified zero-based index.
     *
     * @param {ville.ui.form.ListItem|Object|string} rawItem
     * @param {number} index
     * @returns {this}
     */
    addAt(rawItem, index) {
      const item = this._normalizeDataItem(rawItem);
      const existingIdx = this.__dataItems.indexOf(item);
      if (existingIdx !== -1) {
        this.__dataItems.splice(existingIdx, 1);
      }
      const clamped = Math.max(0, Math.min(index, this.__dataItems.length));
      this.__dataItems.splice(clamped, 0, item);
      this.__watchDataItem(item);
      this._onDataItemsChanged();
      this._scheduleDataViewRender();
      return this;
    },

    /**
     * Removes an item from the data view.
     *
     * @param {ville.ui.form.ListItem} item
     * @returns {ville.ui.form.ListItem|null}
     */
    remove(item) {
      const idx = this.__dataItems.indexOf(item);
      if (idx !== -1) {
        this.__dataItems.splice(idx, 1);
        this.__unwatchDataItem(item);
        this._onDataItemsChanged();
        this._scheduleDataViewRender();
        return item;
      }
      return null;
    },

    /**
     * Removes and returns the item at `index`.
     *
     * @param {number} index
     * @returns {ville.ui.form.ListItem|null}
     */
    removeAt(index) {
      if (index < 0 || index >= this.__dataItems.length) {
        return null;
      }
      const [item] = this.__dataItems.splice(index, 1);
      this.__unwatchDataItem(item);
      this._onDataItemsChanged();
      this._scheduleDataViewRender();
      return item || null;
    },

    /**
     * Removes all items from the data view and returns the removed list.
     *
     * @returns {ville.ui.form.ListItem[]}
     */
    removeAll() {
      const removed = this.__dataItems ? this.__dataItems.slice() : [];
      for (const item of removed) {
        this.__unwatchDataItem(item);
      }
      if (this.__dataItems) {
        this.__dataItems.length = 0;
      }
      this._onDataItemsChanged();
      this._scheduleDataViewRender();
      return removed;
    },

    /**
     * Returns the zero-based index of `item`, or `-1`.
     *
     * @param {ville.ui.form.ListItem} item
     * @returns {number}
     */
    indexOf(item) {
      return this.__dataItems ? this.__dataItems.indexOf(item) : -1;
    },

    /**
     * Finds the first `ListItem` matching the given value, model, or label string.
     *
     * @param {*} valueOrLabel
     * @returns {ville.ui.form.ListItem|null}
     */
    findItem(valueOrLabel) {
      if (!this.__dataItems) return null;
      for (let i = 0; i < this.__dataItems.length; i++) {
        const item = this.__dataItems[i];
        if (
          item === valueOrLabel ||
          item.getEffectiveValue() === valueOrLabel ||
          item.getModel() === valueOrLabel ||
          item.getLabel() === valueOrLabel
        ) {
          return item;
        }
      }
      return null;
    },

    /**
     * Returns or compiles the pre-processed HTML `<template>` row blueprint for
     * the current vendor theme and `itemAppearance` (`STRAT-WIDGET-08`).
     *
     * @param {Object} [states={}] Optional appearance states map.
     * @returns {HTMLTemplateElement|null}
     * @protected
     */
    _getOrBuildRowTemplate(states = {}) {
      if (typeof document === "undefined") {
        return null;
      }
      const vendor = ville.core.Environment.get("ville.cssEngine") || "mantine";
      const selector = this.getItemAppearance() || "listitem";
      const rowH = this.getRowHeight() || 32;
      const cacheKey = `${vendor}:${selector}:${rowH}`;

      if (this.__rowTemplate && this.__cachedTemplateThemeKey === cacheKey) {
        return this.__rowTemplate;
      }

      const styles =
        ville.theme.manager.Appearance.getInstance().styleFrom(selector, states) ||
        {};
      const utilityClasses = styles.cssUtilityClass || "ville-dataview-item";
      const stateClasses =
        styles.cssStates && Array.isArray(styles.cssStates["set-classes"])
          ? styles.cssStates["set-classes"].join(" ")
          : "";
      const allClasses = [utilityClasses, stateClasses]
        .filter(Boolean)
        .join(" ")
        .trim();

      const tmpl = document.createElement("template");
      tmpl.innerHTML = `<div role="option" class="${allClasses}" style="content-visibility:auto;contain-intrinsic-size:auto ${rowH}px;"><span class="ville-dataview-item-check" data-slot="check" aria-hidden="true"></span><span class="ville-dataview-item-icon" data-slot="icon" aria-hidden="true"></span><span class="ville-dataview-item-body" data-slot="content"><span class="ville-dataview-item-label" data-slot="label"></span><span class="ville-dataview-item-description" data-slot="description"></span></span></div>`;

      const rootNode = /** @type {HTMLElement|null} */ (
        tmpl.content.firstElementChild
      );
      if (rootNode && styles.cssStates && styles.cssStates["set-attributes"]) {
        for (const [attr, val] of Object.entries(
          styles.cssStates["set-attributes"]
        )) {
          if (val !== null && val !== false) {
            rootNode.setAttribute(attr, val === true ? "" : String(val));
          }
        }
      }

      this.__rowTemplate = tmpl;
      this.__cachedTemplateThemeKey = cacheKey;
      return tmpl;
    },

    /**
     * Renders `__dataItems` into `targetDomContainer` using C++ `template.content.cloneNode(true)`
     * and a single `DocumentFragment`.
     *
     * Automatically engages Tier 2 windowed viewport slicing when the filtered row count
     * meets or exceeds `virtualThreshold`.
     *
     * @param {HTMLElement|null} targetDomContainer Live DOM element to populate.
     * @param {Object} [options] Render options (`filterText`, `selectedItems`, `activeIndex`, `showCheckmark`, `highlightQuery`).
     * @protected
     */
    _renderDataViewRows(targetDomContainer, options = {}) {
      if (!targetDomContainer || typeof document === "undefined") {
        return;
      }
      this.__lastRenderedContainer = targetDomContainer;
      const tmpl = this._getOrBuildRowTemplate();
      if (!tmpl) {
        return;
      }

      const filterLower = options.filterText
        ? String(options.filterText).trim().toLowerCase()
        : "";
      const selectedSet = new Set(options.selectedItems || []);
      const activeIdx =
        options.activeIndex !== undefined ? options.activeIndex : -1;
      const showCheck = options.showCheckmark !== false;
      const idPrefix = this.toHashCode ? `ville-opt-${this.toHashCode()}-` : "ville-opt-";

      // Collect matching item indices
      const matchingIndices = [];
      for (let i = 0; i < this.__dataItems.length; i++) {
        const item = this.__dataItems[i];
        if (filterLower) {
          const label = item.getLabel() || "";
          const desc = item.getDescription();
          if (
            !label.toLowerCase().includes(filterLower) &&
            !(desc && desc.toLowerCase().includes(filterLower))
          ) {
            continue;
          }
        }
        matchingIndices.push(i);
      }

      const totalFiltered = matchingIndices.length;
      const threshold = this.getVirtualThreshold() || 1500;
      const rowH = this.getRowHeight() || 32;
      const useTier2Virtual = totalFiltered >= threshold;

      let startSlice = 0;
      let endSlice = totalFiltered;

      if (useTier2Virtual) {
        this.__wireTier2ScrollContainer(targetDomContainer);
        const scrollTop = targetDomContainer.scrollTop || this.__virtualScrollTop || 0;
        const viewportH = targetDomContainer.clientHeight || 320;
        const overscan = 12;
        startSlice = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
        endSlice = Math.min(
          totalFiltered,
          Math.ceil((scrollTop + viewportH) / rowH) + overscan
        );
      }

      const fragment = document.createDocumentFragment();

      if (useTier2Virtual && startSlice > 0) {
        const topSpacer = document.createElement("div");
        topSpacer.setAttribute("aria-hidden", "true");
        topSpacer.style.height = `${startSlice * rowH}px`;
        topSpacer.style.flexShrink = "0";
        fragment.appendChild(topSpacer);
      }

      for (let s = startSlice; s < endSlice; s++) {
        const i = matchingIndices[s];
        const item = this.__dataItems[i];
        const label = item.getLabel() || "";
        const desc = item.getDescription();
        const isSelected = selectedSet.has(item);
        const isEnabled = item.getEnabled();
        const isActive = i === activeIdx;

        const rowEl = /** @type {HTMLElement} */ (
          tmpl.content.firstElementChild.cloneNode(true)
        );
        rowEl.id = `${idPrefix}${i}`;
        rowEl.setAttribute("data-ville-index", String(i));
        rowEl.setAttribute("aria-selected", isSelected ? "true" : "false");

        if (isSelected) {
          rowEl.setAttribute("data-selected", "true");
          rowEl.setAttribute("data-combobox-selected", "true");
          rowEl.setAttribute("data-checked", "true");
          rowEl.classList.add("is-selected");
        }
        if (isActive) {
          rowEl.setAttribute("data-highlighted", "true");
          rowEl.setAttribute("data-combobox-active", "true");
          rowEl.classList.add("is-active");
        }
        if (!isEnabled) {
          rowEl.setAttribute("aria-disabled", "true");
          rowEl.setAttribute("data-disabled", "true");
          rowEl.setAttribute("data-combobox-disabled", "true");
          rowEl.classList.add("is-disabled");
        }

        const checkSlot = rowEl.querySelector('[data-slot="check"]');
        if (checkSlot) {
          if (showCheck && isSelected) {
            const checkDom = ville.ui.icon.Default.createDomElement("CHECK", {
              size: 14,
              useSprite: true
            });
            if (checkDom) {
              checkSlot.appendChild(checkDom);
            }
          } else if (!showCheck) {
            checkSlot.remove();
          }
        }

        const iconSlot = rowEl.querySelector('[data-slot="icon"]');
        const iconSpec = item.getIcon();
        if (iconSlot) {
          if (iconSpec) {
            const iconDom = ville.ui.icon.Default.createDomElement(iconSpec, {
              size: 16,
              useSprite: true
            });
            if (iconDom) {
              iconSlot.appendChild(iconDom);
            }
          } else {
            iconSlot.remove();
          }
        }

        const labelSlot = rowEl.querySelector('[data-slot="label"]');
        if (labelSlot) {
          labelSlot.textContent = label;
        }

        const descSlot = rowEl.querySelector('[data-slot="description"]');
        if (descSlot) {
          if (desc) {
            descSlot.textContent = desc;
          } else {
            descSlot.remove();
          }
        }

        fragment.appendChild(rowEl);
      }

      if (useTier2Virtual && endSlice < totalFiltered) {
        const bottomSpacer = document.createElement("div");
        bottomSpacer.setAttribute("aria-hidden", "true");
        bottomSpacer.style.height = `${(totalFiltered - endSlice) * rowH}px`;
        bottomSpacer.style.flexShrink = "0";
        fragment.appendChild(bottomSpacer);
      }

      targetDomContainer.replaceChildren(fragment);

      // Apply W3C CSS Custom Highlight API (`CSS.highlights`) if a search/filter query is active
      const highlightStr =
        options.highlightQuery !== undefined
          ? options.highlightQuery
          : this.getHighlightQuery() || options.filterText || null;
      if (highlightStr) {
        ville.ui.core.MDataView.applyCssHighlight(targetDomContainer, highlightStr);
      }
    },

    /**
     * Attaches a passive native `scroll` listener to `containerEl` once when Tier 2
     * windowed virtualization is engaged.
     *
     * @param {HTMLElement} containerEl
     * @private
     */
    __wireTier2ScrollContainer(containerEl) {
      if (!containerEl || containerEl.$$villeTier2Wired) {
        return;
      }
      containerEl.$$villeTier2Wired = true;
      containerEl.addEventListener(
        "scroll",
        () => {
          const nextTop = containerEl.scrollTop;
          const rowH = this.getRowHeight() || 32;
          if (Math.abs(nextTop - this.__virtualScrollTop) >= rowH * 3) {
            this.__virtualScrollTop = nextTop;
            this._syncDataViewDom();
          }
        },
        { passive: true }
      );
    },

    /**
     * Coalesces multiple synchronous item mutations into a single microtask DOM render.
     *
     * @protected
     */
    _scheduleDataViewRender() {
      if (this.__renderScheduled) {
        return;
      }
      this.__renderScheduled = true;
      queueMicrotask(() => {
        this.__renderScheduled = false;
        if (!this.isDisposed()) {
          this._syncDataViewDom();
        }
      });
    },

    /**
     * Hook called when the item list changes (`add`, `remove`, `setItems`).
     * Subclasses override this to adjust selection state if needed.
     *
     * @protected
     */
    _onDataItemsChanged() {},

    /**
     * Hook implemented by the including class (`SelectBox`, `ComboBox`, `List`)
     * to re-render its row container via `_renderDataViewRows()`.
     *
     * @protected
     */
    _syncDataViewDom() {},

    _applyItemAppearance() {
      this.__rowTemplate = null;
      this.__cachedTemplateThemeKey = null;
      this._scheduleDataViewRender();
    },

    _applyRowHeight() {
      this.__rowTemplate = null;
      this.__cachedTemplateThemeKey = null;
      this._scheduleDataViewRender();
    },

    _applyHighlightQuery(value) {
      if (this.__lastRenderedContainer) {
        ville.ui.core.MDataView.applyCssHighlight(
          this.__lastRenderedContainer,
          value
        );
      }
    }
  },

  destruct() {
    if (this.__dataItems) {
      for (const item of this.__dataItems) {
        this.__unwatchDataItem(item);
      }
      this.__dataItems = null;
    }
    this.__itemChangeListeners = null;
    this.__rowTemplate = null;
    this.__lastRenderedContainer = null;
  }
});
