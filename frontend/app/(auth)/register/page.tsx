import RegisterForm from "@/components/auth/RegisterForm";
import GlassCard from "@/components/auth/layout/GlassCard";
import PageTransition from "@/components/auth/layout/PageTransition";
import HeroAnimation from "@/components/auth/hero/HeroAnimation";

import {
  Activity,
  Bell,
  Brain,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

        {/* Background Glow */}

        <div className="absolute -top-56 -left-48 h-[700px] w-[700px] rounded-full bg-violet-400/20 blur-[180px]" />

        <div className="absolute bottom-[-220px] right-[-120px] h-[620px] w-[620px] rounded-full bg-fuchsia-300/15 blur-[180px]" />

        {/* Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:radial-gradient(#8B5CF6_1px,transparent_1px)]
            [background-size:30px_30px]
          "
        />

        <main
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-screen
            max-w-[1600px]
            items-center
            justify-between
            gap-20
            px-10
            py-16
            lg:flex-row
            flex-col
          "
        >

          {/* LEFT */}

   <section
  className="
    relative
    flex
    flex-col
    justify-center
    max-w-2xl
  "
>

   
            <h1
              className="
                mt-10
                text-7xl
                font-black
                leading-[1]
                tracking-tight
                text-slate-900
              "
            >

              Intelligent Care

              <span
                className="
                  mt-3
                  block
                  bg-gradient-to-r
                  from-violet-600
                  via-fuchsia-500
                  to-purple-700
                  bg-clip-text
                  text-transparent
                "
              >
                For Every Family
              </span>

            </h1>

        
            

            <div className="mt-10 flex items-center gap-5">


            </div>
                    <div
  className="
    relative
    mt-12
    mb-12
    h-[340px]
    w-full
    overflow-hidden
    rounded-[36px]
  "
>
  <HeroAnimation />
</div>

           <div className="mt-16 grid gap-8">

  <Feature
    icon={<Activity className="h-6 w-6" />}
    title="Real-Time Health Monitoring"
    description="Monitor heart rate, blood pressure, oxygen level and overall health score anytime."
  />

  <Feature
    icon={<Brain className="h-6 w-6" />}
    title="AI Health Intelligence"
    description="Receive predictive health insights and smart recommendations based on patient data."
  />

  <Feature
    icon={<Bell className="h-6 w-6" />}
    title="Emergency Alerts"
    description="Instant notifications for falls, abnormal vitals and emergency situations."
  />

  <Feature
    icon={<ShieldCheck className="h-6 w-6" />}
    title="Privacy First"
    description="Healthcare-grade security keeps your family's medical information safe."
  />

</div>
          </section>

          {/* RIGHT */}

       <section
  className="
    relative
    flex
    w-full
    max-w-[600px]
    items-center
    justify-center
    lg:translate-x-[-70px]
  "
>

            {/* Soft Glow */}

            <div
              className="
                absolute
                -inset-10
                rounded-[48px]
                bg-gradient-to-br
                from-violet-500/10
                via-fuchsia-400/5
                to-transparent
                blur-3xl
              "
            />

            {/* Floating Circle */}

            <div
              className="
                absolute
                -top-10
                -right-8
                h-28
                w-28
                rounded-full
                border
                border-white/60
                bg-white/50
                backdrop-blur-xl
              "
            />

            {/* Floating Circle */}

            <div
              className="
                absolute
                -bottom-10
                -left-8
                h-20
                w-20
                rounded-full
                border
                border-violet-100
                bg-white/40
                backdrop-blur-xl
              "
            />

            <GlassCard>

              <RegisterForm />

            </GlassCard>

          </section>

        </main>

      </div>

    </PageTransition>

  );

}
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({
  icon,
  title,
  description,
}: FeatureProps) {
  return (
    <div
      className="
        group
        flex
        items-start
        gap-5
        rounded-3xl
        border
        border-transparent
        p-4
        transition-all
        duration-300
        hover:border-violet-100
        hover:bg-white/40
        hover:backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-violet-100
          to-fuchsia-100
          text-violet-700
          shadow-sm
          transition-all
          duration-300
          group-hover:scale-110
          group-hover:shadow-lg
        "
      >
        {icon}
      </div>

      <div>

        <h3
          className="
            text-lg
            font-bold
            text-slate-900
            transition-colors
            duration-300
            group-hover:text-violet-700
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2
            leading-7
            text-slate-500
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}