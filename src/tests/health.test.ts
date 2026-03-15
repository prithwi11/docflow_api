import request from "supertest";
import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "app is running successfully" });
});

describe("Health check", () => {
  it("should return ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      message: "app is running successfully",
    });
  });
});
