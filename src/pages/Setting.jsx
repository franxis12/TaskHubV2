// src/pages/Setting.jsx
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
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
import { MyComponents } from "../importFiles/components";

const normalizeRole = (role) => {
  if (role === "1") return "admin";
  if (role === "2") return "member";
  return role || "member";
};

function Setting() {
  const { user } = useContext(UserContext);
  const [newName, setNewName] = useState("");
  const [newLast, setNewLast] = useState("");
  // Company change/
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

  /*const userName = useMemo(() => {
    const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return full || (user?.email ?? "User");
  }, [user]);
*/
  // Pre-fill fields when the user loads/changes
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

  // Check if the company exists
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
      // Confirm the company exists before saving (matches rules)
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
        const draftValue = next[m.uid] ?? m.role;
        next[m.uid] = normalizeRole(draftValue);
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
      const role = normalizeRole(roleDraft[targetUid]);
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
      const role = normalizeRole(roleDraft[targetUid]);
      await updateDoc(doc(db, "users", targetUid), { role });
    } catch (err) {
      console.error("Error changing role:", err);
      alert("Could not change role.");
    }
  };

  const roles = [
    { uid: "admin", name: "Admin" },
    { uid: "member", name: "Member" },
  ];

  return (
    <div className="w-full h-full flex p-3 flex-col">
      <div className="w-full">
        <h3 className="text-2xl font-bold">Settings</h3>
      </div>
      <div className="w-full bg-gray-400/20 h-full rounded-2xl grid grid-cols-12 overflow-hidden">
        <div className="col-span-12">
          <div className="flex w-full gap-2 mt-5">
            {/*<h1>
              {user.email} <span>{userName}</span>
            </h1>*/}
            <MyComponents.Input
              label={"First"}
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-1 m-2 rounded-lg"
            />

            <MyComponents.Input
              label={"Last"}
              required
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
            />
          </div>
          <MyComponents.Button color={"green"} onClick={save}>
            Save name
          </MyComponents.Button>

          {/* Change Company ID */}
          <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
            <h2 className="font-semibold mb-2">Change Company ID</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <MyComponents.Input
                value={companyIdInput}
                label={"CompanyID"}
                required
                onChange={(e) => {
                  setCompanyIdInput(e.target.value);
                  setCompanyExists(null);
                }}
                placeholder="e.g., my-company-123"
              />
              <MyComponents.Button
                onClick={checkCompany}
                disabled={checkingCompany}
                color={"yellow"}
              >
                {checkingCompany ? "Checking..." : "Check"}
              </MyComponents.Button>
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
              <MyComponents.Button
                onClick={saveCompany}
                disabled={
                  updatingCompany ||
                  !companyIdInput.trim() ||
                  companyIdInput.trim() === (user?.companyId || "")
                }
                color={"green"}
              >
                {updatingCompany ? "Saving..." : "Request change"}
              </MyComponents.Button>
              <p className="text-xs mt-2 text-slate-600">
                Changing your Company ID sets "pendingApproval: true" until an
                admin approves you in that company.
              </p>
            </div>
          </div>

          {/* Change Profile Photo */}
          <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
            <div className="flex items-center gap-4 flex-wrap">
              <img
                src={photoPreview || user?.photo || myImage.defaultUser}
                alt="preview"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <MyComponents.Input
                required
                label={"Change profile photo"}
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <MyComponents.Button
                color={"green"}
                onClick={savePhoto}
                disabled={uploadingPhoto || !photoFile}
              >
                {uploadingPhoto ? "Uploading..." : "Save photo"}
              </MyComponents.Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
            <h2 className="font-semibold mb-2">Change password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <MyComponents.Input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  label={"New password"}
                  required
                />
              </div>
              <div>
                <MyComponents.Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  label={"Confirm new password"}
                  required
                />
              </div>
              <div>
                <MyComponents.Input
                  type="password"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  placeholder="Optional, if required"
                  label={"Current password"}
                  required
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <MyComponents.Button
                onClick={changePassword}
                disabled={changingPass || !newPass}
                color={"orange"}
              >
                {changingPass ? "Saving..." : "Change password"}
              </MyComponents.Button>
              <p className="text-xs text-slate-600">
                May require recent re-authentication for security.
              </p>
            </div>
          </div>

          {/* Admin: Pending approvals */}
          {user?.role === "admin" && (
            <div className="mt-6 p-3 rounded-lg border border-slate-300/50 bg-white/50">
              <h2 className="font-semibold mb-2">Pending approvals</h2>
              {members.filter(
                (m) => m.pendingApproval === true && m.uid !== user?.uid
              ).length === 0 ? (
                <p className="text-sm text-slate-600">No pending users.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {members
                    .filter(
                      (m) => m.pendingApproval === true && m.uid !== user?.uid
                    )
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
                          <MyComponents.Select
                            map={roles}
                            value={roleDraft[m.uid] || normalizeRole(m.role)}
                            onChange={(e) =>
                              setRoleDraft((p) => ({
                                ...p,
                                [m.uid]: e.target.value,
                              }))
                            }
                          />
                          {/*<option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>*/}
                          <MyComponents.Button
                            onClick={() => approveUser(m.uid)}
                            color={"green"}
                          >
                            Approve
                          </MyComponents.Button>
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
                {members
                  .filter((m) => m.uid !== user?.uid)
                  .map((m) => {
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
                        <div className="flex-1 ">
                          <div className="text-sm font-medium">{full}</div>
                          <div className="text-xs text-slate-500">
                            {m.email}
                            {m.pendingApproval && (
                              <span className="ml-2 text-amber-600">
                                (Pending)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2  w-2/7">
                          <MyComponents.Select
                            map={roles}
                            className="border rounded-md px-2 py-1 text-sm"
                            value={roleDraft[m.uid] || normalizeRole(m.role)}
                            onChange={(e) =>
                              setRoleDraft((p) => ({
                                ...p,
                                [m.uid]: e.target.value,
                              }))
                            }
                          />

                          <MyComponents.Button
                            onClick={() => changeUserRole(m.uid)}
                          >
                            Save
                          </MyComponents.Button>
                        </div>
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
