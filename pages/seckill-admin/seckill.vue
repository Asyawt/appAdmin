<template>
  <view class="sort-Header sort-position" v-if="data.seckill_goods.length>0">
    <text>封面图</text>
    <text>标题</text>
    <text>操作</text>
  </view>
    <view class="" style="height: 90rpx;"></view>
    <view class="sort-Header sort-table" v-for="(item,index) in data.seckill_goods" :key="index">
      <image :src="item.cover" mode="aspectFill"></image>
      <text>{{item.title}}</text>
      <text class="sort-but" @click="Delete(item._id,index)">删除</text>
    </view>
    <!-- 数据为空 -->
    <view class="Tips" v-if="data.seckill_goods.length==0">
      <text v-if='load'>加载中...</text>
     <text v-else>你还没有秒杀数据</text>
    </view>
    <!-- 底部 -->
    <view class="" style="height: 300rpx;"></view>
    <view class="newly-added-view">
      <view class="newly-added" @click="show=true">
        创建秒杀
      </view>
    </view>
    <!-- 弹窗 -->
    <page-container :show='show' bindenter='onEnter'>
      <view class="space-view">
        <view class="modify-sub modify-padding">
          <image @click="show=false" src="../../static/detail/guanbi.svg" mode="widthFix"></image>
          <text >创建秒杀</text>
          <text @click="submit">提交</text>
        </view>
        <view class="upload-cover">
          <image v-if="Time.se_cover==''" @click="upImg" src="../../static/detail/miaosha-img.jpg" mode="aspectFill"></image>
          <image :src="Time.se_cover" mode=""></image>
          <image @click="Time.se_cover=''" v-if="Time.se_cover!=''" src="../../static/detail/shanchu-goods.svg" mode="widthFix"></image>
        </view>
        <view class="seckill-input">
          <input v-model="Time.se_title" type="text" placeholder="请输入标题" placeholder-class="input-color"  cursor-spacing="50">
          <input v-model="Time.se_price" type="digit" placeholder="请输入秒杀价" placeholder-class="input-color"  cursor-spacing="50">
        </view>
        <!-- 设置时间 -->
        <view class="pick-Outer">
          <!-- 开始时间 -->
          <view class="pick-view Underline">
            <view class="">
              <text>设置开始时间</text>
              <!-- :range="" @change="" -->
              <picker @change="saveTime($event,'start')" @columnchange="colStartAndEnd" class="flex-left" mode="multiSelector" :range="Time.multiArray" :value="Time.multiIndex" range-key="name">
                <view>
                  <text class="pick-time">{{Time.startTime}}</text>
                  <image src="../../static/detail/xiangyou-jiantou.svg" mode="widthFix"></image>
                </view>
              </picker>
            </view>
          </view>
          <!-- 结束时间 -->
          <view class="pick-view">
            <view class="pick-view">
              <text>设置结束时间</text>
              <picker @change="saveTime($event,'end')" @columnchange="colStartAndEnd" class="flex-left" mode="multiSelector" :range="Time.multiArray" :value="Time.multiIndex" range-key="name">
                <view>
                  <text class="pick-time">{{Time.endTime}}</text>
                  <image src="../../static/detail/xiangyou-jiantou.svg" mode="widthFix"></image>
                </view>
              </picker>
            </view>
          </view>
        </view>
      <!-- 关联商品 -->
      <view class="relation relation-back" @click="addGoods">
        <text>关联商品</text>
        <text class="over-text">{{Time.re_goods.title==''?'添加':Time.re_goods.title}}</text>
      </view>
      <view style="height: 200rpx;"></view>
      </view>
    </page-container>
</template>

<script setup>
import {init} from '@/Acc-config/init.js'
import {ref,reactive,onMounted,watch, nextTick} from 'vue'
import {Feedback,Uploads} from '@/Acc-config/media.js'
import {date} from '@/Acc-config/date.js'
import {current,selDays,selmonthanddays,c_month} from '@/Acc-config/ca-time.js'
import moment from 'moment'
import { getCurrentInstance } from 'vue'
const internalInstance = getCurrentInstance()
const ress=internalInstance.appContext.config.globalProperties
console.log(ress);
moment.locale('zh-cn')
//这里调用，初始化当前的默认年月日
current()
function onEnter(){}
onMounted(()=>{
  getSeckillData()
})
let show=ref(false)
const data=reactive({
  seckill_goods:[]
})
//解决加载页面时显示加载中效果的代码，而不是显示没有数据
 const load=ref(true)
  let acc=true
 watch(()=>data.seckill_goods,()=>{
   if(acc){
     load.value=false
     acc=false
   }
 })
//
const getSeckillData=async()=>{
  let db=await init()
  const res=await db.database().collection('seckill').get()
  data.seckill_goods=res.data
}
const Time=reactive({
  // 这里需要给date再加上reactive,因为Time的reactive只会做一层的响应式，
  // 而这里的date是个二维数组，我们改变的值是date数组里数组项的值，vue检测不到，我们只有改变date的值，也就是内存地址，vue才检测到，因此需要再给date加上一层reactive,而加上后就会给date二维数组里面的每一项数组做响应式，当我们改变它的值，（这里是赋值操作），vue就会检测到
  //那么为什么上面初始化默认当前的年月日的时候date里面会有改变后的值呢？因为setup()的执行时间是最早开始执行的，在beforecreate之前，挂载之后执行，就调用了这个函数，就是date赋予了初始值，因此有数据，但后面的事件调用方法是个异步任务（不会立马执行，选择滚动后才执行），需要vue检测到数据变化才能渲染
  multiArray:date,//多列选择器picker数据
  multiIndex:[0,0,0,0,0],//默认选中range中的每一项的值的索引
  se_cover:'',//封面图
  se_title:'',//标题
  se_price:'',//秒杀价格
  startTime:'',
  endTime:'',
  re_goods:{
    title:'',//关联商品的标题
    goods_id:'',//关联商品的id
    video_url:'',//关联商品的短视频
    ori_price:''//关联商品的原价
  },
  selDate:[{'year':date[0][0].time,'month':date[1][0].time}],//用于存储选中的年月的数据，默认当前年月
  ban:false
})
// 上传封面图
const upImg=async()=>{
  const local=await new Uploads().upLoadImgorVideo()
  wx.showLoading({title:'正在上传',mask:true})
  const res=await new Uploads().uploadCloud(local[0].tempFilePath)
  Time.se_cover=res
  wx.hideLoading()
}

// 设置开始时间，滚动时触发
const colStartAndEnd=(e)=>{
  // console.log(e);
  const res=e.detail
  curNewDays(res)
}
// 重新计算当滚动年，月的时候某年某月的天数,某年的月份
const col=reactive({
  cols:0
})
const curNewDays=(res)=>{
  if(res.column==0){
    // 选中滚到今年当前年，要做判断，因为可能回拉,滚的是年
    Time.selDate[0].year=date[res.column][res.value].time
    selmonthanddays(Time.selDate)
    Time.selDate[0].month=date[1][col.cols].time 
      // console.log('11x');
      // console.log(res.value); 
      // console.log(dates);
    selDays(Time.selDate)
  }else if(res.column==1){
    // 滚动选择的是月份
  Time.selDate[0].month=date[res.column][res.value].time
  if(res.value>12-c_month){
      col.cols=0
  }else{
    col.cols=res.value
  }
  selDays(Time.selDate)
  }
  // if(res.column==0 || res.column==1){
  // selDays(Time.selDate)
  // }
  
  
}
//点击确定保存选择的时间
const saveTime=(e,val)=>{
  // console.log(e);
  // console.log(val);
  const RES=e.detail.value
  subConfirm(RES,val)
}
// 点击确定
const subConfirm=(RES,val)=>{
  const year=date[0][RES[0]].time
  const month=date[1][RES[1]].time
  const day=date[2][RES[2]].time
  const hour=date[3][RES[3]].time
  const min=date[4][RES[4]].time
  const sel_res=year+'/'+month+'/'+day+'  '+hour+':'+min
  if(val=='start'){
    Time.startTime=sel_res
  }else{
    Time.endTime=sel_res
    
  }
}
//监听结束时间是否小于开始时间
watch([()=>Time.startTime,()=>Time.endTime],(newval,oldval)=>{
  //当两个都填写上时判断,利用时间戳来判断两个时间的大小
  if(newval[0]!='' && newval[1]!=''){
    const start=moment(newval[0],'YYYY/MM/DD hh:mm:ss').unix()
    const end=moment(newval[1],'YYYY/MM/DD hh:mm:ss').unix()
     if(start>=end){
      Time.endTime='结束时间早于开始时间'
      Time.ban=false
     }else if(start<end){
       Time.ban=true
     }
  }
})
//关联商品
const addGoods=()=>{
  const sel_id=data.seckill_goods.map(item=>item.goods_id)
  wx.navigateTo({
    url:'/pages/goods_list/list?selId='+JSON.stringify(sel_id)
  })
}
// 监听关联的传递的值
import {select_goods} from '@/Acc-config/responseData.js'
watch(select_goods,(newval)=>{
  Time.re_goods.title=newval.goods_title
  Time.re_goods.goods_id=newval.id
  Time.re_goods.video_url=newval.video_url
  Time.re_goods.ori_price=newval.goods_price
})
// 提交校验，上传数据到数据库
const submit=()=>{
  switch(true){
    case Time.se_cover=='':new Feedback('请上传封面图','none').toast()
    break;
    case Time.se_title=='':new Feedback('请输入标题','none').toast()
    break;
    case Time.se_price=='':new Feedback('请输入秒杀价','none').toast()
    break;
    case Time.startTime=='' || Time.endTime=='' :new Feedback('请设置秒杀时间','none').toast()
    break;
    case Time.ban==false:new Feedback('结束的时间早于开始时间','none').toast()
    break;
    case Time.re_goods.title=='':new Feedback('请关联一个商品','none').toast()
    break;
    default:database()
  }
}
// 上传数据
const database=async()=>{
  wx.showLoading({title:'正在提交',mask:true})
  // unix()moment#unix 输出 Unix 时间戳（自 Unix 纪元以来的秒数） 此值的下限为最接近的秒数，且不包括毫秒部分。
  const start_time=moment(Time.startTime,'YYYY/MM/DD hh:mm:ss').unix()
  const end_time=moment(Time.endTime,'YYYY/MM/DD hh:mm:ss').unix()
  // 提交到数据库设计的字段
  let obj={
    cover:Time.se_cover,
    title:Time.se_title,
    ori_price:Time.re_goods.ori_price,
    price_spike:Number(Time.se_price),
    seckill_time:{start_time,end_time},
    goods_id:Time.re_goods.goods_id,
    video_url:Time.re_goods.video_url
  }
  try{
    let db=await init()  
    await db.database().collection('seckill').add({data:obj})
    // 查询该商品将秒杀字段改为true
    await db.database().collection('goodsInfo').doc(Time.re_goods.goods_id).update({data:{seckill:true}})
    show.value=false
    getSeckillData()
    new Feedback('提交成功','success').toast()
    Time.se_cover=''
    Time.se_title=''
    Time.se_price=''
    Time.startTime=''
    Time.endTime=''
    Time.re_goods.title=''
  }catch(e){
    //TODO handle the exception
    console.log(e);
     new Feedback('提交失败').toast()
  }
}
// 删除
const Delete=async(id,index)=>{
  try{
    let db=await init()
    await db.database().collection('seckill').doc(id).remove()
    data.seckill_goods.splice(index,1)
    new Feedback('删除成功','success').toast()
  }catch(e){
    //TODO handle the exception
     new Feedback('删除失败').toast()
  }
}


</script>

<style scoped>
	.sort-table text:nth-child(2) {
		color: #333333 !important;
		background-color: initial !important;
		border-radius: 0 !important;
		padding: 0 !important;
		font-size: 30rpx !important;
	}

	.modify-padding {
		padding-bottom: 60rpx !important;
	}

	.relation-back {
		background-color: #f7f7f7 !important;
		color: #000000 !important;
	}

	.over-text {
		color: #ed6b51 !important;
	}

	.upload-cover {
		position: relative;
	}

	.upload-cover image:nth-child(1) {
		width: 100%;
		height: 380rpx;
		display: block;
	}

	.upload-cover image:nth-child(2) {
		width: 40rpx;
		height: 40rpx;
		position: absolute;
		top: 6rpx;
		right: 6rpx;
	}

	.seckill-input input {
		padding: 20rpx;
		background-color: #f7f7f7;
		margin-top: 30rpx;
		border-radius: 7rpx;
	}

	/deep/ .input-color {
		color: #cccccc;
	}

	.pick-Outer {
		background-color: #f7f7f7;
		margin-top: 30rpx;
		padding: 0 20rpx;
		border-radius: 7rpx;
	}

	.pick-view {
		padding: 20rpx 0;
	}

	.pick-view image {
		display: block;
		width: 30rpx;
		height: 30rpx;
		margin-left: 20rpx;
	}

	.pick-view view:nth-child(1) {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.flex-left {
		flex: 1;
	}

	.flex-left view {
		justify-content: flex-end !important;
	}

	.Underline {
		border-bottom: 1rpx solid #ededed;
	}

	.pick-time {
		font-size: 27rpx;
	}
</style>
