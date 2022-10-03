"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_init = require("../../Acc-config/init.js");
var AccConfig_media = require("../../Acc-config/media.js");
var AccConfig_responseData = require("../../Acc-config/responseData.js");
const _sfc_main = {
  __name: "banner",
  setup(__props) {
    const show = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      getBanner();
    });
    common_vendor.watch(AccConfig_responseData.select_goods, (newval) => {
      data.re_goods.title = newval.goods_title;
      data.re_goods.goods_id = newval.id;
      data.re_goods.video_url = newval.video_url;
    });
    const data = common_vendor.reactive({
      banner_data: [],
      banner_cover: "",
      re_goods: {
        title: "",
        goods_id: "",
        video_url: ""
      }
    });
    const load = common_vendor.ref(true);
    let acc = true;
    common_vendor.watch(() => data.banner_data, () => {
      if (acc) {
        load.value = false;
        acc = false;
      }
    });
    const { banner_data, banner_cover, re_goods } = common_vendor.toRefs(data);
    const getBanner = async () => {
      let db = await AccConfig_init.init();
      let res = await db.database().collection("banner").get();
      data.banner_data = res.data;
    };
    const upImg = async () => {
      const local = await new AccConfig_media.Uploads().upLoadImgorVideo(1);
      wx.showLoading({ title: "\u6B63\u5728\u4E0A\u4F20", mask: true });
      const res = await new AccConfig_media.Uploads().uploadCloud(local[0].tempFilePath);
      data.banner_cover = res;
      wx.hideLoading();
    };
    const addTo = () => {
      const sel_id = data.banner_data.map((item) => item.goods_id);
      wx.navigateTo({
        url: "/pages/goods_list/list?selId=" + JSON.stringify(sel_id)
      });
    };
    const submitCloud = () => {
      switch (true) {
        case data.banner_cover == "":
          new AccConfig_media.Feedback("\u8BF7\u4E0A\u4F20\u5C01\u9762\u56FE").toast();
          break;
        case data.re_goods.title == "":
          new AccConfig_media.Feedback("\u8BF7\u5173\u8054\u4E00\u4E2A\u5546\u54C1").toast();
          break;
        default:
          subData();
      }
    };
    const subData = async () => {
      wx.showLoading({ title: "\u6B63\u5728\u63D0\u4EA4", mask: true });
      let obj = { banner_cover: data.banner_cover, goods_id: data.re_goods.goods_id, video_url: data.re_goods.video_url };
      try {
        let db = await AccConfig_init.init();
        await db.database().collection("banner").add({ data: obj });
        show.value = false;
        data.banner_cover = "";
        data.re_goods.title = "";
        wx.hideLoading();
        getBanner();
      } catch (e) {
        new AccConfig_media.Feedback("\u63D0\u4EA4\u5931\u8D25").toast();
      }
    };
    const deleteGoods = async (id, index) => {
      try {
        let db = await AccConfig_init.init();
        await db.database().collection("banner").doc(id).remove();
        data.banner_data.splice(index, 1);
        new AccConfig_media.Feedback("\u5220\u9664\u6210\u529F", "success").toast();
      } catch (e) {
        new AccConfig_media.Feedback("\u5220\u9664\u5931\u8D25").toast();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(banner_data).length > 0
      }, common_vendor.unref(banner_data).length > 0 ? {} : {}, {
        b: common_vendor.f(common_vendor.unref(banner_data), (item, index, i0) => {
          return {
            a: item.banner_cover,
            b: common_vendor.o(($event) => deleteGoods(item._id, index)),
            c: index
          };
        }),
        c: common_vendor.unref(banner_data).length == 0
      }, common_vendor.unref(banner_data).length == 0 ? common_vendor.e({
        d: load.value
      }, load.value ? {} : {}) : {}, {
        e: common_vendor.o(($event) => show.value = true),
        f: common_vendor.o(($event) => show.value = false),
        g: common_vendor.o(submitCloud),
        h: common_vendor.unref(banner_cover) == ""
      }, common_vendor.unref(banner_cover) == "" ? {
        i: common_vendor.o(upImg)
      } : {}, {
        j: common_vendor.unref(banner_cover),
        k: common_vendor.unref(banner_cover) != ""
      }, common_vendor.unref(banner_cover) != "" ? {
        l: common_vendor.o(($event) => banner_cover.value = "")
      } : {}, {
        m: common_vendor.t(common_vendor.unref(re_goods).title == "" ? "\u6DFB\u52A0" : common_vendor.unref(re_goods).title),
        n: common_vendor.o(addTo),
        o: show.value
      });
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-88d354f8"], ["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/banner-admin/banner.vue"]]);
wx.createPage(MiniProgramPage);
