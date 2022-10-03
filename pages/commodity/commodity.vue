<template>
  <view class="sort-view">
    <!-- 左边 -->
    <view class="sort-left">
      <text @click="select(index,item.sort_name,item._id)" :class="{addto:index==num}" v-for="(item,index) in sorts" :key="index">{{item.sort_name}}</text>
    </view>
    <!-- 右边 -->
     <view class="sort-right">
       <view class="Commodity" v-for="(item,index) in goods" :key="index">
         <view class="Com-image">
           <image :src="item.goods_cover" mode="scaleToFill"></image>
         </view>
         <view class="Com-price">
           <text class="Com-title over-text">{{item.goods_title}}</text>
           <text class="stock-view">库存{{item.stock}}</text>
          <text class="Real-price">￥{{item.goods_price}}.00</text>
          <view class="Button-rig">
            <text class="shelf-true" @click="getOffGoods(item._id,index)" v-if="item.shelves">下架</text>
            <text class="shelf-false" v-else>已下架</text>
          </view>
         </view>
       </view>
       <view class="loading-hei">
         <Loading v-if="showLoading"></Loading>
       </view>
        <view class="" style="height: 100rpx;"></view>
     </view>
  </view>
  <!-- 底部 -->
   <view class="manage">
     <text @click="toRootSort">管理分类</text>
     <text @click="toRootGoods">添加商品</text>
   </view>
</template>

<script setup>
  import {reactive,toRefs,ref} from 'vue'
  import {onShow,onReachBottom} from '@dcloudio/uni-app'
  import {init} from '@/Acc-config/init.js'
  import {Feedback} from '@/Acc-config/media.js'
  import Loading from '@/component/loading.vue'
  onShow(()=>{
    getGoodsInfo()
  })
  const data=reactive({
    sorts:[],//分类数据
    goods:[],//某一分类商品数据
    sort_name:'',//为了下拉刷新请求哪类商品
    sort_id:'',//点击分类的id
    num:0
  })
  const {sorts,goods,num}=toRefs(data)
  // 请求数据库数据
  // _id会默认返回，不会受field控制
  const fieldobj={goods_title:true,goods_cover:true,goods_price:true,stock:true,shelves:true}//只返回我们需要展示的字段
  const getGoodsInfo=async()=>{
    let db=await init()
    // 请求分类的数据
    const _ = db.database().command
    const goods_sort=await db.database().collection('goods_sort').where({quantity:_.gt(0)}).field({sort_name:true}).get()
    // console.log(goods_sort);
    // 请求默认第一个展示的类别的商品数据
    const sort_goods=await db.database().collection('goodsInfo').where({category:goods_sort.data[0].sort_name}).limit(10).field(fieldobj).get()
    // console.log(sort_goods);
    data.sorts=goods_sort.data
  data.sorts=goods_sort.data
    data.goods=sort_goods.data
    data.sort_name=goods_sort.data[0].sort_name
    data.sort_id=goods_sort.data[0]._id
    // 解决两个小bug
    data.num=0//解决用户先点击其他分类，再跳转到其他页面返回来的时候分类的样式不在第一个分类上面
    page_n.value=0//解决用户当在某分类商品下多次下拉刷新导致page_n的值在一直增大，但我们跳转到其他页面在返回的时候再次下拉刷新，无法请求到数据，因为 page_n后面没有数据了
}
// 商品分类选中请求数据
const select=async(index,sort_name,id)=>{
   page_n.value=0
  data.num=index
  data.sort_name=sort_name
  data.sort_id=id
  let db=await init()
  const sort_goods=await db.database().collection('goodsInfo').where({category:sort_name}).limit(10).field(fieldobj).get()
  // 重新赋值渲染
  data.goods=sort_goods.data
}
// 下架商品
const getOffGoods=async(id,index)=>{
  try{
    let db=await init()
    // 先把数据库里的shelves字段改为false
    await db.database().collection('goodsInfo').doc(id).update({data:{shelves:false}})
    // 再把本地的渲染的数据改了
    data.goods[index].shelves=false
    // 下架后该类别商品的总数量即quantity数量减一
    const _ = db.database().command
    await db.database().collection('goods_sort').doc(data.sort_id).update({data:{quantity:_.inc(-1)}})
    
  }catch(e){
    //TODO handle the exception
    new Feedback('下架失败').toast()
  }
}
// 上拉加载
let showLoading=ref(false)
 let page_n=ref(0)
onReachBottom(async()=>{
  showLoading.value=true
  page_n.value++
  let sk=page_n.value*10
  let db=await init()
  const res=await db.database().collection('goodsInfo').where({category:data.sort_name}).limit(10).skip(sk).field(fieldobj).get()
  // 添加到原来数据后面
  data.goods=[...data.goods,...res.data]
   showLoading.value=false
})
// 跳转分类
function toRootSort(){
  wx.navigateTo({
    url:'/pages/sort-admin/sort'
  })
}
// 跳转新增商品
function toRootGoods(){
  wx.navigateTo({
    url:'/pages/goods_admin/goods_admin'
  })
}
</script>

<style scoped>
.sort-view{
	display: flex;
}
.sort-left{
	width: 200rpx;
	text-align: center;
	background-color: #f6f6f6;
	height: 100vh;
	position: fixed;
	left: 0;
	top: 0;
	bottom: 0;
}

.sort-left text{
	display: block;
	color: #5f5f5f;
	padding: 20rpx 0;
	border-bottom: 1px solid #FFFFFF;
	font-size: 28rpx;
}
.addto{
	background-color: #FFFFFF;
	font-weight: bold;
}
/* 右边 */
.sort-right{
	margin: 0 20rpx 0 220rpx;
	flex: 1;
}
.Com-image image{
	display: block;
	width: 150rpx;
	height: 150rpx;
	border-radius: 10rpx;
}
.Commodity text{
	display: block;
}
.Commodity{
	display: flex;
	margin-bottom: 50rpx;
}
.Com-price{
	flex: 1;
	padding-left: 20rpx;
}
.Com-price view{
	display: flex;
	justify-content: flex-end;
}
.Com-price view text:nth-child(2){
	margin-left: 50rpx;
}
.Com-title{
  padding-top: 10rpx;
	font-weight: bold;
}
.stock-view{
	padding: 10rpx 0;
	color: #c1c1c1;
	font-size: 26rpx;
}
.Real-price{
	color: #b1865b;
	font-weight: bold;
}
.Button-rig{
	padding-top: 20rpx;
}
.Button-rig text{
	border-radius: 7rpx;
	padding: 7rpx 20rpx;
	font-size: 26rpx;
}
.shelf-true{
	color: #FFFFFF;
	background-color: #E64340;
}
.shelf-false{
	background-color: #F8F8F8;
	color: rgba(0, 0, 0, 0.2);
}
/* 底部 */
.manage{
	position: fixed;
	bottom: 0;
	right: 0;
	left: 200rpx;
	display: flex;
	justify-content: space-between;
}
.manage text{
	width: 50%;
	text-align: center;
	padding: 20rpx 0;
}
.manage text:nth-child(1){
	background-color: antiquewhite;
}
.manage text:nth-child(2){
	background-color: aliceblue;
}
</style>