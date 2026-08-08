# MotionForge — AI Image to Video

A polished Next.js image-to-video studio with direct image upload, motion prompts, duration/aspect controls, and a provider-neutral generation API.

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4
- Lucide icons
- Next.js Route Handler for `/api/generate`

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Connect a video provider

The app intentionally keeps the video model behind a small API adapter. Set these values in `.env.local`:

```env
VIDEO_PROVIDER_URL=your-provider-endpoint
VIDEO_PROVIDER_API_KEY=your-secret-key
```

The endpoint receives a multipart request containing `image`, `prompt`, `duration`, `aspectRatio`, and `motion`, and the API response is returned to the browser.

Because image-to-video providers use different input/output schemas and model versions, the adapter is provider-neutral instead of hard-coding an unstable model endpoint.

## Production checklist

- Add authentication and per-user rate limits.
- Store generated videos in object storage instead of returning large files through the app server.
- Add a background job/queue for long-running generations.
- Add provider-specific polling/webhook handling.
- Validate output URLs before exposing download buttons.
- Keep API keys server-side only.
