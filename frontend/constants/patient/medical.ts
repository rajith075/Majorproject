import {
  Heart,
  Brain,
  Activity,
  Bone,
  Wind,
  ShieldAlert,
  HeartPulse,
  Pill,
} from "lucide-react";

export const MEDICAL_CONDITIONS = [
  {
    name: "Diabetes",
    icon: Activity,
  },
  {
    name: "Hypertension",
    icon: HeartPulse,
  },
  {
    name: "Heart Disease",
    icon: Heart,
  },
  {
    name: "Asthma",
    icon: Wind,
  },
  {
    name: "Arthritis",
    icon: Bone,
  },
  {
    name: "Stroke",
    icon: ShieldAlert,
  },
  {
    name: "Parkinson's",
    icon: Brain,
  },
  {
    name: "Alzheimer's",
    icon: Brain,
  },
];

export const ALLERGIES = [
  "None",
  "Penicillin",
  "Dust",
  "Pollen",
  "Milk",
  "Eggs",
  "Nuts",
  "Seafood",
  "Latex",
];

export const MEDICATIONS = [
  "Insulin",
  "Metformin",
  "Aspirin",
  "Paracetamol",
  "Amlodipine",
  "Losartan",
  "Atorvastatin",
  "Vitamin D",
  "Calcium",
];
import {
  
  ShieldPlus,
  Droplets,
} from "lucide-react";

export const MEDICATION_GROUPS = [
  {
    title: "Diabetes",
    medicines: [
      "Insulin",
      "Metformin",
      "Glimepiride",
    ],
    icon: Activity,
  },
  {
    title: "Heart & BP",
    medicines: [
      "Aspirin",
      "Amlodipine",
      "Losartan",
      "Atorvastatin",
    ],
    icon: Heart,
  },
  {
    title: "Pain Relief",
    medicines: [
      "Paracetamol",
      "Ibuprofen",
    ],
    icon: Pill,
  },
  {
    title: "Supplements",
    medicines: [
      "Vitamin D",
      "Calcium",
      "Iron",
      "Multivitamin",
    ],
    icon: ShieldPlus,
  },
  {
    title: "Other",
    medicines: [
      "Other",
    ],
    icon: Droplets,
  },
];