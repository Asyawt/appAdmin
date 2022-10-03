"use strict";
var common_vendor = require("../../common/vendor.js");
var AccConfig_media = require("../../Acc-config/media.js");
var AccConfig_responseData = require("../../Acc-config/responseData.js");
require("../../Acc-config/init.js");
const _sfc_main = {
  __name: "specs",
  setup(__props) {
    common_vendor.onLoad((e) => {
      const data = JSON.parse(e.sku);
      if (data.length <= 0)
        return;
      const tankuang = data[0].att_data.map((item, index) => {
        return { att: item.att_name, title: index + 1 };
      });
      sto_att.attobj = tankuang;
      if (data[0].att_data.length == 1) {
        sto_att.attobj.push({ att: "", title: 2 }, { att: "", title: 3 });
      } else if (data[0].att_data.length == 2) {
        sto_att.attobj.push({ att: "", title: 3 });
      }
      submitAttr();
      common_vendor.nextTick(() => {
        sku_data.sku = data;
      });
    });
    const show = common_vendor.ref(false);
    const sku_data = common_vendor.reactive({
      sku: [{ title: 1, att_data: [], price: "", stock: "", image: "" }]
    });
    const { sku } = common_vendor.toRefs(sku_data);
    const sto_att = common_vendor.reactive({
      attobj: [{ att: "", title: 1 }, { att: "", title: 2 }, { att: "", title: 3 }]
    });
    const checkboxData = common_vendor.reactive({ boxData: [] });
    const submitAttr = () => {
      sku_data.sku = [{ title: 1, att_data: [], price: "", stock: "", image: "" }];
      const filterData = sto_att.attobj.filter((item) => {
        return item.att != "";
      });
      const newArr = [];
      filterData.forEach((item) => {
        newArr.push({ attr: item.att, name: item.att, checked: true });
      });
      checkboxData.boxData = newArr;
      show.value = false;
      calsku();
    };
    let new_att = [];
    const calsku = () => {
      const filter_arr = checkboxData.boxData.filter((item) => item.checked);
      new_att = filter_arr.map((item) => {
        return { att_name: item.attr, att_val: "" };
      });
      sku_data.sku.forEach((item) => {
        item.att_data = JSON.parse(JSON.stringify(new_att));
      });
    };
    const newSpecs = () => {
      let num = sku_data.sku[sku_data.sku.length - 1].title;
      num++;
      const new_sku = { title: num, att_data: [], price: "", stock: "", image: "" };
      sku_data.sku.push(new_sku);
      if (new_att.length > 0) {
        [
          sku_data.sku[sku_data.sku.length - 1].att_data = JSON.parse(JSON.stringify(new_att))
        ];
      }
    };
    const deleteSku = (index) => {
      sku_data.sku.splice(index, 1);
      sku_data.sku.forEach((item, idx) => {
        item.title = idx + 1;
      });
    };
    const changeChecked = (e) => {
      const value = e.detail.value;
      checkboxData.boxData.forEach((item, index) => {
        if (value.includes(item.name)) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
    };
    common_vendor.watch(() => checkboxData.boxData, (newval, oldval) => {
      calsku();
    }, { deep: true });
    const upLoadImg = async (index) => {
      try {
        let local = await new AccConfig_media.Uploads().upLoadImgorVideo();
        wx.showLoading({ title: "\u6B63\u5728\u4E0A\u4F20...", mask: true });
        let res = await new AccConfig_media.Uploads().uploadCloud(local[0].tempFilePath);
        sku_data.sku[index].image = res;
        wx.hideLoading();
      } catch (e) {
        new AccConfig_media.Feedback("\u4E0A\u4F20\u5931\u8D25").toast();
      }
    };
    const deleteImg = (index) => {
      sku_data.sku[index].image = "";
    };
    const preImg = (img) => {
      new AccConfig_media.Uploads().previewImg(img, [img]);
    };
    const save = () => {
      if (checkboxData.boxData.length == 0) {
        new AccConfig_media.Feedback("\u8BF7\u6DFB\u52A0\u5C5E\u6027").toast();
        return;
      } else if (checkboxData.boxData.length > 0) {
        const a = checkboxData.boxData.every((item) => !item.checked);
        if (a) {
          new AccConfig_media.Feedback("\u8BF7\u52FE\u9009\u5C5E\u6027").toast();
          return;
        } else {
          const b = sku_data.sku.filter((item) => item.price == "");
          if (b.length > 0) {
            new AccConfig_media.Feedback("\u89C4\u683C\u586B\u5199\u4E0D\u5B8C\u6574").toast();
            return;
          }
          const c = sku_data.sku.filter((item) => item.stock == "");
          if (c.length > 0) {
            new AccConfig_media.Feedback("\u89C4\u683C\u586B\u5199\u4E0D\u5B8C\u6574").toast();
            return;
          }
          const d = sku_data.sku.filter((item) => item.image == "");
          if (d.length > 0) {
            new AccConfig_media.Feedback("\u89C4\u683C\u586B\u5199\u4E0D\u5B8C\u6574").toast();
            return;
          }
          const e = sku_data.sku.some((item) => {
            return item.att_data.some((i) => i.att_val == "");
          });
          if (e) {
            new AccConfig_media.Feedback("\u89C4\u683C\u586B\u5199\u4E0D\u5B8C\u6574").toast();
            return;
          }
          sku_data.sku.forEach((item) => {
            item.price = Number(item.price);
            item.stock = Number(item.stock);
          });
          AccConfig_responseData.sku_val.value = sku_data.sku;
          wx.navigateBack({
            delta: 1
          });
        }
      }
    };
    const cancel = () => {
      wx.navigateBack({
        delta: 1
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => show.value = true),
        b: common_vendor.f(checkboxData.boxData, (item, index, i0) => {
          return {
            a: item.attr,
            b: item.checked,
            c: common_vendor.t(item.name),
            d: index
          };
        }),
        c: common_vendor.o(changeChecked),
        d: common_vendor.f(common_vendor.unref(sku), (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title)
          }, common_vendor.unref(sku).length > 1 ? {
            b: common_vendor.o(($event) => deleteSku(index))
          } : {}, {
            c: common_vendor.f(item.att_data, (i, indexs, i1) => {
              return {
                a: common_vendor.t(i.att_name),
                b: "\u8BF7\u8F93\u5165" + i.att_name,
                c: i.att_val,
                d: common_vendor.o(($event) => i.att_val = $event.detail.value),
                e: indexs
              };
            }),
            d: item.price,
            e: common_vendor.o(($event) => item.price = $event.detail.value),
            f: item.stock,
            g: common_vendor.o(($event) => item.stock = $event.detail.value),
            h: item.image == ""
          }, item.image == "" ? {
            i: common_vendor.o(($event) => upLoadImg(index))
          } : {
            j: item.image,
            k: common_vendor.o(($event) => preImg(item.image))
          }, {
            l: item.image != ""
          }, item.image != "" ? {
            m: common_vendor.o(($event) => deleteImg(index))
          } : {}, {
            n: index
          });
        }),
        e: common_vendor.unref(sku).length > 1,
        f: common_vendor.o(newSpecs),
        g: common_vendor.o(($event) => show.value = false),
        h: common_vendor.o(submitAttr),
        i: common_vendor.f(sto_att.attobj, (item, index, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: item.att,
            c: common_vendor.o(($event) => item.att = $event.detail.value),
            d: index
          };
        }),
        j: show.value,
        k: common_vendor.o(cancel),
        l: common_vendor.o(save)
      };
    };
  }
};
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/Roger/Desktop/uniappProject/lingshi-admin/pages/specs/specs.vue"]]);
wx.createPage(MiniProgramPage);
