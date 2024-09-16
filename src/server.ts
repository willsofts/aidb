import KnAPI from "@willsofts/will-api";
import { ServiceSchema } from "moleculer";
import { KnExpress, KnRunner } from "@willsofts/will-run";
import { TknRouteManager } from '@willsofts/will-serv';
import { FileUploadManager } from "./routers/FileUploadManager";

const ExpressService : ServiceSchema = {
    name: "api",
    mixins: [KnAPI],
    settings: {
        //when using express need to defined server = false
        server: false,
        path: "/api",
        routes: [
            {
                aliases: {
                    "GET fetch/hi/:name": "fetch.hi",
                    "GET fetch/time/:name": "fetch.time",
                    "GET fetch/config/:name": "fetch.config",
                }
            }
        ]
    }
};
const runner = new KnRunner(ExpressService);
runner.start(process.argv).then(() => {
    if(runner.service) {
        let app = KnExpress.createApplication(runner.service);
        console.log("working directory",__dirname);
        new TknRouteManager(runner.service, __dirname).route(app);
        new FileUploadManager(runner.service,__dirname).route(app);
    }
});
