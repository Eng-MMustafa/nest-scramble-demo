import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Public demo: the standalone docs server and static exports live on other
  // origins, so allow them to call the API directly.
  app.enableCors();
  app.useWebSocketAdapter(new IoAdapter(app));
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Docs available at: http://localhost:${port}/api/docs`);
  console.log(`GraphQL available at: http://localhost:${port}/graphql`);
}
bootstrap();
