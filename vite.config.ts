import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://ark.cn-beijing.volces.com",
        changeOrigin: true,
        secure: true,
        // 不重写路径，直接转发
        rewrite: (path) => path,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              "Sending API Request to the Target:",
              req.method,
              req.url
            );
            // 添加必要的请求头
            proxyReq.setHeader("Origin", "https://ark.cn-beijing.volces.com");
            proxyReq.setHeader("Referer", "https://ark.cn-beijing.volces.com");
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // 添加CORS响应头
            proxyRes.headers["Access-Control-Allow-Origin"] = "*";
            proxyRes.headers["Access-Control-Allow-Methods"] =
              "GET, POST, PUT, DELETE, OPTIONS";
            proxyRes.headers["Access-Control-Allow-Headers"] =
              "Content-Type, Authorization";
          });
        },
      },
      // 代理豆包图片存储域名
      "/image-proxy": {
        target:
          "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/image-proxy/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              "Sending Image Request to the Target:",
              req.method,
              req.url
            );
            // 添加必要的请求头
            proxyReq.setHeader(
              "Origin",
              "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com"
            );
            proxyReq.setHeader(
              "Referer",
              "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com"
            );
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // 添加CORS响应头
            proxyRes.headers["Access-Control-Allow-Origin"] = "*";
            proxyRes.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
            proxyRes.headers["Access-Control-Allow-Headers"] =
              "Content-Type, Authorization";
          });
        },
      },
    },
  },
});
