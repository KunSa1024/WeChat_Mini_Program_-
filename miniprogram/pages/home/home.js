
// 导入 tool.js 文件
let tool = require('../../js/tool');

// 获取小程序实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 股价屏 => true:显示  false:隐藏
    loading: true,

    // 当前日期
    currentDate: '',

    // 当前日的记账数据
    currontDateBooking: [],

    // 显示 xx月xx日
    date: '',

    // 当天收入和支出的总金额
    currentDateMoney: {
      sr: 0,  // 收入
      zc: 0 // 支出
    },

    // 选择日期
    pickerDate: {
      // 当月 01号
      start: '',
      // 当月当日
      end: ''
    },

    // 本月总额(收入-支出-结余)
    currentMonthBooking: {
      sr: 0,  // 收入
      srDecimal: '',
      zc: 0,  // 支出
      zcDecimal: '',
      jy: 0,  // 结余
      jyDecimal: '',
    }

  },

  /**
   * 生命周期函数--监听页面加载
   *  当访问页面为tabber页面，如果该rabbar页面访问过，再从tabbar页面访问之前的tabbar页面，之前的tabbar页面不会触发onload
   */
  onLoad: function (options) {
    // console.log('onLoad');

    // 获取当前 年月日
    let currentDate = tool.formatDate(new Date(), 'yyyy-MM-dd');

    // 获取当前月份
    this.data.pickerDate.start = tool.formatDate(new Date(), 'yyyy-MM-01');
    this.data.pickerDate.end = currentDate;

    // 微信认证
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('res 获取用户授权信息 ==> ', res);

        app.globalData.isAuth = true;

        console.log('app.globalData ==> ', app.globalData);
        
      }
    })


    this.setData({
      currentDate: currentDate,
      loading: false,
      pickerDate: this.data.pickerDate
    })
    

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log('onShow');
    // 获取当天记账数据
    this.getBookingDataByDate();

    // 获取当年当月的记账数据
    this.findBookingByMonth();
  },

  // 获取当天记账数据
  getBookingDataByDate() {
    // console.log('this.data.currentDate ==> ', this.data.currentDate);
    // 启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'find_data',
      data: {
        // 当前日期
        date: this.data.currentDate,
        // 集合名
        listName: 'booking'
      }
    }).then(res => {
      // console.log('res 获取当天记账数据 ==> ', res);

      // 关闭加载图标
      wx.hideLoading();

      // 清空当日收入和支出总额
      this.setData({
        currentDateMoney: {
          sr: 0,  // 收入
          zc: 0 // 支出
        }
      })
      
      // 获取当前 月日
      let date = tool.formatDate(new Date(), 'MM月dd日');
      // console.log('date ==> ', date);

      // 计算当天的收入和支出总额
      res.result.data.forEach(v => {
        this.data.currentDateMoney[v.mainType.type] += Number(v.money);
        // 保留两位小数
        v.money = Number(v.money).toFixed(2);
      })

      // 保留两位小数
      for (let key in this.data.currentDateMoney) {
        this.data.currentDateMoney[key] = this.data.currentDateMoney[key].toFixed(2);
      }

      this.setData({
        // 获取当前数据
        currontDateBooking: res.result.data,
        date,
        currentDateMoney: this.data.currentDateMoney
      })

      // console.log('this.data.currentDateMoney ==> ', this.data.currentDateMoney);


    }).catch(err => {
      console.log('err 获取当天记账数据 ==> ', err);

      // 关闭加载图标
      wx.hideLoading();

    })
  },

  // 切换日期
  toggleCurrentDate(e) {

    // 判断选择日期是否 是当前日期 是就返回掉
    if (e.detail.value == this.data.currentDate) {
      return;
    } 

    this.setData({
      currentDate: e.detail.value
    })

    this.getBookingDataByDate();

  },

  // 获取当年当月的记账数据
  findBookingByMonth() {
    // console.log('this.data.pickerDate ==> ', this.data.pickerDate);

    // 记得清空再传值
    this.setData({
      currentMonthBooking: {
          sr: 0,
          srDecimal: 0,
          zc: 0,
          zcDecimal: 0,
          jy: 0,
          jyDecimal: 0
      }
    });

    // 启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'find_booking_by_month',
      data: {
        start: this.data.pickerDate.start,
        end: this.data.pickerDate.end
      }
    }).then(res => {
      // console.log('res 获取当年当月的记账数据 ==> ', res);
      // 关闭加载图标
      wx.hideLoading();

      // 计算 本月总额(收入-支出)
      res.result.data.forEach(v => {
        this.data.currentMonthBooking[v.mainType.type] += Number(v.money);
      })

      // 计算 本月 结余
      this.data.currentMonthBooking.jy = this.data.currentMonthBooking.sr - this.data.currentMonthBooking.zc;

      let keys = ['sr', 'zc', 'jy'];
      keys.forEach(v => {
        // 保留两位小数 切割成两部分(整数-小数)
        let data = this.data.currentMonthBooking[v].toFixed(2).split('.');
        // console.log('data ==> ', data);
        // 存储整数
        this.data.currentMonthBooking[v] = data[0];
        // 存储小数
        this.data.currentMonthBooking[v + 'Decimal'] = data[1];
      })

      this.setData({
        currentMonthBooking: this.data.currentMonthBooking
      })

    }).catch(err => {
      console.log('err 获取当年当月的记账数据 ==> ', err);
      // 关闭加载图标
      wx.hideLoading();

    })
  }

})