import React, { useState, useEffect } from "react";
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

  const fetchedReviews = [
    { author: "Jane D.", rating: 4, comment: "Great value for the price!" },
    { author: "Alex P.", rating: 5, comment: "Perfect for my build." },
  ];

  useEffect(() => {
    setTimeout(() => {
      setReviews(fetchedReviews);
      setLoadingReviews(false);
    }, 1000);
  }, []);

  const handleReviewSubmit = () => {
    setReviews((prev) => [...prev, newReview]);
    setNewReview({ author: "", rating: 0, comment: "" });
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2 mt-4">Customer Reviews</h2>

      {loadingReviews ? (
        <p>Loading reviews...</p>
      ) : (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
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
                <Button onClick={handleReviewSubmit}>Post Review</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-4 mt-4">
            {reviews.map((review, index) => (
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
        </>
      )}

      <hr className="border-t-2 border-black my-4" />
    </>
  );
};

export default Reviews;
