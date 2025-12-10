-- Write your migration SQL here
ALTER TABLE discussion_comment
ADD COLUMN choice TINYINT NULL COMMENT 'VS 토론 선택지 (1: option1, 2: option2, NULL: FREE 토론)' AFTER user_id;