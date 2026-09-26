import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { verifyServerAuth } from '@/lib/server-auth';
import { sanitizeString } from '@/lib/security-validation';

export const dynamic = 'force-dynamic';

const MAX_SLOTS = 5;

// Super Admin check helper
async function isCallerSuperAdmin(callerUid: string): Promise<boolean> {
  try {
    const callerDoc = await getDoc(doc(db, 'users', callerUid));
    if (callerDoc.exists()) {
      const data = callerDoc.data();
      return data.isSuperAdmin === true || data.slotNumber === 1;
    }
    // If no users exist yet in database, caller is first super admin
    const usersSnap = await getDocs(collection(db, 'users'));
    return usersSnap.empty;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const usersSnap = await getDocs(collection(db, 'users'));
    const users: any[] = [];
    usersSnap.forEach((d) => {
      users.push({ ...d.data(), uid: d.id });
    });

    users.sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      maxSlots: MAX_SLOTS,
      remainingSlots: Math.max(0, MAX_SLOTS - users.length),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate caller
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated || !authResult.user?.uid) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const callerUid = authResult.user.uid;
    const isSuper = await isCallerSuperAdmin(callerUid);
    if (!isSuper) {
      return NextResponse.json(
        { success: false, error: 'Action réservée au Super Administrateur' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, targetUid } = body;
    const cleanTargetUid = sanitizeString(targetUid, 128);

    if (!cleanTargetUid && action !== 'audit_slots') {
      return NextResponse.json({ success: false, error: 'ID utilisateur cible manquant' }, { status: 400 });
    }

    const targetRef = doc(db, 'users', cleanTargetUid);
    const regRef = doc(db, 'system_metadata', 'auth_registry');

    if (action === 'approve') {
      await setDoc(targetRef, { status: 'approved', updatedAt: new Date().toISOString() }, { merge: true });
      return NextResponse.json({ success: true, message: 'Utilisateur approuvé avec succès' });
    }

    if (action === 'revoke') {
      // Prevent revoking oneself if super admin
      if (cleanTargetUid === callerUid) {
        return NextResponse.json({ success: false, error: 'Impossible de révoquer votre propre statut Super Admin' }, { status: 400 });
      }
      await setDoc(targetRef, { status: 'pending', updatedAt: new Date().toISOString() }, { merge: true });
      return NextResponse.json({ success: true, message: 'Accès utilisateur révoqué' });
    }

    if (action === 'delete') {
      if (cleanTargetUid === callerUid) {
        return NextResponse.json({ success: false, error: 'Impossible de supprimer votre propre compte Super Admin' }, { status: 400 });
      }
      await deleteDoc(targetRef);

      // Re-sync registry
      const usersSnap = await getDocs(collection(db, 'users'));
      const remainingUsers: any[] = [];
      usersSnap.forEach((d) => remainingUsers.push({ ...d.data(), uid: d.id }));

      const emails = Array.from(new Set(remainingUsers.map((u) => u.email?.toLowerCase()).filter(Boolean)));
      const uids = Array.from(new Set(remainingUsers.map((u) => u.uid).filter(Boolean)));

      await setDoc(
        regRef,
        {
          registeredEmails: emails,
          registeredUids: uids,
          accountCount: remainingUsers.length,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return NextResponse.json({ success: true, message: 'Compte supprimé avec succès' });
    }

    return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in /api/admin/users:', err);
    return NextResponse.json({ success: false, error: 'Erreur lors du traitement de la requête' }, { status: 500 });
  }
}
