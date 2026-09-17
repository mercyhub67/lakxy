module.exports = async (req, res) => {
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

    if (!response.ok) {
      return res.status(500).json({
        valid: false,
        error: "Database error"
      });
    }

    const rows = await response.json();
    const data = rows[0];

    if (!data) {
      return res.status(401).json({
        valid: false,
        error: "Invalid key"
      });
    }

    if (
      data.expires_at &&
      new Date(data.expires_at) <= new Date()
    ) {
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
    return res.status(500).json({
      valid: false,
      error: "Server error"
    });
  }
};
