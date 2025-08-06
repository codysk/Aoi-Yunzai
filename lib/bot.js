import "./config/init.js"
import ListenerLoader from "./listener/loader.js"
import { Client } from "./onebot11/client.ts"
import cfg from "./config/config.js"

export default class Yunzai extends Client {
  // eslint-disable-next-line no-useless-constructor
  constructor(conf) {
    super(conf)
  }

  /** 登录机器人 */
  static async run() {
    const bot = new Yunzai(cfg.onebot)
    /** 加载监听事件 */
    await ListenerLoader.load(bot)

    await bot.start()

    bot[bot.uin] = bot
    /** 全局变量 bot */
    global.Bot = bot

    bot.emit("system.online")
    return bot
  }

}
