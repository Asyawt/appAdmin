"use strict";
var AccConfig_init = require("./init.js");
class Feedback {
  constructor(title, icon = "error") {
    this.title = title;
    this.icon = icon;
  }
  toast() {
    wx.showToast({
      title: this.title,
      icon: this.icon,
      duration: 1e3,
      mask: true
    });
  }
}
class Uploads {
  constructor() {
  }
  upLoadImgorVideo(count = 1, type = "image") {
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count,
        mediaType: [type],
        sourceType: ["album"]
      }).then((res) => {
        resolve(res.tempFiles);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  async uploadCloud(localImg) {
    let db = await AccConfig_init.init();
    const a = localImg.split(".");
    const imgJpg = "." + a[1];
    let cloudPath = `${Date.now()}-${Math.floor(Math.random(0, 1) * 1e5)}${imgJpg}`;
    return new Promise((resolve, reject) => {
      db.uploadFile({
        cloudPath: "media/" + cloudPath,
        filePath: localImg,
        success: async (res) => {
          const res_url = await db.getTempFileURL({ fileList: [res.fileID] });
          resolve(res_url.fileList[0].tempFileURL);
        },
        fail: (err) => {
          reject()(err);
        }
      });
    });
  }
  async allUpload(allImg, key) {
    return new Promise((resolve, reject) => {
      let allImgHttps = [];
      allImg.forEach(async (item) => {
        const imgHttps = await this.uploadCloud(item.image);
        allImgHttps.push({ [key]: imgHttps });
        if (allImgHttps.length == allImg.length) {
          resolve(allImgHttps);
        }
      });
    });
  }
  previewImg(image, arr) {
    wx.previewImage({
      current: image,
      urls: arr
    });
  }
}
exports.Feedback = Feedback;
exports.Uploads = Uploads;
