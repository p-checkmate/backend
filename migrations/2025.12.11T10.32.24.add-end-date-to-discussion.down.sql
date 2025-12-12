-- Write your rollback SQL here

DROP INDEX idx_discussion_end_date ON discussion;

ALTER TABLE discussion
DROP COLUMN end_date;