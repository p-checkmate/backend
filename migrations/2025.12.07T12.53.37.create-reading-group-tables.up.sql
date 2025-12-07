-- Write your migration SQL here
-- 함께 읽기(Reading Group) 관련 테이블 생성

-- 1) reading_group 테이블
CREATE TABLE `reading_group` (
    `reading_group_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '함께 읽기 그룹 ID',
    `book_id`          BIGINT NOT NULL COMMENT '책 ID',
    `start_date`       DATE   NOT NULL COMMENT '시작일',
    `end_date`         DATE   NOT NULL COMMENT '종료일',
    `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    CONSTRAINT `PK_READING_GROUP` PRIMARY KEY (`reading_group_id`),
    CONSTRAINT `FK_READING_GROUP_BOOK_1`
        FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) reading_group_participant 테이블
CREATE TABLE `reading_group_participant` (
    `participant_id`    BIGINT NOT NULL AUTO_INCREMENT COMMENT '참여 ID',
    `reading_group_id`  BIGINT NOT NULL COMMENT '함께 읽기 그룹 ID',
    `user_id`           BIGINT NOT NULL COMMENT '유저 ID',
    `current_page`      INT    NOT NULL DEFAULT 0 COMMENT '현재 읽은 페이지',
    `memo`              VARCHAR(200) NULL COMMENT '진행 메모',
    `joined_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '참여일시',
    `updated_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    CONSTRAINT `PK_READING_GROUP_PARTICIPANT` PRIMARY KEY (`participant_id`),
    CONSTRAINT `UK_READING_GROUP_PARTICIPANT_GROUP_USER`
        UNIQUE (`reading_group_id`, `user_id`),
    CONSTRAINT `FK_READING_GROUP_PARTICIPANT_GROUP_1`
        FOREIGN KEY (`reading_group_id`) REFERENCES `reading_group` (`reading_group_id`),
    CONSTRAINT `FK_READING_GROUP_PARTICIPANT_USER_1`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
