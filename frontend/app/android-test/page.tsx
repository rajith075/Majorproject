"use client";

import { useState } from "react";

export default function AndroidTestPage() {
  const [message, setMessage] = useState("NOT CLICKED");

  return (
    <html>
      <body>
        <div
          style={{
            padding: "30px",
            fontFamily: "Arial",
            textAlign: "center",
          }}
        >
          <h1>ANDROID TOUCH TEST</h1>

          <p>{message}</p>

          <button
            onClick={() => {
              setMessage("🔥 CLICK WORKS!");
              alert("ANDROID CLICK WORKS!");
            }}
            style={{
              width: "100%",
              padding: "25px",
              fontSize: "22px",
              fontWeight: "bold",
              background: "blue",
              color: "white",
              border: "none",
              borderRadius: "15px",
              marginTop: "30px",
            }}
          >
            TEST TOUCH
          </button>
        </div>
      </body>
    </html>
  );
}