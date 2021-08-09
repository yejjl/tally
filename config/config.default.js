/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1628472109518_4304';

  // add your middleware config here
  config.middleware = [];

  // 配置白名单
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: [ '*' ], // 配置白名单
  };
  // 配置ejs
  config.view = {
    mapping: { '.html': 'ejs' },
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  exports.mysql = {
    // 单数据库信息配置
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '0000',
      database: 'test',
    },
    // 是否加载到app，默认开启
    app: true,
    // 是否加载到agent上，默认关闭
    agent: false,
  };
  return {
    ...config,
    ...userConfig,
  };
};
