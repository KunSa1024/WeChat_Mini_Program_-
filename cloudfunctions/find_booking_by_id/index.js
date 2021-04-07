// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event ==> ', event);

  try {
    // 根据 _id 查找信息
    return await db.collection('booking').where({
      _id: _.in(event._ids),
      userInfo: event.userInfo
    }).get();
  } catch(err) {
    console.log('err ==> ', err);
  }

}