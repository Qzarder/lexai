const KEY = "lexai_user_id";

export function getUserId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "u_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(KEY, id);
  }
  return id;
}
