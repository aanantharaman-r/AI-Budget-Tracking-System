import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Zap,
  Clapperboard,
  HeartPulse,
  Briefcase,
  Laptop,
  TrendingUp,
  Wallet,
  MoreHorizontal,
} from 'lucide-react'

const map = {
  utensils: Utensils,
  car: Car,
  home: Home,
  'shopping-bag': ShoppingBag,
  zap: Zap,
  clapperboard: Clapperboard,
  'heart-pulse': HeartPulse,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  wallet: Wallet,
  'more-horizontal': MoreHorizontal,
}

export default function CategoryIcon({ icon, size = 18, className = '', style }) {
  const Icon = map[icon] || Wallet
  return <Icon size={size} className={className} style={style} />
}
