import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { NestScrambleModule } from 'nest-scramble';
import { OrdersGateway } from './orders/orders.gateway';
import { PostsResolver } from './posts/posts.resolver';
import { Post } from './posts/post.model';
import { ProductsController } from './products/products.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: false,
      path: '/graphql',
    }),
    NestScrambleModule.forRoot({
      path: '/docs',
      sourcePath: 'src',
      apiTitle: 'Nest-Scramble Live Demo',
      apiVersion: '1.0.0',
      // On the hosted demo PUBLIC_URL is the Render URL; locally it stays localhost.
      baseUrl: process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`,
      globalPrefix: 'api',
      enableMock: true,
    }),
  ],
  controllers: [UsersController, ProductsController, AuthController],
  providers: [JwtAuthGuard, OrdersGateway, PostsResolver, Post],
})
export class AppModule {}
