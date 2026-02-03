/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

import type { Request, Response, NextFunction } from 'express';
import type { LoginDTO, RegisterDTO, AuthResponse } from '@types/auth';
import type { ApiResponse } from '@types/api';
import { AuthService } from '@services/AuthService';
import { logger } from '@utils/logger';
import type { Knex } from 'knex';

/**
 * Authentication Controller
 */
export class AuthController {
  private authService: AuthService;

  constructor(private db: Knex) {
    this.authService = new AuthService(db);
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.debug('Register request received', { email: req.body.email });

      const data: RegisterDTO = req.body;
      const result = await this.authService.register(data);

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.debug('Login request received', { email: req.body.email });

      const data: LoginDTO = req.body;
      const result = await this.authService.login(data);

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.debug('Logout request received');

      // TODO: Get userId from authenticated request
      // await this.authService.logout(userId);

      const response: ApiResponse = {
        success: true,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.debug('Token refresh request received');

      const { refreshToken } = req.body;
      // TODO: Implement token refresh
      // const result = await this.authService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Token refresh not yet implemented',
          statusCode: 501,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(501).json(response);
    } catch (error) {
      next(error);
    }
  }
}
