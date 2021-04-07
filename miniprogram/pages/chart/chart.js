// import { log } from 'console';
// import { log } from 'console';
import * as echarts from '../../components/ec-canvas/echarts';

// 导入 tool.js 文件
let tool = require('../../js/tool');

// const app = getApp();

// 保存绘制 canvas 图形对象
let chartCanvas = null;

Page({
  data: {
    ec: {
      onInit: null
    },

    // 骨架屏
    loading: false,

    // 日期
    date: '选择日期',

    copyDate: '',

    // 结束日期
    end: '',

    // 日期状态
    dateStatus: 0,

    // 收入/支出 数据
    subType: [
      {
        title: '收入',
        type: 'sr',
        money: 0
      },
      {
        title: '支出',
        type: 'zc',
        money: 0
      },
    ],

    // 默认激活下标
    activeIndex: 0,

    // 大月
    largeMonth: ['01','03','05','07','08','10','12'],

    // 记账数据
    bookingData: {}
  },

  // 当页面加载时触发
  onLoad() {
    // 获取当前时间
    let currentDate = tool.formatDate(new Date(), 'yyyy-MM-dd');

    this.setData({
      end: currentDate,
      copyDate: currentDate.split('-'),
      ec: {
        onInit: this.initChart
      },
    })

    // 初始化查询方式选择的日期
    this.initDate();

    // 获取日期查询记账数据
    this.findBookingDataByDate();
  },

  onShow() {
    // 初始化查询方式选择的日期
    this.initDate();

    // 获取日期查询记账数据
    this.findBookingDataByDate();
  },

  // 初始化 canvas - 饼图
  initChart(canvas, width, height, dpr) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);

    // 绘制canvas
    chart.setOption({});

    chartCanvas = chart;

    return chart;
  },

  // 选择日期
  selectData(e) {
    console.log('e 选择日期 => ', e);
    let date = e.detail.value.split('-');
    this.setData({
      copyDate: date
    })

    // 获取日期查询记账数据
    this.findBookingDataByDate();

    // 初始化查询方式选择的日期
    this.initDate();
  },

  // 初始化查询方式选择的日期
  initDate() {
    let dateStatus = this.data.dateStatus;
    let date = this.data.copyDate;

    if (dateStatus == 0) {
      this.data.date = `${date[0]}年`;
    } else if (dateStatus == 1) {
      this.data.date = `${date[0]}年${date[1]}月`;
    } else {
      this.data.date = `${date[0]}年${date[1]}月${date[2]}日`;
    }

    this.setData({
      date: this.data.date
    })
  },

  // 切换日查询方式
  toggleFateType() {
    let dateStatus = this.data.dateStatus;

    if (dateStatus == 2) {
      dateStatus = 0;

    } else {
      dateStatus++;
    }

    this.setData({
      dateStatus
    });

    // 初始化查询方式选择的日期
    this.initDate();

    // 获取日期查询记账数据
    this.findBookingDataByDate();
  },

  // 切换收入/支出
  togglesubType(e) {
    // console.log('e 切换收入/支出 => ', e);

    let index = e.currentTarget.dataset.index;

    if (index == this.data.activeIndex) {
      return;
    }

    this.setData({
      activeIndex: index
    })

    // 获取不同类型的颜色(收入-支出)
    this.getColorsByType();
  },

  // 获取不同类型的颜色(收入-支出)
  getColorsByType() {

    // 颜色
    let colors = [];

    // 获取指定类型的颜色 (收入-支出)
    let type = this.data.bookingData[this.data.subType[this.data.activeIndex].type];
    // console.log('type ==> ', type);
    // 判断 type 是否有值
    let tyData = type ? type.subType : [];
    // console.log('tyData ==> ', tyData);

    // 求和
    // let sum = 0;    
    tyData.forEach(v => {
      colors.push(v.color);
      // sum += v.value
    })

    // let num = 0;
    // let names = '';
    // // 计算百分比
    // tyData.forEach(v => {
    //   num = v.value / sum * 100;
    //   names = v.name;
    //   v.name = names + num.toFixed(2) + '%';
    // })

    // 重绘饼图
    this.drawPie(colors, tyData);
  },

  // 重绘饼图
  drawPie(colors, tyData) {

    let option = {
      backgroundColor: "#ffffff",
  
      legend: {
        top: 'bottom',
        left: 'center'
      },
  
      series: [{
        label: {
          normal: {
            fontSize: 14
          }
        },
  
        type: 'pie',
  
        center: ['50%', '50%'],
  
        radius: ['0%', '60%'],
  
        // 颜色需要动态
        color: colors,
  
        // 饼图数据需要动态
        data: tyData
      }]
    };
    
    chartCanvas.setOption(option);
  },

  // 查询记账属性
  findBookingDate(name, data) {
    
    // 启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 根据start和end查询记账数据
    // 调用云函数 find_booking_by_month
    wx.cloud.callFunction({
      name,
      data
    }).then(result => {
      // console.log('result => ' + name + ' 查询记账属性 => ', result);
      // 关闭加载图标
      wx.hideLoading();

      // 初始数据
      if (result.result.data.length == 0) {
        this.data.subType.forEach(v => {
          v.money = 0;
        })

        this.setData({
          subType: this.data.subType,
          bookingData: {}
        })

        // 重绘饼图
        this.drawPie([], []);
        return;
      }

      // console.log('this.data.subType ==> ', this.data.subType);

      // 按照收入和支出分类
      let typeData = {};

      // 遍历 result.result.data
      result.result.data.forEach(v => {
        // 判断typeData是否存在该类型(收入/支出)
        if (!typeData[v.mainType.type]) {
          typeData[v.mainType.type] = [v];
        } else {
          typeData[v.mainType.type].push(v);
        }
      })

      let sum = [];

      // 在收入和支出筛选子类(学习,健康,...)
      let bookingData = {};
      for (let key in typeData) {
        let ty = {
          total: 0,
          subType: {}
        };

        typeData[key].forEach(v => {
          ty.total += Number(v.money);

          
          // 寻找subType是否含有学习、健康等类型
          let keys = Object.keys(ty.subType);
          
          if (keys.indexOf(v.subType.type) === -1) {
            
            // 随机生成一共颜色
            let color = tool.createRandomColor();

            // 如果找不到 初始化
            ty.subType[v.subType.type] = {
              name: v.subType.name,
              title: v.subType.name,
              value: Number(v.money),
              count: 1,
              type: [v],
              icon: v.subType.icon,
              color,
              _ids: [v._id]
            }

          } else {
            ty.subType[v.subType.type].value += Number(v.money);
            ty.subType[v.subType.type].count++;
            ty.subType[v.subType.type].type.push(v);
            ty.subType[v.subType.type]._ids.push(v._id)
          }
        })
        bookingData[key] = ty;
      }

      // console.log('typeData => ', typeData);
      
      // 把数据存储到 收入、支出
      this.data.subType.forEach(v => {
        v.money = 0;
        if (bookingData[v.type]) {
          v.money = bookingData[v.type].total;
        }
        
      })
      
      // console.log('this.data.subType ==> ', this.data.subType);

      for (let k in bookingData) {
        let bd = bookingData[k].subType;
        let tyDataArray = [];

        for (let key in bd) {
          // 获取类型在 type
          bd[key].ty = key;

          // 计算百分比
          // 再拼接 name + 百分比
          bd[key].name = bd[key].name + ' ' + (bd[key].value / bookingData[k].total * 100).toFixed(2) + '%';

          tyDataArray.push(bd[key]);
        }

        // console.log('bd ==> ', bd);

        bookingData[k].subType = tyDataArray;
      }

      this.setData({
        bookingData,
        subType: this.data.subType
      })

      // 获取不同类型的颜色(收入-支出)
      this.getColorsByType();

      // 计算每一类占的百分比
      // this.getPercentage();

    }).catch(error => {
      console.log('error => ' + name + ' 查询记账属性 => ', error);
      // 关闭加载图标
      wx.hideLoading();

    })
  },

  // 获取日期查询记账数据
  findBookingDataByDate() {
    // 获取查询日期条件
    let start = '';
    let end = '';

    // 获取当前日期
    let current = tool.formatDate(new Date(), 'yyyy-MM-dd').split('-');
    // console.log('current ==> ', current);

    // 获取用户查询的日期
    let copyDate = this.data.copyDate;
    // console.log('copyDate ==> ', copyDate);

    // 如果同年
    if (current[0] == copyDate[0]) {
      // console.log('同年');
      
      if (this.data.dateStatus == 0) {
        /**
         * 1. 按年查询
         * date的查询条件范围: 当年-01-01 至 当年-当前的月份-当前的日份
         */
        // console.log('按年查询');
        start = `${copyDate[0]}-01-01`; // 年初日期
        end = current.join('-');  // 现在日期
      } else if (this.data.dateStatus == 1) {
        // 2. 按月查询
        // console.log('按月查询');

        start = `${copyDate[0]}-${copyDate[1]}-01`;

        if (current[1] == copyDate[1]) {
          /**
           * 1> 如果同月
           *   data的查询条件范围 当年当月-01 至 当年-当月-当日
           */
          end = current.join('-');
        } else {
          // 2> 如果不同月

          if (copyDate[1] == 2) {
            // 2.1> 如果是2月份
            // 判断年份是否为闰年
            if (copyDate[0] % 400 == 0 || (copyDate[0] % 4 == 0 && copyDate[0] % 100 != 0)) {
              // date的查询条件范围 当年-02-01 至 当年02-29

              end = `${copyDate[0]}-${copyDate[1]}-29`;
            } else {
              end = `${copyDate[0]}-${copyDate[1]}-28`;
            }

          } else {
            // 2.2> 如果不是2月份
            // 判断月份是否大月 (1,3,5,7,8,10,12)
            if (this.data.largeMonth.indexOf(copyDate[1]) > -1) {
              end = `${copyDate[0]}-${copyDate[1]}-31`;
            } else {
              end = `${copyDate[0]}-${copyDate[1]}-30`;
            }
          }
        }

      } else {
        /**
         * 3. 按日查询
         */
        // console.log('按日查询');
        start = copyDate.join('-');
      }

    } else {
      // console.log('不同年');

      if (this.data.dateStatus == 0) {
        // 按年查询
        start = `${copyDate[0]}-01-01`; // 年初
        end = `${copyDate[0]}-12-31`; // 年未
      } else if (this.data.dateStatus == 1) {
        // 按月查询
        start = `${copyDate[0]}-${copyDate[1]}-01`;

        if (copyDate[1] == 2) {
          // 2.1> 如果是2月份
          // 判断年份是否为闰年
          if (copyDate[0] % 400 == 0 || (copyDate[0] % 4 == 0 && copyDate[0] % 100 != 0)) {
            // date的查询条件范围 当年-02-01 至 当年02-29

            end = `${copyDate[0]}-${copyDate[1]}-29`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-28`;
          }

        } else {
          // 2.2> 如果不是2月份
          // 判断月份是否大月 (1,3,5,7,8,10,12)
          if (this.data.largeMonth.indexOf(copyDate[1]) > -1) {
            end = `${copyDate[0]}-${copyDate[1]}-31`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-30`;
          }
        }
      } else {
        // 按日查询
        start = copyDate.join('-');
      }
    }

    // console.log('start ==> ', start);
    // console.log('end ==> ', end);

    // console.log('this.data.end ==> ', this.data.end.legend);

    // 如果存在and
    if (end) {
      // 根据start和end查询记账数据
      // 调用云函数 find_booking_by_month

      // 查询记账属性
      this.findBookingDate('find_booking_by_month', {start,end});
    } else {
      // 根据start查询记账数据
      // 调用云函数 find_data

      // 查询记账属性
      this.findBookingDate('find_data', {date: start, listName: 'booking'});
    }
  },

  // 查看记账详情
  goDetail(e) {
    // console.log('e 查看记账详情 ==> ', e);
    // 带值跳转
    // 传参如果有多个参数要用 & 隔开
    wx.navigateTo({
      url: `../detail/detail?_ids=${e.detail._ids.join('_')}`,
    })
  }
});
