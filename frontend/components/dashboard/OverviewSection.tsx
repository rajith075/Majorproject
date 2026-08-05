import { Activity, ShieldAlert } from "lucide-react";
import OverviewCard from "./OverviewCard";
import HealthScoreTrend from "@/components/dashboard/HealthScoreTrend";

export default function OverviewSection() {
  return (
    <div className="space-y-6">

      {/* KPI Cards */}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <OverviewCard
          title="AI Health Score"
          value="92"
          status="Excellent"
          trend="+2 this week"
          description="Your overall health indicators remain stable. AI analysis shows continuous improvement compared to previous readings."
          icon={Activity}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <OverviewCard
          title="AI Risk Assessment"
          value="18%"
          status="Low Risk"
          trend="Stable"
          description="No immediate medical concerns detected. Continue following medications and maintain your daily routine."
          icon={ShieldAlert}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />

      </section>

      

    </div>
  );
}