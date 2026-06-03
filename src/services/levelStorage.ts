export function saveLevel(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    return false
  }
}

export function loadLevel(key: string) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}
