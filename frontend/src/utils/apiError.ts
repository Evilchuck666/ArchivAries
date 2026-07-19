export function getApiErrorKey(err: unknown): string {
  const status = (err as any)?.response?.status;
  switch (status) {
    case 400: return 'errors.bad_request';
    case 401: return 'errors.unauthorized';
    case 403: return 'errors.forbidden';
    case 404: return 'errors.not_found';
    case 409: return 'errors.conflict';
    default:  return 'errors.generic';
  }
}
