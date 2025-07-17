// HTTP status codes for errors and common responses
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  NO_CONTENT: 204,
};

// MongoDB error codes
export const MONGO_ERROR_CODE = {
  DUPLICATE_KEY: 11000,
};
