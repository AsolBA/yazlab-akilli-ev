// src/deviceControl/models/Device.ts
import mongoose, { Schema, Document } from 'mongoose';


export interface IDevice extends Document {
    name: string;
    type: string;
    isOn: boolean;
}


const DeviceSchema: Schema = new Schema({
    name: { type: String, required: true }, //  "Salon Işığı"
    type: { type: String, required: true }, //  "aydinlatma", "kombi"
    isOn: { type: Boolean, default: false } // cihazlar kapalı başlar.
}, { timestamps: true }); // ne zaman değişiklik yapıldığını tutacak.

export default mongoose.model<IDevice>('Device', DeviceSchema);