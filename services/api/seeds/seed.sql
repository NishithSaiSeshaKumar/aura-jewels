-- Sample Jewellery Seed Data
INSERT OR IGNORE INTO products (id, slug, name, category, summary, description, price_indicator, is_published)
VALUES 
(1, 'aur-9281', 'Royal Kundan Choker Necklace Set', 'Necklaces', 'Handcrafted 22K gold-plated choker with uncut polki and emerald bead tassels.', 'An exquisite heirloom masterpiece tailored for bridal occasions. Features authentic uncut polki motifs surrounded by micro-pearl cluster edging and dangling natural hydrothermal emerald drops. Comes with matching jhumkas.', '₹1,45,000 Indicative', 1),
(2, 'aur-5104', 'Celestial Solitaire Diamond Ring', 'Rings', '1.5 Carat VVS1 Clarity lab diamond mounted on an 18K rose gold pavé band.', 'Timeless solitaire ring designed for engagements. The band features micro-pavé set conflict-free diamonds with a hidden halo beneath the center four-prong basket.', '₹85,000 Indicative', 1),
(3, 'aur-3329', 'Mayura Temple Antique Kada Bangle', 'Bangles', 'Heavy 22K antique matte gold finish kada featuring peacock carving and ruby accents.', 'Hand-carved South Indian temple jewellery bangle. Features intricately engraved dancing peacock motifs, screw lock mechanism, and hand-bezel set teardrop Burmese rubies.', '₹98,000 Indicative', 1),
(4, 'aur-7742', 'Cascade Diamond Chandbali Earrings', 'Earrings', 'Multi-tiered crescent earrings adorned with brilliant-cut round diamonds and South Sea pearls.', 'Contemporary fusion chandbali statement earrings designed with featherweight hollow backing for comfortable all-day wear during festive banquets.', '₹62,000 Indicative', 1);

-- Attributes for Product 1 (Kundan Choker)
INSERT OR IGNORE INTO product_attributes (product_id, label, value, display_order) VALUES
(1, 'Base Metal', 'Pure Brass with 22K Micro Gold Plating', 1),
(1, 'Stones', 'Polki / Uncut Hydro Emeralds / Pearls', 2),
(1, 'Closure', 'Adjustable Gold Dori (Tassel Cord)', 3),
(1, 'Occasion', 'Bridal & Festive', 4),
(1, 'Gross Weight', '~148 grams', 5);

-- Attributes for Product 2 (Solitaire Ring)
INSERT OR IGNORE INTO product_attributes (product_id, label, value, display_order) VALUES
(2, 'Gold Purity', '18K Rose Gold (Hallmarked)', 1),
(2, 'Center Stone', '1.50 Ct Lab Grown Diamond (IGI Certified)', 2),
(2, 'Diamond Color & Clarity', 'E Color / VVS1', 3),
(2, 'Band Style', 'Comfort-Fit Micro Pavé', 4);

-- Attributes for Product 3 (Bangle)
INSERT OR IGNORE INTO product_attributes (product_id, label, value, display_order) VALUES
(3, 'Purity / Finish', '22K Hallmarked Antique Yellow Gold Polish', 1),
(3, 'Gemstones', 'Synthetic Corundum Rubies', 2),
(3, 'Inner Diameter', '2.4 / 2.6 inches standard', 3),
(3, 'Closure Mechanism', 'Side Screw Lock', 4);

-- Attributes for Product 4 (Earrings)
INSERT OR IGNORE INTO product_attributes (product_id, label, value, display_order) VALUES
(4, 'Gold Base', '14K White Gold', 1),
(4, 'Diamonds', '0.85 Ct Round Brilliant Diamonds (GH / VS)', 2),
(4, 'Pearl Type', 'Cultured South Sea White Pearls', 3),
(4, 'Earring Type', 'Push Back with Secure Latch', 4);

-- Images (Using high quality royalty-free jewelry photography via Unsplash direct links)
INSERT OR IGNORE INTO product_images (product_id, image_url, alt_text, display_order, is_cover) VALUES
(1, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', 'Royal Kundan Choker Necklace Set Front View', 1, 1),
(1, 'https://images.unsplash.com/photo-1611591475152-4c09a138dc72?auto=format&fit=crop&w=800&q=80', 'Kundan Choker Close-up and Earrings', 2, 0),
(2, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', 'Celestial Solitaire Diamond Ring on Rose Gold', 1, 1),
(2, 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80', 'Solitaire Diamond Band Angle View', 2, 0),
(3, 'https://images.unsplash.com/photo-1611591475152-4c09a138dc72?auto=format&fit=crop&w=800&q=80', 'Antique Temple Kada Bangle', 1, 1),
(4, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', 'Cascade Diamond Chandbali Earrings', 1, 1);
