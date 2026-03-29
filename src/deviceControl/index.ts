// src/deviceControl/index.ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Device from './models/Device'; 

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
        // YENİ CİHAZ EKLEME
        this.app.post('/api/devices', async (req: Request, res: Response) => {
            try {
                const { name, type } = req.body;
                if (!name || !type) {
                    res.status(400).json({ error: "HTTP 400 - İsim ve tür zorunludur." });
                    return;
                }
                const newDevice = new Device({ name, type, isOn: false });
                await newDevice.save(); // MongoDB'ye kaydeder
                res.status(201).json({ message: "HTTP 201 - Cihaz eklendi", device: newDevice });
            } catch (error) {
                res.status(500).json({ error: "HTTP 500 - Sunucu hatası" });
            }
        });

        // CİHAZI AÇIP KAPATMA
        this.app.post('/api/devices/:id/toggle', async (req: Request, res: Response) => {
            try {
                const deviceId = req.params.id;
                const { status } = req.body; 

                if (status === undefined) {
                    res.status(400).json({ error: "HTTP 400 - 'status' bilgisi eksik." });
                    return;
                }

                // cihazı bul ve durumunu güncelle
                const updatedDevice = await Device.findByIdAndUpdate(
                    deviceId, 
                    { isOn: status }, 
                    { new: true } // cihazın güncellenmiş son halini geri döndür
                );

                if (!updatedDevice) {
                    res.status(404).json({ error: "HTTP 404 - Bu ID'ye sahip cihaz bulunamadı." });
                    return;
                }

                res.status(200).json({ 
                    message: `HTTP 200 - ${updatedDevice.name} durumu ${status ? 'AÇIK' : 'KAPALI'} olarak güncellendi.`,
                    device: updatedDevice
                });
            } catch (error) {
                res.status(400).json({ error: "HTTP 400 - Geçersiz ID formatı." });
            }
        });

        // 404 
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({ error: "HTTP 404 - Serviste böyle bir uç nokta bulunamadı." });
        });
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(` Device Control Servisi ${this.port} portunda çalışıyor...`);
        });
    }
}

const service = new DeviceControlService(3001);
service.start();