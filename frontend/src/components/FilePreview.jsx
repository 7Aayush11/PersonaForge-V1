export default function FilePreview({

  html,
  chat,
  message,
  setMessage,
  handleEdit,
}) {
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
      {/* Left — HTML Preview */}
      <iframe
        srcDoc={html}
        title="Portfolio Preview"
        style={{
          flex: 1,
          border: "none",
          height: "100%",
          minHeight: 0,
        }}
      />

      {/* Right — Chat Panel */}
        <div
        style={{
          width: "360px",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #ddd",
        }}
      >
        {/* Chat Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
          }}
        >
          {chat.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: "12px",
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <span
                style={{
                  background:
                    msg.role === "user" ? "#1a1a2e" : "#f0f0f0",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  display: "inline-block",
                  maxWidth: "80%",
                  wordWrap: "break-word",
                }}
              >
                {msg.content}
              </span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #ddd",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEdit()
            }
            }}
            placeholder="e.g. make the header dark blue"
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          />

          <button
            onClick={() => {
              handleEdit();
              setMessage("");
            }}
            style={{
              padding: "8px 16px",
              background: "#1a1a2e",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}