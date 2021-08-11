'use strict';

const moment = require('moment');

const Controller = require('egg').Controller;

class BillController extends Controller {
  // 账单添加数据
  async add() {
    const { ctx, app } = this;
    // 获取请求中携带的参数
    const { amount, type_id, type_name, pay_type, remark = '' } = ctx.request.body;

    // 判空处理
    if (!amount || !type_id || !type_name || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;

      const result = await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date: new Date(),
        pay_type,
        remark,
        user_id,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        date: null,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '系统错误',
        date: null,
      };
    }
  }
  // 账单数据列表
  //   async list() {
  //     const { app, ctx } = this;
  //     // 获取，日期date，分页数据，类型id
  //     const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;
  //     try {
  //       const token = ctx.request.header.authorization;
  //       const decode = await app.jwt.verify(token, app.config.jwt.secret);
  //       if (!decode) return;
  //       const user_id = decode.id;
  //       // 拿到当前用户的帐单列表
  //       const list = await ctx.service.bill.list(user_id);
  //       // 过滤出月份和类型对应的帐单列表
  //       const _list = list.filter(item => {
  //         if (type_id !== 'all') {
  //           return moment(Number(item.date)).format('YYYY-MM') === date && type_id === item.type_id;
  //         }
  //         return moment(Number(item.date)).format('YYYY-MM') === date;
  //       });
  //       // 格式化数据
  //       const listMap = _list.reduce((curr, item) => {
  //         // curr默认初始值是一个空数组[]
  //         // 把第一个账单的时间格式化为YYYY-MM-DD
  //         const date = moment(Number(item.date)).format('YYYY-MM-DD');
  //         // 如果能在累加的数组中找到当前日期date,那么在数组中加入当前项到bills数组
  //         if (curr && curr.length && curr.findIndex(item => item.date === date) > -1) {
  //           const index = curr.findIndex(item => item.date === date);
  //           curr[index].bills.push(item);
  //         }
  //         // 如果累加的数组中找不到当前项的日期，那么在新建一项
  //         if (curr && curr.length && curr.findIndex(item => item.date === date) === -1) {
  //           curr.push({
  //             date,
  //             bills: [ item ],
  //           });
  //         }
  //         // 如果curr为空数组，则默认添加第一个账单项item，格式化为下列模式
  //         if (!curr.length) {
  //           curr.push({
  //             date,
  //             bills: [ item ],
  //           });
  //         }
  //         return curr;
  //       }, []).sort((a, b) => moment(b.date) - moment(a.date));// 时间顺序为倒叙，时间约新的，在越上面

  //       // 分页处理，listMap进行了格式化处理
  //       const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);

  //       // 计算当月总收入和支出
  //       // 首先获取当月所有账单数据
  //       const list_date = list.filter(item => moment(Number(item.date)).format('YYYY-MM') === date);
  //       // 累加计算支出
  //       const totalExpense = list_date.reduce((curr, item) => {
  //         if (item.pay_type === 1) {
  //           curr += Number(item.amount);
  //           return curr;
  //         }
  //         return curr;
  //       }, 0);
  //       const totalIncome = list_date.reduce((curr, item) => {
  //         if (item.pay_type === 2) {
  //           curr += Number(item.amount);
  //           return curr;
  //         }
  //         return curr;
  //       }, 0);
  //       // 返回数据
  //       ctx.body = {
  //         code: 200,
  //         msg: '请求成功',
  //         data: {
  //           totalExpense,
  //           totalIncome,
  //           totalPage: Math.ceil(listMap.length / page_size), // 总分页
  //           list: filterListMap || [], // 格式化后，并且经过分页处理的数据
  //         },
  //       };
  //     } catch (error) {
  //       console.log(error);
  //       ctx.body = {
  //         code: 500,
  //         msg: '系统错误',
  //         data: null,
  //       };
  //     }
  //   }
  async list() {
    const { ctx, app } = this;
    // 获取，日期 date，分页数据，类型 type_id，这些都是我们在前端传给后端的数据
    const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;

    try {

      // 通过 token 解析，拿到 user_id
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 拿到当前用户的账单列表
      const list = await ctx.service.bill.list(user_id);
      // 过滤出月份和类型所对应的账单列表
      const _list = list.filter(item => {
        if (type_id !== 'all') {
          return moment(item.date).format('YYYY-MM') === date && type_id === item.type_id;
        }
        return moment(item.date).format('YYYY-MM') === date;
      });
      // 格式化数据，将其变成我们之前设置好的对象格式
      const listMap = _list.reduce((curr, item) => {
        // curr 默认初始值是一个空数组 []
        // 把第一个账单项的时间格式化为 YYYY-MM-DD
        const date = moment(item.date).format('YYYY-MM-DD');
        // 如果能在累加的数组中找到当前项日期 date，那么在数组中的加入当前项到 bills 数组。
        if (curr && curr.length && curr.findIndex(item => item.date === date) > -1) {
          const index = curr.findIndex(item => item.date === date);
          curr[index].bills.push(item);
        }
        // 如果在累加的数组中找不到当前项日期的，那么再新建一项。
        if (curr && curr.length && curr.findIndex(item => item.date === date) === -1) {
          curr.push({
            date,
            bills: [ item ],
          });
        }
        // 如果 curr 为空数组，则默认添加第一个账单项 item ，格式化为下列模式
        if (!curr.length) {
          curr.push({
            date,
            bills: [ item ],
          });
        }
        return curr;
      }, []).sort((a, b) => moment(b.date) - moment(a.date)); // 时间顺序为倒叙，时间约新的，在越上面

      // 分页处理，listMap 为我们格式化后的全部数据，还未分页。
      const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);

      // 计算当月总收入和支出
      // 首先获取当月所有账单列表
      const __list = list.filter(item => moment(item.date).format('YYYY-MM') === date);
      // 累加计算支出
      const totalExpense = __list.reduce((curr, item) => {
        if (item.pay_type === 1) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      // 累加计算收入
      const totalIncome = __list.reduce((curr, item) => {
        if (item.pay_type === 2) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);

      // 返回数据
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          totalExpense, // 当月支出
          totalIncome, // 当月收入
          totalPage: Math.ceil(listMap.length / page_size), // 总分页
          list: filterListMap || [], // 格式化后，并且经过分页处理的数据
        },
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 获取账单详情
  async detail() {
    const { ctx, app } = this;
    // 获取id参数
    const { id = '' } = ctx.query;
    const token = ctx.request.header.authorization;
    // 获取用户信息
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    const user_id = decode.id;
    if (!id) {
      ctx.body = {
        code: 500,
        msg: '账单id不能为空',
        data: null,
      };
      return;
    }
    try {
      // 从数据库获取账单详情
      const detail = await ctx.service.bill.detail(id, user_id);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: detail,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 编辑账单
  async update() {
    const { ctx, app } = this;
    // 账单的相关参数
    const { id, amount, type_id, type_name, date, pay_type, remark = '' } = ctx.request.body;
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const ressult = await ctx.service.bill.update({
        id,
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: null,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 账单删除
  async delete() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;

    if (!id) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const result = await ctx.service.bill.delete(id, user_id);
      console.log(result);
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: null,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 获取账单数据
  async data() {
    const { ctx, app } = this;
    const { date = '' } = ctx.query;
    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    const user_id = decode.id;
    try {
      // 获取账单表中的账单数据
      const result = await ctx.service.bill.list(user_id);
      // 筛选出当月的账单数据
      const start = moment(date).startOf('month').unix() * 1000;// 选择月份，月初时间
      const end = moment(date).endOf('month').unix() * 1000;// 选择月份，月末时间
      // console.log(start + '+' + end);
      // 月账单基础数据
      const _data = result.filter(item => {
        // console.log(moment(item.date).unix() * 1000);
        return ((moment(item.date).unix() * 1000) > start && (moment(item.date).unix() * 1000) < end);
      });

      // 总支出
      const total_expense = _data.reduce((arr, cur) => {
        if (cur.pay_type === 1) {
          arr += Number(cur.amount);
        }
        return arr;
      }, 0);
      // 总收入
      const total_income = _data.reduce((arr, cur) => {
        if (cur.pay_type === 2) {
          arr += Number(cur.amount);
        }
        return arr;
      }, 0);
      // 获取收支构成
      let total_data = _data.reduce((arr, cur) => {
        const index = arr.findIndex(item => item.type_id === cur.type_id);
        if (index === -1) {
          arr.push({
            type_id: cur.type_id,
            type_name: cur.type_name,
            pay_type: cur.pay_type,
            number: Number(cur.amount),
          });
        }
        if (index > -1) {
          arr[index].number += Number(cur.amount);
        }
        return arr;
      }, []);
      total_data = total_data.map(item => {
        item.number = Number(Number(item.number).toFixed(2));
        return item;
      });

      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          total_expense: Number(total_expense).toFixed(2),
          total_income: Number(total_income).toFixed(2),
          total_data: total_data || [],
        },
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

}
module.exports = BillController;
