/**
 * Abstract shared base class for Mode 3 root widgets (`ville.ui.root.*`)[span_35](start_span)[span_35](end_span).
 *
 * Extends `ville.ui.core.Widget` directly (omitting `qx.ui.core.MChildrenHandling`
 * and `QxLayout` dependencies) and exposes a clean `add()` method for mounting
 * top-level `ville.ui.*` components into the DOM root[span_36](start_span)[span_36](end_span).
 */
qx.Class.define("ville.ui.root.Abstract", {
  type: "abstract",
  extend: ville.ui.core.Widget,

  // REMOVED MChildrenHandling to prevent layout engine crashes[span_37](start_span)[span_37](end_span)
  // include: [qx.ui.core.MBlocker],

  /**
   * Initializes the abstract root widget[span_38](start_span)[span_38](end_span).
   */
  construct() {
    super();

    // RESTORED: Required for keyboard accessibility (Space/Enter on Buttons)[span_39](start_span)[span_39](end_span)
    // qx.ui.core.FocusHandler.getInstance().addRoot(this);
  },

  properties: {
    /**
     * Appearance selector ID for the root container (defaults to `"root"`)[span_40](start_span)[span_40](end_span).
     */
    appearance: {
      refine: true,
      init: "root"
    },

    /**
     * Whether the root widget and its subtree are enabled[span_41](start_span)[span_41](end_span).
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
     * Sets the global cursor style across all DOM elements[span_42](start_span)[span_42](end_span).
     */
    /*globalCursor: {
      check: "String",
      nullable: true,
      themeable: true,
      apply: "_applyGlobalCursor",
      event: "changeGlobalCursor"
    },*/

    /**
     * Whether the native browser context menu should be globally enabled[span_43](start_span)[span_43](end_span).
     */
    /*nativeContextMenu: {
      refine: true,
      init: false
    },*/

    /**
     * Whether pressing F1 in legacy IE suppresses the native help dialog[span_44](start_span)[span_44](end_span).
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
     * Dynamic `<style>` element used when a global cursor override is active[span_45](start_span)[span_45](end_span).
     *
     * @type {StyleSheet|null}
     * @private
     */
    __globalCursorStyleSheet: null,

    /**
     * Identifies this widget as a root container in the widget hierarchy[span_46](start_span)[span_46](end_span).
     *
     * @returns {boolean} Always `true` for root widgets[span_47](start_span)[span_47](end_span).
     */
    isRootWidget() {
      return true;
    },

    /**
     * Public API to append `ville.ui.core.Widget` instances directly to the root
     * DOM container without layout manager mediation[span_48](start_span)[span_48](end_span).
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to mount into the root[span_49](start_span)[span_49](end_span).
     */
    add(childWidget) {
      // Calls the pure DOM _add method built in ville.ui.core.Widget[span_50](start_span)[span_50](end_span)
      this._add(childWidget);
    },

    /**
     * Property apply handler for `globalCursor`. Injects or clears a universal
     * `* { cursor: ... !important }` rule on a dedicated stylesheet[span_51](start_span)[span_51](end_span).
     *
     * @param {string|null} value CSS cursor name or URL value[span_52](start_span)[span_52](end_span).
     * @param {string|null} old Previous cursor value[span_53](start_span)[span_53](end_span).
     * @protected
     */
    _applyGlobalCursor: qx.core.Environment.select("engine.name", {
      mshtml(value, old) {
        // empty implementation[span_54](start_span)[span_54](end_span)
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
     * capture-phase `contextmenu` listener[span_55](start_span)[span_55](end_span).
     *
     * @param {boolean} value Whether native context menus are allowed[span_56](start_span)[span_56](end_span).
     * @param {boolean} old Previous setting[span_57](start_span)[span_57](end_span).
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
        this.addListener("contextmenu", this._onNativeContextMenu, true);
      }
    },

    /**
     * Prevents the browser's native `contextmenu` from opening unless the target
     * widget explicitly enables `getNativeContextMenu()`[span_58](start_span)[span_58](end_span).
     *
     * @param {qx.event.type.Mouse} e Mouse contextmenu event[span_59](start_span)[span_59](end_span).
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
     * non-input widget is focused[span_60](start_span)[span_60](end_span).
     *
     * @param {qx.event.type.KeySequence} e Keyboard sequence event[span_61](start_span)[span_61](end_span).
     * @private
     */
    __preventScrollWhenFocused(e) {
      // Require space pressed[span_62](start_span)[span_62](end_span)
      if (e.getKeyIdentifier() !== "Space") {
        return;
      }

      var target = e.getTarget();

      // Require focused. Allow scroll when container or root widget[span_63](start_span)[span_63](end_span).
      var focusHandler = qx.ui.core.FocusHandler.getInstance();
      if (!focusHandler.isFocused(target)) {
        return;
      }

      // Require that widget does not accept text input[span_64](start_span)[span_64](end_span)
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

      // Do not prevent "space" key for natively focusable elements[span_65](start_span)[span_65](end_span)
      nodeName = qx.dom.Node.getName(e.getOriginalTarget());
      if (
        nodeName &&
        ["input", "textarea", "select", "a"].indexOf(nodeName) > -1
      ) {
        return;
      }

      // Ultimately, prevent default[span_66](start_span)[span_66](end_span)
      e.preventDefault();
    },

    /**
     * Property apply handler for `nativeHelp` (suppresses F1 help in legacy IE)[span_67](start_span)[span_67](end_span).
     *
     * @param {boolean} value Whether native F1 help is enabled[span_68](start_span)[span_68](end_span).
     * @param {boolean} old Previous setting[span_69](start_span)[span_69](end_span).
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
   * Releases the dynamic global cursor stylesheet reference[span_70](start_span)[span_70](end_span).
   */
  destruct() {
    this.__globalCursorStyleSheet = null;
  },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer(statics, members) {
    // qx.ui.core.MChildrenHandling.remap(members);[span_71](start_span)[span_71](end_span)
  }
});
