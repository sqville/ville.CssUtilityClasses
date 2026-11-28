/**
 * Lightweight, non-DOM tree folder descriptor (`ville.ui.tree.TreeFolder` — `STRAT-WIDGET-08`, `STRAT-CORE-09`).
 *
 * Preserves Qooxdoo's `new TreeFolder(label)` + `folder.add(child)` + `folder.setOpen(true)`
 * API contract without allocating heavy nested `Widget` layout trees per node.
 * Rendered as semantic `<li role="treeitem">` + `<ul role="group">` inside `ville.ui.tree.Tree`.
 */
qx.Class.define("ville.ui.tree.TreeFolder", {
  extend: qx.core.Object,
  include: [ville.ui.form.MModelProperty],

  /**
   * @param {string} [label=""] Folder display label.
   * @param {string|null} [icon="FOLDER"] Optional icon glyph key.
   * @param {*} [model=null] Optional attached data model.
   */
  construct(label = "", icon = "FOLDER", model = null) {
    // @ts-ignore
    super();

    this.__children = [];
    if (label != null) {
      this.setLabel(String(label));
    }
    if (icon != null) {
      this.setIcon(icon);
    }
    if (model !== null && model !== undefined) {
      this.setModel(model);
    }
  },

  events: {
    /** Fired whenever this node or any descendant node mutates (`label`, `open`, `children`). */
    changeNode: "qx.event.type.Event"
  },

  properties: {
    /** Node label text. */
    label: {
      check: "String",
      init: "",
      apply: "_notifyTree",
      event: "changeLabel"
    },

    /** Icon glyph key when closed (defaults to `"FOLDER"`). */
    icon: {
      check: "String",
      nullable: true,
      init: "FOLDER",
      apply: "_notifyTree",
      event: "changeIcon"
    },

    /** Icon glyph key when opened (defaults to `"FOLDER_OPEN"`). */
    iconOpened: {
      check: "String",
      nullable: true,
      init: "FOLDER_OPEN",
      apply: "_notifyTree"
    },

    /** Whether the folder is expanded (`aria-expanded="true"`). */
    open: {
      check: "Boolean",
      init: false,
      apply: "_notifyTree",
      event: "changeOpen"
    },

    /** Programmatic value identifier for selection. */
    value: {
      check: "String",
      nullable: true,
      init: null
    }
  },

  members: {
    /** @type {Array<ville.ui.tree.TreeFolder|ville.ui.tree.TreeFile>} @private */
    __children: null,

    /** @type {ville.ui.tree.TreeFolder|null} @private */
    __parentNode: null,

    /**
     * Returns `true` if this node is a folder (or has children).
     *
     * @returns {boolean}
     */
    isFolder() {
      return true;
    },

    /**
     * Appends one or more child `TreeFolder` / `TreeFile` nodes.
     *
     * @param {...(ville.ui.tree.TreeFolder|ville.ui.tree.TreeFile)} nodes
     * @returns {this}
     */
    add(...nodes) {
      for (const node of nodes) {
        if (!node || this.__children.includes(node)) continue;
        node.__parentNode = this;
        this.__children.push(node);
        node.addListener("changeNode", this._notifyTree, this);
      }
      this._notifyTree();
      return this;
    },

    /**
     * Removes a child node from this folder.
     *
     * @param {ville.ui.tree.TreeFolder|ville.ui.tree.TreeFile} node
     */
    remove(node) {
      const idx = this.__children ? this.__children.indexOf(node) : -1;
      if (idx !== -1) {
        this.__children.splice(idx, 1);
        node.__parentNode = null;
        node.removeListener("changeNode", this._notifyTree, this);
        this._notifyTree();
      }
    },

    /**
     * Removes all child nodes from this folder.
     */
    removeAll() {
      if (!this.__children) return;
      for (const child of this.__children) {
        child.__parentNode = null;
        child.removeListener("changeNode", this._notifyTree, this);
      }
      this.__children.length = 0;
      this._notifyTree();
    },

    /**
     * Returns all child nodes of this folder.
     *
     * @returns {Array<ville.ui.tree.TreeFolder|ville.ui.tree.TreeFile>}
     */
    getChildren() {
      return this.__children ? this.__children.slice() : [];
    },

    /**
     * Checks whether this folder has any child nodes.
     *
     * @returns {boolean}
     */
    hasChildren() {
      return Boolean(this.__children && this.__children.length > 0);
    },

    /**
     * Returns the parent `TreeFolder` node, or `null`.
     *
     * @returns {ville.ui.tree.TreeFolder|null}
     */
    getParent() {
      return this.__parentNode;
    },

    /**
     * Returns the effective value identifier (`value` -> `model` -> `label`).
     *
     * @returns {*}
     */
    getEffectiveValue() {
      return this.getValue() ?? this.getModel() ?? this.getLabel();
    },

    _notifyTree() {
      this.fireEvent("changeNode");
    }
  },

  destruct() {
    this.__children = null;
    this.__parentNode = null;
  }
});
