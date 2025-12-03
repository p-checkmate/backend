-- Write your migration SQL here
ALTER TABLE `book`
    CHANGE COLUMN `google_books_id` `aladin_item_id` BIGINT NULL;