<template>
  <view class="select-goods" v-for="(item,index) in data.list" :key="index" @click="selectGood(item.goods_title,item._id,item.goods_price,item.video_url,item.relation)">
    <view class="">
      <image :src="item.goods_cover" mode="aspectFill"></image>
    </view>
    <view class="">
      <text class="over-text line-clamp" :style="{color:(item.relation?'#f2f2f2':'')}">{{item.goods_title}}</text>
      <text :style="{color:(item.relation?'#f2f2f2':'')}">￥{{item.goods_price}}</text>
    </view>
  </view>
  <!-- 没有数据 -->
  <view class="Tips" v-if="data.list.length==0">
    你还没有商品数据
  </view>
  <!-- 上拉加载提示 -->
  <view class="loading-hei">
    <Loading v-if="loading"></Loading>
  </view>
</template>

<script setup>
  import {onMounted,reactive,ref,watch} from 'vue'
  import {init} from '@/Acc-config/init.js'
  import Loading from '@/component/loading.vue'
  import {onReachBottom,onLoad} from '@dcloudio/uni-app'
  import {select_goods} from '@/Acc-config/responseData.js'
  import {Feedback} from '@/Acc-config/media.js'
  onMounted(()=>{
    getGoods()
  })
  onLoad((ids)=>{
    sel_ids.selIds=JSON.parse(ids.selId)
  })
  const loading=ref(false)
  const data=reactive({
    list:[]
  })
  // 接收上个页面传递过来已经选择关联商品的id
  const sel_ids=reactive({
    selIds:[]
  })
  //利用监听器，监听data.list，防止下拉刷新，用户已选择的关联商品还能选择
  // !!!!
  watch(()=>data.list,(newval)=>{
     sel_ids.selIds.forEach(item=>{
       let index=newval.findIndex(i=>i._id==item)
       // console.log(index);
      if(index>=0){
         data.list[index]['relation']=true
      }
     })
  },{immediate:true})
  
  // 
  
  let obj={goods_title:true,goods_cover:true,goods_price:true,video_url:true,seckill:true}
  const getGoods=async()=>{
    let db=await init() 
    const res=await db.database().collection('goodsInfo').where({shelves:true}).limit(10).field(obj).get()
    data.list=res.data
  }
  // 上拉加载
  let page_n=ref(0)
  onReachBottom(async()=>{
    loading.value=true
    page_n.value++
    let sk=page_n.value*10
    let db=await init()
    const res=await db.database().collection('goodsInfo').where({shelves:true}).limit(10).skip(sk).field(obj).get()
    data.list=[...data.list,...res.data]
    loading.value=false
  })
  // 选中关联商品
  const selectGood=(goods_title,id,goods_price,video_url,relation)=>{
   if(relation){
     new Feedback('该商品已被关联','none').toast()
   }else{
     select_goods.value={goods_title,id,goods_price,video_url}
     wx.navigateBack({delta:1})
   }

  }
  
</script>

<style scoped>
.select-goods{
	display: flex;
	height: 200rpx;
	margin: 20rpx;
}
.select-goods image{
	width: 200rpx;
	height: 200rpx;
	display: block;
	border-radius: 10rpx;
}
.select-goods view:nth-child(2){
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-weight: bold;
	padding: 10rpx 0 10rpx 15rpx;
}
.select-goods view text:nth-child(2){
	color: #1AAD19;
	font-size: 35rpx;
}
.line-clamp{
	-webkit-line-clamp: 2 !important;
}
</style>