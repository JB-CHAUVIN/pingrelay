"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/libs/api";
import { toast } from "react-hot-toast";
import { PaginatedResponse } from "@/types/crud.types";

interface UseCrudOptions<TItem, TCreateInput, TUpdateInput> {
  endpoint: string;
  pageSize?: number;
  autoFetch?: boolean;
  onCreateSuccess?: (item: TItem) => void;
  onUpdateSuccess?: (item: TItem) => void;
  onDeleteSuccess?: (id: string) => void;
}

interface UseCrudReturn<TItem, TCreateInput, TUpdateInput> {
  // Data
  items: TItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // CRUD operations
  fetchItems: (page?: number) => Promise<void>;
  createItem: (data: TCreateInput) => Promise<TItem>;
  updateItem: (id: string, data: TUpdateInput) => Promise<TItem>;
  deleteItem: (id: string) => Promise<void>;

  // Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Utilities
  refresh: () => Promise<void>;
}

export default function useCrud<TItem extends { id: string }, TCreateInput, TUpdateInput>({
  endpoint,
  pageSize = 10,
  autoFetch = true,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseCrudOptions<TItem, TCreateInput, TUpdateInput>): UseCrudReturn<TItem, TCreateInput, TUpdateInput> {
  // Data state
  const [items, setItems] = useState<TItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch items with pagination
  const fetchItems = useCallback(
    async (page: number = currentPage) => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<PaginatedResponse<TItem>>(
          `${endpoint}?page=${page}&limit=${pageSize}`
        );
        setItems(response.items);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      } catch (error: any) {
        // Error handled by apiClient interceptor
        console.error("Failed to fetch items:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, pageSize, currentPage]
  );

  // Create item
  const createItem = useCallback(
    async (data: TCreateInput): Promise<TItem> => {
      setIsCreating(true);
      try {
        const newItem = await apiClient.post<TItem>(endpoint, data);
        toast.success("Created successfully");

        // Refresh the list
        await fetchItems(1); // Go back to first page

        onCreateSuccess?.(newItem);
        return newItem;
      } catch (error: any) {
        // Error handled by apiClient interceptor
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [endpoint, fetchItems, onCreateSuccess]
  );

  // Update item
  const updateItem = useCallback(
    async (id: string, data: TUpdateInput): Promise<TItem> => {
      setIsUpdating(true);
      try {
        const updatedItem = await apiClient.put<TItem>(`${endpoint}/${id}`, data);

        // Optimistically update the list
        setItems((prev) =>
          prev.map((item) => (item.id === id ? updatedItem : item))
        );

        toast.success("Updated successfully");
        onUpdateSuccess?.(updatedItem);
        return updatedItem;
      } catch (error: any) {
        // Error handled by apiClient interceptor
        // Refresh to get the correct state
        await fetchItems();
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [endpoint, fetchItems, onUpdateSuccess]
  );

  // Delete item
  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      setIsDeleting(true);

      // Store current state for potential rollback
      const previousItems = [...items];

      // Optimistically remove from UI
      setItems((prev) => prev.filter((item) => item.id !== id));

      try {
        await apiClient.delete(`${endpoint}/${id}`);
        toast.success("Deleted successfully");

        // Refresh to get accurate pagination
        await fetchItems(currentPage);

        onDeleteSuccess?.(id);
      } catch (error: any) {
        // Rollback on error
        setItems(previousItems);
        // Error handled by apiClient interceptor
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [endpoint, items, currentPage, fetchItems, onDeleteSuccess]
  );

  // Pagination controls
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        fetchItems(page);
      }
    },
    [totalPages, fetchItems]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const refresh = useCallback(() => {
    return fetchItems(currentPage);
  }, [fetchItems, currentPage]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchItems(1);
    }
  }, [autoFetch]); // Only run on mount

  return {
    // Data
    items,
    totalItems,
    totalPages,
    currentPage,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // CRUD operations
    fetchItems,
    createItem,
    updateItem,
    deleteItem,

    // Pagination
    goToPage,
    nextPage,
    prevPage,

    // Utilities
    refresh,
  };
}
