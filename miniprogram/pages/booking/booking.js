// const { log } = require('console');
// pages/booking/booking.js

// 导入 tool.js 文件
let tool = require('../../js/tool');

// 获取小程序实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 骨架屏
    loading: true,

    // 收入/支出下标切换激活下标(默认选择支出)
    activeIndex: 1,

    // 子类型的页码
    page: -1,

    // 当前页的下标
    iconIndex: -1,

    // 账户类型的激活下标
    activAccountIndex: -1,

    // 记账类型(收入/支出)
    bookingType: [
      {
        title: '收入',
        type: 'sr'
      },
      {
        title: '支出',
        type: 'zc'
      }
    ],

    // 记账的子类型
    subTypes: [],

    // 每一页显示10个子类型
    typeCount: 10,

    // 账户类型
    accounts: [
      {
        name: '现金',
        type: 'xj'
      },
      {
        name: '支付宝',
        type: 'zfb'
      },
      {
        name: '微信',
        type: 'wx'
      },
      {
        name: '信用卡',
        type: 'xyk'
      },
      {
        name: '储蓄卡',
        type: 'cxk'
      }
    ],

    // 当前时间
    currentData: '',

    // 选择日期
    date: '选择日期',

    // 选择金额
    money: '',

    // 备注
    comment: '',

    // 用户是否已经授权
    isAuth: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 查询记账子类型
    this.findBookingSubType();

    // 获取当前时间
    let date = new Date();
    this.setData({
      currentData: tool.formatDate(date, 'yyyy-MM-dd'),
      loading: false
    })
    // console.log('this.data.currentData ==> ', this.data.currentData);

  },

  // 切换商品类型(收入/支出)、账户类型
  toggleBookingType(e) {
    // e: 事件对象
    // e.currentTarget.dataset.属性名 => 可以获取属性值
    
    // 获取当前点击的下标
    let index = e.currentTarget.dataset.index;
    // console.log('index ==> ', index);

    // 获取当前点击的属性名
    let key = e.currentTarget.dataset.key;
    // console.log('key ==> ', key);

    // 判断 获取的下标是否是当前下标 是就返回掉
    if (index === this.data[key]) {
      return;
    }

    // 修改data数据
    // 如果需要将数据同步到 view, 必须使用 this.setData()
    this.setData({
      // 给当前属性名,更新下标
      [key]: index
    })
  },

  // 切换子类型
  toggleSubType(e) {
    // console.log('e 切换子类型 ==> ', e);
    // 获取页码
    let page = e.currentTarget.dataset.page;

    // 获取当前页的图标的下标
    let index = e.currentTarget.dataset.index;

    // 获取当前页的图标
    let currentIcon = this.data.subTypes[page][index];

    // 跳转到自定义页面
    if (e.currentTarget.dataset.add == 'zdy') {
      
      wx.navigateTo({
        url: '../addIcon/addIcon',
      })
    }

    if (currentIcon.isActive) {
      return;
    }

    let isHas = false;

    // 将其他激活的状态去除
    for (let i = 0; i < this.data.subTypes.length; i++) {

      let iconData = this.data.subTypes[i];

      for (let j = 0; j < iconData.length; j++) {
        if (iconData[j].isActive) {
          // 将其他激活的状态去除
          iconData[j].isActive = false;
          isHas = true;
          break;
        }
      }
      if (isHas) {
        break;
      }
    }

    // 将当前图标激活
    currentIcon.isActive = true;

    this.setData({
      subTypes: this.data.subTypes,
      page,
      iconIndex: index
    })
    
  },

  // 查询记账子类型
  findBookingSubType() {
    // 启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })


    // 调用函数 find_data
    wx.cloud.callFunction({
      // 云函数名称
      name: 'find_data',

      // 传递参数给云函数
      data: {
        // 集合名称 (把它传给云函数)
        listName: "booking_icon"
      }

    }).then(res => {
      // console.log('res 查询记账子类型 ==> ', res);

      // 关闭加载图标
      wx.hideLoading();

      // 存储 自定义
      let zdyData = {};

      // 遍历类型默认为false不选
      res.result.data.forEach((v, i) => {
        v.isActive = false

        if (v.type == 'zdy') {
          zdyData = v;
          res.result.data.splice(i, 1);
          res.result.data.push(zdyData);
        }
      })

      // console.log('res.result.data => ', res.result.data);

      let typeDaata = [];

      for (let i = 0; i < res.result.data.length; i += this.data.typeCount) {
        let types = res.result.data.slice(i, i + this.data.typeCount);
        typeDaata.push(types);
      }

      this.setData({
        subTypes: typeDaata,
        loading: false
      })

      // console.log('typeDaata ==> ', typeDaata);

    }).catch(err => {
      console.log('err ==> ', err);

      // 关闭加载图标
      wx.hideLoading()
    })
  },

  // 获取输入框的值
  setValue(e) {
    let key = e.currentTarget.dataset.key;

    let value = e.detail.value;

    if (key === 'comment' && /[<>]/.test(value)) {
      console.log('备注不包含<>符号');
      wx.showToast({
        title: '备注不包含<>符号',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        [key]: ''
      })
      return;
    }

    this.setData({
      [key]: e.detail.value
    })

    console.log('this.data[' + key + '] ==> ', this.data[key]);
  },

  // 添加记账数据
  createBooking(data) {
    // data: 参数

    // 启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    wx.cloud.callFunction({
      name: 'create_data',
      data
    }).then(res => {
      console.log('res ==> ', res);
      // 关闭加载图标
      wx.hideLoading();

      // 初始化图标
      this.data.subTypes[this.data.page][this.data.iconIndex].isActive = false;

      // 初始化数据
      this.setData({
        // 子类型的页码
        page: -1,
        // 当前页的下标
        iconIndex: -1,
        // 账户类型的激活下标
        activAccountIndex: -1,
        
        // 选择日期
        date: '选择日期',
        // 选择金额
        money: '',
        // 备注
        comment: '',

        // 初始化图标
        subTypes: this.data.subTypes
      })

    }).catch(err => {
      console.log('err ==> ', err);
      // 关闭加载图标
      wx.hideLoading();

    })
  },

  // 保存记账数据
  save() {

    // 判断是否选择记账类型
    if (this.data.page == -1 && this.data.iconIndex) {
      return wx.showToast({
        title: '选择记账类型（餐饮，购物等）',
        icon: 'none',
        duration: 2000
      });
    };

    // 判断是否选择账户类型
    if (this.data.activAccountIndex == -1) {
      return wx.showToast({
        title: '选择账户类型',
        icon: 'none',
        duration: 2000
      });
    };

    // 判断是否选择日期
    if (this.data.date == '选择日期') {
      return wx.showToast({
        title: '请选择日期',
        icon: 'none',
        duration: 2000
      });
    };

    // 判断是否填写金额
    if (!this.data.money) {
      return wx.showToast({
        title: '填写金额',
        icon: 'none',
        duration: 2000
      });
    };

    // 记账数据
    let data = {
      date: this.data.date,
      money: this.data.money,
      comment: this.data.comment,
      listName: 'booking'
    };

    // 获取收入/支出类型
    data.mainType = this.data.bookingType[this.data.activeIndex];
    // console.log('mainType ==> ', mainType);

    // 获取子类型
    data.subType = this.data.subTypes[this.data.page][this.data.iconIndex];
    // console.log('subType ==> ', subType);

    // 获取账户类型
    data.account = this.data.accounts[this.data.activAccountIndex];
    // console.log('account ==> ', account);

    console.log('data ==> ', data);

    // 添加记账数据
    this.createBooking(data);

  },

  // 获取用户授权信息
  getUserProfile(e) {
    // console.log('e ==> ', e);

    // wx.getUserProfile => 获取用户信息。每次请求都会弹出授权窗口，用户同意后返回 userInfo。
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('res 获取用户授权信息 ==> ', res);

        app.globalData.isAuth = true;

        app.globalData.userInfoData = res.userInfo;
        
        this.setData({
          isAuth: true
        })
        
      }
    })
  },

  // 跳转到自定义页面
  

})