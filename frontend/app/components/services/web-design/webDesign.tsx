"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode, faCheck, faArrowRight, faArrowLeft, faStar, faRocket,
  faBolt, faShieldAlt, faPalette, faMobileAlt, faSearch, faHeadset,
  faPenRuler, faPhone, faEnvelope, faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { StepHeader } from "@/app/components/services/shared-components/StepHeader";
import { Field } from "@/app/components/services/shared-components/Field";
import { StepNav } from "@/app/components/services/shared-components/StepNav";
import { Input } from "@/app/components/services/shared-components/Input";
import { Select } from "@/app/components/services/shared-components/Select";
import { Textarea } from "@/app/components/services/shared-components/Textarea";
import { OptionPills } from "@/app/components/services/shared-components/OptionPills";
import { SummaryRow } from "@/app/components/services/shared-components/SummaryRow";
import api, { submitOrder } from "@/app/lib/api";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#3A8CFF";
const ACCENT_DIM = "#3A8CFF18";
const ACCENT_GLOW = "#3A8CFF44";

// ─── Pricing ─────────────────────────────────────────────────────────────────

const BASE_PRICES: Record<FixedPackage, number> = {
  starter: 1200,
  pro: 3500,
  elite: 7500,
};

// Addons available per package. null = not available, 0 = included free, N = costs N
const ADDON_PRICE_MAP: Record<string, Partial<Record<FixedPackage, number | null>>> = {
  seo: { starter: 400, pro: 400, elite: 400 },
  mobile: { starter: null, pro: 800, elite: 800 },
  branding: { starter: 600, pro: 600, elite: 600 },
  support: { starter: 300, pro: 300, elite: 0 }, // elite: included
  security: { starter: 500, pro: 500, elite: 500 },
};

// Extra pages upcharge (only relevant for pro when 15+ selected)
const PAGES_UPCHARGE: Partial<Record<FixedPackage, Partial<Record<string, number>>>> = {
  pro: { "15+": 500 },
};

function calcTotal(pkg: FixedPackage, addons: string[], deadline: string, pages: string): number {
  let total = BASE_PRICES[pkg];
  // Rush
  if (deadline === "ASAP (rush fee)") total = Math.round(total * 1.2);
  // Pages
  const pageUp = PAGES_UPCHARGE[pkg]?.[pages] ?? 0;
  total += pageUp;
  // Addons
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
  if (!phone.trim()) return true; // خالی = ok
  return /^[+]?[\d\s\-().]{7,20}$/.test(phone.trim());
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FixedPackage = "starter" | "pro" | "elite";
type PackageType = FixedPackage | "custom";

interface FixedForm {
  kind: "fixed";
  package: FixedPackage;
  businessName: string;
  industry: string;
  pages: string;
  style: string;
  colors: string;
  addons: string[];
  deadline: string;
  description: string;
  name: string;
  email: string;
  phone: string;
}

interface CustomForm {
  kind: "custom";
  businessName: string;
  industry: string;
  goals: string;
  requirements: string;
  targetAudience: string;
  budgetExpectation: string;
  timelineExpectation: string;
  references: string;
  designPreferences: string;
  competitors: string;
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
}

type FormData = FixedForm | CustomForm;

// ─── Static data ─────────────────────────────────────────────────────────────

const fixedPackages = [
  {
    id: "starter" as FixedPackage,
    label: "Starter",
    icon: faBolt,
    delivery: "2 weeks",
    tagline: "Clean & conversion-ready",
    features: [
      "Up to 5 pages",
      "Mobile responsive",
      "Basic SEO setup",
      "1 revision round",
      "Contact form",
    ],
  },
  {
    id: "pro" as FixedPackage,
    label: "Pro",
    icon: faStar,
    delivery: "4 weeks",
    tagline: "Premium design, full stack",
    popular: true,
    features: [
      "Up to 15 pages",
      "Custom animations",
      "Advanced SEO",
      "3 revision rounds",
      "CMS integration",
      "Analytics dashboard",
      "Speed optimization",
    ],
  },
  {
    id: "elite" as FixedPackage,
    label: "Elite",
    icon: faRocket,
    delivery: "8 weeks",
    tagline: "Award-winning, end-to-end",
    features: [
      "Unlimited pages",
      "Custom interactions",
      "Full SEO strategy",
      "Unlimited revisions",
      "E-commerce ready",
      "A/B testing setup",
      "3-month support",
      "Brand identity kit",
    ],
  },
];

const allAddons = [
  { id: "seo", icon: faSearch, label: "SEO Boost", basePrice: 400 },
  { id: "mobile", icon: faMobileAlt, label: "App Version", basePrice: 800 },
  { id: "branding", icon: faPalette, label: "Brand Kit", basePrice: 600 },
  { id: "support", icon: faHeadset, label: "Priority Support", basePrice: 300 },
  { id: "security", icon: faShieldAlt, label: "Security Audit", basePrice: 500 },
];

const styles = ["Minimal & Clean", "Bold & Expressive", "Corporate & Trust", "Creative & Artistic", "Dark & Premium"];
const industries = ["Technology", "Healthcare", "Finance", "E-commerce", "Real Estate", "Education", "Creative", "Other"];
const pageOptions = ["1–3", "4–8", "9–15", "15+"];
const deadlines = ["ASAP (rush fee)", "2 weeks", "1 month", "2 months", "Flexible"];
const budgetOptions = ["Under $500", "$500-$1k", "$1k-$5k", "$5k–$15k", "$15k–$40k", "$40k+", "Not sure yet"];
const timelineOptions = ["ASAP", "1–2 months", "3–6 months", "6+ months", "Flexible"];
const contactOptions = [
  { id: "email", icon: faEnvelope, label: "Email" },
  { id: "phone", icon: faPhone, label: "Phone" },
  { id: "video", icon: faVideo, label: "Video Call" },
];

const FIXED_STEPS = ["Package", "Project", "Style", "Details", "Review"];
const CUSTOM_STEPS = ["Package", "Project", "Inspiration", "Submit"];

// ─── Default forms ────────────────────────────────────────────────────────────

function defaultFixed(): FixedForm {
  return {
    kind: "fixed", package: "pro", businessName: "", industry: "",
    pages: "", style: "", colors: "", addons: [], deadline: "",
    description: "", name: "", email: "", phone: "",
  };
}

function defaultCustom(): CustomForm {
  return {
    kind: "custom", businessName: "", industry: "", goals: "",
    requirements: "", targetAudience: "", budgetExpectation: "",
    timelineExpectation: "", references: "", designPreferences: "",
    competitors: "", name: "", email: "", phone: "", preferredContact: "",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WebDesignOrder() {
  const [packageType, setPackageType] = useState<PackageType>("pro");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>(defaultFixed());
  const [touchedSteps, setTouchedSteps] = useState<number[]>([]);
  const [attempted, setAttempted] = useState(false);
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  function setFixed<K extends keyof FixedForm>(key: K, value: FixedForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value } as FixedForm));
  }

  function setCustom<K extends keyof CustomForm>(key: K, value: CustomForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value } as CustomForm));
  }

  function toggleAddon(id: string) {
    if (form.kind !== "fixed") return;
    const cur = form.addons;
    setFixed("addons", cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]);
  }

  function switchPackageType(type: PackageType) {
    setPackageType(type);
    setStep(0);
    setAttempted(false);
    setForm(type === "custom"
      ? defaultCustom()
      : { ...defaultFixed(), package: type as FixedPackage });
  }

  const REQUIRED: Record<string, (keyof FixedForm | keyof CustomForm)[]> = {
    "fixed-1": ["businessName", "industry"],
    "fixed-4": ["name", "email"],
    "custom-1": ["businessName", "goals", "budgetExpectation"],
    "custom-3": ["name", "email"],
  };

  function canProceed(): boolean {
    const key = `${isCustom ? "custom" : "fixed"}-${step}`;
    const fields = REQUIRED[key];
    const phoneVal = (form as unknown as Record<string, unknown>)["phone"];
    if (typeof phoneVal === "string" && phoneVal.trim() !== "") {
      if (!isValidPhone(phoneVal)) return false;
    }
    if (!fields) return true;
    const data = form as unknown as Record<string, unknown>;
    return fields.every((f) => typeof data[f] === "string" && (data[f] as string).trim() !== "");
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
          service: "web_design",        // ai_automation / brand_identity / seo
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
          service: "web_design",
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

  function reset() {
    setSubmitted(false);
    setStep(0);
    setPackageType("pro");
    setForm(defaultFixed());
    setTouchedSteps([]);        // ← Important: Clear validation state
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const fixedForm = form.kind === "fixed" ? form : null;
  const customForm = form.kind === "custom" ? form : null;

  const selectedPkg = fixedForm
    ? fixedPackages.find((p) => p.id === fixedForm.package)!
    : null;

  const total = fixedForm
    ? calcTotal(fixedForm.package, fixedForm.addons, fixedForm.deadline, fixedForm.pages)
    : 0;

  const displayName = isCustom ? "Custom Project" : selectedPkg?.label ?? "";

  // ── Submitted ──────────────────────────────────────────────────────────────

  if (submitted) {
    const isQuote = isCustom;
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, #3A8CFF22 0%, transparent 65%)" }} />
        <div className="relative z-10 text-center max-w-lg">
          <div className="mx-auto mb-8 w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "#3A8CFF22", boxShadow: "0 0 40px #3A8CFF55" }}>
            <FontAwesomeIcon icon={faCheck} className="text-4xl text-[#3A8CFF]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {isQuote ? "Quote Request Sent" : "Order Received"}
          </h1>
          <p className="text-white/50 text-lg mb-2">
            Thanks, <span className="text-white/80">{form.name}</span>.{" "}
            {isQuote
              ? "We'll review your project and send a personalised quote within 1–2 business days."
              : <>Your <span className="text-[#3A8CFF]">{displayName}</span> order is confirmed.</>}
          </p>
          <p className="text-white/40 text-sm mb-10">
            We'll reach out to <span className="text-white/60">{form.email}</span>.
          </p>
          <div className="grid grid-cols-1 gap-y-5">
            <button
              onClick={() => { setSubmitted(false); setStep(0); setPackageType("pro"); setForm(defaultFixed()); }}
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

  // ── Main layout ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(circle at 15% 20%, #3A8CFF18 0%, transparent 50%), radial-gradient(circle at 85% 80%, #3A8CFF10 0%, transparent 50%)` }} />
      <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0d0f14]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#3A8CFF22", boxShadow: "0 0 16px #3A8CFF44" }}>
              <FontAwesomeIcon icon={faCode} className="text-sm text-[#3A8CFF]" />
            </div>
            <span className="text-white/60 text-sm font-medium">Web Design</span>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div key={s} className={`h-2 rounded-full transition-all duration-300 ${i < step ? "w-2 bg-[#3A8CFF]" : i === step ? "w-6 bg-[#3A8CFF]" : "w-2 bg-white/15"}`} />
            ))}
            <span className="ml-2 text-white/30 text-xs hidden sm:inline">{steps[step]}</span>
          </div>
        </div>
      </header>
      <section className=" static overflow-hidden py-8 px-4"></section>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:items-start">

          {/* ── Left ──────────────────────────────────────────────────────── */}
          <div>

            {/* ══ STEP 0 — Package selection (shared) ══ */}
            {step === 0 && (
              <div>
                <StepHeader
                  step={1} total={steps.length}
                  title="Choose your package"
                  sub="Select a fixed package for transparent pricing, or go custom for a fully bespoke quote." accent={ACCENT}
                />

                {/* Fixed packages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                  {fixedPackages.map((pkg) => {
                    const active = packageType === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => switchPackageType(pkg.id)}
                        className={`relative text-left p-[1.5px] rounded-2xl transition-all duration-300 ${active ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
                        style={{ background: active ? `linear-gradient(135deg, ${ACCENT}, #8E4BFF)` : "linear-gradient(135deg, rgba(255,255,255,0.06), transparent)" }}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white z-10" style={{ background: ACCENT, boxShadow: `0 0 16px ${ACCENT}88` }}>
                            Most Popular
                          </div>
                        )}
                        <div className={`rounded-2xl p-6 h-full transition-all duration-300 ${active ? "bg-[#111520]" : "bg-[#13161d] hover:bg-[#14171f]"}`}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: active ? "#3A8CFF22" : "rgba(255,255,255,0.06)", boxShadow: active ? `0 0 20px ${ACCENT}44` : "none" }}>
                            <FontAwesomeIcon icon={pkg.icon} className="text-base" style={{ color: active ? ACCENT : "rgba(255,255,255,0.4)" }} />
                          </div>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="font-bold text-lg text-white">{pkg.label}</span>
                            <span className="text-xl font-bold" style={{ color: active ? ACCENT : "rgba(255,255,255,0.5)" }}>
                              {fmt(BASE_PRICES[pkg.id])}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs md:text-sm mb-1">{pkg.tagline}</p>
                          <p className="text-white/25 text-xs md:text-sm mb-5">Delivery: {pkg.delivery}</p>
                          <ul className="space-y-2">
                            {pkg.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-xs md:text-sm lg:text-base text-white/60">
                                <FontAwesomeIcon icon={faCheck} className="text-[10px] flex-shrink-0" style={{ color: active ? ACCENT : "rgba(255,255,255,0.2)" }} />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom — full-width separator card */}
                <div className="mt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-white/20 text-xs uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <button
                    onClick={() => switchPackageType("custom")}
                    className={`w-full text-left p-[1.5px] rounded-2xl transition-all duration-300 ${packageType === "custom" ? "scale-[1.005]" : "hover:scale-[1.002]"}`}
                    style={{ background: packageType === "custom" ? "linear-gradient(135deg, #8E4BFF, #3A8CFF)" : "linear-gradient(135deg, rgba(255,255,255,0.05), transparent)" }}
                  >
                    <div className={`rounded-2xl px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-300 ${packageType === "custom" ? "bg-[#111520]" : "bg-[#13161d] hover:bg-[#14171f]"}`}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: packageType === "custom" ? "#8E4BFF22" : "rgba(255,255,255,0.05)", boxShadow: packageType === "custom" ? "0 0 24px #8E4BFF44" : "none" }}>
                        <FontAwesomeIcon icon={faPenRuler} className="text-lg" style={{ color: packageType === "custom" ? "#8E4BFF" : "rgba(255,255,255,0.3)" }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg text-white">Custom Project</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/30">Quote-based</span>
                        </div>
                        <p className="text-white/40 text-sm">Complex requirements, unique scope, or enterprise needs. We'll review your brief and send a personalised quote within 1–2 business days.</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white/20 text-xs mb-0.5">Starting from</p>
                        <p className="text-2xl font-bold" style={{ color: packageType === "custom" ? "#8E4BFF" : "rgba(255,255,255,0.2)" }}>Custom</p>
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
                <StepHeader step={2} total={steps.length} title="Tell us about your project" sub="The more detail you share, the better we can tailor the design." accent={ACCENT} />
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Business name" required>
                    <Input
                      value={fixedForm.businessName}
                      onChange={(v) => setFixed("businessName", v)}
                      placeholder="e.g. Vertex Studio"
                      invalid={isMissing("businessName")} accent={ACCENT}
                    />
                  </Field>
                  <Field label="Industry" required>
                    <Select value={fixedForm.industry} onChange={(v) => setFixed("industry", v)} options={industries} placeholder="Select industry" invalid={isMissing("industry")} accent={ACCENT} />
                  </Field>
                  <Field label="Number of pages">
                    <OptionPills
                      options={fixedForm.package === "starter" ? ["1–3", "4–5"] : fixedForm.package === "pro" ? ["1–3", "4-8", "9-15"] : pageOptions}
                      value={fixedForm.pages}
                      onChange={(v) => setFixed("pages", v)} accent={ACCENT} accent_dim={ACCENT_DIM} accent_glow={ACCENT_GLOW}
                    />
                  </Field>
                  <Field label="Ideal delivery">
                    <Select value={fixedForm.deadline} onChange={(v) => setFixed("deadline", v)} options={deadlines} placeholder="Select timeline" accent={ACCENT} />
                    {fixedForm.deadline === "ASAP (rush fee)" && (
                      <p className="mt-1.5 text-xs text-amber-400/70">Rush fee applies — 20% added to your total.</p>
                    )}
                  </Field>
                  {/* Pages upcharge notice */}
                  {fixedForm.pages === "15+" && fixedForm.package === "pro" && (
                    <div className="md:col-span-2 text-xs text-[#3A8CFF]/70 bg-[#3A8CFF]/[0.06] border border-[#3A8CFF]/10 rounded-xl px-4 py-3">
                      15+ pages on the Pro plan includes a +$500 extended scope fee.
                    </div>
                  )}
                </div>
                <StepNav onBack={() => tryBack(0)} onNext={() => tryNext(2)} accent={ACCENT} />
              </div>
            )}

            {/* Fixed Step 2 — Style + addons */}
            {!isCustom && step === 2 && fixedForm && (
              <div>
                <StepHeader step={3} total={steps.length} title="Define your aesthetic" sub="Pick a visual direction and any add-ons — your live total updates below." accent={ACCENT} />
                <div className="mt-8 space-y-8">
                  <Field label="Design style">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {styles.map((s) => (
                        <button key={s} onClick={() => setFixed("style", s)}
                          className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all duration-200 text-left ${fixedForm.style === s ? "text-white border-[#3A8CFF]" : "text-white/40 border-white/[0.07] hover:border-white/20 hover:text-white/60"}`}
                          style={fixedForm.style === s ? { background: "#3A8CFF15", boxShadow: `0 0 16px ${ACCENT}22` } : { background: "rgba(255,255,255,0.02)" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="text-white/25 text-xs mt-2">Style preference — no price impact.</p>
                  </Field>

                  <Field label="Brand colors (optional)">
                    <Input value={fixedForm.colors} onChange={(v) => setFixed("colors", v)} placeholder="e.g. Navy blue, gold — or paste hex codes" accent={ACCENT} />
                  </Field>

                  <Field label="Add-ons">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {allAddons.map((addon) => {
                        const cost = ADDON_PRICE_MAP[addon.id]?.[fixedForm.package];
                        const unavailable = cost === null || cost === undefined;
                        const included = cost === 0;
                        const active = fixedForm.addons.includes(addon.id);

                        return (
                          <button key={addon.id} onClick={() => !unavailable && !included && toggleAddon(addon.id)}
                            disabled={unavailable || included}
                            className={`flex items-center gap-3 py-3 px-4 rounded-xl border transition-all duration-200 text-left
                              ${unavailable ? "opacity-30 cursor-not-allowed border-white/[0.04]" :
                                included ? "border-emerald-500/30 cursor-default" :
                                  active ? "border-[#3A8CFF] text-white" :
                                    "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"}`}
                            style={
                              included ? { background: "rgba(16,185,129,0.06)" } :
                                active ? { background: "#3A8CFF15", boxShadow: `0 0 14px ${ACCENT}22` } :
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
                              <FontAwesomeIcon icon={faCheck} className="ml-auto text-xs" style={{ color: included ? "#10b981" : ACCENT }} />
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
                <StepHeader step={4} total={steps.length} title="Anything else we should know?" sub="Share inspirations, must-have features, or anything that makes your project unique." accent={ACCENT} />
                <div className="mt-8">
                  <Field label="Project description">
                    <textarea value={fixedForm.description} onChange={(e) => setFixed("description", e.target.value)} rows={5}
                      placeholder="Reference sites you love, key pages needed, must-have features, tone of voice..."
                      className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all resize-none" />
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(2)} onNext={() => tryNext(4)} accent={ACCENT} />
              </div>
            )}

            {/* Fixed Step 4 — Review & contact */}
            {!isCustom && step === 4 && fixedForm && (
              <form onSubmit={handleSubmit}>
                <StepHeader step={5} total={steps.length} title="Review & submit" sub="Confirm your order details and leave your contact info — we'll kick things off within 24 hours." accent={ACCENT} />
                <div className="lg:hidden mt-6">
                  <FixedSummary form={fixedForm} pkg={selectedPkg!} total={total} />
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Your name" required>
                    <Input value={fixedForm.name} onChange={(v) => setFixed("name", v)} placeholder="Full name" invalid={isMissing("name")} accent={ACCENT} />
                  </Field>
                  <Field label="Email" required>
                    <Input value={fixedForm.email} onChange={(v) => setFixed("email", v)} placeholder="you@company.com" type="email" invalid={isMissing("email")} emailInvalid={isEmailInvalid("email")} accent={ACCENT} />
                  </Field>
                  <Field label="Phone (optional)" className="md:col-span-2">
                    <Input value={fixedForm.phone} onChange={(v) => setFixed("phone", v)}
                      placeholder="+1 555 000 0000" type="tel" accent={ACCENT} phoneInvalid={isPhoneInvalid("phone")} />
                  </Field>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <button type="button" onClick={() => { tryBack(3) }} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
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
              </form>
            )}

            {/* ══ CUSTOM FLOW ══ */}

            {/* Custom Step 1 — Project goals */}
            {isCustom && step === 1 && customForm && (
              <div>
                <StepHeader step={2} total={steps.length} title="Tell us about your project" sub="Be as detailed as you like — this becomes the brief our team reviews to build your quote." accent={ACCENT} />
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Business name" required>
                    <Input value={customForm.businessName} onChange={(v) => setCustom("businessName", v)} placeholder="e.g. Vertex Studio" invalid={isMissing("businessName")} accent={ACCENT} />
                  </Field>
                  <Field label="Industry" required>
                    <Select value={customForm.industry} onChange={(v) => setCustom("industry", v)} options={industries} placeholder="Select industry" invalid={isMissing("industry")} accent={ACCENT} />
                  </Field>
                  <Field label="Project goals & challenges" className="md:col-span-2" required>
                    <Textarea
                      value={customForm.goals}
                      onChange={(v) => setCustom("goals", v)}
                      placeholder="What are you trying to achieve? What problems are you solving? What does success look like?"
                      invalid={isMissing("goals")}
                      rows={4} accent={ACCENT}
                    />
                  </Field>
                  <Field label="Key features & requirements" className="md:col-span-2">
                    <textarea value={customForm.requirements} onChange={(e) => setCustom("requirements", e.target.value)} rows={3}
                      placeholder="Specific functionalities, integrations, platforms, or technical requirements..."
                      className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all resize-none" />
                  </Field>
                  <Field label="Target audience">
                    <Input value={customForm.targetAudience} onChange={(v) => setCustom("targetAudience", v)} placeholder="e.g. SMB founders, enterprise IT buyers..." accent={ACCENT} />
                  </Field>
                  <Field label="Budget expectation" required>
                    <Select value={customForm.budgetExpectation} onChange={(v) => setCustom("budgetExpectation", v)} options={budgetOptions} placeholder="Select a range" invalid={isMissing("budgetExpectation")} accent={ACCENT} />
                  </Field>
                  <Field label="Timeline expectation" className="md:col-span-2">
                    <OptionPills options={timelineOptions} value={customForm.timelineExpectation} onChange={(v) => setCustom("timelineExpectation", v)} accent={ACCENT} accent_dim={ACCENT_DIM} accent_glow={ACCENT_GLOW} />
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(0)} onNext={() => tryNext(2)} accent={ACCENT} />
              </div>
            )}

            {/* Custom Step 2 — Inspiration */}
            {isCustom && step === 2 && customForm && (
              <div>
                <StepHeader step={3} total={steps.length} title="Inspiration & references" sub="Help us understand your aesthetic direction before we build the quote." accent={ACCENT} />
                <div className="mt-8 grid grid-cols-1 gap-5">
                  <Field label="Reference websites or apps">
                    <Input value={customForm.references} onChange={(v) => setCustom("references", v)} placeholder="e.g. linear.app, stripe.com, notion.so" accent={ACCENT} />
                  </Field>
                  <Field label="Design preferences & brand guidelines">
                    <textarea value={customForm.designPreferences} onChange={(e) => setCustom("designPreferences", e.target.value)} rows={4}
                      placeholder="Describe your aesthetic, existing brand colours, typography, tone — or share a Figma/Drive link..."
                      className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all resize-none" />
                  </Field>
                  <Field label="Competitors (optional)">
                    <Input value={customForm.competitors} onChange={(v) => setCustom("competitors", v)} placeholder="Who are you up against? e.g. Webflow, Squarespace" accent={ACCENT} />
                  </Field>
                </div>
                <StepNav onBack={() => tryBack(1)} onNext={() => tryNext(3)} accent={ACCENT} />
              </div>
            )}

            {/* Custom Step 3 — Contact & submit */}
            {isCustom && step === 3 && customForm && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <StepHeader step={4} total={steps.length} title="Contact details" sub="We'll use these to send your personalised quote within 1–2 business days." accent={ACCENT} />
                <div className="lg:hidden mt-6">
                  <CustomSummary form={customForm} />
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Your name" required>
                    <Input value={customForm.name} onChange={(v) => setCustom("name", v)} placeholder="Full name" invalid={isMissing("name")} accent={ACCENT} />
                  </Field>
                  <Field label="Email" required>
                    <Input value={customForm.email} onChange={(v) => setCustom("email", v)} placeholder="you@company.com" type="email" invalid={isMissing("email")} accent={ACCENT} />
                  </Field>
                  <Field label="Phone (optional)" className="md:col-span-2">
                    <Input value={customForm.phone} onChange={(v) => setCustom("phone", v)}
                      placeholder="+1 555 000 0000" type="tel" accent={ACCENT} phoneInvalid={isPhoneInvalid("phone")} />
                  </Field>
                  <Field label="Preferred contact method" className="md:col-span-2">
                    <div className="flex flex-wrap gap-3 mt-1">
                      {contactOptions.map((c) => {
                        const active = customForm.preferredContact === c.id;
                        return (
                          <button key={c.id} type="button" onClick={() => setCustom("preferredContact", c.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm transition-all duration-200 ${active ? "border-[#3A8CFF] text-white" : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"}`}
                            style={active ? { background: "#3A8CFF15", boxShadow: `0 0 12px ${ACCENT}22` } : { background: "rgba(255,255,255,0.02)" }}>
                            <FontAwesomeIcon icon={c.icon} className="text-xs" style={{ color: active ? ACCENT : "rgba(255,255,255,0.3)" }} />
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <button type="button" onClick={() => tryBack(2)} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
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
              </form>
            )}
          </div>

          {/* ── Right: sticky summary ─────────────────────────────────────── */}
          <div className="hidden lg:block lg:sticky lg:top-38">
            <div className="self-start">
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
  const pageUp = PAGES_UPCHARGE[form.package]?.[form.pages] ?? 0;

  return (
    <div className="rounded-2xl p-[1.5px]" style={{ background: "linear-gradient(135deg, #3A8CFF33, transparent 60%)" }}>
      <div className="rounded-2xl bg-[#111520] p-6">
        <p className="text-xs font-semibold tracking-widest text-[#3A8CFF]/60 uppercase mb-5">Order Summary</p>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={pkg.icon} className="text-xs text-[#3A8CFF]" />
            <span className="text-sm md:text-base font-semibold text-white">{pkg.label} Package</span>
          </div>
          <span className="text-sm font-bold text-white">{fmt(BASE_PRICES[form.package])}</span>
        </div>
        <p className="text-xs md:text-sm text-white/30 mb-4 pl-5">Delivery: {pkg.delivery}</p>

        {(isRush || pageUp > 0 || selectedAddons.length > 0) && (
          <div className="border-t border-white/6 pt-4 mb-4 space-y-2">
            {pageUp > 0 && <SummaryRow label="Extended scope (15+ pages)" value={`+${fmt(pageUp)}`} />}
            {isRush && <SummaryRow label="Rush delivery (+20%)" value={`+${fmt(Math.round(BASE_PRICES[form.package] * 0.2))}`} accent="amber" />}
            {selectedAddons.map((a) => {
              const cost = ADDON_PRICE_MAP[a.id]?.[form.package] as number;
              return <SummaryRow key={a.id} label={a.label} value={`+${fmt(cost)}`} />;
            })}
          </div>
        )}

        {(form.businessName || form.industry || form.style || form.pages || form.deadline) && (
          <div className="border-t border-white/[0.06] pt-4 space-y-2 mb-4">
            {form.businessName && <SummaryRow label="Business" value={form.businessName} />}
            {form.industry && <SummaryRow label="Industry" value={form.industry} />}
            {form.pages && <SummaryRow label="Pages" value={form.pages} />}
            {form.style && <SummaryRow label="Style" value={form.style} />}
            {form.deadline && <SummaryRow label="Timeline" value={form.deadline} />}
          </div>
        )}

        <div className="mt-2 pt-5 border-t flex items-center justify-between" style={{ borderColor: "rgba(58,140,255,0.15)" }}>
          <span className="text-xs md:text-sm text-white/30">Total</span>
          <span className="text-2xl font-bold" style={{ color: ACCENT, textShadow: `0 0 20px ${ACCENT}88` }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

function CustomSummary({ form }: { form: CustomForm }) {
  return (
    <div className="rounded-2xl p-[1.5px]" style={{ background: "linear-gradient(135deg, #8E4BFF33, transparent 60%)" }}>
      <div className="rounded-2xl bg-[#111520] p-6">
        <p className="text-xs font-semibold tracking-widest text-[#8E4BFF]/60 uppercase mb-5">Quote Request</p>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#8E4BFF22", boxShadow: "0 0 16px #8E4BFF33" }}>
            <FontAwesomeIcon icon={faPenRuler} className="text-sm" style={{ color: "#8E4BFF" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Custom Project</p>
            <p className="text-xs text-white/30">Personalised quote in 1–2 days</p>
          </div>
        </div>

        {(form.businessName || form.industry || form.budgetExpectation || form.timelineExpectation) && (
          <div className="border-t border-white/[0.06] pt-4 space-y-2">
            {form.businessName && <SummaryRow label="Business" value={form.businessName} />}
            {form.industry && <SummaryRow label="Industry" value={form.industry} />}
            {form.budgetExpectation && <SummaryRow label="Budget" value={form.budgetExpectation} />}
            {form.timelineExpectation && <SummaryRow label="Timeline" value={form.timelineExpectation} />}
            {form.preferredContact && <SummaryRow label="Contact via" value={form.preferredContact} />}
          </div>
        )}

        <div className="mt-5 pt-5 border-t flex items-center justify-between" style={{ borderColor: "rgba(142,75,255,0.15)" }}>
          <span className="text-xs text-white/30">Price</span>
          <span className="text-xl font-bold" style={{ color: "#8E4BFF", textShadow: "0 0 20px #8E4BFF88" }}>TBD</span>
        </div>
      </div>
    </div>
  );
}