# MySSO SDK Examples

这个目录放的是“其他系统如何接入 MySSO”的示例代码，重点演示标准 OIDC/OAuth2 授权码模式。

## 当前推荐接入方式

1. 在 MySSO 开发者后台创建应用
2. 配置好 `client_id`、`client_secret`、`redirect_uri`
3. 管理员审核应用通过
4. 第三方系统把用户浏览器重定向到：

```text
GET {MyssoBase}/oauth2/authorize
```

常用参数：

- `client_id`
- `redirect_uri`
- `response_type=code`
- `scope=openid profile email`
- `state`
- `nonce`
- `code_challenge`
- `code_challenge_method=S256`

5. 回调页收到 `code` 后，第三方系统后端向：

```text
POST {MyssoBase}/oauth2/token
```

提交表单参数：

- `grant_type=authorization_code`
- `client_id`
- `client_secret`
- `code`
- `redirect_uri`
- `code_verifier`

6. 获取：

- `access_token`
- `id_token`
- `refresh_token`

7. 可选再调用：

- `GET /.well-known/openid-configuration`
- `GET /.well-known/jwks.json`
- `GET /oauth2/userinfo`

## 示例列表

- `node-express/` Node.js + Express
- `python-flask/` Python + Flask
- `php/` PHP 原生示例
- `java-springboot/` Java + Spring Boot
- `spa-backend/` 前后端分离 SPA + 后端 API 示例

这些示例都偏“最小可运行思路”，方便你给不同技术栈的业务方对接参考。
