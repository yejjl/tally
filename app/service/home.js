'use strict';

const Service = require('egg').Service;

class HomeService extends Service {
  async user() {
    const { app } = this;
    const QUERY_STR = 'id,name';
    const sql = `select ${QUERY_STR} from list`;// 获取id和name的sql语句
    try {
      const result = await app.mysql.query(sql);// mysql 实例已经挂载到app对象下，可以通过app.mysql获取
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async addUser(name) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('list', { name });// 给list表添加数据
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async editUser(id, name) {
    const { app } = this;
    try {
      const result = await app.mysql.update('list', { name }, {
        where: {
          id,
        },
      });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async deleteUser(id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('list', { id });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
module.exports = HomeService;
