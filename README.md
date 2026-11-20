# 浏览器插件（蛙思诶）

## 启动步骤
1. Neo4j启动：管理员身份 `neo4j.bat console`
2. 运行 `challenge.py`，保持 Flask 服务在 `http://127.0.0.1:5000/` 运行
3. 在 Chrome 扩展程序页面加载插件
4. 打开谷歌/百度搜索引擎页面，在搜索框输入与疾病/药物相关关键词，搜索框内容会实时同步到右下角悬浮窗
5. 点击右下角紫色圆钮，会展开显示 Neo4j 返回的知识图谱
6. 选择你想了解的疾病所对应的节点，悬浮窗下方会显示该疾病的名词解释、易感人群、治疗周期、部门、成因、预防等信息
7. 还想查看其他内容，修改搜索框内容重新搜索即可，悬浮窗会自动刷新

## 文件功能说明
- `manifest.json`：配置扩展信息
- `popup`：临时窗口
- `background`：常驻后台脚本
- `contentscript`：网页注入专属脚本，获取网页web信息
- `challenge.py`：新增 `/api/graph` 接口，并允许插件跨域访问本地 Flask 服务
- `content.js`：自动识别搜索引擎搜索框和 URL 参数，将搜索词同步到图谱接口
- `xuanfu.js`：在悬浮窗内创建图谱状态、ECharts 容器和节点详情区域
- `chart3.js`：用于接收 Neo4j 数据后重绘悬浮窗知识图谱

# 浏览器插件（蛙思诶）

大创项目里的浏览器插件归档。这一层只放说明和一个插件目录，真正的插件根目录是 `wasei`，`manifest.json` 在 `wasei` 下面。加载扩展时要选 `wasei` 目录，不能选本目录。

## 项目简介

「蛙思诶」是一个 Manifest V3 扩展。它在网页上注入一个悬浮面板，根据当前搜索词向本地 Flask 服务请求图谱数据，用 ECharts 画成力导向关系图，同时提供夜间模式、划词朗读和划词跳转搜索。

## 功能说明

- 悬浮面板：`xuanfu.js` 在 `html` 末尾插入 `.menu-box`，包含折叠按钮、搜索词与状态提示、图表容器 `#chart3`、节点详情区。点按钮展开或收起。
- 知识图谱：`content.js` 从地址栏参数（`wd`、`word`、`q`、`query`、`keyword`）或搜索框（`#kw`、`input[name="wd"]`、`input[name="q"]`、`input[type="search"]`）取关键词，请求 `http://127.0.0.1:5000/api/graph?q=关键词`，把结果交给 `chart3.js` 绘制。
- 图表交互：力导向布局，可缩放拖动。点击节点后，详情区显示名词解释、易感人群、治疗周期、部门、成因、预防。
- 夜间模式：弹窗里的「开/关灯」往页面插入一段深色样式，设置存在 `chrome.storage.local` 的 `frogDarkMode`。
- 右键菜单：`Speak` 用 `chrome.tts` 朗读选中文字；`我的搜索` 子菜单可用 B 站或百度百科搜索选中文字。
- 清理页面：内容脚本删除百度的 `#content_right` 容器。
- 选项页：切换 `language` 并保存，`.idea` 目录是 PyCharm 的工程配置。

## 目录结构

```
浏览器插件/
└── wasei/                      插件根目录
    ├── manifest.json           扩展配置
    ├── background.js           右键菜单、朗读、原生消息
    ├── challenge.py            Flask 后端，提供 /api/graph
    ├── com.example.native.json 原生消息宿主注册文件
    ├── templates/              popup.html、option.html、options.html、chartjs.html
    ├── static/
    │   ├── js/                 jquery、echarts、xuanfu.js、chart3.js、content.js、popup.js
    │   ├── css/                popup.css、xuanfu.css、content.css、sousuo.css
    │   ├── img/                图标与面板素材
    │   └── font-awesome-4.7.0/ 图标字体，含 css/fonts/less/scss
    ├── img/1.png
    ├── .idea/                  PyCharm 工程配置
    └── wasei/README.md         原有一行说明
```

## 安装方式

1. 先启动后端：进入 `wasei` 目录，安装 `flask`、`py2neo` 等依赖，把 `challenge.py` 里的 `NEO4J_AUTH` 换成自己的 Neo4j 用户名和密码，再运行 `python challenge.py`。
2. 确认 Neo4j 已启动，默认地址为 `http://localhost:7474`。
3. 打开 Chrome，地址栏输入 `chrome://extensions`。
4. 打开右上角的「开发者模式」。
5. 点「加载已解压的扩展程序」，选择 `wasei` 目录。
6. 打开一个带 `?wd=` 或 `?q=` 参数的搜索页，面板会自动请求数据。


# 项目说明
该数据集不予公开，代码仅供参考。

2025年5月
