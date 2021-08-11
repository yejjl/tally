'use strict';

const Service = require('egg').Service;

class BillController extends Service {
  async add(params) {
    const { ctx, app } = this;
    try {
      // 向bill表中插入数据
      const result = await app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  // 获取账单数据
  //   async list(id) {
  //     const { ctx, app } = this;
  //     const QUERY_STR = 'id,pay_type,amount,date,type_id,type_name,remark';
  //     const sql = `select ${QUERY_STR} from bill where user_id=${id}`;
  //     try {
  //       const result = await app.mysql.query(sql);
  //       return result;
  //     } catch (error) {
  //       console.log(error);
  //       return null;
  //     }
  //   }
  async list(id) {
    const { ctx, app } = this;
    const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark';
    const sql = `select ${QUERY_STR} from bill where user_id = ${id}`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async detail(id, user_id) {
    const { ctx, app } = this;
    try {
      const result = await app.mysql.get('bill', { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async update(params) {
    const { ctx, app } = this;
    try {
      const ressult = await app.mysql.update('bill', {
        ...params,
      }, {
        id: params.id,
        user_id: params.user_id,
      });
      return ressult;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async delete(id, user_id) {
    const { ctx, app } = this;
    try {
      const ressult = await app.mysql.delete('bill', {
        id,
        user_id,
      });
      return ressult;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
module.exports = BillController;
