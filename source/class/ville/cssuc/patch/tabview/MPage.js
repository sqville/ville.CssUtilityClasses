qx.Mixin.define("ville.cssuc.patch.tabview.MPage", {
  
  members: {

    _onBtnChangeValue(e) {
      const val = e.getData();
      this.getContentElement().setAttribute("aria-expanded", val, true); // Set third argument to true -> direct Update
      this.getButton().getContentElement().setAttribute("aria-selected", val);
      if (val)
        this.getButton().getContentElement().setAttribute("data-active", val, true);
      else
        this.getButton().getContentElement().removeAttribute("data-active", true);
    }

  }
});
