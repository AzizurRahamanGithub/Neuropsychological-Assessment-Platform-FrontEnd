import { APP_CONFIG } from '@/config/app';
import type { APIError } from '@/types';

class APIClient {
  private baseUrl: string;
  private headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.baseUrl = APP_CONFIG.apiBaseUrl;
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers['Authorization'];
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: APIError = {
        status: response.status,
        message: data?.message || 'An error occurred',
        errors: data?.errors,
      };
      throw error;
    }

    return data;
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.headers,
      ...options,
    });

    return this.handleResponse(response);
  }

  async post<T>(
    endpoint: string,
    body?: Record<string, any>,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse(response);
  }

  async patch<T>(
    endpoint: string,
    body?: Record<string, any>,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse(response);
  }

  async put<T>(
    endpoint: string,
    body?: Record<string, any>,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse(response);
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers,
      ...options,
    });

    return this.handleResponse(response);
  }
}

export const apiClient = new APIClient();
