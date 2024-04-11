import sharp from "sharp";

export class VisionRotate {

    public async rotate(image: string | Buffer, degrees: number, outfile?: string): Promise<Buffer | undefined> {
        let dg = Math.abs(degrees);
        if(dg < 1) return Promise.resolve(undefined);
        degrees *= -1;
        return await this.rotateImage(image, degrees, outfile);
    }

    public async rotateImage(image: string | Buffer, degrees: number, outfile?: string): Promise<Buffer> {
        console.log(`Rotating image by ${degrees} degrees`);
        let img = sharp(image).rotate(degrees,{background: {r: 255, g: 255, b: 255, alpha: 1}});
        if(outfile && outfile.trim().length > 0) {
            await img.toFile(outfile);
        }
        return img.toBuffer();
    }

}
