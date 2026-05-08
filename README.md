# Mood Room MVP

一个面向无聊、孤独、疲惫时刻的 mood-based AI entertainment Web MVP。

产品承诺：

> Open this when you are bored, lonely, or tired, but do not want to scroll short videos or force yourself to socialize.

它不是学习 app，不是效率工具，不是聊天机器人，不是短视频流，也不是社交网络。

## 功能概览

### Home

首页只有一个选择问题：

> What kind of boredom is this?

用户从三个大卡片进入对应模式：

- Make the room less quiet
- Give me a tiny strange story
- Give me something stupid to do

### Room

被动陪伴模式。

- 两个虚构角色自然聊天，用户只是旁听者
- 没有输入框
- 没有 chatbot 行为
- 支持多组角色：Kai/Mina、Jules/Nori、Ada/Sol
- 支持 `Quieter` / `Weirder`，通过本地话题标签挑选不同语气的内容
- 对话逐句出现，支持 `Pause / Resume`
- 支持轻微环境底声 `Sound on / Sound off`
- 支持切换角色组 `New pair`

### Tiny Story

短小荒诞互动故事。

- 每个故事 1-3 分钟
- 每一步只有 2-3 个简单选择
- 语气偏 playful、strange、low-pressure
- 支持 `New story`
- 默认使用本地故事数据，可选接入生成内容

### Stupid Mission

纯娱乐的现实世界小任务。

- 没有 streak
- 没有积分
- 没有生产力目标
- 支持 `Done` / `Skip` / `Make it weirder`
- 默认使用本地任务数据，可选接入生成内容

## 当前不做什么

这个 MVP 刻意不包含：

- 聊天输入框
- 无限 feed
- 点赞、评论、分享
- 用户主页
- 账号系统
- 支付系统
- 打卡、积分、等级、成长体系
- 复杂 onboarding

核心体验应该像一个安静的开关，而不是一个平台。

## 技术栈

- React
- TypeScript
- Tailwind CSS
- Vite
- 本地 mock data
- 可选 Vite dev middleware 生成接口：`/api/generate`

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:5173/
```

## 构建

```bash
npm run build
```

预览生产构建：

```bash
npm run preview
```

## 可选 AI 生成

默认情况下，app 完全依赖本地数据运行，不需要任何 API key。

如果要在本地开发时尝试真实生成：

```bash
cp .env.example .env
```

然后填写：

```bash
DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_MODEL=deepseek-chat
VITE_USE_AI_GENERATION=true
```

说明：

- 浏览器不会拿到 `DEEPSEEK_API_KEY`
- API key 只在本地 Vite middleware 中读取
- 前端只请求本地 `/api/generate`
- 生成失败、未配置 key、返回格式不合格时，自动 fallback 到本地 mock data
- 当前实现请求 `https://api.deepseek.com/chat/completions`，使用 `response_format: { type: "json_object" }`，依赖前端 schema 校验丢弃异常输出
- 默认模型 `deepseek-chat`，可改成 `deepseek-reasoner`（更慢更贵，对 playful 内容容易过度思考，不推荐）
- 可选 `DEEPSEEK_BASE_URL` 环境变量用来指向兼容 OpenAI 协议的代理或自托管端点

## 项目结构

```text
.
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── components
    │   ├── Home.tsx
    │   ├── ModeCard.tsx
    │   ├── RoomMode.tsx
    │   ├── TinyStoryMode.tsx
    │   ├── MissionMode.tsx
    │   ├── ConversationBubble.tsx
    │   ├── PrimaryButton.tsx
    │   └── SecondaryButton.tsx
    ├── data
    │   ├── characters.ts
    │   ├── roomConversations.ts
    │   ├── tinyStories.ts
    │   └── stupidMissions.ts
    ├── hooks
    │   └── useAmbientSound.ts
    ├── services
    │   └── generationClient.ts
    └── utils
        └── random.ts
```

## 内容数据

本地内容集中在 `src/data`：

- `characters.ts`：角色组和关系设定
- `roomConversations.ts`：Room 模式对话和标签
- `tinyStories.ts`：微故事和分支选择
- `stupidMissions.ts`：现实世界小任务

Room topic 使用标签区分语气：

- `quiet`
- `weird`
- `cozy`
- `domestic`
- `night`
- `rain`
- `object-drama`
- `absurd`

## 写作规则

内容应该遵守这些原则：

- 角色不说 “as an AI”
- 不做心理治疗
- 不讲人生道理
- 不像 podcast 主持人
- Room 模式不直接要求用户参与
- 语气像在旁边听到两个放松的人闲聊
- 温暖、日常、稍微好笑、低压力
- 奇怪但不幼稚

## 部署说明

纯静态部署可以直接使用本地 mock 内容。

如果线上也要启用 AI 生成，需要把当前 Vite dev middleware 中的 `/api/generate` 迁移到真实后端或 serverless function。不要在前端暴露任何模型供应商的 API key。

## Scripts

```bash
npm run dev      # 启动本地开发服务
npm run build    # TypeScript 检查 + Vite 构建
npm run preview  # 预览生产构建
```
