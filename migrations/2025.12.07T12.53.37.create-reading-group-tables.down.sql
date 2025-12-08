-- Write your rollback SQL here
-- 함께 읽기(Reading Group) 관련 테이블 삭제
DROP TABLE IF EXISTS `reading_group_member`;
DROP TABLE IF EXISTS `reading_group`;