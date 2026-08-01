import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
import logo from "./assets/logo.png";
import groupPhoto from "./assets/group-photo.jpg";
import QRCode from "qrcode";

/* ============================================================
   THE SOLO SUMMIT CONNECT APP — TSS CONNECT 2026
   Church of Pentecost • PIWC ABLEKUMA Youth Ministry
   Lloyds Beach Resort, Kokrobite • 3rd October, 2026
   ============================================================ */

const LOGO = logo;
const ADMIN_EMAIL = "360adsphere@gmail.com";
const DEFAULT_AREA = "Anyaa-Ablekuma";
const CAMP_THEME = "TSS Connect 2026";
const MINISTRY_MOTTO = "Arise & Shine";
const FEE_AMOUNT = "GHS 200";
const PAYMENT_DEADLINE = "3rd September 2026";
const MOMO_NUMBER = "0535700151";
const MOMO_NAME = "Emmanuel Mintah Asomaning";
const SHIRT_FEE = "GHS 60";

/* ---------- data layer (Supabase) ---------- */
async function insertRegistrations(records) {
  const { error } = await supabase.from("registrations").insert(records);
  if (error) throw error;
}
async function loadAllRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}
async function fetchCount() {
  const { data, error } = await supabase.rpc("registration_count");
  if (error) {
    console.error(error);
    return 0;
  }
  return data || 0;
}
function uuidv4() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
async function checkIn(id) {
  const { error } = await supabase
    .from("registrations")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
async function undoCheckIn(id) {
  const { error } = await supabase
    .from("registrations")
    .update({ checked_in: false, checked_in_at: null })
    .eq("id", id);
  if (error) throw error;
}
async function updateRegistration(id, fields) {
  const { error } = await supabase
    .from("registrations")
    .update(fields)
    .eq("id", id);
  if (error) throw error;
}

/* ---------- helpers ---------- */
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validPhone = (p) => p.replace(/\D/g, "").length >= 9;

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

/* ---------- 3D tilt wrapper ---------- */
function Tilt({ children, max = 8, className = "", style = {} }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
  };
  const reset = () => {
    if (ref.current)
      ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: "transform .25s ease", ...style }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </div>
  );
}

/* ---------- toast ---------- */
function Toast({ msg, kind, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return <div className={"toast " + kind}>{msg}</div>;
}

/* ============================ SPLASH ============================ */
function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="splash" onClick={onDone}>
      <div className="splash-glow" />
      <div className="splash-logo-wrap">
        <img src={LOGO} alt="COP Youth" className="splash-logo" />
        <div className="splash-ring" />
      </div>
      <div className="splash-title">TSS connect 2026</div>
      <div className="splash-sub">created by Adsphere</div>
      <div className="splash-tap">tap to enter</div>
    </div>
  );
}

/* ============================ HOME ============================ */
function Home({ go, total }) {
  const c = useCountdown(new Date("2026-09-03T13:00:00+00:00").getTime());
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <img src={LOGO} alt="logo" className="hero-logo" />
          <div className="eyebrow">The Church of Pentecost · PIWC Ablekuma</div>
          <h1 className="hero-title">
            TSS Connect<span>2026</span>
          </h1>
          <p className="hero-meta">Saturday 3rd October 2026</p>

          <div className="countdown">
            {[
              ["Days", c.d],
              ["Hrs", c.h],
              ["Min", c.m],
              ["Sec", c.s],
            ].map(([l, v]) => (
              <Tilt key={l} className="cd-cell" max={12}>
                <div className="cd-num">{String(v).padStart(2, "0")}</div>
                <div className="cd-lab">{l}</div>
              </Tilt>
            ))}
          </div>

          <div className="live-pill">
            <span className="dot" /> {total} registered · live
          </div>

          <div className="cta-row">
            <button className="btn btn-red" onClick={() => go("register")}>
              Register
            </button>
            <button className="btn btn-green" onClick={() => go("bulk")}>
              Bulk register a district
            </button>
          </div>
          <button className="link-admin" onClick={() => go("admin")}>
            Admin console →
          </button>
        </div>
      </div>

      <div className="info-grid">
        <Tilt className="info-card">
          <div className="ic-k">Theme</div>
          <div className="ic-v">
            Rooted in Faith, Living the Flourishing Life
          </div>
          <p>Jeremiah 17:7–8 & Psalm 1:3 </p>
        </Tilt>
        <Tilt className="info-card">
          <div className="ic-k">Venue</div>
          <div className="ic-v">Lloyds Beach Resort, Kokrobite</div>
          <p>
            one-day transformational fellowship experience that strengthens
            faith, builds relationships, and promotes purposeful Christian
            living.
          </p>
        </Tilt>
        <Tilt className="info-card">
          <div className="ic-k">Who</div>
          <div className="ic-v">All Single youth</div>
          <p>
            Register individually, or sign up your whole district in one go.
          </p>
        </Tilt>
      </div>
      <div className="info-grid">
        <Tilt className="info-card">...Theme...</Tilt>
        <Tilt className="info-card">...Venue...</Tilt>
        <Tilt className="info-card">...Who...</Tilt>
      </div>
      <img src={groupPhoto} alt="TSS Connect" className="home-photo" />
    </div>
  );
}

/* ============================ FIELD ============================ */
function Field({ label, children, req, err }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {req && <i> *</i>}
      </span>
      {children}
      {err && <span className="field-err">{err}</span>}
    </label>
  );
}

/* ============================ SINGLE REGISTER ============================ */
const blank = {
  name: "",
  phone: "",
  email: "",
  assembly: "",
  district: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  pickupLocation: "",
  paymentDate: "",
  momoReference: "",
  shirtSize: "",
  medicalInfo: "",
  notes: "",
  consentMeals: false,
  consentPhotos: false,
  consentGuidelines: false,
};

function Register({ go, toast, refresh }) {
  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [pass, setPass] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setChk = (k) => (e) => setF({ ...f, [k]: e.target.checked });

  const validate = () => {
    const x = {};
    if (!f.name.trim()) x.name = "Enter the full name";
    if (!validPhone(f.phone)) x.phone = "Enter a valid WhatsApp number";
    if (f.email.trim() && !validEmail(f.email)) x.email = "Enter a valid email";
    if (!f.assembly.trim()) x.assembly = "Enter your local assembly";
    if (!f.emergencyName.trim())
      x.emergencyName = "Enter emergency contact name";
    if (!f.emergencyRelationship.trim())
      x.emergencyRelationship = "Enter the relationship";
    if (!validPhone(f.emergencyPhone))
      x.emergencyPhone = "Enter a valid phone number";
    if (!f.pickupLocation.trim()) x.pickupLocation = "Enter a pickup location";
    if (!f.paymentDate) x.paymentDate = "Select the payment date";
    if (!f.momoReference.trim())
      x.momoReference = "Enter the MoMo transaction ID/reference";
    if (!f.consentMeals || !f.consentPhotos || !f.consentGuidelines)
      x.declaration = "Please agree to all three declarations";
    setErr(x);
    return Object.keys(x).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const rec = {
      id: uuidv4(),
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      area: DEFAULT_AREA,
      district: f.district.trim(),
      assembly: f.assembly.trim(),
      emergency: `${f.emergencyName.trim()}, ${f.emergencyRelationship.trim()}, ${f.emergencyPhone.trim()}`,
      pickup_location: f.pickupLocation.trim(),
      payment_date: f.paymentDate,
      momo_reference: f.momoReference.trim(),
      shirt_size: f.shirtSize,
      medical_info: f.medicalInfo.trim(),
      notes: f.notes.trim(),
      registered_by: "Self",
    };
    try {
      await insertRegistrations([rec]);
    } catch (e) {
      setBusy(false);
      return toast("Could not save — check your connection", "err");
    }
    await refresh();
    setBusy(false);
    toast(`${f.name.split(" ")[0]} is registered`, "ok");
    setF(blank);
    setErr({});
    setPass(rec);
  };

  if (pass)
    return (
      <CampPass
        rec={pass}
        onDone={() => {
          setPass(null);
          go("home");
        }}
      />
    );

  return (
    <div className="page form-page">
      <Header go={go} title="Register" />
      <Tilt className="form-card" max={3}>
        <Field label="Full name" req err={err.name}>
          <input
            className="inp"
            value={f.name}
            onChange={set("name")}
            placeholder="e.g. Ama Mensah"
          />
        </Field>
        <Field label="Phone number (WhatsApp)" req err={err.phone}>
          <input
            className="inp"
            value={f.phone}
            onChange={set("phone")}
            placeholder="0XX XXX XXXX"
          />
        </Field>
        <Field label="Email address" err={err.email}>
          <input
            className="inp"
            value={f.email}
            onChange={set("email")}
            placeholder="Optional"
          />
        </Field>
        <div className="row2">
          <Field label="Local assembly" req err={err.assembly}>
            <input
              className="inp"
              value={f.assembly}
              onChange={set("assembly")}
              placeholder="e.g. Ablekuma Central"
            />
          </Field>
          <Field label="District">
            <input
              className="inp"
              value={f.district}
              onChange={set("district")}
              placeholder="Optional"
            />
          </Field>
        </div>

        <div className="section-lab">Emergency contact</div>
        <Field label="Name" req err={err.emergencyName}>
          <input
            className="inp"
            value={f.emergencyName}
            onChange={set("emergencyName")}
            placeholder="e.g. Kofi Mensah"
          />
        </Field>
        <div className="row2">
          <Field label="Relationship" req err={err.emergencyRelationship}>
            <input
              className="inp"
              value={f.emergencyRelationship}
              onChange={set("emergencyRelationship")}
              placeholder="e.g. Mother, Brother"
            />
          </Field>
          <Field label="Phone number" req err={err.emergencyPhone}>
            <input
              className="inp"
              value={f.emergencyPhone}
              onChange={set("emergencyPhone")}
              placeholder="0XX XXX XXXX"
            />
          </Field>
        </div>

        <Field label="Pickup location" req err={err.pickupLocation}>
          <input
            className="inp"
            value={f.pickupLocation}
            onChange={set("pickupLocation")}
            placeholder="Where will you be picked up from?"
          />
        </Field>

        <div className="section-lab">Registration fee</div>
        <p className="fee-note">
          Amount: <b>{FEE_AMOUNT}</b> · Pay by <b>{PAYMENT_DEADLINE}</b>
          <br />
          MoMo number: <b>{MOMO_NUMBER}</b> ({MOMO_NAME})
        </p>
        <div className="row2">
          <Field label="Payment date" req err={err.paymentDate}>
            <input
              type="date"
              className="inp"
              value={f.paymentDate}
              onChange={set("paymentDate")}
            />
          </Field>
          <Field
            label="MoMo Transaction ID / Reference"
            req
            err={err.momoReference}
          >
            <input
              className="inp"
              value={f.momoReference}
              onChange={set("momoReference")}
              placeholder="TSS"
            />
          </Field>
        </div>

        <Field
          label={`TSS-Shirt size (${SHIRT_FEE}, only if you don't already have one)`}
        >
          <select
            className="inp"
            value={f.shirtSize}
            onChange={set("shirtSize")}
          >
            <option value="">I already have one / not needed</option>
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
            <option>XL</option>
            <option>XXL</option>
            <option>XXXL</option>
          </select>
        </Field>

        <Field label="Any medical condition or emergency information">
          <textarea
            className="inp"
            rows={2}
            value={f.medicalInfo}
            onChange={set("medicalInfo")}
            placeholder="Optional — leave blank if none"
          />
        </Field>
        <Field label="Anything else you'd like us to know?">
          <textarea
            className="inp"
            rows={2}
            value={f.notes}
            onChange={set("notes")}
            placeholder="Optional"
          />
        </Field>

        <p className="fee-note">🏖️ Don't forget to bring your beach games!</p>

        <div className="section-lab">Declaration</div>
        <label className="chk-row">
          <input
            type="checkbox"
            checked={f.consentMeals}
            onChange={setChk("consentMeals")}
          />
          <span>
            I understand that meals will not be provided during TSS Connect
            2026, and I am responsible for making my own meal arrangements.
          </span>
        </label>
        <label className="chk-row">
          <input
            type="checkbox"
            checked={f.consentPhotos}
            onChange={setChk("consentPhotos")}
          />
          <span>
            I consent to photographs and videos taken during the event being
            used for church publicity.
          </span>
        </label>
        <label className="chk-row">
          <input
            type="checkbox"
            checked={f.consentGuidelines}
            onChange={setChk("consentGuidelines")}
          />
          <span>
            I agree to abide by the event guidelines and instructions from the
            organizing team.
          </span>
        </label>
        {err.declaration && (
          <div className="field-err big">{err.declaration}</div>
        )}

        <button className="btn btn-red full" disabled={busy} onClick={submit}>
          {busy ? "Saving…" : "Complete registration"}
        </button>
      </Tilt>
    </div>
  );
}

/* ============================ BULK REGISTER ============================ */
const blankMember = () => ({
  id: uid(),
  name: "",
  phone: "",
  email: "",
  assembly: "",
  medicalInfo: "",
});

function Bulk({ go, toast, refresh }) {
  const [organizer, setOrganizer] = useState("");
  const [district, setDistrict] = useState("");
  const [rows, setRows] = useState([blankMember(), blankMember()]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [passes, setPasses] = useState(null);

  const setRow = (id, k, v) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const add = () => setRows([...rows, blankMember()]);
  const del = (id) =>
    setRows(rows.length > 1 ? rows.filter((r) => r.id !== id) : rows);

  const submit = async () => {
    if (!organizer.trim())
      return setErr("Enter your name (the person registering)");
    const valid = rows.filter(
      (r) => r.name.trim() && validPhone(r.phone) && r.assembly.trim(),
    );
    if (valid.length === 0)
      return setErr(
        "Add at least one member with name, phone and local assembly",
      );
    setErr("");
    setBusy(true);
    const recs = valid.map((r) => ({
      id: uuidv4(),
      name: r.name.trim(),
      phone: r.phone.trim(),
      email: r.email.trim(),
      area: DEFAULT_AREA,
      district: district.trim(),
      assembly: r.assembly.trim(),
      medical_info: r.medicalInfo.trim(),
      emergency: "",
      pickup_location: "",
      registered_by: `Bulk · ${organizer.trim()}`,
    }));
    try {
      await insertRegistrations(recs);
    } catch (e) {
      setBusy(false);
      return setErr("Could not save — check your connection");
    }
    await refresh();
    setBusy(false);
    toast(`${recs.length} members registered`, "ok");
    setPasses(recs);
  };

  if (passes) return <BulkDone list={passes} onDone={() => go("home")} />;

  return (
    <div className="page form-page">
      <Header go={go} title="Bulk register a group" />
      <Tilt className="form-card" max={2}>
        <p className="fee-note">
          For speed, bulk registration only collects the essentials. Each member
          should still complete their own emergency contact, pickup, payment and
          declaration details individually — or an admin can add these later via
          Edit in the console.
        </p>
        <div className="row2">
          <Field label="Your name (registering officer)" req>
            <input
              className="inp"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g. District Youth Leader"
            />
          </Field>
          <Field label="District (optional)">
            <input
              className="inp"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="One district for all below"
            />
          </Field>
        </div>
        <div className="bulk-head">
          <span>Members</span>
          <button className="chip" onClick={add}>
            + Add member
          </button>
        </div>
        <div className="bulk-list">
          {rows.map((r, i) => (
            <div className="bulk-row" key={r.id}>
              <div className="bulk-no">{i + 1}</div>
              <input
                className="inp sm"
                placeholder="Full name"
                value={r.name}
                onChange={(e) => setRow(r.id, "name", e.target.value)}
              />
              <input
                className="inp sm"
                placeholder="Phone (WhatsApp)"
                value={r.phone}
                onChange={(e) => setRow(r.id, "phone", e.target.value)}
              />
              <input
                className="inp sm"
                placeholder="Local assembly"
                value={r.assembly}
                onChange={(e) => setRow(r.id, "assembly", e.target.value)}
              />
              <input
                className="inp sm"
                placeholder="Email (optional)"
                value={r.email}
                onChange={(e) => setRow(r.id, "email", e.target.value)}
              />
              <input
                className="inp sm"
                placeholder="Medical info (optional)"
                value={r.medicalInfo}
                onChange={(e) => setRow(r.id, "medicalInfo", e.target.value)}
              />
              <button className="del" onClick={() => del(r.id)} title="Remove">
                ×
              </button>
            </div>
          ))}
        </div>
        {err && <div className="field-err big">{err}</div>}
        <button className="btn btn-green full" disabled={busy} onClick={submit}>
          {busy
            ? "Saving…"
            : `Register ${rows.filter((r) => r.name.trim()).length || ""} members`}
        </button>
      </Tilt>
    </div>
  );
}

/* ============================ ADMIN ============================ */
/* ============================ EDIT MODAL ============================ */
function EditModal({ rec, onClose, onSaved, toast }) {
  const [f, setF] = useState({
    name: rec.name || "",
    phone: rec.phone || "",
    email: rec.email || "",
    district: rec.district || "",
    assembly: rec.assembly || "",
    emergency: rec.emergency || "",
    pickup_location: rec.pickup_location || "",
    payment_date: rec.payment_date || "",
    momo_reference: rec.momo_reference || "",
    shirt_size: rec.shirt_size || "",
    medical_info: rec.medical_info || "",
    notes: rec.notes || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    if (!f.name.trim()) return toast("Name cannot be empty", "err");
    setBusy(true);
    try {
      await updateRegistration(rec.id, {
        name: f.name.trim(),
        phone: f.phone,
        email: f.email,
        district: f.district.trim(),
        assembly: f.assembly,
        emergency: f.emergency,
        pickup_location: f.pickup_location,
        payment_date: f.payment_date || null,
        momo_reference: f.momo_reference,
        shirt_size: f.shirt_size,
        medical_info: f.medical_info,
        notes: f.notes,
      });
    } catch (e) {
      setBusy(false);
      return toast("Could not save changes", "err");
    }
    setBusy(false);
    toast("Registration updated", "ok");
    await onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          Edit registration
          <button className="modal-x" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <Field label="Full name">
            <input className="inp" value={f.name} onChange={set("name")} />
          </Field>
          <div className="row2">
            <Field label="Phone (WhatsApp)">
              <input className="inp" value={f.phone} onChange={set("phone")} />
            </Field>
            <Field label="Email">
              <input className="inp" value={f.email} onChange={set("email")} />
            </Field>
          </div>
          <div className="row2">
            <Field label="Local assembly">
              <input
                className="inp"
                value={f.assembly}
                onChange={set("assembly")}
              />
            </Field>
            <Field label="District">
              <input
                className="inp"
                value={f.district}
                onChange={set("district")}
              />
            </Field>
          </div>
          <Field label="Emergency contact (name, relationship, phone)">
            <input
              className="inp"
              value={f.emergency}
              onChange={set("emergency")}
            />
          </Field>
          <Field label="Pickup location">
            <input
              className="inp"
              value={f.pickup_location}
              onChange={set("pickup_location")}
            />
          </Field>
          <div className="row2">
            <Field label="Payment date">
              <input
                type="date"
                className="inp"
                value={f.payment_date}
                onChange={set("payment_date")}
              />
            </Field>
            <Field label="MoMo Transaction ID / Reference">
              <input
                className="inp"
                value={f.momo_reference}
                onChange={set("momo_reference")}
              />
            </Field>
          </div>
          <Field label="TSS-Shirt size">
            <select
              className="inp"
              value={f.shirt_size}
              onChange={set("shirt_size")}
            >
              <option value="">None</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
              <option>XL</option>
              <option>XXL</option>
              <option>XXXL</option>
            </select>
          </Field>
          <Field label="Medical condition / emergency info">
            <textarea
              className="inp"
              rows={2}
              value={f.medical_info}
              onChange={set("medical_info")}
            />
          </Field>
          <Field label="Additional notes">
            <textarea
              className="inp"
              rows={2}
              value={f.notes}
              onChange={set("notes")}
            />
          </Field>
        </div>
        <div className="modal-foot">
          <button className="chip ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-navy" disabled={busy} onClick={save}>
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Admin({ go, toast }) {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [updated, setUpdated] = useState(null);
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(null);

  const pull = useCallback(async () => {
    const all = await loadAllRegistrations();
    setData(all);
    setUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!authed) return;
    pull();
    const channel = supabase
      .channel("reg-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        pull,
      )
      .subscribe();
    const t = setInterval(pull, 8000); // fallback poll
    return () => {
      clearInterval(t);
      supabase.removeChannel(channel);
    };
  }, [authed, pull]);

  const login = async () => {
    setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    if (error)
      setLoginErr(error.message || "Email or password not recognised.");
    else setAuthed(true);
  };

  const exportCsv = () => {
    const head = [
      "Name",
      "Phone",
      "Email",
      "District",
      "Local assembly",
      "Emergency contact",
      "Pickup location",
      "Payment date",
      "MoMo reference",
      "Shirt size",
      "Medical info",
      "Notes",
      "Registered by",
      "Checked in",
      "Registered at",
    ];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [head.join(",")];
    data.forEach((r) =>
      lines.push(
        [
          esc(r.name),
          esc(r.phone),
          esc(r.email),
          esc(r.district),
          esc(r.assembly),
          esc(r.emergency),
          esc(r.pickup_location),
          esc(r.payment_date),
          esc(r.momo_reference),
          esc(r.shirt_size),
          esc(r.medical_info),
          esc(r.notes),
          esc(r.registered_by),
          esc(r.checked_in ? "Yes" : "No"),
          esc(new Date(r.created_at).toLocaleString()),
        ].join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tssconnect2026_registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported", "ok");
  };

  if (!authed) {
    return (
      <div className="page form-page">
        <Header go={go} title="Admin console" />
        <Tilt className="form-card narrow" max={4}>
          <img src={LOGO} className="admin-logo" alt="logo" />
          <p className="admin-note">Restricted to the camp administrator.</p>
          <Field label="Admin email">
            <input
              className="inp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ADMIN_EMAIL}
            />
          </Field>
          <Field label="Password">
            <input
              className="inp"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="********"
            />
          </Field>
          {loginErr && <div className="field-err big">{loginErr}</div>}
          <button className="btn btn-navy full" onClick={login}>
            Open console
          </button>
        </Tilt>
      </div>
    );
  }

  const f = data.filter((r) => {
    const t = (
      r.name +
      r.district +
      (r.area || "") +
      r.phone +
      r.email +
      (r.assembly || "")
    ).toLowerCase();
    return t.includes(q.toLowerCase());
  });
  const districts = [...new Set(data.map((r) => r.district))];
  const withMedical = data.filter((r) => (r.medical_info || "").trim()).length;
  const inCount = data.filter((r) => r.checked_in).length;
  const byDistrict = districts
    .map((d) => ({ d, n: data.filter((r) => r.district === d).length }))
    .sort((a, b) => b.n - a.n);
  const maxN = Math.max(1, ...byDistrict.map((x) => x.n));

  return (
    <div className="page admin-page">
      <div className="admin-top">
        <div className="admin-id">
          <img src={LOGO} alt="" />
          <div>
            <div className="admin-h">Admin Console</div>
            <div className="admin-sub">{ADMIN_EMAIL}</div>
          </div>
        </div>
        <div className="admin-actions">
          <span className="live-pill sm">
            <span className="dot" /> live
            {updated ? " \u00b7 " + updated.toLocaleTimeString() : ""}
          </span>
          <button className="chip" onClick={pull}>
            Refresh
          </button>
          <button className="chip" onClick={exportCsv}>
            Export CSV
          </button>
          <button
            className="chip ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              go("home");
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-tabs no-print">
        <button
          className={"tabbtn" + (tab === "overview" ? " on" : "")}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={"tabbtn" + (tab === "checkin" ? " on" : "")}
          onClick={() => setTab("checkin")}
        >
          Check-in
        </button>
        <button
          className={"tabbtn" + (tab === "tags" ? " on" : "")}
          onClick={() => setTab("tags")}
        >
          Name tags
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="stat-row">
            <Tilt className="stat" max={10}>
              <div className="stat-n">{data.length}</div>
              <div className="stat-l">Total registered</div>
            </Tilt>
            <Tilt className="stat" max={10}>
              <div className="stat-n">{inCount}</div>
              <div className="stat-l">Checked in</div>
            </Tilt>
            <Tilt className="stat" max={10}>
              <div className="stat-n">{districts.length}</div>
              <div className="stat-l">Districts</div>
            </Tilt>
            <Tilt className="stat" max={10}>
              <div className="stat-n">{withMedical}</div>
              <div className="stat-l">With medical notes</div>
            </Tilt>
          </div>

          {byDistrict.length > 0 && (
            <div className="panel">
              <div className="panel-h">By district</div>
              {byDistrict.map((x) => (
                <div className="bar-row" key={x.d}>
                  <span className="bar-lab">{x.d}</span>
                  <span className="bar-track">
                    <span
                      className="bar-fill"
                      style={{ width: (x.n / maxN) * 100 + "%" }}
                    />
                  </span>
                  <span className="bar-n">{x.n}</span>
                </div>
              ))}
            </div>
          )}

          <div className="panel">
            <div className="panel-h row-between">
              Registrations{" "}
              <input
                className="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, district, phone..."
              />
            </div>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Local assembly</th>
                    <th>District</th>
                    <th>Pickup</th>
                    <th>MoMo ref</th>
                    <th>Medical</th>
                    <th>By</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {f.length === 0 && (
                    <tr>
                      <td colSpan={10} className="empty">
                        No registrations yet. They appear here the moment a
                        member signs up.
                      </td>
                    </tr>
                  )}
                  {f.map((r) => (
                    <tr key={r.id}>
                      <td className="b">{r.name}</td>
                      <td>{r.phone}</td>
                      <td>{r.assembly || ""}</td>
                      <td>{r.district}</td>
                      <td>{r.pickup_location || "\u2014"}</td>
                      <td className="muted sm">
                        {r.momo_reference || "\u2014"}
                      </td>
                      <td className={r.medical_info ? "warn" : "muted"}>
                        {r.medical_info || "\u2014"}
                      </td>
                      <td className="muted sm">{r.registered_by}</td>
                      <td>
                        {r.checked_in ? (
                          <span className="badge-in">checked in</span>
                        ) : (
                          <span className="badge-out">expected</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="mini-btn"
                          onClick={() => setEditing(r)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "checkin" && (
        <CheckIn data={data} onChanged={pull} toast={toast} />
      )}
      {tab === "tags" && <NameTags data={data} />}
      {editing && (
        <EditModal
          rec={editing}
          onClose={() => setEditing(null)}
          onSaved={pull}
          toast={toast}
        />
      )}
    </div>
  );
}

/* ============================ CHECK-IN ============================ */
function CheckIn({ data, onChanged, toast }) {
  const [scanning, setScanning] = useState(false);
  const [q, setQ] = useState("");
  const [last, setLast] = useState(null);
  const total = data.length;
  const inCount = data.filter((r) => r.checked_in).length;

  const mark = async (rec, val) => {
    try {
      if (val) await checkIn(rec.id);
      else await undoCheckIn(rec.id);
    } catch (e) {
      return toast("Update failed \u2014 check connection", "err");
    }
    if (val) {
      setLast({ ...rec, checked_in: true });
      toast(`${rec.name.split(" ")[0]} checked in`, "ok");
    }
    onChanged();
  };

  const handleScan = (text) => {
    setScanning(false);
    const rec = data.find((r) => r.id === text);
    if (!rec) return toast("Pass not recognised", "err");
    if (rec.checked_in) {
      setLast(rec);
      return toast(`${rec.name.split(" ")[0]} already checked in`, "err");
    }
    mark(rec, true);
  };

  const list = q
    ? data.filter((r) =>
        (r.name + r.district + (r.phone || ""))
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
    : data;

  return (
    <div className="checkin">
      <div className="ci-bar">
        <div className="ci-count">
          <b>{inCount}</b> / {total} checked in
        </div>
        <button
          className="btn btn-green ci-scan"
          onClick={() => setScanning((x) => !x)}
        >
          {scanning ? "Stop camera" : "Scan QR pass"}
        </button>
      </div>

      {scanning && (
        <Scanner
          onScan={handleScan}
          onClose={(msg) => {
            setScanning(false);
            if (msg) toast(msg, "err");
          }}
        />
      )}

      {last && (
        <div className="ci-last">
          <div className="ci-last-name">{last.name}</div>
          <div className="ci-last-meta">
            {last.area || DEFAULT_AREA} · {last.district}
          </div>
          <div className="ci-last-theme">{CAMP_THEME} — checked in</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-h row-between">
          Manual check-in{" "}
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, district, phone..."
          />
        </div>
        <div className="ci-list">
          {list.length === 0 && (
            <div className="empty">No matching members.</div>
          )}
          {list.map((r) => (
            <div
              className={"ci-row" + (r.checked_in ? " done" : "")}
              key={r.id}
            >
              <div className="ci-info">
                <div className="ci-name">
                  {r.name}{" "}
                  {r.medical_info ? (
                    <span className="ci-tag-allergy">\u26a0</span>
                  ) : null}
                </div>
                <div className="ci-sub">
                  {r.district}
                  {r.phone ? " \u00b7 " + r.phone : ""}
                </div>
              </div>
              {r.checked_in ? (
                <button className="chip ghost" onClick={() => mark(r, false)}>
                  Undo
                </button>
              ) : (
                <button className="chip" onClick={() => mark(r, true)}>
                  Check in
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ QR + SCANNER ============================ */
function QR({ text, size = 120 }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(text || "", {
      width: size,
      margin: 1,
      color: { dark: "#14216B", light: "#ffffff" },
    })
      .then((u) => {
        if (live) setSrc(u);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [text, size]);
  return src ? (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR code"
      className="qr-img"
    />
  ) : (
    <div className="qr-ph" style={{ width: size, height: size }} />
  );
}

function Scanner({ onScan, onClose }) {
  useEffect(() => {
    let scanner;
    let done = false;
    const stop = () => {
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        scanner = new Html5Qrcode("qr-reader");
        scanner
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 230 },
            (text) => {
              if (!done) {
                done = true;
                stop();
                onScan(text);
              }
            },
            () => {},
          )
          .catch((e) =>
            onClose(
              (e && e.message) ||
                "Camera unavailable. Allow camera access, or use manual check-in.",
            ),
          );
      })
      .catch(() => onClose("Scanner could not load."));
    return () => stop();
  }, []);
  return (
    <div className="scanner">
      <div id="qr-reader" />
      <button className="chip ghost no-print" onClick={() => onClose()}>
        Close camera
      </button>
    </div>
  );
}

async function downloadQR(rec) {
  try {
    const url = await QRCode.toDataURL(rec.id, {
      width: 700,
      margin: 2,
      color: { dark: "#14216B", light: "#ffffff" },
    });
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalyst-pass-${(rec.name || "member").replace(/\s+/g, "_")}.png`;
    a.click();
  } catch (e) {}
}

/* ============================ CAMP PASS ============================ */
function CampPass({ rec, onDone }) {
  return (
    <div className="page form-page">
      <div className="pass-wrap">
        <div className="pass print-area">
          <div className="pass-top">
            <img src={LOGO} className="pass-logo" alt="" />
            <div>
              <div className="pass-camp">TSS Connect 2026</div>
              <div className="pass-dates">
                {rec.pickup_location ? `Pickup: ${rec.pickup_location}` : ""}
              </div>
            </div>
          </div>
          <div className="pass-name">{rec.name}</div>
          <div className="pass-meta">
            {rec.assembly}
            {rec.district ? " · " + rec.district : ""}
          </div>
          <div className="pass-theme">{CAMP_THEME}</div>
          <QR text={rec.id} size={170} />
          <div className="pass-foot">Show this QR at the gate to check in</div>
        </div>
        <div className="pass-actions no-print">
          <button className="btn btn-green" onClick={() => downloadQR(rec)}>
            Download pass
          </button>
          <button className="btn btn-navy" onClick={onDone}>
            Done
          </button>
        </div>
        <p className="pass-tip no-print">
          Screenshot or download your pass. You can also just give your name at
          the gate.
        </p>
      </div>
    </div>
  );
}

/* ============================ NAME TAGS ============================ */
function NameTags({ data }) {
  const [dist, setDist] = useState("All");
  const districts = [
    "All",
    ...Array.from(new Set(data.map((r) => r.district))),
  ];
  const list = dist === "All" ? data : data.filter((r) => r.district === dist);
  return (
    <div>
      <div className="tags-bar no-print">
        <select
          className="inp sm"
          style={{ maxWidth: 240 }}
          value={dist}
          onChange={(e) => setDist(e.target.value)}
        >
          {districts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <span className="tags-count">
          {list.length} tag{list.length === 1 ? "" : "s"}
        </span>
        <button className="btn btn-navy" onClick={() => window.print()}>
          Print tags
        </button>
      </div>
      {list.length === 0 ? (
        <div className="panel empty">No registrations to print yet.</div>
      ) : (
        <TagGrid list={list} />
      )}
    </div>
  );
}

function TagGrid({ list }) {
  return (
    <div className="print-area">
      <div className="tag-grid">
        {list.map((r) => (
          <Tag key={r.id} rec={r} />
        ))}
      </div>
    </div>
  );
}
function Tag({ rec }) {
  return (
    <div className="tag">
      <div className="tag-head">
        <img src={LOGO} className="tag-logo" alt="" />
        <div className="tag-title">{MINISTRY_MOTTO}</div>
      </div>
      <div className="tag-name">{rec.name}</div>
      <div className="tag-area">{rec.assembly || ""}</div>
      <div className="tag-dist">{rec.district || ""}</div>
      <QR text={rec.id} size={92} />
      <div className="tag-foot">{CAMP_THEME}</div>
    </div>
  );
}

/* ============================ BULK DONE ============================ */
function BulkDone({ list, onDone }) {
  return (
    <div className="page form-page">
      <div className="sub-head no-print">
        <div className="sub-title" style={{ flex: 1 }}>
          {list.length} members registered
        </div>
        <img src={LOGO} className="sub-logo" alt="" />
      </div>
      <p className="bulk-done-tip no-print">
        Camp passes for the group are below. Print them as name tags, or tap
        Done.
      </p>
      <div className="tags-bar no-print">
        <button className="btn btn-navy" onClick={() => window.print()}>
          Print passes
        </button>
        <button className="btn btn-green" onClick={onDone}>
          Done
        </button>
      </div>
      <TagGrid list={list} />
    </div>
  );
}

/* ============================ HEADER ============================ */
function Header({ go, title }) {
  return (
    <div className="sub-head">
      <button className="back" onClick={() => go("home")}>
        ‹ Back
      </button>
      <div className="sub-title">{title}</div>
      <img src={LOGO} className="sub-logo" alt="" />
    </div>
  );
}

/* ============================ APP ============================ */
export default function App() {
  const [splash, setSplash] = useState(true);
  const [view, setView] = useState("home");
  const [total, setTotal] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [toastKind, setToastKind] = useState("ok");
  const toast = (m, k = "ok") => {
    setToastKind(k);
    setToastMsg(m);
  };

  const refresh = useCallback(async () => {
    const c = await fetchCount();
    setTotal(c);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    if (view === "home") refresh();
  }, [view, refresh]);

  return (
    <div className="app">
      <style>{CSS}</style>
      {splash && <Splash onDone={() => setSplash(false)} />}
      {!splash && view === "home" && <Home go={setView} total={total} />}
      {!splash && view === "register" && (
        <Register go={setView} toast={toast} refresh={refresh} />
      )}
      {!splash && view === "bulk" && (
        <Bulk go={setView} toast={toast} refresh={refresh} />
      )}
      {!splash && view === "admin" && <Admin go={setView} toast={toast} />}
      <Toast msg={toastMsg} kind={toastKind} onDone={() => setToastMsg("")} />
      {!splash && <div className="footer">Developed by Adsphere</div>}
    </div>
  );
}

/* ============================ STYLES ============================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
:root{
  --navy:#14216B; --navy2:#0B1340; --red:#E8242A; --green:#2C9A3F; --gold:#F4B41A;
  --paper:#EEF1FA; --ink:#16204a; --line:#dfe3f2;
}
*{box-sizing:border-box}
.app{font-family:Inter,system-ui,sans-serif;color:var(--ink);background:var(--paper);min-height:100vh;overflow-x:hidden}
.btn{border:0;cursor:pointer;font-family:Poppins;font-weight:700;font-size:15px;color:#fff;padding:14px 22px;border-radius:14px;
  transition:transform .12s ease, box-shadow .2s ease;letter-spacing:.2px}
.btn:active{transform:translateY(2px) scale(.99)}
.btn.full{width:100%;margin-top:6px}
.btn-red{background:linear-gradient(180deg,#ff3b41,var(--red));box-shadow:0 10px 22px -8px rgba(232,36,42,.7),inset 0 1px 0 rgba(255,255,255,.4)}
.btn-green{background:linear-gradient(180deg,#37b551,var(--green));box-shadow:0 10px 22px -8px rgba(44,154,63,.7),inset 0 1px 0 rgba(255,255,255,.4)}
.btn-navy{background:linear-gradient(180deg,#28379e,var(--navy));box-shadow:0 10px 22px -8px rgba(20,33,107,.7),inset 0 1px 0 rgba(255,255,255,.3)}
.btn:disabled{opacity:.6;cursor:wait}

/* splash */
.splash{position:fixed;inset:0;z-index:50;background:radial-gradient(120% 90% at 50% 30%,#1c2b86,var(--navy2));
  display:flex;flex-direction:column;align-items:center;justify-content:center;animation:splashOut .5s ease 2.1s forwards;cursor:pointer}
.splash-glow{position:absolute;width:520px;height:520px;border-radius:50%;
  background:radial-gradient(circle,rgba(244,180,26,.35),transparent 60%);filter:blur(20px);animation:pulse 2.4s ease-in-out infinite}
.splash-logo-wrap{position:relative;animation:logoIn 1s cubic-bezier(.2,.8,.2,1)}
.splash-logo{width:150px;height:150px;border-radius:50%;background:#fff;padding:8px;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);position:relative;z-index:2}
.splash-ring{position:absolute;inset:-14px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:var(--gold);animation:spin 3s linear infinite}
.splash-title{font-family:Poppins;font-weight:800;color:#fff;letter-spacing:1px;margin-top:30px;font-size:20px;text-align:center;animation:fadeUp .8s ease .5s both}
.splash-sub{color:#cdd6ff;margin-top:8px;font-size:14px;animation:fadeUp .8s ease .7s both}
.splash-tap{position:absolute;bottom:42px;color:rgba(255,255,255,.5);font-size:12px;letter-spacing:2px;text-transform:uppercase;animation:blink 1.6s ease infinite}

/* page */
.page{max-width:1040px;margin:0 auto;padding:0 16px 40px;animation:fadeUp .5s ease both}
.hero{position:relative;border-radius:0 0 32px 32px;overflow:hidden;margin:0 -16px 26px;padding:46px 24px 40px;color:#fff;text-align:center}
.hero-bg{position:absolute;inset:0;background:
  radial-gradient(80% 60% at 80% 0%,rgba(189, 148, 38, 0.35),transparent 60%),
  radial-gradient(70% 60% at 10% 30%,rgba(36, 38, 169, 0.4),transparent 60%),
  linear-gradient(160deg,#1b2a85,var(--navy2));}
.hero-bg:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 120%,rgba(244,180,26,.25),transparent 55%)}
.hero-inner{position:relative;z-index:2}
.hero-logo{width:84px;height:84px;border-radius:50%;background:#fff;padding:5px;box-shadow:0 16px 30px -12px rgba(0,0,0,.5);animation:floaty 5s ease-in-out infinite}
.eyebrow{margin-top:14px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#aeb9ff;font-weight:600}
.hero-title{font-family:Poppins;font-weight:800;font-size:clamp(40px,9vw,72px);line-height:.92;margin:8px 0 4px;text-shadow:0 8px 24px rgba(0,0,0,.35)}
.hero-title span{display:block;color:var(--gold);font-size:.42em;letter-spacing:8px;margin-top:6px}
.hero-meta{color:#dde3ff;font-size:15px;line-height:1.6;margin:6px 0 20px}
.countdown{display:flex;gap:10px;justify-content:center;margin-bottom:18px}
.cd-cell{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);
  border-radius:16px;padding:12px 6px;min-width:68px;box-shadow:0 12px 24px -14px rgba(0,0,0,.6)}
.cd-num{font-family:Poppins;font-weight:800;font-size:30px;color:#fff}
.cd-lab{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b9c2ff}
.live-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);color:#eaf0ff;
  border:1px solid rgba(255,255,255,.2);padding:7px 14px;border-radius:999px;font-size:13px;font-weight:600;margin-bottom:20px}
.live-pill.sm{background:rgba(167, 146, 40, 0.12);color:#1c6e2f;border-color:rgba(154, 128, 44, 0.3)}
.dot{width:8px;height:8px;border-radius:50%;background:#37ff7a;box-shadow:0 0 0 0 rgba(245, 255, 55, 0.7);animation:ping 1.6s ease infinite}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.link-admin{margin-top:16px;background:none;border:0;color:#cdd6ff;font-size:13px;cursor:pointer;font-weight:600}
.link-admin:hover{color:#fff}

.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.home-photo{width:100%;max-width:480px;height:auto;border-radius:20px;margin:16px auto 0;display:block;box-shadow:0 24px 44px -30px rgba(20,33,107,.5)}
.info-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;
  box-shadow:0 20px 40px -28px rgba(107, 87, 20, 0.5)}
.ic-k{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--red);font-weight:700}
.ic-v{font-family:Poppins;font-weight:700;font-size:20px;color:var(--navy);margin:2px 0 8px}
.info-card p{font-size:14px;line-height:1.55;color:#566}

/* forms */
.form-page{max-width:760px}
.sub-head{display:flex;align-items:center;gap:14px;padding:20px 0 14px}
.back{background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 14px;font-weight:600;cursor:pointer;color:var(--navy)}
.sub-title{font-family:Poppins;font-weight:700;font-size:22px;color:var(--navy);flex:1}
.sub-logo{width:40px;height:40px;border-radius:50%;background:#fff;padding:3px;border:1px solid var(--line)}
.form-card{background:#fff;border:1px solid var(--line);border-radius:24px;padding:24px;
  box-shadow:0 40px 80px -40px rgba(20,33,107,.55)}
.form-card.narrow{max-width:420px;margin:0 auto;text-align:center}
.field{display:block;margin-bottom:16px;text-align:left}
.field-label{display:block;font-size:13px;font-weight:600;color:#3a4470;margin-bottom:6px}
.field-label i{color:var(--red);font-style:normal}
.inp{width:100%;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;font-size:15px;font-family:Inter;
  background:#fbfcff;transition:border .15s,box-shadow .15s;outline:none}
.inp:focus{border-color:var(--navy);box-shadow:0 0 0 4px rgba(20,33,107,.12)}
textarea.inp{resize:vertical}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.field-err{display:block;color:var(--red);font-size:12.5px;margin-top:5px;font-weight:500}
.field-err.big{text-align:center;margin:4px 0 12px}
.section-lab{font-family:Poppins;font-weight:700;color:var(--navy);font-size:14px;margin:18px 0 8px;padding-top:12px;border-top:1px dashed var(--line)}
.fee-note{background:#f4f6ff;border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:13px;color:#445;margin:6px 0 14px;line-height:1.5}
.chk-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:13.5px;color:#334;cursor:pointer}
.chk-row input{margin-top:3px;flex:none}

/* bulk */
.bulk-head{display:flex;align-items:center;justify-content:space-between;margin:8px 0 10px}
.bulk-head span{font-family:Poppins;font-weight:700;color:var(--navy)}
.chip{background:var(--navy);color:#fff;border:0;border-radius:10px;padding:8px 14px;font-weight:600;font-size:13px;cursor:pointer}
.chip.ghost{background:#fff;color:var(--navy);border:1px solid var(--line)}
.bulk-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.bulk-row{display:flex;gap:6px;align-items:center;background:#fbfcff;border:1px solid var(--line);border-radius:14px;padding:8px;flex-wrap:wrap}
.bulk-no{width:26px;height:26px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex:none}
.inp.sm{padding:9px 11px;font-size:13.5px;flex:1;min-width:120px}
.inp.sm.w70{max-width:70px;min-width:60px}
.inp.sm.w90{max-width:96px;min-width:80px}
.del{background:#fff;border:1px solid var(--line);color:var(--red);width:30px;height:30px;border-radius:8px;font-size:18px;cursor:pointer;flex:none}

/* admin */
.admin-page{max-width:1100px}
.admin-logo{width:70px;height:70px;border-radius:50%;background:#fff;padding:4px;border:1px solid var(--line);margin:0 auto 4px}
.admin-note{color:#667;font-size:14px;margin:6px 0 16px}
.admin-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 0;flex-wrap:wrap}
.admin-id{display:flex;align-items:center;gap:12px}
.admin-id img{width:46px;height:46px;border-radius:50%;background:#fff;padding:3px;border:1px solid var(--line)}
.admin-h{font-family:Poppins;font-weight:700;font-size:22px;color:var(--navy)}
.admin-sub{font-size:13px;color:#778}
.admin-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.stat{background:linear-gradient(160deg,#fff,#f4f6ff);border:1px solid var(--line);border-radius:18px;padding:18px;
  box-shadow:0 24px 44px -30px rgba(20,33,107,.5)}
.stat-n{font-family:Poppins;font-weight:800;font-size:30px;color:var(--navy);line-height:1}
.stat-l{font-size:12.5px;color:#667;margin-top:6px;font-weight:500}
.panel{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px;margin-bottom:16px;
  box-shadow:0 24px 50px -36px rgba(202, 157, 10, 0.5)}
.panel-h{font-family:Poppins;font-weight:700;color:var(--navy);margin-bottom:12px}
.row-between{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.search{border:1.5px solid var(--line);border-radius:10px;padding:8px 12px;font-size:14px;outline:none;min-width:220px}
.search:focus{border-color:var(--navy)}
.bar-row{display:flex;align-items:center;gap:12px;margin:7px 0;font-size:13.5px}
.bar-lab{width:160px;flex:none;color:#445;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-track{flex:1;height:12px;background:#eef0f8;border-radius:8px;overflow:hidden}
.bar-fill{display:block;height:100%;background:linear-gradient(90deg,var(--green),#7ad08c);border-radius:8px;transition:width .5s ease}
.bar-n{width:34px;text-align:right;font-weight:700;color:var(--navy)}
.table-wrap{overflow-x:auto}
.tbl{width:100%;border-collapse:collapse;font-size:13.5px;min-width:760px}
.tbl th{text-align:left;color:#778;font-weight:600;font-size:11.5px;text-transform:uppercase;letter-spacing:.5px;padding:8px 10px;border-bottom:2px solid var(--line)}
.tbl td{padding:11px 10px;border-bottom:1px solid #f0f2fa}
.tbl tr:hover td{background:#fafbff}
.tbl .b{font-weight:600;color:var(--navy)}
.tbl .muted{color:#889}
.tbl .sm{font-size:12px}
.tbl .warn{color:var(--red);font-weight:600}
.empty{text-align:center;color:#889;padding:30px}

.footer{text-align:center;color:#8893bf;font-size:12px;padding:24px 16px 36px}

/* toast */
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;color:#fff;font-weight:600;font-size:14px;
  padding:13px 22px;border-radius:14px;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);animation:fadeUp .35s ease}
.toast.ok{background:linear-gradient(180deg,#37b551,var(--green))}
.toast.err{background:linear-gradient(180deg,#ff3b41,var(--red))}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{transform:scale(.9);opacity:.7}50%{transform:scale(1.05);opacity:1}}
@keyframes logoIn{0%{transform:scale(.4) rotateY(120deg);opacity:0}100%{transform:scale(1) rotateY(0);opacity:1}}
@keyframes spinIn{0%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
@keyframes fadeUp{0%{transform:translateY(14px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes blink{0%,100%{opacity:.3}50%{opacity:.8}}
@keyframes ping{0%{box-shadow:0 0 0 0 rgba(55,255,122,.6)}70%{box-shadow:0 0 0 8px rgba(55,255,122,0)}100%{box-shadow:0 0 0 0 rgba(55,255,122,0)}}
@keyframes splashOut{to{opacity:0;visibility:hidden}}

@media(max-width:720px){
  .info-grid{grid-template-columns:1fr}
  .stat-row{grid-template-columns:1fr 1fr}
  .row2{grid-template-columns:1fr}
  .bar-lab{width:110px}
}
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.001s!important;transition:none!important}
}

/* badges in table */
.badge-in{background:#e7f8ec;color:#1c7a32;border:1px solid #bfe8c9;border-radius:999px;padding:3px 10px;font-size:11.5px;font-weight:700}
.badge-out{background:#f1f3fb;color:#6a74a0;border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:11.5px;font-weight:600}

/* QR + pass */
.qr-img{display:block;border-radius:10px;background:#fff}
.qr-ph{background:#eef1fb;border-radius:10px}
.pass-wrap{max-width:380px;margin:10px auto 0;text-align:center}
.pass{background:#fff;border:1px solid var(--line);border-radius:24px;padding:22px;
  box-shadow:0 40px 80px -40px rgba(20,33,107,.55);display:flex;flex-direction:column;align-items:center;gap:10px}
.pass-top{display:flex;align-items:center;gap:12px;width:100%;border-bottom:1px dashed var(--line);padding-bottom:14px}
.pass-logo{width:48px;height:48px;border-radius:50%;background:#fff;padding:3px;border:1px solid var(--line)}
.pass-camp{font-family:Poppins;font-weight:800;color:var(--navy);font-size:18px;text-align:left}
.pass-dates{font-size:12px;color:#778;text-align:left}
.pass-name{font-family:Poppins;font-weight:700;font-size:24px;color:var(--ink)}
.pass-meta{font-size:13px;color:#667;margin-top:-6px}
.pass-foot{font-size:12px;color:#889}
.pass-allergy{background:#fff2f2;color:var(--red);border:1px solid #ffd2d2;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600}
.pass-actions{display:flex;gap:10px;justify-content:center;margin-top:16px}
.pass-tip{font-size:12.5px;color:#778;margin-top:12px}

/* admin tabs */
.admin-tabs{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.tabbtn{background:#fff;border:1px solid var(--line);color:var(--navy);font-weight:600;font-family:Inter;
  padding:9px 16px;border-radius:11px;cursor:pointer;font-size:14px}
.tabbtn.on{background:var(--navy);color:#fff;border-color:var(--navy)}

/* check-in */
.checkin{animation:fadeUp .3s ease both}
.ci-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.ci-count{font-size:16px;color:var(--ink)}
.ci-count b{font-family:Poppins;font-size:22px;color:var(--green)}
.ci-scan{padding:11px 18px}
.scanner{background:#0b1340;border-radius:18px;padding:14px;margin-bottom:16px;display:flex;flex-direction:column;align-items:center;gap:10px}
#qr-reader{width:100%;max-width:340px;border-radius:12px;overflow:hidden}
.ci-last{background:linear-gradient(160deg,#eafff0,#fff);border:1px solid #bfe8c9;border-radius:16px;padding:16px;margin-bottom:16px}
.ci-last.has-allergy{background:linear-gradient(160deg,#fff4f4,#fff);border-color:#ffd0d0}
.ci-last-name{font-family:Poppins;font-weight:700;font-size:20px;color:var(--navy)}
.ci-last-meta{font-size:13px;color:#667}
.ci-allergy{margin-top:8px;background:#fff;border:1px solid #ffcccc;color:var(--red);border-radius:10px;padding:8px 12px;font-weight:600;font-size:13.5px}
.ci-list{display:flex;flex-direction:column;gap:8px}
.ci-row{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fbfcff;border:1px solid var(--line);border-radius:12px;padding:11px 14px}
.ci-row.done{background:#f1faf3;border-color:#cfeccf}
.ci-name{font-weight:600;color:var(--navy)}
.ci-tag-allergy{color:var(--red)}
.ci-sub{font-size:12.5px;color:#778}

/* name tags */
.tags-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.tags-count{font-size:14px;color:#667;font-weight:600}
.tag-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.tag{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:0 18px 36px -28px rgba(20,33,107,.5);break-inside:avoid}
.tag-head{display:flex;align-items:center;gap:8px}
.tag-logo{width:30px;height:30px;border-radius:50%;background:#fff;padding:2px;border:1px solid var(--line)}
.tag-title{font-family:Poppins;font-weight:800;color:var(--red);font-size:13px;letter-spacing:.5px}
.tag-name{font-family:Poppins;font-weight:700;color:var(--navy);font-size:16px;line-height:1.15}
.tag-dist{font-size:12px;color:#667;margin-top:-2px}
.tag-foot{font-size:10.5px;color:#99a}
.tag-allergy{font-size:11px;color:var(--red);font-weight:700}
.bulk-done-tip{font-size:14px;color:#667;margin:4px 0 14px}

.tag-area{font-size:11px;color:var(--green);font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:1px}
.pass-theme{font-family:Poppins;font-weight:700;color:var(--green);font-size:13px;letter-spacing:.3px;margin-top:2px}
.ci-last-theme{font-size:12.5px;color:var(--green);font-weight:700;margin-top:2px}
.modal-overlay{position:fixed;inset:0;z-index:70;background:rgba(11,20,64,.55);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto}
.modal{background:#fff;border-radius:20px;width:100%;max-width:560px;box-shadow:0 40px 90px -30px rgba(0,0,0,.6);margin:auto;animation:fadeUp .3s ease}
.modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--line);font-family:Poppins;font-weight:700;color:var(--navy);font-size:18px}
.modal-x{background:none;border:0;font-size:26px;line-height:1;color:#889;cursor:pointer}
.modal-body{padding:18px 22px;max-height:62vh;overflow-y:auto}
.modal-foot{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid var(--line)}
.mini-btn{background:#fff;border:1px solid var(--line);color:var(--navy);border-radius:8px;padding:5px 12px;font-weight:600;font-size:12.5px;cursor:pointer}
.mini-btn:hover{background:var(--navy);color:#fff}
@media print{
  @page{margin:12mm}
  body *{visibility:hidden}
  .print-area,.print-area *{visibility:visible}
  .print-area{position:absolute;left:0;top:0;width:100%}
  .no-print{display:none!important}
  .tag{box-shadow:none;border:1px solid #ccc}
  .tag-grid{grid-template-columns:repeat(3,1fr)}
}
`;
