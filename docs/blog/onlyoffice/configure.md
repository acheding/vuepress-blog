# Onlyoffice 编译参数配置

`build_tools` 是 ONLYOFFICE DocumentServer 的编译工具，我们知道，执行 `./automate.py server` 可以进行编译，还有其他参数可以配置吗？

`build_tools/configure.py` 文件中介绍了这些参数。

## 主要参数分类

### 更新与分支控制

- `--update=1|0`：是否更新/克隆仓库
  - `1`（默认）：自动获取必要的子仓库
  - `0`：不更新，需手动指定使用哪些仓库
- `--update-light`：执行轻量级更新（不切换分支）
  - 仅当 `--update=1` 时有效
- `--branch=分支名`：指定分支/标签名
  - 默认值：`master`
  - 仅当 `--update=1` 且未使用 `--update-light` 时有效
  - 会更新/克隆所有仓库并切换到指定分支，删除所有本地更改

### 构建控制

- `--clean=1|0`：是否全新构建
  - `1`（默认）：重新构建所有内容
- `--module=模块名`：指定要构建的模块
  - 默认值：`builder`
  - 可指定多个，例如：`--module 'core desktop builder server mobile'`
- `--develop=1|0`：是否为开发模式
  - 默认值：`0`
- `--beta=1|0`：是否为测试版模式
  - 默认值：`0`

### 平台与编译器

- `--platform=平台`：指定目标平台
  - 默认值：`native`（当前系统）
  - 可选值：
    - 具体平台：`win_64`, `win_32`, `win_64_xp`, `win_32_xp`, `linux_64`, `linux_32`, `mac_64`, `ios`, `android_arm64_v8a`, `android_armv7`, `android_x86`, `android_x86_64`
    - 组合：
      - `native`：当前系统（仅 Windows/Linux/Mac）
      - `all`：所有可用系统
      - `windows`：所有 Windows 平台
      - `linux`：所有 Linux 平台
      - `mac`：Mac 平台
      - `android`：所有 Android 平台
- `--compiler=编译器名`：指定编译器
  - 默认自动选择
  - 可选值：`msvc2015`, `msvc2015_64`, `gcc`, `gcc_64`, `clang`, `clang_64` 等
  - 不推荐手动指定，除非有特殊需求

### Qt 相关

- `--qt-dir=路径`：指定 Qt 目录
  - qmake 位于 `qt-dir/compiler/bin` 目录
- `--qt-dir-xp=路径`：为 Windows XP 指定 Qt 目录
  - qmake 位于 `qt-dir/compiler/bin` 目录
- `--no-apps=1|0`：是否禁用构建使用 Qt 的桌面应用
  - 默认值：`0`（不禁用）

### 数据库配置

- `--sql-type=类型`：指定 SQL 类型
  - 默认值：`postgres`
- `--db-port=端口`：指定数据库端口
  - 默认值：`5432`
- `--db-user=用户名`：指定数据库用户
  - 默认值：`onlyoffice`
- `--db-pass=密码`：指定数据库密码
  - 默认值：`onlyoffice`

### 品牌与主题

- `--branding=路径`：提供品牌路径
- `--branding-name=名称`：提供品牌名称
- `--branding-url=URL`：提供品牌 URL
- `--themesparams=参数`：提供生成演示主题缩略图的设置

### 插件与附加组件

- `--sdkjs-addon=插件`：提供 sdkjs 插件（可多次使用）
- `--sdkjs-addon-desktop=插件`：提供桌面版 sdkjs 插件（可多次使用）
- `--server-addon=插件`：提供服务器插件（可多次使用）
- `--web-apps-addon=插件`：提供 web 应用插件（可多次使用）
- `--sdkjs-plugin=插件`：提供服务器和桌面版编辑器的插件（可多次使用）
  - 默认值：`default`
- `--sdkjs-plugin-server=插件`：提供服务器版编辑器的插件（可多次使用）
  - 默认值：`default`

### 其他配置

- `--config=参数`：为 qmake 提供额外参数
- `--external-folder=路径`：指定外部文件夹目录
- `--features=特性`：指定原生特性（配置插件）
- `--git-protocol=协议`：指定 Git 协议
  - 默认值：`https`
  - 可选值：`https`, `ssh`
  - 仅当 `--update=1` 时有效
- `--vs-version=版本`：指定 Visual Studio 版本
  - 默认值：`2015`
- `--vs-path=路径`：指定 vcvarsall 路径
- `--siteUrl=URL`：指定站点 URL
  - 默认值：`127.0.0.1`
- `--multiprocess=1|0`：是否使用多进程构建
  - 默认值：`1`（启用）

## 使用示例

1. 使用开发分支构建服务器模块：

   ```bash
   python configure.py --branch=develop --module=server
   ```

2. 为 Windows 64 位平台构建所有模块：

   ```bash
   python configure.py --platform=win_64 --module="core desktop builder server"
   ```

3. 使用自定义 Qt 目录构建：

   ```bash
   python configure.py --qt-dir="D:\Qt\5.15.2\msvc2019_64"
   ```

4. 禁用更新并使用本地代码构建：

   ```bash
   python configure.py --update=0 --clean=1
   ```

5. 构建带有自定义品牌的版本：
   ```bash
   python configure.py --branding="D:\branding\custom" --branding-name="CustomOffice"
   ```

## 环境变量

除此之外，还有一些环境变量被大量使用。

- 公司名称 (COMPANY_NAME)
- 产品名称 (PRODUCT_NAME)
- 产品版本 (PRODUCT_VERSION)
- 构建号 (BUILD_NUMBER)
- 平台 (PLATFORM)
- 架构 (ARCHITECTURE)
- 包名称 (PACKAGE_NAME)
- 包版本 (PACKAGE_VERSION)
- 构建日期 (BUILD_DATE)

### 设置环境变量

```bash
export BUILD_NUMBER = 2
```

### 查看变量

```bash
echo $BUILD_NUMBER
```

这些参数可以根据您的具体需求组合使用，以配置最适合您项目的构建环境。
