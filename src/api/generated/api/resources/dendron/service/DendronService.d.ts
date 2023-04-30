/**
 * This file was auto-generated by Fern from our API Definition.
 */
import { FernApi } from "../../../..";
import express from "express";
export interface DendronServiceMethods {
    markdownRender(req: express.Request<never, FernApi.RenderMarkdownResponse, FernApi.RenderMarkdownResponse, never>, res: {
        send: (responseBody: FernApi.RenderMarkdownResponse) => Promise<void>;
        cookie: (cookie: string, value: string, options?: express.CookieOptions) => void;
        locals: any;
    }): void | Promise<void>;
}
export declare class DendronService {
    private readonly methods;
    private router;
    constructor(methods: DendronServiceMethods, middleware?: express.RequestHandler[]);
    addMiddleware(handler: express.RequestHandler): this;
    toRouter(): express.Router;
}
