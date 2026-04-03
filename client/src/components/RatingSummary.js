import React from "react";
import ReactStars from "react-rating-stars-component";

const RatingSummary = ({
  avgRating = 0,
  totalReviews = 0,
  ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  positiveCount = 0,
}) => {
  // Tổng đánh giá dùng để tính %
  const total =
    totalReviews ||
    Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  // Format số lớn như 86000 thành 86k
  const formatCount = (count) => {
    if (count >= 1e6) return (count / 1e6).toFixed(1) + "M";
    if (count >= 1e3) return (count / 1e3).toFixed(1) + "k";
    return count.toString();
  };

  // Hàm tính %
  const getPercent = (count) => (total > 0 ? (count / total) * 100 : 0);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
      <div className="flex flex-col items-center md:items-start">
        <div className="flex items-center text-yellow-400 text-5xl font-bold">
          <span className="text-yellow-400 ml-1 text-[32px] mr-1">★</span>
          {avgRating.toFixed(1)}
          <span className="text-black text-xl ml-1">/5</span>
        </div>
        <p className="text-gray-600 mt-2 font-semibold">
          {formatCount(positiveCount)} khách hài lòng
        </p>
        <p className="text-gray-400 text-sm mt-1">{total} đánh giá</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star] || 0;
          const percent = getPercent(count).toFixed(1);

          return (
            <div key={star} className="flex items-center gap-2">
              <div className="w-8 flex items-center text-sm text-gray-700">
                {star} <span className="text-yellow-400 ml-1">★</span>
              </div>

              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-2 bg-blue-500 rounded transition-all duration-300"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <div className="w-10 text-right text-sm text-gray-700 font-bold">
                {percent}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSummary;
