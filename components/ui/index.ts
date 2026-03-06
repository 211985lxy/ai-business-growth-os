/**
 * UI Components Index
 * Centralized exports for all UI components
 */

// Base components
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Input } from "./input";
export { Textarea } from "./textarea";
export { Label } from "./label";

// Layout components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  type CardProps,
} from "./card";

// Feedback components
export { Badge, badgeVariants } from "./badge";
export { Alert, AlertTitle, AlertDescription } from "./alert";
export { StatusBadge, StatusDot, StatusIndicator, type Status } from "./status";
export { LoadingSpinner, LoadingOverlay, LoadingDots, LoadingBar, LoadingScreen } from "./loading";
export { Progress, CircularProgress, StepProgress } from "./progress";

// Skeleton loaders
export { Skeleton } from "./skeleton";
export {
  CardSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  FormSkeleton,
  ContentSkeleton,
  StatsSkeleton,
  CodeSkeleton,
  AvatarGroupSkeleton,
} from "./skeletons";

// Empty states
export {
  EmptyState,
  EmptyStateCard,
  NoData,
  NoResults,
  NoTasks,
  NoNotifications,
  ErrorState,
} from "./empty-state";

// Display components
export { Separator } from "./separator";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

// Animation components
export { PageTransition, FadeIn, ScaleIn, SlideIn, StaggerContainer } from "./motion-wrapper";

// Content components
export { Markdown, type MarkdownProps } from "./markdown";

// Form components
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "./form";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
