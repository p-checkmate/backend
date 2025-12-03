-- Write your rollback SQL here
ALTER TABLE `bookmark`
DROP INDEX `UK_BOOKMARK_USER_BOOK`;

ALTER TABLE `user`
ADD COLUMN `profile_img` VARCHAR(255) NULL;
