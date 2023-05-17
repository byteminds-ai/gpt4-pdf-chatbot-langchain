import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

const model = new OpenAI({ temperature: 0 });
const text = fs.readFileSync("docs/input/state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);

// Create a vector store from the documents.
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

const simpleRetrievalQA = async () => {
    // Create a chain that uses the OpenAI LLM and HNSWLib vector store.
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), { returnSourceDocuments: true, verbose: true });
    // const res = await chain.call({
    //     query: "What did the president say about Justice Breyer?",

    // });

    const resA = await chain.call({
        query: "What did the president say about Ketanji Brown Jackson",

    });

    //  console.log({ res });
    console.log({ resA });
}

export const run = async () => {

    await simpleRetrievalQA();

}
(async () => {
    await run();
    console.log('complete');
})();
