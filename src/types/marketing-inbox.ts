export type MarketingNavIcon = 'inbox' | 'users' | 'channels' | 'attributes' | 'settings';

export interface MarketingNavChild {
  id: string;
  label: string;
}

export interface MarketingNavItem {
  id: string;
  label: string;
  icon: MarketingNavIcon;
  children?: MarketingNavChild[];
}

export interface MarketingInboxFilter {
  id: string;
  label: string;
}

export interface MarketingChannel {
  id: string;
  name: string;
  subtitle: string;
  brandClass: string;
  monogram: string;
  available: boolean;
}
