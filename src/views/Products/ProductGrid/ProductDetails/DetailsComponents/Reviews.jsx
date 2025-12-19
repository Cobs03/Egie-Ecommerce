import React from "react";
import ProductReviewsSection from "@/components/ProductReviewsSection";

/**
 * Reviews Component - Wrapper for ProductReviewsSection
 * Uses real database reviews with automatic user tracking
 */
const Reviews = ({ product }) => {
  return <ProductReviewsSection product={product} />;
};

export default Reviews;
