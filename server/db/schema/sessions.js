const { pgTable, uuid, integer, text, timestamp, pgEnum } = require('drizzle-orm/pg-core');
const { exchanges } = require('./exchanges');
const { users } = require('./users');

const sessionStatusEnum = pgEnum('session_status', ['scheduled', 'in_progress', 'completed', 'missed', 'cancelled']);

const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  exchangeId: uuid('exchange_id').notNull().references(() => exchanges.id, { onDelete: 'cascade' }),
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').default(120),
  teacherId: uuid('teacher_id').references(() => users.id),
  studentId: uuid('student_id').references(() => users.id),
  status: sessionStatusEnum('status').default('scheduled'),
  roomId: uuid('room_id').notNull().unique(),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { sessions, sessionStatusEnum };