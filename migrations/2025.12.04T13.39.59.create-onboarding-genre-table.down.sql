ALTER TABLE `user_genre` DROP INDEX `UQ_USER_GENRE_PREFERENCE`;

ALTER TABLE `user_genre` DROP FOREIGN KEY `FK_USER_GENRE_ONBOARDING_GENRE`;

ALTER TABLE `user_genre` CHANGE COLUMN `onboarding_genre_id` `genre_id` BIGINT NOT NULL COMMENT 'FK:genre.genre_id';

DROP TABLE `onboarding_genre`;

ALTER TABLE `user_genre`
    ADD CONSTRAINT `FK_USER_GENRE_GENRE`
    FOREIGN KEY (`genre_id`)
    REFERENCES `genre` (`genre_id`);