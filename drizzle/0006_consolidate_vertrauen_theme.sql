-- Consolidate all practices to "vertrauen" theme and teal primary color
UPDATE practices SET theme = 'vertrauen' WHERE theme = 'standard' OR theme IS NULL;
UPDATE practices SET "primaryColor" = '#0D9488' WHERE "primaryColor" = '#2563EB';
ALTER TABLE practices ALTER COLUMN theme SET DEFAULT 'vertrauen';
