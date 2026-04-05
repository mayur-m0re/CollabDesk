// Simple router utility to extract URL parameters
export function useParams() {
  const path = window.location.pathname
  const segments = path.split('/').filter(Boolean)
  
  // Return the last segment as id (common pattern)
  return {
    id: segments[segments.length - 1]
  }
}

export function navigateTo(path: string) {
  window.location.href = path
}
