-- AlterTable
CREATE SEQUENCE section_meta_id_seq;
ALTER TABLE "section_meta" ALTER COLUMN "id" SET DEFAULT nextval('section_meta_id_seq');
ALTER SEQUENCE section_meta_id_seq OWNED BY "section_meta"."id";

-- Prisma leaves the new sequence at its initial value, which would hand out id=1
-- again and collide with any row that already exists from before this fix.
-- Start it past the current maximum so the migration is safe in environments
-- where section_meta is not empty (empty table => setval(1, false) => first id 1).
SELECT setval(
    'section_meta_id_seq',
    COALESCE((SELECT MAX("id") FROM "section_meta"), 0) + 1,
    false
);
