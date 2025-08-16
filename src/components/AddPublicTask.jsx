// src/components/AddPublicTask.jsx
import React, { useState, useContext, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { UserContext } from "../context/UserContext";

// 📌 Iconos (puedes reemplazar por otros si tienes en assets)
import samplePhoto from "../assets/sample.png";
import noteIcon from "../assets/icons/note.svg";
import calendarIcon from "../assets/icons/pending.svg";
import titleIcon from "../assets/icons/note.svg";
import priorityLow from "../assets/icons/LImportant.png";
import priorityMedium from "../assets/icons/MImportant.png";
import priorityHigh from "../assets/icons/HImportan.png";
import assignIcon from "../assets/icons/progress.svg";

function AddPublicTask({ accion }) {
  const { user } = useContext(UserContext);

  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [completeBy, setCompleteBy] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [members, setMembers] = useState([]);

  const priorityIcons = {
    low: priorityLow,
    medium: priorityMedium,
    high: priorityHigh,
  };

  // 🔹 Obtener miembros de la misma empresa
  useEffect(() => {
    async function fetchMembers() {
      if (!user?.companyId) return;
      const q = query(
        collection(db, "users"),
        where("companyId", "==", user.companyId)
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => ({
        uid: doc.id,
        name: `${doc.data().firstName || ""} ${doc.data().lastName || ""}`.trim(),
        photo: doc.data().photo || samplePhoto,
      }));

      setMembers(users);
    }

    fetchMembers();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user || user.role !== "admin") {
      alert("Solo los administradores pueden crear tareas públicas.");
      return;
    }
   if (!user?.uid || !user?.companyId) {
     alert("Falta uid/companyId del usuario. En el emulador crea primero tu documento en 'users/{uid}'.");
     return;
   }

    try {
      // Crear tarea con flags para conteo
      const taskRef = await addDoc(collection(db, "tasks"), {
        taskName,
        status: "pending",
        type: "public",
        createdBy: user.uid,
        companyId: user.companyId,
        assignedTo: assignedTo || null,
        priority,
        notes,
        createdAt: serverTimestamp(),
        completeBy,
        pendingCounted: false, //!!assinedTo,   // si sale asignada, ya cuenta como pendiente
        completedCounted: false,
        missedCounted: false,
      });

      // ✅ CAMBIO CLAVE: si está ASIGNADA al crear,
      // incrementa stats.company.pending en el DOC DEL USUARIO asignado
      /* //
      if (assignedTo) {
        const assigneeRef = doc(db, "users", assignedTo);
        await setDoc(assigneeRef, {}, { merge: true }); // asegurar doc existe
        await updateDoc(assigneeRef, {
          "stats.company.pending": increment(1),
        });
      }
        */

      // Limpiar formulario
      setTaskName("");
      setPriority("medium");
      setCompleteBy("");
      setNotes("");
      setAssignedTo("");

      // Cerrar modal/form
      accion();

      // (Opcional) feedback
      // alert("Tarea pública creada correctamente.");
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      alert("Hubo un error al guardar la tarea.");
    }
  }

  return (
    <div
      className="createTask mt-4 p-3 border rounded-4 w-50 "
      style={{ backgroundColor: "var(--componentsBG)" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Crear nueva tarea pública</h4>
        <button onClick={accion} className="btn btn-outline-danger">
          Close
        </button>
      </div>

      <form className="d-flex gap-3 flex-column" onSubmit={handleSubmit}>
        <div className="d-flex gap-3">
          <div className="w-75">
            {/* Nombre de tarea */}
            <div className="input-group mb-2">
              <span className="input-group-text bg-white">
                <img src={titleIcon} alt="title" className="statusIcon" />
              </span>
              <input
                type="text"
                placeholder="Nombre de la tarea"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
                className="form-control"
              />
            </div>

            {/* Asignar usuario */}
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                {assignedTo ? (
                  <img
                    src={
                      members.find((m) => m.uid === assignedTo)?.photo ||
                      samplePhoto
                    }
                    alt="assigned"
                    className="taskPicAssi rounded-5 border border-2 border-primary"
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <img src={assignIcon} alt="assign" className="statusIcon " />
                )}
              </span>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="form-control"
              >
                <option value="">
                  Sin asignar (puede tomarla cualquiera)
                </option>
                {members.map((member) => (
                  <option key={member.uid} value={member.uid}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-50">
            {/* Fecha */}
            <div className="input-group mb-2">
              <span className="input-group-text bg-white">
                <img src={calendarIcon} alt="date" className="statusIcon" />
              </span>
              <input
                type="date"
                value={completeBy}
                onChange={(e) => setCompleteBy(e.target.value)}
                className="form-control"
              />
            </div>

            {/* Prioridad */}
            <div className="input-group mb-2">
              <span className="input-group-text bg-white">
                <img src={priorityIcons[priority]} alt="priority" />
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="form-control"
              >
                <option value="low">Prioridad baja</option>
                <option value="medium">Prioridad media</option>
                <option value="high">Prioridad alta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="input-group mb-2 ">
          <span className="input-group-text bg-white">
            <img src={noteIcon} alt="notes" className="statusIcon" />
          </span>
          <textarea
            placeholder="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-control"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary w-25r">
          Crear tarea
        </button>
      </form>
    </div>
  );
}

export default AddPublicTask;