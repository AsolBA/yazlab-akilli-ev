// tests/deviceControl.test.ts

describe("Device Control (Cihaz Kontrol) Mikroservisi Testleri", () => {
    

    
    it("Akıllı kombiyi açma isteği başarılı olduğunda HTTP 200 dönmelidir.", () => {
        
        const isServiceRunning = false; 
        
        
        expect(isServiceRunning).toBe(true); 
    });

    it("Sistemde kayıtlı olmayan bir cihaza istek atıldığında HTTP 404 dönmelidir", () => {
        
        const responseStatus = 200; 
        
        expect(responseStatus).not.toBe(200); 
    });

});