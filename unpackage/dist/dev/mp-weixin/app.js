"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports[Symbol.toStringTag] = "Module";
var common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/commodity/commodity.js";
  "./pages/order/order.js";
  "./pages/sort-admin/sort.js";
  "./pages/goods_admin/goods_admin.js";
  "./pages/specs/specs.js";
  "./pages/banner-admin/banner.js";
  "./pages/goods_list/list.js";
  "./pages/seckill-admin/seckill.js";
}
const _sfc_main = {
  onLaunch: function() {
    wx.cloud.init({
      env: "roger-5gfvc7v8648f05f2",
      traceUser: true
    });
  },
  onShow: function() {
  },
  onHide: function() {
  }
};
var App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
