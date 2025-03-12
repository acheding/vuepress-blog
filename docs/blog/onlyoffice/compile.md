# Onlyoffice 源码编译

## 1 搭建编译镜像

### 1.1 下载编译工具源码

```bash
git clone https://github.com/ONLYOFFICE/build_tools.git
```

### 1.2 搭建镜像

1. 进入 build_tools 目录。
2. 构建镜像。

   ```bash
   docker build -t onlyoffice/documentserver .
   ```

### 1.3 运行编译容器

```bash
docker run -dit --name onlyoffice -p 8080:80 onlyoffice/documentserver bash
```

### 1.4 进入编译容器

```bash
docker exec -it onlyoffice bash
```

### 1.5 执行编译

```bash
cd tools/linux

python3 ./automate.py server
```

该过程会下载 onlyoffice 源码并编译，编译结果存放于 build_tools/out 目录，持续约 5 个小时，需要配合使用科学上网工具。

## 2 修改 onlyoffice 源码

### 2.1 修改连接数

1.编辑 build_tools/server/Common/sources/contants.js，修改连接数。

```js
exports.LICENSE_CONNECTIONS = 20; # 将此处修改你想要的连接数
```

### 2.2 开启 advancedApi

编辑 server/Common/sources/license.js，设置 advancedApi 为 true，即开启 iframe 端接口命令的能力。

```js
exports.readLicense = async function () {
  ...
  return [
    {
      ...
      advancedApi: true,
      ...
    },
    null
  ];
};
```

### 2.3 关闭源码更新

```bash
vim /build_tools/tools/linux/automate.py
```

```py
build_tools_params = ["--branch", branch,
                    "--module", modules,
                    "--update", "0",    #此处修改为0，1会拉取最新代码
                    "--qt-dir", os.getcwd() + "/qt_build/Qt-5.9.9"] + params
```

### 2.4 增加 Api 方法

```bash
vim /sdkjs/word/apiBuilder.js
```

```js
Api.prototype["HistoryTurnOff"] = Api.prototype.HistoryTurnOff;

Api.prototype.HistoryTurnOff = function () {
  AscCommon.HistoryTurnOff();
};
```

### 2.4 执行编译

```bash
cd /build\*tools/tools/linux

python3 ./automate.py server
```

等待编译，约半小时左右。

### 2.5 添加 connector 代码

编辑 build_tools/out/linux_64/onlyoffice/documentserver/web-apps/apps/api/documents/api.js，在 DocsAPI.DocEditor 函数中添加 connetor 相关代码。

::: details 点击查看代码

```js
(function (m) {
  function n() {
    if (window.crypto && window.crypto.getRandomValues) {
      var a = new Uint16Array(8);
      window.crypto.getRandomValues(a);
      var b = 0;
      function d() {
        return (65536 + a[b++]).toString(16).substring(1);
      }
      return (
        d() + d() + "-" + d() + "-" + d() + "-" + d() + "-" + d() + d() + d()
      );
    }
    function c() {
      return Math.floor(65536 * (1 + Math.random()))
        .toString(16)
        .substring(1);
    }
    return (
      c() + c() + "-" + c() + "-" + c() + "-" + c() + "-" + c() + c() + c()
    );
  }
  function e(a) {
    this.frame = a.frame;
    this.guid = "asc.{" + n() + "}";
    this.isConnected = !1;
    this.callbacks = [];
    this.events = {};
    this.tasks = [];
    this.editorInfo = {};
    this.onMessageBound = this.onMessage.bind(this);
    a.autoconnect && this.connect();
    void 0 === window.Asc && (window.Asc = {});
    void 0 === window.Asc.scope && (window.Asc.scope = {});
  }
  function g(a) {
    this.connector = a;
    this.id = n();
    this.id = this.id.replace(/-/g, "");
    this._events = {};
  }
  e.prototype.onMessage = function (a) {
    if ("string" == typeof a.data) {
      var b = {};
      try {
        b = JSON.parse(a.data);
      } catch (f) {
        b = {};
      }
      if (
        "onExternalPluginMessageCallback" === b.type &&
        ((b = b.data), this.guid === b.guid)
      )
        switch (b.type) {
          case "onMethodReturn":
            0 < this.callbacks.length &&
              (a = this.callbacks.shift()) &&
              a(b.methodReturnData);
            0 < this.tasks.length && this.sendMessage(this.tasks.shift());
            break;
          case "onCommandCallback":
            0 < this.callbacks.length &&
              (a = this.callbacks.shift()) &&
              a(b.commandReturnData);
            0 < this.tasks.length && this.sendMessage(this.tasks.shift());
            break;
          case "onEvent":
            b.eventName &&
              this.events[b.eventName] &&
              this.events[b.eventName].call(this, b.eventData);
            break;
          case "onInfo":
            this.editorInfo = b;
            void 0 !== this.editorInfo.data && delete this.editorInfo.data;
            void 0 !== this.editorInfo.type && delete this.editorInfo.type;
            if (this.editorInfo.theme && this.onThemeChanged)
              this.onThemeChanged(this.editorInfo.theme);
            break;
          case "onTheme":
            this.editorInfo.theme = b.theme;
            if (this.editorInfo.theme && this.onThemeChanged)
              this.onThemeChanged(this.editorInfo.theme);
            break;
          case "onWindowEvent":
            if ("private_window_method" === b.eventName) {
              var c = b.windowID,
                d = this;
              this.executeMethod(
                b.eventData.name,
                b.eventData.params,
                function (f) {
                  d._windows &&
                    d._windows[c] &&
                    d._windows[c].dispatchEvent("on_private_window_method", f);
                }
              );
            } else
              "private_window_command" === b.eventName
                ? ((c = b.windowID),
                  (d = this),
                  this.callCommand(
                    b.eventData.code,
                    function (f) {
                      d._windows &&
                        d._windows[c] &&
                        d._windows[c].dispatchEvent(
                          "on_private_window_command",
                          f
                        );
                    },
                    !1 === b.eventData.isCalc ? !0 : void 0
                  ))
                : this._windows[b.windowID]._oncommand(
                    b.eventName,
                    b.eventData
                  );
            break;
          case "onWindowButton":
            if (this._windows && b.windowID && this._windows[b.windowID])
              if (-1 === b.button) this._windows[b.windowID].close();
              else if (this._windows[b.windowID].onButtonClick)
                this._windows[b.windowID].onButtonClick(b.button);
        }
    }
  };
  e.prototype.sendMessage = function (a) {
    var b = {
      frameEditorId: "iframeEditor",
      type: "onExternalPluginMessage",
      subType: "connector",
    };
    b.data = a;
    b.data.guid = this.guid;
    a = this.frame;
    "string" === typeof a && (a = document.getElementById(this.frame));
    a && a.contentWindow.postMessage(JSON.stringify(b), "*");
  };
  e.prototype.connect = function () {
    this.isConnected
      ? console.log("This connector is already connected")
      : (window.addEventListener
          ? window.addEventListener("message", this.onMessageBound, !1)
          : window.attachEvent &&
            window.attachEvent("onmessage", this.onMessageBound),
        (this.isConnected = !0),
        this.sendMessage({
          type: "register",
        }));
  };
  e.prototype.disconnect = function () {
    this.isConnected
      ? (window.removeEventListener
          ? window.removeEventListener("message", this.onMessageBound, !1)
          : window.detachEvent &&
            window.detachEvent("onmessage", this.onMessageBound),
        (this.isConnected = !1),
        this.sendMessage({
          type: "unregister",
        }),
        this.sendMessage({
          type: "unregister",
        }))
      : console.log("This connector is already disconnected");
  };
  e.prototype.callCommand = function (a, b, c) {
    this.isConnected
      ? (this.callbacks.push(b),
        (a = {
          type: "command",
          recalculate: !0 === c ? !1 : !0,
          data:
            "string" === typeof a
              ? a
              : "var Asc = {}; Asc.scope = " +
                JSON.stringify(window.Asc.scope || {}) +
                "; var scope = Asc.scope; (" +
                a.toString() +
                ")();",
        }),
        1 !== this.callbacks.length ? this.tasks.push(a) : this.sendMessage(a))
      : console.log("Connector is not connected with editor");
  };
  e.prototype.executeMethod = function (a, b, c) {
    this.isConnected
      ? (this.callbacks.push(c),
        (a = {
          type: "method",
          methodName: a,
          data: b,
        }),
        1 !== this.callbacks.length ? this.tasks.push(a) : this.sendMessage(a))
      : console.log("Connector is not connected with editor");
  };
  e.prototype.attachEvent = function (a, b) {
    this.isConnected
      ? ((this.events[a] = b),
        this.sendMessage({
          type: "attachEvent",
          name: a,
        }))
      : console.log("Connector is not connected with editor");
  };
  e.prototype.detachEvent = function (a) {
    this.events[a] &&
      (delete this.events[a],
      this.isConnected
        ? this.sendMessage({
            type: "detachEvent",
            name: a,
          })
        : console.log("Connector is not connected with editor"));
  };
  e.prototype._correctCustomMenuItems = function (a, b) {
    var c = {
      guid: this.guid,
    };
    b.tabs ? (c.tabs = []) : (c.items = []);
    let d = function (p, h) {
      let k = {
        id: void 0 !== h.id ? h.id : n(),
      };
      for (prop in h)
        switch (prop) {
          case "id":
          case "items":
          case "onClick":
            break;
          case "url":
          case "icons":
            k[prop] = new URL(h[prop], location.href).href;
            break;
          default:
            k[prop] = h[prop];
        }
      if (h.items) {
        k.items = [];
        for (var q = 0, r = h.items.length; q < r; q++)
          k.items.push(d(p, h.items[q]));
      } else h.onClick && ((p[a][k.id] = !0), p.attachEvent(k.id, h.onClick));
      return k;
    };
    if (b.tabs) {
      c.tabs = [];
      for (var f = 0, l = b.tabs.length; f < l; f++)
        c.tabs.push(d(this, b.tabs[f]));
    } else
      for (c.items = [], f = 0, l = b.length; f < l; f++)
        c.items.push(d(this, b[f]));
    return c;
  };
  e.prototype._addCustomMenuEvent = function (a) {
    let b = "";
    "contextMenuEvents" == a
      ? (b = "onContextMenuClick")
      : "toolbarMenuEvents" == a && (b = "onToolbarMenuClick");
    this.events[b] ||
      this.attachEvent(
        b,
        function (d) {
          var f = void 0,
            l = d.indexOf("_oo_sep_");
          -1 !== l && ((f = d.substring(l + 8)), (d = d.substring(0, l)));
          this.events[d] && this.events[d].call(this, f);
        }.bind(this)
      );
    if (this[a])
      for (var c in this[a]) this[a].hasOwnProperty(c) && this.detachEvent(c);
    this[a] = {};
  };
  e.prototype.addContextMenuItem = function (a) {
    this._addCustomMenuEvent("contextMenuEvents");
    this.executeMethod("AddContextMenuItem", [
      this._correctCustomMenuItems("contextMenuEvents", a),
    ]);
  };
  e.prototype.updateContextMenuItem = function (a) {
    this.executeMethod("UpdateContextMenuItem", [
      this._correctCustomMenuItems("contextMenuEvents", a),
    ]);
  };
  e.prototype.addToolbarMenuItem = function (a) {
    this._addCustomMenuEvent("toolbarMenuEvents");
    this.executeMethod("AddToolbarMenuItem", [
      this._correctCustomMenuItems("toolbarMenuEvents", a),
    ]);
  };
  g.prototype._register = function () {
    this.connector._windows || (this.connector._windows = {});
    this.connector._windows[this.id] = this;
  };
  g.prototype._unregister = function () {
    this.connector._windows &&
      this.connector._windows[this.id] &&
      delete this.connector._windows[this.id];
  };
  g.prototype.show = function (a) {
    var b = new URL(a.url, location.href).href;
    b = -1 === b.indexOf(".html?") ? b + "?windowID=" : b + "&windowID=";
    b += this.id + "&guid=" + encodeURIComponent(this.connector.guid);
    a.url = b;
    a.icons && (a.icons = new URL(a.icons, location.href).href);
    this._register();
    this.connector.executeMethod("ShowWindow", [this.id, a]);
  };
  g.prototype.activate = function () {
    this.connector.executeMethod("ActivateWindow", [this.id]);
  };
  g.prototype.close = function () {
    this._oncommand("onClose");
    this.connector.executeMethod("CloseWindow", [this.id]);
    this._unregister();
  };
  g.prototype.dispatchEvent = function (a, b) {
    this.connector.executeMethod("SendToWindow", [
      this.id,
      a,
      "object" === typeof b ? JSON.stringify(b) : b,
    ]);
  };
  g.prototype.attachEvent = function (a, b) {
    this._events[a] = b;
  };
  g.prototype.detachEvent = function (a) {
    this._events && this._events[a] && delete this._events[a];
  };
  g.prototype._oncommand = function (a, b) {
    this._events && this._events[a] && this._events[a].call(this, b);
  };
  e.prototype.createWindow = function () {
    return new g(this);
  };
  m.Asc = m.Asc ? m.Asc : {};
  m.Asc.EditorConnector = e;
})(window);

function _createConnector(settings) {
  return new Asc.EditorConnector({
    frame: iframe,
    autoconnect: settings ? settings.autoconnect : true,
  });
}
```

:::

同时，在 DocsAPI.DocEditor 函数的 return 中添加 createConnector。

```js
return {
  createConnector: _createConnector,
};
```

## 3 启动服务（方式一）

### 3.1 安装 nginx

```bash
apt-get install nginx

rm -f /etc/nginx/sites-enabled/default

vim /etc/nginx/sites-available/onlyoffice-documentserver
```

复制以下内容

```bash
map $http_host $this_host {
  "" $host;
  default $http_host;
}
map $http_x_forwarded_proto $the_scheme {
  default $http_x_forwarded_proto;
  "" $scheme;
}
map $http_x_forwarded_host $the_host {
  default $http_x_forwarded_host;
  "" $this_host;
}
map $http_upgrade $proxy_connection {
  default upgrade;
  "" close;
}
proxy_set_header Host $http_host;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $proxy_connection;
proxy_set_header X-Forwarded-Host $the_host;
proxy_set_header X-Forwarded-Proto $the_scheme;
server {
  listen 0.0.0.0:80;
  listen [::]:80 default_server;
  server_tokens off;
  rewrite ^\/OfficeWeb(\/apps\/.*)$ /web-apps$1 redirect;
  location / {
    proxy_pass http://localhost:8000;
    proxy_http_version 1.1;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/onlyoffice-documentserver /etc/nginx/sites-enabled/onlyoffice-documentserver
service nginx start
```

### 3.2 安装 postgresql

```bash
apt-get install postgresql

service postgresql start

sudo -i -u postgres psql -c "CREATE USER onlyoffice WITH PASSWORD 'onlyoffice';"

sudo -i -u postgres psql -c "CREATE DATABASE onlyoffice OWNER onlyoffice;"

psql -hlocalhost -Uonlyoffice -d onlyoffice -f linux_64/onlyoffice/documentserver/server/schema/postgresql/createdb.sql
```

### 3.3 安装 rabbitmq-server

```bash
apt-get install rabbitmq-server

service rabbitmq-server start
```

### 3.4 初始化字体

```bash
cd out/linux_64/onlyoffice/documentserver/

mkdir fonts

LD_LIBRARY_PATH=${PWD}/server/FileConverter/bin server/tools/allfontsgen \
  --input="${PWD}/core-fonts" \
 --allfonts-web="${PWD}/sdkjs/common/AllFonts.js" \
  --allfonts="${PWD}/server/FileConverter/bin/AllFonts.js" \
 --images="${PWD}/sdkjs/common/Images" \
  --selection="${PWD}/server/FileConverter/bin/font_selection.bin" \
 --output-web='fonts' \
 --use-system="true"
```

### 3.5 生成演示主题

```bash
cd out/linux_64/onlyoffice/documentserver/

LD_LIBRARY_PATH=${PWD}/server/FileConverter/bin server/tools/allthemesgen \
  --converter-dir="${PWD}/server/FileConverter/bin"\
 --src="${PWD}/sdkjs/slide/themes"\
  --output="${PWD}/sdkjs/common/Images"
```

### 3.6 运行服务

1.FileConverter 服务

```bash
cd out/linux_64/onlyoffice/documentserver/server/FileConverter

LD_LIBRARY_PATH=$PWD/bin \
NODE_ENV=development-linux \
NODE_CONFIG_DIR=$PWD/../Common/config \
./converter
```

2.DocService 服务

```bash
cd out/linux_64/onlyoffice/documentserver/server/DocService

NODE_ENV=development-linux \
NODE_CONFIG_DIR=$PWD/../Common/config \
./docservice
```

### 3.7 官网示例工程测试

1.下载官网示例工程源码

```bash
git clone https://github.com/ONLYOFFICE/document-editor-vue.git
```

2.安装依赖

```bash
yarn install
```

3.修改配置文件
进入项目 config/default.json 文件，修改 documentServerUrl 为服务地址。

```json
{
  "documentServerUrl": "http://10.214.xxx.xx:xxxx/",
  "demoStorage": "https://d2nlctn12v279m.cloudfront.net/assets/docs/samples/"
}
```

4.运行

```bash
yarn storybook
```

### 3.8 精简镜像

整个流程下来，镜像体积可达 30 多 G，事实上，只需要最后编译结果 out 目录即可运行，为了便于移植和部署，可先执行 3.4 和 3.5，然后将 out 目录导出，编写 Dockerfile，构建精简镜像，使用启动脚本，自动完成 3.3、3.2、3.3、3.6 步骤，以下为 Dockerfile 和 init.sh 代码。

[Dockerfile](https://zhang.beer/static/images/Dockerfile0)

[init.sh](https://zhang.beer/static/images/init.sh)

## 4 启动服务（方式二）(推荐)

### 4.1 构建 deb 包

1. 进入编译容器

```bash
docker exec -it onlyoffice bash
```

2. 下载 document-server-package 源码

```bash
git clone https://github.com/ONLYOFFICE/document-server-package.git
```

![compile-list](https://zhang.beer/static/images/compile-list.png)

3. 编译 deb 包

```bash
cd /document-server-package

cat << EOF >> Makefile
deb_dependencies: \$(DEB_DEPS) #编译文件追加 dependencies
EOF

PRODUCT_VERSION='8.2.2' BUILD_NUMBER='1' make deb_dependencies

cd deb/build

sudo apt build-dep ./

cd /document-server-package

PRODUCT_VERSION='8.2.2' BUILD_NUMBER='1' make deb
```

deb 文件在/document-server-package/deb/onlyoffice-documentserver_8.2.2-1_amd64.deb。

下次构建只需保留 template 文件夹，其余的文件夹和文件都需要删掉。

### 4.2 构建部署镜像

1. 退出容器，宿主机下载 Docker-DocumentServer 源码

```bash
git clone https://github.com/ONLYOFFICE/Docker-DocumentServer.git
```

2. 拷贝 deb 文件至源码，重命名为 onlyoffice.deb

```bash
docker cp onlyoffice:/document-server-package/deb/onlyoffice-documentserver_8.2.2-1_amd64.deb .
```

3. 替换 Docker-DocumentServer 的 Dockerfile 和 run-document-server.sh 文件如下

[Dockerfile](https://zhang.beer/static/images/Dockerfile)

[run-document-server.sh](https://zhang.beer/static/images/run-document-server.sh)

4. 编译

```bash
docker build -t onlyoffice/documentserver:8.2.2-1 .
```

### 4.3 使用服务

1. 启动镜像

```bash
docker run -dit -p 8888:80 -p 5432:5432 --name onlyoffice --restart=always -e JWT_ENABLED=false onlyoffice/documentserver:8.2.2-1 bash
```

2. 打开 welcome 页面（ip:8888）

3. 开启 example，命令在 welcome 页面

```bash
docker exec onlyoffice sudo supervisorctl start ds:example

docker exec onlyoffice sudo sed 's,autostart=false,autostart=true,' -i /etc/supervisor/conf.d/ds-example.conf
```

4. 设置文件大小和允许私有 IP 访问

```bash
docker exec -it onlyoffice bash
vim /etc/onlyoffice/documentserver/default.json

limits_tempfile_upload :524288000（500M）
maxDownloadBytes: 524288000（500M）
uncompressed :"500MB"

"request-filtering-agent" : {
   "allowPrivateIPAddress": true,
   "allowMetaIPAddress": true
}
```

5. 重启服务

```bash
docker restart onlyoffice
```

6. 修改 postgresql 配置，允许远程连接

```bash
vim /etc/postgresql/16/main/postgresql.conf
# 将 listen_addresses = localhost 修改如下
listen_addresses = '*'

vim /etc/postgresql/16/main/pg_hba.conf
# 文件最后新增一行
host  all  all  0.0.0.0/0  md5

# 重启 postgresql
service postgresql restart
```

查看 converter 日志

```bash
cat /var/log/onlyoffice/documentserver/converter/out.log
```

查看 example 上传的文档

```bash
cd /var/lib/onlyoffice/documentserver-example/files
```
