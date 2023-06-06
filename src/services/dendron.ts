// this `FernApi` export is generated from your organization name in fern.config.json:
import Markdoc from '@markdoc/markdoc';
import { DendronService } from "../api/generated/api/resources/dendron/service/DendronService";
import { SyncToService } from "../serviceImpl/sync/syncToService";
import { VaultsIndexService } from '../serviceImpl/sync/vaultsIndexService';

export default new DendronService({
  markdownRender(req, res) {
    const source = req.body.content
    const ast = Markdoc.parse(source);
    const content = Markdoc.transform(ast, /* config */);
    const html = Markdoc.renderers.html(content);
    return res.send({ content: html });
  },

  async syncTo(req, res) {
    const service = new SyncToService()
    const resp = await service.execute(req.body)
    return res.send(resp);
  },

  async vaultsMerge(req, res) {
    throw Error("not implemented")
  },

  async vaultsIndex(req, res) {
    const client = new VaultsIndexService();
    const resp = await client.execute(req.body)
    return res.send(resp);
  },

  async vaultsRepair(req, res) {
    throw Error("not implemented")
  }

});
