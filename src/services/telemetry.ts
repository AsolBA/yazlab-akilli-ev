import mongoose, { Schema, Document } from 'mongoose';

// 1. Kural: Nesne Yönelimli Programlama (Interface Tanımı)
export interface ISensorData extends Document {
    sensorType: string; // Sıcaklık, Nem, Işık
    value: number;
    timestamp: Date;
}

// 2. Kural: MongoDB Şeması (Veri İzolasyonu)
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
            // Kendi bağımsız MongoDB'mize bağlanıyoruz
            await mongoose.connect('mongodb://localhost:27017/telemetry_db');
            console.log("🔵 Telemetry Servisi MongoDB'ye başarıyla bağlandı!");
        } catch (error) {
            console.error("🔴 MongoDB bağlantı hatası:", error);
        }
    }

    // Sensörden gelen veriyi kaydetme metodu
    public async recordData(type: string, val: number): Promise<ISensorData> {
        const newData = new this.model({ sensorType: type, value: val });
        return await newData.save();
    }

    // Kayıtlı tüm verileri getirme metodu (JSON Array döner)
    public async getAllData(): Promise<ISensorData[]> {
        return await this.model.find().sort({ timestamp: -1 });
    }
}