export let init=()=>{
  return new Promise(async(resolve,reject)=>{
    // 声明新的 cloud 实例
    var res = new wx.cloud.Cloud({
      // 资源方 AppID
      resourceAppid: 'wx8dfff8c6e2f01ea9',
      // 资源方环境 ID
      resourceEnv: 'lingshi-user-9gqe4ry205449a04',
    })
    
    // 跨账号调用，必须等待 init 完成
    // init 过程中，资源方小程序对应环境下的 cloudbase_auth 函数会被调用，并需返回协议字段（见下）来确认允许访问、并可自定义安全规则
    await res.init()
    
    // 完成后正常使用资源方的已授权的云资源
    await res.callFunction({
      name: 'cloudbase_auth',
      data: {},
    })
    resolve(res)
  })
}