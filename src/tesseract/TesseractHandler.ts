import Tesseract, { createWorker, PSM } from 'tesseract.js';
import { writeFileSync } from 'fs';
 
export async function ExtractDataFromImage(imgSrc: string): Promise<any> {

    try {
        const worker = await createWorker(['tha', 'eng']);
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
            user_defined_dpi: '2400',
        });
        const ret = await worker.recognize(imgSrc);
        //console.log("OCR Output >>> \n", ret.data.text);
        await worker.terminate();
        return ret.data.text;
    }
    catch(ex: any) {
        console.log(ex.message);
    }
}