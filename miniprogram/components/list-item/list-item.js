// components/list-item/list-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 标题
    title: {
      type: String,
      value: '标题'
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

    // 点击 list-item
    clickLitItem() {
      console.log('执行了');

      // 触发一个自定义事件通知父组件
      this.triggerEvent('clickListItem');
    }
  }
})
