# EatWhat · 今晚吃什么

一个给两个人使用的家庭厨房点单系统：点菜、想吃清单、自动合并购物清单、烹饪 SOP、库存与保质期、预算和营养统计。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

没有配置数据库时，页面仍可预览，但不会跨设备保存。配置 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY` 后，`/api/state` 会通过 Supabase 保存共享家庭状态。`SUPABASE_SECRET_KEY` 仅供服务端 API 使用，不要添加 `NEXT_PUBLIC_` 前缀。

## 部署到 Vercel

1. 在 Vercel 导入 GitHub 仓库。
2. 在项目的 Marketplace 中添加 Supabase，并在 Supabase SQL Editor 中创建 `kitchen_state` 表。
3. 确认 Supabase 自动注入了 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY`。
4. 重新部署 Production。

项目使用标准 Next.js App Router，无需自定义 Build Command。
