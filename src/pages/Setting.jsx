// src/pages/Setting.jsx
import { useContext, useEffect, useMemo, useState } from "react";
//import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Button from "../Utils/Button";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, storage } from "../auth/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { myImage } from "../importFiles/imports";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

function Setting() {
  const { user } = useContext(UserContext);
  const [newName, setNewName] = useState("");
  const [newLast, setNewLast] = useState("");
  // Company change
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [companyExists, setCompanyExists] = useState(null); // null | true | false
  const [checkingCompany, setCheckingCompany] = useState(false);
  const [updatingCompany, setUpdatingCompany] = useState(false);
  // Photo change
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // Password change
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  // Admin members management
  const [members, setMembers] = useState([]); // users in my company
  const [roleDraft, setRoleDraft] = useState({}); // uid -> role

  const userName = useMemo(() => {
    const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return full || (user?.email ?? "User");
  }, [user]);

  // Prellenar los campos cuando cargue/cambie el usuario
  useEffect(() => {
    setNewName(user?.firstName || "");
    setNewLast(user?.lastName || "");
    setCompanyIdInput(user?.companyId || "");
  }, [user?.firstName, user?.lastName, user?.companyId]);

  // Preview de foto local
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const save = async () => {
    try {
      if (!user?.uid) {
        alert("No authenticated user.");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const payload = {
        firstName: (newName || "").trim(),
        lastName: (newLast || "").trim(),
      };

      await updateDoc(ref, payload);
    } catch (err) {
      console.error("Error updating user name:", err);
      alert("Could not save. Check console.");
    }
  };

  // Verificar si existe la company
  const checkCompany = async () => {
    const id = (companyIdInput || "").trim();
    if (!id) {
      setCompanyExists(null);
      return;
    }
    setCheckingCompany(true);
    try {
      const snap = await getDoc(doc(db, "companies", id));
      setCompanyExists(snap.exists());
    } catch (err) {
      console.error("Error verificando companyId:", err);
      setCompanyExists(false);
    } finally {
      setCheckingCompany(false);
    }
  };

  // Save companyId change (requires pendingApproval = true when it changes)
  const saveCompany = async () => {
    try {
      if (!user?.uid) {
        alert("No authenticated user.");
        return;
      }
      const id = (companyIdInput || "").trim();
      if (!id) {
        alert("Enter a valid Company ID.");
        return;
      }
      // Confirmar existencia antes de guardar (coincide con reglas)
      const snap = await getDoc(doc(db, "companies", id));
      if (!snap.exists()) {
        alert("Company ID does not exist.");
        setCompanyExists(false);
        return;
      }
      setCompanyExists(true);
      setUpdatingCompany(true);
      await updateDoc(doc(db, "users", user.uid), {
        companyId: id,
        pendingApproval: true,
      });
      alert("Request sent. You will be pending until an admin approves you.");
    } catch (err) {
      console.error("Error updating companyId:", err);
      alert("Could not update companyId.");
    } finally {
      setUpdatingCompany(false);
    }
  };

  // Update profile photo
  const savePhoto = async () => {
    try {
      if (!user?.uid) {
        alert("No authenticated user.");
        return;
      }
      if (!photoFile) {
        alert("Select an image first.");
        return;
      }
      setUploadingPhoto(true);
      const photoRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(photoRef, photoFile);
      const url = await getDownloadURL(photoRef);
      await updateDoc(doc(db, "users", user.uid), { photo: url });
      setPhotoFile(null);
      setPhotoPreview("");
      alert("Profile photo updated.");
    } catch (err) {
      console.error("Error uploading/saving photo:", err);
      alert("Could not update photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Change password
  const changePassword = async () => {
    try {
      const u = auth.currentUser;
      if (!u) {
        alert("No authenticated user.");
        return;
      }
      if (!newPass || newPass.length < 6) {
        alert("New password must be at least 6 characters.");
        return;
      }
      if (newPass !== confirmPass) {
        alert("Password confirmation does not match.");
        return;
      }
      setChangingPass(true);

      // Re-authenticate if user provided current password
      if (currPass) {
        try {
          const cred = EmailAuthProvider.credential(u.email || "", currPass);
          await reauthenticateWithCredential(u, cred);
        } catch (reauthErr) {
          if (reauthErr?.code === "auth/wrong-password") {
            alert("Current password is incorrect.");
            return;
          }
          console.error("Re-auth error:", reauthErr);
          alert("Re-authentication failed. Try again.");
          return;
        }
      }

      await updatePassword(u, newPass);
      alert("Password updated successfully.");
      setCurrPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      if (err?.code === "auth/requires-recent-login") {
        alert(
          "For security, sign in again or enter your current password and retry."
        );
      } else if (err?.code === "auth/weak-password") {
        alert("The new password is too weak.");
      } else {
        console.error("Error changing password:", err);
        alert("Could not change password.");
      }
    } finally {
      setChangingPass(false);
    }
  };

  // Admin: subscribe to company users
  useEffect(() => {
    if (user?.role !== "admin" || !user?.companyId) {
      setMembers([]);
      return;
    }
    const q = query(
      collection(db, "users"),
      where("companyId", "==", user.companyId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      setMembers(list);
    });
    return () => unsub();
  }, [user?.role, user?.companyId]);

  // Keep role selections synced
  useEffect(() => {
    setRoleDraft((prev) => {
      const next = { ...prev };
      for (const m of members) {
        if (!next[m.uid]) next[m.uid] = m.role || "member";
      }
      return next;
    });
  }, [members]);

  const approveUser = async (targetUid) => {
    try {
      if (targetUid === user?.uid) {
        alert("You cannot approve yourself here.");
        return;
      }
      const role = roleDraft[targetUid] || "member";
      await updateDoc(doc(db, "users", targetUid), {
        pendingApproval: false,
        role,
      });
    } catch (err) {
      console.error("Error approving user:", err);
      alert("Could not approve the user.");
    }
  };

  const changeUserRole = async (targetUid) => {
    try {
      if (targetUid === user?.uid) {
        alert("You cannot change your own role.");
        return;
      }
      const role = roleDraft[targetUid] || "member";
      await updateDoc(doc(db, "users", targetUid), { role });
    } catch (err) {
      console.error("Error changing role:", err);
      alert("Could not change role.");
    }
  };

  return (
    <div className="w-full h-full flex p-3 flex-col">
      <div className="w-full">
        <h3 className="text-2xl font-bold">Settings</h3>
      </div>
      <div className="w-full bg-gray-400/20 h-full rounded-2xl grid grid-cols-12 overflow-hidden">
        <div className="col-span-3">
          <Button color={"neutro"}>Personal info</Button>
        </div>
        <div className="col-span-9 ">
          <div>
            <h1>
              {user.email} <span>{userName}</span>
            </h1>
            <label>First:</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-1 m-2 rounded-lg"
            />
          </div>
          <div>
            <label>Last:</label>
            <input
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
              className="border p-1 m-2 rounded-lg"
            />
          </div>
          <Button onClick={save}>Save name</Button>

          {/* Change Company ID */}
          <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
            <h2 className="font-semibold mb-2">Change Company ID</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <label>Company ID:</label>
              <input
                value={companyIdInput}
                onChange={(e) => {
                  setCompanyIdInput(e.target.value);
                  setCompanyExists(null);
                }}
                className="border p-1 m-2 rounded-lg"
                placeholder="e.g., my-company-123"
              />
              <Button onClick={checkCompany} disabled={checkingCompany}>
                {checkingCompany ? "Checking..." : "Check"}
              </Button>
              <span className="text-sm">
                {companyExists === true && (
                  <span className="text-green-600">Exists</span>
                )}
                {companyExists === false && (
                  <span className="text-rose-600">Not found</span>
                )}
              </span>
            </div>
            <div className="mt-2">
              <Button
                onClick={saveCompany}
                disabled={
                  updatingCompany ||
                  !companyIdInput.trim() ||
                  companyIdInput.trim() === (user?.companyId || "")
                }
                color={"green"}
              >
                {updatingCompany ? "Saving..." : "Request change"}
              </Button>
              <p className="text-xs mt-2 text-slate-600">
                Changing your Company ID sets "pendingApproval: true" until an
                admin approves you in that company.
              </p>
            </div>
          </div>

          {/* Change Profile Photo */}
          <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
            <h2 className="font-semibold mb-2">Change profile photo</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <img
                src={photoPreview || user?.photo || myImage.defaultUser}
                alt="preview"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <Button onClick={savePhoto} disabled={uploadingPhoto || !photoFile}>
                {uploadingPhoto ? "Uploading..." : "Save photo"}
              </Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
            <h2 className="font-semibold mb-2">Change password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Current password</label>
                <input
                  type="password"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                  placeholder="Optional, if required"
                />
              </div>
              <div>
                <label className="block text-sm">New password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                onClick={changePassword}
                disabled={changingPass || !newPass}
              >
                {changingPass ? "Saving..." : "Change password"}
              </Button>
              <p className="text-xs text-slate-600">
                May require recent re-authentication for security.
              </p>
            </div>
          </div>

          {/* Admin: Pending approvals */}
          {user?.role === "admin" && (
            <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
              <h2 className="font-semibold mb-2">Pending approvals</h2>
              {members.filter((m) => m.pendingApproval === true && m.uid !== user?.uid).length ===
              0 ? (
                <p className="text-sm text-slate-600">No pending users.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {members
                    .filter((m) => m.pendingApproval === true && m.uid !== user?.uid)
                    .map((m) => {
                      const full =
                        `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
                        m.email;
                      return (
                        <li
                          key={m.uid}
                          className="py-2 flex items-center gap-3"
                        >
                          <img
                            src={m.photo || myImage.defaultUser}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{full}</div>
                            <div className="text-xs text-slate-500">
                              {m.email}
                            </div>
                          </div>
                          <select
                            className="border rounded-md px-2 py-1 text-sm"
                            value={roleDraft[m.uid] || m.role || "member"}
                            onChange={(e) =>
                              setRoleDraft((p) => ({
                                ...p,
                                [m.uid]: e.target.value,
                              }))
                            }
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button onClick={() => approveUser(m.uid)} color={"green"}>
                            Approve
                          </Button>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          )}

          {/* Admin: Manage roles */}
          {user?.role === "admin" && (
            <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
              <h2 className="font-semibold mb-2">Manage team roles</h2>
              <ul className="divide-y divide-slate-200">
                {members.filter((m) => m.uid !== user?.uid).map((m) => {
                  const full =
                    `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
                    m.email;
                  return (
                    <li key={m.uid} className="py-2 flex items-center gap-3">
                      <img
                        src={m.photo || myImage.defaultUser}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{full}</div>
                        <div className="text-xs text-slate-500">
                          {m.email}
                          {m.pendingApproval && (
                            <span className="ml-2 text-amber-600">(Pending)</span>
                          )}
                        </div>
                      </div>
                      <select
                        className="border rounded-md px-2 py-1 text-sm"
                        value={roleDraft[m.uid] || m.role || "member"}
                        onChange={(e) =>
                          setRoleDraft((p) => ({
                            ...p,
                            [m.uid]: e.target.value,
                          }))
                        }
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button onClick={() => changeUserRole(m.uid)}>Save</Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Setting;
