qx.Class.define("twindapp.components.FlashMessages", {
    extend: qx.ui.container.Composite,

    construct() {
        super();
        this.setLayout(new qx.ui.layout.HBox());
        this.setVisibility("excluded");
        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("flex items-center justify-between mb-8 max-w-3xl bg-green-500 rounded");

        var messagelabel = new qx.ui.basic.Label("Contact updated.").set({rich: true, wrap: true});
        messagelabel.setExcludeBoundsFromDom(true);
        messagelabel.setClearAllInlineStyles(true);
        messagelabel.setCssUtilityClass("ml-4 py-4 text-white text-sm font-medium");

        var closeflashmessage = new qx.ui.form.Button("x").set({appearance: "ping-exp-closebutton"});
        closeflashmessage.setCssUtilityClass("group mr-2 p-2");
        closeflashmessage.addListener("execute", () => {this.setVisibility("excluded")});

        // Assemble
        this.add(messagelabel);
        this.add(closeflashmessage);
    }
});
