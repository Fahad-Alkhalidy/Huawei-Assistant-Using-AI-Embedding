import {
  Pinecone,
  Index,
  ScoredPineconeRecord,
  QueryResponse,
} from "@pinecone-database/pinecone";

export type PineconeRecord = {
  id: string;
  values: number[];
  metadata: {
    title: string;
    category: string;
    chunk: string;
    context?: string;
  };
};

export type PineconeIndexInfo = {
  name: string;
  dimension: number;
  metric: string;
  host: string;
  spec: {
    serverless: {
      cloud: string;
      region: string;
    };
  };
  status: {
    ready: boolean;
    state: string;
  };
};

export type PineconeIndexesResponse = {
  indexes: PineconeIndexInfo[];
};

export type PineconeFilter = {
  [key: string]:
    | string
    | number
    | boolean
    | PineconeFilter
    | Array<string | number | boolean>;
};

export class PineconeClient {
  private pinecone: Pinecone;
  private index: Index | null = null;
  private indexName: string;

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    this.indexName = process.env.PINECONE_INDEX_NAME || "huawei-assistant-mini";

    if (!apiKey || !environment) {
      throw new Error("Pinecone API key and environment are required");
    }

    this.pinecone = new Pinecone({
      apiKey: apiKey,
    });
  }

  async initialize() {
    try {
      // Check if index exists, if not create it
      const indexes = await this.pinecone.listIndexes();
      console.log("📋 Available indexes:", indexes);

      // Check if indexes is an object with an 'indexes' property
      const indexList: PineconeIndexInfo[] =
        indexes && typeof indexes === "object" && "indexes" in indexes
          ? (indexes as PineconeIndexesResponse).indexes
          : Array.isArray(indexes)
          ? (indexes as PineconeIndexInfo[])
          : [];

      const indexExists = indexList.some(
        (index: PineconeIndexInfo) => index.name === this.indexName
      );

      if (!indexExists) {
        console.log(
          `❌ Index ${this.indexName} not found. Available indexes:`,
          indexList.map((i: PineconeIndexInfo) => i.name)
        );
        throw new Error(
          `Index ${this.indexName} does not exist. Please create it first.`
        );
      } else {
        console.log(`✅ Found existing index: ${this.indexName}`);
      }

      this.index = this.pinecone.index(this.indexName);
      console.log(`📂 Connected to Pinecone index: ${this.indexName}`);
    } catch (error) {
      console.error("Failed to initialize Pinecone:", error);
      throw error;
    }
  }

  async upsertVectors(records: PineconeRecord[]) {
    try {
      if (!this.index) {
        await this.initialize();
      }

      console.log(`🔄 Upserting ${records.length} vectors to Pinecone...`);
      await this.index!.upsert(records);
      console.log(`✅ Successfully upserted ${records.length} vectors`);
    } catch (error) {
      console.error("Failed to upsert vectors:", error);
      throw error;
    }
  }

  async search(
    queryVector: number[],
    topK: number = 10,
    filter?: PineconeFilter
  ): Promise<ScoredPineconeRecord[]> {
    try {
      if (!this.index) {
        await this.initialize();
      }

      const searchResponse: QueryResponse = await this.index!.query({
        vector: queryVector,
        topK: topK,
        includeMetadata: true,
        filter: filter,
      });

      return searchResponse.matches || [];
    } catch (error) {
      console.error("Failed to search Pinecone:", error);
      throw error;
    }
  }

  async deleteAllVectors() {
    try {
      if (!this.index) {
        await this.initialize();
      }

      console.log("🔄 Deleting all vectors from Pinecone...");
      await this.index!.deleteAll();
      console.log("✅ Successfully deleted all vectors");
    } catch (error) {
      console.error("Failed to delete vectors:", error);
      throw error;
    }
  }

  async getIndexStats() {
    try {
      if (!this.index) {
        await this.initialize();
      }

      const stats = await this.index!.describeIndexStats();
      return stats;
    } catch (error) {
      console.error("Failed to get index stats:", error);
      throw error;
    }
  }
}
