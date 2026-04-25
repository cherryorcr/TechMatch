# TechMatch

TechMatch 是一个科研成果智能匹配前端原型，当前前端位于 `fronted` 目录。页面已接入后端会话接口，并新增文件上传、聊天附件和文件下载能力。

## 环境要求

- Git
- Node.js 18+
- npm

检查版本：

```bash
git --version
node -v
npm -v
```

## 拉取代码

首次获取项目：

```bash
git clone https://github.com/cherryorcr/TechMatch
cd techmatch
```

已有本地仓库时更新主分支：

```bash
git pull origin main
```

## 启动前端

```bash
cd fronted
npm install
npm run dev
```

启动成功后，终端会显示类似地址：

```text
Local: http://localhost:5173/
```

浏览器打开该地址即可访问。若 `5173` 被占用，Vite 会自动切换到其他端口。

## 环境变量

前端默认请求 `/api`。本地开发时 Vite 会把 `/api` 代理到后端服务。

可选环境变量：

```bash
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:8080
```

如果后端不在 `http://localhost:8080`，请设置 `VITE_API_PROXY_TARGET`。

## 文件上传与下载

前端使用以下默认接口契约：

- `POST /api/files`
  - 请求类型：`multipart/form-data`
  - 文件字段名：`files`
  - 响应：`{ "files": [{ "id", "name", "size", "mimeType", "uploadedAt" }] }`
- `GET /api/files/:fileId/download`
  - 响应文件流
  - 建议后端返回 `Content-Disposition` 以保留文件名

聊天流程中的附件会先上传到 `/api/files`，再把返回的 `fileIds` 随创建会话或追加消息请求提交给后端。

## 常用命令

开发模式：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 排查建议

开发服务启动失败时：

```bash
npm install
npm cache clean --force
npm install
npm run dev
```

拉取新代码后页面异常时：

```bash
git pull origin main
cd fronted
npm install
npm run dev
```

提交前建议执行：

```bash
cd fronted
npm run build
```
