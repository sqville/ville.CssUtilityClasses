qx.Class.define("ville.ui.icon.CheckBoxIcon", {
    extend: ville.ui.icon.Abstract,

    construct(size) {

        super(size);
        
        // set SVG attributes
        var iconelem = this.getContentElement();
        iconelem.setAttributes({
            "viewBox" : "0 0 10 7",
            "fill" : "none",
            "aria-hidden" : "true",
            "class" : "m_bf295423 mantine-Checkbox-icon"
        });

        // Single path tag
        var path = new qx.html.Element("path", null, {
            "fill" : "currentColor", 
            "fill-rule" : "evenodd",
            "clip-rule" : "evenodd",
            "d" : "M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z"
        });

        iconelem.add(path);
    }
  });
