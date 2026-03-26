import express, { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

export class Dispatcher {
    public app: express.Application;
    private redisClient;

    constructor() {
        this.app = express();
        
        this.app.use(express.json()); 
        
        
        this.redisClient = createClient({ url: 'redis://localhost:6379' });
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
        
        this.app.use(async (req: Request, res: Response, next: NextFunction) => {
            
            const token = req.headers['authorization'];

            if (!token) {
                
                res.status(401).json({ error: "HTTP 401 - Token eksik, erişim reddedildi." });
                return;
            }

            
            const isAuthorized = await this.redisClient.get(token);

            if (isAuthorized !== 'authorized') {
                res.status(403).json({ error: "HTTP 403 - Geçersiz token, yetkisiz erişim." });
                return;
            }
            
            next(); 
        });

        /*
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({ error: "HTTP 404 - Yönlendirilecek servis bulunamadı." });
        });
        */
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Gateway ${port} portunda çalışıyor`);
        });
    }
}