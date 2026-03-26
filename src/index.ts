import { Dispatcher } from './dispatcher';
import { TelemetryService } from './services/telemetry';

const gateway = new Dispatcher();
const telemetry = new TelemetryService(); 
const PORT = 3000;

// BU SATIR ÇOK ÖNEMLİ: Gelen JSON verisini okuyabilmesi için şart
gateway.app.use((req, res, next) => {
    next();
});

// Yönlendirme Tanımı
gateway.app.post('/api/telemetry', async (req, res) => {
    try {
        const { type, value } = req.body;
        const saved = await telemetry.recordData(type, value);
        res.status(201).json(saved); 
    } catch (error) {
        res.status(500).json({ error: "Veri kaydedilemedi" });
    }
});

gateway.start(PORT);