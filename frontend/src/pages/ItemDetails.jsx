import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API, { assetUrl } from "../services/api";
import { getStoredUserId } from "../utils/authStorage";
import ClaimModal from "../components/ClaimModal";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import AIVerificationCard from "../components/ai/AIVerificationCard";
import AIConfidenceBadge from "../components/ai/AIConfidenceBadge";
import MatchPercentageRing from "../components/ai/MatchPercentageRing";
import {
  FiEyeOff,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiDollarSign,
  FiLock,
  FiInfo,
  FiFlag,
  FiShield,
} from "react-icons/fi";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [claims, setClaims] = useState([]);
  const [myClaim, setMyClaim] = useState(null);
  const [showClaim, setShowClaim] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setLoadError("Invalid item link.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await API.get(`/items/${id}`);
      setItem(res.data);
    } catch (err) {
      setItem(null);
      const message = err.response?.data?.message || "Failed to load item details";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchClaims = useCallback(async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await API.get(`/claims/item/${id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setClaims(list);
      const myId = getStoredUserId();
      const mine = list.find(
        (c) => String(c.claimantUserId?._id || c.claimantUserId) === String(myId)
      );
      setMyClaim(mine || null);
    } catch {
      setClaims([]);
      setMyClaim(null);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
    fetchClaims();
  }, [fetchItem, fetchClaims]);

  const handleReviewClaim = async (claimId, newStatus) => {
    try {
      setBusy(true);
      await API.put(`/claims/${claimId}`, { status: newStatus });
      toast.success(`Claim has been ${newStatus}!`);
      fetchClaims();
      fetchItem();
    } catch (error) {
      toast.error(error.response?.data?.message || "Review action failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await API.delete(`/items/${id}`);
      toast.success(item.type === "lost" ? "Post removed — glad you got it back!" : "Post removed — thanks for helping!");
      navigate(item.type === "lost" ? "/lost-reports" : "/found-items");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove item.");
      setIsDeleting(false);
    }
  };

  const openChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      setBusy(true);
      const res = await API.post("/chat/create-room", { itemId: id });
      const roomId = res.data?.room?._id;
      if (roomId) navigate(`/messages/${roomId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Chat is only available between the item owner and the approved claimant."
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center text-gray-900 dark:text-white">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center text-gray-900 dark:text-white px-6 gap-4">
        <p className="text-center text-red-400">{loadError || "Item not found."}</p>
        <Link
          to="/items"
          className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-900 hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 transition"
        >
          Back to browse
        </Link>
      </div>
    );
  }

  const cover = item.images?.[0] ? assetUrl(item.images[0]) : "";
  const myId = getStoredUserId();
  const ownerId = item.postedBy?._id || item.postedBy;
  const isOwner = myId && ownerId && String(ownerId) === String(myId);
  const isClaimApproved = myClaim && myClaim.status === "approved";
  const shouldBlur = item.blurImage && !isOwner && !isClaimApproved;
  const canClaim = item.type === "found" && item.status === "open" && !isOwner && myId;
  const isFoundItem = item.type === "found";
  const sortedClaims = [...claims].sort(
    (a, b) =>
      (b.aiMatchPercentage ?? -1) - (a.aiMatchPercentage ?? -1) ||
      new Date(b.createdAt) - new Date(a.createdAt)
  );

  const dateFormatted = item.date
    ? new Date(item.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-black px-6 pt-28 pb-16 text-gray-900 dark:text-white relative overflow-hidden">
        <div className="absolute top-[10%] right-[-10%] w-[350px] h-[350px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto z-10 relative">
          <div className="bg-white/95 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">

            {/* Cover Image */}
            {cover ? (
              <div className="relative overflow-hidden aspect-video max-h-96 w-full bg-gray-900 dark:bg-slate-950 flex items-center justify-center border-b border-gray-200 dark:border-white/10 shadow-inner group">
                <img
                  src={cover}
                  alt=""
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    shouldBlur ? "blur-2xl scale-110 opacity-50 select-none pointer-events-none" : "group-hover:scale-101"
                  }`}
                />
                {shouldBlur && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center gap-3">
                    <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <FiLock className="text-red-400 text-xl" />
                    </div>
                    <h3 className="text-white font-bold text-lg tracking-wide uppercase">Sensitive Item Details Blurred</h3>
                    <p className="text-gray-300 text-xs max-w-md leading-relaxed">
                      Submit an ownership claim to reveal the full image.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video max-h-56 bg-slate-950/60 flex flex-col items-center justify-center border-b border-white/10 gap-2">
                <FiEyeOff className="text-gray-600 text-3xl" />
                <span className="text-gray-400 text-sm italic">No image provided</span>
              </div>
            )}

            {/* Details */}
            <div className="p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                    item.type === "lost"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  }`}
                >
                  {item.type}
                </span>
                <span className="text-xs text-gray-500">
                  Posted by {isOwner ? "You" : item.postedBy?.name || "Anonymous Finder"}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
                {item.title}
              </h1>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base mb-6 bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/5 p-4 rounded-xl">
                {item.description}
              </p>

              {isFoundItem && !isOwner && (
                <div className="mb-8">
                  {myClaim?.aiMatchPercentage != null ? (
                    <AIVerificationCard claim={myClaim} />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-cyan-500/25 p-5 text-center bg-cyan-500/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        AI verification compares claim details with this item&apos;s metadata to
                        produce a match score, confidence level, and similarity breakdown.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Specs */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8 bg-gray-100 dark:bg-slate-900/40 border border-gray-200 dark:border-white/5 p-6 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-cyan-400 shrink-0"><FiMapPin /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                    <p className="text-xs text-gray-900 dark:text-white font-medium">{item.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-cyan-400 shrink-0"><FiCalendar /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date & Time</p>
                    <p className="text-xs text-gray-900 dark:text-white font-medium">{dateFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-cyan-400 shrink-0"><FiTag /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</p>
                    <p className="text-xs text-gray-900 dark:text-white font-medium capitalize">{item.category}</p>
                  </div>
                </div>
                {item.reward && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 shrink-0"><FiDollarSign /></div>
                    <div>
                      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Reward</p>
                      <p className="text-xs text-amber-300 font-extrabold">{item.reward}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Claim / Status section */}
              <div className="flex flex-col gap-6 border-t border-gray-200 dark:border-white/10 pt-8">

                {!isOwner ? (
                  <div>
                    {myClaim ? (
                      <div className="space-y-4">
                      {myClaim.aiMatchPercentage != null && (
                        <AIVerificationCard claim={myClaim} compact />
                      )}
                      <div className="bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <h4 className="text-gray-900 dark:text-white font-bold text-sm mb-1 flex items-center gap-2">
                            <FiInfo className="text-cyan-400" /> Your Ownership Claim Status
                          </h4>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            Submitted via verified claim flow
                            {myClaim.rollNumber ? ` · Roll: ${myClaim.rollNumber}` : ""}
                          </p>
                          {/* Show answered questions */}
                          {myClaim.aiQuestions?.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {myClaim.aiQuestions.map((q, i) => (
                                <div key={i} className="text-xs">
                                  <span className="text-gray-500">Q: {q}</span>
                                  {myClaim.verificationAnswers?.[i] && (
                                    <span className="text-cyan-400 ml-2">→ {myClaim.verificationAnswers[i]}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {myClaim.status === "pending" && (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              Pending Approval
                            </span>
                          )}
                          {myClaim.status === "approved" && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
                              <FiCheckCircle /> Claim Approved
                            </span>
                          )}
                          {myClaim.status === "rejected" && (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full uppercase">
                              <FiAlertCircle /> Claim Rejected
                            </span>
                          )}
                        </div>
                      </div>
                      </div>
                    ) : canClaim ? (
                      <div className="bg-gray-100 dark:bg-slate-900/40 border border-gray-200 dark:border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 flex items-center gap-2">
                            <FiFlag className="text-cyan-400" /> Is this your item?
                          </h4>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            Start the AI-powered verification process to prove ownership.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowClaim(true)}
                          className="shrink-0 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition text-xs uppercase tracking-wider flex items-center gap-2"
                        >
                          <FiFlag size={14} /> This is Mine
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="bg-gray-100 dark:bg-slate-900/30 border border-gray-200 dark:border-white/5 p-4 rounded-xl text-center text-xs text-gray-400">
                      <FiInfo className="inline-block text-cyan-400 mr-1.5 text-sm" />
                      You posted this item. Review pending claims below.
                    </div>

                    {/* Owner remove button */}
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        item.type === "lost"
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25"
                          : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25"
                      }`}
                    >
                      {item.type === "lost" ? "✅ Item Retrieved — Remove Post" : "📦 Item Delivered — Remove Post"}
                    </button>
                  </div>
                )}

                {/* Chat button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="text-center sm:text-left">
                    <h4 className="text-gray-900 dark:text-white font-bold text-sm">Secure Campus Chat</h4>
                    <p className="text-gray-400 text-xs">
                      Connect directly with the finder or claimant. Locked until a claim is verified.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openChat}
                    disabled={busy || (!isOwner && (!myClaim || myClaim.status !== "approved"))}
                    className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:-translate-y-0 text-xs uppercase tracking-wider shrink-0"
                  >
                    <FiMessageSquare className="inline-block mr-1.5 text-sm" />
                    Open Secure Chat
                  </button>
                </div>
              </div>

              {/* Owner Claims Console */}
              {isOwner && (
                <div className="mt-10 border-t border-gray-200 dark:border-white/10 pt-10 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiCheckCircle className="text-cyan-400" /> Claims Verification Console
                    </h3>
                    {claims.length > 0 && (
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Sorted by AI match · highest first
                      </p>
                    )}
                  </div>

                  {claims.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-slate-900/20 border border-dashed border-white/10 rounded-xl p-8 text-center text-gray-500 text-xs">
                      No claims have been submitted for this item yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedClaims.map((claim) => (
                        <div
                          key={claim._id}
                          className="bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-4 transition-all hover:bg-gray-200 dark:hover:bg-slate-900/75"
                        >
                          <div className="flex flex-col lg:flex-row gap-4">
                            {claim.aiMatchPercentage != null && (
                              <div className="shrink-0 flex flex-col items-center gap-2">
                                <MatchPercentageRing
                                  percentage={claim.aiMatchPercentage}
                                  size={88}
                                  stroke={6}
                                />
                                <AIConfidenceBadge
                                  confidenceLevel={claim.confidenceLevel}
                                  verificationStatus={claim.verificationStatus}
                                  percentage={claim.aiMatchPercentage}
                                  compact
                                />
                              </div>
                            )}
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 flex-1">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{claim.claimantName}</span>
                                <span className="text-[10px] bg-gray-100 dark:bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded">
                                  {claim.claimantEmail}
                                </span>
                                {claim.rollNumber && (
                                  <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                                    Roll: {claim.rollNumber}
                                  </span>
                                )}
                                {claim.otpVerified && (
                                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                                    <FiShield size={10} /> OTP Verified
                                  </span>
                                )}
                              </div>

                              {claim.message && (
                                <p className="text-gray-300 text-xs bg-black/40 border border-gray-200 dark:border-white/5 p-3 rounded-lg leading-relaxed italic">
                                  "{claim.message}"
                                </p>
                              )}

                              {claim.aiSummary && (
                                <p className="text-xs text-cyan-400/90 bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-3 py-2 leading-relaxed">
                                  {claim.aiSummary}
                                </p>
                              )}

                              {/* AI Q&A display */}
                              {claim.aiQuestions?.length > 0 && (
                                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 space-y-2">
                                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <FiShield size={10} /> Verification Answers
                                  </p>
                                  {claim.aiQuestions.map((q, i) => (
                                    <div key={i} className="text-xs">
                                      <p className="text-gray-400">Q: {q}</p>
                                      <p className="text-gray-900 dark:text-white font-medium mt-0.5">
                                        A: {claim.verificationAnswers?.[i] || <span className="text-gray-600 italic">No answer</span>}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <span className="text-[10px] text-gray-500 block">
                                Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {claim.status === "pending" ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleReviewClaim(claim._id, "approved")}
                                    disabled={busy}
                                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                                  >
                                    <FiCheck /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReviewClaim(claim._id, "rejected")}
                                    disabled={busy}
                                    className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                                  >
                                    <FiX /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                                    claim.status === "approved"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-red-500/10 text-red-400 border-red-500/20"
                                  }`}
                                >
                                  {claim.status}
                                </span>
                              )}
                            </div>
                          </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-6">
                <Link to="/items" className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline text-sm font-semibold transition-colors">
                  ← Back to items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaim && (
        <ClaimModal
          item={item}
          onClose={() => setShowClaim(false)}
          onSuccess={() => {
            setShowClaim(false);
            fetchClaims();
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !isDeleting && setShowDeleteConfirm(false)}
        itemType={item?.type}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default ItemDetails;
