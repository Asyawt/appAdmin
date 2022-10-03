"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_responseData = require("../../Acc-config/responseData.js");
var AccConfig_media = require("../../Acc-config/media.js");
var AccConfig_init = require("../../Acc-config/init.js");
const _sfc_main = {
  __name: "goods_admin",
  setup(__props) {
    const toSpecs = () => {
      wx.navigateTo({
        url: "/pages/specs/specs?sku=" + JSON.stringify(formatData.specs_data)
      });
    };
    const priceAndStock = common_vendor.reactive({ price: "", stock: "" });
    const { price, stock } = common_vendor.toRefs(priceAndStock);
    const formatData = common_vendor.reactive({ specs_data: [] });
    common_vendor.watch(AccConfig_responseData.sku_val, (newval, oldval) => {
      formatData.specs_data = newval;
      const sortPrice = newval.sort((a, b) => {
        return a.price - b.price;
      });
      priceAndStock.price = sortPrice[0].price;
      const allStock = newval.reduce((prep, item) => {
        prep += item.stock;
        return prep;
      }, 0);
      priceAndStock.stock = allStock;
    });
    const cover = common_vendor.reactive({ goods_title: "", sto_image: [] });
    const upLoadImg = async () => {
      const local = await new AccConfig_media.Uploads().upLoadImgorVideo(9);
      local.forEach((item) => {
        cover.sto_image.push({ image: item.tempFilePath });
      });
    };
    const deleteImg = (index) => {
      cover.sto_image.splice(index, 1);
    };
    const previewImg = (img) => {
      let arr = [];
      cover.sto_image.forEach((item) => {
        arr.push(item.image);
      });
      new AccConfig_media.Uploads().previewImg(img, arr);
    };
    const video = common_vendor.reactive({ sto_video: "" });
    const upLoadVideo = async () => {
      const local = await new AccConfig_media.Uploads().upLoadImgorVideo(1, "video");
      video.sto_video = local[0].tempFilePath;
    };
    common_vendor.onMounted(async () => {
      let db = await AccConfig_init.init();
      const res = await db.database().collection("goods_sort").field({ _openid: false }).get();
      sortData.sortArr = res.data;
    });
    const sortData = common_vendor.reactive({
      sortArr: [],
      selectSortVal: "",
      selectSortId: ""
    });
    const { sortArr, selectSortVal } = common_vendor.toRefs(sortData);
    const selectSort = (e) => {
      sortData.selectSortVal = sortData.sortArr[e.detail.value].sort_name;
      sortData.selectSortId = sortData.sortArr[e.detail.value]._id;
    };
    const detail = common_vendor.reactive({
      sto_detail: []
    });
    const upLoadDetail = async () => {
      const local = await new AccConfig_media.Uploads().upLoadImgorVideo(9);
      local.forEach((item) => {
        detail.sto_detail.push({ image: item.tempFilePath });
      });
    };
    const delImg = (index) => {
      detail.sto_detail.splice(index, 1);
    };
    const previewDetail = (img) => {
      let arr = [];
      detail.sto_detail.forEach((item) => {
        arr.push(item.image);
      });
      new AccConfig_media.Uploads().previewImg(img, arr);
    };
    const submit = () => {
      switch (true) {
        case cover.goods_title == "":
          new AccConfig_media.Feedback("\u8BF7\u586B\u5199\u6807\u9898").toast();
          break;
        case cover.sto_image.length == 0:
          new AccConfig_media.Feedback("\u8BF7\u4E0A\u4F20\u5546\u54C1\u56FE\u7247").toast();
          break;
        case sortData.selectSortVal == "":
          new AccConfig_media.Feedback("\u8BF7\u9009\u62E9\u5206\u7C7B").toast();
          break;
        case priceAndStock.price == "":
          new AccConfig_media.Feedback("\u8BF7\u8F93\u5165\u4EF7\u683C").toast();
          break;
        case priceAndStock.stock == "":
          new AccConfig_media.Feedback("\u8BF7\u8F93\u5165\u5E93\u5B58").toast();
          break;
        case detail.sto_detail.length == 0:
          new AccConfig_media.Feedback("\u8BF7\u4E0A\u4F20\u8BE6\u60C5\u56FE").toast();
          break;
        default:
          database();
      }
    };
    const database = async () => {
      wx.showLoading({ title: "\u52A0\u8F7D\u4E2D", mask: true });
      const res_banner = await new AccConfig_media.Uploads().allUpload(cover.sto_image, "image");
      const res_detail = await new AccConfig_media.Uploads().allUpload(detail.sto_detail, "image");
      const res_video = video.sto_video == "" ? "" : await new AccConfig_media.Uploads().uploadCloud(video.sto_video);
      let obj = {
        goods_title: cover.goods_title,
        goods_banner: res_banner,
        goods_cover: res_banner[0].image,
        video_url: res_video,
        category: sortData.selectSortVal,
        goods_price: Number(priceAndStock.price),
        stock: Number(priceAndStock.stock),
        sku: formatData.specs_data.length == 0 ? false : true,
        goods_details: res_detail,
        sold: 0,
        shelves: true,
        seckill: false
      };
      try {
        let db = await AccConfig_init.init();
        const res = await db.database().collection("goodsInfo").add({ data: obj });
        if (formatData.specs_data.length > 0) {
          await db.database().collection("skuInfo").add({ data: {
            sku_id: res._id,
            sku: formatData.specs_data
          } });
        }
        const _ = db.database().command;
        await db.database().collection("goods_sort").doc(sortData.selectSortId).update({ data: {
          quantity: _.inc(1)
        } });
        new AccConfig_media.Feedback("\u4E0A\u4F20\u6210\u529F", "success").toast();
        cover.goods_title = "";
        cover.sto_image = [];
        priceAndStock.price = "";
        priceAndStock.stock = "";
        detail.sto_detail = [];
      } catch (e) {
        new AccConfig_media.Feedback("\u63D0\u4EA4\u5931\u8D25").toast();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: cover.goods_title,
        b: common_vendor.o(($event) => cover.goods_title = $event.detail.value),
        c: cover.sto_image.length > 0
      }, cover.sto_image.length > 0 ? {
        d: common_vendor.f(cover.sto_image, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.o(($event) => previewImg(item.image)),
            c: common_vendor.o(($event) => deleteImg(index)),
            d: index
          };
        })
      } : {}, {
        e: common_vendor.o(upLoadImg),
        f: video.sto_video != ""
      }, video.sto_video != "" ? {
        g: common_vendor.o(($event) => video.sto_video = "")
      } : {}, {
        h: video.sto_video == ""
      }, video.sto_video == "" ? {
        i: common_vendor.o(upLoadVideo)
      } : {}, {
        j: video.sto_video != ""
      }, video.sto_video != "" ? {
        k: video.sto_video
      } : {}, {
        l: common_vendor.t(common_vendor.unref(selectSortVal)),
        m: common_vendor.o(selectSort),
        n: common_vendor.unref(sortArr),
        o: formatData.specs_data.length == 0 ? false : true,
        p: common_vendor.unref(price),
        q: common_vendor.o(($event) => common_vendor.isRef(price) ? price.value = $event.detail.value : null),
        r: formatData.specs_data.length == 0 ? false : true,
        s: common_vendor.unref(stock),
        t: common_vendor.o(($event) => common_vendor.isRef(stock) ? stock.value = $event.detail.value : null),
        v: formatData.specs_data.length == 0
      }, formatData.specs_data.length == 0 ? {} : {
        w: common_vendor.f(formatData.specs_data, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.f(item.att_data, (i, indexs, i1) => {
              return {
                a: common_vendor.t(i.att_val),
                b: indexs
              };
            }),
            c: common_vendor.t(item.stock),
            d: common_vendor.t(item.price),
            e: index
          };
        })
      }, {
        x: common_vendor.o(toSpecs),
        y: detail.sto_detail.length > 0
      }, detail.sto_detail.length > 0 ? {
        z: common_vendor.f(detail.sto_detail, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.o(($event) => previewDetail(item.image)),
            c: common_vendor.o(($event) => delImg(index)),
            d: index
          };
        })
      } : {}, {
        A: common_vendor.o(upLoadDetail),
        B: common_vendor.o(submit)
      });
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/goods_admin/goods_admin.vue"]]);
wx.createPage(MiniProgramPage);
