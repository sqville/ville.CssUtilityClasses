/**
 * Mode 3 / Path B Ville UI Application — Tier A1 + Stage 6 (Tier A2, MDataView, & Composite Containers)
 * + Stage 7A Pure Semantic Data Views (`NativeSelect`, `SimpleList`, `SimpleTable`)
 * + Stage 7B Advanced QxLayout-Style Data Views (`Table` + `model.Simple` + `WorkerClient`, `Tree` + `TreeFolder`/`TreeFile`, `List` + `model`, `CSS.highlights`)
 * + Stage 5.5 Live 3-Vendor Theme Hot-Swapper
 * @asset(villeuiapp/images/*)
 * @external(villeuiapp/css/bundle.min.css)
 */
qx.Class.define("villeuiapp.Application", {
  extend: ville.ui.application.Standalone,

  members: {
    /**
     * Application startup entry point called by `ville.core.Init.ready()`.
     */
    main() {
      super.main();

      const appShell = this.getRoot();
      appShell.setAppearance("appshell");
      const metaMgr = ville.ui.theme.manager.Meta.getInstance();
      const getActiveVendor = () =>
        metaMgr.getVendorTheme() ||
        ville.core.Environment.get("ville.cssEngine") ||
        "mantine";

      /* =====================================================================
       * 1. HEADER BAR (`Burger`, `Image`, `Label`, `NavLink`, Vendor Hot-Swap, Light/Dark Toggle)
       * =================================================================== */
      const headerBox = new ville.ui.core.Box("header");
      headerBox.setAppearance("appshell-header");

      const headerInnerBox = new ville.ui.layout.HGroup("space-between");
      headerInnerBox.setAppearance("appshell-header-inner");

      const headerLogoBurgerGroupBox = new ville.ui.layout.HGroup();
      headerLogoBurgerGroupBox.setGap("xs");

      const headerBurger = new ville.ui.navigation.Burger();

      const villeLogo = new ville.ui.basic.Image(
        "images/ville_logo.png",
        "Ville Software Logo",
        28,
        28
      );

      const headerLogoBox = new ville.ui.basic.Label(
        `Ville UI (${getActiveVendor()})`
      );
      headerLogoBox.setAppearance("appshell-logo-text");

      headerLogoBurgerGroupBox.add(headerBurger);
      headerLogoBurgerGroupBox.add(villeLogo);
      headerLogoBurgerGroupBox.add(headerLogoBox);

      const headerNavGroupBox = new ville.ui.layout.HGroup();
      headerNavGroupBox.setGap("xs");

      const navActions = new ville.ui.navigation.NavLink(
        "Actions",
        null,
        "AIRPLANE"
      );
      navActions.setActive(true);
      const navOverlays = new ville.ui.navigation.NavLink(
        "Overlays",
        null,
        "FOLDER"
      );
      const navForms = new ville.ui.navigation.NavLink("Forms", null, "FILE");

      const activateNav = (activeItem) => {
        for (const item of [navActions, navOverlays, navForms]) {
          item.setActive(item === activeItem);
        }
      };
      navActions.addListener("execute", () => activateNav(navActions));
      navOverlays.addListener("execute", () => activateNav(navOverlays));
      navForms.addListener("execute", () => activateNav(navForms));

      // Stage 5.5 Live 3-Vendor Theme Hot-Swap Menu (`Mantine` / `Obsidian` / `shadcn`)
      const vendorMenu = new ville.ui.menu.Menu();
      const vendorItems = {
        mantine: new ville.ui.menu.Button("Mantine Theme", "CHECK"),
        obsidian: new ville.ui.menu.Button("Obsidian Theme", "FOLDER"),
        shadcn: new ville.ui.menu.Button("shadcn Theme", "FILE")
      };

      for (const [vendorKey, item] of Object.entries(vendorItems)) {
        item.addListener("execute", () => {
          this.setVendorTheme(
            /** @type {"mantine"|"obsidian"|"shadcn"} */ (vendorKey)
          );
        });
        vendorMenu.add(item);
      }

      const vendorMenuBtn = new ville.ui.form.MenuButton(
        `Theme: ${getActiveVendor()}`
      );
      vendorMenuBtn.setSize("sm");
      vendorMenuBtn.setMenu(vendorMenu);

      // Header Light/Dark Toggle Button
      const themeToggleBtn = new ville.ui.form.Button(
        metaMgr.getColorScheme() === "dark" ? "Light Mode" : "Dark Mode",
        metaMgr.getColorScheme() === "dark" ? "SUN" : "MOON"
      );
      themeToggleBtn.setSize("sm");
      themeToggleBtn.addListener("execute", () => {
        this.toggleColorScheme();
      });

      const themeTooltip = new ville.ui.overlay.ToolTip(
        "Toggle Light / Dark color scheme (Mantine · Obsidian · shadcn)",
        "MOON"
      );
      themeTooltip.setPosition("bottom-center");
      themeTooltip.bindToWidget(themeToggleBtn);

      headerNavGroupBox.add(navActions);
      headerNavGroupBox.add(navOverlays);
      headerNavGroupBox.add(navForms);
      headerNavGroupBox.add(vendorMenuBtn);
      headerNavGroupBox.add(themeToggleBtn);

      headerInnerBox.add(headerLogoBurgerGroupBox);
      headerInnerBox.add(headerNavGroupBox);
      headerBox.add(headerInnerBox);

      /* =====================================================================
       * 2. MAIN CONTENT AREA (`Title`, `Text`, `Button`, `Command`, `ToggleButton`,
       *    `ActionIcon`, `MenuButton`, `Menu`, `ToolTip`, `Modal`, `Window`, `Form`,
       *    + Stage 7A Pure Semantic `NativeSelect`, `SimpleList`, `SimpleTable`,
       *    + Stage 7B Advanced `Table` (`model.Simple` + `WorkerClient`), `Tree`, `List`,
       *    + Stage 6 `SelectBox`, `ComboBox`, `Spinner`, `Slider`, `DateField`,
       *    `ColorSelector`, `ProgressBar`, `Meter`, `TabView`, `ToolBar`, `SplitPane`)
       * =================================================================== */
      const mainArea = new ville.ui.core.Box("main");
      mainArea.setAppearance("appshell-main");

      const centerArea = new ville.ui.layout.Center();
      const vstack = new ville.ui.layout.VStack("center");
      vstack.setGap("md");

      const titleH1 = new ville.ui.typography.Title(
        1,
        "Ville UI — Path B Tier A1, Stage 6 & Stage 7A/7B Sandbox"
      );
      const subtitleText = new ville.ui.typography.Text(
        `Active Theme: ${getActiveVendor()} (${metaMgr.getColorScheme()}) · 0 qx.* files · ~15 KB ville.core Kernel`
      );

      /* --- Section A: Actions, Commands, Toggles & Menus --- */
      const dividerActions = new ville.ui.core.Divider(
        "Actions, Commands & Toggles"
      ).set({
        size: "sm"
      });

      const actionRow = new ville.ui.layout.HGroup("center");
      actionRow.setGap("sm");

      // Declarative Keyboard Command (`Ctrl+E` + automatic `aria-keyshortcuts`)
      const execCmd = new ville.ui.command.Command("Control+E");
      execCmd.setLabel("Execute Command");

      const btn = new ville.ui.form.Button(
        "Execute (Ctrl+E)",
        "AIRPLANE",
        execCmd
      );
      btn.setVariant("filled");
      btn.addListener("execute", () => {
        btn.setLabel("Executed!");
      });

      // Top-Layer Tooltip bound to `btn`
      const btnTooltip = new ville.ui.overlay.ToolTip(
        "Press Ctrl+E or click to run command",
        "AIRPLANE"
      );
      btnTooltip.bindToWidget(btn);

      // ToggleButton & ActionIcon (`aria-pressed` + `data-active`)
      const toggleBtn = new ville.ui.form.ToggleButton("Pin Mode", "CHECK");
      const actionIconBtn = new ville.ui.form.ActionIcon(
        metaMgr.getColorScheme() === "dark" ? "SUN" : "MOON",
        "default"
      );
      actionIconBtn.setAriaLabel("Toggle Light/Dark Mode");
      actionIconBtn.addListener("execute", () => {
        this.toggleColorScheme();
      });

      // MenuButton + Top-Layer Popover Menu (`menu.Button` + `menu.Separator`)
      const btnMenu = new ville.ui.menu.Menu();
      const menuitem01 = new ville.ui.menu.Button(
        "Reset Execute Button",
        "CHECK"
      );
      menuitem01.addListener("execute", () => {
        btn.setLabel("Execute (Ctrl+E)");
        btn.setEnabled(true);
      });
      const menuSep = new ville.ui.menu.Separator();
      const menuitem02 = new ville.ui.menu.Button("Toggle Pin State", "FOLDER");
      menuitem02.addListener("execute", () => {
        toggleBtn.toggleValue();
      });
      const menuitem03 = new ville.ui.menu.Button(
        "Switch Light / Dark Mode",
        "MOON"
      );
      menuitem03.addListener("execute", () => {
        this.toggleColorScheme();
      });

      btnMenu.add(menuitem01);
      btnMenu.add(menuSep);
      btnMenu.add(menuitem02);
      btnMenu.add(menuitem03);

      const btnMenuButton = new ville.ui.form.MenuButton("Actions Menu");
      btnMenuButton.setMenu(btnMenu);

      actionRow.add(btn);
      actionRow.add(toggleBtn);
      actionRow.add(actionIconBtn);
      actionRow.add(btnMenuButton);

      /* --- Section B: Top-Layer `<dialog>` Modal & Modeless Draggable Window --- */
      const dividerOverlays = new ville.ui.core.Divider(
        "Top-Layer <dialog> Modal & Window"
      ).set({
        size: "sm"
      });

      const demoModal = new ville.ui.overlay.Modal(
        "Ville UI Top-Layer <dialog> Modal"
      );
      const modalText = new ville.ui.typography.Text(
        "Rendered via native HTML5 <dialog>.showModal() with ::backdrop, Escape key handling, and W3C Invoker Commands (commandfor / command)."
      );
      const modalCloseBtn = new ville.ui.form.Button("Close Modal", "CLOSE");
      modalCloseBtn.setVariant("filled");
      modalCloseBtn.addListener("execute", () => demoModal.close("confirmed"));
      demoModal.add(modalText);
      demoModal.add(modalCloseBtn);

      const demoWindow = new ville.ui.overlay.Window(
        "Floating Inspector Window"
      );
      const winText = new ville.ui.typography.Text(
        "Modeless <dialog>.show() floating window with pointer-captured header dragging (MMovable)."
      );
      demoWindow.add(winText);

      const overlayRow = new ville.ui.layout.HGroup("center");
      overlayRow.setGap("sm");

      const openModalBtn = new ville.ui.form.Button(
        "Open Modal (<dialog>)",
        "FOLDER_OPEN"
      );
      openModalBtn.setCommandFor(demoModal);
      openModalBtn.setCommandAction("show-modal");
      openModalBtn.addListener("execute", () => demoModal.open());

      const openWindowBtn = new ville.ui.form.Button(
        "Toggle Floating Window",
        "FILE"
      );
      openWindowBtn.addListener("execute", () => {
        demoWindow.setOpened(!demoWindow.getOpened());
      });

      overlayRow.add(openModalBtn);
      overlayRow.add(openWindowBtn);

      /* --- Section C: Stage 7A Pure Semantic + Stage 7B Advanced Qx-Style Data Views + Stage 6 Controls --- */
      const dividerStage6 = new ville.ui.core.Divider(
        "Stage 7A Pure Semantic & Stage 7B Advanced Data Views (Table / Tree / List / Web Workers)"
      ).set({
        size: "sm"
      });

      // 1. ToolBar (`role="toolbar"`)
      const demoToolbar = new ville.ui.toolbar.ToolBar();
      const tbThemeMantine = new ville.ui.toolbar.Button("Mantine", "CHECK");
      tbThemeMantine.addListener("execute", () => this.setVendorTheme("mantine"));
      const tbThemeObsidian = new ville.ui.toolbar.Button("Obsidian", "FOLDER");
      tbThemeObsidian.addListener("execute", () => this.setVendorTheme("obsidian"));
      const tbThemeShadcn = new ville.ui.toolbar.Button("shadcn", "FILE");
      tbThemeShadcn.addListener("execute", () => this.setVendorTheme("shadcn"));

      demoToolbar.add(tbThemeMantine);
      demoToolbar.add(tbThemeObsidian);
      demoToolbar.add(tbThemeShadcn);
      demoToolbar.addSeparator();
      demoToolbar.addSpacer();

      const tbSchemeBtn = new ville.ui.toolbar.Button("Flip Light/Dark", "MOON");
      tbSchemeBtn.addListener("execute", () => this.toggleColorScheme());
      demoToolbar.add(tbSchemeBtn);

      // 2. TabView with `hidden="until-found"`, `beforematch`, and View Transitions API
      const tabView = new ville.ui.tabview.TabView("top");
      tabView.setUseViewTransition(true);
      tabView.setStyles({ width: "100%", maxWidth: "48rem" });

      // Tab 1: Stage 7B — Advanced QxLayout-Style `Table` (`model.Simple` + `WorkerClient`), `Tree` (`TreeFolder`/`TreeFile`), `List` (`model`), & `CSS.highlights`
      const tabStage7B = new ville.ui.tabview.Page("Stage 7B: Qx-Style Table, Tree & Worker", "FOLDER_OPEN");
      tabStage7B.setLayout(new ville.ui.layout.VBox(10));

      const stage7BSearchRow = new ville.ui.layout.HGroup("space-between");
      stage7BSearchRow.setGap("sm");

      const searchInput7B = new ville.ui.form.TextField();
      searchInput7B.setPlaceholder("Search Table, Tree & List (off-thread Worker + CSS.highlights)...");
      searchInput7B.setStyles({ flex: "1 1 auto" });

      // Advanced `ville.ui.table.model.Simple` + `ville.ui.table.Table`
      const tableModel = new ville.ui.table.model.Simple();
      tableModel.setColumns(
        ["ID", "Module / Widget", "Stage & Role (Double-Click to Edit)", "DOM Rows"],
        ["id", "module", "role", "domRows"]
      );
      tableModel.setColumnEditable(2, true);
      tableModel.setUseWorker(true);

      const initialTableRows = [
        [101, "ville.ui.table.SimpleTable", "Stage 7A: Pure Semantic <table>", 4],
        [102, "ville.ui.table.Table", "Stage 7B: Qx-Style Table + Tier 2 Windowing", 2500],
        [103, "ville.ui.table.model.Simple", "Stage 7B: ITableModel + WorkerClient", 0],
        [104, "ville.ui.tree.Tree", "Stage 7B: Semantic <ul role='tree'> + TreeFolder", 12],
        [105, "ville.ui.list.List", "Stage 7B: MDataView + MModelSelection List", 50],
        [106, "ville.core.WorkerClient", "Stage 7B: Off-Thread Web Worker + BroadcastChannel", 0],
        [107, "MDataView.applyCssHighlight", "Stage 7B: W3C CSS.highlights API (0 DOM mutations)", 0]
      ];
      tableModel.setData(initialTableRows);

      const advTable = new ville.ui.table.Table(tableModel);
      advTable.setViewportHeight("12.5rem");
      advTable.setColumnWidth(0, 64);
      advTable.setColumnWidth(1, 210);
      advTable.setColumnWidth(3, 95);

      const loadVirtualBtn = new ville.ui.form.Button(
        "Load 2,500 Rows (Tier 2 Windowed + Web Worker)",
        "AIRPLANE"
      );
      loadVirtualBtn.setSize("sm");
      tableModel.bind("busy", loadVirtualBtn, "loading");

      let isLargeDatasetLoaded = false;
      loadVirtualBtn.addListener("execute", () => {
        if (!isLargeDatasetLoaded) {
          const bigRows = [];
          const modules = [
            "ville.ui.table.Table",
            "ville.ui.tree.Tree",
            "ville.ui.list.List",
            "ville.core.WorkerClient",
            "ville.ui.core.MDataView"
          ];
          for (let i = 1; i <= 2500; i++) {
            const mod = modules[i % modules.length];
            bigRows.push([
              1000 + i,
              `${mod} #${i}`,
              `Tier 2 Windowed Row ${i} (double-click to edit inline)`,
              (i * 7) % 500
            ]);
          }
          tableModel.setData(bigRows);
          isLargeDatasetLoaded = true;
          loadVirtualBtn.setLabel("Reset to 7 Summary Rows");
        } else {
          tableModel.setData(initialTableRows);
          isLargeDatasetLoaded = false;
          loadVirtualBtn.setLabel("Load 2,500 Rows (Tier 2 Windowed + Web Worker)");
        }
      });

      stage7BSearchRow.add(searchInput7B);
      stage7BSearchRow.add(loadVirtualBtn);

      // Side-by-side `ville.ui.tree.Tree` (`TreeFolder` / `TreeFile`) & `ville.ui.list.List` (`ville.data.Array`)
      const treeAndListRow = new ville.ui.layout.HGroup("space-between");
      treeAndListRow.setGap("sm");
      treeAndListRow.setStyles({ alignItems: "stretch", width: "100%" });

      // 1. Qooxdoo-compatible `Tree` with `TreeFolder` & `TreeFile`
      const advTree = new ville.ui.tree.Tree();
      advTree.setStyles({ flex: "1 1 50%", maxHeight: "11rem", overflowY: "auto" });

      const rootFolder = new ville.ui.tree.TreeFolder("ville (Path B Root)");
      rootFolder.setOpen(true);

      const coreFolder = new ville.ui.tree.TreeFolder("core (ES2025 Kernel + Worker)");
      coreFolder.setOpen(true);
      coreFolder.add(new ville.ui.tree.TreeFile("Kernel.js (~15 KB Reactive OOP)"));
      coreFolder.add(new ville.ui.tree.TreeFile("WorkerClient.js (Web Worker + BroadcastChannel)"));

      const uiFolder = new ville.ui.tree.TreeFolder("ui (Stage 7A Semantic + Stage 7B Advanced)");
      uiFolder.setOpen(true);
      uiFolder.add(new ville.ui.tree.TreeFile("table/SimpleTable.js & table/Table.js"));
      uiFolder.add(new ville.ui.tree.TreeFile("tree/Tree.js, TreeFolder.js & TreeFile.js"));
      uiFolder.add(new ville.ui.tree.TreeFile("list/SimpleList.js & list/List.js"));

      rootFolder.add(coreFolder);
      rootFolder.add(uiFolder);
      advTree.setRoot(rootFolder);

      // 2. Qooxdoo-compatible `ville.ui.list.List` bound to `ville.data.Array`
      const advList = new ville.ui.list.List();
      advList.setStyles({ flex: "1 1 50%", maxHeight: "11rem", overflowY: "auto" });
      advList.setLabelPath("label");
      advList.setIconPath("icon");
      const observableListModel = new ville.data.Array([
        { label: "Stage 7A: Pure Semantic Base (SimpleTable, SimpleList, NativeSelect)", value: "7a", icon: "CHECK" },
        { label: "Stage 7B: Advanced Qx-Style Table (ITableModel + model.Simple)", value: "7b-table", icon: "FOLDER" },
        { label: "Stage 7B: Semantic Tree (Tree + TreeFolder + TreeFile)", value: "7b-tree", icon: "FOLDER_OPEN" },
        { label: "Stage 7B: Off-Thread WorkerClient + CSS.highlights Search", value: "7b-worker", icon: "AIRPLANE" },
        { label: "Stage 8 Next: Node.js SSR, Hydration Islands & @villeui/cli", value: "8", icon: "FILE" }
      ]);
      advList.setModel(observableListModel);

      const stage7BReadout = new ville.ui.typography.Text(
        "Tip: Click column headers to sort off-thread via WorkerClient, drag column dividers to resize, double-click 'Stage & Role' cells to edit inline, or type above to highlight via CSS.highlights."
      );

      advTable.addListener("cellEdited", (e) => {
        const d = e.getData();
        if (d) {
          stage7BReadout.setText(`Edited cell [row ${d.row}, col ${d.col}]: "${d.oldValue}" -> "${d.value}"`);
        }
      });

      advTree.addListener("changeValue", (e) => {
        const node = advTree.getSelectedNode();
        if (node) {
          stage7BReadout.setText(`Selected Tree Node: ${node.label} (${e.getData()})`);
        }
      });

      advList.addListener("changeValue", (e) => {
        const item = advList.getSelectedItem();
        if (item) {
          stage7BReadout.setText(`Selected List Model Item: ${item.label}`);
        }
      });

      searchInput7B.addListener("input", (e) => {
        const q = String(e.getData() || "");
        advTable.setSearchQuery(q);
        advTree.setHighlightQuery(q);
        advList.setHighlightQuery(q);
      });

      treeAndListRow.add(advTree);
      treeAndListRow.add(advList);

      tabStage7B.add(stage7BSearchRow);
      tabStage7B.add(advTable);
      tabStage7B.add(treeAndListRow);
      tabStage7B.add(stage7BReadout);

      // Tab 2: Stage 7A Pure Semantic HTML5 First Cut (`NativeSelect` <select>, `SimpleList` <ul><li>, `SimpleTable` <table>)
      const tabSemantic = new ville.ui.tabview.Page("Stage 7A: Pure Semantic (Table / List / Select)", "CHECK");
      tabSemantic.setLayout(new ville.ui.layout.VBox(10));

      const semanticTopRow = new ville.ui.layout.HGroup("space-between");
      semanticTopRow.setGap("sm");

      const nativeSelect = new ville.ui.form.NativeSelect([
        {
          group: "3-Vendor CSS Triad (Pure <select>)",
          items: [
            { label: "Mantine Theme (<select>)", value: "mantine" },
            { label: "Obsidian Theme (<select>)", value: "obsidian" },
            { label: "shadcn Theme (<select>)", value: "shadcn" }
          ]
        }
      ]);
      nativeSelect.setValue(getActiveVendor());
      nativeSelect.addListener("changeValue", (e) => {
        const val = e.getData();
        if (val && val !== getActiveVendor()) {
          this.setVendorTheme(val);
        }
      });

      const semanticSelectionReadout = new ville.ui.typography.Text(
        "Click a table column header (<th>) to sort, or click any row/list item to select."
      );

      semanticTopRow.add(nativeSelect);
      semanticTopRow.add(semanticSelectionReadout);

      const simpleTable = new ville.ui.table.SimpleTable(
        [
          { key: "widget", label: "Semantic Widget", sortable: true },
          { key: "tag", label: "Root HTML5 Tag", sortable: true },
          { key: "childWidgets", label: "Child Widgets", align: "right", sortable: true },
          { key: "tier", label: "Architecture", align: "center", sortable: true }
        ],
        [
          { id: "table", widget: "SimpleTable", tag: "<table><thead><tbody><tr><th><td>", childWidgets: 0, tier: "Stage 7A Pure Semantic" },
          { id: "select", widget: "NativeSelect", tag: "<select><optgroup><option>", childWidgets: 0, tier: "Stage 7A Pure Semantic" },
          { id: "list", widget: "SimpleList", tag: "<ul role='listbox'><li role='option'>", childWidgets: 0, tier: "Stage 7A Pure Semantic" },
          { id: "advtable", widget: "Table + model.Simple", tag: "<div><table><thead><tbody> + WorkerClient", childWidgets: 3, tier: "Stage 7B Qx-Style" }
        ]
      );
      simpleTable.setStriped(true);
      simpleTable.setWithColumnBorders(true);
      simpleTable.setCaption("Stage 7A Pure Semantic HTML5 <table> (click headers to sort · click rows to select)");
      simpleTable.addListener("rowSelect", (e) => {
        const d = e.getData();
        if (d && d.row) {
          semanticSelectionReadout.setText(`Selected Row: ${d.row.widget} (${d.row.tag})`);
        }
      });

      const simpleList = new ville.ui.list.SimpleList([
        {
          label: "Stage 7A: Pure Semantic Data Views (SimpleTable, SimpleList, NativeSelect)",
          value: "step1",
          description: "Zero Qooxdoo selection managers, TableScroller, or child Widget rows",
          badge: "Stage 7A Done"
        },
        {
          label: "Stage 7B: Advanced Qx-Compatible Data Grid, Tree, List & Web Workers",
          value: "step2",
          description: "Layered on top of Stage 7A (Table + model.Simple, Tree + TreeFolder, List + model, WorkerClient, CSS.highlights)",
          badge: "Stage 7B Done"
        },
        {
          label: "Stage 8: Node.js SSR, Hydration Islands, Web Components & @villeui/cli",
          value: "step3",
          description: "ville.html.Jsx, Serializer, create-villeui, and Laravel + Inertia v3 integration",
          badge: "Next Up"
        }
      ]);
      simpleList.setValue("step2");
      simpleList.addListener("itemClick", (e) => {
        const d = e.getData();
        if (d && d.item) {
          semanticSelectionReadout.setText(`Selected List Item: ${d.item.label}`);
        }
      });

      tabSemantic.add(semanticTopRow);
      tabSemantic.add(simpleTable);
      tabSemantic.add(simpleList);

      // Tab 3: Unified MDataView (`SelectBox` & `ComboBox`)
      const tabDataView = new ville.ui.tabview.Page("MDataView & SelectBox", "FOLDER");
      tabDataView.setLayout(new ville.ui.layout.VBox(10));

      const selectRow = new ville.ui.layout.HGroup("space-between");
      selectRow.setGap("sm");

      const vendorSelect = new ville.ui.form.SelectBox();
      vendorSelect.setItems([
        { label: "Mantine CSS System", value: "mantine", icon: "CHECK", description: "Layer 2 Mantine v8 slices" },
        { label: "Obsidian CSS System", value: "obsidian", icon: "FOLDER", description: "Semantic HTML + .mod-* tokens" },
        { label: "shadcn/ui CSS System", value: "shadcn", icon: "FILE", description: "OKLCH tokens + Tailwind v4 utilities" }
      ]);
      vendorSelect.setValue(getActiveVendor());
      vendorSelect.addListener("changeValue", (e) => {
        const val = e.getData();
        if (val && val !== getActiveVendor()) {
          this.setVendorTheme(val);
        }
      });

      const frameworkCombo = new ville.ui.form.ComboBox();
      frameworkCombo.setPlaceholder("Filter target runtime...");
      frameworkCombo.setItems([
        { label: "Streamed Web Application", value: "web", icon: "AIRPLANE" },
        { label: "Installable Desktop PWA", value: "pwa", icon: "FOLDER_OPEN" },
        { label: "Laravel 12 + Inertia v3", value: "laravel", icon: "FILE" },
        { label: "Static Site Generation (SSG)", value: "ssg", icon: "CHECK" }
      ]);

      selectRow.add(vendorSelect);
      selectRow.add(frameworkCombo);

      const dataViewCaption = new ville.ui.typography.Text(
        "Backed by ville.ui.core.MDataView: pre-compiled <template> cloning + content-visibility: auto + Tier 2 Windowed Row-Pool Recycling + CSS.highlights."
      );
      tabDataView.add(selectRow);
      tabDataView.add(dataViewCaption);

      // Tab 4: Numeric, Range, Date, Color & Indicators (`Spinner`, `Slider`, `DateField`, `ColorSelector`, `ProgressBar`, `Meter`)
      const tabControls = new ville.ui.tabview.Page("Controls & Indicators", "CHECK");
      tabControls.setLayout(new ville.ui.layout.VBox(10));

      const numRow = new ville.ui.layout.HGroup("space-between");
      numRow.setGap("sm");

      const demoSpinner = new ville.ui.form.Spinner(0, 65, 100);
      demoSpinner.setSingleStep(5);

      const demoSlider = new ville.ui.form.Slider(0, 65, 100);
      demoSlider.setSingleStep(5);

      const demoProgress = new ville.ui.indicator.ProgressBar(65, 100);
      const demoMeter = new ville.ui.indicator.Meter(65, 0, 100);

      demoSpinner.addListener("changeValue", (e) => {
        const v = Number(e.getData()) || 0;
        if (demoSlider.getValue() !== v) demoSlider.setValue(v);
        demoProgress.setValue(v);
        demoMeter.setValue(v);
      });

      demoSlider.addListener("changeValue", (e) => {
        const v = Number(e.getData()) || 0;
        if (demoSpinner.getValue() !== v) demoSpinner.setValue(v);
        demoProgress.setValue(v);
        demoMeter.setValue(v);
      });

      numRow.add(demoSpinner);
      numRow.add(demoSlider);

      const dateColorRow = new ville.ui.layout.HGroup("space-between");
      dateColorRow.setGap("sm");

      const demoDateField = new ville.ui.form.DateField();
      demoDateField.setValue(new Date(2026, 10, 27));

      const demoColorSelector = new ville.ui.control.ColorSelector();

      dateColorRow.add(demoDateField);
      dateColorRow.add(demoColorSelector);

      tabControls.add(numRow);
      tabControls.add(demoProgress);
      tabControls.add(demoMeter);
      tabControls.add(dateColorRow);

      // Tab 5: SplitPane (`Element.setPointerCapture`) & Find-in-Page (`hidden="until-found"`)
      const tabSplit = new ville.ui.tabview.Page("SplitPane & Find-in-Page", "FILE");
      tabSplit.setLayout(new ville.ui.layout.VBox(8));

      const demoSplitPane = new ville.ui.splitpane.Pane("horizontal");
      demoSplitPane.setStyles({ height: "96px", width: "100%" });

      const leftPane = new ville.ui.core.Box();
      leftPane.setStyles({ padding: "10px" });
      leftPane.add(
        new ville.ui.typography.Text(
          "Left Pane (drag splitter bar — uses Element.setPointerCapture)"
        )
      );

      const rightPane = new ville.ui.core.Box();
      rightPane.setStyles({ padding: "10px" });
      rightPane.add(
        new ville.ui.typography.Text(
          "Right Pane — Press Ctrl+F / Cmd+F and search 'QUANTUM_BEFOREMATCH_TOKEN' from another tab to test hidden='until-found' auto-tab activation!"
        )
      );

      demoSplitPane.add(leftPane, 1);
      demoSplitPane.add(rightPane, 1);
      tabSplit.add(demoSplitPane);

      tabView.add(tabStage7B);
      tabView.add(tabSemantic);
      tabView.add(tabDataView);
      tabView.add(tabControls);
      tabView.add(tabSplit);

      /* --- Section D: Semantic Form, Toggles & Schema Validation --- */
      const dividerForms = new ville.ui.core.Divider(
        "Form Controls & Schema Validation"
      ).set({
        size: "sm"
      });

      const form = new ville.ui.form.Form();

      const txtemail = new ville.ui.form.TextField();
      txtemail.setPlaceholder("you@example.com");
      form.add(
        txtemail,
        "Email",
        ville.ui.form.Validator.string().required().email(),
        "email",
        null,
        { complexity: "email" }
      );

      const txtpassword = new ville.ui.form.PasswordField();
      form.add(
        txtpassword,
        "Password",
        ville.ui.form.Validator.string().required().min(6),
        "password",
        null,
        { complexity: "password" }
      );

      const txtnotes = new ville.ui.form.TextArea();
      txtnotes.setPlaceholder("Deployment notes (auto-sizing textarea)...");
      txtnotes.setRows(2);
      txtnotes.setAutoSize(true);
      form.add(txtnotes, "Notes", null, "notes");

      // CheckBox, Dark Mode Switch & RadioButtonGroup
      const togglesRow = new ville.ui.layout.HGroup("space-between");
      togglesRow.setGap("md");

      const chkRemember = new ville.ui.form.CheckBox("Remember session");
      chkRemember.setValue(true);

      const swDarkMode = new ville.ui.form.Switch("Dark Mode");
      swDarkMode.setValue(metaMgr.getColorScheme() === "dark");
      swDarkMode.addListener("changeValue", (e) => {
        const wantDark = Boolean(e.getData());
        const targetScheme = wantDark ? "dark" : "light";
        if (metaMgr.getColorScheme() !== targetScheme) {
          this.setColorScheme(targetScheme);
        }
      });

      const syncHeaderAndSubtitle = () => {
        const scheme = metaMgr.getColorScheme();
        const vendor = getActiveVendor();
        const isDark = scheme === "dark";
        headerLogoBox.setValue(`Ville UI (${vendor})`);
        vendorMenuBtn.setLabel(`Theme: ${vendor}`);
        themeToggleBtn.setLabel(isDark ? "Light Mode" : "Dark Mode");
        themeToggleBtn.setIcon(isDark ? "SUN" : "MOON");
        actionIconBtn.setIcon(isDark ? "SUN" : "MOON");
        subtitleText.setText(
          `Active Theme: ${vendor} (${scheme}) · 0 qx.* files · ~15 KB ville.core Kernel`
        );
        if (swDarkMode.getValue() !== isDark) {
          swDarkMode.setValue(isDark);
        }
        if (vendorSelect.getValue() !== vendor) {
          vendorSelect.setValue(vendor);
        }
        if (nativeSelect.getValue() !== vendor) {
          nativeSelect.setValue(vendor);
        }
      };

      metaMgr.addListener("changeColorScheme", syncHeaderAndSubtitle);
      metaMgr.addListener("changeVendorTheme", syncHeaderAndSubtitle);

      togglesRow.add(chkRemember);
      togglesRow.add(swDarkMode);

      const radioGroup = new ville.ui.form.RadioButtonGroup(
        new ville.ui.layout.HBox(12)
      );
      const rbWeb = new ville.ui.form.RadioButton("Web App", "web");
      rbWeb.setValue(true);
      const rbPwa = new ville.ui.form.RadioButton("Desktop PWA", "pwa");
      radioGroup.add(rbWeb);
      radioGroup.add(rbPwa);

      const registerbutton = new ville.ui.navigation.Anchor(
        "Reset form defaults",
        "button"
      );
      registerbutton.addListener("click", () => form.reset());

      const loginbutton = new ville.ui.form.Button(
        "Validate & Sign In",
        "CHECK"
      );
      loginbutton.setVariant("filled");
      loginbutton.addListener("execute", () => {
        if (form.submit()) {
          loginbutton.setLabel("Valid! Signed In");
        } else {
          loginbutton.setLabel("Check Invalid Fields");
        }
      });

      form.addButton(registerbutton);
      form.addButton(loginbutton);

      const loginForm = new ville.ui.form.renderer.TestRenderer(form);

      /* =====================================================================
       * 3. ASSEMBLE SANDBOX LAYOUT
       * =================================================================== */
      vstack.add(titleH1);
      vstack.add(subtitleText);
      vstack.add(dividerActions);
      vstack.add(actionRow);
      vstack.add(dividerOverlays);
      vstack.add(overlayRow);
      vstack.add(dividerStage6);
      vstack.add(demoToolbar);
      vstack.add(tabView);
      vstack.add(dividerForms);
      vstack.add(togglesRow);
      vstack.add(radioGroup);
      vstack.add(loginForm);

      centerArea.add(vstack);
      mainArea.add(centerArea);

      appShell.add(headerBox);
      appShell.add(mainArea);
    }
  }
});
