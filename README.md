# 概述

TRTC Education Electron 是一款在线课堂应用软件，支持一名老师给多名学生在线上课，一个课堂最多同时支持 300 人在线实时互动。如果开启旁路直播服务，可支持上万人在线观看。本应用软件基于[腾讯云实时音视频通信（Tencent Real-Time Communication, TRTC）](https://cloud.tencent.com/product/trtc)、[腾讯云即时通信（Tencent Instant Message, TIM）](https://cloud.tencent.com/product/im)、Electron、React 和 Webpack 等构建。

# 立刻体验

我们提供了构建好的安装包，可以下载、安装，立刻体验：[Windows 版](https://web.sdk.qcloud.com/trtc/electron/download/solution/education-v2/TRTCEducationElectron-windows-latest.zip)、[Mac 版](https://web.sdk.qcloud.com/trtc/electron/download/solution/education-v2/TRTCEducationElectron-mac-latest.zip)。

# 效果展示

<table>
<tr><th>教师端</th><th>学生端</th><tr>
<tr><td><img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/preview-teacher.gif"/></td><td><img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/preview-student.gif"/></td><tr>
</table>

# 技术交流

欢迎加入我们的 QQ 交流群：695855795，期待一起交流&学习！

# 运行代码

> 注意：目前只支持 Windows 和 Mac 操作系统。

## 步骤 1: 前置条件

[注册腾讯云](https://cloud.tencent.com/document/product/378/17985) 账号，并完成 [实名认证](https://cloud.tencent.com/document/product/378/3629)。

## 步骤 2: 创建应用，获取 SDKAppID 和密钥

如果您之前已经创建过腾讯云实时音视频的应用，可以跳过该步骤，直接使用之前创建应用的 SDKAppID 和密钥。

1. 登录实时音视频控制台，选择 **【开发辅助】** > **【[快速跑通 Demo](https://console.cloud.tencent.com/trtc/quickstart)】**，在 **“创建应用”** 页签，输入您的应用名称，例如`TestTRTC`，单击 **【创建】** 按钮。  
   <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/create-new-app.png" width="800">

2. 跳过 **“下载源码”** 页签，直接点击 **【下一步】** 按钮，进入 **“修改配置”** 页签，记录下页面上显示的 SDKAppID 和密钥，后续步骤将会用到。

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/copy-sdkappid-secretkey.png" width="800">

## 步骤 3: 配置 即时通信 IM

本应用内部用到腾讯云即时通信 IM 实现应用内聊天、课堂互动控制信令传递，且是多窗口应用，需要开启即时通信 IM 的多实例登录。

1. 进入 **“相关云服务”** 菜单，点击下图中 **“即时通信 IM 应用”** 跳转到 IM 应用管理页面。

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/open-im-web-console.png" width="800">

2. 找到刚创建的应用，如下图，点击进入该应用管理页面。

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/find-target-im-sdkapp-name.png" width="800">

3. 打开菜单：**【功能配置】** -> **【登录与消息】** ，如下图所示，点击 **“登录设置”** 区域的 **“编辑”** 链接，将 **“Web 端可同时在线个数”** 设置为大于等于 2 的值（目前本应用最多需要同时登录 2 个 Web IM 实例，可以设置更多一些，以备后续使用）。

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/modify-web-instance-up-limit.png" width="800">

## 步骤 4: 运行环境准备

本代码工程的运行依赖于 node.js 和 yarn。

1. 安装 node.js

建议 [node.js](https://nodejs.org/en/download/) 使用 14.16.0 以上版本，安装完成后，在命令行终端执行以下命令检查 node.js 版本。

```
node --version
```

2. 安装 yarn

- 如果 node.js 版本小于 16.10，在命令行终端执行以下命令安装 [yarn](https://yarnpkg.com/getting-started/install)。

```
npm i -g corepack
```

- 如果 node.js 版本大于等于 16.10，在命令行终端执行以下命令安装 yarn。

> 注意：Window 10、11 下如果遇到权限不足的错误提示，请尝试以管理员身份，在 cmd 控制台执行。

```
corepack enable
```

## 步骤 5: 克隆代码工程

您可以直接[下载代码](https://github.com/TencentCloud/trtc-education-electron)，解压后进入代码目录 `trtc-education-electron`，或者使用 [git](https://git-scm.com/downloads) 工具克隆代码工程。使用 git 工具克隆代码工程，请在命令行终端执行以下命令：

```
git clone https://github.com/TencentCloud/trtc-education-electron.git

cd trtc-education-electron
```

## 步骤 6: 配置 SDKAppID 和密钥

1. 找到并打开 `src/main/config/generateUserSig.js` 文件。

2. 设置 `generateUserSig.js` 文件中的相关参数，用于生成身份认证用的用户签名 UserSig：
   - SDKAPPID：默认为 0，请设置为步骤 2 创建应用的 SDKAppID。
   - SECRETKEY：默认为空字符串，请设置为步骤 2 创建应用的密钥。

> 注意：
> 以上两个配置是为使用腾讯云实时音视频时，对用户做认证，生成用户签名 UserSig
>
> 这种生成 UserSig 的方案是在客户端代码中配置 SECRETKEY，该方法中 SECRETKEY 很容易被反编译逆向破解，一旦您的密钥泄露，攻击者就可以盗用您的腾讯云流量，因此 **该方法仅适合本地跑通 Demo 和功能调试**。
>
> 正确的 UserSig 签发方式是将 UserSig 的计算代码集成到您的服务端，并提供面向 App 的接口，在需要 UserSig 时由您的 App 向业务服务器发起请求获取动态 UserSig。更多详情请参见 [服务端生成 UserSig](https://cloud.tencent.com/document/product/647/17275#Server)。

## 步骤 7：开发模式运行

在命令行终端中，进入代码目录 `trtc-education-electron`，执行以下命令。

```
yarn

yarn start
```

> 注意:
>
> 第一次执行 yarn 命令安装依赖时，Window 10、11 下如果遇到权限不足的错误提示，请尝试以管理员身份，在 cmd 控制台执行一次；之后就可以以普通用户身份在 cmd 控制台或者集成开发工具自带终端中执行，例如：Visual Studio Code、WebStorm 等。
>
> 安装依赖过程中，如遇到 Electron 下载慢甚至卡住不动等问题，您可以参考 [Electron 常见问题收录](https://cloud.tencent.com/developer/article/1616668) 文档解决。

## 步骤 8: 构建安装包、运行

在命令行终端中，进入代码目录 `trtc-education-electron`，执行以下命令构建安装包，构建好的安装包位于 `trtc-education-electron/build/release` 目录下，可以安装运行。

```
yarn package
```

> 注意：只能使用 Mac 电脑构建 Mac 安装包，使用 Windows 电脑构建 Windows 安装包。

# 代码说明

```
./
├── assets                            -- 构建出的安装包图标等资源文件
├── build                             -- 构建目录
│   ├── app
│   └── release                       -- 构建出的安装包存放目录
├── src
│   ├── constants                     -- Electron 主进程和渲染进程公用的常量定义
│   ├── main                          -- Electron 主进程代码
│   │   └── windows
│   ├── renderer                      -- Electron 渲染进程代码
│   │   ├── ViewManager.jsx           -- 视图管理组件，根据不同窗口访问的 URL 地址，加载不同页面
│   │   ├── components                -- UI 组件
│   │   ├── core                      -- 核心业务逻辑层，房间、白板等 UI 无关的逻辑层实现
│   │   ├── hooks                     -- 多个页面公用的 use hooks
│   │   ├── initA18n.js
│   │   ├── locales
│   │   │   ├── en-US.json
│   │   │   └── zh-CN.json
│   │   ├── pages                     -- UI 页面
│   │   ├── store
│   │   └── utils
│   └── util
├── package.json
├── babel.config.js
├── tsconfig.json
├── yarn.lock
```

# 常见问题

1. 官网收录常见问题：<https://cloud.tencent.com/document/product/647/62562>。

2. 腾讯云开发者论坛收录常见问题：<https://cloud.tencent.com/developer/article/1616668>。

# 官网文档

我们的官网文档，请查看：<https://cloud.tencent.com/document/product/647/45465>

## License

MIT
