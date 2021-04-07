// miniprogram/pages/weather/weather.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取城市的天气
    this.getCityWeather();
  },

  // 获取城市的天气
  getCityWeather() {
    /**
     *  wx.request: 发起 HTTPS 网络请求。
     */
    wx.request({
      // url => 请求路径
      // 小程序只支持 https 其他的都不支持
      url: 'https://api.tianapi.com/txapi/tianqi/index',

      // method => 请求方式(GET/POST)
      method: 'GET',

      // data => 参数
      data: {
        key: '8eb7775c71254e5b47923a3dc5cea020',
        city: '广州'
      },

      // success => 请求 成功
      success(res) {
        console.log('res 获取城市的天气 ==> ', res);
      },

      // fail => 请求 失败
      fail(err) {
        console.log('err ==> ', err);
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})