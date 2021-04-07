// const { log } = require("console");

// components/booking-tiem/booking-tiem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

    // 是否显示删除图标
    isDelete: {
      type: Boolean,
      value: false
    },

    // 记账数据
    bookingData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 删除当前记账数据
    removeCurrentBooking(e) {
      // console.log('e ==> ', e);
      let _id = e.currentTarget.dataset._id;
      console.log('_id ==> ', _id);

      // 把ID传给父级
      this.triggerEvent('remove', {_id});
    }
  }
})
