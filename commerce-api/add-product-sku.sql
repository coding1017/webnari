-- Migration: Add SKU column to products table
-- Run this in Supabase SQL Editor for the webnari-commerce project
-- (variants table already has a sku column)

alter table products add column if not exists sku text;
