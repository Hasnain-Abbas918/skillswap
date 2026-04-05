ALTER TABLE "profiles" ALTER COLUMN "skills_offered" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "skills_wanted" SET DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "tags" SET DEFAULT '{}'::text[];