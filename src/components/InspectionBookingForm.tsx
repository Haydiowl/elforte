import { useRef, useState } from "react";
import { getClients, createClient, updateClient, createInspection } from "../lib/db";

interface Values {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
}

type Errors = Partial<Record<keyof Values, string>>;
type Status = "idle" | "sending" | "ready";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!v.email.trim()) errors.email = "Email address is required.";
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Please enter a valid email address.";
  const digits = v.phone.replace(/\D/g, "");
  if (!v.phone.trim()) errors.phone = "Phone number is required.";
  else if (digits.length < 7) errors.phone = "Please enter a valid phone number.";
  if (!v.date) {
    errors.date = "Please choose a preferred date.";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(`${v.date}T00:00:00`);
    if (Number.isNaN(chosen.getTime())) errors.date = "Please choose a valid date.";
    else if (chosen < today) errors.date = "Please choose a date in the future.";
  }
  if (!v.time) errors.time = "Please choose a preferred time.";
  return errors;
}

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-3 text-[14px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6] focus:ring-2 focus:ring-[#8ab5d6]/40";

export default function InspectionBookingForm({
  propertyId,
  propertyName,
}: {
  propertyId: string;
  propertyName: string;
}) {
  const [values, setValues] = useState<Values>({ name: "", email: "", phone: "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const timers = useRef<number[]>([]);

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function focusFirstError(errs: Errors) {
    const first = (Object.keys(errs) as (keyof Values)[]).find((k) => errs[k]);
    if (first) document.getElementById(`inspection-${first}`)?.focus();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const errs = validate(values);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      focusFirstError(errs);
      return;
    }
    setStatus("sending");
    timers.current.push(
      window.setTimeout(() => {
        // Find-or-create client so repeat bookers don't duplicate records
        const existingClient = getClients().find(
          (c) => c.email.toLowerCase() === values.email.trim().toLowerCase()
        );
        const client =
          existingClient ??
          createClient({
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            company: "",
            source: "Inspection Booking",
            status: "New",
            assignedStaffId: null,
            interestedPropertyIds: [],
            notes: "",
          });
        if (!client.interestedPropertyIds.includes(propertyId)) {
          updateClient(client.id, { interestedPropertyIds: [...client.interestedPropertyIds, propertyId] });
        }
        createInspection({
          clientId: client.id,
          propertyId,
          date: values.date,
          time: values.time,
          assignedStaffId: null,
          status: "Scheduled",
          notes: values.notes.trim(),
          outcome: null,
        });
        setStatus("ready");
      }, 600)
    );
  }

  function reset() {
    setValues({ name: "", email: "", phone: "", date: "", time: "", notes: "" });
    setErrors({});
    setStatus("idle");
  }

  if (status === "ready") {
    return (
      <div className="rounded-xl bg-white p-6 text-center sm:p-8" role="status" aria-live="polite">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4fc]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cc091b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-4 text-[20px] font-bold text-[#09123c]">Your inspection request has been received.</h3>
        <p className="mx-auto mt-2 max-w-[400px] text-[14px] leading-relaxed text-[#4a556a]">
          Thank you — our team will confirm your visit to {propertyName} shortly.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex w-full items-center justify-center rounded-full border border-[#b5cfe0] px-6 py-3 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#09123c]"
          >
            Make another request
          </button>
        </div>
      </div>
    );
  }

  const field = (key: keyof Values, label: string, placeholder: string, type = "text", multiline = false) => (
    <div>
      <label htmlFor={`inspection-${key}`} className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={`inspection-${key}`}
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          rows={4}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `inspection-${key}-error` : undefined}
          className={`${inputBase} resize-none ${errors[key] ? "border-[#cc091b] focus:border-[#cc091b] focus:ring-[#cc091b]/25" : "border-[#dce4ea]"}`}
        />
      ) : (
        <input
          id={`inspection-${key}`}
          type={type}
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          min={key === "date" ? new Date().toISOString().split("T")[0] : undefined}
          autoComplete={key === "name" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : "off"}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `inspection-${key}-error` : undefined}
          className={`${inputBase} ${errors[key] ? "border-[#cc091b] focus:border-[#cc091b] focus:ring-[#cc091b]/25" : "border-[#dce4ea]"}`}
        />
      )}
      {errors[key] && (
        <p id={`inspection-${key}-error`} role="alert" className="mt-1.5 text-[12px] font-medium text-[#cc091b]">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl bg-white p-6 sm:p-8">
      <h3 className="text-[18px] font-bold text-[#09123c]">Book an Inspection</h3>
      <p className="mt-1 text-[13px] text-[#4a556a]">
        Requesting a visit to <span className="font-semibold text-[#09123c]">{propertyName}</span>
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">{field("name", "Full Name", "Your full name")}</div>
        <div className="sm:col-span-1">{field("email", "Email Address", "Your email address", "email")}</div>
        <div className="sm:col-span-1">{field("phone", "Phone Number", "Your mobile number", "tel")}</div>
        <div className="sm:col-span-1">{field("date", "Preferred Date", "", "date")}</div>
        <div className="sm:col-span-1">{field("time", "Preferred Time", "", "time")}</div>
        <div className="sm:col-span-2">{field("notes", "Message / Notes (optional)", "Anything we should know?", "text", true)}</div>
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#cc091b] px-6 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#b50818] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {status === "sending" ? "Submitting…" : "Request Inspection"}
      </button>
    </form>
  );
}
