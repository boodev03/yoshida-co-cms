-- Sample data for testing with complete structure

-- Insert sample categories
INSERT INTO categories (category_name, type, createdAt, updatedAt) VALUES
('Construction', 'cases', 1640995200000, 1640995200000),
('Industrial', 'cases', 1640995200000, 1640995200000),
('Company Updates', 'news', 1640995200000, 1640995200000),
('Product Launches', 'news', 1640995200000, 1640995200000),
('Heavy Machinery', 'equipments', 1640995200000, 1640995200000),
('Safety Equipment', 'equipments', 1640995200000, 1640995200000);

-- Insert sample products with complete data structure
INSERT INTO products (title, category, cardDescription, thumbnail, sections, metaTitle, metaDescription, createdAt, updatedAt) VALUES
('Product A', 'Construction', 'A high-quality construction product for professional use', '', '[]', 'Product A - Construction Equipment', 'Professional construction equipment for various building projects', 1640995200000, 1640995200000),
('Product B', 'Industrial', 'Industrial-grade equipment designed for heavy-duty applications', '', '[]', 'Product B - Industrial Equipment', 'Heavy-duty industrial equipment for manufacturing and production', 1640995200000, 1640995200000);

-- Insert sample news with complete data structure
INSERT INTO news (title, category, cardDescription, thumbnail, sections, metaTitle, metaDescription, createdAt, updatedAt) VALUES
('Company Milestone', 'Company Updates', 'We have reached an important milestone in our company growth', '', '[]', 'Company Milestone - Yoshida Corp', 'Important company milestone announcement and achievements', 1640995200000, 1640995200000),
('New Product Release', 'Product Launches', 'Exciting new product launch with innovative features', '', '[]', 'New Product Release - Latest Innovation', 'Launch of our latest innovative product with advanced features', 1640995200000, 1640995200000);

-- Insert sample equipments with complete data structure
INSERT INTO equipments (title, category, cardDescription, thumbnail, sections, metaTitle, metaDescription, createdAt, updatedAt) VALUES
('Excavator XL', 'Heavy Machinery', 'Large excavator perfect for construction and earthmoving projects', '', '[]', 'Excavator XL - Heavy Construction Equipment', 'Professional excavator for large-scale construction and earthmoving', 1640995200000, 1640995200000),
('Safety Vest Pro', 'Safety Equipment', 'High-visibility safety vest meeting all industry standards', '', '[]', 'Safety Vest Pro - Professional Safety Equipment', 'High-visibility safety vest for construction and industrial workers', 1640995200000, 1640995200000);