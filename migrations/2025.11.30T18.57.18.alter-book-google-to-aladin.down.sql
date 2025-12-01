-- Write your rollback SQL here
ALTER TABLE `book`
    CHANGE COLUMN `aladin_item_id` `google_books_id` BIGINT NULL;