ALTER TABLE `user_genre` DROP FOREIGN KEY `FK_USER_GENRE_GENRE`;

CREATE TABLE `onboarding_genre` (
    `onboarding_genre_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '내부 식별자',
    `genre_name`          VARCHAR(50) NOT NULL,
    `parent_id`           BIGINT NULL COMMENT '상위 장르의 FK (NULL: 대분류)',
    PRIMARY KEY (`onboarding_genre_id`),
    -- 자기 참조 외래 키 제약 조건 추가
    CONSTRAINT `FK_ONBOARDING_GENRE_PARENT` FOREIGN KEY (`parent_id`) REFERENCES `onboarding_genre` (`onboarding_genre_id`)
) COMMENT='사용자 온보딩 및 선호도 설정을 위한 계층형 장르 목록';

ALTER TABLE `user_genre` CHANGE COLUMN `genre_id` `onboarding_genre_id` BIGINT NOT NULL COMMENT 'FK → onboarding_genre.onboarding_genre_id';

ALTER TABLE `user_genre`
    ADD CONSTRAINT `FK_USER_GENRE_ONBOARDING_GENRE`
    FOREIGN KEY (`onboarding_genre_id`)
    REFERENCES `onboarding_genre` (`onboarding_genre_id`);

ALTER TABLE `user_genre`
    ADD CONSTRAINT `UQ_USER_GENRE_PREFERENCE` UNIQUE (`user_id`, `onboarding_genre_id`);

-- 대분류 삽입
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('문학', NULL),        -- 1
('자기계발', NULL),    -- 2
('경제', NULL),        -- 3
('경영', NULL),        -- 4
('인문', NULL),        -- 5
('철학', NULL),        -- 6
('과학', NULL),        -- 7
('기술', NULL),        -- 8
('역사', NULL),        -- 9
('사회', NULL),        -- 10
('취미', NULL),        -- 11
('실용', NULL);        -- 12

-- 소분류 삽입
-- 1. 문학 (parent_id = 1)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('현대문학', 1), ('순수문학', 1), ('추리', 1), ('스릴러', 1), ('판타지', 1),
('SF', 1), ('역사소설', 1), ('로맨스', 1), ('멜로', 1);

-- 2. 자기계발 (parent_id = 2)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('습관', 2), ('루틴', 2), ('인간관계', 2), ('소통', 2), ('동기부여', 2),
('시간관리', 2), ('생산성', 2);

-- 3. 경제 (parent_id = 3)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('재테크', 3), ('투자', 3), ('트렌드', 3), ('미래예측', 3);

-- 4. 경영 (parent_id = 4)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('비즈니스전략', 4), ('리더십', 4), ('조직관리', 4);

-- 5. 인문 (parent_id = 5)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('심리학', 5), ('고전', 5), ('언어', 5), ('예술', 5);

-- 6. 철학 (parent_id = 6)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('철학', 6), ('종교', 6), ('윤리', 6);

-- 7. 과학 (parent_id = 7)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('대중과학', 7), ('환경과학', 7), ('생명과학', 7), ('우주', 7), ('천문학', 7);

-- 8. 기술 (parent_id = 8)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('IT', 8), ('코딩', 8);

-- 9. 역사 (parent_id = 9)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('근현대사', 9), ('세계사', 9), ('동양사', 9), ('고증', 9);

-- 10. 사회 (parent_id = 10)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('사회학', 10), ('지정학', 10), ('사회문제', 10);

-- 11. 취미 (parent_id = 11)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('여행', 11), ('미술', 11), ('사진', 11);

-- 12. 실용 (parent_id = 12)
INSERT INTO `onboarding_genre` (`genre_name`, `parent_id`) VALUES
('요리', 12), ('음료', 12), ('건강', 12), ('운동', 12);