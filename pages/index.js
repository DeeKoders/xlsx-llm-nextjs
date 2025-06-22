import { useState } from "react";

export default function Home() {
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");
  const [includeRaw, setIncludeRaw] = useState(false);

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("xlsxFile", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
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
      body: JSON.stringify({ message: input, includeRawData: includeRaw }),
    });
    const result = await res.json();
    setChat((prev) => [...prev, { from: "bot", text: result.response }]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>XLSX → LLM Chat</h2>
      <input
        type='file'
        accept='.xlsx,.xls'
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={uploadFile}>Upload</button>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask about your data...'
        />
        <button onClick={sendMessage}>Send</button>
        <label>
          <input
            type='checkbox'
            checked={includeRaw}
            onChange={(e) => setIncludeRaw(e.target.checked)}
          />
          Use Raw JSON
        </label>
      </div>
      <div style={{ marginTop: 20 }}>
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              background: msg.from === "bot" ? "#f0f0f0" : "#d0f0ff",
              padding: 10,
              marginBottom: 5,
            }}
          >
            <b>{msg.from === "bot" ? "Assistant" : "You"}:</b>{" "}
            <pre>{msg.text}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
