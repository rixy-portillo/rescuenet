/*
  Warnings:

  - Made the column `gender` on table `animals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `animals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight_lbs` on table `animals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `animals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `shelters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address_line_1` on table `shelters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zip_code` on table `shelters` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "animals" ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "weight_lbs" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL;

-- AlterTable
ALTER TABLE "shelters" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "address_line_1" SET NOT NULL,
ALTER COLUMN "zip_code" SET NOT NULL;
