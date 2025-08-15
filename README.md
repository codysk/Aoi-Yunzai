# Aoi-Yunzai v3

基于喵版[云崽v3.0](https://github.com/yoimiya-kokomi/Miao-Yunzai) 改造，需要同时安装[miao-plugin](https://github.com/yoimiya-kokomi/miao-plugin.git) 

不再支持 QQ 登录，转为使用 OneBot-V11 **正向WebSocket** 协议连接 QQ 机器人框架（如 [NapCat](https://napneko.github.io/))

## 使用方法

> 必要环境 Windows/Linux + Chrome/Chromium/Edge

> 必要环境 Node.js>16.14.0 + Redis>5.0.0

> 推荐环境 Node.js=18.18.2 + Redis>6.0.0

> 推荐使用NVM对Node.js进行版本管理

### 运行QQ机器人框架
> 参考具体的框架文档
> 以下以NapCat作为示例
```
cat <<<EOF >docker-compose.yml
services:
  napcat:
    image: mlikiowa/napcat-docker:latest
    container_name: napcat
    restart: always
    network_mode: bridge
    mac_address: 02:42:ac:11:00:02  # 添加MAC地址固化配置
    
    ports:
      - 3001:3001
      - 6099:6099
    
    volumes:
      - ./data/napcat/config:/app/napcat/config
      - ./data/ntqq:/app/.config/QQ
EOF

docker compose up -d
```
访问 http://localhost:6099 登录QQ

在网络配置中创建 **正向Websocket** 服务于 3001 端口。 

### 克隆项目

> 请根据网络情况选择Github安装或CNB/Gitee安装

```sh
# 使用 Github 
git clone --depth=1 https://github.com/codysk/Aoi-Yunzai.git
cd Aoi-Yunzai 
git clone --depth=1 https://github.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/
```

```sh
# 使用CNB/Gitee
git clone --depth=1 https://cnb.cool/umiaoi/Aoi-Yunzai.git
cd Aoi-Yunzai 
git clone --depth=1 https://gitee.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/
```

### 安装[pnpm](https://pnpm.io/zh/installation)

> 已安装的可以跳过

```sh
npm install pnpm -g
```

###  安装依赖

> 外网环境请修改的本地npm配置.npmrc

```sh
# 直接安装
pnpm install -P
```

### 运行

```sh
npm run app
```

### 托管

```sh
npm run start
```
## 致谢

|                           Nickname                            | Contribution     |
|:-------------------------------------------------------------:|------------------|
|      [Miao-Yunzai](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)      | 喵版Yunzai V3 |
|      [Yunzai v3.0](https://gitee.com/le-niao/Yunzai-Bot)      | 乐神的Yunzai-Bot V3 |
| [GardenHamster](https://github.com/GardenHamster/GenshinPray) | 模拟抽卡背景素材来源       |
|      [西风驿站](https://bbs.mihoyo.com/ys/collection/839181)      | 角色攻略图来源          |
|     [米游社友人A](https://bbs.mihoyo.com/ys/collection/428421)     | 角色突破素材图来源        |

