
import { db } from "../database/db";
import { donorOpportunities } from "../../shared/schema";

export async function getDonorOpportunities(filters: {
  id?: string;
  country?: string;
  sector?: string;
  minAmount?: number;
  maxAmount?: number;
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    const result = await db.select().from(donorOpportunities).limit(filters.limit || 50).offset(filters.offset || 0);
    return result;
  } catch (error) {
    console.error('Error fetching donor opportunities:', error);
    return [];
  }
}

export async function createDonorOpportunity(opportunity: {
  id: string;
  title: string;
  description: string;
  country: string;
  sector: string;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  deadline?: string;
  sourceUrl?: string;
  isVerified?: boolean;
  keywords?: string[];
  sourceName?: string;
}) {
  try {
    const result = await db.insert(donorOpportunities).values({
      id: opportunity.id,
      title: opportunity.title,
      description: opportunity.description,
      country: opportunity.country,
      sector: opportunity.sector,
      amountMin: opportunity.amountMin,
      amountMax: opportunity.amountMax,
      currency: opportunity.currency,
      deadline: opportunity.deadline,
      sourceUrl: opportunity.sourceUrl,
      isVerified: opportunity.isVerified,
      keywords: opportunity.keywords,
      sourceName: opportunity.sourceName,
    }).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating donor opportunity:', error);
    throw error;
  }
}
