import { http } from "@ampt/sdk";
import https from "https";
import httpNative from "http";

// ساخت یک سرور پروکسی سازگار با امپت همراه با صفحه اصلی
http.node.use((req, res) => {
  
  // ۱. اگر کاربر آدرس را مستقیم در مرورگر باز کرد، این صفحه اصلی را نشان بده
  if (req.url === '/' && !req.headers['x-target-url']) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>وضعیت سرور پروکسی</title>
          <style>
              body { font-family: sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .card { background-color: #1e293b; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); text-align: center; border: 1px solid #334155; }
              .status { color: #10b981; font-weight: bold; font-size: 1.2rem; margin-top: 1rem; }
              .time { color: #94a3b8; font-size: 0.85rem; margin-top: 1.5rem; }
          </style>
      </head>
      <body>
          <div class="card">
              <h2>🚀 پروکسی سرور Ampt با موفقیت فعال شد!</h2>
              <p>کدهای جدید بدون خطا بارگذاری شده‌اند و سرور آماده به کار است.</p>
              <div class="status">● وضعیت: آماده اتصال در ویتوری</div>
              <div class="time">به‌روزرسانی: ژوئن ۲۰۲۶</div>
          </div>
      </body>
      </html>
    `);
  }

  // ۲. بخش پروکسی برای درخواست‌های ویتوری
  const targetUrl = req.headers['x-target-url'] || 'https://google.com'; 
  
  const options = {
    method: req.method,
    headers: { ...req.headers },
  };
  
  delete options.headers['host'];
  delete options.headers['x-ampt-proxy'];

  const proxyReq = (targetUrl.startsWith('https') ? https : httpNative).request(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy failed', details: err.message }));
  });

  req.pipe(proxyReq);
});
