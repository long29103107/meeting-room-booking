CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE rooms (
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(120) NOT NULL UNIQUE,
 capacity INTEGER NOT NULL CHECK (capacity > 0),
 location VARCHAR(160) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE bookings (
 id BIGSERIAL PRIMARY KEY,
 room_id BIGINT NOT NULL REFERENCES rooms(id),
 user_email VARCHAR(200) NOT NULL,
 title VARCHAR(200) NOT NULL,
 start_time TIMESTAMPTZ NOT NULL,
 end_time TIMESTAMPTZ NOT NULL,
 status VARCHAR(16) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED','CANCELLED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT booking_time_valid CHECK (start_time < end_time),
 CONSTRAINT no_overlapping_confirmed_bookings EXCLUDE USING gist (
   room_id WITH =,
   tstzrange(start_time,end_time,'[)') WITH &&
 ) WHERE (status = 'CONFIRMED')
);
CREATE INDEX idx_bookings_room_start ON bookings(room_id,start_time);
CREATE INDEX idx_bookings_user ON bookings(user_email);
INSERT INTO rooms(name,capacity,location,active) VALUES
 ('Orchid',4,'Floor 1',true),('Lotus',8,'Floor 2',true),
 ('Jasmine',12,'Floor 3',true),('Bamboo',6,'Floor 2',true);
