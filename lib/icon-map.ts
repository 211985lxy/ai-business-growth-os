/**
 * Icon Mapping from Lucide to Material Symbols
 * Maps commonly used icon names to Material Symbols
 */

export const iconMap: Record<string, string> = {
  // Navigation
  home: "home",
  dashboard: "dashboard",
  menu: "menu",
  close: "close",

  // Actions
  add: "add",
  edit: "edit",
  delete: "delete",
  save: "save",
  search: "search",
  check: "check",
  cancel: "cancel",

  // Communication
  share: "share",
  send: "send",
  mail: "mail",
  notifications: "notifications",

  // Media
  play: "play_arrow",
  pause: "pause",
  stop: "stop",
  video: "videocam",
  image: "image",
  audio: "volume_up",

  // Files
  file: "description",
  folder: "folder",
  download: "download",
  upload: "upload",

  // Users
  user: "person",
  users: "groups",
  account: "account_circle",
  logout: "logout",

  // UI Elements
  expand: "expand_more",
  collapse: "expand_less",
  arrow_left: "arrow_back",
  arrow_right: "arrow_forward",
  arrow_up: "arrow_upward",
  arrow_down: "arrow_downward",

  // Misc
  settings: "settings",
  help: "help",
  info: "info",
  warning: "warning",
  error: "error",
  success: "check_circle",
  star: "star",
  favorite: "favorite",
  bookmark: "bookmark",
  lightbulb: "lightbulb",
  compass: "explore",
  mountain: "landscape",
  shield: "shield",
  coins: "payments",
  sparkle: "auto_awesome",
} as const;

/**
 * Get Material Icon name from common icon names
 */
export function getIcon(iconName: string): string {
  return iconMap[iconName] || iconName;
}
