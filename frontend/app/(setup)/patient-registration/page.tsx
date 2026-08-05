import PatientWizard from "@/components/patient/PatientWizard";

export default function PatientRegistrationPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

      {/* Ambient Glow - Left */}
      <div className="absolute -top-56 -left-48 h-[650px] w-[650px] rounded-full bg-violet-400/25 blur-[180px]" />

      {/* Ambient Glow - Right */}
      <div className="absolute -top-20 right-[-180px] h-[550px] w-[550px] rounded-full bg-fuchsia-400/20 blur-[180px]" />

      {/* Bottom Glow */}
      <div className="absolute bottom-[-250px] left-1/3 h-[650px] w-[650px] rounded-full bg-purple-300/20 blur-[200px]" />

      {/* Decorative Shape */}
      <div
        className="
          absolute
          -top-24
          right-[-220px]
          h-[700px]
          w-[900px]
          rotate-[-18deg]
          rounded-[120px]
          bg-gradient-to-br
          from-violet-600/20
          via-fuchsia-400/15
          to-transparent
        "
      />

      {/* Decorative Shape */}
      <div
        className="
          absolute
          bottom-[-180px]
          left-[-180px]
          h-[550px]
          w-[700px]
          rotate-[18deg]
          rounded-[120px]
          bg-gradient-to-tr
          from-purple-300/20
          via-violet-200/15
          to-transparent
        "
      />

      {/* Mesh Pattern */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      {/* Content */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-8 py-12">

        <PatientWizard />

      </main>

    </div>
  );
}