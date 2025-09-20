-- Sprint 7: A/B Testing Fields
-- PRD v1.3, Section 2 & 7

ALTER TABLE campaigns
ADD COLUMN script_a_id UUID, -- References a script
ADD COLUMN script_b_id UUID, -- References a script
ADD COLUMN split_percentage INT DEFAULT 50;
