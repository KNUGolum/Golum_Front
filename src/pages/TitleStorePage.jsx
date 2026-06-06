import { useEffect, useMemo, useState } from "react";
import { titlesApi } from "../api/titles";
import { ArcadePanel } from "../components/common/ArcadePanel";
import { Button } from "../components/common/Button";
import { useToast } from "../context/ToastContext";
import { T } from "../styles/theme";

const GRADE_STYLE = {
  COMMON: { color: T.text2, border: T.border, label: "COMMON" },
  RARE: { color: T.primary, border: T.primary, label: "RARE" },
  EPIC: { color: T.danger, border: T.danger, label: "EPIC" },
  LEGENDARY: { color: T.gold, border: T.gold, label: "LEGEND" },
};

function gradeStyle(grade) {
  return GRADE_STYLE[String(grade || "").toUpperCase()] || {
    color: T.accent,
    border: T.accent,
    label: grade || "TITLE",
  };
}

function TitleCard({ title, mode, onPurchase, onEquip, onUnequip, busy }) {
  const grade = gradeStyle(title.grade);
  const equipped = !!title.isEquipped;
  const owned = !!title.isOwned || mode === "inventory";

  return (
    <div style={{
      border: `2px solid ${equipped ? T.gold : grade.border}`,
      background: equipped ? "rgba(255,231,92,0.12)" : "rgba(5,0,23,0.58)",
      borderRadius: 4,
      padding: 14,
      boxShadow: equipped ? "0 0 16px rgba(255,231,92,0.24), inset 0 0 16px rgba(255,231,92,0.08)" : "inset 0 0 14px rgba(123,61,255,0.18)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <span style={{
          color: grade.color,
          border: `2px solid ${grade.border}`,
          padding: "3px 8px",
          fontSize: 10,
          fontWeight: 900,
          background: "rgba(0,0,0,0.22)",
        }}>
          {grade.label}
        </span>
        {equipped && <span style={{ color: T.gold, fontSize: 11, fontWeight: 900 }}>EQUIPPED</span>}
        {mode === "shop" && owned && <span style={{ color: T.primary, fontSize: 11, fontWeight: 900 }}>OWNED</span>}
      </div>

      <div style={{
        color: T.text,
        fontSize: 18,
        fontWeight: 900,
        lineHeight: 1.35,
        marginBottom: 12,
        textShadow: `2px 2px 0 #000, 0 0 8px ${grade.color}55`,
      }}>
        [{title.name}]
      </div>

      {mode === "shop" ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.gold, fontSize: 13, fontWeight: 900 }}>{Number(title.price || 0).toLocaleString()} C</span>
          <Button sm v={owned ? "outline" : "gold"} disabled={busy || owned} onClick={() => onPurchase(title.titleId)}>
            {owned ? "보유중" : "구매"}
          </Button>
        </div>
      ) : (
        <Button
          sm
          full
          v={equipped ? "outline" : "primary"}
          disabled={busy}
          onClick={() => equipped ? onUnequip() : onEquip(title.titleId)}
        >
          {equipped ? "장착 해제" : "장착"}
        </Button>
      )}
    </div>
  );
}

export function TitleStorePage({ user, onRefreshUser, onTitleChanged }) {
  const toast = useToast();
  const [tab, setTab] = useState("shop");
  const [shop, setShop] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function loadTitles() {
    setLoading(true);
    try {
      const [shopData, inventoryData] = await Promise.all([
        titlesApi.shop(),
        titlesApi.inventory(),
      ]);
      setShop(shopData.titles || []);
      setInventory(inventoryData.titles || []);
    } finally {
      setLoading(false);
    }
  }

  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    loadTitles().catch((error) => toast(error.message || "칭호 정보를 불러오지 못했습니다.", "error"));
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  const equippedTitle = useMemo(() => inventory.find((title) => title.isEquipped), [inventory]);
  const list = tab === "shop" ? shop : inventory;

  async function purchase(titleId) {
    setBusyId(titleId);
    try {
      await titlesApi.purchase(titleId);
      await loadTitles();
      await onRefreshUser();
      toast("칭호를 구매했습니다.", "gold");
    } catch (error) {
      toast(error.message || "칭호 구매에 실패했습니다.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function equip(titleId) {
    setBusyId(titleId);
    try {
      await titlesApi.equip(titleId);
      await loadTitles();
      onTitleChanged?.();
      toast("칭호를 장착했습니다.", "success");
    } catch (error) {
      toast(error.message || "칭호 장착에 실패했습니다.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function unequip() {
    setBusyId("unequip");
    try {
      await titlesApi.unequip();
      await loadTitles();
      onTitleChanged?.();
      toast("칭호 장착을 해제했습니다.", "info");
    } catch (error) {
      toast(error.message || "칭호 해제에 실패했습니다.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ padding: "20px 16px 80px", maxWidth: 680, margin: "0 auto" }}>
      <ArcadePanel style={{ marginBottom: 14 }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(35,11,82,0.66) 0 45%, rgba(0,0,0,0.26) 45% 56%, rgba(23,6,58,0.58) 56% 100%)",
          borderBottom: `2px solid ${T.gold}`,
          padding: "16px 22px 17px",
          margin: "-2px -2px 16px",
        }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: T.gold, textShadow: `3px 3px 0 ${T.danger}` }}>칭호 상점</div>
          <div style={{ color: T.primary, fontSize: 13, marginTop: 6, fontWeight: 900 }}>
            CREDIT {user.credits.toLocaleString()} C
            {equippedTitle ? ` / EQUIPPED [${equippedTitle.name}]` : " / NO TITLE"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[
            { id: "shop", label: "SHOP" },
            { id: "inventory", label: "INVENTORY" },
          ].map((item) => (
            <Button key={item.id} sm v={tab === item.id ? "gold" : "outline"} onClick={() => setTab(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 36, color: T.text2, fontSize: 13 }}>불러오는 중...</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 36, color: T.muted, fontSize: 13 }}>
            {tab === "shop" ? "상점에 표시할 칭호가 없습니다." : "보유한 칭호가 없습니다."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            {list.map((title) => (
              <TitleCard
                key={title.titleId}
                title={title}
                mode={tab}
                busy={busyId === title.titleId || busyId === "unequip"}
                onPurchase={purchase}
                onEquip={equip}
                onUnequip={unequip}
              />
            ))}
          </div>
        )}
      </ArcadePanel>
    </div>
  );
}
