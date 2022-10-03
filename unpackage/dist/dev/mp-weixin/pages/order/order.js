"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_init = require("../../Acc-config/init.js");
var AccConfig_media = require("../../Acc-config/media.js");
if (!Math) {
  Loading();
}
const Loading = () => "../../component/loading.js";
const _sfc_main = {
  __name: "order",
  setup(__props) {
    const data = common_vendor.reactive({
      tab: [
        {
          name: "\u5F85\u4ED8\u6B3E",
          query: { pay_success: "not_pay" }
        },
        {
          name: "\u5F85\u53D1\u8D27",
          query: { pay_success: "success", deliver: "stay" }
        },
        {
          name: "\u5DF2\u53D1\u8D27",
          query: { pay_success: "success", deliver: "already" }
        },
        {
          name: "\u9000\u6B3E/\u552E\u540E",
          query: {}
        }
      ]
    });
    const { tab } = common_vendor.toRefs(data);
    let re = common_vendor.ref(0);
    const switchs = (index, query) => {
      re.value = index;
      page_n.value = 0;
      res_order.order_data = [];
      getOrder(0, query);
    };
    common_vendor.onLoad(async () => {
      let db = await AccConfig_init.init();
      const _ = db.database().command;
      data.tab[3].query = { pay_success: "success", deliver: _.or("ref_pro", "ref_succ") };
      getOrder(0, data.tab[0].query);
    });
    const res_order = common_vendor.reactive({ order_data: [] });
    const { order_data } = common_vendor.toRefs(res_order);
    async function getOrder(sk = 0, query) {
      let db = await AccConfig_init.init();
      const res = await db.database().collection("order_data").where(query).limit(10).skip(sk).get();
      res_order.order_data = [...res_order.order_data, ...res.data];
    }
    let loading = common_vendor.ref(false);
    let page_n = common_vendor.ref(0);
    common_vendor.onReachBottom(async () => {
      loading.value = true;
      page_n.value++;
      let sk = page_n.value * 10;
      await getOrder(sk, data.tab[re.value].query);
      loading.value = false;
    });
    const shows = common_vendor.ref(false);
    const deliver_id = common_vendor.ref("");
    const deliver_index = common_vendor.ref(0);
    const deliver_no = common_vendor.ref("");
    async function deliver() {
      if (!deliver_no.value.trim() == "") {
        shows.value = false;
        wx.showLoading({ title: "\u53D1\u8D27\u4E2D", mask: true });
        let db = await AccConfig_init.init();
        await db.database().collection("order_data").doc(deliver_id.value).update({ data: { deliver: "already", waybill_No: deliver_no.value } });
        res_order.order_data.splice(deliver_index.value, 1);
        wx.hideLoading();
        deliver_no.value = "";
      }
    }
    async function reFund(index, out_trade_no, subtotal, _id) {
      wx.showLoading({
        title: "\u7533\u8BF7\u9000\u6B3E\u4E2D",
        mask: true
      });
      let db = await AccConfig_init.init();
      const $ = db.database().command.aggregate;
      const total_fee = await db.database().collection("order_data").aggregate().match({ out_trade_no }).group({ _id: null, totalPrice: $.sum("$subtotal") }).end();
      const res = await wx.cloud.callFunction({ name: "refund", data: {
        out_trade_no,
        total_fee: total_fee.list[0].totalPrice,
        refund_fee: subtotal
      } });
      if (res.result.code == 200) {
        await db.database().collection("order_data").doc(_id).update({ data: {
          deliver: "ref_succ",
          out_refund_no: res.result.out_refund_no
        } });
        new AccConfig_media.Feedback("\u9000\u6B3E\u7533\u8BF7\u6210\u529F", "none").toast();
        res_order.order_data[index].deliver = "ref_succ";
        res_order.order_data[index].out_refund_no = res.result.out_refund_no;
      } else {
        new AccConfig_media.Feedback("\u9000\u6B3E\u7533\u8BF7\u5931\u8D25", "none").toast();
      }
    }
    async function queryRefund(out_refund_no) {
      wx.showLoading({ title: "\u67E5\u8BE2\u4E2D", mask: true });
      const res = await wx.cloud.callFunction({ name: "queryRefund", data: { out_refund_no } });
      new AccConfig_media.Feedback(res.result.msg, "none").toast();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(common_vendor.unref(tab), (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index == common_vendor.unref(re) ? 1 : "",
            c: index,
            d: common_vendor.o(($event) => switchs(index, item.query), index)
          };
        }),
        b: common_vendor.f(common_vendor.unref(order_data), (item, index, i0) => {
          return common_vendor.e({
            a: item.goods_image,
            b: common_vendor.t(item.goods_title),
            c: item.specs.length > 0
          }, item.specs.length > 0 ? {
            d: common_vendor.f(item.specs, (i, idx, i1) => {
              return {
                a: common_vendor.t(i.att_val),
                b: idx
              };
            })
          } : {}, {
            e: common_vendor.t(item.goods_price),
            f: common_vendor.t(item.buy_amount),
            g: common_vendor.t(item.subtotal),
            h: item.pay_success == "not_pay"
          }, item.pay_success == "not_pay" ? {} : {}, {
            i: item.pay_success == "success"
          }, item.pay_success == "success" ? common_vendor.e({
            j: item.deliver == "stay"
          }, item.deliver == "stay" ? {
            k: common_vendor.o(($event) => (shows.value = true, deliver_id.value = item._id, deliver_index.value = index))
          } : {}, {
            l: item.deliver == "already"
          }, item.deliver == "already" ? {} : {}, {
            m: item.deliver == "ref_pro"
          }, item.deliver == "ref_pro" ? {
            n: common_vendor.o(($event) => reFund(index, item.out_trade_no, item.subtotal, item._id))
          } : {}, {
            o: item.deliver == "ref_succ"
          }, item.deliver == "ref_succ" ? {
            p: common_vendor.o(($event) => queryRefund(item.out_refund_no))
          } : {}) : {}, {
            q: index
          });
        }),
        c: common_vendor.unref(order_data).length == 0
      }, common_vendor.unref(order_data).length == 0 ? {} : {}, {
        d: common_vendor.unref(loading)
      }, common_vendor.unref(loading) ? {} : {}, {
        e: shows.value
      }, shows.value ? {
        f: deliver_no.value,
        g: common_vendor.o(($event) => deliver_no.value = $event.detail.value),
        h: common_vendor.o(($event) => (shows.value = false, deliver_no.value = "")),
        i: common_vendor.o(deliver)
      } : {});
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/order/order.vue"]]);
wx.createPage(MiniProgramPage);
