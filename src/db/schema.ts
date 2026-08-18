import { pgTable, text, timestamp, varchar, integer, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).default("CANDIDATE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("INFO").notNull(),
  link: varchar("link", { length: 255 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notification_user_id_idx").on(table.userId),
}));

export const candidates = pgTable("candidates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  discipline: varchar("discipline", { length: 100 }).notNull(),
  level: varchar("level", { length: 100 }).notNull(),
  experience: integer("experience").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  cvUrl: text("cv_url"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  disciplineIdx: index("discipline_idx").on(table.discipline),
  cityIdx: index("city_idx").on(table.city),
  userIdIdx: uniqueIndex("user_id_idx").on(table.userId)
}));

export const jobs = pgTable("jobs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  schoolName: varchar("school_name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  discipline: varchar("discipline", { length: 100 }).notNull(),
  level: varchar("level", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  recruiterId: varchar("recruiter_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
  salaryRange: varchar("salary_range", { length: 100 }),
  contractType: varchar("contract_type", { length: 50 }).default("CDD").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  cityIdx: index("job_city_idx").on(table.city),
  disciplineIdx: index("job_discipline_idx").on(table.discipline)
}));

export const applications = pgTable("applications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  candidateId: varchar("candidate_id", { length: 36 }).notNull().references(() => candidates.id, { onDelete: "cascade" }),
  jobId: varchar("job_id", { length: 36 }).notNull().references(() => jobs.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueApp: uniqueIndex("unique_app_idx").on(table.candidateId, table.jobId)
}));

export const storedFiles = pgTable("stored_files", {
  id: varchar("id", { length: 36 }).primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull().unique(),
  originalName: varchar("original_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileData: text("file_data").notNull(),
  size: integer("size"),
  userId: varchar("user_id", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  filenameIdx: uniqueIndex("stored_files_filename_idx").on(table.filename),
  userIdIdx: index("stored_files_user_id_idx").on(table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  candidate: one(candidates),
  jobs: many(jobs),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  user: one(users, {
    fields: [candidates.userId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  recruiter: one(users, {
    fields: [jobs.recruiterId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  candidate: one(candidates, {
    fields: [applications.candidateId],
    references: [candidates.id],
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));
