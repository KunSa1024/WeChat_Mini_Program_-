// components/type-data/type-data.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    booking: {
      type: Object,
      value: {}
    },

    total: {
      type: Number,
      value: 1
    },

    index: {
      type: Number,
      value: 0
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

    click(e) {
      // console.log('e clicktypedata ==> ', e);
      this.triggerEvent('clicktypedata', {_ids: e.currentTarget.dataset._ids});
    }
  }
})
