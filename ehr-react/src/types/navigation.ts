import { LucideIcon } from 'lucide-react';

export interface PageInfo {
  title: string;
  actionButton?: ActionButton;
}

export interface ActionButton {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface UserProfile {
  name: string;
  role: string;
  avatar?: string;
}
