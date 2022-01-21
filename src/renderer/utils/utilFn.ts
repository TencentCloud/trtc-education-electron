// eslint-disable-next-line import/prefer-default-export
export function compareUserFn(
  first: Record<string, any>,
  second: Record<string, any>
) {
  if (first.isCameraStarted && !second.isCameraStarted) {
    return -1;
  }
  if (!first.isCameraStarted && second.isCameraStarted) {
    return 1;
  }
  if (first.userID <= second.userID) {
    return -1;
  }
  return 1;
}
