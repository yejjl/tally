'use strict';

const fs = require('fs');
const moment = require('moment');
const mkdirp = require('mkdirp');
const path = require('path');

const Controller = require('egg').Controller;
const UserController = require('./user');

class UploadController extends Controller {
  async upload() {
    const { ctx } = this;
    const file = ctx.request.files[0];

    // 声明存放资源的路径
    let uploadDir = '';
    try {
      // ctx.request.files[0]表示获取第一个文件
      const f = fs.readFileSync(file.filepath);
      // 获取当前时间
      const day = moment(new Date()).format('YYYYMMDD');
      // 创建图片的保存路径
      const dir = path.join(this.config.uploadDir, day);
      const date = Date.now();// 毫秒数
      await mkdirp(dir);
      // 返回图片的保存路径
      uploadDir = path.join(dir, date + path.extname(file.filename));
      // 写入文件夹
      fs.writeFileSync(uploadDir, f);


    } finally {
      // 清除临时文件夹
      ctx.cleanupRequestFiles();
    }
    ctx.body = {
      code: 200,
      msg: '上传成功',
      data: uploadDir.replace(/app/g, ''),
    };
  }
}
module.exports = UploadController;
