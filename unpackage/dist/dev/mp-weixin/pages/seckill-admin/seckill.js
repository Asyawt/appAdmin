"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_init = require("../../Acc-config/init.js");
var AccConfig_media = require("../../Acc-config/media.js");
var AccConfig_date = require("../../Acc-config/date.js");
var AccConfig_caTime = require("../../Acc-config/ca-time.js");
var AccConfig_responseData = require("../../Acc-config/responseData.js");
const _sfc_main = {
  __name: "seckill",
  setup(__props) {
    const internalInstance = common_vendor.getCurrentInstance();
    const ress = internalInstance.appContext.config.globalProperties;
    console.log(ress);
    common_vendor.hooks.locale("zh-cn");
    AccConfig_caTime.current();
    common_vendor.onMounted(() => {
      getSeckillData();
    });
    let show = common_vendor.ref(false);
    const data = common_vendor.reactive({
      seckill_goods: []
    });
    const load = common_vendor.ref(true);
    let acc = true;
    common_vendor.watch(() => data.seckill_goods, () => {
      if (acc) {
        load.value = false;
        acc = false;
      }
    });
    const getSeckillData = async () => {
      let db = await AccConfig_init.init();
      const res = await db.database().collection("seckill").get();
      data.seckill_goods = res.data;
    };
    const Time = common_vendor.reactive({
      multiArray: AccConfig_date.date,
      multiIndex: [0, 0, 0, 0, 0],
      se_cover: "",
      se_title: "",
      se_price: "",
      startTime: "",
      endTime: "",
      re_goods: {
        title: "",
        goods_id: "",
        video_url: "",
        ori_price: ""
      },
      selDate: [{ "year": AccConfig_date.date[0][0].time, "month": AccConfig_date.date[1][0].time }],
      ban: false
    });
    const upImg = async () => {
      const local = await new AccConfig_media.Uploads().upLoadImgorVideo();
      wx.showLoading({ title: "\u6B63\u5728\u4E0A\u4F20", mask: true });
      const res = await new AccConfig_media.Uploads().uploadCloud(local[0].tempFilePath);
      Time.se_cover = res;
      wx.hideLoading();
    };
    const colStartAndEnd = (e) => {
      const res = e.detail;
      curNewDays(res);
    };
    const col = common_vendor.reactive({
      cols: 0
    });
    const curNewDays = (res) => {
      if (res.column == 0) {
        Time.selDate[0].year = AccConfig_date.date[res.column][res.value].time;
        AccConfig_caTime.selmonthanddays(Time.selDate);
        Time.selDate[0].month = AccConfig_date.date[1][col.cols].time;
        AccConfig_caTime.selDays(Time.selDate);
      } else if (res.column == 1) {
        Time.selDate[0].month = AccConfig_date.date[res.column][res.value].time;
        if (res.value > 12 - AccConfig_caTime.c_month) {
          col.cols = 0;
        } else {
          col.cols = res.value;
        }
        AccConfig_caTime.selDays(Time.selDate);
      }
    };
    const saveTime = (e, val) => {
      const RES = e.detail.value;
      subConfirm(RES, val);
    };
    const subConfirm = (RES, val) => {
      const year = AccConfig_date.date[0][RES[0]].time;
      const month = AccConfig_date.date[1][RES[1]].time;
      const day = AccConfig_date.date[2][RES[2]].time;
      const hour = AccConfig_date.date[3][RES[3]].time;
      const min = AccConfig_date.date[4][RES[4]].time;
      const sel_res = year + "/" + month + "/" + day + "  " + hour + ":" + min;
      if (val == "start") {
        Time.startTime = sel_res;
      } else {
        Time.endTime = sel_res;
      }
    };
    common_vendor.watch([() => Time.startTime, () => Time.endTime], (newval, oldval) => {
      if (newval[0] != "" && newval[1] != "") {
        const start = common_vendor.hooks(newval[0], "YYYY/MM/DD hh:mm:ss").unix();
        const end = common_vendor.hooks(newval[1], "YYYY/MM/DD hh:mm:ss").unix();
        if (start >= end) {
          Time.endTime = "\u7ED3\u675F\u65F6\u95F4\u65E9\u4E8E\u5F00\u59CB\u65F6\u95F4";
          Time.ban = false;
        } else if (start < end) {
          Time.ban = true;
        }
      }
    });
    const addGoods = () => {
      const sel_id = data.seckill_goods.map((item) => item.goods_id);
      wx.navigateTo({
        url: "/pages/goods_list/list?selId=" + JSON.stringify(sel_id)
      });
    };
    common_vendor.watch(AccConfig_responseData.select_goods, (newval) => {
      Time.re_goods.title = newval.goods_title;
      Time.re_goods.goods_id = newval.id;
      Time.re_goods.video_url = newval.video_url;
      Time.re_goods.ori_price = newval.goods_price;
    });
    const submit = () => {
      switch (true) {
        case Time.se_cover == "":
          new AccConfig_media.Feedback("\u8BF7\u4E0A\u4F20\u5C01\u9762\u56FE", "none").toast();
          break;
        case Time.se_title == "":
          new AccConfig_media.Feedback("\u8BF7\u8F93\u5165\u6807\u9898", "none").toast();
          break;
        case Time.se_price == "":
          new AccConfig_media.Feedback("\u8BF7\u8F93\u5165\u79D2\u6740\u4EF7", "none").toast();
          break;
        case (Time.startTime == "" || Time.endTime == ""):
          new AccConfig_media.Feedback("\u8BF7\u8BBE\u7F6E\u79D2\u6740\u65F6\u95F4", "none").toast();
          break;
        case Time.ban == false:
          new AccConfig_media.Feedback("\u7ED3\u675F\u7684\u65F6\u95F4\u65E9\u4E8E\u5F00\u59CB\u65F6\u95F4", "none").toast();
          break;
        case Time.re_goods.title == "":
          new AccConfig_media.Feedback("\u8BF7\u5173\u8054\u4E00\u4E2A\u5546\u54C1", "none").toast();
          break;
        default:
          database();
      }
    };
    const database = async () => {
      wx.showLoading({ title: "\u6B63\u5728\u63D0\u4EA4", mask: true });
      const start_time = common_vendor.hooks(Time.startTime, "YYYY/MM/DD hh:mm:ss").unix();
      const end_time = common_vendor.hooks(Time.endTime, "YYYY/MM/DD hh:mm:ss").unix();
      let obj = {
        cover: Time.se_cover,
        title: Time.se_title,
        ori_price: Time.re_goods.ori_price,
        price_spike: Number(Time.se_price),
        seckill_time: { start_time, end_time },
        goods_id: Time.re_goods.goods_id,
        video_url: Time.re_goods.video_url
      };
      try {
        let db = await AccConfig_init.init();
        await db.database().collection("seckill").add({ data: obj });
        await db.database().collection("goodsInfo").doc(Time.re_goods.goods_id).update({ data: { seckill: true } });
        show.value = false;
        getSeckillData();
        new AccConfig_media.Feedback("\u63D0\u4EA4\u6210\u529F", "success").toast();
        Time.se_cover = "";
        Time.se_title = "";
        Time.se_price = "";
        Time.startTime = "";
        Time.endTime = "";
        Time.re_goods.title = "";
      } catch (e) {
        console.log(e);
        new AccConfig_media.Feedback("\u63D0\u4EA4\u5931\u8D25").toast();
      }
    };
    const Delete = async (id, index) => {
      try {
        let db = await AccConfig_init.init();
        await db.database().collection("seckill").doc(id).remove();
        data.seckill_goods.splice(index, 1);
        new AccConfig_media.Feedback("\u5220\u9664\u6210\u529F", "success").toast();
      } catch (e) {
        new AccConfig_media.Feedback("\u5220\u9664\u5931\u8D25").toast();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: data.seckill_goods.length > 0
      }, data.seckill_goods.length > 0 ? {} : {}, {
        b: common_vendor.f(data.seckill_goods, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.o(($event) => Delete(item._id, index)),
            d: index
          };
        }),
        c: data.seckill_goods.length == 0
      }, data.seckill_goods.length == 0 ? common_vendor.e({
        d: load.value
      }, load.value ? {} : {}) : {}, {
        e: common_vendor.o(($event) => common_vendor.isRef(show) ? show.value = true : show = true),
        f: common_vendor.o(($event) => common_vendor.isRef(show) ? show.value = false : show = false),
        g: common_vendor.o(submit),
        h: Time.se_cover == ""
      }, Time.se_cover == "" ? {
        i: common_vendor.o(upImg)
      } : {}, {
        j: Time.se_cover,
        k: Time.se_cover != ""
      }, Time.se_cover != "" ? {
        l: common_vendor.o(($event) => Time.se_cover = "")
      } : {}, {
        m: Time.se_title,
        n: common_vendor.o(($event) => Time.se_title = $event.detail.value),
        o: Time.se_price,
        p: common_vendor.o(($event) => Time.se_price = $event.detail.value),
        q: common_vendor.t(Time.startTime),
        r: common_vendor.o(($event) => saveTime($event, "start")),
        s: common_vendor.o(colStartAndEnd),
        t: Time.multiArray,
        v: Time.multiIndex,
        w: common_vendor.t(Time.endTime),
        x: common_vendor.o(($event) => saveTime($event, "end")),
        y: common_vendor.o(colStartAndEnd),
        z: Time.multiArray,
        A: Time.multiIndex,
        B: common_vendor.t(Time.re_goods.title == "" ? "\u6DFB\u52A0" : Time.re_goods.title),
        C: common_vendor.o(addGoods),
        D: common_vendor.unref(show)
      });
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5d76df28"], ["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/seckill-admin/seckill.vue"]]);
wx.createPage(MiniProgramPage);
