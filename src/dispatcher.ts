import express, { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import proxy from 'express-http-proxy';

export class Dispatcher {
    public app: express.Application;
    private redisClient;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        
        this.redisClient = createClient({ url: 'redis://auth-db:6379' });
        this.connectRedis();

        this.initializeRoutes();
    }

    private async connectRedis() {
        try {
            await this.redisClient.connect();
            console.log("🟢 Redis NoSQL veri tabanına başarıyla bağlanıldı!");
            await this.redisClient.set('cihaz_token_123', 'authorized');
        } catch (error) {
            console.error("🔴 Redis bağlantı hatası:", error);
        }
    }

    private initializeRoutes(): void {
        // ⭐ LOG YAZICI (SİSTEM İZLEME İÇİN)
        // Bu blok her gelen isteği terminale yazdırır, böylece Grafana'da görebiliriz.
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const timestamp = new Date().toISOString();
            console.log(`📩 [GATEWAY LOG] [${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
            next();
        });

        // 1. GÜVENLİK (Middleware)
        this.app.use(async (req: Request, res: Response, next: NextFunction) => {
            const token = req.headers['authorization'];

            if (!token) {
                console.log("⚠️ [GATEWAY AUTH] Token eksik, erişim reddedildi.");
                res.status(401).json({ error: "HTTP 401 - Token eksik, erişim reddedildi." });
                return;
            }

            const isAuthorized = await this.redisClient.get(token);
            if (isAuthorized !== 'authorized') {
                console.log(`❌ [GATEWAY AUTH] Geçersiz Token: ${token}`);
                res.status(403).json({ error: "HTTP 403 - Geçersiz token, yetkisiz erişim." });
                return;
            }
            
            next(); 
        });

        // 2. PROXY YÖNLENDİRMELERİ
        
        // Telemetry Yönlendirme
        this.app.use('/api/telemetry', proxy('http://telemetry-service:3000', {
             proxyReqPathResolver: (req: express.Request) => `/api/telemetry${req.url}`
        }));

        // Device Control Yönlendirme
        this.app.use('/api/devices', proxy('http://device-service:3001', {
            proxyReqPathResolver: (req: express.Request) => `/api/devices${req.url}`
        }));

        // 3. 404 HATASI
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({ error: "HTTP 404 - Gateway: Yönlendirilecek servis bulunamadı." });
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`🚀 Gateway ${port} portunda çalışıyor (Routing Aktif)`);
        });
    }
}