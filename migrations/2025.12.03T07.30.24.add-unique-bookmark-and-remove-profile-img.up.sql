-- Write your migration SQL here
ALTER TABLE `bookmark`
ADD CONSTRAINT `UK_BOOKMARK_USER_BOOK`
UNIQUE (`user_id`, `book_id`);

ALTER TABLE `user`
DROP COLUMN `profile_img`;