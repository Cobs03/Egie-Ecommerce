import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({
    author: "",
    rating: 0,
    comment: "",
  });

  // Expand/collapse state
  const [expanded, setExpanded] = useState(false);

  // Filter state
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  // Pagination state
  const REVIEWS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // For closing dropdown on outside click
  const filterMenuRef = useRef(null);

  const fetchedReviews = [
    { author: "Jane D.", rating: 4, comment: "Great value for the price!" },
    { author: "Alex P.", rating: 5, comment: "Perfect for my build." },
    { author: "Sam S.", rating: 3, comment: "Good, but could be quieter." },
    { author: "Chris L.", rating: 2, comment: "Had some issues with cables." },
    { author: "Pat R.", rating: 5, comment: "Highly recommended!" },
    { author: "Morgan T.", rating: 1, comment: "Arrived DOA, but replaced quickly." },
    { author: "Jamie F.", rating: 4, comment: "Solid PSU for the price." },
    { author: "Riley G.", rating: 5, comment: "Super quiet and efficient." },
    { author: "Taylor H.", rating: 3, comment: "Average experience." },
    { author: "Jordan K.", rating: 2, comment: "Not as expected." },
    { author: "Casey L.", rating: 5, comment: "Would buy again!" },
  ];

  useEffect(() => {
    setTimeout(() => {
      setReviews(fetchedReviews);
      setLoadingReviews(false);
    }, 1000);
  }, []);

  // Close filter menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setFilterMenuOpen(false);
      }
    }
    if (filterMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuOpen]);

  const handleReviewSubmit = () => {
    setReviews((prev) => [...prev, newReview]);
    setNewReview({ author: "", rating: 0, comment: "" });
  };

  // Filter reviews by selected rating
  const filteredReviews = selectedRating
    ? reviews.filter((r) => r.rating === selectedRating)
    : reviews;

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);

  // Show 3 reviews by default, paginated if expanded
  let reviewsToShow = [];
  if (expanded) {
    const startIdx = (currentPage - 1) * REVIEWS_PER_PAGE;
    reviewsToShow = filteredReviews.slice(startIdx, startIdx + REVIEWS_PER_PAGE);
  } else {
    reviewsToShow = filteredReviews.slice(0, 3);
  }

  // Reset page when filter or expand/collapse changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRating, expanded]);

  return (
    <>
      <h2 className="text-lg font-semibold mb-2 mt-4">Customer Reviews</h2>

      <div className="flex items-center gap-2 mb-2 relative">
        <Button
          variant="outline"
          className="text-sm cursor-pointer"
          onClick={() => setFilterMenuOpen((open) => !open)}
        >
          Filter
        </Button>
        {selectedRating && (
          <span className="text-xs text-gray-600 ml-2">
            Showing {selectedRating}-star reviews
            <button
              className="ml-2 text-green-600 underline cursor-pointer"
              onClick={() => setSelectedRating(null)}
            >
              Clear
            </button>
          </span>
        )}

        {/* Filter dropdown */}
        {filterMenuOpen && (
          <div
            ref={filterMenuRef}
            className="absolute left-0 top-10 bg-white border rounded shadow p-2 z-20 mt-1 min-w-[120px]"
          >
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className="block w-full text-left px-2 py-1 hover:bg-green-50 cursor-pointer"
                onClick={() => {
                  setSelectedRating(star);
                  setFilterMenuOpen(false);
                  setExpanded(true);
                }}
              >
                {star} Star{star > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      {loadingReviews ? (
        <p>Loading reviews...</p>
      ) : (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-white cursor-pointer">
                {reviews.length === 0
                  ? "Be the first to review this product"
                  : "Write a Review"}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={newReview.author}
                  onChange={(e) =>
                    setNewReview({ ...newReview, author: e.target.value })
                  }
                />

                <div>
                  <p className="mb-1">Rating</p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() =>
                          setNewReview({ ...newReview, rating: star })
                        }
                        className={`cursor-pointer text-2xl ${
                          star <= newReview.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder="What did you like or dislike?"
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                />
              </div>

              <DialogFooter>
                <Button onClick={handleReviewSubmit} className="cursor-pointer">
                  Post Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-4 mt-4">
            {reviewsToShow.length === 0 && (
              <p className="text-gray-500">No reviews found.</p>
            )}
            {reviewsToShow.map((review, index) => (
              <div key={index} className="border p-4 rounded bg-gray-50 shadow">
                <p className="font-semibold">{review.author}</p>
                <p className="text-yellow-400">
                  {"★".repeat(review.rating)}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => (
                    <span key={i} className="text-gray-300">
                      ☆
                    </span>
                  ))}
                </p>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>

          {/* See more / See less buttons */}
          {filteredReviews.length > 3 && (
            <div className="flex flex-col items-center mt-2 gap-2">
              <Button
                variant="ghost"
                className="text-green-600 cursor-pointer"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? "See Less" : "See More"}
              </Button>
              {/* Pagination only in expanded mode */}
              {expanded && totalPages > 1 && (
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={currentPage === idx + 1 ? "default" : "outline"}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <hr className="border-t-2 border-black my-4" />
    </>
  );
};

export default Reviews;
