import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 豆包API代理
const proxyOptions = {
    target: 'https://ark.cn-beijing.volces.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: {
        '^/api': '/api', // 保持路径不变
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`代理请求: ${req.method} ${req.url} -> ${proxyReq.path}`);

        // 设置必要的请求头
        proxyReq.setHeader('Origin', 'https://ark.cn-beijing.volces.com');
        proxyReq.setHeader('Referer', 'https://ark.cn-beijing.volces.com');

        // 如果是POST请求，确保内容类型正确
        if (req.method === 'POST') {
            proxyReq.setHeader('Content-Type', 'application/json');
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`代理响应: ${proxyRes.statusCode} ${req.url}`);

        // 添加CORS头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    },
    onError: (err, req, res) => {
        console.error('代理错误:', err);
        res.status(500).json({
            error: '代理服务器错误',
            message: err.message
        });
    }
};

// 设置API代理中间件
app.use('/api', createProxyMiddleware(proxyOptions));

// 图片代理配置
const imageProxyOptions = {
    target: 'https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: {
        '^/image-proxy': '', // 移除 /image-proxy 前缀
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`图片代理请求: ${req.method} ${req.url} -> ${proxyReq.path}`);

        // 设置必要的请求头
        proxyReq.setHeader('Origin', 'https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com');
        proxyReq.setHeader('Referer', 'https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com');
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`图片代理响应: ${proxyRes.statusCode} ${req.url}`);

        // 添加CORS头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    },
    onError: (err, req, res) => {
        console.error('图片代理错误:', err);
        res.status(500).json({
            error: '图片代理服务器错误',
            message: err.message
        });
    }
};

// 设置图片代理中间件
app.use('/image-proxy', createProxyMiddleware(imageProxyOptions));

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: '代理服务器运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 代理服务器启动成功！`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🔗 豆包API代理: http://localhost:${PORT}/api/*`);
    console.log(`🖼️ 图片代理: http://localhost:${PORT}/image-proxy/*`);
    console.log(`💊 健康检查: http://localhost:${PORT}/health`);
});
