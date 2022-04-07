# 实时互动课堂 工程快速跑通

本文档主要介绍如何快速跑通 实时互动课堂 代码工程，更多详细介绍，请参照[腾讯云官网](https://cloud.tencent.com/document/product/647/45465)。

# 目录结构

```
./
├── assets                            -- 图标等资源文件
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

# 环境准备

> 注意：只支持 Windows 和 Mac 操作系统。

本代码工程的运行依赖于 node.js 和 yarn。

1. 安装 node.js

建议 [node.js](https://nodejs.org/en/download/) 使用 14.16.0 以上版本，安装完成后，在命令行执行以下命令检查 node.js 版本。

```
node --version
```

2. 安装 yarn

- 如果 node.js 版本小于 16.10，在命令行执行以下命令安装 [yarn](https://yarnpkg.com/getting-started/install)。

```
npm i -g corepack
```

- 如果 node.js 版本大于等于 16.10，在命令行执行以下命令安装 yarn。

> 注意：Window 10、11 下如果遇到权限不足的错误提示，请尝试以管理员身份，在 cmd 控制台执行。

```
corepack enable
```

# 运行代码

## 第一步：创建 TRTC 应用

1. 登录实时音视频控制台，选择 **【开发辅助】** > **【[快速跑通 Demo](https://console.cloud.tencent.com/trtc/quickstart)】**，在 **【创建应用】** 页签，输入您的应用名称，例如`TestTRTC`，单击 **【创建】** 按钮。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/create-new-app.png" width="800">

2. 跳过 **【下载源码】** 页签，直接点击 **【下一步】** 按钮，进入 **【修改配置】** 页签，记录下页面上显示的 **SDKAppID** 和 **密钥**，后续步骤将会用到。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/copy-sdkappid-secretkey.png" width="800">

3. 进入 **【相关云服务】** 菜单，点击下图中 **【即时通信 IM 应用】** 跳转到 IM 应用管理页面。

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/open-im-web-console.png" width="800">

4. 找到刚创建的应用，如下图，点击进入该应用管理页面。

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/find-target-im-sdkapp-name.png" width="800">

5. 打开菜单：**【功能配置】** -> **【登录与消息】** ，如下图所示，点击 **【登录设置】** 区域的 **【编辑】** 链接，将 **【Web 端可同时在线个数】** 设置为大于等于 2 的值（目前本应用最多需要同时登录 2 个 Web IM 实例，可以设置更多一些，以备后续使用）。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/modify-web-instance-up-limit.png" width="800">

## 第二步： 下载源码，配置工程

1. 可以直接下载代码，解压后进入代码目录 `trtc-education-electron`，或者使用 [git](https://git-scm.com/downloads) 工具克隆代码工程。

使用 git 工具克隆代码工程，请在命令行执行以下命令：（**欢迎 Star**，感谢~~）

```
git clone https://github.com/TencentCloud/trtc-education-electron.git

cd trtc-education-electron
```

2. 找到并打开 `src/main/config/generateUserSig.js` 文件。

3. 设置 `generateUserSig.js` 文件中的相关参数，用于生成身份认证用的用户签名 UserSig：
   - SDKAppID：默认为 0，请设置为 “第一步：创建 TRTC 应用” 的 SDKAppID。
   - SECRETKEY：默认为空字符串，请设置为 “第一步：创建 TRTC 应用” 的密钥。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/set-sdkappid-secretkey.png" width="800">

> 注意：
> 以上两个配置是为使用腾讯云实时音视频时，对用户做认证，生成用户签名 UserSig
>
> 这种生成 UserSig 的方案是在客户端代码中配置 SECRETKEY，该方法中 SECRETKEY 很容易被反编译逆向破解，一旦您的密钥泄露，攻击者就可以盗用您的腾讯云流量，因此 **该方法仅适合本地跑通 Demo 和功能调试**。
>
> 正确的 UserSig 签发方式是将 UserSig 的计算代码集成到您的服务端，并提供面向 App 的接口，在需要 UserSig 时由您的 App 向业务服务器发起请求获取动态 UserSig。更多详情请参见 [服务端生成 UserSig](https://cloud.tencent.com/document/product/647/17275#Server)。

## 第三步：编译运行

1. 开发模式运行

在命令行中，执行以下命令:

```
yarn

yarn start
```

> 注意:
>
> 第一次执行 yarn 命令安装依赖时，Window 10、11 下如果遇到权限不足的错误提示，请尝试以管理员身份，在 cmd 控制台执行一次；之后就可以以普通用户身份在 cmd 控制台或者集成开发工具自带终端中执行，例如：Visual Studio Code、WebStorm 等。
>
> 安装依赖过程中，如遇到 Electron 下载慢甚至卡住不动等问题，您可以参考 [腾讯云开发者论坛收录的 Electron 常见问题](https://cloud.tencent.com/developer/article/1616668) 文档解决。

2. 构建安装包、运行

在命令行中，执行以下命令构建安装包，构建好的安装包位于 `trtc-education-electron/build/release` 目录下，可以安装、运行。

```
yarn package
```

> 注意：只能使用 Mac 电脑构建 Mac 安装包，使用 Windows 电脑构建 Windows 安装包。

# 第四步：示例体验

> Tips: 为了达到良好的体验效果，最好使用两台电脑，一台用来创建课堂，另一台用来加入课堂。

## 教师端创建课堂

1. 应用程序启动后，在 “您的名称” 处输入 “**teacher**”，“课堂号” 可以使用应用程序自动生成的，也可以自己输入一个，点击 “创建课堂”。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/teacher-create-classroom.png" width="600"/>

2. 创建课堂后，进入教师端的互动课堂窗口。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/teacher-classroom-view.png" width="640"/>

## 学生端加入课堂

1. 应用程序启动后，在在 “您的名称” 处输入 “**student**”，“课堂号” 需要与上述教师端的课堂号保持一致，点击 “加入课堂”。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/student-enter-classroom.png" width="600"/>

2. 加入课堂后，就会进入学生端的互动课堂窗口。

<img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/student-classroom-view.png" width="640"/>

# 常见问题

1. 执行 yarn 之后，依赖下载缓慢问题

针对这个问题，建议根据当前所在地里位置，配置就近的 npm 和 Electron 镜像，比如中国大陆区域的用户可以参照以下代码，配置镜像地址，提高网络访问速度和质量。

```
yarn config set registry https://npmmirror.com/mirrors/

yarn config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
```

2. 执行 yarn 之后，依赖安装失败问题

在配置就近的 npm 和 Electron 镜像后，如果安装依赖仍然失败，可以尝试在操作系统终端中，以管理员身份执行一次 yarn 命令，后续就可以以普通用户身份正常执行了。

Windows 下，以管理员身份打开 cmd 终端，进入源代码所在目录后，直接执行 yarn 命令即可。

Mac 下，打开终端(Terminal)后，进入源代码所在目录后，执行以下命令，按照提示输入密码后，会以管理员身份执行 yarn 命令安装依赖：

```
sudo yarn
```

如果通过以上方式，执行 yarn 命令依然失败，建议加入 QQ 技术交流群：695855795，在群里联系技术支持获得帮助。

3. Mac OS 下，创建课堂/进入课堂白屏问题

如果是开发模式启动应用，请检查下系统偏好设置（System Preferences）中，是否给使用的开发工具如：Visual Studio Code、Web Storm 设置了 麦克风、摄像头 和 屏幕录制权限。

如果是构建的安装包运行，遇到这个问题，请检查下系统偏好设置（System Preferences）中，是否给当前应用授予了 麦克风、摄像头 和 屏幕录制权限。

- 如果是 Mac OS 12.x 版本，设备权限控制更为严格，最好使用 Electron SystemReference API 主动触发一次 摄像头 和 麦克风 访问权限申请。屏幕录制权限，在每次重新安装构建出来的安装包后，需要重新授权一次。详细处理方法可参照腾讯云官网收录的 [Electron 常见问题](https://cloud.tencent.com/document/product/647/62562#mac-.E4.B8.8B.EF.BC.8C.E6.89.93.E5.8C.85.E5.AE.89.E8.A3.85.E5.90.8E.EF.BC.8C.E8.BF.90.E8.A1.8C.E6.97.B6.E7.99.BD.E5.B1.8F.E3.80.81.E5.A5.94.E6.BA.83.E9.97.AE.E9.A2.98)。

4. [官网收录常见问题](https://cloud.tencent.com/document/product/647/62562)

5. [腾讯云开发者论坛收录常见问题](https://cloud.tencent.com/developer/article/1616668)

# 技术交流

欢迎加入我们的 QQ 交流群：695855795，期待一起交流&学习！

# 官网文档

[官网文档](https://cloud.tencent.com/document/product/647/45465)

# License

MIT
