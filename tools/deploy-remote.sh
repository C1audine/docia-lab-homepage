#!/usr/bin/env bash
# tools/deploy-remote.sh —— 在开发机上把本仓库的 dist/ 部署到远端服务器。
#
# 特点：
#   * 所有主机/用户/路径通过命令行或 tools/deploy.env 传入，脚本本身不含真实主机信息；
#   * 不保存任何密码或私钥，SSH 使用系统 ssh/ssh-agent 配置；
#   * --dry-run 只打印完整计划，不构建、不联网；
#   * --bootstrap 适合新服务器首次部署：把 dist/ 与服务器脚本暂存到远端 ~/.docia-deploy，
#     再通过 sudo env ... 执行 tools/deploy-server.sh（显式传环境变量，不依赖 sudo -E）；
#   * 兼容 macOS 自带的 openrsync（自动省略其不支持的 --chmod，并在远端修正权限）。
#
# bash 3.2 兼容；不在仓库中写入任何真实主机 / 密钥 / 密码。
set -euo pipefail

DEFAULT_SSH_OPTS='-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15'

log() { printf '\n==> %s\n' "$*"; }
warn() { printf '警告：%s\n' "$*" >&2; }
die() { printf '\n错误：%s\n' "$*" >&2; exit 1; }
short_usage() { printf '用法：%s --host <主机> [选项]\n' "${0##*/}"; }
usage_error() { printf '错误：%s\n\n' "$1" >&2; short_usage >&2; printf '用 --help 查看完整用法。\n' >&2; exit 2; }

usage() {
  cat <<'USAGE'
tools/deploy-remote.sh —— 在开发机上把 dist/ 部署到远端服务器（不在仓库里保存主机信息）。

用法：
  ./tools/deploy-remote.sh --host <主机> [选项]
  ./tools/deploy-remote.sh --host 1.2.3.4 --user deploy --path ~/docia-site --dry-run
  ./tools/deploy-remote.sh --host example.com --user deploy --bootstrap   # 新服务器首次

必填：
  --host <主机>         远端主机/IP（也可用环境变量 DEPLOY_HOST）。

选项（命令行 > 环境变量 > tools/deploy.env > 默认值）：
  --user <用户>         SSH 用户；默认使用当前 ssh 配置（不传 -l）。
  --port <端口>         SSH 端口；默认 22。
  --path <路径>         远端站点目录；默认 ~/docia-site（相对远端 ${HOME}）。
                        支持 ~/... 和绝对路径，执行时会在远端解析成绝对路径。
  --domain <域名>       Nginx server_name；不传则服务器脚本默认 _（默认站点）。
  --http-port <端口>    Nginx 监听端口；默认 80（传给服务器脚本）。
  --build               强制先运行 npm run build；dist 缺失时也会自动构建。
  --no-build            不构建；dist 缺失则报错。
  --bootstrap           新服务器首次：暂存 dist/ 和 tools/deploy-server.sh 到远端
                        ~/.docia-deploy，再用 sudo 执行服务器脚本（安装 Nginx、写配置、
                        同步站点）。非 root 用户需要 sudo 权限。
  --no-bootstrap        只同步 dist/ 到远端目录，不碰 Nginx（默认行为）。
  --dry-run             只打印计划（含解析后的远端路径和命令），不构建、不 ssh、不 rsync。
  --verbose             打印实际执行的 ssh / rsync 命令。
  -h, --help            显示本帮助并退出 0。

环境变量：
  DEPLOY_HOST DEPLOY_USER DEPLOY_PORT DEPLOY_PATH DEPLOY_DOMAIN
  DEPLOY_HTTP_PORT DEPLOY_BUILD DEPLOY_BOOTSTRAP SSH_OPTS
  也可把同样的键写进 tools/deploy.env（见 tools/deploy.env.example；该文件不要提交）。

部署流程：
  1. dist/ 缺失或指定 --build 时，先在仓库根目录运行 npm run build；
  2. 通过 ssh 解析远端 ${HOME}，把 ~/... 路径换成远端绝对路径（不会混淆本地 HOME）；
  3. rsync -a --delete 同步 dist/（本地 rsync 支持时附带 --chmod=D755,F644）；
  4. --bootstrap 时额外暂存并执行服务器脚本，之后可重复执行。
  注意：--delete 会删除远端站点目录中多余的文件；不要把站点目录指向 HOME 或系统目录。

示例：
  cp tools/deploy.env.example tools/deploy.env   # 填自己的主机，勿提交
  ./tools/deploy-remote.sh --dry-run             # 读 deploy.env，只打印计划
  ./tools/deploy-remote.sh --bootstrap           # 新服务器首次
  ./tools/deploy-remote.sh                       # 之后仅更新静态文件
USAGE
}

# ---------------------------------------------------------------- 通用工具

# 远端 shell 用的单引号转义（路径含空格、单引号也安全）。
shq() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"
}

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

path_within() {
  [ "$1" = "$2" ] && return 0
  case "$1/" in
    "$2/"*) return 0 ;;
  esac
  return 1
}

# 定位仓库根：与调用者的 cwd 无关。
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
DIST_DIR="$ROOT/dist"

# ---------------------------------------------------------------- 读取 deploy.env

# 只识别白名单变量，不 source 文件（避免执行任意代码），支持 # 注释与成对引号。
load_env_file() {
  local file line key value
  file="$1"
  [ -f "$file" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    case "$line" in
      ''|'#'*) continue ;;
    esac
    case "$line" in
      'export '*|'export	'*) line="${line#export }" ;;
    esac
    case "$line" in
      *=*) ;;
      *) continue ;;
    esac
    key="${line%%=*}"
    value="${line#*=}"
    case "$key" in
      DEPLOY_HOST|DEPLOY_USER|DEPLOY_PORT|DEPLOY_PATH|DEPLOY_DOMAIN|DEPLOY_HTTP_PORT|DEPLOY_BUILD|DEPLOY_BOOTSTRAP|SSH_OPTS) ;;
      *) continue ;;
    esac
    case "$value" in
      \"*\") value="${value#\"}"; value="${value%\"}" ;;
      \'*\') value="${value#\'}"; value="${value%\'}" ;;
    esac
    printf -v "FILE_$key" '%s' "$value"
  done <"$file"
}

# 记录真实环境变量，保证优先级“命令行 > 环境变量 > deploy.env > 默认值”。
ENV_DEPLOY_HOST="${DEPLOY_HOST-}"
ENV_DEPLOY_USER="${DEPLOY_USER-}"
ENV_DEPLOY_PORT="${DEPLOY_PORT-}"
ENV_DEPLOY_PATH="${DEPLOY_PATH-}"
ENV_DEPLOY_DOMAIN="${DEPLOY_DOMAIN-}"
ENV_DEPLOY_HTTP_PORT="${DEPLOY_HTTP_PORT-}"
ENV_DEPLOY_BUILD="${DEPLOY_BUILD-}"
ENV_DEPLOY_BOOTSTRAP="${DEPLOY_BOOTSTRAP-}"
ENV_SSH_OPTS="${SSH_OPTS-}"

# ---------------------------------------------------------------- 解析命令行

CLI_HOST=""
CLI_USER=""
CLI_PORT=""
CLI_PATH=""
CLI_DOMAIN=""
CLI_HTTP_PORT=""
CLI_BUILD=""
CLI_BOOTSTRAP=""
DRY_RUN=0
VERBOSE=0

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --host)
      [ $# -ge 2 ] || usage_error "--host 需要一个值"
      CLI_HOST="$2"
      shift 2
      ;;
    --host=*)
      CLI_HOST="${1#*=}"
      shift
      ;;
    --user)
      [ $# -ge 2 ] || usage_error "--user 需要一个值"
      CLI_USER="$2"
      shift 2
      ;;
    --user=*)
      CLI_USER="${1#*=}"
      shift
      ;;
    --port)
      [ $# -ge 2 ] || usage_error "--port 需要一个值"
      CLI_PORT="$2"
      shift 2
      ;;
    --port=*)
      CLI_PORT="${1#*=}"
      shift
      ;;
    --path)
      [ $# -ge 2 ] || usage_error "--path 需要一个值"
      CLI_PATH="$2"
      shift 2
      ;;
    --path=*)
      CLI_PATH="${1#*=}"
      shift
      ;;
    --domain)
      [ $# -ge 2 ] || usage_error "--domain 需要一个值"
      CLI_DOMAIN="$2"
      shift 2
      ;;
    --domain=*)
      CLI_DOMAIN="${1#*=}"
      shift
      ;;
    --http-port)
      [ $# -ge 2 ] || usage_error "--http-port 需要一个值"
      CLI_HTTP_PORT="$2"
      shift 2
      ;;
    --http-port=*)
      CLI_HTTP_PORT="${1#*=}"
      shift
      ;;
    --build)
      CLI_BUILD="yes"
      shift
      ;;
    --no-build)
      CLI_BUILD="no"
      shift
      ;;
    --bootstrap)
      CLI_BOOTSTRAP="1"
      shift
      ;;
    --no-bootstrap)
      CLI_BOOTSTRAP="0"
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --verbose)
      VERBOSE=1
      shift
      ;;
    --)
      shift
      [ $# -eq 0 ] || usage_error "不支持位置参数：$1"
      ;;
    -*)
      usage_error "未知参数：$1"
      ;;
    *)
      usage_error "不支持位置参数：$1（主机请用 --host）"
      ;;
  esac
done

# ---------------------------------------------------------------- 合并配置

ENV_FILE="$ROOT/tools/deploy.env"
load_env_file "$ENV_FILE"

DEPLOY_HOST="${CLI_HOST:-${ENV_DEPLOY_HOST:-${FILE_DEPLOY_HOST:-}}}"
DEPLOY_USER="${CLI_USER:-${ENV_DEPLOY_USER:-${FILE_DEPLOY_USER:-}}}"
DEPLOY_PORT="${CLI_PORT:-${ENV_DEPLOY_PORT:-${FILE_DEPLOY_PORT:-22}}}"
DEPLOY_PATH_RAW="${CLI_PATH:-${ENV_DEPLOY_PATH:-${FILE_DEPLOY_PATH:-~/docia-site}}}"
DEPLOY_DOMAIN="${CLI_DOMAIN:-${ENV_DEPLOY_DOMAIN:-${FILE_DEPLOY_DOMAIN:-}}}"
DEPLOY_HTTP_PORT="${CLI_HTTP_PORT:-${ENV_DEPLOY_HTTP_PORT:-${FILE_DEPLOY_HTTP_PORT:-80}}}"
BUILD_INPUT="${CLI_BUILD:-${ENV_DEPLOY_BUILD:-${FILE_DEPLOY_BUILD:-}}}"
BOOTSTRAP_INPUT="${CLI_BOOTSTRAP:-${ENV_DEPLOY_BOOTSTRAP:-${FILE_DEPLOY_BOOTSTRAP:-0}}}"
SSH_OPTS="${ENV_SSH_OPTS:-${FILE_SSH_OPTS:-$DEFAULT_SSH_OPTS}}"

# ---------------------------------------------------------------- 校验配置

[ -n "$DEPLOY_HOST" ] || usage_error "缺少 --host（或 DEPLOY_HOST / tools/deploy.env 中的 DEPLOY_HOST）"

case "$DEPLOY_HOST" in
  -*|*[[:space:]]*|*/*|*'"'*|*"'"*|*'$'*|*'`'*|*'\'*)
    die "DEPLOY_HOST 含有不支持的字符：${DEPLOY_HOST}（应为主机名或 IP）"
    ;;
esac

if [ -n "$DEPLOY_USER" ]; then
  case "$DEPLOY_USER" in
    -*|*[!A-Za-z0-9._-]*)
      die "DEPLOY_USER 只能包含字母、数字、点、下划线和连字符，且不能以 - 开头：$DEPLOY_USER"
      ;;
  esac
fi

case "$DEPLOY_PORT" in
  ''|*[!0-9]*) die "SSH 端口必须是 1-65535 的整数（当前：${DEPLOY_PORT}）" ;;
esac
if [ "$DEPLOY_PORT" -lt 1 ] || [ "$DEPLOY_PORT" -gt 65535 ]; then
  die "SSH 端口必须是 1-65535 的整数（当前：${DEPLOY_PORT}）"
fi

case "$DEPLOY_HTTP_PORT" in
  ''|*[!0-9]*) die "--http-port / DEPLOY_HTTP_PORT 必须是 1-65535 的整数（当前：${DEPLOY_HTTP_PORT}）" ;;
esac
if [ "$DEPLOY_HTTP_PORT" -lt 1 ] || [ "$DEPLOY_HTTP_PORT" -gt 65535 ]; then
  die "--http-port / DEPLOY_HTTP_PORT 必须是 1-65535 的整数（当前：${DEPLOY_HTTP_PORT}）"
fi

if [ -n "$DEPLOY_DOMAIN" ]; then
  case "$DEPLOY_DOMAIN" in
    -*|*[!A-Za-z0-9._-]*)
      die "DEPLOY_DOMAIN 只能包含字母、数字、点、下划线和连字符：$DEPLOY_DOMAIN"
      ;;
  esac
fi

[ -n "$DEPLOY_PATH_RAW" ] || die "DEPLOY_PATH 不能为空"
case "$DEPLOY_PATH_RAW" in
  *$'\n'*|*$'\r'*) die "DEPLOY_PATH 不能包含换行符" ;;
esac
case "$DEPLOY_PATH_RAW" in
  '~'|'~/'*|/*) ;;
  '~'*) die "只支持 ~ 或 ~/... 形式的远端 home 路径（不支持 ~user）：$DEPLOY_PATH_RAW" ;;
esac

case "$BUILD_INPUT" in
  ''|auto|AUTO) BUILD_MODE=auto ;;
  1|true|TRUE|yes|YES|on|ON) BUILD_MODE=yes ;;
  0|false|FALSE|no|NO|off|OFF) BUILD_MODE=no ;;
  *) die "DEPLOY_BUILD 只能是 1/0/true/false/auto（当前：${BUILD_INPUT}）" ;;
esac
case "$CLI_BUILD" in
  yes) BUILD_MODE=yes ;;
  no) BUILD_MODE=no ;;
esac

case "$BOOTSTRAP_INPUT" in
  1|true|TRUE|yes|YES|on|ON) DO_BOOTSTRAP=1 ;;
  0|false|FALSE|no|NO|off|OFF|'') DO_BOOTSTRAP=0 ;;
  *) die "DEPLOY_BOOTSTRAP 只能是 0/1/true/false（当前：${BOOTSTRAP_INPUT}）" ;;
esac

# ---------------------------------------------------------------- 构建决策

dist_ready() { [ -d "$DIST_DIR" ] && [ -f "$DIST_DIR/index.html" ]; }

NEED_BUILD=0
if [ "$BUILD_MODE" = "yes" ]; then
  NEED_BUILD=1
elif [ "$BUILD_MODE" = "no" ]; then
  if ! dist_ready && [ "$DRY_RUN" != "1" ]; then
    die "dist/ 缺失或没有 index.html，但指定了 --no-build。
修复：去掉 --no-build 让脚本自动构建，或先手动执行 npm run build。"
  fi
elif dist_ready; then
  NEED_BUILD=0
else
  NEED_BUILD=1
fi

run_build() {
  command -v npm >/dev/null 2>&1 || die "需要 npm 构建 dist/，但没有找到 npm。
修复：安装 Node.js 20+（https://nodejs.org/），或手动构建后加 --no-build。"
  log "构建站点（npm run build）"
  ( cd "$ROOT" && npm run build ) || die "npm run build 失败，已中止部署（未改动远端）。
修复：先在本机单独运行 npm run build 查看报错。"
  dist_ready || die "构建结束但 dist/index.html 仍不存在。
修复：检查 package.json 的 build 脚本输出位置。"
}

ensure_commands() {
  command -v ssh >/dev/null 2>&1 || die "找不到 ssh 命令，无法连接远端。"
  command -v rsync >/dev/null 2>&1 || die "找不到 rsync 命令。
修复：Debian/Ubuntu: sudo apt-get install -y rsync；macOS 自带 rsync 即可。"
}

# ---------------------------------------------------------------- ssh / rsync 命令

# 远端命令统一通过单个字符串执行，路径用 shq 转义。
ssh_exec() {
  local cmd
  cmd="$1"
  if [ "$VERBOSE" = "1" ]; then
    printf '+ ssh %s %s %s\n' "$SSH_OPTS" "${DEPLOY_USER:+$DEPLOY_USER@}$DEPLOY_HOST" "$(shq "$cmd")" >&2
  fi
  if [ -n "$DEPLOY_USER" ]; then
    # shellcheck disable=SC2086
    ssh $SSH_OPTS -l "$DEPLOY_USER" -p "$DEPLOY_PORT" "$DEPLOY_HOST" "$cmd"
  else
    # shellcheck disable=SC2086
    ssh $SSH_OPTS -p "$DEPLOY_PORT" "$DEPLOY_HOST" "$cmd"
  fi
}

ssh_exec_tty() {
  local cmd
  cmd="$1"
  if [ "$VERBOSE" = "1" ]; then
    printf '+ ssh -t %s %s %s\n' "$SSH_OPTS" "${DEPLOY_USER:+$DEPLOY_USER@}$DEPLOY_HOST" "$(shq "$cmd")" >&2
  fi
  if [ -n "$DEPLOY_USER" ]; then
    # shellcheck disable=SC2086
    ssh -t $SSH_OPTS -l "$DEPLOY_USER" -p "$DEPLOY_PORT" "$DEPLOY_HOST" "$cmd"
  else
    # shellcheck disable=SC2086
    ssh -t $SSH_OPTS -p "$DEPLOY_PORT" "$DEPLOY_HOST" "$cmd"
  fi
}

# 本地 rsync 是否支持 --chmod=D755,F644（openrsync 不支持）。
rsync_supports_chmod() {
  local first
  first="$(rsync --version 2>&1 | head -n 1 || true)"
  case "$first" in
    *openrsync*) return 1 ;;
  esac
  return 0
}

RSYNC_SSH="ssh"
if [ -n "$DEPLOY_USER" ]; then RSYNC_SSH="$RSYNC_SSH -l $DEPLOY_USER"; fi
RSYNC_SSH="$RSYNC_SSH -p $DEPLOY_PORT"
if [ -n "$SSH_OPTS" ]; then RSYNC_SSH="$RSYNC_SSH $SSH_OPTS"; fi

RSYNC_EXTRA_ARGS=""
if rsync_supports_chmod; then
  RSYNC_EXTRA_ARGS="--chmod=D755,F644"
fi

# $1 本地源（末尾可带 /），$2 远端目标目录，$3=delete 时加 --delete
rsync_to_remote() {
  local src dst mode
  src="$1"
  dst="$2"
  mode="$3"
  local delete_arg=""
  [ "$mode" = "delete" ] && delete_arg="--delete"
  if [ "$VERBOSE" = "1" ]; then
    printf '+ rsync -a %s %s -e %s %s %s\n' "$delete_arg" "$RSYNC_EXTRA_ARGS" "$(shq "$RSYNC_SSH")" "$(printf '%q' "${src%/}/")" "$(printf '%q' "$DEPLOY_HOST:${dst%/}/")" >&2
  fi
  if [ -d "$src" ]; then src="${src%/}/"; else src="${src%/}"; fi
  # shellcheck disable=SC2086
  rsync -a $delete_arg $RSYNC_EXTRA_ARGS -e "$RSYNC_SSH" "$src" "$DEPLOY_HOST:${dst%/}/"
}

# ---------------------------------------------------------------- 远端路径解析

# $1 = 原始路径，$2 = 远端 home；输出绝对路径
resolve_remote_path() {
  local raw home out
  raw="$1"
  home="$2"
  case "/${raw}/" in
    */../*) die "远端路径不能包含 ..（防止路径穿越）：${raw}" ;;
  esac
  case "$raw" in
    '~') out="$home" ;;
    '~/'*) out="$home/${raw#\~/}" ;;
    /*) out="$raw" ;;
    *) out="$home/$raw" ;;
  esac
  normalize_abs_path "$out"
}

# 拒绝会造成灾难性 --delete 的目录。
check_remote_path_safe() {
  local path home
  path="$1"
  home="$2"
  case "/${path}/" in
    */../*) die "远端路径不能包含 ..（防止路径穿越）：${path}" ;;
  esac
  case "$path" in
    *$'\n'*) die "远端路径不能包含换行。" ;;
  esac
  if [ "$path" = "/" ]; then
    die "远端路径不能是 /（rsync --delete 会破坏系统）。"
  fi
  if [ "$path" = "$home" ]; then
    die "远端路径不能是远端 home 目录本身：$path
修复：改用子目录，例如 --path ~/docia-site。"
  fi
  case "$path" in
    /*/*) ;;
    *) die "远端路径至少需要两级目录，例如 /var/www/docia 或 ~/docia-site（当前：${path}）" ;;
  esac
  case "$path" in
    /etc|/etc/*|/usr|/usr/*|/bin|/bin/*|/sbin|/sbin/*|/lib|/lib/*|/lib64|/lib64/*|\
    /boot|/boot/*|/dev|/dev/*|/proc|/proc/*|/sys|/sys/*|/var/lib|/var/lib/*|\
    /var/run|/var/run/*|"$home"/.ssh|"$home"/.ssh/*)
      die "拒绝把站点目录指向系统目录：$path
修复：改用例如 /var/www/docia 或 ~/docia-site。"
      ;;
  esac
}

# ---------------------------------------------------------------- dry-run 计划

print_plan() {
  local assumed_user assumed_home resolved staging prefix build_desc bootstrap_desc
  assumed_user="${DEPLOY_USER:-$(id -un 2>/dev/null || printf 'user')}"
  if [ "$assumed_user" = "root" ]; then
    assumed_home="/root"
  else
    assumed_home="/home/$assumed_user"
  fi
  resolved="$(resolve_remote_path "$DEPLOY_PATH_RAW" "$assumed_home")"
  check_remote_path_safe "$resolved" "$assumed_home"
  staging="$assumed_home/.docia-deploy"

  if [ "$NEED_BUILD" = "1" ]; then
    build_desc="将执行 (cd $ROOT && npm run build)"
  elif [ "$BUILD_MODE" = "no" ]; then
    build_desc="不构建（--no-build）"
  else
    build_desc="跳过（dist/ 已存在；--build 可强制重建）"
  fi

  if [ "$DO_BOOTSTRAP" = "1" ]; then
    bootstrap_desc="是（暂存到 ${staging}，然后 sudo 执行服务器脚本）"
    if [ "$assumed_user" = "root" ]; then prefix="env"; else prefix="sudo env"; fi
  else
    bootstrap_desc="否（--bootstrap 用于新服务器首次）"
    prefix=""
  fi

  log "远程部署计划（dry-run：不构建、不 ssh、不 rsync、不修改任何文件）"
  printf '  本地仓库     : %s\n' "$ROOT"
  printf '  dist          : %s\n' "$DIST_DIR"
  printf '  构建          : %s\n' "$build_desc"
  printf '  目标主机      : %s\n' "$DEPLOY_HOST"
  printf '  SSH 端口/用户 : %s / %s\n' "$DEPLOY_PORT" "${DEPLOY_USER:-（使用 ssh 默认用户）}"
  printf '  SSH 选项      : %s\n' "$SSH_OPTS"
  printf '  远端路径      : %s -> %s\n' "$DEPLOY_PATH_RAW" "$resolved"
  printf '                  （dry-run 无法联网，按 /home/%s 估算；实跑会用远端 $HOME 解析）\n' "$assumed_user"
  if [ -n "$DEPLOY_DOMAIN" ]; then
    printf '  域名          : %s\n' "$DEPLOY_DOMAIN"
  else
    printf '  域名          : （未设置，服务器脚本默认 _ 作为默认站点）\n'
  fi
  printf '  HTTP 端口     : %s\n' "$DEPLOY_HTTP_PORT"
  printf '  Bootstrap     : %s\n' "$bootstrap_desc"
  if [ -n "$RSYNC_EXTRA_ARGS" ]; then
    printf '  本地 rsync    : 支持 --chmod=D755,F644\n'
  else
    printf '  本地 rsync    : openrsync（不支持 --chmod，将省略该参数并在远端 chmod）\n'
  fi

  log "将执行的操作"
  step=1
  if [ "$NEED_BUILD" = "1" ]; then
    printf '  %s) (cd %s && npm run build)\n' "$step" "$ROOT"
    step=$((step + 1))
  fi
  target="${DEPLOY_USER:+$DEPLOY_USER@}$DEPLOY_HOST"
  if [ "$DO_BOOTSTRAP" != "1" ]; then
    printf '  %s) ssh %s %s mkdir -p %s\n' "$step" "$SSH_OPTS" "$target" "$(printf '%q' "$resolved")"
    step=$((step + 1))
    printf '  %s) rsync -a --delete %s %s\n' "$step" \
      "$(printf '%q' "${DIST_DIR%/}/")" "$(printf '%q' "$target:$resolved/")"
    step=$((step + 1))
    printf '  %s) ssh %s %s "cd %s && find . -type d -exec chmod 755 {} + && find . -type f -exec chmod 644 {} +"\n' \
      "$step" "$SSH_OPTS" "$target" "$(printf '%q' "$resolved")"
  else
    printf '  %s) ssh %s %s mkdir -p %s %s\n' "$step" "$SSH_OPTS" "$target" \
      "$(printf '%q' "$staging/dist")" "$(printf '%q' "$staging/tools")"
    step=$((step + 1))
    printf '  %s) rsync -a --delete %s %s\n' "$step" \
      "$(printf '%q' "${DIST_DIR%/}/")" "$(printf '%q' "$target:$staging/dist/")"
    step=$((step + 1))
    printf '  %s) rsync -a %s %s\n' "$step" \
      "$(printf '%q' "$ROOT/tools/deploy-server.sh")" "$(printf '%q' "$target:$staging/tools/")"
    step=$((step + 1))
    extra_env=""
    if [ -n "$DEPLOY_DOMAIN" ]; then extra_env="$extra_env DOMAIN=$(shq "$DEPLOY_DOMAIN")"; fi
    if [ "$DEPLOY_HTTP_PORT" != "80" ]; then extra_env="$extra_env HTTP_PORT=$DEPLOY_HTTP_PORT"; fi
    printf '  %s) ssh -t %s %s %s WEBROOT=%s%s bash %s\n' "$step" "$SSH_OPTS" "$target" \
      "$prefix" "$(shq "$resolved")" "$extra_env" "$(shq "$staging/tools/deploy-server.sh")"
  fi

  log "说明"
  printf '  * dry-run 没有执行构建，也没有发起任何网络连接。\n'
  printf '  * 实跑会先通过 ssh 执行 printf ... "$HOME" 解析远端 home，再按上表执行。\n'
  printf '  * rsync --delete 会删除远端站点目录中多余的文件，请确认路径正确。\n'
  printf '  * 可选校验命令（本脚本不自动执行）：npm run validate:content、npm test。\n'
  printf '\ndry-run 完成：以上为计划，未修改任何文件。\n'
}

# ================================================================ 入口

if [ "$DRY_RUN" = "1" ]; then
  print_plan
  exit 0
fi

ensure_commands

if [ "$NEED_BUILD" = "1" ]; then
  run_build
fi

dist_ready || die "dist/ 不完整（缺少 index.html），无法部署。
修复：先运行 npm run build，或去掉 --no-build。"

# 解析远端 home：~ 必须按远端用户解析，不能用本地 ${HOME}。
log "连接远端并解析路径：$DEPLOY_HOST"
REMOTE_INFO="$(ssh_exec 'printf "uid=%s\nhome=%s\n" "$(id -u)" "$HOME"')" || die "无法通过 ssh 连接 ${DEPLOY_HOST}。
修复：确认主机可达、ssh 用户/端口正确、公钥已配置（可用 --verbose 查看命令）。"
REMOTE_UID="$(printf '%s\n' "$REMOTE_INFO" | sed -n 's/^uid=//p')"
REMOTE_HOME="$(printf '%s\n' "$REMOTE_INFO" | sed -n 's/^home=//p')"
[ -n "$REMOTE_HOME" ] || die "无法解析远端 ${HOME}（ssh 输出：${REMOTE_INFO}）"
[ -n "$REMOTE_UID" ] || REMOTE_UID=0

REMOTE_PATH="$(resolve_remote_path "$DEPLOY_PATH_RAW" "$REMOTE_HOME")"
check_remote_path_safe "$REMOTE_PATH" "$REMOTE_HOME"
STAGING="$REMOTE_HOME/.docia-deploy"
if [ "$DO_BOOTSTRAP" = "1" ] && path_within "$REMOTE_PATH" "$STAGING"; then
  die "远端站点路径不能位于暂存目录 $STAGING 内部：$REMOTE_PATH
修复：把 --path 改成站点自己的目录，例如 ~/docia-site。"
fi

log "目标：${DEPLOY_USER:+$DEPLOY_USER@}$DEPLOY_HOST:${REMOTE_PATH}（远端用户 uid=${REMOTE_UID}）"

# ---- 传输 ----

if [ "$DO_BOOTSTRAP" != "1" ]; then
  log "创建远端目录"
  ssh_exec "mkdir -p -- $(shq "$REMOTE_PATH")" || die "无法创建远端目录：$REMOTE_PATH"

  log "同步 dist/ 到远端（rsync -a --delete）"
  rsync_to_remote "$DIST_DIR" "$REMOTE_PATH" delete || die "rsync 同步失败。
修复：确认远端有 rsync、目录可写；可加 --verbose 查看实际命令。"

  log "修正远端文件权限（目录 755 / 文件 644）"
  ssh_exec "cd $(shq "$REMOTE_PATH") && find . -type d -exec chmod 755 {} + && find . -type f -exec chmod 644 {} +" \
    || die "修正远端权限失败。"

  printf '\n完成：%s:%s 已更新。\n' "$DEPLOY_HOST" "$REMOTE_PATH"
  printf '注意：本次没有改动 Nginx（未加 --bootstrap）。新服务器首次部署请加 --bootstrap。\n'
  exit 0
fi

# ---- bootstrap ----

if [ "$REMOTE_UID" != "0" ]; then
  if ! ssh_exec 'command -v sudo >/dev/null 2>&1'; then
    die "远端用户不是 root，也没有 sudo，无法安装 Nginx/写 /etc/nginx。
修复：给该用户 sudo 权限，或改用 root 用户；也可以手动在服务器上以 root 运行 tools/deploy-server.sh。
      如果只想先做静态文件同步（不初始化 Nginx），可以去掉 --bootstrap 并确认 WEBROOT 已由管理员建好。"
  fi
  log "远端用户非 root，将通过 sudo 执行服务器脚本（可能提示输入密码）"
fi

log "准备远端暂存目录 $STAGING"
ssh_exec "mkdir -p -- $(shq "$STAGING/dist") $(shq "$STAGING/tools")" \
  || die "无法创建远端暂存目录：$STAGING"

log "暂存 dist/ 到 $STAGING/dist"
rsync_to_remote "$DIST_DIR" "$STAGING/dist" delete || die "暂存 dist 失败。"

log "暂存服务器脚本到 $STAGING/tools"
rsync_to_remote "$ROOT/tools/deploy-server.sh" "$STAGING/tools" "" || die "暂存 deploy-server.sh 失败。"

# 显式传递环境变量：sudo env VAR=... 不依赖 sudo -E 是否保留变量。
ASSIGNS="WEBROOT=$(shq "$REMOTE_PATH")"
if [ -n "$DEPLOY_DOMAIN" ]; then
  ASSIGNS="$ASSIGNS DOMAIN=$(shq "$DEPLOY_DOMAIN")"
fi
if [ "$DEPLOY_HTTP_PORT" != "80" ]; then
  ASSIGNS="$ASSIGNS HTTP_PORT=$DEPLOY_HTTP_PORT"
fi
REMOTE_SCRIPT="$STAGING/tools/deploy-server.sh"
if [ "$REMOTE_UID" = "0" ]; then
  DEPLOY_CMD="env $ASSIGNS bash $(shq "$REMOTE_SCRIPT")"
else
  DEPLOY_CMD="sudo env $ASSIGNS bash $(shq "$REMOTE_SCRIPT")"
fi

log "在远端执行服务器部署脚本（${DEPLOY_CMD}）"
if ! ssh_exec_tty "$DEPLOY_CMD"; then
  die "远端部署脚本执行失败（见上面的输出）。
修复：检查 sudo 权限、远端是否支持 systemd、nginx 是否可用；也可登录服务器进入 $STAGING 手动执行：
      cd $STAGING && tools/deploy-server.sh"
fi

if [ -n "$DEPLOY_DOMAIN" ]; then
  URL_HOST="$DEPLOY_DOMAIN"
else
  URL_HOST="$DEPLOY_HOST"
fi
URL="http://$URL_HOST"
[ "$DEPLOY_HTTP_PORT" = "80" ] || URL="$URL:$DEPLOY_HTTP_PORT"

printf '\n完成：远端站点已部署。\n'
printf '站点目录：%s\n' "$REMOTE_PATH"
printf '访问地址：%s\n' "$URL"
printf '\n以后更新只需重新运行本脚本（加不加 --bootstrap 都可以）；'
printf '如果只在服务器上更新静态文件，也可直接 rsync dist/ 到 %s。\n' "$REMOTE_PATH"
