-- Write your migration SQL here
CREATE TABLE `user_exp` (
    `exp_id`  BIGINT      NOT NULL AUTO_INCREMENT COMMENT '경험치ID',
    `user_id` BIGINT      NOT NULL COMMENT '회원ID, FK → user.user_id',
    `exp`     INT         NOT NULL DEFAULT 0 COMMENT '누적 경험치',
    `level`   INT         NOT NULL DEFAULT 1 COMMENT '현재 경험치 단계(레벨 번호)',

    CONSTRAINT `PK_user_exp` PRIMARY KEY (`exp_id`),
    UNIQUE KEY `UK_user_exp_user_id` (`user_id`),

    CONSTRAINT `FK_user_exp_user_id`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
