import { useState } from "react";

export default function Home() {
  const [chat, setChat] = useState([]);
  const [data, setData] = useState({});
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("xlsxFile", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    setData(result.extractedData);
    setChat([
      ...chat,
      {
        from: "bot",
        text: `File uploaded. You can ask about: ${result.dataPreview.join(", ")}`,
      },
    ]);
  };

  const sendMessage = async () => {
    setChat([...chat, { from: "user", text: input }]);
    setInput("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        data,
      }),
    });
    const result = await res.json();
    setChat((prev) => [...prev, { from: "bot", text: result.response }]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f9fb",
        padding: 0,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 540,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: 32,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2d3748",
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          📊 Sheetly AI - Talk to your excel sheet
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <input
            type='file'
            accept='.xlsx,.xls'
            onChange={(e) => setFile(e.target.files[0])}
            style={{
              flex: 1,
              padding: 8,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              background: "#f9fafb",
            }}
          />
          <button
            onClick={uploadFile}
            style={{
              background: "#3182ce",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Upload
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask about your data...'
            style={{
              flex: 1,
              padding: 10,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              fontSize: 16,
              background: "#f9fafb",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: "#38a169",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 20px",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Send
          </button>
        </div>

        <div
          style={{
            marginTop: 24,
            minHeight: 200,
            background: "#f9fafb",
            borderRadius: 10,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            maxHeight: 350,
            overflowY: "auto",
          }}
        >
          {chat.length === 0 && (
            <div
              style={{ color: "#a0aec0", textAlign: "center", marginTop: 40 }}
            >
              Start by uploading your XLSX file and asking a question!
            </div>
          )}
          {chat.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: msg.from === "bot" ? "row" : "row-reverse",
                marginBottom: 12,
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  background: msg.from === "bot" ? "#edf2fa" : "#c6f6d5",
                  color: "#2d3748",
                  padding: "12px 16px",
                  borderRadius: 16,
                  maxWidth: "80%",
                  fontSize: 15,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <b
                  style={{ color: msg.from === "bot" ? "#3182ce" : "#38a169" }}
                >
                  {msg.from === "bot" ? "Assistant" : "You"}:
                </b>{" "}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
