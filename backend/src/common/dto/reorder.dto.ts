import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Payload for every `PATCH /<collection>/reorder` endpoint
 * (BACKEND_PLAN.md §4.2).
 *
 * One shared class rather than a per-module copy: the shape is identical for
 * every orderable list, and duplicating it nine times meant a validation change
 * had to be made in nine places. `applyReorder` in common/reorder.ts performs
 * the matching server-side checks (unknown ids, duplicates) before writing.
 */
export class ReorderIdsDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @ArrayMaxSize(500)
  ids!: string[];

  /**
   * Order value for the first id. Defaults to 0; a nested collection (skills
   * within one category) passes the parent's own offset so the two orderings
   * cannot collide.
   */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  startOrder?: number;
}