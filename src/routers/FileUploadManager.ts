import { Application, Request, Response } from 'express';
import { TknBaseRouter } from '@willsofts/will-core';
import { ImageFileRouter } from "./ImageFileRouter";

export class FileUploadManager extends TknBaseRouter {

	public route(app: Application, dir?: string) {
        if(dir) this.dir = dir;
        let imager = new ImageFileRouter(this.service, this.dir);
        app.post("/file/image/ask", async (req: Request, res: Response) => { 
            let valid = await this.verifyToken(req,res); if(!valid) return; 
            imager.doUpload(req,res); 
        });
		
	}

}
