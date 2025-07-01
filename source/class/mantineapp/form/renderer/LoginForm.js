/* ************************************************************************

************************************************************************ */

/**
 * Single column renderer for {@link qx.ui.form.Form}.
 */
qx.Class.define("mantineapp.form.renderer.LoginForm", {
    extend: qx.ui.form.renderer.AbstractRenderer,

    construct(form) {
      var layout = new qx.ui.layout.Basic();
      this._setLayout(layout);  

      super(form);

      this.setExcludeBoundsFromDom(true);
      this.setClearAllInlineStyles(true);
    },

    members: {
      _row: 0,
      _buttonRow: null,

      // overridden
      _createContentElement() {
          return new qx.html.Element("form");
      },

      // overridden
      _onFormChange() {
        if (this._buttonRow) {
          this._buttonRow.destroy();
          this._buttonRow = null;
        }
        this._row = 0;
        super._onFormChange();
      },

      _createComposite() {
        var widget = new qx.ui.container.Composite(new qx.ui.layout.Basic());
        widget.setExcludeBoundsFromDom(true);
        widget.setClearAllInlineStyles(true);
        return widget;
      },

      /**
       * Add a group of form items with the corresponding names. The names are
       * displayed as label.
       * The title is optional and is used as grouping for the given form
       * items.
       *
       * @param items {qx.ui.core.Widget[]} An array of form items to render.
       * @param names {String[]} An array of names for the form items.
       */
      addItems(items, names, title, customize) {
        // create items content container
        var itemscontainer = new ville.ui.layout.Stack();
        itemscontainer.addClass("ville-mantineapp-LoginFormStack");

        // add the items
        for (var i = 0; i < items.length; i++) {
          var label = null;
          //var itmnmgroup = this._createComposite();
          var item = items[i];
          
          if (names[i] != null && names[i] != "") {
            label = this._createLabel(names[i]);
            label.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label");
            if (item.getRequired()) {
              label.setAttribute("data-required", "true");
            }
          }

          var itemwrapper;
          if (customize[i].complexity == "email") {
            itemwrapper = new ville.ui.form.TextFieldWrapper(item);
            if (label) {
              label.addClass("mantine-TextInput-label");
              label.setAttribute("for", "villetxtemail123");
              itemwrapper.setLabel(label);
            }
          } else if (customize[i].complexity == "password") {
            itemwrapper = new ville.ui.form.PasswordWrapper(item);
            if (label) {
              label.addClass("mantine-PasswordInput-label");
              label.setAttribute("for", "villetxtpassword123");
              itemwrapper.setLabel(label);
            }
          } else {
            itemwrapper = item;
          }
          
          if (label) {
            if (!itemwrapper.getNestLabel()) {
              label.setBuddy(item);
            }
            this._connectVisibility(item, label);
            // store the names for translation
            if (qx.core.Environment.get("qx.dynlocale")) {
                this._names.push({ name: names[i], label: label, item: items[i] });
            }
          }
          itemscontainer.add(itemwrapper);
        }
        this._add(itemscontainer);
      },

      /**
       * Adds a button the form renderer. All buttons will be added in a
       * single row at the bottom of the form.
       *
       * @param button {qx.ui.form.Button} The button to add.
       */
      addButton(button) {
        if (this._buttonRow == null) {
          // create button row
          this._buttonRow = new ville.ui.layout.Group("center", "space-between");
          this._buttonRow.addClass("ville-mantineapp-LoginFormButtonGroup");
          
          this._add(this._buttonRow);
        }

        // add the button
        this._buttonRow.add(button);
      },

      /**
       * Creates a label for the given form item.
       *
       * @param name {String} The content of the label without the
       *   trailing * and :
       * @param item {qx.ui.core.Widget} The item, which has the required state.
       * @return {qx.ui.basic.Label} The label for the given item.
       */
      _createLabel(name) {
        var label = new ville.ui.form.Label(name);
        // store labels for disposal
        this._labels.push(label);
        return label;
      },

      /**
       * Creates a header label for the form groups.
       *
       * @param title {String} Creates a header label.
       * @return {qx.ui.basic.Label} The header for the form groups.
       */
      _createHeader(title) {
        var header = new mantineapp.components.Label(title);
        // store labels for disposal
        this._labels.push(header);
        return header;
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct() {
      // first, remove all buttons from the button row because they
      // should not be disposed
      if (this._buttonRow) {
        this._buttonRow.removeAll();
        this._disposeObjects("_buttonRow");
      }
    }
  });
