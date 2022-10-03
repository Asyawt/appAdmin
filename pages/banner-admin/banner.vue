<template>
  <view class="sort-Header sort-position" v-if="banner_data.length>0">
    <text>横幅图片</text>
    <text>操作</text>
  </view>
  <view class="" style="height: 90rpx;"></view>
  <view class="sort-Header sort-table" v-for="(item,index) in banner_data" :key="index">
    <image :src="item.banner_cover" mode="aspectFill"></image>
    <text class="sort-but" @click="deleteGoods(item._id,index)">删除</text>
  </view>
  <view class="Tips" v-if="banner_data.length==0">
    <text v-if='load'>加载中...</text>
   <text v-else>你还没有横幅数据</text>
  </view>
  <!-- 底部 -->
  <view class="" style="height: 300rpx;"></view>
  <view class="newly-added-view">
    <view class="newly-added" @click="show=true">
      新增横幅
    </view>
  </view>
  <!-- 弹窗 -->
  <page-container :show='show' bindenter='onEnter'>
    <view class="space-view">
      <view class="modify-sub modify-padding">
        <image @click="show=false" src="../../static/detail/guanbi.svg" mode="widthFix"></image>
        <text >新增横幅</text>
        <text @click="submitCloud">提交</text>
      </view>
      <view class="upload-cover">
        <image v-if="banner_cover==''" @click="upImg" src="../../static/detail/miaosha-img.jpg" mode="aspectFill"></image>
       <image :src="banner_cover" mode="aspectFill"></image>
        <image @click="banner_cover=''" v-if="banner_cover!=''" src="../../static/detail/shanchu-goods.svg" mode="widthFix"></image>
      </view>
      <view class="relation relation-back" @click="addTo">
        <text>关联商品</text>
        <text class="over-text">{{re_goods.title==''?'添加':re_goods.title}}</text>
      </view>
    </view>
  </page-container>
</template>

<script setup>
  import {ref,reactive,onMounted,toRefs,watch} from 'vue'
  import {init} from '@/Acc-config/init.js'
  import {Feedback,Uploads} from '@/Acc-config/media.js'
  import {select_goods} from '@/Acc-config/responseData.js'
 function onEnter(){}
 const show=ref(false)
onMounted(()=>{
  getBanner()
})
// 监听关联的传递的值
watch(select_goods,(newval)=>{
  data.re_goods.title=newval.goods_title
  data.re_goods.goods_id=newval.id
  data.re_goods.video_url=newval.video_url
})
// 
const data=reactive({
  banner_data:[],
  banner_cover:'',
  re_goods:{
    title:'',
    goods_id:'',
    video_url:''
  }
})
//解决加载页面时显示加载中效果的代码，而不是显示没有数据
 const load=ref(true)
  let acc=true
 watch(()=>data.banner_data,()=>{
   if(acc){
     load.value=false
     acc=false
   }
 })
//
const {banner_data,banner_cover,re_goods}=toRefs(data)
// 获取数据
const getBanner=async()=>{
  let db=await init()
  let res=await db.database().collection('banner').get()
  data.banner_data=res.data
}
// 上传横幅图片
const upImg=async()=>{

 const local=await new Uploads().upLoadImgorVideo(1)
  wx.showLoading({title:'正在上传',mask:true})
  // 这里一张图片直接上传到云存储，
const res=await  new Uploads().uploadCloud(local[0].tempFilePath)
  data.banner_cover=res
  wx.hideLoading()
}
// 去选择关联商品
const addTo=()=>{
  // 禁用已经选择的关联商品的id
  const sel_id=data.banner_data.map(item=>item.goods_id)//这样写就直接返回数组里面的每一项都是item.goods_id的值（字符串
  wx.navigateTo({
    url:'/pages/goods_list/list?selId='+JSON.stringify(sel_id)
  })
}
 // 提交数据(数据字段)到数据库，图片已经提交到云存储
 const submitCloud=()=>{
   switch(true){
     case data.banner_cover=='' : new Feedback('请上传封面图').toast()
     break;
    case data.re_goods.title=='' : new Feedback('请关联一个商品').toast()
    break;
    default:subData()
   }
 }
 const subData=async()=>{
   wx.showLoading({title:'正在提交',mask:true})
   let obj={banner_cover:data.banner_cover,goods_id:data.re_goods.goods_id,video_url:data.re_goods.video_url}
   try{
     let db=await init()
     await db.database().collection('banner').add({data:obj})
     show.value=false
     data.banner_cover=''
     data.re_goods.title=''
     wx.hideLoading()
     // 重新渲染
      getBanner()
   }catch(e){
     //TODO handle the exception
     new Feedback('提交失败').toast()
   }
 }
 // 删除
 const deleteGoods=async(id,index)=>{
   try{
     let db=await init()
     await db.database().collection('banner').doc(id).remove()
     data.banner_data.splice(index,1)
     new Feedback('删除成功','success').toast()
   }catch(e){
     //TODO handle the exception
     new Feedback('删除失败').toast()
   }
 }
 
 
</script>

<style scoped>
.modify-padding{
	padding-bottom: 60rpx !important;
}
.upload-cover{
	position: relative;
}
.upload-cover image:nth-child(1){
	width: 100%;
	height: 380rpx;
	display: block;
}
.upload-cover image:nth-child(2){
	width: 40rpx;
	height: 40rpx;
	position: absolute;
	top: 6rpx;
	right: 6rpx;
}
.relation-back{
	background-color: #f7f7f7 !important;
	color: #000000 !important;
}
.over-text{
	color: #ed6b51 !important;
}
</style>