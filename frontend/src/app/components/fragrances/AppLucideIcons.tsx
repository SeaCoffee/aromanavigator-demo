import type { LucideIcon } from 'lucide-react';

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bell,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleUserRound,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  Heart,
  Home,
  ImageIcon,
  Info,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  SlidersHorizontal,
  Sparkles,
  SprayCan,
  Star,
  Trash2,
  Upload,
  User,
  UserRound,
  Users,
  X,
} from 'lucide-react';

export const appIcons = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpDown: ArrowUpDown,

  bell: Bell,
  bookmark: Bookmark,
  bookmarkFilled: BookmarkCheck,

  calendar: Calendar,
  camera: Camera,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,

  clock: Clock,
  edit: Edit3,
  eye: Eye,
  eyeOff: EyeOff,

  filter: Filter,
  heart: Heart,
  home: Home,
  image: ImageIcon,
  info: Info,

  login: LogIn,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  message: MessageCircle,
  minus: Minus,

  package: Package,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  send: Send,
  settings: Settings,
  share: Share2,

  sliders: SlidersHorizontal,
  sparkles: Sparkles,
  spray: SprayCan,
  star: Star,
  trash: Trash2,
  upload: Upload,

  user: User,
  userRound: UserRound,
  account: CircleUserRound,
  users: Users,

  close: X,
} as const;

export type AppIconName = keyof typeof appIcons;

export type AppIconProps = {
  name: AppIconName;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

export function AppIcon({
  name,
  className = 'size-5',
  strokeWidth = 1.9,
  'aria-hidden': ariaHidden = true,
}: AppIconProps) {
  const Icon = appIcons[name] as LucideIcon;

  return (
    <Icon
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden={ariaHidden}
    />
  );
}
