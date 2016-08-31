CREATE TABLE scenarios (
	id varchar(255) NOT NULL DEFAULT '' PRIMARY KEY,
	user_id varchar(255) NOT NULL,
	name varchar(255) NOT NULL DEFAULT '',
	description text NOT NULL,
	created_at timestamp DEFAULT current_timestamp
);