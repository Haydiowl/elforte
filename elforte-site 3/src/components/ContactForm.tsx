import { useRef, useState } from "react";

interface Values {
  name: string;
  email: string;
  phone: string;
  message: string;
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
  if (v.message.trim().length < 10) errors.message = "Please write a message of at least 10 characters.";
  return errors;
}

function buildMailtoLink(v: Values): string {
  const subject = encodeURIComponent("Contact form submission — Elforte");
  const body = encodeURIComponent(
    `Name: ${v.name.trim()}\nEmail: ${v.email.trim()}\nPhone: ${v.phone.trim()}\n\nMessage:\n${v.message.trim()}`
  );
  return `mailto:elforteglobalresourcelimited@gmail.com?subject=${subject}&body=${body}`;
}

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-3 text-[14px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6] focus:ring-2 focus:ring-[#8ab5d6]/40";

export default function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const timers = useRef<number[]>([]);

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function focusFirstError(errs: Errors) {
    const first = (Object.keys(errs) as (keyof Values)[]).find((k) => errs[k]);
    if (first) document.getElementById(`contact-${first}`)?.focus();
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
        window.location.href = buildMailtoLink(values);
        setStatus("ready");
      }, 600)
    );
  }

  function reset() {
    setValues({ name: "", email: "", phone: "", message: "" });
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
        <h3 className="mt-4 text-[20px] font-bold text-[#09123c]">Message sent</h3>
        <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-relaxed text-[#4a556a]">
          Your message has been sent to elforteglobalresourcelimited@gmail.com.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex w-full items-center justify-center rounded-full border border-[#b5cfe0] px-6 py-3 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#09123c]"
          >
            Write another message
          </button>
        </div>
      </div>
    );
  }

  const field = (key: keyof Values, label: string, placeholder: string, type = "text", multiline = false) => (
    <div>
      <label htmlFor={`contact-${key}`} className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={`contact-${key}`}
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          rows={5}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `contact-${key}-error` : undefined}
          className={`${inputBase} resize-none ${errors[key] ? "border-[#cc091b] focus:border-[#cc091b] focus:ring-[#cc091b]/25" : "border-[#dce4ea]"}`}
        />
      ) : (
        <input
          id={`contact-${key}`}
          type={type}
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          autoComplete={key === "name" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : "off"}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `contact-${key}-error` : undefined}
          className={`${inputBase} ${errors[key] ? "border-[#cc091b] focus:border-[#cc091b] focus:ring-[#cc091b]/25" : "border-[#dce4ea]"}`}
        />
      )}
      {errors[key] && (
        <p id={`contact-${key}-error`} role="alert" className="mt-1.5 text-[12px] font-medium text-[#cc091b]">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl bg-white p-6 sm:p-8">
      <h3 className="text-[18px] font-bold text-[#09123c]">Let&apos;s hear from you</h3>
      <div className="mt-5 space-y-4">
        {field("name", "Full Name", "Your first name")}
        {field("email", "Email Address", "Your email address", "email")}
        {field("phone", "Phone Number", "Your mobile number", "tel")}
        {field("message", "Message", "Write a message", "text", true)}
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
        {status === "sending" ? "Preparing…" : "Submit"}
      </button>
    </form>
  );
}
