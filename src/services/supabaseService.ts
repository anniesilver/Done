// Supabase service for all backend operations

import { supabase } from '../config/supabase';
import type { User, SignUpCredentials, SignInCredentials } from '../types/user';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';
import type { Category, CreateCategoryInput } from '../types/category';

// ==================== AUTH METHODS ====================

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(credentials: SignUpCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to create user' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: null };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          createdAt: new Date(session.user.created_at),
        };
        callback(user);
      } else {
        callback(null);
      }
    });

    return data.subscription;
  },
};

// ==================== TASK METHODS ====================

export const taskService = {
  /**
   * Get all tasks for the current user
   */
  async getTasks(userId: string): Promise<{ tasks: Task[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { tasks: null, error: error.message };
      }

      const tasks: Task[] = (data || []).map((row: any) => ({
        id: row.id,
        text: row.text,
        completed: row.completed,
        dueDate: row.due_date ? new Date(row.due_date) : null,
        reminderTime: row.reminder_time ? new Date(row.reminder_time) : null,
        recurrence: row.recurrence || 'none',
        categoryId: row.category_id,
        duration: row.duration || 0,
        userId: row.user_id,
        createdAt: new Date(row.created_at),
      }));

      return { tasks, error: null };
    } catch (error) {
      return { tasks: null, error: (error as Error).message };
    }
  },

  /**
   * Create a new task
   */
  async createTask(
    userId: string,
    input: CreateTaskInput
  ): Promise<{ task: Task | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          text: input.text,
          completed: input.completed || false,
          due_date: input.dueDate?.toISOString() || null,
          reminder_time: input.reminderTime?.toISOString() || null,
          recurrence: input.recurrence || 'none',
          category_id: input.categoryId || null,
          duration: input.duration || 0,
        })
        .select()
        .single();

      if (error) {
        return { task: null, error: error.message };
      }

      const task: Task = {
        id: data.id,
        text: data.text,
        completed: data.completed,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        reminderTime: data.reminder_time ? new Date(data.reminder_time) : null,
        recurrence: data.recurrence || 'none',
        categoryId: data.category_id,
        duration: data.duration || 0,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
      };

      return { task, error: null };
    } catch (error) {
      return { task: null, error: (error as Error).message };
    }
  },

  /**
   * Update a task
   */
  async updateTask(
    id: number | string,
    updates: UpdateTaskInput
  ): Promise<{ task: Task | null; error: string | null }> {
    try {
      const updateData: any = {};

      if (updates.text !== undefined) updateData.text = updates.text;
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.dueDate !== undefined)
        updateData.due_date = updates.dueDate?.toISOString() || null;
      if (updates.reminderTime !== undefined)
        updateData.reminder_time = updates.reminderTime?.toISOString() || null;
      if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.duration !== undefined) updateData.duration = updates.duration;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { task: null, error: error.message };
      }

      const task: Task = {
        id: data.id,
        text: data.text,
        completed: data.completed,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        reminderTime: data.reminder_time ? new Date(data.reminder_time) : null,
        recurrence: data.recurrence || 'none',
        categoryId: data.category_id,
        duration: data.duration || 0,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
      };

      return { task, error: null };
    } catch (error) {
      return { task: null, error: (error as Error).message };
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(id: number | string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },
};

// ==================== CATEGORY METHODS ====================

export const categoryService = {
  /**
   * Get all categories for the current user
   */
  async getCategories(
    userId: string
  ): Promise<{ categories: Category[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        return { categories: null, error: error.message };
      }

      const categories: Category[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        userId: row.user_id,
        createdAt: new Date(row.created_at),
      }));

      return { categories, error: null };
    } catch (error) {
      return { categories: null, error: (error as Error).message };
    }
  },

  /**
   * Create a new category
   */
  async createCategory(
    userId: string,
    input: CreateCategoryInput
  ): Promise<{ category: Category | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: input.name,
          icon: input.icon,
        })
        .select()
        .single();

      if (error) {
        return { category: null, error: error.message };
      }

      const category: Category = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
      };

      return { category, error: null };
    } catch (error) {
      return { category: null, error: (error as Error).message };
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },
};
