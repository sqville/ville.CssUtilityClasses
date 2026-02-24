/**
 * Native Css Section
 */
qx.Class.define("villeui.NativeCss", {
    
    extend: ville.ui.layout.Container,

    construct() {

        super();

        this.setStyles({"--container-size": "calc(90rem * var(--mantine-scale))"});
        this.setAttributes({"data-strategy": "block"});

        var mainNativeFeatures = new ville.ui.layout.SimpleGrid();
        mainNativeFeatures.addClass("__m__-r14h");
        this.add(mainNativeFeatures);

        // Feature list
        var mainNativeFeatureList = new ville.ui.layout.VStack();
        var Feature01 = new ville.ui.typography.Title(3);
        Feature01.setStyles({
            "--title-fw": "var(--mantine-h3-font-weight)",
            "--title-lh": "var(--mantine-h3-line-height)",
            "--title-fz": "var(--mantine-h3-font-size)"
        });
        Feature01.setAttribute("html", "&#9874; Built with CSS");
        var Feature02 = new ville.ui.typography.Title(3);
        Feature02.setStyles({
            "--title-fw": "var(--mantine-h3-font-weight)",
            "--title-lh": "var(--mantine-h3-line-height)",
            "--title-fz": "var(--mantine-h3-font-size)"
        });
        Feature02.setAttribute("html", "&#9775; Extends only core widgets");
        var Feature03 = new ville.ui.typography.Title(3);
        Feature03.setStyles({
            "--title-fw": "var(--mantine-h3-font-weight)",
            "--title-lh": "var(--mantine-h3-line-height)",
            "--title-fz": "var(--mantine-h3-font-size)"
        });
        Feature03.setAttribute("html", "&#10042; Override anything");
        mainNativeFeatureList.add(Feature01);
        var Feature01Desc = new ville.ui.typography.Text("Styles are exposed as .css files – styles are performant and do not have any runtime overhead.");
        mainNativeFeatureList.add(Feature01Desc);
        mainNativeFeatureList.add(Feature02);
        var Feature02Desc = new ville.ui.typography.Text("All Ville UI widgets either directly extend complex widgets (i.e. qx.ui.form.Button) or Qooxdoo's core widget (qx.ui.core.Widget). Everything is a Qooxdoo widget.");
        mainNativeFeatureList.add(Feature02Desc);
        mainNativeFeatureList.add(Feature03);
        var Feature03Desc = new ville.ui.typography.Text("All component styles can be overriden with inline styles. All Ville UI widgets expose Content Element functions such as setStyles and addClass (among others) for simple and direct changes as needed.");
        mainNativeFeatureList.add(Feature03Desc);
        mainNativeFeatures.add(mainNativeFeatureList);

        // Reference code (image)
        var imgCodeBox = new ville.ui.core.Box();
        imgCodeBox.setCssUtilityClass("HomePageSponsors_sponsor__c9Sun");
        var imgExample01 = new ville.ui.basic.Image();
        imgExample01.setAttributes({
            "src": "resource/villeui/images/QxCSS_example_01.png",
            "alt": "Ville UI code example 01"
        }, true);
        imgCodeBox.add(imgExample01)
        mainNativeFeatures.add(imgCodeBox);
        /*imgExample01.setStyles({
            "width": "32px",
            "height": "32px"
        });*/

    }

});