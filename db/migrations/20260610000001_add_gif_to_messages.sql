-- migrate:up
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
ALTER TABLE messages ADD COLUMN gif_url TEXT;
ALTER TABLE messages ADD COLUMN gif_title TEXT;

-- migrate:down
ALTER TABLE messages DROP COLUMN gif_title;
ALTER TABLE messages DROP COLUMN gif_url;
ALTER TABLE messages ALTER COLUMN content SET NOT NULL;
