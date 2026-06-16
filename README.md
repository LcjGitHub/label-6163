# 独立游戏 Demo 试玩清单

记录独立游戏 Demo 的试玩状态与简短评价。前后端分离 MVP，含游戏列表（状态 Badge）与笔记编辑页。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Svelte 5、Flowbite-Svelte、@tanstack/svelte-query、axios（端口 **5101**） |
| 后端 | Express、SQLite `./data/demos.db`（端口 **5000**） |

## 快速启动

需要 Node.js **22.5+**（使用内置 `node:sqlite`，无需编译原生模块）。依赖均在项目目录内安装，无需全局 pnpm/yarn。

### 1. 启动后端（一条命令）

```bash
cd backend
npm install
npm start
```

服务地址：`http://localhost:5000`  
首次启动会自动创建数据库并写入 **5 条** seed 数据。

### 2. 启动前端

新开一个终端：

```bash
cd frontend
npm install
npm run dev
```

浏览器访问：`http://localhost:5101`

## 功能范围（MVP）

- **游戏列表**：展示游戏名、作者、试玩状态 Badge、简短评价
- **笔记编辑页**：新增 / 编辑 / 删除游戏记录
- **字段**：游戏名、作者、平台链接、试玩状态、简短评价
- **试玩状态**：未开始、试玩中、已完成、搁置

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/games` | 获取全部游戏 |
| GET | `/api/games/:id` | 获取单个游戏 |
| POST | `/api/games` | 新增游戏 |
| PUT | `/api/games/:id` | 更新游戏 |
| DELETE | `/api/games/:id` | 删除游戏 |
| GET | `/api/games/statuses` | 试玩状态选项 |

## 目录结构

```
├── backend/          # Express + SQLite API
│   ├── data/         # demos.db（运行时生成）
│   └── src/
├── frontend/         # SvelteKit 前端
│   └── src/
└── README.md
```

## 未包含（按需求排除）

登录 / JWT、Redis、Docker、MySQL / PostgreSQL
