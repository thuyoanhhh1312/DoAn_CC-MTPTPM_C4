-- Add category-level selling status column.
-- Run this once on the target MySQL database before restarting backend.

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'category'
    AND COLUMN_NAME = 'is_active'
);

SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE category ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER description',
  'SELECT "Column category.is_active already exists"'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE category
SET is_active = 1
WHERE is_active IS NULL;
