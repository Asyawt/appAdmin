import moment from 'moment'
moment.locale('zh-cn');
import {date} from '@/Acc-config/date.js'
  // 进入页面获取当前的年月日
  // 第一列
  const c_year=moment().format('YYYY')//当前年
  const n_year=moment().add(1,'year').format('YYYY')//下一年
  // 
  const c_month=moment().format('M')//当前月
  const c_day=moment().format('D')//当前日
let current=()=>{

  // 把获取到的第一列的值赋给date
  date[0]=[{time:c_year,name:c_year+'年'},{time:n_year,name:n_year+'年'}]
  //第二列：获取从当年当月开始计算：本月到12月的数字，并展示
  for(let i=c_month;i<=12;i++){
    date[1].push({time:Number(i),name:i+'月'})
  }
  // 第三列：获取今年（当前年）每个月的天数：从当前日开始计算
  const days=moment(c_year+'/'+c_month,'YYYY/M').daysInMonth()//当前月的天数
  for(let i=c_day;i<=days;i++){
     date[2].push({time:Number(i),name:i+'日'})
  }
}

// 计算滚动时选中得到的某年某月的天数
let selDays=(selDate)=>{
  // const c_year=moment().format('YYYY')//当前年
  // const c_month=moment().format('M')//当前月
  // const c_day=moment().format('D')//当前日
  // 如果滚动在当前年月，那么日 要从今天算起，不能从第一天开始
  let nowday=selDate[0].year==c_year && selDate[0].month==c_month ?c_day :1

  // 在获取选中年月的天数，再进行遍历
   const days=moment(selDate[0].year+'/'+selDate[0].month,'YYYY/M').daysInMonth() //选中年月的天数
   //再把天数赋给date进行展示，重新渲染天数
   let new_day=[]
  for(let i=Number(nowday);i<=days;i++){
    //这里date[2]里面已经有了默认当前年月日的数据，所以不能push
     // date[2].push({time:Number(i),name:i+'日'})
     new_day.push({time:Number(i),name:i+'日'})
  }
  // //年也一样，如果不是当前年，那么月份要从第一月开始
  // let new_month=[]
  // let nowmonth=selDate[0].year==c_year ?c_month :1
  // for(let i=nowmonth;i<=12;i++){
  //   new_month.push({time:Number(i),name:i+'月'})
  // }
  // // 更改月
  // date.splice(1,1,new_month)

  // 更改日
  date.splice(2,1,new_day)
  // console.log(new_day);

  
}
let selmonthanddays=(selDate)=>{
  // const c_year=moment().format('YYYY')//当前年
  // const c_month=moment().format('M')//当前月
  // const c_day=moment().format('D')//当前日
  //年也一样，如果不是当前年，那么月份要从第一月开始
  let new_month=[]
  let nowmonth=selDate[0].year==c_year ?c_month :1
  for(let i=nowmonth;i<=12;i++){
    new_month.push({time:Number(i),name:i+'月'})
  }
  // 更改月
  date.splice(1,1,new_month)

}
export {current,selDays,selmonthanddays,c_month}