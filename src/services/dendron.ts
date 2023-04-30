// this `FernApi` export is generated from your organization name in fern.config.json:
import { FernApi } from "../api";
import { DendronService } from "../api/generated/api/resources/dendron/service/DendronService";

export default new DendronService({
  markdownRender(req, res) {
    return res.send({ content: "BOND" });
  }
});
