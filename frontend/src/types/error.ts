// frontend/src/types/error.ts

export interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}
