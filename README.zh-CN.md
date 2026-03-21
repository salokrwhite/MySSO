# MySSO

[English](README.md) | [简体中文](README.zh-CN.md)

MySSO 是一个围绕 OIDC 和 OAuth 2.0 构建的开源单点登录平台，包含：

- 面向用户的认证中心
- 用于应用接入和密钥管理的开发者后台
- 用于治理、审核、风控和系统配置的管理后台
- 提供标准身份协议能力的 Go 后端服务

这个仓库覆盖了从本地开发到生产部署的完整链路。

## 核心能力

- 认证中心
  - 密码登录
  - 邮件 / 短信验证码登录
  - MFA 双重认证
  - 账号中心资料、头像、绑定关系、Passkey、授权管理

- OIDC / OAuth 2.0
  - 授权端点
  - Token 端点
  - UserInfo 端点
  - Token Revoke
  - OpenID Discovery
  - JWKS 公钥发布
  - 第一方客户端支持

- 开发者后台
  - 创建和编辑 OIDC 应用
  - 配置回调地址、登出地址、Scope、描述和图标
  - 查看应用审核状态
  - 创建和重置 Client Secret
  - 开发者审计日志与分析能力

- 管理后台
  - 应用审核流程
  - 用户管理
  - 审计日志
  - 网关策略管理
  - 站点设置、邮件、短信和国际化模板
  - 风控和限流管理

- 部署支持
  - 首次安装流程和最小 `.env`
  - MySQL 迁移脚本
  - 生产打包发布
  - 可选远程语言包 CDN 模式

## 仓库结构

```text
backend/   Go 后端服务
frontend/  React + Vite 前端
build/     发布构建脚本和语言资源工具
release/   构建输出目录（由脚本生成）
```

## 技术栈

- 后端：Go
- 前端：React、Vite、TypeScript、Ant Design
- 数据库：MySQL
- 协议：OIDC、OAuth 2.0

## 快速开始

### 1. 启动后端

```bash
cd backend
go mod tidy
go run ./cmd/server
```

默认后端地址：

```text
http://localhost:8080
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认前端地址：

```text
http://localhost:5173
```

## 运行配置说明

后端运行时的配置优先级大致为：

1. 数据库中的系统设置
2. `backend/.env`
3. 代码默认值

生产环境最关键的配置项包括：

- `DATABASE_URL`
- `PUBLIC_BASE_URL`
- `FRONTEND_BASE_URL`
- `DEVICE_COOKIE_SECRET`
- `OIDC_SIGNING_PRIVATE_KEY_PATH` 或 `OIDC_SIGNING_PRIVATE_KEY_PEM`

说明：

- `PUBLIC_BASE_URL` 是后端 / OIDC 的公开访问地址
- `FRONTEND_BASE_URL` 是前端页面公开访问地址
- `DEVICE_COOKIE_SECRET` 建议在生产环境显式配置
- JWT 签名私钥必须持久化保存，不能依赖临时自动生成

## 打包与发布

发布构建由以下脚本完成：

- `build.sh`
- `build/build-release.sh`

### 默认发布构建

```bash
./build.sh
```

构建结果会输出到：

- `release/backend`
  - 后端二进制
  - 最小部署 `.env`
  - 数据库迁移文件

- `release/frontend`
  - 前端正式包

- `release/package`
  - 压缩前的组装目录

- `release/*.tar.gz`
  - 最终发布压缩包

### 指定前端 API 地址

```bash
VITE_API_ORIGIN=https://backend-sso.example.com ./build.sh
```

### 远程语言包 CDN 模式

如果语言包需要从 CDN 提供：

```bash
VITE_API_ORIGIN=https://backend-sso.example.com \
LOCALE_CDN_BASE=https://cdn.example.com/assets \
./build.sh
```

这个模式下脚本会：

1. 第一次构建前端，产出语言 chunk
2. 将语言 chunk 复制到 `release/cdn-assets/assets`
3. 生成远程语言映射
4. 第二次构建前端，让语言资源改为从 CDN 地址加载

如果启用这个模式，需要上传：

```text
release/cdn-assets/assets/*
```

到 CDN，并保证公网 URL 与 `LOCALE_CDN_BASE` 一致。

### 可选构建参数

- `TARGET_OS`
- `TARGET_ARCH`
- `APP_NAME`
- `RUN_TESTS`
- `CGO_ENABLED`
- `VERSION`

示例：

```bash
LOCALE_CDN_BASE=https://cdn.example.com/assets \
TARGET_OS=linux \
TARGET_ARCH=amd64 \
RUN_TESTS=1 \
./build.sh
```

## 部署办法

### 推荐部署拓扑

建议生产环境至少区分：

- 一个前端域名
- 一个后端 / OIDC 域名
- 一个可选语言包 CDN 域名

推荐做法：

- Go 服务监听本机或内网地址，例如 `127.0.0.1:5233`
- 使用 Nginx 对外暴露 80 / 443

### 安装前最小 `.env`

首次安装前，后端可使用如下最小配置：

```env
INSTALL_ENABLED=true
INSTALL_ALLOW_REMOTE=true
INSTALL_ALLOWED_DB_HOSTS=127.0.0.1,localhost,::1

HTTP_ADDR=127.0.0.1:5233
PUBLIC_BASE_URL=https://backend-sso.example.com
FRONTEND_BASE_URL=https://frontend-sso.example.com
OIDC_ISSUER=https://backend-sso.example.com
```

安装完成后，系统会自动生成或持久化更多运行设置，包括数据库中的系统设置和 OIDC 密钥相关配置。

### 后端 Nginx 要点

后端反向代理必须正确转发：

- `/`
- `/.well-known/openid-configuration`
- `/.well-known/jwks.json`

不要让通用的 `/.well-known/` 静态规则把 OIDC 标准端点吞掉。

示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:5233;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
}

location = /.well-known/openid-configuration {
    proxy_pass http://127.0.0.1:5233;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
}

location = /.well-known/jwks.json {
    proxy_pass http://127.0.0.1:5233;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
}
```

如果已经用 `/.well-known/` 处理 ACME 证书校验，建议限制为：

```nginx
location ^~ /.well-known/acme-challenge/ {
    root /www/wwwroot/java_node_ssl;
}
```

### 前端 Nginx 要点

由于前端是单页应用，必须配置路由回退到 `index.html`：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

可选静态资源缓存：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$ {
    expires 12h;
    access_log off;
}
```

### CDN 跨域要点

如果启用了远程语言加载，CDN 必须为 `/assets/` 返回 CORS 头。

示例：

```nginx
location ^~ /assets/ {
    add_header Access-Control-Allow-Origin "https://frontend-sso.example.com" always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "*" always;

    expires 12h;
    access_log off;

    if ($request_method = OPTIONS) {
        return 204;
    }

    try_files $uri =404;
}
```

### 部署检查清单

1. 准备后端 `.env`
2. 启动 Go 服务并确认健康检查正常
3. 配置后端 Nginx
4. 执行发布构建
5. 部署前端静态资源
6. 部署后端二进制、`.env` 和 migrations
7. 如果启用了远程语言包，上传 `release/cdn-assets/assets`
8. 打开前端并完成初始化安装
9. 如果安装返回 `reload_required`，重启后端
10. 验证登录、授权、回调、登出和语言加载

### 联调与健康检查命令

```bash
curl -i http://127.0.0.1:5233/healthz
curl -i http://127.0.0.1:5233/api/install/status
curl -i https://backend-sso.example.com/.well-known/openid-configuration
curl -i https://backend-sso.example.com/.well-known/jwks.json
```

## 常见问题

- 前端报 `Unexpected token '<'`
  - 通常说明前端拿到的是 HTML，不是 JSON
  - 检查 `VITE_API_ORIGIN`
  - 检查反向代理配置

- Discovery 或 JWKS 返回 `404`
  - 通常是因为 Nginx 把 `/.well-known/` 当成静态目录处理了

- 远程语言包加载时报 CORS
  - 检查 `/assets/` 是否正确返回跨域头
  - 检查是否被正则静态规则覆盖

- 安装完成后仍然跳回 `/install`
  - 先重启后端
  - 再检查 `/api/install/status`

## 当前项目阶段

这个仓库已经可以运行，并覆盖了 OIDC + OAuth 2.0 的核心闭环，但仍在持续完善中。更适合作为完整、可用的平台基线，而不是已经完全封板的商业成品。

当前已覆盖的核心能力包括：

- OIDC Authorization Code + PKCE 主流程
- 应用审核 gating
- MFA 和授权管理
- 管理后台系统设置
- 发布打包流程

![站点图片](./site-image-bule.webp)

