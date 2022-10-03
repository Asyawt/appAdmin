<template>
  <!-- 上传商品 -->
  <view class="goods-top">
    <view class="">
      <input type="text" v-model="cover.goods_title" placeholder="请输入商品标题" placeholder-class="pl-text">
    </view>
    <view class="goods-image">
      <view class="upload-Image" v-if="cover.sto_image.length>0" v-for="(item,index) in cover.sto_image" :key="index">
        <image :src="item.image" @click="previewImg(item.image)" mode="aspectFill"></image>
        <image @click="deleteImg(index)" src="../../static/detail/shanchu-goods.svg" mode="widthFix"></image>
      </view>
      <view class="">
        <image @click="upLoadImg" src="../../static/detail/shuxing-img.png" mode="aspectFill"></image>
      </view>
    </view>
  </view>
  <!-- 上传短视频 -->
  <view class="goods-top goods-video">
    <view class="video-title">
      <text>上传短视频(可选)</text>
      <image v-if="video.sto_video!=''" src="../../static/detail/shanchu.svg" mode="" @click="video.sto_video=''"></image>
    </view>
    <view class="goods-image">
      <view class="" v-if="video.sto_video==''">
        <image  src="../../static/detail/shuxing-img.png" mode="aspectFill" @click="upLoadVideo"></image>
      </view>
      <video v-if="video.sto_video!=''" :src="video.sto_video" objectFit="cover"></video>
    </view>
  </view>
<!-- 所属分类 -->
<view class="specs-view">
  <!-- :range="" @change="" picker选择器 -->
  <picker mode="selector" @change="selectSort" :range="sortArr" range-key="sort_name">
  <view class="sort-title specs-title">
    <text>所属分类</text>
    <text>{{selectSortVal}}</text>
    <image src="../../static/detail/xiangyou-jiantou.svg" mode="widthFix"></image>
  </view>
  </picker>
</view>
<!-- 价格库存 -->
<view class="specs-view price-stock">
  <view class="">
    <text>价格</text>
    <input type="digit" v-model="price" :disabled="formatData.specs_data.length==0?false:true" placeholder="请输入价格" placeholder-class="I-style" cursor-spacing="50">
    <text>元</text>
  </view>
  <view class="">
    <text>库存</text>
    <input type="number" v-model="stock" :disabled="formatData.specs_data.length==0?false:true" placeholder="请输入库存" placeholder-class="I-style" cursor-spacing="50">
    <text>件</text>
  </view>
</view>
<!-- 创建规格 -->
<view class="specs-view" @click="toSpecs">
  <view class="specs-title">
    <text>创建规格(可选)</text>
    <image src="../../static/detail/xiangyou-jiantou.svg" mode="widthFix"></image>
  </view>
  <view class="specs-image" v-if="formatData.specs_data.length==0">
    <image src="../../static/detail/guige-img.jpg" mode="widthFix"></image>
  </view>
  <!-- 已有规格展示 -->
  <view class="Se-specs S-flex" v-else v-for="(item,index) in formatData.specs_data" :key="index">
    <view class="">
      <image :src="item.image" mode="aspectFill"></image>
    </view>
    <view class="S-top">
      <view class="S-flex S-right">
        <text v-for="(i,indexs) in item.att_data" :key='indexs'>{{i.att_val}}</text>
      </view>
      <view class="S-flex S-right S-stock">
        <text>库存</text>
        <text>{{item.stock}}件</text>
      </view>
    </view>
    <view class="S-price">
     ￥{{item.price}}
    </view>
  </view>
</view>
<!-- 详情图 -->
<view class="specs-view">
  <view class="specs-title">
    <text>商品详情</text>
  </view>
  <view class="detail-image" v-if="detail.sto_detail.length>0" v-for="(item,index) in detail.sto_detail" :key="index">
    <image :src="item.image" mode="widthFix" @click="previewDetail(item.image)"></image>
    <image @click="delImg(index)" src="../../static/detail/shanchu-goods.svg" mode="widthFix"></image>
  </view>
  <view class="specs-image">
    <image @click="upLoadDetail" src="../../static/detail/shpin-img.jpg" mode="widthFix"></image>
  </view>
</view>
<!-- 底部按钮 -->
<view class="" style="height: 160rpx;"></view>
<view class="newly-added-view back">
    <view class="newly-added"  @click="submit">
     上架售卖
    </view>
  </view>
</template>

<script setup>
  import {watch,reactive,toRefs,onMounted,nextTick} from 'vue'
  import {sku_val} from '../../Acc-config/responseData.js'
  import {Feedback,Uploads} from '../../Acc-config/media.js'
  import {init} from '@/Acc-config/init.js'
  const toSpecs=()=>{
    wx.navigateTo({
      url:'/pages/specs/specs?sku='+JSON.stringify(formatData.specs_data)
    })
  }
  // 监听创建规格后返回上一页面传递的值
  const priceAndStock=reactive({price:'',stock:''})
  const {price,stock}=toRefs(priceAndStock)
  const formatData=reactive({specs_data:[]})
  watch(sku_val,(newval,oldval)=>{
    formatData.specs_data=newval
    // 取规格里价格最小的作为封面展示，先按价格进行排序，再取出最大最小
    const sortPrice=newval.sort((a,b)=>{return a.price-b.price})
   priceAndStock.price=sortPrice[0].price
    // 总库存
    const allStock=newval.reduce((prep,item)=>{
      prep+=item.stock
      return prep
    },0)
    priceAndStock.stock=allStock
  })
  // 上传图片
  const cover=reactive({goods_title:'',sto_image:[]})
  const upLoadImg=async()=>{
    // 这里不需要点击一次选择本地相册就上传到云存储，而是最后再一起上传，暂时先展示在本地
   const local=await new Uploads().upLoadImgorVideo(9)
   // console.log(local);
   local.forEach((item)=>{
     cover.sto_image.push({image:item.tempFilePath})
   })
  }
  // 删除横幅图片
  const deleteImg=(index)=>{
    cover.sto_image.splice(index,1)
  }
  // 预览横幅图片
  const previewImg=(img)=>{
    let arr=[]
    cover.sto_image.forEach(item=>{
      arr.push(item.image)
    })
    // 第二个参数是个字符串数组
    new Uploads().previewImg(img,arr)
  }
  // 上传短视频
  const video=reactive({sto_video:''})
  const upLoadVideo=async()=>{
    const local=await new Uploads().upLoadImgorVideo(1,'video')
    // console.log(local);
    video.sto_video=local[0].tempFilePath
  }
// 所属分类
onMounted(async()=>{
  let db=await init()
  const res=await db.database().collection('goods_sort').field({_openid:false}).get()
  // console.log(res);
     sortData.sortArr=res.data
})
const sortData=reactive({
  sortArr:[],
  selectSortVal:'',
  selectSortId:'', //分类的id,用于提交数据时对选中的分类下的quantity++
})
const {sortArr,selectSortVal}=toRefs(sortData)
const selectSort=(e)=>{
  // console.log(sortData.sortArr[e.detail.value]);
 sortData.selectSortVal=sortData.sortArr[e.detail.value].sort_name
 sortData.selectSortId=sortData.sortArr[e.detail.value]._id
}
// 上传详情图
const detail=reactive({
  sto_detail:[]
})
const upLoadDetail=async()=>{
  const local=await new Uploads().upLoadImgorVideo(9)
  local.forEach(item=>{
    detail.sto_detail.push({image:item.tempFilePath})
  })
}
// 删除图片
const delImg=(index)=>{
  detail.sto_detail.splice(index,1)
}
// 预览图片
const previewDetail=(img)=>{
  let arr=[]
  detail.sto_detail.forEach(item=>{
    arr.push(item.image)
  })
    new Uploads().previewImg(img,arr)
}
// 提交，上架售卖校验，把数据上传到数据库
const submit=()=>{
  switch(true){
    case cover.goods_title=='':new Feedback('请填写标题').toast()
    break;
    case cover.sto_image.length==0:new Feedback('请上传商品图片').toast()
    break;
    case sortData.selectSortVal=='':new Feedback('请选择分类').toast()
    break;
    case priceAndStock.price=='':new Feedback('请输入价格').toast()
    break;
    case priceAndStock.stock=='':new Feedback('请输入库存').toast()
    break;
    case detail.sto_detail.length==0:new Feedback('请上传详情图').toast()
    break;
    default: database()
  }
}
const database=async()=>{
  wx.showLoading({title: '加载中',mask:true})
  // 1.上传横幅
  const res_banner=await new Uploads().allUpload(cover.sto_image,'image')
  // 2.上传详情图
   const res_detail=await new Uploads().allUpload(detail.sto_detail,'image')
  // 3.短视频，是否存在，再上传
  const res_video=video.sto_video==''?'':await new Uploads().uploadCloud(video.sto_video)
  // 整理所有数据
  // console.log(res_banner);
  let obj=
	{
    // _id 数据库帮我们生成
		goods_title:cover.goods_title,
		goods_banner:res_banner,//[{商品横幅,image:''}]
		goods_cover:res_banner[0].image,//'商品封面图,商品横幅的第一张图片作为封面图'
		video_url:res_video,//'短视频链接'
		category:sortData.selectSortVal,//'所属分类'
		goods_price:Number(priceAndStock.price),//'商品价格'
		stock:Number(priceAndStock.stock),//'库存'
		sku:formatData.specs_data.length==0?false:true,//'true or false 是否有sku规格'
		goods_details:res_detail,//[{商品详情图,image:''}]
		sold:0,//'商品已售多少'
		shelves:true,//'商品上架与否 true or false'
		seckill:false//'该商品是否参与秒杀 true or false'
	}
  // 这里我们把商品规格（即sku）的数据抽离了出来，重新生成一个数据库，生成这个数据库需要用到对应商品的_id,因此这里我们需要先上传商品的总体的数据拿到这个_id,再赋给商品规格sku的数据库，进行一个关联操作
try{
  let db= await init()
  // 这里goodsInfo数据库集合权限为所有用户都可读写，原因是用户端在下单的时候商品的库存应当减少为总的减去下单数，来操作数据库
  const res=await db.database().collection('goodsInfo').add({data:obj})
  // 商品规格的数据库集合的权限也一样
  // console.log('上传成功');
  // console.log(res);
  // 获取商品的_id,上传sku到数据库
  if(formatData.specs_data.length>0){
    await db.database().collection('skuInfo').add({data:{
      sku_id:res._id,
      sku:formatData.specs_data
    }})
  }
  // 对选择的分类该分类的数量+1（相当于添加了这类的一种商品就+1）
  // 数据库的某个字段自增用到。。。
  const _ = db.database().command
  await db.database().collection('goods_sort').doc(sortData.selectSortId).update({data:{
    quantity:_.inc(1)
  }})
   new Feedback('上传成功','success').toast()
   cover.goods_title=''
   cover.sto_image=[]
   priceAndStock.price=''
   priceAndStock.stock=''
   detail.sto_detail=[]
}catch(e){
  //TODO handle the exception
  new Feedback('提交失败').toast()
}
  
}
</script>
<style>
page{
	background-color: #f2f2f2;
}
.goods-top{
	background-color: #FFFFFF;
	padding: 20rpx;
}
.pl-text{
	font-weight: 100;
}
.goods-top input{
	padding: 30rpx 0;
	font-weight: bold;
}
.goods-image{
	display: flex;
	flex-wrap: wrap;
}
.goods-image view{
	width: calc(33.3% - 5rpx*2);
	height: 200rpx;
	margin: 5rpx;
}
.goods-image image{
	width: 100%;
	height: 100%;
	display: block;
	border-radius: 7rpx;
}
.upload-Image {
	position: relative;
}
.upload-Image image:nth-child(2){
	width: 30rpx !important;
	height: 30rpx !important;
	position: absolute;
	top: 0;
	right: 0;
}
/* 视频 */
.goods-video{
	margin-top: 40rpx;
	font-weight: bold;
}
.video-title{
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}
.video-title image{
	width: 35rpx;
	height: 35rpx;
	display: block;
}
.goods-video video{
	height: 400rpx;
	width: 100%;
}
/* 所属分类 */
.sort-title text:nth-child(1){
	flex: 1;
}
.sort-title text:nth-child(2){
	padding-right: 20rpx;
}
/* 价格，库存 */
.price-stock view{
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
}
.price-stock view:nth-child(1){
	padding-bottom: 20rpx;
}
.price-stock text:nth-child(1){
	flex: 1;
}
.price-stock input{
	padding: 0 20rpx;
	text-align: right;
}
.I-style{
	color: #a8a8a8;
	font-size: 28rpx !important;
}
/* 规格 */
.specs-view{
	background-color: #FFFFFF;
	margin: 40rpx 20rpx;
	border-radius: 8rpx;
}
.specs-title image{
	width: 35rpx;
	height: 35rpx;
	display: block;
}
.specs-title{
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	font-weight: bold;
}
.specs-image image{
	width: 100%;
	height: 100%;
	display: block;
	border-radius: 8rpx;
}
.specs-image{
	padding: 20rpx;
}
.detail-image{
	position: relative;
}
.detail-image image:nth-child(1){
	width: 100%;
	height: 100%;
	display: block;
}
.detail-image image:nth-child(2){
	width: 40rpx;
	height: 40rpx;
	position: absolute;
	top: 5rpx;
	right: 5rpx;
}
/* 已选规格 */
.S-flex{
	display: flex;
	align-items: center;
}
.S-flex image{
	width: 100rpx;
	height: 100rpx;
	display: block;
	border-radius: 8rpx;
}
.Se-specs{
	padding: 20rpx;
	border-bottom: 1rpx solid #e6e6e6;
}
.S-top{
	flex: 1;
}
.S-top view:nth-child(1){
	padding-bottom: 10rpx;
}
.S-right text{
	padding: 0 20rpx;
}
.S-stock{
	color: #c3c3c3;
}
.S-price{
	font-weight: bold;
}
/* 底部 */
.back{
	background-color: #fafafa !important;
	padding-top: 10rpx !important;
}
</style>