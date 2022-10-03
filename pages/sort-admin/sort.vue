<template>
<view class="" style="padding-bottom: 160rpx;">
  <view class="sort-Header sort-position" v-if="goods_sort.length>0">
    <text>分类</text>
    <text>操作</text>
  </view>
  <view class="" style="height: 90rpx;"></view>
  <view class="sort-Header sort-table " v-for="(item,index) in goods_sort" :key="index" >
    <text class="occupy">{{item.sort_name}}</text>
    <text class="sort-but" @click="deleteSort(item,index)">删除</text>
  </view>
  <!-- loading -->
  <Loading v-if="showLoading"></Loading>
  <!--没有数据啦-->
  <view class="showNull" v-if="showNull">
    没有数据啦！
  </view>
</view>
<!-- 数据为空的提示-->
<view class="nulldata" v-if="goods_sort.length==0">
  <text v-if='load'>加载中...</text>
  <text v-else>你还没有分类列表!</text>
</view>
  <!-- 底部新增 -->
  <view class="newly-added-view">
    <view class="newly-added" @click="show=true">
      新增分类
    </view>
  </view>
    <!-- 弹框 -->
    <page-container :show='show' position='bottom' bindenter='onEnter' bindclickoverlay='onClickoverlay'>
     <view class="space-view" >
       <view class="modify-sub">
         <image src="/static/detail/guanbi.svg" mode="widthFix" @click="show=!show"></image>
       </view>
       <view class="att-input">
         <input type="text" placeholder="输入分类" v-model="sorts" placeholder-class="I-style" cursor-spacing="50">
       </view>
       <view class="newly-added classif" @click="submitSort">
         提交
       </view>
     </view> 
    </page-container>
  
</template>

<script setup>
  import {ref,onMounted,reactive,toRefs,watch} from 'vue'
  import {init} from '../../Acc-config/init.js'
  import {Feedback} from '@/Acc-config/media.js'
  import {onReachBottom} from '@dcloudio/uni-app'
  import Loading from '@/component/loading.vue'
  // 目前uni还不支持这个组件，因此该事件不会触发，但有效果
  // 弹框进入时触发
  const onEnter=(e)=>{
    console.log(e);
  }
  // 点击遮罩层触发
  const onClickoverlay=()=>{}
  // 控制弹框弹出
  const show=ref(false)
  onMounted(()=>{
    getsort()

  })
  // 
  const data=reactive({
    goods_sort:[],
    sorts:'',
  })
  const {goods_sort,sorts,allData}=toRefs(data)
  //解决加载页面时显示加载中效果的代码，而不是显示没有数据
   const load=ref(true)
    let acc=true
   watch(()=>data.goods_sort,()=>{
     if(acc){
       load.value=false
       acc=false
     }
   })
  //
  // 
  const getsort=async()=>{
    const db=await init()
    const res=await db.database().collection('goods_sort').limit(10).field({_openid:false}).get()
    if(res){
      data.goods_sort=res.data
    // Object.assign(data.origin_sort,data.goods_sort)
    console.log(data.goods_sort);
    }
  }

  // 提交按钮
  const submitSort=async()=>{
    console.log(data.sorts);
    if(!data.sorts){
    new Feedback('请输入分类！','none').toast()
    return
    }
     const db=await init()
     // 查询输入的分类是否已经存在
     const checkData=await db.database().collection('goods_sort').where({sort_name:data.sorts}).get()
 
     if(checkData.data.length>0){
        new Feedback('已经存在该分类商品！','none').toast()
         
     }else{
         const addData=await db.database().collection('goods_sort').add({data:{sort_name:data.sorts,quantity:0}})
     // getsort()
     data.goods_sort.push({quantity: 0,sort_name:data.sorts,_id:addData._id })
         console.log(addData);
         if(addData){
          data.sorts='' 
          show.value=false
         }
     }
  }
// 上拉刷新
  let  showNull=ref(false)
  let  showLoading=ref(false)
  let num=ref(0)
onReachBottom(async()=>{
  showLoading.value=true
  showNull.value=false
  const db=await init()
    // 获取全部数据
  const resAll=await db.callFunction({
    name:'getAllData',
    data:{}
  })
    if(resAll.result.res.data.length<=data.goods_sort.length){
    showLoading.value=false
    showNull.value=true
    }else{
    num.value++
    let sk=num.value*10
    const res=await db.database().collection('goods_sort').limit(10).skip(sk).field({_openid:false}).get()
    if(res){
    const merge=[...data.goods_sort,...res.data]
    // 数组对象去重
    //    方法1
  // let obj=reactive([])
  //   merge.forEach((item)=>{
  //   const res=obj.some((i)=>{
  //       return i['sort_name']==item.sort_name
  //     })
  //     if(!res){
  //       obj.push(item)
  //     }
  //   })
   let obj={}
   const newdata=merge.reduce((prep,item)=>{
     if(!obj[item._id]){
       prep.push(item)
       obj[item._id]=1
     }
     return prep
   },[])
    data.goods_sort=newdata
    showLoading.value=false
    }
  }

})

// 删除
const deleteSort=(item,index)=>{
   wx.showModal({
      title: '提示',
      content: `确认要删除${item.sort_name}吗？`,
      success: async(res)=> {
        if (res.confirm) {
         if(item.quantity>0){
           new Feedback('请先删除该分类下的商品','none').toast()
           return 
         }
         try{
           let db=await init()
          await db.database().collection('goods_sort').doc(item._id).remove()
           data.goods_sort.splice(index,1)
         }catch(e){
           //TODO handle the exception
           new Feedback('删除失败').toast()
         }
  
        } else if (res.cancel) {
        
        }
      }
    })


}

</script>

<style scoped>
  .nulldata{
    color: #cccccc;
    text-align: center;
    margin-top: 60rpx;
  }
.I-style{
	color: #cccccc;
}
.att-input{
	background-color: #f7f7f7;
	padding: 20rpx;
	border-radius: 7rpx;
}
.classif{
	margin: 60rpx 0 !important;
}
.modify-sub{
	padding-bottom: 60rpx !important;
}
.showNull{
  text-align: center;
  color: #cccccc;
  margin: 10rpx 0;
  height: 40rpx;
}
</style>