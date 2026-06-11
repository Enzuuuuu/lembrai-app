import type { Strategy } from "./types";
import { DailyStrategy } from "./strategies/daily.strategy";
import { WeeklyStrategy } from "./strategies/weekly.strategy";
import { WeekdayStrategy } from "./strategies/weekday.strategy";
import { MonthlyStrategy } from "./strategies/monthly.strategy";
import { SpecificDayStrategy } from "./strategies/specific-day.strategy";
import { MonthNameStrategy } from "./strategies/month-name.strategy";
import { YearlyStrategy } from "./strategies/yearly.strategy";
import { IntervalStrategy } from "./strategies/interval.strategy";
import { AlternatingStrategy } from "./strategies/alternating.strategy";
import { WeekendStrategy } from "./strategies/weekend.strategy";
import { WeekdayDaysStrategy } from "./strategies/weekday-days.strategy";
import { FirstLastDayStrategy } from "./strategies/first-last-day.strategy";
import { TomorrowStrategy } from "./strategies/tomorrow.strategy";
import { InXStrategy } from "./strategies/in-x.strategy";
import { NextWeekdayStrategy } from "./strategies/next-weekday.strategy";

const ALL: Strategy[] = [
  new DailyStrategy(),
  new WeeklyStrategy(),
  new WeekdayStrategy(),
  new MonthlyStrategy(),
  new SpecificDayStrategy(),
  new MonthNameStrategy(),
  new YearlyStrategy(),
  new IntervalStrategy(),
  new AlternatingStrategy(),
  new WeekendStrategy(),
  new WeekdayDaysStrategy(),
  new FirstLastDayStrategy(),
  new TomorrowStrategy(),
  new InXStrategy(),
  new NextWeekdayStrategy(),
].sort((a, b) => b.priority - a.priority);

export function classify(frase: string): Strategy | undefined {
  return ALL.find((s) => s.matches(frase));
}

export function getAllStrategies(): Strategy[] {
  return ALL;
}
