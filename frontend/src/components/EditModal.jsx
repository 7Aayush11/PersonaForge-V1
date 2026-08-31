import React, { useState } from "react";

const EditModal = ({ handleEdit, editing }) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const showNeonBorder = isFocused || isHovered;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        width: "min(680px, calc(100vw - 32px))",
        zIndex: 9999,
      }}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "10px",

          width: "100%",
          minHeight: "58px",
          boxSizing: "border-box",

          padding: "10px 10px 10px 18px",

          background: "#0b0b0f",

          border: `1px solid ${
            showNeonBorder ? "#a855f7" : "#24242d"
          }`,

          borderRadius: "18px",

          boxShadow: showNeonBorder
            ? `
              0 10px 40px rgba(0, 0, 0, 0.55),
              0 0 10px rgba(168, 85, 247, 0.45),
              0 0 30px rgba(168, 85, 247, 0.15)
            `
            : `
              0 10px 40px rgba(0, 0, 0, 0.5),
              0 0 25px rgba(168, 85, 247, 0.08)
            `,

          transition:
            "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !editing && message.trim()) {
             e.preventDefault();
             handleEdit(message);
             setMessage("");
           }
         }}
          placeholder="Ask anything..."
          rows={1}
          style={{
            flex: 1,
            width: "100%",
            minHeight: "36px",
            maxHeight: "160px",

            padding: "8px 0",

            border: "none",
            outline: "none",
            resize: "none",

            background: "transparent",
            color: "#f5f5f5",

            fontFamily: "inherit",
            fontSize: "15px",
            lineHeight: "20px",

            scrollbarWidth: "thin",
          }}
        />

        {/* Send Button */}
        <button
          onClick={()=>{handleEdit(message) ; setMessage("")}}
          disabled={editing || !message.trim()}
          aria-label="Send message"
          style={{
            flexShrink: 0,

            width: "38px",
            height: "38px",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            border: "none",
            borderRadius: "12px",

            background: message.trim() ? "#a855f7" : "#24242c",
            color: message.trim() ? "#ffffff" : "#71717a",

            cursor: message.trim() ? "pointer" : "default",

            boxShadow: message.trim()
              ? `
                0 0 10px rgba(168, 85, 247, 0.5),
                0 0 20px rgba(168, 85, 247, 0.2)
              `
              : "none",

            transition:
              "background 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (message.trim()) {
              e.currentTarget.style.background = "#c084fc";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim()) {
              e.currentTarget.style.background = "#a855f7";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {/* Up Arrow */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 19V5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M6 11L12 5L18 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EditModal;