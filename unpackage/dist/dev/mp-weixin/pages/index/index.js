"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_init = require("../../Acc-config/init.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const btn_data = common_vendor.reactive({
      btnTop: 0,
      btnHeight: 0,
      tops: 0,
      profit_top: 0,
      plate: [
        {
          image: "/static/detail/hengfu.svg",
          name: "\u6A2A\u5E45\u7BA1\u7406"
        },
        {
          image: "/static/detail/miaosha.svg",
          name: "\u79D2\u6740\u7BA1\u7406"
        },
        {
          image: "/static/detail/shangpin.svg",
          name: "\u5546\u54C1\u7BA1\u7406"
        },
        {
          image: "/static/detail/dingdan.svg",
          name: "\u8BA2\u5355\u7BA1\u7406"
        },
        {
          image: "/static/detail/fenlei.svg",
          name: "\u5206\u7C7B\u7BA1\u7406"
        }
      ]
    });
    common_vendor.onMounted(() => {
      setBtnInfo();
      proFit();
      count();
    });
    const btnInfo = wx.getMenuButtonBoundingClientRect();
    const setBtnInfo = () => {
      btn_data.btnTop = btnInfo.top;
      btn_data.btnHeight = btnInfo.height;
      btn_data.tops = btnInfo.top + btnInfo.height + 20;
    };
    function proFit() {
      const query = wx.createSelectorQuery();
      query.select(".profit-view").boundingClientRect();
      query.exec((res2) => {
        btn_data.profit_top = res2[0].height + btn_data.tops + 10;
      });
    }
    const gotoPage = (index) => {
      switch (index) {
        case 0:
          wx.navigateTo({ url: "/pages/banner-admin/banner" });
          break;
        case 1:
          wx.navigateTo({ url: "/pages/seckill-admin/seckill" });
          break;
        case 2:
          wx.switchTab({ url: "/pages/commodity/commodity" });
          break;
        case 3:
          wx.switchTab({ url: "/pages/order/order" });
          break;
        case 4:
          wx.navigateTo({ url: "/pages/sort-admin/sort" });
      }
    };
    const res = common_vendor.reactive({ profit: "0.00", sales: "0.00", orders: 0, com_order: 0 });
    const { profit, sales, orders, com_order } = common_vendor.toRefs(res);
    async function count() {
      let dbs = await AccConfig_init.init();
      const bases = dbs.database();
      const $ = bases.command.aggregate;
      const profits = await bases.collection("order_data").aggregate().group({
        _id: null,
        totalPrice: $.sum("$subtotal")
      }).end();
      let query_time = common_vendor.hooks().utcOffset(8).format("YYYY-MM-DD");
      const sales2 = await bases.collection("order_data").aggregate().match({ query_time }).group({
        _id: null,
        totalPrice: $.sum("$subtotal")
      }).end();
      const Orders = await bases.collection("order_data").where({ query_time }).count();
      const allOrders = await bases.collection("order_data").count();
      Promise.all([profits, sales2, Orders, allOrders]).then((allres) => {
        res.profit = allres[0].list[0].totalPrice == 0 ? "0.00" : profits.list[0].totalPrice;
        if (allres[1].list[0]) {
          res.sales = allres[1].list[0].totalPrice == 0 ? "0.00" : sales2.list[0].totalPrice;
        }
        res.orders = allres[2].total;
        res.com_order = allres[3].total;
      });
      wx.stopPullDownRefresh();
    }
    common_vendor.onPullDownRefresh(() => {
      count();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.s("height:" + btn_data.btnTop + "px"),
        b: btn_data.btnHeight + "px",
        c: 10 + "px",
        d: common_vendor.t(common_vendor.unref(profit)),
        e: common_vendor.t(common_vendor.unref(sales)),
        f: common_vendor.t(common_vendor.unref(orders)),
        g: common_vendor.t(common_vendor.unref(com_order)),
        h: btn_data.tops + "px",
        i: common_vendor.f(btn_data.plate, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.name),
            c: index,
            d: common_vendor.o(($event) => gotoPage(index), index)
          };
        }),
        j: btn_data.profit_top + "px"
      };
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
