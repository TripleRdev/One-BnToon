-- Fix: Remove permissive public access policy from chapter_views
-- This policy was not dropped in previous migration due to incorrect policy name

-- Drop the permissive policy using the CORRECT name
DROP POLICY IF EXISTS "Views are viewable by everyone" ON public.chapter_views;

-- The admin-only policy "Only admins can view chapter views" remains active
-- record_chapter_view() RPC still works via SECURITY DEFINER