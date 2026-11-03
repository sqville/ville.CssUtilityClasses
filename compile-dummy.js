qx.Class.define("myapp.compile.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    async load() {
      let data = await this.base(arguments);
      return data;
    }
  }
});

module.exports = {
  CompilerApi: myapp.compile.CompilerApi
};