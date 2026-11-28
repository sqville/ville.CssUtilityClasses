/**
 * Ville UI's `QxLayout`-Style Take on `qx.ui.tree.Tree` (`ville.ui.tree.Tree` — `STRAT-WIDGET-08`, `STRAT-CORE-09`).
 *
 * Combines pure semantic HTML5 `<ul role="tree">` / `<li role="treeitem">` / `<ul role="group">`
 * markup (mapped 1:1 to Mantine's `Tree.css` `.m_f698e191`, `.m_f6970eb1`, `.m_dc283425`, `.m_75f3ecf`
 * and Layer 1 mechanics for Obsidian & shadcn) with **both** API styles:
 *  1. **Modern Data-Driven Tree API**:
 *     `tree.setItems([{ label: "source", open: true, children: [{ label: "Application.js", value: "app" }] }])`
 *  2. **Classic Qooxdoo `QxTree` API**:
 *     `const root = new ville.ui.tree.TreeFolder("Root"); root.setOpen(true); root.add(new ville.ui.tree.TreeFile("App.js")); tree.setRoot(root);`
 *
 * Zero child `Widget` instances are allocated per tree node: icons use deduplicated
 * `<svg><use href="#..."></use></svg>` sprites, and all expand/collapse + selection
 * interactions run through a single delegated root `"click"` and `"keydown"` listener!
 */
qx.Class.define("ville.ui.tree.Tree", {
  extend: ville.ui.core.Widget,
  implement: [ville.ui.core.ISingleSelection],

  /**
   * @param {ville.ui.tree.TreeFolder|Array<Object>|null} [rootOrItems=null] Optional initial root folder or items array.
   */
  construct(rootOrItems = null) {
    // @ts-ignore
    super();

    this.__nodeByHash = new Map();
    this.__selectedNode = null;

    const el = this.getContentElement();
    el.setAttributes({
      role: "tree",
      "data-tree-root": "true",
      tabindex: "0"
    });
    el.addListener("click", this._onTreeClick, this);
    el.addListener("keydown", this._onKeyDown, this);

    if (rootOrItems instanceof ville.ui.tree.TreeFolder) {
      this.setRoot(rootOrItems);
    } else if (Array.isArray(rootOrItems)) {
      this.setItems(rootOrItems);
    }
  },

  events: {
    /** Fired when the selected tree node changes. Data: `{ville.ui.tree.TreeFolder[]}` */
    changeSelection: "qx.event.type.Data",

    /** Fired when a node is clicked or toggled. Data: `{ node, value, open }` */
    nodeClick: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "tree"
    },

    /** Root `ville.ui.tree.TreeFolder` node (`qx.ui.tree.Tree` contract). */
    root: {
      check: "ville.ui.tree.TreeFolder",
      nullable: true,
      init: null,
      apply: "_applyRoot",
      event: "changeRoot"
    },

    /** Whether the root folder node itself is hidden (showing its top-level children directly). */
    hideRoot: {
      check: "Boolean",
      init: false,
      apply: "_scheduleTreeRender"
    },

    /** Whether vertical/horizontal indentation guide lines are drawn (`data-with-lines`). */
    withLines: {
      check: "Boolean",
      init: true,
      apply: "_scheduleTreeRender"
    },

    /** Currently selected node's effective value string. */
    value: {
      nullable: true,
      init: null,
      event: "changeValue"
    },

    /** Live search substring highlighted across visible tree labels via `CSS.highlights`. */
    highlightQuery: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyHighlightQuery"
    }
  },

  members: {
    /** @type {Map<string, ville.ui.tree.TreeFolder>} @private */
    __nodeByHash: null,

    /** @type {ville.ui.tree.TreeFolder|null} @private */
    __selectedNode: null,

    /** @type {boolean} @private */
    __renderScheduled: false,

    /** @type {*} @private */
    __rootListenerId: null,

    /**
     * @override
     * @returns {ville.html.Element}
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("ul");
    },

    /**
     * Populates the tree from a plain nested array of `{ label, value, icon, open, children: [...] }` objects.
     *
     * @param {Array<Object>} items
     * @returns {this}
     */
    setItems(items) {
      const virtualRoot = new ville.ui.tree.TreeFolder("Root");
      virtualRoot.setOpen(true);

      const buildNode = (raw) => {
        const hasChildren = Array.isArray(raw.children) && raw.children.length > 0;
        const isFolder = raw.isFolder !== undefined ? Boolean(raw.isFolder) : hasChildren;
        const node = isFolder
          ? new ville.ui.tree.TreeFolder(
              raw.label || raw.text || "",
              raw.icon || "FOLDER",
              raw.model !== undefined ? raw.model : raw.value
            )
          : new ville.ui.tree.TreeFile(
              raw.label || raw.text || "",
              raw.icon || "FILE",
              raw.model !== undefined ? raw.model : raw.value
            );
        if (raw.value !== undefined && raw.value !== null) {
          node.setValue(String(raw.value));
        }
        if (raw.open || raw.opened) {
          node.setOpen(true);
        }
        if (hasChildren) {
          for (const childRaw of raw.children) {
            node.add(buildNode(childRaw));
          }
        }
        return node;
      };

      if (Array.isArray(items)) {
        for (const item of items) {
          virtualRoot.add(buildNode(item));
        }
      }

      this.setHideRoot(true);
      this.setRoot(virtualRoot);
      return this;
    },

    /**
     * Expands all folder nodes in the tree.
     */
    expandAll() {
      this._walkNodes(this.getRoot(), (n) => {
        if (n.isFolder()) n.setOpen(true);
      });
    },

    /**
     * Collapses all folder nodes in the tree (except a hidden root).
     */
    collapseAll() {
      const root = this.getRoot();
      this._walkNodes(root, (n) => {
        if (n === root && this.getHideRoot()) return;
        if (n.isFolder()) n.setOpen(false);
      });
    },

    _walkNodes(node, cb) {
      if (!node) return;
      cb(node);
      for (const child of node.getChildren()) {
        this._walkNodes(child, cb);
      }
    },

    _applyRoot(value, old) {
      if (old && this.__rootListenerId) {
        old.removeListenerById(this.__rootListenerId);
        this.__rootListenerId = null;
      }
      if (value) {
        this.__rootListenerId = value.addListener(
          "changeNode",
          this._scheduleTreeRender,
          this
        );
      }
      this._scheduleTreeRender();
    },

    _scheduleTreeRender() {
      if (this.__renderScheduled) return;
      this.__renderScheduled = true;
      queueMicrotask(() => {
        this.__renderScheduled = false;
        if (!this.isDisposed()) {
          this._renderTreeDom();
        }
      });
    },

    _renderTreeDom() {
      const root = this.getRoot();
      this.__nodeByHash.clear();
      this._setAttribute("data-with-lines", this.getWithLines() ? "true" : null);

      if (!root) {
        this.getContentElement().setAttribute("html", "");
        ville.ui.core.Widget.scheduleFlush();
        return;
      }

      const escape = (str) =>
        String(str ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      const renderNodeHtml = (node, level) => {
        const hash = node.toHashCode();
        this.__nodeByHash.set(hash, node);

        const isFolder = node.isFolder();
        const isOpen = isFolder && node.getOpen();
        const isSelected = this.__selectedNode === node;
        const children = node.getChildren();

        const chevronChar = isFolder
          ? children.length > 0
            ? isOpen
              ? "▾"
              : "▸"
            : "•"
          : "";
        const iconGlyph = isFolder
          ? isOpen
            ? node.getIconOpened() || "FOLDER_OPEN"
            : node.getIcon() || "FOLDER"
          : node.getIcon() || "FILE";
        const iconVdom = ville.ui.icon.Default.createElement(iconGlyph, {
          size: 15,
          useSprite: false
        });
        const iconSvgHtml =
          iconVdom && ville.ui.icon.Default.GLYPHS[iconGlyph]
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="${
                ville.ui.icon.Default.GLYPHS[iconGlyph].viewBox || "0 0 24 24"
              }" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;">${
                ville.ui.icon.Default.GLYPHS[iconGlyph].inner
              }</svg>`
            : "";

        const ariaExpanded = isFolder
          ? ` aria-expanded="${isOpen ? "true" : "false"}"`
          : "";
        const selAttr = isSelected ? ' data-selected="true"' : "";

        let subtreeHtml = "";
        if (isFolder && isOpen && children.length > 0) {
          const childParts = [];
          for (let i = 0; i < children.length; i++) {
            childParts.push(renderNodeHtml(children[i], level + 1));
          }
          subtreeHtml = `<ul role="group" class="m_75f3ecf mantine-Tree-subtree ville-tree-subtree">${childParts.join(
            ""
          )}</ul>`;
        }

        return (
          `<li role="treeitem" class="m_f6970eb1 mantine-Tree-node ville-tree-node" data-node-hash="${hash}" data-level="${level}" aria-selected="${
            isSelected ? "true" : "false"
          }"${ariaExpanded} style="--label-offset:calc(${level - 1} * 1.25rem);">` +
            `<div class="m_dc283425 mantine-Tree-label ville-tree-label"${selAttr}>` +
              `<span class="ville-tree-chevron" aria-hidden="true">${chevronChar}</span>` +
              iconSvgHtml +
              `<span class="ville-tree-text">${escape(node.getLabel())}</span>` +
            `</div>` +
            subtreeHtml +
          `</li>`
        );
      };

      const topNodes = this.getHideRoot() ? root.getChildren() : [root];
      const htmlParts = [];
      for (let i = 0; i < topNodes.length; i++) {
        htmlParts.push(renderNodeHtml(topNodes[i], 1));
      }

      this.getContentElement().setAttribute("html", htmlParts.join(""));
      ville.ui.core.Widget.scheduleFlush();

      if (this.getHighlightQuery()) {
        queueMicrotask(() => {
          if (!this.isDisposed()) {
            const domEl = this.getContentElement().getDomElement();
            ville.ui.core.MDataView.applyCssHighlight(
              domEl,
              this.getHighlightQuery()
            );
          }
        });
      }
    },

    _applyHighlightQuery(value) {
      const domEl = this.getContentElement().getDomElement();
      ville.ui.core.MDataView.applyCssHighlight(domEl, value);
    },

    _onTreeClick(e) {
      if (!this.getEnabled()) return;
      const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt ? nativeEvt.target : null);
      if (!target || typeof target.closest !== "function") return;

      const labelEl = target.closest(".ville-tree-label");
      const liEl = labelEl ? labelEl.closest("li[data-node-hash]") : target.closest("li[data-node-hash]");
      if (!liEl) return;

      const hash = liEl.getAttribute("data-node-hash");
      const node = this.__nodeByHash.get(hash);
      if (!node) return;

      if (node.isFolder() && node.hasChildren()) {
        node.setOpen(!node.getOpen());
      }

      this.setSelection([node]);
      this.fireDataEvent("nodeClick", {
        node,
        value: node.getEffectiveValue(),
        open: node.getOpen()
      });
    },

    _onKeyDown(e) {
      if (!this.getEnabled() || !this.__selectedNode) return;
      const key = typeof e.getKey === "function" ? e.getKey() : e.key;
      const node = this.__selectedNode;

      if (key === "ArrowRight" && node.isFolder() && !node.getOpen()) {
        if (typeof e.preventDefault === "function") e.preventDefault();
        node.setOpen(true);
      } else if (key === "ArrowLeft" && node.isFolder() && node.getOpen()) {
        if (typeof e.preventDefault === "function") e.preventDefault();
        node.setOpen(false);
      }
    },

    // ------------------------------------------------------------------------
    // ISingleSelection Implementation
    // ------------------------------------------------------------------------

    getSelection() {
      return this.__selectedNode ? [this.__selectedNode] : [];
    },

    setSelection(items) {
      const next = Array.isArray(items) && items.length > 0 ? items[0] : null;
      const old = this.__selectedNode;
      if (old === next) return;

      this.__selectedNode = next;
      this.setValue(next ? next.getEffectiveValue() : null);
      this._scheduleTreeRender();
      this.fireDataEvent("changeSelection", next ? [next] : [], old ? [old] : []);
    },

    resetSelection() {
      this.setSelection([]);
    },

    isSelected(item) {
      return this.__selectedNode === item;
    },

    isSelectionEmpty() {
      return this.__selectedNode === null;
    },

    getSelectables() {
      return Array.from(this.__nodeByHash.values());
    }
  },

  destruct() {
    const root = this.getRoot();
    if (root && this.__rootListenerId) {
      root.removeListenerById(this.__rootListenerId);
    }
    this.__nodeByHash = null;
    this.__selectedNode = null;
  }
});
