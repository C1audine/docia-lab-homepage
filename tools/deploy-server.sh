#!/usr/bin/env bash
# tools/deploy-server.sh —— 在目标服务器上初始化 Nginx，并把仓库的 dist/ 发布到 WEBROOT。
#
# 默认面向 Ubuntu / Debian（Nginx 使用 sites-available / sites-enabled 布局），
# 也会在 dnf / yum 系统上尽量工作（Nginx 使用 conf.d 布局）。
#
# 用法（在服务器上的仓库根目录，或用 tools/deploy-remote.sh --bootstrap 暂存后执行）：
#   sudo ./tools/deploy-server.sh
#   DRY_RUN=1 ./tools/deploy-server.sh              # 只预演，不写文件、不需要 root
#   sudo WEBROOT=~/site DOMAIN=lab.example.org ./tools/deploy-server.sh
#
# 所有配置都通过环境变量传入；脚本只接受 --help / --dry-run 两个命令行开关。
# 脚本不依赖调用者的当前目录：仓库根由 BASH_SOURCE 推导，因此可以在任意 cwd 执行，
# 路径含空格也能正常工作。bash 3.2（macOS 自带）兼容。
set -euo pipefail

MANAGED_TAG='# Managed by tools/deploy-server.sh (docia)'
DEFAULT_WEBROOT='/var/www/docia'

log() { printf '\n==> %s\n' "$*"; }
warn() { printf '警告：%s\n' "$*" >&2; }
die() { printf '\n错误：%s\n' "$*" >&2; exit 1; }
short_usage() { printf '用法：%s [--dry-run] [-h|--help]\n' "${0##*/}"; }
usage_error() { printf '错误：%s\n\n' "$1" >&2; short_usage >&2; exit 2; }

usage() {
  cat <<'USAGE'
tools/deploy-server.sh —— 在目标服务器上初始化 Nginx 并发布仓库的 dist/。

用法：
  sudo ./tools/deploy-server.sh            # 安装/复用 Nginx，写入站点配置并同步 dist/
  DRY_RUN=1 ./tools/deploy-server.sh       # 只校验并打印计划，不写文件、不需要 root
  ./tools/deploy-server.sh --help          # 显示本帮助

可用的命令行开关：
  -h, --help        显示本帮助并退出（退出码 0）
      --dry-run     等价于 DRY_RUN=1
  其它参数会报错并以退出码 2 结束（避免拼写错误悄悄变成默认部署）。

环境变量（全部可选）：
  WEBROOT           站点静态目录，默认 /var/www/docia。
                    支持三种写法：
                      /var/www/docia      绝对路径
                      ~/site              调用用户的 home（sudo 时取 SUDO_USER 的 home）
                      site                相对“部署根”，即仓库（或暂存目录）的上一级；
                                          例如仓库在 /opt/docia/repo 时 site -> /opt/docia/site
                    安全限制：不能是 /，不能位于仓库内部，也不能是仓库的上级。
  DIST_DIR          构建产物目录，默认 <仓库根>/dist；相对路径相对仓库根。
                    必须包含 index.html。
  DOMAIN            Nginx server_name，默认 _（作为默认站点）。
  SITE_NAME         Nginx 站点名 / 配置文件名，默认 docia。
  HTTP_PORT         Nginx 监听端口，默认 80。
  INSTALL_DEPS      缺少 nginx/rsync 时是否自动安装，默认 1。
                    自动检测 apt-get / dnf / yum；没有包管理器时跳过安装并继续。
  DISABLE_DEFAULT_SITE  是否停用发行版默认站点，默认 1。
                    默认站点配置会保留/重命名，而不是删除内容。
  FORCE             默认 0。设为 1 时才允许覆盖“非本脚本创建”的非空 WEBROOT
                    或已有同名 Nginx 站点配置。
  DRY_RUN           1 / true 时只打印计划；0 / false（默认）时真正执行。
  NGINX_CONF_DIR    Nginx 配置根目录，默认 /etc/nginx。
  NGINX_LAYOUT      auto | debian | confd，默认 auto（按目录/包管理器自动检测）。

安全与幂等说明：
  * 部署标记写在 WEBROOT 同级（<WEBROOT>.deployed），不在站点目录内：
    Nginx 不会公开它，rsync --delete 也不会删掉它。
  * 已有 WEBROOT 非空且没有部署标记、且 FORCE != 1 时，脚本拒绝覆盖。
  * 已有同名 Nginx 站点配置但不是本脚本生成时，除非 FORCE=1 否则拒绝覆盖。
  * 本脚本生成的配置第一行带固定标记，因此可以安全地重复执行（更新配置）。
  * nginx -t 失败时不会 reload，并会尽量恢复写入前的配置。
  * 脚本不会打印、读取或写入任何密钥；SSH 凭据由调用方（deploy-remote.sh）管理。

示例：
  sudo ./tools/deploy-server.sh
  sudo WEBROOT=/var/www/docia DOMAIN=lab.example.org ./tools/deploy-server.sh
  sudo WEBROOT=docia-site ./tools/deploy-server.sh          # <部署根>/docia-site
  sudo WEBROOT=~/docia-site ./tools/deploy-server.sh        # 调用用户的 home
  DRY_RUN=1 WEBROOT=webroot ./tools/deploy-server.sh        # 在开发机预演
  sudo INSTALL_DEPS=0 ./tools/deploy-server.sh              # 已装好 nginx/rsync，不联网安装

更新站点：在服务器上 git pull（或重新暂存）后重新执行本脚本即可。
USAGE
}

# ---------------------------------------------------------------- 通用工具函数

# 把绝对路径做词法规范化：合并 //、去掉 .、处理 ..，不要求路径存在。
normalize_abs_path() {
  local input rest part out
  input="$1"
  rest="$input"
  out=""
  while [ -n "$rest" ]; do
    part="${rest%%/*}"
    case "$rest" in
      */*) rest="${rest#*/}" ;;
      *) rest="" ;;
    esac
    case "$part" in
      ''|.) continue ;;
      '..') out="${out%/*}" ;;
      *) out="$out/$part" ;;
    esac
  done
  [ -n "$out" ] || out="/"
  printf '%s\n' "$out"
}

# $1 是否等于 $2 或位于 $2 内部（均为绝对路径）。
path_within() {
  [ "$1" = "$2" ] && return 0
  case "$1/" in
    "$2/"*) return 0 ;;
  esac
  return 1
}

# 解析目录；目录存在时解析符号链接，否则做词法规范化。
resolve_absolute_dir() {
  local p
  p="$1"
  if [ -d "$p" ]; then
    ( cd -P "$p" && pwd )
  else
    normalize_abs_path "$p"
  fi
}

# sudo 运行时 ~ 应展开到“发起 sudo 的用户”的 home，而不是 root 的 home。
invoking_home() {
  local h
  if [ -n "${SUDO_USER:-}" ] && [ "${SUDO_USER}" != "root" ]; then
    if command -v getent >/dev/null 2>&1; then
      h="$(getent passwd "$SUDO_USER" 2>/dev/null | cut -d: -f6 || true)"
      if [ -n "$h" ]; then printf '%s\n' "$h"; return 0; fi
    fi
    if [ -d "/home/$SUDO_USER" ]; then printf '/home/%s\n' "$SUDO_USER"; return 0; fi
    if [ -d "$HOME" ] && [ "$HOME" != "/root" ]; then printf '%s\n' "$HOME"; return 0; fi
  fi
  printf '%s\n' "${HOME:-/}"
}

# 把命令打印成可直接复制执行的样式（使用 bash printf %q）。
print_command() {
  local out arg
  out=""
  for arg in "$@"; do
    out="$out $(printf '%q' "$arg")"
  done
  printf '%s\n' "${out# }"
}

# 统一处理布尔环境变量；非法值直接报错。
normalize_bool() {
  local name value
  name="$1"
  value="$2"
  case "$value" in
    1|true|TRUE|True|yes|YES) printf '1\n' ;;
    0|false|FALSE|False|no|NO|'') printf '0\n' ;;
    *) die "$name 只能是 0/1（当前：${value}）" ;;
  esac
}

# 根据 $2 是否为空，在 $1 存在时输出提示。占位函数，保持脚本易读。
noop() { :; }
: "$(noop)"

# ---------------------------------------------------------------- 解析参数

DRY_RUN_FLAG=0
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --dry-run)
      DRY_RUN_FLAG=1
      ;;
    --)
      shift
      [ $# -eq 0 ] || usage_error "不支持位置参数：$1"
      break
      ;;
    -*)
      usage_error "未知参数：$1"
      ;;
    *)
      usage_error "不支持位置参数：$1"
      ;;
  esac
  shift
done

DRY_RUN="$(normalize_bool DRY_RUN "${DRY_RUN:-0}")"
if [ "$DRY_RUN_FLAG" = "1" ]; then DRY_RUN=1; fi

# ---------------------------------------------------------------- 定位仓库根

SCRIPT_SOURCE="${BASH_SOURCE[0]}"
while [ -L "$SCRIPT_SOURCE" ]; do
  SCRIPT_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  SCRIPT_SOURCE="$(readlink "$SCRIPT_SOURCE")"
  case "$SCRIPT_SOURCE" in
    /*) ;;
    *) SCRIPT_SOURCE="$SCRIPT_DIR/$SCRIPT_SOURCE" ;;
  esac
done
SCRIPT_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" && pwd)"
ROOT="$(cd -P "$SCRIPT_DIR/.." && pwd)"

# ---------------------------------------------------------------- 读取配置

INSTALL_DEPS="$(normalize_bool INSTALL_DEPS "${INSTALL_DEPS:-1}")"
DISABLE_DEFAULT_SITE="$(normalize_bool DISABLE_DEFAULT_SITE "${DISABLE_DEFAULT_SITE:-1}")"
FORCE="$(normalize_bool FORCE "${FORCE:-0}")"

DOMAIN="${DOMAIN:-_}"
SITE_NAME="${SITE_NAME:-docia}"
HTTP_PORT="${HTTP_PORT:-80}"
NGINX_CONF_DIR="${NGINX_CONF_DIR:-/etc/nginx}"
NGINX_LAYOUT="${NGINX_LAYOUT:-auto}"

# WEBROOT 解析：绝对路径 / ~/… / 相对部署根（仓库或暂存目录的上一级）。
WEBROOT_RAW="${WEBROOT:-$DEFAULT_WEBROOT}"
WEBROOT_ORIGIN='默认值'
case "$WEBROOT_RAW" in
  '~')
    WEBROOT="$(invoking_home)"
    WEBROOT_ORIGIN='~（调用用户的 home）'
    ;;
  '~/'*)
    WEBROOT="$(invoking_home)/${WEBROOT_RAW#\~/}"
    WEBROOT_ORIGIN='~/…（调用用户的 home）'
    ;;
  /*)
    WEBROOT="$WEBROOT_RAW"
    WEBROOT_ORIGIN='绝对路径'
    ;;
  *)
    WEBROOT="$(dirname "$ROOT")/$WEBROOT_RAW"
    WEBROOT_ORIGIN='相对部署根（仓库或暂存目录的上一级）'
    ;;
esac
WEBROOT="$(normalize_abs_path "$WEBROOT")"

# DIST_DIR 解析：绝对路径或相对仓库根。
DIST_DIR_RAW="${DIST_DIR:-dist}"
case "$DIST_DIR_RAW" in
  /*) DIST_DIR="$DIST_DIR_RAW" ;;
  *) DIST_DIR="$ROOT/$DIST_DIR_RAW" ;;
esac
DIST_DIR="$(normalize_abs_path "$DIST_DIR")"

# ---------------------------------------------------------------- 基础校验

case "$SITE_NAME" in
  .|..|*[!A-Za-z0-9._-]*)
    die "SITE_NAME 只能包含字母、数字、点、下划线和连字符，且不能是 . 或 ..（当前：${SITE_NAME}）"
    ;;
esac

if [ "$DOMAIN" != "_" ]; then
  case "$DOMAIN" in
    *[!A-Za-z0-9._-]*)
      die "DOMAIN 只能包含字母、数字、点、下划线和连字符，例如 lab.example.org（当前：${DOMAIN}）"
      ;;
  esac
fi

case "$HTTP_PORT" in
  ''|*[!0-9]*) die "HTTP_PORT 必须是 1-65535 的整数（当前：${HTTP_PORT}）" ;;
esac
if [ "$HTTP_PORT" -lt 1 ] || [ "$HTTP_PORT" -gt 65535 ]; then
  die "HTTP_PORT 必须是 1-65535 的整数（当前：${HTTP_PORT}）"
fi

[ -d "$DIST_DIR" ] || die "找不到 dist 目录：$DIST_DIR
修复：先在仓库根目录运行 npm run build 生成 dist/，或用 DIST_DIR=/path/to/dist 指定。"
[ -f "$DIST_DIR/index.html" ] || die "$DIST_DIR/index.html 不存在，dist 不完整
修复：删除损坏的 dist 后重新运行 npm run build。"
DIST_REAL="$(resolve_absolute_dir "$DIST_DIR")"

if [ "$WEBROOT" = "/" ]; then
  die "WEBROOT 不能是根目录 /。请指定一个专用目录，例如 /var/www/docia。"
fi

# 不允许把站点同步进源码树，也不允许用 WEBROOT 覆盖仓库的上级（会误删其它文件）。
if path_within "$WEBROOT" "$ROOT"; then
  die "WEBROOT 位于仓库内部，会误删源码：$WEBROOT
修复：使用仓库外路径，例如 WEBROOT=/var/www/docia、WEBROOT=~/docia-site，
      或相对部署根写 WEBROOT=site（仓库的兄弟目录）。"
fi
if path_within "$ROOT" "$WEBROOT"; then
  die "WEBROOT 是仓库根目录的上级（或就是仓库根），会误删其他文件：$WEBROOT
修复：换一个专用目录，例如 /var/www/docia。"
fi
case "$WEBROOT" in
  *'"'*|*'\'*|*'$'*|*$'\n'*)
    die "WEBROOT 不能包含双引号、反斜杠、\$ 或换行符（会破坏 Nginx 配置）：$WEBROOT"
    ;;
esac

# ---------------------------------------------------------------- Nginx 布局

case "$NGINX_LAYOUT" in
  auto|debian|confd) ;;
  *) die "NGINX_LAYOUT 只能是 auto、debian 或 confd（当前：${NGINX_LAYOUT}）" ;;
esac

NGINX_LAYOUT_ORIGIN='手动指定'
if [ "$NGINX_LAYOUT" = "auto" ]; then
  if [ -d "$NGINX_CONF_DIR/sites-available" ] || [ -d "$NGINX_CONF_DIR/sites-enabled" ]; then
    NGINX_LAYOUT=debian
    NGINX_LAYOUT_ORIGIN='自动检测：存在 sites-available/sites-enabled'
  elif [ -d "$NGINX_CONF_DIR/conf.d" ]; then
    NGINX_LAYOUT=confd
    NGINX_LAYOUT_ORIGIN='自动检测：存在 conf.d'
  elif command -v apt-get >/dev/null 2>&1; then
    NGINX_LAYOUT=debian
    NGINX_LAYOUT_ORIGIN='自动推断：apt-get 系统'
  elif command -v dnf >/dev/null 2>&1 || command -v yum >/dev/null 2>&1; then
    NGINX_LAYOUT=confd
    NGINX_LAYOUT_ORIGIN='自动推断：dnf/yum 系统'
  else
    NGINX_LAYOUT=debian
    NGINX_LAYOUT_ORIGIN='自动推断：未检测到包管理器，按 Debian 布局预演'
  fi
fi

if [ "$NGINX_LAYOUT" = "debian" ]; then
  CONF_FILE="$NGINX_CONF_DIR/sites-available/$SITE_NAME"
  ENABLED_LINK="$NGINX_CONF_DIR/sites-enabled/$SITE_NAME"
else
  CONF_FILE="$NGINX_CONF_DIR/conf.d/$SITE_NAME.conf"
  ENABLED_LINK=""
fi

if [ "$DOMAIN" = "_" ]; then
  LISTEN_SPEC="$HTTP_PORT default_server"
else
  LISTEN_SPEC="$HTTP_PORT"
fi

# ---------------------------------------------------------------- 运行身份 / sudo

CURRENT_UID="$(id -u)"
SUDO_BIN=""
if [ "$CURRENT_UID" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO_BIN="sudo"
  fi
fi

if [ "$DRY_RUN" != "1" ] && [ "$CURRENT_UID" -ne 0 ] && [ -z "$SUDO_BIN" ]; then
  die "当前不是 root，也没有找到 sudo，无法写入 /etc/nginx 和系统目录。
修复：用 root 执行（sudo ./tools/deploy-server.sh），或先安装 sudo；只做检查可加 DRY_RUN=1。"
fi

as_root() {
  if [ -n "$SUDO_BIN" ]; then
    "$SUDO_BIN" "$@"
  else
    "$@"
  fi
}

# 真正执行时用来跑需要 root 的命令；dry-run 未被调用（计划单独打印）。
run_sudo() {
  if [ "$DRY_RUN" = "1" ]; then
    if [ -n "$SUDO_BIN" ]; then
      printf '  [将执行] sudo %s\n' "$(print_command "$@")"
    else
      printf '  [将执行] %s\n' "$(print_command "$@")"
    fi
    return 0
  fi
  as_root "$@"
}

# ---------------------------------------------------------------- 已有配置检查

config_exists() {
  local f
  f="$1"
  if [ -L "$f" ] || [ -e "$f" ]; then
    return 0
  fi
  [ "$DRY_RUN" = "1" ] && return 1
  as_root test -e "$f" || as_root test -L "$f"
}

config_is_managed() {
  local f
  f="$1"
  [ -r "$f" ] || return 1
  grep -qF "$MANAGED_TAG" "$f" 2>/dev/null
}

if config_exists "$CONF_FILE"; then
  if [ "$FORCE" = "1" ]; then
    warn "将覆盖已有 Nginx 站点配置（FORCE=1）：$CONF_FILE"
  elif config_is_managed "$CONF_FILE"; then
    : # 本脚本生成的配置，允许幂等更新
  else
    die "已有 Nginx 站点配置且不是本脚本生成的：$CONF_FILE
为避免覆盖手工维护的站点，脚本已停止。
修复：确认可覆盖后加 FORCE=1 重试（原文件会备份为 $CONF_FILE.docia.bak），
      或改 SITE_NAME=另一个名字。"
  fi
fi

# ---------------------------------------------------------------- WEBROOT 状态

WEBROOT_REAL="$(resolve_absolute_dir "$WEBROOT")"
MARKER="${WEBROOT_REAL%/}.deployed"

webroot_has_content() {
  local first
  if [ ! -d "$WEBROOT_REAL" ]; then return 1; fi
  if [ "$DRY_RUN" = "1" ] || [ -z "$SUDO_BIN" ]; then
    first="$(ls -A "$WEBROOT_REAL" 2>/dev/null | head -n 1 || true)"
  else
    first="$(as_root ls -A "$WEBROOT_REAL" 2>/dev/null | head -n 1 || true)"
  fi
  [ -n "$first" ]
}

marker_exists() {
  if [ "$DRY_RUN" = "1" ] || [ -z "$SUDO_BIN" ]; then
    [ -f "$MARKER" ]
  else
    as_root test -f "$MARKER"
  fi
}

if webroot_has_content && ! marker_exists && [ "$FORCE" != "1" ]; then
  die "WEBROOT 非空且不是本脚本创建过的目录：${WEBROOT_REAL}（没有部署标记 ${MARKER}）
为避免误删已有文件，脚本已停止。
修复：确认可以覆盖后加 FORCE=1 重试；或换一个空目录作为 WEBROOT。"
fi

# ---------------------------------------------------------------- 依赖检查

has_nginx=0
has_rsync=0
command -v nginx >/dev/null 2>&1 && has_nginx=1
command -v rsync >/dev/null 2>&1 && has_rsync=1

detect_package_manager() {
  if command -v apt-get >/dev/null 2>&1; then printf 'apt-get\n'
  elif command -v dnf >/dev/null 2>&1; then printf 'dnf\n'
  elif command -v yum >/dev/null 2>&1; then printf 'yum\n'
  else printf '\n'
  fi
}

# 目标机 rsync 是否支持 --chmod=D755,F644。
# macOS 自带 openrsync 会接受部分写法但不生效，因此真正执行前做一次小探测。
rsync_chmod_supported() {
  local probe_src probe_dst
  probe_src="$(mktemp -d "${TMPDIR:-/tmp}/docia-rsync-probe.XXXXXX")"
  probe_dst="$(mktemp -d "${TMPDIR:-/tmp}/docia-rsync-probe.XXXXXX")"
  : >"$probe_src/probe.txt"
  if rsync -a --chmod=D755,F644 "$probe_src/" "$probe_dst/" >/dev/null 2>&1; then
    rm -rf "$probe_src" "$probe_dst"
    printf '1\n'
  else
    rm -rf "$probe_src" "$probe_dst"
    printf '0\n'
  fi
}

rsync_is_openrsync() {
  local first
  first="$(rsync --version 2>&1 | head -n 1 || true)"
  case "$first" in
    *openrsync*) return 0 ;;
  esac
  return 1
}

# ---------------------------------------------------------------- 安装依赖

install_deps() {
  local pm
  pm="$(detect_package_manager)"
  if [ -z "$pm" ]; then
    warn "未找到 apt-get / dnf / yum，跳过自动安装。"
    return 0
  fi
  log "使用 $pm 安装 nginx 和 rsync"
  case "$pm" in
    apt-get)
      run_sudo apt-get update
      run_sudo env DEBIAN_FRONTEND=noninteractive apt-get install -y nginx rsync
      ;;
    dnf)
      run_sudo dnf install -y nginx rsync
      ;;
    yum)
      run_sudo yum install -y nginx rsync
      ;;
  esac
}

ensure_deps() {
  if [ "$has_nginx" = "1" ] && [ "$has_rsync" = "1" ]; then
    return 0
  fi
  if [ "$INSTALL_DEPS" != "1" ]; then
    die "缺少 nginx 或 rsync，且 INSTALL_DEPS=0。
修复：设置 INSTALL_DEPS=1 自动安装，或先手动安装：
      Debian/Ubuntu: sudo apt-get update && sudo apt-get install -y nginx rsync
      RHEL/Fedora:   sudo dnf install -y nginx rsync"
  fi
  local pm
  pm="$(detect_package_manager)"
  if [ -z "$pm" ]; then
    warn "未找到 apt-get / dnf / yum，跳过自动安装依赖。"
  else
    install_deps
  fi
  if ! command -v nginx >/dev/null 2>&1; then
    die "nginx 仍不可用。
修复：手动安装 nginx（Debian/Ubuntu: sudo apt-get install -y nginx），或检查包管理器是否成功。"
  fi
  if ! command -v rsync >/dev/null 2>&1; then
    die "rsync 仍不可用。
修复：手动安装 rsync（Debian/Ubuntu: sudo apt-get install -y rsync），或设置 INSTALL_DEPS=1 重试。"
  fi
}

# ---------------------------------------------------------------- Nginx 配置内容

nginx_quote() { printf '"%s"' "$1"; }

build_nginx_conf() {
  printf '%s\n' "$MANAGED_TAG"
  printf '%s\n' 'server {'
  printf '    listen %s;\n' "$LISTEN_SPEC"
  printf '    server_name %s;\n' "$DOMAIN"
  printf '\n'
  printf '    root %s;\n' "$(nginx_quote "$WEBROOT_REAL")"
  printf '    index index.html;\n'
  printf '\n'
  printf '%s\n' '    location / {'
  printf '%s\n' '        try_files $uri $uri/ =404;'
  printf '%s\n' '    }'
  printf '%s\n' '}'
}

disable_default_site() {
  local default_path default_backup
  [ "$DISABLE_DEFAULT_SITE" = "1" ] || return 0
  if [ "$NGINX_LAYOUT" = "debian" ]; then
    default_path="$NGINX_CONF_DIR/sites-enabled/default"
  else
    default_path="$NGINX_CONF_DIR/conf.d/default.conf"
  fi
  if as_root test -L "$default_path"; then
    log "停用 Nginx 默认站点（删除符号链接 ${default_path}，配置文件保留）"
    run_sudo rm -f "$default_path"
    DEFAULT_ACTION="symlink-removed"
    DEFAULT_PATH="$default_path"
  elif as_root test -e "$default_path"; then
    default_backup="$default_path.disabled-by-docia"
    log "停用 Nginx 默认站点（重命名 $default_path -> ${default_backup}）"
    run_sudo mv -f "$default_path" "$default_backup"
    DEFAULT_ACTION="renamed"
    DEFAULT_PATH="$default_path"
    DEFAULT_BACKUP="$default_backup"
  fi
}

rollback_default_site() {
  case "${DEFAULT_ACTION:-}" in
    symlink-removed)
      run_sudo ln -sfn "../sites-available/default" "$DEFAULT_PATH" || true
      ;;
    renamed)
      run_sudo mv -f "$DEFAULT_BACKUP" "$DEFAULT_PATH" || true
      ;;
  esac
}

reload_nginx() {
  if command -v systemctl >/dev/null 2>&1; then
    run_sudo systemctl enable --now nginx >/dev/null 2>&1 || true
    if run_sudo systemctl reload nginx; then
      return 0
    fi
    warn "systemctl reload nginx 失败，尝试 service 或 nginx -s reload"
  fi
  if command -v service >/dev/null 2>&1; then
    if run_sudo service nginx reload; then return 0; fi
  fi
  if run_sudo nginx -s reload; then return 0; fi
  die "Nginx 配置已通过 nginx -t，但 reload 失败。
修复：手动执行 sudo systemctl status nginx / sudo systemctl reload nginx 查看原因。"
}

# ---------------------------------------------------------------- DRY RUN 计划

print_deps_plan() {
  local missing pm
  missing=""
  if [ "$has_nginx" != "1" ]; then missing="$missing nginx"; fi
  if [ "$has_rsync" != "1" ]; then missing="$missing rsync"; fi
  if [ -z "$missing" ]; then
    printf '  依赖          : nginx、rsync 已安装\n'
    return 0
  fi
  printf '  依赖          : 缺少%s\n' "$missing"
  if [ "$INSTALL_DEPS" != "1" ]; then
    printf '                  INSTALL_DEPS=0：真实运行会中止；请先手动安装。\n'
    return 0
  fi
  pm="$(detect_package_manager)"
  if [ -n "$pm" ]; then
    printf '                  真实运行将使用 %s 安装 nginx 和 rsync\n' "$pm"
  else
    printf '                  未找到 apt-get/dnf/yum：真实运行会跳过自动安装；若仍缺少会中止。\n'
  fi
}

print_plan() {
  log "部署计划（DRY_RUN=1：只校验和打印，不修改任何文件）"
  printf '  仓库根        : %s\n' "$ROOT"
  printf '  dist          : %s\n' "$DIST_REAL"
  printf '  WEBROOT       : %s\n' "$WEBROOT_REAL"
  printf '                  （来源：%s）\n' "$WEBROOT_ORIGIN"
  printf '  部署标记      : %s（在 WEBROOT 同级，不会被公开或 rsync --delete 删除）\n' "$MARKER"
  printf '  站点名        : %s\n' "$SITE_NAME"
  printf '  域名          : %s\n' "$DOMAIN"
  printf '  HTTP 端口     : %s\n' "$HTTP_PORT"
  printf '  Nginx 布局    : %s（%s）\n' "$NGINX_LAYOUT" "$NGINX_LAYOUT_ORIGIN"
  printf '  Nginx 配置    : %s\n' "$CONF_FILE"
  if [ -n "$ENABLED_LINK" ]; then
    printf '  启用链接      : %s\n' "$ENABLED_LINK"
  fi
  if [ -n "$SUDO_BIN" ]; then
    printf '  运行身份      : 非 root，将通过 sudo 执行系统操作\n'
  else
    printf '  运行身份      : root（无需 sudo）\n'
  fi
  if [ "$FORCE" = "1" ]; then
    printf '  FORCE         : 1（允许覆盖非本脚本创建的目录/配置，请确认）\n'
  else
    printf '  FORCE         : 0\n'
  fi
  print_deps_plan

  log "将执行的操作"
  printf '  [将执行] install -d -m 0755 %s\n' "$(printf '%q' "$WEBROOT_REAL")"
  printf '  [将执行] rsync -a --delete --chmod=D755,F644 %s %s\n' \
    "$(printf '%q' "${DIST_REAL%/}/")" "$(printf '%q' "${WEBROOT_REAL%/}/")"
  printf '            （若目标机 rsync 是 openrsync 或不支持 --chmod，会自动去掉该选项并在同步后 chmod）\n'
  printf '  [将执行] touch %s\n' "$(printf '%q' "$MARKER")"
  if [ "$NGINX_LAYOUT" = "debian" ]; then
    printf '  [将执行] install -d -m 0755 %s %s\n' \
      "$(printf '%q' "$NGINX_CONF_DIR/sites-available")" "$(printf '%q' "$NGINX_CONF_DIR/sites-enabled")"
    printf '  [将执行] install -m 0644 <生成的配置> %s\n' "$(printf '%q' "$CONF_FILE")"
    printf '  [将执行] ln -sfn %s %s\n' \
      "$(printf '%q' "../sites-available/$SITE_NAME")" "$(printf '%q' "$ENABLED_LINK")"
  else
    printf '  [将执行] install -d -m 0755 %s\n' "$(printf '%q' "$NGINX_CONF_DIR/conf.d")"
    printf '  [将执行] install -m 0644 <生成的配置> %s\n' "$(printf '%q' "$CONF_FILE")"
  fi
  if [ "$DISABLE_DEFAULT_SITE" = "1" ]; then
    if [ "$NGINX_LAYOUT" = "debian" ]; then
      printf '  [将执行] 若存在 %s，则停用默认站点（删除符号链接，保留配置文件）\n' \
        "$(printf '%q' "$NGINX_CONF_DIR/sites-enabled/default")"
    else
      printf '  [将执行] 若存在 %s，则停用默认站点（重命名保留）\n' \
        "$(printf '%q' "$NGINX_CONF_DIR/conf.d/default.conf")"
    fi
  fi
  printf '  [将执行] nginx -t（失败则不 reload，并恢复写入前的配置）\n'
  printf '  [将执行] systemctl reload nginx（或 service / nginx -s reload）\n'

  log "将写入的 Nginx 配置（${CONF_FILE}）"
  build_nginx_conf

  log "说明"
  printf '  * DRY_RUN 没有创建目录、没有写 /etc、没有安装软件。\n'
  printf '  * 真实运行前请确认 WEBROOT 不包含需要保留的文件。\n'
  printf '  * 首次部署会创建 WEBROOT；之后重复执行是幂等的。\n'
  if [ -n "${SUDO_USER:-}" ]; then
    printf '  * 当前通过 sudo 运行，~/ 展开为 %s（SUDO_USER 的 home）。\n' "$(invoking_home)"
  fi
  printf '\nDRY_RUN 完成：以上为计划，未修改任何文件。\n'
}

# ================================================================ 入口

if [ "$DRY_RUN" = "1" ]; then
  print_plan
  exit 0
fi

# ---- 真实执行 ----

ensure_deps

log "准备站点目录 $WEBROOT"
run_sudo install -d -m 0755 "$WEBROOT"
WEBROOT_REAL="$(resolve_absolute_dir "$WEBROOT")"
MARKER="${WEBROOT_REAL%/}.deployed"

# 创建目录后再做一次真实路径检查（防止 WEBROOT 是指向仓库的符号链接）。
if path_within "$WEBROOT_REAL" "$ROOT"; then
  die "WEBROOT 的真实路径位于仓库内部，会误删源码：$WEBROOT_REAL
修复：换一个仓库外目录，或删除该符号链接后重试。"
fi
if path_within "$ROOT" "$WEBROOT_REAL"; then
  die "WEBROOT 的真实路径是仓库的上级，会误删其他文件：$WEBROOT_REAL
修复：换一个专用目录，例如 /var/www/docia。"
fi

if webroot_has_content && ! marker_exists && [ "$FORCE" != "1" ]; then
  die "WEBROOT 非空且没有部署标记：$WEBROOT_REAL
修复：确认可覆盖后加 FORCE=1 重试，或换成空目录。"
fi

log "同步 dist/ 到 $WEBROOT_REAL"
if rsync_chmod_supported | grep -q '^1$'; then
  run_sudo rsync -a --delete --chmod=D755,F644 "${DIST_REAL%/}/" "${WEBROOT_REAL%/}/"
else
  warn "目标机 rsync 不支持 --chmod=D755,F644，改用同步后显式 chmod。"
  run_sudo rsync -a --delete "${DIST_REAL%/}/" "${WEBROOT_REAL%/}/"
  run_sudo find "$WEBROOT_REAL" -type d -exec chmod 755 {} +
  run_sudo find "$WEBROOT_REAL" -type f -exec chmod 644 {} +
fi

# 确保 www-data 可读；属主保持 root（文件 644、目录 755 即可读）。
if getent group www-data >/dev/null 2>&1 || dscl . -read /Groups/www-data >/dev/null 2>&1; then
  run_sudo chgrp -R www-data "$WEBROOT_REAL" || true
fi

run_sudo touch "$MARKER"
run_sudo chmod 0644 "$MARKER"
log "写入部署标记 $MARKER"

# ---- Nginx 配置 ----

CONF_TMP=""
cleanup() {
  if [ -n "$CONF_TMP" ] && [ -f "$CONF_TMP" ]; then rm -f "$CONF_TMP"; fi
}
trap cleanup EXIT

CONF_TMP="$(mktemp "${TMPDIR:-/tmp}/docia-nginx.XXXXXX")"
build_nginx_conf >"$CONF_TMP"

CONF_EXISTED=0
CONF_BACKUP=""
LINK_PREEXISTED=0
DEFAULT_ACTION=""
DEFAULT_PATH=""
DEFAULT_BACKUP=""

if config_exists "$CONF_FILE"; then
  CONF_EXISTED=1
  CONF_BACKUP="$CONF_FILE.docia.bak"
  log "备份已有 Nginx 站点配置到 $CONF_BACKUP"
  run_sudo cp -p "$CONF_FILE" "$CONF_BACKUP"
fi
if [ -n "$ENABLED_LINK" ]; then
  if as_root test -L "$ENABLED_LINK" || as_root test -e "$ENABLED_LINK"; then
    LINK_PREEXISTED=1
  fi
fi

log "写入 Nginx 站点配置 $CONF_FILE"
if [ "$NGINX_LAYOUT" = "debian" ]; then
  run_sudo install -d -m 0755 "$NGINX_CONF_DIR/sites-available" "$NGINX_CONF_DIR/sites-enabled"
  run_sudo install -m 0644 "$CONF_TMP" "$CONF_FILE"
  run_sudo ln -sfn "../sites-available/$SITE_NAME" "$ENABLED_LINK"
else
  run_sudo install -d -m 0755 "$NGINX_CONF_DIR/conf.d"
  run_sudo install -m 0644 "$CONF_TMP" "$CONF_FILE"
fi

disable_default_site

log "检查 Nginx 配置（nginx -t）"
if ! run_sudo nginx -t; then
  warn "nginx -t 失败：恢复写入前的配置，且不 reload。"
  if [ "$CONF_EXISTED" = "1" ]; then
    run_sudo cp -p "$CONF_BACKUP" "$CONF_FILE" || true
  else
    run_sudo rm -f "$CONF_FILE" || true
  fi
  if [ -n "$ENABLED_LINK" ] && [ "$LINK_PREEXISTED" = "0" ]; then
    run_sudo rm -f "$ENABLED_LINK" || true
  fi
  rollback_default_site
  if [ -n "$CONF_BACKUP" ]; then
    run_sudo rm -f "$CONF_BACKUP" || true
  fi
  die "nginx -t 未通过，已恢复原有配置并且没有 reload。
修复建议：
  1) 看上面 nginx 报错的具体行；
  2) 端口 $HTTP_PORT 是否被占用，或用 HTTP_PORT=8080 换端口；
  3) DOMAIN=_ 会写入 default_server；若已有默认站点，请设 DISABLE_DEFAULT_SITE=1；
  4) 确认 WEBROOT 存在且可读：${WEBROOT_REAL}。"
fi

if [ -n "$CONF_BACKUP" ]; then
  run_sudo rm -f "$CONF_BACKUP" || true
fi

log "reload Nginx"
reload_nginx

# ---- 结果 ----

URL_HOST=""
if [ "$DOMAIN" = "_" ]; then
  URL_HOST="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  [ -n "$URL_HOST" ] || URL_HOST='<服务器IP>'
else
  URL_HOST="$DOMAIN"
fi
URL="http://$URL_HOST"
if [ "$HTTP_PORT" != "80" ]; then
  URL="$URL:$HTTP_PORT"
fi
if [ "$DOMAIN" = "_" ] && [ "$URL_HOST" != "<服务器IP>" ]; then
  URL="$URL/"
fi

log "完成：$URL"
printf '静态文件目录：%s\n' "$WEBROOT_REAL"
printf 'Nginx 配置：%s\n' "$CONF_FILE"
printf '部署标记：%s\n' "$MARKER"
printf '\n更新内容：在服务器上 git pull（或重新暂存）后重新执行本脚本即可。\n'
