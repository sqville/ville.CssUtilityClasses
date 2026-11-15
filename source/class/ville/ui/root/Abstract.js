/**
 * Abstract shared base class for Mode 3 root widgets (`ville.ui.root.*`)[span_4](start_span)[span_4](end_span).
 *
 * Extends `ville.ui.core.Widget` directly (omitting `QxLayout` dependencies) and
 * includes `ville.ui.core.MChildrenHandling` to expose the public container API
 * (`add`, `addAt`, `addBefore`, `addAfter`, `remove`, `removeAt`, `removeAll`,
 * `getChildren`, `hasChildren`, `indexOf`) for mounting top-level widgets[span_5](start_span)[span_5](end_span).
 */
qx.Class.define("ville.ui.root.Abstract", {
  type: "abstract",
  extend: ville.ui.core.Widget,
  include: [ville.ui.core.MChildrenHandling],

  /**
   * Initializes the abstract root widget[span_6](start_span)[span_6](end_span).
   */
  construct() {
    super();

    // RESTORED: Required for keyboard accessibility (Space/Enter on Buttons)[span_7](start_span)[span_7](end_span)
    // qx.ui.core.FocusHandler.getInstance().addRoot(this);
  },

  properties: {
    /**
     * Appearance selector ID for the root container (defaults to `"root"`)[span_8](start_span)[span_8](end_span).
     */
    appearance: {
      refine: true,
      init: "root"
    },

    /**
     * Whether the root widget and its subtree are enabled[span_9](start_span)[span_9](end_span).
     */
    enabled: {
      refine: true,
      init: true
    }

    // overridden
    /*focusable: {
      refine: true,
      init: true
    },*/

    /**
     * Sets the global cursor style across all DOM elements[span_10](start_span)[span_10](end_span).
     */
    /*globalCursor: {
      check: "String",
      nullable: true,
      themeable: true,
      apply: "_applyGlobalCursor",
      event: "changeGlobalCursor"
    },*/

    /**
     * Whether the native browser context menu should be globally enabled[span_11](start_span)[span_11](end_span).
     */
    /*nativeContextMenu: {
      refine: true,
      init: false
    },*/

    /**
     * Whether pressing F1 in legacy IE suppresses the native help dialog[span_12](start_span)[span_12](end_span).
     */
    /*nativeHelp: {
      check: "Boolean",
      init: false,
      apply: "_applyNativeHelp"
    }*/
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Dynamic `<style>` element used when a global cursor override is active[span_13](start_span)[span_13](end_span).
     *
     * @type {StyleSheet|null}
     * @private
     */
    __globalCursorStyleSheet: null,

    /**
     * Identifies this widget as a root container in the widget hierarchy[span_14](start_span)[span_14](end_span).
     *
     * @returns {boolean} Always `true` for root widgets[span_15](start_span)[span_15](end_span).
     */
    isRootWidget() {
      return true;
    },

    /**
     * Property apply handler for `globalCursor`. Injects or clears a universal
     * `* { cursor: ... !important }` rule on a dedicated stylesheet[span_16](start_span)[span_16](end_span).
     *
     * @param {string|null} value CSS cursor name or URL value[span_17](start_span)[span_17](end_span).
     * @param {string|null} old Previous cursor value[span_18](start_span)[span_18](end_span).
     * @protected
     */
    _applyGlobalCursor: qx.core.Environment.select("engine.name", {
      mshtml(value, old) {
        // empty implementation[span_19](start_span)[span_19](end_span)
      },

      default(value, old) {
        var Stylesheet = qx.bom.Stylesheet;

        var sheet = this.__globalCursorStyleSheet;
        if (!sheet) {
          this.__globalCursorStyleSheet = sheet = Stylesheet.createElement();
        }

        Stylesheet.removeAllRules(sheet);

        if (value) {
          Stylesheet.addRule(
            sheet,
            "*",
            qx.bom.element.Cursor.compile(value).replace(";", "") +
              " !important"
          );
        }
      }
    }),

    /**
     * Property apply handler for `nativeContextMenu`. Attaches or detaches the
     * capture-phase `contextmenu` listener[span_20](start_span)[span_20](end_span).
     *
     * @param {boolean} value Whether native context menus are allowed[span_21](start_span)[span_21](end_span).
     * @param {boolean} old Previous setting[span_22](start_span)[span_22](end_span).
     * @protected
     */
    _applyNativeContextMenu(value, old) {
      if (value) {
        this.removeListener(
          "contextmenu",
          this._onNativeContextMenu,
          this,
          true
        );
      } else {
        this.addListener("contextmenu", this._onNativeContextMenu, this, true);
      }
    },

    /**
     * Prevents the browser's native `contextmenu` from opening unless the target
     * widget explicitly enables `getNativeContextMenu()`[span_23](start_span)[span_23](end_span).
     *
     * @param {qx.event.type.Mouse} e Mouse contextmenu event[span_24](start_span)[span_24](end_span).
     * @protected
     */
    _onNativeContextMenu(e) {
      if (e.getTarget().getNativeContextMenu()) {
        return;
      }
      e.preventDefault();
    },

    /**
     * Prevents unexpected viewport scrolling when pressing `Space` while a
     * non-input widget is focused[span_25](start_span)[span_25](end_span).
     *
     * @param {qx.event.type.KeySequence} e Keyboard sequence event[span_26](start_span)[span_26](end_span).
     * @private
     */
    __preventScrollWhenFocused(e) {
      // Require space pressed[span_27](start_span)[span_27](end_span)
      if (e.getKeyIdentifier() !== "Space") {
        return;
      }

      var target = e.getTarget();

      // Require focused. Allow scroll when container or root widget[span_28](start_span)[span_28](end_span).
      var focusHandler = qx.ui.core.FocusHandler.getInstance();
      if (!focusHandler.isFocused(target)) {
        return;
      }

      // Require that widget does not accept text input[span_29](start_span)[span_29](end_span)
      var el = target.getContentElement();
      var nodeName = el.getNodeName();
      var domEl = el.getDomElement();
      if (
        nodeName === "input" ||
        nodeName === "textarea" ||
        (domEl && domEl.contentEditable === "true")
      ) {
        return;
      }

      // Do not prevent "space" key for natively focusable elements[span_30](start_span)[span_30](end_span)
      nodeName = qx.dom.Node.getName(e.getOriginalTarget());
      if (
        nodeName &&
        ["input", "textarea", "select", "a"].indexOf(nodeName) > -1
      ) {
        return;
      }

      // Ultimately, prevent default[span_31](start_span)[span_31](end_span)
      e.preventDefault();
    },

    /**
     * Property apply handler for `nativeHelp` (suppresses F1 help in legacy IE)[span_32](start_span)[span_32](end_span).
     *
     * @param {boolean} value Whether native F1 help is enabled[span_33](start_span)[span_33](end_span).
     * @param {boolean} old Previous setting[span_34](start_span)[span_34](end_span).
     * @protected
     */
    _applyNativeHelp(value, old) {
      if (qx.core.Environment.get("event.help")) {
        if (old === false) {
          qx.bom.Event.removeNativeListener(document, "help", function () {
            return false;
          });
        }

        if (value === false) {
          qx.bom.Event.addNativeListener(document, "help", function () {
            return false;
          });
        }
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  /**
   * Releases the dynamic global cursor stylesheet reference[span_35](start_span)[span_35](end_span).
   */
  destruct() {
    this.__globalCursorStyleSheet = null;
  }
});
