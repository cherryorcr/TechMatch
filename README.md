# TechMatch

前端项目启动说明（从 Git 拉取后）

## 1. 环境准备

请先安装以下工具：

- Git
- Node.js 18+（建议使用 LTS 版本）
- npm（随 Node.js 一起安装）

安装完成后，可在终端检查版本：

```bash
git --version
node -v
npm -v
```

## 2. 从 Git 拉取代码

如果你是首次获取项目：

```bash
git clone <你的仓库地址>
cd techmatch
```

如果你本地已有仓库，更新到最新代码：

```bash
git pull origin main
```

## 3. 进入前端目录

本项目的前端代码在 `fronted` 目录：

```bash
cd fronted
```

## 4. 安装依赖

首次运行或依赖变化后，需要安装依赖：

```bash
npm install
```

## 5. 启动开发服务器

```bash
npm run dev
```

启动成功后终端会输出类似内容：

```text
VITE v7.x.x ready
Local: http://localhost:5173/
```

在浏览器打开终端显示的 `Local` 地址即可。

说明：如果 5173 端口被占用，Vite 会自动切到 5174、5175 等端口。

## 6. 常用命令

开发模式（热更新）：

```bash
npm run dev
```

构建生产包：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 7. 常见问题排查

### 7.1 `npm run dev` 启动失败

按顺序尝试：

```bash
# 1) 重新安装依赖
npm install

# 2) 清理缓存后再装
npm cache clean --force
npm install
```

### 7.2 依赖或缓存异常（可选）

删除依赖和缓存后重装：

```bash
# 在 fronted 目录执行
rm -rf node_modules .vite
npm install
npm run dev
```

Windows PowerShell 可使用：

```powershell
Remove-Item -Recurse -Force node_modules, .vite
npm install
npm run dev
```

### 7.3 拉取代码后页面异常

拉取新代码后建议执行：

```bash
git pull origin main
cd fronted
npm install
npm run dev
```

## 8. 推荐日常流程

每次开始开发：

```bash
cd techmatch
git pull origin main
cd fronted
npm install
npm run dev
```

每次提交前：

```bash
cd fronted
npm run build
```

如果构建通过，再进行 `git add` / `git commit` / `git push`。