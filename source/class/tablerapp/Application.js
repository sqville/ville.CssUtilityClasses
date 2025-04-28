/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "tablerapp"
 *
 * @asset(tablerapp/*)
 * @external(tablerapp/css/tabler.min.css)
 */
qx.Class.define("tablerapp.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main()
    {
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

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      if (qx.core.Environment.get("ville.cssuc")) {
        qx.Class.include(qx.ui.core.Widget, ville.cssuc.MCssUtilityClass);
        qx.Class.include(qx.ui.core.LayoutItem, ville.cssuc.MControl);

        // clear out all styling of html and body tags
        document.documentElement.style = "";
        document.body.style = "";
      } 

      // Document is the application root
      const doc = this.getRoot();
      // CssUtilityClasses
      doc.setCssUtilityClass("page page-center");
      doc.setExcludeBoundsFromDom(true);
      doc.setClearAllInlineStyles(true);

      // Login Page
      var centerbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      centerbox.setCssUtilityClass("container container-tight py-4");
      centerbox.setExcludeBoundsFromDom(true);
      centerbox.setClearAllInlineStyles(true);

      // Logo Container
      var logoSection = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      logoSection.setCssUtilityClass("text-center mb-4");
      logoSection.setExcludeBoundsFromDom(true);
      logoSection.setClearAllInlineStyles(true);

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
      var mainCard = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      mainCard.setCssUtilityClass("card card-md");
      mainCard.setExcludeBoundsFromDom(true);
      mainCard.setClearAllInlineStyles(true);

      // Form
      var form = new qx.ui.form.Form();

      // Form header
      form.addGroupHeader("Login to your account");

      // Username
      var txtusername = new qx.ui.form.TextField().set({ required : true });
      txtusername.setPlaceholder("youremail@email.com");
      txtusername.setCssUtilityClass("form-control");
      txtusername.setRemoveCssClasses(["qx-abstract-field", "qx-placeholder-color"]);
      txtusername.setExcludeBoundsFromDom(true);
      txtusername.setExcludeInlineStyles(["position", "zIndex", "touch-action", "boxSizing"]);
      form.add(txtusername, "Email", qx.util.Validate.email());

      // Password
      var txtpassword = new qx.ui.form.PasswordField().set({ required : true });
      txtpassword.setPlaceholder("Your password");
      txtpassword.setCssUtilityClass("form-control");
      txtpassword.setRemoveCssClasses(["qx-abstract-field", "qx-placeholder-color"]);
      txtpassword.setExcludeBoundsFromDom(true);
      txtpassword.setExcludeInlineStyles(["position", "zIndex", "touch-action", "boxSizing"]);
      form.add(txtpassword, "Password");

      // Remember me
      var rememberme = new qx.ui.form.CheckBox("Remember me on this device");
      rememberme.setCssUtilityClass("form-check");
      rememberme.setExcludeBoundsFromDom(true);
      rememberme.setClearAllInlineStyles(true);

      var rmelem = rememberme.getContentElement();
      rmelem.setNodeName("label");
      var rmcheckbox = new qx.html.Element("input", null, {type: "checkbox", class:"form-check-input"});
      var rmcheckboxlabel = new qx.html.Element("span", null, {html: "Remember me on this device", class:"form-check-label"});
      rmelem.addAt(rmcheckboxlabel, 0);
      rmelem.addAt(rmcheckbox, 0);

      var rmlabel = rememberme.getChildControl("label");
      rmlabel.setExcludeBoundsFromDom(true);
      rmlabel.setClearAllInlineStyles(true);
      rmlabel.setVisibility("excluded");
      form.add(rememberme, "");

      // Login button
      var loginbutton = new qx.ui.form.Button("Sign in");
      loginbutton.setExcludeBoundsFromDom(true);
      loginbutton.setCssUtilityClass("btn btn-primary w-100");
      loginbutton.setClearAllInlineStyles(true);
      var btnlabel = loginbutton.getChildControl("label");
      btnlabel.setExcludeBoundsFromDom(true);
      btnlabel.setClearAllInlineStyles(true);

      form.addButton(loginbutton);

      var loginForm = new tablerapp.form.renderer.LoginForm(form);
      loginForm.setCssUtilityClass("card-body");
      loginForm.setExcludeBoundsFromDom(true);
      loginForm.setClearAllInlineStyles(true);
      mainCard.add(loginForm);

      // Hr Text
      var hrText = new qx.ui.core.Widget();
      hrText.setCssUtilityClass("hr-text");
      hrText.getContentElement().setAttribute("html", "or");
      hrText.setExcludeBoundsFromDom(true);
      hrText.setClearAllInlineStyles(true);
      mainCard.add(hrText);

      // Or Card
      var orCard = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      orCard.setCssUtilityClass("card-body");
      orCard.setExcludeBoundsFromDom(true);
      orCard.setClearAllInlineStyles(true);
      mainCard.add(orCard);

      centerbox.add(logoSection);
      centerbox.add(mainCard);

      doc.add(centerbox);

    }
  }
});
