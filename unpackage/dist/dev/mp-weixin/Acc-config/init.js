"use strict";
let init = () => {
  return new Promise(async (resolve, reject) => {
    var res = new wx.cloud.Cloud({
      resourceAppid: "wx8dfff8c6e2f01ea9",
      resourceEnv: "lingshi-user-9gqe4ry205449a04"
    });
    await res.init();
    await res.callFunction({
      name: "cloudbase_auth",
      data: {}
    });
    resolve(res);
  });
};
exports.init = init;
