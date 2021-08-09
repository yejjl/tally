'use strict';

const Controller = require('egg').Controller;
const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png';

class UserController extends Controller {
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body; // 注册需要的参数
    // 判空操作
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '账号密码不能为空！',
        data: null,
      };
      return;
    }
    // 用户名查重
    const userInfo = await this.ctx.service.user.getUserByName(username);
    if (userInfo && userInfo.id) {
      this.ctx.body = {
        code: 500,
        msg: '账户名已被注册，请重新输入',
        data: null,
      };
      return;
    }
    // 将数据存入数据库
    const result = await this.ctx.service.user.register({
      username,
      password,
      ctime: new Date(),
      signature: 'hello tally',
      avatar: defaultAvatar,
    });
    if (result) {
      this.ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null,
      };
    }
  }
}

module.exports = UserController;
