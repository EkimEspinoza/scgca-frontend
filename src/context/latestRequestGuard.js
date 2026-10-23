export function createLatestRequestGuard() {
  let version = 0

  return {
    next() {
      version += 1
      return version
    },
    isCurrent(requestVersion) {
      return requestVersion === version
    },
    invalidate() {
      version += 1
    },
  }
}
