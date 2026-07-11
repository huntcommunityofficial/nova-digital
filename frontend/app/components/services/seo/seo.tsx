"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlassChart, faCheck, faArrowRight, faArrowLeft,
  faBolt, faStar, faRocket, faPenRuler, faPhone, faEnvelope, faVideo,
  faGlobe, faChartLine, faCode, faLink, faFileAlt, faServer,
  faMobileAlt, faShoppingCart, faHeadset, faSearchPlus,
} from "@fortawesome/free-solid-svg-icons";
import { StepNav } from "@/app/components/services/shared-components/StepNav";
import { Field } from "@/app/components/services/shared-components/Field";
import { StepHeader } from "@/app/components/services/shared-components/StepHeader";
import { Select } from "@/app/components/services/shared-components/Select";
import { Textarea } from "@/app/components/services/shared-components/Textarea";
import { OptionPills } from "@/app/components/services/shared-components/OptionPills";
import { SummaryRow } from "@/app/components/services/shared-components/SummaryRow";
import { Input } from "@/app/components/services/shared-components/Input";
import api, { submitOrder } from "@/app/lib/api";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#2EEBFF";
const ACCENT_DIM = "#2EEBFF18";
const ACCENT_GLOW = "#2EEBFF44";

// ─── Pricing ─────────────────────────────────────────────────────────────────

type FixedPackage = "starter" | "growth" | "authority";
type PackageType = FixedPackage | "custom";

const BASE_PRICES: Record<FixedPackage, number> = {
  starter: 600,
  growth: 1800,
  authority: 4500,
};

// null = unavailable, 0 = included, N = costs N
const ADDON_PRICE_MAP: Record<string, Partial<Record<FixedPackage, number | null>>> = {
  localSeo: { starter: 300, growth: 300, authority: 0 }, // authority: included
  ecommerce: { starter: null, growth: 500, authority: 500 },
  linkBuilding: { starter: 400, growth: 400, authority: 0 }, // authority: included
  contentPlan: { starter: 350, growth: 350, authority: 0 }, // authority: included
  support: { starter: 200, growth: 200, authority: 0 }, // authority: included
};

const RUSH_MULTIPLIER = 1.2;

function calcTotal(pkg: FixedPackage, addons: string[], deadline: string): number {
  let total = BASE_PRICES[pkg];
  if (deadline === "ASAP (rush fee)") total = Math.round(total * RUSH_MULTIPLIER);
  for (const id of addons) {
    const cost = ADDON_PRICE_MAP[id]?.[pkg];
    if (typeof cost === "number" && cost > 0) total += cost;
  }
  return total;
}

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  if (!phone.trim()) return true;
  return /^[+]?[\d\s\-().]{7,20}$/.test(phone.trim());
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FixedForm {
  kind: "fixed";
  package: FixedPackage;
  websiteUrl: string;
  businessName: string;
  industry: string;
  targetLocation: string;
  currentRanking: string;
  deadline: string;
  seoGoals: string[];
  addons: string[];
  description: string;
  name: string;
  email: string;
  phone: string;
}

interface CustomForm {
  kind: "custom";
  businessName: string;
  websiteUrl: string;
  industry: string;
  currentTraffic: string;
  competitors: string;
  targetKeywords: string;
  technicalIssues: string;
  contentStrategy: string;
  budgetExpectation: string;
  timelineExpectation: string;
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
}

type FormData = FixedForm | CustomForm;

// ─── Required fields config ───────────────────────────────────────────────────

const REQUIRED: Record<string, (keyof FixedForm | keyof CustomForm)[]> = {
  "fixed-1": ["businessName", "industry", "websiteUrl"],
  "fixed-4": ["name", "email"],
  "custom-1": ["businessName", "websiteUrl", "industry", "budgetExpectation"],
  "custom-3": ["name", "email"],
};

// ─── Static data ──────────────────────────────────────────────────────────────

const fixedPackages = [
  {
    id: "starter" as FixedPackage,
    label: "Starter",
    icon: faBolt,
    delivery: "2 weeks",
    tagline: "Foundation & quick wins",
    features: [
      "Technical SEO audit",
      "On-page optimisation (10 pages)",
      "Keyword research (50 keywords)",
      "Google Search Console setup",
      "Monthly ranking report",
      "1 month support",
    ],
  },
  {
    id: "growth" as FixedPackage,
    label: "Growth",
    icon: faStar,
    delivery: "4 weeks",
    tagline: "Consistent ranking momentum",
    popular: true,
    features: [
      "Full technical SEO audit",
      "On-page optimisation (30 pages)",
      "Keyword research (200 keywords)",
      "Competitor gap analysis",
      "Link building (10 backlinks/mo)",
      "Content plan (12 topics)",
      "Monthly performance report",
      "3 months support",
    ],
  },
  {
    id: "authority" as FixedPackage,
    label: "Authority",
    icon: faRocket,
    delivery: "6 weeks",
    tagline: "Dominate your niche",
    features: [
      "Enterprise technical audit",
      "Unlimited page optimisation",
      "Advanced keyword strategy",
      "Deep competitor intelligence",
      "Link building (30 backlinks/mo)",
      "Full content strategy",
      "Local & e-commerce SEO",
      "Core Web Vitals optimisation",
      "Quarterly strategy sessions",
      "6 months priority support",
    ],
  },
];

const allAddons = [
  { id: "localSeo", icon: faGlobe, label: "Local SEO", basePrice: 300 },
  { id: "ecommerce", icon: faShoppingCart, label: "E-commerce SEO", basePrice: 500 },
  { id: "linkBuilding", icon: faLink, label: "Link Building", basePrice: 400 },
  { id: "contentPlan", icon: faFileAlt, label: "Content Plan", basePrice: 350 },
  { id: "support", icon: faHeadset, label: "Priority Support", basePrice: 200 },
];

const seoGoalOptions = [
  { id: "rankings", icon: faChartLine, label: "Higher rankings" },
  { id: "traffic", icon: faSearchPlus, label: "Organic traffic" },
  { id: "technical", icon: faServer, label: "Technical fixes" },
  { id: "local", icon: faGlobe, label: "Local visibility" },
  { id: "content", icon: faFileAlt, label: "Content strategy" },
  { id: "speed", icon: faMobileAlt, label: "Page speed / CWV" },
];

const industries = [
  "Technology", "Healthcare", "Finance", "E-commerce", "Real Estate",
  "Education", "Legal", "Food & Beverage", "Fashion", "Travel", "Other",
];

const currentRankingOptions = [
  "Not ranked yet",
  "Page 3+ (position 21+)",
  "Page 2 (position 11–20)",
  "Page 1 (position 1–10)",
  "Already ranking well, want more",
];

const trafficOptions = ["< 500/mo", "500–5k/mo", "5k–50k/mo", "50k+/mo"];
const deadlines = ["ASAP (rush fee)", "2 weeks", "1 month", "2 months", "Flexible"];
const budgetOptions = ["Under $1k", "$1k–$3k", "$3k–$10k", "$10k+", "Not sure yet"];
const timelineOptions = ["ASAP", "1–2 months", "3–6 months", "6+ months", "Flexible"];
const contactOptions = [
  { id: "email", icon: faEnvelope, label: "Email" },
  { id: "phone", icon: faPhone, label: "Phone" },
  { id: "video", icon: faVideo, label: "Video Call" },
];

const FIXED_STEPS = ["Package", "Project", "Goals", "Details", "Review"];
const CUSTOM_STEPS = ["Package", "Project", "Strategy", "Submit"];

// ─── Defaults ─────────────────────────────────────────────────────────────────

function defaultFixed(): FixedForm {
  return {
    kind: "fixed", package: "growth", websiteUrl: "", businessName: "",
    industry: "", targetLocation: "", currentRanking: "", deadline: "",
    seoGoals: [], addons: [], description: "", name: "", email: "", phone: "",
  };
}

function defaultCustom(): CustomForm {
  return {
    kind: "custom", businessName: "", websiteUrl: "", industry: "",
    currentTraffic: "", competitors: "", targetKeywords: "",
    technicalIssues: "", contentStrategy: "", budgetExpectation: "",
    timelineExpectation: "", name: "", email: "", phone: "", preferredContact: "",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SeoOrder() {
  const [packageType, setPackageType] = useState<PackageType>("growth");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [form, setForm] = useState<FormData>(defaultFixed());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const isCustom = packageType === "custom";
  const steps = isCustom ? CUSTOM_STEPS : FIXED_STEPS;

  useEffect(() => {
    api.get("/api/user")
      .catch(() => {
        router.push("/login?reason=auth");
      });
  }, []);

  // ── Setters ───────────────────────────────────────────────────────────────

  function setFixed<K extends keyof FixedForm>(key: K, value: FixedForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value } as FixedForm));
  }

  function setCustomField<K extends keyof CustomForm>(key: K, value: CustomForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value } as CustomForm));
  }

  function toggleAddon(id: string) {
    if (form.kind !== "fixed") return;
    const cur = form.addons;
    setFixed("addons", cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]);
  }

  function toggleGoal(id: string) {
    if (form.kind !== "fixed") return;
    const cur = form.seoGoals;
    setFixed("seoGoals", cur.includes(id) ? cur.filter((g) => g !== id) : [...cur, id]);
  }

  function switchPackageType(type: PackageType) {
    setPackageType(type);
    setStep(0);
    setAttempted(false);
    setForm(type === "custom"
      ? defaultCustom()
      : { ...defaultFixed(), package: type as FixedPackage });
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function canProceed(): boolean {
    const key = `${isCustom ? "custom" : "fixed"}-${step}`;
    const fields = REQUIRED[key];
    if (!fields) return true;
    const data = form as unknown as Record<string, unknown>;
    return fields.every((f) => {
      const val = data[f];
      if (typeof val !== "string") return true;
      if (val.trim() === "") return false;
      if (f === "email") return isValidEmail(val);
      const phoneVal = (form as unknown as Record<string, unknown>)["phone"];
      if (typeof phoneVal === "string" && phoneVal.trim() !== "") {
        if (!isValidPhone(phoneVal)) return false;
      }
      return true;
    });
  }

  function isMissing(field: keyof FixedForm | keyof CustomForm): boolean {
    if (!attempted) return false;
    const data = form as unknown as Record<string, unknown>;
    const val = data[field];
    return typeof val === "string" && val.trim() === "";
  }

  function isEmailInvalid(field: keyof FixedForm | keyof CustomForm): boolean {
    if (!attempted) return false;
    const data = form as unknown as Record<string, unknown>;
    const val = data[field];
    if (typeof val !== "string" || val.trim() === "") return false;
    return field === "email" && !isValidEmail(val);
  }

  function isPhoneInvalid(field: keyof FixedForm | keyof CustomForm): boolean {
    if (!attempted) return false;
    const data = form as unknown as Record<string, unknown>;
    const val = data[field];
    if (typeof val !== "string" || val.trim() === "") return false;
    return !isValidPhone(val);
  }

  function tryNext(next: number) {
    setAttempted(true);
    if (!canProceed()) return;
    setAttempted(false);
    setStep(next);
  }

  function tryBack(prev: number) {
    setAttempted(false);
    setStep(prev);
  }

  async function handleSubmit() {
    setAttempted(true);
    if (!canProceed()) return;

    setLoading(true);
    setError(null);

    try {
      if (fixedForm) {
        await submitOrder({
          service: "seo",
          client_name: fixedForm.name,
          email: fixedForm.email,
          phone: fixedForm.phone || undefined,
          details: {
            kind: fixedForm.kind,
            package: fixedForm.package,
            addons: fixedForm.addons,
            deadline: fixedForm.deadline,
            details: {
              ...fixedForm,
            },
          },
        });
      } else if (customForm) {
        await submitOrder({
          service: "seo",
          client_name: customForm.name,
          email: customForm.email,
          phone: customForm.phone || undefined,
          details: {
            ...customForm,
          },
        });
      }

      setSubmitted(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const fixedForm = form.kind === "fixed" ? form : null;
  const customForm = form.kind === "custom" ? form : null;
  const selectedPkg = fixedForm ? fixedPackages.find((p) => p.id === fixedForm.package)! : null;
  const total = fixedForm ? calcTotal(fixedForm.package, fixedForm.addons, fixedForm.deadline) : 0;
  const displayName = isCustom ? "Custom SEO Project" : (selectedPkg?.label ?? "");

  // ── Submitted ─────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 30%, #2EEBFF22 0%, transparent 65%)" }} />
        <div className="relative z-10 text-center max-w-lg">
          <div className="mx-auto mb-8 w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "#2EEBFF22", boxShadow: "0 0 40px #2EEBFF55" }}>
            <FontAwesomeIcon icon={faCheck} className="text-4xl" style={{ color: ACCENT }} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {isCustom ? "Quote Request Sent" : "Order Received"}
          </h1>
          <p className="text-white/50 text-lg mb-2">
            Thanks, <span className="text-white/80">{form.name}</span>.{" "}
            {isCustom
              ? "We'll review your brief and send a personalised quote within 1–2 business days."
              : <> Your <span style={{ color: ACCENT }}>{displayName}</span> plan is confirmed.</>}
          </p>
          <p className="text-white/40 text-sm mb-10">
            We'll reach out to <span className="text-white/60">{form.email}</span>.
          </p>
          <div className="grid grid-cols-1 gap-y-5">
            <button
              onClick={() => { setSubmitted(false); setStep(0); setPackageType("growth"); setForm(defaultFixed()); }}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-80"
              style={{ background: ACCENT, boxShadow: `0 0 24px ${ACCENT_GLOW}` }}>
              Start a New Order
            </button>
            <Link
              href={'/'}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-80 bg-transparent"
              style={{ border: `2px solid ${ACCENT_GLOW}` }}>
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(circle at 15% 20%, #2EEBFF15 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #2EEBFF0D 0%, transparent 50%)
        ` }} />
      <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0d0f14]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#2EEBFF22", boxShadow: "0 0 16px #2EEBFF44" }}>
              <FontAwesomeIcon icon={faMagnifyingGlassChart} className="text-sm" style={{ color: ACCENT }} />
            </div>
            <span className="text-white/60 text-sm font-medium">SEO Optimization</span>
          </div>
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div key={s} className={`h-2 rounded-full transition-all duration-300 ${i < step ? "w-2 bg-[#2EEBFF]" : i === step ? "w-6 bg-[#2EEBFF]" : "w-2 bg-white/15"
                }`} />
            ))}
            <span className="ml-2 text-white/30 text-xs hidden sm:inline">{steps[step]}</span>
          </div>
        </div>
      </header>

      {/* Header spacer */}
      <section className="static overflow-hidden py-8 px-4" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <div>

            {/* ══ STEP 0 — Package ══ */}
            {step === 0 && (
              <div>
                <StepHeader step={1} total={steps.length}
                  title="Choose your SEO plan"
                  sub="Pick a fixed plan for predictable monthly SEO, or go custom for a bespoke strategy built around your goals." accent={ACCENT} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                  {fixedPackages.map((pkg) => {
                    const active = packageType === pkg.id;
                    return (
                      <button key={pkg.id} onClick={() => switchPackageType(pkg.id)}
                        className={`relative text-left p-[1.5px] rounded-2xl transition-all duration-300 ${active ? "scale-[1.02]" : "hover:scale-[1.01]"
                          }`}
                        style={{
                          background: active
                            ? "linear-gradient(135deg, #2EEBFF, #3A8CFF)"
                            : "linear-gradient(135deg, rgba(255,255,255,0.06), transparent)"
                        }}>
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white z-10"
                            style={{ background: ACCENT, boxShadow: `0 0 16px ${ACCENT}88` }}>
                            Most Popular
                          </div>
                        )}
                        <div className={`rounded-2xl p-6 h-full transition-all duration-300 ${active ? "bg-[#111520]" : "bg-[#13161d] hover:bg-[#14171f]"
                          }`}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                            style={{
                              background: active ? "#2EEBFF22" : "rgba(255,255,255,0.06)",
                              boxShadow: active ? `0 0 20px ${ACCENT_GLOW}` : "none"
                            }}>
                            <FontAwesomeIcon icon={pkg.icon} className="text-base"
                              style={{ color: active ? ACCENT : "rgba(255,255,255,0.4)" }} />
                          </div>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="font-bold text-lg text-white">{pkg.label}</span>
                            <span className="text-xl font-bold"
                              style={{ color: active ? ACCENT : "rgba(255,255,255,0.5)" }}>
                              {fmt(BASE_PRICES[pkg.id])}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs md:text-sm mb-1">{pkg.tagline}</p>
                          <p className="text-white/25 text-xs md:text-sm mb-5">Delivery: {pkg.delivery}</p>
                          <ul className="space-y-2">
                            {pkg.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-xs md:text-sm text-white/60">
                                <FontAwesomeIcon icon={faCheck} className="text-[10px] flex-shrink-0"
                                  style={{ color: active ? ACCENT : "rgba(255,255,255,0.2)" }} />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom card */}
                <div className="mt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-white/20 text-xs uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  <button onClick={() => switchPackageType("custom")}
                    className={`w-full text-left p-[1.5px] rounded-2xl transition-all duration-300 ${packageType === "custom" ? "scale-[1.005]" : "hover:scale-[1.002]"
                      }`}
                    style={{
                      background: packageType === "custom"
                        ? "linear-gradient(135deg, #2EEBFF, #3A8CFF)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.05), transparent)"
                    }}>
                    <div className={`rounded-2xl px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-300 ${packageType === "custom" ? "bg-[#111520]" : "bg-[#13161d] hover:bg-[#14171f]"
                      }`}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: packageType === "custom" ? "#2EEBFF22" : "rgba(255,255,255,0.05)",
                          boxShadow: packageType === "custom" ? "0 0 24px #2EEBFF44" : "none"
                        }}>
                        <FontAwesomeIcon icon={faPenRuler} className="text-lg"
                          style={{ color: packageType === "custom" ? ACCENT : "rgba(255,255,255,0.3)" }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg text-white">Custom SEO Strategy</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/30">Quote-based</span>
                        </div>
                        <p className="text-white/40 text-sm">
                          Enterprise SEO campaigns, multi-site strategies, penalty recovery, international SEO,
                          or any complex scenario that needs a fully custom approach. Quote within 1–2 business days.
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white/20 text-xs mb-0.5">Starting from</p>
                        <p className="text-2xl font-bold"
                          style={{ color: packageType === "custom" ? ACCENT : "rgba(255,255,255,0.2)" }}>Custom</p>
                      </div>
                    </div>
                  </button>
                </div>
                <StepNav onNext={() => tryNext(1)} accent={ACCENT} />
              </div>
            )}

            {/* ══ FIXED FLOW ══ */}

            {/* Fixed Step 1 — Project info */}
            {!isCustom && step === 1 && fixedForm && (
              <div>
                <StepHeader step={2} total={steps.length}
                  title="Tell us about your website"
                  sub="We need to understand your current position to build the right SEO strategy." accent={ACCENT} />
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Business name" required>
                    <Input value={fixedForm.businessName} onChange={(v) => setFixed("businessName", v)}
                      placeholder="e.g. Vertex Studio" invalid={isMissing("businessName")} accent={ACCENT} />
                  </Field>
                  <Field label="Industry" required>
                    <Select value={fixedForm.industry} onChange={(v) => setFixed("industry", v)}
                      options={industries} placeholder="Select industry"
                      invalid={isMissing("industry")} accent={ACCENT} />
                  </Field>
                  <Field label="Website URL" required className="md:col-span-2">
                    <Input value={fixedForm.websiteUrl} onChange={(v) => setFixed("websiteUrl", v)}
                      placeholder="https://yourwebsite.com" invalid={isMissing("websiteUrl")} accent={ACCENT} />
                  </Field>
                  <Field label="Current ranking position">
                    <Select value={fixedForm.currentRanking} onChange={(v) => setFixed("currentRanking", v)}
                      options={currentRankingOptions} placeholder="Where do you stand?" accent={ACCENT} />
                  </Field>
                  <Field label="Ideal delivery">
                    <Select value={fixedForm.deadline} onChange={(v) => setFixed("deadline", v)}
                      options={deadlines} placeholder="Select timeline" accent={ACCENT} />
                    {fixedForm.deadline === "ASAP (rush fee)" && (
                      <p className="mt-1.5 text-xs text-amber-400/70">Rush fee applies — 20% added to your total.</p>
                    )}
                  </Field>
                  <Field label="Primary target location (optional)" className="md:col-span-2">
                    <Input value={fixedForm.targetLocation} onChange={(v) => setFixed("targetLocation", v)}
                      placeholder="e.g. New York, United States, Global..." accent={ACCENT} />
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(0)} onNext={() => tryNext(2)} accent={ACCENT} />
              </div>
            )}

            {/* Fixed Step 2 — Goals + addons */}
            {!isCustom && step === 2 && fixedForm && (
              <div>
                <StepHeader step={3} total={steps.length}
                  title="What are your SEO goals?"
                  sub="Select your primary objectives and any add-ons — your live total updates in the summary." accent={ACCENT} />
                <div className="mt-8 space-y-8">

                  <Field label="SEO goals">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {seoGoalOptions.map((g) => {
                        const active = fixedForm.seoGoals.includes(g.id);
                        return (
                          <button key={g.id} type="button" onClick={() => toggleGoal(g.id)}
                            className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all duration-200 text-left ${active
                              ? "border-[#2EEBFF] text-white"
                              : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
                              }`}
                            style={active
                              ? { background: ACCENT_DIM, boxShadow: `0 0 14px ${ACCENT_GLOW}` }
                              : { background: "rgba(255,255,255,0.02)" }}>
                            <FontAwesomeIcon icon={g.icon} className="text-sm flex-shrink-0"
                              style={{ color: active ? ACCENT : "rgba(255,255,255,0.25)" }} />
                            <span className="text-sm font-medium">{g.label}</span>
                            {active && <FontAwesomeIcon icon={faCheck} className="ml-auto text-xs" style={{ color: ACCENT }} />}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-white/25 text-xs mt-2">Select all that apply — no price impact.</p>
                  </Field>

                  <Field label="Add-ons">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {allAddons.map((addon) => {
                        const cost = ADDON_PRICE_MAP[addon.id]?.[fixedForm.package];
                        const unavailable = cost === null || cost === undefined;
                        const included = cost === 0;
                        const active = fixedForm.addons.includes(addon.id);
                        return (
                          <button key={addon.id} type="button"
                            onClick={() => !unavailable && !included && toggleAddon(addon.id)}
                            disabled={unavailable || included}
                            className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all duration-200 text-left ${unavailable ? "opacity-30 cursor-not-allowed border-white/[0.04]" :
                              included ? "border-emerald-500/30 cursor-default" :
                                active ? "border-[#2EEBFF] text-white" :
                                  "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
                              }`}
                            style={
                              included ? { background: "rgba(16,185,129,0.06)" } :
                                active ? { background: ACCENT_DIM, boxShadow: `0 0 14px ${ACCENT_GLOW}` } :
                                  { background: "rgba(255,255,255,0.02)" }
                            }>
                            <FontAwesomeIcon icon={addon.icon} className="text-sm flex-shrink-0"
                              style={{ color: included ? "#10b981" : active ? ACCENT : "rgba(255,255,255,0.25)" }} />
                            <div>
                              <p className="text-sm font-medium leading-tight">{addon.label}</p>
                              <p className="text-xs opacity-50 mt-0.5">
                                {unavailable ? "Not available" : included ? "Included" : `+${fmt(cost as number)}`}
                              </p>
                            </div>
                            {(active || included) && (
                              <FontAwesomeIcon icon={faCheck} className="ml-auto text-xs"
                                style={{ color: included ? "#10b981" : ACCENT }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(1)} onNext={() => tryNext(3)} accent={ACCENT} />
              </div>
            )}

            {/* Fixed Step 3 — Description */}
            {!isCustom && step === 3 && fixedForm && (
              <div>
                <StepHeader step={4} total={steps.length}
                  title="Anything else we should know?"
                  sub="Share target keywords, past SEO work, competitors, or anything relevant to your strategy." accent={ACCENT} />
                <div className="mt-8">
                  <Field label="Additional details">
                    <Textarea value={fixedForm.description} onChange={(v) => setFixed("description", v)} rows={5}
                      placeholder="Target keywords, competitors you want to outrank, previous SEO efforts, known technical issues, CMS platform..."
                      accent={ACCENT} />
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(2)} onNext={() => tryNext(4)} accent={ACCENT} />
              </div>
            )}

            {/* Fixed Step 4 — Review & contact */}
            {!isCustom && step === 4 && fixedForm && (
              <div>
                <StepHeader step={5} total={steps.length}
                  title="Review & submit"
                  sub="Confirm your plan and leave your contact info — we'll kick things off within 24 hours." accent={ACCENT} />
                <div className="lg:hidden mt-6">
                  <FixedSummary form={fixedForm} pkg={selectedPkg!} total={total} />
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Your name" required>
                    <Input value={fixedForm.name} onChange={(v) => setFixed("name", v)}
                      placeholder="Full name" invalid={isMissing("name")} accent={ACCENT} />
                  </Field>
                  <Field label="Email" required>
                    <Input value={fixedForm.email} onChange={(v) => setFixed("email", v)}
                      placeholder="you@company.com" type="email"
                      invalid={isMissing("email")} emailInvalid={isEmailInvalid("email")} accent={ACCENT} />
                  </Field>
                  <Field label="Phone (optional)" className="md:col-span-2">
                    <Input value={fixedForm.phone} onChange={(v) => setFixed("phone", v)}
                      placeholder="+1 555 000 0000" type="tel" accent={ACCENT} phoneInvalid={isPhoneInvalid("phone")} />
                  </Field>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <button type="button" onClick={() => tryBack(3)}
                    className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back
                  </button>
                  {error && (
                    <p className="text-red-500/70 text-sm text-right">{error}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white 
               transition-all duration-300 hover:opacity-90 hover:scale-[1.02] 
               active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed 
               disabled:scale-100"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}, #6C3FFF)`,
                      boxShadow: `0 0 32px ${ACCENT}55`
                    }}>
                    {loading ? "Submitting..." : "Confirm & Submit"}
                    {!loading && <FontAwesomeIcon icon={faArrowRight} className="text-xs" />}
                  </button>
                </div>
              </div>
            )}

            {/* ══ CUSTOM FLOW ══ */}

            {/* Custom Step 1 — Project info */}
            {isCustom && step === 1 && customForm && (
              <div>
                <StepHeader step={2} total={steps.length}
                  title="Tell us about your website"
                  sub="Be as detailed as possible — this becomes the brief our SEO team uses to scope and quote your strategy." accent={ACCENT} />
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Business name" required>
                    <Input value={customForm.businessName} onChange={(v) => setCustomField("businessName", v)}
                      placeholder="e.g. Vertex Corp" invalid={isMissing("businessName")} accent={ACCENT} />
                  </Field>
                  <Field label="Industry" required>
                    <Select value={customForm.industry} onChange={(v) => setCustomField("industry", v)}
                      options={industries} placeholder="Select industry"
                      invalid={isMissing("industry")} accent={ACCENT} />
                  </Field>
                  <Field label="Website URL" required className="md:col-span-2">
                    <Input value={customForm.websiteUrl} onChange={(v) => setCustomField("websiteUrl", v)}
                      placeholder="https://yourwebsite.com" invalid={isMissing("websiteUrl")} accent={ACCENT} />
                  </Field>
                  <Field label="Current monthly traffic">
                    <OptionPills options={trafficOptions} value={customForm.currentTraffic}
                      onChange={(v) => setCustomField("currentTraffic", v)} accent={ACCENT} accent_dim={ACCENT_DIM} accent_glow={ACCENT_GLOW} />
                  </Field>
                  <Field label="Budget expectation" required>
                    <Select value={customForm.budgetExpectation} onChange={(v) => setCustomField("budgetExpectation", v)}
                      options={budgetOptions} placeholder="Select a range" accent={ACCENT} invalid={isMissing("budgetExpectation")} />
                  </Field>
                  <Field label="Timeline expectation" className="md:col-span-2">
                    <Select value={customForm.timelineExpectation} onChange={(v) => setCustomField("timelineExpectation", v)}
                      options={timelineOptions} placeholder="Select timeline" accent={ACCENT} />
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(0)} onNext={() => tryNext(2)} accent={ACCENT} />
              </div>
            )}

            {/* Custom Step 2 — Strategy details */}
            {isCustom && step === 2 && customForm && (
              <div>
                <StepHeader step={3} total={steps.length}
                  title="Strategy context"
                  sub="The more context you give, the more accurate and targeted your custom strategy will be." accent={ACCENT} />
                <div className="mt-8 grid grid-cols-1 gap-5">
                  <Field label="Main competitors">
                    <Input value={customForm.competitors} onChange={(v) => setCustomField("competitors", v)}
                      placeholder="e.g. competitor1.com, competitor2.com — who do you want to outrank?" accent={ACCENT} />
                  </Field>
                  <Field label="Target keywords or topics">
                    <Textarea value={customForm.targetKeywords} onChange={(v) => setCustomField("targetKeywords", v)} rows={3}
                      placeholder="List your most important keywords, topics, or product/service categories to rank for..."
                      accent={ACCENT} />
                  </Field>
                  <Field label="Known technical issues (optional)">
                    <Textarea value={customForm.technicalIssues} onChange={(v) => setCustomField("technicalIssues", v)} rows={3}
                      placeholder="Any known issues — slow load times, crawl errors, duplicate content, penalties, redirect chains..."
                      accent={ACCENT} />
                  </Field>
                  <Field label="Content strategy needs (optional)">
                    <Input value={customForm.contentStrategy} onChange={(v) => setCustomField("contentStrategy", v)}
                      placeholder="Blog strategy, landing page creation, product descriptions, multilingual content..." accent={ACCENT} />
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(1)} onNext={() => tryNext(3)} accent={ACCENT} />
              </div>
            )}

            {/* Custom Step 3 — Contact & submit */}
            {isCustom && step === 3 && customForm && (
              <div>
                <StepHeader step={4} total={steps.length}
                  title="Contact details"
                  sub="We'll use these to send your personalised SEO quote within 1–2 business days." accent={ACCENT} />
                <div className="lg:hidden mt-6">
                  <CustomSummary form={customForm} />
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Your name" required>
                    <Input value={customForm.name} onChange={(v) => setCustomField("name", v)}
                      placeholder="Full name" invalid={isMissing("name")} accent={ACCENT} />
                  </Field>
                  <Field label="Email" required>
                    <Input value={customForm.email} onChange={(v) => setCustomField("email", v)}
                      placeholder="you@company.com" type="email"
                      invalid={isMissing("email")} emailInvalid={isEmailInvalid("email")} accent={ACCENT} />
                  </Field>
                  <Field label="Phone (optional)" className="md:col-span-2">
                    <Input value={customForm.phone} onChange={(v) => setCustomField("phone", v)}
                      placeholder="+1 555 000 0000" type="tel" accent={ACCENT} phoneInvalid={isPhoneInvalid("phone")} />
                  </Field>
                  <Field label="Preferred contact method" className="md:col-span-2">
                    <div className="flex flex-wrap gap-3 mt-1">
                      {contactOptions.map((c) => {
                        const active = customForm.preferredContact === c.id;
                        return (
                          <button key={c.id} type="button" onClick={() => setCustomField("preferredContact", c.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm transition-all duration-200 ${active
                              ? "border-[#2EEBFF] text-white"
                              : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
                              }`}
                            style={active
                              ? { background: ACCENT_DIM, boxShadow: `0 0 12px ${ACCENT_GLOW}` }
                              : { background: "rgba(255,255,255,0.02)" }}>
                            <FontAwesomeIcon icon={c.icon} className="text-xs"
                              style={{ color: active ? ACCENT : "rgba(255,255,255,0.3)" }} />
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <button type="button" onClick={() => tryBack(2)}
                    className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back
                  </button>
                  {error && (
                    <p className="text-red-500/70 text-sm text-right">{error}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white 
               transition-all duration-300 hover:opacity-90 hover:scale-[1.02] 
               active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed 
               disabled:scale-100"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}, #6C3FFF)`,
                      boxShadow: `0 0 32px ${ACCENT}55`
                    }}>
                    {loading ? "Submitting..." : "Confirm & Submit"}
                    {!loading && <FontAwesomeIcon icon={faArrowRight} className="text-xs" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sticky summary ─────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-38">
              {isCustom && customForm
                ? <CustomSummary form={customForm} />
                : fixedForm && selectedPkg
                  ? <FixedSummary form={fixedForm} pkg={selectedPkg} total={total} />
                  : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Summaries ────────────────────────────────────────────────────────────────

function FixedSummary({ form, pkg, total }: { form: FixedForm; pkg: typeof fixedPackages[0]; total: number }) {
  const selectedAddons = allAddons.filter((a) => form.addons.includes(a.id));
  const isRush = form.deadline === "ASAP (rush fee)";

  return (
    <div className="rounded-2xl p-[1.5px]"
      style={{ background: "linear-gradient(135deg, #2EEBFF33, transparent 60%)" }}>
      <div className="rounded-2xl bg-[#111520] p-6">
        <p className="text-xs font-semibold tracking-widest text-[#2EEBFF]/60 uppercase mb-5">Order Summary</p>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={pkg.icon} className="text-xs" style={{ color: "#2EEBFF" }} />
            <span className="text-sm md:text-base font-semibold text-white">{pkg.label} Plan</span>
          </div>
          <span className="text-sm font-bold text-white">{fmt(BASE_PRICES[form.package])}</span>
        </div>
        <p className="text-xs md:text-sm text-white/30 mb-4 pl-5">Delivery: {pkg.delivery}</p>

        {(isRush || selectedAddons.length > 0) && (
          <div className="border-t border-white/[0.06] pt-4 mb-4 space-y-2">
            {isRush && (
              <SummaryRow label="Rush delivery (+20%)"
                value={`+${fmt(Math.round(BASE_PRICES[form.package] * 0.2))}`} accent="amber" />
            )}
            {selectedAddons.map((a) => {
              const cost = ADDON_PRICE_MAP[a.id]?.[form.package] as number;
              return <SummaryRow key={a.id} label={a.label} value={`+${fmt(cost)}`} />;
            })}
          </div>
        )}

        {(form.businessName || form.industry || form.websiteUrl || form.deadline) && (
          <div className="border-t border-white/[0.06] pt-4 space-y-2 mb-4">
            {form.businessName && <SummaryRow label="Business" value={form.businessName} />}
            {form.industry && <SummaryRow label="Industry" value={form.industry} />}
            {form.websiteUrl && <SummaryRow label="Website" value={form.websiteUrl} />}
            {form.targetLocation && <SummaryRow label="Location" value={form.targetLocation} />}
            {form.deadline && <SummaryRow label="Timeline" value={form.deadline} />}
            {form.seoGoals.length > 0 && (
              <SummaryRow label="Goals" value={`${form.seoGoals.length} selected`} />
            )}
          </div>
        )}

        <div className="mt-2 pt-5 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(46,235,255,0.15)" }}>
          <span className="text-xs md:text-sm text-white/30">Total</span>
          <span className="text-2xl font-bold"
            style={{ color: "#2EEBFF", textShadow: "0 0 20px #2EEBFF88" }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

function CustomSummary({ form }: { form: CustomForm }) {
  return (
    <div className="rounded-2xl p-[1.5px]"
      style={{ background: "linear-gradient(135deg, #2EEBFF33, transparent 60%)" }}>
      <div className="rounded-2xl bg-[#111520] p-6">
        <p className="text-xs font-semibold tracking-widest text-[#2EEBFF]/60 uppercase mb-5">Quote Request</p>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#2EEBFF22", boxShadow: "0 0 16px #2EEBFF33" }}>
            <FontAwesomeIcon icon={faPenRuler} className="text-sm" style={{ color: "#2EEBFF" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Custom SEO Strategy</p>
            <p className="text-xs text-white/30">Personalised quote in 1–2 days</p>
          </div>
        </div>
        {(form.businessName || form.industry || form.websiteUrl || form.budgetExpectation || form.currentTraffic) && (
          <div className="border-t border-white/[0.06] pt-4 space-y-2">
            {form.businessName && <SummaryRow label="Business" value={form.businessName} />}
            {form.industry && <SummaryRow label="Industry" value={form.industry} />}
            {form.websiteUrl && <SummaryRow label="Website" value={form.websiteUrl} />}
            {form.currentTraffic && <SummaryRow label="Traffic" value={form.currentTraffic} />}
            {form.budgetExpectation && <SummaryRow label="Budget" value={form.budgetExpectation} />}
            {form.timelineExpectation && <SummaryRow label="Timeline" value={form.timelineExpectation} />}
            {form.preferredContact && <SummaryRow label="Contact" value={form.preferredContact} />}
          </div>
        )}
        <div className="mt-5 pt-5 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(46,235,255,0.15)" }}>
          <span className="text-xs text-white/30">Price</span>
          <span className="text-xl font-bold"
            style={{ color: "#2EEBFF", textShadow: "0 0 20px #2EEBFF88" }}>TBD</span>
        </div>
      </div>
    </div>
  );
}

