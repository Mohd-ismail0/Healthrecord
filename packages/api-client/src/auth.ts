/**
 * Authentication utilities for AWS Cognito
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region?: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface SignUpParams extends UserCredentials {
  email: string;
  name?: string;
  phoneNumber?: string;
}

export class AuthService {
  private config: CognitoConfig;
  private tokens?: AuthTokens;
  private userPool: CognitoUserPool;
  private currentUser: CognitoUser | null = null;

  constructor(config: CognitoConfig) {
    this.config = config;
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    });
  }

  /**
   * Sign in with username and password
   */
  async signIn(credentials: UserCredentials): Promise<AuthTokens> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: credentials.username,
        Password: credentials.password,
      });

      const cognitoUser = new CognitoUser({
        Username: credentials.username,
        Pool: this.userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession) => {
          this.currentUser = cognitoUser;
          const tokens: AuthTokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
            expiresIn: session.getAccessToken().getExpiration(),
          };
          this.tokens = tokens;
          resolve(tokens);
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required (first time login)
          reject(new Error('New password required. Please use changePassword.'));
        },
      });
    });
  }

  /**
   * Sign up new user
   */
  async signUp(params: SignUpParams): Promise<void> {
    return new Promise((resolve, reject) => {
      const attributes: CognitoUserAttribute[] = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: params.email,
        }),
      ];

      if (params.name) {
        attributes.push(
          new CognitoUserAttribute({
            Name: 'name',
            Value: params.name,
          })
        );
      }

      if (params.phoneNumber) {
        attributes.push(
          new CognitoUserAttribute({
            Name: 'phone_number',
            Value: params.phoneNumber,
          })
        );
      }

      this.userPool.signUp(
        params.username,
        params.password,
        attributes,
        [],
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Confirm sign up with verification code
   */
  async confirmSignUp(username: string, code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Resend verification code
   */
  async resendConfirmationCode(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentUser) {
        this.currentUser.signOut(() => {
          this.currentUser = null;
          this.tokens = undefined;
          resolve();
        });
      } else {
        this.tokens = undefined;
        resolve();
      }
    });
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        reject(new Error('No user session'));
        return;
      }

      this.currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          // Try to refresh using refresh token
          this.currentUser!.refreshSession(
            {
              getToken: () => refreshToken,
            },
            (refreshErr, refreshedSession) => {
              if (refreshErr || !refreshedSession) {
                reject(refreshErr || new Error('Failed to refresh session'));
                return;
              }
              const tokens: AuthTokens = {
                accessToken: refreshedSession.getAccessToken().getJwtToken(),
                idToken: refreshedSession.getIdToken().getJwtToken(),
                refreshToken: refreshedSession.getRefreshToken().getToken(),
                expiresIn: refreshedSession.getAccessToken().getExpiration(),
              };
              this.tokens = tokens;
              resolve(tokens);
            }
          );
        } else {
          const tokens: AuthTokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
            expiresIn: session.getAccessToken().getExpiration(),
          };
          this.tokens = tokens;
          resolve(tokens);
        }
      });
    });
  }

  /**
   * Forgot password
   */
  async forgotPassword(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Confirm forgot password with code
   */
  async confirmForgotPassword(
    username: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        reject(new Error('No user session'));
        return;
      }

      this.currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No active session'));
          return;
        }

        this.currentUser!.changePassword(oldPassword, newPassword, (changeErr) => {
          if (changeErr) {
            reject(changeErr);
            return;
          }
          resolve();
        });
      });
    });
  }

  /**
   * Get current Cognito user
   */
  getCurrentUser(): Promise<CognitoUser | null> {
    return new Promise((resolve) => {
      this.userPool.getCurrentUser((err, user) => {
        if (err || !user) {
          resolve(null);
          return;
        }
        this.currentUser = user;
        resolve(user);
      });
    });
  }

  /**
   * Check if user session is valid
   */
  async checkSession(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return false;
      }

      return new Promise((resolve) => {
        user.getSession((err: Error | null, session: CognitoUserSession | null) => {
          if (err || !session || !session.isValid()) {
            resolve(false);
            return;
          }
          // Update tokens
          this.tokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
            expiresIn: session.getAccessToken().getExpiration(),
          };
          resolve(true);
        });
      });
    } catch {
      return false;
    }
  }

  /**
   * Get current tokens
   */
  getTokens(): AuthTokens | undefined {
    return this.tokens;
  }

  /**
   * Set tokens (useful after sign-in)
   */
  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokens?.accessToken;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | undefined {
    return this.tokens?.accessToken;
  }
}

// Singleton instance
let authServiceInstance: AuthService | undefined;

/**
 * Initialize auth service
 */
export function initAuthService(config: CognitoConfig): AuthService {
  authServiceInstance = new AuthService(config);
  return authServiceInstance;
}

/**
 * Get auth service instance
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    throw new Error('AuthService not initialized. Call initAuthService first.');
  }
  return authServiceInstance;
}

export default AuthService;
