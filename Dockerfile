# Live demo image for nest-scramble (NestJS + REST + WebSocket + GraphQL).
# Build:  docker build -t nest-scramble-demo .
# Run:    docker run -p 3000:3000 -e PUBLIC_URL=http://localhost:3000 nest-scramble-demo
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json tsconfig.json ./
# Locally nest-scramble is linked from a sibling folder (file:..). In the
# container install the published package instead.
RUN node -e "const p=require('./package.json'); p.dependencies['nest-scramble']='^5.7.0'; delete p.devDependencies.playwright; require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2));" \
 && npm install --ignore-scripts --no-audit --no-fund

COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# The scanner reads the TypeScript sources at boot — ship them too.
COPY --from=build /app/src ./src

EXPOSE 3000
CMD ["node", "dist/main.js"]
