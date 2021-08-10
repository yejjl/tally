'use strict';

const Controller = require('egg').Controller;
const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png';

class UserController extends Controller {
  // 注册
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
  // 登录
  async login() {
    const { app, ctx } = this;
    const { username, password } = ctx.request.body;
    // 根据用户名，查找对于数据
    const userInfo = await ctx.service.user.getUserByName(username);
    // 没找到
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账号不存在',
        data: null,
      };
      return;
    }
    if (userInfo && password !== userInfo.password) {
      ctx.body = {
        code: 500,
        msg: '密码错误',
        data: null,
      };
      return;
    }
    // 生成token 加盐
    // app.jwt.sign 方法接受两个参数，第一个为需要加密的对象，第二个未加密字符串
    const token = app.jwt.sign({
      id: userInfo.id,
      username: userInfo.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // token有效期24小时
    }, app.config.jwt.secret);
    ctx.body = {
      code: 200,
      msg: '登录成功',
      data: {
        token,
      },
    };
    return;
  }
  // 测试
  async test() {
    const { app, ctx } = this;
    const token = ctx.request.header.authorization;

    // 通过app.jwt.verify+加密字符串解析出token的值
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    // const decode = ctx.middleware.jwtErr.decode;
    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        ...decode,
      },
    };
    return;
  }
  // 获取用户信息
  async getUserInfo() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    // 通过app.jwt.verify方法，解析出token内的用户信息
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    const userInfo = await ctx.service.user.getUserByName(decode.username);
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature,
        avatar: userInfo.avatar,
      },
    };
  }
  // 修改用户信息
  async editUserInfo() {
    const { ctx, app } = this;
    // 获取signature
    const { signature = '', avatar = '' } = ctx.request.body;
    try {

      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const userInfo = await ctx.service.user.getUserByName(decode.username);
      const result = await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: user_id,
          signature,
          username: userInfo.username,
          avatar,
        },
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

module.exports = UserController;
