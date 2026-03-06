
-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student');

-- Create schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Schools policies
CREATE POLICY "Schools are viewable by their members" ON public.schools
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "School admins can update their school" ON public.schools
  FOR UPDATE TO authenticated
  USING (
    id IN (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
    AND public.has_role(auth.uid(), 'school_admin')
  );

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "School members can view profiles in same school" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup (creates profile + role + school)
CREATE OR REPLACE FUNCTION public.handle_new_school_signup()
RETURNS TRIGGER AS $$
DECLARE
  _school_id UUID;
BEGIN
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
  ELSE
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_school_signup();
