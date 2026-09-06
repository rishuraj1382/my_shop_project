// frontend/src/components/ReviewModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import Spinner from './ui/Spinner';
import Modal from './ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../Toast';
import { API_URL } from '../config';

function ReviewModal({ isOpen, onClose, shopId, shopName, orderId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const { getAuthHeader } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && shopId) {
      // Check if already reviewed
      axios.get(`${API_URL}/api/reviews/check/${shopId}`, getAuthHeader())
        .then(res => {
          if (res.data.hasReviewed) {
            setExistingReview(res.data.review);
            setRating(res.data.review.rating);
            setReview(res.data.review.review || '');
          }
        })
        .catch(() => {});
    }
  }, [isOpen, shopId, getAuthHeader]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ message: 'Please select a star rating.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/api/reviews`,
        { shopId, orderId, rating, review },
        getAuthHeader()
      );
      toast({ message: existingReview ? 'Review updated!' : 'Review submitted!', type: 'success' });
      onReviewSubmitted && onReviewSubmitted();
      onClose();
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to submit review.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={shopName} size="md">
      <div className="-mt-2 mb-4">
        <span className="font-label text-primary font-bold tracking-widest text-[10px] uppercase">
          {existingReview ? 'Update Your Review' : 'Write a Review'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star selection */}
          <div>
            <label className="label-stitch">Your Rating</label>
            <div className="mt-3 flex justify-center">
              <StarRating rating={rating} onRate={setRating} interactive size="lg" />
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-on-surface-variant mt-2">
                {['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Review text */}
          <div>
            <label className="label-stitch">Your Review (Optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this shop..."
              className="input-stitch resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-outline mt-1 text-right">{review.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                Submitting…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">star</span>
                {existingReview ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </button>
        </form>
    </Modal>
  );
}

export default ReviewModal;
