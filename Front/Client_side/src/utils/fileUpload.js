const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file) {
  if (!file) return { ok: true };
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Please choose a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be 5 MB or smaller." };
  }
  return { ok: true, previewUrl: URL.createObjectURL(file) };
}

export async function uploadProfilePhoto(file) {
  const check = validateImageFile(file);
  if (!check.ok) throw new Error(check.error);
  const { apiPostFormAuth } = await import("../api/client");
  const fd = new FormData();
  fd.append("photo", file);
  return apiPostFormAuth("auth/profile/photo", fd);
}
