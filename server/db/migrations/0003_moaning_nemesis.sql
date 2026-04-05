CREATE TYPE "public"."review_type" AS ENUM('session', 'exchange');--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"reviewee_id" uuid NOT NULL,
	"exchange_id" uuid,
	"session_id" uuid,
	"type" "review_type" DEFAULT 'session',
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"target_user_id" uuid,
	"action" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "exchanges" DROP CONSTRAINT "exchanges_pause_confirmed_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "exchanges" ADD COLUMN "pause_approved_by_id" uuid;--> statement-breakpoint
ALTER TABLE "exchanges" ADD COLUMN "paused_at" timestamp;--> statement-breakpoint
ALTER TABLE "exchanges" ADD COLUMN "resumed_at" timestamp;--> statement-breakpoint
ALTER TABLE "exchanges" ADD COLUMN "cancel_requested_by_id" uuid;--> statement-breakpoint
ALTER TABLE "exchanges" ADD COLUMN "cancel_approved_by_id" uuid;--> statement-breakpoint
ALTER TABLE "exchanges" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_exchange_id_exchanges_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."exchanges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_pause_approved_by_id_users_id_fk" FOREIGN KEY ("pause_approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_cancel_requested_by_id_users_id_fk" FOREIGN KEY ("cancel_requested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchanges" ADD CONSTRAINT "exchanges_cancel_approved_by_id_users_id_fk" FOREIGN KEY ("cancel_approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchanges" DROP COLUMN "pause_confirmed_by_id";