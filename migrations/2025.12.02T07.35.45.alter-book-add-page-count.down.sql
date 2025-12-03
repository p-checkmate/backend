-- Write your rollback SQL here
ALTER TABLE `book`
    DROP COLUMN `page_count`;