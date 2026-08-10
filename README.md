# EatWhat · 今晚吃什么

一个给两个人使用的家庭厨房点单系统：共享菜谱、图片上传、点菜留言、自动合并购物清单、烹饪 SOP、库存与保质期、预算和营养统计。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

没有配置数据库时，页面仍可预览，但不会跨设备保存，也不能上传图片。配置 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY` 后，`/api/state` 会通过 Supabase 保存共享家庭状态；菜谱图片会上传到公开的 `dish-images` Storage bucket（首次上传时自动创建）。`SUPABASE_SECRET_KEY` 仅供服务端 API 使用，不要添加 `NEXT_PUBLIC_` 前缀。

AI 批量生成菜谱使用 DeepSeek API。配置服务端环境变量 `DEEPSEEK_API_KEY` 后，菜单页的“AI 批量生成”会先生成可检查的菜谱草稿，确认后才写入共享状态。模型默认使用 `deepseek-v4-flash`，可通过 `DEEPSEEK_MODEL` 调整；密钥同样不能添加 `NEXT_PUBLIC_` 前缀或提交到仓库。

## Supabase 初始化

在 Supabase SQL Editor 中执行：

```sql
create table if not exists public.kitchen_state (
  id integer primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
```

菜谱、留言、操作动态和买菜进度会保存在同一份家庭状态中。两台设备打开页面后，每 5 秒拉取一次对方的最新修改；当前操作人可在右上角切换。

## 部署到 Vercel

1. 在 Vercel 导入 GitHub 仓库。
2. 在项目的 Marketplace 中添加 Supabase，并按上面的 SQL 创建 `kitchen_state` 表。
3. 确认 Supabase 自动注入了 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY`。
4. 重新部署 Production。

项目使用标准 Next.js App Router，无需自定义 Build Command。
