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
            // Docker ortamında çalışacağı için localhost yerine servis adını (device-db) kullanacağız
            const mongoUrl = process.env.MONGO_URL || 'mongodb://device-db:27017/device_db';
            await mongoose.connect(mongoUrl);
            console.log("🟢 Device Control: MongoDB NoSQL veritabanına başarıyla bağlanıldı!");
        } catch (error) {
            console.error("🔴 Device Control: MongoDB bağlantı hatası:", error);
        }
    }

    private initializeRoutes() {
        // YENİ CİHAZ EKLEME (POST)
        this.app.post('/api/devices', async (req: Request, res: Response) => {
            try {
                const { name, type } = req.body;
                if (!name || !type) {
                    res.status(400).json({ error: "HTTP 400 - İsim ve tür zorunludur." });
                    return;
                }
                const newDevice = new Device({ name, type, isOn: false });
                await newDevice.save();

                // ⭐ RMM SEVİYE 3: HATEOAS Linkleri
                const response = {
                    message: "HTTP 201 - Cihaz eklendi",
                    device: newDevice,
                    _links: {
                        self: { href: `http://localhost:3000/api/devices/${newDevice._id}`, method: "GET" },
                        toggle: { href: `http://localhost:3000/api/devices/${newDevice._id}/toggle`, method: "POST" },
                        delete: { href: `http://localhost:3000/api/devices/${newDevice._id}`, method: "DELETE" }
                    }
                };
                res.status(201).json(response);
            } catch (error) {
                res.status(500).json({ error: "HTTP 500 - Sunucu hatası" });
            }
        });

        // CİHAZI AÇIP KAPATMA (POST)
        this.app.post('/api/devices/:id/toggle', async (req: Request, res: Response) => {
            try {
                const deviceId = req.params.id;
                const { status } = req.body; 

                if (status === undefined) {
                    res.status(400).json({ error: "HTTP 400 - 'status' bilgisi eksik." });
                    return;
                }

                const updatedDevice = await Device.findByIdAndUpdate(
                    deviceId, 
                    { isOn: status }, 
                    { new: true }
                );

                if (!updatedDevice) {
                    res.status(404).json({ error: "HTTP 404 - Cihaz bulunamadı." });
                    return;
                }

                // ⭐ RMM SEVİYE 3: HATEOAS Linkleri
                const response = {
                    message: `HTTP 200 - ${updatedDevice.name} durumu güncellendi.`,
                    device: updatedDevice,
                    _links: {
                        self: { href: `http://localhost:3000/api/devices/${updatedDevice._id}`, method: "GET" },
                        all_devices: { href: "http://localhost:3000/api/devices", method: "GET" }
                    }
                };
                res.status(200).json(response);
            } catch (error) {
                res.status(400).json({ error: "HTTP 400 - Geçersiz ID formatı." });
            }
        });

        // 404 Hata Yönetimi (İsterlerdeki hata mesajı kuralı)
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({ error: "HTTP 404 - Serviste böyle bir uç nokta bulunamadı." });
        });
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Device Control Servisi ${this.port} portunda çalışıyor...`);
        });
    }
}

const service = new DeviceControlService(3001);
service.start();