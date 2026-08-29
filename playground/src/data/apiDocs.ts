export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiEndpoint {
  id: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  pathParams: Parameter[];
  queryParams: Parameter[];
  bodyParams?: Parameter[];
  responses: {
    status: number;
    statusText: string;
    description: string;
    body: Record<string, unknown>;
  }[];
  snippets: {
    curl: string;
    typescript: string;
    nodejs: string;
    python: string;
  };
}

export const API_DOCS: ApiEndpoint[] = [
  {
    id: 'get-user',
    category: 'Users',
    method: 'GET',
    path: '/v1/users/{user_id}',
    title: 'Get User',
    description: 'Retrieves the details of an existing user and their associated Stellar keypair metadata. You need only supply the unique user identifier that was returned upon creation.',
    pathParams: [
      {
        name: 'user_id',
        type: 'string (uuid)',
        required: true,
        description: 'The unique identifier of the user account to retrieve.'
      }
    ],
    queryParams: [
      {
        name: 'expand',
        type: 'array of strings',
        required: false,
        description: 'Specifies which fields in the response should be expanded. Valid values are organization, trustlines, or roles.'
      }
    ],
    responses: [
      {
        status: 200,
        statusText: '200 OK',
        description: 'Successful response containing the user object.',
        body: {
          id: 'usr_9b32c58',
          object: 'user',
          email: 'jane.doe@example.com',
          name: 'Jane Doe',
          public_key: 'GD2S7G7Y2KWPYH5V4N77D2N5P6K9F8K7L6M5N4P3Q2R1S0T9U8V7W6X5',
          created_at: 1678901234,
          updated_at: 1678901234,
          organization: {
            id: 'org_7f11a92',
            object: 'organization',
            name: 'Acme Corp'
          },
          metadata: {
            tier: 'enterprise',
            batch_enabled: true
          }
        }
      },
      {
        status: 404,
        statusText: '404 Not Found',
        description: 'The requested user does not exist or has been revoked.',
        body: {
          error: {
            code: 'resource_not_found',
            message: 'User usr_9b32c58 does not exist in the active namespace.'
          }
        }
      }
    ],
    snippets: {
      curl: `curl -X GET "https://api.stellarflow.dev/v1/users/usr_9b32c58?expand=organization" \\
  -H "Authorization: Bearer sk_test_123..." \\
  -H "Content-Type: application/json"`,
      typescript: `import { StellarFlow } from '@stellarbuild/stellar-flow';

const user = await StellarFlow.api.users.get('usr_9b32c58', {
  expand: ['organization', 'trustlines']
});

console.log(user.public_key);`,
      nodejs: `const { ApiClient, Configuration } = require('@stellarflow/sdk');

const client = new ApiClient(new Configuration({ apiKey: 'sk_test_123...' }));
const user = await client.users.get('usr_9b32c58', { expand: ['organization'] });
console.log(user);`,
      python: `from stellarflow import StellarFlowClient

client = StellarFlowClient(api_key="sk_test_123...")
user = client.users.get("usr_9b32c58", expand=["organization"])
print(user.name, user.public_key)`
    }
  },
  {
    id: 'create-token',
    category: 'Authentication',
    method: 'POST',
    path: '/v1/auth/tokens',
    title: 'Create Token',
    description: 'Generates a scoped cryptographic session token signed by a Stellar account keypair for ephemeral transaction relaying.',
    pathParams: [],
    queryParams: [],
    bodyParams: [
      {
        name: 'public_key',
        type: 'string (G...)',
        required: true,
        description: 'Stellar public address of the authenticating identity.'
      },
      {
        name: 'ttl_seconds',
        type: 'integer',
        required: false,
        description: 'Session lifetime in seconds (default: 3600).'
      }
    ],
    responses: [
      {
        status: 200,
        statusText: '200 OK',
        description: 'Session token issued successfully.',
        body: {
          token_id: 'tok_01h8v9w3',
          access_token: 'sf_sess_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_at: 1724068800,
          scope: 'relay:submit_tx'
        }
      }
    ],
    snippets: {
      curl: `curl -X POST "https://api.stellarflow.dev/v1/auth/tokens" \\
  -H "Content-Type: application/json" \\
  -d '{"public_key": "GBX6Y...4ZW3", "ttl_seconds": 7200}'`,
      typescript: `import { StellarFlow } from '@stellarbuild/stellar-flow';

const token = await StellarFlow.api.auth.createToken({
  publicKey: 'GBX6Y...4ZW3',
  ttlSeconds: 7200
});`,
      nodejs: `const token = await client.auth.createToken({ publicKey: 'GBX6Y...4ZW3' });`,
      python: `token = client.auth.create_token(public_key="GBX6Y...4ZW3", ttl_seconds=7200)`
    }
  },
  {
    id: 'revoke-token',
    category: 'Authentication',
    method: 'DELETE',
    path: '/v1/auth/tokens/{token_id}',
    title: 'Revoke Token',
    description: 'Immediately invalidates an active session token and clears all cached delegation credentials.',
    pathParams: [
      {
        name: 'token_id',
        type: 'string',
        required: true,
        description: 'The unique token ID to revoke.'
      }
    ],
    queryParams: [],
    responses: [
      {
        status: 200,
        statusText: '200 OK',
        description: 'Token successfully revoked.',
        body: {
          revoked: true,
          token_id: 'tok_01h8v9w3'
        }
      }
    ],
    snippets: {
      curl: `curl -X DELETE "https://api.stellarflow.dev/v1/auth/tokens/tok_01h8v9w3" \\
  -H "Authorization: Bearer sk_test_123..."`,
      typescript: `await StellarFlow.api.auth.revokeToken('tok_01h8v9w3');`,
      nodejs: `await client.auth.revokeToken('tok_01h8v9w3');`,
      python: `client.auth.revoke_token('tok_01h8v9w3')`
    }
  },
  {
    id: 'list-users',
    category: 'Users',
    method: 'GET',
    path: '/v1/users',
    title: 'List Users',
    description: 'Returns a paginated list of users filtered by organization or creation timestamp.',
    pathParams: [],
    queryParams: [
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum number of items returned (default 20, max 100).'
      },
      {
        name: 'starting_after',
        type: 'string (cursor)',
        required: false,
        description: 'Cursor for pagination.'
      }
    ],
    responses: [
      {
        status: 200,
        statusText: '200 OK',
        description: 'List of users.',
        body: {
          object: 'list',
          data: [
            { id: 'usr_01', name: 'Alice Smith', email: 'alice@example.com' },
            { id: 'usr_02', name: 'Bob Jones', email: 'bob@example.com' }
          ],
          has_more: false
        }
      }
    ],
    snippets: {
      curl: `curl -X GET "https://api.stellarflow.dev/v1/users?limit=10" -H "Authorization: Bearer sk_test_123..."`,
      typescript: `const users = await StellarFlow.api.users.list({ limit: 10 });`,
      nodejs: `const users = await client.users.list({ limit: 10 });`,
      python: `users = client.users.list(limit=10)`
    }
  },
  {
    id: 'get-organization',
    category: 'Organizations',
    method: 'GET',
    path: '/v1/organizations/{org_id}',
    title: 'Get Organization',
    description: 'Retrieves billing, multi-sig signer policies, and relayer bounds for an organization.',
    pathParams: [
      {
        name: 'org_id',
        type: 'string',
        required: true,
        description: 'The organization identifier.'
      }
    ],
    queryParams: [],
    responses: [
      {
        status: 200,
        statusText: '200 OK',
        description: 'Organization object.',
        body: {
          id: 'org_7f11a92',
          name: 'Acme Corp',
          plan: 'enterprise',
          relayer_balance_xlm: '450.2500000',
          auto_refill: true
        }
      }
    ],
    snippets: {
      curl: `curl -X GET "https://api.stellarflow.dev/v1/organizations/org_7f11a92" -H "Authorization: Bearer sk_test_123..."`,
      typescript: `const org = await StellarFlow.api.orgs.get('org_7f11a92');`,
      nodejs: `const org = await client.orgs.get('org_7f11a92');`,
      python: `org = client.orgs.get("org_7f11a92")`
    }
  },
  {
    id: 'list-members',
    category: 'Organizations',
    method: 'GET',
    path: '/v1/organizations/{org_id}/members',
    title: 'List Members',
    description: 'Lists all team members and their associated capability tokens within the organization.',
    pathParams: [
      {
        name: 'org_id',
        type: 'string',
        required: true,
        description: 'The organization ID.'
      }
    ],
    queryParams: [],
    responses: [
      {
        status: 200,
        statusText: '200 OK',
        description: 'List of members.',
        body: {
          data: [
            { user_id: 'usr_9b32c58', role: 'admin', joined_at: 1678901234 }
          ]
        }
      }
    ],
    snippets: {
      curl: `curl -X GET "https://api.stellarflow.dev/v1/organizations/org_7f11a92/members" -H "Authorization: Bearer sk_test_123..."`,
      typescript: `const members = await StellarFlow.api.orgs.listMembers('org_7f11a92');`,
      nodejs: `const members = await client.orgs.listMembers('org_7f11a92');`,
      python: `members = client.orgs.list_members("org_7f11a92")`
    }
  }
];
