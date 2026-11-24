#!/usr/bin/env bash
# 在 Ubuntu / Debian 服务器上一键安装 Nginx 并发布本仓库的 dist/。
#
# 用法（在服务器上的仓库根目录执行）：
#   sudo ./tools/deploy-server.sh
#
# 常用可选参数：
#   sudo DOMAIN=lab.example.org ./tools/deploy-server.sh
#   sudo WEBROOT=/var/www/docia ./tools/deploy-server.sh
#   sudo FORCE=1 ./tools/deploy-server.sh        # 覆盖非空且非本脚本创建过的目录
#   sudo INSTALL_DEPS=0 ./tools/deploy-server.sh # 已装好 nginx/rsync，不执行 apt
#
# 脚本只依赖仓库内的 dist/，不需要 Node.js、Python 或构建步骤。
# 默认把站点放到 /var/www/docia，使用 Nginx 的 80 端口和 server_name _。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
DIST="$ROOT/dist"
WEBROOT="${WEBROOT:-/var/www/docia}"
DOMAIN="${DOMAIN:-_}"
SITE_NAME="${SITE_NAME:-docia}"
INSTALL_DEPS="${INSTALL_DEPS:-1}"
DISABLE_DEFAULT_SITE="${DISABLE_DEFAULT_SITE:-1}"
FORCE="${FORCE:-0}"

log() { printf '\n==> %s\n' "$*"; }
die() { printf '\n错误：%s\n' "$*" >&2; exit 1; }

[ -f "$DIST/index.html" ] || die "找不到 $DIST/index.html；请在仓库内运行本脚本。"

# 允许传入相对仓库的 WEBROOT，便于在不同服务器上复用。
case "$WEBROOT" in
  /*) ;;
  *) WEBROOT="$ROOT/$WEBROOT" ;;
esac
[ "$WEBROOT" != "/" ] || die "WEBROOT 不能是 /。"

# 只允许安全字符，避免把错误内容写进 Nginx 配置。
case "$SITE_NAME" in
  .|..|*[!A-Za-z0-9._-]*) die "SITE_NAME 只能包含字母、数字、点、下划线和连字符，且不能是 . 或 ..。" ;;
esac
if [ "$DOMAIN" != "_" ]; then
  case "$DOMAIN" in
    *[!A-Za-z0-9._-]*) die "DOMAIN 只能包含字母、数字、点、下划线和连字符，例如 lab.example.org。" ;;
  esac
fi

if [ "$(id -u)" -eq 0 ]; then
  SUDO=()
else
  command -v sudo >/dev/null 2>&1 || die "当前不是 root，且没有 sudo。"
  SUDO=(sudo)
fi

command -v apt-get >/dev/null 2>&1 || die "本脚本面向 Ubuntu / Debian；未找到 apt-get。"

# 先创建目录并解析真实路径，避免把站点同步到仓库内部。
"${SUDO[@]}" install -d -m 0755 "$WEBROOT"
WEBROOT_REAL="$(cd "$WEBROOT" && pwd -P)"
ROOT_REAL="$ROOT"
DIST_REAL="$(cd "$DIST" && pwd -P)"
case "$WEBROOT_REAL" in
  "$ROOT_REAL"|"$ROOT_REAL"/*|"$DIST_REAL"|"$DIST_REAL"/*)
    die "WEBROOT 位于仓库内部，会误删源码：$WEBROOT_REAL" ;;
esac
case "$ROOT_REAL/" in
  "$WEBROOT_REAL/"*)
    die "WEBROOT 是仓库根目录的上级，会误删其他文件：$WEBROOT_REAL" ;;
esac

# 首次部署可以覆盖空目录；已经有其他文件时，要求显式 FORCE=1。
MARKER="${WEBROOT_REAL%/}.deployed"
if [ -n "$(find "$WEBROOT_REAL" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ] \
   && [ ! -f "$MARKER" ] && [ "$FORCE" != "1" ]; then
  die "WEBROOT 非空且不是本脚本创建过的目录。确认可覆盖后加 FORCE=1 重试。"
fi

if ! command -v nginx >/dev/null 2>&1 || ! command -v rsync >/dev/null 2>&1; then
  [ "$INSTALL_DEPS" = "1" ] || die "缺少 nginx 或 rsync；设置 INSTALL_DEPS=1 自动安装。"
  log "安装 Nginx 和 rsync（apt）"
  "${SUDO[@]}" apt-get update
  "${SUDO[@]}" env DEBIAN_FRONTEND=noninteractive apt-get install -y nginx rsync
fi

log "同步 dist/ 到 $WEBROOT_REAL"
"${SUDO[@]}" rsync -a --delete --chmod=D755,F644 "$DIST/" "$WEBROOT_REAL/"
"${SUDO[@]}" touch "$MARKER"

log "写入 Nginx 站点配置 /etc/nginx/sites-available/$SITE_NAME"
"${SUDO[@]}" install -d -m 0755 /etc/nginx/sites-available /etc/nginx/sites-enabled
if [ "$DOMAIN" = "_" ]; then
  LISTEN="listen 80 default_server;"
else
  LISTEN="listen 80;"
fi
TMP_CONF="$(mktemp)"
trap 'rm -f "$TMP_CONF"' EXIT
cat >"$TMP_CONF" <<NGINX
server {
    $LISTEN
    server_name $DOMAIN;

    root $WEBROOT_REAL;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
NGINX
"${SUDO[@]}" install -m 0644 "$TMP_CONF" "/etc/nginx/sites-available/$SITE_NAME"
"${SUDO[@]}" ln -sfn "../sites-available/$SITE_NAME" "/etc/nginx/sites-enabled/$SITE_NAME"

if [ "$DISABLE_DEFAULT_SITE" = "1" ] && [ -L /etc/nginx/sites-enabled/default ]; then
  log "停用 Nginx 默认站点（保留 /etc/nginx/sites-available/default）"
  "${SUDO[@]}" rm -f /etc/nginx/sites-enabled/default
fi

"${SUDO[@]}" nginx -t
if command -v systemctl >/dev/null 2>&1; then
  "${SUDO[@]}" systemctl enable --now nginx >/dev/null 2>&1 || true
  "${SUDO[@]}" systemctl reload nginx
else
  "${SUDO[@]}" service nginx restart
fi

if [ "$DOMAIN" = "_" ]; then
  HOST_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
  URL="http://${HOST_IP:-服务器IP}/"
else
  URL="http://$DOMAIN/"
fi
log "完成：$URL"
printf '静态文件目录：%s\n' "$WEBROOT_REAL"
printf '更新内容：git pull && sudo ./tools/deploy-server.sh\n'
