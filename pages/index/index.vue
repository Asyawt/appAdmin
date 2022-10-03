<template>
	<view class="Top-view" > 
      <view class="" :style="'height:'+ btn_data.btnTop+'px'"></view>
      <view class="" :style="{'line-height':btn_data.btnHeight+'px','padding-left':10+'px'}">
        <text>Roger零食小铺</text>
      </view>
      <view class="profit-view" :style="{top:btn_data.tops+'px'}">
        <view class="profit-sum">
          <text>累计收益(元)</text>
          <text>{{profit}}</text>
        </view>
        <view class="profit-sale">
            <view class="">
              <text>今日销售额</text>
              <text>{{sales}}</text>
            </view>
            <view class="">
              <text>今日订单数</text>
              <text>{{orders}}</text>
            </view>
            <view class="">
              <text>累计订单数</text>
              <text>{{com_order}}</text>
            </view>
        </view>
      </view>
	</view>
<!-- 九宫格布局 -->
<view class="gongGe" :style="{top:btn_data.profit_top+'px'}">
  <view class="" v-for="(item,index) in btn_data.plate" :key="index" @click="gotoPage(index)">
    <image :src="item.image" mode="aspectFit"></image>
    <text>{{item.name}}</text>
  </view>
</view>
</template>

<script setup>
import {onMounted,reactive,toRefs} from 'vue'
import {onPullDownRefresh} from '@dcloudio/uni-app'
const btn_data=reactive({
  btnTop:0,
  btnHeight:0,
  tops:0,
  profit_top:0,
  // 九宫格数据
  plate:[
    {
    image:'/static/detail/hengfu.svg',
    name:'横幅管理'
  },
  {
    image:'/static/detail/miaosha.svg',
    name:'秒杀管理'
  },
  {
    image:'/static/detail/shangpin.svg',
    name:'商品管理'
  },
  {
    image:'/static/detail/dingdan.svg',
    name:'订单管理'
  },
  {
    image:'/static/detail/fenlei.svg',
    name:'分类管理'
  },
  ]
})
onMounted(()=>{
  setBtnInfo()
  proFit()
  count()
})
// 获取胶囊按钮的位置
const btnInfo=wx.getMenuButtonBoundingClientRect()
const setBtnInfo=()=>{
  btn_data.btnTop=btnInfo.top
  btn_data.btnHeight=btnInfo.height
  btn_data.tops=btnInfo.top+btnInfo.height+20
}
// 获取收益板块的高度
function proFit(){
  const query=wx.createSelectorQuery()
  query.select('.profit-view').boundingClientRect()
  query.exec((res)=>{
    // console.log(res);
    btn_data.profit_top=res[0].height+btn_data.tops+10
  })
}
// 页面跳转
const gotoPage=(index)=>{
  switch(index){
    case 0:wx.navigateTo({url:'/pages/banner-admin/banner'})
    break;
    case 1:wx.navigateTo({url:'/pages/seckill-admin/seckill'})
    break;
    case 2:wx.switchTab({url:'/pages/commodity/commodity'})
    break;
    case 3:wx.switchTab({url:'/pages/order/order'})
    break;
    case 4:wx.navigateTo({url:'/pages/sort-admin/sort'})
  }
}
// 计算累计收益，今日销售额，今日订单数，累计订单数
const res =reactive({profit:'0.00',sales:'0.00',orders:0,com_order:0})
const {profit,sales,orders,com_order}=toRefs(res)
import {init} from '@/Acc-config/init.js'
import moment from 'moment'
async function count(){
  let dbs=await init()
  const bases=dbs.database()
  const $ = bases.command.aggregate
  // 计算累计收益
  //  .aggregate()属于聚合查询要用它独有的查询方法
  const profits=await bases.collection('order_data')
  .aggregate()
  .group({
    _id: null,
    totalPrice: $.sum('$subtotal')
  })
  .end()
  // console.log(profits);
  // 计算累计收益
  // res.profit=profits.list[0].totalPrice== 0 ? '0.00':profits.list[0].totalPrice
  // 计算今日销售额
  let query_time=moment().utcOffset(8).format('YYYY-MM-DD')
  // .match相当于普通的where
  const sales=await bases.collection('order_data')
  .aggregate()
  .match({query_time})
  .group({
    _id: null,
    totalPrice: $.sum('$subtotal')
  })
  .end()
  // console.log(sales);
  // res.sales=sales.list[0].totalPrice==0?'0.00':sales.list[0].totalPrice
 // 今日订单数
 const Orders=await bases.collection('order_data').where({query_time}).count()
 // res.orders=Orders.total 
  // 累计订单数
  const allOrders=await bases.collection('order_data').count()
  // res.com_order=allOrders.total 
  Promise.all([profits,sales,Orders,allOrders]).then(allres=>{
    // console.log(res);
    res.profit=allres[0].list[0].totalPrice== 0 ? '0.00':profits.list[0].totalPrice
    if(allres[1].list[0]){
        res.sales=allres[1].list[0].totalPrice==0?'0.00':sales.list[0].totalPrice
    }
    res.orders=allres[2].total
    res.com_order=allres[3].total
  })
  wx.stopPullDownRefresh()
}
// 下拉刷新
onPullDownRefresh(()=>{
  count()
})

</script>

<style>
page{
  background-color: #f4f4f4;
}
.Top-view{
  height: 330rpx;
  position: relative;
  background-image: linear-gradient(to top,#9be15d 0%,#00e3ae 100%);

}
.profit-view{
  background-color: #ffffff;
  position: absolute;
  left: 20rpx;
  right: 20rpx;  border-radius: 10rpx;
  padding: 20rpx;
}
.profit-sum{
  display: flex;
  flex-direction: column;
  padding-bottom: 10rpx;
}
.profit-sale{
display: flex;
flex-direction: row;
justify-content: space-between;
}
.profit-sale view{
  display: flex;
  align-items: center;
  flex-direction: column;
}
.profit-sum text:nth-child(2){
	font-size: 40rpx;
	padding-top: 10rpx;
}
.profit-sale view text:nth-child(1){
	color: #a7a7a7;
	padding-bottom: 10rpx;
}
.profit-sale view text:nth-child(2){
	font-weight: bold;
}
.gongGe{
  background-color: #ffffff;
  margin: 0 20rpx 20rpx 20rpx;
  border-radius: 10rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: absolute;
  left: 0;
  right: 0;
  color: #555555;
}
.gongGe image{
  width: 55rpx;
  height: 55rpx;
  display: block;
  margin-bottom: 20rpx;
}
.gongGe view{
  width: calc(25%-10rpx*2);
  margin: 20rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
