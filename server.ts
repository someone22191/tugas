import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Admin Client (Only for server-side admin actions)
  const supabaseAdmin = process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;

  // API Route: Admin Create User
  app.post("/api/admin/create-user", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Admin not configured" });
    }

    const { email, password, full_name, role } = req.body;
    
    try {
      // 1. Create User in Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role }
      });

      if (authError) throw authError;

      // 2. Create Profile in DB
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name,
          role,
          email
        });

      if (profileError) throw profileError;

      res.json({ success: true, user: authData.user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API Route: Admin Delete User
  app.delete("/api/admin/delete-user/:id", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Admin not configured" });
    }

    const { id } = req.params;

    try {
      // 1. Delete from Auth (this also deletes from DB if cascade is set, or we do it manually)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // 2. Profile deletion should happen via Trigger or cascade, but let's be explicit if needed
      await supabaseAdmin.from('profiles').delete().eq('id', id);

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
