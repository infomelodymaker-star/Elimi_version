"use client";

import React, { useState } from "react";
import {
  useRegisteredAccounts,
  approveAdminUser,
  revokeAdminUser,
  deleteAdminUser,
  RegisteredAccount,
  MAX_ALLOWED_ACCOUNTS,
} from "@/lib/firestore-users";
import { auth } from "@/lib/firebase";

interface UserManagementViewProps {
  currentUserEmail?: string | null;
  currentUserId?: string | null;
}

export default function UserManagementView({
  currentUserEmail,
  currentUserId,
}: UserManagementViewProps) {
  const { accounts, count, remainingSlots, loading } = useRegisteredAccounts();
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Current logged in user
  const activeUser = auth.currentUser;
  const loggedInEmail = currentUserEmail || activeUser?.email || "";
  const loggedInUid = currentUserId || activeUser?.uid || "";

  // Determine if logged-in user is Super Admin (Slot #1 or matching first registered email)
  const currentAccount = accounts.find((a) => a.uid === loggedInUid || (loggedInEmail && a.email.toLowerCase() === loggedInEmail.toLowerCase()));
  const isSuperAdmin = currentAccount ? currentAccount.slotNumber === 1 || currentAccount.isSuperAdmin === true : accounts.length > 0 ? accounts[0]?.uid === loggedInUid || accounts[0]?.email.toLowerCase() === loggedInEmail.toLowerCase() : true;

  const handleApprove = async (user: RegisteredAccount) => {
    setProcessingUid(user.uid);
    setFeedback(null);
    const ok = await approveAdminUser(user.uid);
    setProcessingUid(null);
    if (ok) {
      setFeedback({ type: "success", message: `Account ${user.email} approved successfully.` });
    } else {
      setFeedback({ type: "error", message: `Failed to approve ${user.email}.` });
    }
  };

  const handleRevoke = async (user: RegisteredAccount) => {
    setProcessingUid(user.uid);
    setFeedback(null);
    const ok = await revokeAdminUser(user.uid);
    setProcessingUid(null);
    if (ok) {
      setFeedback({ type: "success", message: `Account ${user.email} revoked to pending status.` });
    } else {
      setFeedback({ type: "error", message: `Failed to revoke ${user.email}.` });
    }
  };

  const handleDelete = async (user: RegisteredAccount) => {
    if (!window.confirm(`Are you sure you want to remove ${user.email}? This will free up slot #${user.slotNumber}.`)) {
      return;
    }
    setProcessingUid(user.uid);
    setFeedback(null);
    const ok = await deleteAdminUser(user.uid);
    setProcessingUid(null);
    if (ok) {
      setFeedback({ type: "success", message: `Account ${user.email} removed.` });
    } else {
      setFeedback({ type: "error", message: `Failed to remove ${user.email}.` });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header Card */}
      <div className="rounded-2xl border border-[#0F172A]/8 bg-white p-6 md:p-8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="font-display text-xl font-semibold text-[#0F172A] tracking-[-0.02em]">
                Admin User Access Control
              </h2>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20 font-semibold">
                Strict 5-Slot Cap
              </span>
            </div>
            <p className="text-[13px] text-[#64748B] mt-1 max-w-2xl">
              Super Admin (Account #1) controls dashboard access permissions. Accounts #2-5 require approval before granting full administrative capabilities.
            </p>
          </div>

          {/* Stats Pill */}
          <div className="flex items-center gap-3 bg-[#F8F9FA] border border-[#0F172A]/8 px-4 py-2.5 rounded-xl shrink-0">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#64748B] font-medium">Occupied Capacity</span>
              <span className="font-mono text-sm font-semibold text-[#0F172A]">
                {count} / {MAX_ALLOWED_ACCOUNTS} Seats
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#E0EBFF] flex items-center justify-center text-[#0B57FF] font-semibold text-xs">
              {remainingSlots > 0 ? `${remainingSlots} Left` : "FULL"}
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl border text-[13px] flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Access Gate Warning for Non-Super Admin */}
      {!isSuperAdmin && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-amber-900 text-xs flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
            security
          </span>
          <div>
            <span className="font-semibold block text-sm mb-0.5">User Access Management Restricted</span>
            Only the primary Super Admin (Account #1) can approve or revoke user access. Your current account is subject to Super Admin governance.
          </div>
        </div>
      )}

      {/* Users List Table */}
      <div className="rounded-2xl border border-[#0F172A]/8 bg-white overflow-hidden shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)]">
        <div className="p-5 border-b border-[#0F172A]/8 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#0B57FF] text-[20px]">
              badge
            </span>
            <h3 className="font-display text-[15px] font-semibold text-[#0F172A]">
              Registered Admin Accounts ({accounts.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">
            Max Quota: {MAX_ALLOWED_ACCOUNTS} Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#0F172A]/8 bg-[#F8F9FA] text-[#64748B] text-[11px] uppercase tracking-wider font-semibold">
                <th className="p-3.5 pl-6">Slot</th>
                <th className="p-3.5">User / Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Registered At</th>
                <th className="p-3.5">Status</th>
                {isSuperAdmin && <th className="p-3.5 text-right pr-6">Super Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A]/8 text-[13px] bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    <div className="inline-flex items-center gap-2 font-mono text-xs">
                      <span className="w-4 h-4 border-2 border-[#0B57FF] border-t-transparent rounded-full animate-spin" />
                      Loading admin registry...
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    No admin users registered yet.
                  </td>
                </tr>
              ) : (
                accounts.map((user) => {
                  const isAccountSuperAdmin = user.slotNumber === 1 || user.isSuperAdmin === true;
                  const isCurrentUser = user.uid === loggedInUid || (loggedInEmail && user.email.toLowerCase() === loggedInEmail.toLowerCase());
                  const isApproved = user.status === "approved" || isAccountSuperAdmin;

                  return (
                    <tr key={user.uid || user.email} className="hover:bg-[#F8F9FA] transition-colors">
                      {/* Slot Number */}
                      <td className="p-3.5 pl-6 font-mono text-xs font-semibold text-[#0F172A]">
                        #{user.slotNumber || 1}
                      </td>

                      {/* Email & Display Name */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center font-semibold text-xs shrink-0">
                            {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-[#0F172A] truncate flex items-center gap-1.5">
                              {user.email}
                              {isCurrentUser && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-[#64748B] font-mono">
                              Provider: {user.authProvider || "password"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        {isAccountSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-purple-700 bg-purple-50 border border-purple-200 font-semibold">
                            <span className="material-symbols-outlined text-[12px]">
                              key
                            </span>
                            Super Admin (#1)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-[#0F172A] bg-[#F8F9FA] border border-[#0F172A]/8 font-medium">
                            Admin Slot #{user.slotNumber}
                          </span>
                        )}
                      </td>

                      {/* Registration Timestamp */}
                      <td className="p-3.5 font-mono text-xs text-[#64748B]">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold">
                            <span className="material-symbols-outlined text-[12px]">
                              check_circle
                            </span>
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-amber-700 bg-amber-50 border border-amber-200 font-semibold">
                            <span className="material-symbols-outlined text-[12px] animate-pulse">
                              hourglass_empty
                            </span>
                            Pending Approval
                          </span>
                        )}
                      </td>

                      {/* Super Admin Actions */}
                      {isSuperAdmin && (
                        <td className="p-3.5 text-right pr-6">
                          {isAccountSuperAdmin ? (
                            <span className="text-[11px] text-[#64748B] italic">Super Admin Root</span>
                          ) : (
                            <div className="flex items-center justify-end space-x-2">
                              {isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(user)}
                                  disabled={processingUid === user.uid}
                                  className="h-7 px-3 rounded-full border border-amber-300 text-amber-800 hover:bg-amber-100 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                                >
                                  Revoke
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(user)}
                                  disabled={processingUid === user.uid}
                                  className="h-7 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}

                              {!isCurrentUser && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(user)}
                                  disabled={processingUid === user.uid}
                                  className="h-7 w-7 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                  title="Remove account and free slot"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    delete
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
