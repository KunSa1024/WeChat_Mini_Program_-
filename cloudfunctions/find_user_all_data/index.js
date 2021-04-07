// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云能力
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event ==> ', event);

  let listName = event.listName;
  delete event.listName;

  try {
    /**
     * 根据用户
     * userInfo: { 
     *  appId: 'wxbe2544359a83f8d3',
     *  openId: 'oOyrP4iWjXB4N7N7bt-_lKJAs3Mo'
     * }
     */

    return await db.collection(listName).where({userInfo: event.userInfo}).get();
    
  } catch (err) {
    console.log('arr ==> ', err);
  }
}