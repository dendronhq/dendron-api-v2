/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../..";
import { FernApi } from "../../../..";
import * as core from "../../../../core";
export declare const RenderMarkdownRequest: core.serialization.ObjectSchema<serializers.RenderMarkdownRequest.Raw, FernApi.RenderMarkdownRequest>;
export declare namespace RenderMarkdownRequest {
    interface Raw {
        text: string;
        mode?: serializers.RenderMarkdownMode.Raw | null;
        context?: string | null;
    }
}