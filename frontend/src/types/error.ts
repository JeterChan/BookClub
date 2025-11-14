// frontend/src/types/error.ts

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}
