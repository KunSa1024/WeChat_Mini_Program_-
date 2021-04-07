// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 骨架屏
    loading: true,

    // 记账数据
    bookingData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options => 获取传送过来的值
    // console.log('options ==> ', options);

    // 获取 _ids 再切割成数组
    let _ids = options._ids.split('_');
    // console.log('_ids ==> ', _ids);

    // 根据记账的 _id 查询数据
    this.getBookingDataById(_ids);
  },

  // 根据记账的 _id 查询数据
  getBookingDataById(_ids) {
    // _ids: 记账的id集合, Array

    // 启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'find_booking_by_id',
      data: {
        _ids
      }
    }).then(res => {
      console.log('res 根据记账的 _id 查询数据 ==> ', res);
      // 关闭加载图标
      wx.hideLoading();

      // wx.setNavigationBarTitle => 动态设置当前页面的标题
      wx.setNavigationBarTitle({
        title: `${res.result.data[0].subType.name}记账详情`
      })

      this.setData({
        bookingData: res.result.data,
        loading: false
      })

    }).catch(err => {
      console.log('err 根据记账的 _id 查询数据 ==> ', err);
      // 关闭加载图标
      wx.hideLoading();

    })
  }
})