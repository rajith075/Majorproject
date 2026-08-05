"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

import {
  healthTrend,
  healthTrendSummary,
} from "../../constants/dashboard";

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-medium text-slate-500">
        {payload[0].payload.day}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {payload[0].value}
      </p>

      <p className="text-xs text-slate-500">
        Health Score
      </p>
    </div>
  );
};

export default function HealthScoreTrend() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-lg">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-semibold text-slate-900">
            Health Score Trend
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overall health performance over the last 7 days
          </p>

        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Last 7 Days
        </div>

      </div>

      {/* Chart */}

      <div className="mt-10 h-[280px]">

        <ResponsiveContainer width="100%" height="100%">

         <AreaChart
  data={healthTrend}
  margin={{
    top: 10,
    right: 20,
    left: 10,
    bottom: 0,
  }}
>

            <defs>

              <linearGradient
                id="healthGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="5%"
                  stopColor="#2563EB"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#2563EB"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#E2E8F0"
            />

            <XAxis
  dataKey="day"
  tickLine={false}
  axisLine={false}
  interval={0}
  padding={{
    left: 15,
    right: 15,
  }}
  tick={{
    fill: "#64748B",
    fontSize: 13,
  }}
/>

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#2563EB",
                strokeDasharray: "3 3",
              }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#2563EB"
              strokeWidth={4}
              fill="url(#healthGradient)"
              activeDot={{
                r: 7,
                strokeWidth: 3,
                stroke: "#ffffff",
                fill: "#2563EB",
              }}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* Bottom Section */}

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

        <div>

          <p className="text-sm text-slate-500">
            Current Health Score
          </p>

          <h3 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            {healthTrendSummary.currentScore}
          </h3>

        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4">

          <div className="rounded-full bg-emerald-100 p-2">

            <TrendingUp
              className="text-emerald-600"
              size={18}
            />

          </div>

          <div>

            <h4 className="text-lg font-semibold text-emerald-700">
              +{healthTrendSummary.weeklyChange}%
            </h4>

            <p className="text-sm text-slate-500">
              Improved from last week
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}