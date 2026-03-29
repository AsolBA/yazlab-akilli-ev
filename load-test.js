import http from 'k6/http';
import { check, sleep } from 'k6';

//istek eşzamanlı atılarak test edilmelidir.
export let options = {
    stages: [
        { duration: '10s', target: 50 },   
        { duration: '15s', target: 100 },  
        { duration: '10s', target: 200 },  
        { duration: '15s', target: 500 },  
        { duration: '10s', target: 0 },    
    ],
};

export default function () {
    
    let res = http.get('http://localhost:3000');

    
    check(res, {
        'Sunucu yanit verdi (Çökmedi)': (r) => r.status !== 0,
    });

    sleep(1); // Botların istek atma aralığı
}