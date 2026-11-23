# DOCIA Lab Homepage

上海科技大学 DOCIA（Lab of Decision, Optimization, and Control for Intelligent Agents）英文课题组主页。访客可以浏览研究方向、成果、成员和校友去向，也可以在首页观察梯度下降过程，并通过八个边缘服务器的负载均衡实验比较网络拓扑。[打开公开 demo](https://docia-lab-atlas.c1audine4alex.chatgpt.site)

**日常维护从 [dist/site.config.js](dist/site.config.js) 开始。** `dist/` 是可直接编辑和部署的完整站点。浏览器原生加载 HTML、CSS 和 JavaScript 模块。发布已有内容只需要一个静态文件服务器，站点运行没有 Node.js、Python 服务或数据库依赖。

## 组员如何参与

仓库管理员可在 GitHub 的 **Settings → Collaborators → Add people** 邀请组员。接受邀请后，组员可以克隆私有仓库，在单独分支中编辑并提交 Pull Request。下方部署示例采用手动发布：合并到 `main` 后，还要同步 `dist/` 才会更新自建服务器。公开 demo 的部署也独立于 GitHub 提交。

## 本地运行

有仓库读取权限后，在开发电脑上执行以下命令。SSH 克隆使用已关联 GitHub 账号的 SSH 密钥，也可以在仓库的 **Code** 菜单复制 HTTPS 地址。

```sh
git clone git@github.com:C1audine/docia-lab-homepage.git
cd docia-lab-homepage
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

打开 <http://127.0.0.1:8000/>。修改配置后刷新浏览器即可。直接双击 `index.html` 时浏览器可能拦截本地模块加载，请使用上面的 HTTP 地址。手机预览可使用浏览器的设备模拟，也可以在可信局域网中将绑定地址改为 `0.0.0.0`，再用手机访问 `http://电脑的局域网IP:8000/`。结束预览时按 Ctrl+C。

## 页面入口

下表路径接在站点根地址后。研究方向的详情地址由配置中的 `research[].id` 决定。

| 页面 | 路径 | 展示内容或操作 |
| --- | --- | --- |
| Home | `/` 或 `/#/home` | 实验室介绍、随滚动移动的梯度下降点、网络实验、研究卡片、前两条论文记录 |
| Network playground | `/#/simulation` | 跳到首页实验区。切换拓扑、选择节点、调整初始负载，然后运行、暂停或重置实验 |
| Research | `/#/research` | 查看研究方向，点击卡片进入详情 |
| Research detail | `/#/research/distributed-optimization` | 示例详情页，包含研究问题、说明与关联论文 |
| Publications | `/#/publications` | 按配置中的顺序列出论文及外部链接 |
| People | `/#/people` | 当前成员的职务、单位、研究兴趣和个人主页 |
| Alumni | `/#/alumni` | 毕业年份、学位及毕业后的首份去向 |
| Contact | `/#/contact` | 负责人邮箱、办公室和通信地址。邮箱链接唤起访客的邮件客户端 |

浏览器实际向服务器请求 `index.html`，然后根据 `#` 后的片段渲染相应页面。因此复制详情地址、直接打开和刷新都可以共用同一个服务器入口。

## 源码入口与维护方法

| 文件 | 何时修改 |
| --- | --- |
| [dist/index.html](dist/index.html) | 修改 HTML 外壳、默认标题、搜索引擎摘要和 favicon 引用。页面通过此处的模块脚本启动 |
| [dist/site.config.js](dist/site.config.js) | 修改课题组资料、主色、导航标签、研究记录、论文、成员、校友及实验默认值 |
| [dist/app.js](dist/app.js) | 修改页面结构、首页区块顺序、研究详情和路由。新增一级页面时同时更新 `pageTitles`、`render()` 的页面映射与配置中的 `navigation` |
| [dist/style.css](dist/style.css) | 修改字号、间距、组件样式及响应式布局。当前导航在 780 px 及以下折叠，实验区在 650 px 及以下变为单栏 |
| [dist/ui.js](dist/ui.js) | 公用图标、文本转义和小标题组件 |
| [dist/model.js](dist/model.js) | 定义拓扑坐标、邻接边、同步负载交换算法和均方根误差 |
| [dist/experiment.js](dist/experiment.js) | 定义实验界面、运行和暂停逻辑、对照曲线、节点标签及指标说明 |
| [dist/terrain.js](dist/terrain.js) | 把页面滚动进度映射到预计算的下降轨迹，并绘制标记和图例 |
| [tools/render-landscape.py](tools/render-landscape.py) | 修改目标函数、初始点、步长、投影或曲面渲染方式 |
| [dist/assets](dist/assets) | `mark.svg` 是站点标识，`landscape.webp` 与 `descent.js` 是同一次计算生成的曲面和轨迹 |

### 添加成果或成员

在 `site.publications` 数组中复制一条记录，替换以下字段。以下值为填写示例。若要在首页展示，将论文放在数组的前两项之一。

```js
{
  id: "example-paper",
  year: 2026,
  title: "Full paper title",
  authors: "Author A and Author B",
  venue: "Journal or conference",
  url: "https://example.org/paper"
}
```

- **关联研究方向**：将相应 `research` 记录的 `paper` 设置为论文的 `id`。每个研究方向和每篇论文应各自使用稳定、唯一的 `id`。修改研究方向的 `id` 会改变已分享的详情页地址。
- **在组成员**：向 `people` 添加 `name`、`role`、`affiliation`、`description` 和 `url`。页面自动从英文姓名生成缩写。
- **校友**：向 `alumni` 添加 `name`、`degree`、`year`、`position`、`destination`、`location` 和 `source`。公开资料记录的是首次去向时，保留这一口径。
- **品牌与联系**：`brand` 用于站点简称，`name` 用于全称，`hero.lines` 决定首页标题分行。`contact` 集中保存邮箱、地址和外链。`palette` 定义五个主题色；插图本身的色值分别在 SVG 或绘图脚本中。

### 实验与梯度下降图

`experiment.initialLoads` 的八个位置依次对应 N01 至 N08。`topology` 支持 `Mesh`、`Ring`、`Star`，`capacity` 是单台服务器的容量，`tolerance` 是 RMS 负载误差阈值，`previewRound` 决定首次显示哪一轮。改变初始负载或切换拓扑会从第 0 轮重新计算。修改算法时从 `simulate()` 开始，修改指标展示时从 `mountExperiment()` 开始。

曲面与轨迹已经提交。仅在修改目标函数或绘图参数时，从仓库根目录重新生成两者，并一同提交：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install numpy pillow contourpy
.venv/bin/python tools/render-landscape.py
git add tools/render-landscape.py dist/assets/landscape.webp dist/assets/descent.js
```

## 部署到服务器（Ubuntu / Debian + Nginx）

下面以独立域名 `lab.example.org`、服务器部署用户 `deploy` 为例。将域名和用户名替换为实际值。源码保存在组员电脑或私有仓库，服务器只需接收 `dist/` 的内容。这种方式也适用于没有 GitHub 读权限的服务器。

### 1. 准备域名和服务

将域名的 A 记录指向服务器公网 IPv4。使用 IPv6 时也应设置对应的 AAAA 记录。让服务器的入站规则允许 HTTP 80 和 HTTPS 443。在**服务器**执行：

```sh
sudo apt update
sudo apt install nginx rsync
sudo install -d -m 0755 -o deploy /var/www/docia
```

在**开发电脑**的仓库根目录执行以下命令。电脑需有 `rsync` 及 SSH 客户端，并能以部署用户登录服务器。命令中 `dist/` 末尾的斜杠表示复制目录内容，发布后应存在 `/var/www/docia/index.html`。

```sh
rsync -rtvz --chmod=D755,F644 dist/ deploy@lab.example.org:/var/www/docia/
```

### 2. 配置 Nginx

在**服务器**新建 `/etc/nginx/sites-available/docia`，写入以下内容。使用独立的 server block 可以与同一台机器上的其他网站共存。

```nginx
server {
    listen 80;
    server_name lab.example.org;

    root /var/www/docia;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

若域名有 AAAA 记录，且服务器提供 IPv6 服务，可在同一块中加入 `listen [::]:80;`。首次启用站点时执行以下命令：

```sh
sudo ln -s /etc/nginx/sites-available/docia /etc/nginx/sites-enabled/docia
sudo nginx -t && sudo systemctl reload nginx
curl -I -H 'Host: lab.example.org' http://127.0.0.1/
curl -I -H 'Host: lab.example.org' http://127.0.0.1/app.js
```

预期两次请求均返回 200，第二次响应的 `Content-Type` 是 JavaScript 类型。随后在另一台设备上打开 `http://lab.example.org/#/research`。脚本和图像的缺失文件应正常返回 404，以便定位部署错误。[Nginx 静态站点官方文档](https://nginx.org/en/docs/beginners_guide.html#static)

### 3. 启用 HTTPS

域名已解析且公网 HTTP 可访问后，在服务器按系统版本安装 Certbot 和 Nginx 插件。使用 Ubuntu / Debian 软件仓库时可执行以下命令；已经安装 Certbot 的服务器应沿用原有安装方式。

```sh
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d lab.example.org
sudo certbot renew --dry-run
```

打开 `https://lab.example.org/#/simulation`，切换一次拓扑并启动实验，即可同时检查 HTTPS、脚本加载和静态资源访问。[Certbot 的 Nginx 安装指南](https://certbot.eff.org/instructions?ws=nginx&os=snap)

### 4. 发布更新与回退

组员合并修改后，在**开发电脑**的干净 `main` 工作区执行以下命令。Nginx 会直接读取更新后的文件，日常内容更新只需同步文件；改过 Nginx 配置时才需要检查并重载服务。

```sh
git switch main
git pull --ff-only
rsync -rtvz --chmod=D755,F644 dist/ deploy@lab.example.org:/var/www/docia/
```

需要让线上目录与新版本完全一致时，可对站点专用目录先执行 `rsync -rtvzn --delete dist/ deploy@lab.example.org:/var/www/docia/` 查看拟删除项，再按需同步。回退时，从一个临时 Git 工作区发布已知可用的版本：

```sh
read -r -p '输入已验证的 Git 提交号: ' release_commit
git worktree add --detach ../docia-rollback "$release_commit"
rsync -rtvz --chmod=D755,F644 ../docia-rollback/dist/ deploy@lab.example.org:/var/www/docia/
git worktree remove ../docia-rollback
```

### 其他托管方式

- **已有学院服务器**：将 `dist/` 内容上传到管理员提供的静态目录。若挂在 `https://example.edu/docia/`，以 `/docia/#/people` 等形式分享页面，并保留目录地址末尾的 `/`。脚本和图像均使用相对路径。
- **GitHub Pages**：适用于账号套餐支持的仓库。可用 Actions 上传 `dist/` 作为 Pages artifact，或把 `dist/` 的内容放到专门发布分支的根目录，在 **Settings → Pages** 中选择该分支和 `/(root)`。分支发布可选根目录或 `/docs`。私有仓库发布的 Pages 网站也可能向所有人开放，启用时请单独核对站点访问范围。[GitHub Pages 发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 常见问题

| 现象 | 优先检查 |
| --- | --- |
| 浏览器显示 Nginx 欢迎页 | 使用实际域名访问。检查 `server_name`、启用的站点链接以及 DNS |
| 首页返回 403 或目录列表 | 检查 Nginx 的 `root` 下是否直接存在 `index.html`，以及 Nginx 是否能遍历目录并读取文件 |
| 导航存在但正文空白 | 在浏览器开发者工具检查 `app.js`、`site.config.js` 的状态码和 MIME，以及配置数组中是否缺少逗号或引号 |
| 首页正常，分享的成员页打不开 | 从地址栏复制含 `/#/people` 的完整地址；服务器直接请求的是站点根目录 |
| 曲面能看到但轨迹错位 | 从同一提交上传 `landscape.webp` 和 `descent.js`，刷新浏览器缓存 |
| 私有仓库无法克隆 | 确认已接受仓库协作邀请，SSH 密钥或 HTTPS 凭据属于获邀的 GitHub 账号 |

本项目的内容与布局分离方式参考了 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) 和 [Academic Pages](https://github.com/academicpages/academicpages.github.io)。页面与交互实验使用本仓库的静态模块实现。
