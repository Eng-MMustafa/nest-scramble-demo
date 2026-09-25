# Deploying the live demo

This app is the public demo for [nest-scramble](https://github.com/Eng-MMustafa/nest-scramble):
REST (auth, CRUD, upload), a Socket.IO gateway and a GraphQL resolver, documented
at `/api/docs` with zero decorators.

## Render (free tier, ~5 minutes)

1. Push this folder to a GitHub repo (e.g. `nest-scramble-demo`).
2. Render dashboard → **New** → **Blueprint** → select the repo → **Apply**.
   `render.yaml` builds the `Dockerfile` and exposes port 3000.
3. Once the first deploy is live, copy the service URL
   (`https://nest-scramble-demo.onrender.com`) into the `PUBLIC_URL` env var
   and redeploy. This makes "Try it", WebSocket and GraphQL calls target the
   hosted API rather than `localhost`.
4. Demo URL to put in the README / posts: `https://<service>.onrender.com/api/docs`

Free instances sleep after 15 minutes idle; the first request takes ~30s.

## Any Docker host (Fly.io, Railway, a VPS)

```bash
docker build -t nest-scramble-demo .
docker run -p 3000:3000 -e PUBLIC_URL=https://your.domain nest-scramble-demo
```

## Notes

- Locally the project links `nest-scramble` from `../backend-nestjs/nest-scramble`.
  The Dockerfile swaps that for the published npm package.
- `PORT` is honoured (`app.listen(process.env.PORT || 3000)`), CORS is enabled,
  and the docs base URL follows `PUBLIC_URL`.
- The login endpoint returns a demo token that unlocks the protected routes —
  the docs console captures it automatically.
