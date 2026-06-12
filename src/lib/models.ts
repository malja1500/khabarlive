/**
 * models.ts — Mongoose schemas
 */
import mongoose, { Schema, Document, Model } from "mongoose";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  avatar: string;
  isActive: boolean;
  newsCount: number;
  createdAt: string;
}

const UserSchema = new Schema<IUser>({
  id:        { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ["admin","user"], default: "user" },
  avatar:    { type: String, default: "" },
  isActive:  { type: Boolean, default: true },
  newsCount: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

// ─── News ─────────────────────────────────────────────────────────────────────
export interface INews extends Document {
  id: string;
  title: string; titleEn: string; titleAr: string;
  excerpt: string; excerptEn: string; excerptAr: string;
  body: string; bodyEn: string; bodyAr: string;
  category: string; image: string;
  author: string; authorId: string; authorAvatar: string;
  status: "published" | "draft" | "review";
  views: number; readingTime: string;
  tags: string[];
  createdAt: string;
  source?: string; sourceUrl?: string;
}

const NewsSchema = new Schema<INews>({
  id:           { type: String, required: true, unique: true },
  title:        { type: String, required: true },
  titleEn:      { type: String, default: "" },
  titleAr:      { type: String, default: "" },
  excerpt:      { type: String, default: "" },
  excerptEn:    { type: String, default: "" },
  excerptAr:    { type: String, default: "" },
  body:         { type: String, default: "" },
  bodyEn:       { type: String, default: "" },
  bodyAr:       { type: String, default: "" },
  category:     { type: String, required: true },
  image:        { type: String, default: "" },
  author:       { type: String, default: "" },
  authorId:     { type: String, default: "" },
  authorAvatar: { type: String, default: "" },
  status:       { type: String, enum:["published","draft","review"], default:"published" },
  views:        { type: Number, default: 0 },
  readingTime:  { type: String, default: "۳ دقیقه" },
  tags:         [{ type: String }],
  createdAt:    { type: String, default: () => new Date().toISOString() },
  source:       { type: String },
  sourceUrl:    { type: String },
});

// ─── Comment ──────────────────────────────────────────────────────────────────
export interface IComment extends Document {
  id: string;
  newsId: string; newsTitle: string;
  userId: string; userName: string; userAvatar: string;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const CommentSchema = new Schema<IComment>({
  id:         { type: String, required: true, unique: true },
  newsId:     { type: String, required: true },
  newsTitle:  { type: String, default: "" },
  userId:     { type: String, required: true },
  userName:   { type: String, required: true },
  userAvatar: { type: String, default: "" },
  text:       { type: String, required: true },
  status:     { type: String, enum:["pending","approved","rejected"], default:"pending" },
  createdAt:  { type: String, default: () => new Date().toISOString() },
});

// ─── Category ─────────────────────────────────────────────────────────────────
export interface ICategory extends Document {
  id: string; key: string;
  labelFa: string; labelEn: string; labelAr: string;
  icon: string; color: string; bg: string;
  isActive: boolean; createdAt: string;
}

const CategorySchema = new Schema<ICategory>({
  id:        { type: String, required: true, unique: true },
  key:       { type: String, required: true, unique: true },
  labelFa:   { type: String, required: true },
  labelEn:   { type: String, default: "" },
  labelAr:   { type: String, default: "" },
  icon:      { type: String, default: "📰" },
  color:     { type: String, default: "#666" },
  bg:        { type: String, default: "rgba(102,102,102,0.85)" },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

// ─── Config (pinned ids, settings) ───────────────────────────────────────────
export interface IConfig extends Document {
  key: string;
  value: string; // JSON string
}

const ConfigSchema = new Schema<IConfig>({
  key:   { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

// ─── Safe model registration ──────────────────────────────────────────────────
export const UserModel:     Model<IUser>     = mongoose.models.User     || mongoose.model("User",     UserSchema);
export const NewsModel:     Model<INews>     = mongoose.models.News     || mongoose.model("News",     NewsSchema);
export const CommentModel:  Model<IComment>  = mongoose.models.Comment  || mongoose.model("Comment",  CommentSchema);
export const CategoryModel: Model<ICategory> = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const ConfigModel:   Model<IConfig>   = mongoose.models.Config   || mongoose.model("Config",   ConfigSchema);
