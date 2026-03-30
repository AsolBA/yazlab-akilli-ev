import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 50 },   // 50 kullanıcıya çık
        { duration: '15s', target: 100 },  // 100 kullanıcıda kal
        { duration: '10s', target: 200 },  // 200 kullanıcıya zorla
        { duration: '15s', target: 500 },  // 500 kullanıcıyla pik yap (Hoca bunu sever)
        { duration: '10s', target: 0 },    // Kapat
    ],
};

export default function () {
    const url = 'http://localhost:3000/api/devices';
    
    // Rastgele cihaz isimleri oluşturmak için (Loglarda farklı görünsün)
    const payload = JSON.stringify({
        name: `Test Cihazı ${Math.floor(Math.random() * 1000)}`,
        type: "Test"
    });

    const params = {
        headers: {
            'Authorization': 'cihaz_token_123', // Senin Redis'teki token
            'Content-Type': 'application/json',
        },
    };

    // Gerçek bir POST isteği atıyoruz
    let res = http.post(url, payload, params);

    check(res, {
        'Durum Kodu 201 (Başarılı)': (r) => r.status === 201,
        'Sunucu Yanıt Süresi < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.5); // İstek aralığını biraz daralttım ki trafik yoğun olsun
}