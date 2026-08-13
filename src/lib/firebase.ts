import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { UserProfile, GeoLocationState } from "../types";

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyAxnc3NirdQo60iJe7UXe6vtB8OByqL7XE",
  authDomain: "henho-2ad45.firebaseapp.com",
  projectId: "henho-2ad45",
  storageBucket: "henho-2ad45.firebasestorage.app",
  messagingSenderId: "342359306262",
  appId: "1:342359306262:web:01eac5954071e48a318537",
  measurementId: "G-9RYJ739JGF",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface SharedSessionData {
  guardianCode: string;
  userName: string;
  userPhone: string;
  bloodType: string;
  allergies: string;
  isSharingActive: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracy: number;
    speed: number;
    batteryLevel: number;
    timestamp: number;
  };
  activeAlert: {
    isAlertActive: boolean;
    alertType: string;
    alertReason: string;
    timestamp: number;
  };
  lastPing?: {
    type: "CHECK_IN" | "RING_BELL" | "MESSAGE";
    senderName: string;
    message: string;
    timestamp: number;
  };
  updatedAt?: any;
}

/**
 * Publish / update live user state to Firebase Firestore under `shared_sessions/{guardianCode}`
 */
export async function publishLiveStateToFirebase(
  userProfile: UserProfile,
  location: GeoLocationState,
  activeAlert: { isAlertActive: boolean; alertType: string; alertReason: string },
  isSharingActive: boolean = true
) {
  if (!userProfile.guardianCode) return;

  const docRef = doc(db, "shared_sessions", userProfile.guardianCode.toUpperCase());

  const sessionPayload: SharedSessionData = {
    guardianCode: userProfile.guardianCode.toUpperCase(),
    userName: userProfile.name || "Người dùng chưa đặt tên",
    userPhone: userProfile.phone || "Chưa cập nhật SĐT",
    bloodType: userProfile.bloodType || "Chưa cập nhật",
    allergies: userProfile.allergies || "Không",
    isSharingActive,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address,
      accuracy: location.accuracy,
      speed: location.speed,
      batteryLevel: location.batteryLevel,
      timestamp: Date.now(),
    },
    activeAlert: {
      isAlertActive: activeAlert.isAlertActive,
      alertType: activeAlert.alertType || "SOS_EMERGENCY",
      alertReason: activeAlert.alertReason || "Phát tín hiệu SOS khẩn cấp",
      timestamp: Date.now(),
    },
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, sessionPayload, { merge: true });
  } catch (error) {
    console.error("Error publishing live state to Firebase:", error);
  }
}

/**
 * Subscribe to real-time updates for a relative's guardian code
 */
export function subscribeToGuardianSession(
  code: string,
  onUpdate: (data: SharedSessionData | null) => void,
  onError?: (err: any) => void
) {
  if (!code || !code.trim()) {
    onUpdate(null);
    return () => {};
  }

  const cleanCode = code.trim().toUpperCase();
  const docRef = doc(db, "shared_sessions", cleanCode);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SharedSessionData);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error("Firestore snapshot error for code:", cleanCode, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Send a remote check-in ping or ring chime to a relative's phone
 */
export async function sendRemotePingToUser(
  guardianCode: string,
  senderName: string,
  pingType: "CHECK_IN" | "RING_BELL" | "MESSAGE",
  message: string
) {
  if (!guardianCode) return;
  const docRef = doc(db, "shared_sessions", guardianCode.toUpperCase());

  try {
    await updateDoc(docRef, {
      lastPing: {
        type: pingType,
        senderName: senderName || "Người thân",
        message: message || "Đã gửi yêu cầu kiểm tra an toàn",
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("Error sending remote ping to Firebase:", error);
  }
}

/**
 * Clear active SOS status on Firebase
 */
export async function clearFirebaseAlertStatus(guardianCode: string) {
  if (!guardianCode) return;
  const docRef = doc(db, "shared_sessions", guardianCode.toUpperCase());

  try {
    await updateDoc(docRef, {
      "activeAlert.isAlertActive": false,
      "activeAlert.alertReason": "Đã hủy cảnh báo / An toàn",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error clearing Firebase alert status:", error);
  }
}
