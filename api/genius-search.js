import fetch from "node-fetch";

export default async function handler(req, res) {
  const token = (process.env.GENIUS_TOKEN || "").trim(); // Limpiar espacios
  if (!token) {
    res.status(500).json({ error: "No GENIUS_TOKEN set in environment variables" });
    return;
  }

  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const url = new URL('https://api.genius.com/search');
    url.search = new URLSearchParams({ q }).toString();

    console.log("Fetching Genius API URL:", url.toString());

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Genius response status:", response.status);

    const text = await response.text(); // Primero leer como texto
    console.log("Genius raw response:", text);

    // Intentamos parsear a JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Genius response as JSON:", e);
      res.status(500).json({ error: "Failed to parse Genius response", raw: text });
      return;
    }

    res.status(200).json(data); // Enviar todo el JSON de Genius
  } catch (err) {
    console.error('Function crashed:', err);
    res.status(500).json({ error: 'Failed to fetch Genius', details: err.message });
  }
}
