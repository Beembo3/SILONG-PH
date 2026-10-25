import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Cloudy,
  Moon,
  Snowflake,
  Sun,
} from "lucide-react";
import type { WeatherIcon } from "@/lib/weather/types";

const icons = {
  sun: Sun,
  moon: Moon,
  "cloud-sun": CloudSun,
  "cloud-moon": CloudMoon,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  showers: Cloudy,
  thunder: CloudLightning,
  snow: Snowflake,
} satisfies Record<WeatherIcon, typeof Sun>;

export function WeatherIconView({
  icon,
  className = "h-5 w-5",
}: {
  icon: WeatherIcon;
  className?: string;
}) {
  const Icon = icons[icon] ?? Cloud;
  return <Icon className={className} aria-hidden="true" />;
}
