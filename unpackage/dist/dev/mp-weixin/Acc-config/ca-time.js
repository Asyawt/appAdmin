"use strict";
var common_vendor = require("../common/vendor.js");
var AccConfig_date = require("./date.js");
common_vendor.hooks.locale("zh-cn");
const c_year = common_vendor.hooks().format("YYYY");
const n_year = common_vendor.hooks().add(1, "year").format("YYYY");
const c_month = common_vendor.hooks().format("M");
const c_day = common_vendor.hooks().format("D");
let current = () => {
  AccConfig_date.date[0] = [{ time: c_year, name: c_year + "\u5E74" }, { time: n_year, name: n_year + "\u5E74" }];
  for (let i = c_month; i <= 12; i++) {
    AccConfig_date.date[1].push({ time: Number(i), name: i + "\u6708" });
  }
  const days = common_vendor.hooks(c_year + "/" + c_month, "YYYY/M").daysInMonth();
  for (let i = c_day; i <= days; i++) {
    AccConfig_date.date[2].push({ time: Number(i), name: i + "\u65E5" });
  }
};
let selDays = (selDate) => {
  let nowday = selDate[0].year == c_year && selDate[0].month == c_month ? c_day : 1;
  const days = common_vendor.hooks(selDate[0].year + "/" + selDate[0].month, "YYYY/M").daysInMonth();
  let new_day = [];
  for (let i = Number(nowday); i <= days; i++) {
    new_day.push({ time: Number(i), name: i + "\u65E5" });
  }
  AccConfig_date.date.splice(2, 1, new_day);
};
let selmonthanddays = (selDate) => {
  let new_month = [];
  let nowmonth = selDate[0].year == c_year ? c_month : 1;
  for (let i = nowmonth; i <= 12; i++) {
    new_month.push({ time: Number(i), name: i + "\u6708" });
  }
  AccConfig_date.date.splice(1, 1, new_month);
};
exports.c_month = c_month;
exports.current = current;
exports.selDays = selDays;
exports.selmonthanddays = selmonthanddays;
