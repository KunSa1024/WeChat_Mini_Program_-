// miniprogram/pages/myBooking/myBooking.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 骨架屏
    loading: true,

    // 获取我的所有记账数据
    bookingData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取我的所有记账数据
    this.findMyAllBookingData();
  },

  // 获取我的所有记账数据
  findMyAllBookingData() {
    // 启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'find_user_all_data',
      data: {
        listName: 'booking'
      }
    }).then(res => {
      // console.log('res 获取我的所有记账数据 ==> ', res);
      // 关闭加载图标
      wx.hideLoading();

      this.setData({
        bookingData: res.result.data,
        loading: false
      })

    }).catch(err => {
      console.log('err 获取我的所有记账数据 ==> ', err);
      // 关闭加载图标
      wx.hideLoading();

    })
  },

  // 删除记账
  removeBooking(e) {
    // console.log('e ==> ', e);

    wx.showModal({
      title: '提示',
      content: '该操纵将永久删除数据, 是否继续操作?',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
          // 启动加载提示
          wx.showLoading({
            title: '加载中...',
            mask: true
          });

          wx.cloud.callFunction({
            name: 'remove_user_data',
            data: {
              listName: 'booking',  // 集合名称
              _id: e.detail._id  // 要删除的数据id
            }
          }).then(data => {
            // console.log('data 删除记账 ==> ', data);
            // 关闭加载图标
            wx.hideLoading();

            if (data.result.stats.removed == 1) {
              // 删除页面上的记账数据
              this.data.bookingData.splice(e.currentTarget.dataset.index, 1);

              this.setData({
                bookingData: this.data.bookingData
              });

              console.log(123);

              wx.showToast({
                title: '删除成功',
                icon: 'none',
                duration: 2000
              })
            }

          }).catch(err => {
            console.log('err 删除记账 ==> ', err);
            // 关闭加载图标
            wx.hideLoading();

            wx.showToast({
              title: '删除失败',
              icon: 'none',
              duration: 2000
            })

          })          

        }
      }
    })

  },

})