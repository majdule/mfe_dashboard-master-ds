# TypeScript Quick Reference

Quick reference guide for working with TypeScript in the microfrontend dashboard project.

## Common Patterns

### React Components

```typescript
// Functional component with props
interface MyComponentProps {
  title: string;
  count?: number;  // Optional prop
  onUpdate: (value: string) => void;  // Callback prop
}

const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0, onUpdate }) => {
  return <div>{title}: {count}</div>;
};

export default MyComponent;
```

### React Hooks

```typescript
// useState
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);

// useRef
const divRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);

// useEffect
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependency]);

// Custom hook
function useCustomHook(): [string, (val: string) => void] {
  const [value, setValue] = useState<string>('');
  return [value, setValue];
}
```

### Module Federation Imports

```typescript
// Import remote module (types defined in module-federation.d.ts)
import { mount } from 'auth/AuthApp';

// Use with type safety
const result = mount(element, {
  initialPath: '/signin',
  onSignIn: () => console.log('Signed in!'),
});
```

### Vue 3 Components

```vue
<script lang="ts">
import { defineComponent, ref, Ref, computed, ComputedRef } from 'vue';

interface Item {
  id: number;
  name: string;
}

export default defineComponent({
  name: 'MyVueComponent',
  setup() {
    const items: Ref<Item[]> = ref([]);
    const count: ComputedRef<number> = computed(() => items.value.length);

    const addItem = (item: Item): void => {
      items.value.push(item);
    };

    return {
      items,
      count,
      addItem,
    };
  },
});
</script>
```

## Type Definitions

### Creating Interfaces

```typescript
// Simple interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Interface with optional properties
interface Config {
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
}

// Extending interfaces
interface Admin extends User {
  permissions: string[];
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### Type Aliases

```typescript
// Union types
type Status = 'pending' | 'success' | 'error';

// Function types
type Callback = (value: string) => void;
type AsyncCallback = (value: string) => Promise<void>;

// Object types
type Point = {
  x: number;
  y: number;
};

// Generic types
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

## Common Type Utilities

```typescript
// Partial - Make all properties optional
type PartialUser = Partial<User>;

// Required - Make all properties required
type RequiredConfig = Required<Config>;

// Pick - Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit - Exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;

// Record - Object with specific key/value types
type UserMap = Record<string, User>;

// ReturnType - Extract function return type
function getUser(): User { /* ... */ }
type UserType = ReturnType<typeof getUser>;  // User
```

## Event Handlers

```typescript
// Mouse events
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
  console.log('Clicked!');
};

// Input events
const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  const value = event.target.value;
};

// Form events
const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
  event.preventDefault();
  // Submit logic
};

// Keyboard events
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
  if (event.key === 'Enter') {
    // Handle enter key
  }
};
```

## Async/Await

```typescript
// Async function with type
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: User = await response.json();
  return data;
}

// Error handling
async function safeFetchUser(id: number): Promise<User | null> {
  try {
    const user = await fetchUser(id);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

// Using in component
const MyComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      const userData = await safeFetchUser(123);
      setUser(userData);
      setLoading(false);
    };

    loadUser();
  }, []);

  // ... render
};
```

## Material-UI with TypeScript

```typescript
import { makeStyles, Theme } from '@material-ui/core/styles';

// Type-safe styles
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    [theme.breakpoints.up('md')]: {
      fontSize: theme.typography.h3.fontSize,
    },
  },
}));

// In component
const MyComponent: React.FC = () => {
  const classes = useStyles();
  return <div className={classes.root}>Content</div>;
};
```

## Array Operations

```typescript
const users: User[] = [];

// Map with types
const userNames: string[] = users.map(user => user.name);

// Filter with types
const activeUsers: User[] = users.filter(user => user.isActive);

// Find with types
const firstAdmin: User | undefined = users.find(user => user.role === 'admin');

// Reduce with types
const totalAge: number = users.reduce((sum, user) => sum + user.age, 0);
```

## Type Guards

```typescript
// Type predicate
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}

// Usage
const data: unknown = fetchData();
if (isUser(data)) {
  // TypeScript knows data is User here
  console.log(data.name);
}

// Null checking
function processUser(user: User | null): void {
  if (user) {
    // TypeScript knows user is not null here
    console.log(user.name);
  }
}
```

## Enums

```typescript
// String enum
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST',
}

// Numeric enum
enum Status {
  Pending,
  InProgress,
  Complete,
}

// Usage
const role: UserRole = UserRole.Admin;
```

## Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>('hello');

// Generic component
interface SelectProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

function Select<T>({ items, onSelect, renderItem }: SelectProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} onClick={() => onSelect(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
```

## Debugging Tips

### Check inferred types

```typescript
// Hover over variable in IDE to see inferred type
const user = { id: 1, name: 'John' };  // Hover to see type

// Explicitly show type error to see what TypeScript thinks
const x: never = someValue;  // Error message shows actual type
```

### Type assertions

```typescript
// When you know better than TypeScript
const input = document.querySelector('#myInput') as HTMLInputElement;
input.value = 'hello';

// Alternative syntax
const input = <HTMLInputElement>document.querySelector('#myInput');
```

### Non-null assertion

```typescript
// When you're certain a value is not null
const element = document.querySelector('#root')!;  // ! means "definitely not null"
```

## Commands

```bash
# Type check without building
npx tsc --noEmit

# Type check with verbose output
npx tsc --noEmit --listFiles

# Watch mode for type checking
npx tsc --noEmit --watch

# Check specific file
npx tsc --noEmit src/App.tsx
```

## Quick Fixes

### "Cannot find module"

```typescript
// Create declaration file
// src/types/missing-module.d.ts
declare module 'missing-module';
```

### "Property does not exist on type"

```typescript
// Extend existing type
declare module '@material-ui/core/styles' {
  interface Theme {
    customProperty: string;
  }
}
```

### "Implicit any"

```typescript
// Add explicit type
const items: any[] = [];  // Quick fix
const items: Item[] = [];  // Better fix
```

## Best Practices

1. **Prefer interfaces over type aliases for objects**
   ```typescript
   interface User { }  // ✅ Preferred
   type User = { }     // ❌ Less preferred
   ```

2. **Use const assertions for literals**
   ```typescript
   const config = {
     api: 'https://api.example.com',
     timeout: 5000,
   } as const;  // Makes properties readonly
   ```

3. **Avoid `any`, use `unknown` instead**
   ```typescript
   const data: unknown = fetchData();  // ✅ Safe
   const data: any = fetchData();      // ❌ Unsafe
   ```

4. **Use utility types instead of manual typing**
   ```typescript
   type UserUpdate = Partial<User>;                    // ✅
   type UserUpdate = { id?: number; name?: string; }  // ❌
   ```

5. **Type component props, not children**
   ```typescript
   interface Props {
     title: string;
     children?: React.ReactNode;  // ✅ Built-in type
   }
   ```

---

**See Also**: [Full Migration Documentation](./typescript-migration.md)
