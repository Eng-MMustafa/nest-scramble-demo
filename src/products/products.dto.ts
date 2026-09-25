import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export class BaseEntityDto {
  id: number;
  createdAt: Date;
}

export class ProductCategoryDto extends BaseEntityDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ValidateNested()
  @Type(() => ProductCategoryDto)
  category: ProductCategoryDto;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}

export class ProductResponseDto extends BaseEntityDto {
  name: string;
  price: number;
  status: ProductStatus;
  category: ProductCategoryDto;
}
