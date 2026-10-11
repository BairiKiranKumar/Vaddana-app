import { isSuspended } from "@/lib/data/platform/houses";
import type { DataRepo, MockMode } from "@/lib/data/repo";
import type { DataErrorCode, HouseResult, Surface } from "@/lib/data/types";
import {
  activateRestaurant,
  addCategory,
  addDesk,
  addLine,
  allowed,
  applyOffer,
  bulkPrice,
  changeHouse,
  changeTable,
  confirmOrder,
  ensureTable,
  inviteStaff,
  markPaid,
  markPreparing,
  markReady,
  markServed,
  memberById,
  moveCategory,
  moveItem,
  presentHouse,
  presentTable,
  quote,
  rejectOrder,
  restaurantForStaff,
  restaurantForToken,
  rosterAll,
  rotateDesk,
  saveCombo,
  saveItem,
  saveOffer,
  saveReview,
  saveSettings,
  sendCart,
  setAvailable,
  setStaffActive,
  setStaffLocale,
  subscribe,
  subscribeHouse,
  updateLine,
  type Snapshot,
} from "@/lib/data/mock/store";

const SLOW_MS = 4000;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function gate(token: string): DataErrorCode | null {
  if (token === "expired") return "session_expired";
  const owner = restaurantForToken(token);
  if (!owner || isSuspended(owner)) return "denied";
  activateRestaurant(owner);
  return null;
}

export function createMockRepo(): DataRepo {
  return {
    async openTable(token, mode) {
      if (mode === "fail") return { ok: false, error: "failed" satisfies DataErrorCode };
      if (mode === "slow") await delay(SLOW_MS);
      const blocked = gate(token);
      if (blocked) return { ok: false, error: blocked };
      ensureTable(token);
      return { ok: true, view: presentTable(token)! };
    },

    quote,

    addLine(token, draft, offline = false) {
      return changeTable(token, (session) => {
        addLine(session, draft);
        return session;
      }, offline);
    },

    updateLine(token, lineId, draft, offline = false) {
      return changeTable(token, (session) => {
        updateLine(session, lineId, draft);
        return session;
      }, offline);
    },

    removeLine(token, lineId) {
      return changeTable(token, (session) => {
        session.lines = session.lines.filter((entry) => entry.id !== lineId);
        return session;
      }, false);
    },

    setCartNotes(token, notes) {
      return changeTable(token, (session) => {
        session.notes = notes;
        return session;
      }, false);
    },

    sendToKitchen(token, offline = false) {
      return changeTable(token, (session) => {
        sendCart(token, session);
        return session;
      }, offline);
    },

    callWaiter(token, offline = false) {
      return changeTable(token, (session) => {
        session.waiterCalled = true;
        return session;
      }, offline);
    },

    requestBill(token, offline = false) {
      return changeTable(token, (session) => {
        session.billRequested = true;
        return session;
      }, offline);
    },

    payUpi(token, offline = false) {
      return changeTable(token, (session) => {
        if (presentTable(token)?.bill.lines.length) {
          session.payment = "pending";
          session.billRequested = true;
        }
        return session;
      }, offline);
    },

    payAtCounter(token, offline = false) {
      return changeTable(token, (session) => {
        if (presentTable(token)?.bill.lines.length) {
          session.payment = "at_counter";
          session.paymentMode = "counter";
          session.billRequested = true;
        }
        return session;
      }, offline);
    },

    prepay(token, offline = false) {
      return changeTable(token, (session) => {
        if (session.lines.length > 0) session.prepaid = true;
        return session;
      }, offline);
    },

    subscribe,

    async openHouse(staffId, surface, mode) {
      return openHouse(staffId, surface, mode);
    },

    peekHouse() {
      return presentHouse();
    },

    subscribeHouse,

    confirm(token, orderId, offline = false) {
      return changeHouse(() => confirmOrder(token, orderId), offline);
    },

    reject(token, orderId, reason, offline = false) {
      return changeHouse(() => rejectOrder(token, orderId, reason), offline);
    },

    preparing(token, orderId, offline = false) {
      return changeHouse(() => markPreparing(token, orderId), offline);
    },

    ready(token, orderId, offline = false) {
      return changeHouse(() => markReady(token, orderId), offline);
    },

    served(token, orderId, offline = false) {
      return changeHouse(() => markServed(token, orderId), offline);
    },

    clearWaiter(token, offline = false) {
      return changeHouse(() => {
        changeTable(token, (session) => {
          session.waiterCalled = false;
          return session;
        }, false);
      }, offline);
    },

    clearBill(token, offline = false) {
      return changeHouse(() => {
        changeTable(token, (session) => {
          session.billRequested = false;
          return session;
        }, false);
      }, offline);
    },

    markPaid(token, mode, offline = false) {
      return changeHouse(() => markPaid(token, mode), offline);
    },

    saveSettings(patch, offline = false) {
      return changeHouse(() => saveSettings(patch), offline);
    },

    saveItem(input, offline = false) {
      return changeHouse(() => saveItem(input), offline);
    },

    setAvailable(id, available, offline = false) {
      return changeHouse(() => setAvailable(id, available), offline);
    },

    moveItem(id, direction, offline = false) {
      return changeHouse(() => moveItem(id, direction), offline);
    },

    moveCategory(id, direction, offline = false) {
      return changeHouse(() => moveCategory(id, direction), offline);
    },

    bulkPrice(ids, kind, amount, offline = false) {
      return changeHouse(() => bulkPrice(ids, kind, amount), offline);
    },

    addCategory(name_te, name_en, offline = false) {
      return changeHouse(() => addCategory(name_te, name_en), offline);
    },

    addDesk(input, offline = false) {
      return changeHouse(() => addDesk(input), offline);
    },

    rotateDesk(id, offline = false) {
      let token: string | null = null;
      const house = changeHouse(() => {
        token = rotateDesk(id);
      }, offline);
      return { token, house };
    },

    inviteStaff(input, offline = false) {
      return changeHouse(() => inviteStaff(input), offline);
    },

    setStaffActive(id, active, offline = false) {
      return changeHouse(() => setStaffActive(id, active), offline);
    },

    setStaffLocale(id, locale, offline = false) {
      return changeHouse(() => setStaffLocale(id, locale), offline);
    },

    saveOffer(offer, offline = false) {
      return changeHouse(() => saveOffer(offer), offline);
    },

    applyOffer(token, offerId, offline = false) {
      return changeTable(token, (session) => {
        applyOffer(session, offerId);
        return session;
      }, offline);
    },

    saveReview(review, offline = false) {
      return changeHouse(() => saveReview(review), offline);
    },

    saveCombo(input, offline = false) {
      return changeHouse(() => saveCombo(input), offline);
    },
  };
}

async function openHouse(staffId: string | null, surface: Surface, mode: MockMode | null): Promise<HouseResult> {
  if (mode === "fail") return { ok: false, error: "failed" };
  if (mode === "slow") await delay(SLOW_MS);
  if (staffId) {
    const owner = restaurantForStaff(staffId);
    if (owner) activateRestaurant(owner);
  }
  const member = memberById(staffId);
  if (!member) return { ok: false, error: "session_expired", roster: rosterAll() };
  if (!allowed(member.role, surface)) return { ok: false, error: "denied" };
  return { ok: true, house: presentHouse(), member };
}

// Snapshot is part of the module's public shape for the channel. Re-export keeps the type used.
export type { Snapshot };
