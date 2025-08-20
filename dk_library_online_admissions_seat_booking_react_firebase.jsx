import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { format, addDays } from "date-fns";
import {
  CheckCircle2,
  ArrowRight,
  Users2,
  BookOpen,
  CalendarClock,
  Clock4,
  Sofa,
  Mail,
  Phone,
  ShieldCheck,
  Search,
  Trash2,
  RefreshCw,
  LockKeyhole,
  Sun,
  Moon,
  Info,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

/**
 * =============================
 * DK LIBRARY — SINGLE FILE APP (UPDATED)
 * React + Tailwind + shadcn/ui + Firebase (Firestore)
 * Focus: One‑time Admission → Fixed Seat+Shift for 30 Days
 * Public Seat Chart + Admin monthly reset
 * =============================
 *
 * 1) Replace FIREBASE_CONFIG below with your Firebase project's web config
 *    (Project Settings → General → Your apps → SDK setup & config).
 * 2) Deploy this component in a React app (Vite/Next.js) and ensure Tailwind is enabled.
 * 3) Firestore structure used:
 *    - admissions: { name, age, phone, email, note,
 *                    shiftId, shiftLabel, seatNumber,
 *                    startDate (yyyy-MM-dd), endDate (yyyy-MM-dd),
 *                    createdAt }
 * 4) Security: set Firestore rules (template at bottom comment).
 */

// ================= Firebase =================
// Install deps: npm i firebase date-fns framer-motion lucide-react
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";

const FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

// ================== App Settings ==================
const LIBRARY_NAME = "DK Library";
const TOTAL_SEATS = 30; // You set 30 seats
// Five fixed 4‑hour shifts (including overnight)
const SHIFTS = [
  { id: "S1", label: "06:00 – 10:00", start: "06:00", end: "10:00" },
  { id: "S2", label: "10:00 – 14:00", start: "10:00", end: "14:00" },
  { id: "S3", label: "14:00 – 18:00", start: "14:00", end: "18:00" },
  { id: "S4", label: "18:00 – 22:00", start: "18:00", end: "22:00" },
  { id: "S5", label: "22:00 – 06:00", start: "22:00", end: "06:00" }, // overnight
];
const ADMIN_PIN = "2468"; // CHANGE ME

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("dk-dark");
    if (saved) setDark(saved === "true");
  }, []);
  useEffect(() => {
    localStorage.setItem("dk-dark", String(dark));
    const root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
  }, [dark]);
  return { dark, setDark };
}

function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function Header({ onJumpTo }) {
  const { dark, setDark } = useDarkMode();
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/75 backdrop-blur-md dark:bg-neutral-950/70 dark:border-neutral-800">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white font-bold grid place-items-center">DK</div>
          <span className="font-semibold tracking-tight">{LIBRARY_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={()=>onJumpTo("#admissions")} className="hidden sm:inline-flex gap-2">
            <BookOpen className="h-4 w-4"/> Admission
          </Button>
          <Button variant="ghost" onClick={()=>onJumpTo("#availability")} className="hidden sm:inline-flex gap-2">
            <CalendarClock className="h-4 w-4"/> Seat Status
          </Button>
          <button
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
          </button>
        </div>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_40rem_at_50%_-10%,rgba(99,102,241,0.18),transparent_60%)] dark:bg-[radial-gradient(40rem_40rem_at_50%_-10%,rgba(99,102,241,0.12),transparent_60%)]"/>
      <Container className="py-14 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center">
          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">Welcome to {LIBRARY_NAME}</Badge>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            One‑time Admission & Fixed 4‑Hour Shifts
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300">
            Choose your seat and shift once and keep it for 30 days. Free booking, instant confirmation.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#admissions"><Button className="h-11 text-base inline-flex gap-2"><BookOpen className="h-4 w-4"/> Apply for 30‑Day Admission</Button></a>
            <a href="#availability"><Button variant="outline" className="h-11 text-base inline-flex gap-2"><CalendarClock className="h-4 w-4"/> Check Seat Status</Button></a>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
            {["Calm Space", "Wi‑Fi", "30 Seats", "Power Backup"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="h-5 w-5 text-indigo-500"/>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

// ===== Helpers =====
const todayStr = () => format(new Date(), "yyyy-MM-dd");
const addDaysStr = (d, n) => format(addDays(d, n), "yyyy-MM-dd");

async function phoneHasActiveAdmission(phone) {
  const qx = query(
    collection(db, "admissions"),
    where("phone", "==", phone),
    where("endDate", ">=", todayStr())
  );
  const snap = await getDocs(qx);
  // Filter in client for startDate <= today (in case of edge)
  const rows = snap.docs.map(d=>({ id: d.id, ...d.data()})).filter(r=>r.startDate <= todayStr());
  return rows[0] || null;
}

async function seatTaken(shiftId, seatNumber) {
  const qx = query(
    collection(db, "admissions"),
    where("shiftId", "==", shiftId),
    where("seatNumber", "==", seatNumber),
    where("endDate", ">=", todayStr())
  );
  const snap = await getDocs(qx);
  const rows = snap.docs.map(d=>({ id: d.id, ...d.data()})).filter(r=>r.startDate <= todayStr());
  return rows.length > 0;
}

async function createAdmission(data) {
  const ref = await addDoc(collection(db, "admissions"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

// Listen seats for a shift (active only)
function useActiveSeats(shiftId) {
  const [taken, setTaken] = useState([]);
  useEffect(() => {
    if (!shiftId) return;
    const qx = query(
      collection(db, "admissions"),
      where("shiftId", "==", shiftId),
      where("endDate", ">=", todayStr()),
      orderBy("seatNumber", "asc")
    );
    const unsub = onSnapshot(qx, (snap)=>{
      const seats = snap.docs
        .map(d=>({ id: d.id, ...d.data()}))
        .filter(r=>r.startDate <= todayStr())
        .map(r=>r.seatNumber);
      setTaken(seats);
    });
    return ()=>unsub();
  }, [shiftId]);
  return taken;
}

// ===== Public Seat Availability =====
function Availability() {
  const [shiftId, setShiftId] = useState(SHIFTS[0].id);
  const taken = useActiveSeats(shiftId);
  const allSeats = useMemo(()=>Array.from({length: TOTAL_SEATS}, (_,i)=>i+1), []);

  return (
    <section id="availability" className="py-14 sm:py-20 bg-neutral-50 dark:bg-neutral-900/40">
      <Container>
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 border">Public Seat Status</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Check Seats by Shift</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">Live availability for active 30‑day cycle.</p>
          </div>
          <Card className="rounded-2xl">
            <CardContent className="grid gap-6 pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Shift</Label>
                  <Select value={shiftId} onValueChange={setShiftId}>
                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                    <SelectContent>
                      {SHIFTS.map((s)=> (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-neutral-500 flex items-end gap-2"><Info className="h-4 w-4"/> Green = available, Grey = booked.</div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {allSeats.map((n)=>{
                  const isTaken = taken.includes(n);
                  return (
                    <div key={n}
                      className={`h-10 rounded-xl border text-sm grid place-items-center ${isTaken?"bg-neutral-200 dark:bg-neutral-800 text-neutral-400":"bg-green-50 dark:bg-green-900/20"}`}
                    >{n}</div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

// ===== Admissions (one time for 30 days) =====
function Admissions() {
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", note: "" });
  const [shiftId, setShiftId] = useState(SHIFTS[0].id);
  const [seat, setSeat] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const taken = useActiveSeats(shiftId);
  const allSeats = useMemo(()=>Array.from({length: TOTAL_SEATS}, (_,i)=>i+1), []);
  const freeSeats = allSeats.filter(n=>!taken.includes(n));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.name || !form.phone || !seat) { setMsg("Name, phone and seat are required."); return; }
    setSaving(true);
    try {
      // already active?
      const active = await phoneHasActiveAdmission(form.phone.trim());
      if (active) { setMsg("This phone already has an active 30‑day admission."); setSaving(false); return; }
      // seat free?
      const takenNow = await seatTaken(shiftId, Number(seat));
      if (takenNow) { setMsg("Seat just got booked. Please choose another."); setSaving(false); return; }

      const start = todayStr();
      const end = addDaysStr(new Date(), 30); // expires after 30 days
      await createAdmission({
        name: form.name.trim(),
        age: form.age ? Number(form.age) : null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        note: form.note.trim() || null,
        shiftId,
        shiftLabel: SHIFTS.find(s=>s.id===shiftId)?.label,
        seatNumber: Number(seat),
        startDate: start,
        endDate: end,
      });
      setMsg(`Admission successful! Seat ${seat} in ${SHIFTS.find(s=>s.id===shiftId)?.label} reserved until ${format(new Date(end), "dd MMM yyyy")}.`);
      setForm({ name: "", age: "", phone: "", email: "", note: "" });
      setSeat("");
    } catch (err) {
      console.error(err);
      setMsg("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="admissions" className="py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 border">Admissions</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Fix Your Seat for 30 Days</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">Choose a shift and seat. One‑time admission, valid for 30 days.</p>
          </div>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users2 className="h-5 w-5"/> Student Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="Full name"/>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" min={10} value={form.age} onChange={(e)=>setForm({ ...form, age: e.target.value })} placeholder="18"/>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone *</Label>
                    <Input value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} placeholder="98765 43210"/>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} placeholder="you@example.com"/>
                  </div>
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <Textarea value={form.note} onChange={(e)=>setForm({ ...form, note: e.target.value })} placeholder="Exam/course info"/>
                </div>

                <Separator/>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Shift *</Label>
                    <Select value={shiftId} onValueChange={(v)=>{ setShiftId(v); setSeat(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                      <SelectContent>
                        {SHIFTS.map((s)=> (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Choose Seat *</Label>
                    <div className="mt-2 grid grid-cols-6 sm:grid-cols-10 gap-2">
                      {Array.from({length: TOTAL_SEATS}, (_,i)=>i+1).map((n)=>{
                        const takenSeat = taken.includes(n);
                        const isSelected = Number(seat)===n;
                        return (
                          <button key={n}
                            type="button"
                            disabled={takenSeat}
                            onClick={()=>setSeat(n)}
                            className={`h-10 rounded-xl border text-sm ${takenSeat?"bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed":"hover:border-indigo-400 bg-green-50 dark:bg-green-900/20"} ${isSelected?"ring-2 ring-indigo-500 border-indigo-500":""}`}
                            title={takenSeat?"Booked":"Available"}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">(Grey = booked, Green = available)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-500">Data is used only for seat management at {LIBRARY_NAME}.</div>
                  <Button type="submit" disabled={saving || !seat} className="inline-flex gap-2">{saving?"Submitting...":"Confirm Admission"} <ArrowRight className="h-4 w-4"/></Button>
                </div>
                {msg && <div className="text-sm mt-2 text-indigo-600 dark:text-indigo-300">{msg}</div>}
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

// ===== Admin Panel =====
function AdminPanel() {
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);
  const [shiftId, setShiftId] = useState(SHIFTS[0].id);
  const [searchPhone, setSearchPhone] = useState("");
  const [rows, setRows] = useState([]);

  // Active admissions stream
  useEffect(()=>{
    if (!ok) return;
    const qx = query(
      collection(db, "admissions"),
      where("endDate", ">=", todayStr()),
      orderBy("seatNumber", "asc")
    );
    const unsub = onSnapshot(qx, (snap)=>{
      const r = snap.docs.map(d=>({ id: d.id, ...d.data()})).filter(x=>x.startDate <= todayStr());
      setRows(r);
    });
    return ()=>unsub();
  }, [ok]);

  const takenByShift = useMemo(()=>{
    return rows.filter(r=>r.shiftId===shiftId).map(r=>r.seatNumber);
  }, [rows, shiftId]);

  const handleDelete = async (id) => {
    if (!ok) return;
    if (!confirm("Cancel this admission?")) return;
    await deleteDoc(doc(db, "admissions", id));
  };

  const handleMonthlyReset = async () => {
    if (!ok) return;
    if (!confirm("Reset ALL active admissions for a new 30‑day cycle? This cannot be undone.")) return;
    // delete all docs currently loaded (active)
    for (const r of rows) {
      await deleteDoc(doc(db, "admissions", r.id));
    }
  };

  const filteredList = useMemo(()=>{
    if (!searchPhone.trim()) return rows;
    return rows.filter(r=> r.phone?.includes(searchPhone.trim()));
  }, [rows, searchPhone]);

  return (
    <section id="admin" className="py-14 sm:py-20 bg-neutral-50 dark:bg-neutral-900/40">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 border">Admin</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Dashboard</h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-300">Manage 30‑day admissions, see seat map, and reset monthly.</p>
            </div>
            {!ok && (
              <div className="flex items-end gap-2">
                <div>
                  <Label className="text-xs">Enter PIN</Label>
                  <Input type="password" value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="Admin PIN" className="w-40"/>
                </div>
                <Button onClick={()=> setOk(pin===ADMIN_PIN)} className="inline-flex gap-2"><LockKeyhole className="h-4 w-4"/> Unlock</Button>
              </div>
            )}
          </div>

          {!ok ? (
            <Card className="rounded-2xl">
              <CardContent className="py-10 grid place-items-center text-neutral-500">
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> Admin access required.</div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="map" className="w-full">
              <TabsList>
                <TabsTrigger value="map">Seat Chart</TabsTrigger>
                <TabsTrigger value="list">Student List</TabsTrigger>
                <TabsTrigger value="settings">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="map">
                <Card className="rounded-2xl mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><CalendarClock className="h-5 w-4"/> Seat Status (Admin)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label>Shift</Label>
                        <Select value={shiftId} onValueChange={setShiftId}>
                          <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                          <SelectContent>
                            {SHIFTS.map((s)=> (
                              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3 text-sm text-neutral-500 flex items-end">Click a booked seat to see student details.</div>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                      {Array.from({length: TOTAL_SEATS}, (_,i)=>i+1).map((n)=>{
                        const booked = takenByShift.includes(n);
                        const student = rows.find(r=>r.shiftId===shiftId && r.seatNumber===n);
                        return (
                          <button key={n}
                            disabled={!booked}
                            onClick={()=> booked && alert(`${student?.name||"Unknown"} (☎️ ${student?.phone||""})
Seat ${n} • ${student?.shiftLabel}
Valid: ${student?.startDate} → ${student?.endDate}`)}
                            className={`h-10 rounded-xl border text-sm ${booked?"bg-neutral-200 dark:bg-neutral-800":"bg-green-50 dark:bg-green-900/20"}`}
                            title={booked?`Booked by ${student?.name}`:"Available"}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="list">
                <Card className="rounded-2xl mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Active Admissions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-1">
                        <Label>Search by phone</Label>
                        <div className="flex gap-2">
                          <Input value={searchPhone} onChange={(e)=>setSearchPhone(e.target.value)} placeholder="e.g. 98765"/>
                          <Button variant="outline" className="inline-flex gap-2"><Search className="h-4 w-4"/> Search</Button>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left border-b dark:border-neutral-800">
                            <th className="py-2 pr-4">Seat</th>
                            <th className="py-2 pr-4">Shift</th>
                            <th className="py-2 pr-4">Student</th>
                            <th className="py-2 pr-4">Phone</th>
                            <th className="py-2 pr-4">Email</th>
                            <th className="py-2 pr-4">Valid Till</th>
                            <th className="py-2 pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredList.map((b)=> (
                            <tr key={b.id} className="border-b last:border-0 dark:border-neutral-800">
                              <td className="py-2 pr-4">{b.seatNumber}</td>
                              <td className="py-2 pr-4">{b.shiftLabel}</td>
                              <td className="py-2 pr-4">{b.name}</td>
                              <td className="py-2 pr-4">{b.phone}</td>
                              <td className="py-2 pr-4">{b.email||"—"}</td>
                              <td className="py-2 pr-4">{format(new Date(b.endDate), "dd MMM yyyy")}</td>
                              <td className="py-2 pr-4">
                                <Button variant="outline" size="sm" onClick={()=>handleDelete(b.id)} className="inline-flex gap-2"><Trash2 className="h-4 w-4"/> Cancel</Button>
                              </td>
                            </tr>
                          ))}
                          {filteredList.length===0 && (
                            <tr><td className="py-6 text-neutral-500" colSpan={7}>No active admissions.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="rounded-2xl mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><RefreshCw className="h-5 w-4"/> Monthly Reset</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">Clicking reset will delete all active admissions to start a new 30‑day cycle.</p>
                    <div>
                      <Button variant="destructive" onClick={handleMonthlyReset} className="inline-flex gap-2"><RefreshCw className="h-4 w-4"/> Reset All Seats</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t border-neutral-200 dark:border-neutral-800">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-600 dark:text-neutral-300">
        <div>© {new Date().getFullYear()} {LIBRARY_NAME}. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2"><Mail className="h-4 w-4"/> dklibrary@example.com</div>
          <div className="inline-flex items-center gap-2"><Phone className="h-4 w-4"/> +91‑90000‑00000</div>
        </div>
      </Container>
    </footer>
  );
}

export default function DKLibraryApp() {
  const rootRef = useRef(null);
  const onJumpTo = (id) => {
    const el = document.querySelector(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <Header onJumpTo={onJumpTo} />
      <Hero />
      <Availability />
      <Admissions />
      <AdminPanel />
      <Footer />

      {/* ===== Firestore Rules (paste in Firebase console → Firestore → Rules) =====
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          function isPhoneValid(p) { return p.size() >= 8 && p.size() <= 15; }
          function validDate(s) { return s.matches('\d{4}-\d{2}-\d{2}'); }

          match /admissions/{id} {
            allow read: if true; // public seat status
            allow create: if request.resource.data.name is string
                           && isPhoneValid(request.resource.data.phone)
                           && request.resource.data.shiftId in ['S1','S2','S3','S4','S5']
                           && request.resource.data.seatNumber is int
                           && request.resource.data.seatNumber >= 1 && request.resource.data.seatNumber <= 30
                           && validDate(request.resource.data.startDate)
                           && validDate(request.resource.data.endDate)
                           && request.resource.data.createdAt == request.time;
            // TEMP: allow delete for admin panel until Auth is added
            allow delete: if true;
            allow update: if false;
          }
        }
      }
      */}
    </div>
  );
}
