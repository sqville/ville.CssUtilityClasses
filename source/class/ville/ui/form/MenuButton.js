/**
 * Menu Button
 * @external(mantine/core/styles/UnstyledButton.css)
 * @external(mantine/core/styles/Button.css)
 */
qx.Class.define("ville.ui.form.MenuButton", {
    
    extend: qx.ui.form.MenuButton,

    include: ville.ui.core.MWidget,

    construct(label, menu, component) {
        
        if (component != null)
            this.__componenttag = component;

        if (menu != null) {
            super(label, null, menu);
        } else {
            super();
        }
        
        //this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        //this.setClearAllInlineStyles(true);
        this.setStyle("position", "relative", true);
        this.setCssUtilityClass("m_87cf2631 mantine-UnstyledButton-root");

        if (this.__componenttag !== "button")
            this.getContentElement().removeAttribute('type');

        //if (label != null)
          //  this.getContentElement().setAttribute('html', label);

    },

    members: {

        __componenttag: "button",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }

        // overridden
        /*open(selectFirst) {
            var menu = this.getMenu();

            if (menu) {
                // Focus this button when the menu opens
                if (
                this.isFocusable() &&
                !qx.ui.core.FocusHandler.getInstance().isFocused(this)
                ) {
                this.focus();
                }
                // Hide all menus first
                qx.ui.menu.Manager.getInstance().hideAll();

                // Open the attached menu
                menu.setOpener(this);

                var element = this.getContentElement().getDomElement();
                const rect = element.getBoundingClientRect();
                console.log('Top (viewport):', rect.top);
                console.log('Left (viewport):', rect.left);
                menu.setPosition("bottom-left");
                menu.placeToElement(element);
                menu.show();

                //menu.open();

                // Select first item
                if (selectFirst) {
                var first = menu.getSelectables()[0];
                if (first) {
                    menu.setSelectedButton(first);
                }
                }
            }
        }*/

        // overridden
        /*_onPointerDown(e) {
            // call the base function to get into the capture phase [BUG #4340]
            super._onPointerDown(e);

            // only open on left clicks [BUG #5125]
            if (e.getButton() != "left") {
                return;
            }

            var menu = this.getMenu();
            if (menu) {
                // Toggle sub menu visibility
                if (!menu.isVisible()) {
                this.open();
                } else {
                menu.exclude();
                }

                // Event is processed, stop it for others
                e.stopPropagation();
            }
        }*/
    }
  });
