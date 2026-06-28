-- ============================================================
-- 04_seed_catalogo.sql — Catálogo inicial de insumos
-- ============================================================

insert into public.catalogo_insumos (nombre, categoria, unidad) values
('Agua potable', 'agua', 'litros'),
('Alimentos no perecederos', 'alimentos', 'kg'),
('Leche en polvo', 'alimentos', 'kg'),
('Pañales', 'higiene', 'unidad'),
('Toallas sanitarias', 'higiene', 'unidad'),
('Kit de primeros auxilios', 'medicinas', 'kit'),
('Insulina', 'medicinas', 'unidad'),
('Suero / sales de hidratación', 'medicinas', 'unidad'),
('Analgésicos básicos', 'medicinas', 'unidad'),
('Ropa de abrigo', 'ropa', 'unidad'),
('Cobijas / frazadas', 'ropa', 'unidad'),
('Colchonetas', 'otro', 'unidad'),
('Linternas y pilas', 'otro', 'unidad'),
('Combustible (gasolina/diesel)', 'combustible', 'litros'),
('Carpas / lonas', 'otro', 'unidad'),
('Jabón y productos de higiene', 'higiene', 'kit'),
('Mascarillas y guantes', 'higiene', 'unidad')
on conflict (nombre) do nothing;
