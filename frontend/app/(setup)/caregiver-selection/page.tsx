"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableCaregivers,
  assignCaregiver,
} from "@/services/api/patient";

import {
  HeartPulse,
  ShieldCheck,
  Star,
  Clock3,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Stethoscope,
  MapPin,
} from "lucide-react";

const caregivers = [
  {
    id: 1,
    name: "Ananya Rao",
    initials: "AR",
    experience: "8+ Years",
    rating: 4.9,
    reviews: 124,
    specialization: "Elderly & Geriatric Care",
    patients: 38,
    availability: "Available",
    location: "Bengaluru",
    description:
      "Experienced in elderly wellness, medication support and continuous patient monitoring.",
  },
  {
    id: 2,
    name: "Meera Sharma",
    initials: "MS",
    experience: "6+ Years",
    rating: 4.8,
    reviews: 96,
    specialization: "Senior Health & Mobility",
    patients: 31,
    availability: "Available",
    location: "Mangaluru",
    description:
      "Specializes in mobility assistance, daily care routines and senior wellbeing.",
  },
  {
    id: 3,
    name: "Priya Nair",
    initials: "PN",
    experience: "10+ Years",
    rating: 4.9,
    reviews: 157,
    specialization: "Chronic Care Management",
    patients: 52,
    availability: "Available",
    location: "Mysuru",
    description:
      "Focused on long-term elderly care, chronic conditions and medication adherence.",
  },
];

export default function CaregiverSelectionPage() {
  const router = useRouter();

  const [selectedCaregiver, setSelectedCaregiver] =
    useState<number | null>(null);

  const [assigning, setAssigning] = useState(false);

  const handleContinue = async () => {
    if (!selectedCaregiver) return;

    try {
      setAssigning(true);

      /*
       * BACKEND ASSIGNMENT WILL BE CONNECTED HERE.
       *
       * For now we are only building the UI.
       *
       * Later:
       *
       * POST /patient/assign-caregiver
       *
       * {
       *   caregiver_id: selectedCaregiver
       * }
       */

      console.log(
        "SELECTED CAREGIVER:",
        selectedCaregiver
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1800)
      );

      router.replace("/family-success");

    } catch (error) {
      console.error(
        "CAREGIVER ASSIGNMENT FAILED:",
        error
      );

      setAssigning(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-400/25 blur-[180px]" />

      <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-fuchsia-400/20 blur-[180px]" />

      <div className="absolute bottom-[-300px] left-1/3 h-[650px] w-[650px] rounded-full bg-purple-400/20 blur-[200px]" />

      <div
        className="
          absolute
          inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="relative z-10 min-h-screen">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="flex items-center justify-between px-8 py-7 lg:px-14">

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-2xl
                bg-gradient-to-br
                from-violet-600
                to-fuchsia-500
                shadow-lg
                shadow-violet-500/25
              "
            >
              <HeartPulse
                className="h-6 w-6 text-white"
                strokeWidth={2.5}
              />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Elderly Care AI
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Intelligent care. Better living.
              </p>
            </div>

          </div>

          <div
            className="
              hidden items-center gap-2
              rounded-full
              border border-violet-100
              bg-white/70
              px-4 py-2
              text-sm font-medium
              text-slate-600
              shadow-sm
              backdrop-blur-md
              sm:flex
            "
          >
            <ShieldCheck className="h-4 w-4 text-violet-600" />
            Secure Healthcare Platform
          </div>

        </header>

        {/* ===================================================
            MAIN
        =================================================== */}

        <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8">

          {/* =================================================
              INTRO
          ================================================= */}

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <div
              className="
                mb-5 inline-flex items-center gap-2
                rounded-full
                border border-violet-200/70
                bg-white/70
                px-4 py-2
                text-xs font-semibold
                text-violet-700
                shadow-sm
                backdrop-blur-md
              "
            >
              <Sparkles className="h-3.5 w-3.5" />

              Personalized Care
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">

              Choose the right{" "}

              <span
                className="
                  bg-gradient-to-r
                  from-violet-600
                  via-purple-600
                  to-fuchsia-500
                  bg-clip-text
                  text-transparent
                "
              >
                caregiver
              </span>

            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Select a trusted caregiver to support your loved
              one with personalized, compassionate and
              continuous care.
            </p>

          </div>

          {/* =================================================
              CAREGIVER CARDS
          ================================================= */}

          <div className="grid gap-6 lg:grid-cols-3">

            {caregivers.map((caregiver) => {

              const selected =
                selectedCaregiver === caregiver.id;

              return (
                <button
                  key={caregiver.id}
                  type="button"
                  onClick={() =>
                    setSelectedCaregiver(caregiver.id)
                  }
                  className={`
                    group relative
                    overflow-hidden
                    rounded-[30px]
                    border
                    p-7
                    text-left
                    transition-all
                    duration-300

                    ${
                      selected
                        ? `
                          border-violet-400
                          bg-white
                          shadow-[0_30px_80px_-25px_rgba(124,58,237,0.45)]
                          -translate-y-2
                        `
                        : `
                          border-violet-100
                          bg-white/80
                          shadow-[0_20px_60px_-30px_rgba(124,58,237,0.3)]
                          hover:-translate-y-2
                          hover:border-violet-200
                          hover:bg-white
                        `
                    }
                  `}
                >

                  {/* Selected indicator */}

                  {selected && (
                    <div className="absolute right-5 top-5">

                      <div
                        className="
                          flex h-8 w-8
                          items-center justify-center
                          rounded-full
                          bg-violet-600
                          text-white
                          shadow-lg
                          shadow-violet-500/30
                        "
                      >
                        <CheckCircle2
                          className="h-5 w-5"
                        />
                      </div>

                    </div>
                  )}

                  {/* Avatar */}

                  <div className="flex items-start gap-4">

                    <div
                      className="
                        flex h-16 w-16 shrink-0
                        items-center justify-center
                        rounded-[20px]
                        bg-gradient-to-br
                        from-violet-100
                        to-fuchsia-100
                        text-xl
                        font-bold
                        text-violet-700
                        ring-4
                        ring-violet-50
                      "
                    >
                      {caregiver.initials}
                    </div>

                    <div className="min-w-0">

                      <h3 className="text-xl font-bold text-slate-900">
                        {caregiver.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Stethoscope className="h-3.5 w-3.5" />

                        {caregiver.specialization}
                      </div>

                    </div>

                  </div>

                  {/* Availability */}

                  <div className="mt-6 flex items-center justify-between">

                    <div
                      className="
                        inline-flex items-center gap-2
                        rounded-full
                        bg-emerald-50
                        px-3 py-1.5
                        text-xs font-semibold
                        text-emerald-700
                      "
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />

                      {caregiver.availability}
                    </div>

                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">

                      <Star
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />

                      {caregiver.rating}

                      <span className="font-normal text-slate-400">
                        ({caregiver.reviews})
                      </span>

                    </div>

                  </div>

                  {/* Description */}

                  <p className="mt-6 min-h-[72px] text-sm leading-6 text-slate-600">
                    {caregiver.description}
                  </p>

                  {/* Stats */}

                  <div className="mt-6 grid grid-cols-3 gap-2">

                    <div
                      className="
                        rounded-2xl
                        bg-violet-50/70
                        p-3
                        text-center
                      "
                    >
                      <Award className="mx-auto h-4 w-4 text-violet-600" />

                      <p className="mt-1 text-xs font-bold text-slate-800">
                        {caregiver.experience}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Experience
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        bg-violet-50/70
                        p-3
                        text-center
                      "
                    >
                      <Users className="mx-auto h-4 w-4 text-violet-600" />

                      <p className="mt-1 text-xs font-bold text-slate-800">
                        {caregiver.patients}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Patients
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        bg-violet-50/70
                        p-3
                        text-center
                      "
                    >
                      <Clock3 className="mx-auto h-4 w-4 text-violet-600" />

                      <p className="mt-1 text-xs font-bold text-slate-800">
                        24/7
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Support
                      </p>
                    </div>

                  </div>

                  {/* Location */}

                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">

                    <MapPin className="h-3.5 w-3.5 text-violet-500" />

                    {caregiver.location}

                  </div>

                </button>
              );
            })}

          </div>

          {/* =================================================
              CONTINUE SECTION
          ================================================= */}

          <div className="mt-10 flex flex-col items-center justify-center">

            <p className="mb-4 text-sm text-slate-500">

              {selectedCaregiver
                ? "Your selected caregiver is ready."
                : "Select a caregiver to continue."}

            </p>

            <button
              type="button"
              disabled={!selectedCaregiver || assigning}
              onClick={handleContinue}
              className="
                group
                inline-flex
                min-w-[260px]
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-gradient-to-r
                from-violet-600
                to-fuchsia-500
                px-7
                py-4
                text-sm
                font-bold
                text-white
                shadow-xl
                shadow-violet-500/25
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:translate-y-0
              "
            >

              {assigning ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                  Assigning Caregiver...
                </>
              ) : (
                <>
                  Continue with Caregiver

                  <ArrowRight
                    className="
                      h-4 w-4
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </>
              )}

            </button>

          </div>

        </section>

      </div>

    </main>
  );
}