import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto, ProductResponseDto, ProductStatus, UpdateProductDto } from './products.dto';

/**
 * Product catalog endpoints, including protected and file-upload routes.
 */
@Controller('products')
export class ProductsController {
  private products: ProductResponseDto[] = [
    { id: 1, name: 'T-shirt', price: 25, status: ProductStatus.ACTIVE, category: { id: 1, name: 'Clothing', createdAt: new Date() }, createdAt: new Date() },
  ];

  /**
   * List products, optionally filtered by status.
   */
  @Get()
  findAll(@Query('status') status?: ProductStatus): ProductResponseDto[] {
    if (status) {
      return this.products.filter((p) => p.status === status);
    }
    return this.products;
  }

  /**
   * Get a single product by ID.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): ProductResponseDto {
    return this.products.find((p) => p.id === id);
  }

  /**
   * Create a new product. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto): ProductResponseDto {
    const newProduct: ProductResponseDto = { id: this.products.length + 1, ...createProductDto, createdAt: new Date() };
    this.products.push(newProduct);
    return newProduct;
  }

  /**
   * Update a product. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto): ProductResponseDto {
    const product = this.findOne(id);
    const updated = { ...product, ...updateProductDto };
    this.products = this.products.map((p) => (p.id === id ? updated : p));
    return updated;
  }

  /**
   * Delete a product. Requires authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): { deleted: boolean } {
    this.findOne(id);
    this.products = this.products.filter((p) => p.id !== id);
    return { deleted: true };
  }

  /**
   * Upload a product image.
   */
  @Post('upload')
  uploadImage(@UploadedFile() file: Express.Multer.File): { filename: string } {
    return { filename: file?.originalname ?? 'unknown' };
  }
}
