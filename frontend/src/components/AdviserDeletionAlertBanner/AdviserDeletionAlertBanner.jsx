/**
 * In-app alerts for coordinators and admins when an OJT adviser (same college) is removed.
 * 7-day visibility window starts on first online view; dismissible anytime.
 */

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { IoPersonRemoveOutline, IoCloseOutline } from "react-icons/io5";
import { db } from "../../../firebase";
import {
  getAdminSession,
  getAdminRole,
  getAdminCollegeCode,
  ROLES,
} from "../../utils/auth";
import {
  ADVISER_DELETION_ALERTS,
  ADVISER_DELETION_ALERT_STATES,
  isAlertExpired,
  ADVISER_ALERT_VISIBLE_DAYS,
} from "../../utils/adviserDeletionAlerts";
import "./AdviserDeletionAlertBanner.css";

const stateDocId = (adminId, alertId) =>
  `${adminId}_${alertId}`.replace(/[/\s]/g, "_");

const AdviserDeletionAlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [states, setStates] = useState({});
  const firstSeenRequested = useRef(new Set());
  const session = getAdminSession();
  const adminId = session?.adminId;
  const role = getAdminRole();
  const collegeCode = getAdminCollegeCode();

  const isCoordinator = role === ROLES.COORDINATOR;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (!adminId || (!isCoordinator && !isSuperAdmin)) return undefined;

    let unsubAlerts = () => {};

    if (isCoordinator) {
      const code = (collegeCode || "").trim().toUpperCase();
      if (!code) {
        setAlerts([]);
        return undefined;
      }
      const q = query(
        collection(db, ADVISER_DELETION_ALERTS),
        where("collegeCodes", "array-contains", code),
      );
      unsubAlerts = onSnapshot(
        q,
        (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          rows.sort((a, b) => {
            const ta = new Date(a.deletedAt || 0).getTime();
            const tb = new Date(b.deletedAt || 0).getTime();
            return tb - ta;
          });
          setAlerts(rows);
        },
        () => setAlerts([]),
      );
    } else {
      unsubAlerts = onSnapshot(
        collection(db, ADVISER_DELETION_ALERTS),
        (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          rows.sort((a, b) => {
            const ta = new Date(a.deletedAt || 0).getTime();
            const tb = new Date(b.deletedAt || 0).getTime();
            return tb - ta;
          });
          setAlerts(rows.slice(0, 50));
        },
        () => setAlerts([]),
      );
    }

    return () => unsubAlerts();
  }, [adminId, isCoordinator, isSuperAdmin, collegeCode]);

  useEffect(() => {
    if (!adminId || (!isCoordinator && !isSuperAdmin)) return undefined;

    const q = query(
      collection(db, ADVISER_DELETION_ALERT_STATES),
      where("adminId", "==", adminId),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const map = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.alertId) map[data.alertId] = { id: d.id, ...data };
        });
        setStates(map);
      },
      () => setStates({}),
    );

    return () => unsub();
  }, [adminId, isCoordinator, isSuperAdmin]);

  const visibleItems = useMemo(() => {
    return alerts
      .map((alert) => {
        const st = states[alert.id];
        if (st?.dismissed) return null;
        if (st?.firstSeenAt && isAlertExpired(st.firstSeenAt)) return null;
        return { alert, state: st };
      })
      .filter(Boolean);
  }, [alerts, states]);

  useEffect(() => {
    if (!adminId) return;
    visibleItems.forEach(({ alert, state }) => {
      if (state?.firstSeenAt || state?.dismissed) return;
      if (firstSeenRequested.current.has(alert.id)) return;
      firstSeenRequested.current.add(alert.id);
      const ref = doc(
        db,
        ADVISER_DELETION_ALERT_STATES,
        stateDocId(adminId, alert.id),
      );
      const now = new Date().toISOString();
      setDoc(
        ref,
        {
          adminId,
          alertId: alert.id,
          firstSeenAt: now,
          dismissed: false,
        },
        { merge: true },
      ).catch(() => {
        firstSeenRequested.current.delete(alert.id);
      });
    });
  }, [adminId, visibleItems]);

  const handleDismiss = async (alert) => {
    if (!adminId) return;
    const st = states[alert.id];
    const ref = doc(
      db,
      ADVISER_DELETION_ALERT_STATES,
      stateDocId(adminId, alert.id),
    );
    await setDoc(
      ref,
      {
        adminId,
        alertId: alert.id,
        dismissed: true,
        firstSeenAt: st?.firstSeenAt || new Date().toISOString(),
      },
      { merge: true },
    );
  };

  if (!adminId || (!isCoordinator && !isSuperAdmin)) return null;
  if (visibleItems.length === 0) return null;

  return (
    <div
      className="adviser-deletion-alert-stack"
      role="region"
      aria-label="OJT adviser removal notices"
    >
      {visibleItems.map(({ alert }) => {
        const name =
          alert.deletedAdviserName?.trim() || "An OJT adviser";
        return (
          <div key={alert.id} className="adviser-deletion-alert-banner">
            <IoPersonRemoveOutline
              className="adviser-deletion-alert-icon"
              aria-hidden
            />
            <div className="adviser-deletion-alert-content">
              <strong>OJT adviser account removed</strong>
              <span>
                {name} is no longer active. Reassign affected students if
                needed. This notice hides after {ADVISER_ALERT_VISIBLE_DAYS}{" "}
                days from when you first saw
                it, or you can dismiss it now.
              </span>
            </div>
            <button
              type="button"
              className="adviser-deletion-alert-dismiss"
              onClick={() => handleDismiss(alert)}
              aria-label="Dismiss notice"
              title="Dismiss"
            >
              <IoCloseOutline
                className="adviser-deletion-dismiss-icon"
                aria-hidden
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AdviserDeletionAlertBanner;
