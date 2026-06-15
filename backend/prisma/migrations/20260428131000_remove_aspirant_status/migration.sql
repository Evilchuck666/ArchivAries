-- Convert any existing ASPIRANT rows to ACTIVE
UPDATE "members" SET "status" = 'ACTIVE' WHERE "status" = 'ASPIRANT';

-- Drop the current default
ALTER TABLE "members" ALTER COLUMN "status" DROP DEFAULT;

-- Create new enum without ASPIRANT
CREATE TYPE "MemberStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI', 'COLLABORATOR');

-- Migrate the column to the new type
ALTER TABLE "members"
  ALTER COLUMN "status" TYPE "MemberStatus_new"
  USING ("status"::text::"MemberStatus_new");

-- Replace the old type
DROP TYPE "MemberStatus";
ALTER TYPE "MemberStatus_new" RENAME TO "MemberStatus";

-- Restore the default
ALTER TABLE "members" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
