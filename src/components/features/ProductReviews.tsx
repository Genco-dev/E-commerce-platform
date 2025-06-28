import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reviewsApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [page, setPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { user } = useAuthStore();

  const { data: reviewsData, isLoading } = useQuery(
    ['reviews', productId, page],
    () => reviewsApi.getByProduct(productId, page),
    {
      keepPreviousData: true,
    }
  );

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ReviewFormData>();
  const watchedRating = watch('rating', 0);

  const onSubmitReview = async (data: ReviewFormData) => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    try {
      await reviewsApi.create({
        product_id: productId,
        user_id: user.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      });
      
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      reset();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await reviewsApi.markHelpful(reviewId);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to mark as helpful');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton lines={3} />
          </div>
        ))}
      </div>
    );
  }

  const reviews = reviewsData?.data || [];
  const pagination = reviewsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">
          Customer Reviews ({pagination?.total || 0})
        </h3>
        <Button onClick={() => setShowReviewModal(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Write Review
        </Button>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.user?.full_name || 'Anonymous'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(review.created_at)}
                      </span>
                      {review.is_verified_purchase && (
                        <Badge variant="success" size="sm">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
              )}

              {review.comment && (
                <p className="text-gray-600 mb-4">{review.comment}</p>
              )}

              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful ({review.helpful_count})</span>
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.has_prev}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.has_next}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">Be the first to review this product!</p>
          <Button onClick={() => setShowReviewModal(true)}>
            Write the first review
          </Button>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Write a Review"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setValue('rating', rating)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      rating <= watchedRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <input
              type="hidden"
              {...register('rating', { required: 'Please select a rating' })}
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Summarize your review"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              {...register('comment', { required: 'Please write a review' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Share your thoughts about this product..."
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1">
              Submit Review
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReviewModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};