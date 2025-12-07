USE health;

-- Insert workout types
INSERT INTO workout_types (name, description) VALUES
('Running', 'Outdoor or treadmill running'),
('Cycling', 'Road cycling or stationary bike'),
('Swimming', 'Pool or open water swimming'),
('Weightlifting', 'Resistance training with weights'),
('Yoga', 'Flexibility and mindfulness practice'),
('Walking', 'Casual or power walking'),
('HIIT', 'High intensity interval training'),
('Dancing', 'Aerobic dance activities');

-- Insert a default user
INSERT INTO users (username, email, password) VALUES
('gold', 'gold@example.com', '$2b$10$WK5DOUd9nzakE7Ea5mvdcux9QOna3mc3Hdf5HYslkOdw9cqSpw/gu');

-- Insert sample workouts for the default user
INSERT INTO workouts (user_id, workout_type, duration, calories_burned, distance, notes, workout_date) VALUES
(1, 'Running', 30, 300, 5.0, 'Morning run in the park', '2024-12-01'),
(1, 'Cycling', 45, 400, 15.0, 'Evening bike ride', '2024-12-02'),
(1, 'Swimming', 60, 500, 2.0, 'Lap swimming at local pool', '2024-12-03'),
(1, 'Weightlifting', 40, 250, NULL, 'Upper body workout', '2024-12-04'),
(1, 'Yoga', 50, 150, NULL, 'Relaxing yoga session', '2024-12-05');