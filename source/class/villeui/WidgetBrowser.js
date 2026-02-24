/**
 * Widget Browser Container
 */
qx.Class.define("villeui.WidgetBrowser", {
    
    extend: ville.ui.layout.Container,

    construct() {

      super();

      this.setStyles({"--container-size": "calc(90rem * var(--mantine-scale))"});
      this.setAttributes({"data-strategy": "block"});
      
      // WB CONTROLE
      // Widget Browser buttons
      var mainWidgetBrowserButtons = new ville.ui.core.Box();
      //var mainWidgetBrowserButtons = new ville.ui.layout.SimpleGrid();
      mainWidgetBrowserButtons.setCssUtilityClass("HomePageTabs_controls___TiQU");
      //mainWidgetBrowserButtons.addClass("__m__-r10g");
      this.add(mainWidgetBrowserButtons);

      // Widget Browser buttons - Form
      var btnForm = new ville.ui.form.UnstyledToggleButton();
      btnForm.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      btnForm.setAttribute("data-active", "true", true);
      var btnFormText = new ville.ui.basic.Element("span");
      btnFormText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnFormText.setAttribute("html", "Form", true);
      btnForm.add(btnFormText);
      btnForm.setUserData("stackpageindex", 0);

      // Widget Browser buttons - Tree
      var btnTree = new ville.ui.form.UnstyledToggleButton();
      btnTree.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      var btnTreeText = new ville.ui.basic.Element("span");
      btnTreeText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnTreeText.setAttribute("html", "Tree");
      btnTree.add(btnTreeText);
      btnTree.setUserData("stackpageindex", 1);

      // Widget Browser buttons - Table
      var btnTable = new ville.ui.form.UnstyledToggleButton();
      btnTable.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      var btnTableText = new ville.ui.basic.Element("span");
      btnTableText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnTableText.setAttribute("html", "Table");
      btnTable.add(btnTableText);
      btnTable.setUserData("stackpageindex", 2);

      // Widget Browser buttons - Menu
      var btnMenu = new ville.ui.form.UnstyledToggleButton();
      btnMenu.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      var btnMenuText = new ville.ui.basic.Element("span");
      btnMenuText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnMenuText.setAttribute("html", "Menu");
      btnMenu.add(btnMenuText);
      btnMenu.setUserData("stackpageindex", 3);

      // Widget Browser buttons - Window
      var btnWindow = new ville.ui.form.UnstyledToggleButton();
      btnWindow.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      var btnWindowText = new ville.ui.basic.Element("span");
      btnWindowText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnWindowText.setAttribute("html", "Window", true);
      btnWindow.add(btnWindowText);
      btnWindow.setUserData("stackpageindex", 4);

      // Widget Browser buttons - Tab
      var btnTab = new ville.ui.form.UnstyledToggleButton();
      btnTab.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      var btnTabText = new ville.ui.basic.Element("span");
      btnTabText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnTabText.setAttribute("html", "Tab");
      btnTab.add(btnTabText);
      btnTab.setUserData("stackpageindex", 5);

      

      // Widget Browser buttons - FloatingIndicator
      var wbButtonIndicator = new ville.ui.overlay.FloatingIndicator();
      wbButtonIndicator.addClass("HomePageTabs_indicator__U7Dx4");
      wbButtonIndicator.setStyles({
        "transform": "translateY(0px) translateX(0px)",
        "width":"83px",
        "height":"48px"
      }, true);
      wbButtonIndicator.setAttributes({
        "data-initialized": "true"
      }, true);

      mainWidgetBrowserButtons.add(btnForm);
      mainWidgetBrowserButtons.add(btnTree);
      mainWidgetBrowserButtons.add(btnTable);
      mainWidgetBrowserButtons.add(btnMenu);
      mainWidgetBrowserButtons.add(btnWindow);
      mainWidgetBrowserButtons.add(btnTab);
      mainWidgetBrowserButtons.add(wbButtonIndicator);

      var wbRadioGroup = new qx.ui.form.RadioGroup(
        btnForm,
        btnTree,
        btnTable,
        btnMenu,
        btnWindow,
        btnTab
      );

      // Widget Browser stack
      var mainWidgetBrowserStack = new ville.ui.layout.Stack();
      mainWidgetBrowserStack.setCssUtilityClass("HomePageTabs_content__t1yFb");
      mainWidgetBrowserStack.setStyles({
        "margin-bottom": "50px"
      });
      this.add(mainWidgetBrowserStack);

      wbRadioGroup.addListener("changeSelection", (e) => {
        e.getOldData()[0].getContentElement().removeAttribute("data-active");
        e.getData()[0].getContentElement().setAttribute("data-active", "true");
        var movetobounds = e.getData()[0].getContentElement().getDimensions();
        var parentbounds = e.getData()[0].getContentElement().getParent().getDimensions();
        var newtop = movetobounds.top - parentbounds.top;
        wbButtonIndicator.getContentElement().setStyles({
          transform: `translateY(${newtop}px) translateX(${(movetobounds.left - 16)}px)`,
          width: `${movetobounds.width}px`,
          height: `${movetobounds.height}px`
        }, true);
        mainWidgetBrowserStack.setSelection([mainWidgetBrowserStack.getChildren()[e.getData()[0].getUserData("stackpageindex")]]);
      });

      // Form widgets
      var stackFrompage = new ville.ui.layout.SimpleGrid();
      stackFrompage.addClass("__m__-r10g");
      mainWidgetBrowserStack.add(stackFrompage);

      // Text widget vstack
      var vstackTextWidgets = new ville.ui.layout.VStack();
      stackFrompage.add(vstackTextWidgets);

      // Text field
      var txtTextField = new ville.ui.form.TextField();
      txtTextField.setAttribute("id", "villetxttextfield");
      txtTextField.setPlaceholder("TextField");
      var txtTextFieldWrapper = new ville.ui.form.TextFieldWrapper(txtTextField).set({size : "sm", radius : "sm"});
      var lblTextField = new ville.ui.form.Label("TextField").set({size : "lg"});
      lblTextField.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
      lblTextField.setAttributes({
        "for": "villetxttextfield"
      });
      txtTextFieldWrapper.setLabel(lblTextField);
      vstackTextWidgets.add(txtTextFieldWrapper);

      // Password field
      var txtPasswordField = new ville.ui.form.PasswordField();
      txtPasswordField.setAttribute("id", "villetxtpasswordfield");
      txtPasswordField.setPlaceholder("PasswordField");
      var IconEye = new ville.ui.icon.IconEye().set({ "viewBox" : "0 0 15 15" });
      IconEye.setStyles({ width: "var(--psi-icon-size-md)", height: "var(--psi-icon-size-md)" });
      var IconEyeOff = new ville.ui.icon.IconEyeOff().set({ "viewBox" : "0 0 15 15" });
      IconEyeOff.setStyles({ width: "var(--psi-icon-size-md)", height: "var(--psi-icon-size-md)" });
      var btnShowHidePassword = new ville.ui.form.ToggleActionIcon(IconEyeOff, IconEye, "subtle");
      btnShowHidePassword.setStyles({
        "--ai-radius" : "var(--mantine-radius-sm)",
        "--ai-bg" : "transparent",
        "--ai-hover" : "var(--mantine-color-gray-light-hover)",
        "--ai-color" : "var(--mantine-color-gray-light-color)",
        "--ai-bd" : "calc(0.0625rem * var(--mantine-scale)) solid transparent"
      });
      var txtPasswordFieldWrapper = new ville.ui.form.PasswordWrapper(txtPasswordField, null, null, btnShowHidePassword).set({size : "sm", radius : "sm"});
      var lblPasswordField = new ville.ui.form.Label("PasswordField").set({size : "lg"});
      lblPasswordField.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-PasswordInput-label");
      lblPasswordField.setAttributes({"for": "villetxtpasswordfield"});
      txtPasswordFieldWrapper.setLabel(lblPasswordField);
      vstackTextWidgets.add(txtPasswordFieldWrapper);

      // Spinner
      var lblSpinner = new ville.ui.form.Label("Spinner").set({size : "lg"});
      lblSpinner.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
      vstackTextWidgets.add(lblSpinner);
      var iconDollar = new ville.ui.icon.CurrencyDollar();
      iconDollar.setStrokeWidth(1.5);
      iconDollar.setStyles({"width": "20px", "height": "20px"});
      var txtSpinner = new ville.ui.form.Spinner(-100, 0, 100, "default", iconDollar).set({size : "sm", radius : "sm"});
      vstackTextWidgets.add(txtSpinner);

      // ComboBox
      var lblComboBox = new ville.ui.form.Label("ComboBox").set({size : "lg"});
      lblComboBox.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
      vstackTextWidgets.add(lblComboBox);
      var comboBox = new ville.ui.form.ComboBox();
      for (var i = 1; i < 31; i++) {
        var tempItem = new qx.ui.form.ListItem(
          "2^ " + i + " = " + Math.pow(2, i)
        );
        //tempItem.setCssUtilityClass("m_92253aa5 mantine-Combobox-option");
        //tempItem.setAttribute("data-combobox-option", true);
        //tempItem.set({width: 200, height: 30});
        comboBox.add(tempItem);
      }
      //var cmbobtn = comboBox.getChildControl("button");
      //cmbobtn.setExcludeBoundsFromDom(true);
      //cmbobtn.setClearAllInlineStyles(true);
      //cmbobtn.setWidth(20);
      //cmbobtn.setHeight(20);
      //cmbobtn.setBackgroundColor("#30a133");
      //cmbobtn.getContentElement().setStyles({"width": "20px", "height": "20px"});
      //var cmbopopup = comboBox.getChildControl("popup");
      //cmbopopup.setDomMove(true);
      //cmbopopup.setPlacementModeX("best-fit");
      //cmbopopup.setPlacementModeY("direct");
      vstackTextWidgets.add(comboBox);
      var comingsoonComboBox = new ville.ui.basic.Element("span");
      comingsoonComboBox.setAttribute("html", "<em>ComboBox Widget - Coming soon</em>");
      //vstackTextWidgets.add(comingsoonComboBox);

      // Button widget vstack
      var vstackButtonWidgets = new ville.ui.layout.VStack();
      stackFrompage.add(vstackButtonWidgets);
      var lblButtonWidgets = new ville.ui.form.Label("Buttons").set({size : "lg"});
      lblButtonWidgets.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
      vstackButtonWidgets.add(lblButtonWidgets);

      // Buttons
      var btnBasicButton = new ville.ui.form.Button("Default");
      btnBasicButton.addClass("mantine-focus-auto mantine-active");
      btnBasicButton.setStyles({
        "--button-height": "var(--button-height-sm)",
        "--button-padding-x": "var(--button-padding-x-sm)",
        "--button-fz": "var(--mantine-font-size-sm)",
        "--button-radius": "var(--mantine-radius-sm)",
        "--button-bg": "var(--mantine-color-default)",
        "--button-hover": "var(--mantine-color-default-hover)",
        "--button-color": "var(--mantine-color-default-color)",
        "--button-bd": "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)"
      });
      vstackButtonWidgets.add(btnBasicButton);
      var btnBasicButtonFilled = new ville.ui.form.Button("Filled", "filled");
      btnBasicButtonFilled.addClass("mantine-focus-auto mantine-active");
      btnBasicButtonFilled.setStyles({
        "--button-height": "var(--button-height-sm)",
        "--button-padding-x": "var(--button-padding-x-sm)",
        "--button-fz": "var(--mantine-font-size-sm)",
        "--button-radius": "var(--mantine-radius-sm)",
        "--button-bd": "calc(0.0625rem * var(--mantine-scale)) solid transparent"
      });
      vstackButtonWidgets.add(btnBasicButtonFilled);
      var btnBasicButtonLight = new ville.ui.form.Button("Light", "light");
      btnBasicButtonLight.addClass("mantine-focus-auto mantine-active");
      btnBasicButtonLight.setStyles({
        "--button-height": "var(--button-height-sm)",
        "--button-padding-x": "var(--button-padding-x-sm)",
        "--button-fz": "var(--mantine-font-size-sm)",
        "--button-radius": "var(--mantine-radius-sm)",
        "--button-bg": "var(--villeui-color-light)",
        "--button-hover": "var(--villeui-color-light-hover)",
        "--button-color": "var(--villeui-color-light-color)",
        "--button-bd": "calc(0.0625rem * var(--mantine-scale)) solid transparent"
      });
      vstackButtonWidgets.add(btnBasicButtonLight);
      var btnBasicButtonOutline = new ville.ui.form.Button("Outline", "outline");
      btnBasicButtonOutline.addClass("mantine-focus-auto mantine-active");
      btnBasicButtonOutline.setStyles({
        "--button-height": "var(--button-height-sm)",
        "--button-padding-x": "var(--button-padding-x-sm)",
        "--button-fz": "var(--mantine-font-size-sm)",
        "--button-radius": "var(--mantine-radius-sm)",
        "--button-bg": "transparent",
        "--button-hover": "var(--villeui-color-outline-hover)",
        "--button-color": "var(--villeui-color-outline)",
        "--button-bd": "calc(0.0625rem * var(--mantine-scale)) solid var(--villeui-color-outline)"
      });
      vstackButtonWidgets.add(btnBasicButtonOutline);

      // Menu Button
      var btnMenu = new ville.ui.menu.Menu();
      btnMenu.setPlacementModeX("best-fit");
      btnMenu.setPlacementModeY("direct");
      btnMenu.setDomMove(true);
      var menuitem01 = new ville.ui.menu.Button("Menu item 01").set({ maxWidth : 150, minHeight : 40 });
      var menuitem02 = new ville.ui.menu.Button("Menu item 02").set({ maxWidth : 150, minHeight : 40 });
      var menuitem03 = new ville.ui.menu.Button("Menu item 03").set({ maxWidth : 150, minHeight : 40 });
      var menuitem04 = new ville.ui.menu.Button("Menu item 04").set({ maxWidth : 150, minHeight : 40 });
      btnMenu.add(menuitem01);
      btnMenu.add(menuitem02);
      btnMenu.add(menuitem03);
      btnMenu.add(menuitem04);
      var btnMenuButton = new ville.ui.form.MenuButton("Menu Button").set({ menu : btnMenu });
      vstackButtonWidgets.add(btnMenuButton);
      

      // Boolean
      var vstackBooleanWidgets = new ville.ui.layout.VStack();
      stackFrompage.add(vstackBooleanWidgets);
      var lblBooleanWidgets = new ville.ui.form.Label("Boolean").set({size : "lg"});
      lblBooleanWidgets.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
      vstackBooleanWidgets.add(lblBooleanWidgets);
      var chkCheckBox1 = new ville.ui.form.CheckBox("CheckBox");
      chkCheckBox1.setId("villeuiCheckBox1");
      vstackBooleanWidgets.add(chkCheckBox1);
      var chkTriCheckBox1 = new ville.ui.form.CheckBox("Tri-State CheckBox");
      chkTriCheckBox1.setTriState(true);
      chkTriCheckBox1.setValue(null);
      chkTriCheckBox1.setId("villeuiTriCheckBox1");
      vstackBooleanWidgets.add(chkTriCheckBox1);
      var rdoButton1 = new ville.ui.form.RadioButton("RadioButton");
      vstackBooleanWidgets.add(rdoButton1);
      var rdoButton2 = new ville.ui.form.RadioButton("Outlined RadioButton");
      rdoButton2.setVariant("outline");
      rdoButton2.setStyles({
        "--radio-color": "var(--villeui-color-outline)"
      });
      vstackBooleanWidgets.add(rdoButton2);

      // Selection
      var lblSelectionWidgets = new ville.ui.form.Label("Selection").set({size : "lg"});
      lblSelectionWidgets.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
      var vstackSelectionWidgets = new ville.ui.layout.VStack();
      stackFrompage.add(vstackSelectionWidgets);
      vstackSelectionWidgets.add(lblSelectionWidgets);
      /*var selectBox = new qx.ui.form.SelectBox();
      for (var i = 0; i < 30; i++) {
        var tempItem = new qx.ui.form.ListItem("Item " + (i + 1));
        selectBox.add(tempItem);
        // select sixth item
        if (i == 5) {
          selectBox.setSelection([tempItem]);
        }
      }
      vstackSelectionWidgets.add(selectBox);*/
      var comingsoonSelectBox = new ville.ui.basic.Element("span");
      comingsoonSelectBox.setAttribute("html", "<em>SelectBox Widget - Coming soon</em>");
      vstackSelectionWidgets.add(comingsoonSelectBox);
      

      // Tree widget page
      var stackTreepage = new ville.ui.layout.SimpleGrid();
      stackTreepage.addClass("__m__-r10g");
      mainWidgetBrowserStack.add(stackTreepage);

      var comingsoonTree = new ville.ui.basic.Element("span");
      comingsoonTree.setAttribute("html", "<em>Tree Widget - Coming soon</em>");
      stackTreepage.add(comingsoonTree);

      // Table widget page
      var stackTablepage = new ville.ui.layout.SimpleGrid();
      stackTablepage.addClass("__m__-r10g");
      mainWidgetBrowserStack.add(stackTablepage);

      var comingsoonTable = new ville.ui.basic.Element("span");
      comingsoonTable.setAttribute("html", "<em>Table Widget - Coming soon</em>");
      stackTablepage.add(comingsoonTable);

      // Menu widgets page
      var stackMenupage = new ville.ui.layout.SimpleGrid();
      stackMenupage.addClass("__m__-r10g");
      mainWidgetBrowserStack.add(stackMenupage);

      var comingsoonMenu = new ville.ui.basic.Element("span");
      comingsoonMenu.setAttribute("html", "<em>Menu and Toolbar Widgets - Coming soon</em>");
      stackMenupage.add(comingsoonMenu);

      // Burger
      //var headerBurger = new ville.ui.core.Burger();
      //headerBurger.addClass("mantine-hidden-from-sm");
      /*headerBurger.setStyles({
        "--burger-size": "var(--burger-size-sm)",
        "--burger-line-size": "calc(0.125rem * var(--mantine-scale))"
      });*/
      //stackMenupage.add(headerBurger);

      // Window widgets tab page
      var stackWindowpage = new ville.ui.layout.SimpleGrid();
      stackWindowpage.addClass("__m__-r14h");
      mainWidgetBrowserStack.add(stackWindowpage);

      // Window - open test
      var btnOpenwin = new ville.ui.form.Button("Open window");
      btnOpenwin.setStyle("max-width", "200px");
      stackWindowpage.add(btnOpenwin);

      // Tooltip
      var tooltip = new qx.ui.tooltip.ToolTip("Test ToolTip");
      btnOpenwin.setToolTip(tooltip);

      var winDrawer = this._createDetailWindow();
      winDrawer.set({height: 300, width: 250});
      //winDrawer.setLayout(new qx.ui.layout.Canvas());
      var btnClosewin = new ville.ui.form.Button("Close window");
      btnClosewin.setStyle("max-width", "150px");
      winDrawer.add(btnClosewin);

      btnOpenwin.addListener("execute", () => {
        //winDrawer.fadeIn(200);
        winDrawer.show();
        winDrawer.center();
      });

      btnClosewin.addListener("execute", () => {
        winDrawer.close();
      });


      var comingsoonWindow = new ville.ui.basic.Element("span");
      comingsoonWindow.setAttribute("html", "<em>Window Widgets - Coming soon</em>");
      //stackWindowpage.add(comingsoonWindow);

      // Sponsor link - You?
      var sponsorYou = new ville.ui.core.Box("a");
      sponsorYou.setCssUtilityClass("HomePageSponsors_sponsor__c9Sun");
      sponsorYou.setAttributes({
        "href": "https://github.com/Ville-Software",
        "target": "_blank"
      });
      var sponsorYouText = new ville.ui.basic.Label("📣");
      sponsorYouText.setCssUtilityClass("HomePageSponsors_name__MEYj1");
      sponsorYou.add(sponsorYouText);
      var sponsorYouDesc = new ville.ui.basic.Element();
      sponsorYouDesc.setAttribute("html", "We specialize in modernizing and advancing Qooxdoo applications. Let us help you advance your digital products."); 
      sponsorYouDesc.setCssUtilityClass("HomePageSponsors_description__UOTKq");
      sponsorYouDesc.setStyle("text-align", "left");
      sponsorYou.add(sponsorYouDesc);
      //stackWindowpage.add(sponsorYou);

      // Tab widgets tab page
      var stackTabpage = new ville.ui.layout.SimpleGrid();
      stackTabpage.addClass("__m__-r10g");
      mainWidgetBrowserStack.add(stackTabpage);

      // Normal tab
      var tvDefault = this._getTabView("top", "default");
      stackTabpage.add(tvDefault);

      // Top Outline tab
      var tvOutline = this._getTabView("top", "outline");
      stackTabpage.add(tvOutline);

      // Top Pills tab
      var tvPills = this._getTabView("top", "pills");
      stackTabpage.add(tvPills);

      var tvLeftPills = this._getTabView("left", "pills");
      stackTabpage.add(tvLeftPills);

      var tvRightOutline = this._getTabView("right", "outline");
      stackTabpage.add(tvRightOutline);

      var tvBottomOutline = this._getTabView("bottom", "outline");
      stackTabpage.add(tvBottomOutline);
    
    },

    members: {

        _createDetailWindow() {
            // Create the Window
            var win = new qx.ui.window.Window("Qx Window").set({ allowMaximize : true, allowMinimize : false, modal: true, movable: true });
            win.setLayout(new qx.ui.layout.VBox(4));
            win.setShowStatusbar(true);
            win.setStatus("Generic Message"); 
            //win.getChildControl("title").set({padding: [10,0,0,10]});

            return win;
        },

        _getTable() {
            // Add traditional Table widget
            /*** Table island test */
            const tableConfig = {
                columnNames    : ["ID", "Name", "Phone"],
                columnIds      : ["id", "name", "phone"],
                columnWidths   : ["20%", "40%", "40%"]
            };

            var model = new qx.ui.table.model.Simple();
            model.setColumns(tableConfig.columnNames, tableConfig.columnIds);
            model.setEditable(false);
            for (let s = 0; s < model.getColumnCount(); s++) {
                model.setColumnSortable(s, false);
            }
            var rowData = [
                [1, "John Doe", "555-1234"],
                [2, "Jane Smith", "555-5678"],
                [3, "Bob Johnson", "555-8765"],
                [4, "Alice Williams", "555-4321"]
            ];
            model.setData(rowData);

            // Customize the table column model.  We want one that automatically resizes columns.
            var custom = {
                tableColumnModel() {return new qx.ui.table.columnmodel.Resize()}
            };

            var table = new qx.ui.table.Table(model, custom);

            // Obtain the behavior object to manipulate
            var colrb = table.getTableColumnModel().getBehavior();
            for (let i = 0; i < tableConfig.columnWidths.length; i++) {
                colrb.set(i, { width: tableConfig.columnWidths[i] });
            }

            table.set({
                maxHeight: 140,
                width: 400,
                showCellFocusIndicator: false,
                focusCellOnPointerMove: true
            });

            table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);

            return table;

        },

        _getQxTabView() {

            var tabView = new qx.ui.tabview.TabView();
            tabView.setWidth(500);

            ////////////////// TEST PAGE 1 ////////////////////
            var page1 = new qx.ui.tabview.Page("Layout");
            page1.setLayout(new qx.ui.layout.VBox());
            page1.add(new qx.ui.basic.Label("Layout-Settings"));
            tabView.add(page1);

            ////////////////// TEST PAGE 2 ////////////////////
            var page2 = new qx.ui.tabview.Page("Notes");
            page2.setLayout(new qx.ui.layout.VBox());
            page2.add(new qx.ui.basic.Label("Notes..."));
            tabView.add(page2);

            ////////////////// TEST PAGE 3 ////////////////////
            var page3 = new qx.ui.tabview.Page("Calculator");
            page3.setLayout(new qx.ui.layout.VBox());
            page3.add(new qx.ui.basic.Label("Calculator..."));
            tabView.add(page3);

            return tabView;
        },

        _getTabView(position, variant) {

            var tabView = new ville.ui.tabview.TabView(position, variant);

            tabView.setStyles({
                "--tabs-radius": "var(--mantine-radius-sm)",
                "--tabs-color": "var(--villeui-color-filled)"
            });

            var pane = tabView.getChildControl("pane");
            var padposition = `padding-${position}`;
            pane.setStyle(padposition, "var(--mantine-spacing-xs)");

            ////////////////// TEST PAGE 1 ////////////////////
            var page1 = new ville.ui.tabview.Page("Layout");
            var page1Paragraph = new ville.ui.typography.Text("Layout tab page message...");
            page1.add(page1Paragraph);
            tabView.add(page1);

            ////////////////// TEST PAGE 2 ////////////////////
            var page2 = new ville.ui.tabview.Page("Notes");
            var page2Paragraph = new ville.ui.typography.Text("Notes tab page message...");
            page2.add(page2Paragraph);
            tabView.add(page2);

            ////////////////// TEST PAGE 3 ////////////////////
            var page3 = new ville.ui.tabview.Page("Calculator");
            var page3Paragraph = new ville.ui.typography.Text("Calculator tab page message...");
            page3.add(page3Paragraph);
            tabView.add(page3);

            return tabView;
        }
    }
});