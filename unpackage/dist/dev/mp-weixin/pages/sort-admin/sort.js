"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_init = require("../../Acc-config/init.js");
var AccConfig_media = require("../../Acc-config/media.js");
if (!Math) {
  Loading();
}
const Loading = () => "../../component/loading.js";
const _sfc_main = {
  __name: "sort",
  setup(__props) {
    const show = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      getsort();
    });
    const data = common_vendor.reactive({
      goods_sort: [],
      sorts: ""
    });
    const { goods_sort, sorts, allData } = common_vendor.toRefs(data);
    const load = common_vendor.ref(true);
    let acc = true;
    common_vendor.watch(() => data.goods_sort, () => {
      if (acc) {
        load.value = false;
        acc = false;
      }
    });
    const getsort = async () => {
      const db = await AccConfig_init.init();
      const res = await db.database().collection("goods_sort").limit(10).field({ _openid: false }).get();
      if (res) {
        data.goods_sort = res.data;
        console.log(data.goods_sort);
      }
    };
    const submitSort = async () => {
      console.log(data.sorts);
      if (!data.sorts) {
        new AccConfig_media.Feedback("\u8BF7\u8F93\u5165\u5206\u7C7B\uFF01", "none").toast();
        return;
      }
      const db = await AccConfig_init.init();
      const checkData = await db.database().collection("goods_sort").where({ sort_name: data.sorts }).get();
      if (checkData.data.length > 0) {
        new AccConfig_media.Feedback("\u5DF2\u7ECF\u5B58\u5728\u8BE5\u5206\u7C7B\u5546\u54C1\uFF01", "none").toast();
      } else {
        const addData = await db.database().collection("goods_sort").add({ data: { sort_name: data.sorts, quantity: 0 } });
        data.goods_sort.push({ quantity: 0, sort_name: data.sorts, _id: addData._id });
        console.log(addData);
        if (addData) {
          data.sorts = "";
          show.value = false;
        }
      }
    };
    let showNull = common_vendor.ref(false);
    let showLoading = common_vendor.ref(false);
    let num = common_vendor.ref(0);
    common_vendor.onReachBottom(async () => {
      showLoading.value = true;
      showNull.value = false;
      const db = await AccConfig_init.init();
      const resAll = await db.callFunction({
        name: "getAllData",
        data: {}
      });
      if (resAll.result.res.data.length <= data.goods_sort.length) {
        showLoading.value = false;
        showNull.value = true;
      } else {
        num.value++;
        let sk = num.value * 10;
        const res = await db.database().collection("goods_sort").limit(10).skip(sk).field({ _openid: false }).get();
        if (res) {
          const merge = [...data.goods_sort, ...res.data];
          let obj = {};
          const newdata = merge.reduce((prep, item) => {
            if (!obj[item._id]) {
              prep.push(item);
              obj[item._id] = 1;
            }
            return prep;
          }, []);
          data.goods_sort = newdata;
          showLoading.value = false;
        }
      }
    });
    const deleteSort = (item, index) => {
      wx.showModal({
        title: "\u63D0\u793A",
        content: `\u786E\u8BA4\u8981\u5220\u9664${item.sort_name}\u5417\uFF1F`,
        success: async (res) => {
          if (res.confirm) {
            if (item.quantity > 0) {
              new AccConfig_media.Feedback("\u8BF7\u5148\u5220\u9664\u8BE5\u5206\u7C7B\u4E0B\u7684\u5546\u54C1", "none").toast();
              return;
            }
            try {
              let db = await AccConfig_init.init();
              await db.database().collection("goods_sort").doc(item._id).remove();
              data.goods_sort.splice(index, 1);
            } catch (e) {
              new AccConfig_media.Feedback("\u5220\u9664\u5931\u8D25").toast();
            }
          } else if (res.cancel)
            ;
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(goods_sort).length > 0
      }, common_vendor.unref(goods_sort).length > 0 ? {} : {}, {
        b: common_vendor.f(common_vendor.unref(goods_sort), (item, index, i0) => {
          return {
            a: common_vendor.t(item.sort_name),
            b: common_vendor.o(($event) => deleteSort(item, index)),
            c: index
          };
        }),
        c: common_vendor.unref(showLoading)
      }, common_vendor.unref(showLoading) ? {} : {}, {
        d: common_vendor.unref(showNull)
      }, common_vendor.unref(showNull) ? {} : {}, {
        e: common_vendor.unref(goods_sort).length == 0
      }, common_vendor.unref(goods_sort).length == 0 ? common_vendor.e({
        f: load.value
      }, load.value ? {} : {}) : {}, {
        g: common_vendor.o(($event) => show.value = true),
        h: common_vendor.o(($event) => show.value = !show.value),
        i: common_vendor.unref(sorts),
        j: common_vendor.o(($event) => common_vendor.isRef(sorts) ? sorts.value = $event.detail.value : null),
        k: common_vendor.o(submitSort),
        l: show.value
      });
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-106663f8"], ["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/sort-admin/sort.vue"]]);
wx.createPage(MiniProgramPage);
