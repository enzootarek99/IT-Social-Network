-- CreateTable
CREATE TABLE "OpportunityReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityReview_opportunityId_reviewerId_key" ON "OpportunityReview"("opportunityId", "reviewerId");

-- AddForeignKey
ALTER TABLE "OpportunityReview" ADD CONSTRAINT "OpportunityReview_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "FreelanceOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityReview" ADD CONSTRAINT "OpportunityReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
