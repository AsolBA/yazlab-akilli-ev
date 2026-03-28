import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorData extends Document {
    sensorType: string;
    value: number;
    timestamp: Date;
}

const SensorSchema: Schema = new Schema({
    sensorType: { type: String, required: true },
    value: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export class TelemetryService {
    private model = mongoose.model<ISensorData>('SensorData', SensorSchema);

    constructor() {
        this.connectDB();
    }

    private async connectDB() {
        try {
            await mongoose.connect('mongodb://telemetry-db:27017/telemetry_db');
            console.log("🔵 Telemetry Servisi MongoDB'ye başarıyla bağlandı!");
        } catch (error) {
            console.error("🔴 MongoDB bağlantı hatası:", error);
        }
    }

    // ⭐ RMM SEVİYE 3 BURADA BAŞLIYOR ⭐
    public async recordData(type: string, val: number): Promise<any> {
        const newData = new this.model({ sensorType: type, value: val });
        const savedData = await newData.save();

        // Veriyi düz objeye çevirip linkleri ekliyoruz
        return {
            ...savedData.toObject(),
            _links: {
                self: { href: `http://localhost:3000/api/telemetry/${savedData._id}`, method: "GET" },
                delete: { href: `http://localhost:3000/api/telemetry/${savedData._id}`, method: "DELETE" },
                all: { href: "http://localhost:3000/api/telemetry", method: "GET" }
            }
        };
    }

    public async getAllData(): Promise<any> {
        const allData = await this.model.find().sort({ timestamp: -1 });
        
        // Her bir veri satırı için de link ekleyelim (Tam profesyonel olsun)
        return allData.map(item => ({
            ...item.toObject(),
            _links: {
                details: { href: `http://localhost:3000/api/telemetry/${item._id}`, method: "GET" }
            }
        }));
    }
}