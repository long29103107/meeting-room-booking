INSERT INTO rooms(name, capacity, location, active) VALUES
    ('Acacia', 10, 'Floor 1', true),
    ('Cypress', 8, 'Floor 2', true),
    ('Maple', 6, 'Floor 2', true),
    ('Cedar', 8, 'Floor 3', true),
    ('Magnolia', 16, 'Floor 4', true),
    ('Pine', 4, 'Floor 1', true);

-- Seed up to one upcoming booking per room per day for a week (70 on a fresh DB).
-- Offsets keep bookings future-dated; occupied confirmed slots are skipped.
WITH seeded_rooms AS (
    SELECT id
    FROM rooms
    WHERE name IN (
        'Orchid', 'Lotus', 'Jasmine', 'Bamboo',
        'Acacia', 'Cypress', 'Maple', 'Cedar', 'Magnolia', 'Pine'
    )
),
seeded_slots AS (
    SELECT room.id AS room_id, day.day_offset
    FROM seeded_rooms room
    CROSS JOIN generate_series(0, 6) AS day(day_offset)
),
seed_candidates AS (
    SELECT
        slot.room_id,
        slot.day_offset,
        now() + make_interval(days => slot.day_offset, hours => 1, mins => (slot.room_id % 4)::int * 30) AS start_time,
        now() + make_interval(days => slot.day_offset, hours => 2, mins => (slot.room_id % 4)::int * 30) AS end_time
    FROM seeded_slots slot
),
available_seed_slots AS (
    SELECT candidate.*
    FROM seed_candidates candidate
    WHERE NOT EXISTS (
        SELECT 1
        FROM bookings existing
        WHERE existing.room_id = candidate.room_id
          AND existing.status = 'CONFIRMED'
          AND existing.start_time < candidate.end_time
          AND existing.end_time > candidate.start_time
    )
)
INSERT INTO bookings(room_id, user_email, title, start_time, end_time)
SELECT
    slot.room_id,
    CASE WHEN (slot.room_id + slot.day_offset) % 2 = 0
        THEN 'employee@demo.local'
        ELSE 'admin@demo.local'
    END,
    CASE (slot.room_id + slot.day_offset) % 7
        WHEN 0 THEN 'Product planning'
        WHEN 1 THEN 'Design review'
        WHEN 2 THEN 'Sprint planning'
        WHEN 3 THEN 'Hiring interview'
        WHEN 4 THEN 'Customer workshop'
        WHEN 5 THEN 'Architecture sync'
        ELSE 'Team retrospective'
    END,
    slot.start_time,
    slot.end_time
FROM available_seed_slots slot;
