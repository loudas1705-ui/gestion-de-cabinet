import { db } from './firebase-config.js';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy,
  serverTimestamp, Timestamp,
  runTransaction, setDoc, increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ==================== PRESCRIPTION NUMBERING ==================== */

/**
 * Atomically allocate the next prescription number.
 * Uses a transaction on counters/prescriptions { value: N }.
 * Returns the new number as an integer (e.g. 43).
 */
export async function nextPrescriptionNumber() {
  const counterRef = doc(db, 'counters', 'prescriptions');

  const newNumber = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? (snap.data().value || 0) : 0;
    const next = current + 1;
    tx.set(counterRef, { value: next }, { merge: true });
    return next;
  });

  return newNumber;
}

/**
 * Format a number like 7 → "007", 42 → "042", 1234 → "1234".
 */
export function formatPrescriptionNumber(n, width = 3) {
  return String(n).padStart(width, '0');
}

/* ==================== PATIENTS ==================== */
export async function listPatients() {
  const snap = await getDocs(query(collection(db, 'patients'), orderBy('last_name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPatient(id) {
  const snap = await getDoc(doc(db, 'patients', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addPatient(data) {
  return addDoc(collection(db, 'patients'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
}

export async function updatePatient(id, data) {
  return updateDoc(doc(db, 'patients', id), {
    ...data,
    updated_at: serverTimestamp()
  });
}

export async function deletePatient(id) {
  return deleteDoc(doc(db, 'patients', id));
}

/* ==================== APPOINTMENTS ==================== */
export async function listAppointments(patientId = null) {
  let q = query(collection(db, 'appointments'), orderBy('appointment_date', 'desc'));
  if (patientId) {
    q = query(
      collection(db, 'appointments'),
      where('patient_id', '==', patientId),
      orderBy('appointment_date', 'desc')
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAppointment(id) {
  const snap = await getDoc(doc(db, 'appointments', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addAppointment(data) {
  return addDoc(collection(db, 'appointments'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
}

export async function updateAppointment(id, data) {
  return updateDoc(doc(db, 'appointments', id), {
    ...data,
    updated_at: serverTimestamp()
  });
}

export async function deleteAppointment(id) {
  return deleteDoc(doc(db, 'appointments', id));
}

/* ==================== PRESCRIPTIONS ==================== */
export async function listPrescriptions() {
  const snap = await getDocs(
    query(collection(db, 'prescriptions'), orderBy('prescription_date', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPrescription(id) {
  const snap = await getDoc(doc(db, 'prescriptions', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addPrescription(data) {
  return addDoc(collection(db, 'prescriptions'), {
    ...data,
    created_at: serverTimestamp()
  });
}

export async function updatePrescription(id, data) {
  return updateDoc(doc(db, 'prescriptions', id), data);
}

export async function deletePrescription(id) {
  return deleteDoc(doc(db, 'prescriptions', id));
}

/* ==================== STATS ==================== */
export async function getStats() {
  const [patientsSnap, apptsSnap, prescSnap] = await Promise.all([
    getDocs(collection(db, 'patients')),
    getDocs(collection(db, 'appointments')),
    getDocs(collection(db, 'prescriptions'))
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let todayAppointments = 0;
  let completedThisMonth = 0;

  apptsSnap.docs.forEach(d => {
    const a = d.data();
    const dt = a.appointment_date?.toDate ? a.appointment_date.toDate() : new Date(a.appointment_date);
    if (isNaN(dt)) return;
    if (dt >= today && dt < tomorrow && a.status === 'scheduled') todayAppointments++;
    if (
      a.status === 'completed' &&
      dt.getMonth() === today.getMonth() &&
      dt.getFullYear() === today.getFullYear()
    ) completedThisMonth++;
  });

  return {
    total_patients: patientsSnap.size,
    today_appointments: todayAppointments,
    completed_this_month: completedThisMonth,
    total_prescriptions: prescSnap.size
  };
}

/* ==================== UPCOMING APPOINTMENTS (7 days) ==================== */
export async function getUpcomingAppointments(daysAhead = 7) {
  const snap = await getDocs(
    query(collection(db, 'appointments'), orderBy('appointment_date', 'asc'))
  );
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + daysAhead);

  const filtered = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(a => {
      const dt = a.appointment_date?.toDate ? a.appointment_date.toDate() : new Date(a.appointment_date);
      return !isNaN(dt) && dt >= now && dt <= limit && a.status === 'scheduled';
    })
    .slice(0, 10);

  // Attach patient info
  return Promise.all(filtered.map(async a => {
    const p = await getPatient(a.patient_id);
    return { ...a, patient: p };
  }));
}

/* ==================== RECENT PATIENTS ==================== */
export async function getRecentPatients(limit = 5) {
  const snap = await getDocs(
    query(collection(db, 'patients'), orderBy('created_at', 'desc'))
  );
  return snap.docs.slice(0, limit).map(d => ({ id: d.id, ...d.data() }));
}

/* ==================== BIRTHDAYS (next N days) ==================== */
export async function getUpcomingBirthdays(daysAhead = 7) {
  const snap = await getDocs(collection(db, 'patients'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => {
      if (!p.date_of_birth) return false;
      const dob = p.date_of_birth?.toDate ? p.date_of_birth.toDate() : new Date(p.date_of_birth);
      if (isNaN(dob)) return false;
      const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);
      const diff = (thisYear - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= daysAhead;
    })
    .sort((a, b) => {
      const da = a.date_of_birth?.toDate ? a.date_of_birth.toDate() : new Date(a.date_of_birth);
      const db2 = b.date_of_birth?.toDate ? b.date_of_birth.toDate() : new Date(b.date_of_birth);
      return (da.getMonth() - db2.getMonth()) || (da.getDate() - db2.getDate());
    });
}
