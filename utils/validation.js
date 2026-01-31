
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  return {
    data: result.data,
    error: result.error,
    isValid: result.success,
  };
};

export const getFirstErrorMessage = (error) => {
  return error?.errors?.[0]?.message || "Validation failed";
};
