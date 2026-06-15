/** Whether the user has enough data to place an order. */
export function isProfileReadyForCheckout(user) {
  if (!user) return false;
  if (user.profile_complete === false) return false;
  if (!String(user.name || "").trim()) return false;
  if (!String(user.phone || "").trim()) return false;
  if (!String(user.address || "").trim()) return false;
  return true;
}

export function missingProfileFields(user) {
  const missing = [];
  if (!String(user?.name || "").trim()) missing.push("name");
  if (!String(user?.phone || "").trim()) missing.push("phone");
  if (!String(user?.address || "").trim()) missing.push("address");
  return missing;
}
