const Item = require("../models/Item");
const Claim = require("../models/Claim");
const User = require("../models/User");

const getPublicStats = async (req, res) => {
  try {
    const itemFilter = { isRemoved: { $ne: true } };

    const [
      totalReturned,
      totalItems,
      openItems,
      resolvedItems,
      lostReports,
      foundItems,
      pendingClaims,
      totalUsers,
    ] = await Promise.all([
      Item.countDocuments({ ...itemFilter, status: "resolved" }),
      Item.countDocuments(itemFilter),
      Item.countDocuments({ ...itemFilter, status: "open" }),
      Item.countDocuments({ ...itemFilter, status: "resolved" }),
      Item.countDocuments({ ...itemFilter, type: "lost" }),
      Item.countDocuments({ ...itemFilter, type: "found" }),
      Claim.countDocuments({ status: "pending" }),
      User.countDocuments({ isBanned: { $ne: true } }),
    ]);

    const semesterLabel =
      process.env.STATS_SEMESTER_LABEL || "this semester";

    res.json({
      itemsReturned: totalReturned,
      totalItems,
      openItems,
      resolvedItems,
      lostReports,
      foundItems,
      pendingClaims,
      totalUsers,
      headline: `${totalReturned} items returned ${semesterLabel}`,
      encouragement:
        totalReturned > 0
          ? "Every reunion starts with someone who cared enough to post."
          : "Be the first to help a classmate reconnect with what they lost.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublicStats };
