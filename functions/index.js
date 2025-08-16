// ===============================
// Importaciones principales
// ===============================

// Importamos los triggers de Firestore (cuando se crea, actualiza o borra un documento)
const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require("firebase-functions/v2/firestore");

// Importamos el scheduler para tareas programadas (cron jobs)
const { onSchedule } = require("firebase-functions/v2/scheduler");

// Importamos para crear endpoints HTTP (ej: /ping, /markMissedNow)
const { onRequest } = require("firebase-functions/v2/https");

// Importamos Firebase Admin (nos da acceso completo a Firestore desde el backend)
const admin = require("firebase-admin");

// Inicializamos Firebase Admin
admin.initializeApp();

// Creamos referencia global a Firestore
const db = admin.firestore();

// Helper para sumar/restar en Firestore con `FieldValue.increment`
const inc = (n) => admin.firestore.FieldValue.increment(n);

// Helper para acceder rápido al documento de un usuario
const userRef = (uid) => db.doc(`users/${uid}`);


// ===============================
// Configuración de claves secretas
// ===============================

// Permite usar una clave secreta para proteger funciones HTTP (ej: markMissedNow)
// - En local: se puede definir en variable de entorno MISSED_JOB_KEY
// - En deploy: se usa functions.config().missed.key
const legacyConfig = (() => {
  try { return require("firebase-functions").config(); } catch { return {}; }
})();
const CONFIG_MISSED_KEY =
  process.env.MISSED_JOB_KEY ||
  (legacyConfig?.missed && legacyConfig.missed.key) ||
  null;


// ===============================
// Helpers de fecha
// ===============================

// Convierte distintos formatos a un objeto Date válido
function toDate(val) {
  if (!val) return null;

  if (val?.toDate && typeof val.toDate === "function") {
    try { return val.toDate(); } catch {}
  }

  if (typeof val === "object" && typeof val.seconds === "number") {
    return new Date(val.seconds * 1000);
  }

  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(`${val}T00:00:00`);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

// Devuelve la fecha al inicio del día (00:00:00)
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}


// ===============================
// Funciones HTTP
// ===============================

// Función de prueba rápida para saber si las funciones están vivas
exports.ping = onRequest((req, res) => res.status(200).send("pong"));


// ===============================
// Firestore Triggers
// ===============================

/**
 * Cuando se CREA una tarea en /tasks/{taskId}:
 * - Si es pública → asignada: suma +1 al pending de la empresa del asignado
 * - Si es personal → suma +1 al pending personal del creador
 * - Marca flags para que no se repita el conteo
 */
exports.taskCreated = onDocumentCreated("tasks/{taskId}", async (event) => {
  const task = event.data?.data();
  if (!task) return;

  const { type, createdBy, assignedTo } = task;
  const taskRef = event.data.ref;

  let pendingCounted = !!task.pendingCounted;
  const completedCounted = !!task.completedCounted;
  const missedCounted = !!task.missedCounted;

  if (type === "public") {
    if (assignedTo && !pendingCounted) {
      await userRef(assignedTo).set({}, { merge: true });
      await userRef(assignedTo).update({ "stats.company.pending": inc(1) });
      pendingCounted = true;
    }
  } else if (type === "personal") {
    if (createdBy && !pendingCounted) {
      await userRef(createdBy).set({}, { merge: true });
      await userRef(createdBy).update({ "stats.personal.pending": inc(1) });
      pendingCounted = true;
    }
  }

  await taskRef.set(
    { pendingCounted, completedCounted, missedCounted },
    { merge: true }
  );
});


/**
 * Cuando se ACTUALIZA una tarea en /tasks/{taskId}:
 * - Maneja el paso de "pending → completed"
 * - Ajusta pendientes cuando cambia el asignado o cambia el estado
 */
exports.taskUpdated = onDocumentUpdated("tasks/{taskId}", async (event) => {
  await db.runTransaction(async (tx) => {
    const before = event.data.before.data() || {};
    const after = event.data.after.data() || {};
    const taskRef = event.data.after.ref;

    const type = after.type;
    const wasStatus = before.status;
    const isStatus = after.status;

    const prevAssignee = before.assignedTo || null;
    const nextAssignee = after.assignedTo || null;

    let pendingCounted = !!after.pendingCounted;
    let completedCounted = !!after.completedCounted;

    // --- Caso 1: La tarea se completó por primera vez
    if (isStatus === "completed" && !completedCounted) {
      if (type === "public" && nextAssignee) {
        tx.set(userRef(nextAssignee), {}, { merge: true });
        tx.update(userRef(nextAssignee), { "stats.company.completed": inc(1) });
      } else if (type === "personal" && after.createdBy) {
        tx.set(userRef(after.createdBy), {}, { merge: true });
        tx.update(userRef(after.createdBy), { "stats.personal.completed": inc(1) });
      }
      tx.update(taskRef, { completedCounted: true });
      completedCounted = true;

      // Si ya estaba en pending → lo restamos
      if (pendingCounted) {
        if (type === "public" && nextAssignee) {
          tx.update(userRef(nextAssignee), { "stats.company.pending": inc(-1) });
        } else if (type === "personal" && after.createdBy) {
          tx.update(userRef(after.createdBy), { "stats.personal.pending": inc(-1) });
        }
        tx.update(taskRef, { pendingCounted: false });
        pendingCounted = false;
      }
      return;
    }

    // --- Caso 2: Control de "pending" mientras NO está completada
    const isActive = isStatus === "pending" || isStatus === "progress";

    if (type === "public") {
      const changedAssignee = prevAssignee !== nextAssignee;

      if (!pendingCounted && isActive && nextAssignee) {
        tx.set(userRef(nextAssignee), {}, { merge: true });
        tx.update(userRef(nextAssignee), { "stats.company.pending": inc(1) });
        tx.update(taskRef, { pendingCounted: true });
        pendingCounted = true;
      }

      if (pendingCounted) {
        if (!isActive || !nextAssignee) {
          const who = nextAssignee || prevAssignee;
          if (who) tx.update(userRef(who), { "stats.company.pending": inc(-1) });
          tx.update(taskRef, { pendingCounted: false });
          pendingCounted = false;
        } else if (changedAssignee) {
          if (prevAssignee) tx.update(userRef(prevAssignee), { "stats.company.pending": inc(-1) });
          tx.set(userRef(nextAssignee), {}, { merge: true });
          tx.update(userRef(nextAssignee), { "stats.company.pending": inc(1) });
        }
      }
    } else if (type === "personal") {
      if (!pendingCounted && isActive && after.createdBy) {
        tx.set(userRef(after.createdBy), {}, { merge: true });
        tx.update(userRef(after.createdBy), { "stats.personal.pending": inc(1) });
        tx.update(taskRef, { pendingCounted: true });
        pendingCounted = true;
      }
      if (pendingCounted && !isActive && after.createdBy) {
        tx.update(userRef(after.createdBy), { "stats.personal.pending": inc(-1) });
        tx.update(taskRef, { pendingCounted: false });
        pendingCounted = false;
      }
    }
  });
});


/**
 * Cuando se BORRA una tarea en /tasks/{taskId}:
 * - Si estaba pendiente y no completada → resta 1 al pending del usuario
 */
exports.taskDeleted = onDocumentDeleted("tasks/{taskId}", async (event) => {
  const task = event.data?.data();
  if (!task) return;

  const { type, createdBy, assignedTo, pendingCounted, completedCounted } = task;
  if (pendingCounted && !completedCounted) {
    if (type === "public" && assignedTo) {
      await userRef(assignedTo).set({}, { merge: true });
      await userRef(assignedTo).update({ "stats.company.pending": inc(-1) });
    } else if (type === "personal" && createdBy) {
      await userRef(createdBy).set({}, { merge: true });
      await userRef(createdBy).update({ "stats.personal.pending": inc(-1) });
    }
  }
});


// ===============================
// Funciones para "missed tasks"
// ===============================

/**
 * markMissedDaily
 * - Corre todos los días a las 2 am
 * - Busca tareas vencidas y las marca como "missed"
 */
exports.markMissedDaily = onSchedule("0 2 * * *", async () => {
  const todayStart = startOfDay(new Date());

  const snap = await db
    .collection("tasks")
    .where("missedCounted", "==", false)
    .get();

  const batch = db.batch();

  snap.forEach((docSnap) => {
    const t = docSnap.data();
    const isActive = t.status === "pending" || t.status === "progress";
    if (!isActive) return;

    const due = toDate(t.completeBy);
    if (!due) return;

    if (due < todayStart) {
      // 1) Sumar missed al usuario correcto
      if (t.type === "public" && t.assignedTo) {
        const u = userRef(t.assignedTo);
        batch.set(u, {}, { merge: true });
        batch.update(u, { "stats.company.missed": inc(1) });
      } else if (t.type === "personal" && t.createdBy) {
        const u = userRef(t.createdBy);
        batch.set(u, {}, { merge: true });
        batch.update(u, { "stats.personal.missed": inc(1) });
      }

      // 2) Restar pending si estaba contado
      if (t.pendingCounted) {
        if (t.type === "public" && t.assignedTo) {
          const u = userRef(t.assignedTo);
          batch.update(u, { "stats.company.pending": inc(-1) });
        } else if (t.type === "personal" && t.createdBy) {
          const u = userRef(t.createdBy);
          batch.update(u, { "stats.personal.pending": inc(-1) });
        }
      }

      // 3) Marcar tarea como missed
      batch.update(docSnap.ref, {
        status: "missed",
        missedCounted: true,
        pendingCounted: false,
      });
    }
  });

  await batch.commit();
});


/**
 * markMissedNow
 * - Endpoint manual (http://.../markMissedNow?key=XXXX)
 * - Sirve para probar inmediatamente la lógica de "missed"
 */
exports.markMissedNow = onRequest(async (req, res) => {
  try {
    const isEmu = process.env.FUNCTIONS_EMULATOR === "true";
    const providedKey = req.query.key || req.headers["x-missed-key"] || null;
    const secretOk = isEmu || (CONFIG_MISSED_KEY && providedKey === CONFIG_MISSED_KEY);
    if (!secretOk) return res.status(403).json({ ok: false, error: "Forbidden (bad key)" });

    const todayStart = startOfDay(new Date());
    const snap = await db
      .collection("tasks")
      .where("missedCounted", "==", false)
      .get();

    let marked = 0;
    const batch = db.batch();

    snap.forEach((docSnap) => {
      const t = docSnap.data();
      const isActive = t.status === "pending" || t.status === "progress";
      if (!isActive) return;

      const due = toDate(t.completeBy);
      if (!due) return;

      if (due < todayStart) {
        // 1) Sumar missed
        if (t.type === "public" && t.assignedTo) {
          const u = userRef(t.assignedTo);
          batch.set(u, {}, { merge: true });
          batch.update(u, { "stats.company.missed": inc(1) });
        } else if (t.type === "personal" && t.createdBy) {
          const u = userRef(t.createdBy);
          batch.set(u, {}, { merge: true });
          batch.update(u, { "stats.personal.missed": inc(1) });
        }

        // 2) Restar pending si estaba contado
        if (t.pendingCounted) {
          if (t.type === "public" && t.assignedTo) {
            batch.update(userRef(t.assignedTo), { "stats.company.pending": inc(-1) });
          } else if (t.type === "personal" && t.createdBy) {
            batch.update(userRef(t.createdBy), { "stats.personal.pending": inc(-1) });
          }
        }

        // 3) Marcar missed
        batch.update(docSnap.ref, {
          status: "missed",
          missedCounted: true,
          pendingCounted: false,
        });

        marked++;
      }
    });

    if (marked > 0) await batch.commit();
    res.status(200).json({ ok: true, marked, date: new Date().toISOString().slice(0, 10) });
  } catch (e) {
    console.error("markMissedNow error:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});