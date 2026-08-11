// backend/utils/orderPriority.js
//
// Shared "current orders first" ordering used by every order list endpoint
// (customer/shopkeeper/super-admin): active orders (not yet Delivered or
// Cancelled) before Delivered, before Cancelled — newest first within each
// group. Centralized so the three call sites can't drift out of sync.

// $addFields stage: computes a numeric bucket per order.
// 0 = active (Pending/Confirmed/Packed/Ready to Deliver/Out For Delivery/Ready for Pickup)
// 1 = Delivered (completed)
// 2 = Cancelled
const ORDER_PRIORITY_ADD_FIELDS_STAGE = {
  $addFields: {
    __priority: {
      $switch: {
        branches: [
          { case: { $eq: ['$status', 'Cancelled'] }, then: 2 },
          { case: { $eq: ['$status', 'Delivered'] }, then: 1 },
        ],
        default: 0,
      },
    },
  },
};

// $sort stage: priority bucket first, then newest-first within the bucket.
const ORDER_PRIORITY_SORT_STAGE = { $sort: { __priority: 1, createdAt: -1 } };

// $unset stage: drop the synthetic field before returning documents to the client.
const ORDER_PRIORITY_UNSET_STAGE = { $unset: '__priority' };

module.exports = {
  ORDER_PRIORITY_ADD_FIELDS_STAGE,
  ORDER_PRIORITY_SORT_STAGE,
  ORDER_PRIORITY_UNSET_STAGE,
};
