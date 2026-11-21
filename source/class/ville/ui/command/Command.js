/**
 * Mode 3 UI command abstraction (`ville.ui.command.Command`) that binds global
 * keyboard shortcuts (via native `window.addEventListener("keydown", ...)` and
 * `KeyboardEvent.key`) and shared action metadata (`label`, `icon`, `enabled`,
 * `toolTipText`, `value`, `menu`) to one or more executable `ville.ui.*` widgets.
 *
 * Replaces `qx.ui.command.Command` and `qx.bom.Shortcut`, completely eliminating
 * dependencies on `qx.event.Registration`, `qx.event.handler.Keyboard`,
 * `qx.event.type.KeySequence`, and `qx.ui.menu.Menu`.
 *
 * NOTE: Instances of this class must be disposed of after use to unregister
 * the native `window` `"keydown"` listener.
 *
 * @example
 * const saveCmd = new ville.ui.command.Command("Control+S");
 * saveCmd.setLabel("Save");
 * saveCmd.addListener("execute", (e) => saveDocument());
 * const saveBtn = new ville.ui.form.Button(null, null, saveCmd);
 */
qx.Class.define("ville.ui.command.Command", {
  extend: qx.core.Object,
  implement: [qx.core.IDisposable],

  statics: {
    /**
     * Legacy alias map translating common shorthand key names to standard W3C
     * `KeyboardEvent.key` values (lowercase lookup keys).
     *
     * @type {Object<string, string>}
     */
    KEY_ALIASES: {
      ctrl: "Control",
      control: "Control",
      shift: "Shift",
      alt: "Alt",
      option: "Alt",
      meta: "Meta",
      cmd: "Meta",
      command: "Meta",
      win: "Meta",
      super: "Meta",
      esc: "Escape",
      escape: "Escape",
      del: "Delete",
      delete: "Delete",
      ins: "Insert",
      insert: "Insert",
      space: " ",
      spacebar: " ",
      enter: "Enter",
      return: "Enter",
      tab: "Tab",
      backspace: "Backspace",
      up: "ArrowUp",
      arrowup: "ArrowUp",
      down: "ArrowDown",
      arrowdown: "ArrowDown",
      left: "ArrowLeft",
      arrowleft: "ArrowLeft",
      right: "ArrowRight",
      arrowright: "ArrowRight",
      pageup: "PageUp",
      pagedown: "PageDown",
      home: "Home",
      end: "End",
      print: "PrintScreen",
      printscreen: "PrintScreen",
      numlock: "NumLock",
      capslock: "CapsLock",
      plus: "+",
      minus: "-"
    },

    /**
     * Human-readable display labels for special `KeyboardEvent.key` values.
     *
     * @type {Object<string, string>}
     */
    DISPLAY_LABELS: {
      " ": "Space",
      ArrowUp: "Up",
      ArrowDown: "Down",
      ArrowLeft: "Left",
      ArrowRight: "Right",
      Escape: "Esc",
      Delete: "Del"
    }
  },

  /**
   * Creates a new Command with an optional keyboard shortcut.
   *
   * @param {string|null} [shortcut] Key combination string composed of optional
   *   modifiers (`Control`, `Alt`, `Shift`, `Meta`) and a key separated by `+` or `-`
   *   (e.g., `"Alt+F1"`, `"Control+C"`, `"Control+Alt+Delete"`).
   */
  construct(shortcut) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    this.__modifiers = {
      Control: false,
      Shift: false,
      Meta: false,
      Alt: false
    };
    this.__key = null;
    this.__boundOnKeyDown = this.__onNativeKeyDown.bind(this);

    if (shortcut !== undefined && shortcut !== null) {
      this.setShortcut(shortcut);
    }

    this.__syncKeyListener();
  },

  events: {
    /**
     * Fired when the command is executed (either via keyboard shortcut or `execute()`).
     * The event's `getData()` payload contains the originating widget or target object.
     */
    execute: "qx.event.type.Data"
  },

  properties: {
    /**
     * Whether the command is currently active (typically controlled by a
     * `ville.ui.command.Group`). When `false`, `execute` will not fire even if
     * `enabled` is `true`.
     */
    active: {
      init: true,
      check: "Boolean",
      event: "changeActive",
      apply: "_applyActive"
    },

    /**
     * Whether the command and its bound widgets are enabled. When `false`,
     * `execute` will not fire.
     */
    enabled: {
      init: true,
      check: "Boolean",
      event: "changeEnabled",
      apply: "_applyEnabled"
    },

    /**
     * Keyboard shortcut combination string (e.g., `"Control+S"`, `"Alt+F1"`).
     */
    shortcut: {
      check: "String",
      apply: "_applyShortcut",
      nullable: true,
      event: "changeShortcut"
    },

    /**
     * Whether the command should fire repeatedly while the shortcut keys are held down.
     */
    autoRepeat: {
      check: "Boolean",
      init: false
    },

    /**
     * Shared text label synchronized to all connected widgets.
     */
    label: {
      check: "String",
      nullable: true,
      event: "changeLabel"
    },

    /**
     * Shared icon URI string or `ville.ui.core.Widget` icon instance synchronized
     * to all connected widgets.
     *
     * @type {string|ville.ui.core.Widget|null}
     */
    icon: {
      // @ts-ignore
      check: (value) => {
        return typeof value === "string" || value instanceof ville.ui.core.Widget;
      },
      nullable: true,
      event: "changeIcon"
    },

    /**
     * Shared tooltip text synchronized to all connected widgets.
     */
    toolTipText: {
      check: "String",
      nullable: true,
      event: "changeToolTipText"
    },

    /**
     * Shared value state (e.g., toggle/checked state) synchronized across connected widgets.
     */
    value: {
      nullable: true,
      event: "changeValue"
    },

    /**
     * Shared `ville.ui.menu.Menu` instance synchronized to connected menu buttons.
     */
    menu: {
      check: "ville.ui.menu.Menu",
      nullable: true,
      event: "changeMenu"
    }
  },

  members: {
    /**
     * Parsed modifier flags for the active shortcut.
     *
     * @type {{ Control: boolean, Shift: boolean, Meta: boolean, Alt: boolean }|null}
     * @private
     */
    __modifiers: null,

    /**
     * Normalized non-modifier `KeyboardEvent.key` target (single characters stored uppercase).
     *
     * @type {string|null}
     * @private
     */
    __key: null,

    /**
     * Bound native `keydown` listener function.
     *
     * @type {((e: KeyboardEvent) => void)|null}
     * @private
     */
    __boundOnKeyDown: null,

    /**
     * Whether the native `window` `"keydown"` listener is currently attached.
     *
     * @type {boolean}
     * @private
     */
    __listenerAttached: false,

    /**
     * Property apply handler for `active`.
     *
     * @protected
     */
    _applyActive() {
      this.__syncKeyListener();
    },

    /**
     * Property apply handler for `enabled`.
     *
     * @protected
     */
    _applyEnabled() {
      this.__syncKeyListener();
    },

    /**
     * Property apply handler for `shortcut`. Parses modifier and key tokens and
     * attaches/detaches the native `window` `"keydown"` listener as needed.
     *
     * @param {string|null} value New keyboard shortcut combination.
     * @protected
     */
    _applyShortcut(value) {
      this.__modifiers = {
        Control: false,
        Shift: false,
        Meta: false,
        Alt: false
      };
      this.__key = null;

      if (value) {
        if (/\s/.test(value)) {
          const msg = "Whitespaces are not allowed within shortcuts";
          this.error(msg);
          throw new Error(msg);
        }

        const tokens = [];
        let remaining = value;
        let index = 0;

        while (remaining.length > 0 && index !== -1) {
          index = remaining.search(/[-+]+/);
          tokens.push(
            remaining.length === 1 || index === -1
              ? remaining
              : remaining.substring(0, index)
          );
          remaining = remaining.substring(index + 1);
        }

        for (let i = 0; i < tokens.length; i++) {
          const normalized = this.__normalizeKeyToken(tokens[i]);

          if (
            normalized === "Control" ||
            normalized === "Shift" ||
            normalized === "Meta" ||
            normalized === "Alt"
          ) {
            this.__modifiers[normalized] = true;
          } else {
            if (this.__key) {
              const msg = "You can only specify one non-modifier key!";
              this.error(msg);
              throw new Error(msg);
            }
            this.__key = normalized;
          }
        }
      }

      this.__syncKeyListener();
    },

    /**
     * Normalizes a single shortcut token into either a modifier name (`"Control"`,
     * `"Shift"`, `"Meta"`, `"Alt"`) or a standard `KeyboardEvent.key` string.
     *
     * @param {string} rawToken Token extracted from the shortcut string.
     * @returns {string} Normalized key or modifier identifier.
     * @private
     */
    __normalizeKeyToken(rawToken) {
      const lower = rawToken.toLowerCase();
      const aliases = ville.ui.command.Command.KEY_ALIASES;

      if (aliases[lower]) {
        return aliases[lower];
      }

      if (rawToken.length === 1) {
        return rawToken.toUpperCase();
      }

      if (/^f([1-9]|1[0-9]|2[0-4])$/i.test(rawToken)) {
        return rawToken.toUpperCase();
      }

      return rawToken.charAt(0).toUpperCase() + rawToken.slice(1);
    },

    /**
     * Attaches or detaches the native `window` `"keydown"` listener depending on
     * whether a valid shortcut key is configured and both `active` and `enabled` are `true`.
     *
     * @private
     */
    __syncKeyListener() {
      const shouldListen = Boolean(
        this.__key &&
          this.getActive() &&
          this.getEnabled() &&
          this.__boundOnKeyDown &&
          typeof window !== "undefined"
      );

      if (shouldListen && !this.__listenerAttached) {
        window.addEventListener("keydown", this.__boundOnKeyDown);
        this.__listenerAttached = true;
      } else if (!shouldListen && this.__listenerAttached) {
        window.removeEventListener("keydown", this.__boundOnKeyDown);
        this.__listenerAttached = false;
      }
    },

    /**
     * Native `window` `"keydown"` listener that matches modifier and key state
     * against the configured shortcut.
     *
     * @param {KeyboardEvent} e Native browser keyboard event.
     * @private
     */
    __onNativeKeyDown(e) {
      if (!this.getActive() || !this.getEnabled() || !this.__key) {
        return;
      }

      if (e.repeat && !this.getAutoRepeat()) {
        return;
      }

      if (this.__matchesKeyEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
        this.execute(e.target);
      }
    },

    /**
     * Checks whether a native `KeyboardEvent` matches the parsed shortcut modifiers and key.
     *
     * @param {KeyboardEvent} e Native browser keyboard event.
     * @returns {boolean} `true` if the event matches this command's shortcut.
     * @private
     */
    __matchesKeyEvent(e) {
      if (!this.__key || !this.__modifiers) {
        return false;
      }

      if (
        Boolean(e.shiftKey) !== this.__modifiers.Shift ||
        Boolean(e.ctrlKey) !== this.__modifiers.Control ||
        Boolean(e.metaKey) !== this.__modifiers.Meta ||
        Boolean(e.altKey) !== this.__modifiers.Alt
      ) {
        return false;
      }

      const eventKey =
        e.key && e.key.length === 1 ? e.key.toUpperCase() : e.key;

      return eventKey === this.__key;
    },

    /**
     * Fires the `"execute"` data event if both `active` and `enabled` are `true`.
     *
     * @param {*} [target] Optional object, widget, or DOM node that triggered execution.
     */
    execute(target) {
      if (this.getActive() && this.getEnabled()) {
        this.fireDataEvent("execute", target);
      }
    },

    /**
     * Returns the human-readable representation of the configured shortcut
     * (e.g., `"Control+S"`, `"Alt+F1"`).
     *
     * @returns {string} Formatted shortcut string, or `""` if no shortcut is set.
     */
    toString() {
      if (!this.__modifiers && !this.__key) {
        return "";
      }

      const parts = [];
      const mods = this.__modifiers;

      if (mods) {
        if (mods.Control) {
          parts.push("Control");
        }
        if (mods.Alt) {
          parts.push("Alt");
        }
        if (mods.Shift) {
          parts.push("Shift");
        }
        if (mods.Meta) {
          parts.push("Meta");
        }
      }

      if (this.__key) {
        const displayMap = ville.ui.command.Command.DISPLAY_LABELS;
        parts.push(displayMap[this.__key] || this.__key);
      }

      return parts.join("+");
    }
  },

  /**
   * Unregisters the native `window` `"keydown"` listener and releases internal state.
   */
  destruct() {
    if (this.__listenerAttached && this.__boundOnKeyDown && typeof window !== "undefined") {
      window.removeEventListener("keydown", this.__boundOnKeyDown);
    }
    this.__listenerAttached = false;
    this.__boundOnKeyDown = null;
    this.__modifiers = null;
    this.__key = null;
  }
});
