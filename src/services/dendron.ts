// this `FernApi` export is generated from your organization name in fern.config.json:
import { FernApi } from "../api";
import { DendronService } from "../api/generated/api/resources/dendron/service/DendronService";
import Markdoc from '@markdoc/markdoc';

export default new DendronService({
  markdownRender(req, res) {
    const source = req.body.content
    const ast = Markdoc.parse(source);
    const content = Markdoc.transform(ast, /* config */);
    const html = Markdoc.renderers.html(content);
    return res.send({ content: html });
  }
});
