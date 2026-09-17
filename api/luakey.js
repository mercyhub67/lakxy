export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      valid: false,
      error: "Method not allowed"
    });
  }

  const key = req.query.key;

  if (!key) {
    return res.status(400).json({
      valid: false,
      error: "Missing key"
    });
  }

  if (!process.env.SUPABASE_URL) {
    return res.status(500).json({
      valid: false,
      error: "SUPABASE_URL is missing"
    });
  }

  if (!process.env.SUPABASE_SECRET_KEY) {
    return res.status(500).json({
      valid: false,
      error: "SUPABASE_SECRET_KEY is missing"
    });
  }

  try {
    const url =
      `${process.env.SUPABASE_URL}/rest/v1/api_keys` +
      `?key=eq.${encodeURIComponent(key)}` +
      `&active=eq.true` +
      `&select=id,key,plan,expires_at,active`;

    const response = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        valid: false,
        error: "Supabase error",
        status: response.status,
        detail: text
      });
    }

    const rows = JSON.parse(text);
    const data = rows[0];

    if (!data) {
      return res.status(401).json({
        valid: false,
        error: "Invalid key"
      });
    }

    if (data.expires_at && new Date(data.expires_at) <= new Date()) {
      return res.status(401).json({
        valid: false,
        error: "Key expired"
      });
    }

    return res.status(200).json({
      valid: true,
      key: data.key,
      plan: data.plan,
      expires_at: data.expires_at
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      valid: false,
      error: "Server error",
      detail: error.message
    });
  }
}
