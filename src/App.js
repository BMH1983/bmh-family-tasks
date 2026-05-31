import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { mumAvatar, dadAvatar, garrisonAvatar, murphyAvatar } from "./avatars";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, setDoc, getDoc, writeBatch
} from "firebase/firestore";
import "./App.css";

const FAMILY = [
  { id: "mum",      name: "Mum",      avatar: mumAvatar,      color: "#F06038", isParent: true  },
  { id: "dad",      name: "Dad",      avatar: dadAvatar,      color: "#8C9EFF", isParent: true  },
  { id: "murphy",   name: "Murphy",   avatar: murphyAvatar,   color: "#8C9EFF", isParent: false },
  { id: "garrison", name: "Garrison", avatar: garrisonAvatar, color: "#F06038", isParent: false },
];

const YOCHI_MAX = 30;
const CATEGORIES = ["Daily", "Weekly", "Rooms", "Putting Away"];
const PRIORITIES = {
  high:   { label: "🔴 High",   color: "#F06038" },
  medium: { label: "🟡 Medium", color: "#f5a623" },
  low:    { label: "🟢 Low",    color: "#5cb85c"  },
};
const TIMES = ["Morning", "Afternoon", "Tonight", "Anytime"];

const DEFAULT_TASKS = [
  { text: "Make beds",               category: "Daily",        priority: "high",   timeEst: "5 min",  timeOfDay: "Morning",   points: 3 },
  { text: "Breakfast dishes",        category: "Daily",        priority: "high",   timeEst: "10 min", timeOfDay: "Morning",   points: 3 },
  { text: "School lunches",          category: "Daily",        priority: "high",   timeEst: "10 min", timeOfDay: "Morning",   points: 3 },
  { text: "Dinner dishes",           category: "Daily",        priority: "high",   timeEst: "15 min", timeOfDay: "Tonight",   points: 3 },
  { text: "Empty dishwasher",        category: "Daily",        priority: "medium", timeEst: "5 min",  timeOfDay: "Morning",   points: 2 },
  { text: "Feed the dogs",           category: "Daily",        priority: "high",   timeEst: "5 min",  timeOfDay: "Morning",   points: 2 },
  { text: "Wipe down counters",      category: "Daily",        priority: "medium", timeEst: "5 min",  timeOfDay: "Tonight",   points: 2 },
  { text: "Wash the table",          category: "Daily",        priority: "medium", timeEst: "3 min",  timeOfDay: "Tonight",   points: 2 },
  { text: "Make cups of tea",        category: "Daily",        priority: "low",    timeEst: "5 min",  timeOfDay: "Tonight",   points: 1 },
  { text: "Tidy living room",        category: "Daily",        priority: "medium", timeEst: "10 min", timeOfDay: "Tonight",   points: 2 },
  { text: "Brush Teeth",             category: "Daily",        priority: "high",   timeEst: "2 min",  timeOfDay: "Morning",   points: 1 },
  { text: "Breakfast",               category: "Daily",        priority: "high",   timeEst: "10 min", timeOfDay: "Morning",   points: 1 },
  { text: "Pick up dog poop",        category: "Weekly",       priority: "high",   timeEst: "10 min", timeOfDay: "Anytime",   points: 4 },
  { text: "Vacuum whole house",      category: "Weekly",       priority: "high",   timeEst: "30 min", timeOfDay: "Anytime",   points: 5 },
  { text: "Mop the floors",          category: "Weekly",       priority: "high",   timeEst: "20 min", timeOfDay: "Anytime",   points: 5 },
  { text: "Bathrooms cleaned",       category: "Weekly",       priority: "high",   timeEst: "20 min", timeOfDay: "Anytime",   points: 5 },
  { text: "Clean the stove",         category: "Weekly",       priority: "medium", timeEst: "15 min", timeOfDay: "Anytime",   points: 4 },
  { text: "Scrub the counters",      category: "Weekly",       priority: "medium", timeEst: "10 min", timeOfDay: "Anytime",   points: 3 },
  { text: "Dusting",                 category: "Weekly",       priority: "low",    timeEst: "15 min", timeOfDay: "Anytime",   points: 3 },
  { text: "Laundry",                 category: "Weekly",       priority: "high",   timeEst: "20 min", timeOfDay: "Morning",   points: 4 },
  { text: "Sort the laundry",        category: "Weekly",       priority: "medium", timeEst: "15 min", timeOfDay: "Anytime",   points: 3 },
  { text: "Changing sheets",         category: "Weekly",       priority: "medium", timeEst: "20 min", timeOfDay: "Anytime",   points: 4 },
  { text: "Bin night",               category: "Weekly",       priority: "high",   timeEst: "5 min",  timeOfDay: "Tonight",   points: 3 },
  { text: "Clean your bedroom",      category: "Rooms",        priority: "high",   timeEst: "20 min", timeOfDay: "Anytime",   points: 4 },
  { text: "Tidy the playroom",       category: "Rooms",        priority: "medium", timeEst: "15 min", timeOfDay: "Anytime",   points: 3 },
  { text: "Bathroom wipe-down",      category: "Rooms",        priority: "medium", timeEst: "10 min", timeOfDay: "Anytime",   points: 3 },
  { text: "Clean the laundry room",  category: "Rooms",        priority: "low",    timeEst: "10 min", timeOfDay: "Anytime",   points: 2 },
  { text: "Tidy the garage",         category: "Rooms",        priority: "low",    timeEst: "20 min", timeOfDay: "Anytime",   points: 3 },
  { text: "Put away clean dishes",   category: "Putting Away", priority: "medium", timeEst: "5 min",  timeOfDay: "Anytime",   points: 2 },
  { text: "Put away clean laundry",  category: "Putting Away", priority: "medium", timeEst: "10 min", timeOfDay: "Anytime",   points: 2 },
  { text: "Put away shoes and bags", category: "Putting Away", priority: "low",    timeEst: "3 min",  timeOfDay: "Anytime",   points: 1 },
  { text: "Put away school stuff",   category: "Putting Away", priority: "medium", timeEst: "5 min",  timeOfDay: "Afternoon", points: 2 },
  { text: "Put away toys",           category: "Putting Away", priority: "medium", timeEst: "10 min", timeOfDay: "Tonight",   points: 2 },
];

// ── METADATA LOOKUP (for migration) ──────────────────────────────────────────
function getTaskMeta(text) {
  const match = DEFAULT_TASKS.find(t =>
    t.text.toLowerCase().trim() === text.toLowerCase().trim()
  );
  return match ? {
    priority: match.priority,
    timeEst:  match.timeEst,
    timeOfDay: match.timeOfDay,
    points:   match.points,
  } : { priority: "medium", timeEst: "5 min", timeOfDay: "Anytime", points: 2 };
}

// ── CONFETTI ──────────────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
  const colors = ["#F06038","#D6F74C","#8C9EFF","#FCD9BE","#ff6b9d","#00d4aa"];
  useEffect(() => {
    if (active) { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="confetti-wrap" aria-hidden="true">
      {Array.from({ length: 60 }, (_, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${Math.random()*100}%`,
          background: colors[i % colors.length],
          width: `${8 + Math.random()*8}px`,
          height: `${8 + Math.random()*8}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animationDuration: `${1.5 + Math.random()*2}s`,
          animationDelay: `${Math.random()*0.5}s`,
        }} />
      ))}
    </div>
  );
}

// ── YO CHI CUP ────────────────────────────────────────────────────────────────
function YochiCup({ points, color }) {
  const pct = Math.min(points / YOCHI_MAX, 1);
  const fillHeight = pct * 54;
  const isFull = pct >= 1;
  const clipId = `clip-${color.replace('#','')}`;
  return (
    <div className="yochi-cup-wrap">
      <svg width="38" height="52" viewBox="0 0 38 52" fill="none">
        <path d="M6 8 L4 48 Q4 50 6 50 L32 50 Q34 50 34 48 L32 8 Z" fill="white" stroke={color} strokeWidth="2"/>
        {pct > 0 && <>
          <clipPath id={clipId}>
            <path d="M6 8 L4 48 Q4 50 6 50 L32 50 Q34 50 34 48 L32 8 Z"/>
          </clipPath>
          <rect x="4" y={50 - fillHeight - 2} width="30" height={fillHeight + 4}
            fill={isFull ? "#D6F74C" : color} opacity="0.85"
            clipPath={`url(#${clipId})`}/>
        </>}
        <rect x="22" y="1" width="4" height="16" rx="2" fill={color}/>
        <path d="M34 18 Q44 18 44 28 Q44 38 34 38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {isFull && <circle cx="13" cy="30" r="2" fill="white" opacity="0.6"/>}
        {isFull && <circle cx="22" cy="38" r="1.5" fill="white" opacity="0.5"/>}
      </svg>
      {isFull && <div className="cup-full-label">🧋 Full!</div>}
    </div>
  );
}

// ── BONUS TASK ────────────────────────────────────────────────────────────────
const BONUS_POOL = [
  { text: "Surprise clean — pick any room!", points: 6 },
  { text: "Fold AND put away the washing",   points: 6 },
  { text: "Clean out the car",               points: 7 },
  { text: "Wipe all the mirrors",            points: 5 },
  { text: "Empty ALL bins in the house",     points: 6 },
  { text: "Organise one drawer or shelf",    points: 5 },
  { text: "Sweep the back patio",            points: 5 },
];

function getBonusTask() {
  const today = new Date().toDateString();
  const idx = today.split("").reduce((a,c) => a + c.charCodeAt(0), 0) % BONUS_POOL.length;
  return BONUS_POOL[idx];
}

function getExpiry() {
  const now = new Date();
  const expiry = new Date();
  expiry.setHours(20, 0, 0, 0);
  return now < expiry ? expiry : null;
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">{message}</div>;
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks]                   = useState([]);
  const [scores, setScores]                 = useState({ mum:0, dad:0, murphy:0, garrison:0 });
  const [streaks, setStreaks]               = useState({ mum:0, dad:0, murphy:0, garrison:0 });
  const [lastActive, setLastActive]         = useState({});
  const [familyGoal, setFamilyGoal]         = useState("Our first Yo Chi run together 🧋");
  const [editingGoal, setEditingGoal]       = useState(false);
  const [activeFilter, setActiveFilter]     = useState(null);
  const [activeCategory, setActiveCategory] = useState("Daily");
  const [loading, setLoading]               = useState(true);
  const [offline, setOffline]               = useState(false);
  const [showOnboard, setShowOnboard]       = useState(false);
  const [confetti, setConfetti]             = useState(false);
  const [yochiWin, setYochiWin]             = useState(null);
  const [halfwayDone, setHalfwayDone]       = useState(false);
  const [halfwayBanner, setHalfwayBanner]   = useState(false);
  const [weeklyWinner, setWeeklyWinner]     = useState(null);
  const [deleteConfirm, setDeleteConfirm]   = useState(null);
  const [resetConfirm, setResetConfirm]     = useState(false);
  const [claimModal, setClaimModal]         = useState(null);
  const [approveModal, setApproveModal]     = useState(null);
  const [currentParent, setCurrentParent]   = useState(null);
  const [addingTask, setAddingTask]         = useState(false);
  const [taskNameError, setTaskNameError]   = useState("");
  const [newTask, setNewTask]               = useState({ text:"", category:"Daily", priority:"medium", timeEst:"5 min", timeOfDay:"Anytime", points:2 });
  const [bonusTask, setBonusTask]           = useState(null);
  const [bonusClaimed, setBonusClaimed]     = useState(false);
  const [bonusClaimModal, setBonusClaimModal] = useState(false);
  const [nudges, setNudges]                 = useState([]);
  const [timeLeft, setTimeLeft]             = useState("");
  const [toast, setToast]                   = useState("");
  const [migrated, setMigrated]             = useState(false);

  // ── Firestore: tasks ──
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "tasks"),
      snap => {
        if (snap.empty) { seedTasks(); }
        else { setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }
        setLoading(false);
        setOffline(false);
      },
      () => { setOffline(true); setLoading(false); }
    );
    return () => unsub();
  }, []);

  // ── Firestore: meta ──
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "meta", "data"), snap => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.scores)      setScores(d.scores);
        if (d.streaks)     setStreaks(d.streaks);
        if (d.lastActive)  setLastActive(d.lastActive);
        if (d.goal)        setFamilyGoal(d.goal);
        if (d.halfwayDone) setHalfwayDone(d.halfwayDone);
        if (d.migrated)    setMigrated(true);
        if (d.bonusClaimed) setBonusClaimed(d.bonusClaimed === new Date().toDateString());
      }
    }, () => {});
    return () => unsub();
  }, []);

  // ── Migration: populate missing metadata on existing tasks ──
  useEffect(() => {
    if (!tasks.length || migrated) return;
    const needsMigration = tasks.filter(t => t.points === undefined || t.points === null);
    if (!needsMigration.length) {
      saveMeta({ migrated: true });
      setMigrated(true);
      return;
    }
    const batch = writeBatch(db);
    needsMigration.forEach(t => {
      const meta = getTaskMeta(t.text);
      batch.update(doc(db, "tasks", t.id), meta);
    });
    batch.commit().then(() => {
      saveMeta({ migrated: true });
      setMigrated(true);
    });
  }, [tasks, migrated]);

  // ── Daily auto-reset (only resets if new day, never fires mid-session) ──
  useEffect(() => {
    if (!tasks.length) return;
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem("sfhq-last-daily-reset");
    if (lastReset === today) return;
    // Only reset if there are daily tasks that were done BEFORE today
    const dailyDone = tasks.filter(t =>
      t.category === "Daily" && t.done && t.approvedBy
    );
    if (!dailyDone.length) {
      localStorage.setItem("sfhq-last-daily-reset", today);
      return;
    }
    const batch = writeBatch(db);
    dailyDone.forEach(t => {
      batch.update(doc(db, "tasks", t.id), {
        done: false, pendingApproval: false, assignedTo: null, approvedBy: null
      });
    });
    batch.commit().then(() => localStorage.setItem("sfhq-last-daily-reset", today));
  }, [tasks]);

  // ── Bonus task + countdown ──
  useEffect(() => {
    setBonusTask(getBonusTask());
    const expiry = getExpiry();
    if (expiry) {
      const update = () => {
        const diff = expiry - new Date();
        if (diff <= 0) { setTimeLeft("Expired"); return; }
        const h = Math.floor(diff/3600000);
        const m = Math.floor((diff%3600000)/60000);
        setTimeLeft(`${h}h ${m}m left`);
      };
      update();
      const tick = setInterval(update, 60000);
      return () => clearInterval(tick);
    } else {
      setTimeLeft("Expired");
    }
  }, []);

  // ── Nudge check ──
  useEffect(() => {
    if (!Object.keys(lastActive).length) return;
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    setNudges(FAMILY.filter(p => {
      const last = lastActive[p.id];
      return last && new Date(last).getTime() < threeDaysAgo;
    }));
  }, [lastActive]);

  // ── Weekly winner (Saturdays) ──
  useEffect(() => {
    if (new Date().getDay() !== 6) return;
    const winner = FAMILY.reduce((best, p) =>
      (scores[p.id]||0) > (scores[best.id]||0) ? p : best, FAMILY[0]);
    if (scores[winner.id] > 0) setWeeklyWinner(winner);
  }, [scores]);

  // ── Onboarding ──
  useEffect(() => {
    if (!localStorage.getItem("sfhq-v2-onboarded")) setShowOnboard(true);
  }, []);

  // ── Helpers ──
  async function seedTasks() {
    const batch = writeBatch(db);
    DEFAULT_TASKS.forEach(t => {
      const ref = doc(collection(db, "tasks"));
      batch.set(ref, { ...t, assignedTo: null, done: false, pendingApproval: false, approvedBy: null });
    });
    await batch.commit();
  }

  async function saveMeta(updates) {
    const ref = doc(db, "meta", "data");
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data() : {};
    await setDoc(ref, { ...current, ...updates });
  }

  function showToast(msg) {
    setToast(msg);
  }

  // ── Derived ──
  const totalDone   = tasks.filter(t => t.done).length;
  const totalTasks  = tasks.length;
  const donePercent = totalTasks > 0 ? (totalDone / totalTasks) * 100 : 0;
  const pendingAll  = tasks.filter(t => t.pendingApproval);

  const visibleTasks = tasks.filter(t => {
    const catMatch    = t.category === activeCategory;
    const personMatch = !activeFilter || t.assignedTo === activeFilter;
    return catMatch && personMatch;
  });

  const spotlightTasks = activeFilter
    ? tasks
        .filter(t => t.assignedTo === activeFilter && !t.done && !t.pendingApproval)
        .sort((a,b) => ({high:0,medium:1,low:2}[a.priority] - {high:0,medium:1,low:2}[b.priority]))
        .slice(0, 3)
    : [];

  // ── Actions ──
  async function handleKidDone(task) {
    await updateDoc(doc(db, "tasks", task.id), { pendingApproval: true });
    showToast("Waiting for Mum or Dad to check it ⏳");
  }

  async function handleApprove(task, parentId) {
    const assignee = task.assignedTo;
    await updateDoc(doc(db, "tasks", task.id), {
      done: true, pendingApproval: false, approvedBy: parentId,
    });
    const newScores     = { ...scores };
    const newStreaks    = { ...streaks };
    const newLastActive = { ...lastActive };
    const today         = new Date().toDateString();
    if (assignee) {
      newScores[assignee] = (newScores[assignee]||0) + (task.points||2);
      const lastDay  = lastActive[assignee];
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      if (lastDay === yesterday.toDateString()) {
        newStreaks[assignee] = (newStreaks[assignee]||0) + 1;
      } else if (lastDay !== today) {
        newStreaks[assignee] = 1;
      }
      newLastActive[assignee] = today;
    }
    setScores(newScores);
    setStreaks(newStreaks);
    setLastActive(newLastActive);
    const nowDone   = tasks.filter(t => t.done).length + 1;
    const isHalfway = nowDone >= Math.floor(totalTasks/2) && !halfwayDone;
    if (isHalfway) {
      setHalfwayBanner(true);
      setTimeout(() => setHalfwayBanner(false), 4000);
    }
    await saveMeta({
      scores: newScores, streaks: newStreaks, lastActive: newLastActive,
      ...(isHalfway ? { halfwayDone: true } : {}),
    });
    if (assignee && newScores[assignee] >= YOCHI_MAX) {
      setYochiWin(FAMILY.find(f => f.id === assignee));
    }
    setConfetti(true);
    setApproveModal(null);
    setCurrentParent(null);
    showToast("✅ Approved! Points added!");
  }

  async function handleReject(task) {
    // Bug 2 fix: clear assignment so task goes back to "I'll do it!" state
    await updateDoc(doc(db, "tasks", task.id), {
      pendingApproval: false, done: false, assignedTo: null, approvedBy: null
    });
    setApproveModal(null);
    setCurrentParent(null);
    showToast("❌ Needs a redo — task is back in the list");
  }

  async function assignTask(taskId, personId) {
    await updateDoc(doc(db, "tasks", taskId), { assignedTo: personId });
    setClaimModal(null); // Bug 4 fix: auto-close modal
    showToast(`Task claimed! 🙋`);
  }

  async function claimBonus(personId) {
    const today = new Date().toDateString();
    const newScores = { ...scores, [personId]: (scores[personId]||0) + bonusTask.points };
    setScores(newScores);
    setBonusClaimed(true);
    setBonusClaimModal(false);
    await saveMeta({ scores: newScores, bonusClaimed: today });
    setConfetti(true);
    showToast(`⚡ Bonus claimed! +${bonusTask.points} pts!`);
  }

  async function deleteTask(taskId) {
    await deleteDoc(doc(db, "tasks", taskId));
    setDeleteConfirm(null);
    showToast("Task deleted");
  }

  async function resetWeek() {
    const batch = writeBatch(db);
    tasks.forEach(t => {
      batch.update(doc(db, "tasks", t.id), {
        done: false, pendingApproval: false, assignedTo: null, approvedBy: null
      });
    });
    await batch.commit();
    const zeroed = { mum:0, dad:0, murphy:0, garrison:0 };
    setScores(zeroed);
    await saveMeta({ scores: zeroed, halfwayDone: false, migrated: true });
    setResetConfirm(false);
    showToast("Week reset! Fresh start 🔄");
  }

  async function addTask() {
    // Bug 6 fix: validate empty name
    if (!newTask.text.trim()) {
      setTaskNameError("Task name is required");
      return;
    }
    // Bug 7 fix: ensure points >= 1
    const points = Math.max(1, parseInt(newTask.points)||1);
    await addDoc(collection(db, "tasks"), {
      ...newTask, points, assignedTo: null, done: false, pendingApproval: false, approvedBy: null
    });
    setNewTask({ text:"", category:"Daily", priority:"medium", timeEst:"5 min", timeOfDay:"Anytime", points:2 });
    setTaskNameError("");
    setAddingTask(false); // Bug 5 fix: auto-close form
    showToast("Task added! ✅");
  }

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"/>
      <p>Loading Senn Family HQ...</p>
    </div>
  );

  if (offline) return (
    <div className="offline">
      <div className="offline-emoji">📡</div>
      <h2>You're offline</h2>
      <p>Check your internet and try again.</p>
      <button className="btn-primary" onClick={() => window.location.reload()}>Try again</button>
    </div>
  );

  return (
    <div className="app">
      <Confetti active={confetti} onDone={() => setConfetti(false)} />
      {toast && <Toast message={toast} onDone={() => setToast("")} />}

      {/* ONBOARDING */}
      {showOnboard && (
        <div className="modal-overlay">
          <div className="modal onboard-modal">
            <div className="onboard-emoji">🧋</div>
            <h2>Welcome to Senn Family HQ!</h2>
            <ul>
              <li>🎯 Tap <strong>"I'll do it!"</strong> to claim a task</li>
              <li>✅ Tap <strong>"Done!"</strong> when finished</li>
              <li>⏳ Mum or Dad <strong>checks and approves</strong> it</li>
              <li>🧋 Your <strong>Yo Chi Cup fills up</strong></li>
              <li>🎉 Fill the cup = <strong>whole family goes to Yo Chi!</strong></li>
              <li>⚡ <strong>Bonus tasks</strong> appear daily — expire at 8pm!</li>
            </ul>
            <button className="btn-primary" onClick={() => {
              localStorage.setItem("sfhq-v2-onboarded","1");
              setShowOnboard(false);
            }}>Let's go! 🚀</button>
          </div>
        </div>
      )}

      {/* YO CHI WIN */}
      {yochiWin && (
        <div className="modal-overlay yochi-win-overlay">
          <div className="modal yochi-win-modal">
            <div className="yochi-win-emoji">🧋🎉🧋</div>
            <h1>YO CHI TIME!</h1>
            <p><strong>{yochiWin.name}</strong> filled their cup!</p>
            <p className="yochi-win-sub">The whole family is going to Yo Chi! 🎊</p>
            <button className="btn-primary" onClick={() => setYochiWin(null)}>WOOHOO! 🙌</button>
          </div>
        </div>
      )}

      {/* WEEKLY WINNER */}
      {weeklyWinner && (
        <div className="modal-overlay">
          <div className="modal winner-modal">
            <div className="winner-emoji">🏆</div>
            <h2>This week's winner!</h2>
            <img src={weeklyWinner.avatar} alt={weeklyWinner.name} className="winner-avatar"/>
            <p className="winner-name" style={{color:weeklyWinner.color}}>{weeklyWinner.name}</p>
            <p>{scores[weeklyWinner.id]} points this week 🎉</p>
            <button className="btn-primary" onClick={() => setWeeklyWinner(null)}>Amazing! 🙌</button>
          </div>
        </div>
      )}

      {/* BONUS CLAIM MODAL */}
      {bonusClaimModal && (
        <div className="modal-overlay">
          <div className="modal claim-modal">
            <h3>Who's doing the bonus? ⚡</h3>
            <p className="claim-task-name">"{bonusTask.text}"</p>
            <div className="claim-buttons">
              {FAMILY.map(p => (
                <button key={p.id} className="claim-person-btn" style={{borderColor:p.color}}
                  onClick={() => claimBonus(p.id)}>
                  <img src={p.avatar} alt={p.name} className="claim-avatar"/>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => setBonusClaimModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <p>Delete <strong>"{deleteConfirm.text}"</strong>? Can't be undone.</p>
            <div className="confirm-buttons">
              <button className="btn-danger"    onClick={() => deleteTask(deleteConfirm.id)}>Yes, delete</button>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRM */}
      {resetConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <p>Reset the whole week? Everyone's tasks and points will be cleared.</p>
            <div className="confirm-buttons">
              <button className="btn-danger"    onClick={resetWeek}>Yes, reset</button>
              <button className="btn-secondary" onClick={() => setResetConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM MODAL */}
      {claimModal && (
        <div className="modal-overlay">
          <div className="modal claim-modal">
            <h3>Who's doing this?</h3>
            <p className="claim-task-name">"{claimModal.text}"</p>
            <div className="claim-buttons">
              {FAMILY.map(p => (
                <button key={p.id} className="claim-person-btn" style={{borderColor:p.color}}
                  onClick={() => assignTask(claimModal.id, p.id)}>
                  <img src={p.avatar} alt={p.name} className="claim-avatar"/>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => setClaimModal(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveModal && (
        <div className="modal-overlay">
          <div className="modal approve-modal">
            <h3>Check the work 👀</h3>
            <p className="approve-task">{approveModal.text}</p>
            <p className="approve-who">Done by: <strong>{FAMILY.find(f=>f.id===approveModal.assignedTo)?.name}</strong></p>
            {!currentParent ? (
              <>
                <p className="approve-parent-q">Who's approving?</p>
                <div className="approve-parent-btns">
                  {/* Bug 3 fix: filter out the person who did the task */}
                  {FAMILY.filter(f => f.isParent && f.id !== approveModal.assignedTo).map(p => (
                    <button key={p.id} className="claim-person-btn" style={{borderColor:p.color}}
                      onClick={() => setCurrentParent(p.id)}>
                      <img src={p.avatar} alt={p.name} className="claim-avatar"/>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
                <button className="btn-secondary" onClick={() => { setApproveModal(null); setCurrentParent(null); }}>Cancel</button>
              </>
            ) : (
              <>
                <p className="approve-standard">Is it done properly? 🧐</p>
                <div className="confirm-buttons">
                  <button className="btn-success" onClick={() => handleApprove(approveModal, currentParent)}>✅ Looks good!</button>
                  <button className="btn-danger"  onClick={() => handleReject(approveModal)}>❌ Needs a redo</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HALFWAY BANNER */}
      {halfwayBanner && <div className="halfway-banner">🎉 Halfway there! You legends! 🎉</div>}

      {/* NUDGE BANNER */}
      {nudges.length > 0 && (
        <div className="nudge-banner">
          👀 {nudges.map(n=>n.name).join(" & ")} {nudges.length===1?"hasn't":"haven't"} done anything in 3 days!
        </div>
      )}

      {/* HEADER */}
      <header className="header">
        <div className="header-top">
          <div className="app-title">Senn Family HQ 🏠</div>
          <div className="done-counter">
            <span className="done-num">{totalDone}</span>
            <span className="done-sep">/</span>
            <span className="done-total">{totalTasks}</span>
            <span className="done-label"> done</span>
          </div>
        </div>
        <div className="goal-bar" onClick={() => setEditingGoal(true)}>
          {editingGoal ? (
            <input className="goal-input" defaultValue={familyGoal} autoFocus
              onBlur={e => {
                // Bug 10 fix: don't save empty goal
                const val = e.target.value.trim();
                if (val) { setFamilyGoal(val); saveMeta({goal:val}); }
                setEditingGoal(false);
              }}
              onKeyDown={e => {
                if (e.key==="Enter") {
                  const val = e.target.value.trim();
                  if (val) { setFamilyGoal(val); saveMeta({goal:val}); }
                  setEditingGoal(false);
                }
                if (e.key==="Escape") setEditingGoal(false);
              }}/>
          ) : (
            <span>🎯 Working toward: <strong>{familyGoal}</strong> <span className="goal-edit">✏️</span></span>
          )}
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{width:`${donePercent}%`}}/>
        </div>
        {pendingAll.length > 0 && (
          <div className="pending-alert" onClick={() => setApproveModal(pendingAll[0])}>
            ⏳ {pendingAll.length} task{pendingAll.length>1?"s":""} waiting for approval — tap to check
          </div>
        )}
        {activeFilter && (
          <div className="filter-active-tag">
            Viewing {FAMILY.find(f=>f.id===activeFilter)?.name}'s {activeCategory} tasks
            <button onClick={() => setActiveFilter(null)} className="filter-clear">✕</button>
          </div>
        )}
      </header>

      {/* FAMILY CARDS */}
      <section className="family-section">
        {FAMILY.map(person => {
          const pts    = scores[person.id] || 0;
          const streak = streaks[person.id] || 0;
          const pending = tasks.filter(t => t.assignedTo===person.id && t.pendingApproval).length;
          const isActive = activeFilter === person.id;
          return (
            <div key={person.id} className={`person-card ${isActive?"active":""}`}
              style={{borderColor:person.color}}
              onClick={() => setActiveFilter(isActive ? null : person.id)}>
              <div className="avatar-wrap">
                <img src={person.avatar} alt={person.name} className="avatar"/>
                {pending > 0 && <div className="pending-badge">{pending}⏳</div>}
              </div>
              <div className="person-name" style={{color:person.color}}>{person.name}</div>
              {/* Bug 11 fix: always show streak row for consistent layout */}
              <div className="streak">{streak > 0 ? `🔥 ${streak} day${streak>1?"s":""}` : " "}</div>
              <YochiCup points={pts} color={person.color}/>
              <div className="person-pts">{pts} pts</div>
            </div>
          );
        })}
      </section>

      {/* BONUS TASK */}
      {bonusTask && !bonusClaimed && timeLeft !== "Expired" && (
        <div className="bonus-section">
          <div className="bonus-card">
            <div className="bonus-header">
              <span className="bonus-label">⚡ BONUS TASK</span>
              <span className="bonus-timer">⏰ {timeLeft}</span>
            </div>
            <div className="bonus-text">{bonusTask.text}</div>
            <div className="bonus-footer">
              <span className="bonus-points">Worth {bonusTask.points} pts — double reward!</span>
              <button className="btn-claim" onClick={() => setBonusClaimModal(true)}>Claim it! ⚡</button>
            </div>
          </div>
        </div>
      )}
      {bonusClaimed && <div className="bonus-claimed">✅ Bonus task claimed today! Nice work!</div>}

      {/* SPOTLIGHT */}
      {spotlightTasks.length > 0 && (
        <section className="spotlight">
          <div className="spotlight-title">⭐ {FAMILY.find(f=>f.id===activeFilter)?.name}'s next {spotlightTasks.length} task{spotlightTasks.length>1?"s":""}</div>
          <div className="spotlight-tasks">
            {spotlightTasks.map(t => (
              <span key={t.id} className="spotlight-pill"
                style={{background:(PRIORITIES[t.priority]?.color||"#ccc")+"22", border:`1px solid ${PRIORITIES[t.priority]?.color||"#ccc"}`}}>
                {t.text}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORY TABS */}
      <nav className="category-tabs">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tab ${activeCategory===cat?"active":""}`}
            onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </nav>

      {/* TASK LIST */}
      <main className="task-list">
        {visibleTasks.filter(t=>t.done).length > 0 && (
          <details className="done-accordion">
            <summary>✅ Done today ({visibleTasks.filter(t=>t.done).length})</summary>
            {visibleTasks.filter(t=>t.done).map(task => (
              <div key={task.id} className="task-card done">
                <span className="task-text done-text">{task.text}</span>
                <span className="approved-tag">✅ {FAMILY.find(f=>f.id===task.approvedBy)?.name||"Parent"} approved</span>
              </div>
            ))}
          </details>
        )}

        {visibleTasks.filter(t=>!t.done).map(task => {
          const assignee = FAMILY.find(f=>f.id===task.assignedTo);
          const priority  = PRIORITIES[task.priority] || PRIORITIES.medium;
          const isPending = task.pendingApproval;
          const taskPoints = task.points !== undefined ? task.points : getTaskMeta(task.text).points;
          const taskTimeEst = task.timeEst || getTaskMeta(task.text).timeEst;
          const taskTimeOfDay = task.timeOfDay || getTaskMeta(task.text).timeOfDay;
          return (
            <div key={task.id} className={`task-card ${isPending?"pending":""}`}
              style={{borderLeft:`4px solid ${priority.color}`}}>
              <div className="task-main">
                {/* Bug 8 fix: word-break on task text handled in CSS */}
                <div className="task-text">{task.text}</div>
                <div className="task-meta">
                  <span className="task-priority" style={{color:priority.color}}>{priority.label}</span>
                  <span className="task-chip">⏱ {taskTimeEst}</span>
                  <span className="task-chip">🕐 {taskTimeOfDay}</span>
                  {/* Bug 9 fix: space between points and "pts" */}
                  <span className="task-chip">⭐ {taskPoints} pts</span>
                </div>
              </div>
              <div className="task-actions">
                {isPending ? (
                  <div className="pending-approval-wrap">
                    <span className="pending-tag">⏳ Waiting for Mum or Dad</span>
                    <button className="btn-approve-any" onClick={() => setApproveModal(task)}>Check it 👀</button>
                  </div>
                ) : assignee ? (
                  <div className="assigned-wrap">
                    <div className="assigned-to">
                      <img src={assignee.avatar} alt={assignee.name} className="mini-avatar"/>
                      <span>{assignee.name}</span>
                      <button className="btn-change" onClick={() => setClaimModal(task)}>change</button>
                    </div>
                    <button className="btn-done" onClick={() =>
                      assignee.isParent
                        ? setApproveModal({...task, assignedTo: assignee.id})
                        : handleKidDone(task)
                    }>Done! ✅</button>
                  </div>
                ) : (
                  <button className="btn-claim" onClick={() => setClaimModal(task)}>I'll do it! 🙋</button>
                )}
                <button className="btn-delete" onClick={() => setDeleteConfirm(task)} aria-label="Delete">×</button>
              </div>
            </div>
          );
        })}

        {visibleTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji">🎉</div>
            <p>Nothing here! Add a task or switch category.</p>
          </div>
        )}
      </main>

      {/* ADD TASK */}
      <section className="add-task-section">
        {addingTask ? (
          <div className="add-task-form">
            <input
              className={`add-input ${taskNameError?"input-error":""}`}
              placeholder="Task name..."
              value={newTask.text}
              maxLength={60}
              onChange={e => { setNewTask({...newTask,text:e.target.value}); setTaskNameError(""); }}
            />
            {/* Bug 6 fix: show error message */}
            {taskNameError && <p className="input-error-msg">{taskNameError}</p>}
            <div className="add-row">
              <select className="add-select" value={newTask.category} onChange={e=>setNewTask({...newTask,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
              <select className="add-select" value={newTask.priority} onChange={e=>setNewTask({...newTask,priority:e.target.value})}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
              <select className="add-select" value={newTask.timeOfDay} onChange={e=>setNewTask({...newTask,timeOfDay:e.target.value})}>
                {TIMES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="add-row">
              <input className="add-input-sm" placeholder="Time est." value={newTask.timeEst}
                onChange={e=>setNewTask({...newTask,timeEst:e.target.value})}/>
              {/* Bug 7 fix: min=1 on points */}
              <input className="add-input-sm" type="number" min="1" max="10" placeholder="Points"
                value={newTask.points} onChange={e=>setNewTask({...newTask,points:parseInt(e.target.value)||1})}/>
            </div>
            <div className="add-form-btns">
              <button className="btn-primary" onClick={addTask}>Add task</button>
              {/* Bug 15 fix: Cancel always closes form */}
              <button className="btn-secondary" onClick={() => { setAddingTask(false); setTaskNameError(""); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn-add-task" onClick={()=>setAddingTask(true)}>+ Add a task</button>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <button className="btn-reset" onClick={()=>setResetConfirm(true)}>Reset week 🔄</button>
        <div className="footer-taglines">
          <p className="footer-tag">no mum doing all the work</p>
          <p className="footer-tag">no mum left behind</p>
        </div>
        <p className="footer-built">Built with Claude · Business Mums Hub</p>
      </footer>
    </div>
  );
}
