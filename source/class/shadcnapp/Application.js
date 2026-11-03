/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "mantineapp"
 *
 * @external(shadcnapp/css/shadcnapp.css)
 *
 */
qx.Class.define("shadcnapp.Application",
{
  extend : ville.ui.application.Standalone,

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

      // Document is the application root
      const doc = this.getRoot();

      // Application Margin Box
      var docMarginBox = new ville.ui.container.Composite();

      // Login Center Box Container
      var centerbox = new ville.ui.core.Paper();

      // Separator
      var dividerPopups = new ville.ui.core.Divider().set({size: "xl"});
      dividerPopups.setLabel("Dropdown, Popup testing");

      // Menu Button
      var btnMenu = new ville.ui.menu.Menu();
      btnMenu.setCssUtilityClass("cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95");

      var micomponentbtncls = "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive";
      var menuitem01 = new ville.ui.component.menu.Button("Menu item 01");
      menuitem01.setCssUtilityClass(micomponentbtncls);
      var menuitem02 = new ville.ui.component.menu.Button("Menu item 02");
      menuitem02.setCssUtilityClass(micomponentbtncls);
      btnMenu.add(menuitem01);
      btnMenu.add(menuitem02);

      var btnMenuButton = new ville.ui.component.MenuButton("Menu Button");
      btnMenuButton.setCssUtilityClass("group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2");
      btnMenuButton.setMenu(btnMenu);

      var iconPhoto = new ville.ui.icon.Photo(24);
      var pButton = new ville.ui.component.Button("Button");
      pButton.setCssUtilityClass("group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2");

      // Button label change test
      menuitem01.addListener("click", () => {
        pButton.setLabel("Works!");
      });
      
      var PopupTestingGroupbox = new ville.ui.layout.HGroup("flex-start");
      PopupTestingGroupbox.add(btnMenuButton);
      PopupTestingGroupbox.add(pButton);
      //PopupTestingGroupbox.setGap("xl");
      PopupTestingGroupbox.setStyle("margin-bottom","40px");

      // Theme Affix
      var IconSun = new ville.ui.icon.IconSun();
      IconSun.setStyles({ "width" : "24", "height" : "24" });
      IconSun.setAttribute("stroke-width", "1.5");
      var IconMoon = new ville.ui.icon.IconMoon();

      var btnTheme = new ville.ui.form.ToggleActionIcon(IconMoon, IconSun);
      btnTheme.addListener("click", (e) => {
        if (btnTheme.getValue()) {
          document.documentElement.style.colorScheme = "light";
        } else {
          document.documentElement.style.colorScheme = "dark";
        }
      });

      var settingsAffix = new ville.ui.overlay.Affix();
      settingsAffix.add(btnTheme);
      doc.add(settingsAffix);

      docMarginBox.add(dividerPopups);
      docMarginBox.add(PopupTestingGroupbox);

      doc.add(docMarginBox);

    }
  }

});
