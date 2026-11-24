INSERT INTO records (title, category, description, status)
SELECT seed.title, seed.category, seed.description, seed.status
FROM (VALUES
  ('Cannot connect to campus Wi-Fi', 'Network', 'My laptop connects to the campus Wi-Fi but cannot access the internet.', 'Pending'),
  ('Lab computer will not start', 'Hardware', 'The desktop computer in Lab 2 does not power on when the button is pressed.', 'In progress'),
  ('Install Python software', 'Software', 'I need Python installed on a computer in the programming laboratory.', 'Pending'),
  ('Printer is producing blank pages', 'Hardware', 'The library printer feeds paper but prints blank pages.', 'Completed'),
  ('Student portal login problem', 'Account', 'The student portal keeps rejecting my correct login details.', 'Pending'),
  ('Projector has no display', 'Hardware', 'The lecture room projector is switched on but shows no image from the computer.', 'In progress'),
  ('Browser keeps crashing', 'Software', 'The browser closes unexpectedly when several learning pages are open.', 'Completed'),
  ('Slow network in computer lab', 'Network', 'Internet access in the computer laboratory is very slow during lessons.', 'Pending')
) AS seed(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);