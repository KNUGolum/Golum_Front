// src/components/common/Field.jsx
import { T } from "../../styles/theme";

export function Field({ label, value, onChange, placeholder, type = "text", ok: isOk, err, msg, suffix }) {
  // 성공(isOk)이면 초록색, 에러(err)면 빨간색, 평소에는 테두리 색상(border)을 선택합니다.
  const bc = isOk ? T.primary : err ? T.danger : T.border;
  // 입력창을 클릭하거나 상태가 변할 때 뒤에 은은하게 퍼지는 그림자 효과입니다.
  const sh = isOk ? `0 0 0 3px ${T.primaryDim}` : err ? `0 0 0 3px ${T.dangerDim}` : undefined;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* 라벨이 있을 때만 화면에 보여줍니다. */}
      {label && (
        <label style={{ 
          display: "block", fontSize: 11, fontWeight: 700, color: T.text2, 
          marginBottom: 6, textTransform: "uppercase", letterSpacing: 0 
        }}>
          {label}
        </label>
      )}
      
      <div style={{ display: "flex", gap: 8 }}>
        <input 
          type={type} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          style={{
            flex: 1, background: T.bg2, border: `3px solid ${bc}`, 
            borderRadius: T.radiusSm, padding: "11px 14px", color: T.text, 
            fontSize: 14, outline: "none", boxShadow: sh, 
            transition: "all .12s steps(2, end)", fontFamily: T.font
          }}
        />
        {/* 입력창 옆에 붙는 '중복확인' 같은 버튼이 있다면 여기에 표시됩니다. */}
        {suffix}
      </div>

      {/* 안내 메시지(msg)가 있다면 성공/실패 색상에 맞춰 아래에 작게 띄워줍니다. */}
      {msg && (
        <p style={{ fontSize: 11, marginTop: 4, color: isOk ? T.primary : T.danger }}>
          {msg}
        </p>
      )}
    </div>
  );
}
