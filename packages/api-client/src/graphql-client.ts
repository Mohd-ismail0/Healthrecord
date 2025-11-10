/**
 * GraphQL Client for HealthTrack using Apollo Client
 */

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  split,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { API_BASE_URLS } from '@healthtrack/schemas';

export interface GraphQLClientConfig {
  uri?: string;
  environment?: 'production' | 'staging' | 'development';
  accessToken?: string;
  onTokenExpired?: () => Promise<string>;
}

export class HealthTrackGraphQLClient {
  public client: ApolloClient<NormalizedCacheObject>;
  private accessToken?: string;
  private onTokenExpired?: () => Promise<string>;

  constructor(config: GraphQLClientConfig = {}) {
    const uri = config.uri || `${API_BASE_URLS[config.environment || 'development']}/graphql`;
    this.accessToken = config.accessToken;
    this.onTokenExpired = config.onTokenExpired;

    // HTTP link for queries and mutations
    const httpLink = new HttpLink({
      uri,
    });

    // Auth link to add JWT token
    const authLink = setContext((_, { headers }) => {
      const token = this.getAccessToken();
      return {
        headers: {
          ...headers,
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      };
    });

    // Error link for handling auth errors
    const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          if (err.extensions?.code === 'UNAUTHENTICATED' && this.onTokenExpired) {
            // Token expired, try to refresh
            return this.onTokenExpired().then((newToken) => {
              this.setAccessToken(newToken);
              
              // Retry the operation with new token
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${newToken}`,
                },
              });
              
              return forward(operation);
            });
          }
        }
      }
      
      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
      }
    });

    // Combine links
    const link = ApolloLink.from([errorLink, authLink, httpLink]);

    // Create Apollo Client
    this.client = new ApolloClient({
      link,
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              records: {
                keyArgs: ['filter'],
                merge(existing, incoming, { args }) {
                  if (!existing || args?.offset === 0) {
                    return incoming;
                  }
                  return {
                    ...incoming,
                    records: [...(existing.records || []), ...(incoming.records || [])],
                  };
                },
              },
            },
          },
        },
      }),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
      },
    });
  }

  // ===== Auth Management =====

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  clearAccessToken(): void {
    this.accessToken = undefined;
    this.client.clearStore();
  }

  // ===== Cache Management =====

  async clearCache(): Promise<void> {
    await this.client.clearStore();
  }

  async resetCache(): Promise<void> {
    await this.client.resetStore();
  }
}

// Default export for convenience
export default HealthTrackGraphQLClient;
