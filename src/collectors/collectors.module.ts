import { Module } from "@nestjs/common";
import { DataLayerCollector } from "./datalayer.collector";
import { NetworkCollector } from "./network.collector";
import { ScriptsCollector } from "./scripts.collector";

@Module({
  providers: [DataLayerCollector, NetworkCollector, ScriptsCollector],
  exports: [DataLayerCollector, NetworkCollector, ScriptsCollector],
})
export class CollectorsModule {}
