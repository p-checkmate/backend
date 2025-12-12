-- Write your migration SQL here

ALTER TABLE discussion
ADD COLUMN end_date DATETIME NULL COMMENT 'VS 토론 종료일시' AFTER like_count;

CREATE INDEX idx_discussion_end_date ON discussion(end_date);