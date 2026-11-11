-- Row Level Security does not protect TRUNCATE, REFERENCES or TRIGGER privileges.
-- The browser clients only need the ordinary operations governed by RLS policies.
revoke truncate, references, trigger
on all tables in schema public
from anon, authenticated;

alter default privileges in schema public
revoke truncate, references, trigger
on tables
from anon, authenticated;