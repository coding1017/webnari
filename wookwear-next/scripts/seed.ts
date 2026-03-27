/**
 * Seed script — populates Supabase with product, blog, and glossary data
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Prerequisites:
 *   1. Run supabase/schema.sql in your Supabase SQL Editor
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm install tsx (if not already installed)
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load env
config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Product data (from src/data/products.ts) ────────────────────────────────

const products = [
  { id: "pouch-checker-pink", name: "Pink Checker Pouch Set", category: "pouches", price: 4500, badge: "new", in_stock: true, description: "Warped pink and white checkerboard with hot pink binding and rounded edges. Includes matching display mat and snap-closure wallet. Hand-cut, hand-sewn, one of a kind.", is_collection: false, sort_order: 0, rating: 4.9, review_count: 8, imgs: ["/images/pink-checker-1.jpg", "/images/pink-checker-2.jpg", "/images/pink-checker-3.jpg"], reviews: [{ name: "brookimats", text: "Those rounded edges go so hard. Beautifully done!", rating: 5, date: "2025-09-20" }, { name: "dripping_wet_paint", text: "You know I need that. Absolute heater set.", rating: 5, date: "2025-08-16" }, { name: "pups.and.flowers", text: "Heater set! The pink is perfect.", rating: 5, date: "2025-08-16" }] },
  { id: "bag-crossbody-denim", name: "Sashiko Denim Crossbody", category: "bags", price: 8500, badge: "oneofone", in_stock: true, description: "Cut & sew color-block crossbody with hand-stitched sashiko denim patchwork front panel. Waxed canvas body, adjustable strap, zippered main compartment. Built to last for years.", is_collection: false, sort_order: 1, rating: 4.8, review_count: 6, imgs: ["/images/denim-crossbody-1.jpg", "/images/denim-crossbody-2.jpg"], reviews: [{ name: "hesh4hash", text: "Best bags, been running mine for years!!! Absolute fire quality.", rating: 5, date: "2025-12-10" }, { name: "ebakerboy", text: "So clean! Great craftsmanship on the sashiko.", rating: 5, date: "2025-12-05" }, { name: "norcal_heady", text: "Great job on this one. The denim detail is next level.", rating: 4, date: "2025-12-05" }] },
  { id: "mat-psychedelic-swirl", name: "Psychedelic Display Mats", category: "mats", price: 4500, badge: "collection", in_stock: true, description: "Square display mats in vivid psychedelic prints -- donut circles, marbled swirls, geometric color blocks, and abstract waves. Navy and purple felt borders with woven label.", is_collection: true, sort_order: 2, rating: 5.0, review_count: 11, imgs: ["/images/display-mats-1.jpg", "/images/display-mats-2.jpg"], reviews: [{ name: "ebakerboy", text: "Dibs B! These are absolutely insane.", rating: 5, date: "2026-03-23" }, { name: "spiritanimalglass", text: "Makes me want donuts. This cut is getting to me.", rating: 5, date: "2026-03-23" }], variants: [{ id: "mat-A-donut-circles", name: "A - Donut Circles", color: "#E63946", imgs: ["/images/display-mat-A.jpg"], price: 4500, in_stock: true }, { id: "mat-B-marbled-swirl", name: "B - Marbled Swirl", color: "#7C3AED", imgs: ["/images/display-mat-B.jpg"], price: 4500, in_stock: true }, { id: "mat-C-color-block", name: "C - Color Block", color: "#3B82F6", imgs: ["/images/display-mat-C.jpg"], price: 4500, in_stock: true }, { id: "mat-D-abstract-wave", name: "D - Abstract Wave", color: "#F97316", imgs: ["/images/display-mat-D.jpg"], price: 4500, in_stock: true }] },
  { id: "mat-buddy-blobs", name: "Buddy Display Mats", category: "mats", price: 4200, badge: "collection", in_stock: true, description: "Organic blob-shaped display mats in fun psychedelic fabrics with contrast-color felt binding.", is_collection: true, sort_order: 3, rating: 4.9, review_count: 14, imgs: ["/images/buddy-mats-1.jpg"], reviews: [{ name: "dripping_wet_paint", text: "A is me! Love the shapes and colors.", rating: 5, date: "2025-08-13" }], variants: [{ id: "buddy-mat-A-blue-psych", name: "A - Blue Psychedelic", color: "#3B82F6", imgs: ["/images/buddy-mat-A.jpg"], price: 4200, in_stock: true }, { id: "buddy-mat-B-floral", name: "B - Floral Burst", color: "#22C55E", imgs: ["/images/buddy-mat-B.jpg"], price: 4200, in_stock: true }, { id: "buddy-mat-C-rainbow", name: "C - Rainbow Flowers", color: "#FACC15", imgs: ["/images/buddy-mat-C.jpg"], price: 4200, in_stock: true }, { id: "buddy-mat-D-swirl", name: "D - Pink Swirl", color: "#EC4899", imgs: ["/images/buddy-mat-D.jpg"], price: 4200, in_stock: true }, { id: "buddy-mat-E-paisley", name: "E - Paisley Mix", color: "#A855F7", imgs: ["/images/buddy-mat-E.jpg"], price: 4200, in_stock: true }, { id: "buddy-mat-F-green-checker", name: "F - Green Checker", color: "#0D9488", imgs: ["/images/buddy-mat-F.jpg"], price: 4200, in_stock: true }] },
  { id: "bag-backpack-gray", name: "Tie-Dye Canvas Backpack", category: "bags", price: 15000, badge: "sold", in_stock: false, description: "Collab with @jhudson_tiedye. Gray waxed canvas backpack with removable tie-dye pouch.", is_collection: false, sort_order: 4, rating: 5.0, review_count: 67, imgs: ["/images/backpack-1.jpg", "/images/backpack-2.jpg", "/images/backpack-3.jpg"], reviews: [{ name: "allhailkirkngail", text: "Fabulous bag! The tie-dye pockets are incredible.", rating: 5, date: "2024-11-27" }] },
  { id: "bag-collab-capsule", name: "Trevymetal x Wook Wear Capsule", category: "bags", price: 7500, badge: "oneofone", in_stock: true, description: "1/1 bag capsule with @trevymetal.", is_collection: false, sort_order: 5, rating: 4.9, review_count: 22, imgs: ["/images/collab-capsule-1.jpg"], reviews: [{ name: "420blazeitbro_", text: "Clean. The screen print collage work is next level.", rating: 5, date: "2025-10-27" }] },
  { id: "collection-pouches-spring", name: "Spring Prized Possession Drop", category: "pouches", price: 3800, badge: "collection", in_stock: true, description: "Happy #wookwearwednesday! Prized possession pouches made with some of my favorite fabrics.", is_collection: true, sort_order: 6, rating: 4.8, review_count: 6, imgs: ["/images/pouches-circle-1.jpg"], reviews: [{ name: "ewokglass", text: "Fire fire fire! Every color is a winner.", rating: 5, date: "2025-05-07" }], variants: [{ id: "pouch-A-teal-checker", name: "Teal Checker", color: "#0D9488", imgs: ["/images/pouch-A-1.jpg", "/images/pouch-A-2.jpg"], price: 3800, in_stock: true }, { id: "pouch-B-maroon-checker", name: "Maroon Checker", color: "#9F1239", imgs: ["/images/pouch-B-1.jpg", "/images/pouch-B-2.jpg"], price: 3800, in_stock: false }, { id: "pouch-C-coral-hex", name: "Coral Honeycomb", color: "#F97316", imgs: ["/images/pouch-C-1.jpg", "/images/pouch-C-2.jpg"], price: 3800, in_stock: true }, { id: "pouch-D-purple-swirl", name: "Purple Kaleidoscope", color: "#7C3AED", imgs: ["/images/pouch-D-1.jpg", "/images/pouch-D-2.jpg"], price: 3800, in_stock: false }, { id: "pouch-E-green-checker", name: "Green Checker", color: "#22C55E", imgs: ["/images/pouch-E-1.jpg", "/images/pouch-E-2.jpg"], price: 3800, in_stock: true }, { id: "pouch-F-pink-swirl", name: "Pink Marble", color: "#EC4899", imgs: ["/images/pouch-F-1.jpg", "/images/pouch-F-2.jpg"], price: 3800, in_stock: false }, { id: "pouch-G-green-abstract", name: "Green Abstract", color: "#16A34A", imgs: ["/images/pouch-G-1.jpg", "/images/pouch-G-2.jpg"], price: 4000, in_stock: true }] },
  { id: "buddy-orange-fuzzy", name: "Orange Sherpa Buddy Pouch", category: "buddy", price: 5500, badge: null, in_stock: true, description: "Say hello to your new little friend! Fuzzy orange sherpa front with psychedelic patchwork back panel.", is_collection: false, sort_order: 7, rating: 4.9, review_count: 5, imgs: ["/images/orange-buddy.jpg"], reviews: [{ name: "nocountryformids", text: "Say hello to my little friend! So cute and well made.", rating: 5, date: "2026-01-02" }] },
];

// ─── Seed function ───────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding Wook Wear database...\n");

  // 1. Clear existing data (order matters for FK constraints)
  console.log("Clearing existing data...");
  await supabase.from("variant_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("variants").delete().neq("id", "x");
  await supabase.from("product_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("products").delete().neq("id", "x");
  await supabase.from("blog_posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("glossary_terms").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Insert products
  console.log("Inserting products...");
  for (const p of products) {
    const { imgs, reviews, variants, ...productData } = p as any;

    const { error: prodErr } = await supabase.from("products").insert(productData);
    if (prodErr) { console.error(`  Product ${p.id}:`, prodErr.message); continue; }

    // Images
    if (imgs?.length) {
      await supabase.from("product_images").insert(
        imgs.map((url: string, i: number) => ({ product_id: p.id, url, sort_order: i }))
      );
    }

    // Reviews
    if (reviews?.length) {
      await supabase.from("reviews").insert(
        reviews.map((r: any) => ({ product_id: p.id, name: r.name, text: r.text, rating: r.rating, date: r.date, approved: true }))
      );
    }

    // Variants
    if (variants?.length) {
      for (let vi = 0; vi < variants.length; vi++) {
        const v = variants[vi];
        const { imgs: vImgs, ...variantData } = v;
        await supabase.from("variants").insert({ ...variantData, product_id: p.id, sort_order: vi });
        if (vImgs?.length) {
          await supabase.from("variant_images").insert(
            vImgs.map((url: string, i: number) => ({ variant_id: v.id, url, sort_order: i }))
          );
        }
      }
    }

    console.log(`  + ${p.name}`);
  }

  // 3. Insert blog posts (import from data file)
  console.log("\nInserting blog posts...");
  const { posts } = await import("../src/data/blog");
  const blogRows = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    tags: p.tags,
    read_time: p.readTime,
    image_url: p.image,
    published: true,
    date: p.date,
  }));
  const { error: blogErr } = await supabase.from("blog_posts").insert(blogRows);
  if (blogErr) console.error("  Blog error:", blogErr.message);
  else console.log(`  + ${blogRows.length} posts`);

  // 4. Insert glossary terms
  console.log("\nInserting glossary terms...");
  const { glossaryTerms } = await import("../src/data/glossary");
  const glossaryRows = glossaryTerms.map((t) => ({
    term: t.term,
    slug: t.slug,
    definition: t.definition,
    category: t.category,
  }));
  const { error: glossaryErr } = await supabase.from("glossary_terms").insert(glossaryRows);
  if (glossaryErr) console.error("  Glossary error:", glossaryErr.message);
  else console.log(`  + ${glossaryRows.length} terms`);

  console.log("\nDone! Database seeded successfully.");
}

seed().catch(console.error);
