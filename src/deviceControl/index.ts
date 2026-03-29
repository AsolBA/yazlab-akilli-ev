import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

export class DeviceControlService {
    public app: express.Application;
    private port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;
        this.app.use(express.json()); 
        this.connectDatabase();
        this.initializeRoutes();
    }

    private async connectDatabase() {
        try {
           
            await mongoose.connect('mongodb://localhost:27018/device_db');
            console.log("🟢 Device Control: MongoDB NoSQL veritabanına başarıyla bağlanıldı!");
        } catch (error) {
            console.error("🔴 Device Control: MongoDB bağlantı hatası:", error);
        }
    }

    private initializeRoutes() {
       
        
        this.app.post('/api/devices/:id/toggle', (req: Request, res: Response) => {
            const deviceId = req.params.id;
            const { status } = req.body; 

            if (status === undefined) {
               
                res.status(400).json({ error: "HTTP 400 - Bad Request: 'status' bilgisi eksik." });
                return;
            }

            res.status(200).json({ 
                message: `HTTP 200 - Akıllı Ev Cihazı (ID: ${deviceId}) durumu ${status ? 'AÇIK' : 'KAPALI'} olarak güncellendi.` 
            });
        });

        
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({ error: "HTTP 404 - Device Control servisinde böyle bir uç nokta bulunamadı." });
        });
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`🔌 Device Control (Cihaz Kontrol) Servisi ${this.port} portunda çalışıyor...`);
        });
    }
}


const service = new DeviceControlService(3001);
service.start();