// Category type definitions

export interface Category {
  id: number;
  name: string;
  icon: string;
  userId: string;
  createdAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  icon: string;
}
