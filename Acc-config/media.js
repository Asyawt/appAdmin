import {init} from '@/Acc-config/init.js'
// 消息提示
class Feedback{
  constructor(title,icon='error'){
    this.title=title
    this.icon=icon
  }
  toast(){
    wx.showToast({
        title:this.title,
        icon: this.icon,
        duration: 1000,
        mask:true
    })
  }
}

class Uploads{
  constructor(){}
  // 调用本地相册或视频
  upLoadImgorVideo(count=1,type='image'){
    return new Promise((resolve,reject)=>{
      wx.chooseMedia({
        count,
        mediaType:[type],
        sourceType:['album']
      }).then((res)=>{
      resolve(res.tempFiles)
     
      }).catch(err=>{
        reject(err);
      })
    })
  }
  // 上传一张图片或视频到云存储
 async uploadCloud(localImg){
    let db=await init()
    // 这里做图片名称的重写，是为了高并发，防止同时上传相同的图片
    const a=localImg.split('.')
    const imgJpg='.'+a[1]
    // console.log(imgJpg);
    let cloudPath=`${Date.now()}-${Math.floor(Math.random(0,1)*100000)}${imgJpg}`
    return new Promise((resolve,reject)=>{
      // 这里的cloudPath为创建的文件夹名称+文件名称，文件名称必须唯一，可以就用本地存储的生成的字符串，但。。。
    db.uploadFile({
      cloudPath:'media/'+cloudPath,
      filePath:localImg,
      success:async(res)=>{
        // console.log(res);
        // 在数据库共享的小程序里面，不能直接使用res.fileID(无效)，必须把fileID转化成https形式，小程序才能使用，调用wx.cloud.getTempFileURL()
        const res_url=await db.getTempFileURL({fileList:[res.fileID]})
        // console.log(res_url)
        resolve(res_url.fileList[0].tempFileURL)
      },
      fail:err=>{
        reject()(err);
      }
    })
    })
  }
// 一次上传多张图片到云存储
async allUpload(allImg,key){
  // 必须要包装成一个promise，因为我们要等到所有照片都上传完成，才返回来数据
  return new Promise((resolve,reject)=>{
    let allImgHttps=[]
      allImg.forEach(async(item)=>{
        // 在类里面调用自己的方法加this
        const imgHttps=await this.uploadCloud(item.image)
        allImgHttps.push({[key]:imgHttps})
        if(allImgHttps.length==allImg.length){
          resolve(allImgHttps)
        }
      })
      // 这里不能直接resolve(allImgHttps)，因为上面的上传操作是个异步，还没上传完成，就执行了下面的代码 !!!
      // resolve(allImgHttps)
  })
}
// 预览图片
previewImg(image,arr){
  wx.previewImage({
    current: image, // 当前显示图片的 http 链接
    urls: arr // 需要预览的图片 http 链接列表['httpxx','']
  })
}

}
export {
  Feedback,Uploads
}