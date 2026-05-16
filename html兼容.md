可以直接对接，后端不需要额外字段。前端现在把 `messages[].content` 当成“Markdown + 安全 HTML 混合内容”来渲染。

后端只要在返回的消息里这样传：

```json
{
  "id": "assistant_001",
  "role": "assistant",
  "meta": "AI 助手",
  "content": "## 匹配结果\n\n<table><tr><th>技术</th><th>匹配度</th></tr><tr><td>固态电池</td><td>9/10</td></tr></table>\n\n<details><summary>推荐理由</summary><p>该方向与企业需求高度相关。</p></details>"
}
```

前端会在这里渲染：

[ChatPage.tsx](D:/Aprojects/techmatch/fronted/src/pages/ChatPage.tsx:212)

```tsx
<ChatMarkdown className="chat-markdown" content={message.content} />
```

实际渲染逻辑在：

[ChatMarkdown.tsx](D:/Aprojects/techmatch/fronted/src/components/chat/ChatMarkdown.tsx:163)

```tsx
rehypePlugins={[rehypeRaw, [rehypeSanitize, chatHtmlSchema]]}
```

也就是说：

- Markdown 可以正常传：`## 标题`、列表、表格、代码块。
- HTML 可以混在 Markdown 里传：`<table>`、`<details>`、`<mark>`、`<img>` 等。
- 危险内容会被清洗：`<script>`、事件属性如 `onclick`、大部分自定义 `style/class` 不会保留。

推荐后端返回这种格式：

```json
{
  "session": {
    "id": "session_001",
    "messages": [
      {
        "id": "user_001",
        "role": "user",
        "meta": "用户",
        "content": "帮我匹配固态电池相关论文"
      },
      {
        "id": "assistant_001",
        "role": "assistant",
        "meta": "AI 助手",
        "content": "## 推荐结果\n\n<table><tr><th>论文</th><th>匹配度</th></tr><tr><td>Example Paper</td><td>9/10</td></tr></table>"
      }
    ]
  },
  "recommendationPanel": {}
}
```

对接原则：继续使用现有 `content: string` 字段，不用新增 `htmlContent` 或 `contentType`。后端只负责把想展示的 Markdown/HTML 拼成字符串，前端会自动兼容渲染并做安全过滤。