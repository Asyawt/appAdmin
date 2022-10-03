<template>
  <!-- 添加规格顶部 -->
  <view class="attribute">
    <view class="edit">
      <text>请给商品规格设置合适的属性</text>
      <text @click="show=true">编辑</text>
    </view>
    <view class="checkbox">
      <checkbox-group name="" style="display: flex;" @change="changeChecked">
        <label v-for="(item,index) in checkboxData.boxData" :key="index">
          <checkbox :value="item.attr" :checked="item.checked" color="#e96c56" /><text>{{item.name}}</text>
        </label>
      </checkbox-group>
    </view>
  </view>
  <!-- 规格 -->
  <view class="attribute gener" v-for="(item,index) in sku" :key="index">
    <view class="edit specs-delete">
      <text>规格{{item.title}}</text>
      <text v-if="sku.length>1" @click="deleteSku(index)">删除</text>
    </view>
    <view class="edit entry" v-for="(i,indexs) in item.att_data" :key="indexs">
      <text>{{i.att_name}}</text>
      <input v-model="i.att_val" type="text" :placeholder="'请输入'+i.att_name" placeholder-class="I-style" cursor-spacing="50">
    </view>
    <view class="edit entry">
      <text>价格</text>
      <input v-model="item.price" type="digit" placeholder="请输入价格" placeholder-class="I-style" cursor-spacing="50">
      <text>元</text>
    </view>
    <view class="edit entry">
      <text>库存</text>
      <input v-model="item.stock" type="number" placeholder="请输入库存" placeholder-class="I-style" cursor-spacing="50">
      <text>件</text>
    </view>
    <!-- 上传图片 -->
    <view class="specs-image">
     <image src="../../static/detail/shuxing-img.png" mode="aspectFill" v-if="item.image==''" @click="upLoadImg(index)"></image>
     <image :src="item.image" mode="" v-else @click="preImg(item.image)"></image>
     <image @click="deleteImg(index)" src="../../static/detail/shanchu.svg" mode="widthFix" class="delete-img" v-if="item.image!=''"></image>
    </view>
  </view>
  <!-- 添加规格 -->
  <view class="attribute gener new-specs" @click="newSpecs">
    <image src="../../static/detail/jiahao.svg" mode="widthFix"></image>
    <text>规格</text>
  </view>
  <!-- 弹框 -->
  <page-container :show='show' bindenter='onEnter'>
    <view class="space-view">
      <view class="modify-sub">
        <image src="../../static/detail/guanbi.svg" mode="widthFix" @click="show=false"></image>
        <text>修改属性</text>
        <text @click="submitAttr">提交</text>
      </view>
      <view class="att-input" v-for="(item,index) in sto_att.attobj" :key="index">
        <text>属性{{item.title}}</text>
        <input v-model="item.att" type="text" placeholder="请输入属性" placeholder-class="I-style" cursor-spacing="50">
      </view>
    </view>
  </page-container>
  <!-- 底部按钮 -->
  <view class="" style="height: 200rpx;"></view>
  <view class="newly-added-view">
    <view class="Submit">
      <text @click="cancel">取消</text>
       <text @click="save">保存</text>
    </view>
  </view>
</template>

<script setup >
  import {ref,reactive,toRefs,watch,nextTick} from 'vue'
  import {Uploads,Feedback} from '../../Acc-config/media.js'
  import {sku_val} from '../../Acc-config/responseData.js'
  import {onLoad} from '@dcloudio/uni-app'
  onLoad((e)=>{
    // 接受传递过来的参数
    // console.log(JSON.parse(e.sku));
    const data=JSON.parse(e.sku)
    if(data.length<=0) return

    // 1.把数据传给整理给弹框的属性
    const tankuang=data[0].att_data.map((item,index)=>{
      return {att:item.att_name,title:index+1}
    })
    sto_att.attobj=tankuang
    if(data[0].att_data.length==1){
       sto_att.attobj.push({att:'',title:2},{att:'',title:3})
    }else if(data[0].att_data.length==2){
      sto_att.attobj.push({att:'',title:3})
    }
    
    //整理多选框的数据并渲染,并且生成新增属性的结构，因为这个结构不是原本存在的，需要首次通过att_data里面的值，进行首次渲染
    // 而第一次进来渲染的时候，新增属性的结构是通过数据的变化二次渲染的，此时还没来的急渲染上一次的结构，下面的赋值操作代码就执行了，没有结构，下面的代码就失效了
    submitAttr()
    // 整理规格的数据
   nextTick(()=>{
      sku_data.sku=data
   })
    // console.log( sku_data.sku);
    
  })
  // 有了这个方法才有动画效果
  const onEnter=()=>{}
  const show=ref(false)
  // 存储sku数据
  const sku_data=reactive({
    // att_data {att_name:'',att_val:''}
    sku:[{title:1,att_data:[],price:'',stock:'',image:''}]
  })
  const {sku}=toRefs(sku_data)
  // 创建弹框的属性的数据
  const sto_att=reactive({
    attobj:[{att:'',title:1},{att:'',title:2},{att:'',title:3}]
  })
  // 提交收集的属性数据
  const checkboxData=reactive({boxData:[]})
  const submitAttr=()=>{
    // 当重新设置属性的时候，点击提交按钮应当把当前已添加的规则去除，只留下一个规格进行填写
    sku_data.sku=[{title:1,att_data:[],price:'',stock:'',image:''}]
    // 过滤表单没有填写的数据
    const filterData=sto_att.attobj.filter((item)=>{
      return item.att!=''
    })
    // console.log(filterData);
    // 这里newArr为局部变量，在函数执行时创建，执行完后销毁，因此这里再添加不会出现重复的数据
    const newArr=[]
    filterData.forEach((item)=>{
      newArr.push({attr:item.att,name:item.att,checked:true})
    })
    // console.log( checkboxData.boxData);
    checkboxData.boxData=newArr
    show.value=false
    // 计算生成动态规格
    calsku()
  }
   // 计算生成动态规格
  let new_att=[]
  const calsku=()=>{
    const filter_arr=checkboxData.boxData.filter((item)=>item.checked)
  // let new_att=[]
    new_att=filter_arr.map(item=>{return{att_name:item.attr,att_val:''}})
    sku_data.sku.forEach((item)=>{
      // 这里循环遍历new_att里面的数据，如果是直接赋值给item.att_data的每一项，那么拿到的每一项的数据，都指向同一内存地址即为new_att的地址，如果是浅拷贝那么修改任何一项的数据，所有项的数据都会同步，所以这里必须是深拷贝
      // 这里数组里面的对象是个复杂数据类型，浅拷贝拷贝的是引用地址，而我们使用的时候是通过每一项.att_name的方式访问，并不会改变其内存地址，因此当修改某一项的值（即当我们输入att_val值的时候），修改的是同一内存地址，所以会全部改变
      item.att_data=JSON.parse(JSON.stringify(new_att))
    })
  }
  // 新增规格
  const newSpecs=()=>{
    let num=sku_data.sku[sku_data.sku.length-1].title
    num++
    const new_sku={title:num,att_data:[],price:'',stock:'',image:''}
    sku_data.sku.push(new_sku)
    // 向att_data添加属性
    if(new_att.length>0){[
      sku_data.sku[sku_data.sku.length-1].att_data=JSON.parse(JSON.stringify(new_att))
  
    ]}
  }
// 删除规格
const deleteSku=(index)=>{
  sku_data.sku.splice(index,1)
  sku_data.sku.forEach((item,idx)=>{
    item.title=idx+1
  })
}

// check-group的change事件
const changeChecked=(e)=>{
  // checkbox-group中选中项发生改变时触发 change 事件，detail = {value:[选中的 checkbox 的value的数组]},只留下已选中的数组
  // console.log(e.detail.value);
  const value=e.detail.value
  checkboxData.boxData.forEach((item,index)=>{
    if(value.includes(item.name)){
      item.checked=true
    }else{
       item.checked=false
    }
  })
  // console.log(checkboxData.boxData);
}
// 监听checkboxData.boxData中checked属性的变化，调用calsku()重新整理赋值渲染的数据
watch(()=>checkboxData.boxData,(newval,oldval)=>{
  calsku()
},{deep:true})

// 上传图片
const upLoadImg=async(index)=>{
  try{
  // 调用手机相册，生成本地图片地址，浏览打不开
   let local= await new Uploads().upLoadImgorVideo()
   wx.showLoading({title:'正在上传...',mask:true})
  // 把本地的图片地址上传到云存储，拿到图片的整理成https形式的‘fileID’,因为共享数据库的图片的fileID不能直接使用，需要转成https形式才能用
  let res= await new Uploads().uploadCloud(local[0].tempFilePath)
  // 将图片的https链接赋给image
  sku_data.sku[index].image=res
  wx.hideLoading()
  
  }catch(e){
  //TODO handle the exception
  new Feedback('上传失败').toast()
  }

}

// 删除图片
const deleteImg=(index)=>{
  sku_data.sku[index].image=''
}
// 预览图片
const preImg=(img)=>{
   new Uploads().previewImg(img,[img])
}
// 保存提交
const save=()=>{
  // 属性是否添加至少一个
  if(checkboxData.boxData.length==0){
    new Feedback('请添加属性').toast()
    return
  }else if(checkboxData.boxData.length>0){
   const a=checkboxData.boxData.every(item=>!item.checked)
    if(a){
       new Feedback('请勾选属性').toast()
       return
    }else {
    const b=sku_data.sku.filter((item)=>item.price=='')
    if(b.length>0){ new Feedback('规格填写不完整').toast()
    return
    }
    const c=sku_data.sku.filter((item)=>item.stock=='')
    if(c.length>0){ new Feedback('规格填写不完整').toast()
    return
    }
    const d=sku_data.sku.filter((item)=>item.image=='')
    if(d.length>0){ new Feedback('规格填写不完整').toast()
    return
    }  
    const e= sku_data.sku.some((item)=>{
      return item.att_data.some(i=>i.att_val=='')
     })
    if(e){
      new Feedback('规格填写不完整').toast()
      return
    } 
    // 把字符串的价格和库存转成数字
    sku_data.sku.forEach(item=>{
      item.price=Number(item.price)
      item.stock=Number(item.stock)
    })
    // console.log(sku_data.sku);
    // 页面传值，这里没有用到vuex
    sku_val.value=sku_data.sku
    // 返回上一页面
    wx.navigateBack({
      delta:1
    })
  }
  }
}
// 取消
const cancel=()=>{
  wx.navigateBack({
    delta:1
  })
}

</script>

<style>
page{
	background-color: #ededed;
}
.attribute{
	background-color: #f7f7f7;
	margin: 20rpx;
	padding: 20rpx 20rpx 0 20rpx;
	border-radius: 8rpx;
}
.edit{
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.edit text:nth-child(1){
	color: #a8a8a8;
}
.edit text:nth-child(2){
	color: #616990;
}
.checkbox{
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	padding-top: 20rpx;
}
.checkbox label{
	padding: 0 40rpx 20rpx 0;
}
/* 规格生成*/
.gener{
	background-color: #FFFFFF !important;
}
.specs-delete text:nth-child(1){
	color: #333333 !important;
	font-weight: bold;
}
.specs-delete{
	padding-bottom: 20rpx;
}
.entry{
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f1f1f1;
}
.entry text{
	color: #333333 !important;
}
.entry text:nth-child(1){
	flex: 1;
}
.entry input{
	padding: 0 20rpx;
	text-align: right;
}
.I-style{
	color: #a8a8a8;
}
.specs-image{
	display: flex;
	justify-content: space-between;
}
.specs-image image{
	display: block;
	width: 150rpx;
	height: 150rpx;
	border-radius: 8rpx;
	padding: 20rpx 0;
}
.delete-img{
	width: 40rpx !important;
	height: 40rpx !important;
}
/* 新增规格 */
.new-specs image{
	width: 50rpx;
	height: 50rpx;
	margin-right: 20rpx;
}
.new-specs{
	display: flex;
	align-items: center;
	color: #5f698c;
	padding: 30rpx !important;
}
/* 修改属性 */
.att-input{
	display: flex;
	align-items: center;
	padding: 40rpx 0;
	border-bottom: 1rpx solid #e7e7e7;
}
.att-input text{
	flex: 1;
}
.att-input input{
	text-align: right;
}
/* 底部提交 */
.Submit{
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin: 10rpx 20rpx 68rpx 20rpx;
}
.Submit text{
	padding: 15rpx 60rpx;
	border-radius: 10rpx;
}
.Submit text:nth-child(1){
	background-color: #f7f7f7;
	color: #ce6b4e;
	margin-right: 30rpx;
}
.Submit text:nth-child(2){
	background-color: #ed6b51;
	color: #FFFFFF;
}
</style>