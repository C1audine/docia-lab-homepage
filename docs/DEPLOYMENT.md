# 部署与回滚

本文档描述 P0 版本的部署方式。站点是纯静态的 hash 路由单页应用（SPA），
Nginx 只需把 `dist/` 当作普通文件提供，不需要 Node、PHP 或数据库。

公开事实：本仓库是 docia.org 的模块化 P0 版本，站点由 Nginx 提供静态文件；
迁移前仓库 commit 为 `a99269d`，当时线上 `dist/` 与该 commit 的构建产物逐字节一致，
说明生产提供的就是仓库构建产物。仓库目前没有配置生产自动部署凭据/流水线。

先说明边界：**推送 GitHub 不会自动更新生产站点。** 无论是 push 还是合并 PR，
都不会触发部署；发布必须由人显式执行下文命令（或手动触发 GitHub Actions）。

## 1. 概览与前置条件

- 构建产物：`dist/`（已提交到仓库，生产提供的就是这份文件）。
- 构建命令：`npm run build`；校验命令：`npm run validate:content`、`npm test`。
- 目标服务器：Linux（Ubuntu/Debian 或 Fedora/RHEL 系），需要 Nginx 和 rsync。
- 服务器脚本：`tools/deploy-server.sh`，在**目标服务器上**运行，负责安装依赖、
  写 Nginx 站点配置、把 `dist/` 同步到站点目录。
- 远程脚本：`tools/deploy-remote.sh`，在**开发机（macOS/Linux）**上运行，负责
  构建、打包并调用服务器脚本。它不会把真实主机信息写进仓库。

首次部署前请确认：服务器 IP/域名、SSH 用户、站点目录（`WEBROOT`）、
是否已有其它站点占用 80 端口。下面统一用 `<服务器IP>`、`<域名>`、`<用户名>`
占位，请替换为实际值，**不要**把填入后的真实值提交回仓库。

## 2. 方式一：在服务器上直接部署

把仓库放到服务器（git clone 或 rsync 拷贝均可），进入仓库根目录：

```bash
sudo ./tools/deploy-server.sh                  # 默认 WEBROOT=/var/www/docia
sudo WEBROOT=/srv/www/docia ./tools/deploy-server.sh   # 绝对路径
sudo WEBROOT=site ./tools/deploy-server.sh     # 相对路径：相对仓库的上一级目录
sudo WEBROOT=~/docia-site ./tools/deploy-server.sh     # ~ 展开为执行 sudo 的用户 home
```

先预演、不改系统：

```bash
DRY_RUN=1 ./tools/deploy-server.sh
WEBROOT=site DRY_RUN=1 ./tools/deploy-server.sh
```

`DRY_RUN=1` 只打印配置摘要、将执行的命令和完整 Nginx 配置；不需要 root，
不写 `/etc`，不安装软件。确认无误后再去掉 `DRY_RUN=1` 正式执行。

脚本会：检测并安装 Nginx/rsync（`INSTALL_DEPS=0` 可禁止安装）；创建 `WEBROOT`；
用 `rsync -a --delete` 同步 `dist/`；写站点配置并 `nginx -t`，测试通过才 reload。
重复执行是幂等的；已有站点配置若不是本脚本生成的，会拒绝覆盖，确认要接管时用
`FORCE=1`。

## 3. 方式二：从开发机远程部署（推荐）

```bash
git clone <仓库地址> docia-lab-homepage && cd docia-lab-homepage
npm ci
cp tools/deploy.env.example tools/deploy.env   # 填写真实主机信息；该文件已被 gitignore

./tools/deploy-remote.sh --dry-run             # 只打印计划，不联网
./tools/deploy-remote.sh --build               # 构建后发布到默认 ~/docia-site
./tools/deploy-remote.sh --host <服务器IP> --user <用户名> --bootstrap   # 新服务器首次
```

`--dry-run` 会显示解析后的远端路径、rsync 命令和 bootstrap 步骤，但不会执行
ssh/rsync，也不会构建。配置优先级：**命令行 > 环境变量 > `tools/deploy.env` > 默认值**。

常用参数：

```bash
./tools/deploy-remote.sh --host <服务器IP> --user <用户名> \
  --path ~/docia-site --domain <域名> --http-port 80
./tools/deploy-remote.sh --no-build            # 直接用现有 dist/，不重新构建
./tools/deploy-remote.sh --bootstrap           # 首次：把 dist/ 和服务器脚本暂存到远端
```

- `--path` 默认是远端 `~/docia-site`，在**远端**解析成绝对路径（脚本会 ssh 读取
  远端 `$HOME`，不会误用本地 home）。也支持绝对路径。
- `--build` 强制先 `npm run build`；`--no-build` 跳过；默认只在 `dist/` 缺失时构建。
  构建失败会中止，不会发布半成品。
- `--bootstrap` 把 `dist/` 和 `tools/deploy-server.sh` 暂存到远端 `~/.docia-deploy`，
  再通过 `sudo env WEBROOT=... bash tools/deploy-server.sh` 执行。远端用户没有 sudo
  且不是 root 时会明确报错。bootstrap 之后普通部署不再需要它。
- 所有变量都可用环境变量提供：`DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_PORT`、
  `DEPLOY_PATH`、`DEPLOY_DOMAIN`、`DEPLOY_HTTP_PORT`、`DEPLOY_BUILD`、
  `DEPLOY_BOOTSTRAP`、`SSH_OPTS`。

## 4. 配置项

### 服务器脚本（`deploy-server.sh`）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `WEBROOT` | `/var/www/docia` | 站点根目录；绝对路径、相对“部署根”（仓库上一级）、`~/...` 三种都支持 |
| `DIST_DIR` | `<仓库>/dist` | 要同步的构建目录 |
| `DOMAIN` | `_` | Nginx `server_name`；只填 `<域名>`，不要带协议 |
| `SITE_NAME` | `docia` | 站点配置文件名 |
| `HTTP_PORT` | `80` | `listen` 端口 |
| `INSTALL_DEPS` | `1` | 缺失 Nginx/rsync 时尝试用 apt-get/dnf/yum 安装 |
| `DISABLE_DEFAULT_SITE` | `1` | 部署后禁用发行版默认站点，避免抢占默认访问 |
| `FORCE` | `0` | `1` 时允许覆盖非本脚本生成的站点配置/非空目录 |
| `DRY_RUN` | `0` | `1`/`true` 只预演 |
| `NGINX_CONF_DIR` | `/etc/nginx` | Nginx 配置目录（便于测试或自定义安装） |
| `NGINX_LAYOUT` | `auto` | `auto`/`debian`/`confd`；一般无需设置 |

### 远程脚本（`deploy-remote.sh`）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DEPLOY_HOST` | 无（必填） | 服务器地址或域名 |
| `DEPLOY_USER` | 当前 SSH 用户 | SSH 登录用户 |
| `DEPLOY_PORT` | `22` | SSH 端口 |
| `DEPLOY_PATH` | `~/docia-site` | 远端站点目录；支持 `~/...` 和绝对路径 |
| `DEPLOY_DOMAIN` | 空 | 传给服务器脚本的 `DOMAIN` |
| `DEPLOY_HTTP_PORT` | `80` | 传给服务器脚本的 `HTTP_PORT` |
| `DEPLOY_BUILD` | 自动 | `1` 强制构建、`0` 跳过；命令行 `--build/--no-build` 优先 |
| `DEPLOY_BOOTSTRAP` | `0` | `1` 首次部署走 sudo 初始化 |
| `SSH_OPTS` | `-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15` | 追加的 ssh 选项 |

## 5. Nginx 行为

- 站点配置：Debian/Ubuntu 写入 `sites-available/<SITE_NAME>` 并链接到
  `sites-enabled/`；Fedora/RHEL 系写入 `conf.d/<SITE_NAME>.conf`。
- 配置内容：`listen <HTTP_PORT> default_server;`、`server_name <DOMAIN>;`、
  `root "<WEBROOT>";`，以及静态文件与 SPA fallback 规则。
- 默认站点：`DISABLE_DEFAULT_SITE=1` 时移除 Debian 的 `sites-enabled/default`
  链接，或把 `conf.d/default.conf` 改名为 `.disabled-by-docia`；这两个动作在
  `nginx -t` 失败时会回滚。
- 安全流程：先备份旧配置到 `<配置>.docia.bak`，再写新配置并执行 `nginx -t`；
  测试失败则恢复旧配置、不 reload，并返回非零退出码。成功后才 reload。
- 部署标记：`<WEBROOT>.deployed` 放在 `WEBROOT` 的**同级**（如
  `/var/www/docia.deployed`）。这样 Nginx 的 `root` 不会把它当静态文件暴露，
  `rsync --delete` 也只清空 `WEBROOT` 内部，不会误删标记。不要把它放进站点目录。

## 6. 更新与回滚

日常更新（内容改动后）：

```bash
npm run validate:content && npm test && npm run build
./tools/deploy-remote.sh --no-build     # dist/ 刚构建好，可直接同步
# 或在服务器上：sudo ./tools/deploy-server.sh
```

`rsync -a --delete` 会删除远端站点目录中多余的文件——这是为了清除旧构建残留，
但也意味着**路径必须确认正确**。首次使用或换目录时先跑 `--dry-run`。

回滚优先恢复“上一个可用构建”：

```bash
# 发布前先备份远端站点目录（示例，路径换成实际值）
ssh <用户名>@<服务器IP> 'tar -czf ~/docia-backup-$(date +%Y%m%d-%H%M).tar.gz -C <WEBROOT的父目录> <WEBROOT目录名>'

# 回滚：恢复备份或 checkout 上一个提交后重建 dist/，再重新部署
git checkout <上一个可用commit> && npm ci && npm run build
./tools/deploy-remote.sh --no-build
```

紧急情况下可先恢复静态文件止血，再排查内容/构建问题。不要在生产目录手改
`site.config.js` 等构建产物，下次部署会覆盖它。

## 7. GitHub Actions（手动）

`.github/workflows/deploy.yml` 只支持 `workflow_dispatch` 手动触发，**不会在 push
或 PR 时自动部署**。使用前在仓库 Settings → Secrets and variables → Actions 配置：

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PORT`（可选，默认 22）
- `DEPLOY_PATH`
- `SSH_PRIVATE_KEY`

没有配置这些 Secrets 时任务会失败，但不影响 PR 检查。工作流通过
`secrets.*` 读取，不会接受仓库里写死的主机。首次使用建议先指向测试目录验证。

本地开发机上的 `tools/deploy.env` 只用于 `deploy-remote.sh`，与 Actions 的
Secrets 相互独立，二者都不要提交到仓库。

## 8. 故障排查

- **提示需要 sudo / 权限不足**：服务器脚本要以 root 或 `sudo` 执行；远程脚本的
  远端用户需要 sudo（或直接用 root）。确认 `ssh <用户>@<主机> sudo -n true` 可用。
- **rsync 不存在**：服务器脚本会尝试安装；离线机器请手动安装，或设
  `INSTALL_DEPS=0` 后自行准备 `nginx` 与 `rsync`。
- **Nginx 配置冲突**：若已有同名站点或 80 端口被别的 server 占用，脚本会拒绝覆盖。
  确认真要接管时用 `FORCE=1`；否则改 `SITE_NAME`/`HTTP_PORT`。
- **端口被占用**：`ss -ltnp | grep ':80'`（或 `netstat`）查看占用者；容器/其它
  Web 服务先停掉，或换 `HTTP_PORT`。
- **macOS 上 rsync 参数报错**：macOS 自带的是 openrsync，不支持 `--chmod`。
  脚本会自动检测并改为“同步后用远端 `find ... chmod` 修正权限”；这是正常回退。
- **HTTPS/证书**：本脚本只配置 HTTP。需要 HTTPS 时，在 DNS 指向服务器后用
  `certbot --nginx -d <域名>` 签发证书（可选、需联网），或由现有反向代理终止 TLS。
- **部署后 403/404**：检查 `WEBROOT` 是否与 Nginx `root` 一致、目录是否
  `www-data` 可读（脚本会设为 755/644 并尝试调整属组）。

## 9. 安全建议

- `tools/deploy.env` 含主机信息，已加入 `.gitignore`；只提交 `deploy.env.example`。
- 为部署创建**专用 SSH key**（可限制 `authorized_keys` 的 `from=`/`command=`），
  不要把私钥放进仓库、命令行历史或 issue。
- 服务器只开放必要端口；用防火墙限制 SSH 来源，Nginx 只暴露 80/443。
- 远端用户遵循最小权限：能写 `WEBROOT` 与执行 `sudo deploy-server.sh` 即可，
  不要用 root 日常登录。
- 脚本不会打印任何密钥；本仓库中也没有生产凭据。
