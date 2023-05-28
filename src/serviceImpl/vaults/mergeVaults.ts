import * as z from "zod";
import { MergeVaultsRequest } from "../../api/generated/api";

const optionsSchema = z.object({
  include: z.string().transform(processIncludeOption),
  exclude: z.string().transform(processExcludeOption),
  targetFormat: z.string(),
  src: z.string(),
  dest: z.string(),
  deleteMissing: z.boolean().default(false),
});

export class MergeVaultService {
  async execute(args: MergeVaultsRequest) {
    const ctx = "SyncToService";
    const _args = optionsSchema.parse(args);
  }
}