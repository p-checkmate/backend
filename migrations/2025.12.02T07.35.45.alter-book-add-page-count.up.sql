-- Write your migration SQL here
ALTER TABLE `book`
    ADD COLUMN `page_count` INT NULL COMMENT '페이지 수';

