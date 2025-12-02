-- Manually confirm user email
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'martial888@gmail.com';
