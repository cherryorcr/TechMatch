# TechMatch 后端接口文档

本文档描述当前前端联调所需的后端接口契约。前端已切换为“后端为正式数据源”模式，聊天会话、历史记录、推荐面板均依赖以下接口。

## 1. 基本约定

- 聊天处理接口：`/process`
- 本地开发代理默认转发到：`http://localhost:8080`
- 接口内容类型：`application/json`
- 时间字段统一使用毫秒级时间戳 `number`
- 字段命名统一使用 `camelCase`
- 除 `GET /api/chat/sessions` 外，其余会话详情接口都必须返回完整的 `session + recommendationPanel`

### 1.1 `/process` 适配说明

当前前端聊天处理已调用后端 process 能力，默认先请求 `POST /api/process`，如果返回 `404/405` 会自动重试 `POST /paper-api/process`。如果后端网关直接开放根路径 `/process`，可通过 `VITE_PROCESS_API_BASE_URL=""` 切回。前端不为 Mode 3 / Mode 4 新建 `/mode3` 或 `/mode4` 接口，会把页面会话结构保存在本地，并将每轮用户输入发送给 process 接口：

```json
{
  "mode": 3,
  "session_id": "process-mode-3-xxx",
  "message": "用户本轮输入",
  "requirement": "首轮需求",
  "subject": "engineer",
  "top-k": 10,
  "cot": false,
  "if_topk": true
}
```

模式映射：

- `internal-industry` -> `mode: 0`
- `external-expert` -> `mode: 1`
- `academic` -> `mode: 2`
- `deep-search` -> `mode: 3`
- `tech-recommendation` -> `mode: 4`

前端展示优先使用 `data.final_output`。Mode 4 会保留同一个 `session_id` 继续多轮请求，并根据 `data.stage === "chatting"` 或 `"completed"` 更新侧栏状态。HTTP `207` 会按可解析响应处理，不作为网络错误直接中断。

## 2. 枚举与对象模型

### 2.1 `HomeModeId`

```ts
type HomeModeId =
  | 'internal-industry'
  | 'external-expert'
  | 'academic'
  | 'deep-search'
  | 'tech-recommendation';
```

含义：

- `internal-industry`：内部产业用户模式
- `external-expert`：外部专家用户模式
- `academic`：高校科研机构模式
- `deep-search`：Mode 3 深度搜索，流程为“需求 -> 论文总结”
- `tech-recommendation`：Mode 4 技术推荐，流程为“需求追问 -> 技术方案”

### 2.2 `MatchOptions`

```json
{
  "paperCount": 5,
  "showReasoning": false
}
```

字段说明：

- `paperCount`: number，匹配论文数量
- `showReasoning`: boolean，是否展示思考过程

### 2.3 `ChatMessage`

```json
{
  "id": "msg-001",
  "role": "user",
  "content": "我们希望围绕固态电池产业化需求匹配相关论文和专利",
  "meta": "内部产业用户模式",
  "attachments": [
    {
      "id": "file-001",
      "name": "技术需求说明.pdf",
      "size": 245760,
      "mimeType": "application/pdf",
      "uploadedAt": 1713772790000
    }
  ],
  "reasoning": "可选，仅 assistant 消息在需要时返回"
}
```

字段说明：

- `id`: string，消息 ID
- `role`: `"user"` 或 `"assistant"`
- `content`: string，消息正文
- `meta`: string，消息来源说明
- `attachments`: `UploadedFile[]`，可选，消息关联文件
- `reasoning`: string，可选，思考过程

### 2.4 `UploadedFile`

```json
{
  "id": "file-001",
  "name": "技术需求说明.pdf",
  "size": 245760,
  "mimeType": "application/pdf",
  "uploadedAt": 1713772790000
}
```

字段说明：

- `id`: string，文件 ID
- `name`: string，原始文件名
- `size`: number，文件大小，单位 byte
- `mimeType`: string，文件 MIME 类型
- `uploadedAt`: number，上传时间，毫秒级时间戳

### 2.5 `ChatSession`

```json
{
  "id": "chat-001",
  "title": "固态电池产业化需求",
  "modeId": "internal-industry",
  "modeLabel": "内部产业用户模式",
  "options": {
    "paperCount": 5,
    "showReasoning": false
  },
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "我们希望围绕固态电池产业化需求匹配相关论文和专利",
      "meta": "内部产业用户模式"
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "已收到初始需求，我先确认三个关键条件。",
      "meta": "TechMatch AI",
      "reasoning": "当前优先澄清应用场景、筛选条件和目标输出。"
    }
  ],
  "createdAt": 1713772800000,
  "updatedAt": 1713772815000
}
```

字段说明：

- `id`: string，会话 ID
- `title`: string，会话标题
- `modeId`: `HomeModeId`
- `modeLabel`: string，模式展示名称
- `options`: `MatchOptions`
- `messages`: `ChatMessage[]`
- `createdAt`: number，会话创建时间
- `updatedAt`: number，会话更新时间

### 2.6 `ChatSessionSummary`

用于历史列表、首页最近会话、左侧边栏最近会话。

```json
{
  "id": "chat-001",
  "modeId": "internal-industry",
  "modeLabel": "内部产业用户模式",
  "title": "固态电池产业化需求",
  "latestMessage": "已进入匹配阶段",
  "updatedAt": 1713772815000,
  "options": {
    "paperCount": 5,
    "showReasoning": false
  }
}
```

### 2.7 `ContextualRecommendationState`

```json
{
  "stage": "clarifying",
  "heading": "已提取的对话线索",
  "summary": "已识别出固态电池、专利转化等方向。",
  "signals": ["固态电池", "专利转化"],
  "nextQuestions": [
    "更关注论文、专利，还是两者联合筛选？",
    "是否有限定行业、年份或成熟度？"
  ],
  "recommendations": {
    "scholars": [],
    "papers": [],
    "institutions": [],
    "directions": ["固态电池", "先进材料"]
  }
}
```

字段说明：

- `stage`: `"clarifying"` 或 `"matching"`
- `heading`: string，侧栏标题
- `summary`: string，摘要说明
- `signals`: string[]，当前识别出的方向标签
- `nextQuestions`: string[]，建议用户继续补充的问题
- `recommendations`: 对象，必须始终返回，结构如下：

```json
{
  "scholars": [
    {
      "id": "scholar-001",
      "title": "周某 教授",
      "meta": "固态电池与界面工程 | 某先进储能团队",
      "detail": "适合对接储能材料与工程化验证需求。",
      "keywords": ["固态电池", "先进材料"]
    }
  ],
  "papers": [
    {
      "id": "paper-001",
      "title": "Solid-State Interface Engineering for Scalable Energy Systems",
      "meta": "Advanced Energy Systems, 2025",
      "detail": "适合储能方向的工程化成熟度判断。",
      "keywords": ["固态电池"]
    }
  ],
  "institutions": [
    {
      "id": "inst-001",
      "title": "上海先进储能研究院",
      "meta": "优势：储能材料中试平台",
      "detail": "适合技术试配与验证。",
      "keywords": ["固态电池"]
    }
  ],
  "directions": ["固态电池", "先进材料"]
}
```

注意：

- `recommendations` 内的四个字段必须都返回
- 即使当前没有推荐结果，也要返回空数组

## 3. 接口列表

### 3.1 获取会话摘要列表

- 方法：`GET`
- 路径：`/api/chat/sessions`
- 用途：
  - 历史会话页
  - 首页最近会话
  - 左侧边栏最近会话

#### 成功响应

```json
{
  "sessions": [
    {
      "id": "chat-001",
      "modeId": "internal-industry",
      "modeLabel": "内部产业用户模式",
      "title": "固态电池产业化需求",
      "latestMessage": "已进入匹配阶段",
      "updatedAt": 1713772815000,
      "options": {
        "paperCount": 5,
        "showReasoning": false
      }
    }
  ]
}
```

#### 说明

- 这里返回摘要列表，不返回完整 `messages`
- 建议按 `updatedAt` 倒序返回

### 3.2 创建会话

- 方法：`POST`
- 路径：`/api/chat/sessions`
- 用途：
  - 首页发起新的多轮会话

#### 请求体

```json
{
  "modeId": "internal-industry",
  "options": {
    "paperCount": 5,
    "showReasoning": false
  },
  "prompt": "我们希望围绕固态电池产业化需求匹配相关论文和专利",
  "fileIds": ["file-001"]
}
```

#### 成功响应

```json
{
  "session": {
    "id": "chat-001",
    "title": "固态电池产业化需求",
    "modeId": "internal-industry",
    "modeLabel": "内部产业用户模式",
    "options": {
      "paperCount": 5,
      "showReasoning": false
    },
    "messages": [
      {
        "id": "msg-001",
        "role": "user",
        "content": "我们希望围绕固态电池产业化需求匹配相关论文和专利",
        "meta": "内部产业用户模式"
      },
      {
        "id": "msg-002",
        "role": "assistant",
        "content": "已收到初始需求，我先确认三个关键条件。",
        "meta": "TechMatch AI"
      }
    ],
    "createdAt": 1713772800000,
    "updatedAt": 1713772815000
  },
  "recommendationPanel": {
    "stage": "clarifying",
    "heading": "已提取的对话线索",
    "summary": "已识别出固态电池、专利转化等方向。",
    "signals": ["固态电池", "专利转化"],
    "nextQuestions": ["更关注论文、专利，还是两者联合筛选？"],
    "recommendations": {
      "scholars": [],
      "papers": [],
      "institutions": [],
      "directions": ["固态电池", "先进材料"]
    }
  }
}
```

#### 说明

- 必须同步返回首轮 assistant 消息
- 必须同步返回完整 `recommendationPanel`
- `fileIds` 可选；若传入，后端应将文件作为本轮用户消息附件上下文，并可在 `session.messages[].attachments` 中返回对应文件元信息

### 3.3 获取会话详情

- 方法：`GET`
- 路径：`/api/chat/sessions/:sessionId`
- 用途：
  - 进入聊天页
  - 刷新聊天页
  - 根据会话 ID 恢复完整聊天内容

#### 路径参数

- `sessionId`: string，会话 ID

#### 成功响应

```json
{
  "session": {
    "id": "chat-001",
    "title": "固态电池产业化需求",
    "modeId": "internal-industry",
    "modeLabel": "内部产业用户模式",
    "options": {
      "paperCount": 5,
      "showReasoning": false
    },
    "messages": [
      {
        "id": "msg-001",
        "role": "user",
        "content": "我们希望围绕固态电池产业化需求匹配相关论文和专利",
        "meta": "内部产业用户模式"
      },
      {
        "id": "msg-002",
        "role": "assistant",
        "content": "已收到初始需求，我先确认三个关键条件。",
        "meta": "TechMatch AI"
      }
    ],
    "createdAt": 1713772800000,
    "updatedAt": 1713772815000
  },
  "recommendationPanel": {
    "stage": "clarifying",
    "heading": "已提取的对话线索",
    "summary": "已识别出固态电池、专利转化等方向。",
    "signals": ["固态电池", "专利转化"],
    "nextQuestions": ["更关注论文、专利，还是两者联合筛选？"],
    "recommendations": {
      "scholars": [],
      "papers": [],
      "institutions": [],
      "directions": ["固态电池", "先进材料"]
    }
  }
}
```

### 3.4 追加消息

- 方法：`POST`
- 路径：`/api/chat/sessions/:sessionId/messages`
- 用途：
  - 聊天页继续多轮追问

#### 路径参数

- `sessionId`: string，会话 ID

#### 请求体

```json
{
  "prompt": "优先看近三年的论文，最好有可转化专利",
  "fileIds": ["file-002"]
}
```

#### 成功响应

```json
{
  "session": {
    "id": "chat-001",
    "title": "固态电池产业化需求",
    "modeId": "internal-industry",
    "modeLabel": "内部产业用户模式",
    "options": {
      "paperCount": 5,
      "showReasoning": false
    },
    "messages": [
      {
        "id": "msg-001",
        "role": "user",
        "content": "我们希望围绕固态电池产业化需求匹配相关论文和专利",
        "meta": "内部产业用户模式"
      },
      {
        "id": "msg-002",
        "role": "assistant",
        "content": "已收到初始需求，我先确认三个关键条件。",
        "meta": "TechMatch AI"
      },
      {
        "id": "msg-003",
        "role": "user",
        "content": "优先看近三年的论文，最好有可转化专利",
        "meta": "内部产业用户模式"
      },
      {
        "id": "msg-004",
        "role": "assistant",
        "content": "已根据新增条件收窄筛选范围，下一步建议确认成熟度和目标输出。",
        "meta": "TechMatch AI",
        "reasoning": "优先结合年份、专利转化和目标输出进行筛选。"
      }
    ],
    "createdAt": 1713772800000,
    "updatedAt": 1713772900000
  },
  "recommendationPanel": {
    "stage": "matching",
    "heading": "基于当前对话生成的匹配推荐",
    "summary": "已根据新增限制更新推荐方向。",
    "signals": ["固态电池", "专利转化", "近三年"],
    "nextQuestions": [],
    "recommendations": {
      "scholars": [],
      "papers": [],
      "institutions": [],
      "directions": ["固态电池", "专利转化"]
    }
  }
}
```

#### 说明

- 返回值必须是更新后的完整会话，而不是只返回新增消息
- 返回值必须是更新后的完整推荐面板，而不是增量 patch
- `fileIds` 可选；若传入，后端应将文件作为本轮用户消息附件上下文，并可在 `session.messages[].attachments` 中返回对应文件元信息

### 3.5 上传文件

- 方法：`POST`
- 路径：`/api/files`
- 用途：
  - 首页创建会话前上传附件
  - 聊天页发送追问前上传附件
  - 文件工作区独立上传文件

#### 请求

请求类型：`multipart/form-data`

字段：

- `files`: File，可重复字段，支持一次上传多个文件

#### 成功响应

```json
{
  "files": [
    {
      "id": "file-001",
      "name": "技术需求说明.pdf",
      "size": 245760,
      "mimeType": "application/pdf",
      "uploadedAt": 1713772790000
    }
  ]
}
```

### 3.6 下载文件

- 方法：`GET`
- 路径：`/api/files/:fileId/download`
- 用途：
  - 聊天消息附件下载
  - 文件工作区下载

#### 路径参数

- `fileId`: string，文件 ID

#### 成功响应

- 返回文件流
- 建议设置 `Content-Type`
- 建议设置 `Content-Disposition: attachment; filename="原始文件名"`

## 4. 错误响应约定

建议统一错误格式：

```json
{
  "message": "会话不存在"
}
```

推荐状态码：

- `400 Bad Request`：请求参数错误
- `404 Not Found`：会话不存在
- `500 Internal Server Error`：服务内部错误

前端当前依赖的行为：

- `404` 时会将会话视为不存在
- 其他错误会展示 `message`
- 若无 `message`，前端会按状态码使用默认提示

## 5. 联调检查清单

后端联调时请确认：

- `GET /api/chat/sessions` 可返回摘要列表
- `POST /api/chat/sessions` 可返回完整 `session + recommendationPanel`
- `GET /api/chat/sessions/:sessionId` 刷新后仍能恢复完整聊天内容
- `POST /api/chat/sessions/:sessionId/messages` 会返回更新后的完整会话
- `POST /api/files` 可接收 `files` 字段并返回文件元信息
- `GET /api/files/:fileId/download` 可返回对应文件流
- 创建会话和追加消息接口可接收可选 `fileIds`
- 消息关联文件时可在 `messages[].attachments` 返回文件元信息
- 所有 `recommendationPanel` 响应都包含 `scholars/papers/institutions/directions`
- 所有时间字段为毫秒级时间戳
- 返回 JSON 时 `Content-Type` 为 `application/json`

## 6. 前端对应代码位置

如果后端需要对照前端实现，可查看：

- 请求封装：[src/api/chatApi.ts](/d:/Aprojects/techmatch/fronted/src/api/chatApi.ts:1)
- 类型定义：[src/types/chat.ts](/d:/Aprojects/techmatch/fronted/src/types/chat.ts:1)
- 会话数据流：[src/context/ChatSessionsContext.tsx](/d:/Aprojects/techmatch/fronted/src/context/ChatSessionsContext.tsx:1)
- 首页创建会话：[src/pages/HomePage.tsx](/d:/Aprojects/techmatch/fronted/src/pages/HomePage.tsx:1)
- 聊天页读取/追问：[src/pages/ChatPage.tsx](/d:/Aprojects/techmatch/fronted/src/pages/ChatPage.tsx:1)
- 历史页和侧边栏摘要列表：[src/pages/HistoryPage.tsx](/d:/Aprojects/techmatch/fronted/src/pages/HistoryPage.tsx:1)、[src/components/Sidebar.tsx](/d:/Aprojects/techmatch/fronted/src/components/Sidebar.tsx:1)
