-- Migration: Add SKU, Color, and SEO columns to products table
-- Run this in Supabase SQL Editor for the webnari-commerce project

alter table products add column if not exists sku text;
alter table products add column if not exists color text;
alter table products add column if not exists meta_title text;
alter table products add column if not exists meta_description text;
