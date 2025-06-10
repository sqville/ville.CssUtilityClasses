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
        //var itemscontainer = this._createComposite();
        var itemscontainer = new ville.ui.layout.Stack();
        itemscontainer.getContentElement().addClass("ville-mantineapp-LoginFormStack");

        // add the items
        for (var i = 0; i < items.length; i++) {
          var label = null;
          var itmnmgroup = this._createComposite();
          
          if (names[i] != null && names[i] != "") {
            label = this._createLabel(names[i]);
            label.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
            if (items[i].getRequired())
              label.getContentElement().setAttribute("data-required", "true");

            //itmnmgroup.add(label);
          }

          var item = items[i];
          var itemwrapper = this._createComposite();
          if (customize[i].complexity == "email") {
            itmnmgroup.setCssUtilityClass("m_46b77525 mantine-InputWrapper-root mantine-TextInput-root");
            itemwrapper.setCssUtilityClass("ville-mantineapp-LoginForm-TextInputWrapper m_6c018570 mantine-Input-wrapper mantine-TextInput-wrapper");
            itemwrapper.getContentElement().setAttribute("data-variant", "default");
            itemwrapper.add(item);
          } else if (customize[i].complexity == "password") {
            itmnmgroup.setCssUtilityClass("m_f61ca620 mantine-PasswordInput-root m_46b77525 mantine-InputWrapper-root mantine-PasswordInput-root");
            itemwrapper.setCssUtilityClass("ville-mantineapp-LoginForm-PasswordInputWrapper m_6c018570 mantine-Input-wrapper mantine-PasswordInput-wrapper");
            itemwrapper.getContentElement().setAttributes({"data-with-right-section" : "true", "data-variant" : "default"}, true);
             // add input password tag
            var iteminnerwrapper = this._createComposite();
            iteminnerwrapper.setCssUtilityClass("m_ccf8da4c m_8fb7ebe7 mantine-Input-input mantine-PasswordInput-input");
            iteminnerwrapper.getContentElement().setAttribute("data-variant", "default");
            iteminnerwrapper.add(item);
            itemwrapper.add(iteminnerwrapper);
            // add the show password Button
            var btnwrapper = this._createComposite();
            btnwrapper.setCssUtilityClass("m_82577fc2 mantine-Input-section mantine-PasswordInput-section");
            btnwrapper.getContentElement().setAttribute("data-position", "right");
            var showpassbtn = new mantineapp.components.ActionIcon(mantineapp.components.Icons["EYE"]);
            showpassbtn.setCssUtilityClass("mantine-focus-auto mantine-active m_b1072d44 mantine-PasswordInput-visibilityToggle m_8d3f4000 mantine-ActionIcon-root m_87cf2631 mantine-UnstyledButton-root");
            showpassbtn.getContentElement().setAttributes({
              "data-variant" : "subtl",
              "aria-hidden" : "false",
              "tabindex" : "-1"
            }, true);
            showpassbtn.addListener("click", (e) => {e.preventDefault()});
            btnwrapper.add(showpassbtn);
            itemwrapper.add(btnwrapper);
          }
          
          
          if (label) {
            label.add(itemwrapper);
            itmnmgroup.add(label);
            //itmnmgroup.add(label);
            //itmnmgroup.add(itemwrapper);
          } else {
            itmnmgroup.add(itemwrapper);
          }

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
          this._buttonRow = this._createComposite();
          this._buttonRow.setCssUtilityClass("ville-mantineapp-LoginFormButtonGroup m_4081bf90 mantine-Group-root");
          
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
        var label = new mantineapp.components.Label(name);
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
