-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0;

-- Tokens issued before this migration carry no `ver` claim and are therefore
-- treated as stale (undefined !== 0), so this column being added signs out every
-- already-issued refresh token exactly once. That is the intended effect for a
-- revocation mechanism: sessions cannot outlive the deploy that introduces it.