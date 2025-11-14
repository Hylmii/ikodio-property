-- Add roomCount field to Booking table
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "roomCount" INTEGER DEFAULT 1 NOT NULL;

-- Update existing bookings to have roomCount = 1
UPDATE "Booking" SET "roomCount" = 1 WHERE "roomCount" IS NULL;

-- Add comment
COMMENT ON COLUMN "Booking"."roomCount" IS 'Number of rooms booked (auto-calculated from numberOfGuests / room.capacity)';
