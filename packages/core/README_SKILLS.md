# Nova AI Skills Engine

Core skill management and execution engine for Nova AI platform.

## Features

- **Skill Registry**: Centralized registration and management of skills
- **Skill Engine**: Execute skills with permission checking and timeout handling
- **Permission Manager**: Fine-grained permission control for skill execution
- **Skill Chain**: Execute multiple skills in sequence or parallel with error handling

## Structure

```
src/
├── skills/
│   ├── types.ts              # Core interfaces and types
│   ├── skill-engine.ts       # Skill execution engine
│   ├── skill-registry.ts     # Skill registry and management
│   ├── permission-manager.ts # Permission and access control
│   ├── skill-chain.ts        # Chain execution
│   └── index.ts              # Public exports
└── index.ts
```

## Usage

### Basic Skill Execution

```typescript
import { SkillEngine, Skill } from '@nova/core';

const engine = new SkillEngine();

const mySkill: Skill = {
  metadata: {
    id: 'my-skill',
    name: 'My Skill',
    version: '1.0.0',
    description: 'A test skill',
    author: 'Nova Team',
    category: 'test',
    tags: ['test'],
    requiredPermissions: ['read:files'],
  },
  execute: async (input) => {
    return {
      success: true,
      data: `Executed with query: ${input.query}`,
    };
  },
};

engine.registerSkill(mySkill);

const result = await engine.execute('my-skill', {
  query: 'test query',
});
```

### Permission Management

```typescript
const permissionManager = engine.getPermissionManager();

// Grant permissions
permissionManager.grant('my-skill', ['read:files', 'write:files']);

// Revoke permissions
permissionManager.revoke('my-skill', ['write:files']);

// Set policy
permissionManager.setPolicy('restricted-skill', {
  skillId: 'restricted-skill',
  allowedPermissions: ['read:files'],
  deniedPermissions: ['execute:code'],
});
```

### Skill Chains

```typescript
import { SkillChain } from '@nova/core';

const chain = new SkillChain(engine);

const result = await chain.execute({
  id: 'my-chain',
  name: 'Multi-step operation',
  description: 'Execute multiple skills in sequence',
  steps: [
    { skillId: 'skill-1', params: { /* ... */ } },
    { skillId: 'skill-2', params: { /* ... */ }, onError: 'continue' },
    { skillId: 'skill-3', params: { /* ... */ } },
  ],
});
```

## API Reference

### SkillEngine

- `registerSkill(skill: Skill): void` - Register a single skill
- `registerSkills(skills: Skill[]): void` - Register multiple skills
- `execute(skillId: string, input: SkillInput): Promise<SkillOutput>` - Execute a skill
- `getSkills(): Skill[]` - Get all registered skills
- `getSkill(skillId: string): Skill | undefined` - Get skill by ID
- `getSkillsByCategory(category: string): Skill[]` - Get skills by category
- `unregisterSkill(skillId: string): boolean` - Unregister a skill
- `getPermissionManager(): PermissionManager` - Get permission manager

### PermissionManager

- `grant(skillId: string, permissions: SkillPermission[], expiresAt?: Date, grantedBy?: string): void`
- `revoke(skillId: string, permissions?: SkillPermission[]): void`
- `setPolicy(skillId: string, policy: PermissionPolicy): void`
- `hasPermission(skillId: string, permission: SkillPermission): boolean`
- `hasPermissions(skillId: string, permissions: SkillPermission[]): Promise<boolean>`
- `getPermissions(skillId: string): SkillPermission[]`
- `setDefaultPermissions(permissions: SkillPermission[]): void`

### SkillChain

- `execute(config: SkillChainConfig): Promise<SkillChainResult>` - Execute skill chain

## Types

### SkillPermission

Available permissions:
- `read:files` - Read file system
- `write:files` - Write to file system
- `network:http` - Make HTTP requests
- `network:websocket` - WebSocket connections
- `execute:code` - Execute arbitrary code
- `access:browser` - Browser automation
- `access:github` - GitHub API access
- `access:databases` - Database access
- `access:external-apis` - External API access
- `access:system` - System-level access

### Skill

```typescript
interface Skill {
  metadata: SkillMetadata;
  execute: SkillFunction;
  validate?: (input: SkillInput) => boolean | Promise<boolean>;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}
```

## Error Handling

```typescript
import { SkillError, PermissionError } from '@nova/core';

try {
  const result = await engine.execute('skill-id', input);
  if (!result.success) {
    console.error('Skill execution failed:', result.error);
  }
} catch (error) {
  if (error instanceof PermissionError) {
    console.error('Permission denied for skill:', error.skillId);
  } else if (error instanceof SkillError) {
    console.error('Skill error:', error.message, error.code);
  }
}
```

## License

MIT
