import sharp from "sharp";
import { RotateInfo } from "./VisionAlias";
import { ROTATE_DEGREE_OFFSET } from "../utils/EnvironmentVariable";

export class VisionRotate {

    public async rotate(image: string | Buffer, degree: number, outfile?: string): Promise<RotateInfo> {
        let dg = Math.abs(degree);
        if(dg <= 1) return Promise.resolve({rotated: false, degree: dg});
        console.log("dg:",dg,"ROTATE_DEGREE_OFFSET:",ROTATE_DEGREE_OFFSET);
        if(dg>ROTATE_DEGREE_OFFSET) {
            if(degree>0) degree -= ROTATE_DEGREE_OFFSET; else degree += ROTATE_DEGREE_OFFSET;
        }
        degree *= -1;
        let buffer = await this.rotateImage(image, degree, outfile);
        return Promise.resolve({rotated: true, degree: dg, buffer});
    }

    public async rotateImage(image: string | Buffer, degree: number, outfile?: string): Promise<Buffer> {
        console.log(`Rotating image by ${degree} degree`);
        let img = sharp(image).rotate(degree,{background: {r: 255, g: 255, b: 255, alpha: 1}});
        if(outfile && outfile.trim().length > 0) {
            await img.toFile(outfile);
        }
        return img.toBuffer();
    }

}
