/**
 * User Model
 * Represents the User database entity
 */

import type { User, UserResponse, CreateUserDTO, UpdateUserDTO } from '@types/user';
import type { Knex } from 'knex';

/**
 * User Model class
 * Handles database operations for users
 */
export class UserModel {
  private readonly tableName = 'users';

  constructor(private db: Knex) {}

  /**
   * Create a new user
   */
  async create(data: CreateUserDTO & { passwordHash: string }): Promise<User> {
    const [id] = await this.db(this.tableName).insert({
      email: data.email.toLowerCase(),
      name: data.name,
      password_hash: data.passwordHash,
      two_factor_enabled: false,
      email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const user = await this.findById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    const user = await this.db(this.tableName)
      .where('id', id)
      .first();

    return user ? this.mapDbToUser(user) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db(this.tableName)
      .where('email', email.toLowerCase())
      .first();

    return user ? this.mapDbToUser(user) : null;
  }

  /**
   * Update user
   */
  async update(id: number, data: UpdateUserDTO): Promise<User> {
    await this.db(this.tableName)
      .where('id', id)
      .update({
        name: data.name,
        email: data.email ? data.email.toLowerCase() : undefined,
        updated_at: new Date(),
      });

    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found after update');
    }
    return user;
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db(this.tableName).where('id', id).del();
    return result > 0;
  }

  /**
   * Get user count
   */
  async count(): Promise<number> {
    const result = await this.db(this.tableName).count('* as count').first();
    return result?.count || 0;
  }

  /**
   * Get all users (paginated)
   */
  async getAll(page: number = 1, limit: number = 10): Promise<User[]> {
    const offset = (page - 1) * limit;
    const users = await this.db(this.tableName)
      .offset(offset)
      .limit(limit)
      .orderBy('created_at', 'desc');

    return users.map((user) => this.mapDbToUser(user));
  }

  /**
   * Map database row to User type
   */
  private mapDbToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      twoFactorEnabled: row.two_factor_enabled,
      emailVerified: row.email_verified,
      lastLoginAt: row.last_login_at,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Convert User to UserResponse (without password hash)
   */
  static toResponse(user: User): UserResponse {
    const { passwordHash, ...response } = user;
    return response as UserResponse;
  }
}
