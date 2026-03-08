
CREATE OR REPLACE FUNCTION public.handle_new_school_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _school_id UUID;
BEGIN
  -- Case 1: School admin signup (has school_name)
  IF NEW.raw_user_meta_data->>'school_name' IS NOT NULL THEN
    INSERT INTO public.schools (name, location, phone, email)
    VALUES (
      NEW.raw_user_meta_data->>'school_name',
      NEW.raw_user_meta_data->>'school_location',
      NEW.raw_user_meta_data->>'school_phone',
      NEW.email
    )
    RETURNING id INTO _school_id;

    INSERT INTO public.profiles (user_id, school_id, full_name)
    VALUES (NEW.id, _school_id, NEW.raw_user_meta_data->>'full_name');

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'school_admin');

  -- Case 2: Invited member (has invited_school_id)
  ELSIF NEW.raw_user_meta_data->>'invited_school_id' IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, school_id, full_name)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'invited_school_id')::uuid,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'invited_role')::app_role);

  -- Case 3: Generic signup
  ELSE
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  END IF;

  RETURN NEW;
END;
$function$;
