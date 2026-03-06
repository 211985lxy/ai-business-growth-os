# AI Business Growth OS - Component Library

Lobe Chat inspired UI component library built with Tailwind CSS v4 and Radix UI.

## Design System

### Color System

- **Primary**: Blue-500 (#3B82F6)
- **Dark Theme**: Slate-950 background
- **Accent**: Glass morphism effects with backdrop blur

### Typography

- **Font**: Geist Sans (system font stack)
- **Code**: Geist Mono (monospace)

## Components

### Base Components

#### Button

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Default</Button>
<Button variant="gradient">Gradient</Button>
<Button variant="glass">Glass</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Loading state
<Button loading>Loading...</Button>

// Icon button
<Button size="icon" variant="ghost">
  <Icon />
</Button>
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card variant="default">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Glass morphism variant
<Card variant="glass">
  {/* Glass effect card */}
</Card>
```

#### Input & Textarea

```tsx
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

<Input placeholder="Enter text..." />
<Textarea placeholder="Enter long text..." />
```

### Feedback Components

#### Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="destructive">Error</Badge>
```

#### Status Indicators

```tsx
import { StatusBadge, StatusDot, StatusIndicator } from "@/components/ui/status"

<StatusBadge status="success" />
<StatusDot status="processing" showLabel />
<StatusIndicator
  status="error"
  title="Error occurred"
  description="Something went wrong"
/>
```

#### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>;
```

### Loading States

#### Skeleton Loaders

```tsx
import {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  FormSkeleton,
  StatsSkeleton
} from "@/components/ui/skeleton"

<Skeleton className="h-4 w-32" />
<CardSkeleton />
<ListItemSkeleton />
<FormSkeleton />
<StatsSkeleton />
```

#### Loading Components

```tsx
import {
  LoadingSpinner,
  LoadingOverlay,
  LoadingScreen,
  LoadingBar
} from "@/components/ui/loading"

<LoadingSpinner size="md" />
<LoadingOverlay message="Loading..." />
<LoadingScreen
  message="Please wait"
  submessage="Preparing your content"
  logo="🚀"
/>
<LoadingBar progress={75} showLabel />
```

### Progress Indicators

```tsx
import { Progress, CircularProgress, StepProgress } from "@/components/ui/progress"

<Progress value={75} max={100} showLabel />
<CircularProgress value={75} size={60} showLabel />

<StepProgress
  steps={[
    { title: "Step 1", description: "First step" },
    { title: "Step 2", description: "Second step" },
    { title: "Step 3", description: "Third step" },
  ]}
  currentStep={1}
/>
```

### Empty States

```tsx
import {
  EmptyState,
  NoData,
  NoResults,
  NoTasks,
  ErrorState
} from "@/components/ui/empty-state"

<EmptyState
  icon="📭"
  title="No data"
  description="Get started by creating your first item"
  action={{ label: "Create", onClick: () => {} }}
/>

<NoData action={{ label: "Add Item", onClick: () => {} }} />
<NoResults />
<NoTasks />
<ErrorState
  title="Failed to load"
  action={{ label: "Retry", onClick: () => {} }}
/>
```

### Animation Components

```tsx
import {
  PageTransition,
  FadeIn,
  ScaleIn,
  SlideIn,
  StaggerContainer
} from "@/components/ui/motion-wrapper"

// Page transition (wrap your page content)
<PageTransition>
  <YourPageContent />
</PageTransition>

// Fade in animation
<FadeIn delay={0.2}>
  <Content />
</FadeIn>

// Slide in from direction
<SlideIn direction="up" delay={0.3}>
  <Content />
</SlideIn>

// Stagger children
<StaggerContainer staggerDelay={0.1}>
  <Item1 />
  <Item2 />
  <Item3 />
</StaggerContainer>
```

### Content Components

#### Markdown Renderer

```tsx
import { Markdown } from "@/components/ui/markdown";

<Markdown content={markdownString} className="prose" />;
```

Features:

- GitHub Flavored Markdown
- Syntax highlighting for code blocks
- Custom styling for tables, lists, quotes
- Auto-link detection

### Form Components

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"

<Form>
  <FormField>
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" />
      </FormControl>
    </FormItem>
  </FormField>
</Form>

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Utility Classes

### Glass Effect

```tsx
<div className="glass">Glass morphism background</div>
```

### Gradient Text

```tsx
<h1 className="gradient-text">Gradient heading</h1>
```

### Hover Lift

```tsx
<button className="hover-lift">Lifts on hover</button>
```

## Animation Utilities

### CSS Animations

- `animate-shimmer` - Shimmer effect
- `animate-pulse-subtle` - Subtle pulse
- `animate-bounce` - Bounce animation
- `animate-spin` - Spin animation

## Dark Mode

All components support dark mode. The app defaults to dark theme with Slate color system.

```tsx
// Toggle dark mode
<html className="dark" /> // Dark theme
<html /> // Light theme
```

## Customization

### Theme Colors

Edit `app/globals.css` to customize theme colors:

```css
.dark {
  --primary: 217.2 91.2% 59.8%; /* Blue-500 */
  --background: 222.2 84% 4.9%; /* Slate-950 */
  --foreground: 210 40% 98%; /* Slate-50 */
  /* ... */
}
```

## Examples

### Loading State with Skeleton

```tsx
import { CardSkeleton } from "@/components/ui/skeletons";

{
  loading ? <CardSkeleton /> : <Card>{data}</Card>;
}
```

### Async Action with Loading Button

```tsx
const [loading, setLoading] = useState(false)

<Button
  loading={loading}
  onClick={async () => {
    setLoading(true)
    await action()
    setLoading(false)
  }}
>
  Submit
</Button>
```

### Status-Driven UI

```tsx
import { StatusIndicator } from "@/components/ui/status";

{
  status === "error" && (
    <StatusIndicator status="error" title="Upload failed" description={errorMessage} />
  );
}

{
  status === "success" && <StatusIndicator status="success" title="Upload complete" />;
}
```

## Best Practices

1. **Use semantic variants** - Choose appropriate badge/alert variants for status
2. **Provide loading states** - Use skeleton loaders for better UX
3. **Handle empty states** - Show helpful empty states instead of blank space
4. **Use animations sparingly** - Apply fade/slide for polish, not distraction
5. **Glass for depth** - Use glass variant for overlay/modals
6. **Responsive by default** - All components work on mobile

## License

MIT
