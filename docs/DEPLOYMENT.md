# 部署与回滚

本文档只描述当前可验证的事实，不把“手动操作”写成“自动部署”。

## 1. 当前生产环境（迁移前核实）

- 站点：`https://docia.org`，由 Nginx 提供静态文件。
- 迁移前仓库 commit：`a99269d`。
- 线上 `/index.html` 与 `/site.config.js` 与当时仓库 `dist/` 中的文件逐字节一致；
  说明生产站点使用的是 **仓库 `dist/` 的构建产物**。
- 站点是 hash 路由单页应用，静态服务器只需提供文件，不需要 Node/PHP/数据库。
- 域名、HTTPS、缓存、压缩由现有 Nginx 配置负责，本项目没有修改它们。

仓库中的 `tools/deploy-server.sh` 是原有的 Ubuntu/Debian 一键初始化/部署脚本
（安装 Nginx、写入站点配置、`rsync dist/`）。它仍可作为手动部署参考，但不是自动流水线。

> 注意：工作区曾核实过一台可通过 SSH 访问的主机（`122.228.216.175:2222`），
> 其 `/var/www/docia-lab` 是较旧副本。该主机**不能确认**是 `docia.org` 的生产源，
> 因此不要把它当作生产环境直接覆盖。发布前必须由负责人确认真正的静态目录/发布方式。

## 2. 发布前检查（每次发布）

```bash
git switch main
git pull --ff-only
npm ci
npm run validate:content
npm run build
npm test
```

检查：

- `validate:content` 无 Error（Warning 需人工确认）；
- `dist/` 与内容一致，`git status` 只包含预期的构建差异；
- 本地 `npm run dev` 抽查首页、成员、论文、新闻、搜索、中英文切换、交互实验；
- PR 检查已通过并完成审核；
- 没有把草稿、未确认招生信息、隐私材料带入 `dist/`。

## 3. 发布方式（当前：手动）

1. 合并 PR 到 `main`，记录 commit hash。
2. 在合并后的 commit 上重新执行第 2 节命令。
3. 把 `dist/` 同步到生产静态目录，例如：

   ```bash
   rsync -a --delete --chmod=D755,F644 dist/ <user>@<host>:<web-root>/
   ```

   `<host>` / `<web-root>` 由负责人确认；不要使用未核实的主机路径。
4. 验证线上：
   - `https://docia.org/` 返回 200；
   - 首页、`#/people`、`#/publications`、`#/news` 正常；
   - 中英文切换正常；
   - 新内容出现，旧内容未丢失；
   - 浏览器控制台无报错。
5. 记录：commit、构建时间、发布人、验证结果。可写入发布 issue/PR 评论。

**GitHub push 本身不会自动更新 Nginx 静态目录。** 如果以后接入自动部署，才可以把
“合并即上线”写进文档。

### 可选：GitHub Actions 手动部署

`.github/workflows/deploy.yml` 只支持 `workflow_dispatch` 手动触发，不会在 PR 上运行。
使用前需在仓库 Settings → Secrets and variables → Actions 配置：

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PORT`（可选，默认 22）
- `DEPLOY_PATH`
- `SSH_PRIVATE_KEY`

没有配置这些 Secrets 时，工作流会失败，不会影响 PR 检查。负责人应先在测试目录验证，
再用于生产。仓库当前没有配置任何生产凭据。

## 4. 回滚

优先使用“恢复上一个可用构建”：

1. 如果上次发布前保留了 `dist/` 备份（推荐每次发布前在服务器外备份），直接恢复该目录。
2. 如果只有 Git 历史：
   ```bash
   git revert <出问题的commit>
   npm ci && npm run validate:content && npm run build
   ```
   然后按第 3 节重新发布。
3. 紧急情况下可先恢复上一版静态文件，再排查内容/构建问题；不要在生产目录手改
   `site.config.js`，下次发布会覆盖。

回滚后同样要验证：首页、成员、论文、新闻、搜索、语言切换、实验、404。

## 5. 已知限制

- 当前没有可验证的自动部署流水线；没有把 SSH 私钥或服务器凭据写入仓库。
- 生产静态目录的真实位置需要负责人确认；工作区中可访问的 SSH 主机不一定是生产源。
- 因此 P0 只保证“构建可重复、失败不覆盖上一次构建”，发布仍是手动步骤。
- 如果服务器或仓库权限限制自动部署，保持手动入口并在本节记录，不把手动流程称为自动化。
- `sitemap.xml` 不写 `lastmod`；内容日期是记录日期，不等于页面最后修改时间。
