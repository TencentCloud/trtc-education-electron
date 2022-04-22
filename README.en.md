# Overview

_English | [简体中文](README.md)_

TRTC Education for Electron is an online classroom application. It allows one teacher to teach multiple students online and can sustain real-time interactions of up to 300 users in each classroom. If relayed live streaming is enabled, tens of thousands of users can watch the live class online. This application is developed based on [TRTC](https://cloud.tencent.com/product/trtc), [IM](https://cloud.tencent.com/product/im), Electron, React, and Webpack.

# Trial

Built installers are provided, which you can download, install, and try out immediately on the [Windows edition](https://web.sdk.qcloud.com/trtc/electron/download/solution/education-v2/TRTCEducationElectron-windows-latest.zip) and [macOS edition](https://web.sdk.qcloud.com/trtc/electron/download/solution/education-v2/TRTCEducationElectron-mac-latest.zip).

# Demonstration

<table>
<tr><th>Teacher</th><th>Student</th><tr>
<tr><td><img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/preview-teacher.gif"/></td><td><img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/preview-student.gif"/></td><tr>
</table>

# Running Code

> Note: Currently, only Windows and macOS are supported.

## Step 1. Prepare your account

[Sign up for a Tencent Cloud account](https://cloud.tencent.com/document/product/378/17985) and complete [identity verification](https://cloud.tencent.com/document/product/378/3629).

## Step 2. Create an application and get `SDKAppID` and the key

If you already have a TRTC application, you can skip this step and use your application’s SDKAppID and key.

1. Log in to the TRTC console, click **Development Assistance** > **[Demo Quick Run](https://console.cloud.tencent.com/trtc/quickstart)**, enter your application name such as `TestTRTC`, and click **Create**.  
   <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/create-new-app.png" width="800">

2. Click **Next**. In the **Modify Configuration** step, note down the `SDKAppID` and key.

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/copy-sdkappid-secretkey.png" width="800">

## Step 3. Configure IM

This application uses IM internally to implement in-app chat and transfer class interaction control signaling. Because it is a multi-window application, you need to enable multi-instance login to IM.

1. Click **Relevant Cloud Services** in the left sidebar and then click **IM console > Application List**.

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/open-im-web-console.png" width="800">

2. Click the application you created as shown below:

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/find-target-im-sdkapp-name.png" width="800">

3. Click **Feature Configuration** > **Login and Message**. Under **Login Settings**, click **Edit**, and set the **Max Login Instances per User per Platform** for web to 2 or larger (the demo application requires login to only two IM instances, but you can set this value higher in case you need more in the future).

  <img src="https://web.sdk.qcloud.com/trtc/electron/download/resources/education-v2/modify-web-instance-up-limit.png" width="800">

## Step 4. Prepare the runtime environment

Node.js and Yarn are required for the source code to run.

1. Install Node.js.

Install [Node.js](https://nodejs.org/en/download/) (preferably a version higher than 14.16.0). Run the terminal command below to check the version.

```
node --version
```

2. Install Yarn.

- If the Node.js version is lower than 16.10, run the terminal command below to install [Yarn](https://yarnpkg.com/getting-started/install).

```
npm i -g corepack
```

- If the Node.js version is higher than 16.0, run the terminal command below to install Yarn.

> ! Note: On Windows 10 or 11, if an error occurs because of insufficient permissions, try running the commands as administrator in the Command Prompt.

```
corepack enable
```

## Step 5. Clone the code project

[Download a ZIP file of the code](https://github.com/TencentCloud/trtc-education-electron). After decompressing the file, you can find the code in `trtc-education-electron`. If you use [git](https://git-scm.com/downloads) to clone the code, run the following terminal command:

```
git clone https://github.com/TencentCloud/trtc-education-electron.git

cd trtc-education-electron
```

## Step 6. Configure the `SDKAppID` and key

1. Find and open `src/main/config/generateUserSig.js`.

2. Set the parameters required to generate `UserSig`:
   - SDKAPPID: 0 by default. Set it to the `SDKAppID` obtained in step 2.
   - SECRETKEY: An empty string by default. Set it to the key obtained in step 2.

> Notes:
> The above two parameters are used to generate a user signature (UserSig) for user authentication during TRTC operations.
>
> This method to obtain UserSig is to configure a SECRETKEY in the client code. In this method, the SECRETKEY is vulnerable to decompilation and reverse engineering. Once your SECRETKEY is leaked, attackers can steal your Tencent Cloud traffic. Therefore, **this method is only suitable for locally running a demo project and feature debugging**.
>
> The correct `UserSig` distribution method is to integrate the calculation code of `UserSig` into your server and provide an application-oriented API. When `UserSig` is needed, your application can send a request to the business server for a dynamic `UserSig`. For more information, see [How do I calculate `UserSig` during production?](https://intl.cloud.tencent.com/document/product/647/35166).

## Step 7. Run the code

Open `trtc-education-electron` in a terminal and run the following command:

```
yarn

yarn start
```

> Note:
>
> On Windows 10 or 11, when you run the Yarn command for the first time to install dependencies, if an error occurs because of insufficient permissions, run the command as administrator in the Command Prompt first. After that, you can run the command as an ordinary user in the Command Prompt or a terminal of your code editor such as Visual Studio Code or WebStorm.
>
> During installation of dependencies, if you encounter problems such as slow Electron download or failure, you can troubleshoot them as instructed in [FAQs About Electron](https://cloud.tencent.com/developer/article/1616668).

## Step 8. Create an installer and run it

Open `trtc-education-electron` in a terminal and run the command below to create an installer. After it is created, find the installer in `trtc-education-electron/build/release`, and then run it.

```
yarn package
```

> Note: You need macOS to create a macOS installer and Windows to create a Windows installer.

# Code Description

```
./
├── assets                            -- Built resource files such as installer icon
├── build                             -- Build directory
│   ├── app
│   └── release                       -- Built installer directory
├── src
│   ├── constants                     -- Definitions of constants shared by Electron main and renderer processes
│   ├── main                          -- Electron main process code
│   │   └── windows
│   ├── renderer                      -- Electron renderer process code
│   │   ├── ViewManager.jsx           -- View management component, which loads different pages based on the URL accessed in different windows
│   │   ├── components                -- UI component
│   │   ├── core                      -- Core business logic layer, which implements non-UI logic such as room and whiteboard logic
│   │   ├── hooks                     -- Use hooks shared by multiple pages
│   │   ├── initA18n.js
│   │   ├── locales
│   │   │   ├── en-US.json
│   │   │   └── zh-CN.json
│   │   ├── pages                     -- UI pages
│   │   ├── store
│   │   └── utils
│   └── util
├── package.json
├── babel.config.js
├── tsconfig.json
├── yarn.lock
```

# FAQs

1. FAQs at Tencent Cloud official website: <https://cloud.tencent.com/document/product/647/62562>.

2. FAQs in the Tencent Cloud developer forum: <https://cloud.tencent.com/developer/article/1616668>.

# Documentation

For documentation, see: <https://cloud.tencent.com/document/product/647/45465>.

## License

MIT
