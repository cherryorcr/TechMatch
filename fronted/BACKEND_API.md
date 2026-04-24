# TechMatch 后端接口文档

本文档描述当前前端联调所需的后端接口契约。前端已切换为“后端为正式数据源”模式，聊天会话、历史记录、推荐面板均依赖以下接口。

## 1. 基本约定

- 前端默认请求前缀：`/api`
- 本地开发代理默认转发到：`http://localhost:8080`
- 接口内容类型：`application/json`
- 时间字段统一使用毫秒级时间戳 `number`
- 字段命名统一使用 `camelCase`
- 除 `GET /api/chat/sessions` 外，其余会话详情接口都必须返回完整的 `session + recommendationPanel`

## 2. 枚举与对象模型

### 2.1 `HomeModeId`

```ts
type HomeModeId = 'internal-industry' | 'external-expert' | 'academic';
```

含义：

- `internal-industry`：内部产业用户模式
- `external-expert`：外部专家用户模式
- `academic`：高校科研机构模式

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
  "reasoning": "可选，仅 assistant 消息在需要时返回"
}
```

字段说明：

- `id`: string，消息 ID
- `role`: `"user"` 或 `"assistant"`
- `content`: string，消息正文
- `meta`: string，消息来源说明
- `reasoning`: string，可选，思考过程

### 2.4 `ChatSession`

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

### 2.5 `ChatSessionSummary`

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

### 2.6 `ContextualRecommendationState`

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
  "prompt": "我们希望围绕固态电池产业化需求匹配相关论文和专利"
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
  "prompt": "优先看近三年的论文，最好有可转化专利"
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
