const getApiErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data?.message;
  if (responseMessage) {
    return responseMessage;
  }

  const validationErrors = error?.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors[0].msg || fallbackMessage;
  }

  if (error?.request) {
    return 'Cannot reach the server. Start the backend and make sure PostgreSQL is reachable with the configured DB_HOST and DB_PORT.';
  }

  return fallbackMessage;
};

export default getApiErrorMessage;
