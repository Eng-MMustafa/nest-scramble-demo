import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { Post } from './post.model';

/**
 * Sample GraphQL resolver demonstrating nest-scramble resolver scanning.
 */
@Resolver(() => Post)
export class PostsResolver {
  private items: Post[] = [
    { id: 1, title: 'Hello GraphQL', published: true },
  ];

  /**
   * List all posts.
   */
  @Query(() => [Post])
  posts(): Post[] {
    return this.items;
  }

  /**
   * Get a single post by ID.
   */
  @Query(() => Post, { nullable: true })
  post(@Args('id', { type: () => Int }) id: number): Post | undefined {
    return this.items.find((p) => p.id === id);
  }

  /**
   * Toggle the published flag of a post.
   */
  @Mutation(() => Post, { nullable: true })
  togglePublished(@Args('id', { type: () => Int }) id: number): Post | undefined {
    const post = this.items.find((p) => p.id === id);
    if (post) {
      post.published = !post.published;
    }
    return post;
  }
}
