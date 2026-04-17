const db = require('./db');
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
app.get('/test-db', async (req,res) => { const r = await db.query('SELECT * FROM students'); res.json(r.rows); });
