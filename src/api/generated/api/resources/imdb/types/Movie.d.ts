/**
 * This file was auto-generated by Fern from our API Definition.
 */
import { FernApi } from "../../../..";
export interface Movie {
    id: FernApi.MovieId;
    title: string;
    /** The rating scale is one to five stars */
    rating: number;
}