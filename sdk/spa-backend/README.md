# SPA + Backend API 示例

这个目录是接入示例，不可直接作为生产配置使用。

这个示例演示一种更接近真实生产系统的接入方式：

- 前端是独立 SPA
- 后端是独立 API 服务
- 浏览器登录跳转由后端发起
- MySSO 回调到业务后端
- 业务后端完成 `code -> token` 交换
- 业务后端建立自己的登录会话
- SPA 再通过自己的 `/api/me` 获取当前登录用户

## 目录

- `frontend/` 最小 SPA 页面
- `backend/` Node.js Express 示例后端

## 登录链路

1. SPA 打开业务后端 `/auth/login`
2. 业务后端重定向到 `MySSO /oauth2/authorize`
3. 用户在 MySSO 登录并授权
4. MySSO 回调业务后端 `/auth/callback`
5. 业务后端向 MySSO `/oauth2/token` 换 token
6. 业务后端向 MySSO `/oauth2/userinfo` 拉取用户信息
7. 业务后端把用户信息写入自己的 session
8. SPA 调业务后端 `/api/me` 获取当前登录态

这种方式通常比“纯前端自己拿 token”更适合企业业务系统。

## 安全说明

- 必须显式设置 `SESSION_SECRET`，示例不再提供默认弱密钥
- `SESSION_COOKIE_SECURE` 默认是 `true`
- 生产环境必须通过 HTTPS 部署
- 示例代码只演示接入流程，生产使用前请补齐密钥管理、反向代理、错误处理和日志脱敏

如果你只是在本地通过纯 HTTP 调试，可以临时设置：

```bash
SESSION_COOKIE_SECURE=false
```
