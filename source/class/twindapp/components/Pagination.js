qx.Class.define("twindapp.components.Pagination", {
    extend: qx.ui.container.Composite,

    construct() {
        super();
        this.setLayout(new qx.ui.layout.Flow(6));
    },

    properties : {

        /** The Statusbartext, set it, if you want some more Information */
        paginationStatusText: {
            check: "String",
            event: "changePaginationStatusText",
            nullable: true
          }

    },

    members : {
        updatePaginationModel(target) {
            if (target.links) {
                this.removeAll();
                this.setPaginationStatusText("");
                if (target.links.length > 3) {
                    var links = target.links;
                    var statustxt = ` (from: ${target.from} to: ${target.to} total: ${target.total})`;
                    this.setPaginationStatusText(statustxt);
                    for (let i = 0; i < links.length; i++) {
                        var button = new twindapp.components.Link(links[i].label, null, links[i].url).set({rich: true, appearance: "ping-exp-button", cursor: null});
                        button.setExcludeBoundsFromDom(true); //ExcludeBoundsFromDom 
                        button.setCssUtilityStyleClearAll(true);
                        if (links[i].active) {
                            button.setValue(links[i].active);
                            button.setCssUtilityClass("mb-1 mr-1 px-4 py-3 focus:text-indigo-500 text-sm leading-4 hover:bg-white border focus:border-indigo-500 rounded bg-white");
                        } else {
                            button.setCssUtilityClass("mb-1 mr-1 px-4 py-3 focus:text-indigo-500 text-sm leading-4 hover:bg-white border focus:border-indigo-500 rounded");
                        }
                        var btnlabel = button.getChildControl("label");
                        btnlabel.setExcludeBoundsFromDom(true);
                        btnlabel.setCssUtilityStyleClearAll(true);
                        //btnlabel.setCssUtilityClass("form-label");
                        if (!links[i].active && links[i].url) {
                            button.addListener("execute", () => {
                                console.log("getting next set of contacts");
                            }, this);
                        }
                        if (!links[i].url) {
                            button.setEnabled(false);
                            button.setCursor("default");
                            button.setCssUtilityClass("mb-1 mr-1 px-4 py-3 focus:text-indigo-500 text-sm leading-4 border focus:border-indigo-500 rounded");
                        }  

                        this.add(button);
                    }
                }
            }
        }
    }
});
