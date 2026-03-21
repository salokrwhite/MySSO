# Flask SDK 示例

这个目录是最小接入示例，只用于本地联调和学习接入流程，不能直接作为生产配置使用。

## 安全说明

- 必须显式设置 `FLASK_SECRET_KEY`，示例不再提供默认弱密钥
- `FLASK_DEBUG` 默认关闭
- `SESSION_COOKIE_SECURE` 默认是 `true`

如果你在本地通过纯 HTTP 调试，需要手动设置：

```bash
SESSION_COOKIE_SECURE=false
```

生产环境请至少保证：

- 使用高强度随机 `FLASK_SECRET_KEY`
- 通过 HTTPS 部署
- 保持 `SESSION_COOKIE_SECURE=true`
- 不要开启 `FLASK_DEBUG`
