-- Create business_types table
CREATE TABLE IF NOT EXISTS business_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Create establishments table
CREATE TABLE IF NOT EXISTS establishments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  business_type_id INTEGER REFERENCES business_types(id),
  year_established INTEGER CHECK (year_established >= 1900 AND year_established <= EXTRACT(YEAR FROM CURRENT_DATE)),
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  barangay TEXT NOT NULL,
  street TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 