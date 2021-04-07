// pages/my/my.js

// 获取小程序实例
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户是否已经授权
    isAuth: false,

    // 用户信息
    userInfoData: {}

  },

  onShow: function(options) {
    this.setData({
      isAuth: app.globalData.isAuth,
      userInfoData: app.globalData.userInfoData
    })
    // console.log('app.globalData.userInfoData ==> ', app.globalData.userInfoData);

    // 获取用户授权信息
    this.getUserProfile();
  },

  // 查看我的记账
  viewMyBooking() {
    /**
     *  wx.navigateTo:
     *    保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。
     */

    // 跳转到 我的记账 页面
    wx.navigateTo({
      url: '../myBooking/myBooking',
    })
  },

  // 获取用户授权信息
  getUserProfile() {

    // wx.getUserProfile => 获取用户信息。每次请求都会弹出授权窗口，用户同意后返回 userInfo。
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('res 获取用户授权信息 ==> ', res);

        app.globalData.isAuth = true;

        app.globalData.userInfoData = res.userInfo;

        this.setData({
          userInfoData: res.userInfo,
          isAuth: true
        })
        
      }
    })
  }
  
})