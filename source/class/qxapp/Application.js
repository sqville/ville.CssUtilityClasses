/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "qxapp"
 *
 * @asset(qxapp/*)
 * @external(mantine/core/styles/baseline.css)
 * @external(mantine/core/styles/default-css-variables.css)
 * @external(mantine/core/styles/global.css)
 * 
 * @external(mantine/core/styles/ScrollArea.css)
 * @external(mantine/core/styles/UnstyledButton.css)
 * @external(mantine/core/styles/Popover.css)
 * @external(mantine/core/styles/Input.css)
 * @external(mantine/core/styles/ActionIcon.css)
 * 
 * @external(mantine/core/styles/Button.css)
 * 
 * @external(mantine/core/styles/Menu.css)
 * @external(mantine/core/styles/Text.css)
 * @external(mantine/core/styles/Table.css)
 * @external(mantine/core/styles/Tabs.css)
 * 
 * @require(qxapp.MCssUtilityClass)
 */
qx.Class.define("qxapp.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     * 
     * @ignore(Plotly)
     */
    main()
    {

      //qx.Class.include(qx.ui.core.Widget, ville.cssuc.MCssUtilityClass);
      //qx.Class.include(qx.ui.core.Widget, ville.ui.core.MWidget);
      //qx.Class.include(qx.ui.core.LayoutItem, ville.cssuc.MControl);

      //last
      qx.Class.include(qx.ui.core.Widget, qxapp.MCssUtilityClass);
      //qx.Class.include(qx.ui.basic.Image, qxapp.MImage);
      //qx.Class.include(qx.ui.basic.Atom, qxapp.MEmbed);

      //qx.Class.patch(qx.ui.core.LayoutItem, ville.cssuc.patch.MLayoutItem);
      //qx.Class.patch(qx.ui.core.Widget, qxapp.patch.MWidget);
      //qx.Class.patch(qx.html.Label, ville.cssuc.patch.MLabel);
      //qx.Class.patch(qx.ui.form.AbstractField, ville.cssuc.patch.MAbstractField);

      // clear out all styling of html and body tags
      //document.documentElement.style = "";
      //document.body.style = "";

      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      //const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      //console.log(rootFontSize);

      /* Get the styles object
      const rootStyles = getComputedStyle(document.documentElement);
      // Extract the value of a specific custom property
      const primaryColor = rootStyles.getPropertyValue('--mantine-font-size-lg');
      console.log(primaryColor);
      */

      /*
      * Configure global CSS variables to support control styles
      */
      //var sheet = qx.ui.style.Stylesheet.getInstance();

      // TabView
      //sheet.addRule(":root", "--tabs-radius: var(--mantine-radius-md)");
      //sheet.addRule(":root", "--tabs-color: var(--mantine-color-blue-filled)");

      //sheet.dispose();

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Document is the application root
      const doc = this.getRoot();

      var header = new qx.ui.container.Composite().set({padding: 12});
      header.setLayout(new qx.ui.layout.HBox().set({spacing : 10}));
      var apptitle = new qx.ui.basic.Label("Qx-Mantine App");
      //apptitle.getContentElement().setStyle("line-height", "normal");
      var iconSun = new qxapp.theme.icon.tabler.IconSun();
      var iconMoon = new qxapp.theme.icon.tabler.IconMoon();
      var colorschemetoggle = new qxapp.ui.form.ToggleActionIcon(iconSun, iconMoon);
      colorschemetoggle.addListener("click", (e) => {
        if (colorschemetoggle.getValue()) {
          document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
        } else {
          document.documentElement.setAttribute("data-mantine-color-scheme", "light");
        }
      });
      
      // NavLink
      var navlink = new qxapp.ui.navigation.NavLink("Ville NavLink").set({href: "#required-for-focus"});

      // Anchor
      var anchor = new qxapp.ui.navigation.Anchor("Ville Anchor").set({href: "#required-for-focus"});

      header.add(apptitle);
      header.add(colorschemetoggle);
      header.add(navlink);
      header.add(anchor);

      var qxbutton = new qx.ui.form.Button("First Button", "qxapp/icon/test.png").set({enabled: true});

      var iconGearSix = new qxapp.theme.icon.phosphor.GearSix(16);

      var iconAirplane = new qxapp.theme.icon.fluent.Airplane(30);

      var villebutton = new qxapp.ui.form.Button("Ville Button", iconAirplane);
      //villebutton.setEnabled(false);

      //var textfield = new qxapp.ui.form.TextField("Ville TextField");

      var qxtextfield = new qx.ui.form.TextField("Qx TextField");

      //var tfLeftIcon = new qxapp.theme.icon.fluent.Airplane(16);
      var tfRightIcon = new qxapp.theme.icon.fluent.Airplane(16);
      var villetextfieldwrapper = new qxapp.ui.form.TextFieldWrapper(qxtextfield, "default", iconGearSix, tfRightIcon);
      
      var villecheckbox = new qxapp.ui.form.CheckBox("Ville Checkbox New");
      //villecheckbox.setId("villecheck123");
      //villecheckbox.setTriState(true);
      //villecheckbox.setValue(true);

      // Menu Button
      var btnMenu = new qx.ui.menu.Menu();
      /* See Decoration's approach to transitioning popups */
      btnMenu.getContentElement().setStyles({
        "transition-property": "opacity",
        "backface-visibility": "hidden",
        "transition-duration": "150ms",
        "transition-timing-function": "ease"
      });

      var iconGearSixMenu = new qxapp.theme.icon.phosphor.GearSix(16);
      var miSettings = new qxapp.ui.menu.Button("Settings", iconGearSixMenu);
      var iconChats = new qxapp.theme.icon.phosphor.Chats(16);
      var miMessages = new qxapp.ui.menu.Button("Messages", iconChats);
      var iconImagesSquare = new qxapp.theme.icon.phosphor.ImagesSquare(16);
      var miGallery = new qxapp.ui.menu.Button("Gallery", iconImagesSquare);
      var iconMagnifyingGlass = new qxapp.theme.icon.phosphor.MagnifyingGlass(16);
      var miSearch = new qxapp.ui.menu.Button("Search", iconMagnifyingGlass);
      btnMenu.add(miSettings);
      btnMenu.add(miMessages);
      btnMenu.add(miGallery);
      btnMenu.add(miSearch);
      var btnMenuButton = new qx.ui.form.MenuButton("Menu Button");
      btnMenuButton.setMenu(btnMenu);

      var tblTable = this._getTable();

      var TabView = this._getTabView("top"); 
      TabView.getContentElement().setAttribute("data-variant","default"); 
      TabView.getContentElement().setAttribute("data-orientation","horizontal");
      TabView.getContentElement().setStyle("--tabs-radius", "var(--mantine-radius-md)", true);
      TabView.getContentElement().setStyle("--tabs-color", "var(--mantine-color-blue-filled)", true);
      var tbBar = TabView.getChildControl("bar");
      tbBar.getContentElement().setAttribute("data-variant","default");
      tbBar.getContentElement().setAttribute("data-orientation","horizontal");

      // Second TabView
      var TabViewVert = this._getTabView("left"); 
      TabViewVert.getContentElement().setAttribute("data-variant","default"); 
      TabViewVert.getContentElement().setAttribute("data-orientation","vertical");
      TabViewVert.getContentElement().setStyle("--tabs-radius", "var(--mantine-radius-md)", true);
      TabViewVert.getContentElement().setStyle("--tabs-color", "var(--mantine-color-blue-filled)", true);
      var tbBarVert = TabViewVert.getChildControl("bar");
      tbBarVert.getContentElement().setAttribute("data-variant","default");
      tbBarVert.getContentElement().setAttribute("data-orientation","vertical");

      /** Plotly test - Successful as written here
       * needs at-rule-external(qxapp/plotly/plotly-3.6.0.min.js)
      
      var plotlychart1 = new qx.ui.core.Widget().set({width : 900, height : 500});
      plotlychart1.addListenerOnce("appear", () => {
        var pc1div = plotlychart1.getContentElement().getDomElement();
        Plotly.newPlot( pc1div, [{
          x: [1, 2, 3, 4, 5],
          y: [1, 2, 4, 8, 16] }], {
          margin: { t: 0 } } );
      });
      doc.add(plotlychart1, { left : 200, top : 200 })
      */

      doc.add(header, { left : 0, top : 0 });

      doc.add(qxbutton, { left : 200, top : 120 });

      doc.add(villebutton, { left : 200, top : 220 });

      doc.add(btnMenuButton, { left : 450, top : 120 });

      doc.add(villetextfieldwrapper, { left : 650, top : 120 });

      //doc.add(textfield, { left : 650, top : 50 });

      doc.add(villecheckbox, { left : 650, top : 220 });

      doc.add(tblTable, { left : 50, top : 320 });

      doc.add(TabView, { left : 450, top : 280 });

      doc.add(TabViewVert, { left : 450, top : 380 });


      /*

      // Settings
      var settings = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      //settings.setExcludeBoundsFromDom(true);
      //settings.setClearAllInlineStyles(true);
      var btntheme = new qxapp.components.Link("D", null, ".", true);
      //btntheme.setCssUtilityClass("btn btn-floating btn-icon btn-primary");
      btntheme.setExcludeBoundsFromDom(true);
      btntheme.setClearAllInlineStyles(true);
      btntheme.addListener("click", (e) => {
        if (btntheme.getValue()) {
          //data-mantine-color-scheme="dark"
          document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
          btntheme.getContentElement().setAttribute("html", "L");
        } else {
          document.documentElement.setAttribute("data-mantine-color-scheme", "light");
          btntheme.getContentElement().setAttribute("html", "D");
        }
      });
      settings.add(btntheme);

      // Login Page
      var centerbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      //centerbox.setCssUtilityClass("container container-tight py-4");
      //centerbox.setExcludeBoundsFromDom(true);
      //centerbox.setClearAllInlineStyles(true);

      // Logo Container
      var logoSection = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      //logoSection.setCssUtilityClass("text-center mb-4");
      //logoSection.setExcludeBoundsFromDom(true);
      //logoSection.setClearAllInlineStyles(true);

      // Logo
      var svgclass = "navbar-brand-image";
      var logolinkclass = "navbar-brand navbar-brand-autodark";
      var tablerlinklogo = `<a href="." class= "${logolinkclass}">
          <svg class= "${svgclass}" xmlns="http://www.w3.org/2000/svg" width="110" height="32" viewBox="0 0 232 68">
            <path d="M64.6 16.2C63 9.9 58.1 5 51.8 3.4 40 1.5 28 1.5 16.2 3.4 9.9 5 5 9.9 3.4 16.2 1.5 28 1.5 40 3.4 51.8 5 58.1 9.9 63 16.2 64.6c11.8 1.9 23.8 1.9 35.6 0C58.1 63 63 58.1 64.6 51.8c1.9-11.8 1.9-23.8 0-35.6zM33.3 36.3c-2.8 4.4-6.6 8.2-11.1 11-1.5.9-3.3.9-4.8.1s-2.4-2.3-2.5-4c0-1.7.9-3.3 2.4-4.1 2.3-1.4 4.4-3.2 6.1-5.3-1.8-2.1-3.8-3.8-6.1-5.3-2.3-1.3-3-4.2-1.7-6.4s4.3-2.9 6.5-1.6c4.5 2.8 8.2 6.5 11.1 10.9 1 1.4 1 3.3.1 4.7zM49.2 46H37.8c-2.1 0-3.8-1-3.8-3s1.7-3 3.8-3h11.4c2.1 0 3.8 1 3.8 3s-1.7 3-3.8 3z" fill="#066fd1" style="fill: var(--tblr-primary, #066fd1)"></path>
            <path d="M105.8 46.1c.4 0 .9.2 1.2.6s.6 1 .6 1.7c0 .9-.5 1.6-1.4 2.2s-2 .9-3.2.9c-2 0-3.7-.4-5-1.3s-2-2.6-2-5.4V31.6h-2.2c-.8 0-1.4-.3-1.9-.8s-.9-1.1-.9-1.9c0-.7.3-1.4.8-1.8s1.2-.7 1.9-.7h2.2v-3.1c0-.8.3-1.5.8-2.1s1.3-.8 2.1-.8 1.5.3 2 .8.8 1.3.8 2.1v3.1h3.4c.8 0 1.4.3 1.9.8s.8 1.2.8 1.9-.3 1.4-.8 1.8-1.2.7-1.9.7h-3.4v13c0 .7.2 1.2.5 1.5s.8.5 1.4.5c.3 0 .6-.1 1.1-.2.5-.2.8-.3 1.2-.3zm28-20.7c.8 0 1.5.3 2.1.8.5.5.8 1.2.8 2.1v20.3c0 .8-.3 1.5-.8 2.1-.5.6-1.2.8-2.1.8s-1.5-.3-2-.8-.8-1.2-.8-2.1c-.8.9-1.9 1.7-3.2 2.4-1.3.7-2.8 1-4.3 1-2.2 0-4.2-.6-6-1.7-1.8-1.1-3.2-2.7-4.2-4.7s-1.6-4.3-1.6-6.9c0-2.6.5-4.9 1.5-6.9s2.4-3.6 4.2-4.8c1.8-1.1 3.7-1.7 5.9-1.7 1.5 0 3 .3 4.3.8 1.3.6 2.5 1.3 3.4 2.1 0-.8.3-1.5.8-2.1.5-.5 1.2-.7 2-.7zm-9.7 21.3c2.1 0 3.8-.8 5.1-2.3s2-3.4 2-5.7-.7-4.2-2-5.8c-1.3-1.5-3-2.3-5.1-2.3-2 0-3.7.8-5 2.3-1.3 1.5-2 3.5-2 5.8s.6 4.2 1.9 5.7 3 2.3 5.1 2.3zm32.1-21.3c2.2 0 4.2.6 6 1.7 1.8 1.1 3.2 2.7 4.2 4.7s1.6 4.3 1.6 6.9-.5 4.9-1.5 6.9-2.4 3.6-4.2 4.8c-1.8 1.1-3.7 1.7-5.9 1.7-1.5 0-3-.3-4.3-.9s-2.5-1.4-3.4-2.3v.3c0 .8-.3 1.5-.8 2.1-.5.6-1.2.8-2.1.8s-1.5-.3-2.1-.8c-.5-.5-.8-1.2-.8-2.1V18.9c0-.8.3-1.5.8-2.1.5-.6 1.2-.8 2.1-.8s1.5.3 2.1.8c.5.6.8 1.3.8 2.1v10c.8-1 1.8-1.8 3.2-2.5 1.3-.7 2.8-1 4.3-1zm-.7 21.3c2 0 3.7-.8 5-2.3s2-3.5 2-5.8-.6-4.2-1.9-5.7-3-2.3-5.1-2.3-3.8.8-5.1 2.3-2 3.4-2 5.7.7 4.2 2 5.8c1.3 1.6 3 2.3 5.1 2.3zm23.6 1.9c0 .8-.3 1.5-.8 2.1s-1.3.8-2.1.8-1.5-.3-2-.8-.8-1.3-.8-2.1V18.9c0-.8.3-1.5.8-2.1s1.3-.8 2.1-.8 1.5.3 2 .8.8 1.3.8 2.1v29.7zm29.3-10.5c0 .8-.3 1.4-.9 1.9-.6.5-1.2.7-2 .7h-15.8c.4 1.9 1.3 3.4 2.6 4.4 1.4 1.1 2.9 1.6 4.7 1.6 1.3 0 2.3-.1 3.1-.4.7-.2 1.3-.5 1.8-.8.4-.3.7-.5.9-.6.6-.3 1.1-.4 1.6-.4.7 0 1.2.2 1.7.7s.7 1 .7 1.7c0 .9-.4 1.6-1.3 2.4-.9.7-2.1 1.4-3.6 1.9s-3 .8-4.6.8c-2.7 0-5-.6-7-1.7s-3.5-2.7-4.6-4.6-1.6-4.2-1.6-6.6c0-2.8.6-5.2 1.7-7.2s2.7-3.7 4.6-4.8 3.9-1.7 6-1.7 4.1.6 6 1.7 3.4 2.7 4.5 4.7c.9 1.9 1.5 4.1 1.5 6.3zm-12.2-7.5c-3.7 0-5.9 1.7-6.6 5.2h12.6v-.3c-.1-1.3-.8-2.5-2-3.5s-2.5-1.4-4-1.4zm30.3-5.2c1 0 1.8.3 2.4.8.7.5 1 1.2 1 1.9 0 1-.3 1.7-.8 2.2-.5.5-1.1.8-1.8.7-.5 0-1-.1-1.6-.3-.2-.1-.4-.1-.6-.2-.4-.1-.7-.1-1.1-.1-.8 0-1.6.3-2.4.8s-1.4 1.3-1.9 2.3-.7 2.3-.7 3.7v11.4c0 .8-.3 1.5-.8 2.1-.5.6-1.2.8-2.1.8s-1.5-.3-2.1-.8c-.5-.6-.8-1.3-.8-2.1V28.8c0-.8.3-1.5.8-2.1.5-.6 1.2-.8 2.1-.8s1.5.3 2.1.8c.5.6.8 1.3.8 2.1v.6c.7-1.3 1.8-2.3 3.2-3 1.3-.7 2.8-1 4.3-1z" fill-rule="evenodd" clip-rule="evenodd" fill="#4a4a4a"></path>
          </svg>
        </a>`;
      var logoimg = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      logoimg.setExcludeBoundsFromDom(true);
      logoimg.setClearAllInlineStyles(true);
      var logoelem = logoimg.getContentElement();
      logoelem.useMarkup(tablerlinklogo);
      logoelem.removeStyle("position", true);
      logoSection.add(logoimg);

      // Main Card
      var mainCard = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      //mainCard.setCssUtilityClass("card card-md");
      //mainCard.setExcludeBoundsFromDom(true);
      //mainCard.setClearAllInlineStyles(true);

      // Form
      var form = new qx.ui.form.Form();

      // Form header
      form.addGroupHeader("Login to your account");

      // Username
      var txtusername = new qx.ui.form.TextField().set({ required : true });
      txtusername.setPlaceholder("youremail@email.com");
      //txtusername.setCssUtilityClass("form-control");
      //txtusername.setRemoveCssClasses(["qx-abstract-field", "qx-placeholder-color"]);
      //txtusername.setExcludeBoundsFromDom(true);
      //txtusername.setExcludeInlineStyles(["position", "zIndex", "touch-action", "boxSizing"]);
      form.add(txtusername, "Email", qx.util.Validate.email());

      // Password
      var txtpassword = new qx.ui.form.PasswordField().set({ required : true });
      txtpassword.setPlaceholder("Your password");
      //txtpassword.setCssUtilityClass("form-control");
      //txtpassword.setRemoveCssClasses(["qx-abstract-field", "qx-placeholder-color"]);
      //txtpassword.setExcludeBoundsFromDom(true);
      //txtpassword.setExcludeInlineStyles(["position", "zIndex", "touch-action", "boxSizing"]);
      form.add(txtpassword, "Password");

      // Remember me
      var rememberme = new qx.ui.form.CheckBox("Remember me on this device");
      //rememberme.setCssUtilityClass("form-check");
      //rememberme.setExcludeBoundsFromDom(true);
      //rememberme.setClearAllInlineStyles(true);

      var rmelem = rememberme.getContentElement();
      rmelem.setNodeName("label");
      var rmcheckbox = new qx.html.Element("input", null, {type: "checkbox", class:"form-check-input"});
      var rmcheckboxlabel = new qx.html.Element("span", null, {html: "Remember me on this device", class:"form-check-label"});
      rmelem.addAt(rmcheckboxlabel, 0);
      rmelem.addAt(rmcheckbox, 0);

      var rmlabel = rememberme.getChildControl("label");
      //rmlabel.setExcludeBoundsFromDom(true);
      //rmlabel.setClearAllInlineStyles(true);
      rmlabel.setVisibility("excluded");
      form.add(rememberme, "");

      // Login button
      var loginbutton = new qx.ui.form.Button("Sign in");
      //loginbutton.setExcludeBoundsFromDom(true);
      //loginbutton.setCssUtilityClass("btn btn-primary w-100");
      //loginbutton.setClearAllInlineStyles(true);
      //var btnlabel = loginbutton.getChildControl("label");
      //btnlabel.setExcludeBoundsFromDom(true);
      //btnlabel.setClearAllInlineStyles(true);

      form.addButton(loginbutton);

      var loginForm = new qxapp.form.renderer.LoginForm(form);
      //loginForm.setCssUtilityClass("card-body");
      //loginForm.setExcludeBoundsFromDom(true);
      //loginForm.setClearAllInlineStyles(true);
      mainCard.add(loginForm);

      // Hr Text
      var hrText = new qx.ui.core.Widget();
      //hrText.setCssUtilityClass("hr-text");
      hrText.getContentElement().setAttribute("html", "or");
      //hrText.setExcludeBoundsFromDom(true);
      //hrText.setClearAllInlineStyles(true);
      mainCard.add(hrText);

      // Or Card
      var orCard = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      //orCard.setCssUtilityClass("card-body");
      //orCard.setExcludeBoundsFromDom(true);
      //orCard.setClearAllInlineStyles(true);
      mainCard.add(orCard);

      // AltButtons
      var altRow = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      //altRow.setCssUtilityClass("row");
      //altRow.setExcludeBoundsFromDom(true);
      //altRow.setClearAllInlineStyles(true);
      orCard.add(altRow);
      var altCol1 = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      //altCol1.setCssUtilityClass("col");
      //altCol1.setExcludeBoundsFromDom(true);
      //altCol1.setClearAllInlineStyles(true);
      altRow.add(altCol1);
      var btngh = new qxapp.components.Link("Login with Github", null, ".", true);
      //btngh.setCssUtilityClass("btn btn-4 w-100");
      //btngh.setExcludeBoundsFromDom(true);
      //btngh.setClearAllInlineStyles(true);
      altCol1.add(btngh);
      var altCol2 = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      //altCol2.setCssUtilityClass("col");
      //altCol2.setExcludeBoundsFromDom(true);
      //altCol2.setClearAllInlineStyles(true);
      altRow.add(altCol2);
      var btntwit = new qxapp.components.Link("Login with X", null, ".", true);
      //btntwit.setCssUtilityClass("btn btn-4 w-100");
      //btntwit.setExcludeBoundsFromDom(true);
      //btntwit.setClearAllInlineStyles(true);
      altCol2.add(btntwit);

      centerbox.add(logoSection);
      centerbox.add(mainCard);

      //doc.add(centerbox);
      //doc.add(settings);

      */

    },

    _getTabView(barposition) {
      var tabView = new qx.ui.tabview.TabView(barposition);
      tabView.setWidth(300);

      ////////////////// TEST PAGE 1 ////////////////////
      var page1 = new qx.ui.tabview.Page("Layout");
      page1.setLayout(new qx.ui.layout.VBox());
      page1.add(new qx.ui.basic.Label("Layout-Settings"));
      tabView.add(page1);
      //page1.getButton().getContentElement().setAttribute("data-active", "true");
      //page1.getButton().getContentElement().setAttribute("data-variant","default"); 
      //page1.getButton().getContentElement().setAttribute("data-orientation","horizontal");

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

      ////////////////// TEST PAGE 4 ////////////////////
      //var page4 = new qx.ui.tabview.Page("Help");
      //page4.setLayout(new qx.ui.layout.VBox());
      //page4.add(new qx.ui.basic.Label("Help..."));
      //tabView.add(page4);

      return tabView;
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
            var iconColumnMenu = new qxapp.theme.icon.phosphor.PlusMinus(16);
            var columnMenuButton = new qxapp.ui.table.columnmenu.Button(iconColumnMenu);
            var custom = {
                tableColumnModel() {return new qx.ui.table.columnmodel.Resize()},
                columnMenu() {return columnMenuButton}
            };

            /* NEW Pane and Scroller - NOT NEEDED
            tablePane(obj) {return new qxapp.table.pane.Pane(obj)},
            tablePaneScroller(obj) {return new qxapp.table.pane.Scroller(obj)}
            */

            var table = new qx.ui.table.Table(model, custom);

            // Obtain the behavior object to manipulate
            var colrb = table.getTableColumnModel().getBehavior();
            for (let i = 0; i < tableConfig.columnWidths.length; i++) {
                colrb.set(i, { width: tableConfig.columnWidths[i] });
            }

            // NEW RowRenderer
            table.setDataRowRenderer(new qxapp.ui.table.rowrenderer.Default());

            // NEW CellRenderer
            table.getTableColumnModel().setDataCellRenderer(0, new qxapp.ui.table.cellrenderer.Default());
            table.getTableColumnModel().setDataCellRenderer(1, new qxapp.ui.table.cellrenderer.Default());
            table.getTableColumnModel().setDataCellRenderer(2, new qxapp.ui.table.cellrenderer.Default());

            table.set({
                height: 140,
                width: 300,
                showCellFocusIndicator: false,
                focusCellOnPointerMove: true
            });

            table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);

            return table;

        }
  }
});
