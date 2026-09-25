import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './users.dto';

/**
 * User management endpoints.
 */
@Controller('users')
export class UsersController {
  private users: UserResponseDto[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
    { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
  ];

  /**
   * List all users, optionally filtered by name.
   */
  @Get()
  findAll(@Query('name') name?: string): UserResponseDto[] {
    if (name) {
      return this.users.filter((u) => u.name.toLowerCase().includes(name.toLowerCase()));
    }
    return this.users;
  }

  /**
   * Get a single user by ID.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): UserResponseDto {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Create a new user.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto): UserResponseDto {
    const newUser: UserResponseDto = {
      id: this.users.length + 1,
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  /**
   * Update an existing user.
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): UserResponseDto {
    const user = this.findOne(id);
    const updated = { ...user, ...updateUserDto };
    this.users = this.users.map((u) => (u.id === id ? updated : u));
    return updated;
  }

  /**
   * Delete a user.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): { deleted: boolean } {
    this.findOne(id);
    this.users = this.users.filter((u) => u.id !== id);
    return { deleted: true };
  }
}
