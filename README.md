# nest-scramble — live demo app

A small NestJS API (auth, users, products with file upload, a Socket.IO gateway
and a GraphQL resolver) documented by [nest-scramble](https://github.com/Eng-MMustafa/nest-scramble)
with **zero decorators**.

- **Browse the generated docs (static export):** https://eng-mmustafa.github.io/nest-scramble-demo/
- **Hosted API + live console:** deploy in one click →

  [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Eng-MMustafa/nest-scramble-demo)

  After the first deploy, set `PUBLIC_URL` to the URL Render gives you and redeploy;
  `/api/docs` then serves the full console with "Try it", WebSocket and GraphQL against the hosted API.

## Run locally

```bash
npm install
npm start                    # http://localhost:3000/api/docs
```

Log in with any credentials at `POST /api/auth/login` — the console captures the
returned token and every protected route just works.

## Regenerate the static docs

```bash
npx nest-scramble export src -o docs --baseUrl https://nest-scramble-demo.onrender.com
```

See [DEPLOY.md](DEPLOY.md) for details.
