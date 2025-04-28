qx.Class.define("twindapp.form.renderer.DetailsForm", {
    extend: qx.ui.form.renderer.AbstractRenderer,

    construct(form) {

      var layout = new qx.ui.layout.Flow();
      // Align children to the X axis of the container (left|center|right)
      layout.setAlignX("left");
      layout.setSpacingX(10);
      layout.setSpacingY(10);
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
      addItems(items, names, title, customize) {
        // add the header
        if (title != null) {
          this._add(this._createHeader(title));
        }

        var itemsbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        itemsbox.setCssUtilityClass("flex flex-wrap -mb-8 -mr-6 p-8");
        itemsbox.setExcludeBoundsFromDom(true);
        itemsbox.setCssUtilityStyleClearAll(true);

        // add items Flow
        for (var i = 0; i < items.length; i++) {
            var itembox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
            itembox.setCssUtilityClass("pb-8 pr-6 w-full lg:w-1/2");
            itembox.setExcludeBoundsFromDom(true);
            itembox.setCssUtilityStyleClearAll(true);

            var label = this._createLabel(names[i], items[i]);
            label.setCssUtilityClass("form-label");
            label.setExcludeBoundsFromDom(true);
            label.setCssUtilityStyleClearAll(true);
            var item = items[i];

            // ToDo: Move to stretch and minwidth to controls appearance
            //  or, set if not set
            //item.set({ allowGrowX: true });

            itembox.add(label);
            itembox.add(item);
            label.setBuddy(item);
            this._connectVisibility(item, label);
            /*if (customize[i]) {
                this._add(itembox, { lineBreak: true });
            } else {
                this._add(itembox);
            }*/

            itemsbox.add(itembox);

            // store the names for translation
            if (qx.core.Environment.get("qx.dynlocale")) {
                this._names.push({ name: names[i], label: label, item: items[i] });
            }
        }
        this._add(itemsbox);
      },

      /**
       * Adds a button the form renderer. All buttons will be added in a
       * single row at the bottom of the form.
       *
       * @param button {qx.ui.form.Button} The button to add.
       */
      addButton(button, customize) {
        if (this._buttonRow == null) {
          // create button row
          this._buttonRow = new qx.ui.container.Composite();
          this._buttonRow.setCssUtilityClass("flex items-center px-8 py-4 bg-gray-50 border-t border-gray-100");
          this._buttonRow.setExcludeBoundsFromDom(true);
          this._buttonRow.setCssUtilityStyleClearAll(true);
          
          var hbox = new qx.ui.layout.HBox();
          this._buttonRow.setLayout(hbox);
          // add the button row
          this._add(this._buttonRow);
        }

        this._buttonRow.add(button);

        /*if (customize) {
            if (customize.position) {
                this._buttonRow.addAt(button, customize.position.index);
            }
            if (customize.afteritem) {
                this._buttonRow.add(button);
                this._buttonRow.addAfter(customize.afteritem.layoutitem, button, customize.afteritem.options);
            }
        } else {
            this._buttonRow.add(button);
        }*/
      },

      /**
       * Returns the set layout for configuration.
       *
       * @return {qx.ui.layout.Grid} The grid layout of the widget.
       */
      getLayout() {
        return this._getLayout();
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
        var label = new qx.ui.basic.Label(this._createLabelText(name, item));
        // store labels for disposal
        this._labels.push(label);
        label.setRich(true);
        //label.setAppearance("form-renderer-label");
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
        header.setFont("bold");
        if (this._row != 0) {
          header.setMarginTop(10);
        }
        header.setAlignX("left");
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
