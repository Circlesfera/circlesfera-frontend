// Design System Components - Exportaciones principales
export { default as Button } from './components/Button';
export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/Card';
export { default as Input } from './components/Input';
export { default as Avatar, AvatarGroup } from './components/Avatar';
export { default as PostCard } from './components/PostCard';
export { default as Sidebar } from './components/Sidebar';
export { default as Header } from './components/Header';

// Design Tokens
export { designTokens, getColor, getSpacing, getShadow, getTransition, utilityClasses } from './design-tokens';

// Types
export type { ButtonProps } from './components/Button';
export type { CardProps } from './components/Card';
export type { InputProps } from './components/Input';
export type { AvatarProps } from './components/Avatar';
export type { PostCardProps } from './components/PostCard';
export type { SidebarProps, SidebarItem } from './components/Sidebar';
export type { HeaderProps } from './components/Header';
