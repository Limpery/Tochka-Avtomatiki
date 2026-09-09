/*
  Warnings:

  - You are about to drop the `Robot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Robot";

-- CreateTable
CREATE TABLE "industries" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "icon_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_types" (
    "id" SERIAL NOT NULL,
    "industry_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "object_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "solution_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "website" VARCHAR(500),
    "country" VARCHAR(100),
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "robot_solutions" (
    "id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price_min" DECIMAL(12,2),
    "price_max" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'RUB',
    "pricing_model" VARCHAR(50),
    "image_url" VARCHAR(500),
    "documentation_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "robot_solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_specs" (
    "id" SERIAL NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "spec_name" VARCHAR(100) NOT NULL,
    "spec_value" VARCHAR(100) NOT NULL,
    "spec_unit" VARCHAR(30),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solution_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_applicability" (
    "id" SERIAL NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "industry_id" INTEGER NOT NULL,
    "object_type_id" INTEGER,
    "suitability_score" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solution_applicability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_tags" (
    "id" SERIAL NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solution_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" SERIAL NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "company_name" VARCHAR(200),
    "industry_id" INTEGER,
    "object_type_id" INTEGER,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "results" JSONB,
    "published_at" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_ratings" (
    "id" SERIAL NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solution_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_objects" (
    "id" SERIAL NOT NULL,
    "object_type_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "company" VARCHAR(200),
    "role" VARCHAR(30) NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_projects" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "object_type_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "use_benchmark" BOOLEAN NOT NULL DEFAULT false,
    "benchmark_object_id" INTEGER,
    "area_sqm" DECIMAL(10,2),
    "employee_count" INTEGER,
    "shift_count" SMALLINT,
    "operating_hours" DECIMAL(5,1),
    "monthly_fund" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_project_processes" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "process_name" VARCHAR(200) NOT NULL,
    "current_cost" DECIMAL(14,2),
    "current_hours" DECIMAL(8,2),
    "employee_count" INTEGER,
    "frequency" VARCHAR(50),
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_project_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_solution_matches" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "match_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "estimated_cost" DECIMAL(14,2),
    "estimated_savings" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "roi_months" DECIMAL(6,1) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_solution_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "name" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_items" (
    "id" SERIAL NOT NULL,
    "comparison_id" INTEGER NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "position" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparison_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economic_calculations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "solution_id" INTEGER NOT NULL,
    "initial_investment" DECIMAL(14,2),
    "annual_maintenance" DECIMAL(14,2),
    "annual_energy_cost" DECIMAL(14,2),
    "annual_savings" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "payback_months" DECIMAL(6,1) NOT NULL DEFAULT 0,
    "roi_3yr" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "roi_5yr" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "npv" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "irr" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "assumptions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economic_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_slug_key" ON "industries"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "object_types_slug_key" ON "object_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "solution_categories_slug_key" ON "solution_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "robot_solutions_slug_key" ON "robot_solutions"("slug");

-- CreateIndex
CREATE INDEX "solution_specs_solution_id_idx" ON "solution_specs"("solution_id");

-- CreateIndex
CREATE INDEX "solution_specs_spec_name_idx" ON "solution_specs"("spec_name");

-- CreateIndex
CREATE INDEX "solution_applicability_industry_id_idx" ON "solution_applicability"("industry_id");

-- CreateIndex
CREATE INDEX "solution_applicability_object_type_id_idx" ON "solution_applicability"("object_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "solution_applicability_solution_id_industry_id_object_type__key" ON "solution_applicability"("solution_id", "industry_id", "object_type_id");

-- CreateIndex
CREATE INDEX "solution_tags_solution_id_idx" ON "solution_tags"("solution_id");

-- CreateIndex
CREATE INDEX "solution_tags_tag_id_idx" ON "solution_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "solution_tags_solution_id_tag_id_key" ON "solution_tags"("solution_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "solution_ratings_solution_id_user_id_key" ON "solution_ratings"("solution_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_projects_user_id_idx" ON "user_projects"("user_id");

-- CreateIndex
CREATE INDEX "user_projects_object_type_id_idx" ON "user_projects"("object_type_id");

-- CreateIndex
CREATE INDEX "user_project_processes_project_id_idx" ON "user_project_processes"("project_id");

-- CreateIndex
CREATE INDEX "project_solution_matches_project_id_idx" ON "project_solution_matches"("project_id");

-- CreateIndex
CREATE INDEX "project_solution_matches_solution_id_idx" ON "project_solution_matches"("solution_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_solution_matches_project_id_solution_id_key" ON "project_solution_matches"("project_id", "solution_id");

-- CreateIndex
CREATE INDEX "comparisons_user_id_idx" ON "comparisons"("user_id");

-- CreateIndex
CREATE INDEX "comparison_items_comparison_id_idx" ON "comparison_items"("comparison_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparison_items_comparison_id_solution_id_key" ON "comparison_items"("comparison_id", "solution_id");

-- CreateIndex
CREATE INDEX "economic_calculations_project_id_idx" ON "economic_calculations"("project_id");

-- CreateIndex
CREATE INDEX "economic_calculations_solution_id_idx" ON "economic_calculations"("solution_id");

-- CreateIndex
CREATE UNIQUE INDEX "economic_calculations_project_id_solution_id_key" ON "economic_calculations"("project_id", "solution_id");

-- AddForeignKey
ALTER TABLE "object_types" ADD CONSTRAINT "object_types_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "robot_solutions" ADD CONSTRAINT "robot_solutions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "robot_solutions" ADD CONSTRAINT "robot_solutions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "solution_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_specs" ADD CONSTRAINT "solution_specs_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_applicability" ADD CONSTRAINT "solution_applicability_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_applicability" ADD CONSTRAINT "solution_applicability_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_applicability" ADD CONSTRAINT "solution_applicability_object_type_id_fkey" FOREIGN KEY ("object_type_id") REFERENCES "object_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_tags" ADD CONSTRAINT "solution_tags_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_tags" ADD CONSTRAINT "solution_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_object_type_id_fkey" FOREIGN KEY ("object_type_id") REFERENCES "object_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_ratings" ADD CONSTRAINT "solution_ratings_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_ratings" ADD CONSTRAINT "solution_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_objects" ADD CONSTRAINT "benchmark_objects_object_type_id_fkey" FOREIGN KEY ("object_type_id") REFERENCES "object_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_object_type_id_fkey" FOREIGN KEY ("object_type_id") REFERENCES "object_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_benchmark_object_id_fkey" FOREIGN KEY ("benchmark_object_id") REFERENCES "benchmark_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_processes" ADD CONSTRAINT "user_project_processes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "user_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_solution_matches" ADD CONSTRAINT "project_solution_matches_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "user_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_solution_matches" ADD CONSTRAINT "project_solution_matches_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "user_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_comparison_id_fkey" FOREIGN KEY ("comparison_id") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_items" ADD CONSTRAINT "comparison_items_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economic_calculations" ADD CONSTRAINT "economic_calculations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "user_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economic_calculations" ADD CONSTRAINT "economic_calculations_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "robot_solutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
