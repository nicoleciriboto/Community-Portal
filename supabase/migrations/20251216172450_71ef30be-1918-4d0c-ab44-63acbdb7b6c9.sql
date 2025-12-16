-- Drop the admin-only policy for creating events
DROP POLICY IF EXISTS "Admins can create events" ON public.events;

-- Create new policy allowing any authenticated user to create events
CREATE POLICY "Authenticated users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

-- Update the update policy to allow creators to update their own events
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Creators can update own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- Update the delete policy to allow creators to delete their own events
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Creators can delete own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = creator_id);