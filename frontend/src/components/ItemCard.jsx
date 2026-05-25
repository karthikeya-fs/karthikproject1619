import { useState } from "react";
import { Link } from "react-router-dom";
import { assetUrl } from "../services/api";
import { getStoredUserId } from "../utils/authStorage";
import { FiEyeOff, FiFlag } from "react-icons/fi";
import ClaimModal from "./ClaimModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import API from "../services/api";
import toast from "react-hot-toast";

function ItemCard({ item, onItemDeleted }) {
  const [showClaim, setShowClaim] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!item?._id) return null;

  const img = item.images?.length ? assetUrl(item.images[0]) : "";
  const myId = getStoredUserId();
  const ownerId = item.postedBy?._id || item.postedBy;
  const isOwner = myId && ownerId && String(ownerId) === String(myId);
  const shouldBlur = item.blurImage && !isOwner;

  const canClaim = item.type === "found" && item.status === "open" && !isOwner && myId;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await API.delete(`/items/${item._id}`);
      setShowConfirm(false);
      toast.success(item.type === "lost" ? "Post removed — glad you got it back!" : "Post removed — thanks for helping!");
      onItemDeleted?.(item._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group h-full relative">
        <Link to={`/item/${item._id}`} className="block h-full">
          <article className="h-full flex flex-col rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/85 dark:bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_4px_16px_-1px_rgba(0,0,0,0.04),0_2px_4px_-2px_rgba(0,0,0,0.03)] dark:shadow-lg transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/95 dark:hover:bg-white/[0.07] hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06),0_0_40px_rgba(6,182,212,0.04)] dark:hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.25)]">
            <div className="aspect-[4/3] bg-gray-100/80 dark:bg-white/5 relative overflow-hidden">
              {img ? (
                <img
                  src={img}
                  alt=""
                  className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                    shouldBlur ? "blur-md scale-110 opacity-70 select-none pointer-events-none" : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  No photo
                </div>
              )}

              {/* Privacy Overlay */}
              {shouldBlur && (
                <div className="absolute inset-0 bg-black/50 dark:bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-1 p-3 text-center">
                  <FiEyeOff className="text-red-400 text-lg" />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded-full border border-red-500/30 dark:border-red-500/20 shadow-md">
                    🔒 Sensitive Item
                  </span>
                </div>
              )}

              <span
                className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                  item.type === "lost"
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.25)] dark:shadow-none"
                    : "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-[0_2px_8px_rgba(6,182,212,0.25)] dark:shadow-none"
                }`}
              >
                {item.type}
              </span>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{item.description}</p>
              <p className="text-cyan-700 dark:text-cyan-400/80 text-xs mt-auto pt-2 font-medium">{item.location}</p>
              {item.type === "lost" && item.reward ? (
                <p className="text-amber-600 dark:text-amber-400/90 text-xs font-medium">Reward: {item.reward}</p>
              ) : null}
            </div>
          </article>
        </Link>

        {/* Owner action button — always visible at bottom of card */}
        {isOwner && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(true); }}
            className={`absolute bottom-3 left-3 right-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-200 ${
              item.type === "lost"
                ? "bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/30"
                : "bg-blue-500/20 hover:bg-blue-500/35 text-blue-400 border border-blue-500/30"
            }`}
          >
            {item.type === "lost" ? "✅ Item Retrieved" : "📦 Item Delivered"}
          </button>
        )}

        {/* "This is Mine" button — overlaid at the bottom of the card */}
        {canClaim && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowClaim(true);
            }}
            className="absolute bottom-3 left-3 right-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(6,182,212,0.2)] dark:shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-200"
          >
            <FiFlag size={12} /> This is Mine
          </button>
        )}
      </div>

      {/* Claim Modal */}
      {showClaim && (
        <ClaimModal
          item={item}
          onClose={() => setShowClaim(false)}
          onSuccess={() => setShowClaim(false)}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !isDeleting && setShowConfirm(false)}
        itemType={item.type}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default ItemCard;
