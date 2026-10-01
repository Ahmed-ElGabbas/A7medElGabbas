import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNavItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @Matches(/^(#|\/)[A-Za-z0-9\-_/#?=&.]*$/, {
    message: 'href must be an anchor (#about) or a path (/about)',
  })
  href!: string;
}

export class UpdateNavItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @Matches(/^(#|\/)[A-Za-z0-9\-_/#?=&.]*$/, {
    message: 'href must be an anchor (#about) or a path (/about)',
  })
  href?: string;
}

export class ReorderNavItemsDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  ids!: string[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  startOrder?: number;
}
