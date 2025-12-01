-- 롤백: created_at 필드의 DEFAULT CURRENT_TIMESTAMP 제거 및 user 테이블 nickname을 NOT NULL로 복구
ALTER TABLE `user`
MODIFY COLUMN `nickname` VARCHAR(100) NOT NULL;

ALTER TABLE `user`
MODIFY COLUMN `created_at` DATETIME NOT NULL;

ALTER TABLE `discussion`
MODIFY COLUMN `created_at` DATETIME NOT NULL;

ALTER TABLE `quote`
MODIFY COLUMN `created_at` DATETIME NOT NULL;

ALTER TABLE `discussion_comment`
MODIFY COLUMN `created_at` DATETIME NOT NULL;