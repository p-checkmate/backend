CREATE TABLE `refresh_token` (
    `token_id`     BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `user_id`      BIGINT NOT NULL COMMENT 'FK → user',
    `token`        VARCHAR(500) NOT NULL,
    `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`token_id`),
    KEY `IDX_USER_ID` (`user_id`),
    KEY `IDX_TOKEN` (`token`)
);

ALTER TABLE `refresh_token`
    ADD CONSTRAINT `FK_REFRESH_TOKEN_USER` 
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
    ON DELETE CASCADE;