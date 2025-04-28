qx.Class.define("twindapp.pages.DetailsPage", {
    extend: qx.ui.tabview.Page,

    construct() {
      super();

      this.setLayout(new qx.ui.layout.Canvas());

      this.getButton().set({ visibility: "excluded" });

      const pagenameroot = "contacts";
      const pageurl = "/";
      const pageName = qx.lang.String.firstUp(pagenameroot);
      const pageNameSingle = pageName.slice(0, -1);

      // Set up the Page
      this.setAppearance("exp-tabview-page");
      this.setLabel(pageName);
      this.addListener("appear", () => {document.title = `${pageName} - Ping CRM Qooxdoo`});
      this.setUserData("pageurl", pageurl);
      this.setExcludeBoundsFromDom(true);
      this.setCssUtilityClass("px-4 py-8 md:flex-1 md:p-12 md:overflow-y-auto");
      this.setCssUtilityStyleClearAll(true);

      // Flash Messages
      var flashMessage = new twindapp.components.FlashMessages();

      // Breadcrumb Links
      var breadcrumbContent = new qx.ui.container.Composite();
      breadcrumbContent.setLayout(new qx.ui.layout.HBox(4).set({alignY: "middle"}));
      breadcrumbContent.getContentElement().setNodeName("h1");
      breadcrumbContent.setCssUtilityClass("mb-8 text-3xl font-bold");
      breadcrumbContent.setExcludeBoundsFromDom(true);
      breadcrumbContent.setCssUtilityStyleClearAll(true);
      var listlink = new twindapp.components.Link(`${pageName} `, null, pageurl, true).set({appearance:"ping-exp-button", cursor: null});
      listlink.setExcludeBoundsFromDom(true);
      listlink.setCssUtilityStyleClearAll(true);
      listlink.setCssUtilityClass("text-indigo-400 hover:text-indigo-600");
      listlink.addListener("click", () => {
        this._parenttabview.setSelection([this._callingpage]);
      });
      var fullName = this._fullname = new qx.ui.embed.Html();
      fullName.getContentElement().setNodeName("span");
      fullName.setExcludeBoundsFromDom(true);
      fullName.setCssUtilityStyleClearAll(true);
      breadcrumbContent.add(listlink);
      breadcrumbContent.add(fullName);
    
      // Form
      // create the form
      var form = this._form = new qx.ui.form.Form();

      // firstname
      var firstname = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield", required : true });
      form.add(firstname, "First name", null, "firstname");

      // lastname
      var lastname = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield", required : true });
      form.add(lastname, "Last name", null, "lastname");

      // email
      var email = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield", required : true });
      form.add(email, "Email", null, "email");

      // organization
      var organization = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield", required : true });
      form.add(organization, "Organization", null, "organization");

      // phone
      var phone = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield" });
      form.add(phone, "Phone", null, "phone");

      // address
      var address = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield" });
      form.add(address, "Address", null, "address");

      // city
      var city = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield" });
      form.add(city, "City", null, "city");

      // state
      var state = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield" });
      form.add(state, "Province/State", null, "state");

      // country
      var country = new qx.ui.form.SelectBox().set({ appearance : "ping-exp-selectbox" });
      var CanadaItem = new qx.ui.form.ListItem("Canada", null, "Canada");
      country.add(CanadaItem);
      var USAItem = new qx.ui.form.ListItem("United States", null, "US");
      country.add(USAItem);
      form.add(country, "Country", null, "country");

      // postal code
      var postalcode = new qx.ui.form.TextField().set({ appearance : "ping-exp-textfield" });
      form.add(postalcode, "Postal code", null, "postalcode");

      // form buttons
      var updateLabeltext = `Update ${pageNameSingle}`;
      var submitbutton = new qx.ui.form.Button(updateLabeltext).set({ appearance: "ping-exp-button" });
      submitbutton.setUserData("updatebuttonlabel", updateLabeltext);
      submitbutton.setUserData("createbuttonlabel", `Create ${pageNameSingle}`);
      submitbutton.setCssUtilityClass("flex items-center btn-indigo ml-auto");
      var deletebutton = new qx.ui.form.Button(`Delete ${pageNameSingle}`).set({ appearance: "ping-exp-button" });
      deletebutton.setCssUtilityClass("text-red-600 hover:underline");
      form.addButton(deletebutton);
      form.addButton(submitbutton);

      submitbutton.addListener("execute", () => {
        if (form.validate()) {
          flashMessage.setVisibility("visible");
        }
      });

      var titleupdatefunc = () => {
        document.title = `${firstname.getValue()} ${lastname.getValue()} - Ping CRM Qooxdoo`;
      };

      firstname.addListener("changeValue", titleupdatefunc);
      lastname.addListener("changeValue", titleupdatefunc);

      // form validator
      var validator = form.getValidationManager();
      validator.add(email, qx.util.Validate.email());

      var detailsForm = new twindapp.form.renderer.DetailsForm(form);
      detailsForm.setCssUtilityClass("max-w-3xl bg-white rounded-md shadow overflow-hidden");
      detailsForm.setExcludeBoundsFromDom(true);
      detailsForm.setCssUtilityStyleClearAll(true);

      // Page Content
      this.add(flashMessage);
      this.add(breadcrumbContent);
      this.add(detailsForm);

      this.addListener("disappear", () => {
        flashMessage.setVisibility("excluded");
      });
    },

    members : {
      _form : null,
      
      _formcontroller : null,

      _fullname : null,

      _callingpage : null,

      _parenttabview : null,

      updateCallWidgets(caller, parenttabview) {
        this._callingpage = caller;
        this._parenttabview = parenttabview;
      },

      processFormModel(data) {
        if (data) {
          this._fullname.setHtml(`/ ${data.name}`);
          var model = qx.data.marshal.Json.createModel(data);
          if (this._formcontroller === null) {
              this._formcontroller = new qx.data.controller.Form(model, this._form);
          } else {
              this._formcontroller.resetModel();
              this._formcontroller.resetTarget();
              this._formcontroller.setTarget(this._form);
              this._formcontroller.setModel(model);
          }
        }
        
      }
    }
  });
