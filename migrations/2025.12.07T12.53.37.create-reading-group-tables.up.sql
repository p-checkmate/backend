-- 함께 읽기 그룹 테이블
CREATE TABLE `reading_group` (
    `reading_group_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '함께 읽기 그룹 ID',
    `book_id` BIGINT NOT NULL COMMENT '책 ID',
    `start_date` DATE NOT NULL COMMENT '시작일',
    `end_date` DATE NOT NULL COMMENT '종료일',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    CONSTRAINT `PK_READING_GROUP`
        PRIMARY KEY (`reading_group_id`),
    CONSTRAINT `FK_READING_GROUP_BOOK`
        FOREIGN KEY (`book_id`)
        REFERENCES `book` (`book_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;


-- 함께 읽기 멤버 테이블
CREATE TABLE `reading_group_member` (
    `member_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '멤버 ID',
    `reading_group_id` BIGINT NOT NULL COMMENT '함께 읽기 그룹 ID',
    `user_id` BIGINT NOT NULL COMMENT '유저 ID',
    `current_page` INT NOT NULL DEFAULT 0 COMMENT '현재 읽은 페이지',
    `memo` VARCHAR(200) NULL COMMENT '한 줄 메모',
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '참여 시각',
    `updated_at` DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT '업데이트 시각',
    CONSTRAINT `PK_READING_GROUP_MEMBER`
        PRIMARY KEY (`member_id`),
    CONSTRAINT `UQ_READING_GROUP_MEMBER`
        UNIQUE (`reading_group_id`, `user_id`),
    CONSTRAINT `FK_READING_GROUP_MEMBER_GROUP`
        FOREIGN KEY (`reading_group_id`)
        REFERENCES `reading_group` (`reading_group_id`),
    CONSTRAINT `FK_READING_GROUP_MEMBER_USER`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;
