// miniprogram/pages/addIcon/addIcon.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 上传图片数据
    fileList: [],

    // 记账的子类型
    subTypes: [],

    // 选择下标
    choiceIndex: -1,

    // 类别名称
    categoryName: '',

    // 是否显示删除按钮
    displayDel:  false,

    // 选择上传图标
    upIcon: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 查询记账子类型
    this.findBookingSubType();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

      // let data = res.result.data.pop();
      
      // console.log('data => ', data);

      // 找到自定义图标删除它
      res.result.data.forEach((v, i) => {
        if (v.type == 'zdy') {
          res.result.data.splice(i, 1);
        }
      })

      this.setData({
        subTypes: res.result.data
      });

      // console.log('this.data.subTypes ==> ', this.data.subTypes);

    }).catch(err => {
      console.log('err ==> ', err);

      // 关闭加载图标
      wx.hideLoading()
    })
  },

  // 切换子类型
  toggleSubType(e) {
    // console.log('e 切换子类型 ==> ', e);

    // console.log('this.data.choiceIndex ==> ', this.data.choiceIndex);
    // console.log('e.currentTarget.dataset.index ==> ', e.currentTarget.dataset.index);

    // 判断如果点了两次就取消
    if (this.data.choiceIndex === e.currentTarget.dataset.index) {
      this.setData({
        choiceIndex: -1,
        upIcon: ''
      });
      return;
    } 

    this.setData({
      choiceIndex: e.currentTarget.dataset.index,
      upIcon: this.data.subTypes[e.currentTarget.dataset.index].icon
    })
    
    // 删除图片
    this.delImage()
  },

  // 获取输入框的值
  setValue(e) {
    let value = e.detail.value;

    if (/[<>]/.test(value)) {
      console.log('备注不包含<>符号');
      wx.showToast({
        title: '备注不包含<>符号',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        categoryName: ''
      })
      return;
    }

    this.setData({
      categoryName: e.detail.value
    })

    console.log('this.data.categoryName ==> ', this.data.categoryName);
  },

  // 上传图片
  upImage(e) {
    // console.log('e 上传图片 => ', e);

    let image = {
      url: e.detail.file.url
    }

    this.data.fileList = [];

    this.data.fileList.push(image);
    // this.data.fileList = image;

    this.setData({
      fileList: this.data.fileList,
      displayDel: true,
      upIcon: e.detail.file.url,
      choiceIndex: -1
    })
  },
  
  // 删除图片
  delImage() {
    this.data.fileList = {};
    this.setData({
      fileList: this.data.fileList,
      displayDel: false
    })
    
    // console.log('this.data.fileList => ', this.data.fileList);

  },

  // 创建图标
  establishIcon() {
    console.log('this.data.fileList => ', this.data.fileList);

    if (this.data.upIcon == '') {
      return wx.showToast({
        title: '没有图标',
        icon: 'none',
        duration: 2000
      });
    }

    if (this.data.categoryName == '') {
      return wx.showToast({
        title: '类别名称不能空',
        icon: 'none',
        duration: 2000
      });
    }

    let data = {
      icon: this.data.upIcon,
      name: this.data.categoryName,
      type: this.data.categoryName,
      listName: 'booking_icon'
    }

    console.log('data => ', data);

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
        choiceIndex: -1,
        categoryName: '',
        displayDel: false,
        upIcon: ''
      })

    }).catch(err => {
      console.log('err ==> ', err);
      // 关闭加载图标
      wx.hideLoading();

    })
  }
})