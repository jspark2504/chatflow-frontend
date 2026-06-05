export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PagedApiResponse<T> {
  data: T[];
  message: string;
  status: number;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
