CREATE TABLE `user` (
    `user_id`      BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `email`        VARCHAR(100) NOT NULL COMMENT 'UNIQUE',
    `password`     VARCHAR(255) NOT NULL COMMENT '해시 저장',
    `nickname`     VARCHAR(100) NOT NULL,
    `profile_img`  VARCHAR(500) NULL DEFAULT NULL,
    `created_at`   DATETIME NOT NULL,
    PRIMARY KEY (`user_id`)
);

CREATE TABLE `genre` (
    `genre_id`    BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `genre_name`  VARCHAR(50) NOT NULL,
    PRIMARY KEY (`genre_id`)
);

CREATE TABLE `book` (
    `book_id`        BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `google_books_id` VARCHAR(100) NOT NULL COMMENT 'Google Books API ID',
    `title`          VARCHAR(100) NOT NULL,
    `author`         VARCHAR(100) NULL,
    `publisher`      VARCHAR(100) NULL,
    `published_date` DATE NULL,
    `description`    TEXT NULL COMMENT '책설명',
    `thumbnail_url`  VARCHAR(500) NULL,
    PRIMARY KEY (`book_id`)
);

CREATE TABLE `discussion` (
    `discussion_id`   BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `user_id`         BIGINT NOT NULL COMMENT 'FK → user',
    `book_id`         BIGINT NOT NULL COMMENT 'FK → book',
    `title`           VARCHAR(200) NOT NULL,
    `content`         TEXT NULL,
    `discussion_type` ENUM('FREE', 'VS') NOT NULL DEFAULT 'FREE' COMMENT '기본값 - FREE (자유토론)',
    `option1`         VARCHAR(200) NULL COMMENT 'VS 토론일 때만 사용',
    `option2`         VARCHAR(200) NULL COMMENT 'VS 토론일 때만 사용',
    `view_count`      INT NOT NULL DEFAULT 0,
    `like_count`      INT NOT NULL DEFAULT 0,
    `created_at`      DATETIME NOT NULL,
    `updated_at`      DATETIME NULL,
    PRIMARY KEY (`discussion_id`)
);

CREATE TABLE `quote` (
    `quote_id`    BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `user_id`     BIGINT NULL COMMENT 'FK → user',
    `book_id`     BIGINT NOT NULL COMMENT 'FK → book',
    `content`     TEXT NOT NULL,
    `like_count`  INT NOT NULL DEFAULT 0,
    `created_at`  DATETIME NOT NULL,
    `updated_at`  DATETIME NULL,
    PRIMARY KEY (`quote_id`)
);

CREATE TABLE `discussion_comment` (
    `comment_id`     BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `discussion_id`  BIGINT NOT NULL COMMENT 'FK → discussion',
    `user_id`        BIGINT NOT NULL COMMENT 'FK → user',
    `content`        TEXT NOT NULL,
    `created_at`     DATETIME NOT NULL,
    `updated_at`     DATETIME NULL,
    PRIMARY KEY (`comment_id`)
);

CREATE TABLE `vote` (
    `vote_id`        BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `user_id`        BIGINT NOT NULL,
    `discussion_id`  BIGINT NOT NULL,
    `choice`         TINYINT NOT NULL COMMENT '1 = option1, 2 = option2',
    PRIMARY KEY (`vote_id`),
    UNIQUE KEY `UQ_VOTE_USER_DISCUSSION` (`user_id`, `discussion_id`)
);

CREATE TABLE `discussion_like` (
    `like_id`       BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `user_id`       BIGINT NOT NULL COMMENT 'FK → user.user_id',
    `discussion_id` BIGINT NOT NULL COMMENT 'FK → discussion.discussion_id',
    PRIMARY KEY (`like_id`)
);

CREATE TABLE `quote_like` (
    `like_id`   BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `quote_id`  BIGINT NOT NULL COMMENT 'FK → quote.quote_id',
    `user_id`   BIGINT NOT NULL COMMENT 'FK → user.user_id',
    PRIMARY KEY (`like_id`)
);

CREATE TABLE `bookmark` (
    `bookmark_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `book_id`     BIGINT NOT NULL COMMENT 'FK → book',
    `user_id`     BIGINT NULL COMMENT 'FK → user',
    PRIMARY KEY (`bookmark_id`)
);

CREATE TABLE `book_genre` (
    `book_genre_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `genre_id`      BIGINT NOT NULL COMMENT 'FK:genre.genre_id',
    `book_id`       BIGINT NOT NULL COMMENT 'FK → book',
    PRIMARY KEY (`book_genre_id`)
);

CREATE TABLE `user_genre` (
    `user_genre_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `user_id`       BIGINT NULL COMMENT 'FK → user.user_id',
    `genre_id`      BIGINT NOT NULL COMMENT 'FK:genre.genre_id',
    PRIMARY KEY (`user_genre_id`)
);


ALTER TABLE `quote`
  ADD CONSTRAINT `FK_QUOTE_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `FK_QUOTE_BOOK` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`);

ALTER TABLE `discussion_like`
  ADD CONSTRAINT `FK_DISCUSSION_LIKE_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `FK_DISCUSSION_LIKE_DISCUSSION` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`discussion_id`);

ALTER TABLE `vote`
  ADD CONSTRAINT `FK_VOTE_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `FK_VOTE_DISCUSSION` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`discussion_id`);

ALTER TABLE `book_genre`
  ADD CONSTRAINT `FK_BOOK_GENRE_GENRE` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`genre_id`),
  ADD CONSTRAINT `FK_BOOK_GENRE_BOOK` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`);

ALTER TABLE `bookmark`
  ADD CONSTRAINT `FK_BOOKMARK_BOOK` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`),
  ADD CONSTRAINT `FK_BOOKMARK_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

ALTER TABLE `discussion_comment`
  ADD CONSTRAINT `FK_COMMENT_DISCUSSION` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`discussion_id`),
  ADD CONSTRAINT `FK_COMMENT_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

ALTER TABLE `quote_like`
  ADD CONSTRAINT `FK_QUOTE_LIKE_QUOTE` FOREIGN KEY (`quote_id`) REFERENCES `quote` (`quote_id`),
  ADD CONSTRAINT `FK_QUOTE_LIKE_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

ALTER TABLE `discussion`
  ADD CONSTRAINT `FK_DISCUSSION_USER_ID` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `FK_DISCUSSION_BOOK_ID` FOREIGN KEY (`book_id`) REFERENCES `book` (`book_id`);

ALTER TABLE `user_genre`
  ADD CONSTRAINT `FK_USER_GENRE_USER` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `FK_USER_GENRE_GENRE` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`genre_id`);
