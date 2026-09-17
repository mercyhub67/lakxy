export default function handler(req, res) {
  const code = `
print("Hello from Lakxy API")
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(code);
}
