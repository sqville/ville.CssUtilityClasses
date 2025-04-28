/* ************************************************************************

************************************************************************ */

/**
 * Single column renderer for {@link qx.ui.form.Form}.
 */
qx.Class.define("tablerapp.form.renderer.LoginForm", {
    extend: qx.ui.form.renderer.AbstractRenderer,

    construct(form) {
      var layout = new qx.ui.layout.VBox();
      this._setLayout(layout);

      super(form);
    },

    members: {
      _row: 0,
      _buttonRow: null,

      // overridden
      _onFormChange() {
        if (this._buttonRow) {
          this._buttonRow.destroy();
          this._buttonRow = null;
        }
        this._row = 0;
        super._onFormChange();
      },

      _createWidget() {
        var widget = new qx.ui.container.Composite(new qx.ui.layout.VBox());
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
       * @param title {String?} A title of the group you are adding.
       */
      addItems(items, names, title) {
        // create items content container
        //var itemscontainer = new qx.ui.container.Composite(new qx.ui.layout.Basic());
        var itemscontainer = this._createWidget();
        //itemscontainer.setCssUtilityClass("mb-3");
        itemscontainer.setExcludeBoundsFromDom(true);
        itemscontainer.setClearAllInlineStyles(true);
        
        // add the header
        if (title != null) {
          var cardHeader = new qx.ui.core.Widget();
          cardHeader.getContentElement().setNodeName("h2");
          cardHeader.getContentElement().setAttribute("html", title);
          cardHeader.setCssUtilityClass("h2 text-center mb-4");
          cardHeader.setExcludeBoundsFromDom(true);
          cardHeader.setClearAllInlineStyles(true);
          this._add(cardHeader);
        }

        // add the items
        for (var i = 0; i < items.length; i++) {
          var itmnmgroup = this._createWidget();
          itmnmgroup.setCssUtilityClass("mb-3");
          itmnmgroup.setClearAllInlineStyles(true);
          itmnmgroup.setExcludeBoundsFromDom(true);
          
          if (names[i] != null && names[i] != "") {
            var label = this._createLabel(names[i], items[i]);
            label.setRich(true);
            label.setCssUtilityClass("form-label");
            label.setClearAllInlineStyles(true);
            label.setExcludeBoundsFromDom(true);
            itmnmgroup.add(label);
          }

          var item = items[i];
          itmnmgroup.add(item);

          if (label) {
            label.setBuddy(item);
            this._connectVisibility(item, label);
            // store the names for translation
            if (qx.core.Environment.get("qx.dynlocale")) {
                this._names.push({ name: names[i], label: label, item: items[i] });
            }
          }
          itemscontainer.add(itmnmgroup);
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
          this._buttonRow = this._createWidget();
          this._buttonRow.setCssUtilityClass("form-footer");
          this._buttonRow.setClearAllInlineStyles(true);
          this._buttonRow.setExcludeBoundsFromDom(true);
          
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
      _createLabel(name, item) {
        var label = new qx.ui.basic.Label(name);
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
        var header = new qx.ui.basic.Label(title);
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
