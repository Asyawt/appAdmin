"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_init = require("../../Acc-config/init.js");
var AccConfig_media = require("../../Acc-config/media.js");
if (!Math) {
  Loading();
}
const Loading = () => "../../component/loading.js";
const _sfc_main = {
  __name: "commodity",
  setup(__props) {
    common_vendor.onShow(() => {
      getGoodsInfo();
    });
    const data = common_vendor.reactive({
      sorts: [],
      goods: [],
      sort_name: "",
      sort_id: "",
      num: 0
    });
    const { sorts, goods, num } = common_vendor.toRefs(data);
    const fieldobj = { goods_title: true, goods_cover: true, goods_price: true, stock: true, shelves: true };
    const getGoodsInfo = async () => {
      let db = await AccConfig_init.init();
      const _ = db.database().command;
      const goods_sort = await db.database().collection("goods_sort").where({ quantity: _.gt(0) }).field({ sort_name: true }).get();
      const sort_goods = await db.database().collection("goodsInfo").where({ category: goods_sort.data[0].sort_name }).limit(10).field(fieldobj).get();
      data.sorts = goods_sort.data;
      data.sorts = goods_sort.data;
      data.goods = sort_goods.data;
      data.sort_name = goods_sort.data[0].sort_name;
      data.sort_id = goods_sort.data[0]._id;
      data.num = 0;
      page_n.value = 0;
    };
    const select = async (index, sort_name, id) => {
      page_n.value = 0;
      data.num = index;
      data.sort_name = sort_name;
      data.sort_id = id;
      let db = await AccConfig_init.init();
      const sort_goods = await db.database().collection("goodsInfo").where({ category: sort_name }).limit(10).field(fieldobj).get();
      data.goods = sort_goods.data;
    };
    const getOffGoods = async (id, index) => {
      try {
        let db = await AccConfig_init.init();
        await db.database().collection("goodsInfo").doc(id).update({ data: { shelves: false } });
        data.goods[index].shelves = false;
        const _ = db.database().command;
        await db.database().collection("goods_sort").doc(data.sort_id).update({ data: { quantity: _.inc(-1) } });
      } catch (e) {
        new AccConfig_media.Feedback("\u4E0B\u67B6\u5931\u8D25").toast();
      }
    };
    let showLoading = common_vendor.ref(false);
    let page_n = common_vendor.ref(0);
    common_vendor.onReachBottom(async () => {
      showLoading.value = true;
      page_n.value++;
      let sk = page_n.value * 10;
      let db = await AccConfig_init.init();
      const res = await db.database().collection("goodsInfo").where({ category: data.sort_name }).limit(10).skip(sk).field(fieldobj).get();
      data.goods = [...data.goods, ...res.data];
      showLoading.value = false;
    });
    function toRootSort() {
      wx.navigateTo({
        url: "/pages/sort-admin/sort"
      });
    }
    function toRootGoods() {
      wx.navigateTo({
        url: "/pages/goods_admin/goods_admin"
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(common_vendor.unref(sorts), (item, index, i0) => {
          return {
            a: common_vendor.t(item.sort_name),
            b: common_vendor.o(($event) => select(index, item.sort_name, item._id), index),
            c: index == common_vendor.unref(num) ? 1 : "",
            d: index
          };
        }),
        b: common_vendor.f(common_vendor.unref(goods), (item, index, i0) => {
          return common_vendor.e({
            a: item.goods_cover,
            b: common_vendor.t(item.goods_title),
            c: common_vendor.t(item.stock),
            d: common_vendor.t(item.goods_price),
            e: item.shelves
          }, item.shelves ? {
            f: common_vendor.o(($event) => getOffGoods(item._id, index))
          } : {}, {
            g: index
          });
        }),
        c: common_vendor.unref(showLoading)
      }, common_vendor.unref(showLoading) ? {} : {}, {
        d: common_vendor.o(toRootSort),
        e: common_vendor.o(toRootGoods)
      });
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-24105262"], ["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/commodity/commodity.vue"]]);
wx.createPage(MiniProgramPage);
