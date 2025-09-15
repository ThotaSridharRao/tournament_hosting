# Setting up React Project with shadcn/ui

## 1. Create new React project with TypeScript
```bash
npx create-next-app@latest earena-react --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd earena-react
```

## 2. Install shadcn/ui
```bash
npx shadcn@latest init
```

## 3. Install required dependencies
```bash
npm install motion
npm install clsx tailwind-merge
```

## 4. Create components structure
```bash
mkdir -p components/ui
```

## 5. Add the FlipWords components
- Copy flip-words.tsx to components/ui/
- Copy flip-words-demo.tsx to components/
- Update your main page to use the component

## 6. Configure lib/utils.ts
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```