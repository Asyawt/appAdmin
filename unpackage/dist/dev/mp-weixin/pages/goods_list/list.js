"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_init = require("../../Acc-config/init.js");
var AccConfig_responseData = require("../../Acc-config/responseData.js");
var AccConfig_media = require("../../Acc-config/media.js");
if (!Math) {
  Loading();
}
const Loading = () => "../../component/loading.js";
const _sfc_main = {
  __name: "list",
  setup(__props) {
    common_vendor.onMounted(() => {
      getGoods();
    });
    common_vendor.onLoad((ids) => {
      sel_ids.selIds = JSON.parse(ids.selId);
    });
    const loading = common_vendor.ref(false);
    const data = common_vendor.reactive({
      list: []
    });
    const sel_ids = common_vendor.reactive({
      selIds: []
    });
    common_vendor.watch(() => data.list, (newval) => {
      sel_ids.selIds.forEach((item) => {
        let index = newval.findIndex((i) => i._id == item);
        if (index >= 0) {
          data.list[index]["relation"] = true;
        }
      });
    }, { immediate: true });
    let obj = { goods_title: true, goods_cover: true, goods_price: true, video_url: true, seckill: true };
    const getGoods = async () => {
      let db = await AccConfig_init.init();
      const res = await db.database().collection("goodsInfo").where({ shelves: true }).limit(10).field(obj).get();
      data.list = res.data;
    };
    let page_n = common_vendor.ref(0);
    common_vendor.onReachBottom(async () => {
      loading.value = true;
      page_n.value++;
      let sk = page_n.value * 10;
      let db = await AccConfig_init.init();
      const res = await db.database().collection("goodsInfo").where({ shelves: true }).limit(10).skip(sk).field(obj).get();
      data.list = [...data.list, ...res.data];
      loading.value = false;
    });
    const selectGood = (goods_title, id, goods_price, video_url, relation) => {
      if (relation) {
        new AccConfig_media.Feedback("\u8BE5\u5546\u54C1\u5DF2\u88AB\u5173\u8054", "none").toast();
      } else {
        AccConfig_responseData.select_goods.value = { goods_title, id, goods_price, video_url };
        wx.navigateBack({ delta: 1 });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(data.list, (item, index, i0) => {
          return {
            a: item.goods_cover,
            b: common_vendor.t(item.goods_title),
            c: item.relation ? "#f2f2f2" : "",
            d: common_vendor.t(item.goods_price),
            e: item.relation ? "#f2f2f2" : "",
            f: index,
            g: common_vendor.o(($event) => selectGood(item.goods_title, item._id, item.goods_price, item.video_url, item.relation), index)
          };
        }),
        b: data.list.length == 0
      }, data.list.length == 0 ? {} : {}, {
        c: loading.value
      }, loading.value ? {} : {});
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-37ce9146"], ["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/goods_list/list.vue"]]);
wx.createPage(MiniProgramPage);
