import React from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

function PostCard({ $id, title, featuredImage, productName, category, rating, reviewerName, $createdAt }) {
  const displayTitle = productName || title;
  const safeRating = Number(rating) || 0;
  const filledStars = Math.round(Math.min(Math.max(safeRating, 0), 5));

  const createdDate = $createdAt ? new Date($createdAt) : null;
  const formattedDate = createdDate
    ? createdDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link to={`/post/${$id}`} className="block transform transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.02]">
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-emerald-400/60 hover:shadow-xl transition-colors duration-200">
        <div className="w-full mb-4">
          {featuredImage ? (
            <img
              src={appwriteService.getFilePreview(featuredImage)}
              alt={displayTitle}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-slate-800 flex items-center justify-center rounded-lg">
              <span className="text-slate-500">No image</span>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-slate-100 wrap-break-word line-clamp-1">
          {displayTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{title}</p>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="px-2 py-1 rounded-full bg-slate-800/80 text-emerald-300">
            {category || "Uncategorized"}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= filledStars ? "text-amber-400 text-sm" : "text-slate-700 text-sm"
                }
              >
                ★
              </span>
            ))}
            {safeRating > 0 && (
              <span className="ml-1 text-[11px] text-slate-500">{safeRating}/5</span>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <p>by {reviewerName || "Anonymous"}</p>
          {formattedDate && <p className="text-slate-500">{formattedDate}</p>}
        </div>
      </div>
    </Link>
  );
}

export default PostCard;