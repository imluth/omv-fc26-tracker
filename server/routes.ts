import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { adminUsers, players, matches } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}

// Middleware to check admin authentication
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============================================
  // AUTH ROUTES
  // ============================================

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.username, username),
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = true;

      res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check auth status
  app.get("/api/auth/me", (req, res) => {
    if (req.session.isAdmin) {
      res.json({ isAdmin: true, userId: req.session.userId });
    } else {
      res.json({ isAdmin: false });
    }
  });

  // ============================================
  // PLAYERS ROUTES
  // ============================================

  // List active players
  app.get("/api/players", async (_req, res) => {
    try {
      const allPlayers = await db.query.players.findMany({
        where: eq(players.isActive, true),
        orderBy: [players.name],
      });
      res.json(allPlayers);
    } catch (error) {
      console.error("Get players error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create player (admin only)
  app.post("/api/players", requireAdmin, async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
      }

      const avatar = name.trim().substring(0, 2).toUpperCase();

      const [newPlayer] = await db.insert(players).values({
        name: name.trim(),
        avatar,
      }).returning();

      res.status(201).json(newPlayer);
    } catch (error) {
      console.error("Create player error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Soft-delete player (admin only)
  app.delete("/api/players/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;

      const [updated] = await db.update(players)
        .set({ isActive: false })
        .where(eq(players.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.json({ message: "Player deleted" });
    } catch (error) {
      console.error("Delete player error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // MATCHES ROUTES
  // ============================================

  // List matches (newest first)
  app.get("/api/matches", async (_req, res) => {
    try {
      const allMatches = await db.query.matches.findMany({
        orderBy: [desc(matches.timestamp)],
      });
      res.json(allMatches);
    } catch (error) {
      console.error("Get matches error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Record match (admin only)
  app.post("/api/matches", requireAdmin, async (req, res) => {
    try {
      const { player1Id, player2Id, score1, score2 } = req.body;

      if (!player1Id || !player2Id) {
        return res.status(400).json({ message: "Both players are required" });
      }

      if (player1Id === player2Id) {
        return res.status(400).json({ message: "Players must be different" });
      }

      if (typeof score1 !== "number" || typeof score2 !== "number") {
        return res.status(400).json({ message: "Scores must be numbers" });
      }

      if (score1 === score2) {
        return res.status(400).json({ message: "Match cannot end in a draw" });
      }

      const [newMatch] = await db.insert(matches).values({
        player1Id,
        player2Id,
        score1,
        score2,
      }).returning();

      res.status(201).json(newMatch);
    } catch (error) {
      console.error("Create match error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete match (admin only)
  app.delete("/api/matches/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;

      const [deleted] = await db.delete(matches)
        .where(eq(matches.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({ message: "Match not found" });
      }

      res.json({ message: "Match deleted" });
    } catch (error) {
      console.error("Delete match error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
