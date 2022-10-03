<template>
    <view class="order-tab">
        <view class="" v-for="(item,index) in tab" :key="index" @click="switchs(index,item.query)">
            <text>{{item.name}}</text>
            <text :class="{'order_Select':index==re}"></text>
        </view>
    </view>
    <view class="" style="height: 60rpx;"></view>
    <!-- 订单 -->
    <view class="order-back" v-for="(item,index) in order_data" :key="index">
      <view class="order-card">
        <view class="">
          <image :src="item.goods_image" mode="aspectFill"></image>
        </view>
        <view class="">
          <text class="order-title-padd">{{item.goods_title}}</text>
          <text class="order-specs" v-if="item.specs.length>0" v-for="(i,idx) in item.specs" :key="idx">{{i.att_val}}</text>
        </view>
        <view class="">
          <text class="order-title-padd order-num">{{item.goods_price}}</text>
          <text class="order-num">x{{item.buy_amount}}</text>
        </view>
      </view>
      <!-- 合计 -->
      <view class="order-total">
        <text>合计</text>
        <text>{{item.subtotal}}</text>
      </view>
      <!-- 订单状态 -->
      <!-- 待付款 -->
      <view class="order-button" v-if="item.pay_success=='not_pay'">
        <text class="order-button-a">待付款</text>
      </view>
      <!-- 已付款 -->
      <view class="order-button" v-if="item.pay_success=='success'">
        <block v-if="item.deliver=='stay'">
          <text class="order-button-b" @click="shows=true,deliver_id=item._id,deliver_index=index">发货</text>
        </block>
        <block v-if="item.deliver=='already'">
          <text class="order-button-a">已发货</text>
        </block>
        <block  v-if="item.deliver=='ref_pro'">
          <text class="order-button-b" @click="reFund(index,item.out_trade_no,item.subtotal,item._id)">确认退款</text>
        </block>
        <block  v-if="item.deliver=='ref_succ'">
          <text class="order-button-a">已退款</text>
          <text class="order-button-b" @click="queryRefund(item.out_refund_no)">查询退款</text>
        </block>
      </view>
    </view>
    <!-- 没有数据的提示 -->
    <view class="Tips" v-if="order_data.length==0">
      没有订单数据
    </view>
    <!-- 上拉加载 -->
    <view class="loading-hei">
      <Loading v-if="loading"></Loading>
    </view>
    <!-- 发货：填写运单号的弹框 -->
    <view class="modify-att" v-if="shows">
        <view class="Waybill-view">
          <input v-model="deliver_no" type="text" placeholder="请输入运单号" :focus="true">
          <view class="">
            <button type="default" size="mini" @click="shows=false,deliver_no=''">取消</button>
            <button type="primary" size="mini" @click="deliver">确定</button>
          </view>
        </view>
    </view>
</template>

<script setup>
  import {ref,reactive,toRefs} from 'vue'
  import {onLoad,onReachBottom} from '@dcloudio/uni-app'
  import {init} from '@/Acc-config/init.js'
  import Loading from '@/component/loading.vue'
  import {Feedback} from '@/Acc-config/media.js'
  const data=reactive({
    tab:[
      {
        name:'待付款',
        query:{pay_success:'not_pay'}
      },
      {
        name:'待发货',
        query:{pay_success:'success',deliver:'stay'}
      },
      {
        name:'已发货',
        query:{pay_success:'success',deliver:'already'}
      },
      {
        name:'退款/售后',
        query:{}
      }
    ]
  })
  const {tab}=toRefs(data)
  let re=ref(0)
  // tab切换
  const switchs=(index,query)=>{
    re.value=index
    page_n.value=0
    res_order.order_data=[]
    getOrder(0,query)
  }
  onLoad(async()=>{
    let db=await init()
    const _=db.database().command
    // 在这里赋值query，是因为我们不能在reactive，涉及到数据库相关的字符
    data.tab[3].query={pay_success:'success',deliver:_.or('ref_pro','ref_succ')}
    getOrder(0,data.tab[0].query)
  
  })
  // 请求数据
  const res_order=reactive({order_data:[]})
  const {order_data}=toRefs(res_order)
 async function getOrder(sk=0,query){
   let db=await init()
   const res=await db.database().collection('order_data').where(query).limit(10).skip(sk).get()
    res_order.order_data=[...res_order.order_data,...res.data]
  }
  // 上拉加载
  let loading=ref(false)
  let page_n=ref(0)
  onReachBottom(async()=>{
    loading.value=true
    page_n.value++
    let sk=page_n.value*10
    await getOrder(sk,data.tab[re.value].query)
    loading.value=false
  })
  //发货
  const shows=ref(false)
  const deliver_id=ref('')
  const deliver_index=ref(0)
  const deliver_no=ref('')//input输入的运单号
  async function deliver(){
    if(!deliver_no.value.trim()==''){
      shows.value=false
      wx.showLoading({title:'发货中',mask:true})
      let db=await init()
      const res=await db.database().collection('order_data').doc(deliver_id.value).update({data:{deliver:'already',waybill_No:deliver_no.value}})
      // 本地
      res_order.order_data.splice(deliver_index.value,1)
      wx.hideLoading()
      deliver_no.value=''
    }
  }
  // 确认退款
 async function reFund(index,out_trade_no,subtotal,_id){
      wx.showLoading({
        title:'申请退款中',
        mask:true
      })
      let db=await init()
      const $=db.database().command.aggregate
      // 查询某一订单全部商品的总金额（这种查询直接得到总价格）
      const total_fee=await db.database().collection('order_data').aggregate().match({out_trade_no}).group({_id:null,totalPrice:$.sum('$subtotal')}).end()
      // console.log(total_fee);
      // 调用云函数(因为这里的配置的云函数是在本地的环境，不是在共享的环境，所以直接使用wx.cloud,之前要在app.vue里面配置)
      const res=await wx.cloud.callFunction({name:'refund',data:{out_trade_no,
      total_fee:total_fee.list[0].totalPrice,refund_fee:subtotal
      }})
      // console.log(res);
      if(res.result.code==200){
        // 退款成功
        await db.database().collection('order_data').doc(_id).update({data:{
          deliver:'ref_succ',out_refund_no:res.result.out_refund_no
        }})
        // 本地
        new Feedback('退款申请成功','none').toast()
        res_order.order_data[index].deliver='ref_succ'
        res_order.order_data[index].out_refund_no=res.result.out_refund_no
      }else{
          
           new Feedback('退款申请失败','none').toast()
      }    
  }
  // 查询退款
 async function queryRefund(out_refund_no){
    wx.showLoading({title:'查询中',mask:true})
    const res=await wx.cloud.callFunction({name:'queryRefund',data:{out_refund_no}})
    // console.log(res);
    new Feedback(res.result.msg,'none').toast()
    
  }
  
  
</script>

<style>
page{
	background-color: #f4f4f4;
}
.order-tab{
	height: 60rpx;
	background-color: #f4f4f4;
	display: flex;
	justify-content: space-around;
	color: #000000;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
}
.order-tab view{
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}
.order_Select{
	display: block;
	width: 40rpx;
	height: 10rpx;
	border-radius: 50rpx;
	background-color: #ea4050;
	position: absolute;
	bottom: 0;
}
/* 订单卡片 */
.order-back{
	background-color: #fefefe;
	padding: 20rpx;
	margin: 20rpx 0;
}
.order-card image{
	width: 150rpx;
	height: 150rpx;
	display: block;
	border-radius: 8rpx;
}
.order-card{
	display: flex;
}

.order-card view:nth-child(2){
	flex: 1;
	padding: 0 20rpx;
}
.order-title-padd{
	margin-bottom: 20rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
}
.order-specs{
	background-color: #fafafa;
	font-size: 27rpx;
	color: #767676;
	padding: 10rpx;
	border-radius: 9rpx;
}
.order-num{
	color: #8b8c90;
}
/* 合计 */
.order-total{
	display: flex;
	align-items: center;
	justify-content: flex-end;
}
.order-total text{
	display: block;
	padding-left: 20rpx;
}
.order-total text:nth-child(1){
	color: #8b8c90;
}
.order-total text:nth-child(2){
	font-weight: bold;
	font-size: 34rpx;
}
/* 按钮 */
.order-button{
	display: flex;
	justify-content: flex-end;
	margin-top: 30rpx;
}
.order-button text{
	padding: 15rpx 35rpx;
	margin-left: 20rpx;
	border-radius: 10rpx;
}
.order-button-a{
	border: 1rpx solid #d7d8d8;
	color: #8b8c90;
}
.order-button-b{
	background-color: #ea4050;
	color: #FFFFFF;
}

/* 运单号 */
.Waybill-view{
	position:absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 400rpx;
	height: 200rpx;
	background-color: #FFFFFF;
	padding: 20rpx;
	border-radius: 10rpx;
}
.Waybill-view button{
	margin: inherit;
}
.Waybill-view view{
	display: flex;
	justify-content: space-between;
	position: absolute;
	bottom: 20rpx;
	left: 20rpx;
	right: 20rpx;
}
</style>
